import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostResponseDto } from './response/post-response.dto';

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreatePostDto): Promise<PostResponseDto> {
    return await this.prisma.post.create({ data });
  }

  async findAll(): Promise<PostResponseDto[]> {
    return await this.prisma.post.findMany();
  }

  async findOne(id: number): Promise<PostResponseDto> {
    const result = await this.prisma.post.findUnique({ where: { id } });
    if (!result) {
      throw new NotFoundException(`post with ID ${id} not found`);
    }
    return result;
  }

  async update(id: number, data: UpdatePostDto): Promise<PostResponseDto> {
    const existing = await this.prisma.post.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`post with ID ${id} not found`);
    }
    return await this.prisma.post.update({
      where: { id },
      data,
    });
  }

  async remove(id: number): Promise<PostResponseDto> {
    const existing = await this.prisma.post.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`post with ID ${id} not found`);
    }
    return await this.prisma.post.delete({ where: { id } });
  }
}
