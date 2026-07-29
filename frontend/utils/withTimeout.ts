// utils/withTimeout.ts
// Wraps a promise so it rejects after `ms` milliseconds if it hasn't settled
// yet, instead of hanging forever. Used to protect auth/session bootstrap
// calls (e.g. `getSession()`, role/profile lookups) from leaving the app
// stuck on the splash screen when the network stalls right as the app
// launches or resumes from background — a real (if intermittent) failure
// mode for React Native apps whose JS timers/sockets were frozen while
// backgrounded.
export function withTimeout<T>(
  promise: PromiseLike<T>,
  ms: number,
  label = "operation",
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timed out waiting for ${label} after ${ms}ms`));
    }, ms);

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}
