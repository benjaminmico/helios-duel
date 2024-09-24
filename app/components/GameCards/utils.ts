export const deepCopy = <T = any>(element: T): T =>
  JSON.parse(JSON.stringify(element));
