import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import Redis from 'ioredis';
import { Scope } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController, PrismaModule],
      imports: [PrismaModule],
      providers: [
        AuthService,
        PrismaService,
        {
          provide: 'REDIS',
          useFactory: () => {
            const client = new Redis(process.env.REDDIS_URL);
            client.on('error', (err) => console.error('Redis error', err));
            return client;
          },
          scope: Scope.DEFAULT,
        },
        JwtService,
        ConfigService,
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
