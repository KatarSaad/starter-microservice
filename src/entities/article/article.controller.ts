import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';

@ApiTags('Article')
@Controller('article')
export class ArticleController {
  constructor(private readonly service: ArticleService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new Article' })
  async create(@Body() dto: CreateArticleDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all Articles' })
  async findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Article by ID' })
  async findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }
}