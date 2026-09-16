import type { StayDurationCategory } from '@/lib/types';

export type ReviewPhotoItem = {
  file: File;
  previewUrl: string;
};

export type SubRatingCategory =
  | 'cleanliness'
  | 'landlord'
  | 'quietness'
  | 'location'
  | 'wifi'
  | 'cleanlinessRating'
  | 'landlordRating'
  | 'quietnessRating'
  | 'locationRating'
  | 'wifiRating';

export type PublishReviewState = {
  overallRating: number;
  hoverRating: number;
  showSubRatings: boolean;
  cleanlinessRating: number | null;
  landlordRating: number | null;
  quietnessRating: number | null;
  wifiRating: number | null;
  stayDuration: StayDurationCategory;
  comment: string;
  selectedFiles: ReviewPhotoItem[];
  isSubmitting: boolean;
  errorMessage: string | null;
  successBanner: boolean;
};

export const initialPublishReviewState: PublishReviewState = {
  overallRating: 5,
  hoverRating: 0,
  showSubRatings: false,
  cleanlinessRating: null,
  landlordRating: null,
  quietnessRating: null,
  wifiRating: null,
  stayDuration: 'ONE_SEMESTER',
  comment: '',
  selectedFiles: [],
  isSubmitting: false,
  errorMessage: null,
  successBanner: false,
};

export type PublishReviewAction =
  | {
      type: 'SET_OVERALL_RATING';
      rating?: number;
      overallRating?: number;
      value?: number;
    }
  | {
      type: 'SET_SUB_RATING';
      category: SubRatingCategory;
      rating?: number | null;
      value?: number | null;
    }
  | {
      type: 'SET_COMMENT';
      comment?: string;
      value?: string;
    }
  | {
      type: 'SET_DURATION';
      duration?: StayDurationCategory;
      stayDuration?: StayDurationCategory;
    }
  | {
      type: 'ADD_PHOTO';
      photo?: ReviewPhotoItem;
      photos?: ReviewPhotoItem[];
    }
  | {
      type: 'REMOVE_PHOTO';
      index: number;
    }
  | {
      type: 'RESET';
    }
  | {
      type: 'SET_HOVER_RATING';
      rating: number;
    }
  | {
      type: 'TOGGLE_SUB_RATINGS';
    }
  | {
      type: 'SET_SUBMITTING';
      isSubmitting: boolean;
    }
  | {
      type: 'SET_ERROR';
      error: string | null;
    }
  | {
      type: 'SET_SUCCESS';
      success: boolean;
    };

function resolveSubRatingField(
  category: SubRatingCategory,
): 'cleanlinessRating' | 'landlordRating' | 'quietnessRating' | 'wifiRating' | null {
  if (category === 'cleanliness' || category === 'cleanlinessRating') {
    return 'cleanlinessRating';
  }
  if (category === 'landlord' || category === 'landlordRating') {
    return 'landlordRating';
  }
  if (
    category === 'quietness' ||
    category === 'quietnessRating' ||
    category === 'location' ||
    category === 'locationRating'
  ) {
    return 'quietnessRating';
  }
  if (category === 'wifi' || category === 'wifiRating') {
    return 'wifiRating';
  }
  return null;
}

export function publishReviewReducer(
  state: PublishReviewState = initialPublishReviewState,
  action: PublishReviewAction,
): PublishReviewState {
  switch (action.type) {
    case 'SET_OVERALL_RATING': {
      const rating = action.rating ?? action.overallRating ?? action.value ?? 5;
      return {
        ...state,
        overallRating: rating,
      };
    }
    case 'SET_SUB_RATING': {
      const field = resolveSubRatingField(action.category);
      if (!field) {
        return state;
      }
      const targetRating =
        action.rating !== undefined
          ? action.rating
          : action.value !== undefined
            ? action.value
            : null;
      const nextValue = state[field] === targetRating ? null : targetRating;
      return {
        ...state,
        [field]: nextValue,
      };
    }
    case 'SET_COMMENT': {
      const comment = action.comment ?? action.value ?? '';
      return {
        ...state,
        comment: comment.slice(0, 1000),
      };
    }
    case 'SET_DURATION': {
      const duration = action.duration ?? action.stayDuration;
      if (!duration) {
        return state;
      }
      return {
        ...state,
        stayDuration: duration,
      };
    }
    case 'ADD_PHOTO': {
      const toAdd = action.photos ?? (action.photo ? [action.photo] : []);
      const merged = [...state.selectedFiles, ...toAdd].slice(0, 3);
      return {
        ...state,
        selectedFiles: merged,
      };
    }
    case 'REMOVE_PHOTO': {
      if (action.index < 0 || action.index >= state.selectedFiles.length) {
        return state;
      }
      return {
        ...state,
        selectedFiles: state.selectedFiles.filter((_, idx) => idx !== action.index),
      };
    }
    case 'RESET':
      return initialPublishReviewState;
    case 'SET_HOVER_RATING':
      return {
        ...state,
        hoverRating: action.rating,
      };
    case 'TOGGLE_SUB_RATINGS':
      return {
        ...state,
        showSubRatings: !state.showSubRatings,
      };
    case 'SET_SUBMITTING':
      return {
        ...state,
        isSubmitting: action.isSubmitting,
      };
    case 'SET_ERROR':
      return {
        ...state,
        errorMessage: action.error,
      };
    case 'SET_SUCCESS':
      return {
        ...state,
        successBanner: action.success,
      };
    default:
      return state;
  }
}
