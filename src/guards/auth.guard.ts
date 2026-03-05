import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Request } from 'express';

type GuardRequest = Request & { user?: unknown };
import { IS_PUBLIC_KEY } from 'src/decorators/set-meta-data.decorator';
import { RolesEnum } from 'src/shared/enum/roles.enum';
import { CHECK_OWNER_KEY } from 'src/decorators/ckeck-owner.decorator';
import { UserEntity } from 'src/shared/entities/UserEntity';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<GuardRequest>();
    const token = (request.cookies as Record<string, string | undefined>)[
      'x_access_token'
    ];

    if (!token) throw new UnauthorizedException('Token not found.');

    let payload: { sub: string; username: string; role?: RolesEnum };
    try {
      payload = await this.jwtService.verifyAsync(token, {
        algorithms: ['HS256'],
      });
    } catch {
      throw new UnauthorizedException('Session expired or invalid.');
    }

    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });
    if (!user) throw new UnauthorizedException('User not found.');

    const userRoles: RolesEnum[] = [user.role];

    const bypassRoles = this.reflector.getAllAndOverride<RolesEnum[]>(
      CHECK_OWNER_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (bypassRoles) {
      const userIdFromRoute = request.params['id'] as string | undefined;

      if (!userIdFromRoute) {
        throw new ForbiddenException('Resource ID is required.');
      }

      const isOwner = String(payload.sub) === String(userIdFromRoute);
      const canBypass = userRoles.some((role) => bypassRoles.includes(role));

      if (!isOwner && !canBypass) {
        throw new ForbiddenException(
          'Access denied: This resource does not belong to you.',
        );
      }
    }

    const requiredRoles = this.reflector.getAllAndOverride<RolesEnum[]>(
      'roles',
      [context.getHandler(), context.getClass()],
    );

    if (requiredRoles) {
      const hasRole = requiredRoles.some((role) => userRoles.includes(role));
      const isAdmin = [
        RolesEnum.ADMIN,
        RolesEnum.ADMIN_MASTER,
        RolesEnum.OWNER,
      ].some((role) => userRoles.includes(role));

      if (!hasRole && !isAdmin) {
        throw new ForbiddenException(
          'His position does not allow this action.',
        );
      }
    }

    request['user'] = { ...payload, role: user.role };

    return true;
  }
}
