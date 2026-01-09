import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { INotification } from 'src/common';

@Schema({ strict: true, strictQuery: true, autoIndex: false, timestamps: true })
export class Notification implements INotification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;
  @Prop({
    type: String,
    minlength: 5,
    maxlength: 100,
    required: true,
  })
  title: string;
  @Prop({
    type: String,
    required: true,
  })
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = SchemaFactory.createForClass(Notification);
NotificationSchema.index({ userId: 1 });

export type NotificationDocument = HydratedDocument<Notification>;
export const notificationModel = MongooseModule.forFeature([
  {
    schema: NotificationSchema,
    name: Notification.name,
  },
]);
