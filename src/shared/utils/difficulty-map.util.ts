// En shared/utils/map-difficulty.util.ts
import { QuestionDifficulty } from '@/shared/enums/exam-difficult.enum';

export function mapDifficulty(difficulty: any): string { // Cambiamos el tipo a 'any' temporalmente para aceptar cualquier entrada
  // 1. Asegurarse de que sea una cadena de texto antes de limpiar
  const stringDifficulty = String(difficulty); // Convertir explícitamente a string

  // 2. Limpiar el string de entrada
  const cleanedDifficulty = stringDifficulty.trim();

  switch (cleanedDifficulty) {
    case '1':
      return QuestionDifficulty.LOW; // 'Baja'
    case '2':
      return QuestionDifficulty.MEDIUM; // 'Media'
    case '3':
      return QuestionDifficulty.HIGH; // 'Alta'
    case '4':
      return QuestionDifficulty.EXTREME; // 'Extrema'
    default:
      // Lanzar un error con información detallada
      throw new Error(
        `Valor de dificultad inesperado: '${difficulty}' (tipo: ${typeof difficulty}, ` +
        `después de String() y trim(): '${cleanedDifficulty}'). ` +
        `No se pudo mapear a un QuestionDifficulty válido.`,
      );
  }
}