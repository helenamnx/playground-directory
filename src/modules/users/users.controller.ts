import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Get()
  findAll(@Query('email') email: string) {
    if (email) {
      return this.usersService.findOne({
        filterOptions: { email: email },
        selectOptions: [
          '-password',
          '-history',
          '-externalIds',
          '-configuration',
        ],
      });
    }
    return this.usersService.findAll({
      selectOptions: [
        '-password',
        '-history',
        '-externalIds',
        '-configuration',
      ],
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne({
      filterOptions: { _id: id },
      selectOptions: [
        '-password',
        '-history',
        '-externalIds',
        '-configuration',
      ],
    });
  }

  @Patch()
  update(@Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
