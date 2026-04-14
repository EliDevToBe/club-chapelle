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
import { formatDateForDb } from "~~/shared/utils";

const dateOrNull = (value: Date | null): string | null =>
  value ? formatDateForDb(value) : null;

const parseDateOrNull = (value: string | null | undefined): Date | null =>
  value ? new Date(value) : null;

export const toArcherDto = (archer: Archer): ArcherDto => ({
  id: archer.id,
  auth_user_id: archer.authUserId,
  name: archer.name,
  created_at: formatDateForDb(archer.createdAt),
  offboarded_at: dateOrNull(archer.offboardedAt),
});

export const toCreateArcherInput = (
  dto: ArcherCreateDto,
): CreateArcherInput => ({
  name: dto.name,
  authUserId: dto.auth_user_id,
  offboardedAt: parseDateOrNull(dto.offboarded_at),
});

export const toUpdateArcherInput = (
  dto: ArcherUpdateDto,
): UpdateArcherInput => ({
  name: dto.name,
  authUserId: dto.auth_user_id,
  offboardedAt: parseDateOrNull(dto.offboarded_at),
});
