import { fatcher } from 'fatcher';
import { delay, http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { cache, clearCache } from '../src';

const server = setupServer(
  http.all('https://foo.bar/cache', async () => {
    await delay(300);
    return HttpResponse.json({ value: Math.random() });
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

let id = 0;

describe('clearCache', () => {
  it('clearCache(key) removes cached response', async () => {
    const url = `https://foo.bar/cache?id=${id++}`;

    const r1 = await fatcher(url, { ttl: 2000, middlewares: [cache] });
    const v1 = await r1.json();

    const r2 = await fatcher(url, { middlewares: [cache] });
    const v2 = await r2.json();

    expect(v1.value).toBe(v2.value);

    clearCache(url);

    const r3 = await fatcher(url, { middlewares: [cache] });
    const v3 = await r3.json();

    expect(v3.value).not.toBe(v1.value);
  });

  it('clearCache(key) is noop when key does not exist', async () => {
    const url = `https://foo.bar/cache?id=${id++}`;

    expect(() => clearCache(`${url}`)).not.toThrow();

    const r1 = await fatcher(url, { middlewares: [cache] });
    const r2 = await fatcher(url, { middlewares: [cache] });

    const v1 = await r1.json();
    const v2 = await r2.json();

    expect(v1.value).not.toBe(v2.value);
  });

  it('clearCache() clears all cached responses', async () => {
    const url1 = `https://foo.bar/cache?id=${id++}`;
    const url2 = `https://foo.bar/cache?id=${id++}`;

    const v1 = await (await fatcher(url1, { ttl: 2000, middlewares: [cache] })).json();
    const v2 = await (await fatcher(url2, { ttl: 2000, middlewares: [cache] })).json();

    const v1c = await (await fatcher(url1, { middlewares: [cache] })).json();
    const v2c = await (await fatcher(url2, { middlewares: [cache] })).json();

    expect(v1.value).toBe(v1c.value);
    expect(v2.value).toBe(v2c.value);

    clearCache();

    const v1n = await (await fatcher(url1, { middlewares: [cache] })).json();
    const v2n = await (await fatcher(url2, { middlewares: [cache] })).json();

    expect(v1n.value).not.toBe(v1.value);
    expect(v2n.value).not.toBe(v2.value);
  });
});
