<p align="center">
  <img src="https://raw.github.com/zvictor/ArgueJS/master/logo.png" alt="ArgueJs" />
</p>

**ArgueJS** is a JavaScript library that allows you to delightfully extend your method's signatures with [optional parameters](#optional-parameters),
[default values](#default-values) and [type-checking](#type-checking).

### example
Let's suppose we want to rewrite the well known [method range](http://underscorejs.org/#range) from [underscorejs](http://underscorejs.org/#range).

Note that documentation says its method signature is `range([start], stop, [step])`. With ArgueJS we could type just this way:
```javascript
function range(){ 
  arguments = __({start: [Number, 0], stop: Number, step: [Number, 1]})

  for(var i = arguments.start; i < arguments.stop; i += arguments.step)
    console.log(i);
}
```
```javascript
>>> range(3)
 0
 1
 2
>>> range(3, 5)
 3
 4
>>> range(0, 5, 2)
 0
 2
 4
```

## Installation
ArgueJS is available for both node.js and the browser.

###Node.js

Package is available through npm:

```bash
$ npm install arguejs
```

### Browser

Include the ArgueJS browser build in your pages.

```html
<script src="argue.js" type="text/javascript"></script>
```

This will provide `__` as a global object, or `define` it if you are using AMD.

The latest version will be available for hot-linking at http://raw.github.com/zvictor/ArgueJS/master/argue.js.
If you prefer to host yourself, use the `argue.js` file from the root of the github project.

## Getting started

When writing your JavaScript methods with ArgueJS,
have in mind that you will not use conventional parameters definition as you used before.
Actually, all your methods should be defined without them.

Just at the beginning of your method scope,
you should pass an object defining your method signature into a call to `__` and save its reference for later.
The signature of this method is `Object __(Object signature, [Object upperArguments])`

*example:*
```javascript
function person(){
  var signature = {name: String, age: Number};
  arguments = __(signature);
  // String name is now referenced by arguments.name
  // Number age is now referenced by arguments.age
  return arguments;
}
```
```javascript
>>> person('John', 27).name
 'John'
>>> person('John', 27).age
 27
```

## Propagating arguments

It **is recommended** that you explicitly pass your methods arguments through ArgueJS.
It is not required, unless if running in [*strict mode*](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Functions_and_function_scope/Strict_mode)
or aiming compatibility of your code with future versions of JavaScript, then it **is required**.

To explicitly pass your methods arguments through ArgueJS,
just pass the `arguments` variable after the `signature` description object,
like this example does:
```javascript
function person(){
  args = __({name: String, age: Number}, arguments);
  // ...
```

See [how does the arguments inference works](#how-does-the-arguments-inference-works) for more.

## Type-checking

Type-checking ensures your arguments are what you expected, and throws errors when not.

*example:*
```javascript
function age(){
  arguments = __({born: Date})
  // ...
```
```javascript
>>> age('01/10/1988')
 Error: parameter 'born' waiting for a Date argument but received a String
```

### Avoid type-checking

The *primitive data type* `null` can be used to allow the argument to be of **any** type.

*example:*
```javascript
function book(){
  arguments = __({title: null})
  // ...
  return arguments.title;
}
```
```javascript
>>> book('Animal Farm: a Fairy Story')
 'Animal Farm: a Fairy Story'
>>> book(1984)
 1984
```

The relation of ArgueJS with `undefined` and `null` values is detail explained at our Wiki page [Null and Undefined types](https://github.com/zvictor/ArgueJS/wiki/Null-and-Undefined-types)

### Data types
* String
* Number
* Boolean
* Array
* Function
* Object
* Date
* RegExp

### Special data types:
* "global" (or __.type.global)
* "Arguments" (or __.type.Arguments)

## Optional parameters

Optional parameters are great to avoid a mess of conditional clauses at the beginning of your method.
To make a parameter optional, **declare its type inside of an Array**, like this: `{name: [String]}`

*example:*
```javascript
function unique(){
  arguments = __({array: Array, isSorted: [Boolean], iterator: [Function]})
  // Array array is required
  // Boolean isSorted is optional
  // Function iterator is optional
  
  // ...
```
If no value is passed to an optional parameter, then its argument value will be `undefined`.
To set a default value for your parameter, take a look at [default values](#default-values).

### Default values

When writing methods, sometimes you want to override the value of an undefined argument by a default value.
The syntax to do this is similar to [optional parameters](#optional-parameters).
That is because a *parameter with default value is an optional parameter* by definition.

To set a default value for a parameter **declare its type and its default value inside of an Array**,
like this: `{name: [String, 'unknown']}`

*example:*
```javascript
function unique(){
  arguments = __({array: Array, isSorted: [Boolean, false], iterator: [Function, function(element){
    return element;
  }]})
  // Array array is required
  // Boolean isSorted is optional and its default value is false
  // Function iterator is optional and its default value is the function declared above
  
  // ...
```

If you do not care about its type, but just want it to have a default value,
you should type your parameter as `undefined`

*example:*
```javascript
  arguments = __({name: [undefined, 'unknown']});
```

## Utilities

Some JavaScript methods [do not work intuitively](http://webreflection.blogspot.com.br/2012/06/javascript-typeof-operator-problem.html)
when dealing with types. This is why we made available these utilities methods, to help you to better deal with them.

### typeof

Method that gives us the String representation of the type of a given object.

Consider the following example, using the native `typeof` method:

```javascript
> function whichType() {
  return typeof this;
}
> [
  whichType.call(false),    // "boolean", right? No!
  whichType.call("hello"),  // "string", right?  No!
  whichType.call(123),      // "number", right?  No!
];
[ 'object', 'object', 'object' ]
```

Replace the function `whichType` to use ArgueJS' `__.typeof` and you will have the expected values:
```javascript
function whichType() {
  return __.typeof( this );
}
```
```javascript
[ 'Boolean', 'String', 'Number' ]
```

### getType

The method `__.getType` gives us the type class of the object we may want to inspect.
Why using String representations when we can access the type directly?

```javascript

> __.getType({key:"value"}) === Object
true
> constructor = __.getType(7)
[Function: Number]
> constructor("myString") // Number("myString")
NaN
> __.getType(this)
[Function: global]
```

### belongs

The method `__.belongs` tells us if a given instance belongs to the given type class.
No excuses to compare String representations anymore!

```javascript
> __.belongs({key:"value"}, Object)
true
> __.belongs(this, __.type.global)
true
> __.belongs("value", Number)
false
```

### noConflict

Utility to recover the ownership over the `__` variable.

```javascript
var ArgueJS = __.noConflict();
// Now, __ makes reference to its old value, the one before you added ArgueJS
```

## FAQ

### How does the arguments inference works?

To automatically *infer* your method arguments, ArgueJS uses `arguments.callee` internally.
It is a powerful and old resource but won't be supported in future JavaScript versions anymore,
and this is why *strict mode* disallows its use.

Nowadays it is present in all major browsers, although its use is not recommended in favor of better performance.
See its [documentation](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Functions_and_function_scope/arguments/callee) for even more.

-------------------------------

## Contributing

This project is on its very early stages and any help, suggestion or posted issue will be very appreciated.
