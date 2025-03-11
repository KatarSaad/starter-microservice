import { User } from '@prisma/client';

export class UserResponseDto implements User {
  password: string;
  user_name: string;
  name: string;
  id: number;
  email: string;
  createdAt: Date;
}
