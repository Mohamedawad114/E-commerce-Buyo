import { Document, Types } from 'mongoose';
import { Gender, Provider, Sys_Role } from '../Enums';

export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  phoneNumber: string;
  Age: number;
  gender: Gender;
  role?: Sys_Role;
  profilePicture?: string;
  provider?: Provider;
  subId?: number;
  isConfirmed?: boolean;
  TwoFA?: boolean;
  secret?: string;
  backupCodesHashed?: string[];
}
