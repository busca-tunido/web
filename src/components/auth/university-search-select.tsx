'use client';

import { Check, ChevronsUpDown, GraduationCap, Search, X } from 'lucide-react';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import type { UniversityDto } from '@/types/api-contracts';

export type UniversitySearchSelectProps = {
  id?: string;
  universities: UniversityDto[];
  value: string;
  onChange: (universityId: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  hasError?: boolean;
};

const UNIVERSITY_ALIASES: Record<string, string[]> = {
  UC: ['puc', 'catolica', 'pontificia', 'la catolica'],
  UCHILE: ['u de chile', 'la chile', 'universidad de chile'],
  USACH: ['usach', 'u de santiago'],
  UdeC: ['udec', 'u de conce', 'concepcion'],
  USM: ['utfsm', 'santa maria', 'federico santa maria'],
  PUCV: ['pucv', 'catolica de valparaiso'],
  UDP: ['udp', 'portales', 'diego portales'],
  UAI: ['uai', 'adolfo ibanez'],
  UNAB: ['unab', 'andres bello'],
  USS: ['uss', 'san sebastian'],
  UANDES: ['uandes', 'los andes'],
  UACH: ['uach', 'austral'],
  UV: ['uv', 'valparaiso'],
  UFRO: ['ufro', 'frontera', 'la frontera'],
  UTEM: ['utem', 'tecnologica metropolitana'],
  UBIOBIO: ['ubiobio', 'ubb', 'bio bio'],
  UCN: ['ucn', 'catolica del norte'],
  UCSC: ['ucsc', 'catolica de la santisima concepcion'],
  UCM: ['ucm', 'catolica del maule'],
  UCT: ['uct', 'catolica de temuco'],
  UTA: ['uta', 'tarapaca'],
  UNAP: ['unap', 'arturo prat'],
  UDA: ['uda', 'atacama'],
  ULS: ['uls', 'la serena'],
  UMCE: ['umce', 'pedagogico'],
  UOH: ['uoh', 'o higgins'],
  UMAG: ['umag', 'magallanes'],
  UAYSEN: ['uaysen', 'aysen'],
};

function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function scoreUniversity(uni: UniversityDto, queryTokens: string[]): number {
  const normName = normalizeText(uni.name);
  const normAcronym = normalizeText(uni.acronym);
  let score = 0;

  for (const token of queryTokens) {
    if (normAcronym === token) score += 50;
    else if (normAcronym.startsWith(token)) score += 25;
    else if (normAcronym.includes(token)) score += 10;

    if (normName.startsWith(token)) score += 20;
    else if (normName.includes(` ${token}`)) score += 15;
    else if (normName.includes(token)) score += 5;
  }
  return score;
}

export function filterUniversities(
  universities: UniversityDto[],
  searchQuery: string,
): UniversityDto[] {
  const normalizedQuery = normalizeText(searchQuery);
  if (!normalizedQuery) return universities;

  const queryTokens = normalizedQuery.split(' ').filter(Boolean);

  return universities
    .filter((uni) => {
      const aliasWords = UNIVERSITY_ALIASES[uni.acronym] || [];
      const searchableCorpus = normalizeText(
        `${uni.name} ${uni.acronym} ${uni.city || ''} ${aliasWords.join(' ')}`,
      );

      return queryTokens.every((token) => searchableCorpus.includes(token));
    })
    .sort((a, b) => scoreUniversity(b, queryTokens) - scoreUniversity(a, queryTokens));
}

export function UniversitySearchSelect({
  id = 'register-student-university',
  universities,
  value,
  onChange,
  onBlur,
  disabled = false,
  hasError = false,
}: UniversitySearchSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedUniversity = useMemo(
    () => universities.find((u) => u.id === value),
    [universities, value],
  );

  const filteredUniversities = useMemo(
    () => filterUniversities(universities, searchQuery),
    [universities, searchQuery],
  );

  const handleSelect = useCallback(
    (uniId: string) => {
      onChange(uniId);
      setIsOpen(false);
      setSearchQuery('');
      setActiveIndex(0);
    },
    [onChange],
  );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        onBlur?.();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onBlur]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < filteredUniversities.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : filteredUniversities.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = filteredUniversities[activeIndex];
      if (target) {
        handleSelect(target.id);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      onBlur?.();
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <input type="hidden" id={id} name="universityId" value={value} />

      <div
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-invalid={hasError}
        tabIndex={disabled ? -1 : 0}
        onClick={() => {
          if (!disabled) {
            setIsOpen((prev) => !prev);
          }
        }}
        onKeyDown={handleKeyDown}
        className={`min-h-12 w-full rounded-xl border bg-background px-3.5 py-2.5 flex items-center justify-between gap-2.5 text-left transition cursor-pointer select-none ${
          hasError
            ? 'border-destructive focus:ring-2 focus:ring-destructive/20'
            : isOpen
              ? 'border-primary ring-2 ring-primary/20'
              : 'border-border hover:border-border/80'
        } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <GraduationCap className="h-4 w-4" />
          </div>

          {selectedUniversity ? (
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-sm font-semibold text-foreground truncate">
                {selectedUniversity.name}
              </span>
              <Badge
                variant="secondary"
                className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 uppercase"
              >
                {selectedUniversity.acronym}
              </Badge>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground truncate">
              Buscar tu universidad (ej. chile, puc, udec)...
            </span>
          )}
        </div>

        <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1.5 rounded-2xl border border-border bg-card/95 backdrop-blur-xl p-2 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150">
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Buscar por nombre, sigla o ciudad..."
              className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-8 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveIndex(0);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                aria-label="Limpiar búsqueda"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <div
            ref={listRef}
            id={listboxId}
            role="listbox"
            className="max-h-56 overflow-y-auto flex flex-col gap-1 p-0.5 select-none"
          >
            {filteredUniversities.length === 0 ? (
              <div className="py-6 px-3 text-center flex flex-col items-center gap-1.5 text-muted-foreground">
                <p className="text-xs font-semibold text-foreground">
                  No encontramos universidades para "{searchQuery}"
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Prueba buscando por sigla (UCHILE, UC, USACH) o por ciudad
                </p>
              </div>
            ) : (
              filteredUniversities.map((uni, index) => {
                const isSelected = uni.id === value;
                const isHighlighted = index === activeIndex;

                return (
                  <div
                    key={uni.id}
                    role="option"
                    tabIndex={-1}
                    aria-selected={isSelected}
                    onClick={() => handleSelect(uni.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSelect(uni.id);
                      }
                    }}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-xs transition cursor-pointer ${
                      isHighlighted
                        ? 'bg-secondary text-foreground'
                        : isSelected
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'text-foreground hover:bg-secondary/60'
                    }`}
                  >
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-semibold text-foreground truncate">{uni.name}</span>
                        <Badge
                          variant="outline"
                          className="shrink-0 text-[9px] font-bold px-1.5 py-0 uppercase bg-muted/60"
                        >
                          {uni.acronym}
                        </Badge>
                      </div>
                      {uni.city && (
                        <span className="text-[10px] text-muted-foreground">{uni.city}</span>
                      )}
                    </div>

                    {isSelected && <Check className="h-4 w-4 shrink-0 text-primary" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
