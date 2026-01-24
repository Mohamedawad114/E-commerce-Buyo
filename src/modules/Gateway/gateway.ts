import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Types } from 'mongoose';
import { Logger } from 'nestjs-pino';
import { Server, Socket } from 'socket.io';
import {
  INotification,
  IOrder,
  redis,
  Sys_Role,
  TokenServices,
  UserRepo,
} from 'src/common';

@WebSocketGateway({ cors: { origin: '*' } })
export class realTimeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private readonly server: Server;
  constructor(
    private readonly logger: Logger,
    private readonly tokenService: TokenServices,
    private readonly userRepo: UserRepo,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket server initialized');
  }
  async handleConnection(client: Socket) {
    let auth =
      client.handshake.auth?.authorization ||
      client.handshake.headers?.authorization;
    if (!auth) {
      this.logger.warn('Missing accessToken');
      throw new WsException('forbidden must provide accessToken');
    }
    if (auth.startsWith('Bearer ')) {
      auth = auth.split(' ')[1];
    }
    const decoded = this.tokenService.VerifyAccessToken(auth);
    const user = await this.userRepo.findByIdDocument(decoded.id);
    client.data.user = user;
    if (user?.role === Sys_Role.moderator || user?.role === Sys_Role.admin) {
      client.join('admins');
    }
    await redis.sadd(`user_sockets:${user?._id}`, client.id);
    this.logger.log(`Client connected: ${client.id}`);
  }
  async handleDisconnect(client: Socket) {
    const user = client.data.user;
    await redis.srem(`user_sockets:${user._id}`, client.id);
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  changeProductStock(
    products: { productId: Types.ObjectId; newStock: number }[],
  ) {
    this.server.emit('productStockUpdated', products);
  }
  sendNewOrderNotification(order: IOrder) {
    this.server.to('admins').emit('new-order', order);
  }

  async sendNotification(userId: Types.ObjectId, notification: INotification) {
    const ids = await redis.smembers(`user_sockets:${userId.toString()}`);
    ids.forEach((socketId) => {
      const client = this.server.sockets.sockets.get(socketId);
      if (client) {
        client.emit('notification', {
          title: notification.title,
          message: notification.content,
        });
      }
    });
  }
}
