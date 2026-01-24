import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Brand_Repo,
  Cart_Repo,
  Category_Repo,
  IUser,
  productRepo,
  redis,
  ReviewRepo,
  s3_services,
  Sys_Role,
  Wishlist_Repo,
} from 'src/common';
import {
  addProductDto,
  CategoryProductDto,
  SearchDto,
  updateAttachmentDTo,
  UpdateProductDto,
} from './Dto';
import { Connection, Types } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { realTimeGateway } from '../Gateway/gateway';

@Injectable()
export class Product_Servcies {
  constructor(
    private readonly ProductRepo: productRepo,
    private readonly categoryRepo: Category_Repo,
    private readonly brandRepo: Brand_Repo,
    private readonly s3Services: s3_services,
    private readonly wishlistRepo: Wishlist_Repo,
    private readonly reviewRepo: ReviewRepo,
    private readonly cartRepo: Cart_Repo,
    private readonly realTimeGateway: realTimeGateway,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  getProduct = async (productId: Types.ObjectId, user: IUser) => {
    const product = await this.ProductRepo.findOneDocument({
      _id: productId,
      isActive: true,
    });
    if (!product)
      throw new NotFoundException("product not found or it's  deActive");
    const isCategoryDeActive = await redis.sismember(
      'DeActive_categories',
      product.CategoryId.toString(),
    );
    const isBrandDeActive = await redis.sismember(
      'deActive_brands',
      product.BrandId.toString(),
    );
    if (
      (isCategoryDeActive && user.role == Sys_Role.user) ||
      (user.role == Sys_Role.user && isBrandDeActive)
    )
      throw new NotFoundException(`category or brand this product not active`);
    if (product) {
      return { message: 'product Details', data: { product } };
    } else throw new NotFoundException(`product not found`);
  };
  categotyProducts = async (
    Dto: CategoryProductDto,
    page: number,
    Sort: string,
  ) => {
    const limit = 10;
    const offset = (page - 1) * limit;
    const category = await this.categoryRepo.findOneDocument({
      _id: Dto.categoryId,
      DeActive: false,
    });
    if (!category)
      throw new NotFoundException("catgeory not found or it's  deActive");
    const sort =
      Sort === 'priceAsc'
        ? { saleprice: 1 }
        : Sort === 'priceDesc'
          ? { saleprice: -1 }
          : Sort === 'rating'
            ? { rateAvg: -1 }
            : { createdAt: -1 };
    const deActiveBrands = Array.from(
      await redis.smembers('deActive_brands'),
    ).map((id) => new Types.ObjectId(id));
    console.log(category._id);
    const products = await this.ProductRepo.findDocuments(
      {
        CategoryId: category._id,
        isActive: true,
        BrandId: { $nin: deActiveBrands },
      },
      {
        descripation: 0,
        productImgs: { $slice: 1 },
      },
      { skip: offset, limit: limit, sort },
    );
    const total = await this.ProductRepo.countDocuments({
      categoryId: Dto.categoryId,
      isActive: true,
      BrandId: { $nin: deActiveBrands },
    });
    return {
      message: 'products',
      data: { products },
      meta: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    };
  };
  products_spec_category_brand = async (
    categoryId: Types.ObjectId,
    brandId: Types.ObjectId,
    page: number,
    Sort: string,
  ) => {
    const limit = 10;
    const offset = (page - 1) * limit;
    const cacheKey = `products:cat=${categoryId}:brand=${brandId}:page=${page}:sort=${Sort}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      const data = JSON.parse(cached);
      return { data: { data } };
    }
    const category = await this.categoryRepo.findOneDocument({
      _id: categoryId,
      DeActive: false,
    });
    if (!category)
      throw new NotFoundException("catgeory not found or it's deActive");
    const brand = await this.brandRepo.findOneDocument({
      _id: brandId,
      DeActive: false,
    });
    if (!brand) throw new NotFoundException("brand not found or it's deActive");
    const sort =
      Sort === 'priceAsc'
        ? { saleprice: 1 }
        : Sort === 'priceDesc'
          ? { saleprice: -1 }
          : Sort === 'rating'
            ? { rateAvg: -1 }
            : { createdAt: -1 };
    const products = await this.ProductRepo.findDocuments(
      { CategoryId: category._id, BrandId: brand._id, isActive: true },
      {
        descripation: 0,
        productImgs: { $slice: 1 },
      },
      { skip: offset, limit: limit, sort },
    );
    const total = await this.ProductRepo.countDocuments({
      categoryId: categoryId,
      BrandId: brandId,
      isActive: true,
    });
    const result = {
      message: 'products',
      data: { products },
      meta: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    };
    await redis.set(cacheKey, JSON.stringify(result), 'EX', 60 * 10);
    return result;
  };
  searchProducts = async (search: SearchDto, page: number) => {
    const limit = 15;
    const offset = (page - 1) * limit;
    let deActiveCategories: Types.ObjectId[] | string[] = await redis.smembers(
      'DeActive_categories',
    );
    deActiveCategories = Array.from(deActiveCategories).map(
      (id) => new Types.ObjectId(id),
    );
    let deActiveBrands: Types.ObjectId[] | string[] =
      await redis.smembers('deActive_brands');
    deActiveBrands = Array.from(deActiveBrands).map(
      (id) => new Types.ObjectId(id),
    );
    const Products = await this.ProductRepo.findDocuments(
      {
        $text: { $search: search.search },
        isActive: true,
        CategoryId: { $nin: deActiveCategories },
        BrandId: { $nin: deActiveBrands },
      },
      { productImgs: { $slice: 1 } },
      { limit: limit, skip: offset, sort: { createdAt: -1 } },
    );
    const total = await this.ProductRepo.countDocuments({
      isActive: true,
      $text: { $search: search.search },
      CategoryId: { $nin: deActiveCategories },
      BrandId: { $nin: deActiveBrands },
    });
    return {
      message: 'all searched products details',
      data: { Products },
      meta: {
        total: total,
        pages: Math.ceil(total / limit),
      },
    };
  };
  uploadImgs = async () => {
    const urls = await this.s3Services.upload_files(6, 'products');
    return { message: 'urls generated ', data: { urls } };
  };
  addProduct = async (Dto: addProductDto) => {
    const category = await this.categoryRepo.findOneDocument({
      _id: Dto.CategoryId,
      DeActive: true,
    });
    if (category)
      throw new NotFoundException("catgeory not found or it's  deActive");
    const Brand = await this.brandRepo.findByIdDocument(Dto.BrandId);
    if (!Brand) throw new NotFoundException(`brand not found`);
    const Imgs = Array.from(new Set(Dto.productImgs));
    const { allUploaded } = await this.s3Services.verifyUploads(Imgs);
    if (!allUploaded) throw new BadRequestException('files not uploaded');
    const created = await this.ProductRepo.createDocument({
      ...Dto,
      productImgs: Imgs,
    });
    if (created) {
      await this.categoryRepo.updateDocument(
        { _id: Dto.CategoryId },
        { $inc: { ProductsNumber: 1 } },
      );
      return { message: `product added successfully`, data: { created } };
    }
  };
  updateProduct = async (Dto: UpdateProductDto, productId: Types.ObjectId) => {
    const product = await this.ProductRepo.findByIdDocument(productId);
    if (!product) throw new NotFoundException(`product not found`);
    if (Dto.stock)
      this.realTimeGateway.changeProductStock([
        { productId: productId, newStock: Dto.stock },
      ]);
    if (!Dto.CategoryId && !Dto.BrandId) {
      const updated = await this.ProductRepo.findAndUpdateDocument(productId, {
        ...Dto,
      });
      if (updated) return { message: `product updated`, data: updated };
    }
    if (Dto.CategoryId || Dto.BrandId) {
      if (Dto.CategoryId) {
        let category = await this.categoryRepo.findByIdDocument(Dto.CategoryId);
        if (!category) throw new NotFoundException(`category not found`);
        await this.categoryRepo.updateDocument(
          { _id: product.CategoryId },
          { $inc: { ProductsNumber: -1 } },
        );
      }
      if (Dto.BrandId) {
        const brand = await this.brandRepo.findByIdDocument(Dto.BrandId);
        if (!brand) throw new NotFoundException(`brand not found`);
      }
      const updated = await this.ProductRepo.findAndUpdateDocument(productId, {
        ...Dto,
      });
      await this.categoryRepo.updateDocument(
        { _id: Dto.CategoryId },
        { $inc: { ProductsNumber: 1 } },
      );
      return { message: `product updated`, data: { updated } };
    }
  };
  updateAttachment = async (
    Dto: updateAttachmentDTo,
    productId: Types.ObjectId,
  ) => {
    const product = await this.ProductRepo.findByIdDocument(productId);
    if (!product) throw new NotFoundException(`product not found`);
    const productImgs = new Set(product.productImgs ?? []);
    let updated;
    if (Dto.addedImgs.length) {
      const Imgs = Array.from(new Set<string>(Dto.addedImgs));
      const { allUploaded } = await this.s3Services.verifyUploads(Imgs);
      if (!allUploaded) {
        throw new BadRequestException('no all files uploaded');
      }
      if (allUploaded) {
        Dto.addedImgs.forEach((key) => productImgs.add(key));
      }
    }
    if (Dto.removedImgs.length) {
      const removedImgsSet = new Set<string>(Dto.removedImgs);
      const imgsToRemove = [...removedImgsSet].filter((img) =>
        productImgs.has(img),
      );
      if (imgsToRemove.length > 0) {
        await this.s3Services.deleteBUlk(imgsToRemove);
        imgsToRemove.forEach((key) => productImgs.delete(key));
      }
      updated = await this.ProductRepo.updateDocument(
        { _id: productId },
        { $set: { productImgs: [...productImgs] } },
      );
    }
    return { message: 'product Images updated', data: { updated } };
  };
  deActiveProduct = async (productId: Types.ObjectId) => {
    const product = await this.ProductRepo.findOneDocument({
      _id: productId,
      isActive: true,
    });
    if (!product)
      throw new NotFoundException("product not found or it's already deActive");
    const deActive = await this.ProductRepo.updateDocument(
      { _id: productId },
      { isActive: false },
    );
    if (!deActive) {
      throw new BadRequestException(`product not dective`);
    }
    return { message: `product deActived seccussfully`, product: deActive };
  };
  deActiveProducts = async (page: number) => {
    const limit = 10;
    const offset = (page - 1) * limit;
    const products = await this.ProductRepo.findDocuments(
      {
        isActive: false,
      },
      {},
      { skip: offset, limit: limit },
    );
    if (!products.length) throw new NotFoundException('no products deactive');
    const total = await this.ProductRepo.countDocuments({
      isActive: false,
    });
    return {
      message: 'deActive products',
      data: { products },
      meta: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    };
  };
  ActiveProduct = async (productId: Types.ObjectId) => {
    const product = await this.ProductRepo.findOneDocument({
      _id: productId,
      isActive: false,
    });
    if (!product)
      throw new NotFoundException("product not found or it's already active");
    const Active = await this.ProductRepo.updateDocument(
      { _id: productId },
      { isActive: true },
    );
    if (!Active) {
      throw new BadRequestException(`product not Active`);
    }
    return { message: `product Actived seccussfully`, product: Active };
  };
  deleteProduct = async (productId: Types.ObjectId) => {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const deleted = await this.ProductRepo.findByIdAndDeleteDocument(
        productId,
        { session },
      );
      await this.cartRepo.updateManyDocuments(
        {},
        { $pull: { products: { productId } } },
        { session },
      );
      await this.wishlistRepo.updateManyDocuments(
        {},
        { $pull: { products: productId } },
        { session },
      );
      await this.reviewRepo.deleteManyDocuments(
        { productId: productId },
        { session },
      );
      await this.categoryRepo.updateDocument(
        { _id: deleted?.CategoryId },
        { $inc: { ProductsNumber: -1 } },
      );
      await session.commitTransaction();
      await session.endSession();
      if (deleted) await this.s3Services.deleteBUlk(deleted.productImgs);
      return { message: `product deleted`, deleted };
    } catch {
      await session.abortTransaction();
      session.endSession();
      throw new BadRequestException('something wrong');
    }
  };
}
