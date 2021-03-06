import Database from "../database/Database";
import ProductRepository from './ProductRepository';
import { FullProductEntity } from "../../Entities/Products";

import RepositoryException from '../RepositoryException';

// Must set TEST_NAME before instantiate Database, because Database uses this variable;
process.env.TEST_NAME = 'ProductRepositoryTest';

const db = new Database();
const repository = new ProductRepository(db);

describe('ProductRepository', () => {
  beforeAll(() => {
    return db.Teardown();
  });

  beforeEach(() => {
    return db.Setup();
  });

  afterEach(() => {
    return db.Teardown();
  });

  const restaurantId = 1;
  function generateValidProduct(): FullProductEntity {
    return {
      restaurant_id: restaurantId,
      photo_url: 'http://photo_url',
      name: 'Product name',
      price: 23.45,
      category: 'Salgado',
      promotions: [{
        description: 'Promoção de segunda a sabado',
        price: 19.99,
        hours: [
          { day: 1, start: '08:15', end: '17:45' },
          { day: 2, start: '08:15', end: '17:45' },
          { day: 3, start: '08:15', end: '17:45' },
          { day: 4, start: '08:15', end: '17:45' },
          { day: 5, start: '08:15', end: '17:45' },
          { day: 6, start: '08:15', end: '12:00' }
        ]
      }]
    }
  }

  async function initRepositoryWithProducts(returnWithIds: boolean = true) {
    let product1 = { ...generateValidProduct(), name: 'Product 1' };
    let product2 = { ...generateValidProduct(), name: 'Product 2' };

    await repository.Create(product1);
    await repository.Create(product2);

    if (returnWithIds) {
      const products = await repository.List(restaurantId);
      const product1Id = products.find(r => r.name === product1.name)?.id;
      const product2Id = products.find(r => r.name === product2.name)?.id;
      product1 = { ...product1, id: product1Id };
      product2 = { ...product2, id: product2Id };
    }

    return { product1, product2 };
  }

  function expectedProduct(product: FullProductEntity) {
    return expect.objectContaining({
      ...product,
      promotions: expect.arrayContaining(
        product.promotions.map(promotion => expect.objectContaining({
          ...promotion,
          hours: expect.arrayContaining(
            promotion.hours.map(hour => expect.objectContaining(hour))
          )
        }))
      )
    })
  }

  describe('When create product', () => {
    test('Should create the product', async () => {
      const initialProducts = await repository.List(restaurantId);
      await repository.Create(generateValidProduct());
      const actualProducts = await repository.List(restaurantId);

      expect(initialProducts.length).toBe(0);
      expect(actualProducts.length).toBe(1);
      expect(actualProducts[0]).toMatchObject(generateValidProduct());
      expect(actualProducts[0].id).toBeTruthy();
      for (const promotion of actualProducts[0].promotions) {
        expect(promotion.id).toBeTruthy();
      }
    })
  })

  describe('When update product', () => {
    describe('and it is a found product', () => {
      test('Should update only the product', async () => {
        const { product1, product2 } = await initRepositoryWithProducts();
        const updatedProduct: FullProductEntity = { ...product1, photo_url: 'Updated photo url',
          promotions: [{
            ...product1.promotions[0],
            description: 'Promoção de domingo',
            hours: [{ day: 0, start: '12:00', end: '17:00' }]
          }]
        };

        await repository.Update(updatedProduct);
        const actualRestaurants = await repository.List(restaurantId);

        expect(actualRestaurants.length).toBe(2);
        expect(actualRestaurants).toEqual(expect.arrayContaining([
          expectedProduct(updatedProduct),
          expectedProduct(product2)
        ]))
      })
    })

    describe('and it is a not found product', () => {
      test('Should throws a not found exception', async () => {
        const updatedRestaurant: FullProductEntity = { ...generateValidProduct(), id: 1 };

        expect(repository.Update(updatedRestaurant))
          .rejects
          .toEqual(new RepositoryException(400, 'Product was not found'))
      })
    })
  })

  describe('When list products', () => {
    test('Should return only restaurant\'s products list', async () => {
      const initialList = await repository.List(restaurantId);
      const { product1, product2 } = await initRepositoryWithProducts(false);
      const productNotListed = { ...generateValidProduct(), restaurant_id: 999 };
      await repository.Create(productNotListed);
      const actualList = await repository.List(restaurantId);

      expect(Array.isArray(initialList)).toBe(true);
      expect(Array.isArray(actualList)).toBe(true);
      expect(initialList.length).toBe(0);
      expect(actualList.length).toBe(2);
      expect(actualList).toEqual(expect.arrayContaining([
        expectedProduct(product1),
        expectedProduct(product2)
      ]))
    })
  })

  describe('When delete product', () => {
    describe('and it is a found product', () => {
      test('Should the product have not been in repository anymore', async () => {
        const { product1, product2 } = await initRepositoryWithProducts(true);

        await repository.Delete(product1.id as number);
        const products = await repository.List(restaurantId);

        expect(products.filter(p => p.id === product1.id).length).toBe(0);
        expect(products.filter(p => p.id === product2.id).length).toBe(1);
      })
    })

    describe('and it is a not found product', () => {
      test('Should throws a not found exception', async () => {
        expect(repository.Delete(1))
          .rejects
          .toEqual(new RepositoryException(400, 'Product was not found'))
      })
    })
  })
})