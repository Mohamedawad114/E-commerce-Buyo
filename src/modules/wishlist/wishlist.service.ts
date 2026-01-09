import { Injectable, NotFoundException } from '@nestjs/common';
import { IUser, productRepo, Wishlist_Repo } from 'src/common';
import { wishListDto } from './Dto';

@Injectable()
export class Wishlist_services {
  constructor(
    private readonly wishlistRepo: Wishlist_Repo,
    private readonly productRepo: productRepo,
  ) {}
  addToWishList = async (Dto: wishListDto, user: IUser) => {
    const product = await this.productRepo.findOneDocument({
      _id: Dto.productId,
      isActive: true,
    });
    if (!product)
      throw new NotFoundException('product not found , or product is inactive');
    const IsWishlistExist = await this.wishlistRepo.findOneDocument({
      userId: user._id,
    });
    if (!IsWishlistExist) {
      const createWishlist = await this.wishlistRepo.createDocument({
        userId: user._id,
        productIds: [Dto.productId],
        ProductsNumber: 1,
      });
      return {
        message: 'product added to wishlist',
        data: { createWishlist },
      };
    }
    const productExist = IsWishlistExist?.productIds.some((P) => {
      return P.toString() == product._id.toString();
    });

    if (productExist) return { message: 'product is already in your wishlist' };
    else {
      const updated = await this.wishlistRepo.updateDocument(
        { userId: user._id },
        {
          $addToSet: { productIds: product._id },
          $inc: { ProductsNumber: 1 },
        },
      );
      return {
        message: 'product added to wishlist',
        data: { updated },
      };
    }
  };
  removeFromWishList = async (Dto: wishListDto, user: IUser) => {
    const wishlist = await this.wishlistRepo.findOneDocument({
      userId: user._id,
    });
    if (!wishlist) throw new NotFoundException("can't find your wishlist");
    const product = await this.productRepo.findByIdDocument(Dto.productId);
    const productExist = wishlist?.productIds.some((P) => {
      return P.toString() == product?._id.toString();
    });
    if (!productExist)
      throw new NotFoundException('product not found in your wishlist');
    const wishlistUpdated = await this.wishlistRepo.findOneDocumentAndUpdate(
      { userId: user._id },
      {
        $pull: { productIds: product?._id },
        $inc: { ProductsNumber: -1 },
      },
    );
    return {
      message: 'product removed from  wishlist',
      data: { wishlistUpdated },
    };
  };
  userWishList = async (user: IUser) => {
    const wishlist = await this.wishlistRepo.findOneDocument(
      { userId: user._id },
      {},
      { populate: { path: 'productIds', select: 'name saleprice' } },
    );
    if (!wishlist) throw new NotFoundException("can't find your wishlist");
    return {
      message: 'your Wishlist',
      data: { wishlist },
    };
  };
}
