import { Controller, Get, Headers, Post } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Post()
  async getDashboard(
    @Headers('authorization') token: string,
    @Headers('userId') userId: string,
  ) {
    return this.service.getDashboard(token, userId);
  }
}
