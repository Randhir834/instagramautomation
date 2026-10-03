import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  CreateProductInput,
  createProductSchema,
  UpdateProductInput,
  updateProductSchema,
  UploadRequest,
  uploadRequestSchema,
} from '@repo/shared';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { StoreService } from './store.service';

@Controller('store')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly store: StoreService) {}

  /** Step 1 of adding a product: get a URL to upload the file (or cover) to. */
  @Post('uploads')
  createUpload(
    @CurrentUser() user: RequestUser,
    @Body(new ZodValidationPipe(uploadRequestSchema)) dto: UploadRequest,
  ) {
    return this.store.createUpload(user.userId, dto);
  }

  @Get('products')
  list(@CurrentUser() user: RequestUser) {
    return this.store.listProducts(user.userId);
  }

  @Post('products')
  create(
    @CurrentUser() user: RequestUser,
    @Body(new ZodValidationPipe(createProductSchema)) dto: CreateProductInput,
  ) {
    return this.store.createProduct(user.userId, dto);
  }

  @Patch('products/:id')
  update(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateProductSchema)) dto: UpdateProductInput,
  ) {
    return this.store.updateProduct(user.userId, id, dto);
  }

  @Delete('products/:id')
  @HttpCode(204)
  remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.store.deleteProduct(user.userId, id);
  }
}
