import { FullProductEntity } from "../Entities/Products";
import IProductRepository from "./IProductRepository";

export default class ProductRepository implements IProductRepository {
  List(restaurant_id: number): Promise<FullProductEntity[]> {
    throw new Error("Method not implemented.");
  }
  Create(product: FullProductEntity): Promise<void> {
    throw new Error("Method not implemented.");
  }
  Update(product: FullProductEntity): Promise<void> {
    throw new Error("Method not implemented.");
  }
  Delete(id: number): Promise<void> {
    throw new Error("Method not implemented.");
  }
}