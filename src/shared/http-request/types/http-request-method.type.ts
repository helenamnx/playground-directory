import { HttpRequestParams } from "../interfaces/http-request-params.interface";

export type HttpRequestMethod = (params: HttpRequestParams) => Promise<any>;
