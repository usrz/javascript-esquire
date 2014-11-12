'use strict';

(function EsquireScript(window) {

  /* Flatten an array, or array of array, for aguments */
  function flatten(iterable) {
    if (! iterable) return [];

    var array = [];
    for (var i = 0; i < iterable.length; i ++) {
      var current = iterable[i];
      if (typeof(current) === 'string') {
        array.push(current);
      } else if (typeof(current) === 'function') {
        array.push(current);
      } else if (typeof(current) === 'object') {
        array = array.concat(flatten(current));
      } else {
        throw new EsquireError("Invalid dependency: " + current);
      }
    }
    return array;
  };

  /* Normalize and validate an array into a array/function object */
  function normalize() {
    var array = flatten(arguments);

    /* The normalized structure */
    var normalized = {
      arguments: [],
      function: null
    };

    /* No elements in the array? Empty */
    if (! array.length) return normalized;

    /* Set the function only if it's the last element */
    if (typeof(array[array.length - 1]) === 'function') {
      normalized.function = array.splice(-1)[0];
    }

    /* Validate all arguments as strings */
    for (var i in array) {
      var argument = array[i];
      if (typeof(argument) === 'string') {
        normalized.arguments.push(argument);
      } else {
        throw new EsquireError("Found " + typeof(argument) + " but needed string: " + argument);
      }
    }

    /* Return our normalized structure */
    return normalized;

  }

  /* ======================================================================== */
  /* Module definitor, exposed as a static method on the Esquire class        */
  /* ======================================================================== */

  var modules = {};

  /**
   * @class Module
   * @classdesc The definition of an {@link Esquire} module
   */
  function Module(name, dependencies, constructor) {
    /**
     * The name of this {@link Module}
     * @member {string} name
     * @memberof Module
     * @readonly
     */
    Object.defineProperty(this, 'name', { enumerable: true, configurable: false, value: name });

    /**
     * The name of all dependencies required by this {@link Module} (in order).
     * @member {string[]} dependencies
     * @memberof Module
     * @readonly
     */
    Object.defineProperty(this, 'dependencies', { enumerable: true, configurable: false, value: dependencies });

    /**
     * The constructor function creating instances of this {@link Module}.
     * @member {function} constructor
     * @memberof Module
     * @readonly
     */
    Object.defineProperty(this, 'constructor', { enumerable: true, configurable: false, value: constructor });

    /* Freeze ourselves */
    Object.freeze(this);

  }

  /**
   * Define a module as available to Esquire
   *
   * @static
   * @function define
   * @memberof Esquire
   * @example -
   * Esquire.define('foo', ['modA', 'depB'], function(a, b) {
   *   // 'a' will be an instance of 'modA'
   *   // 'b' will be an instance of 'depB'
   *   function Foo(aInstance, bInstance) {
   *     // ...
   *   };
   *   return new Foo(a, b);
   * });
   *
   * @example Definition with a {@link Module}-like object also works.
   * Esquire.define({
   *   name: 'foo',
   *   dependencies: ['modA', 'depB'],
   *   constructor: function(a, b) {
   *     // ...
   *   }
   * });
   *
   * @param {string}   name - The name of the module to define.
   * @param {string[]} [dependencies] - An array of required module names whose
   *                                    instances will be passed to the
   *                                    `constructor(...)` method.
   * @param {function} constructor - A function that will be invoked once per
   *                                 each {@link Esquire} instance. Its return
   *                                 value will be injected in any other module
   *                                 requiring this module as a dependency.
   * @returns {Module} The new {@link Module} created by this call.
   */
  function define() {

    /* Object based definition */
    if ((arguments.length == 1)
      && arguments[0].name
      && arguments[0].constructor) {
        var module = arguments[0];
        return define(module.name,
                      module.dependencies || [], //optional
                      module.constructor);
    }

    /* Normal arguments-based definition */
    var args = normalize(arguments);

    /* Our variables */
    var name;
    var dependencies;
    var constructor;

    /* Name and dependencies */
    if (!args.arguments.length) {
      throw new EsquireError("No module name specified");
    } else {
      name = args.arguments.splice(0, 1)[0];
      dependencies = args.arguments;
    }

    /* Constructor function */
    if (!args.function) {
      throw new EsquireError("No constructor function specified for module '" + name + "'");
    } else {
      constructor = args.function;
    }

    /* Watch out for double definitions */
    if (modules[name]) {
      throw new EsquireError("Module '" + name + "' already defined");
    }

    /* Remember and return a new module */
    modules[name] = new Module(name, dependencies, constructor);
    return modules[name];
  };

  /* ======================================================================== */
  /* Esquire constructor                                                      */
  /* ======================================================================== */

  function EsquireError(message, dependencyStack) {
    message = "Esquire: " + (message || "Unknown error");
    if (dependencyStack && (dependencyStack.length > 1)) { // 0 is always null
      message += " resolving"
      for (var i = 1; i < dependencyStack.length; i ++) {
        message += " -> '" + dependencyStack[i] + "'";
      }
    }

    this.constructor.prototype.__proto__ = Error.prototype;
    Error.call(this, message);
    this.name = "EsquireError";
    this.message = message;
  }

  function NoModuleError(name, dependencyStack) {
    EsquireError.call(this, "Module '" + name + "' not found");
  };

  function CircularDependencyError(name, dependencyStack) {
    EsquireError.call(this, "Module '" + name + "' has circular dependencies");
  };

  /**
   * Create a new {@link Esquire} injector instance.
   *
   * @class Esquire
   * @classdesc
   * {@link Esquire.modules Modules} are _static_ and shared amongst
   * all {@link Esquire} instances (see [define(...)]{@link Esquire.define}),
   * but their instances not, and are only created _once_ for each
   * {@link Esquire} instance.
   *
   * A _globally shared_ {@link Esquire} instance can be used by invoking the
   * [esquire(...)]{@link esquire} method, rather than creating a new instance
   * and using the [require(...)]{@link Esquire#require} call.
   */
  function Esquire() {
    /* Proper construction */
    if (!(this instanceof Esquire)) return new Deferred();

    /* Our and cache */
    var cache = {};

    /* Create a new instance from a defined module */
    function create(name, dependencyStack, module) {

      /* Check the cache (nulls are allowed, too) */
      if (name && cache.hasOwnProperty(name)) return cache[name];

      /* If not specified, look for a module */
      if (! module) module = modules[name];
      if (! module) throw new NoModuleError(name, dependencyStack);

      /* Check for circular dependencies */
      if (dependencyStack.indexOf(name) >= 0) {
        throw new CircularDependencyError(name, dependencyStack);
      }

      /* Process each dependency */
      var parameters = [];
      dependencyStack.push(name);
      for (var i in module.dependencies) {
        parameters.push(create(module.dependencies[i], dependencyStack));
      }
      dependencyStack.pop();

      /* Call our constructor, the caller will cache it */
      if (name) console.debug("Esquire: Instantiating module '" + name + "'");
      var instance = module.constructor.apply(null, parameters);
      if (name) cache[name] = instance;
      return instance;

    }

    /**
     * Require instances for the specified module(s).
     *
     * @instance
     * @function
     * @memberof Esquire
     * @example -
     * var esq = new Esquire();
     *
     * var fromArray = esq.require(['fooModule', 'barModule']);
     * // fromArray[0] will be an instance of 'fooModule'
     * // fromArray[1] will be an instance of 'barModule'
     *
     * @example Injection with a single `string` argument
     * var fromString = esq.require('bazModule');
     * // 'fromString' will be an instance of 'bazModule'
     *
     * @example Injection with a number of different arguments
     * var fromArgs = esq.require('abcModule', 'xyzModule');
     * // fromArgs[0] will be an instance of 'abcModule'
     * // fromArgs[1] will be an instance of 'xyzModule'
     *
     * @param {string[]|string} dependencies - An array of required module names
     *                                         (or a single module name) whose
     *                                         instance are to be returned.
     * @return {object[]|object} An array of module instances, or a single
     *                           module instance, if this method was called
     *                           with a single `string` parameter.
     */
    function require() {

      /* Edge case, one only parameter, we don't return an array */
      if ((arguments.length == 1) && (typeof(arguments[0]) == 'string')) {
        return inject([arguments[0]], function(instance) {
          return instance;
        });
      }

      /* Inject a fake callback function returning an array */
      return inject(arguments, function() {
        var result = [];
        for (var i = 0; i < arguments.length; i ++) {
          result.push(arguments[i]);
        }
        return result;
      });
      return result;
    }

    /**
     * Request injection for the specified modules.
     *
     * @instance
     * @function inject
     * @memberof Esquire
     * @example -
     * var esq = new Esquire();
     *
     * esq.inject(['modA', 'depB'], function(a, b) {
     *   // 'a' will be an instance of 'modA'
     *   // 'b' will be an instance of 'depB'
     * });
     *
     * @example Injection also works without arrays (only arguments)
     * esq.inject('modA', 'depB', function(a, b) {
     *   // 'a' will be an instance of 'modA'
     *   // 'b' will be an instance of 'depB'
     * });
     *
     * @example Angular-JS style injection (one big array) is supported, too
     * esq.inject(['modA', 'depB', function(a, b) {
     *   // 'a' will be an instance of 'modA'
     *   // 'b' will be an instance of 'depB'
     * }]);
     *
     * @param {string[]|string} [dependencies] - An array of required module
     *                                           names whose instances will be
     *                                           passed to the `callback(...)`
     *                                           method.
     * @param {function} callback - A function that will be called once all
     *                              module dependencies have been instantiated,
     *                              with each instance as a parameter.
     * @return Whatever value was returned by the `callback` function.
     */
    function inject() {
      var args = normalize(arguments);

      /* Sanity check, need a callback */
      if (!args.function) {
        throw new EsquireError("Callback for injection unspecified");
      }

      /* Create a fake "null" module and return its value */
      var module = new Module(null, args.arguments, args.function);
      return create(module.name, [], module);

    };

    /* Define our members */
    Object.defineProperties(this, {
      "inject":  { enumerable: true, configurable: false, value: inject },
      "require": { enumerable: true, configurable: false, value: require }
    });

  }

  /* ======================================================================== */
  /* Esquire static members                                                   */
  /* ======================================================================== */

  Object.defineProperties(Esquire, {
    "define":      { enumerable: true,  configurable: false, value: define },
    "$$normalize": { enumerable: false, configurable: false, value: normalize },
    "$$script":    { enumerable: false, configurable: false, value: EsquireScript.toString() },

    /**
     * An unmodifiable dictionary of all {@link Module}s known by
     * {@link Esquire}.
     *
     * @static
     * @readonly
     * @member {Object.<string,Module>} modules
     * @memberof Esquire
     * @example -
     * {
     *   "modA": {
     *     "name": "modA",
     *     "dependencies": [ ... ],
     *     "constructor": function(...) { ... }
     *   },
     *   "depB": {
     *     "name": "depB",
     *     "dependencies": [ ... ],
     *     "constructor": function(...) { ... }
     *   },
     * }
     */
    "modules": { enumerable: true, configurable: false, get: function() {
      var clone = {};
      for (var name in modules) {
        clone[name] = modules[name];
      }
      return Object.freeze(clone);
    }},

    /**
     * Return the {@link Module} associated with the given `name` as defined
     * in {@link Esquire} or `null`.
     *
     * @static
     * @function module
     * @param {string} name - The name of the {@link Module} to return.
     * @memberof Esquire
     * @returns {Module} The {@link Module} or `null`
     */
    "module": { enumerable: true, configurable: false, value: function(name) {
      return modules[name] || null;
    }}
  });

  /* If something was loaded before, just copy over */
  if (window.Esquire) {
    for (var member in window.Esquire) {
      Object.defineProperty(Esquire, member, {
        enumerable: true,
        configurable: false,
        value: window.Esquire[member]
      });
    }
  }

  /* Set our Esquire function globally */
  window.Esquire = Esquire;

  /* ======================================================================== */
  /* Esquire static injection                                                 */
  /* ======================================================================== */

  var staticEsquire = new Esquire();

  /**
   * Request **static** injection for the specified modules.
   *
   * If a `callback` function was specified, then this method will behave like
   * [inject(...)]{@link Esquire#inject}, thus dependencies will be resolved
   * and passed to `callback` method, and its return value (if any) will be
   * returned from this method.
   *
   * If no `callback` function was given, this method will behave like
   * [require(...)]{@link Esquire.require} and simply return the required
   * dependencies.
   *
   * Note that this method will use a globally shared {@link Esquire} instance
   * to create and resolve dependencies.
   *
   * @static
   * @global
   * @param {array}    dependencies - An array of required module names whose
   *                                  instances will be passed to the
   *                                  `callback(...)` method.
   * @param {function} [callback] - A function that will be called once all
   *                                module dependencies have been instantiated,
   *                                with each instance as a parameter.
   * @return {object} Whatever value was returned by the `callback` function
   *                  (if one was specified) as in {@link Esquire#inject}.
   * @return {object[]|object} An array of module instances (or a single module
   *                           instance) as in {@link Esquire#require} if this
   *                           method was called wihtout any `callback` function.
   */
  window.esquire = function() {
    /* No arguments? Ignore */
    if (arguments.length == 0) {
      throw new EsquireError("No dependencies/callback specified");
    }

    /* Normalize our arguments */
    var args = normalize(arguments);

    /* Inject or require? */
    if (args.function) {
      return staticEsquire.inject(args.arguments, args.function);
    } else {
      return staticEsquire.require(args.arguments);
    }

  };

})(self);
