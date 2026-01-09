import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Cart_Repo, IUser, productRepo } from 'src/common';
import { addToCartDto, removeItemDto } from './Dto';
import { Types } from 'mongoose';

@Injectable()
export class Cart_services {
  constructor(
    private readonly cartRepo: Cart_Repo,
    private readonly productRepo: productRepo,
  ) {}
  addToCart = async (Dto: addToCartDto, user: IUser) => {
    const product = await this.productRepo.findOneDocument({
      _id: Dto.productId,
      stock: { $gte: Dto.quantity },
    });
    if (!product)
      throw new NotFoundException(
        'failed to found product or product is out stock',
      );
    const cart = await this.cartRepo.findOneDocument({ userId: user._id });
    if (!cart) {
      const create = await this.cartRepo.createDocument({
        userId: user._id,
        products: [
          {
            productId: product._id,
            quantity: Dto.quantity,
          },
        ],
      });
      if (!create) throw new BadRequestException('failed to create cart');
      return { message: 'cart create and add prodeuct', data: { create } };
    }
    const is_existed = cart.products.find((p) => {
      return p.productId.toString() === Dto.productId.toString();
    });
    if (is_existed) {
      if (Dto.quantity > product.stock)
        throw new BadRequestException('product is out of stock');
      is_existed.quantity = Dto.quantity;
      await cart.save();
    } else {
      cart.products.push({
        productId: product._id,
        quantity: Dto.quantity,
      });
      await cart.save();
    }
    return {
      message: ' product added',
      data: { cart },
    };
  };
  removeProductFromCart = async (Dto: removeItemDto, user: IUser) => {
    const product = await this.productRepo.findByIdDocument(Dto.productId);
    if (!product) throw new NotFoundException(`product not found`);
    const cart = await this.cartRepo.findOneDocument({ userId: user._id });
    if (!cart) {
      throw new NotFoundException('cart not found');
    } else {
      const index = cart.products.findIndex(
        (p) => p.productId.toString() === product._id.toString(),
      );
      if (index == -1)
        throw new NotFoundException('product not found in your cart');
      cart.products.splice(index, 1);
      await cart.save();
      return { message: `product remove from cart`, data: { cart } };
    }
  };
  removeAllFromCart = async (user: IUser) => {
    const cart = await this.cartRepo.findOneDocument({ userId: user._id });
    if (!cart) throw new BadRequestException('no cart found');
    cart.products = [];
    await cart.save();
    return { message: `cart cleared` };
  };
  userCart = async (userId: Types.ObjectId) => {
    const cart = await this.cartRepo.findOneDocument({ userId: userId });
    const total_price = await this.cartRepo.calcTotalPrice(userId);
    if (!cart?.products.length) return { messsage: `no products in your cart` };
    return { data: cart, meta: { total_price } };
  };
  summaryCart = async (userId: Types.ObjectId) => {
    const cart = await this.cartRepo.findOneDocument({ userId });
    if (!cart) throw new BadRequestException('no cart found');
    const total_price = await this.cartRepo.calcTotalPrice(userId);
    const products_number = cart.products.reduce(
      (sum, p) => sum + p.quantity,
      0,
    );
    return { data: { total_price: total_price, products: products_number } };
  };
}
