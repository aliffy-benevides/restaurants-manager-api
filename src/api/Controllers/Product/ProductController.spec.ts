import { Express } from 'express';
import { mock, MockProxy } from "jest-mock-extended";
import request from 'supertest';

import IProductRepository from "../../Repositories/Product/IProductRepository";
import ProductController from './ProductController';
import { FullProductEntity } from '../../Entities/Products';

import { initializeServerWithController, testWhenRepoThrowsError } from '../../../../test/helpers';

describe('ProductController', () => {
  let app: Express;

  let mockRepository: MockProxy<IProductRepository>;

  let controller: ProductController;

  // Auxiliaries used to tests
  const restaurantId = 10;
  const productId = 1;
  function generateValidProduct(): FullProductEntity {
    return {
      photo_url: 'Photo url',
      name: 'Product name',
      category: 'Category',
      price: 45.99,
      promotions: []
    } as any
  }
  function generateValidProductWithIds(): FullProductEntity {
    return {
      ...generateValidProduct(),
      id: productId,
      restaurant_id: restaurantId
    }
  }
  function generateValidProductWithInvalidAttrs() {
    return {
      ...generateValidProduct(),
      invalidAttr: 'attr'
    }
  }
  function generateInvalidProduct() {
    return {
      invalidAttr: 'attr'
    }
  }

  beforeEach(() => {
    mockRepository = mock<IProductRepository>();

    controller = new ProductController(mockRepository);

    app = initializeServerWithController(controller);
  })

  describe('POST /restaurants/:restaurantId/products', () => {
    const url = `/restaurants/${restaurantId}/products`;

    describe('with a valid product', () => {
      test('Should return status 201 and call repository\'s create function', async () => {
        const res = await request(app)
          .post(url)
          .send(generateValidProduct())

        expect(mockRepository.Create).toHaveBeenCalledWith(generateValidProduct());
        expect(res.status).toBe(201);
      })
    })

    describe('with a valid product, but with invalid attributes', () => {
      test('Should return status 201 and call repository\'s create function with just valid attributes', async () => {
        const res = await request(app)
          .post(url)
          .send(generateValidProductWithInvalidAttrs())

        expect(mockRepository.Create).toHaveBeenCalledWith(generateValidProduct());
        expect(res.status).toBe(201);
      })
    })

    describe('with a invalid product', () => {
      test('Should return status 400 and do not call repository\'s create function', async () => {
        const res = await request(app)
          .post(url)
          .send(generateInvalidProduct())

        expect(mockRepository.Create).not.toHaveBeenCalled();
        expect(res.status).toBe(400);
        expect(res.body).toMatchObject({
          message: 'Invalid product'
        });
      })
    })

    describe('without a product', () => {
      test('Should return status 400 and do not call repository\'s create function', async () => {
        const res = await request(app)
          .post(url)
          .send()

        expect(mockRepository.Create).not.toHaveBeenCalled();
        expect(res.status).toBe(400);
        expect(res.body).toMatchObject({
          message: 'Product not provided'
        });
      })
    })

    describe('When repository throws an expected error', () => {
      test('Should return error\'s status and error\'s message', async () => {
        await testWhenRepoThrowsError(app, url, 'post', mockRepository.Create, undefined, generateValidProduct());
      })
    })

    describe('When repository throws an unexpected error', () => {
      test('Should return status 500 and error\'s message', async () => {
        await testWhenRepoThrowsError(app, url, 'post', mockRepository.Create, 'Unexpected error on create product', generateValidProduct());
      })
    })
  })

  describe('PUT /restaurants/:restaurantId/products/:id', () => {
    const validUrl = `/restaurants/${restaurantId}/products/${productId}`;
    const invalidUrl = `/restaurants/${restaurantId}/products/a`;

    describe('with a valid product', () => {
      test('Should return status 201 and call repository\'s update function', async () => {
        const res = await request(app)
          .put(validUrl)
          .send(generateValidProduct())

        expect(mockRepository.Update).toHaveBeenCalledWith(generateValidProductWithIds());
        expect(res.status).toBe(201);
      })
    })

    describe('with a valid product, but with invalid attributes', () => {
      test('Should return status 201 and call repository\'s update function with just valid attributes', async () => {
        const res = await request(app)
          .put(validUrl)
          .send(generateValidProductWithInvalidAttrs())

        expect(mockRepository.Update).toHaveBeenCalledWith(generateValidProductWithIds());
        expect(res.status).toBe(201);
      })
    })

    describe('with a invalid product', () => {
      test('Should return status 400 and do not call repository\'s update function', async () => {
        const res = await request(app)
          .put(validUrl)
          .send(generateInvalidProduct())

        expect(mockRepository.Update).not.toHaveBeenCalled();
        expect(res.status).toBe(400);
        expect(res.body).toMatchObject({
          message: 'Invalid product'
        });
      })
    })

    describe('without a product', () => {
      test('Should return status 400 and do not call repository\'s update function', async () => {
        const res = await request(app)
          .put(validUrl)
          .send()

        expect(mockRepository.Update).not.toHaveBeenCalled();
        expect(res.status).toBe(400);
        expect(res.body).toMatchObject({
          message: 'Product not provided'
        });
      })
    })

    describe('with a invalid product\'s id', () => {
      test('Should return status 404 and do not call repository\'s update function', async () => {
        const res = await request(app)
          .put(invalidUrl)
          .send(generateValidProduct())

        expect(mockRepository.Update).not.toHaveBeenCalled();
        expect(res.status).toBe(404);
        expect(res.body).toMatchObject({
          message: 'Invalid product\'s id'
        });
      })
    })

    describe('When repository throws an expected error', () => {
      test('Should return error\'s status and error\'s message', async () => {
        await testWhenRepoThrowsError(app, validUrl, 'put', mockRepository.Update, undefined, generateValidProduct());
      })
    })

    describe('When repository throws an unexpected error', () => {
      test('Should return status 500 and error\'s message', async () => {
        await testWhenRepoThrowsError(app, validUrl, 'put', mockRepository.Update, 'Unexpected error on update product', generateValidProduct());
      })
    })
  })

  describe('GET /restaurants/:restaurantId/products', () => {
    const validUrl = `/restaurants/${restaurantId}/products`;
    const invalidUrl = `/restaurants/b/products`;

    describe('with a valid restaurant\'s id', () => {
      test('Should return status 200 and the products', async () => {
        const list = [ generateValidProductWithIds(), generateValidProductWithIds(), generateValidProductWithIds() ]
        mockRepository.List.mockResolvedValue(list);

        const res = await request(app)
          .get(validUrl)

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject<FullProductEntity[]>(list);
      })
    })

    describe('with a invalid restaurant\'s id', () => {
      test('Should return status 404 and do not call repository\'s list function', async () => {
        const res = await request(app)
          .get(invalidUrl)

        expect(mockRepository.List).not.toHaveBeenCalled();
        expect(res.status).toBe(404);
        expect(res.body).toMatchObject({
          message: 'Invalid restaurant\'s id'
        });
      })
    })

    describe('When repository throws an expected error', () => {
      test('Should return error\'s status and error\'s message', async () => {
        await testWhenRepoThrowsError(app, validUrl, 'get', mockRepository.List);
      })
    })

    describe('When repository throws an unexpected error', () => {
      test('Should return status 500 and error\'s message', async () => {
        await testWhenRepoThrowsError(app, validUrl, 'get', mockRepository.List, 'Unexpected error on list restaurants');
      })
    })
  })

  describe('DELETE /restaurants/:restaurantId/products/:id', () => {
    const validUrl = `/restaurants/${restaurantId}/products/${productId}`;
    const invalidUrl = `/restaurants/${restaurantId}/products/a`;

    describe('with a valid product\'s id', () => {
      test('Should return status 201 and call repository\'s delete function', async () => {
        const res = await request(app)
          .delete(validUrl)

        expect(mockRepository.Delete).toHaveBeenCalledWith(productId);
        expect(res.status).toBe(201);
      })
    })

    describe('with a invalid product\'s id', () => {
      test('Should return status 404 and do not call repository\'s delete function', async () => {
        const res = await request(app)
          .delete(invalidUrl)

        expect(mockRepository.Delete).not.toHaveBeenCalled();
        expect(res.status).toBe(404);
        expect(res.body).toMatchObject({
          message: 'Invalid product\'s id'
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
        await testWhenRepoThrowsError(app, validUrl, 'delete', mockRepository.Delete, 'Unexpected error on delete product');
      })
    })
  })
})