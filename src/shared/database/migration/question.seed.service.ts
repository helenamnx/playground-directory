import { Injectable } from '@nestjs/common';
import { SpreadsheetService } from '@/shared/services/spreadsheet/spreadsheet.service';
import { CategoriesService } from '@/modules/categories/categories.service';
import { QuestionsService } from '@/modules/questions/questions.service';
import { InformationService } from '@/modules/information/information.service';
import { AnswerOptionsService } from '@/modules/answer-options/answer-options.service';
import { QuestionConfigurationsService } from '@/modules/question-configurations/question-configurations.service';
import { parseCategoryString } from '../utils/parser-category.util';
import { QuestionDifficulty } from '@/shared/enums/exam-difficult.enum';
import { LanguageMap, LanguageMapType } from '@/shared/types/language-map.type';
import { CreateInformationDto } from '@/modules/information/dto/create-information.dto';
import { mapDifficulty } from '@/shared/utils/difficulty-map.util';
import { CreateInformationContentDto } from '@/modules/information-content/dto/create-information-content.dto';
import { generateSlug } from '@/shared/utils/generate-slug.utils';
import { LanguagesEnum } from '@/shared/enums/languages.enum';
import { PropertiesEnum } from '@/shared/enums/properties.enum';
import { transformToLanguageMapType } from '@/shared/utils/utils';

/**
 * @class QuestionSeedService
 * @description
 * Service for migrating questions from an Excel file to the database.
 */
@Injectable()
export class QuestionSeedService {
  constructor(
    private readonly spreadsheetService: SpreadsheetService,
    private readonly categoryService: CategoriesService,
    private readonly questionsService: QuestionsService,
    private readonly informationService: InformationService,
    private readonly answerOptionsService: AnswerOptionsService,
    private readonly questionConfigurationsService: QuestionConfigurationsService,
  ) {}

