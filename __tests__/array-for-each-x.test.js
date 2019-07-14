let forEach;

if (typeof module === 'object' && module.exports) {
  require('es5-shim');
  require('es5-shim/es5-sham');

  if (typeof JSON === 'undefined') {
    JSON = {};
  }

  require('json3').runInContext(null, JSON);
  require('es6-shim');
  const es7 = require('es7-shim');
  Object.keys(es7).forEach(function(key) {
    const obj = es7[key];

    if (typeof obj.shim === 'function') {
      obj.shim();
    }
  });
  forEach = require('../../index.js');
} else {
  forEach = returnExports;
}

const itHasDoc = typeof document !== 'undefined' && document ? it : xit;

const isStrict = (function() {
  // eslint-disable-next-line no-invalid-this
  return Boolean(this) === false;
})();

const itStrict = isStrict ? it : xit;

// IE 6 - 8 have a bug where this returns false.
const canDistinguish = 0 in [void 0];
const undefinedIfNoSparseBug = canDistinguish
  ? void 0
  : {
      valueOf() {
        return 0;
      },
    };

const createArrayLike = function(arr) {
  const o = {};
  arr.forEach(function(e, i) {
    o[i] = e;
  });

  o.length = arr.length;

  return o;
};

describe('forEach', function() {
  let actual;
  let expected;
  let testSubject;

  beforeEach(function() {
    expected = {
      0: 2,
      2: undefinedIfNoSparseBug,
      3: true,
      4: 'hej',
      5: null,
      6: false,
      7: 0,
    };

    actual = {};
    testSubject = [2, 3, undefinedIfNoSparseBug, true, 'hej', null, false, 0];

    delete testSubject[1];
  });

  it('is a function', function() {
    expect(typeof forEach).toBe('function');
  });

  it('should throw when array is null or undefined', function() {
    expect(function() {
      forEach();
    }).toThrow();

    expect(function() {
      forEach(void 0);
    }).toThrow();

    expect(function() {
      forEach(null);
    }).toThrow();
  });

  it('should pass the right parameters', function() {
    const callback = jasmine.createSpy('callback');
    const array = ['1'];
    forEach(array, callback);
    expect(callback).toHaveBeenCalledWith('1', 0, array);
  });

  it('should not affect elements added to the array after it has begun', function() {
    const arr = [1, 2, 3];
    let i = 0;
    forEach(arr, function(a) {
      i += 1;
      arr.push(a + 3);
    });

    expect(arr).toStrictEqual([1, 2, 3, 4, 5, 6]);

    expect(i).toBe(3);
  });

  it('should set the right context when given none', function() {
    let context;
    forEach([1], function() {
      // eslint-disable-next-line no-invalid-this
      context = this;
    });

    expect(context).toBe(
      function() {
        // eslint-disable-next-line no-invalid-this
        return this;
      }.call(),
    );
  });

  it('should iterate all', function() {
    forEach(testSubject, function(obj, index) {
      actual[index] = obj;
    });

    expect(actual).toStrictEqual(expected);
  });

  it('should iterate all using a context', function() {
    const o = {a: actual};

    forEach(
      testSubject,
      function(obj, index) {
        // eslint-disable-next-line no-invalid-this
        this.a[index] = obj;
      },
      o,
    );

    expect(actual).toStrictEqual(expected);
  });

  it('should iterate all in an array-like object', function() {
    const ts = createArrayLike(testSubject);
    forEach(ts, function(obj, index) {
      actual[index] = obj;
    });

    expect(actual).toStrictEqual(expected);
  });

  it('should iterate all in an array-like object using a context', function() {
    const ts = createArrayLike(testSubject);
    const o = {a: actual};

    forEach(
      ts,
      function(obj, index) {
        // eslint-disable-next-line no-invalid-this
        this.a[index] = obj;
      },
      o,
    );

    expect(actual).toStrictEqual(expected);
  });

  describe('strings', function() {
    const str = 'Hello, World!';

    it('should iterate all in a string', function() {
      actual = [];
      forEach(str, function(item, index) {
        actual[index] = item;
      });

      expect(actual).toStrictEqual(str.split(''));
    });

    it('should iterate all in a string using a context', function() {
      actual = [];
      const o = {a: actual};
      forEach(
        str,
        function(item, index) {
          // eslint-disable-next-line no-invalid-this
          this.a[index] = item;
        },
        o,
      );

      expect(actual).toStrictEqual(str.split(''));
    });
  });

  it('should have a boxed object as list argument of callback', function() {
    let listArg;
    forEach('foo', function(item, index, list) {
      listArg = list;
    });

    expect(typeof listArg).toBe('object');
    expect(Object.prototype.toString.call(listArg)).toBe('[object String]');
  });

  itStrict('does not autobox the content in strict mode', function() {
    let context;
    forEach(
      [1],
      function() {
        // eslint-disable-next-line no-invalid-this
        context = this;
      },
      'x',
    );

    expect(typeof context).toBe('string');
  });

  it('should work with arguments', function() {
    const argObj = (function() {
      return arguments;
    })('1');

    const callback = jasmine.createSpy('callback');
    forEach(argObj, callback);
    expect(callback).toHaveBeenCalledWith('1', 0, argObj);
  });

  it('should work with strings', function() {
    const callback = jasmine.createSpy('callback');
    const string = '1';
    forEach(string, callback);
    expect(callback).toHaveBeenCalledWith('1', 0, string);
  });

  itHasDoc('should work wih DOM elements', function() {
    const fragment = document.createDocumentFragment();
    const div = document.createElement('div');
    fragment.appendChild(div);
    const callback = jasmine.createSpy('callback');
    forEach(fragment.childNodes, callback);
    expect(callback).toHaveBeenCalledWith(div, 0, fragment.childNodes);
  });
});
