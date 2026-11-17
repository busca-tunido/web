import { cleanup, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalTitle,
} from '@/components/ui/responsive-modal';
import { useMediaQuery } from '@/hooks/use-media-query';

vi.mock('@/hooks/use-media-query', () => ({
  useMediaQuery: vi.fn(),
}));

function StatefulFormProbe() {
  const [draft, setDraft] = useState('initial');
  return (
    <input
      aria-label="Draft input"
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
    />
  );
}

describe('ResponsiveModal', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders centered dialog on desktop without mobile drag handle and drawer on mobile with handle', () => {
    vi.mocked(useMediaQuery).mockReturnValue(true);
    const { container, rerender } = render(
      <ResponsiveModal open={true} onOpenChange={vi.fn()}>
        <ResponsiveModalContent showClose={false}>
          <ResponsiveModalTitle>Desktop modal</ResponsiveModalTitle>
        </ResponsiveModalContent>
      </ResponsiveModal>,
    );

    expect(screen.getByRole('dialog', { name: 'Desktop modal' })).toBeDefined();
    expect(document.querySelector('[data-slot="dialog-content"]')).not.toBeNull();
    expect(document.querySelector('[data-slot="drawer-content"]')).toBeNull();
    expect(container.querySelector('.rounded-full.bg-muted-foreground\\/30')).toBeNull();

    vi.mocked(useMediaQuery).mockReturnValue(false);
    rerender(
      <ResponsiveModal open={false} onOpenChange={vi.fn()}>
        <ResponsiveModalContent showClose={false}>
          <ResponsiveModalTitle>Mobile drawer</ResponsiveModalTitle>
        </ResponsiveModalContent>
      </ResponsiveModal>,
    );
    rerender(
      <ResponsiveModal open={true} onOpenChange={vi.fn()}>
        <ResponsiveModalContent showClose={false}>
          <ResponsiveModalTitle>Mobile drawer</ResponsiveModalTitle>
        </ResponsiveModalContent>
      </ResponsiveModal>,
    );

    const drawerContent = document.querySelector('[data-slot="drawer-content"]');
    expect(drawerContent).not.toBeNull();
    expect(drawerContent?.querySelector('.rounded-full')).not.toBeNull();
  });

  it('locks active modal variant while open across viewport resizes', () => {
    vi.mocked(useMediaQuery).mockReturnValue(false);
    const { rerender } = render(
      <ResponsiveModal open={true} onOpenChange={vi.fn()}>
        <ResponsiveModalContent showClose={false}>
          <ResponsiveModalTitle>Stateful modal</ResponsiveModalTitle>
          <StatefulFormProbe />
        </ResponsiveModalContent>
      </ResponsiveModal>,
    );

    const inputBeforeResize = screen.getByLabelText('Draft input') as HTMLInputElement;
    expect(document.querySelector('[data-slot="drawer-content"]')).not.toBeNull();

    vi.mocked(useMediaQuery).mockReturnValue(true);
    rerender(
      <ResponsiveModal open={true} onOpenChange={vi.fn()}>
        <ResponsiveModalContent showClose={false}>
          <ResponsiveModalTitle>Stateful modal</ResponsiveModalTitle>
          <StatefulFormProbe />
        </ResponsiveModalContent>
      </ResponsiveModal>,
    );

    const inputAfterResize = screen.getByLabelText('Draft input') as HTMLInputElement;
    expect(inputAfterResize).toBe(inputBeforeResize);
    expect(document.querySelector('[data-slot="drawer-content"]')).not.toBeNull();
    expect(document.querySelector('[data-slot="dialog-content"]')).toBeNull();
  });

  it('renders forced opaque blur overlay for nested second modals on both desktop and mobile', () => {
    vi.mocked(useMediaQuery).mockReturnValue(true);
    const { unmount } = render(
      <ResponsiveModal open={true} onOpenChange={vi.fn()}>
        <ResponsiveModalContent showClose={false}>
          <ResponsiveModalTitle>Parent desktop modal</ResponsiveModalTitle>
          <ResponsiveModal open={true} onOpenChange={vi.fn()}>
            <ResponsiveModalContent showClose={false}>
              <ResponsiveModalTitle>Nested desktop modal</ResponsiveModalTitle>
            </ResponsiveModalContent>
          </ResponsiveModal>
        </ResponsiveModalContent>
      </ResponsiveModal>,
    );

    const dialogOverlays = document.querySelectorAll('[data-slot="dialog-overlay"]');
    expect(dialogOverlays.length).toBe(2);
    expect(dialogOverlays[1].className).toContain('bg-black/55');
    expect(dialogOverlays[1].className).toContain('backdrop-blur-xs');
    unmount();

    vi.mocked(useMediaQuery).mockReturnValue(false);
    render(
      <ResponsiveModal open={true} onOpenChange={vi.fn()}>
        <ResponsiveModalContent showClose={false}>
          <ResponsiveModalTitle>Parent mobile drawer</ResponsiveModalTitle>
          <ResponsiveModal open={true} onOpenChange={vi.fn()}>
            <ResponsiveModalContent showClose={false}>
              <ResponsiveModalTitle>Nested mobile drawer</ResponsiveModalTitle>
            </ResponsiveModalContent>
          </ResponsiveModal>
        </ResponsiveModalContent>
      </ResponsiveModal>,
    );

    const drawerOverlays = document.querySelectorAll('[data-slot="drawer-overlay"]');
    expect(drawerOverlays.length).toBe(2);
    expect(drawerOverlays[1].className).toContain('bg-black/55');
  });
});
