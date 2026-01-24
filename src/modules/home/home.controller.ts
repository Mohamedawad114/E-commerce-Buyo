import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Home_Services } from './home.service';

@ApiTags('Home')
@Controller('/')
export class HomeController {
  constructor(private readonly HomeServices: Home_Services) {}

  @Get('')
  @ApiOperation({ summary: 'Get home page data' }) // وصف العملية
  HomeData() {
    return this.HomeServices.getHomeData();
  }
}
