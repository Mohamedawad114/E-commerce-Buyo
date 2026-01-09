import { Model } from "mongoose";
import { BaseRepository } from "./Base.repository";
import { User, UserDocument } from "src/DB";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

@Injectable()
export class UserRepo extends BaseRepository<UserDocument> {
  constructor(@InjectModel(User.name) protected userModel: Model<UserDocument>) {
    super(userModel);
  }
  async updateUser(user: UserDocument): Promise<UserDocument> {
    return await user.save();
  }
}
