/** Pull a human-readable message out of an axios/API error.
 *  The backend responds `{ error: "<message>" }` (see server lib/errors). */
export const apiError = (err: unknown, fallback = "Something went wrong."): string => {
  const data = (err as { response?: { data?: { error?: string } } })?.response?.data;
  if (data?.error) return data.error;
  if (err instanceof Error && err.message) return err.message;
  return fallback;
};
