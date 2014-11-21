 'use strict';

(function EsquireScript(global) {

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
      } else if (Array.isArray(current)) {
        array = array.concat(flatten(current));
      } else if ((typeof(current) === 'object')
              && (typeof(current.length) === 'number')) {
        // JavaScripts' "arguments" is an object, not an array, and on top of
        // that PhantomJS' own implementation is not iterable... Workaround!
        array = array.concat(flatten(current));
      } else {
        throw new EsquireError("Invalid dependency: " + JSON.stringify(current));
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
  /* Errors                                                                   */
  /* ======================================================================== */

  function EsquireError(message, dependencyStack) {
    message = "Esquire: " + (message || "Unknown error");
    var dependencies = "";
    if (dependencyStack && (dependencyStack.length)) { // 0 is always null
      for (var i = 1; i < dependencyStack.length; i ++) {
        if (dependencyStack[i]) {
          dependencies += " -> " + dependencyStack[i];
        }
      }
    }
    if (dependencies) message += " resolving" + dependencies;

    Error.call(this, message);
    this.message = message;
    if (this.stack) {
      var stack = this.stack;
      stack = stack.replace(new RegExp("^" + this.name + "\n"), "");
      this.stack = this.name + ": " + this.message + "\n" + stack;
    }
  }

  function NoModuleError(name, dependencyStack) {
    EsquireError.call(this, "Module '" + name + "' not found", dependencyStack);
  };

  function CircularDependencyError(name, dependencyStack) {
    EsquireError.call(this, "Module '" + name + "' has circular dependencies", dependencyStack);
  };

  EsquireError.prototype = Object.create(Error.prototype);
  EsquireError.prototype.constructor = EsquireError;
  EsquireError.prototype.name = 'EsquireError';

  NoModuleError.prototype = Object.create(EsquireError.prototype);
  NoModuleError.prototype.constructor = NoModuleError;
  NoModuleError.prototype.name = 'NoModuleError';

  CircularDependencyError.prototype = Object.create(EsquireError.prototype);
  CircularDependencyError.prototype.constructor = CircularDependencyError;
  CircularDependencyError.prototype.name = 'CircularDependencyError';

  /* ======================================================================== */
  /* Module class definition                                                  */
  /* ======================================================================== */

  /**
   * @class Module
   * @classdesc The definition of an {@link Esquire} module
   */
  function Module(name, dependencies, constructor, dynamic) {

    /* Normalize names to "$global/..." */
    name = globalName(name);
    for (var i in dependencies) {
      dependencies[i]=  globalName(dependencies[i]);
    }

    /**
     * The name of this {@link Module}
     * @member {string} Module#name
     * @readonly
     */
    Object.defineProperty(this, 'name', { enumerable: true, configurable: false, value: name });

    /**
     * The name of all dependencies required by this {@link Module} (in order).
     * @member {string[]} Module#dependencies
     * @readonly
     */
    Object.defineProperty(this, 'dependencies', { enumerable: true, configurable: false, value: dependencies });

    /**
     * The constructor function creating instances of this {@link Module}.
     * @member {function} Module#constructor
     * @readonly
     */
    Object.defineProperty(this, 'constructor', { enumerable: true, configurable: false, value: constructor });

    /* Hidden $$script for injection and $$dynamic flag */
    Object.defineProperty(this, "$$dynamic", { enumerable: false, configurable: false, value: dynamic || false });
    Object.defineProperty(this, '$$script',  { enumerable: false, configurable: false, get: function() {
      return 'Esquire.define(' + JSON.stringify(this.name)
                         + ',' + JSON.stringify(this.dependencies)
                         + ',' + constructor.toString() + ');'
    }});

    /* Freeze ourselves */
    Object.freeze(this);

  }

  /* ======================================================================== */

  /* A regular expression to validate "$global." or "$global/" dynamic names */
  function isGlobal(name) {
    return /^\$global[\/\.].+/.test(name);
  }

  function globalName(name) {
    if (isGlobal(name)) {
      return "$global/" + name.substring(8)
    } else {
      return name;
    }
  }

  /* A $global dynamic module */
  function GlobalModule(name) {
    Module.call(this, name, ['$global'], function($global) {

      /* Find a property with a prefix */
      function prefix(property, scope, onlyPrefixed) {

        /* Check non prefixes property if we have to */
        if ((! onlyPrefixed) && (property in scope)) return scope[property];

        /* Check the various prefixed properties, if we have one */
        var prefixes = ["Ms", "ms", "Moz", "moz", "WebKit", "webkit"];
        for (var i in prefixes) {
          var prefixed = prefixes[i] + property;
          if (prefixed in scope) return scope[prefixed];
        }

        /* Things like "window.crypto" become "window.webkitCrypto" */
        if (property[0] !== property[0].toUpperCase()) {
          return prefix(property[0].toUpperCase() + property.substring(1), scope, true);
        } else {
          return undefined;
        }
      }

      /* Find a property recursively */
      function find(definition, scope) {
        if (! scope) return undefined;
        if (! definition) return undefined;
        switch (definition.length) {
          case 0:  return undefined;
          case 1:  return prefix(definition[0], scope);
          default: return find(definition.slice(1), prefix(definition[0], scope));
        }
      }

      return find(this.name.substring(8).split('.'), $global);
    }, true);
  }

  GlobalModule.prototype = Object.create(Module.prototype);
  GlobalModule.prototype.constructor = GlobalModule;
  GlobalModule.prototype.name = "GlobalModule";


  /* ======================================================================== */
  /* Stuff exposed statically on the Exquire class                            */
  /* ======================================================================== */

  /* Static list of known modules */
  var modules = {
    "$global": new Module("$global", [], function() {
      throw new EsquireError("The constructor for '$global' should not be called'")
     }, true),
    "$esquire": new Module("$esquire", [], function() {
      throw new EsquireError("The constructor for '$esquire' should not be called'")
     }, true)
  };

  /**
   * Define a {@link Module} as available to Esquire
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
    var dependencies = [];
    var constructor;

    /* Name and dependencies */
    if (!args.arguments.length) {
      throw new EsquireError("No module name specified");
    } else {
      name = globalName(args.arguments.splice(0, 1)[0]);
      dependencies = args.arguments;
    }

    /* Watch out for double definitions */
    if (modules[name]) {
      throw new EsquireError("Module '" + name + "' already defined");
    }

    /* Constructor function */
    if (!args.function) {
      throw new EsquireError("No constructor function specified for module '" + name + "'");
    } else {
      constructor = args.function;
    }

    /* Remember and return a new module */
    modules[name] = new Module(name, dependencies, constructor);
    return modules[name];
  };

  /**
   * Return an array of {@link Module} dependencies for a {@link Module}.
   *
   * @static
   * @function resolve
   * @memberof Esquire
   * @param {string|Module} module - The {@link Module} (or its name) for which
   *                                 dependendencies should be resolved.
   * @param {boolean} [transitive] - If `true` all direct and indirect
   *                                 _(transitive)_ dependencies will be
   *                                 resolved. If `false` or _undefined_, only
   *                                 the {@link Module}'s explicit dependencies
   *                                 will be resolved.
   * @returns {Module[]} An array of all required {@link Module}s.
   */
  function resolve(module, transitive, dependencyStack) {

    /* Check parameters */
    if (!dependencyStack) dependencyStack = [];
    if (!module) throw new EsquireError("No module or module name specified");
    if (typeof(module) === 'string') {
      if (modules[module]) {
        module = modules[module];
      } else {
        throw new NoModuleError(name, dependencyStack);
      }
    }

    /* Check recursion */
    if (dependencyStack.indexOf(module.name) >= 0) {
      throw new CircularDependencyError(module.name, dependencyStack);
    }

    /* The dependencies to return */
    var moduleDependencies = [];

    /* Recurse into module */
    dependencyStack.push(module.name);
    for (var i in module.dependencies) {

      /* Check this module's dependency */
      var dependencyName = module.dependencies[i];
      var dependency = modules[dependencyName];
      if (dependency) {
        /* Add the dependency */
        moduleDependencies.push(dependency);

        /* If transitive, recurse */
        if (transitive) {
          var dependencies = resolve(dependency, dependencyStack);
          for (var name in dependencies) {
            moduleDependencies.push(dependencies[name]);
          }
        }
      } else if (isGlobal(dependencyName)) {

        /* Global "any" dependency not in modules */
        moduleDependencies.push(new GlobalModule(dependencyName));

      } else {

        /* Dependency not found */
        throw new NoModuleError(module.dependencies[i], dependencyStack);
      }
    }

    /* Pop ourselves out */
    dependencyStack.pop();

    /* Return our resolved module dependencies */
    return moduleDependencies;

  }

  /* ======================================================================== */
  /* Esquire constructor                                                      */
  /* ======================================================================== */

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
    var cache = { "$global": global, "$esquire": this };

    /* Create a new instance from a defined module */
    function create(module, dependencyStack) {

      /* Already in cache? Why even bother? */
      if (cache[module.name]) return cache[module.name];

      /* Calculate the module's direct dependencies */
      var dependencies = resolve(module, false, dependencyStack);
      var parameters = [];

      for (var i in dependencies) {
        var dependency = dependencies[i];

        /* Already in cache? Just push it! */
        if (cache[dependency.name]) {
          parameters.push(cache[dependency.name]);
        } else {

          /* Not in cache, create (recursively) the dependency */
          dependencyStack.push(module.name);
          parameters.push(create(dependency, dependencyStack));
          dependencyStack.pop();
        }

      }

      /* Invoke the constructor */
      var instance = module.constructor.apply(module, parameters);
      if (module.name && (! module.$$dynamic)) {
        cache[module.name] = instance;
      }
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
      return create(module, []);

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
    "resolve":     { enumerable: true,  configurable: false, value: resolve },
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
      name = globalName(name);
      if (name in modules) return modules[name];
      if (isGlobal(name)) return new GlobalModule(name);
      return null;
    }}
  });

  /* If something was loaded before, just copy over */
  if (global.Esquire) {
    for (var member in global.Esquire) {
      Object.defineProperty(Esquire, member, {
        enumerable: true,
        configurable: false,
        value: global.Esquire[member]
      });
    }
  }

  /* Set our Esquire function globally */
  global.Esquire = Esquire;

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
  global.esquire = function() {
    /* No arguments? Ignore */
    if (arguments.length == 0) {
      throw new EsquireError("No dependencies/callback specified");
    }

    /* Normalize our arguments */
    var args = normalize(arguments);

    /* Inject or require? */
    if (args.function) {
      return staticEsquire.inject(args.arguments, args.function);
    } else if ((arguments.length == 1) && (typeof(arguments[0]) === 'string')) {
      return staticEsquire.require(arguments[0]);
    } else {
      return staticEsquire.require(args.arguments);
    }

  };

})((function() {
  try {
    return window;
  } catch (e) {
    return global;
  }
})());
