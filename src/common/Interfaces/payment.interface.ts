import { currency } from '../Enums';

export interface IStartPaymentDto {
  metadata: { orderId: string };
  cancel_url?: string;
  success_url?: string;
  discounts?: [];
  customer_email: string;
  items: [
    {
      quantity: number;
      price_data: {
        unit_amount: number;
        currency: currency;
        product_data: {
          name: string;
        };
      };
    },
  ];
}
