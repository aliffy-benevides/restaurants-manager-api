import { NextFunction, Request, Response, Router } from "express";

import IController from "../IController";
import IProductRepository from "../../Repositories/Product/IProductRepository";
import { FullProductEntity, FullPromotionEntity, PromotionDayEntity } from "../../Entities/Products";
import ControllerException from "../ControllerException";
import { ParseError, ParseId, VerifyHour } from "../utils";

interface ParamsRestaurantId {
  restaurantId: string;
}
interface ParamsIds {
  id: string;
  restaurantId: string;
}

type CreateRequest = Request<ParamsRestaurantId, null, FullProductEntity>;
type UpdateRequest = Request<ParamsIds, null, FullProductEntity>;

export default class ProductController implements IController {
  readonly Router: Router = Router();
  readonly Path: string = '/restaurants';

  constructor (
    private repo: IProductRepository
  ) {
    this.Router.post('/:restaurantId/products', this.Create);
    this.Router.put('/:restaurantId/products/:id', this.Update);
    this.Router.get('/:restaurantId/products', this.List);
    this.Router.delete('/:restaurantId/products/:id', this.Delete);

    this.Router.use('/', (req, res) => {
      return res.status(201).send()
    })
  }

  private ParseHour = (bodyHour: PromotionDayEntity): PromotionDayEntity => {
    const { day, start, end } = bodyHour;
    const hour = { day, start, end };

    if (day === undefined || day === null)
      throw 'Day is required';

    if (!start)
      throw `Start time '${start}' is required`;
    VerifyHour(start);
    
    if (!end)
      throw `End time '${end}' is required`;
    VerifyHour(end);

    return hour;
  }

  private ParsePromotion = (bodyPromotion: FullPromotionEntity): FullPromotionEntity => {
    const { description, price, hours } = bodyPromotion;
    const promotion: FullPromotionEntity = { description, price, hours };

    if (!description)
      throw 'Description of promotion is required';
    
    if (price === undefined || price === null)
      throw 'Price of promotion is required';

    promotion.hours = hours || [];
    promotion.hours = promotion.hours.map(this.ParseHour);

    return promotion;
  }

  private ParseProduct = (bodyProduct: FullProductEntity, restaurant_id: number): FullProductEntity => {
    if (!bodyProduct || Object.keys(bodyProduct).length === 0)
      throw new ControllerException(400, 'Product not provided');

    // Ensure that cannot pass invalid attributes
    const { photo_url, name, category, price, promotions } = bodyProduct;
    const product: FullProductEntity = { restaurant_id, photo_url, name, category, price, promotions };

    try {
      if (!photo_url)
        throw 'Photo url is required';
      
      if (!name)
        throw 'Name is required';
      
      if (!category)
        throw 'Category is required';
      
      if (price === undefined || price === null)
        throw 'Price is required';

      product.promotions = promotions || [];
      product.promotions = product.promotions.map(this.ParsePromotion);

      return product;
    } catch (error) {
      throw new ControllerException(400, 'Invalid product', error);
    }
  }

  private Create = async (req: CreateRequest, res: Response, next: NextFunction) => {
    try {
      const restaurant_id = ParseId(req.params.restaurantId, 'Invalid restaurant\'s id');
      const product = this.ParseProduct(req.body, restaurant_id);
  
      await this.repo.Create(product);
      return res.status(201).send();
    } catch (error) {
      return next(ParseError(error, 'Unexpected error on create product'));
    }
  }

  private Update = async (req: UpdateRequest, res: Response, next: NextFunction) => {
    try {
      const id = ParseId(req.params.id, 'Invalid product\'s id');
      const restaurant_id = ParseId(req.params.restaurantId, 'Invalid restaurant\'s id');
      const product = this.ParseProduct(req.body, restaurant_id);
  
      await this.repo.Update({ ...product, id });
      return res.status(201).send();
    } catch (error) {
      return next(ParseError(error, 'Unexpected error on update product'));
    }
  }

  private List = async (req: Request<ParamsRestaurantId>, res: Response, next: NextFunction) => {
    try {
      const restaurant_id = ParseId(req.params.restaurantId, 'Invalid restaurant\'s id');
      const products = await this.repo.List(restaurant_id);
  
      return res.json(products);
    } catch (error) {
      return next(ParseError(error, 'Unexpected error on list products'));
    }
  }

  private Delete = async (req: Request<ParamsIds>, res: Response, next: NextFunction) => {
    try {
      const id = ParseId(req.params.id, 'Invalid product\'s id');
      //const restaurant_id = ParseId(req.params.restaurantId, 'Invalid restaurant\'s id');
  
      await this.repo.Delete(id);
      return res.status(201).send();
    } catch (error) {
      return next(ParseError(error, 'Unexpected error on delete product'));
    }
  }
}