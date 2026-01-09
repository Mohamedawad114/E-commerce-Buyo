import { Global, Module } from "@nestjs/common";
import { UserModel } from "src/DB";
import { TokenModule } from "./Handlers";
import { UserRepo } from "./Repository";

@Global()
@Module({
    imports: [UserModel, TokenModule],
    providers:[UserRepo],
    exports:[UserModel, TokenModule,UserRepo]
})
export class commonModule{}