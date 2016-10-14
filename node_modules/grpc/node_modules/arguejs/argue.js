!function (name, context, definition) {
  // Export ArgueJS as module, or __ as global, if not using module loaders.
  if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
    module.exports = definition();
  } else if (typeof define === 'function' && typeof define.amd  === 'object') {
    define(function () {
      return definition();
    });
  } else {
    var oldValue = context[name];

    context[name] = definition();
    context[name].noConflict = function(){
      context[name] = oldValue;
      return this;
    }
  }
}('__', this, function () {
  
  var isArray = Array.isArray || function(obj){
    // Util function to check if an object is actually an Array.
    return toString.call(obj) == '[object Array]';
  }

  var __ = function(signature, upperArguments) {
    // The ArgueJS constructor method.
    var input;
    
    if (!__.belongs(signature, Object))
      // If 'signature' is not defined or is not an object, goes away.
      throw new Error("parameter 'signature' waiting for Object argument but received " + __.typeof(signature));
      
    if (upperArguments !== undefined && !__.belongs(upperArguments, Array) && !__.belongs(upperArguments, 'Arguments'))
      // If 'upperArguments' is defined it must be a valid arguments list
      throw new Error("parameter 'upperArguments' waiting for Array or Arguments argument but received " + __.typeof(upperArguments));
    
    try{
      // Assumes upperArguments as the passed arguments or try to infer from the caller function.
      input = upperArguments || arguments.callee.caller.arguments;
    } catch(e){
      throw new Error('It is not possible to infer arguments in strict mode. See http://github.com/zvictor/ArgueJs#propagating-arguments for alternatives.');
    }
    
    // Makes a copy of the input, transforming Arguments (if is the case) into Array.
    // See more at https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array#Array_generic_methods
    input = Array.prototype.slice.call( input );
    
    var paramSum = 0;
    for (var name in signature)
      // We just count how many parameters we have to evaluate...
      paramSum++;
    
    if(input.length > paramSum)
      // Ops, someone really likes to talk here!
      throw new Error("Too many arguments");
      
    // As we can have optional arguments,
    //   there are many ways to consider the same call to a function.
    // A call (1, 3) to range([Number], Number, [Number])
    //   could be validated as (1, 3), (1, 3, undefined) or (undefined, 1, 3).
    // In order to determine which one has the best fit to the given signature,
    //   we need to generate all of them.
    var expansion = [input];
    // Here we start to expand the passed arguments.
    // We start with just the given input...

    var pivotIndex = -1;
    for (var name in signature) {
      // ... and for each parameter...
      if(!isNaN(parseFloat(name)) && isFinite(name))
        throw new Error("NameError: a parameter name can not be numeric");
      pivotIndex++;
      var optional = isArray(signature[name]);
      var type = (optional) ? signature[name][0] : signature[name];
      if(type === undefined)
        throw new TypeError("unsupported parameter type "+type);
        
      var copy = expansion.slice(0);
      // (we make a copy here to avoid infinity loop)
      for(var i=0; i<copy.length; i++){
        var args = copy[i];
        var value = args[pivotIndex];
        // ... we evaluate the respective argument value of each possible argument list.

        if (type !== null && !__.belongs(value, type)){
          // If the argument value does not pass through the type checking,
          //   the argument list is not valid for the given signature...
          // ... and we delete the current argument list, entirely!
          // Note that in our library, the Null param allows ANY type for `value`,
          expansion.splice( expansion.indexOf(args), 1);
          if(!optional && !expansion.length)
            // If no more arguments list remains, the input is not compatible. Cheeky arguments, go play with the kids!
            throw new Error("parameter '" + name + "' waiting for " + (type.name || type) + " argument but received " + __.typeof(value));
        }
        
        args = copy[i].slice(0);
        if(value !== undefined)
          // In case argument is undefined we do not pass it to the next param
          args.splice(pivotIndex, 0, undefined);
        if(optional && args.length <= paramSum)
          // In case the parameter is optional,
          //   it means that the same argument list we are iterating now
          //   would also be valid if we added a "undefined" value at this position,
          //   passing the current value to the next parameter.
          expansion.push(args);
      }
    }
    
    if(!expansion.length){
      // This Error happens when all the REQUIRED parameters are satisfied,
      //   but is not possible to satisfy the type checking of any of the OPTIONAL parameters.
      var plainSignature = [];
      for (var key in signature)
        if(__.belongs(signature[key], Array))
          plainSignature.push( "["+signature[key][0].name+"]" );
        else
          plainSignature.push( signature[key].name );

      var plainInput= [];
      for (var i=0; i< input.length; i++)
        plainInput.push( __.typeof(input[i]) );

      throw new Error("Incompatible type signature. Expecting ( "+(plainSignature.join(", "))+" ), given ( "+(plainInput.join(", "))+" ).");
    }

    // Now that we finished the expansion,
    //   which of the arguments list are we supposed to choose?
    input = expansion[expansion.length-1];
    // This way we are putting the required arguments in the leftmost valid side 
    
    var result = {'doc':doc};
    // Reference for the API doc generator.
    
    var paramIndex = 0;
    // Now, whith the input extended,
    //   is time to pass through the arguments and parameters again...
    for (var name in signature) {
      var value = input[paramIndex];
      var definition = signature[name];
      var optional = isArray(definition);
      
      var type = (optional) ? definition[0] : definition;
  
      if (optional && !__.belongs(value, type))
        // ... replacing undefined optional values by their default values...
        value = definition[1];
        
      paramIndex++;
      // and generating the final object.
      result[name] = value;
    }
      
    return result;
  };

  var specialTypes = [
    // Special types definition:

    function Arguments(){
      // An Array-like object corresponding to the arguments passed to a function.
      // The arguments object is a local variable available within all functions;
      // `arguments` as a property of `Function` can no longer be used.
      throw new Error("It is not possible to create a new Arguments instance");
      //return Array.apply(this, arguments);
    },
    function global(){
      // In strict mode `this` is never the global,
      // but also in strict mode `eval` operates in a separate context in which this is always the global.
      // In non-strict mode `this` is the current context. If there is no current context, it assumes the global.
      // An anonymous function has no context and hence in non-strict mode assumes the global.
      // See more at http://stackoverflow.com/questions/3277182/599991/how-to-get-the-global-object-in-javascript
      return Function('return this')();
    }

  ];
  __.type = {};
  // Save a reference for each special type
  for(var i=0; i<specialTypes.length; i++)
    __.type[specialTypes[i].name] = specialTypes[i];

  __.getType = function(obj) {
    // Util function that gives us the String representation of the type of the given object.

    if(obj === undefined || obj === null)
      return obj;

    if (obj === __.type.global())
    // Host objects are browser-created objects that are not specified by the ES5 standard.
    // All DOM elements and global functions are host objects.

    // ES5 declines to specify a return value for typeof when applied to host objects,
    // neither does it suggest a value for the [[Class]] property of host objects.

    // The upshot is that cross-browser type-checking of host objects is generally not reliable.
    // See more at http://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/
      return __.type.global;


    var name = ({}).toString.call(obj).match(/\s([a-z|A-Z]+)/)[1];
    if (['Arguments'].indexOf( name ) != -1)
      return __.type[name];

    return eval( name );
  }

  __.typeof = function(obj) {
    // Util function that gives us the String representation of the type of the given object.

    var type = __.getType(obj);
    var toString = ({}).toString.call(type).match(/\s([a-z|A-Z]+)/)[1];

    if(type === undefined)
      //workaround for the PhantomJS to avoid DOMWindow casting.
      //see more at http://stackoverflow.com/q/14218670/599991
      return "Undefined";
    else if(type === null)
      return "Null";

    return (type && type.hasOwnProperty('name')) ? type.name : toString;
  }

  __.belongs = function(value, type) {
    // Util function that determines if a given instance belongs to the given type class.
    // code highly inspired on UnderscoreJS.

    var result = false;

    if(type === null || type === undefined)
      return value === type;
    else if (type == Function
        && typeof (/./) !== 'function') // Hack needed, as seen on UnderscoreJS' `isFunction`, reasons unknown
      result = typeof value === 'function';
    else if (type == Boolean)
      result = value === true || value === false || __.getType(value) == Boolean;
    else if (type == Array)
      result = isArray(value);
    else if (type in __.type)
      result = __.typeof(value) === type;
    else if (type && type.hasOwnProperty('name')
        && ['Arguments',
            'Function', 'String', 'Number', 'Date', 'RegExp', 'Object'].indexOf( type.name ) != -1)
      result = __.getType(value) === type;
    else
      try{
        result = value instanceof type;
      } catch(e){
        throw new TypeError("unsupported type "+type);
      }

    return result;
  }

  __.noConflict = function() {
    // Relinquish ArgueJS's control of the __ variable.
    throw new Error("noConflit is not implemented for module loaders");
  }

  var doc = function() {
    // Coming soon. Here you will be able to generate JSDoc, JavaDoc, etc, for your functions.
    throw Error('Not implemented yet');
  };

  return __;

});
