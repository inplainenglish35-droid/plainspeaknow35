type RateBucket = {
  count: number;
  resetAt: number;
};

const RATE_LIMITS = {
  minute: { max: 3, windowMs: 60_000 },
  hour: { max: 30, windowMs: 60 * 60_000 },
};

const MAX_BUCKETS = 10_000;

const uidBuckets = new Map<string, RateBucket>();
const ipBuckets = new Map<string, RateBucket>();

function cleanup(map: Map<string, RateBucket>) {
  const now = Date.now();

  for (const [key, bucket] of map.entries()) {
    if (now > bucket.resetAt) {
      map.delete(key);
    }
  }

  // Emergency eviction
  if (map.size > MAX_BUCKETS) {
    const keys = map.keys();
    while (map.size > MAX_BUCKETS) {
      const next = keys.next();
      if (next.done) break;
      map.delete(next.value);
    }
  }
}

function checkLimit(
  map: Map<string, RateBucket>,
  key: string,
  max: number,
  windowMs: number
) {
  const now = Date.now();
  const bucket = map.get(key);

  if (!bucket || now > bucket.resetAt) {
    map.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= max) return false;

  bucket.count++;
  return true;
}

export function enforceRateLimits(uid: string, ip?: string) {
  cleanup(uidBuckets);
  cleanup(ipBuckets);

  // UID limits (primary)
  const uidMinute = checkLimit(
    uidBuckets,
    `${uid}:minute`,
    RATE_LIMITS.minute.max,
    RATE_LIMITS.minute.windowMs
  );

  const uidHour = checkLimit(
    uidBuckets,
    `${uid}:hour`,
    RATE_LIMITS.hour.max,
    RATE_LIMITS.hour.windowMs
  );

  if (!uidMinute) return { ok: false, code: "RATE_LIMIT_MINUTE" as const };
  if (!uidHour) return { ok: false, code: "RATE_LIMIT_HOUR" as const };

  // IP fallback (secondary)
  if (ip) {
    const ipMinute = checkLimit(
      ipBuckets,
      `${ip}:minute`,
      RATE_LIMITS.minute.max * 2,
      RATE_LIMITS.minute.windowMs
    );
const ipHour = checkLimit(
  ipBuckets,
  `${ip}:hour`,
  RATE_LIMITS.hour.max * 2,
  RATE_LIMITS.hour.windowMs
);

if (!ipHour) {
  return { ok: false, code: "RATE_LIMIT_HOUR" as const };
}
    if (!ipMinute) {
      return { ok: false, code: "RATE_LIMIT_MINUTE" as const };
    }
  }

  return { ok: true };
}

