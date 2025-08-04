import { HttpRequestMethod } from "../types/http-request-method.type";

export interface HttpRequestMethods {
  GET: HttpRequestMethod;
  POST: HttpRequestMethod;
  PUT: HttpRequestMethod;
  PATCH: HttpRequestMethod;
  DELETE: HttpRequestMethod;
}
