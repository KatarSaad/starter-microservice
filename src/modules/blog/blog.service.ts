import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { BlogResponseDto } from './response/blog-response.dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class BlogService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateBlogDto): Promise<BlogResponseDto> {
    try {
      return await this.prisma.blog.create({ data });
    } catch (error) {
      throw this.buildError('create', data, error);
    }
  }

  async findAll(): Promise<BlogResponseDto[]> {
    try {
      return await this.prisma.blog.findMany();
    } catch (error) {
      throw this.buildError('findAll', {}, error);
    }
  }

  async findOne(id: number): Promise<BlogResponseDto> {
    try {
      const result = await this.prisma.blog.findUnique({ where: { id } });
      if (!result) {
        throw new RpcException({
          statusCode: 404,
          message: `blog with ID ${id} not found`,
          metadata: { id },
        });
      }
      return result;
    } catch (error) {
      throw this.buildError('findOne', { id }, error);
    }
  }

  async update(id: number, data: UpdateBlogDto): Promise<BlogResponseDto> {
    try {
      return await this.prisma.blog.update({ where: { id }, data });
    } catch (error) {
      throw this.buildError('update', { id, data }, error);
    }
  }

  async delete(id: number): Promise<BlogResponseDto> {
    try {
      return await this.prisma.blog.delete({ where: { id } });
    } catch (error) {
      throw this.buildError('delete', { id }, error);
    }
  }

  private buildError(action: string, details: any, error: any): RpcException {
    return new RpcException({
      statusCode: error?.error?.statusCode || 500,
      message: error?.message || `Failed to ${action} resource`,
      metadata: { action, details, error },
      stack: error?.stack,
    });
  }
}
