/**
 * @file Executes a provided function once for each array element.
 * @version 2.3.0.
 * @author Xotic750 <Xotic750@gmail.com>.
 * @copyright  Xotic750.
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module Array-for-each-x.
 */

const cachedCtrs = require('cached-constructors-x');

const ArrayCtr = cachedCtrs.Array;
const castObject = cachedCtrs.Object;
const nativeForEach = typeof ArrayCtr.prototype.forEach === 'function' && ArrayCtr.prototype.forEach;

let isWorking;

if (nativeForEach) {
  const attempt = require('attempt-x');
  let spy = 0;
  let res = attempt.call([1, 2], nativeForEach, function(item) {
    spy += item;
  });

  isWorking = res.threw === false && typeof res.value === 'undefined' && spy === 3;

  if (isWorking) {
    spy = '';
    res = attempt.call(castObject('abc'), nativeForEach, function(item) {
      spy += item;
    });

    isWorking = res.threw === false && typeof res.value === 'undefined' && spy === 'abc';
  }

  if (isWorking) {
    spy = 0;
    res = attempt.call(
      (function() {
        return arguments;
      })(1, 2, 3),
      nativeForEach,
      function(item) {
        spy += item;
      },
    );

    isWorking = res.threw === false && typeof res.value === 'undefined' && spy === 6;
  }

  if (isWorking) {
    spy = 0;
    res = attempt.call(
      {
        0: 1,
        1: 2,
        3: 3,
        4: 4,
        length: 4,
      },
      nativeForEach,
      function(item) {
        spy += item;
      },
    );

    isWorking = res.threw === false && typeof res.value === 'undefined' && spy === 6;
  }

  if (isWorking) {
    const doc = typeof document !== 'undefined' && document;

    if (doc) {
      spy = null;
      const fragment = doc.createDocumentFragment();
      const div = doc.createElement('div');
      fragment.appendChild(div);
      res = attempt.call(fragment.childNodes, nativeForEach, function(item) {
        spy = item;
      });

      isWorking = res.threw === false && typeof res.value === 'undefined' && spy === div;
    }
  }

  if (isWorking) {
    const isStrict = (function() {
      // eslint-disable-next-line no-invalid-this
      return Boolean(this) === false;
    })();

    if (isStrict) {
      spy = null;
      res = attempt.call(
        [1],
        nativeForEach,
        function() {
          // eslint-disable-next-line no-invalid-this
          spy = typeof this === 'string';
        },
        'x',
      );

      isWorking = res.threw === false && typeof res.value === 'undefined' && spy === true;
    }
  }

  if (isWorking) {
    spy = {};
    const fn = [
      'return nativeForEach.call("foo", function (_, __, context) {',
      'if (Boolean(context) === false || typeof context !== "object") {',
      'spy.value = true;}});',
    ].join('');

    // eslint-disable-next-line no-new-func
    res = attempt(Function('nativeForEach', 'spy', fn), nativeForEach, spy);

    isWorking = res.threw === false && typeof res.value === 'undefined' && spy.value !== true;
  }
}

let $forEach;

if (nativeForEach) {
  $forEach = function forEach(array, callBack /* , thisArg */) {
    const args = [callBack];

    if (arguments.length > 2) {
      args[1] = arguments[2];
    }

    return nativeForEach.apply(array, args);
  };
} else {
  const splitIfBoxedBug = require('split-if-boxed-bug-x');
  const toLength = require('to-length-x').toLength2018;
  const isUndefined = require('validate.io-undefined');
  const toObject = require('to-object-x');
  const assertIsFunction = require('assert-is-function-x');

  $forEach = function forEach(array, callBack /* , thisArg */) {
    const object = toObject(array);
    // If no callback function or if callback is not a callable function
    assertIsFunction(callBack);
    const iterable = splitIfBoxedBug(object);
    const length = toLength(iterable.length);
    let thisArg;

    if (arguments.length > 2) {
      thisArg = arguments[2];
    }

    const noThis = isUndefined(thisArg);
    for (let i = 0; i < length; i += 1) {
      if (i in iterable) {
        if (noThis) {
          callBack(iterable[i], i, object);
        } else {
          callBack.call(thisArg, iterable[i], i, object);
        }
      }
    }
  };
}

/**
 * This method executes a provided function once for each array element.
 *
 * @param {Array} array - The array to iterate over.
 * @param {Function} callBack - Function to execute for each element.
 * @param {*} [thisArg] - Value to use as this when executing callback.
 * @throws {TypeError} If array is null or undefined.
 * @throws {TypeError} If callBack is not a function.
 * @example
 * var forEach = require('array-for-each-x');.
 *
 * var items = ['item1', 'item2', 'item3'];
 * var copy = [];
 *
 * forEach(items, function(item){
 *   copy.push(item)
 * });
 */
module.exports = $forEach;
