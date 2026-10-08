import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import { AdminJwtPayload } from './auth.dto';
import { AdminRole } from '@prisma/client';

export const ROLES_KEY = 'roles';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader: string = request.headers?.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Admin token ខ្វះ');
    }

    const token = authHeader.substring(7);

    let payload: AdminJwtPayload;
    try {
      payload = this.jwtService.verify<AdminJwtPayload>(token, {
        secret: process.env.JWT_ADMIN_SECRET || process.env.JWT_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Admin token ផុតកំណត់ ឬមិនត្រឹមត្រូវ');
    }

    if (!payload.sub || !payload.role) {
      throw new UnauthorizedException('Admin token payload មិនត្រឹមត្រូវ');
    }

    const admin = await this.prisma.admin.findUnique({
      where: { id: payload.sub },
    });

    if (!admin || !admin.isActive) {
      throw new UnauthorizedException('Admin account មិនត្រឹមត្រូវ ឬបានបិទ');
    }

    // Check required roles from decorator if any
    const requiredRoles = this.reflector.getAllAndOverride<AdminRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (requiredRoles && requiredRoles.length > 0) {
      if (!requiredRoles.includes(admin.role)) {
        throw new ForbiddenException('អ្នកមិនមានសិទ្ធិគ្រប់គ្រាន់សម្រាប់សកម្មភាពនេះ');
      }
    }

    request.admin = admin;
    return true;
  }
}
