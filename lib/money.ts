export function formatSom(amount: number) {
  return new Intl.NumberFormat("uz-UZ").format(amount) + " so‘m";
}

