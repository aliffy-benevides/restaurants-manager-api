import Api from './api/Api';

// Repositories
import Database from './api/Repositories/database/Database';
import RestaurantRepository from './api/Repositories/Restaurant/RestaurantRepository';
import ProductRepository from './api/Repositories/Product/ProductRepository';

// Controllers
import RestaurantController from './api/Controllers/Restaurant/RestaurantController';
import ProductController from './api/Controllers/Product/ProductController';

const PORT = Number(process.env.PORT || 3000);

// Instantiate Repositories
const db = new Database();
const restaurantRepository = new RestaurantRepository(db);
const productRepository = new ProductRepository(db);

db.Setup();

// Instantiate Controllers
const restaurantController = new RestaurantController(restaurantRepository, productRepository);
const productController = new ProductController(productRepository);

// Instantiate Api
const api = new Api([
  restaurantController,
  productController
], PORT);

// Run server
api.Listen();