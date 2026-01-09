import { Document, Types } from 'mongoose';

export interface IBrand extends Document {
  name: string;
  Slogan: string;
  logo: string;
  createdBy: Types.ObjectId;
  DeActive: boolean;
}
