import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Admin } from '@prisma/client';

export const CurrentAdmin = createParamDecorator(
  (data: keyof Admin | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const admin = request.admin as Admin;
    return data ? admin?.[data] : admin;
  },
);
