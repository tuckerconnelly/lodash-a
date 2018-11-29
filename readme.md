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

### mapBatches(batchSize, fn, data)

Maps the data using the `fn`, calling all promise-making functions sequentially in parallel batches of `batchSize`.

Example:

```js
_a.pipe(
  fetch,
  _.invoke('json'),
  _.map('name'),
  _.map(n => `https://api.github.com/repos/octocat/Hello-World/branches/${n}`)
  _a.mapBatches(5, fetch),
  _a.mapSequential(_.invoke('json')),
  _.map('author.login')
)('https://api.github.com/repos/octocat/Hello-World/branches')
// > The names of all the authors of the branches of the octocate/Hello-World repo, firing off requests in batches of 5
```

### delay(ms, fn, data)

Delays the `fn` by `ms`

Example:

```js
_a.pipe(
  fetch,
  _.invoke('json'),
  _.map('name'),
  _.map(n => `https://api.github.com/repos/octocat/Hello-World/branches/${n}`)
  _a.mapBatches(5, _a.delay(1000, fetch)),
  _a.mapSequential(_.invoke('json')),
  _.map('author.login')
)('https://api.github.com/repos/octocat/Hello-World/branches')
// > The names of all the authors of the branches of the octocate/Hello-World repo, firing off requests in batches of 5, delaying each request (effectively, each batch) by 1000 milliseconds
```

### preDelay(ms, fn, data)

Alias for `delay`


### postDelay(ms, fn, data)

Like `delay`, but delays after the function is called instead of before.

### catchWith(catchingFn, fn, data)

Catches the function call with `catchingFn`.

Example:

```js
_a.pipe([
  _a.catchWith(console.error),
  fetch,
  _.invoke('text')
])('https://google.com')
// > The html of google.com, or undefined, with a logged error, if an error occurred
```

### tap(fn, data)

Calls `await fn(data)`, passing `data` to the next function and ignoring the return value of `fn(data)`.

Example:

```js
_a.pipe([
  _a.tap(async url => console.log(url)),
  fetch,
  _.invoke('text')
])('https://google.com')
// > The html of google.com, logging the url before fetching
```

### applyValues(object, data)

Accepts an object with functions as each of its properties, calling each of the functions and replacing them with values.

Example:

```js
_a.pipe(
  fetch,
  _.invoke('json'),
  _.map('name'),
  _.map(n => `https://api.github.com/repos/octocat/Hello-World/branches/${n}`)
  _a.mapBatches(5, _a.delay(1000, fetch)),
  _a.mapSequential(_.invoke('json')),
  _a.mapParallel(_a.applyValues({
    commitAuthorName: _.get('commit.commit.author.name'),
    parentCount: _.reduce(_.sum, 0, _.get('commit.parents'))
  }))
)('https://api.github.com/repos/octocat/Hello-World/branches')
> [{commitAuthorName: 'The Octocat', parentCount: 2}, ...]
```
