import { describe, expect, it } from 'vitest';
import {
  isSubstantivePensionDraft,
  isSubstantiveRoomDraft,
} from '@/lib/draft-validators';

describe('draft-validators', () => {
  describe('isSubstantivePensionDraft', () => {
    it('returns false for empty or default values', () => {
      expect(isSubstantivePensionDraft({})).toBe(false);
      expect(
        isSubstantivePensionDraft({
          title: '',
          description: '',
          address: '',
          baseMonthlyPrice: '',
          selectedAmenitySlugs: [],
          images: [],
        }),
      ).toBe(false);
    });

    it('returns true when title has at least 3 characters', () => {
      expect(isSubstantivePensionDraft({ title: 'Pe' })).toBe(false);
      expect(isSubstantivePensionDraft({ title: 'Pensión Centro' })).toBe(true);
    });

    it('returns true when description has at least 5 characters', () => {
      expect(isSubstantivePensionDraft({ description: 'Hola' })).toBe(false);
      expect(isSubstantivePensionDraft({ description: 'Pensión universitaria acogedora' })).toBe(true);
    });

    it('returns true when address has at least 3 characters', () => {
      expect(isSubstantivePensionDraft({ address: 'Av' })).toBe(false);
      expect(isSubstantivePensionDraft({ address: 'Av. España 123' })).toBe(true);
    });

    it('returns true when baseMonthlyPrice is positive', () => {
      expect(isSubstantivePensionDraft({ baseMonthlyPrice: '0' })).toBe(false);
      expect(isSubstantivePensionDraft({ baseMonthlyPrice: '250000' })).toBe(true);
      expect(isSubstantivePensionDraft({ baseMonthlyPrice: 250000 })).toBe(true);
    });

    it('returns true when selectedAmenitySlugs is non-empty', () => {
      expect(isSubstantivePensionDraft({ selectedAmenitySlugs: ['wifi-alta-velocidad'] })).toBe(true);
    });

    it('returns true when images are present', () => {
      expect(isSubstantivePensionDraft({ images: ['https://example.com/pension.jpg'] })).toBe(true);
    });
  });

  describe('isSubstantiveRoomDraft', () => {
    it('returns false for empty values', () => {
      expect(isSubstantiveRoomDraft({})).toBe(false);
      expect(
        isSubstantiveRoomDraft({
          title: '',
          roomNumber: '',
          description: '',
          monthlyPrice: '',
          images: [],
        }),
      ).toBe(false);
    });

    it('returns true when roomNumber is provided', () => {
      expect(isSubstantiveRoomDraft({ roomNumber: '101' })).toBe(true);
    });

    it('returns true when title has at least 3 characters', () => {
      expect(isSubstantiveRoomDraft({ title: 'Ha' })).toBe(false);
      expect(isSubstantiveRoomDraft({ title: 'Habitación Individual' })).toBe(true);
    });

    it('returns true when monthlyPrice is positive', () => {
      expect(isSubstantiveRoomDraft({ monthlyPrice: '0' })).toBe(false);
      expect(isSubstantiveRoomDraft({ monthlyPrice: '180000' })).toBe(true);
      expect(isSubstantiveRoomDraft({ monthlyPrice: 180000 })).toBe(true);
    });

    it('returns true when images are present', () => {
      expect(isSubstantiveRoomDraft({ images: ['https://example.com/room.jpg'] })).toBe(true);
    });
  });
});
