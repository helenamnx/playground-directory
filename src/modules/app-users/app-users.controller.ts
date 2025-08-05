import {
  Controller,
  Get,
  Param,
  Put,
  Body,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AppUsersService } from './app-users.service';
import { UpdateAppUserDto } from './dto/update-app-user.dto';
import { ConfigService } from '@nestjs/config';
import { AppUser } from './schemas/app-user.schema';
import { User } from '../users/schemas/user.schema';
import { UserTokenGuard } from '@/shared/guards/user-token.guard';
import { RolesEnum } from '@/shared/enums/roles.enum';
import { AsyncStorageService } from '@/shared/services/als/als.service';
import { AlsKeysEnum } from '@/shared/enums/als-keys.enum';
import {
  UserScope,
  Resource,
  Roles,
} from '@/shared/decorators/user-scopes.decorator';
import resourcesJson from '@/shared/json/resources.json';
import scopesJson from '@/shared/json/scopes.json';

@Controller('app-users')
export class AppUsersController {
  private readonly cryptoSecretKey: string;
  constructor(
    private readonly appUsersService: AppUsersService,
    private readonly configService: ConfigService,
    private readonly alsService: AsyncStorageService,
  ) {
    this.cryptoSecretKey = this.configService.get<string>(
      'crypto.CRYPTO_SECRET_KEY',
    );
  }

  @Get()
  @Roles([RolesEnum.ADMINISTRATOR])
  @Resource(resourcesJson.Users)
  @UserScope(scopesJson['users:view-all'])
  @UseGuards(UserTokenGuard)
  async findAll(@Query('moderationStatus') moderationStatus: string) {
    const filterOptions = this.alsService.get(AlsKeysEnum.FILTER_OPTIONS);
    const appUser = this.alsService.get(AlsKeysEnum.APP_USER);
    return this.appUsersService.findAllAppUsers({
      appUser: appUser,
      filterOptions: this.alsService.get(AlsKeysEnum.FILTER_OPTIONS),
      paginationParams: this.alsService.get(AlsKeysEnum.PAGINATION_PARAMS),
      moderationStatus: moderationStatus,
      language:
        filterOptions.language ||
        this.alsService.get(AlsKeysEnum.DEFAULT_LANGUAGE),
    });
  }

  @Get(':id')
  @Resource(resourcesJson.Users)
  @UserScope(scopesJson['users:view-all'])
  @UseGuards(UserTokenGuard)
  findOne(@Param('id') id: AppUser['_id']) {
    return this.appUsersService.findOneAppUserById(id);
  }

  @Put()
  @Roles([RolesEnum.ADMINISTRATOR, RolesEnum.SOCIO, RolesEnum.EXAMENES])
  @Resource(resourcesJson.Users)
  @UserScope(scopesJson['users:update-own-profile'])
  @UseGuards(UserTokenGuard)
  update(@Body() updateAppUserDto: UpdateAppUserDto) {
    return this.appUsersService.updateAppUser(updateAppUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appUsersService.remove(id);
  }
}
