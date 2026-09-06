import { jest } from "@jest/globals";

export function createSupabaseChainMock(result?: {
  data?: unknown;
  error?: unknown;
  count?: number | null;
}) {
  const chain: any = {};

  chain.select = jest.fn(() => chain);
  chain.eq = jest.fn(() => chain);
  chain.order = jest.fn(() => chain);
  chain.in = jest.fn(() => chain);
  chain.gte = jest.fn(() => chain);
  chain.lte = jest.fn(() => chain);
  chain.limit = jest.fn(() => chain);
  chain.ilike = jest.fn(() => chain);
  chain.or = jest.fn(() => chain);
  chain.match = jest.fn(() => chain);
  chain.insert = jest.fn(() => chain);
  chain.update = jest.fn(() => chain);
  chain.upsert = jest.fn(() => chain);
  chain.delete = jest.fn(() => chain);
  chain.single = jest.fn(async () => ({
    data: Array.isArray(result?.data)
      ? (result?.data[0] ?? null)
      : (result?.data ?? null),
    error: result?.error ?? null,
    count: result?.count ?? null,
  }));
  chain.maybeSingle = jest.fn(async () => ({
    data: Array.isArray(result?.data)
      ? (result?.data[0] ?? null)
      : (result?.data ?? null),
    error: result?.error ?? null,
    count: result?.count ?? null,
  }));
  chain.then = (onfulfilled: (value: unknown) => unknown) =>
    Promise.resolve({
      data: result?.data ?? null,
      error: result?.error ?? null,
      count: result?.count ?? null,
    }).then(onfulfilled);

  return chain;
}
