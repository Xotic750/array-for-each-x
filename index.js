/**
 * @file Executes a provided function once for each array element.
 * @version 1.0.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module array-for-each-x
 */

'use strict';

var toObject = require('to-object-x');
var assertIsFunction = require('assert-is-function-x');
var some = require('array-some-x');

var $forEach = function forEach(array, callBack /* , thisArg */) {
  var object = toObject(array);
  // If no callback function or if callback is not a callable function
  assertIsFunction(callBack);
  var wrapped = function _wrapped(item, idx, obj) {
    // eslint-disable-next-line no-invalid-this
    callBack.call(this, item, idx, obj);
  };

  var args = [object, wrapped];
  if (arguments.length > 2) {
    args.push(arguments[2]);
  }

  some.apply(void 0, args);
};

/**
 * This method executes a provided function once for each array element.
 *
 * @param {array} array - The array to iterate over.
 * @param {Function} callBack - Function to execute for each element.
 * @param {*} [thisArg] - Value to use as this when executing callback.
 * @throws {TypeError} If array is null or undefined.
 * @throws {TypeError} If callBack is not a function.
 * @example
 * var placeHolder = require('array-for-each-x');
 *
 * var items = ['item1', 'item2', 'item3'];
 * var copy = [];
 *
 * for (var i=0; i<items.length; i++) {
 *   copy.push(items[i])
 * }
 */
module.exports = $forEach;
