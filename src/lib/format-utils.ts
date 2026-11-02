export function parseClp(raw: string | number | undefined | null): number {
  if (raw === undefined || raw === null || raw === '') return 0;
  if (typeof raw === 'number') {
    return Number.isFinite(raw) && raw >= 0 ? Math.floor(raw) : 0;
  }
  const digits = raw.replace(/\D/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

export function formatClp(amount: number | string | undefined | null): string {
  const num = parseClp(amount);
  if (num === 0 && (amount === '' || amount === undefined || amount === null)) {
    return '';
  }
  return `$ ${num.toLocaleString('es-CL')}`;
}

export function clampNumber(
  val: number,
  min: number,
  max: number,
): { value: number; wasClamped: boolean } {
  if (val > max) return { value: max, wasClamped: true };
  if (val < min) return { value: min, wasClamped: true };
  return { value: val, wasClamped: false };
}

export function formatChileanPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';

  let core = digits;
  if (core.startsWith('56')) {
    core = core.slice(2);
  }
  if (core.startsWith('9')) {
    core = core.slice(1);
  }
  core = core.slice(0, 8);

  if (core.length === 0) {
    return '+56 9 ';
  }
  if (core.length <= 4) {
    return `+56 9 ${core}`;
  }
  return `+56 9 ${core.slice(0, 4)} ${core.slice(4)}`;
}

export function filterAlphabeticName(raw: string): string {
  return raw.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]/g, '');
}
