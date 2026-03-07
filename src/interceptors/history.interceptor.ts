import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Queue } from 'bullmq';
import type { Request } from 'express';
import { HistoryActionEnum } from 'src/shared/enum/history-action.enum';

type RequestWithUser = Request & { user?: { sub: string } };

interface TrackedRoute {
    pattern: RegExp;
    action: HistoryActionEnum;
    extract: (req: Request) => { animeId?: number; episodeId?: number };
}

const TRACKED_ROUTES: TrackedRoute[] = [
    {
        pattern: /^\/kitsu-api\/anime\/\d+$/,
        action: HistoryActionEnum.VIEW_ANIME,
        extract: (req) => ({ animeId: Number(req.params['id']) }),
    },
    {
        pattern: /^\/kitsu-api\/episodes\/\d+$/,
        action: HistoryActionEnum.VIEW_EPISODE,
        extract: (req) => ({ episodeId: Number(req.params['id']) }),
    },
];

@Injectable()
export class HistoryInterceptor implements NestInterceptor {
    constructor(
        @InjectQueue('history-queue') private historyQueue: Queue,
        private jwtService: JwtService,
    ) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        const request = context.switchToHttp().getRequest<RequestWithUser>();

        const match = TRACKED_ROUTES.find(({ pattern }) =>
            pattern.test(request.path),
        );
        if (!match) return next.handle();

        return next.handle().pipe(
            tap(async () => {
                try {
                    let userId = request.user?.sub;

                    if (!userId) {
                        const token = (
                            request.cookies as Record<string, string | undefined>
                        )['x_access_token'];
                        if (!token) return;
                        const payload = await this.jwtService.verifyAsync<{ sub: string }>(
                            token,
                            { algorithms: ['HS256'] },
                        );
                        userId = payload.sub;
                    }

                    if (!userId) return;

                    await this.historyQueue.add(
                        'track-history',
                        { userId, action: match.action, ...match.extract(request) },
                        { removeOnComplete: true },
                    );
                } catch {
                    // Silently ignore - never affect user experience
                }
            }),
        );
    }
}
