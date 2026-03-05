import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

type RequestWithUser = Request & { user: Record<string, unknown> };

export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
