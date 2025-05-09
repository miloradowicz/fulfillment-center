import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common'
import { CounterpartiesService } from '../services/counterparties.service'
import { CreateCounterpartyDto } from '../dto/create-counterparty.dto'
import { UpdateCounterpartyDto } from '../dto/update-counterparty.dto'

@Controller('counterparties')
export class CounterpartiesController {
  constructor(private readonly counterpartiesService: CounterpartiesService) {}

  @Get()
  async getAllCounterparties() {
    return this.counterpartiesService.getAll()
  }

  @Get('all')
  async getAllCounterpartiesWithArchived() {
    return this.counterpartiesService.getAllWithArchived()
  }

  @Get(':id')
  async getCounterpartyById(@Param('id') id: string) {
    return this.counterpartiesService.getById(id)
  }

  @Get('all/:id')
  async getCounterpartyByIdWithArchived(@Param('id') id: string) {
    return this.counterpartiesService.getByIdWithArchived(id)
  }

  @Post()
  async createCounterparty(@Body() counterpartyDto: CreateCounterpartyDto) {
    return this.counterpartiesService.create(counterpartyDto)
  }

  @Put(':id')
  async updateCounterparty(@Param('id') id: string, @Body() counterpartyDto: UpdateCounterpartyDto) {
    return this.counterpartiesService.update(id, counterpartyDto)
  }

  @Patch(':id/archive')
  async archiveCounterparty(@Param('id') id: string) {
    return this.counterpartiesService.archive(id)
  }

  @Delete(':id')
  async deleteCounterparty(@Param('id') id: string) {
    return this.counterpartiesService.delete(id)
  }
}
