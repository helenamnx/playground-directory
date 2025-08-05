export function generateSlug(name: string): string {
  // Lista de palabras a eliminar (artículos y preposiciones en español e inglés)
  const wordsToRemove = [
    // Spanish
    'las',
    'los',
    'la',
    'el',
    'de',
    'del',
    'al',
    'en',
    'y',
    'a',
    'por',
    'con',
    'para',
    'sin',
    'sobre',
    'entre',
    // English
    'the',
    'of',
    'in',
    'on',
    'at',
    'to',
    'by',
    'with',
    'and',
    'for',
    'from',
    'as',
    'about',
    'into',
    'over',
    'after',
    // Italian
    'il',
    'lo',
    'la',
    'i',
    'gli',
    'le',
    'un',
    'una',
    'uno',
    'del',
    'della',
    'dei',
    'delle',
    'al',
    'allo',
    'alla',
    'ai',
    'agli',
    'alle',
    'e',
    'da',
    'di',
    'in',
    'con',
    'su',
    'per',
    'tra',
    'fra',
  ];

  if (typeof name !== 'string') {
    return '';
  }

  return name
    .toLowerCase()
    .normalize('NFD') // Normaliza para separar caracteres con tildes
    .replace(/[\u0300-\u036f]/g, '') // Elimina los diacríticos (tildes)
    .split(/\s+/) // Divide el nombre en palabras
    .filter((word) => !wordsToRemove.includes(word)) // Elimina palabras no deseadas
    .join('-') // Une las palabras con guiones
    .replace(/[^a-z0-9-]/g, '') // Elimina caracteres no permitidos
    .replace(/-+/g, '-') // Reemplaza múltiples guiones consecutivos por uno solo
    .replace(/^-|-$/g, ''); // Elimina guiones al inicio o al final
}
