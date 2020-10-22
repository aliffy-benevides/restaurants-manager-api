import { FullProductEntity } from "./Products";

export interface RestaurantEntity {
  id?: number;
  photo_url: string;
  name: string;
  address: string;
}

export interface RestaurantDayEntity {
  id?: number;
  restaurant_id?: number;
  day: number;
  start: string;
  end: string;
}

export interface FullRestaurantEntity extends RestaurantEntity {
  hours: RestaurantDayEntity[];
  products?: FullProductEntity[];
}