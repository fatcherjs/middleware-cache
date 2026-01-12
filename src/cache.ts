import { FatcherMiddleware } from 'fatcher';

const store = new Map<string, { expireTime: number; response: Response }>();
const pendingStore = new Map<string, { promise: Promise<Response> }>();

export const cache: FatcherMiddleware = {
  name: 'fatcher-middleware-cache',
  use: async (context, next) => {
    const { ttl, flush } = context;

    if (context.request.method.toUpperCase() !== 'GET') {
      return next();
    }

    const cacheKey = `${context.request.url}`;

    let hitCache = store.get(cacheKey);

    if (flush || (hitCache && hitCache.expireTime < Date.now())) {
      store.delete(cacheKey);
      hitCache = undefined;
    }

    if (hitCache) {
      return hitCache.response.clone();
    }

    if (typeof ttl !== 'number' || ttl <= 0) {
      return next();
    }

    const pending = pendingStore.get(cacheKey);
    if (pending) {
      const response = await pending.promise;
      return response.clone();
    }

    const promise = (async () => {
      try {
        const response = await next();
        store.set(cacheKey, {
          response: response.clone(),
          expireTime: Date.now() + ttl,
        });
        return response;
      } finally {
        pendingStore.delete(cacheKey);
      }
    })();

    pendingStore.set(cacheKey, { promise });

    const response = await promise;
    return response.clone();
  },
};
