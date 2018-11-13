# lodash-a

Asynchronous helpers for lodash.

Early version! Will be adding more methods as needed.

## Usage

Install:

```
npm i lodash-a
```

Import and use:

```js
const _ = require('lodash');
const _a = require('lodash-a');

_a.pipe(
  fetch,
  _.invoke('json'),
  _.map('author.url'),
  _a.mapParallel(fetch),
  _a.mapParallel(_.invoke('json')),
  _.map('name')
)('https://api.github.com/repos/octocat/Hello-World/commits')
// > ['The Octocat', 'Johnneylee Jack Rollins', 'Spaceghost', ...]
```

## Methods

### pipe(fns, data)

`await`s each function in sequence, passing the value to each successive function. Equivalent to `await fn1(await fn2(await fn3(data)))`.

Example:

```js
_a.pipe(
  fetch,
  _.invoke('text')
)('https://github.com')
// > The html of github.com
```

### mapParallel(fn, data)

Maps the data using the `fn`, calling all promises simultaneously and waiting until they all return. Same as `Promise.all`

Example:

```js
_a.pipe(
  fetch,
  _.invoke('json'),
  _.map('commit.tree.url'),
  _a.mapParallel(fetch),
  _a.mapParallel(_.invoke('json')),
  _.map('sha')
)('https://api.github.com/repos/octocat/Hello-World/commits')
// > The tree sha's of all the commits on the octocat Hello-World repo. All
// requests are fired at once.
```

### mapSequential(fn, data)

Maps the data using the `fn`, calling all promises sequentially.

Example:

```js
_a.pipe(
  fetch,
  _.invoke('json'),
  _.map('name'),
  _.map(n => `https://api.github.com/repos/octocat/Hello-World/branches/${n}`)
  _a.mapSequential(fetch),
  _a.mapSequential(_.invoke('json')),
  _.map('author.login')
)('https://api.github.com/repos/octocat/Hello-World/branches')
// > The names of all the authors of the branches of the octocate/Hello-World repo, firing off requests sequentially
```

### reduce(accumulator, fn, data)

Like lodash's `reduce`, but `await`s each fn call.

Example:

```js

async asyncSum(a, b) {
  return a + b
}

_a.reduce(0, asyncSum, [1, 2, 3])
// > 6
