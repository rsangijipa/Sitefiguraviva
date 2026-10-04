/** Serialize cookie writes, including logout, so older responses cannot win. */
export function createSessionSynchronizer(
  request: typeof fetch = (input, init) => fetch(input, init),
) {
  let lastToken: string | null | undefined;
  let tail: Promise<void> = Promise.resolve();
  let pending: { token: string | null; promise: Promise<void> } | null = null;
  return (token: string | null): Promise<void> => {
    if (pending?.token === token) return pending.promise;
    if (!pending && lastToken === token) return Promise.resolve();
    const promise = tail
      .catch(() => {})
      .then(async () => {
        const response = await request(
          token ? "/api/auth/login" : "/api/auth/logout",
          {
            method: "POST",
            signal: AbortSignal.timeout(15000),
            headers: { "Content-Type": "application/json" },
            ...(token ? { body: JSON.stringify({ accessToken: token }) } : {}),
          },
        );
        if (!response.ok)
          throw new Error(
            token
              ? "Não foi possível iniciar sua sessão. Tente novamente."
              : "Não foi possível encerrar sua sessão. Tente novamente.",
          );
        lastToken = token;
      })
      .catch((error) => {
        // A lost response does not prove that the server left the cookie untouched.
        lastToken = undefined;
        throw error;
      })
      .finally(() => {
        if (pending?.promise === promise) pending = null;
      });
    tail = promise;
    pending = { token, promise };
    return promise;
  };
}
