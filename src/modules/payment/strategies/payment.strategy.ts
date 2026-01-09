import { IStartPaymentDto } from 'src/common';

export interface Payment_Strategy {
  startPayment(data: IStartPaymentDto): Promise<any>;
}
