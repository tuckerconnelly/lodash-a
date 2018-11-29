const map = require('lodash/fp/map');
const curry = require('lodash/fp/curry');
const chunk = require('lodash/fp/chunk');

exports.pipe = curry(async function pipe(functions, list) {
  let outputs = list;
  for (let fn of functions) if (fn) outputs = await fn(outputs);
  return outputs;
});

exports.mapParallel = curry(async function mapParallel(fn, list) {
  return Promise.all(map(fn, list));
});

exports.mapSequential = curry(async function mapSequential(fn, list) {
  const values = [];
  for (let curr of list) values.push(await fn(curr));
  return values;
});

exports.mapBatches = curry(async function mapBatches(batchSize, fn, list) {
  const batches = chunk(batchSize, list);
  let res = [];
  for (const batch of batches) {
    res = res.concat(await Promise.all(map(fn, batch)));
  }
  return res;
});

exports.delay = curry(async function delay(ms, fn, args) {
  await new Promise(resolve => setTimeout(resolve, ms));
  return fn(args);
});

exports.preDelay = exports.delay;

exports.postDelay = curry(async function delay(ms, fn, args) {
  const res = await fn(args);
  await new Promise(resolve => setTimeout(resolve, ms));
  return res;
});

exports.catchWith = curry(async function catchWith(fn, fnToCatch, args) {
  let res;
  try {
    res = await fnToCatch(args);
  } catch (err) {
    return fn(err);
  }
  return res;
});

exports.tap = curry(async function tap(fn, args) {
  await fn(args);
  return args;
});

exports.applyValues = curry(async function applyValues(object, value) {
  if (typeof object !== 'object') {
    throw new Error('Must pass object to applyValues().');
  }
  const res = {};
  for (let key of Object.keys(object)) {
    res[key] = await object[key](value);
  }
  return res;
});
