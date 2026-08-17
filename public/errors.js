export function appError(i18nKey, i18nValues = {}) {
  const error = new Error(i18nKey);
  error.i18nKey = i18nKey;
  error.i18nValues = i18nValues;
  return error;
}
