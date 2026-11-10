export type PensionDraftCandidate = {
  title?: string;
  description?: string;
  address?: string;
  baseMonthlyPrice?: string | number;
  deposit?: string | number;
  selectedAmenitySlugs?: string[];
  images?: string[];
};

export type RoomDraftCandidate = {
  title?: string;
  roomNumber?: string;
  description?: string;
  monthlyPrice?: string | number;
  deposit?: string | number;
  images?: string[];
};

export function isSubstantivePensionDraft(values: PensionDraftCandidate): boolean {
  if (values.title && values.title.trim().length >= 3) return true;
  if (values.description && values.description.trim().length >= 5) return true;
  if (values.address && values.address.trim().length >= 3) return true;
  if (values.baseMonthlyPrice && Number(values.baseMonthlyPrice) > 0) return true;
  if (values.deposit && Number(values.deposit) > 0) return true;
  if (values.selectedAmenitySlugs && values.selectedAmenitySlugs.length > 0) return true;
  if (values.images && values.images.length > 0) return true;
  return false;
}

export function isSubstantiveRoomDraft(values: RoomDraftCandidate): boolean {
  if (values.title && values.title.trim().length >= 3) return true;
  if (values.roomNumber && values.roomNumber.trim().length >= 1) return true;
  if (values.description && values.description.trim().length >= 5) return true;
  if (values.monthlyPrice && Number(values.monthlyPrice) > 0) return true;
  if (values.deposit && Number(values.deposit) > 0) return true;
  if (values.images && values.images.length > 0) return true;
  return false;
}
