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
  const activeAmenities: string[] = [];
  if (pension.includesWifi) activeAmenities.push('wifi-alta-velocidad');
  if (pension.includesMeals) activeAmenities.push('comida-incluida');
  if (pension.includesLaundry) activeAmenities.push('lavanderia');
  if (pension.includesStudyRoom) activeAmenities.push('sala-estudio');

  return {
    activeAmenities,
    monthlyPrice: pension.priceMonthlyClp,
    deposit: pension.depositClp,
    waterIncluded: true,
    electricityIncluded: true,
    gasIncluded: true,
    internetIncluded: pension.includesWifi,
    curfewText: pension.curfewDescription || '',
    guestsAllowed: pension.visitsPolicy?.toLowerCase().includes('permitidas') ?? false,
    petsAllowed: false,
    smokingAllowed: false,
    title: pension.title,
    description: pension.description,
    address: pension.address,
    neighborhood: pension.neighborhood,
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

  changes.waterIncluded = current.waterIncluded;
  changes.electricityIncluded = current.electricityIncluded;
  changes.gasIncluded = current.gasIncluded;
  changes.internetIncluded = current.internetIncluded;
  changes.guestsAllowed = current.guestsAllowed;
  changes.petsAllowed = current.petsAllowed;
  changes.smokingAllowed = current.smokingAllowed;

  if (current.curfewText.trim()) {
    changes.curfewTime = current.curfewText.trim();
  }

  const originalAmenities: string[] = [];
  if (original.includesWifi) {
    originalAmenities.push('wifi-alta-velocidad');
  }
  if (original.includesMeals) {
    originalAmenities.push('comida-incluida');
  }
  if (original.includesLaundry) {
    originalAmenities.push('lavanderia');
  }
  if (original.includesStudyRoom) {
    originalAmenities.push('sala-estudio');
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
