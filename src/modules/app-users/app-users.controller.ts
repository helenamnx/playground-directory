import { Controller, Get, Param, Put, Body, Delete, Post, Req } from '@nestjs/common';
import { AppUsersService } from './app-users.service';
import { UpdateAppUserDto } from './dto/update-app-user.dto';
import { ConfigService } from '@nestjs/config';
import { RegisterAppUserDto } from './dto/register-app-user.dto';
import { CustomErrorKeys } from '@/shared/enums/error-keys.enum';
import { UnauthorizedCustomResponse } from '@/shared/responses/error/custom-error-response';

@Controller('app-users')
export class AppUsersController {
  private readonly cryptoSecretKey: string;
  constructor(private readonly appUsersService: AppUsersService,
        private readonly configService: ConfigService,
  ) {
    this.cryptoSecretKey = this.configService.get<string>(
      'crypto.CRYPTO_SECRET_KEY',
    );
  }


  @Get()
  findAll() {
    return this.appUsersService.findAll({
      populateOptions: ['user'],
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appUsersService.findOne({ filterOptions: { _id: id } });
  }

  @Put()
  update(@Body() updateAppUserDto: UpdateAppUserDto) {
    return this.appUsersService.updateAppUser(updateAppUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appUsersService.remove(id);
  }
}
