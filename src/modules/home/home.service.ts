import { Injectable } from '@nestjs/common';
import { Dashboard_product_services } from '../dashboard/services';

@Injectable()
export class Home_Services {
  constructor(private readonly productServices: Dashboard_product_services) {}

  getHomeData = async () => {
    const {data} = (await this.productServices.topSelling_products(
      1,
    )) 

    const { data:ratingData} = (await this.productServices.topRating_products(1)) ?? [];
      return {
          data: {
              DataTopRating: data.topSelling,
              DataTopSelling: ratingData.products,
          },
      };
  };
}
