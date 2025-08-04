import { generateUUID } from '@/shared/utils/generate-uuid.util';

export class MenuOption {
  constructor(menuOption: any) {
    return {
      _id: generateUUID(),
      ...menuOption,
    };
  }
}