  /**
   * @method migrateQuestions
   * @description
   * Init migration process for questions from an Excel file.
   * @param filePath Ruta del archivo Excel.
   */
  async migrateQuestions(params: {
    filePath?: string;
    buffer?: Buffer;
    sheetName: string;
  }): Promise<number> {
    try {
      const { filePath, buffer, sheetName } = params;
      console.log('Iniciando migración de preguntas...');

      let rows: any[] = [];
      if (filePath) {
        rows = this.spreadsheetService.readSpreadsheetBySheetName(
          filePath,
          sheetName,
        );
      } else if (buffer) {
        rows = this.spreadsheetService.readSpreadsheetBySheetNameFromBuffer(
          buffer,
          sheetName,
        );
      }

      if (!rows || rows.length === 0) {
        console.log('El archivo Excel no tiene filas. Migración finalizada.');
        return;
      }

      if (filePath && !(await this.checkIfMigrationIsNeeded(rows))) {
        console.log(
          'Migración de preguntas omitida (datos ya existentes o archivo vacío/inválido).',
        );
        return;
      }

      let migratedQuestionsCount = 0;
      const categoriesArray: string[] = [];

      // [PASO 3: Iterar filas]
      for (const [index, row] of rows.entries()) {
        console.log(`--- Procesando fila ${index + 1} ---`);

        try {
          // [PASO 3.1: Validaciones de fila]
          const questionTitleRaw = row['Título pregunta'];
          const correctOptionIndexRaw =
            row['Respuesta correcta (valores: 1,2,3,4)'];

          if (!questionTitleRaw || !correctOptionIndexRaw) {
            console.log(
              `Fila ${index + 1}: Datos incompletos (Título o Respuesta correcta faltante). Saltando.`,
            );
            throw new Error(
              'Datos incompletos (Título o Respuesta correcta faltante)',
            );
            continue;
          }

          // [PASO 3.2: Procesar la pregunta completa]
          await this.processQuestionRow(index + 1, row, categoriesArray);

          migratedQuestionsCount++;
        } catch (error) {
          console.error(
            `Error al procesar fila ${index + 1}: ${error.message}`,
          );
        }
      }
      const uniqueCategoriesArray = Array.from(new Set(categoriesArray));
      console.log('uniqueCateoriesArray', uniqueCategoriesArray);

      return migratedQuestionsCount;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  /**
   * @method processQuestionRow
   * @description
   * Procesa una única fila del archivo Excel para crear todas las entidades relacionadas
   * con una pregunta y finalmente la entidad de Pregunta principal.
   * Esta función orquesta los pasos de creación de la pregunta, incluyendo
   * la limpieza de su título basándose en las categorías y subcategorías de la base de datos.
   *
   * @param rowIndex El índice de la fila que se está procesando (para logs).
   * @param row Los datos de la fila del Excel.
   * @returns {Promise<void>}
   * @private
   */
  private async processQuestionRow(
    rowIndex: number,
    row: any,
    categoriesArray: string[],
  ): Promise<void> {
    try {
      console.log(`Fila ${rowIndex}: Procesando pregunta.`);

      // Aseguramos que los valores sean cadenas y eliminamos espacios extra.
      let questionTitleRaw = String(row['Título pregunta'] || '').trim();
      const categoryRaw = String(row['Categoría'] || '').trim();
      const subcategoryRaw = String(row['Subcategoria'] || '').trim();
      const observationsRaw = String(row['Observaciones'] || '').trim();

      console.log('questionTitleRaw', questionTitleRaw);
      console.log('categoryRaw', categoryRaw);
      console.log('subcategoryRaw', subcategoryRaw);
      console.log('observationsRaw', observationsRaw);
      // -- Paso 1: Resolver categorías y subcategorías desde la base de datos --
      const categoriesFromDb = await this.resolveCategories(
        categoryRaw,
        subcategoryRaw,
      );

      console.log(
        `Fila ${rowIndex}: Categorías resueltas de la DB: ${categoriesFromDb.map((c) => c.code).join(', ')}.`,
      );
      // -- Paso 2: Extraer los nombres limpios de las entidades de la DB para la limpieza del título --
      let categoryTitleClean = '';
      let subcategoryTitleClean = '';
      const parsedMainCategoryFromRaw = parseCategoryString(categoryRaw);
      const mainCategoryCode = parsedMainCategoryFromRaw
        ? parsedMainCategoryFromRaw.code
        : null;

      if (mainCategoryCode) {
        const foundCategory = categoriesFromDb.find(
          (cat) => cat.code === mainCategoryCode,
        );
        if (foundCategory && foundCategory.title && foundCategory.title.get) {
          categoryTitleClean = (foundCategory.title.get('es') || '').trim();
        }
      }
      console.log('CATEGORY NAME', parsedMainCategoryFromRaw.name);
      //pushing the category name to the array of categories
      categoriesArray.push(parsedMainCategoryFromRaw?.name.slice(0, -1));
      const parsedSubcategoryFromRaw = subcategoryRaw
        ? parseCategoryString(subcategoryRaw)
        : null;
      const subcategoryNameToMatch = parsedSubcategoryFromRaw
        ? parsedSubcategoryFromRaw.name
        : subcategoryRaw.replace(/\.$/, '').trim();

      console.log('SUBCATEGORY NAME', parsedSubcategoryFromRaw.name);
      //pushing the subcategory name to the array of categories
      categoriesArray.push(parsedSubcategoryFromRaw?.name.slice(0, -1));

      if (subcategoryNameToMatch) {
        const foundSubcategory = categoriesFromDb.find(
          (cat) =>
            cat.title &&
            cat.title.get &&
            (cat.title.get('es') || '').trim().toLowerCase() ===
              subcategoryNameToMatch.toLowerCase(),
        );
        if (
          !foundSubcategory &&
          parsedSubcategoryFromRaw &&
          parsedSubcategoryFromRaw.code
        ) {
          const foundSubcategoryByCode = categoriesFromDb.find(
            (cat) => cat.code === parsedSubcategoryFromRaw.code,
          );
          if (
            foundSubcategoryByCode &&
            foundSubcategoryByCode.title &&
            foundSubcategoryByCode.title.get
          ) {
            subcategoryTitleClean = (
              foundSubcategoryByCode.title.get('es') || ''
            ).trim();
          }
        } else if (foundSubcategory) {
          subcategoryTitleClean = (
            foundSubcategory.title.get('es') || ''
          ).trim();
        }
      }

      if (!subcategoryTitleClean && categoriesFromDb.length > 1) {
        const potentialSubcategoryFromList = categoriesFromDb[1];
        if (
          potentialSubcategoryFromList &&
          potentialSubcategoryFromList.title &&
          potentialSubcategoryFromList.title.get
        ) {
          subcategoryTitleClean = (
            potentialSubcategoryFromList.title.get('es') || ''
          ).trim();
        }
      }

      console.log(
        `Fila ${rowIndex}: Nombre de Categoría (desde DB): '${categoryTitleClean}'`,
      );
      console.log(
        `Fila ${rowIndex}: Nombre de Subcategoría (desde DB): '${subcategoryTitleClean}'`,
      );

      // -- Paso 3: Intentar eliminar los prefijos del título de la pregunta --
      const potentialPrefixes = [categoryTitleClean, subcategoryTitleClean]
        .filter((p) => p.length > 0) // Solo incluimos prefijos no vacíos.
        .map((p) => p.toLowerCase()); // Normalizamos a minúsculas para comparaciones.

      let cleanedQuestionTitle = questionTitleRaw;

      // Iteramos sobre cada prefijo y lo eliminamos de forma global de la cadena.
      for (const prefix of potentialPrefixes) {
        const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Expresión regular para buscar el prefijo en CUALQUIER PARTE de la cadena,
        // permitiendo espacios y puntuación antes y después.
        // Capturamos el prefijo en un grupo para asegurarnos de que lo que se elimina es exacto.
        // (?:\s*[\.,;:\-()]*\s*)?: Grupo no capturador para delimitadores opcionales.
        // Añadimos `\s*` al principio y al final para manejar espacios extras.
        const regex = new RegExp(
          `(?:\\s*${escapedPrefix}\\s*[\\s.,;:\\-()]*\\s*){1,}`,
          'gi',
        );
        // La {1,} asegura que se elimine al menos una ocurrencia, y con el flag global todas.
        // Si el prefijo puede aparecer pegado sin delimitadores y queremos eliminarlo, la regex debe ser aún más permisiva:
        // const regex = new RegExp(`(?:\\s*${escapedPrefix}[\\s.,;:\\-()\\s]*){1,}`, 'gi'); // Otra opción más permisiva con lo que puede seguir al prefijo

        const originalTitleAfterCurrentPrefixRemoval = cleanedQuestionTitle
          .replace(regex, ' ')
          .trim();

        // Solo actualizamos si realmente se hizo un cambio (evitar bucles infinitos en otros contextos)
        // y para asegurar que la siguiente iteración de prefijos trabaje con la cadena modificada.
        if (
          originalTitleAfterCurrentPrefixRemoval.length <
          cleanedQuestionTitle.length
        ) {
          console.log(
            `Fila ${rowIndex}: Eliminado(s) el prefijo '${prefix}' (todas las ocurrencias).`,
          );
          cleanedQuestionTitle = originalTitleAfterCurrentPrefixRemoval;
        } else if (cleanedQuestionTitle.toLowerCase().includes(prefix)) {
          // Si no se redujo la longitud pero el prefijo está presente, puede que haya sido reemplazado por un espacio.
          // Aquí podemos afinar si es necesario, pero el `replace` ya lo hará.
        }
      }

      // -- Limpieza general de espacios múltiples --
      // Después de los reemplazos, pueden quedar múltiples espacios consecutivos o al inicio/final.
      cleanedQuestionTitle = cleanedQuestionTitle.replace(/\s+/g, ' ').trim();

      // -- Paso 4: Limpieza final del título --
      // Eliminamos cualquier puntuación o espacio residual que pueda haber quedado al inicio.
      cleanedQuestionTitle = cleanedQuestionTitle
        .replace(/^\s*[\.,;:]+\s*/, '')
        .trim();

      // Si después de todas las limpiezas el título queda vacío, usamos el título original como fallback.
      if (!cleanedQuestionTitle) {
        console.warn(
          `Fila ${rowIndex}: El título de la pregunta quedó vacío después de la limpieza de prefijos. Usando el original como fallback.`,
        );
        cleanedQuestionTitle = questionTitleRaw;
      }

      // --- LOG PARA VERIFICAR EL TÍTULO FINAL (quita este log en producción) ---
      console.log(
        `Fila ${rowIndex}: Título de pregunta FINAL para DB: '${cleanedQuestionTitle}'`,
      );

      //splite the question title
      let splittedCleanedQuestionTitle = cleanedQuestionTitle.split('. ');

      //create a new array with the next split sections of the question title
      let newSplittedCleanedQuestionTitle = [];
      //if some poart of the splitted question title already exists in the categories array, do not add it
      //this is to avoid having a question title with the same name of a category
      splittedCleanedQuestionTitle.forEach((element) => {
        if (!categoriesArray.includes(element)) {
          newSplittedCleanedQuestionTitle.push(element);
        }
      });
      cleanedQuestionTitle = newSplittedCleanedQuestionTitle.join('. ');
      // --------------------------------------------------------------------------
      // -- Paso 5: Creación de entidades relacionadas y la pregunta final --
      const information = await this.createInformationForQuestion(
        cleanedQuestionTitle,
        observationsRaw,
      );
      console.log(
        `Fila ${rowIndex}: Información de pregunta creada (ID: ${information._id}).`,
      );

      // Obtención de opciones de respuesta del Excel
      const answer1Raw = row['Respuesta 1'];
      const answer2Raw = row['Respuesta 2'];
      const answer3Raw = row['Respuesta 3'];
      const answer4Raw = row['Respuesta 4'];
      const correctOptionIndexRaw =
        row['Respuesta correcta (valores: 1,2,3,4)'];
      const justificationRaw = row['Justificación'];

      const answerOptions = await this.createAnswerOptionsForQuestion(
        [answer1Raw, answer2Raw, answer3Raw, answer4Raw],
        correctOptionIndexRaw,
        justificationRaw,
      );
      console.log(
        `Fila ${rowIndex}: ${answerOptions.length} opciones de respuesta creadas.`,
      );

      const categoryRoleRaw = row['Rol Categoría'];
      const questionConfiguration =
        await this.createQuestionConfiguration(categoryRoleRaw);
      console.log(
        `Fila ${rowIndex}: Configuración de pregunta creada (ID: ${questionConfiguration._id}).`,
      );

      const difficultyRaw = row['Dificultad (1Baja; 2Media;3Alta;4Extrema)'];
      const difficulty = this.mapQuestionDifficulty(difficultyRaw);
      console.log(`Fila ${rowIndex}: Dificultad mapeada a: ${difficulty}.`);

      // Creación final de la pregunta.
      await this.questionsService.create({
        information: information._id,
        topics: categoriesFromDb.map((cat) => cat._id), // Usamos las categorías ya resueltas de la DB.
        configuration: questionConfiguration._id,
        answerOptions: answerOptions.map((opt) => opt._id),
        difficulty: difficulty,
        observations: observationsRaw
          ? {
              type: PropertiesEnum.LANGUAGE_MAP_PROPERTY,
              languageMap: { es: observationsRaw },
            }
          : undefined,
      });
      console.log(`Fila ${rowIndex}: Pregunta creada exitosamente.`);
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  /**
   * @method createInformationForQuestion
   * @description
   * Crea la entidad Information incluyendo su InformationContent,
   * utilizando el método `createInformation` ya existente en `InformationService`.
   *
   * @param titleRaw Título de la pregunta del Excel.
   * @param observationsRaw Observaciones del Excel (no usado directamente aquí, es para Question).
   * @returns {Promise<any>} La entidad Information creada (con su ID).
   * @private
   */
  private async createInformationForQuestion(
    titleRaw: string,
    observationsRaw: string,
  ): Promise<any> {
    console.log(`Preparando datos de información para: ${titleRaw}`);

    const informationContentPayload: CreateInformationContentDto = {
      title: { es: titleRaw } as LanguageMap,
      subtitle: { es: '' } as LanguageMap,
      body: { es: '' } as LanguageMap,
      language: LanguagesEnum.ES,
      slug: { es: generateSlug(titleRaw) } as LanguageMap,
    };

    const createInformationDto: CreateInformationDto = {
      content: informationContentPayload,
      author: 'Migración Excel',
      alias: this.generateAliasFromTitle(titleRaw),
    };

    const information =
      await this.informationService.createInformation(createInformationDto);

    console.log(`Información y contenido creados vía InformationService.`);
    return information;
  }

  /**
   * @method generateAliasFromTitle
   * @description
   * Genera un alias corto a partir de un título.
   * @param title El título de la pregunta.
   * @returns {string} El alias generado.
   * @private
   */
  private generateAliasFromTitle(title: string): string {
    const maxLength = 50;
    return title.substring(0, Math.min(title.length, maxLength));
  }

  /**
   * @method createAnswerOptionsForQuestion
   * @description
   * Crea las opciones de respuesta para una pregunta.
   * @param answerRaws Array de textos de respuesta.
   * @param correctOptionIndexRaw Índice de la respuesta correcta.
   * @param justificationRaw Texto de justificación.
   * @private
   */
  private async createAnswerOptionsForQuestion(
    answerRaws: string[],
    correctOptionIndexRaw: string,
    justificationRaw: string,
  ): Promise<any[]> {
    console.log('Creando opciones de respuesta...');
    const answerOptions: any[] = [];
    const correctIndex = parseInt(correctOptionIndexRaw, 10) - 1; // Convertir a índice 0-basado

    for (let i = 0; i < answerRaws.length; i++) {
      const answerText = answerRaws[i] + '';
      if (!answerText || answerText.trim() === '') {
        console.log(`Respuesta ${i + 1} vacía. Saltando.`);
        continue;
      }

      const isCorrect = i === correctIndex;
      const value: LanguageMap = { es: answerText };
      let justification: LanguageMapType | undefined;

      if (isCorrect && justificationRaw && justificationRaw.trim() !== '') {
        justification = transformToLanguageMapType({ es: justificationRaw });
      }

      const answerOptionPayload = {
        value: transformToLanguageMapType(value),
        isCorrect: isCorrect,
        justification: justification ? justification : null,
      };

      const answerOption =
        await this.answerOptionsService.create(answerOptionPayload);
      answerOptions.push(answerOption);
    }

    return answerOptions;
  }

  /**
   * @method resolveCategories
   * @description
   * Obtiene las entidades de Categoría y Subcategoría de la BD.
   * @param categoryRaw Nombre de la categoría principal.
   * @param subcategoryRaw Nombre de la subcategoría.
   * @private
   */
  private async resolveCategories(
    categoryRaw: string,
    subcategoryRaw: string,
  ): Promise<any[]> {
    console.log(`Resolviendo categorías: ${categoryRaw}, ${subcategoryRaw}`);
    const categories: any[] = [];

    if (subcategoryRaw && subcategoryRaw.trim() !== '') {
      const parsedSubcategory = parseCategoryString(subcategoryRaw);
      if (parsedSubcategory) {
        const subcategory = await this.categoryService.findOneByValue(
          parsedSubcategory.name,
        );
        if (subcategory) {
          categories.push(subcategory);
        } else {
          console.log(
            `Subcategoría '${parsedSubcategory.code}' no encontrada. Asegúrate de su migración.`,
          );
        }
      } else {
        console.log(`No se pudo parsear subcategoría: '${subcategoryRaw}'.`);
      }
    }
    //return the categories, because we only need the subcategories
    //if subcategories is empty, iterate over the parentCategories
    if (categories.length > 0) return categories;

    if (categoryRaw && categoryRaw.trim() !== '') {
      const parsedCategory = parseCategoryString(categoryRaw);
      if (parsedCategory) {
        const category = await this.categoryService.findOneByCode(
          parsedCategory.code,
        );
        if (category) {
          categories.push(category);
        } else {
          console.log(
            `Categoría principal '${parsedCategory.code}' no encontrada. Asegúrate de su migración.`,
          );
        }
      } else {
        console.log(
          `No se pudo parsear categoría principal: '${categoryRaw}'.`,
        );
      }
    }

    return categories;
  }

  /**
   * @method createQuestionConfiguration
   * @description
   * Crea la configuración para una pregunta.
   * @param categoryRoleRaw Valor del Rol Categoría.
   * @private
   */
  private async createQuestionConfiguration(
    categoryRoleRaw: string,
  ): Promise<any> {
    console.log(`Creando configuración para rol: ${categoryRoleRaw}`);
    const configurationPayload = {
      negativeMarking: 0.33, //TODO: cambiar esto a .env
      partialMarking: false,
      timed: false,
      timeLimit: null,
      weight: 1,
      roles: categoryRoleRaw
        ? categoryRoleRaw.split(',').map((role) => role.trim())
        : [],
    };

    const questionConfiguration =
      await this.questionConfigurationsService.create(configurationPayload);
    return questionConfiguration;
  }

  /**
   * @method mapQuestionDifficulty
   * @description
   * Mapea el valor de dificultad del Excel al enum `QuestionDifficulty`.
   * @param difficultyRaw Valor de dificultad (ej. '1').
   * @private
   */
  private mapQuestionDifficulty(difficultyRaw: string): QuestionDifficulty {
    console.log(`Mapeando dificultad: ${difficultyRaw}`);
    const mapped = mapDifficulty(difficultyRaw);
    // if (!Object.values(QuestionDifficulty).includes(mapped as QuestionDifficulty)) {
    //     console.log(`Dificultad '${difficultyRaw}' desconocida. Usando 'LOW'.`);
    //     return QuestionDifficulty.LOW;
    // }
    return mapped as QuestionDifficulty;
  }

  /**
   * @method checkIfMigrationIsNeeded
   * @description
   * Verifica si una migración de preguntas es necesaria buscando una pregunta existente
   * basada en el título de la primera entrada en la hoja de cálculo.
   *
   * @param filePath La ruta al archivo de hoja de cálculo de Excel.
   * @returns {Promise<boolean>} Una promesa que se resuelve en `true` si la migración debe continuar,
   * o `false` si las preguntas ya existen o la hoja de cálculo está vacía/es inválida.
   * @private
   */
  /**
   * @method checkIfMigrationIsNeeded
   * @description
   * Verifica si una migración de preguntas es necesaria buscando una pregunta existente
   * basada en el título de la primera entrada en la hoja de cálculo.
   *
   * @param filePath La ruta al archivo de hoja de cálculo de Excel.
   * @returns {Promise<boolean>} Una promesa que se resuelve en `true` si la migración debe continuar,
   * o `false` si las preguntas ya existen o la hoja de cálculo está vacía/es inválida.
   * @private
   */
  private async checkIfMigrationIsNeeded(allRows: any[]): Promise<boolean> {
    const firstRow = allRows && allRows.length > 0 ? allRows[0] : null;

    if (!firstRow) {
      console.log(
        'La hoja de cálculo de preguntas parece estar vacía o no se pudo leer. No hay preguntas para migrar o verificar su existencia.',
      );

      return false; // No hay datos para migrar
    }

    const firstQuestionTitleRaw = firstRow['Título pregunta'];

    if (!firstQuestionTitleRaw || firstQuestionTitleRaw.trim() === '') {
      return true; // Si no podemos verificar, procedemos, pero con advertencia
    }

    // [CORRECCIÓN CLAVE] Busca una Information que contenga un InformationContent con el título de la primera pregunta.
    // Asumiendo que informationService.findOne puede aceptar un objeto de consulta complejo
    const existingInformation =
      await this.informationService.findInformationByContentTitle(
        firstQuestionTitleRaw,
      );

    if (existingInformation) {
      console.log(
        `Ya existen preguntas en la base de datos (se encontró información con título: '${firstQuestionTitleRaw}'). Se omite la migración.`,
      );
      return false; // Migración no necesaria
    }

    return true; // Migración necesaria
  }
}
