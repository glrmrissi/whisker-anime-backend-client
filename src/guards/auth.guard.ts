import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from 'src/decorators/set-meta-data.decorator';
import { RolesEnum } from 'src/shared/enum/roles.enum';
import { CHECK_OWNER_KEY } from 'src/decorators/ckeck-owner.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const token = request.cookies?.['x_access_token'];

    if (!token) throw new UnauthorizedException('Token not found.');

    let payload;
    try {
      payload = await this.jwtService.verifyAsync(token);
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException('Session expired or invalid.');
    }

    const userRoles: RolesEnum[] = Array.isArray(payload.role)
      ? payload.role
      : payload.role ? [payload.role] : [];

    const bypassRoles = this.reflector.getAllAndOverride<RolesEnum[]>(CHECK_OWNER_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (bypassRoles) {
      const userIdFromRoute = request.params.id;
      const isOwner = String(payload.sub) === String(userIdFromRoute);
      const canBypass = userRoles.some(role => bypassRoles.includes(role));

      if (userIdFromRoute && !isOwner && !canBypass) {
        throw new ForbiddenException('Access denied: This resource does not belong to you.');
      }
    }

    const requiredRoles = this.reflector.getAllAndOverride<RolesEnum[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (requiredRoles) {
      const hasRole = requiredRoles.some(role => userRoles.includes(role));
      const isAdmin = [RolesEnum.ADMIN, RolesEnum.ADMIN_MASTER, RolesEnum.OWNER]
        .some(role => userRoles.includes(role));

      if (!hasRole && !isAdmin) {
        throw new ForbiddenException('His position does not allow this action.');
      }
    }

    return true;
  }
}