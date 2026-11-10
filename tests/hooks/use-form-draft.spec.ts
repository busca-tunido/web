import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useFormDraft } from '@/hooks/use-form-draft';
import { isSubstantivePensionDraft } from '@/lib/draft-validators';

describe('useFormDraft with lifecycle FSM', () => {
  const initialPension = {
    title: '',
    description: '',
    address: '',
    city: 'Santiago',
    baseMonthlyPrice: '',
  };

  beforeEach(() => {
    sessionStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts in IDLE state with hidden banner when sessionStorage is empty', () => {
    const { result } = renderHook(() =>
      useFormDraft({
        storageKey: 'test-pension',
        currentValues: initialPension,
        initialValues: initialPension,
        isEnabled: true,
        isSubstantive: isSubstantivePensionDraft,
      }),
    );

    expect(result.current.isBannerVisible).toBe(false);
    expect(result.current.hasDraft).toBe(false);
    expect(result.current.status).toBe('IDLE');
  });

  it('detects substantive draft on mount and displays banner with AVAILABLE state', () => {
    const savedDraft = {
      ...initialPension,
      title: 'Pensión Valparaíso',
      baseMonthlyPrice: '220000',
    };
    sessionStorage.setItem('buscatunido_draft_test-pension', JSON.stringify(savedDraft));

    const { result } = renderHook(() =>
      useFormDraft({
        storageKey: 'test-pension',
        currentValues: initialPension,
        initialValues: initialPension,
        isEnabled: true,
        isSubstantive: isSubstantivePensionDraft,
      }),
    );

    expect(result.current.isBannerVisible).toBe(true);
    expect(result.current.hasDraft).toBe(true);
    expect(result.current.status).toBe('AVAILABLE');
  });

  it('purges non-substantive junk drafts on mount and keeps banner hidden', () => {
    const junkDraft = {
      ...initialPension,
      city: 'Santiago',
    };
    sessionStorage.setItem('buscatunido_draft_test-pension', JSON.stringify(junkDraft));

    const { result } = renderHook(() =>
      useFormDraft({
        storageKey: 'test-pension',
        currentValues: initialPension,
        initialValues: initialPension,
        isEnabled: true,
        isSubstantive: isSubstantivePensionDraft,
      }),
    );

    expect(result.current.isBannerVisible).toBe(false);
    expect(result.current.status).toBe('IDLE');
    expect(sessionStorage.getItem('buscatunido_draft_test-pension')).toBeNull();
  });

  it('restores draft, returns parsed data, and immediately hides banner', () => {
    const savedDraft = {
      ...initialPension,
      title: 'Pensión Valparaíso',
      baseMonthlyPrice: '220000',
    };
    sessionStorage.setItem('buscatunido_draft_test-pension', JSON.stringify(savedDraft));

    const { result } = renderHook(() =>
      useFormDraft({
        storageKey: 'test-pension',
        currentValues: initialPension,
        initialValues: initialPension,
        isEnabled: true,
        isSubstantive: isSubstantivePensionDraft,
      }),
    );

    expect(result.current.isBannerVisible).toBe(true);

    let restored: typeof initialPension | null = null;
    act(() => {
      restored = result.current.restoreDraft();
    });

    expect(restored).toEqual(savedDraft);
    expect(result.current.status).toBe('RESTORED');
    expect(result.current.isBannerVisible).toBe(false);
    expect(result.current.hasDraft).toBe(false);
  });

  it('clears draft, purges storage, and immediately hides banner on discard', () => {
    const savedDraft = {
      ...initialPension,
      title: 'Pensión Valparaíso',
      baseMonthlyPrice: '220000',
    };
    sessionStorage.setItem('buscatunido_draft_test-pension', JSON.stringify(savedDraft));

    const { result } = renderHook(() =>
      useFormDraft({
        storageKey: 'test-pension',
        currentValues: initialPension,
        initialValues: initialPension,
        isEnabled: true,
        isSubstantive: isSubstantivePensionDraft,
      }),
    );

    expect(result.current.isBannerVisible).toBe(true);

    act(() => {
      result.current.clearDraft();
    });

    expect(result.current.status).toBe('DISCARDED');
    expect(result.current.isBannerVisible).toBe(false);
    expect(sessionStorage.getItem('buscatunido_draft_test-pension')).toBeNull();
  });

  it('saves to storage during active editing without showing banner during typing', () => {
    let current = { ...initialPension };
    const { result, rerender } = renderHook(() =>
      useFormDraft({
        storageKey: 'test-pension',
        currentValues: current,
        initialValues: initialPension,
        isEnabled: true,
        isSubstantive: isSubstantivePensionDraft,
      }),
    );

    expect(result.current.isBannerVisible).toBe(false);

    current = { ...initialPension, title: 'Nueva Pensión Universidad' };
    rerender();

    act(() => {
      vi.advanceTimersByTime(650);
    });

    const stored = sessionStorage.getItem('buscatunido_draft_test-pension');
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored || '{}').title).toBe('Nueva Pensión Universidad');
    expect(result.current.isBannerVisible).toBe(false);
  });

  it('redisplays restore banner upon reopening drawer after restoring and applying changes', () => {
    const savedDraft = {
      ...initialPension,
      title: 'Pensión Original',
      baseMonthlyPrice: '200000',
    };
    sessionStorage.setItem('buscatunido_draft_test-pension', JSON.stringify(savedDraft));

    let isEnabled = true;
    let current = { ...initialPension };

    const { result, rerender } = renderHook(() =>
      useFormDraft({
        storageKey: 'test-pension',
        currentValues: current,
        initialValues: initialPension,
        isEnabled,
        isSubstantive: isSubstantivePensionDraft,
      }),
    );

    expect(result.current.isBannerVisible).toBe(true);
    expect(result.current.status).toBe('AVAILABLE');

    let restored: typeof initialPension | null = null;
    act(() => {
      restored = result.current.restoreDraft();
    });
    expect(restored).toEqual(savedDraft);
    expect(result.current.status).toBe('RESTORED');
    expect(result.current.isBannerVisible).toBe(false);

    const restoredData = restored ?? initialPension;
    current = { ...restoredData, title: 'Pensión Modificada' };
    rerender();

    act(() => {
      vi.advanceTimersByTime(650);
    });

    isEnabled = false;
    current = { ...initialPension };
    rerender();

    expect(result.current.status).toBe('IDLE');
    expect(result.current.isBannerVisible).toBe(false);

    isEnabled = true;
    rerender();

    expect(result.current.status).toBe('AVAILABLE');
    expect(result.current.isBannerVisible).toBe(true);

    let secondRestored: typeof initialPension | null = null;
    act(() => {
      secondRestored = result.current.restoreDraft();
    });
    const secondRestoredData = secondRestored as typeof initialPension | null;
    expect(secondRestoredData?.title).toBe('Pensión Modificada');
  });

  it('flushes pending debounced draft when drawer closes before timer expires', () => {
    let isEnabled = true;
    let current = { ...initialPension };

    const { result, rerender } = renderHook(() =>
      useFormDraft({
        storageKey: 'test-pension',
        currentValues: current,
        initialValues: initialPension,
        isEnabled,
        isSubstantive: isSubstantivePensionDraft,
      }),
    );

    current = {
      ...initialPension,
      title: 'Guardado Inmediato Al Cerrar',
      baseMonthlyPrice: '150000',
    };
    rerender();

    isEnabled = false;
    current = { ...initialPension };
    rerender();

    const stored = sessionStorage.getItem('buscatunido_draft_test-pension');
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored || '{}').title).toBe('Guardado Inmediato Al Cerrar');

    isEnabled = true;
    rerender();

    expect(result.current.status).toBe('AVAILABLE');
    expect(result.current.isBannerVisible).toBe(true);
  });
});
