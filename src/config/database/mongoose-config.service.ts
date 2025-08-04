import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';

@Injectable()
export class MongooseConfigService implements MongooseOptionsFactory {
  private DB: MongooseModuleOptions;
  private readonly defaultDB: MongooseModuleOptions = {};
  private nodeEnv: string;

  constructor(private readonly configService: ConfigService) {
    this.DB = this.configService.get<MongooseModuleOptions>(
      'database',
      this.defaultDB,
    );
    this.nodeEnv = this.configService.get<string>('app.nodeEnv');
  }

  createMongooseOptions(): MongooseModuleOptions {
    const { uri, dbName, user, pass } = this.DB;
    let config: any = {
      uri: uri,
      dbName: dbName,
    };
    if (this.nodeEnv !== 'test') {
      config.user = user;
      config.pass = pass;
    }

    return config;
  }
}
