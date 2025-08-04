import { CustomSuccessResponse } from "../classes/custom-success-response.class";

export interface CustomResponseMethods {
  OK: (data: any) => CustomSuccessResponse;
  CREATED_ITEM: (data: any) => CustomSuccessResponse;
  UPDATED_ITEM: (data: any) => CustomSuccessResponse;
  DELETED_ITEM: (data: any) => CustomSuccessResponse;
}
