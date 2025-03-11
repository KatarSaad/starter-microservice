// src/auth/auth.guard.ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { AuthClientService } from '@app/common/services/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authClientService: AuthClientService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let token: string | null = null;
    let isHttpRequest = false;
    console.log('heeeeeeeeeeeeeeeeeeereeeeeeeeeeeeeeeeeeeeeee', context.getType());

    try {
      if (context.getType() === 'http') {
        console.log('hiiiii');

        // Extract from HTTP Request
        isHttpRequest = true;
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'];

        if (!authHeader) {
          throw new UnauthorizedException('Missing Authorization Header');
        }

        token = this.extractToken(authHeader);
        request.user = await this.validateToken(token);
      } else if (context.getType() === 'rpc') {
        // Extract from gRPC Metadata
        const grpcContext = context.switchToRpc().getContext();
        let metadata = null;
        try {
          metadata = grpcContext.metadata;
        } catch (err) {
          console.error('Error retrieving metadata:', err);
          throw new RpcException('Missing metadata'); // or you can wrap UnauthorizedException
        }
        if (!metadata) {
          throw new RpcException(new UnauthorizedException('Missing metadata'));
        }

        const authHeader = metadata.get('authorization')?.[0];

        if (authHeader) {
          token = this.extractToken(authHeader);
          const user = await this.validateToken(token);
          metadata.set('user', user); // Attach user info to metadata
        }
      }
      console.log('ooooooooooooooooooo');

      return true;
    } catch (error) {
      if (isHttpRequest) {
        throw new UnauthorizedException((error as any).message || 'Unauthorized');
      } else {
        throw new RpcException(new UnauthorizedException((error as any).message || 'Unauthorized'));
      }
    }
  }

  private extractToken(authHeader: string): string {
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedException('Invalid Authorization Header format');
    }
    return parts[1];
  }

  private async validateToken(token: string) {
    const response = await this.authClientService.validateToken(token);
    if (!response.isValid) {
      throw new UnauthorizedException(response.error);
    }
    return response.user;
  }
}
