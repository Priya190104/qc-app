import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

/**
 * JSON replacer that converts BigInt and Prisma Decimal values to
 * JSON-serializable types. Used instead of deep object traversal
 * for significantly better performance on large response objects.
 */
function jsonReplacer(_key: string, value: unknown): unknown {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  // Handle Prisma Decimal type (has a toJSON/toString method and specific constructor name)
  if (
    value !== null &&
    typeof value === 'object' &&
    (value as any).constructor?.name === 'Decimal'
  ) {
    return parseFloat((value as any).toString());
  }
  return value;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const statusCode = method === 'POST' ? 201 : 200;

    return next.handle().pipe(
      map((data) => {
        // Use JSON.stringify + JSON.parse with a replacer for efficient BigInt/Decimal handling.
        // This is O(n) with no extra object allocation per key, unlike the previous recursive approach.
        const serializedData = JSON.parse(JSON.stringify(data, jsonReplacer));

        return {
          statusCode,
          message: 'Success',
          data: serializedData,
          timestamp: new Date().toISOString(),
        };
      })
    );
  }
}
