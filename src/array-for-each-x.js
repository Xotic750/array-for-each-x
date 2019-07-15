import attempt from 'attempt-x';
import splitIfBoxedBug from 'split-if-boxed-bug-x';
import toLength from 'to-length-x';
import toObject from 'to-object-x';
import assertIsFunction from 'assert-is-function-x';

/** @type {ArrayConstructor} */
const ArrayCtr = [].constructor;
/** @type {ObjectConstructor} */
const castObject = {}.constructor;
/** @type {BooleanConstructor} */
const castBoolean = true.constructor;
const nativeForEach = typeof ArrayCtr.prototype.forEach === 'function' && ArrayCtr.prototype.forEach;

let isWorking;

if (nativeForEach) {
  let spy = 0;
  let res = attempt.call([1, 2], nativeForEach, (item) => {
    spy += item;
  });

  isWorking = res.threw === false && typeof res.value === 'undefined' && spy === 3;

  if (isWorking) {
    spy = '';
    res = attempt.call(castObject('abc'), nativeForEach, (item) => {
      spy += item;
    });

    isWorking = res.threw === false && typeof res.value === 'undefined' && spy === 'abc';
  }

  if (isWorking) {
    spy = 0;
    res = attempt.call(
      (function getArgs() {
        /* eslint-disable-next-line prefer-rest-params */
        return arguments;
      })(1, 2, 3),
      nativeForEach,
      (item) => {
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
      (item) => {
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
      res = attempt.call(fragment.childNodes, nativeForEach, (item) => {
        spy = item;
      });

      isWorking = res.threw === false && typeof res.value === 'undefined' && spy === div;
    }
  }

  if (isWorking) {
    const isStrict = (function returnIsStrict() {
      /* eslint-disable-next-line babel/no-invalid-this */
      return castBoolean(this) === false;
    })();

    if (isStrict) {
      spy = null;
      res = attempt.call(
        [1],
        nativeForEach,
        () => {
          /* eslint-disable-next-line babel/no-invalid-this */
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
      'if (castBoolean(context) === false || typeof context !== "object") {',
      'spy.value = true;}});',
    ].join('');

    /* eslint-disable-next-line no-new-func */
    res = attempt(Function('nativeForEach', 'spy', 'castBoolean', fn), nativeForEach, spy);

    isWorking = res.threw === false && typeof res.value === 'undefined' && spy.value !== true;
  }
}

/**
 * This method executes a provided function once for each array element.
 *
 * @param {Array} array - The array to iterate over.
 * @param {Function} callBack - Function to execute for each element.
 * @param {*} [thisArg] - Value to use as this when executing callback.
 * @throws {TypeError} If array is null or undefined.
 * @throws {TypeError} If callBack is not a function.
 */
let $forEach;

if (nativeForEach) {
  $forEach = function forEach(array, callBack /* , thisArg */) {
    const args = [callBack];

    if (arguments.length > 2) {
      /* eslint-disable-next-line prefer-rest-params,prefer-destructuring */
      args[1] = arguments[2];
    }

    return nativeForEach.apply(array, args);
  };
} else {
  $forEach = function forEach(array, callBack /* , thisArg */) {
    const object = toObject(array);
    // If no callback function or if callback is not a callable function
    assertIsFunction(callBack);
    const iterable = splitIfBoxedBug(object);
    const length = toLength(iterable.length);
    let thisArg;

    if (arguments.length > 2) {
      /* eslint-disable-next-line prefer-rest-params,prefer-destructuring */
      thisArg = arguments[2];
    }

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
}

const arrayForEach = $forEach;

export default arrayForEach;
