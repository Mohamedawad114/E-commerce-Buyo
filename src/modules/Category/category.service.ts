import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { categoryIdDto, CreateCategoryDto, updateCategoryDto } from './Dto';
import {
  Brand_Repo,
  Category_Repo,
  IUser,
  redis,
  s3_services,
  Sys_Role,
} from 'src/common';
import { Types } from 'mongoose';
import { searchDto } from '../Brand/Dto';

@Injectable()
export class Category_Services {
  constructor(
    private readonly CategoryRepo: Category_Repo,
    private readonly s3Services: s3_services,
    private readonly brandRepo: Brand_Repo,
  ) {}
  uploadImg = async () => {
    const { Key, url } = await this.s3Services.upload_file('categories/logos');
    return { message: 'upload url generated', data: { Key, url } };
  };
  addCategory = async (Dto: CreateCategoryDto) => {
    const IsDublicated = await this.CategoryRepo.findOneDocument({
      name: Dto.name,
    });
    if (IsDublicated) throw new ConflictException('category name is exist');
    let brands: Types.ObjectId[] = [];
    if (Dto.BrandIds?.length) {
      const uniqueBrandIds = Array.from(
        new Set(Dto.BrandIds.map((id) => id.toString())),
      );
      brands = uniqueBrandIds.map((id) => new Types.ObjectId(id));
    }
    if (brands.length) {
      const count = await this.brandRepo.countDocuments({
        _id: { $in: brands },
      });
      if (count !== brands.length)
        throw new BadRequestException('some brands not found');
    }
    const created = await this.CategoryRepo.createDocument({
      ...Dto,
      BrandIds: brands,
    });
    const keys = await redis.keys(`products:cat=${created._id}:brand=*`);
    if (keys.length > 0) await redis.del(...keys);
    return {
      message: `category added seccussfully`,
      data: { created },
    };
  };
  getCategory = async (Dto: categoryIdDto, user: IUser) => {
    if (await redis.sismember('DeActive_categories', Dto.CategoryId.toString()))
      throw new NotFoundException(`category is deActive`);
    const category = await this.CategoryRepo.findOneDocument({
      _id: Dto.CategoryId,
    });
    if (!category) throw new NotFoundException(`category not found`);
    if (category.DeActive && user.role === Sys_Role.user)
      throw new NotFoundException(`category DeActive`);
    return { message: 'category found', data: { category } };
  };
  updateCategory = async (
    Dto: updateCategoryDto,
    CategoryId: Types.ObjectId,
  ) => {
    const category = await this.CategoryRepo.findOneDocument({
      _id: CategoryId,
    });
    if (!category) throw new NotFoundException('category not found');
    if (Dto.CategoryImg) {
      const { uploaded } = await this.s3Services.verifyUpload(Dto.CategoryImg);
      if (!uploaded) throw new BadRequestException('file not uploaded');
      await this.s3Services.deleteFile(category.CategoryImg);
    }
    if (Dto.name) {
      const IsDublicated = await this.CategoryRepo.findOneDocument({
        name: Dto.name,
        _id: { $ne: category._id },
      });
      if (IsDublicated) throw new ConflictException('category name is exist');
    }
    const brandSet = new Set(
      (category.BrandIds ?? []).map((id) => id.toString()),
    );
    if (Dto.BrandIds?.length) {
      Dto.BrandIds.forEach((id) => brandSet.add(id.toString()));
    }
    if (Dto.removedBrandIds?.length) {
      Dto.removedBrandIds.forEach((id) => brandSet.delete(id.toString()));
    }
    const brands = Array.from(brandSet).map((id) => new Types.ObjectId(id));
    if (brands.length) {
      const count = await this.brandRepo.countDocuments({
        _id: { $in: brands },
      });
      if (count !== brands.length) {
        throw new BadRequestException('some brands not found');
      }
    }
    const updated = await this.CategoryRepo.findAndUpdateDocument(CategoryId, {
      ...Dto,
      BrandIds: brands,
    });
    if (!updated) throw new BadRequestException('category not updated');
    const keys = await redis.keys(`products:cat=${category._id}:brand=*`);
    if (keys.length > 0) await redis.del(...keys);
    return {
      message: 'category updated successfully',
      data: { updated },
    };
  };

