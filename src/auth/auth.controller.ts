import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto, LoginDto } from './dto';
import { ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Public } from '../custom.decorator/custom.deco';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Get('status')
  getStatus() {
    return this.authService.getStatus();
  }

  @Public()
  @Post('signup')
  @ApiBody({ type: AuthDto })
  signup(@Body() dto: AuthDto, @Res({ passthrough: true }) response) {
    return this.authService.signup(dto, response);
  }

  // TODO: for email confirmation,
  @UseGuards(JwtAuthGuard)
  @Post('signup/confirm/:userEmail')
  @ApiBody({ type: String })
  confirm(
    @Param('userEmail') userEmail: string,
    @Headers('code') code: number,
  ) {
    return this.authService.confirmEmail(userEmail, code);
  }

  // TODO: for token reset,
  @Post('signout')
  @UseGuards(JwtAuthGuard)
  signout(
    @Headers('authorization') token: string,
    @Headers('userId') userId: string,
  ) {
    return this.authService.signOut(token, userId);
  }

  // TODO: Github Signup
  // @Post('signup/github')

  // TODO: Google Signup
  // @Post('signup/google')

  @Public()
  @Post('signin')
  @ApiBody({ type: LoginDto })
  signin(@Body() dto: LoginDto, @Res({ passthrough: true }) response) {
    return this.authService.verifyUsingPasskey(dto, response);
  }

  // TODO: Github Signin
  // @Post('signin/github')

  // TODO: Google Signin
  // @Post('signin/google')
}
