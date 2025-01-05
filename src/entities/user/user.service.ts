import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponse } from './response/user.response';

@Injectable()
export class UserService {
  constructor(private readonly em: EntityManager) {}

  async create(data: CreateUserDto): Promise<UserResponse> {
    const entity = this.em.create(User, data);
    await this.em.persistAndFlush(entity);
    return new UserResponse(entity);
  }

  async findAll(): Promise<UserResponse[]> {
    const entities = await this.em.find(User, {});
    return entities.map((entity) => new UserResponse(entity));
  }

  async findOne(id: number): Promise<UserResponse | null> {
    const entity = await this.em.findOne(User, { id });
    return entity ? new UserResponse(entity) : null;
  }

  async update(id: number, data: UpdateUserDto): Promise<UserResponse | null> {
    const entity = await this.em.findOne(User, { id });
    if (!entity) {
      return null;
    }
    this.em.assign(entity, data);
    await this.em.persistAndFlush(entity);
    return new UserResponse(entity);
  }

  async remove(id: number): Promise<boolean> {
    const entity = await this.em.findOne(User, { id });
    if (!entity) {
      return false;
    }
    await this.em.removeAndFlush(entity);
    return true;
  }
}