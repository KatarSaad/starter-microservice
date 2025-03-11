// import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

// @Injectable()
// export class RmqLoggingGuard implements CanActivate {
//   constructor() {}

//   canActivate(context: ExecutionContext): boolean {
//     try {
//       const rmqContext = context.switchToRpc().getContext();
//       const message = context.switchToRpc().getData();
//       const pattern = rmqContext.getPattern();

//       return true; // Allow the request to proceed
//     } catch (error) {
//       const errorMessage = `Guard Error: Unable to process RabbitMQ message: ${error.message}`;
//       //   this.loggingService.handleLog(
//       //     'error',
//       //     errorMessage,
//       //     error.stack,
//       //     'RabbitMQ',
//       //   );
//       throw error;
//     }
//   }
// }
