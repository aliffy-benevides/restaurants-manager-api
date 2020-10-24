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

export function VerifyHour(hourStr: string) {
  if (!/\d\d:\d\d/.test(hourStr))
    throw `Invalid hour (${hourStr}), must be in format HH:mm`;
    
  const [hour, minute] = hourStr.split(':').map(Number);
  if (hour < 0 || hour > 23)
    throw `Invalid hour (${hourStr})`;
  if (minute !== 0 && minute !== 15 && minute !== 30 && minute !== 45)
    throw `Invalid minute (${hourStr}), must be multiple of 15`;
}
