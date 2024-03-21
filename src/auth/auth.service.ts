import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto, LoginDto } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import Redis from 'ioredis';
import sendEmail from '../email/email';

import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

/**
 * Service responsible for handling authentication-related operations.
 */
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    @Inject('REDIS') private redisClient: Redis,
    private jwtService: JwtService,
  ) {}

  /**
   * Retrieves the status of the authentication service.
   * @returns A string indicating the status of the authentication service.
   */
  getStatus() {
    return 'Auth service is up';
  }

  /**
   * Generates a random token by combining a random string and a timestamp.
   * @returns The generated random token.
   */
  generateRandomToken(): string {
    const randomString = Math.random().toString(36).substring(2);
    const timestamp = Date.now();
    return `${randomString}${timestamp}`;
  }

  /**
   * Generates a random verification code.
   * @returns The generated verification code.
   */
  generateVerificationCode(): string {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    return code;
  }

  /**
   * Sends a verification code to the provided email address.
   * @param email - The email address to send the verification code to.
   * @param code - The verification code to send.
   * @returns A boolean indicating whether the code was successfully sent.
   */
  async sendVerificationCode(
    email: string,
    subject: string,
    text: string,
  ): Promise<boolean> {
    try {
      const res = await sendEmail(email, subject, text);
      return res;
    } catch (error) {
      return false;
    }
  }

  async signup(dto: AuthDto, response: any) {
    try {
      if (!dto.email || !dto.email.endsWith('@nitkkr.ac.in')) {
        console.log('Invalid email format');
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            error: 'Bad Request',
          },
          HttpStatus.BAD_REQUEST,
          {
            cause: 'Invalid email format',
          },
        );
      }

      const userAvailable = await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });

      if (userAvailable) {
        this.sendVerificationCode(dto.email, 'passKey', userAvailable.passkey);
        return {
          status: 200,
          message: 'Welcome, Login with passkey emailed to you',
        };
      }

      const verificationCode = this.generateVerificationCode();
      const token = this.generateRandomToken();

      this.sendVerificationCode(
        dto.email,
        'Verification Code',
        verificationCode,
      );

      await this.redisClient.set(dto.email, verificationCode, 'EX', 60 * 10);

      const payload = {
        email: dto.email,
        token,
      };

      const authKey = await this.jwtService.sign(payload);

      response.cookie('authKey', authKey, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year in milliseconds
      });

      const generateRandomWord = (): string => {
        const characters =
          'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
        let randomWord = '';
        for (let i = 0; i < 16; i++) {
          const randomIndex = Math.floor(Math.random() * characters.length);
          randomWord += characters[randomIndex];
        }
        return randomWord;
      };

      const hashedrandomWord: string = await bcrypt.hash(
        generateRandomWord(),
        10,
      );
      console.error(hashedrandomWord);

      await this.prisma.user.create({
        data: {
          email: dto.email,
          token: token,
          passkey: hashedrandomWord,
          userVerified: false,
          role: 'USER',
        },
      });

      return {
        message: 'Verification code sent to email',
      };
    } catch (e) {
      console.log(e);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Internal Server Error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
        {
          cause: e,
        },
      );
    }
  }

  async confirmEmail(userEmail: string, code: number) {
    console.log(userEmail, code);
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email: userEmail,
        },
      });

      console.log(user);
      if (!user) {
        console.log('userNotFound');
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: 'Not Found',
          },
          HttpStatus.NOT_FOUND,
          {
            cause: 'User not found',
          },
        );
      }

      const verificationCode = await this.redisClient.get(userEmail);

      if (!verificationCode) {
        console.log('no verification code');
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: 'Code Not Found',
          },
          HttpStatus.NOT_FOUND,
          {
            cause: 'Verification code expired',
          },
        );
      }

      if (parseInt(verificationCode) != code) {
        console.log('didnt match verification code');
        throw new HttpException(
          {
            status: HttpStatus.UNAUTHORIZED,
            error: 'Wrong Code',
          },
          HttpStatus.UNAUTHORIZED,
          {
            cause: 'Invalid verification code',
          },
        );
      }

      const userVerified = await this.prisma.user.update({
        where: {
          email: userEmail,
        },
        data: {
          userVerified: true,
        },
      });

      return {
        status: 201,
        message: 'Email confirmed',
        passkey: user.passkey,
      };
    } catch (e) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Internal Server Error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
        {
          cause: e,
        },
      );
    }
  }

  signOut(token: string, userId: string) {
    return;
  }

  async verifyUsingPasskey(dto: LoginDto, response: any) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });

      if (!user) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: 'Not Found',
          },
          HttpStatus.NOT_FOUND,
          {
            cause: 'User not found',
          },
        );
      }

      const passwordMatch = bcrypt.compare(dto.passkey, user.passkey);

      if (!passwordMatch) {
        throw new HttpException(
          {
            status: HttpStatus.UNAUTHORIZED,
            error: 'Unauthorized',
          },
          HttpStatus.UNAUTHORIZED,
          {
            cause: 'Invalid password',
          },
        );
      }

      const payload = {
        email: dto.email,
      };

      const authKey = this.jwtService.sign(payload);

      response.cookie('authKey', authKey, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 365,
      });

      return {
        message: 'Logged in',
      };
    } catch (e) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Internal Server Error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
        {
          cause: e,
        },
      );
    }
  }
}
