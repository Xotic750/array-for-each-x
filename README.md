<a href="https://travis-ci.org/Xotic750/array-for-each-x"
   title="Travis status">
<img
   src="https://travis-ci.org/Xotic750/array-for-each-x.svg?branch=master"
   alt="Travis status" height="18"/>
</a>
<a href="https://david-dm.org/Xotic750/array-for-each-x"
   title="Dependency status">
<img src="https://david-dm.org/Xotic750/array-for-each-x.svg"
   alt="Dependency status" height="18"/>
</a>
<a href="https://david-dm.org/Xotic750/array-for-each-x#info=devDependencies"
   title="devDependency status">
<img src="https://david-dm.org/Xotic750/array-for-each-x/dev-status.svg"
   alt="devDependency status" height="18"/>
</a>
<a href="https://badge.fury.io/js/array-for-each-x" title="npm version">
<img src="https://badge.fury.io/js/array-for-each-x.svg"
   alt="npm version" height="18"/>
</a>
<a name="module_array-for-each-x"></a>

## array-for-each-x

Executes a provided function once for each array element.

<a name="exp_module_array-for-each-x--module.exports"></a>

### `module.exports` ⏏

This method executes a provided function once for each array element.

**Kind**: Exported member  
**Throws**:

- <code>TypeError</code> If array is null or undefined.
- <code>TypeError</code> If callBack is not a function.

| Param     | Type                  | Description                                   |
| --------- | --------------------- | --------------------------------------------- |
| array     | <code>array</code>    | The array to iterate over.                    |
| callBack  | <code>function</code> | Function to execute for each element.         |
| [thisArg] | <code>\*</code>       | Value to use as this when executing callback. |

**Example**

```js
import forEach from 'array-for-each-x';

const items = ['item1', 'item2', 'item3'];
const copy = [];

forEach(items, function(item) {
  copy.push(item);
});

console.log(copy); // ['item1', 'item2', 'item3']
```
