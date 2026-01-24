import { Module } from '@nestjs/common';
import { Brand_Repo, commonModule, s3_services } from 'src/common';
import { BrandSerivces } from './Brand.service';
import { Brand_Controller, BrandUser_Controller } from './controllers';
import { BrandModel } from 'src/DB';

@Module({
  imports: [BrandModel],
  controllers: [Brand_Controller, BrandUser_Controller],
  providers: [Brand_Repo, s3_services, BrandSerivces],
  exports: [],
})
export class BrandModule {}
