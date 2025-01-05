import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';

@ApiTags('Post')
@Controller('post')
export class PostController {
  constructor(private readonly service: PostService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new Post' })
  async create(@Body() dto: CreatePostDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all Posts' })
  async findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Post by ID' })
  async findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }
}