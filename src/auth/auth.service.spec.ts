import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaModule } from '../prisma/prisma.module';
import Redis from 'ioredis';
import { Scope } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate a random token', () => {
    const token = service.generateRandomToken();
    expect(token).toBeDefined();
  });
});
