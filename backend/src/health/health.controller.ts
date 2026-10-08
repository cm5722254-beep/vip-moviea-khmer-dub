import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface HealthStatus {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  version: string;
  services: {
    database: 'ok' | 'error';
    memory: {
      heapUsed: string;
      heapTotal: string;
      rss: string;
    };
  };
}

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async check(): Promise<HealthStatus> {
    const mem = process.memoryUsage();

    // Ping the database
    let dbStatus: 'ok' | 'error' = 'ok';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'error';
    }

    return {
      status: dbStatus === 'ok' ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      version: process.env.npm_package_version ?? '1.0.0',
      services: {
        database: dbStatus,
        memory: {
          heapUsed: `${Math.round(mem.heapUsed / 1024 / 1024)} MB`,
          heapTotal: `${Math.round(mem.heapTotal / 1024 / 1024)} MB`,
          rss: `${Math.round(mem.rss / 1024 / 1024)} MB`,
        },
      },
    };
  }
}
