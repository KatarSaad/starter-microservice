import { IsString, IsNotEmpty } from 'class-validator';
import { User } from '@prisma/client';

export class CreateUserDto implements Omit<User, 'id'> {
  password: string;
 
 



  
  user_name: string;
  name: string;
  email: string;
  createdAt: Date;
}
