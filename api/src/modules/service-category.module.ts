import { Module } from '@nestjs/common'
import { DbModule } from './db.module'
import { AuthModule } from './auth.module'
import { ValidatorsModule } from './validators.module'
import { ServiceCategoriesController } from '../controllers/service-categories.controller'
import { ServiceCategoriesService } from '../services/service-categories.service'

@Module({
  imports: [DbModule, AuthModule, ValidatorsModule],
  controllers: [ServiceCategoriesController],
  providers: [ServiceCategoriesService],
})
export class ServiceCategoriesModule {}
