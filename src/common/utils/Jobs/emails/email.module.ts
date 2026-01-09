import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { EmailServices, redis } from "../../Services";
import { EmailProducer } from "./email.producer";
import { EmailWorker } from "./email.processor";


@Module({
    imports: [BullModule.registerQueue({
        name:"email",
        connection: redis,
    })],
    providers: [EmailProducer,EmailWorker,EmailServices],
    exports:[EmailProducer]
})
export class EmailModule{}