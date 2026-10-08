import {
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AdminLoginDto } from './dto/admin-auth.dto';
import { AdminJwtPayload } from '../auth/auth.dto';

@Injectable()
export class AdminAuthService {
  private readonly logger = new Logger(AdminAuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(dto: AdminLoginDto): Promise<{ token: string; admin: object }> {
    const admin = await this.prisma.admin.findUnique({
      where: { username: dto.username },
    });

    if (!admin || !admin.isActive) {
      throw new UnauthorizedException('ឈ្មោះអ្នកប្រើ ឬលេខសម្ងាត់មិនត្រឹមត្រូវ');
    }

    const passwordValid = await bcrypt.compare(dto.password, admin.passwordHash);
    if (!passwordValid) {
      this.logger.warn(`Failed admin login attempt for username: ${dto.username}`);
      throw new UnauthorizedException('ឈ្មោះអ្នកប្រើ ឬលេខសម្ងាត់មិនត្រឹមត្រូវ');
    }

    // Update last login
    await this.prisma.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    const payload: AdminJwtPayload = {
      sub: admin.id,
      role: admin.role,
    };

    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_ADMIN_SECRET || process.env.JWT_SECRET,
      expiresIn: process.env.JWT_ADMIN_EXPIRES_IN || '8h',
    });

    this.logger.log(`Admin logged in: ${admin.username} (${admin.role})`);

    return {
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        firstName: admin.firstName,
        lastName: admin.lastName,
      },
    };
  }

  async getMe(adminId: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!admin) {
      throw new UnauthorizedException('Admin រកមិនឃើញ');
    }

    return admin;
  }
}
