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

describe('Method', () => {
  it('Cached Response with GET', async () => {
    const url = `https://foo.bar?id=${id++}`;
    const response = await fatcher(url, { ttl: 2000, middlewares: [cache] });
    const result = await response.json();

    const response1 = await fatcher(url, { middlewares: [cache] });
    const result1 = await response1.json();

    expect(result.responseTime === result1.responseTime).toBe(true);
  });

  it('Will not cache with POST', async () => {
    const url = `https://foo.bar?id=${id++}`;
    const response = await fatcher(url, { ttl: 2000, middlewares: [cache], method: 'POST' });
    const result = await response.json();

    const response1 = await fatcher(url, { middlewares: [cache], method: 'POST' });
    const result1 = await response1.json();

    expect(result.responseTime === result1.responseTime).toBe(false);
  });

  it('Will not cache with PUT', async () => {
    const url = `https://foo.bar?id=${id++}`;
    const response = await fatcher(url, { ttl: 2000, middlewares: [cache], method: 'PUT' });
    const result = await response.json();

    const response1 = await fatcher(url, { middlewares: [cache], method: 'PUT' });
    const result1 = await response1.json();

    expect(result.responseTime === result1.responseTime).toBe(false);
  });

  it('Will not cache with DELETE', async () => {
    const url = `https://foo.bar?id=${id++}`;

    const response = await fatcher(url, { ttl: 2000, middlewares: [cache], method: 'DELETE' });
    const result = await response.json();

    const response1 = await fatcher(url, { middlewares: [cache], method: 'DELETE' });
    const result1 = await response1.json();

    expect(result.responseTime === result1.responseTime).toBe(false);
  });

  it('Will not cache with HEAD', async () => {
    const url = `https://foo.bar?id=${id++}`;
    const response = await fatcher(url, { ttl: 2000, middlewares: [cache], method: 'HEAD' });
    const result = await response.json();

    const response1 = await fatcher(url, { middlewares: [cache], method: 'HEAD' });
    const result1 = await response1.json();

    expect(result.responseTime === result1.responseTime).toBe(false);
  });
});
