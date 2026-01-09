import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Brand_Repo, IUser, redis, s3_services, Sys_Role } from 'src/common';
import { createBrandDto, searchDto, updateBrandDto } from './Dto';
import { Types } from 'mongoose';
@Injectable()
export class BrandSerivces {
  constructor(
    private readonly BrandRepo: Brand_Repo,
    private readonly s3Services: s3_services,
  ) {}

  getBrand = async (BrandId: Types.ObjectId, user: IUser) => {
    if (!BrandId) throw new BadRequestException('BrandID is required');
    const Brand = await this.BrandRepo.findByIdDocument(BrandId);
    if (!Brand) throw new NotFoundException('brand not found');
    if (Brand.DeActive && user.role == Sys_Role.user)
      throw new NotFoundException('brand not active');
    return { message: 'Brand details', data: { Brand } };
  };
  getAllBrands = async (page: number) => {
    const limit = 10;
    const offset = (page - 1) * limit;
    const Brands = await this.BrandRepo.findDocuments(
      { DeActive: false },
      {},
      { limit: limit, skip: offset, sort: { createdAt: -1 } },
    );
    const total = await this.BrandRepo.countDocuments({ DeActive: false });
    return {
      message: 'all Brand details',
      data: { Brands },
      meta: {
        total: total,
        pages: Math.ceil(total / limit),
      },
    };
  };
  searchBrands = async (page: number, search: searchDto) => {
    const limit = 10;
    const offset = (page - 1) * limit;
    const Brands = await this.BrandRepo.findDocuments(
      {
        $text: { $search: search.search },
        DeActive: false,
      },
      {},
      { limit: limit, skip: offset, sort: { createdAt: 1 } },
    );
    const total = await this.BrandRepo.countDocuments({
      DeActive: false,
      $text: { $search: search.search },
    });
    
    return {
      message: 'all searched Brand details',
      data: { Brands },
      meta: {
        total: total,
        pages: Math.ceil(total / limit),
      },
    };
  };
  allDeActiceBrands = async (page: number) => {
    const limit = 5;
    const offset = (page - 1) * limit;
    const brands = await this.BrandRepo.findDocuments(
      { DeActive: true },
      {},
      { skip: offset, limit, sort: { createdAt: -1 } },
    );
    const total = await redis.scard('deActive_brands');
    return {
      message: 'all deActive brands',
      data: { brands },
      meta: {
        pagination: {
          total,
          pages: Math.ceil(total / limit),
        },
      },
    };
  };
  uploadLogo = async () => {
    const { Key, url } = await this.s3Services.upload_file('Brands/logos');
    return { message: 'upload url generated', data: { Key, url } };
  };
  createBrand = async (
    Dto: createBrandDto,
    userId: Types.ObjectId | string,
  ) => {
    const { uploaded } = await this.s3Services.verifyUpload(Dto.logo);
    if (!uploaded) throw new BadRequestException('logo not uploaded');
    if (!userId) throw new BadRequestException('userId is rquired');
    const isDuplicated = await this.BrandRepo.findOneDocument({
      name: Dto.name,
    });
    if (isDuplicated) throw new ConflictException('name is already exited');
    const created = await this.BrandRepo.createDocument({
      name: Dto.name,
      Slogan: Dto.slogan,
      logo: Dto.logo,
      createdBy: userId,
    });
    if (!created) {
      await this.s3Services.deleteFile(Dto.logo);
      throw new BadRequestException('something wrong');
    }
    const keys = await redis.keys(`products:cat=*:brand=${created._id}:*`);
    if (keys.length > 0) await redis.del(...keys);
    return { message: ` Brand created`, data: { Brand: created } };
  };
  updateBrand = async (Dto: updateBrandDto, BrandId: Types.ObjectId) => {
    if (!BrandId) throw new BadRequestException('BrandId is required');
    const Brand = await this.BrandRepo.findByIdDocument(BrandId);
    if (!Brand) throw new NotFoundException('Brand not found');
    if (Dto.name) {
      const isDuplicated = await this.BrandRepo.findOneDocument({
        name: Dto.name,
        _id: { $ne: BrandId },
      });
      if (isDuplicated) throw new ConflictException('name is already exited');
    }
    if (Dto.logo) {
      const { uploaded } = await this.s3Services.verifyUpload(Dto.logo);
      if (!uploaded) throw new BadRequestException('logo not uploaded');
      await this.s3Services.deleteFile(Brand.logo);
    }
    const updated = await this.BrandRepo.findAndUpdateDocument(BrandId, {
      name: Dto.name,
      Slogan: Dto.slogan,
      logo: Dto.logo,
    });
    const keys = await redis.keys(`products:cat=*:brand=${Brand._id}:*`);
    if (keys.length > 0) await redis.del(...keys);
    return { message: ` Brand updated`, data: { Brand: updated } };
  };
  deActiveBrand = async (brandId: Types.ObjectId) => {
    const brand = await this.BrandRepo.findOneDocument({
      _id: brandId,
      DeActive: false,
    });
    if (!brand)
      throw new NotFoundException("brand not found or it's already deActive");
    const deActive = await this.BrandRepo.updateDocument(
      { _id: brandId },
      { DeActive: true },
    );
    if (!deActive) {
      throw new BadRequestException(`brand not deActive`);
    }
    await redis.sadd('deActive_brands', brand._id.toString());
    const keys = await redis.keys(`products:cat=*:brand=${brand._id}:*`);
    if (keys.length > 0) await redis.del(...keys);
    return { message: `brand deActived seccussfully`, brand: deActive };
  };
  ActiveBrand = async (brandId: Types.ObjectId) => {
    const brand = await this.BrandRepo.findOneDocument({
      _id: brandId,
      DeActive: true,
    });
    if (!brand)
      throw new NotFoundException("brand not found or it's already active");
    const Active = await this.BrandRepo.updateDocument(
      { _id: brandId },
      { DeActive: false },
    );
    if (!Active) {
      throw new BadRequestException(`brand not Active`);
    }
    await redis.srem('deActive_brands', brand._id.toString());
    return { message: `brand Actived seccussfully`, brand: Active };
  };
}
