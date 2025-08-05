import Handlebars from 'handlebars';
import { HandlebarsHelperFunctionsEnum } from '../enums/handlebars.enum';

/**
 * @description This function registers a Handlebars helper function that returns
 *  the input string without any modifications. Use the string "noCompile" as the pipe of the
 *  string that you don't want to be compiled.
 * @example {{noCompile '{{realmName}}'}}
 * @author Damian
 * @date 09/06/2025
 * @export
 */
export function noCompileVariablePipe() {
  Handlebars.registerHelper(
    HandlebarsHelperFunctionsEnum.NOCOMPILE,
    function (string) {
      return string;
    },
  );
}
/**
 * @description This function compiles a string with handlebars and replaces the variables
 *  with the provided values.
 * @author Damian
 * @date 10/06/2025
 * @param {string} template
 * @param {Record<string, string>} variables
 * @returns {string}
 */
export function compileVariablesFromString(
  template: string,
  variables: Record<string, string>,
): string {
  const compiledTemplate = Handlebars.compile(template);
  return compiledTemplate(variables);
}

/**
 * @description This function compiles a JSON with handlebars and replaces the variables
 *  with the provided values.
 * @author Damian
 * @date 10/06/2025
 * @param {object} template
 * @param {Record<string, string>} variables
 * @returns {object}
 */
export function compileVariablesFromJSON<T>(
  template: T,
  variables: Record<string, string>,
): T {
  const compiledTemplate = Handlebars.compile(JSON.stringify(template));
  return JSON.parse(compiledTemplate(variables));
}
