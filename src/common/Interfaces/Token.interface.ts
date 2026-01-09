import { ObjectId } from "mongoose";
import { Sys_Role } from "../Enums";


export interface IToken{
    id: string,
    username: string,
    role?: Sys_Role
}
 export interface IDecodedToken {
   id: string;
   username: string;
   role: Sys_Role;
   jti: string;
 }
