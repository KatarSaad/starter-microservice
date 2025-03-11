import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './response/user-response.dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserDto): Promise<UserResponseDto> {
    return await this.prisma.user.create({ data });
  }

  async findAll(): Promise<UserResponseDto[]> {
    return await this.prisma.user.findMany();
  }

  async findOne(id: number): Promise<UserResponseDto | null> {
    const result = await this.prisma.user.findUnique({ where: { id } });
    if (!result) {
      throw new RpcException(`user with ID ${id} not found`);
    }
    return result;
  }

  async update(id: number, data: UpdateUserDto): Promise<UserResponseDto> {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`user with ID ${id} not found`);
    }
    return await this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async remove(id: number): Promise<UserResponseDto> {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`user with ID ${id} not found`);
    }
    return await this.prisma.user.delete({ where: { id } });
  }
  async findByUserName(user_name: string) {
    const user = await this.prisma.user.findFirst({
      where: { name: user_name },
    });
    return user;
  }
}
