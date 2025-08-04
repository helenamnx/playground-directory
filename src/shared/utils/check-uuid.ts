export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex =
    /(?:^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[a-f0-9]{4}-[a-f0-9]{12}$)|(?:^0{8}-0{4}-0{4}-0{4}-0{12}$)/u;
  return uuidRegex.test(uuid);
};
