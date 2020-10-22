import IProductRepository from "./IProductRepository";
import Database from "../database/Database";
import { FullProductEntity, ProductEntity, FullPromotionEntity, PromotionEntity, PromotionDayEntity } from "../../Entities/Products";

import { ParseError } from "../utils";
import RepositoryException from "../RepositoryException";

export default class ProductRepository implements IProductRepository {
  constructor(
    private db: Database
  ) {}

  private parseProductToDB(product: FullProductEntity): ProductEntity {
    const { restaurant_id, photo_url, name, price, category } = product;
    return { restaurant_id, photo_url, name, price, category };
  }

  private parsePromotionToDB(promotion: FullPromotionEntity, product_id: number): PromotionEntity {
    const { description, price } = promotion;
    return { product_id, description, price };
  }

  private parseHoursToDB(hours: PromotionDayEntity[], promotion_id: number): PromotionDayEntity[] {
    return hours.map(hour => ({
      ...hour,
      promotion_id
    }))
  }

  private throwNotFoundError() {
    throw new RepositoryException(400, 'Product was not found');
  }

  async List(restaurant_id: number): Promise<FullProductEntity[]> {
    try {
      const products: FullProductEntity[] = await this.db.knex('products').where({ restaurant_id });
      const promotions: FullPromotionEntity[] = await this.db.knex('promotions')
        .whereIn('product_id', products.map(product => product.id as number));
      const promotionDays: PromotionDayEntity[] = await this.db.knex('promotion_days')
        .whereIn('promotion_id', promotions.map(promotion => promotion.id as number));

      return products.map(product => ({
        ...product,
        promotions: promotions.filter(promotion => promotion.product_id === product.id).map(promotion => ({
          ...promotion,
          hours: promotionDays.filter(promotionDay => promotionDay.promotion_id === promotion.id)
        }))
      }))

    } catch (error) {
      throw ParseError(error, 'Error on list products');
    }
  }

  async Create(product: FullProductEntity): Promise<void> {
    const trx = await this.db.knex.transaction();

    try {
      const [product_id] = await trx('products').insert(this.parseProductToDB(product));
      for (const promotion of product.promotions) {
        const [promotion_id] = await trx('promotions').insert(this.parsePromotionToDB(promotion, product_id));
        await trx('promotion_days').insert(this.parseHoursToDB(promotion.hours, promotion_id));
      }

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw ParseError(error, 'Error on create product');
    }
  }
  
  async Update(product: FullProductEntity): Promise<void> {
    const trx = await this.db.knex.transaction();

    try {
      const numberUpdated = await trx('products').where({ id: product.id })
        .update(this.parseProductToDB(product));
      if (numberUpdated === 0)
        this.throwNotFoundError();

      // Delete promotions
      const promotions = await trx('promotions').where('product_id', product.id);
      await trx('promotion_days').whereIn('promotion_id', promotions.map(promotion => promotion.id)).del();
      await trx('promotions').where('product_id', product.id).del();

      // Recreate promotions
      for (const promotion of product.promotions) {
        const [promotion_id] = await trx('promotions').insert(this.parsePromotionToDB(promotion, product.id as number));
        await trx('promotion_days').insert(this.parseHoursToDB(promotion.hours, promotion_id));
      }

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw ParseError(error, 'Error on update product');
    }
  }

  async Delete(id: number): Promise<void> {
    const trx = await this.db.knex.transaction();

    try {
      // Delete promotions
      const promotions = await trx('promotions').where('product_id', id);
      await trx('promotion_days').whereIn('promotion_id', promotions.map(promotion => promotion.id)).del();
      await trx('promotions').where('product_id', id).del();

      const numberDeleted = await trx('products').where('id', id).del();
      if (numberDeleted === 0)
        this.throwNotFoundError();

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw ParseError(error, 'Error on delete product');
    }
  }
}