import { createSessionSynchronizer } from "../session-sync";
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}
it("serializes different accounts and logout in submission order", async () => {
  const first = deferred<any>();
  const request = jest
    .fn()
    .mockReturnValueOnce(first.promise)
    .mockResolvedValue({ ok: true });
  const sync = createSessionSynchronizer(request);
  const a = sync("A"),
    b = sync("B"),
    logout = sync(null);
  await Promise.resolve();
  await Promise.resolve();
  expect(request).toHaveBeenCalledTimes(1);
  first.resolve({ ok: true });
  await Promise.all([a, b, logout]);
  expect(request.mock.calls.map((call) => call[0])).toEqual([
    "/api/auth/login",
    "/api/auth/login",
    "/api/auth/logout",
  ]);
  expect(JSON.parse(request.mock.calls[1][1].body).accessToken).toBe("B");
});
it("shares same-token work until the cookie has been written", async () => {
  const pending = deferred<any>();
  const request = jest.fn(() => pending.promise);
  const sync = createSessionSynchronizer(request);
  const a = sync("A"),
    duplicate = sync("A");
  expect(a).toBe(duplicate);
  pending.resolve({ ok: true });
  await a;
  await sync("A");
  expect(request).toHaveBeenCalledTimes(1);
});
it("does not skip A when B is queued after an earlier A", async () => {
  const request = jest.fn().mockResolvedValue({ ok: true });
  const sync = createSessionSynchronizer(request);
  await sync("A");
  await Promise.all([sync("B"), sync("A")]);
  expect(
    request.mock.calls.map((call) => JSON.parse(call[1].body).accessToken),
  ).toEqual(["A", "B", "A"]);
});
it("retries failed writes and lets a subsequent logout proceed", async () => {
  const request = jest
    .fn()
    .mockResolvedValueOnce({ ok: false })
    .mockResolvedValue({ ok: true });
  const sync = createSessionSynchronizer(request);
  await expect(sync("A")).rejects.toThrow("iniciar");
  await sync("A");
  await sync(null);
  expect(request).toHaveBeenCalledTimes(3);
});
it("reports failed logout instead of claiming success", async () => {
  const sync = createSessionSynchronizer(
    jest.fn().mockResolvedValue({ ok: false }),
  );
  await expect(sync(null)).rejects.toThrow("encerrar");
});
it("does not trust a cached token after a failed response for another account", async () => {
  const request = jest
    .fn()
    .mockResolvedValueOnce({ ok: true })
    .mockRejectedValueOnce(new Error("lost response"))
    .mockResolvedValue({ ok: true });
  const sync = createSessionSynchronizer(request);
  await sync("A");
  await expect(sync("B")).rejects.toThrow("lost response");
  await sync("A");
  expect(request).toHaveBeenCalledTimes(3);
});
