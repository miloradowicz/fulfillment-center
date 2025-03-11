import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { CreateProductDto } from '../dto/create-product.dto'
import { ProductsService } from '../services/products.service'
import { UpdateProductDto } from '../dto/update-product.dto'

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post() async createProduct(@Body() productDto: CreateProductDto) {
    return await this.productsService.create(productDto)
  }

  @Get() async getAllProducts(@Query('client') ClientID: string,
  @Query('populate') populate?: string) {
    if (ClientID) {
      return await this.productsService.getAllByClient(ClientID, populate === '1')
    }
    else {
      return await this.productsService.getAll(populate === '1')
    }
  }

  @Get(':id') async getProduct(@Param('id') id: string) {
    return await this.productsService.getById(id)
  }

  @Delete(':id') async deleteProduct(@Param('id') id: string) {
    return await this.productsService.delete(id)
  }

  @Put(':id') async updateProduct(@Param('id') id: string, @Body() productDto: UpdateProductDto) {
    return await this.productsService.update(id, productDto)
  }
}
