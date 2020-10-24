import express, { Express } from 'express';
import cors from 'cors';

import IController from "./Controllers/IController";
import ErrorHandler from './Controllers/ErrorHandler';

export default class Api {
  app: Express = express();

  constructor (controllers: IController[], private port: number) {
    this.initializeMiddlewares();
    this.initializeControllers(controllers);
    this.initializeErrorHandler();
  }

  private initializeMiddlewares() {
    this.app.use(cors());
    this.app.use(express.json());
  }

  private initializeControllers(controllers: IController[]) {
    for (const controller of controllers) {
      this.app.use(controller.Path, controller.Router);
    }
  }

  private initializeErrorHandler() {
    this.app.use(ErrorHandler);
  }

  public Listen = () => {
    this.app.listen(this.port, () => {
      console.log(`App running on port ${this.port}!`);
    });
  }
}