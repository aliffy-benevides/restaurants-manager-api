import express, { Express } from 'express';
import request from 'supertest';

import IController from "../src/api/Controllers/IController";
import ErrorHandler from '../src/api/Controllers/ErrorHandler';
import ApiException from '../src/api/ApiException';

const expectedError = new ApiException(400, 'Expected error');
const unexpectedError = { error: 'Unexpected error' };

export function initializeServerWithController(controller: IController) {
  const app = express();

  app.use(express.json());

  app.use(controller.Path, controller.Router);

  app.use('/', ErrorHandler);

  return app;
}

/**
 * Test when repository throws an error, expected or not. If a error message was not provided are considered that is a expected error
 * @param app 
 * @param url 
 * @param httpMethod 
 * @param repoMethod 
 * @param errorMessage Just if is an unexpected error
 * @param body Body of the request
 */
export async function testWhenRepoThrowsError(app: Express, url: string,
  httpMethod: 'post' | 'put' | 'get' | 'delete', repoMethod: any, errorMessage?: string, body?: any) {
  
  const isAnExpectedError = !errorMessage;

  repoMethod.mockImplementation(() => 
    isAnExpectedError ? Promise.reject(expectedError) : Promise.reject(unexpectedError)
  );

  const res = await request(app)
    [httpMethod](url)
    .send(body);

  expect(res.status).toBe(
    isAnExpectedError ? expectedError.status : 500
  );
  expect(res.body).toMatchObject(
    isAnExpectedError ? expectedError : {
      message: errorMessage,
      error: unexpectedError
    }
  );
}