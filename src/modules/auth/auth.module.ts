import { Module, NestModule } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { UserModel } from "src/DB";
import { Crypto, EmailModule, TokenModule, TwoFA_services, UserRepo } from "src/common";


@Module({
  imports: [UserModel, TokenModule, EmailModule ],
  exports: [],
  controllers: [AuthController],
  providers: [AuthService, UserRepo,Crypto,TwoFA_services],
})
export class AuthModule{}