import type { PensionItem } from '@/lib/types';

export type EditDraftState = {
  activeAmenities: string[];
  monthlyPrice: number;
  deposit: number;
  waterIncluded: boolean;
  electricityIncluded: boolean;
  gasIncluded: boolean;
  internetIncluded: boolean;
  curfewText: string;
  guestsAllowed: boolean;
  petsAllowed: boolean;
  smokingAllowed: boolean;
  title: string;
  description: string;
  address: string;
  neighborhood: string;
  city: string;
  submissionNotes: string;
};

export type SuggestEditAction =
  | {
      [K in keyof EditDraftState]: {
        type: 'SET_FIELD';
        field: K;
        value: EditDraftState[K];
      };
    }[keyof EditDraftState]
  | {
      type: 'TOGGLE_AMENITY';
      slug: string;
      amenity?: string;
    }
  | {
      type: 'RESET_TO_PENSION';
      pension: PensionItem;
    }
  | {
      type: 'SET_SUBMISSION_NOTES';
      notes?: string;
      value?: string;
    };

export function createInitialSuggestEditState(pension: PensionItem): EditDraftState {
  const activeAmenities: string[] =
    pension.amenities && pension.amenities.length > 0 ? [...pension.amenities] : [];

  if (activeAmenities.length === 0) {
    if (pension.includesWifi) activeAmenities.push('wifi-alta-velocidad');
    if (pension.includesMeals) activeAmenities.push('cocina-equipada');
    if (pension.includesLaundry) activeAmenities.push('lavadora-secadora');
    if (pension.includesStudyRoom) activeAmenities.push('sala-estudio-cowork');
  }

  return {
    activeAmenities,
    monthlyPrice: pension.priceMonthlyClp,
    deposit: pension.depositClp,
    waterIncluded: Boolean(pension.waterIncluded),
    electricityIncluded: Boolean(pension.electricityIncluded),
    gasIncluded: Boolean(pension.gasIncluded),
    internetIncluded: Boolean(pension.internetIncluded ?? pension.includesWifi),
    curfewText: pension.curfewTime || '',
    guestsAllowed: Boolean(pension.guestsAllowed),
    petsAllowed: Boolean(pension.petsAllowed),
    smokingAllowed: Boolean(pension.smokingAllowed),
    title: pension.title,
    description: pension.description || '',
    address: pension.address || '',
    neighborhood: pension.neighborhood || '',
    city: pension.city,
    submissionNotes: '',
  };
}

export const defaultSuggestEditState: EditDraftState = {
  activeAmenities: [],
  monthlyPrice: 0,
  deposit: 0,
  waterIncluded: true,
  electricityIncluded: true,
  gasIncluded: true,
  internetIncluded: false,
  curfewText: '',
  guestsAllowed: false,
  petsAllowed: false,
  smokingAllowed: false,
  title: '',
  description: '',
  address: '',
  neighborhood: '',
  city: '',
  submissionNotes: '',
};

export function suggestEditReducer(
  state: EditDraftState = defaultSuggestEditState,
  action: SuggestEditAction,
): EditDraftState {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        [action.field]: action.value,
      } as EditDraftState;
    case 'TOGGLE_AMENITY': {
      const slug = action.slug || action.amenity || '';
      const exists = state.activeAmenities.includes(slug);
      return {
        ...state,
        activeAmenities: exists
          ? state.activeAmenities.filter((item) => item !== slug)
          : [...state.activeAmenities, slug],
      };
    }
    case 'RESET_TO_PENSION':
      return createInitialSuggestEditState(action.pension);
    case 'SET_SUBMISSION_NOTES': {
      const notes = action.notes ?? action.value ?? '';
      return {
        ...state,
        submissionNotes: notes,
      };
    }
    default:
      return state;
  }
}

export function calculateProposedDiff(
  original: PensionItem,
  current: EditDraftState,
): Record<string, unknown> {
  const changes: Record<string, unknown> = {};

  if (current.title !== original.title) {
    changes.title = current.title.trim();
  }
  if (current.description !== original.description) {
    changes.description = current.description.trim();
  }
  if (current.address !== original.address) {
    changes.address = current.address.trim();
  }
  if (current.neighborhood !== original.neighborhood) {
    changes.neighborhood = current.neighborhood.trim();
  }
  if (current.city !== original.city) {
    changes.city = current.city.trim();
  }
  if (current.monthlyPrice !== original.priceMonthlyClp) {
    changes.baseMonthlyPrice = current.monthlyPrice;
  }
  if (current.deposit !== original.depositClp) {
    changes.deposit = current.deposit;
  }

  if (current.waterIncluded !== Boolean(original.waterIncluded)) {
    changes.waterIncluded = current.waterIncluded;
  }
  if (current.electricityIncluded !== Boolean(original.electricityIncluded)) {
    changes.electricityIncluded = current.electricityIncluded;
  }
  if (current.gasIncluded !== Boolean(original.gasIncluded)) {
    changes.gasIncluded = current.gasIncluded;
  }
  if (current.internetIncluded !== Boolean(original.internetIncluded ?? original.includesWifi)) {
    changes.internetIncluded = current.internetIncluded;
  }
  if (current.guestsAllowed !== Boolean(original.guestsAllowed)) {
    changes.guestsAllowed = current.guestsAllowed;
  }
  if (current.petsAllowed !== Boolean(original.petsAllowed)) {
    changes.petsAllowed = current.petsAllowed;
  }
  if (current.smokingAllowed !== Boolean(original.smokingAllowed)) {
    changes.smokingAllowed = current.smokingAllowed;
  }

  if (current.curfewText.trim()) {
    changes.curfewTime = current.curfewText.trim();
  }

  const originalAmenities: string[] =
    original.amenities && original.amenities.length > 0 ? [...original.amenities] : [];

  if (originalAmenities.length === 0) {
    if (original.includesWifi) {
      originalAmenities.push('wifi-alta-velocidad');
    }
    if (original.includesMeals) {
      originalAmenities.push('cocina-equipada');
    }
    if (original.includesLaundry) {
      originalAmenities.push('lavadora-secadora');
    }
    if (original.includesStudyRoom) {
      originalAmenities.push('sala-estudio-cowork');
    }
  }

  const amenitiesToAdd = current.activeAmenities.filter(
    (amenity) => !originalAmenities.includes(amenity),
  );
  const amenitiesToRemove = originalAmenities.filter(
    (amenity) => !current.activeAmenities.includes(amenity),
  );

  if (amenitiesToAdd.length > 0) {
    changes.amenitiesToAdd = amenitiesToAdd;
  }
  if (amenitiesToRemove.length > 0) {
    changes.amenitiesToRemove = amenitiesToRemove;
  }

  return changes;
}
