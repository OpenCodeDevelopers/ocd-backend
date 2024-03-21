import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(token: string, userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId,
          token: token,
        },
        include: {
          socialAccounts: true,
        },
      });

      if (!user) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: 'Unauthorized',
          },
          HttpStatus.NOT_FOUND,
          {
            cause: 'Invalid token',
          },
        );
      }

      return {
        message: 'Welcome to the dashboard',
        data: user,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Internal Server Error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
        {
          cause: error,
        },
      );
    }
  }
}
