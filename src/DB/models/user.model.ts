import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  Gender,
  generateHash,
  Provider,
  s3_services,
  Sys_Role,
} from 'src/common';

@Schema({ strict: true, timestamps: true, autoIndex: false })
export class User {
  @Prop({
    type: String,
    required: true,
    minlength: 4,
    maxlength: 64,
    trim: true,
  })
  username: string;
  @Prop({
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  })
  email: string;

  @Prop({ type: String, enum: Provider, default: Provider.system })
  provider: Provider;

  @Prop({
    type: String,
    required: function (this: UserDocument) {
      return this.provider === Provider.system;
    },
  })
  phoneNumber: string;

  @Prop({ required: true, type: Number, min: 16 })
  Age: number;

  @Prop({
    type: String,
    required: function (this: UserDocument) {
      return this.provider === Provider.system;
    },
    minlength: 8,
    match:
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?.&-])[A-Za-z\d@$!%?.&-]{6,}$/,
    select: false,
  })
  password: string;

  @Prop({ type: String, enum: Sys_Role, default: Sys_Role.user })
  role: Sys_Role;

  @Prop({ type: String, enum: Gender })
  gender: Gender;
  @Prop({ type: Number, select: 0 })
  subId: number;

  @Prop({ type: Boolean, default: false })
  isConfirmed: boolean;
  @Prop({ type: Boolean, default: false })
  isBanned: boolean;
  @Prop({ type: Boolean, default: false })
  TwoFA: boolean;

  @Prop({ type: String, default: null })
  profilePicture: string;
  @Prop({ type: String, select: 0 })
  secret: string;
  @Prop({ type: [String], select: 0 })
  backupCodesHashed: string[];

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = SchemaFactory.createForClass(User);
export type UserDocument = HydratedDocument<User>;
UserSchema.index({ email: 1 }, { name: 'email_user_unique', unique: true });
UserSchema.pre('save', async function () {
  if (this.isModified('password')) {
    this.password = await generateHash(this.password);
  }
});
UserSchema.post('findOneAndDelete', async function (doc: UserDocument) {
  const s3 = new s3_services();
  if (doc && doc.profilePicture) await s3.deleteFile(doc.profilePicture);
});
export const UserModel = MongooseModule.forFeature([
  { schema: UserSchema, name: User.name },
]);
