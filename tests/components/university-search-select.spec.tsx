import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  filterUniversities,
  UniversitySearchSelect,
} from '@/components/auth/university-search-select';
import type { UniversityDto } from '@/types/api-contracts';

const mockUniversities: UniversityDto[] = [
  {
    id: 'uni-1',
    name: 'Universidad de Chile',
    acronym: 'UCHILE',
    city: 'Santiago',
    latitude: -33.4442,
    longitude: -70.6517,
  },
  {
    id: 'uni-2',
    name: 'Pontificia Universidad Católica de Chile',
    acronym: 'UC',
    city: 'Santiago',
    latitude: -33.4975,
    longitude: -70.6128,
  },
  {
    id: 'uni-3',
    name: 'Universidad de Concepción',
    acronym: 'UdeC',
    city: 'Concepción',
    latitude: -36.8298,
    longitude: -73.0366,
  },
  {
    id: 'uni-4',
    name: 'Universidad Técnica Federico Santa María',
    acronym: 'USM',
    city: 'Valparaíso',
    latitude: -33.0355,
    longitude: -71.595,
  },
];

describe('filterUniversities (non-strict search)', () => {
  it('matches regardless of word order (e.g. "chile universidad")', () => {
    const results = filterUniversities(mockUniversities, 'chile universidad');
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].acronym).toBe('UCHILE');
  });

  it('matches partial incomplete words (e.g. "universi catolica")', () => {
    const results = filterUniversities(mockUniversities, 'universi catolica');
    expect(results.length).toBe(1);
    expect(results[0].acronym).toBe('UC');
  });

  it('matches accents/tildes insensitively (e.g. "concepcion" matches "Concepción")', () => {
    const results = filterUniversities(mockUniversities, 'concepcion');
    expect(results.length).toBe(1);
    expect(results[0].acronym).toBe('UdeC');
  });

  it('matches uppercase and lowercase insensitively', () => {
    const resultsUpper = filterUniversities(mockUniversities, 'UCHILE');
    const resultsLower = filterUniversities(mockUniversities, 'uchile');
    expect(resultsUpper[0].id).toBe('uni-1');
    expect(resultsLower[0].id).toBe('uni-1');
  });

  it('matches aliases such as "puc" for UC or "santa maria" for USM', () => {
    const pucResults = filterUniversities(mockUniversities, 'puc');
    expect(pucResults.some((u) => u.acronym === 'UC')).toBe(true);

    const santaMariaResults = filterUniversities(mockUniversities, 'santa maria');
    expect(santaMariaResults.some((u) => u.acronym === 'USM')).toBe(true);
  });
});

describe('UniversitySearchSelect component', () => {
  it('renders closed initially with selected university display', () => {
    render(
      <UniversitySearchSelect
        universities={mockUniversities}
        value="uni-1"
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByText('Universidad de Chile')).toBeDefined();
    expect(screen.getByText('UCHILE')).toBeDefined();
  });

  it('opens dropdown on click, filters items, and selects item', async () => {
    const handleChange = vi.fn();
    render(
      <UniversitySearchSelect
        universities={mockUniversities}
        value=""
        onChange={handleChange}
      />,
    );

    const combobox = screen.getByRole('combobox');
    fireEvent.click(combobox);

    const searchInput = screen.getByPlaceholderText(/Buscar por nombre, sigla o ciudad/i);
    expect(searchInput).toBeDefined();

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'universi catolica' } });
    });

    const option = screen.getByText('Pontificia Universidad Católica de Chile');
    expect(option).toBeDefined();

    fireEvent.click(option);
    expect(handleChange).toHaveBeenCalledWith('uni-2');
  });
});
