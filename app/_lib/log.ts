/**
 * Structured logger for server-side errors. Outputs single-line JSON so it
 * plays well with Vercel/Datadog/Cloudwatch log search.
 *
 * Why this exists: silent webhook/payment errors are the worst class of bug
 * in money flows. We don't have Sentry yet — when we do, the SENTRY_DSN env
 * var lights up and we can swap the implementation here without touching
 * call sites. For now, plain console keeps things simple and queryable.
 *
 * Convention: scope = "stripe-webhook" / "payment" / "payout" / "cron-cleanup"
 * — short, lowercase, hyphenated, so `grep '"scope":"stripe-webhook"'` works.
 */

interface LogContext {
  [key: string]: unknown;
}

const sanitizeError = (err: unknown) => {
  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message,
      stack: err.stack,
    };
  }
  return { value: String(err) };
};

export const logError = (scope: string, err: unknown, context?: LogContext) => {
  const payload = {
    level: "error",
    scope,
    time: new Date().toISOString(),
    error: sanitizeError(err),
    ...context,
  };
  console.error(JSON.stringify(payload));
};

export const logWarn = (scope: string, message: string, context?: LogContext) => {
  console.warn(
    JSON.stringify({
      level: "warn",
      scope,
      time: new Date().toISOString(),
      message,
      ...context,
    })
  );
};

export const logInfo = (scope: string, message: string, context?: LogContext) => {
  console.log(
    JSON.stringify({
      level: "info",
      scope,
      time: new Date().toISOString(),
      message,
      ...context,
    })
  );
};
