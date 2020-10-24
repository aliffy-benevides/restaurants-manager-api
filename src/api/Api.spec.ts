import jestExpress from 'jest-express';
import { mock, MockProxy } from 'jest-mock-extended';
import express from 'express';

import Api from './Api';
import ProductController from './Controllers/Product/ProductController';
import RestaurantController from './Controllers/Restaurant/RestaurantController';
import ErrorHandler from './Controllers/ErrorHandler';

jest.mock('express', () => {
  return jestExpress;
})

describe('ApiTests', () => {
  let api: Api;
  const port = 3000;

  let restaurantController: MockProxy<RestaurantController>;
  let productController: MockProxy<ProductController>;

  beforeEach(() => {
    restaurantController = mock<RestaurantController>();
    productController = mock<ProductController>();

    api = new Api([
      restaurantController,
      productController
    ], port);
  })

  describe('When instantiated', () => {
    test('Should apply middlewares', () => {
      expect(api.app.use).toHaveBeenCalledWith(express.json());
    })

    test('Should apply controllers', () => {
      expect(api.app.use).toHaveBeenCalledWith(productController.Path, productController.Router);
      expect(api.app.use).toHaveBeenCalledWith(restaurantController.Path, restaurantController.Router);
    })

    test('Should apply error handler', () => {
      expect(api.app.use).toHaveBeenCalledWith(ErrorHandler);
    })
  })

  describe('When run Listen method', () => {
    test('Should run api on specified port', () => {
      api.Listen();

      expect(api.app.listen).toHaveBeenCalledWith(port, expect.any(Function));
    })
  })
})