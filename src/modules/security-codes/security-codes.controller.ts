import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { SecurityCodesService } from './security-codes.service';
import { CreateSecurityCodeDto } from './dto/create-security-code.dto';
import { UpdateSecurityCodeDto } from './dto/update-security-code.dto';
import { Roles } from '@/shared/decorators/user-scopes.decorator';
import { UserTokenGuard } from '@/shared/guards/user-token.guard';

@Controller('security-codes')
export class SecurityCodesController {
  constructor(private readonly securityCodesService: SecurityCodesService) {}

  @Post()
  @Roles(['administrator'])
  @UseGuards(UserTokenGuard)
  async create(@Body() createSecurityCodeDto: CreateSecurityCodeDto) {
    return await this.securityCodesService.create(createSecurityCodeDto);
  }

  @Get()
  @Roles(['administrator'])
  @UseGuards(UserTokenGuard)
  async findAll() {
    return await this.securityCodesService.findAll();
  }

  @Get('check/:id')
  @Roles(['administrator'])
  @UseGuards(UserTokenGuard)
  async checkSecurityCode(@Param('id') id: string) {
    return await this.securityCodesService.checkSecurityCode(id);
  }

  @Delete(':id')
  @Roles(['administrator'])
  @UseGuards(UserTokenGuard)
  async remove(@Param('id') id: string) {
    return this.securityCodesService.remove(id);
  }
}
