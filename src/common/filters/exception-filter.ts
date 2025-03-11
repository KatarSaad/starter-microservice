import { Catch, RpcExceptionFilter, ArgumentsHost, HttpException } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';

// I WANT TO IMPLEMENT HTTP EXCEPTION FILTER AND RpcExceptionFilter IN THIS FILE
@Catch(HttpException)
export class ExceptionFilter implements RpcExceptionFilter<HttpException> {
  catch(exception: HttpException, host: ArgumentsHost): Observable<any> {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: ctx.getRequest().url,
      message: exception.message,
    });

    return throwError(() => exception.getResponse());
  }
}
