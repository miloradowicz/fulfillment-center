import { Body, Controller, Delete, Get, Param, Post, Put, UseInterceptors, UploadedFiles, Query } from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import { CreateProductDto } from '../dto/create-product.dto'
import { ProductsService } from '../services/products.service'
import { UpdateProductDto } from '../dto/update-product.dto'

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('documents', 10, { dest: './uploads/documents' }))
  async createProduct(
    @Body() productDto: CreateProductDto,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    return await this.productsService.create(productDto, files)
  }

  @Get()
  async getAllProducts(
    @Query('client') clientId: string,
    @Query('populate') populate?: string
  ) {
    if (clientId) {
      return await this.productsService.getAllByClient(clientId, populate === '1')
    } else {
      return await this.productsService.getAll(populate === '1')
    }
  }

  @Get(':id')
  async getProduct(@Param('id') id: string) {
    return await this.productsService.getById(id)
  }

  @Delete(':id')
  async deleteProduct(@Param('id') id: string) {
    return await this.productsService.delete(id)
  }

  @Put(':id')
  @UseInterceptors(FilesInterceptor('documents', 10, { dest: './uploads/documents' }))
  async updateProduct(
    @Param('id') id: string,
    @Body() productDto: UpdateProductDto,
    @UploadedFiles() files: Array<Express.Multer.File>
  ) {
    return await this.productsService.update(id, productDto, files)
  }
}
