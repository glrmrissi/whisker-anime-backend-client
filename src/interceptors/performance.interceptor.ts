import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LogPerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Performance');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - now; 
        
        if (duration > 500) {
          this.logger.warn(`[SLOW ROUTE] ${method} ${url} - ${duration}ms`);
        } else {
          this.logger.log(`${method} ${url} - ${duration}ms`);
        }
      }),
    );
  }
}