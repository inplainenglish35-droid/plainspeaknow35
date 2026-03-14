// Local definition to avoid missing external type dependency
// (keeps the known error codes used by this module)
type ApiErrorCode =
  | "RATE_LIMIT_MINUTE"
  | "RATE_LIMIT_HOUR"
  | "USAGE_EXCEEDED"
  | "PAYLOAD_TOO_LARGE"
  | "INVALID_PAYLOAD"
  | string;

export function getUserMessage(code: ApiErrorCode) {
  switch (code) {
    case "RATE_LIMIT_MINUTE":
      return "You're going a little fast. Please wait a moment and try again.";

    case "RATE_LIMIT_HOUR":
      return "You've hit the hourly limit. You deserve a break. Then try again.";

    case "USAGE_EXCEEDED":
      return "You've used all your available documents for this month. Upgrade anytime.";

    case "PAYLOAD_TOO_LARGE":
      return "That document is too long. Try breaking it into smaller parts.";

    case "INVALID_PAYLOAD":
      return "Something went wrong with the text you submitted.";

    default:
      return "Something went wrong. Please try again.";
  }
}
