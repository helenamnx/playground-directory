import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

@Injectable()
export class AsyncStorageService {
  constructor() {}
  private readonly storage = new AsyncLocalStorage<Map<string, any>>();

  run(callback: () => void, context: Map<string, any>) {
    this.storage.run(context, callback);
  }

  getStore(): Map<string, any> | undefined {
    return this.storage.getStore();
  }

  set(key: string, value: any) {
    const store = this.getStore();
    if (store) {
      store.set(key, value);
    }
  }

  get(key: string): any {
    const store = this.getStore();
    return store ? store.get(key) : undefined;
  }
}
