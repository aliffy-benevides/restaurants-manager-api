import { FullProductEntity } from "../Entities/Products";

export default interface IProductRepository {
  List(restaurant_id: number): Promise<FullProductEntity[]>;
  Create(product: FullProductEntity): Promise<void>;
  Update(product: FullProductEntity): Promise<void>;
  Delete(id: number): Promise<void>;
}