import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Article } from './article.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ArticleResponse } from './response/article.response';

@Injectable()
export class ArticleService {
  constructor(private readonly em: EntityManager) {}

  async create(data: CreateArticleDto): Promise<ArticleResponse> {
    const entity = this.em.create(Article, data);
    await this.em.persistAndFlush(entity);
    return new ArticleResponse(entity);
  }

  async findAll(): Promise<ArticleResponse[]> {
    const entities = await this.em.find(Article, {});
    return entities.map((entity) => new ArticleResponse(entity));
  }

  async findOne(id: number): Promise<ArticleResponse | null> {
    const entity = await this.em.findOne(Article, { id });
    return entity ? new ArticleResponse(entity) : null;
  }

  async update(id: number, data: UpdateArticleDto): Promise<ArticleResponse | null> {
    const entity = await this.em.findOne(Article, { id });
    if (!entity) {
      return null;
    }
    this.em.assign(entity, data);
    await this.em.persistAndFlush(entity);
    return new ArticleResponse(entity);
  }

  async remove(id: number): Promise<boolean> {
    const entity = await this.em.findOne(Article, { id });
    if (!entity) {
      return false;
    }
    await this.em.removeAndFlush(entity);
    return true;
  }
}