import { HttpStatus } from "@nestjs/common";

import { CustomErrorKeys } from "../../enums/error-keys.enum";

export class CustomErrorResponse {
  type: string;
  title: string;
  statusCode: HttpStatus;
  detail: string;
  key: CustomErrorKeys;
  timestamp: string;
  path: string;

  constructor(partial: Partial<CustomErrorResponse>) {
    Object.assign(this, partial);
    this.timestamp = new Date().toISOString();
  }
}

export class ValidationCustomErrorResponse extends CustomErrorResponse {
  validationErrors: {
    pointer: string;
    detail: string;
  }[];

  constructor(partial: Partial<ValidationCustomErrorResponse>) {
    super(partial);
    Object.assign(this, partial);
  }
}
