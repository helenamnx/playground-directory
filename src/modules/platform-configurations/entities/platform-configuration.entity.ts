export class PlatformConfiguration {
  isActive?: boolean = true;
  theme?: string = 'default';
  menuOptions?: any[] = [];

  constructor(data?: Partial<PlatformConfiguration>) {
    Object.assign(this, data);
  }
}
