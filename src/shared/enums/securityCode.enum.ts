export enum SecurityCodeTypes {
  RESET_PASSWORD = 'RESET_PASSWORD',
}

export enum EmailTypes {
  RESET_PASSWORD = 'RESET_PASSWORD',
  UPDATED_PASSWORD = 'UPDATED_PASSWORD',
}

export enum SecurityCodeStatus {
  VALID = 'VALID',
  USED = 'USED',
  EXPIRED = 'EXPIRED',
}

export enum SecurityCodeEmailsSent {
  FIRST_EMAIL_SENT = 1,
}
