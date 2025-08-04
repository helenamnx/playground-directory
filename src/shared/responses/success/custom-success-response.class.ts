export class CustomSuccessResponse {
  object: unknown;
  status: number;
  action: string | undefined;

  constructor(params: { object?: any; status: number; action?: string }) {
    const { object, status, action } = params;
    this.object = object;
    this.status = status;
    this.action = action;
  }
}
