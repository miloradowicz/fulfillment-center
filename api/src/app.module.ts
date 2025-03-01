import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Client, ClientSchema } from './schemas/client.schema'
import { ClientsController } from './clients/clients.controller'

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/fulfillment-center'),
    MongooseModule.forFeature([{ name: Client.name, schema: ClientSchema }]),
  ],
  controllers: [ClientsController],
  providers: [],
})
export class AppModule {}
