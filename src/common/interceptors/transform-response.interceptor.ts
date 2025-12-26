import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';

export interface Response<T> {
  statusCode: number;
  message: string;
  data: T;
}

@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    return next.handle().pipe(
      map((data) => {
        // Get Content-Type header
        const contentType = response.getHeader('Content-Type');

        // Skip transformation for non-JSON responses
        if (contentType && typeof contentType === 'string') {
          if (
            contentType.includes('application/octet-stream') ||
            contentType.includes('application/pdf') ||
            contentType.includes('image/') ||
            contentType.includes('video/') ||
            contentType.includes('audio/') ||
            contentType.includes('text/csv') ||
            contentType.includes('application/vnd.ms-excel') ||
            contentType.includes('application/vnd.openxmlformats-officedocument')
          ) {
            return data; // Return raw data without wrapping
          }
        }

        // Normal JSON response transformation
        const statusCode = response.statusCode || HttpStatus.OK;
        const customMessage = this.reflector.get<string>(
          'response_message',
          context.getHandler(),
        );

        let message = customMessage;
        if (!message) {
          switch (request.method) {
            case 'POST':
              message = 'Resource created/fetch successfully';
              break;
            case 'PUT':
            case 'PATCH':
              message = 'Resource updated successfully';
              break;
            case 'DELETE':
              message = 'Resource deleted successfully';
              break;
            default:
              message = 'Request successful';
          }
        }

        return {
          statusCode,
          message,
          data,
        };
      }),
    );
  }
}