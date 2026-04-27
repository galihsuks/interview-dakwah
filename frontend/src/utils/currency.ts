export function formatThousandCurrencyInput(rawValue: string): string {
  const digitsOnly = rawValue.replace(/\D/g, '');

  if (!digitsOnly) {
    return '';
  }

  return digitsOnly.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
