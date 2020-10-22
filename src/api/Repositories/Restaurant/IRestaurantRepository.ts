import { FullRestaurantEntity, RestaurantEntity } from "../../Entities/Restaurants";

export default interface IRestaurantRepository {
  List(): Promise<RestaurantEntity[]>;
  Show(id: number): Promise<FullRestaurantEntity>;
  Create(restaurant: FullRestaurantEntity): Promise<void>;
  Update(restaurant: FullRestaurantEntity): Promise<void>;
  Delete(id: number): Promise<void>;
}