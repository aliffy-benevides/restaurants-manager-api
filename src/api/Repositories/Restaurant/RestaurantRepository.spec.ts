import Database from "../database/Database";
import RestaurantRepository from "./RestaurantRepository";
import { FullRestaurantEntity, RestaurantEntity } from "../../Entities/Restaurants";

import RepositoryException from '../RepositoryException';

const db = new Database();
const repository = new RestaurantRepository();

describe('RestaurantRepository', () => {
  beforeAll(() => {
    return db.Teardown();
  });

  beforeEach(() => {
    return db.Setup();
  });

  afterEach(() => {
    return db.Teardown();
  });

  function generateValidRestaurant(): FullRestaurantEntity {
    return {
      photo_url: 'http://photo_url',
      name: 'Restaurant name',
      address: 'Restaurant address',
      hours: [
        { day: 1, start: '08:15', end: '17:45' },
        { day: 2, start: '08:15', end: '17:45' },
        { day: 3, start: '08:15', end: '17:45' },
        { day: 4, start: '08:15', end: '17:45' },
        { day: 5, start: '08:15', end: '17:45' },
        { day: 6, start: '08:15', end: '12:00' }
      ]
    }
  }

  async function initRepositoryWithRestaurants(returnWithIds: boolean = true) {
    let restaurant1 = { ...generateValidRestaurant(), name: 'Restaurant 1' };
    let restaurant2 = { ...generateValidRestaurant(), name: 'Restaurant 2' };

    await repository.Create(restaurant1);
    await repository.Create(restaurant2);

    if (returnWithIds) {
      const restaurants = await repository.List();
      const restaurant1Id = restaurants.find(r => r.name === restaurant1.name)?.id;
      const restaurant2Id = restaurants.find(r => r.name === restaurant2.name)?.id;
      restaurant1 = { ...restaurant1, id: restaurant1Id };
      restaurant2 = { ...restaurant2, id: restaurant2Id };
    }

    return { restaurant1, restaurant2 };
  }

  async function getFullRestaurants(): Promise<FullRestaurantEntity[]> {
    const restaurants = await repository.List();
    return await Promise.all(restaurants.map(r => repository.Show(r.id as number)));
  }

  function convertFullRestaurantToRestaurant(restaurant: FullRestaurantEntity): RestaurantEntity {
    return {
      id: restaurant.id,
      photo_url: restaurant.photo_url,
      name: restaurant.name,
      address: restaurant.address
    }
  }

  describe('When create restaurant', () => {
    test('Should create the restaurant', async () => {
      const initialRestaurants = await repository.List();
      await repository.Create(generateValidRestaurant());
      const actualRestaurants = await getFullRestaurants();

      expect(initialRestaurants.length).toBe(0);
      expect(actualRestaurants.length).toBe(1);
      expect(actualRestaurants[0]).toMatchObject(generateValidRestaurant());
      expect(actualRestaurants[0].id).toBeTruthy();
    })
  })

  describe('When update restaurant', () => {
    describe('and it is a found restaurant', () => {
      test('Should update only the restaurant', async () => {
        const { restaurant1, restaurant2 } = await initRepositoryWithRestaurants();
        const updatedRestaurant: FullRestaurantEntity = { ...restaurant1, photo_url: 'Updated photo url' };

        await repository.Update(updatedRestaurant);
        const actualRestaurants = await getFullRestaurants();

        expect(actualRestaurants.length).toBe(2);
        expect(actualRestaurants).toEqual(expect.arrayContaining([
          updatedRestaurant,
          restaurant2
        ]))
      })
    })

    describe('and it is a not found restaurant', () => {
      test('Should throws a not found exception', async () => {
        const updatedRestaurant: FullRestaurantEntity = { ...generateValidRestaurant(), id: 1 };

        expect(repository.Update(updatedRestaurant))
          .rejects
          .toEqual(new RepositoryException(400, 'Restaurant was not found'))
      })
    })
  })

  describe('When list restaurants', () => {
    test('Should return restaurants list', async () => {
      const initialList = await repository.List();
      const { restaurant1, restaurant2 } = await initRepositoryWithRestaurants(false);
      const actualList = await repository.List();

      expect(Array.isArray(initialList)).toBe(true);
      expect(Array.isArray(actualList)).toBe(true);
      expect(initialList.length).toBe(0);
      expect(actualList).toEqual(expect.arrayContaining([
        convertFullRestaurantToRestaurant(restaurant1),
        convertFullRestaurantToRestaurant(restaurant2)
      ]))
    })
  })

  describe('When show restaurant', () => {
    describe('and it is a found restaurant', () => {
      test('Should return the restaurant', async () => {
        const { restaurant1 } = await initRepositoryWithRestaurants(true);

        const restaurant = await repository.Show(restaurant1.id as number);

        expect(restaurant).toMatchObject<FullRestaurantEntity>(restaurant1);
      })
    })

    describe('and it is a not found restaurant', () => {
      test('Should throws a not found exception', async () => {
        expect(repository.Show(1))
          .rejects
          .toEqual(new RepositoryException(400, 'Restaurant was not found'))
      })
    })
  })

  describe('When delete restaurant', () => {
    describe('and it is a found restaurant', () => {
      test('Should the restaurant have not been in repository anymore', async () => {
        const { restaurant1 } = await initRepositoryWithRestaurants(true);

        await repository.Delete(restaurant1.id as number);
        const restaurants = await getFullRestaurants();

        expect(restaurants).toEqual(
          expect.not.arrayContaining([restaurant1])
        );
      })
    })

    describe('and it is a not found restaurant', () => {
      test('Should throws a not found exception', async () => {
        expect(repository.Delete(1))
          .rejects
          .toEqual(new RepositoryException(400, 'Restaurant was not found'))
      })
    })
  })
})