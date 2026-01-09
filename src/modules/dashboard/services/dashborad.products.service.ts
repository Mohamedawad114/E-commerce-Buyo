import { Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { Category_Repo, productRepo, redis } from 'src/common';

@Injectable()
export class Dashboard_product_services {
  constructor(
    private readonly productRepo: productRepo,
    private readonly categoryRepo: Category_Repo,
  ) {}

  topSelling_products = async (page: number) => {
    const limit = 20;
    const offset = (page - 1) * limit;
    const cacheKey = `top:products-selling:p:${page}`;
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return {
        ...JSON.parse(cachedData),
        meta: { ...JSON.parse(cachedData).meta, source: 'cache' },
      };
    }

    const [topSelling, count] = await Promise.all([
      this.productRepo.findDocuments(
        { sold: { $gte: 5 } },
        {
          name: 1,
          slug: 1,
          productImgs: { $slice: 2 },
          rateAvg: 1,
          _id: 1,
          sold: 1,
          reviewsNumber: 1,
        },
        { skip: offset, limit, sort: { sold: -1 } },
      ),
      this.productRepo.countDocuments({ sold: { $gte: 5 } }),
    ]);

    const result = {
      message: 'top selling',
      data: { topSelling },
      meta: {
        count,
        pages: Math.ceil(count / limit),
        currentPage: page,
      },
    };
    await redis.set(cacheKey, JSON.stringify(result), 'EX', 60 * 60 * 12);

    return { ...result, meta: { ...result.meta, source: 'database' } };
  };
  topRating_products = async (page: number) => {
    const limit = 20;
    const offset = (page - 1) * limit;
    const cacheKey = `top:products-rating:p:${page}`;
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return {
        ...JSON.parse(cachedData),
        meta: { ...JSON.parse(cachedData).meta, source: 'cache' },
      };
    }
    const [products, count] = await Promise.all([
      this.productRepo.findDocuments(
        { rateAvg: { $gte: 3 } },
        {
          name: 1,
          slug: 1,
          productImgs: { $slice: 2 },
          rateAvg: 1,
          _id: 1,
          sold: 1,
          reviewsNumber: 1,
        },
        { skip: offset, limit, sort: { rateAvg: 1 } },
      ),
      this.productRepo.countDocuments({ rateAvg: { $gte: 3 } }),
    ]);

    const result = {
      message: 'top Rating',
      data: { products },
      meta: {
        count,
        pages: Math.ceil(count / limit),
        currentPage: page,
      },
    };
    await redis.set(cacheKey, JSON.stringify(result), 'EX', 60 * 60 * 12);
    return { ...result, meta: { ...result.meta, source: 'database' } };
  };
  topRating_products_forCategory = async (
    categoryId: Types.ObjectId,
    page: number,
  ) => {
    const limit = 20;
    const offset = (page - 1) * limit;
    const category = await this.categoryRepo.findByIdDocument(categoryId);
    if (!category) throw new NotFoundException(`category not found`);
    const topRating_products = await redis.get(
      `top:category:${categoryId}:rating:p:${page}`,
    );
    if (topRating_products) {
      return {
        data: { products: JSON.parse(topRating_products) },
        meta: { source: 'cache' },
      };
    }
    const [products, count] = await Promise.all([
      this.productRepo.findDocuments(
        { CategoryId: new Types.ObjectId(categoryId), rateAvg: { $gte: 3 } },
        {
          name: 1,
          slug: 1,
          productImgs: { $slice: 2 },
          rateAvg: 1,
          _id: 1,
          sold: 1,
          reviewsNumber: 1,
        },
        { skip: offset, limit, sort: { rateAvg: -1 } },
      ),
      this.productRepo.countDocuments({
        CategoryId: new Types.ObjectId(categoryId),
        rateAvg: { $gte: 3 },
      }),
    ]);

    const Response = {
      message: 'top Rating',
      data: { products },
      meta: {
        count,
        pages: Math.ceil(count / limit),
        currentPage: page,
        source: 'cache',
      },
    };
    await redis.set(
      `top:category:${categoryId}:rating:p:${page}`,
      JSON.stringify(Response),
      'EX',
      60 * 60 * 12,
    );

    return {
      ...Response,
      meta: { ...Response.meta, source: 'database' },
    };
  };

  topselling_products_forCategory = async (
    categoryId: Types.ObjectId,
    page: number,
  ) => {
    const limit = 20;
    const offset = (page - 1) * limit;
    const category = await this.categoryRepo.findByIdDocument(categoryId);
    if (!category) throw new NotFoundException(`category not found`);
    const topselling_products = await redis.get(
      `top:category:${categoryId}:selling:${page}`,
    );
    if (topselling_products) {
      return {
        data: { products: JSON.parse(topselling_products) },
        meta: { source: 'cache' },
      };
    }
    const [products, count] = await Promise.all([
      this.productRepo.findDocuments(
        { CategoryId: new Types.ObjectId(categoryId), sold: { $gte: 5 } },
        {
          name: 1,
          slug: 1,
          productImgs: { $slice: 2 },
          rateAvg: 1,
          _id: 1,
          sold: 1,
        },
        { skip: offset, limit, sort: { sold: -1 } },
      ),
      this.productRepo.countDocuments({
        CategoryId: new Types.ObjectId(categoryId),
        sold: { $gte: 5 },
      }),
    ]);
    const Response = {
      message: 'top selling',
      data: { products },
      meta: {
        count,
        pages: Math.ceil(count / limit),
        currentPage: page,
        source: 'cache',
      },
    };
    await redis.set(
      `top:category:${categoryId}:selling:${page}`,
      JSON.stringify(products),
      'EX',
      60 * 60 * 12,
    );
    return {
      data: { ...Response.data },
      meta: { ...Response.meta, source: 'database' },
    };
  };
  lowStock_alert = async (page: number) => {
    const limit = 10;
    const offset = (page - 1) * limit;
    const [products, count] = await Promise.all([
      this.productRepo.findDocuments(
        { stock: { $lte: 5, $gt: 0 } },
        { name: 1, stock: 1, _id: 1, productImgs: { $slice: 1 } },
        { skip: offset, limit, sort: { stock: 1 } },
      ),
      this.productRepo.countDocuments({ stock: { $lte: 5, $gt: 0 } }),
    ]);

    return {
      message: 'Low stock products',
      data: { products },
      meta: { count, pages: Math.ceil(count / limit) },
    };
  };
}
