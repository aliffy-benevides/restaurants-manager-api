import express, { Express } from 'express';
import IController from "./Controllers/IController";

export default class Api {
  app: Express = express();

  constructor (controllers: IController[]) {}
}