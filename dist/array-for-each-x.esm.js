import attempt from 'attempt-x';
import toObject from 'to-object-x';
import assertIsFunction from 'assert-is-function-x';
import requireObjectCoercible from 'require-object-coercible-x';
import toBoolean from 'to-boolean-x';
import all from 'array-all-x';
import methodize from 'simple-methodize-x';
import call from 'simple-call-x';
var nfe = [].forEach;
var nativeForEach = typeof nfe === 'function' && methodize(nfe);

var test1 = function test1() {
  var spy = 0;
  var res = attempt(function attemptee() {
    return nativeForEach([1, 2], function iteratee(item) {
      spy += item;
    });
  });
  return res.threw === false && typeof res.value === 'undefined' && spy === 3;
};

var test2 = function test2() {
  var spy = '';
  var res = attempt(function attemptee() {
    return nativeForEach(toObject('abc'), function iteratee(item) {
      spy += item;
    });
  });
  return res.threw === false && typeof res.value === 'undefined' && spy === 'abc';
};

var test3 = function test3() {
  var spy = 0;
  var res = attempt(function attemptee() {
    var args = function getArgs() {
      /* eslint-disable-next-line prefer-rest-params */
      return arguments;
    }(1, 2, 3);

    return nativeForEach(args, function iteratee(item) {
      spy += item;
    });
  });
  return res.threw === false && typeof res.value === 'undefined' && spy === 6;
};

var test4 = function test4() {
  var spy = 0;
  var res = attempt(function attemptee() {
    return nativeForEach({
      0: 1,
      1: 2,
      3: 3,
      4: 4,
      length: 4
    }, function iteratee(item) {
      spy += item;
    });
  });
  return res.threw === false && typeof res.value === 'undefined' && spy === 6;
};

var doc = typeof document !== 'undefined' && document;

var test5 = function test5() {
  if (doc) {
    var spy = null;
    var fragment = doc.createDocumentFragment();
    var div = doc.createElement('div');
    fragment.appendChild(div);
    var res = attempt(function attemptee() {
      return nativeForEach(fragment.childNodes, function iteratee(item) {
        spy = item;
      });
    });
    return res.threw === false && typeof res.value === 'undefined' && spy === div;
  }

  return true;
};

var isStrict = function returnIsStrict() {
  /* eslint-disable-next-line babel/no-invalid-this */
  return toBoolean(this) === false;
}();

var test6 = function test6() {
  if (isStrict) {
    var spy = null;

    var thisTest = function thisTest() {
      /* eslint-disable-next-line babel/no-invalid-this */
      spy = typeof this === 'string';
    };

    var res = attempt(function attemptee() {
      return nativeForEach([1], thisTest, 'x');
    });
    return res.threw === false && typeof res.value === 'undefined' && spy === true;
  }

  return true;
};

var test7 = function test7() {
  var spy = {};
  var fn = 'return nativeForEach("foo", function (_, __, context) {' + 'if (toBoolean(context) === false || typeof context !== "object") {' + 'spy.value = true;}});';
  var res = attempt(function attemptee() {
    /* eslint-disable-next-line no-new-func */
    return Function('nativeForEach', 'spy', 'toBoolean', fn)(nativeForEach, spy, toBoolean);
  });
  return res.threw === false && typeof res.value === 'undefined' && spy.value !== true;
};

var isWorking = toBoolean(nativeForEach) && test1() && test2() && test3() && test4() && test5() && test6() && test7();

var patchedNative = function forEach(array, callBack
/* , thisArg */
) {
  /* eslint-disable-next-line prefer-rest-params */
  return nativeForEach(requireObjectCoercible(array), assertIsFunction(callBack), arguments[2]);
};

export var implementation = function forEach(array, callBack
/* , thisArg */
) {
  var object = toObject(array); // If no callback function or if callback is not a callable function

  assertIsFunction(callBack);

  var iteratee = function iteratee() {
    /* eslint-disable-next-line prefer-rest-params */
    var i = arguments[1];
    /* eslint-disable-next-line prefer-rest-params */

    if (i in arguments[2]) {
      /* eslint-disable-next-line prefer-rest-params,babel/no-invalid-this */
      call(callBack, this, [arguments[0], i, object]);
    }
  };
  /* eslint-disable-next-line prefer-rest-params */


  all(object, iteratee, arguments[2]);
};
/**
 * This method executes a provided function once for each array element.
 *
 * @param {Array} array - The array to iterate over.
 * @param {Function} callBack - Function to execute for each element.
 * @param {*} [thisArg] - Value to use as this when executing callback.
 * @throws {TypeError} If array is null or undefined.
 * @throws {TypeError} If callBack is not a function.
 */

var $forEach = isWorking ? patchedNative : implementation;
export default $forEach;

//# sourceMappingURL=array-for-each-x.esm.js.map