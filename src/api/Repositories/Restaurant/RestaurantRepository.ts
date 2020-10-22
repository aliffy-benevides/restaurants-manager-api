import IRestaurantRepository from './IRestaurantRepository';
import Database from '../database/Database';
import { RestaurantEntity, FullRestaurantEntity, RestaurantDayEntity } from '../../Entities/Restaurants';

import RepositoryException from '../RepositoryException';
import { ParseError } from '../utils';

export default class RestaurantRepository implements IRestaurantRepository {
  constructor(
    private db: Database
  ) {}

  private parseHoursToDB(hours: RestaurantDayEntity[], restaurant_id: number): RestaurantDayEntity[] {
    return hours.map(hour => ({
      ...hour,
      restaurant_id
    }))
  }

  private parseRestaurantToDB(restaurant: FullRestaurantEntity): RestaurantEntity {
    return {
      photo_url: restaurant.photo_url,
      name: restaurant.name,
      address: restaurant.address
    }
  }

  private throwNotFoundError() {
    throw new RepositoryException(400, 'Restaurant was not found');
  }

  List(): Promise<RestaurantEntity[]> {
    try {
      return this.db.knex('restaurants');
    } catch (error) {
      throw ParseError(error, 'Error on create restaurant')      
    }
  }

  async Show(id: number): Promise<FullRestaurantEntity> {
    try {
      const restaurant: RestaurantEntity = await this.db.knex('restaurants').where('id', id).first();
      if (!restaurant)
        this.throwNotFoundError();

      const hours: RestaurantDayEntity[] = await this.db.knex('restaurant_days').where('restaurant_id', id);

      return {
        ...restaurant,
        hours
      }
    } catch (error) {
      throw ParseError(error, 'Error on show restaurant');
    }
  }

  async Create(restaurant: FullRestaurantEntity): Promise<void> {
    const trx = await this.db.knex.transaction();

    try {
      const [id] = await trx('restaurants').insert(this.parseRestaurantToDB(restaurant));
      await trx('restaurant_days').insert(this.parseHoursToDB(restaurant.hours, id));
  
      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw ParseError(error, 'Error on create restaurant');
    }
  }

  async Update(restaurant: FullRestaurantEntity): Promise<void> {
    const trx = await this.db.knex.transaction();

    try {
      const numberUpdated = await trx('restaurants').where({ id: restaurant.id })
        .update(this.parseRestaurantToDB(restaurant));
      if (numberUpdated === 0)
        this.throwNotFoundError();

      // update working hours
      await trx('restaurant_days').where({ restaurant_id: restaurant.id }).del();
      await trx('restaurant_days').insert(this.parseHoursToDB(restaurant.hours, restaurant.id as number));

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw ParseError(error, 'Error on update restaurant');
    }
  }

  async Delete(id: number): Promise<void> {
    const trx = await this.db.knex.transaction();

    try {
      const numberDeleted = await trx('restaurants')
        .where({ id })
        .del();

      if (numberDeleted === 0)
        this.throwNotFoundError();

      await trx('restaurant_days').where({ restaurant_id: id }).del();

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw ParseError(error, 'Error on delete restaurant')      
    }
  }
}