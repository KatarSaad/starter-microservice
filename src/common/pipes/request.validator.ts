import {
  Injectable,
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';

@Injectable()
export class ValidationPipe implements PipeTransform {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const errors = await validate(new metatype(value));
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return value;
  }

  private toValidate(metatype: any): boolean {
    return metatype.prototype && Object.keys(metatype.prototype).length > 0;
  }
}
