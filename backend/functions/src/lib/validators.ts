// Validation helpers
export const validateInput = (data: any) => {
  return true;
};

export function validateRequest<T>(schema: any, req: any): T {
  if (!schema || typeof schema.validate !== "function") return req as T;
  const {error, value} = schema.validate(req, {abortEarly: false, stripUnknown: true});
  if (error) {
    const details = error.details.map((d: any) => d.message).join(", ");
    throw new Error(`Validation failed: ${details}`);
  }
  return value as T;
}

export function validateRequired(value: any, fieldName: string): void {
  if (value === undefined || value === null || value === "") {
    throw new Error(`${fieldName} is required`);
  }
}

export function validateRequiredFields(data: any, fields: string[]): void {
  for (const field of fields) {
    if (data[field] === undefined || data[field] === null || data[field] === "") {
      throw new Error(`${field} is required`);
    }
  }
}

export function getIdempotencyKey(headers: Record<string, string | string[] | undefined>): string | null {
  const raw = headers["idempotency-key"];
  return Array.isArray(raw) ? raw[0] : (raw ?? null);
}
