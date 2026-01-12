# @fatcherjs/middleware-cache

<div align="center">
  <a href="https://codecov.io/github/fatcherjs/middleware-cache" > 
    <img src="https://codecov.io/github/fatcherjs/middleware-cache/graph/badge.svg?token=PS7X9KFZ2S"/> 
 </a>
  <a href="https://www.jsdelivr.com/package/npm/@fatcherjs/middleware-cache">
    <img src="https://data.jsdelivr.com/v1/package/npm/@fatcherjs/middleware-cache/badge?style=rounded" alt="jsDelivr">
  </a>
  <a href="https://packagephobia.com/result?p=@fatcherjs/middleware-cache">
    <img src="https://packagephobia.com/badge?p=@fatcherjs/middleware-cache" alt="install size">
  </a>
  <a href="https://unpkg.com/@fatcherjs/middleware-cache">
    <img src="https://img.badgesize.io/https://unpkg.com/@fatcherjs/middleware-cache" alt="Size">
  </a>
  <a href="https://npmjs.com/package/@fatcherjs/middleware-cache">
    <img src="https://img.shields.io/npm/v/@fatcherjs/middleware-cache.svg" alt="npm package">
  </a>
  <a href="https://github.com/fatcherjs/middleware-cache/actions/workflows/ci.yml">
    <img src="https://github.com/fatcherjs/middleware-cache/actions/workflows/ci.yml/badge.svg?branch=master" alt="build status">
  </a>
</div>

## Install

### NPM

```bash
>$ npm install @fatcherjs/middleware-cache
```

### CDN

```html
<script src="https://cdn.jsdelivr.net/npm/fatcher/dist/fatcher.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@fatcherjs/middleware-cache/dist/index.min.js"></script>

<script>
  Fatcher.fatcher('url', {
    middlewares: [FatcherMiddlewareCache.cache],
    ttl: 60 * 1000, // 60s
  }).then(async response => {
    const text = await response.text();

    Fatcher.fatcher('url', {
      middlewares: [FatcherMiddlewareCache.cache],
    }).then(async response2 => {
      const text2 = await response2.text();

      console.log(text === text2); // true
    });
  });
</script>
```

## Usage

```ts
import { fatcher } from 'fatcher';
import { cache } from '@fatcherjs/middleware-cache';

fatcher('https://foo.bar', {
  middlewares: [cache],
});
```

## Options

### ttl

```ts
import { fatcher } from 'fatcher';
import { cache } from '@fatcherjs/middleware-cache';

fatcher('https://foo.bar', {
  ttl: 5 * 1000,
  middlewares: [cache],
});
```

### flush

```ts
import { fatcher } from 'fatcher';
import { cache } from '@fatcherjs/middleware-cache';

fatcher('https://foo.bar', {
  ttl: 5 * 1000,
  middlewares: [cache],
});

fatcher('https://foo.bar', {
  ttl: 5 * 1000,
  flush: true, // ignore cache and refresh cache with ttl > 0
  middlewares: [cache],
});
```

## API

### clearCache

```ts
import { fatcher } from 'fatcher';
import { cache, clearCache } from '@fatcherjs/middleware-cache';

fatcher('https://foo.bar', {
  ttl: 5 * 1000,
  middlewares: [cache],
});

clearCache('https://foo.bar'); // clear single cache
clearCache(); // clear all cache
```

## License

[MIT](https://github.com/fatcherjs/middleware-cache/blob/master/LICENSE)
