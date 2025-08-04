export class CustomSuccessResponse {
  object: unknown;
  action: string | undefined;

  constructor(params: CustomSuccessResponse) {
    const { object, action } = params;
    this.object = object;
    this.action = action;
  }
}
