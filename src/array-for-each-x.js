import attempt from 'attempt-x';
import splitIfBoxedBug from 'split-if-boxed-bug-x';
import toLength from 'to-length-x';
import toObject from 'to-object-x';
import assertIsFunction from 'assert-is-function-x';
import requireObjectCoercible from 'require-object-coercible-x';
import toBoolean from 'to-boolean-x';

const nfe = [].forEach;
const nativeForEach = typeof nfe === 'function' && nfe;

const test1 = function test1() {
  let spy = 0;
  const res = attempt.call([1, 2], nativeForEach, (item) => {
    spy += item;
  });

  return res.threw === false && typeof res.value === 'undefined' && spy === 3;
};

const test2 = function test2() {
  let spy = '';
  const res = attempt.call({}.constructor('abc'), nativeForEach, (item) => {
    spy += item;
  });

  return res.threw === false && typeof res.value === 'undefined' && spy === 'abc';
};

const test3 = function test3() {
  let spy = 0;
  const res = attempt.call(
    (function getArgs() {
      /* eslint-disable-next-line prefer-rest-params */
      return arguments;
    })(1, 2, 3),
    nativeForEach,
    function spyAdd1(item) {
      spy += item;
    },
  );

  return res.threw === false && typeof res.value === 'undefined' && spy === 6;
};

const test4 = function test4() {
  let spy = 0;
  const res = attempt.call(
    {
      0: 1,
      1: 2,
      3: 3,
      4: 4,
      length: 4,
    },
    nativeForEach,
    function spyAdd2(item) {
      spy += item;
    },
  );

  return res.threw === false && typeof res.value === 'undefined' && spy === 6;
};

const test5 = function test5() {
  const doc = typeof document !== 'undefined' && document;

  if (doc) {
    let spy = null;
    const fragment = doc.createDocumentFragment();
    const div = doc.createElement('div');
    fragment.appendChild(div);
    const res = attempt.call(fragment.childNodes, nativeForEach, function spyAssign(item) {
      spy = item;
    });

    return res.threw === false && typeof res.value === 'undefined' && spy === div;
  }

  return true;
};

const test6 = function test6() {
  const isStrict = (function returnIsStrict() {
    /* eslint-disable-next-line babel/no-invalid-this */
    return toBoolean(this) === false;
  })();

  if (isStrict) {
    let spy = null;
    const res = attempt.call(
      [1],
      nativeForEach,
      function thisTest() {
        /* eslint-disable-next-line babel/no-invalid-this */
        spy = typeof this === 'string';
      },
      'x',
    );

    return res.threw === false && typeof res.value === 'undefined' && spy === true;
  }

  return true;
};

const test7 = function test7() {
  const spy = {};
  const fn =
    'return nativeForEach.call("foo", function (_, __, context) {' +
    'if (toBoolean(context) === false || typeof context !== "object") {' +
    'spy.value = true;}});';

  /* eslint-disable-next-line no-new-func */
  const res = attempt(Function('nativeForEach', 'spy', 'toBoolean', fn), nativeForEach, spy, toBoolean);

  return res.threw === false && typeof res.value === 'undefined' && spy.value !== true;
};

const isWorking = toBoolean(nativeForEach) && test1() && test2() && test3() && test4() && test5() && test6() && test7();

const patchedNative = function patchedNative() {
  return function forEach(array, callBack /* , thisArg */) {
    requireObjectCoercible(array);
    const args = [assertIsFunction(callBack)];

    if (arguments.length > 2) {
      /* eslint-disable-next-line prefer-rest-params,prefer-destructuring */
      args[1] = arguments[2];
    }

    return nativeForEach.apply(array, args);
  };
};

const implementation = function implementation() {
  return function forEach(array, callBack /* , thisArg */) {
    const object = toObject(array);
    // If no callback function or if callback is not a callable function
    assertIsFunction(callBack);
    const iterable = splitIfBoxedBug(object);
    const length = toLength(iterable.length);
    /* eslint-disable-next-line no-void,prefer-rest-params */
    const thisArg = arguments.length > 2 ? arguments[2] : void 0;
    const noThis = typeof thisArg === 'undefined';
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
const $forEach = isWorking ? patchedNative() : implementation();

export default $forEach;
