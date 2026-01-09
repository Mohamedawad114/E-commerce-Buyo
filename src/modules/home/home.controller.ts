import { Controller, Get } from '@nestjs/common';

import { Home_Services } from './home.service';


@Controller("/")
export class HomeController {
  constructor(private readonly HomeServices: Home_Services) {}

  @Get()
  HomeData() {
    return  this.HomeServices.getHomeData();
  }
}