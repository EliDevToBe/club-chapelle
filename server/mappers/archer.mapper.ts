import type {
  CreateArcherInput,
  UpdateArcherInput,
} from "~~/application/ports/archer-repository.port";
import type { Archer } from "~~/domain/archer/archer";
import type {
  ArcherCreateDto,
  ArcherDto,
  ArcherUpdateDto,
} from "~~/shared/archer/archer.dto";
import {
  formatDateForDb,
  formatDateForDbOrNull,
  parseDbDateStringOrNull,
} from "~~/shared/utils/dates";

export const toArcherDto = (archer: Archer): ArcherDto => ({
  id: archer.id,
  auth_user_id: archer.authUserId,
  public_name: archer.publicName,
  created_at: formatDateForDb(archer.createdAt),
  offboarded_at: formatDateForDbOrNull(archer.offboardedAt),
});

export const toCreateArcherInput = (
  dto: ArcherCreateDto,
): CreateArcherInput => ({
  publicName: dto.public_name,
  authUserId: dto.auth_user_id,
  offboardedAt: parseDbDateStringOrNull(dto.offboarded_at),
});

export const toUpdateArcherInput = (
  dto: ArcherUpdateDto,
): UpdateArcherInput => ({
  publicName: dto.public_name,
  authUserId: dto.auth_user_id,
  offboardedAt: parseDbDateStringOrNull(dto.offboarded_at),
});
