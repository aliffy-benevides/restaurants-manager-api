import { Router } from "express";
import IProductRepository from "../../Repositories/Product/IProductRepository";
import IController from "../IController";

export default class ProductController implements IController {
  readonly Router: Router = Router();
  readonly Path: string = '/restaurants/:restaurantId/products';

  constructor (
    private repo: IProductRepository
  ) {
    this.Router.use('/', (req, res) => {
      return res.status(201).send()
    })
  }
}