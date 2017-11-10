/**
 * @file Executes a provided function once for each array element.
 * @version 2.3.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module array-for-each-x
 */

'use strict';

var cachedCtrs = require('cached-constructors-x');
var ArrayCtr = cachedCtrs.Array;
var castObject = cachedCtrs.Object;
var nativeForEach = typeof ArrayCtr.prototype.forEach === 'function' && ArrayCtr.prototype.forEach;

var isWorking;
if (nativeForEach) {
  var attempt = require('attempt-x');
  var spy = 0;
  var res = attempt.call([1, 2], nativeForEach, function (item) {
    spy += item;
  });

  isWorking = res.threw === false && typeof res.value === 'undefined' && spy === 3;

  if (isWorking) {
    spy = '';
    res = attempt.call(castObject('abc'), nativeForEach, function (item) {
      spy += item;
    });

    isWorking = res.threw === false && typeof res.value === 'undefined' && spy === 'abc';
  }

  if (isWorking) {
    spy = 0;
    res = attempt.call((function () {
      return arguments;
    }(1, 2, 3)), nativeForEach, function (item) {
      spy += item;
    });

    isWorking = res.threw === false && typeof res.value === 'undefined' && spy === 6;
  }

  if (isWorking) {
    spy = 0;
    res = attempt.call({
      0: 1,
      1: 2,
      3: 3,
      4: 4,
      length: 4
    }, nativeForEach, function (item) {
      spy += item;
    });

    isWorking = res.threw === false && typeof res.value === 'undefined' && spy === 6;
  }

  if (isWorking) {
    var doc = typeof document !== 'undefined' && document;
    if (doc) {
      spy = null;
      var fragment = doc.createDocumentFragment();
      var div = doc.createElement('div');
      fragment.appendChild(div);
      res = attempt.call(fragment.childNodes, nativeForEach, function (item) {
        spy = item;
      });

      isWorking = res.threw === false && typeof res.value === 'undefined' && spy === div;
    }
  }

  if (isWorking) {
    var isStrict = (function () {
      // eslint-disable-next-line no-invalid-this
      return Boolean(this) === false;
    }());

    if (isStrict) {
      spy = null;
      res = attempt.call([1], nativeForEach, function () {
        // eslint-disable-next-line no-invalid-this
        spy = typeof this === 'string';
      }, 'x');

      isWorking = res.threw === false && typeof res.value === 'undefined' && spy === true;
    }
  }

  if (isWorking) {
    spy = {};
    var fn = [
      'return nativeForEach.call("foo", function (_, __, context) {',
      'if (Boolean(context) === false || typeof context !== "object") {',
      'spy.value = true;}});'
    ].join('');

    // eslint-disable-next-line no-new-func
    res = attempt(Function('nativeForEach', 'spy', fn), nativeForEach, spy);

    isWorking = res.threw === false && typeof res.value === 'undefined' && spy.value !== true;
  }
}

var $forEach;
if (nativeForEach) {
  $forEach = function forEach(array, callBack /* , thisArg */) {
    var args = [callBack];
    if (arguments.length > 2) {
      args[1] = arguments[2];
    }

    return nativeForEach.apply(array, args);
  };
} else {
  var splitIfBoxedBug = require('split-if-boxed-bug-x');
  var toLength = require('to-length-x').toLength2018;
  var isUndefined = require('validate.io-undefined');
  var toObject = require('to-object-x');
  var assertIsFunction = require('assert-is-function-x');

  $forEach = function forEach(array, callBack /* , thisArg */) {
    var object = toObject(array);
    // If no callback function or if callback is not a callable function
    assertIsFunction(callBack);
    var iterable = splitIfBoxedBug(object);
    var length = toLength(iterable.length);
    var thisArg;
    if (arguments.length > 2) {
      thisArg = arguments[2];
    }

    var noThis = isUndefined(thisArg);
    for (var i = 0; i < length; i += 1) {
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
 * @param {array} array - The array to iterate over.
 * @param {Function} callBack - Function to execute for each element.
 * @param {*} [thisArg] - Value to use as this when executing callback.
 * @throws {TypeError} If array is null or undefined.
 * @throws {TypeError} If callBack is not a function.
 * @example
 * var forEach = require('array-for-each-x');
 *
 * var items = ['item1', 'item2', 'item3'];
 * var copy = [];
 *
 * forEach(items, function(item){
 *   copy.push(item)
 * });
 */
module.exports = $forEach;