  searchCategories = async (page: number, search: searchDto) => {
    console.log(search.search);
    const limit = 10;
    const offset = (page - 1) * limit;
    const Categories = await this.CategoryRepo.findDocuments(
      {
        $text: { $search: search.search },
        DeActive: false,
      },
      {},
      { limit: limit, skip: offset, sort: { createdAt: -1 } },
    );
    const total = await this.CategoryRepo.countDocuments({
      $text: { $search: search.search },
      DeActive: false,
    });
    return {
      message: 'all searched Category details',
      data: { Categories },
      meta: {
        total: total,
        pages: Math.ceil(total / limit),
      },
    };
  };

  allCategories = async (page: number) => {
    const limit = 5;
    const offset = (page - 1) * limit;
    const categories = await this.CategoryRepo.findDocuments(
      { DeActive: false },
      {},
      { skip: offset, limit, sort: { createdAt: -1 } },
    );
    const total = await this.CategoryRepo.countDocuments({ DeActive: false });
    return {
      message: 'all Categories',
      data: { categories },
      meta: {
        pagination: {
          total,
          pages: Math.ceil(total / limit),
        },
      },
    };
  };
  allDeActiceCategories = async (page: number) => {
    const limit = 5;
    const offset = (page - 1) * limit;
    const categories = await this.CategoryRepo.findDocuments(
      { DeActive: true },
      {},
      { skip: offset, limit, sort: { createdAt: -1 } },
    );
    const total = await redis.scard('DeActive_categories');
    return {
      message: 'all deActive Categories',
      data: { categories },
      meta: {
        pagination: {
          total,
          pages: Math.ceil(total / limit),
        },
      },
    };
  };
  deActiveCategory = async (CategoryId: Types.ObjectId) => {
    const category = await this.CategoryRepo.findOneDocument({
      _id: CategoryId,
      DeActive: false,
    });
    if (!category)
      throw new NotFoundException(
        "catgeory not found or it's already deActive",
      );
    const deActive = await this.CategoryRepo.updateDocument(
      { _id: CategoryId },
      { DeActive: true },
    );
    if (!deActive) {
      throw new BadRequestException(`category not dective`);
    }
    await redis.sadd('DeActive_categories', category._id.toString());
    const keys = await redis.keys(`products:cat=${category._id}:brand=*`);
    if (keys.length > 0) await redis.del(...keys);
    return { message: `category deActived seccussfully`, category: deActive };
  };
  ActiveCategory = async (CategoryId: Types.ObjectId) => {
    const category = await this.CategoryRepo.findOneDocument({
      _id: CategoryId,
      DeActive: true,
    });
    if (!category)
      throw new NotFoundException("catgeory not found or it's already active");
    const Active = await this.CategoryRepo.updateDocument(
      { _id: CategoryId },
      { DeActive: false },
    );
    if (!Active) {
      throw new BadRequestException(`category not Active`);
    }
    await redis.srem('DeActive_categories', category._id.toString());
    return { message: `category Actived seccussfully`, category: Active };
  };

  deleteCategory = async (CategoryId: Types.ObjectId) => {
    const category = await this.CategoryRepo.findOneDocument({
      _id: CategoryId,
    });
    if (!category) throw new NotFoundException('catgeory not found');
    if (category.ProductsNumber > 0)
      throw new BadRequestException("can't delete category");
    const deleted = await this.CategoryRepo.deleteDocument({
      _id: CategoryId,
    });
    if (!deleted) {
      throw new BadRequestException(`category not deleted`);
    }
    return { message: `category deleted seccussfully`, category: deleted };
  };
}
