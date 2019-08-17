import attempt from 'attempt-x';
import toObject from 'to-object-x';
import assertIsFunction from 'assert-is-function-x';
import requireObjectCoercible from 'require-object-coercible-x';
import toBoolean from 'to-boolean-x';
import all from 'array-all-x';
import methodize from 'simple-methodize-x';
import call from 'simple-call-x';

const nfe = [].forEach;
const nativeForEach = typeof nfe === 'function' && methodize(nfe);

const test1 = function test1() {
  let spy = 0;
  const res = attempt(function attemptee() {
    return nativeForEach([1, 2], function iteratee(item) {
      spy += item;
    });
  });

  return res.threw === false && typeof res.value === 'undefined' && spy === 3;
};

const test2 = function test2() {
  let spy = '';
  const res = attempt(function attemptee() {
    return nativeForEach(toObject('abc'), function iteratee(item) {
      spy += item;
    });
  });

  return res.threw === false && typeof res.value === 'undefined' && spy === 'abc';
};

const test3 = function test3() {
  let spy = 0;
  const res = attempt(function attemptee() {
    const args = (function getArgs() {
      /* eslint-disable-next-line prefer-rest-params */
      return arguments;
    })(1, 2, 3);

    return nativeForEach(args, function iteratee(item) {
      spy += item;
    });
  });

  return res.threw === false && typeof res.value === 'undefined' && spy === 6;
};

const test4 = function test4() {
  let spy = 0;
  const res = attempt(function attemptee() {
    return nativeForEach({0: 1, 1: 2, 3: 3, 4: 4, length: 4}, function iteratee(item) {
      spy += item;
    });
  });

  return res.threw === false && typeof res.value === 'undefined' && spy === 6;
};

const doc = typeof document !== 'undefined' && document;

const test5 = function test5() {
  if (doc) {
    let spy = null;
    const fragment = doc.createDocumentFragment();
    const div = doc.createElement('div');
    fragment.appendChild(div);
    const res = attempt(function attemptee() {
      return nativeForEach(fragment.childNodes, function iteratee(item) {
        spy = item;
      });
    });

    return res.threw === false && typeof res.value === 'undefined' && spy === div;
  }

  return true;
};

const isStrict = (function returnIsStrict() {
  /* eslint-disable-next-line babel/no-invalid-this */
  return toBoolean(this) === false;
})();

const test6 = function test6() {
  if (isStrict) {
    let spy = null;

    const thisTest = function thisTest() {
      /* eslint-disable-next-line babel/no-invalid-this */
      spy = typeof this === 'string';
    };

    const res = attempt(function attemptee() {
      return nativeForEach([1], thisTest, 'x');
    });

    return res.threw === false && typeof res.value === 'undefined' && spy === true;
  }

  return true;
};

const test7 = function test7() {
  const spy = {};
  const fn =
    'return nativeForEach("foo", function (_, __, context) {' +
    'if (toBoolean(context) === false || typeof context !== "object") {' +
    'spy.value = true;}});';

  const res = attempt(function attemptee() {
    /* eslint-disable-next-line no-new-func */
    return Function('nativeForEach', 'spy', 'toBoolean', fn)(nativeForEach, spy, toBoolean);
  });

  return res.threw === false && typeof res.value === 'undefined' && spy.value !== true;
};

const isWorking = toBoolean(nativeForEach) && test1() && test2() && test3() && test4() && test5() && test6() && test7();

const patchedNative = function forEach(array, callBack /* , thisArg */) {
  /* eslint-disable-next-line prefer-rest-params */
  return nativeForEach(requireObjectCoercible(array), assertIsFunction(callBack), arguments[2]);
};

export const implementation = function forEach(array, callBack /* , thisArg */) {
  const object = toObject(array);
  // If no callback function or if callback is not a callable function
  assertIsFunction(callBack);
  const iteratee = function iteratee() {
    /* eslint-disable-next-line prefer-rest-params */
    const i = arguments[1];

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
const $forEach = isWorking ? patchedNative : implementation;

export default $forEach;
