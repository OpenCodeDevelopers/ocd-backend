import { Controller, Get, Headers, Post } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Post()
  async getUser(
    @Headers('authorization') token: string,
    @Headers('userId') userId: string,
  ) {
    return this.service.getUser(token, userId);
  }
}
