const map = require('lodash/fp/map');
const curry = require('lodash/fp/curry');

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

exports.delay = curry(async function delay(ms, fn, args) {
  await new Promise(resolve => setTimeout(resolve, ms));
  return fn(args);
});

exports.reduce = curry(async function reduce(startingValue, fn, list) {
  let prev = startingValue;
  for (let i in list) prev = await fn(prev, list[i], i);
  return prev;
});
