import { AppUser } from '@/modules/app-users/schemas/app-user.schema';
import { Group } from '@/modules/groups/schemas/group.schema';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUserGroupDto {
  @IsString()
  @IsNotEmpty()
  appUserId: AppUser['_id'];

  @IsString()
  @IsNotEmpty()
  groupId: Group['_id'];
}
