import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(config: ConfigService) {
    super({
      datasources: {
        db: {
          // url: 'mysql://root:@127.0.0.1:3306/crud_nest?schema=public',
          url: config.get('DATABASE_URL'),
        },
      },
    });
  }
}
