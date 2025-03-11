// src/auth/auth-client.service.ts
import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AuthClientService {
  constructor(
    @Inject(forwardRef(() => 'AUTH_SERVICE')) // Use forwardRef here
    private readonly client: ClientProxy,
  ) {}

  async validateToken(token: string): Promise<any> {
    try {
      return await this.client.send({ cmd: 'validate_token' }, { token }).toPromise();
    } catch (error) {
      console.error('Error communicating with Auth Service:', (error as any).message);
      throw new Error('Authentication Service Unavailable');
    }
  }
}
