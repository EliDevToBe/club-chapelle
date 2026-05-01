import type { ParticipationWithArcherSummary } from "~~/application/ports/participation-repository.port";
import type { Competition } from "~~/domain/competitions/competition";
import { toCompetitionDto } from "~~/server/mappers/competition.mapper";
import type {
  CompetitionListingDto,
  ParticipationBrowseRowDto,
} from "~~/shared/competitions/competition-listing.dto";
import type { RoleEnum } from "~~/shared/db-enums";
import { formatDateForDb } from "~~/shared/utils/dates";

export const viewerIsAdminForBrowse = (roles: readonly RoleEnum[]): boolean => {
  return roles.includes("admin") || roles.includes("developer");
};

export const toParticipationBrowseRowDto = (
  row: ParticipationWithArcherSummary,
  viewer: { userId: string; roles: readonly RoleEnum[] },
): ParticipationBrowseRowDto => {
  const isAdmin = viewerIsAdminForBrowse(viewer.roles);
  const isOwn =
    row.archerAuthUserId !== null && row.archerAuthUserId === viewer.userId;
  const showStatuses = isAdmin || isOwn;

  return {
    id: row.id,
    archer_id: row.archerId,
    archer_public_name: row.archerPublicName,
    archer_auth_user_id: row.archerAuthUserId,
    competition_id: row.competitionId,
    registration_status: showStatuses ? row.registrationStatus : null,
    payment_status: showStatuses ? row.paymentStatus : null,
    payer: row.payer,
    distance: row.distance,
    target: row.target,
    weapon: row.weapon,
    created_at: formatDateForDb(row.createdAt),
  };
};

export const toCompetitionListingDto = (
  competition: Competition,
  participations: ParticipationWithArcherSummary[],
  viewer: { userId: string; roles: readonly RoleEnum[] },
): CompetitionListingDto => {
  return {
    ...toCompetitionDto(competition),
    participations: participations.map((p) => {
      return toParticipationBrowseRowDto(p, viewer);
    }),
  };
};
