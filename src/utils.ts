export const extractHeaders = (obj: Record<string, unknown>) => {
  return [
    ...new Set(
      Object.keys(obj).filter((key) => typeof obj[key] === "string" && key)
    ),
  ];
};
