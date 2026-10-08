import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Setting } from '@prisma/client';

@Injectable()
export class AdminSettingsService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    const settings = await this.prisma.setting.findMany({
      orderBy: [{ group: 'asc' }, { key: 'asc' }],
    });

    // Group by category
    const grouped = settings.reduce(
      (acc: Record<string, Setting[]>, setting: Setting) => {
        const group = setting.group || 'general';
        if (!acc[group]) acc[group] = [];
        acc[group].push(setting);
        return acc;
      },
      {} as Record<string, Setting[]>,
    );

    return grouped;
  }

  async updateMany(settings: Array<{ key: string; value: string }>) {
    const results = await Promise.all(
      settings.map(({ key, value }) =>
        this.prisma.setting.upsert({
          where: { key },
          create: { key, value, group: 'general' },
          update: { value, updatedAt: new Date() },
        }),
      ),
    );

    return results;
  }

  async getByKey(key: string) {
    const setting = await this.prisma.setting.findUnique({ where: { key } });
    if (!setting) throw new NotFoundException(`Setting '${key}' រកមិនឃើញ`);
    return setting;
  }
}
