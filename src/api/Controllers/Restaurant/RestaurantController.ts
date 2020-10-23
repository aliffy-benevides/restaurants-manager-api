import { NextFunction, Request, Response, Router } from "express";

import IController from "../IController";
import IRestaurantRepository from "../../Repositories/Restaurant/IRestaurantRepository";
import IProductRepository from "../../Repositories/Product/IProductRepository";
import { FullRestaurantEntity, RestaurantDayEntity } from "../../Entities/Restaurants";
import ControllerException from "../ControllerException";

import { ParseError, ParseId } from "../utils";

interface Params {
  id: string;
}

type CreateRequest = Request<null, null, FullRestaurantEntity>;
type UpdateRequest = Request<Params, null, FullRestaurantEntity>;

export default class RestaurantController implements IController {
  readonly Router: Router = Router();
  readonly Path: string = '/restaurants';

  constructor (
    private repo: IRestaurantRepository,
    private productRepo: IProductRepository
  ) {
    this.Router.post('/', this.Create);
    this.Router.put('/:id', this.Update);
    this.Router.get('/:id', this.Show);
    this.Router.get('/', this.List);
    this.Router.delete('/:id', this.Delete);
  }

  private ParseHour = (bodyHour: RestaurantDayEntity): RestaurantDayEntity => {
    const { day, start, end } = bodyHour;
    const hour = { day, start, end };

    if (day === undefined || day === null)
      throw 'Day is required';

    if (!start || start.length !== 5)
      throw `Start time '${start}' is invalid, must be in format HH:mm`;

    if (!end || end.length !== 5)
      throw `End time '${end}' is invalid, must be in format HH:mm`;

    return hour;
  }

  private ParseRestaurant = (bodyRestaurant: FullRestaurantEntity): FullRestaurantEntity => {
    if (!bodyRestaurant || Object.keys(bodyRestaurant).length === 0)
      throw new ControllerException(400, 'Restaurant not provided');

    // Ensure that cannot pass invalid attributes
    const { photo_url, name, address, hours } = bodyRestaurant;
    const restaurant = { photo_url, name, address, hours };

    try {
      if (!photo_url)
        throw 'Photo url is required';
      
      if (!name)
        throw 'Name is required';
      
      if (!address)
        throw 'Address is required';
      
      restaurant.hours = hours || [];
      restaurant.hours = restaurant.hours.map(this.ParseHour);
      return restaurant;
    } catch (error) {
      throw new ControllerException(400, 'Invalid restaurant', error);
    }
  }

  // Arrow Function bind 'this'
  private Create = async (req: CreateRequest, res: Response, next: NextFunction) => {
    try {
      const restaurant = this.ParseRestaurant(req.body);

      await this.repo.Create(restaurant);
      return res.status(201).send();
    } catch (error) {
      return next(ParseError(error, 'Unexpected error on create restaurant'));
    }
  }

  private Update = async (req: UpdateRequest, res: Response, next: NextFunction) => {
    try {
      const id = ParseId(req.params.id, 'Invalid restaurant\'s id');
      const restaurant = this.ParseRestaurant(req.body);

      await this.repo.Update({ ...restaurant, id });
      return res.status(201).send();
    } catch (error) {
      return next(ParseError(error, 'Unexpected error on update restaurant'));
    }
  }

  private Show = async (req: Request<Params>, res: Response, next: NextFunction) => {
    try {
      const id = ParseId(req.params.id, 'Invalid restaurant\'s id');

      const restaurant = await this.repo.Show(id);
      const products = await this.productRepo.List(id);
      return res.json({ ...restaurant, products });
    } catch (error) {
      return next(ParseError(error, 'Unexpected error on show restaurant'));
    }
  }

  private List = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const restaurants = await this.repo.List();
      return res.json(restaurants);
    } catch (error) {
      return next(ParseError(error, 'Unexpected error on list restaurants'));
    }
  }

  private Delete = async (req: Request<Params>, res: Response, next: NextFunction) => {
    try {
      const id = ParseId(req.params.id, 'Invalid restaurant\'s id');

      await this.repo.Delete(id);
      return res.status(201).send();
    } catch (error) {
      return next(ParseError(error, 'Unexpected error on delete restaurant'));
    }
  }
}