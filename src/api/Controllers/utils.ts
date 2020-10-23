import ApiException from "../ApiException";
import ControllerException from "./ControllerException";

export function ParseError(error: any, defaultMessage?: string): ApiException {
  if (error instanceof ApiException) {
    return error;
  }

  return new ApiException(500, defaultMessage, error);
}

export function ParseId(paramId: string, errorMessage: string): number {
  const id = parseInt(paramId);
  if (isNaN(id))
    throw new ControllerException(404, errorMessage);

  return id;
}
