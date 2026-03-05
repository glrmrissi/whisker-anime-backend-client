import { SetMetadata } from '@nestjs/common';
import { RolesEnum } from 'src/shared/enum/roles.enum';

export const CHECK_OWNER_KEY = 'checkOwner';

export const IsOwnerCheck = (bypass?: RolesEnum[]) => {
  const roles = bypass?.length
    ? bypass
    : [RolesEnum.ADMIN, RolesEnum.ADMIN_MASTER, RolesEnum.OWNER];
  return SetMetadata(CHECK_OWNER_KEY, roles);
};
