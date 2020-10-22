import { RestaurantEntity, FullRestaurantEntity } from '../Entities/Restaurants';
import IRestaurantRepository from './IRestaurantRepository';

export default class RestaurantRepository implements IRestaurantRepository {
  List(): Promise<RestaurantEntity[]> {
    throw new Error('Method not implemented.');
  }
  Show(id: number): Promise<FullRestaurantEntity> {
    throw new Error('Method not implemented.');
  }
  Create(restaurant: FullRestaurantEntity): Promise<void> {
    throw new Error('Method not implemented.');
  }
  Update(restaurant: FullRestaurantEntity): Promise<void> {
    throw new Error('Method not implemented.');
  }
  Delete(id: number): Promise<void> {
    throw new Error('Method not implemented.');
  }
}