import { Wishlist, WishlistDocument } from 'src/DB';
import { BaseRepository } from './Base.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class Wishlist_Repo extends BaseRepository<WishlistDocument> {
  constructor(
    @InjectModel(Wishlist.name)
    protected wishlistModel: Model<WishlistDocument>,
  ) {
    super(wishlistModel);
  }
}
