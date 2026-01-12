import { fatcher } from 'fatcher';
import { delay, http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { cache } from '../src';

const server = setupServer(
  http.all('https://foo.bar', async () => {
    await delay(1000);
    return HttpResponse.json({ responseTime: Math.random() });
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

let id = 0;

describe('Basic', () => {
  it('Ignore cache when ttl is not a number value', async () => {
    const url = `https://foo.bar?id=${id++}`;

    const response = await fatcher(url, { middlewares: [cache] });
    const result = await response.json();

    const response1 = await fatcher(url, { middlewares: [cache] });
    const result1 = await response1.json();

    expect(result.responseTime === result1.responseTime).toBe(false);
  });

  it('Cached With ttl options', async () => {
    const url = `https://foo.bar?id=${id++}`;

    const response = await fatcher(url, { ttl: 2000, middlewares: [cache] });
    const result = await response.json();

    const response1 = await fatcher(url, { middlewares: [cache] });
    const result1 = await response1.json();

    expect(result.responseTime === result1.responseTime).toBe(true);
  });

  it('Ignore Cached Response With flush options', async () => {
    const url = `https://foo.bar?id=${id++}`;

    const response = await fatcher(url, { ttl: 2000, middlewares: [cache] });
    const result = await response.json();

    const response1 = await fatcher(url, { flush: true, middlewares: [cache] });
    const result1 = await response1.json();

    expect(result.responseTime === result1.responseTime).toBe(false);
  });

  it('Deduplicate concurrent requests and share the same promise', async () => {
    const url = `https://foo.bar?id=${id++}`;

    let hitCount = 0;

    server.use(
      http.all(url, async () => {
        hitCount++;
        await delay(1000);
        return HttpResponse.json({ responseTime: Math.random() });
      }),
    );

    const p1 = fatcher(url, { ttl: 2000, middlewares: [cache] });
    const p2 = fatcher(url, { ttl: 2000, middlewares: [cache] });

    const [r1, r2] = await Promise.all([p1, p2]);
    const [j1, j2] = await Promise.all([r1.json(), r2.json()]);

    expect(hitCount).toBe(1);

    expect(j1.responseTime).toBe(j2.responseTime);
  });
});
