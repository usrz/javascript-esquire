'use strict';

(function EsquireScript(window) {

  /* Flatten an array, or array of array, for aguments */
  function flatten(iterable) {
    if (! iterable) return [];

    var array = [];
    for (var i = 0; i < iterable.length; i ++) {
      var current = iterable[i];
      if (typeof(current) == 'string') {
        array.push(current);
      } else if (Array.isArray(current)) {
        array = array.concat(flatten(current));
      } else {
        throw new EsquireError("Invalid dependency: " + current);
      }
    }
    return array;
  };

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
   * @param {string}   name - The name of the module to define.
   * @param {string[]} dependencies - An array of required module names whose
   *                                  instances will be passed to the
   *                                  `constructor(...)` method.
   * @param {function} constructor - A function that will be invoked once per
   *                                 each {@link Esquire} instance. Its return
   *                                 value will be injected in any other module
   *                                 requiring this module as a dependency.
   */
  function define(name, dependencies, constructor) {

    /* Basic checks */
    if (typeof(name) != 'string') {
      throw new EsquireError("Invalid module name: " + name);
    } else if (modules[name]) {
      throw new EsquireError("Module '" + name + "' already defined");
    } else if (typeof(constructor) != 'function') {
      throw new EsquireError("Constructor for module '" + name + "' is not a function: " + constructor);
    }

    /* Flatten our dependencies */
    dependencies = flatten(dependencies);

    /* Remember our module */
    console.debug("Esquire: Defining module '" + name + "'");
    modules[name] = new Module(name, dependencies, constructor);

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
     * var foo = esq.require('fooModule');
     * // 'foo' will be an instance of 'fooModule'
     *
     * var instances = esq.require(['barModule', 'bazModule']);
     * // instances[0] will be an instance of 'barModule'
     * // instances[1] will be an instance of 'bazModule'
     *
     * var fromArgs = esq.require('barModule', 'bazModule');
     * // fromArgs[0] will be an instance of 'barModule'
     * // fromArgs[1] will be an instance of 'bazModule'
     * @param {string[]|string} dependencies - An array of required module names
     *                                         (or a single module name) whose
     *                                         instance are to be returned.
     * @param {string} [...] - Any other module name, as arguments, to support
     *                         calls like `require('barModule', 'bazModule')`
     * @return {object[]|object} An array of module instances, or a single
     *                           module instance, if this method was called
     *                           with a single `string` parameter.
     */
    function require() {
      if ((arguments.length == 1) && (typeof(arguments[0]) == 'string')) {
        return inject([arguments[0]], function(instance) {
          return instance;
        });
      } else {
        var dependencies = flatten(arguments);
        return inject(dependencies, function() {
          var result = [];
          for (var i = 0; i < arguments.length; i ++) {
            result.push(arguments[i]);
          }
          return result;
        });
      }
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
     * esq.inject(['modA', 'depB'], function(a, b) {
     *   // 'a' will be an instance of 'modA'
     *   // 'b' will be an instance of 'depB'
     * });
     * @param {string[]|string} [dependencies] - An array of required module
     *                                           names whose instances will be
     *                                           passed to the `callback(...)`
     *                                           method.
     * @param {function} callback - A function that will be called once all
     *                              module dependencies have been instantiated,
     *                              with each instance as a parameter.
     * @return Whatever value was returned by the `callback` function.
     */
    function inject(dependencies, callback) {

      /* Sanity check, null callback just create... */
      if (callback == null) {
        if (typeof(dependencies) === 'function') {
          callback = dependencies;
          dependencies = [];
        } else {
          callback = function() {} // return undefined!
        }
      } else if (typeof(callback) != 'function') {
        throw new EsquireError("Injection callback is not a function: " + callback);
      }

      /* Flatten/convert our dependencies */
      dependencies = flatten(dependencies);

      /* Create a fake unnamed module, and inject the callback function */
      return create(null, [], { dependencies: dependencies, constructor: callback });
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
    "define":   { enumerable: true,  configurable: false, value: define },
    "$$script": { enumerable: false, configurable: false, value: EsquireScript.toString() },

    /**
     * An unmodifiable dictionary of all modules known by {@link Esquire}.
     *
     * @static
     * @readonly
     * @member modules
     * @memberof Esquire
     * @example -
     * {
     *   "modA": {
     *     "dependencies": [ ... ],
     *     "constructor": function(...) { ... }
     *   },
     *   "depB": {
     *     "dependencies": [ ... ],
     *     "constructor": function(...) { ... }
     *   },
     * }
     */
    "modules": { enumerable: true, configurable: false, get: function() {
      var clone = {};
      for (var name in modules) {
        clone[name] = Object.freeze(modules[name]);
      }
      return Object.freeze(clone);
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
    if (arguments.length == 0) return undefined;

    /* Could someone have done esquire(function(...) {} ??? */
    if ((arguments.length == 1) && (typeof(arguments[0]) == 'function')) {
      throw new EsquireError("Invalid parameter for static injection");
    }

    /* Two arguments: esquire("a", "b") or esquire(['deps'], function() {}) */
    if ((arguments.length == 2) && (typeof(arguments[1]) == 'function')) {
      return staticEsquire.inject(arguments[0], arguments[1]);
    }

    /* More than two arguments? Just a list of strings */
    return staticEsquire.require(arguments);

  };

})(self);
