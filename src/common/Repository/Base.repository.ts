import mongoose, {
  ClientSession,
  FilterQuery,
  Model,
  ProjectionType,
  QueryOptions,
  UpdateQuery,
  UpdateWriteOpResult,
} from 'mongoose';

export abstract class BaseRepository<T> {
  constructor(private model: Model<T>) {}  async createDocument(
    document: Partial<T>,
    options?: { session?: ClientSession },
  ): Promise<T> {
    const [created] = await this.model.create([document], options);
    return created;
  }
  
  async findDocuments(
    filter?: FilterQuery<T>,
    projection?: ProjectionType<T>,
    options?: QueryOptions<T>,
  ): Promise<T[] | []> {
    return this.model.find(filter ?? {}, projection, options).lean() as Promise<
      T[]
    >;
  }
  async findOneDocument(
    filter: FilterQuery<T>,
    projection?: ProjectionType<T>,
    options?: QueryOptions<T>,
  ): Promise<T | null> {
    return this.model.findOne(filter, projection, options);
  }
  async findOneDocumentAndUpdate(
    filter: FilterQuery<T>,
    payload: UpdateQuery<T>,
    options?: QueryOptions<T>,
  ): Promise<T | null> {
    return this.model.findOneAndUpdate(filter, payload, { new: true, ...options});
  }
  async findByIdDocument(
    id: mongoose.Types.ObjectId | string,
    projection?: ProjectionType<T>,
    options?: QueryOptions<T>,
  ): Promise<T | null> {
    return this.model.findById(id, projection, options);
  }
  async findByIdAndDeleteDocument(
    id: mongoose.Types.ObjectId | string,
    options?: QueryOptions<T>,
  ): Promise<T | null> {
    return this.model.findByIdAndDelete(id, options);
  }
  async findAndUpdateDocument(
    id: mongoose.Types.ObjectId | string,
    payload: UpdateQuery<T>,
  ): Promise<T | null> {
    return await this.model.findByIdAndUpdate(id, payload, { new: true });
  }
  async deleteDocument(
    filter: FilterQuery<T>,
    options?: QueryOptions<T>,
  ): Promise<{ deletedCount?: number }> {
    return this.model.deleteOne(filter, options as any);
  }
  async updateDocument(
    filter: FilterQuery<T>,
    payload: UpdateQuery<T>,
    options?: QueryOptions<T>,
  ): Promise<UpdateWriteOpResult> {
    return await this.model.updateOne(filter, payload, options as any);
  }
  async updateManyDocuments(
    filter: FilterQuery<T>,
    payload: UpdateQuery<T>,
    options?: QueryOptions<T>,
  ): Promise<UpdateWriteOpResult> {
    return await this.model.updateMany(filter, payload, options as any);
  }
  async deleteManyDocuments(
    filter: FilterQuery<T>,
    options?: QueryOptions<T>,
  ): Promise<{ deletedCount?: number }> {
    return this.model.deleteMany(filter, options as any);
  }
  async countDocuments(
    filter: FilterQuery<T>,
    options?: QueryOptions<T>,
  ): Promise<number> {
    return this.model.countDocuments(filter, options as any);
  }
}
