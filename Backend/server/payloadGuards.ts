export const ABSOLUTE_MAX_CHARS = 12_000;

export function enforcePayloadSize(text: string) {
  if (!text || typeof text !== "string") {
    return { ok: false, code: "INVALID_PAYLOAD" };
  }

  if (text.length > ABSOLUTE_MAX_CHARS) {
    return {
      ok: false,
      code: "PAYLOAD_TOO_LARGE",
      limit: ABSOLUTE_MAX_CHARS,
    };
  }

  return { ok: true };
}
