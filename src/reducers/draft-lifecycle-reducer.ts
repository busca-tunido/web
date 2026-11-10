export type DraftStatus = 'IDLE' | 'AVAILABLE' | 'RESTORED' | 'DISCARDED';

export type DraftLifecycleState = {
  status: DraftStatus;
  isBannerVisible: boolean;
};

export const initialDraftLifecycleState: DraftLifecycleState = {
  status: 'IDLE',
  isBannerVisible: false,
};

export type DraftLifecycleAction =
  | { type: 'DRAFT_FOUND' }
  | { type: 'RESTORE' }
  | { type: 'DISCARD' }
  | { type: 'RESET' };

export function draftLifecycleReducer(
  state: DraftLifecycleState,
  action: DraftLifecycleAction,
): DraftLifecycleState {
  switch (action.type) {
    case 'DRAFT_FOUND':
      if (state.status === 'RESTORED' || state.status === 'DISCARDED') {
        return state;
      }
      return { status: 'AVAILABLE', isBannerVisible: true };
    case 'RESTORE':
      return { status: 'RESTORED', isBannerVisible: false };
    case 'DISCARD':
      return { status: 'DISCARDED', isBannerVisible: false };
    case 'RESET':
      return { status: 'IDLE', isBannerVisible: false };
    default:
      return state;
  }
}
