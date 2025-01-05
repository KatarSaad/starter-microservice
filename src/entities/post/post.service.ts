import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Post } from './post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostResponse } from './response/post.response';

@Injectable()
export class PostService {
  constructor(private readonly em: EntityManager) {}

  async create(data: CreatePostDto): Promise<PostResponse> {
    const entity = this.em.create(Post, data);
    await this.em.persistAndFlush(entity);
    return new PostResponse(entity);
  }

  async findAll(): Promise<PostResponse[]> {
    const entities = await this.em.find(Post, {});
    return entities.map((entity) => new PostResponse(entity));
  }

  async findOne(id: number): Promise<PostResponse | null> {
    const entity = await this.em.findOne(Post, { id });
    return entity ? new PostResponse(entity) : null;
  }

  async update(id: number, data: UpdatePostDto): Promise<PostResponse | null> {
    const entity = await this.em.findOne(Post, { id });
    if (!entity) {
      return null;
    }
    this.em.assign(entity, data);
    await this.em.persistAndFlush(entity);
    return new PostResponse(entity);
  }

  async remove(id: number): Promise<boolean> {
    const entity = await this.em.findOne(Post, { id });
    if (!entity) {
      return false;
    }
    await this.em.removeAndFlush(entity);
    return true;
  }
}