function _newArrowCheck(innerThis, boundThis) { if (innerThis !== boundThis) { throw new TypeError("Cannot instantiate an arrow function"); } }

import attempt from 'attempt-x';
import splitIfBoxedBug from 'split-if-boxed-bug-x';
import toLength from 'to-length-x';
import toObject from 'to-object-x';
import assertIsFunction from 'assert-is-function-x';
import requireObjectCoercible from 'require-object-coercible-x';
var nfe = [].forEach;
var nativeForEach = typeof nfe === 'function' && nfe;

var test1 = function test1() {
  var _this = this;

  var spy = 0;
  var res = attempt.call([1, 2], nativeForEach, function (item) {
    _newArrowCheck(this, _this);

    spy += item;
  }.bind(this));
  return res.threw === false && typeof res.value === 'undefined' && spy === 3;
};

var test2 = function test2() {
  var _this2 = this;

  var spy = '';
  var res = attempt.call({}.constructor('abc'), nativeForEach, function (item) {
    _newArrowCheck(this, _this2);

    spy += item;
  }.bind(this));
  return res.threw === false && typeof res.value === 'undefined' && spy === 'abc';
};

var test3 = function test3() {
  var spy = 0;
  var res = attempt.call(function getArgs() {
    /* eslint-disable-next-line prefer-rest-params */
    return arguments;
  }(1, 2, 3), nativeForEach, function spyAdd(item) {
    spy += item;
  });
  return res.threw === false && typeof res.value === 'undefined' && spy === 6;
};

var test4 = function test4() {
  var spy = 0;
  var res = attempt.call({
    0: 1,
    1: 2,
    3: 3,
    4: 4,
    length: 4
  }, nativeForEach, function spyAdd(item) {
    spy += item;
  });
  return res.threw === false && typeof res.value === 'undefined' && spy === 6;
};

var test5 = function test5() {
  var doc = typeof document !== 'undefined' && document;

  if (doc) {
    var spy = null;
    var fragment = doc.createDocumentFragment();
    var div = doc.createElement('div');
    fragment.appendChild(div);
    var res = attempt.call(fragment.childNodes, nativeForEach, function spyAssign(item) {
      spy = item;
    });
    return res.threw === false && typeof res.value === 'undefined' && spy === div;
  }

  return true;
};

var test6 = function test6() {
  var isStrict = function returnIsStrict() {
    /* eslint-disable-next-line babel/no-invalid-this */
    return true.constructor(this) === false;
  }();

  if (isStrict) {
    var spy = null;
    var res = attempt.call([1], nativeForEach, function thisTest() {
      /* eslint-disable-next-line babel/no-invalid-this */
      spy = typeof this === 'string';
    }, 'x');
    return res.threw === false && typeof res.value === 'undefined' && spy === true;
  }

  return true;
};

var test7 = function test7() {
  var spy = {};
  var fn = 'return nativeForEach.call("foo", function (_, __, context) {' + 'if (castBoolean(context) === false || typeof context !== "object") {' + 'spy.value = true;}});';
  /* eslint-disable-next-line no-new-func */

  var res = attempt(Function('nativeForEach', 'spy', 'castBoolean', fn), nativeForEach, spy, true.constructor);
  return res.threw === false && typeof res.value === 'undefined' && spy.value !== true;
};

var isWorking = true.constructor(nativeForEach) && test1() && test2() && test3() && test4() && test5() && test6() && test7();
/**
 * This method executes a provided function once for each array element.
 *
 * @param {Array} array - The array to iterate over.
 * @param {Function} callBack - Function to execute for each element.
 * @param {*} [thisArg] - Value to use as this when executing callback.
 * @throws {TypeError} If array is null or undefined.
 * @throws {TypeError} If callBack is not a function.
 */

var $forEach;

if (isWorking) {
  $forEach = function forEach(array, callBack
  /* , thisArg */
  ) {
    requireObjectCoercible(array);
    var args = [assertIsFunction(callBack)];

    if (arguments.length > 2) {
      /* eslint-disable-next-line prefer-rest-params,prefer-destructuring */
      args[1] = arguments[2];
    }

    return nativeForEach.apply(array, args);
  };
} else {
  $forEach = function forEach(array, callBack
  /* , thisArg */
  ) {
    var object = toObject(array); // If no callback function or if callback is not a callable function

    assertIsFunction(callBack);
    var iterable = splitIfBoxedBug(object);
    var length = toLength(iterable.length);
    var thisArg;

    if (arguments.length > 2) {
      /* eslint-disable-next-line prefer-rest-params,prefer-destructuring */
      thisArg = arguments[2];
    }

    var noThis = typeof thisArg === 'undefined';

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

var arrayForEach = $forEach;
export default arrayForEach;

//# sourceMappingURL=array-for-each-x.esm.js.map