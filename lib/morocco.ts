// Moroccan cities offered at checkout (alphabetical). "Other" lets customers in smaller towns
// type their town name instead.
export const MOROCCAN_CITIES = [
  "Agadir",
  "Al Hoceima",
  "Azemmour",
  "Azrou",
  "Beni Mellal",
  "Benslimane",
  "Berkane",
  "Berrechid",
  "Bouskoura",
  "Bouznika",
  "Casablanca",
  "Chefchaouen",
  "Dakhla",
  "Dar Bouazza",
  "El Jadida",
  "Errachidia",
  "Essaouira",
  "Fnideq",
  "Fès",
  "Guelmim",
  "Ifrane",
  "Kénitra",
  "Khémisset",
  "Khouribga",
  "Ksar El Kébir",
  "Laâyoune",
  "Larache",
  "Marrakech",
  "Martil",
  "Meknès",
  "Mohammedia",
  "Nador",
  "Ouarzazate",
  "Ouazzane",
  "Oujda",
  "Rabat",
  "Safi",
  "Salé",
  "Settat",
  "Sidi Bennour",
  "Sidi Kacem",
  "Sidi Slimane",
  "Skhirat",
  "Tamesna",
  "Tan-Tan",
  "Tanger",
  "Taounate",
  "Taroudant",
  "Taza",
  "Témara",
  "Tétouan",
  "Tiznit",
  "Youssoufia",
  "Zagora",
] as const;

export const OTHER_CITY = "Other";

/**
 * Normalizes a Moroccan mobile or landline number to +212XXXXXXXXX.
 * Accepts 06/07/05 numbers, +212…, 00212… and 212…, with spaces, dots or dashes.
 * Returns null when the number is not a valid Moroccan number.
 */
export function normalizeMoroccanPhone(input: string): string | null {
  let digits = input.replace(/[\s.\-()]/g, "");
  if (digits.startsWith("+")) digits = digits.slice(1);
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("212")) digits = digits.slice(3);
  if (digits.startsWith("0")) digits = digits.slice(1);
  return /^[5-7]\d{8}$/.test(digits) ? `+212${digits}` : null;
}
