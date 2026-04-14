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
  name: archer.name,
  created_at: formatDateForDb(archer.createdAt),
  offboarded_at: formatDateForDbOrNull(archer.offboardedAt),
});

export const toCreateArcherInput = (
  dto: ArcherCreateDto,
): CreateArcherInput => ({
  name: dto.name,
  authUserId: dto.auth_user_id,
  offboardedAt: parseDbDateStringOrNull(dto.offboarded_at),
});

export const toUpdateArcherInput = (
  dto: ArcherUpdateDto,
): UpdateArcherInput => ({
  name: dto.name,
  authUserId: dto.auth_user_id,
  offboardedAt: parseDbDateStringOrNull(dto.offboarded_at),
});
