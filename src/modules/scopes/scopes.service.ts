import { Injectable } from '@nestjs/common';
import { CreateScopeDto } from './dto/create-scope.dto';
import { UpdateScopeDto } from './dto/update-scope.dto';

@Injectable()
export class ScopesService {
  create(createScopeDto: CreateScopeDto) {
    return 'This action adds a new scope';
  }

  findAll() {
    return `This action returns all scopes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} scope`;
  }

  update(id: number, updateScopeDto: UpdateScopeDto) {
    return `This action updates a #${id} scope`;
  }

  remove(id: number) {
    return `This action removes a #${id} scope`;
  }
}
