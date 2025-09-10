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

describe('Valid', () => {
  it('Valid Cached out of ttl', async () => {
    const url = `https://foo.bar?id=${id++}`;
    const response = await fatcher(url, { ttl: 1000, middlewares: [cache] });
    const result = await response.json();

    await delay(1000);

    const response1 = await fatcher(url, { middlewares: [cache] });
    const result1 = await response1.json();

    expect(result.responseTime === result1.responseTime).toBe(false);
  });
});
