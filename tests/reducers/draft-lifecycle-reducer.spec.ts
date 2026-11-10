import { describe, expect, it } from 'vitest';
import {
  draftLifecycleReducer,
  initialDraftLifecycleState,
} from '@/reducers/draft-lifecycle-reducer';

describe('draftLifecycleReducer', () => {
  it('starts at initial state IDLE with banner hidden', () => {
    expect(initialDraftLifecycleState).toEqual({
      status: 'IDLE',
      isBannerVisible: false,
    });
  });

  it('transitions from IDLE to AVAILABLE on DRAFT_FOUND', () => {
    const nextState = draftLifecycleReducer(initialDraftLifecycleState, {
      type: 'DRAFT_FOUND',
    });
    expect(nextState).toEqual({
      status: 'AVAILABLE',
      isBannerVisible: true,
    });
  });

  it('transitions from AVAILABLE to RESTORED on RESTORE and hides banner', () => {
    const availableState = { status: 'AVAILABLE' as const, isBannerVisible: true };
    const nextState = draftLifecycleReducer(availableState, {
      type: 'RESTORE',
    });
    expect(nextState).toEqual({
      status: 'RESTORED',
      isBannerVisible: false,
    });
  });

  it('ignores subsequent DRAFT_FOUND when already in RESTORED state', () => {
    const restoredState = { status: 'RESTORED' as const, isBannerVisible: false };
    const nextState = draftLifecycleReducer(restoredState, {
      type: 'DRAFT_FOUND',
    });
    expect(nextState).toEqual(restoredState);
  });

  it('transitions from AVAILABLE to DISCARDED on DISCARD and hides banner', () => {
    const availableState = { status: 'AVAILABLE' as const, isBannerVisible: true };
    const nextState = draftLifecycleReducer(availableState, {
      type: 'DISCARD',
    });
    expect(nextState).toEqual({
      status: 'DISCARDED',
      isBannerVisible: false,
    });
  });

  it('ignores subsequent DRAFT_FOUND when already in DISCARDED state', () => {
    const discardedState = { status: 'DISCARDED' as const, isBannerVisible: false };
    const nextState = draftLifecycleReducer(discardedState, {
      type: 'DRAFT_FOUND',
    });
    expect(nextState).toEqual(discardedState);
  });

  it('transitions to IDLE on RESET from any state', () => {
    const restoredState = { status: 'RESTORED' as const, isBannerVisible: false };
    const nextState = draftLifecycleReducer(restoredState, {
      type: 'RESET',
    });
    expect(nextState).toEqual({
      status: 'IDLE',
      isBannerVisible: false,
    });
  });
});
