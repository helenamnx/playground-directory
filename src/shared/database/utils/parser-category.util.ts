/**
 * Extrae el código y el nombre de una cadena de categoría.
 * Asume el formato "XX.XX - Nombre de la Categoría".
 * @param categoryString La cadena de categoría a parsear.
 * @returns Un objeto con 'code' y 'name', o null si el formato no coincide.
 */
export function parseCategoryString(
  categoryString: string,
): { code: string; name: string } | null {
  if (!categoryString) {
    return null;
  }

  const parts = categoryString.split(' - ');
  if (parts.length >= 2) {
    const code = parts[0].trim();
    // Unir el resto de las partes para formar el nombre completo de la categoría
    const name = parts.slice(1).join(' - ').trim();
    return { code, name };
  } else {
    return { code: null, name: parts[0].trim() };
  }
  return null;
}

/**
 * Normaliza un nombre de categoría o subcategoría para comparación.
 * Elimina " II.", puntos finales, espacios extra, y convierte a minúsculas.
 * @param name La cadena del nombre a normalizar.
 * @returns La cadena normalizada.
 */
export function normalizeCategoryName(name: string): string {
  if (!name) {
    return '';
  }
  let normalized = name.trim().toLowerCase();
  // Eliminar " II." si está al final
  normalized = normalized.replace(/\sii\.$/, '');
  // Eliminar cualquier punto final si existe
  normalized = normalized.replace(/\.$/, '');
  return normalized.trim(); // Volver a trim por si la eliminación dejó espacios
}
