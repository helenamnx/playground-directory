export function minutesToMiliseconds(minutes: number): number {
  return minutes * 60 * 1000;
}

export function secondsToMinutes(seconds: number): number {
  return Math.floor(seconds / 60);
}

export function nextDay() {
  // Obtener la fecha actual
  let fechaActual = new Date();
  // Sumar un día
  fechaActual.setDate(fechaActual.getDate() + 1);
  return fechaActual;
}

export function isDateExpired(expireDate: Date): boolean {
  // Obtener la fecha actual
  const dateNow = new Date();

  // Convertir expireDate a un objeto Date
  // Comprobar si la fecha de expiración es mayor que la fecha actual
  return dateNow > expireDate;
}
