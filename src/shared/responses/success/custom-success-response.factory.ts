export function actionCode(entityName: string) {
  entityName = entityName?.toUpperCase();
  const actionCodes = {
    OK: `OK_${entityName}`,
    CREATED: `CREATED_${entityName}`,
    UPDATED: `UPDATED_${entityName}`,
    DELETED: `DELETED_${entityName}`,
    CANCELLED: `CANCELLED_${entityName}`,
    ERROR: `ERROR_${entityName}`,
  };
  return actionCodes;
}
