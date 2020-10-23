import { Router } from "express";
import IProductRepository from "../../Repositories/Product/IProductRepository";
import IRestaurantRepository from "../../Repositories/Restaurant/IRestaurantRepository";
import IController from "../IController";

export default class RestaurantController implements IController {
  readonly Router: Router = Router();
  readonly Path: string = '/restaurants';

  constructor (
    private repo: IRestaurantRepository,
    private productRepo: IProductRepository
  ) {
    this.Router.use('/', (req, res) => {
      return res.status(201).send()
    })
  }
}