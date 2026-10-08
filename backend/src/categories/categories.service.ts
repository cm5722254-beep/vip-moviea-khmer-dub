import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const categories = await this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        nameKh: true,
        nameEn: true,
        slug: true,
        iconUrl: true,
        sortOrder: true,
        _count: {
          select: {
            movies: {
              where: { status: 'PUBLISHED' },
            },
          },
        },
      },
    });

    return categories;
  }

  async findBySlug(slug: string) {
    return this.prisma.category.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { movies: { where: { status: 'PUBLISHED' } } },
        },
      },
    });
  }
}
