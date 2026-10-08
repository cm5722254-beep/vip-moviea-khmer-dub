import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload } from './auth.dto';
import { UserStatus } from '@prisma/client';

@Injectable()
export class TelegramGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader: string = request.headers?.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token ខ្វះ ឬមិនត្រឹមត្រូវ');
    }

    const token = authHeader.substring(7);

    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Token ផុតកំណត់ ឬមិនត្រឹមត្រូវ');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { wallet: true },
    });

    if (!user) {
      throw new UnauthorizedException('រកមិនឃើញអ្នកប្រើប្រាស់');
    }

    if (user.status === UserStatus.BANNED) {
      throw new UnauthorizedException('គណនីរបស់អ្នកត្រូវបានហាម');
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException('គណនីរបស់អ្នកត្រូវបានផ្អាក');
    }

    request.user = user;
    return true;
  }
}
