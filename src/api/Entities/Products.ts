export interface ProductEntity {
  id?: number;
  restaurant_id: number;
  photo_url: string;
  name: string;
  price: number;
  category: string;
}

export interface PromotionEntity {
  id?: number;
  product_id?: number;
  description: string;
  price: number;
}

export interface PromotionDayEntity {
  id?: number;
  promotion_id?: number;
  day: number;
  start: string;
  end: string;
}

interface FullPromotionEntity extends PromotionEntity {
  hours: PromotionDayEntity[];
}

export interface FullProductEntity extends ProductEntity {
  promotions: FullPromotionEntity[]
}