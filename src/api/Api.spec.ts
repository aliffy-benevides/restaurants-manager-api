import jestExpress from 'jest-express';
import { mock, MockProxy } from 'jest-mock-extended';
import express from 'express';
import cors from 'cors';

import Api from './Api';
import ProductController from './Controllers/Product/ProductController';
import RestaurantController from './Controllers/Restaurant/RestaurantController';
import ErrorHandler from './Controllers/ErrorHandler';

jest.mock('express', () => {
  return jestExpress;
})

describe('ApiTest', () => {
  let api: Api;

  let restaurantController: MockProxy<RestaurantController>;
  let productController: MockProxy<ProductController>;

  beforeEach(() => {
    restaurantController = mock<RestaurantController>();
    productController = mock<ProductController>();
    
    api = new Api([
      restaurantController,
      productController
    ]);
  })

  test('Should apply middlewares', () => {
    expect(api.app.use).toHaveBeenCalledWith(cors());
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