import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

const KHMER_ERROR_MESSAGES: Record<number, string> = {
  400: 'សំណើមិនត្រឹមត្រូវ។ សូមពិនិត្យព័ត៌មានដែលបានបញ្ចូល។',
  401: 'អ្នកមិនទាន់បានចូលប្រព័ន្ធ។ សូមចូលប្រព័ន្ធម្ដងទៀត។',
  403: 'អ្នកមិនមានសិទ្ធិចូលប្រើប្រាស់ផ្នែកនេះ។',
  404: 'រកមិនឃើញទិន្នន័យដែលបានស្នើ។',
  409: 'ទិន្នន័យនេះមានរួចហើយ។ សូមពិនិត្យម្ដងទៀត។',
  422: 'ទិន្នន័យដែលបញ្ចូលមិនអាចដំណើរការបាន។',
  429: 'អ្នកបានព្យាយាមច្រើនពេក។ សូមរង់ចាំបន្ដិចទៀត។',
  500: 'មានបញ្ហាក្នុងប្រព័ន្ធ។ សូមព្យាយាមម្ដងទៀតក្រោយ។',
  503: 'ប្រព័ន្ធកំពុងជួសជុល។ សូមព្យាយាមម្ដងទៀតក្រោយ។',
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = KHMER_ERROR_MESSAGES[500];
    let details: unknown = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, unknown>;
        if (typeof resp.message === 'string') {
          message = resp.message;
        } else if (Array.isArray(resp.message)) {
          message = KHMER_ERROR_MESSAGES[status] || resp.message[0];
          details = resp.message;
        } else {
          message = KHMER_ERROR_MESSAGES[status] || exception.message;
        }
      } else {
        message = KHMER_ERROR_MESSAGES[status] || exception.message;
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2002') {
        status = HttpStatus.CONFLICT;
        message = 'ទិន្នន័យនេះមានរួចហើយ។ សូមពិនិត្យម្ដងទៀត។';
      } else if (exception.code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        message = 'រកមិនឃើញទិន្នន័យដែលបានស្នើ។';
      } else if (exception.code === 'P2003') {
        status = HttpStatus.BAD_REQUEST;
        message = 'ទំនាក់ទំនងទិន្នន័យមិនត្រឹមត្រូវ។';
      } else {
        this.logger.error(`Prisma error ${exception.code}: ${exception.message}`);
        message = 'មានបញ្ហាក្នុងការដំណើរការទិន្នន័យ។';
      }
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'ទិន្នន័យដែលបញ្ចូលមិនត្រឹមត្រូវ។';
    } else if (exception instanceof Error) {
      this.logger.error(`Unhandled error: ${exception.message}`, exception.stack);
    } else {
      this.logger.error('Unknown exception', String(exception));
    }

    this.logger.warn(
      `${request.method} ${request.url} → ${status}: ${
        exception instanceof Error ? exception.message : String(exception)
      }`,
    );

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      details,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
