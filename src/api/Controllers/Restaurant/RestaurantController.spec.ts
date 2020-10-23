import { Express } from 'express';
import { mock, MockProxy } from 'jest-mock-extended';
import request from 'supertest';

import IProductRepository from '../../Repositories/Product/IProductRepository';
import IRestaurantRepository from '../../Repositories/Restaurant/IRestaurantRepository';
import RestaurantController from './RestaurantController';
import { FullRestaurantEntity } from '../../Entities/Restaurants';
import { FullProductEntity } from '../../Entities/Products';

import { initializeServerWithController, testWhenRepoThrowsError } from '../../../../test/helpers';

describe('RestaurantController', () => {
  let app: Express;

  let mockRepository: MockProxy<IRestaurantRepository>;
  let mockProductRepository: MockProxy<IProductRepository>;

  let controller: RestaurantController;

  // Auxiliaries used to tests
  const restaurantId = 1;
  function generateValidRestaurant(): FullRestaurantEntity {
    return {
      photo_url: 'Photo url',
      address: 'Fake address',
      name: 'Restaurant name',
      hours: [
        { day: 1, start: '07:45', end: '17:00' },
        { day: 2, start: '07:45', end: '17:00' }
      ]
    }
  }
  function generateValidRestaurantWithId(): FullRestaurantEntity {
    return {
      ...generateValidRestaurant(),
      id: restaurantId
    }
  }
  function generateValidRestaurantWithInvalidAttrs() {
    return {
      ...generateValidRestaurant(),
      invalidAttr: 'attr'
    }
  }
  function generateInvalidRestaurant() {
    return {
      invalidAttr: 'attr'
    }
  }
  function generateValidProduct(): FullProductEntity {
    return {
      restaurant_id: restaurantId,
      photo_url: 'Product photo url',
      name: 'Product name',
      category: 'Salgado',
      price: 45.80,
      promotions: []
    }
  }

  beforeEach(() => {
    mockRepository = mock<IRestaurantRepository>();
    mockProductRepository = mock<IProductRepository>();

    controller = new RestaurantController(mockRepository, mockProductRepository);

    app = initializeServerWithController(controller);
  })

  describe('POST /restaurants', () => {
    const url = '/restaurants';

    describe('with a valid restaurant', () => {
      test('Should return status 201 and call repository\'s create function', async () => {
        const res = await request(app)
          .post(url)
          .send(generateValidRestaurant())

        expect(mockRepository.Create).toHaveBeenCalledWith(generateValidRestaurant());
        expect(res.status).toBe(201);
      })
    })

    describe('with a valid restaurant, but with invalid attributes', () => {
      test('Should return status 201 and call repository\'s create function with just valid attributes', async () => {
        const res = await request(app)
          .post(url)
          .send(generateValidRestaurantWithInvalidAttrs())

        expect(mockRepository.Create).toHaveBeenCalledWith(generateValidRestaurant());
        expect(res.status).toBe(201);
      })
    })

    describe('with a invalid restaurant', () => {
      test('Should return status 400 and do not call repository\'s create function', async () => {
        const res = await request(app)
          .post(url)
          .send(generateInvalidRestaurant())

        expect(mockRepository.Create).not.toHaveBeenCalled();
        expect(res.status).toBe(400);
        expect(res.body).toMatchObject({
          message: 'Invalid restaurant'
        });
      })
    })

    describe('without a restaurant', () => {
      test('Should return status 400 and do not call repository\'s create function', async () => {
        const res = await request(app)
          .post(url)
          .send()

        expect(mockRepository.Create).not.toHaveBeenCalled();
        expect(res.status).toBe(400);
        expect(res.body).toMatchObject({
          message: 'Restaurant not provided'
        });
      })
    })

    describe('When repository throws an expected error', () => {
      test('Should return error\'s status and error\'s message', async () => {
        await testWhenRepoThrowsError(app, url, 'post', mockRepository.Create, undefined, generateValidRestaurant());
      })
    })

    describe('When repository throws an unexpected error', () => {
      test('Should return status 500 and error\'s message', async () => {
        await testWhenRepoThrowsError(app, url, 'post', mockRepository.Create, 'Unexpected error on create restaurant', generateValidRestaurant());
      })
    })
  })

  describe('PUT /restaurants/:id', () => {
    const validUrl = '/restaurants/' + restaurantId;
    const invalidUrl = '/restaurants/a';

    describe('with a valid restaurant', () => {
      test('Should return status 201 and call repository\'s update function', async () => {
        const res = await request(app)
          .put(validUrl)
          .send(generateValidRestaurant())

        expect(mockRepository.Update).toHaveBeenCalledWith(generateValidRestaurantWithId());
        expect(res.status).toBe(201);
      })
    })

    describe('with a valid restaurant, but with invalid attributes', () => {
      test('Should return status 201 and call repository\'s update function with just valid attributes', async () => {
        const res = await request(app)
          .put(validUrl)
          .send(generateValidRestaurantWithInvalidAttrs())

        expect(mockRepository.Update).toHaveBeenCalledWith(generateValidRestaurantWithId());
        expect(res.status).toBe(201);
      })
    })

    describe('with a invalid restaurant', () => {
      test('Should return status 400 and do not call repository\'s update function', async () => {
        const res = await request(app)
          .put(validUrl)
          .send(generateInvalidRestaurant())

        expect(mockRepository.Update).not.toHaveBeenCalled();
        expect(res.status).toBe(400);
        expect(res.body).toMatchObject({
          message: 'Invalid restaurant'
        });
      })
    })

    describe('without a restaurant', () => {
      test('Should return status 400 and do not call repository\'s update function', async () => {
        const res = await request(app)
          .put(validUrl)
          .send()

        expect(mockRepository.Update).not.toHaveBeenCalled();
        expect(res.status).toBe(400);
        expect(res.body).toMatchObject({
          message: 'Restaurant not provided'
        });
      })
    })

    describe('with a invalid restaurant\'s id', () => {
      test('Should return status 404 and do not call repository\'s update function', async () => {
        const res = await request(app)
          .put(invalidUrl)
          .send(generateValidRestaurant())

        expect(mockRepository.Update).not.toHaveBeenCalled();
        expect(res.status).toBe(404);
        expect(res.body).toMatchObject({
          message: 'Invalid restaurant\'s id'
        });
      })
    })

    describe('When repository throws an expected error', () => {
      test('Should return error\'s status and error\'s message', async () => {
        await testWhenRepoThrowsError(app, validUrl, 'put', mockRepository.Update, undefined, generateValidRestaurant());
      })
    })

    describe('When repository throws an unexpected error', () => {
      test('Should return status 500 and error\'s message', async () => {
        await testWhenRepoThrowsError(app, validUrl, 'put', mockRepository.Update, 'Unexpected error on update restaurant', generateValidRestaurant());
      })
    })
  })

  describe('GET /restaurants/:id', () => {
    const validUrl = '/restaurants/' + restaurantId;
    const invalidUrl = '/restaurants/a';

    describe('with a valid restaurant\'s id', () => {
      test('Should return status 200 and the restaurant', async () => {
        const productsList = [
          { ...generateValidProduct(), id: 1 },
          { ...generateValidProduct(), id: 2 },
          { ...generateValidProduct(), id: 3 }
        ]
        mockProductRepository.List.mockResolvedValue(productsList);
        mockRepository.Show.mockResolvedValue(generateValidRestaurantWithId());

        const res = await request(app)
          .get(validUrl)

        expect(mockProductRepository.List).toHaveBeenCalledWith(restaurantId);
        expect(mockRepository.Show).toHaveBeenCalledWith(restaurantId);
        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
          ...generateValidRestaurantWithId(),
          products: productsList
        });
      })
    })

    describe('with a invalid restaurant\'s id', () => {
      test('Should return status 404 and do not call repository\'s show function', async () => {
        const res = await request(app)
          .get(invalidUrl)

        expect(mockRepository.Show).not.toHaveBeenCalled();
        expect(res.status).toBe(404);
        expect(res.body).toMatchObject({
          message: 'Invalid restaurant\'s id'
        });
      })
    })

    describe('When repository throws an expected error', () => {
      test('Should return error\'s status and error\'s message', async () => {
        await testWhenRepoThrowsError(app, validUrl, 'get', mockRepository.Show);
      })
    })

    describe('When repository throws an unexpected error', () => {
      test('Should return status 500 and error\'s message', async () => {
        await testWhenRepoThrowsError(app, validUrl, 'get', mockRepository.Show, 'Unexpected error on show restaurant');
      })
    })
  })

  describe('GET /restaurants', () => {
    const url = '/restaurants';

    describe('and everything is OK', () => {
      test('Should return status 200 and the restaurants', async () => {
        const list = [ generateValidRestaurantWithId(), generateValidRestaurantWithId(), generateValidRestaurantWithId() ]
        mockRepository.List.mockResolvedValue(list);

        const res = await request(app)
          .get(url)

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject(list);
      })
    })

    describe('When repository throws an expected error', () => {
      test('Should return error\'s status and error\'s message', async () => {
        await testWhenRepoThrowsError(app, url, 'get', mockRepository.List);
      })
    })

    describe('When repository throws an unexpected error', () => {
      test('Should return status 500 and error\'s message', async () => {
        await testWhenRepoThrowsError(app, url, 'get', mockRepository.List, 'Unexpected error on list restaurants');
      })
    })
  })

  describe('DELETE /restaurants/:id', () => {
    const validUrl = '/restaurants/' + restaurantId;
    const invalidUrl = '/restaurants/a';

    describe('with a valid restaurant\'s id', () => {
      test('Should return status 201 and call repository\'s delete function', async () => {
        const res = await request(app)
          .delete(validUrl)

        expect(mockRepository.Delete).toHaveBeenCalledWith(restaurantId);
        expect(res.status).toBe(201);
      })
    })

    describe('with a invalid restaurant\'s id', () => {
      test('Should return status 404 and do not call repository\'s delete function', async () => {
        const res = await request(app)
          .delete(invalidUrl)

        expect(mockRepository.Delete).not.toHaveBeenCalled();
        expect(res.status).toBe(404);
        expect(res.body).toMatchObject({
          message: 'Invalid restaurant\'s id'
        });
      })
    })

    describe('When repository throws an expected error', () => {
      test('Should return error\'s status and error\'s message', async () => {
        await testWhenRepoThrowsError(app, validUrl, 'delete', mockRepository.Delete);
      })
    })

    describe('When repository throws an unexpected error', () => {
      test('Should return status 500 and error\'s message', async () => {
        await testWhenRepoThrowsError(app, validUrl, 'delete', mockRepository.Delete, 'Unexpected error on delete restaurant');
      })
    })
  })
})