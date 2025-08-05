import { Injectable, Logger } from '@nestjs/common';
import * as XLSX from 'xlsx';

@Injectable()
export class SpreadsheetService {
  // Esta función lee un archivo de hoja de cálculo y devuelve los datos como un array de objetos
  readSpreadsheet(filePath: string): any[] {
    // Lee el archivo de hoja de cálculo desde la ruta especificada
    const workbook = XLSX.readFile(filePath);
    // Obtiene el nombre de la primera hoja de cálculo en el libro
    const sheetName = workbook.SheetNames[0];
    // Obtiene la hoja de cálculo usando el nombre de la hoja
    const sheet = workbook.Sheets[sheetName];
    // Convierte la hoja de cálculo a un array de objetos JSON
    const data = XLSX.utils.sheet_to_json(sheet);
    // Imprime los datos parseados en la consola para depuración
    // console.log(`Data parsed from spreadsheet: ${JSON.stringify(data)}`);
    // Devuelve los datos parseados
    return data;
  }

  readSpreadsheetBySheetName(filePath: string, sheetName: string): any[] {
    const workbook = XLSX.readFile(filePath);
    // Verifica si el nombre de la hoja existe en el libro
    if (!workbook.SheetNames.includes(sheetName)) {
      throw new Error(`La hoja '${sheetName}' no existe en el archivo.`);
    }

    // Obtiene la hoja especificada por nombre
    const sheet = workbook.Sheets[sheetName];

    // Convierte la hoja de cálculo a un array de objetos JSON y la devuelve
    return XLSX.utils.sheet_to_json(sheet);
  }

  // Esta función filtra los datos por tipo y atributos permitidos
  filterAttributes(data: any[], allowedAttributes: string[]): any[] {
    // Filtra las filas que coinciden con el tipo especificado
    return data.map((row) => {
      // Crea un objeto para almacenar los atributos filtrados
      const filteredRow: { [key: string]: any } = {};
      // Itera sobre los atributos permitidos
      allowedAttributes.forEach((attr) => {
        // Si el atributo existe en la fila, lo añade al objeto filtrado
        if (row[attr] !== undefined) {
          filteredRow[attr] = row[attr];
        }
      });
      // Devuelve la fila filtrada
      return filteredRow;
    });
  }

  readSpreadsheetFromBuffer(buffer: Buffer): any[] {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(sheet);
  }

  readSpreadsheetBySheetNameFromBuffer(
    buffer: Buffer,
    sheetName: string,
  ): any[] {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    if (!workbook.SheetNames.includes(sheetName)) {
      throw new Error(`La hoja '${sheetName}' no existe en el archivo.`);
    }
    const sheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(sheet);
  }
}
