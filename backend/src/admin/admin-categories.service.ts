import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/admin-misc.dto';

@Injectable()
export class AdminCategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { movies: true } },
      },
    });
  }

  async findOne(id: string) {
    const cat = await this.prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { movies: true } } },
    });
    if (!cat) throw new NotFoundException('រកមិនឃើញប្រភេទ');
    return cat;
  }

  async create(dto: CreateCategoryDto) {
    const exists = await this.prisma.category.findUnique({ where: { slug: dto.slug } });
    if (exists) throw new ConflictException('Slug នេះមានរួចហើយ');

    return this.prisma.category.create({
      data: {
        nameKh: dto.nameKh,
        nameEn: dto.nameEn,
        slug: dto.slug,
        iconUrl: dto.iconUrl,
        sortOrder: dto.sortOrder ?? 0,
        isActive: true,
      },
    });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findOne(id);

    if (dto.slug) {
      const exists = await this.prisma.category.findFirst({
        where: { slug: dto.slug, NOT: { id } },
      });
      if (exists) throw new ConflictException('Slug នេះមានរួចហើយ');
    }

    return this.prisma.category.update({ where: { id }, data: dto });
  }

  async delete(id: string) {
    const cat = await this.findOne(id);
    const movieCount = await this.prisma.movie.count({ where: { categoryId: id } });

    if (movieCount > 0) {
      throw new ConflictException(`មិនអាចលុបប្រភេទដែលមានភាពយន្ត ${movieCount} ។`);
    }

    return this.prisma.category.delete({ where: { id } });
  }
}
