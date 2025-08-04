/**
 * @author Joel
 * @date 04/08/2024
 * @param searchParams
 * @description format searched params to show them in dinamic find functions
 * @returns string
 */

export function formatSearchedParams(searchParams: any): string {
  let formatedSearchedParams = '';
  for (const [key, value] of Object.entries(searchParams)) {
    // add key and value to the formatedSearchedParams
    formatedSearchedParams += `${key}: ${value}, `;
  }
  return formatedSearchedParams;
}
