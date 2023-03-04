var DvJs = (function (exports) {
            'use strict';

            const global$1 = (typeof global !== "undefined" ? global :
                        typeof self !== "undefined" ? self :
                        typeof window !== "undefined" ? window : {});

            // shim for using process in browser
            // based off https://github.com/defunctzombie/node-process/blob/master/browser.js

            function defaultSetTimout() {
                throw new Error('setTimeout has not been defined');
            }
            function defaultClearTimeout () {
                throw new Error('clearTimeout has not been defined');
            }
            var cachedSetTimeout = defaultSetTimout;
            var cachedClearTimeout = defaultClearTimeout;
            if (typeof global$1.setTimeout === 'function') {
                cachedSetTimeout = setTimeout;
            }
            if (typeof global$1.clearTimeout === 'function') {
                cachedClearTimeout = clearTimeout;
            }

            function runTimeout(fun) {
                if (cachedSetTimeout === setTimeout) {
                    //normal enviroments in sane situations
                    return setTimeout(fun, 0);
                }
                // if setTimeout wasn't available but was latter defined
                if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
                    cachedSetTimeout = setTimeout;
                    return setTimeout(fun, 0);
                }
                try {
                    // when when somebody has screwed with setTimeout but no I.E. maddness
                    return cachedSetTimeout(fun, 0);
                } catch(e){
                    try {
                        // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
                        return cachedSetTimeout.call(null, fun, 0);
                    } catch(e){
                        // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
                        return cachedSetTimeout.call(this, fun, 0);
                    }
                }


            }
            function runClearTimeout(marker) {
                if (cachedClearTimeout === clearTimeout) {
                    //normal enviroments in sane situations
                    return clearTimeout(marker);
                }
                // if clearTimeout wasn't available but was latter defined
                if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
                    cachedClearTimeout = clearTimeout;
                    return clearTimeout(marker);
                }
                try {
                    // when when somebody has screwed with setTimeout but no I.E. maddness
                    return cachedClearTimeout(marker);
                } catch (e){
                    try {
                        // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
                        return cachedClearTimeout.call(null, marker);
                    } catch (e){
                        // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
                        // Some versions of I.E. have different rules for clearTimeout vs setTimeout
                        return cachedClearTimeout.call(this, marker);
                    }
                }



            }
            var queue = [];
            var draining = false;
            var currentQueue;
            var queueIndex = -1;

            function cleanUpNextTick() {
                if (!draining || !currentQueue) {
                    return;
                }
                draining = false;
                if (currentQueue.length) {
                    queue = currentQueue.concat(queue);
                } else {
                    queueIndex = -1;
                }
                if (queue.length) {
                    drainQueue();
                }
            }

            function drainQueue() {
                if (draining) {
                    return;
                }
                var timeout = runTimeout(cleanUpNextTick);
                draining = true;

                var len = queue.length;
                while(len) {
                    currentQueue = queue;
                    queue = [];
                    while (++queueIndex < len) {
                        if (currentQueue) {
                            currentQueue[queueIndex].run();
                        }
                    }
                    queueIndex = -1;
                    len = queue.length;
                }
                currentQueue = null;
                draining = false;
                runClearTimeout(timeout);
            }
            function nextTick(fun) {
                var args = new Array(arguments.length - 1);
                if (arguments.length > 1) {
                    for (var i = 1; i < arguments.length; i++) {
                        args[i - 1] = arguments[i];
                    }
                }
                queue.push(new Item(fun, args));
                if (queue.length === 1 && !draining) {
                    runTimeout(drainQueue);
                }
            }
            // v8 likes predictible objects
            function Item(fun, array) {
                this.fun = fun;
                this.array = array;
            }
            Item.prototype.run = function () {
                this.fun.apply(null, this.array);
            };
            var title = 'browser';
            var platform = 'browser';
            var browser = true;
            var env = {};
            var argv = [];
            var version = ''; // empty string to avoid regexp issues
            var versions = {};
            var release = {};
            var config = {};

            function noop$1() {}

            var on = noop$1;
            var addListener = noop$1;
            var once$1 = noop$1;
            var off = noop$1;
            var removeListener = noop$1;
            var removeAllListeners = noop$1;
            var emit = noop$1;

            function binding(name) {
                throw new Error('process.binding is not supported');
            }

            function cwd () { return '/' }
            function chdir (dir) {
                throw new Error('process.chdir is not supported');
            }function umask() { return 0; }

            // from https://github.com/kumavis/browser-process-hrtime/blob/master/index.js
            var performance = global$1.performance || {};
            var performanceNow =
              performance.now        ||
              performance.mozNow     ||
              performance.msNow      ||
              performance.oNow       ||
              performance.webkitNow  ||
              function(){ return (new Date()).getTime() };

            // generate timestamp or delta
            // see http://nodejs.org/api/process.html#process_process_hrtime
            function hrtime(previousTimestamp){
              var clocktime = performanceNow.call(performance)*1e-3;
              var seconds = Math.floor(clocktime);
              var nanoseconds = Math.floor((clocktime%1)*1e9);
              if (previousTimestamp) {
                seconds = seconds - previousTimestamp[0];
                nanoseconds = nanoseconds - previousTimestamp[1];
                if (nanoseconds<0) {
                  seconds--;
                  nanoseconds += 1e9;
                }
              }
              return [seconds,nanoseconds]
            }

            var startTime = new Date();
            function uptime() {
              var currentTime = new Date();
              var dif = currentTime - startTime;
              return dif / 1000;
            }

            const process = {
              nextTick: nextTick,
              title: title,
              browser: browser,
              env: env,
              argv: argv,
              version: version,
              versions: versions,
              on: on,
              addListener: addListener,
              once: once$1,
              off: off,
              removeListener: removeListener,
              removeAllListeners: removeAllListeners,
              emit: emit,
              binding: binding,
              cwd: cwd,
              chdir: chdir,
              umask: umask,
              hrtime: hrtime,
              platform: platform,
              release: release,
              config: config,
              uptime: uptime
            };

            var niceErrors = {
              0: "Invalid value for configuration 'enforceActions', expected 'never', 'always' or 'observed'",
              1: function _(annotationType, key) {
                return "Cannot apply '" + annotationType + "' to '" + key.toString() + "': Field not found.";
              },
              /*
              2(prop) {
                  return `invalid decorator for '${prop.toString()}'`
              },
              3(prop) {
                  return `Cannot decorate '${prop.toString()}': action can only be used on properties with a function value.`
              },
              4(prop) {
                  return `Cannot decorate '${prop.toString()}': computed can only be used on getter properties.`
              },
              */
              5: "'keys()' can only be used on observable objects, arrays, sets and maps",
              6: "'values()' can only be used on observable objects, arrays, sets and maps",
              7: "'entries()' can only be used on observable objects, arrays and maps",
              8: "'set()' can only be used on observable objects, arrays and maps",
              9: "'remove()' can only be used on observable objects, arrays and maps",
              10: "'has()' can only be used on observable objects, arrays and maps",
              11: "'get()' can only be used on observable objects, arrays and maps",
              12: "Invalid annotation",
              13: "Dynamic observable objects cannot be frozen. If you're passing observables to 3rd party component/function that calls Object.freeze, pass copy instead: toJS(observable)",
              14: "Intercept handlers should return nothing or a change object",
              15: "Observable arrays cannot be frozen. If you're passing observables to 3rd party component/function that calls Object.freeze, pass copy instead: toJS(observable)",
              16: "Modification exception: the internal structure of an observable array was changed.",
              17: function _(index, length) {
                return "[mobx.array] Index out of bounds, " + index + " is larger than " + length;
              },
              18: "mobx.map requires Map polyfill for the current browser. Check babel-polyfill or core-js/es6/map.js",
              19: function _(other) {
                return "Cannot initialize from classes that inherit from Map: " + other.constructor.name;
              },
              20: function _(other) {
                return "Cannot initialize map from " + other;
              },
              21: function _(dataStructure) {
                return "Cannot convert to map from '" + dataStructure + "'";
              },
              22: "mobx.set requires Set polyfill for the current browser. Check babel-polyfill or core-js/es6/set.js",
              23: "It is not possible to get index atoms from arrays",
              24: function _(thing) {
                return "Cannot obtain administration from " + thing;
              },
              25: function _(property, name) {
                return "the entry '" + property + "' does not exist in the observable map '" + name + "'";
              },
              26: "please specify a property",
              27: function _(property, name) {
                return "no observable property '" + property.toString() + "' found on the observable object '" + name + "'";
              },
              28: function _(thing) {
                return "Cannot obtain atom from " + thing;
              },
              29: "Expecting some object",
              30: "invalid action stack. did you forget to finish an action?",
              31: "missing option for computed: get",
              32: function _(name, derivation) {
                return "Cycle detected in computation " + name + ": " + derivation;
              },
              33: function _(name) {
                return "The setter of computed value '" + name + "' is trying to update itself. Did you intend to update an _observable_ value, instead of the computed property?";
              },
              34: function _(name) {
                return "[ComputedValue '" + name + "'] It is not possible to assign a new value to a computed value.";
              },
              35: "There are multiple, different versions of MobX active. Make sure MobX is loaded only once or use `configure({ isolateGlobalState: true })`",
              36: "isolateGlobalState should be called before MobX is running any reactions",
              37: function _(method) {
                return "[mobx] `observableArray." + method + "()` mutates the array in-place, which is not allowed inside a derivation. Use `array.slice()." + method + "()` instead";
              },
              38: "'ownKeys()' can only be used on observable objects",
              39: "'defineProperty()' can only be used on observable objects"
            };
            var errors = process.env.NODE_ENV !== "production" ? niceErrors : {};
            function die(error) {
              for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = arguments[_key];
              }
              if (process.env.NODE_ENV !== "production") {
                var e = typeof error === "string" ? error : errors[error];
                if (typeof e === "function") e = e.apply(null, args);
                throw new Error("[MobX] " + e);
              }
              throw new Error(typeof error === "number" ? "[MobX] minified error nr: " + error + (args.length ? " " + args.map(String).join(",") : "") + ". Find the full error at: https://github.com/mobxjs/mobx/blob/main/packages/mobx/src/errors.ts" : "[MobX] " + error);
            }

            var mockGlobal = {};
            function getGlobal() {
              if (typeof globalThis !== "undefined") {
                return globalThis;
              }
              if (typeof window !== "undefined") {
                return window;
              }
              if (typeof global$1 !== "undefined") {
                return global$1;
              }
              if (typeof self !== "undefined") {
                return self;
              }
              return mockGlobal;
            }

            // We shorten anything used > 5 times
            var assign = Object.assign;
            var getDescriptor = Object.getOwnPropertyDescriptor;
            var defineProperty = Object.defineProperty;
            var objectPrototype = Object.prototype;
            var EMPTY_ARRAY = [];
            Object.freeze(EMPTY_ARRAY);
            var EMPTY_OBJECT = {};
            Object.freeze(EMPTY_OBJECT);
            var hasProxy = typeof Proxy !== "undefined";
            var plainObjectString = /*#__PURE__*/Object.toString();
            function assertProxies() {
              if (!hasProxy) {
                die(process.env.NODE_ENV !== "production" ? "`Proxy` objects are not available in the current environment. Please configure MobX to enable a fallback implementation.`" : "Proxy not available");
              }
            }
            function warnAboutProxyRequirement(msg) {
              if (process.env.NODE_ENV !== "production" && globalState.verifyProxies) {
                die("MobX is currently configured to be able to run in ES5 mode, but in ES5 MobX won't be able to " + msg);
              }
            }
            function getNextId() {
              return ++globalState.mobxGuid;
            }
            /**
             * Makes sure that the provided function is invoked at most once.
             */
            function once(func) {
              var invoked = false;
              return function () {
                if (invoked) {
                  return;
                }
                invoked = true;
                return func.apply(this, arguments);
              };
            }
            var noop = function noop() {};
            function isFunction(fn) {
              return typeof fn === "function";
            }
            function isStringish(value) {
              var t = typeof value;
              switch (t) {
                case "string":
                case "symbol":
                case "number":
                  return true;
              }
              return false;
            }
            function isObject(value) {
              return value !== null && typeof value === "object";
            }
            function isPlainObject(value) {
              if (!isObject(value)) {
                return false;
              }
              var proto = Object.getPrototypeOf(value);
              if (proto == null) {
                return true;
              }
              var protoConstructor = Object.hasOwnProperty.call(proto, "constructor") && proto.constructor;
              return typeof protoConstructor === "function" && protoConstructor.toString() === plainObjectString;
            }
            // https://stackoverflow.com/a/37865170
            function isGenerator(obj) {
              var constructor = obj == null ? void 0 : obj.constructor;
              if (!constructor) {
                return false;
              }
              if ("GeneratorFunction" === constructor.name || "GeneratorFunction" === constructor.displayName) {
                return true;
              }
              return false;
            }
            function addHiddenProp(object, propName, value) {
              defineProperty(object, propName, {
                enumerable: false,
                writable: true,
                configurable: true,
                value: value
              });
            }
            function addHiddenFinalProp(object, propName, value) {
              defineProperty(object, propName, {
                enumerable: false,
                writable: false,
                configurable: true,
                value: value
              });
            }
            function createInstanceofPredicate(name, theClass) {
              var propName = "isMobX" + name;
              theClass.prototype[propName] = true;
              return function (x) {
                return isObject(x) && x[propName] === true;
              };
            }
            function isES6Map(thing) {
              return thing instanceof Map;
            }
            function isES6Set(thing) {
              return thing instanceof Set;
            }
            var hasGetOwnPropertySymbols = typeof Object.getOwnPropertySymbols !== "undefined";
            /**
             * Returns the following: own enumerable keys and symbols.
             */
            function getPlainObjectKeys(object) {
              var keys = Object.keys(object);
              // Not supported in IE, so there are not going to be symbol props anyway...
              if (!hasGetOwnPropertySymbols) {
                return keys;
              }
              var symbols = Object.getOwnPropertySymbols(object);
              if (!symbols.length) {
                return keys;
              }
              return [].concat(keys, symbols.filter(function (s) {
                return objectPrototype.propertyIsEnumerable.call(object, s);
              }));
            }
            // From Immer utils
            // Returns all own keys, including non-enumerable and symbolic
            var ownKeys = typeof Reflect !== "undefined" && Reflect.ownKeys ? Reflect.ownKeys : hasGetOwnPropertySymbols ? function (obj) {
              return Object.getOwnPropertyNames(obj).concat(Object.getOwnPropertySymbols(obj));
            } : /* istanbul ignore next */Object.getOwnPropertyNames;
            function stringifyKey(key) {
              if (typeof key === "string") {
                return key;
              }
              if (typeof key === "symbol") {
                return key.toString();
              }
              return new String(key).toString();
            }
            function toPrimitive(value) {
              return value === null ? null : typeof value === "object" ? "" + value : value;
            }
            function hasProp(target, prop) {
              return objectPrototype.hasOwnProperty.call(target, prop);
            }
            // From Immer utils
            var getOwnPropertyDescriptors = Object.getOwnPropertyDescriptors || function getOwnPropertyDescriptors(target) {
              // Polyfill needed for Hermes and IE, see https://github.com/facebook/hermes/issues/274
              var res = {};
              // Note: without polyfill for ownKeys, symbols won't be picked up
              ownKeys(target).forEach(function (key) {
                res[key] = getDescriptor(target, key);
              });
              return res;
            };

            function _defineProperties(target, props) {
              for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
              }
            }
            function _createClass(Constructor, protoProps, staticProps) {
              if (protoProps) _defineProperties(Constructor.prototype, protoProps);
              if (staticProps) _defineProperties(Constructor, staticProps);
              Object.defineProperty(Constructor, "prototype", {
                writable: false
              });
              return Constructor;
            }
            function _extends() {
              _extends = Object.assign ? Object.assign.bind() : function (target) {
                for (var i = 1; i < arguments.length; i++) {
                  var source = arguments[i];
                  for (var key in source) {
                    if (Object.prototype.hasOwnProperty.call(source, key)) {
                      target[key] = source[key];
                    }
                  }
                }
                return target;
              };
              return _extends.apply(this, arguments);
            }
            function _inheritsLoose(subClass, superClass) {
              subClass.prototype = Object.create(superClass.prototype);
              subClass.prototype.constructor = subClass;
              _setPrototypeOf(subClass, superClass);
            }
            function _setPrototypeOf(o, p) {
              _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) {
                o.__proto__ = p;
                return o;
              };
              return _setPrototypeOf(o, p);
            }
            function _assertThisInitialized(self) {
              if (self === void 0) {
                throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
              }
              return self;
            }
            function _unsupportedIterableToArray(o, minLen) {
              if (!o) return;
              if (typeof o === "string") return _arrayLikeToArray(o, minLen);
              var n = Object.prototype.toString.call(o).slice(8, -1);
              if (n === "Object" && o.constructor) n = o.constructor.name;
              if (n === "Map" || n === "Set") return Array.from(o);
              if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
            }
            function _arrayLikeToArray(arr, len) {
              if (len == null || len > arr.length) len = arr.length;
              for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
              return arr2;
            }
            function _createForOfIteratorHelperLoose(o, allowArrayLike) {
              var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
              if (it) return (it = it.call(o)).next.bind(it);
              if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
                if (it) o = it;
                var i = 0;
                return function () {
                  if (i >= o.length) return {
                    done: true
                  };
                  return {
                    done: false,
                    value: o[i++]
                  };
                };
              }
              throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
            }
            function _toPrimitive(input, hint) {
              if (typeof input !== "object" || input === null) return input;
              var prim = input[Symbol.toPrimitive];
              if (prim !== undefined) {
                var res = prim.call(input, hint || "default");
                if (typeof res !== "object") return res;
                throw new TypeError("@@toPrimitive must return a primitive value.");
              }
              return (hint === "string" ? String : Number)(input);
            }
            function _toPropertyKey(arg) {
              var key = _toPrimitive(arg, "string");
              return typeof key === "symbol" ? key : String(key);
            }

            var storedAnnotationsSymbol = /*#__PURE__*/Symbol("mobx-stored-annotations");
            /**
             * Creates a function that acts as
             * - decorator
             * - annotation object
             */
            function createDecoratorAnnotation(annotation) {
              function decorator(target, property) {
                storeAnnotation(target, property, annotation);
              }
              return Object.assign(decorator, annotation);
            }
            /**
             * Stores annotation to prototype,
             * so it can be inspected later by `makeObservable` called from constructor
             */
            function storeAnnotation(prototype, key, annotation) {
              if (!hasProp(prototype, storedAnnotationsSymbol)) {
                addHiddenProp(prototype, storedAnnotationsSymbol, _extends({}, prototype[storedAnnotationsSymbol]));
              }
              // @override must override something
              if (process.env.NODE_ENV !== "production" && isOverride(annotation) && !hasProp(prototype[storedAnnotationsSymbol], key)) {
                var fieldName = prototype.constructor.name + ".prototype." + key.toString();
                die("'" + fieldName + "' is decorated with 'override', " + "but no such decorated member was found on prototype.");
              }
              // Cannot re-decorate
              assertNotDecorated(prototype, annotation, key);
              // Ignore override
              if (!isOverride(annotation)) {
                prototype[storedAnnotationsSymbol][key] = annotation;
              }
            }
            function assertNotDecorated(prototype, annotation, key) {
              if (process.env.NODE_ENV !== "production" && !isOverride(annotation) && hasProp(prototype[storedAnnotationsSymbol], key)) {
                var fieldName = prototype.constructor.name + ".prototype." + key.toString();
                var currentAnnotationType = prototype[storedAnnotationsSymbol][key].annotationType_;
                var requestedAnnotationType = annotation.annotationType_;
                die("Cannot apply '@" + requestedAnnotationType + "' to '" + fieldName + "':" + ("\nThe field is already decorated with '@" + currentAnnotationType + "'.") + "\nRe-decorating fields is not allowed." + "\nUse '@override' decorator for methods overridden by subclass.");
              }
            }

            var $mobx = /*#__PURE__*/Symbol("mobx administration");
            var Atom = /*#__PURE__*/function () {
              // for effective unobserving. BaseAtom has true, for extra optimization, so its onBecomeUnobserved never gets called, because it's not needed

              /**
               * Create a new atom. For debugging purposes it is recommended to give it a name.
               * The onBecomeObserved and onBecomeUnobserved callbacks can be used for resource management.
               */
              function Atom(name_) {
                if (name_ === void 0) {
                  name_ = process.env.NODE_ENV !== "production" ? "Atom@" + getNextId() : "Atom";
                }
                this.name_ = void 0;
                this.isPendingUnobservation_ = false;
                this.isBeingObserved_ = false;
                this.observers_ = new Set();
                this.diffValue_ = 0;
                this.lastAccessedBy_ = 0;
                this.lowestObserverState_ = IDerivationState_.NOT_TRACKING_;
                this.onBOL = void 0;
                this.onBUOL = void 0;
                this.name_ = name_;
              }
              // onBecomeObservedListeners
              var _proto = Atom.prototype;
              _proto.onBO = function onBO() {
                if (this.onBOL) {
                  this.onBOL.forEach(function (listener) {
                    return listener();
                  });
                }
              };
              _proto.onBUO = function onBUO() {
                if (this.onBUOL) {
                  this.onBUOL.forEach(function (listener) {
                    return listener();
                  });
                }
              }
              /**
               * Invoke this method to notify mobx that your atom has been used somehow.
               * Returns true if there is currently a reactive context.
               */;
              _proto.reportObserved = function reportObserved$1() {
                return reportObserved(this);
              }
              /**
               * Invoke this method _after_ this method has changed to signal mobx that all its observers should invalidate.
               */;
              _proto.reportChanged = function reportChanged() {
                startBatch();
                propagateChanged(this);
                endBatch();
              };
              _proto.toString = function toString() {
                return this.name_;
              };
              return Atom;
            }();
            var isAtom = /*#__PURE__*/createInstanceofPredicate("Atom", Atom);
            function createAtom(name, onBecomeObservedHandler, onBecomeUnobservedHandler) {
              if (onBecomeObservedHandler === void 0) {
                onBecomeObservedHandler = noop;
              }
              if (onBecomeUnobservedHandler === void 0) {
                onBecomeUnobservedHandler = noop;
              }
              var atom = new Atom(name);
              // default `noop` listener will not initialize the hook Set
              if (onBecomeObservedHandler !== noop) {
                onBecomeObserved(atom, onBecomeObservedHandler);
              }
              if (onBecomeUnobservedHandler !== noop) {
                onBecomeUnobserved(atom, onBecomeUnobservedHandler);
              }
              return atom;
            }

            function identityComparer(a, b) {
              return a === b;
            }
            function structuralComparer(a, b) {
              return deepEqual(a, b);
            }
            function shallowComparer(a, b) {
              return deepEqual(a, b, 1);
            }
            function defaultComparer(a, b) {
              if (Object.is) {
                return Object.is(a, b);
              }
              return a === b ? a !== 0 || 1 / a === 1 / b : a !== a && b !== b;
            }
            var comparer = {
              identity: identityComparer,
              structural: structuralComparer,
              "default": defaultComparer,
              shallow: shallowComparer
            };

            function deepEnhancer(v, _, name) {
              // it is an observable already, done
              if (isObservable(v)) {
                return v;
              }
              // something that can be converted and mutated?
              if (Array.isArray(v)) {
                return observable.array(v, {
                  name: name
                });
              }
              if (isPlainObject(v)) {
                return observable.object(v, undefined, {
                  name: name
                });
              }
              if (isES6Map(v)) {
                return observable.map(v, {
                  name: name
                });
              }
              if (isES6Set(v)) {
                return observable.set(v, {
                  name: name
                });
              }
              if (typeof v === "function" && !isAction(v) && !isFlow(v)) {
                if (isGenerator(v)) {
                  return flow(v);
                } else {
                  return autoAction(name, v);
                }
              }
              return v;
            }
            function shallowEnhancer(v, _, name) {
              if (v === undefined || v === null) {
                return v;
              }
              if (isObservableObject(v) || isObservableArray(v) || isObservableMap(v) || isObservableSet(v)) {
                return v;
              }
              if (Array.isArray(v)) {
                return observable.array(v, {
                  name: name,
                  deep: false
                });
              }
              if (isPlainObject(v)) {
                return observable.object(v, undefined, {
                  name: name,
                  deep: false
                });
              }
              if (isES6Map(v)) {
                return observable.map(v, {
                  name: name,
                  deep: false
                });
              }
              if (isES6Set(v)) {
                return observable.set(v, {
                  name: name,
                  deep: false
                });
              }
              if (process.env.NODE_ENV !== "production") {
                die("The shallow modifier / decorator can only used in combination with arrays, objects, maps and sets");
              }
            }
            function referenceEnhancer(newValue) {
              // never turn into an observable
              return newValue;
            }
            function refStructEnhancer(v, oldValue) {
              if (process.env.NODE_ENV !== "production" && isObservable(v)) {
                die("observable.struct should not be used with observable values");
              }
              if (deepEqual(v, oldValue)) {
                return oldValue;
              }
              return v;
            }

            var OVERRIDE = "override";
            function isOverride(annotation) {
              return annotation.annotationType_ === OVERRIDE;
            }

            function createActionAnnotation(name, options) {
              return {
                annotationType_: name,
                options_: options,
                make_: make_$1,
                extend_: extend_$1
              };
            }
            function make_$1(adm, key, descriptor, source) {
              var _this$options_;
              // bound
              if ((_this$options_ = this.options_) != null && _this$options_.bound) {
                return this.extend_(adm, key, descriptor, false) === null ? 0 /* Cancel */ : 1 /* Break */;
              }
              // own
              if (source === adm.target_) {
                return this.extend_(adm, key, descriptor, false) === null ? 0 /* Cancel */ : 2 /* Continue */;
              }
              // prototype
              if (isAction(descriptor.value)) {
                // A prototype could have been annotated already by other constructor,
                // rest of the proto chain must be annotated already
                return 1 /* Break */;
              }

              var actionDescriptor = createActionDescriptor(adm, this, key, descriptor, false);
              defineProperty(source, key, actionDescriptor);
              return 2 /* Continue */;
            }

            function extend_$1(adm, key, descriptor, proxyTrap) {
              var actionDescriptor = createActionDescriptor(adm, this, key, descriptor);
              return adm.defineProperty_(key, actionDescriptor, proxyTrap);
            }
            function assertActionDescriptor(adm, _ref, key, _ref2) {
              var annotationType_ = _ref.annotationType_;
              var value = _ref2.value;
              if (process.env.NODE_ENV !== "production" && !isFunction(value)) {
                die("Cannot apply '" + annotationType_ + "' to '" + adm.name_ + "." + key.toString() + "':" + ("\n'" + annotationType_ + "' can only be used on properties with a function value."));
              }
            }
            function createActionDescriptor(adm, annotation, key, descriptor,
            // provides ability to disable safeDescriptors for prototypes
            safeDescriptors) {
              var _annotation$options_, _annotation$options_$, _annotation$options_2, _annotation$options_$2, _annotation$options_3, _annotation$options_4, _adm$proxy_2;
              if (safeDescriptors === void 0) {
                safeDescriptors = globalState.safeDescriptors;
              }
              assertActionDescriptor(adm, annotation, key, descriptor);
              var value = descriptor.value;
              if ((_annotation$options_ = annotation.options_) != null && _annotation$options_.bound) {
                var _adm$proxy_;
                value = value.bind((_adm$proxy_ = adm.proxy_) != null ? _adm$proxy_ : adm.target_);
              }
              return {
                value: createAction((_annotation$options_$ = (_annotation$options_2 = annotation.options_) == null ? void 0 : _annotation$options_2.name) != null ? _annotation$options_$ : key.toString(), value, (_annotation$options_$2 = (_annotation$options_3 = annotation.options_) == null ? void 0 : _annotation$options_3.autoAction) != null ? _annotation$options_$2 : false,
                // https://github.com/mobxjs/mobx/discussions/3140
                (_annotation$options_4 = annotation.options_) != null && _annotation$options_4.bound ? (_adm$proxy_2 = adm.proxy_) != null ? _adm$proxy_2 : adm.target_ : undefined),
                // Non-configurable for classes
                // prevents accidental field redefinition in subclass
                configurable: safeDescriptors ? adm.isPlainObject_ : true,
                // https://github.com/mobxjs/mobx/pull/2641#issuecomment-737292058
                enumerable: false,
                // Non-obsevable, therefore non-writable
                // Also prevents rewriting in subclass constructor
                writable: safeDescriptors ? false : true
              };
            }

            function createFlowAnnotation(name, options) {
              return {
                annotationType_: name,
                options_: options,
                make_: make_$2,
                extend_: extend_$2
              };
            }
            function make_$2(adm, key, descriptor, source) {
              var _this$options_;
              // own
              if (source === adm.target_) {
                return this.extend_(adm, key, descriptor, false) === null ? 0 /* Cancel */ : 2 /* Continue */;
              }
              // prototype
              // bound - must annotate protos to support super.flow()
              if ((_this$options_ = this.options_) != null && _this$options_.bound && (!hasProp(adm.target_, key) || !isFlow(adm.target_[key]))) {
                if (this.extend_(adm, key, descriptor, false) === null) {
                  return 0 /* Cancel */;
                }
              }

              if (isFlow(descriptor.value)) {
                // A prototype could have been annotated already by other constructor,
                // rest of the proto chain must be annotated already
                return 1 /* Break */;
              }

              var flowDescriptor = createFlowDescriptor(adm, this, key, descriptor, false, false);
              defineProperty(source, key, flowDescriptor);
              return 2 /* Continue */;
            }

            function extend_$2(adm, key, descriptor, proxyTrap) {
              var _this$options_2;
              var flowDescriptor = createFlowDescriptor(adm, this, key, descriptor, (_this$options_2 = this.options_) == null ? void 0 : _this$options_2.bound);
              return adm.defineProperty_(key, flowDescriptor, proxyTrap);
            }
            function assertFlowDescriptor(adm, _ref, key, _ref2) {
              var annotationType_ = _ref.annotationType_;
              var value = _ref2.value;
              if (process.env.NODE_ENV !== "production" && !isFunction(value)) {
                die("Cannot apply '" + annotationType_ + "' to '" + adm.name_ + "." + key.toString() + "':" + ("\n'" + annotationType_ + "' can only be used on properties with a generator function value."));
              }
            }
            function createFlowDescriptor(adm, annotation, key, descriptor, bound,
            // provides ability to disable safeDescriptors for prototypes
            safeDescriptors) {
              if (safeDescriptors === void 0) {
                safeDescriptors = globalState.safeDescriptors;
              }
              assertFlowDescriptor(adm, annotation, key, descriptor);
              var value = descriptor.value;
              // In case of flow.bound, the descriptor can be from already annotated prototype
              if (!isFlow(value)) {
                value = flow(value);
              }
              if (bound) {
                var _adm$proxy_;
                // We do not keep original function around, so we bind the existing flow
                value = value.bind((_adm$proxy_ = adm.proxy_) != null ? _adm$proxy_ : adm.target_);
                // This is normally set by `flow`, but `bind` returns new function...
                value.isMobXFlow = true;
              }
              return {
                value: value,
                // Non-configurable for classes
                // prevents accidental field redefinition in subclass
                configurable: safeDescriptors ? adm.isPlainObject_ : true,
                // https://github.com/mobxjs/mobx/pull/2641#issuecomment-737292058
                enumerable: false,
                // Non-obsevable, therefore non-writable
                // Also prevents rewriting in subclass constructor
                writable: safeDescriptors ? false : true
              };
            }

            function createComputedAnnotation(name, options) {
              return {
                annotationType_: name,
                options_: options,
                make_: make_$3,
                extend_: extend_$3
              };
            }
            function make_$3(adm, key, descriptor) {
              return this.extend_(adm, key, descriptor, false) === null ? 0 /* Cancel */ : 1 /* Break */;
            }

            function extend_$3(adm, key, descriptor, proxyTrap) {
              assertComputedDescriptor(adm, this, key, descriptor);
              return adm.defineComputedProperty_(key, _extends({}, this.options_, {
                get: descriptor.get,
                set: descriptor.set
              }), proxyTrap);
            }
            function assertComputedDescriptor(adm, _ref, key, _ref2) {
              var annotationType_ = _ref.annotationType_;
              var get = _ref2.get;
              if (process.env.NODE_ENV !== "production" && !get) {
                die("Cannot apply '" + annotationType_ + "' to '" + adm.name_ + "." + key.toString() + "':" + ("\n'" + annotationType_ + "' can only be used on getter(+setter) properties."));
              }
            }

            function createObservableAnnotation(name, options) {
              return {
                annotationType_: name,
                options_: options,
                make_: make_$4,
                extend_: extend_$4
              };
            }
            function make_$4(adm, key, descriptor) {
              return this.extend_(adm, key, descriptor, false) === null ? 0 /* Cancel */ : 1 /* Break */;
            }

            function extend_$4(adm, key, descriptor, proxyTrap) {
              var _this$options_$enhanc, _this$options_;
              assertObservableDescriptor(adm, this, key, descriptor);
              return adm.defineObservableProperty_(key, descriptor.value, (_this$options_$enhanc = (_this$options_ = this.options_) == null ? void 0 : _this$options_.enhancer) != null ? _this$options_$enhanc : deepEnhancer, proxyTrap);
            }
            function assertObservableDescriptor(adm, _ref, key, descriptor) {
              var annotationType_ = _ref.annotationType_;
              if (process.env.NODE_ENV !== "production" && !("value" in descriptor)) {
                die("Cannot apply '" + annotationType_ + "' to '" + adm.name_ + "." + key.toString() + "':" + ("\n'" + annotationType_ + "' cannot be used on getter/setter properties"));
              }
            }

            var AUTO = "true";
            var autoAnnotation = /*#__PURE__*/createAutoAnnotation();
            function createAutoAnnotation(options) {
              return {
                annotationType_: AUTO,
                options_: options,
                make_: make_$5,
                extend_: extend_$5
              };
            }
            function make_$5(adm, key, descriptor, source) {
              var _this$options_3, _this$options_4;
              // getter -> computed
              if (descriptor.get) {
                return computed.make_(adm, key, descriptor, source);
              }
              // lone setter -> action setter
              if (descriptor.set) {
                // TODO make action applicable to setter and delegate to action.make_
                var set = createAction(key.toString(), descriptor.set);
                // own
                if (source === adm.target_) {
                  return adm.defineProperty_(key, {
                    configurable: globalState.safeDescriptors ? adm.isPlainObject_ : true,
                    set: set
                  }) === null ? 0 /* Cancel */ : 2 /* Continue */;
                }
                // proto
                defineProperty(source, key, {
                  configurable: true,
                  set: set
                });
                return 2 /* Continue */;
              }
              // function on proto -> autoAction/flow
              if (source !== adm.target_ && typeof descriptor.value === "function") {
                var _this$options_2;
                if (isGenerator(descriptor.value)) {
                  var _this$options_;
                  var flowAnnotation = (_this$options_ = this.options_) != null && _this$options_.autoBind ? flow.bound : flow;
                  return flowAnnotation.make_(adm, key, descriptor, source);
                }
                var actionAnnotation = (_this$options_2 = this.options_) != null && _this$options_2.autoBind ? autoAction.bound : autoAction;
                return actionAnnotation.make_(adm, key, descriptor, source);
              }
              // other -> observable
              // Copy props from proto as well, see test:
              // "decorate should work with Object.create"
              var observableAnnotation = ((_this$options_3 = this.options_) == null ? void 0 : _this$options_3.deep) === false ? observable.ref : observable;
              // if function respect autoBind option
              if (typeof descriptor.value === "function" && (_this$options_4 = this.options_) != null && _this$options_4.autoBind) {
                var _adm$proxy_;
                descriptor.value = descriptor.value.bind((_adm$proxy_ = adm.proxy_) != null ? _adm$proxy_ : adm.target_);
              }
              return observableAnnotation.make_(adm, key, descriptor, source);
            }
            function extend_$5(adm, key, descriptor, proxyTrap) {
              var _this$options_5, _this$options_6;
              // getter -> computed
              if (descriptor.get) {
                return computed.extend_(adm, key, descriptor, proxyTrap);
              }
              // lone setter -> action setter
              if (descriptor.set) {
                // TODO make action applicable to setter and delegate to action.extend_
                return adm.defineProperty_(key, {
                  configurable: globalState.safeDescriptors ? adm.isPlainObject_ : true,
                  set: createAction(key.toString(), descriptor.set)
                }, proxyTrap);
              }
              // other -> observable
              // if function respect autoBind option
              if (typeof descriptor.value === "function" && (_this$options_5 = this.options_) != null && _this$options_5.autoBind) {
                var _adm$proxy_2;
                descriptor.value = descriptor.value.bind((_adm$proxy_2 = adm.proxy_) != null ? _adm$proxy_2 : adm.target_);
              }
              var observableAnnotation = ((_this$options_6 = this.options_) == null ? void 0 : _this$options_6.deep) === false ? observable.ref : observable;
              return observableAnnotation.extend_(adm, key, descriptor, proxyTrap);
            }

            var OBSERVABLE = "observable";
            var OBSERVABLE_REF = "observable.ref";
            var OBSERVABLE_SHALLOW = "observable.shallow";
            var OBSERVABLE_STRUCT = "observable.struct";
            // Predefined bags of create observable options, to avoid allocating temporarily option objects
            // in the majority of cases
            var defaultCreateObservableOptions = {
              deep: true,
              name: undefined,
              defaultDecorator: undefined,
              proxy: true
            };
            Object.freeze(defaultCreateObservableOptions);
            function asCreateObservableOptions(thing) {
              return thing || defaultCreateObservableOptions;
            }
            var observableAnnotation = /*#__PURE__*/createObservableAnnotation(OBSERVABLE);
            var observableRefAnnotation = /*#__PURE__*/createObservableAnnotation(OBSERVABLE_REF, {
              enhancer: referenceEnhancer
            });
            var observableShallowAnnotation = /*#__PURE__*/createObservableAnnotation(OBSERVABLE_SHALLOW, {
              enhancer: shallowEnhancer
            });
            var observableStructAnnotation = /*#__PURE__*/createObservableAnnotation(OBSERVABLE_STRUCT, {
              enhancer: refStructEnhancer
            });
            var observableDecoratorAnnotation = /*#__PURE__*/createDecoratorAnnotation(observableAnnotation);
            function getEnhancerFromOptions(options) {
              return options.deep === true ? deepEnhancer : options.deep === false ? referenceEnhancer : getEnhancerFromAnnotation(options.defaultDecorator);
            }
            function getAnnotationFromOptions(options) {
              var _options$defaultDecor;
              return options ? (_options$defaultDecor = options.defaultDecorator) != null ? _options$defaultDecor : createAutoAnnotation(options) : undefined;
            }
            function getEnhancerFromAnnotation(annotation) {
              var _annotation$options_$, _annotation$options_;
              return !annotation ? deepEnhancer : (_annotation$options_$ = (_annotation$options_ = annotation.options_) == null ? void 0 : _annotation$options_.enhancer) != null ? _annotation$options_$ : deepEnhancer;
            }
            /**
             * Turns an object, array or function into a reactive structure.
             * @param v the value which should become observable.
             */
            function createObservable(v, arg2, arg3) {
              // @observable someProp;
              if (isStringish(arg2)) {
                storeAnnotation(v, arg2, observableAnnotation);
                return;
              }
              // already observable - ignore
              if (isObservable(v)) {
                return v;
              }
              // plain object
              if (isPlainObject(v)) {
                return observable.object(v, arg2, arg3);
              }
              // Array
              if (Array.isArray(v)) {
                return observable.array(v, arg2);
              }
              // Map
              if (isES6Map(v)) {
                return observable.map(v, arg2);
              }
              // Set
              if (isES6Set(v)) {
                return observable.set(v, arg2);
              }
              // other object - ignore
              if (typeof v === "object" && v !== null) {
                return v;
              }
              // anything else
              return observable.box(v, arg2);
            }
            assign(createObservable, observableDecoratorAnnotation);
            var observableFactories = {
              box: function box(value, options) {
                var o = asCreateObservableOptions(options);
                return new ObservableValue(value, getEnhancerFromOptions(o), o.name, true, o.equals);
              },
              array: function array(initialValues, options) {
                var o = asCreateObservableOptions(options);
                return (globalState.useProxies === false || o.proxy === false ? createLegacyArray : createObservableArray)(initialValues, getEnhancerFromOptions(o), o.name);
              },
              map: function map(initialValues, options) {
                var o = asCreateObservableOptions(options);
                return new ObservableMap(initialValues, getEnhancerFromOptions(o), o.name);
              },
              set: function set(initialValues, options) {
                var o = asCreateObservableOptions(options);
                return new ObservableSet(initialValues, getEnhancerFromOptions(o), o.name);
              },
              object: function object(props, decorators, options) {
                return extendObservable(globalState.useProxies === false || (options == null ? void 0 : options.proxy) === false ? asObservableObject({}, options) : asDynamicObservableObject({}, options), props, decorators);
              },
              ref: /*#__PURE__*/createDecoratorAnnotation(observableRefAnnotation),
              shallow: /*#__PURE__*/createDecoratorAnnotation(observableShallowAnnotation),
              deep: observableDecoratorAnnotation,
              struct: /*#__PURE__*/createDecoratorAnnotation(observableStructAnnotation)
            };
            // eslint-disable-next-line
            var observable = /*#__PURE__*/assign(createObservable, observableFactories);

            var COMPUTED = "computed";
            var COMPUTED_STRUCT = "computed.struct";
            var computedAnnotation = /*#__PURE__*/createComputedAnnotation(COMPUTED);
            var computedStructAnnotation = /*#__PURE__*/createComputedAnnotation(COMPUTED_STRUCT, {
              equals: comparer.structural
            });
            /**
             * Decorator for class properties: @computed get value() { return expr; }.
             * For legacy purposes also invokable as ES5 observable created: `computed(() => expr)`;
             */
            var computed = function computed(arg1, arg2) {
              if (isStringish(arg2)) {
                // @computed
                return storeAnnotation(arg1, arg2, computedAnnotation);
              }
              if (isPlainObject(arg1)) {
                // @computed({ options })
                return createDecoratorAnnotation(createComputedAnnotation(COMPUTED, arg1));
              }
              // computed(expr, options?)
              if (process.env.NODE_ENV !== "production") {
                if (!isFunction(arg1)) {
                  die("First argument to `computed` should be an expression.");
                }
                if (isFunction(arg2)) {
                  die("A setter as second argument is no longer supported, use `{ set: fn }` option instead");
                }
              }
              var opts = isPlainObject(arg2) ? arg2 : {};
              opts.get = arg1;
              opts.name || (opts.name = arg1.name || ""); /* for generated name */
              return new ComputedValue(opts);
            };
            Object.assign(computed, computedAnnotation);
            computed.struct = /*#__PURE__*/createDecoratorAnnotation(computedStructAnnotation);

            var _getDescriptor$config, _getDescriptor;
            // we don't use globalState for these in order to avoid possible issues with multiple
            // mobx versions
            var currentActionId = 0;
            var nextActionId = 1;
            var isFunctionNameConfigurable = (_getDescriptor$config = (_getDescriptor = /*#__PURE__*/getDescriptor(function () {}, "name")) == null ? void 0 : _getDescriptor.configurable) != null ? _getDescriptor$config : false;
            // we can safely recycle this object
            var tmpNameDescriptor = {
              value: "action",
              configurable: true,
              writable: false,
              enumerable: false
            };
            function createAction(actionName, fn, autoAction, ref) {
              if (autoAction === void 0) {
                autoAction = false;
              }
              if (process.env.NODE_ENV !== "production") {
                if (!isFunction(fn)) {
                  die("`action` can only be invoked on functions");
                }
                if (typeof actionName !== "string" || !actionName) {
                  die("actions should have valid names, got: '" + actionName + "'");
                }
              }
              function res() {
                return executeAction(actionName, autoAction, fn, ref || this, arguments);
              }
              res.isMobxAction = true;
              if (isFunctionNameConfigurable) {
                tmpNameDescriptor.value = actionName;
                defineProperty(res, "name", tmpNameDescriptor);
              }
              return res;
            }
            function executeAction(actionName, canRunAsDerivation, fn, scope, args) {
              var runInfo = _startAction(actionName, canRunAsDerivation, scope, args);
              try {
                return fn.apply(scope, args);
              } catch (err) {
                runInfo.error_ = err;
                throw err;
              } finally {
                _endAction(runInfo);
              }
            }
            function _startAction(actionName, canRunAsDerivation,
            // true for autoAction
            scope, args) {
              var notifySpy_ = process.env.NODE_ENV !== "production" && isSpyEnabled() && !!actionName;
              var startTime_ = 0;
              if (process.env.NODE_ENV !== "production" && notifySpy_) {
                startTime_ = Date.now();
                var flattenedArgs = args ? Array.from(args) : EMPTY_ARRAY;
                spyReportStart({
                  type: ACTION,
                  name: actionName,
                  object: scope,
                  arguments: flattenedArgs
                });
              }
              var prevDerivation_ = globalState.trackingDerivation;
              var runAsAction = !canRunAsDerivation || !prevDerivation_;
              startBatch();
              var prevAllowStateChanges_ = globalState.allowStateChanges; // by default preserve previous allow
              if (runAsAction) {
                untrackedStart();
                prevAllowStateChanges_ = allowStateChangesStart(true);
              }
              var prevAllowStateReads_ = allowStateReadsStart(true);
              var runInfo = {
                runAsAction_: runAsAction,
                prevDerivation_: prevDerivation_,
                prevAllowStateChanges_: prevAllowStateChanges_,
                prevAllowStateReads_: prevAllowStateReads_,
                notifySpy_: notifySpy_,
                startTime_: startTime_,
                actionId_: nextActionId++,
                parentActionId_: currentActionId
              };
              currentActionId = runInfo.actionId_;
              return runInfo;
            }
            function _endAction(runInfo) {
              if (currentActionId !== runInfo.actionId_) {
                die(30);
              }
              currentActionId = runInfo.parentActionId_;
              if (runInfo.error_ !== undefined) {
                globalState.suppressReactionErrors = true;
              }
              allowStateChangesEnd(runInfo.prevAllowStateChanges_);
              allowStateReadsEnd(runInfo.prevAllowStateReads_);
              endBatch();
              if (runInfo.runAsAction_) {
                untrackedEnd(runInfo.prevDerivation_);
              }
              if (process.env.NODE_ENV !== "production" && runInfo.notifySpy_) {
                spyReportEnd({
                  time: Date.now() - runInfo.startTime_
                });
              }
              globalState.suppressReactionErrors = false;
            }
            function allowStateChanges(allowStateChanges, func) {
              var prev = allowStateChangesStart(allowStateChanges);
              try {
                return func();
              } finally {
                allowStateChangesEnd(prev);
              }
            }
            function allowStateChangesStart(allowStateChanges) {
              var prev = globalState.allowStateChanges;
              globalState.allowStateChanges = allowStateChanges;
              return prev;
            }
            function allowStateChangesEnd(prev) {
              globalState.allowStateChanges = prev;
            }

            var _Symbol$toPrimitive;
            var CREATE = "create";
            _Symbol$toPrimitive = Symbol.toPrimitive;
            var ObservableValue = /*#__PURE__*/function (_Atom) {
              _inheritsLoose(ObservableValue, _Atom);
              function ObservableValue(value, enhancer, name_, notifySpy, equals) {
                var _this;
                if (name_ === void 0) {
                  name_ = process.env.NODE_ENV !== "production" ? "ObservableValue@" + getNextId() : "ObservableValue";
                }
                if (notifySpy === void 0) {
                  notifySpy = true;
                }
                if (equals === void 0) {
                  equals = comparer["default"];
                }
                _this = _Atom.call(this, name_) || this;
                _this.enhancer = void 0;
                _this.name_ = void 0;
                _this.equals = void 0;
                _this.hasUnreportedChange_ = false;
                _this.interceptors_ = void 0;
                _this.changeListeners_ = void 0;
                _this.value_ = void 0;
                _this.dehancer = void 0;
                _this.enhancer = enhancer;
                _this.name_ = name_;
                _this.equals = equals;
                _this.value_ = enhancer(value, undefined, name_);
                if (process.env.NODE_ENV !== "production" && notifySpy && isSpyEnabled()) {
                  // only notify spy if this is a stand-alone observable
                  spyReport({
                    type: CREATE,
                    object: _assertThisInitialized(_this),
                    observableKind: "value",
                    debugObjectName: _this.name_,
                    newValue: "" + _this.value_
                  });
                }
                return _this;
              }
              var _proto = ObservableValue.prototype;
              _proto.dehanceValue = function dehanceValue(value) {
                if (this.dehancer !== undefined) {
                  return this.dehancer(value);
                }
                return value;
              };
              _proto.set = function set(newValue) {
                var oldValue = this.value_;
                newValue = this.prepareNewValue_(newValue);
                if (newValue !== globalState.UNCHANGED) {
                  var notifySpy = isSpyEnabled();
                  if (process.env.NODE_ENV !== "production" && notifySpy) {
                    spyReportStart({
                      type: UPDATE,
                      object: this,
                      observableKind: "value",
                      debugObjectName: this.name_,
                      newValue: newValue,
                      oldValue: oldValue
                    });
                  }
                  this.setNewValue_(newValue);
                  if (process.env.NODE_ENV !== "production" && notifySpy) {
                    spyReportEnd();
                  }
                }
              };
              _proto.prepareNewValue_ = function prepareNewValue_(newValue) {
                checkIfStateModificationsAreAllowed(this);
                if (hasInterceptors(this)) {
                  var change = interceptChange(this, {
                    object: this,
                    type: UPDATE,
                    newValue: newValue
                  });
                  if (!change) {
                    return globalState.UNCHANGED;
                  }
                  newValue = change.newValue;
                }
                // apply modifier
                newValue = this.enhancer(newValue, this.value_, this.name_);
                return this.equals(this.value_, newValue) ? globalState.UNCHANGED : newValue;
              };
              _proto.setNewValue_ = function setNewValue_(newValue) {
                var oldValue = this.value_;
                this.value_ = newValue;
                this.reportChanged();
                if (hasListeners(this)) {
                  notifyListeners(this, {
                    type: UPDATE,
                    object: this,
                    newValue: newValue,
                    oldValue: oldValue
                  });
                }
              };
              _proto.get = function get() {
                this.reportObserved();
                return this.dehanceValue(this.value_);
              };
              _proto.intercept_ = function intercept_(handler) {
                return registerInterceptor(this, handler);
              };
              _proto.observe_ = function observe_(listener, fireImmediately) {
                if (fireImmediately) {
                  listener({
                    observableKind: "value",
                    debugObjectName: this.name_,
                    object: this,
                    type: UPDATE,
                    newValue: this.value_,
                    oldValue: undefined
                  });
                }
                return registerListener(this, listener);
              };
              _proto.raw = function raw() {
                // used by MST ot get undehanced value
                return this.value_;
              };
              _proto.toJSON = function toJSON() {
                return this.get();
              };
              _proto.toString = function toString() {
                return this.name_ + "[" + this.value_ + "]";
              };
              _proto.valueOf = function valueOf() {
                return toPrimitive(this.get());
              };
              _proto[_Symbol$toPrimitive] = function () {
                return this.valueOf();
              };
              return ObservableValue;
            }(Atom);
            var isObservableValue = /*#__PURE__*/createInstanceofPredicate("ObservableValue", ObservableValue);

            var _Symbol$toPrimitive$1;
            /**
             * A node in the state dependency root that observes other nodes, and can be observed itself.
             *
             * ComputedValue will remember the result of the computation for the duration of the batch, or
             * while being observed.
             *
             * During this time it will recompute only when one of its direct dependencies changed,
             * but only when it is being accessed with `ComputedValue.get()`.
             *
             * Implementation description:
             * 1. First time it's being accessed it will compute and remember result
             *    give back remembered result until 2. happens
             * 2. First time any deep dependency change, propagate POSSIBLY_STALE to all observers, wait for 3.
             * 3. When it's being accessed, recompute if any shallow dependency changed.
             *    if result changed: propagate STALE to all observers, that were POSSIBLY_STALE from the last step.
             *    go to step 2. either way
             *
             * If at any point it's outside batch and it isn't observed: reset everything and go to 1.
             */
            _Symbol$toPrimitive$1 = Symbol.toPrimitive;
            var ComputedValue = /*#__PURE__*/function () {
              // nodes we are looking at. Our value depends on these nodes
              // during tracking it's an array with new observed observers

              // to check for cycles

              // N.B: unminified as it is used by MST

              /**
               * Create a new computed value based on a function expression.
               *
               * The `name` property is for debug purposes only.
               *
               * The `equals` property specifies the comparer function to use to determine if a newly produced
               * value differs from the previous value. Two comparers are provided in the library; `defaultComparer`
               * compares based on identity comparison (===), and `structuralComparer` deeply compares the structure.
               * Structural comparison can be convenient if you always produce a new aggregated object and
               * don't want to notify observers if it is structurally the same.
               * This is useful for working with vectors, mouse coordinates etc.
               */
              function ComputedValue(options) {
                this.dependenciesState_ = IDerivationState_.NOT_TRACKING_;
                this.observing_ = [];
                this.newObserving_ = null;
                this.isBeingObserved_ = false;
                this.isPendingUnobservation_ = false;
                this.observers_ = new Set();
                this.diffValue_ = 0;
                this.runId_ = 0;
                this.lastAccessedBy_ = 0;
                this.lowestObserverState_ = IDerivationState_.UP_TO_DATE_;
                this.unboundDepsCount_ = 0;
                this.value_ = new CaughtException(null);
                this.name_ = void 0;
                this.triggeredBy_ = void 0;
                this.isComputing_ = false;
                this.isRunningSetter_ = false;
                this.derivation = void 0;
                this.setter_ = void 0;
                this.isTracing_ = TraceMode.NONE;
                this.scope_ = void 0;
                this.equals_ = void 0;
                this.requiresReaction_ = void 0;
                this.keepAlive_ = void 0;
                this.onBOL = void 0;
                this.onBUOL = void 0;
                if (!options.get) {
                  die(31);
                }
                this.derivation = options.get;
                this.name_ = options.name || (process.env.NODE_ENV !== "production" ? "ComputedValue@" + getNextId() : "ComputedValue");
                if (options.set) {
                  this.setter_ = createAction(process.env.NODE_ENV !== "production" ? this.name_ + "-setter" : "ComputedValue-setter", options.set);
                }
                this.equals_ = options.equals || (options.compareStructural || options.struct ? comparer.structural : comparer["default"]);
                this.scope_ = options.context;
                this.requiresReaction_ = options.requiresReaction;
                this.keepAlive_ = !!options.keepAlive;
              }
              var _proto = ComputedValue.prototype;
              _proto.onBecomeStale_ = function onBecomeStale_() {
                propagateMaybeChanged(this);
              };
              _proto.onBO = function onBO() {
                if (this.onBOL) {
                  this.onBOL.forEach(function (listener) {
                    return listener();
                  });
                }
              };
              _proto.onBUO = function onBUO() {
                if (this.onBUOL) {
                  this.onBUOL.forEach(function (listener) {
                    return listener();
                  });
                }
              }
              /**
               * Returns the current value of this computed value.
               * Will evaluate its computation first if needed.
               */;
              _proto.get = function get() {
                if (this.isComputing_) {
                  die(32, this.name_, this.derivation);
                }
                if (globalState.inBatch === 0 &&
                // !globalState.trackingDerivatpion &&
                this.observers_.size === 0 && !this.keepAlive_) {
                  if (shouldCompute(this)) {
                    this.warnAboutUntrackedRead_();
                    startBatch(); // See perf test 'computed memoization'
                    this.value_ = this.computeValue_(false);
                    endBatch();
                  }
                } else {
                  reportObserved(this);
                  if (shouldCompute(this)) {
                    var prevTrackingContext = globalState.trackingContext;
                    if (this.keepAlive_ && !prevTrackingContext) {
                      globalState.trackingContext = this;
                    }
                    if (this.trackAndCompute()) {
                      propagateChangeConfirmed(this);
                    }
                    globalState.trackingContext = prevTrackingContext;
                  }
                }
                var result = this.value_;
                if (isCaughtException(result)) {
                  throw result.cause;
                }
                return result;
              };
              _proto.set = function set(value) {
                if (this.setter_) {
                  if (this.isRunningSetter_) {
                    die(33, this.name_);
                  }
                  this.isRunningSetter_ = true;
                  try {
                    this.setter_.call(this.scope_, value);
                  } finally {
                    this.isRunningSetter_ = false;
                  }
                } else {
                  die(34, this.name_);
                }
              };
              _proto.trackAndCompute = function trackAndCompute() {
                // N.B: unminified as it is used by MST
                var oldValue = this.value_;
                var wasSuspended = /* see #1208 */this.dependenciesState_ === IDerivationState_.NOT_TRACKING_;
                var newValue = this.computeValue_(true);
                var changed = wasSuspended || isCaughtException(oldValue) || isCaughtException(newValue) || !this.equals_(oldValue, newValue);
                if (changed) {
                  this.value_ = newValue;
                  if (process.env.NODE_ENV !== "production" && isSpyEnabled()) {
                    spyReport({
                      observableKind: "computed",
                      debugObjectName: this.name_,
                      object: this.scope_,
                      type: "update",
                      oldValue: oldValue,
                      newValue: newValue
                    });
                  }
                }
                return changed;
              };
              _proto.computeValue_ = function computeValue_(track) {
                this.isComputing_ = true;
                // don't allow state changes during computation
                var prev = allowStateChangesStart(false);
                var res;
                if (track) {
                  res = trackDerivedFunction(this, this.derivation, this.scope_);
                } else {
                  if (globalState.disableErrorBoundaries === true) {
                    res = this.derivation.call(this.scope_);
                  } else {
                    try {
                      res = this.derivation.call(this.scope_);
                    } catch (e) {
                      res = new CaughtException(e);
                    }
                  }
                }
                allowStateChangesEnd(prev);
                this.isComputing_ = false;
                return res;
              };
              _proto.suspend_ = function suspend_() {
                if (!this.keepAlive_) {
                  clearObserving(this);
                  this.value_ = undefined; // don't hold on to computed value!
                  if (process.env.NODE_ENV !== "production" && this.isTracing_ !== TraceMode.NONE) {
                    console.log("[mobx.trace] Computed value '" + this.name_ + "' was suspended and it will recompute on the next access.");
                  }
                }
              };
              _proto.observe_ = function observe_(listener, fireImmediately) {
                var _this = this;
                var firstTime = true;
                var prevValue = undefined;
                return autorun(function () {
                  // TODO: why is this in a different place than the spyReport() function? in all other observables it's called in the same place
                  var newValue = _this.get();
                  if (!firstTime || fireImmediately) {
                    var prevU = untrackedStart();
                    listener({
                      observableKind: "computed",
                      debugObjectName: _this.name_,
                      type: UPDATE,
                      object: _this,
                      newValue: newValue,
                      oldValue: prevValue
                    });
                    untrackedEnd(prevU);
                  }
                  firstTime = false;
                  prevValue = newValue;
                });
              };
              _proto.warnAboutUntrackedRead_ = function warnAboutUntrackedRead_() {
                if (!(process.env.NODE_ENV !== "production")) {
                  return;
                }
                if (this.isTracing_ !== TraceMode.NONE) {
                  console.log("[mobx.trace] Computed value '" + this.name_ + "' is being read outside a reactive context. Doing a full recompute.");
                }
                if (typeof this.requiresReaction_ === "boolean" ? this.requiresReaction_ : globalState.computedRequiresReaction) {
                  console.warn("[mobx] Computed value '" + this.name_ + "' is being read outside a reactive context. Doing a full recompute.");
                }
              };
              _proto.toString = function toString() {
                return this.name_ + "[" + this.derivation.toString() + "]";
              };
              _proto.valueOf = function valueOf() {
                return toPrimitive(this.get());
              };
              _proto[_Symbol$toPrimitive$1] = function () {
                return this.valueOf();
              };
              return ComputedValue;
            }();
            var isComputedValue = /*#__PURE__*/createInstanceofPredicate("ComputedValue", ComputedValue);

            var IDerivationState_;
            (function (IDerivationState_) {
              // before being run or (outside batch and not being observed)
              // at this point derivation is not holding any data about dependency tree
              IDerivationState_[IDerivationState_["NOT_TRACKING_"] = -1] = "NOT_TRACKING_";
              // no shallow dependency changed since last computation
              // won't recalculate derivation
              // this is what makes mobx fast
              IDerivationState_[IDerivationState_["UP_TO_DATE_"] = 0] = "UP_TO_DATE_";
              // some deep dependency changed, but don't know if shallow dependency changed
              // will require to check first if UP_TO_DATE or POSSIBLY_STALE
              // currently only ComputedValue will propagate POSSIBLY_STALE
              //
              // having this state is second big optimization:
              // don't have to recompute on every dependency change, but only when it's needed
              IDerivationState_[IDerivationState_["POSSIBLY_STALE_"] = 1] = "POSSIBLY_STALE_";
              // A shallow dependency has changed since last computation and the derivation
              // will need to recompute when it's needed next.
              IDerivationState_[IDerivationState_["STALE_"] = 2] = "STALE_";
            })(IDerivationState_ || (IDerivationState_ = {}));
            var TraceMode;
            (function (TraceMode) {
              TraceMode[TraceMode["NONE"] = 0] = "NONE";
              TraceMode[TraceMode["LOG"] = 1] = "LOG";
              TraceMode[TraceMode["BREAK"] = 2] = "BREAK";
            })(TraceMode || (TraceMode = {}));
            var CaughtException = function CaughtException(cause) {
              this.cause = void 0;
              this.cause = cause;
              // Empty
            };

            function isCaughtException(e) {
              return e instanceof CaughtException;
            }
            /**
             * Finds out whether any dependency of the derivation has actually changed.
             * If dependenciesState is 1 then it will recalculate dependencies,
             * if any dependency changed it will propagate it by changing dependenciesState to 2.
             *
             * By iterating over the dependencies in the same order that they were reported and
             * stopping on the first change, all the recalculations are only called for ComputedValues
             * that will be tracked by derivation. That is because we assume that if the first x
             * dependencies of the derivation doesn't change then the derivation should run the same way
             * up until accessing x-th dependency.
             */
            function shouldCompute(derivation) {
              switch (derivation.dependenciesState_) {
                case IDerivationState_.UP_TO_DATE_:
                  return false;
                case IDerivationState_.NOT_TRACKING_:
                case IDerivationState_.STALE_:
                  return true;
                case IDerivationState_.POSSIBLY_STALE_:
                  {
                    // state propagation can occur outside of action/reactive context #2195
                    var prevAllowStateReads = allowStateReadsStart(true);
                    var prevUntracked = untrackedStart(); // no need for those computeds to be reported, they will be picked up in trackDerivedFunction.
                    var obs = derivation.observing_,
                      l = obs.length;
                    for (var i = 0; i < l; i++) {
                      var obj = obs[i];
                      if (isComputedValue(obj)) {
                        if (globalState.disableErrorBoundaries) {
                          obj.get();
                        } else {
                          try {
                            obj.get();
                          } catch (e) {
                            // we are not interested in the value *or* exception at this moment, but if there is one, notify all
                            untrackedEnd(prevUntracked);
                            allowStateReadsEnd(prevAllowStateReads);
                            return true;
                          }
                        }
                        // if ComputedValue `obj` actually changed it will be computed and propagated to its observers.
                        // and `derivation` is an observer of `obj`
                        // invariantShouldCompute(derivation)
                        if (derivation.dependenciesState_ === IDerivationState_.STALE_) {
                          untrackedEnd(prevUntracked);
                          allowStateReadsEnd(prevAllowStateReads);
                          return true;
                        }
                      }
                    }
                    changeDependenciesStateTo0(derivation);
                    untrackedEnd(prevUntracked);
                    allowStateReadsEnd(prevAllowStateReads);
                    return false;
                  }
              }
            }

            function checkIfStateModificationsAreAllowed(atom) {
              if (!(process.env.NODE_ENV !== "production")) {
                return;
              }
              var hasObservers = atom.observers_.size > 0;
              // Should not be possible to change observed state outside strict mode, except during initialization, see #563
              if (!globalState.allowStateChanges && (hasObservers || globalState.enforceActions === "always")) {
                console.warn("[MobX] " + (globalState.enforceActions ? "Since strict-mode is enabled, changing (observed) observable values without using an action is not allowed. Tried to modify: " : "Side effects like changing state are not allowed at this point. Are you trying to modify state from, for example, a computed value or the render function of a React component? You can wrap side effects in 'runInAction' (or decorate functions with 'action') if needed. Tried to modify: ") + atom.name_);
              }
            }
            function checkIfStateReadsAreAllowed(observable) {
              if (process.env.NODE_ENV !== "production" && !globalState.allowStateReads && globalState.observableRequiresReaction) {
                console.warn("[mobx] Observable '" + observable.name_ + "' being read outside a reactive context.");
              }
            }
            /**
             * Executes the provided function `f` and tracks which observables are being accessed.
             * The tracking information is stored on the `derivation` object and the derivation is registered
             * as observer of any of the accessed observables.
             */
            function trackDerivedFunction(derivation, f, context) {
              var prevAllowStateReads = allowStateReadsStart(true);
              // pre allocate array allocation + room for variation in deps
              // array will be trimmed by bindDependencies
              changeDependenciesStateTo0(derivation);
              derivation.newObserving_ = new Array(derivation.observing_.length + 100);
              derivation.unboundDepsCount_ = 0;
              derivation.runId_ = ++globalState.runId;
              var prevTracking = globalState.trackingDerivation;
              globalState.trackingDerivation = derivation;
              globalState.inBatch++;
              var result;
              if (globalState.disableErrorBoundaries === true) {
                result = f.call(context);
              } else {
                try {
                  result = f.call(context);
                } catch (e) {
                  result = new CaughtException(e);
                }
              }
              globalState.inBatch--;
              globalState.trackingDerivation = prevTracking;
              bindDependencies(derivation);
              warnAboutDerivationWithoutDependencies(derivation);
              allowStateReadsEnd(prevAllowStateReads);
              return result;
            }
            function warnAboutDerivationWithoutDependencies(derivation) {
              if (!(process.env.NODE_ENV !== "production")) {
                return;
              }
              if (derivation.observing_.length !== 0) {
                return;
              }
              if (typeof derivation.requiresObservable_ === "boolean" ? derivation.requiresObservable_ : globalState.reactionRequiresObservable) {
                console.warn("[mobx] Derivation '" + derivation.name_ + "' is created/updated without reading any observable value.");
              }
            }
            /**
             * diffs newObserving with observing.
             * update observing to be newObserving with unique observables
             * notify observers that become observed/unobserved
             */
            function bindDependencies(derivation) {
              // invariant(derivation.dependenciesState !== IDerivationState.NOT_TRACKING, "INTERNAL ERROR bindDependencies expects derivation.dependenciesState !== -1");
              var prevObserving = derivation.observing_;
              var observing = derivation.observing_ = derivation.newObserving_;
              var lowestNewObservingDerivationState = IDerivationState_.UP_TO_DATE_;
              // Go through all new observables and check diffValue: (this list can contain duplicates):
              //   0: first occurrence, change to 1 and keep it
              //   1: extra occurrence, drop it
              var i0 = 0,
                l = derivation.unboundDepsCount_;
              for (var i = 0; i < l; i++) {
                var dep = observing[i];
                if (dep.diffValue_ === 0) {
                  dep.diffValue_ = 1;
                  if (i0 !== i) {
                    observing[i0] = dep;
                  }
                  i0++;
                }
                // Upcast is 'safe' here, because if dep is IObservable, `dependenciesState` will be undefined,
                // not hitting the condition
                if (dep.dependenciesState_ > lowestNewObservingDerivationState) {
                  lowestNewObservingDerivationState = dep.dependenciesState_;
                }
              }
              observing.length = i0;
              derivation.newObserving_ = null; // newObserving shouldn't be needed outside tracking (statement moved down to work around FF bug, see #614)
              // Go through all old observables and check diffValue: (it is unique after last bindDependencies)
              //   0: it's not in new observables, unobserve it
              //   1: it keeps being observed, don't want to notify it. change to 0
              l = prevObserving.length;
              while (l--) {
                var _dep = prevObserving[l];
                if (_dep.diffValue_ === 0) {
                  removeObserver(_dep, derivation);
                }
                _dep.diffValue_ = 0;
              }
              // Go through all new observables and check diffValue: (now it should be unique)
              //   0: it was set to 0 in last loop. don't need to do anything.
              //   1: it wasn't observed, let's observe it. set back to 0
              while (i0--) {
                var _dep2 = observing[i0];
                if (_dep2.diffValue_ === 1) {
                  _dep2.diffValue_ = 0;
                  addObserver(_dep2, derivation);
                }
              }
              // Some new observed derivations may become stale during this derivation computation
              // so they have had no chance to propagate staleness (#916)
              if (lowestNewObservingDerivationState !== IDerivationState_.UP_TO_DATE_) {
                derivation.dependenciesState_ = lowestNewObservingDerivationState;
                derivation.onBecomeStale_();
              }
            }
            function clearObserving(derivation) {
              // invariant(globalState.inBatch > 0, "INTERNAL ERROR clearObserving should be called only inside batch");
              var obs = derivation.observing_;
              derivation.observing_ = [];
              var i = obs.length;
              while (i--) {
                removeObserver(obs[i], derivation);
              }
              derivation.dependenciesState_ = IDerivationState_.NOT_TRACKING_;
            }
            function untracked(action) {
              var prev = untrackedStart();
              try {
                return action();
              } finally {
                untrackedEnd(prev);
              }
            }
            function untrackedStart() {
              var prev = globalState.trackingDerivation;
              globalState.trackingDerivation = null;
              return prev;
            }
            function untrackedEnd(prev) {
              globalState.trackingDerivation = prev;
            }
            function allowStateReadsStart(allowStateReads) {
              var prev = globalState.allowStateReads;
              globalState.allowStateReads = allowStateReads;
              return prev;
            }
            function allowStateReadsEnd(prev) {
              globalState.allowStateReads = prev;
            }
            /**
             * needed to keep `lowestObserverState` correct. when changing from (2 or 1) to 0
             *
             */
            function changeDependenciesStateTo0(derivation) {
              if (derivation.dependenciesState_ === IDerivationState_.UP_TO_DATE_) {
                return;
              }
              derivation.dependenciesState_ = IDerivationState_.UP_TO_DATE_;
              var obs = derivation.observing_;
              var i = obs.length;
              while (i--) {
                obs[i].lowestObserverState_ = IDerivationState_.UP_TO_DATE_;
              }
            }
            var MobXGlobals = function MobXGlobals() {
              this.version = 6;
              this.UNCHANGED = {};
              this.trackingDerivation = null;
              this.trackingContext = null;
              this.runId = 0;
              this.mobxGuid = 0;
              this.inBatch = 0;
              this.pendingUnobservations = [];
              this.pendingReactions = [];
              this.isRunningReactions = false;
              this.allowStateChanges = false;
              this.allowStateReads = true;
              this.enforceActions = true;
              this.spyListeners = [];
              this.globalReactionErrorHandlers = [];
              this.computedRequiresReaction = false;
              this.reactionRequiresObservable = false;
              this.observableRequiresReaction = false;
              this.disableErrorBoundaries = false;
              this.suppressReactionErrors = false;
              this.useProxies = true;
              this.verifyProxies = false;
              this.safeDescriptors = true;
            };
            var canMergeGlobalState = true;
            var globalState = /*#__PURE__*/function () {
              var global = /*#__PURE__*/getGlobal();
              if (global.__mobxInstanceCount > 0 && !global.__mobxGlobals) {
                canMergeGlobalState = false;
              }
              if (global.__mobxGlobals && global.__mobxGlobals.version !== new MobXGlobals().version) {
                canMergeGlobalState = false;
              }
              if (!canMergeGlobalState) {
                // Because this is a IIFE we need to let isolateCalled a chance to change
                // so we run it after the event loop completed at least 1 iteration
                setTimeout(function () {
                  {
                    die(35);
                  }
                }, 1);
                return new MobXGlobals();
              } else if (global.__mobxGlobals) {
                global.__mobxInstanceCount += 1;
                if (!global.__mobxGlobals.UNCHANGED) {
                  global.__mobxGlobals.UNCHANGED = {};
                } // make merge backward compatible
                return global.__mobxGlobals;
              } else {
                global.__mobxInstanceCount = 1;
                return global.__mobxGlobals = /*#__PURE__*/new MobXGlobals();
              }
            }();
            // function invariantObservers(observable: IObservable) {
            //     const list = observable.observers
            //     const map = observable.observersIndexes
            //     const l = list.length
            //     for (let i = 0; i < l; i++) {
            //         const id = list[i].__mapid
            //         if (i) {
            //             invariant(map[id] === i, "INTERNAL ERROR maps derivation.__mapid to index in list") // for performance
            //         } else {
            //             invariant(!(id in map), "INTERNAL ERROR observer on index 0 shouldn't be held in map.") // for performance
            //         }
            //     }
            //     invariant(
            //         list.length === 0 || Object.keys(map).length === list.length - 1,
            //         "INTERNAL ERROR there is no junk in map"
            //     )
            // }
            function addObserver(observable, node) {
              // invariant(node.dependenciesState !== -1, "INTERNAL ERROR, can add only dependenciesState !== -1");
              // invariant(observable._observers.indexOf(node) === -1, "INTERNAL ERROR add already added node");
              // invariantObservers(observable);
              observable.observers_.add(node);
              if (observable.lowestObserverState_ > node.dependenciesState_) {
                observable.lowestObserverState_ = node.dependenciesState_;
              }
              // invariantObservers(observable);
              // invariant(observable._observers.indexOf(node) !== -1, "INTERNAL ERROR didn't add node");
            }

            function removeObserver(observable, node) {
              // invariant(globalState.inBatch > 0, "INTERNAL ERROR, remove should be called only inside batch");
              // invariant(observable._observers.indexOf(node) !== -1, "INTERNAL ERROR remove already removed node");
              // invariantObservers(observable);
              observable.observers_["delete"](node);
              if (observable.observers_.size === 0) {
                // deleting last observer
                queueForUnobservation(observable);
              }
              // invariantObservers(observable);
              // invariant(observable._observers.indexOf(node) === -1, "INTERNAL ERROR remove already removed node2");
            }

            function queueForUnobservation(observable) {
              if (observable.isPendingUnobservation_ === false) {
                // invariant(observable._observers.length === 0, "INTERNAL ERROR, should only queue for unobservation unobserved observables");
                observable.isPendingUnobservation_ = true;
                globalState.pendingUnobservations.push(observable);
              }
            }
            /**
             * Batch starts a transaction, at least for purposes of memoizing ComputedValues when nothing else does.
             * During a batch `onBecomeUnobserved` will be called at most once per observable.
             * Avoids unnecessary recalculations.
             */
            function startBatch() {
              globalState.inBatch++;
            }
            function endBatch() {
              if (--globalState.inBatch === 0) {
                runReactions();
                // the batch is actually about to finish, all unobserving should happen here.
                var list = globalState.pendingUnobservations;
                for (var i = 0; i < list.length; i++) {
                  var observable = list[i];
                  observable.isPendingUnobservation_ = false;
                  if (observable.observers_.size === 0) {
                    if (observable.isBeingObserved_) {
                      // if this observable had reactive observers, trigger the hooks
                      observable.isBeingObserved_ = false;
                      observable.onBUO();
                    }
                    if (observable instanceof ComputedValue) {
                      // computed values are automatically teared down when the last observer leaves
                      // this process happens recursively, this computed might be the last observabe of another, etc..
                      observable.suspend_();
                    }
                  }
                }
                globalState.pendingUnobservations = [];
              }
            }
            function reportObserved(observable) {
              checkIfStateReadsAreAllowed(observable);
              var derivation = globalState.trackingDerivation;
              if (derivation !== null) {
                /**
                 * Simple optimization, give each derivation run an unique id (runId)
                 * Check if last time this observable was accessed the same runId is used
                 * if this is the case, the relation is already known
                 */
                if (derivation.runId_ !== observable.lastAccessedBy_) {
                  observable.lastAccessedBy_ = derivation.runId_;
                  // Tried storing newObserving, or observing, or both as Set, but performance didn't come close...
                  derivation.newObserving_[derivation.unboundDepsCount_++] = observable;
                  if (!observable.isBeingObserved_ && globalState.trackingContext) {
                    observable.isBeingObserved_ = true;
                    observable.onBO();
                  }
                }
                return observable.isBeingObserved_;
              } else if (observable.observers_.size === 0 && globalState.inBatch > 0) {
                queueForUnobservation(observable);
              }
              return false;
            }
            // function invariantLOS(observable: IObservable, msg: string) {
            //     // it's expensive so better not run it in produciton. but temporarily helpful for testing
            //     const min = getObservers(observable).reduce((a, b) => Math.min(a, b.dependenciesState), 2)
            //     if (min >= observable.lowestObserverState) return // <- the only assumption about `lowestObserverState`
            //     throw new Error(
            //         "lowestObserverState is wrong for " +
            //             msg +
            //             " because " +
            //             min +
            //             " < " +
            //             observable.lowestObserverState
            //     )
            // }
            /**
             * NOTE: current propagation mechanism will in case of self reruning autoruns behave unexpectedly
             * It will propagate changes to observers from previous run
             * It's hard or maybe impossible (with reasonable perf) to get it right with current approach
             * Hopefully self reruning autoruns aren't a feature people should depend on
             * Also most basic use cases should be ok
             */
            // Called by Atom when its value changes
            function propagateChanged(observable) {
              // invariantLOS(observable, "changed start");
              if (observable.lowestObserverState_ === IDerivationState_.STALE_) {
                return;
              }
              observable.lowestObserverState_ = IDerivationState_.STALE_;
              // Ideally we use for..of here, but the downcompiled version is really slow...
              observable.observers_.forEach(function (d) {
                if (d.dependenciesState_ === IDerivationState_.UP_TO_DATE_) {
                  if (process.env.NODE_ENV !== "production" && d.isTracing_ !== TraceMode.NONE) {
                    logTraceInfo(d, observable);
                  }
                  d.onBecomeStale_();
                }
                d.dependenciesState_ = IDerivationState_.STALE_;
              });
              // invariantLOS(observable, "changed end");
            }
            // Called by ComputedValue when it recalculate and its value changed
            function propagateChangeConfirmed(observable) {
              // invariantLOS(observable, "confirmed start");
              if (observable.lowestObserverState_ === IDerivationState_.STALE_) {
                return;
              }
              observable.lowestObserverState_ = IDerivationState_.STALE_;
              observable.observers_.forEach(function (d) {
                if (d.dependenciesState_ === IDerivationState_.POSSIBLY_STALE_) {
                  d.dependenciesState_ = IDerivationState_.STALE_;
                  if (process.env.NODE_ENV !== "production" && d.isTracing_ !== TraceMode.NONE) {
                    logTraceInfo(d, observable);
                  }
                } else if (d.dependenciesState_ === IDerivationState_.UP_TO_DATE_ // this happens during computing of `d`, just keep lowestObserverState up to date.
                ) {
                  observable.lowestObserverState_ = IDerivationState_.UP_TO_DATE_;
                }
              });
              // invariantLOS(observable, "confirmed end");
            }
            // Used by computed when its dependency changed, but we don't wan't to immediately recompute.
            function propagateMaybeChanged(observable) {
              // invariantLOS(observable, "maybe start");
              if (observable.lowestObserverState_ !== IDerivationState_.UP_TO_DATE_) {
                return;
              }
              observable.lowestObserverState_ = IDerivationState_.POSSIBLY_STALE_;
              observable.observers_.forEach(function (d) {
                if (d.dependenciesState_ === IDerivationState_.UP_TO_DATE_) {
                  d.dependenciesState_ = IDerivationState_.POSSIBLY_STALE_;
                  d.onBecomeStale_();
                }
              });
              // invariantLOS(observable, "maybe end");
            }

            function logTraceInfo(derivation, observable) {
              console.log("[mobx.trace] '" + derivation.name_ + "' is invalidated due to a change in: '" + observable.name_ + "'");
              if (derivation.isTracing_ === TraceMode.BREAK) {
                var lines = [];
                printDepTree(getDependencyTree(derivation), lines, 1);
                // prettier-ignore
                new Function("debugger;\n/*\nTracing '" + derivation.name_ + "'\n\nYou are entering this break point because derivation '" + derivation.name_ + "' is being traced and '" + observable.name_ + "' is now forcing it to update.\nJust follow the stacktrace you should now see in the devtools to see precisely what piece of your code is causing this update\nThe stackframe you are looking for is at least ~6-8 stack-frames up.\n\n" + (derivation instanceof ComputedValue ? derivation.derivation.toString().replace(/[*]\//g, "/") : "") + "\n\nThe dependencies for this derivation are:\n\n" + lines.join("\n") + "\n*/\n    ")();
              }
            }
            function printDepTree(tree, lines, depth) {
              if (lines.length >= 1000) {
                lines.push("(and many more)");
                return;
              }
              lines.push("" + "\t".repeat(depth - 1) + tree.name);
              if (tree.dependencies) {
                tree.dependencies.forEach(function (child) {
                  return printDepTree(child, lines, depth + 1);
                });
              }
            }

            var Reaction = /*#__PURE__*/function () {
              // nodes we are looking at. Our value depends on these nodes

              function Reaction(name_, onInvalidate_, errorHandler_, requiresObservable_) {
                if (name_ === void 0) {
                  name_ = process.env.NODE_ENV !== "production" ? "Reaction@" + getNextId() : "Reaction";
                }
                this.name_ = void 0;
                this.onInvalidate_ = void 0;
                this.errorHandler_ = void 0;
                this.requiresObservable_ = void 0;
                this.observing_ = [];
                this.newObserving_ = [];
                this.dependenciesState_ = IDerivationState_.NOT_TRACKING_;
                this.diffValue_ = 0;
                this.runId_ = 0;
                this.unboundDepsCount_ = 0;
                this.isDisposed_ = false;
                this.isScheduled_ = false;
                this.isTrackPending_ = false;
                this.isRunning_ = false;
                this.isTracing_ = TraceMode.NONE;
                this.name_ = name_;
                this.onInvalidate_ = onInvalidate_;
                this.errorHandler_ = errorHandler_;
                this.requiresObservable_ = requiresObservable_;
              }
              var _proto = Reaction.prototype;
              _proto.onBecomeStale_ = function onBecomeStale_() {
                this.schedule_();
              };
              _proto.schedule_ = function schedule_() {
                if (!this.isScheduled_) {
                  this.isScheduled_ = true;
                  globalState.pendingReactions.push(this);
                  runReactions();
                }
              };
              _proto.isScheduled = function isScheduled() {
                return this.isScheduled_;
              }
              /**
               * internal, use schedule() if you intend to kick off a reaction
               */;
              _proto.runReaction_ = function runReaction_() {
                if (!this.isDisposed_) {
                  startBatch();
                  this.isScheduled_ = false;
                  var prev = globalState.trackingContext;
                  globalState.trackingContext = this;
                  if (shouldCompute(this)) {
                    this.isTrackPending_ = true;
                    try {
                      this.onInvalidate_();
                      if (process.env.NODE_ENV !== "production" && this.isTrackPending_ && isSpyEnabled()) {
                        // onInvalidate didn't trigger track right away..
                        spyReport({
                          name: this.name_,
                          type: "scheduled-reaction"
                        });
                      }
                    } catch (e) {
                      this.reportExceptionInDerivation_(e);
                    }
                  }
                  globalState.trackingContext = prev;
                  endBatch();
                }
              };
              _proto.track = function track(fn) {
                if (this.isDisposed_) {
                  return;
                  // console.warn("Reaction already disposed") // Note: Not a warning / error in mobx 4 either
                }

                startBatch();
                var notify = isSpyEnabled();
                var startTime;
                if (process.env.NODE_ENV !== "production" && notify) {
                  startTime = Date.now();
                  spyReportStart({
                    name: this.name_,
                    type: "reaction"
                  });
                }
                this.isRunning_ = true;
                var prevReaction = globalState.trackingContext; // reactions could create reactions...
                globalState.trackingContext = this;
                var result = trackDerivedFunction(this, fn, undefined);
                globalState.trackingContext = prevReaction;
                this.isRunning_ = false;
                this.isTrackPending_ = false;
                if (this.isDisposed_) {
                  // disposed during last run. Clean up everything that was bound after the dispose call.
                  clearObserving(this);
                }
                if (isCaughtException(result)) {
                  this.reportExceptionInDerivation_(result.cause);
                }
                if (process.env.NODE_ENV !== "production" && notify) {
                  spyReportEnd({
                    time: Date.now() - startTime
                  });
                }
                endBatch();
              };
              _proto.reportExceptionInDerivation_ = function reportExceptionInDerivation_(error) {
                var _this = this;
                if (this.errorHandler_) {
                  this.errorHandler_(error, this);
                  return;
                }
                if (globalState.disableErrorBoundaries) {
                  throw error;
                }
                var message = process.env.NODE_ENV !== "production" ? "[mobx] Encountered an uncaught exception that was thrown by a reaction or observer component, in: '" + this + "'" : "[mobx] uncaught error in '" + this + "'";
                if (!globalState.suppressReactionErrors) {
                  console.error(message, error);
                  /** If debugging brought you here, please, read the above message :-). Tnx! */
                } else if (process.env.NODE_ENV !== "production") {
                  console.warn("[mobx] (error in reaction '" + this.name_ + "' suppressed, fix error of causing action below)");
                } // prettier-ignore
                if (process.env.NODE_ENV !== "production" && isSpyEnabled()) {
                  spyReport({
                    type: "error",
                    name: this.name_,
                    message: message,
                    error: "" + error
                  });
                }
                globalState.globalReactionErrorHandlers.forEach(function (f) {
                  return f(error, _this);
                });
              };
              _proto.dispose = function dispose() {
                if (!this.isDisposed_) {
                  this.isDisposed_ = true;
                  if (!this.isRunning_) {
                    // if disposed while running, clean up later. Maybe not optimal, but rare case
                    startBatch();
                    clearObserving(this);
                    endBatch();
                  }
                }
              };
              _proto.getDisposer_ = function getDisposer_() {
                var r = this.dispose.bind(this);
                r[$mobx] = this;
                return r;
              };
              _proto.toString = function toString() {
                return "Reaction[" + this.name_ + "]";
              };
              _proto.trace = function trace$1(enterBreakPoint) {
                if (enterBreakPoint === void 0) {
                  enterBreakPoint = false;
                }
                trace(this, enterBreakPoint);
              };
              return Reaction;
            }();
            /**
             * Magic number alert!
             * Defines within how many times a reaction is allowed to re-trigger itself
             * until it is assumed that this is gonna be a never ending loop...
             */
            var MAX_REACTION_ITERATIONS = 100;
            var reactionScheduler = function reactionScheduler(f) {
              return f();
            };
            function runReactions() {
              // Trampolining, if runReactions are already running, new reactions will be picked up
              if (globalState.inBatch > 0 || globalState.isRunningReactions) {
                return;
              }
              reactionScheduler(runReactionsHelper);
            }
            function runReactionsHelper() {
              globalState.isRunningReactions = true;
              var allReactions = globalState.pendingReactions;
              var iterations = 0;
              // While running reactions, new reactions might be triggered.
              // Hence we work with two variables and check whether
              // we converge to no remaining reactions after a while.
              while (allReactions.length > 0) {
                if (++iterations === MAX_REACTION_ITERATIONS) {
                  console.error(process.env.NODE_ENV !== "production" ? "Reaction doesn't converge to a stable state after " + MAX_REACTION_ITERATIONS + " iterations." + (" Probably there is a cycle in the reactive function: " + allReactions[0]) : "[mobx] cycle in reaction: " + allReactions[0]);
                  allReactions.splice(0); // clear reactions
                }

                var remainingReactions = allReactions.splice(0);
                for (var i = 0, l = remainingReactions.length; i < l; i++) {
                  remainingReactions[i].runReaction_();
                }
              }
              globalState.isRunningReactions = false;
            }
            var isReaction = /*#__PURE__*/createInstanceofPredicate("Reaction", Reaction);

            function isSpyEnabled() {
              return process.env.NODE_ENV !== "production" && !!globalState.spyListeners.length;
            }
            function spyReport(event) {
              if (!(process.env.NODE_ENV !== "production")) {
                return;
              } // dead code elimination can do the rest
              if (!globalState.spyListeners.length) {
                return;
              }
              var listeners = globalState.spyListeners;
              for (var i = 0, l = listeners.length; i < l; i++) {
                listeners[i](event);
              }
            }
            function spyReportStart(event) {
              if (!(process.env.NODE_ENV !== "production")) {
                return;
              }
              var change = _extends({}, event, {
                spyReportStart: true
              });
              spyReport(change);
            }
            var END_EVENT = {
              type: "report-end",
              spyReportEnd: true
            };
            function spyReportEnd(change) {
              if (!(process.env.NODE_ENV !== "production")) {
                return;
              }
              if (change) {
                spyReport(_extends({}, change, {
                  type: "report-end",
                  spyReportEnd: true
                }));
              } else {
                spyReport(END_EVENT);
              }
            }
            function spy(listener) {
              if (!(process.env.NODE_ENV !== "production")) {
                console.warn("[mobx.spy] Is a no-op in production builds");
                return function () {};
              } else {
                globalState.spyListeners.push(listener);
                return once(function () {
                  globalState.spyListeners = globalState.spyListeners.filter(function (l) {
                    return l !== listener;
                  });
                });
              }
            }

            var ACTION = "action";
            var ACTION_BOUND = "action.bound";
            var AUTOACTION = "autoAction";
            var AUTOACTION_BOUND = "autoAction.bound";
            var DEFAULT_ACTION_NAME = "<unnamed action>";
            var actionAnnotation = /*#__PURE__*/createActionAnnotation(ACTION);
            var actionBoundAnnotation = /*#__PURE__*/createActionAnnotation(ACTION_BOUND, {
              bound: true
            });
            var autoActionAnnotation = /*#__PURE__*/createActionAnnotation(AUTOACTION, {
              autoAction: true
            });
            var autoActionBoundAnnotation = /*#__PURE__*/createActionAnnotation(AUTOACTION_BOUND, {
              autoAction: true,
              bound: true
            });
            function createActionFactory(autoAction) {
              var res = function action(arg1, arg2) {
                // action(fn() {})
                if (isFunction(arg1)) {
                  return createAction(arg1.name || DEFAULT_ACTION_NAME, arg1, autoAction);
                }
                // action("name", fn() {})
                if (isFunction(arg2)) {
                  return createAction(arg1, arg2, autoAction);
                }
                // @action
                if (isStringish(arg2)) {
                  return storeAnnotation(arg1, arg2, autoAction ? autoActionAnnotation : actionAnnotation);
                }
                // action("name") & @action("name")
                if (isStringish(arg1)) {
                  return createDecoratorAnnotation(createActionAnnotation(autoAction ? AUTOACTION : ACTION, {
                    name: arg1,
                    autoAction: autoAction
                  }));
                }
                if (process.env.NODE_ENV !== "production") {
                  die("Invalid arguments for `action`");
                }
              };
              return res;
            }
            var action = /*#__PURE__*/createActionFactory(false);
            Object.assign(action, actionAnnotation);
            var autoAction = /*#__PURE__*/createActionFactory(true);
            Object.assign(autoAction, autoActionAnnotation);
            action.bound = /*#__PURE__*/createDecoratorAnnotation(actionBoundAnnotation);
            autoAction.bound = /*#__PURE__*/createDecoratorAnnotation(autoActionBoundAnnotation);
            function runInAction(fn) {
              return executeAction(fn.name || DEFAULT_ACTION_NAME, false, fn, this, undefined);
            }
            function isAction(thing) {
              return isFunction(thing) && thing.isMobxAction === true;
            }

            /**
             * Creates a named reactive view and keeps it alive, so that the view is always
             * updated if one of the dependencies changes, even when the view is not further used by something else.
             * @param view The reactive view
             * @returns disposer function, which can be used to stop the view from being updated in the future.
             */
            function autorun(view, opts) {
              var _opts$name, _opts;
              if (opts === void 0) {
                opts = EMPTY_OBJECT;
              }
              if (process.env.NODE_ENV !== "production") {
                if (!isFunction(view)) {
                  die("Autorun expects a function as first argument");
                }
                if (isAction(view)) {
                  die("Autorun does not accept actions since actions are untrackable");
                }
              }
              var name = (_opts$name = (_opts = opts) == null ? void 0 : _opts.name) != null ? _opts$name : process.env.NODE_ENV !== "production" ? view.name || "Autorun@" + getNextId() : "Autorun";
              var runSync = !opts.scheduler && !opts.delay;
              var reaction;
              if (runSync) {
                // normal autorun
                reaction = new Reaction(name, function () {
                  this.track(reactionRunner);
                }, opts.onError, opts.requiresObservable);
              } else {
                var scheduler = createSchedulerFromOptions(opts);
                // debounced autorun
                var isScheduled = false;
                reaction = new Reaction(name, function () {
                  if (!isScheduled) {
                    isScheduled = true;
                    scheduler(function () {
                      isScheduled = false;
                      if (!reaction.isDisposed_) {
                        reaction.track(reactionRunner);
                      }
                    });
                  }
                }, opts.onError, opts.requiresObservable);
              }
              function reactionRunner() {
                view(reaction);
              }
              reaction.schedule_();
              return reaction.getDisposer_();
            }
            var run = function run(f) {
              return f();
            };
            function createSchedulerFromOptions(opts) {
              return opts.scheduler ? opts.scheduler : opts.delay ? function (f) {
                return setTimeout(f, opts.delay);
              } : run;
            }

            var ON_BECOME_OBSERVED = "onBO";
            var ON_BECOME_UNOBSERVED = "onBUO";
            function onBecomeObserved(thing, arg2, arg3) {
              return interceptHook(ON_BECOME_OBSERVED, thing, arg2, arg3);
            }
            function onBecomeUnobserved(thing, arg2, arg3) {
              return interceptHook(ON_BECOME_UNOBSERVED, thing, arg2, arg3);
            }
            function interceptHook(hook, thing, arg2, arg3) {
              var atom = typeof arg3 === "function" ? getAtom(thing, arg2) : getAtom(thing);
              var cb = isFunction(arg3) ? arg3 : arg2;
              var listenersKey = hook + "L";
              if (atom[listenersKey]) {
                atom[listenersKey].add(cb);
              } else {
                atom[listenersKey] = new Set([cb]);
              }
              return function () {
                var hookListeners = atom[listenersKey];
                if (hookListeners) {
                  hookListeners["delete"](cb);
                  if (hookListeners.size === 0) {
                    delete atom[listenersKey];
                  }
                }
              };
            }

            function extendObservable(target, properties, annotations, options) {
              if (process.env.NODE_ENV !== "production") {
                if (arguments.length > 4) {
                  die("'extendObservable' expected 2-4 arguments");
                }
                if (typeof target !== "object") {
                  die("'extendObservable' expects an object as first argument");
                }
                if (isObservableMap(target)) {
                  die("'extendObservable' should not be used on maps, use map.merge instead");
                }
                if (!isPlainObject(properties)) {
                  die("'extendObservable' only accepts plain objects as second argument");
                }
                if (isObservable(properties) || isObservable(annotations)) {
                  die("Extending an object with another observable (object) is not supported");
                }
              }
              // Pull descriptors first, so we don't have to deal with props added by administration ($mobx)
              var descriptors = getOwnPropertyDescriptors(properties);
              var adm = asObservableObject(target, options)[$mobx];
              startBatch();
              try {
                ownKeys(descriptors).forEach(function (key) {
                  adm.extend_(key, descriptors[key],
                  // must pass "undefined" for { key: undefined }
                  !annotations ? true : key in annotations ? annotations[key] : true);
                });
              } finally {
                endBatch();
              }
              return target;
            }

            function getDependencyTree(thing, property) {
              return nodeToDependencyTree(getAtom(thing, property));
            }
            function nodeToDependencyTree(node) {
              var result = {
                name: node.name_
              };
              if (node.observing_ && node.observing_.length > 0) {
                result.dependencies = unique(node.observing_).map(nodeToDependencyTree);
              }
              return result;
            }
            function unique(list) {
              return Array.from(new Set(list));
            }

            var generatorId = 0;
            function FlowCancellationError() {
              this.message = "FLOW_CANCELLED";
            }
            FlowCancellationError.prototype = /*#__PURE__*/Object.create(Error.prototype);
            var flowAnnotation = /*#__PURE__*/createFlowAnnotation("flow");
            var flowBoundAnnotation = /*#__PURE__*/createFlowAnnotation("flow.bound", {
              bound: true
            });
            var flow = /*#__PURE__*/Object.assign(function flow(arg1, arg2) {
              // @flow
              if (isStringish(arg2)) {
                return storeAnnotation(arg1, arg2, flowAnnotation);
              }
              // flow(fn)
              if (process.env.NODE_ENV !== "production" && arguments.length !== 1) {
                die("Flow expects single argument with generator function");
              }
              var generator = arg1;
              var name = generator.name || "<unnamed flow>";
              // Implementation based on https://github.com/tj/co/blob/master/index.js
              var res = function res() {
                var ctx = this;
                var args = arguments;
                var runId = ++generatorId;
                var gen = action(name + " - runid: " + runId + " - init", generator).apply(ctx, args);
                var rejector;
                var pendingPromise = undefined;
                var promise = new Promise(function (resolve, reject) {
                  var stepId = 0;
                  rejector = reject;
                  function onFulfilled(res) {
                    pendingPromise = undefined;
                    var ret;
                    try {
                      ret = action(name + " - runid: " + runId + " - yield " + stepId++, gen.next).call(gen, res);
                    } catch (e) {
                      return reject(e);
                    }
                    next(ret);
                  }
                  function onRejected(err) {
                    pendingPromise = undefined;
                    var ret;
                    try {
                      ret = action(name + " - runid: " + runId + " - yield " + stepId++, gen["throw"]).call(gen, err);
                    } catch (e) {
                      return reject(e);
                    }
                    next(ret);
                  }
                  function next(ret) {
                    if (isFunction(ret == null ? void 0 : ret.then)) {
                      // an async iterator
                      ret.then(next, reject);
                      return;
                    }
                    if (ret.done) {
                      return resolve(ret.value);
                    }
                    pendingPromise = Promise.resolve(ret.value);
                    return pendingPromise.then(onFulfilled, onRejected);
                  }
                  onFulfilled(undefined); // kick off the process
                });

                promise.cancel = action(name + " - runid: " + runId + " - cancel", function () {
                  try {
                    if (pendingPromise) {
                      cancelPromise(pendingPromise);
                    }
                    // Finally block can return (or yield) stuff..
                    var _res = gen["return"](undefined);
                    // eat anything that promise would do, it's cancelled!
                    var yieldedPromise = Promise.resolve(_res.value);
                    yieldedPromise.then(noop, noop);
                    cancelPromise(yieldedPromise); // maybe it can be cancelled :)
                    // reject our original promise
                    rejector(new FlowCancellationError());
                  } catch (e) {
                    rejector(e); // there could be a throwing finally block
                  }
                });

                return promise;
              };
              res.isMobXFlow = true;
              return res;
            }, flowAnnotation);
            flow.bound = /*#__PURE__*/createDecoratorAnnotation(flowBoundAnnotation);
            function cancelPromise(promise) {
              if (isFunction(promise.cancel)) {
                promise.cancel();
              }
            }

            function isFlow(fn) {
              return (fn == null ? void 0 : fn.isMobXFlow) === true;
            }

            function _isObservable(value, property) {
              if (!value) {
                return false;
              }
              if (property !== undefined) {
                if (process.env.NODE_ENV !== "production" && (isObservableMap(value) || isObservableArray(value))) {
                  return die("isObservable(object, propertyName) is not supported for arrays and maps. Use map.has or array.length instead.");
                }
                if (isObservableObject(value)) {
                  return value[$mobx].values_.has(property);
                }
                return false;
              }
              // For first check, see #701
              return isObservableObject(value) || !!value[$mobx] || isAtom(value) || isReaction(value) || isComputedValue(value);
            }
            function isObservable(value) {
              if (process.env.NODE_ENV !== "production" && arguments.length !== 1) {
                die("isObservable expects only 1 argument. Use isObservableProp to inspect the observability of a property");
              }
              return _isObservable(value);
            }
            function apiOwnKeys(obj) {
              if (isObservableObject(obj)) {
                return obj[$mobx].ownKeys_();
              }
              die(38);
            }

            function cache(map, key, value) {
              map.set(key, value);
              return value;
            }
            function toJSHelper(source, __alreadySeen) {
              if (source == null || typeof source !== "object" || source instanceof Date || !isObservable(source)) {
                return source;
              }
              if (isObservableValue(source) || isComputedValue(source)) {
                return toJSHelper(source.get(), __alreadySeen);
              }
              if (__alreadySeen.has(source)) {
                return __alreadySeen.get(source);
              }
              if (isObservableArray(source)) {
                var res = cache(__alreadySeen, source, new Array(source.length));
                source.forEach(function (value, idx) {
                  res[idx] = toJSHelper(value, __alreadySeen);
                });
                return res;
              }
              if (isObservableSet(source)) {
                var _res = cache(__alreadySeen, source, new Set());
                source.forEach(function (value) {
                  _res.add(toJSHelper(value, __alreadySeen));
                });
                return _res;
              }
              if (isObservableMap(source)) {
                var _res2 = cache(__alreadySeen, source, new Map());
                source.forEach(function (value, key) {
                  _res2.set(key, toJSHelper(value, __alreadySeen));
                });
                return _res2;
              } else {
                // must be observable object
                var _res3 = cache(__alreadySeen, source, {});
                apiOwnKeys(source).forEach(function (key) {
                  if (objectPrototype.propertyIsEnumerable.call(source, key)) {
                    _res3[key] = toJSHelper(source[key], __alreadySeen);
                  }
                });
                return _res3;
              }
            }
            /**
             * Recursively converts an observable to it's non-observable native counterpart.
             * It does NOT recurse into non-observables, these are left as they are, even if they contain observables.
             * Computed and other non-enumerable properties are completely ignored.
             * Complex scenarios require custom solution, eg implementing `toJSON` or using `serializr` lib.
             */
            function toJS(source, options) {
              if (process.env.NODE_ENV !== "production" && options) {
                die("toJS no longer supports options");
              }
              return toJSHelper(source, new Map());
            }

            function trace() {
              if (!(process.env.NODE_ENV !== "production")) {
                die("trace() is not available in production builds");
              }
              var enterBreakPoint = false;
              for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
              }
              if (typeof args[args.length - 1] === "boolean") {
                enterBreakPoint = args.pop();
              }
              var derivation = getAtomFromArgs(args);
              if (!derivation) {
                return die("'trace(break?)' can only be used inside a tracked computed value or a Reaction. Consider passing in the computed value or reaction explicitly");
              }
              if (derivation.isTracing_ === TraceMode.NONE) {
                console.log("[mobx.trace] '" + derivation.name_ + "' tracing enabled");
              }
              derivation.isTracing_ = enterBreakPoint ? TraceMode.BREAK : TraceMode.LOG;
            }
            function getAtomFromArgs(args) {
              switch (args.length) {
                case 0:
                  return globalState.trackingDerivation;
                case 1:
                  return getAtom(args[0]);
                case 2:
                  return getAtom(args[0], args[1]);
              }
            }

            /**
             * During a transaction no views are updated until the end of the transaction.
             * The transaction will be run synchronously nonetheless.
             *
             * @param action a function that updates some reactive state
             * @returns any value that was returned by the 'action' parameter.
             */
            function transaction(action, thisArg) {
              if (thisArg === void 0) {
                thisArg = undefined;
              }
              startBatch();
              try {
                return action.apply(thisArg);
              } finally {
                endBatch();
              }
            }

            function getAdm(target) {
              return target[$mobx];
            }
            // Optimization: we don't need the intermediate objects and could have a completely custom administration for DynamicObjects,
            // and skip either the internal values map, or the base object with its property descriptors!
            var objectProxyTraps = {
              has: function has(target, name) {
                if (process.env.NODE_ENV !== "production" && globalState.trackingDerivation) {
                  warnAboutProxyRequirement("detect new properties using the 'in' operator. Use 'has' from 'mobx' instead.");
                }
                return getAdm(target).has_(name);
              },
              get: function get(target, name) {
                return getAdm(target).get_(name);
              },
              set: function set(target, name, value) {
                var _getAdm$set_;
                if (!isStringish(name)) {
                  return false;
                }
                if (process.env.NODE_ENV !== "production" && !getAdm(target).values_.has(name)) {
                  warnAboutProxyRequirement("add a new observable property through direct assignment. Use 'set' from 'mobx' instead.");
                }
                // null (intercepted) -> true (success)
                return (_getAdm$set_ = getAdm(target).set_(name, value, true)) != null ? _getAdm$set_ : true;
              },
              deleteProperty: function deleteProperty(target, name) {
                var _getAdm$delete_;
                if (process.env.NODE_ENV !== "production") {
                  warnAboutProxyRequirement("delete properties from an observable object. Use 'remove' from 'mobx' instead.");
                }
                if (!isStringish(name)) {
                  return false;
                }
                // null (intercepted) -> true (success)
                return (_getAdm$delete_ = getAdm(target).delete_(name, true)) != null ? _getAdm$delete_ : true;
              },
              defineProperty: function defineProperty(target, name, descriptor) {
                var _getAdm$definePropert;
                if (process.env.NODE_ENV !== "production") {
                  warnAboutProxyRequirement("define property on an observable object. Use 'defineProperty' from 'mobx' instead.");
                }
                // null (intercepted) -> true (success)
                return (_getAdm$definePropert = getAdm(target).defineProperty_(name, descriptor)) != null ? _getAdm$definePropert : true;
              },
              ownKeys: function ownKeys(target) {
                if (process.env.NODE_ENV !== "production" && globalState.trackingDerivation) {
                  warnAboutProxyRequirement("iterate keys to detect added / removed properties. Use 'keys' from 'mobx' instead.");
                }
                return getAdm(target).ownKeys_();
              },
              preventExtensions: function preventExtensions(target) {
                die(13);
              }
            };
            function asDynamicObservableObject(target, options) {
              var _target$$mobx, _target$$mobx$proxy_;
              assertProxies();
              target = asObservableObject(target, options);
              return (_target$$mobx$proxy_ = (_target$$mobx = target[$mobx]).proxy_) != null ? _target$$mobx$proxy_ : _target$$mobx.proxy_ = new Proxy(target, objectProxyTraps);
            }

            function hasInterceptors(interceptable) {
              return interceptable.interceptors_ !== undefined && interceptable.interceptors_.length > 0;
            }
            function registerInterceptor(interceptable, handler) {
              var interceptors = interceptable.interceptors_ || (interceptable.interceptors_ = []);
              interceptors.push(handler);
              return once(function () {
                var idx = interceptors.indexOf(handler);
                if (idx !== -1) {
                  interceptors.splice(idx, 1);
                }
              });
            }
            function interceptChange(interceptable, change) {
              var prevU = untrackedStart();
              try {
                // Interceptor can modify the array, copy it to avoid concurrent modification, see #1950
                var interceptors = [].concat(interceptable.interceptors_ || []);
                for (var i = 0, l = interceptors.length; i < l; i++) {
                  change = interceptors[i](change);
                  if (change && !change.type) {
                    die(14);
                  }
                  if (!change) {
                    break;
                  }
                }
                return change;
              } finally {
                untrackedEnd(prevU);
              }
            }

            function hasListeners(listenable) {
              return listenable.changeListeners_ !== undefined && listenable.changeListeners_.length > 0;
            }
            function registerListener(listenable, handler) {
              var listeners = listenable.changeListeners_ || (listenable.changeListeners_ = []);
              listeners.push(handler);
              return once(function () {
                var idx = listeners.indexOf(handler);
                if (idx !== -1) {
                  listeners.splice(idx, 1);
                }
              });
            }
            function notifyListeners(listenable, change) {
              var prevU = untrackedStart();
              var listeners = listenable.changeListeners_;
              if (!listeners) {
                return;
              }
              listeners = listeners.slice();
              for (var i = 0, l = listeners.length; i < l; i++) {
                listeners[i](change);
              }
              untrackedEnd(prevU);
            }
            // proto[keysSymbol] = new Set<PropertyKey>()
            var keysSymbol = /*#__PURE__*/Symbol("mobx-keys");
            function makeAutoObservable(target, overrides, options) {
              if (process.env.NODE_ENV !== "production") {
                if (!isPlainObject(target) && !isPlainObject(Object.getPrototypeOf(target))) {
                  die("'makeAutoObservable' can only be used for classes that don't have a superclass");
                }
                if (isObservableObject(target)) {
                  die("makeAutoObservable can only be used on objects not already made observable");
                }
              }
              // Optimization: avoid visiting protos
              // Assumes that annotation.make_/.extend_ works the same for plain objects
              if (isPlainObject(target)) {
                return extendObservable(target, target, overrides, options);
              }
              var adm = asObservableObject(target, options)[$mobx];
              // Optimization: cache keys on proto
              // Assumes makeAutoObservable can be called only once per object and can't be used in subclass
              if (!target[keysSymbol]) {
                var proto = Object.getPrototypeOf(target);
                var keys = new Set([].concat(ownKeys(target), ownKeys(proto)));
                keys["delete"]("constructor");
                keys["delete"]($mobx);
                addHiddenProp(proto, keysSymbol, keys);
              }
              startBatch();
              try {
                target[keysSymbol].forEach(function (key) {
                  return adm.make_(key,
                  // must pass "undefined" for { key: undefined }
                  !overrides ? true : key in overrides ? overrides[key] : true);
                });
              } finally {
                endBatch();
              }
              return target;
            }

            var SPLICE = "splice";
            var UPDATE = "update";
            var MAX_SPLICE_SIZE = 10000; // See e.g. https://github.com/mobxjs/mobx/issues/859
            var arrayTraps = {
              get: function get(target, name) {
                var adm = target[$mobx];
                if (name === $mobx) {
                  return adm;
                }
                if (name === "length") {
                  return adm.getArrayLength_();
                }
                if (typeof name === "string" && !isNaN(name)) {
                  return adm.get_(parseInt(name));
                }
                if (hasProp(arrayExtensions, name)) {
                  return arrayExtensions[name];
                }
                return target[name];
              },
              set: function set(target, name, value) {
                var adm = target[$mobx];
                if (name === "length") {
                  adm.setArrayLength_(value);
                }
                if (typeof name === "symbol" || isNaN(name)) {
                  target[name] = value;
                } else {
                  // numeric string
                  adm.set_(parseInt(name), value);
                }
                return true;
              },
              preventExtensions: function preventExtensions() {
                die(15);
              }
            };
            var ObservableArrayAdministration = /*#__PURE__*/function () {
              // this is the prop that gets proxied, so can't replace it!

              function ObservableArrayAdministration(name, enhancer, owned_, legacyMode_) {
                if (name === void 0) {
                  name = process.env.NODE_ENV !== "production" ? "ObservableArray@" + getNextId() : "ObservableArray";
                }
                this.owned_ = void 0;
                this.legacyMode_ = void 0;
                this.atom_ = void 0;
                this.values_ = [];
                this.interceptors_ = void 0;
                this.changeListeners_ = void 0;
                this.enhancer_ = void 0;
                this.dehancer = void 0;
                this.proxy_ = void 0;
                this.lastKnownLength_ = 0;
                this.owned_ = owned_;
                this.legacyMode_ = legacyMode_;
                this.atom_ = new Atom(name);
                this.enhancer_ = function (newV, oldV) {
                  return enhancer(newV, oldV, process.env.NODE_ENV !== "production" ? name + "[..]" : "ObservableArray[..]");
                };
              }
              var _proto = ObservableArrayAdministration.prototype;
              _proto.dehanceValue_ = function dehanceValue_(value) {
                if (this.dehancer !== undefined) {
                  return this.dehancer(value);
                }
                return value;
              };
              _proto.dehanceValues_ = function dehanceValues_(values) {
                if (this.dehancer !== undefined && values.length > 0) {
                  return values.map(this.dehancer);
                }
                return values;
              };
              _proto.intercept_ = function intercept_(handler) {
                return registerInterceptor(this, handler);
              };
              _proto.observe_ = function observe_(listener, fireImmediately) {
                if (fireImmediately === void 0) {
                  fireImmediately = false;
                }
                if (fireImmediately) {
                  listener({
                    observableKind: "array",
                    object: this.proxy_,
                    debugObjectName: this.atom_.name_,
                    type: "splice",
                    index: 0,
                    added: this.values_.slice(),
                    addedCount: this.values_.length,
                    removed: [],
                    removedCount: 0
                  });
                }
                return registerListener(this, listener);
              };
              _proto.getArrayLength_ = function getArrayLength_() {
                this.atom_.reportObserved();
                return this.values_.length;
              };
              _proto.setArrayLength_ = function setArrayLength_(newLength) {
                if (typeof newLength !== "number" || isNaN(newLength) || newLength < 0) {
                  die("Out of range: " + newLength);
                }
                var currentLength = this.values_.length;
                if (newLength === currentLength) {
                  return;
                } else if (newLength > currentLength) {
                  var newItems = new Array(newLength - currentLength);
                  for (var i = 0; i < newLength - currentLength; i++) {
                    newItems[i] = undefined;
                  } // No Array.fill everywhere...
                  this.spliceWithArray_(currentLength, 0, newItems);
                } else {
                  this.spliceWithArray_(newLength, currentLength - newLength);
                }
              };
              _proto.updateArrayLength_ = function updateArrayLength_(oldLength, delta) {
                if (oldLength !== this.lastKnownLength_) {
                  die(16);
                }
                this.lastKnownLength_ += delta;
                if (this.legacyMode_ && delta > 0) {
                  reserveArrayBuffer(oldLength + delta + 1);
                }
              };
              _proto.spliceWithArray_ = function spliceWithArray_(index, deleteCount, newItems) {
                var _this = this;
                checkIfStateModificationsAreAllowed(this.atom_);
                var length = this.values_.length;
                if (index === undefined) {
                  index = 0;
                } else if (index > length) {
                  index = length;
                } else if (index < 0) {
                  index = Math.max(0, length + index);
                }
                if (arguments.length === 1) {
                  deleteCount = length - index;
                } else if (deleteCount === undefined || deleteCount === null) {
                  deleteCount = 0;
                } else {
                  deleteCount = Math.max(0, Math.min(deleteCount, length - index));
                }
                if (newItems === undefined) {
                  newItems = EMPTY_ARRAY;
                }
                if (hasInterceptors(this)) {
                  var change = interceptChange(this, {
                    object: this.proxy_,
                    type: SPLICE,
                    index: index,
                    removedCount: deleteCount,
                    added: newItems
                  });
                  if (!change) {
                    return EMPTY_ARRAY;
                  }
                  deleteCount = change.removedCount;
                  newItems = change.added;
                }
                newItems = newItems.length === 0 ? newItems : newItems.map(function (v) {
                  return _this.enhancer_(v, undefined);
                });
                if (this.legacyMode_ || process.env.NODE_ENV !== "production") {
                  var lengthDelta = newItems.length - deleteCount;
                  this.updateArrayLength_(length, lengthDelta); // checks if internal array wasn't modified
                }

                var res = this.spliceItemsIntoValues_(index, deleteCount, newItems);
                if (deleteCount !== 0 || newItems.length !== 0) {
                  this.notifyArraySplice_(index, newItems, res);
                }
                return this.dehanceValues_(res);
              };
              _proto.spliceItemsIntoValues_ = function spliceItemsIntoValues_(index, deleteCount, newItems) {
                if (newItems.length < MAX_SPLICE_SIZE) {
                  var _this$values_;
                  return (_this$values_ = this.values_).splice.apply(_this$values_, [index, deleteCount].concat(newItems));
                } else {
                  // The items removed by the splice
                  var res = this.values_.slice(index, index + deleteCount);
                  // The items that that should remain at the end of the array
                  var oldItems = this.values_.slice(index + deleteCount);
                  // New length is the previous length + addition count - deletion count
                  this.values_.length += newItems.length - deleteCount;
                  for (var i = 0; i < newItems.length; i++) {
                    this.values_[index + i] = newItems[i];
                  }
                  for (var _i = 0; _i < oldItems.length; _i++) {
                    this.values_[index + newItems.length + _i] = oldItems[_i];
                  }
                  return res;
                }
              };
              _proto.notifyArrayChildUpdate_ = function notifyArrayChildUpdate_(index, newValue, oldValue) {
                var notifySpy = !this.owned_ && isSpyEnabled();
                var notify = hasListeners(this);
                var change = notify || notifySpy ? {
                  observableKind: "array",
                  object: this.proxy_,
                  type: UPDATE,
                  debugObjectName: this.atom_.name_,
                  index: index,
                  newValue: newValue,
                  oldValue: oldValue
                } : null;
                // The reason why this is on right hand side here (and not above), is this way the uglifier will drop it, but it won't
                // cause any runtime overhead in development mode without NODE_ENV set, unless spying is enabled
                if (process.env.NODE_ENV !== "production" && notifySpy) {
                  spyReportStart(change);
                }
                this.atom_.reportChanged();
                if (notify) {
                  notifyListeners(this, change);
                }
                if (process.env.NODE_ENV !== "production" && notifySpy) {
                  spyReportEnd();
                }
              };
              _proto.notifyArraySplice_ = function notifyArraySplice_(index, added, removed) {
                var notifySpy = !this.owned_ && isSpyEnabled();
                var notify = hasListeners(this);
                var change = notify || notifySpy ? {
                  observableKind: "array",
                  object: this.proxy_,
                  debugObjectName: this.atom_.name_,
                  type: SPLICE,
                  index: index,
                  removed: removed,
                  added: added,
                  removedCount: removed.length,
                  addedCount: added.length
                } : null;
                if (process.env.NODE_ENV !== "production" && notifySpy) {
                  spyReportStart(change);
                }
                this.atom_.reportChanged();
                // conform: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/observe
                if (notify) {
                  notifyListeners(this, change);
                }
                if (process.env.NODE_ENV !== "production" && notifySpy) {
                  spyReportEnd();
                }
              };
              _proto.get_ = function get_(index) {
                if (this.legacyMode_ && index >= this.values_.length) {
                  console.warn(process.env.NODE_ENV !== "production" ? "[mobx.array] Attempt to read an array index (" + index + ") that is out of bounds (" + this.values_.length + "). Please check length first. Out of bound indices will not be tracked by MobX" : "[mobx] Out of bounds read: " + index);
                  return undefined;
                }
                this.atom_.reportObserved();
                return this.dehanceValue_(this.values_[index]);
              };
              _proto.set_ = function set_(index, newValue) {
                var values = this.values_;
                if (this.legacyMode_ && index > values.length) {
                  // out of bounds
                  die(17, index, values.length);
                }
                if (index < values.length) {
                  // update at index in range
                  checkIfStateModificationsAreAllowed(this.atom_);
                  var oldValue = values[index];
                  if (hasInterceptors(this)) {
                    var change = interceptChange(this, {
                      type: UPDATE,
                      object: this.proxy_,
                      index: index,
                      newValue: newValue
                    });
                    if (!change) {
                      return;
                    }
                    newValue = change.newValue;
                  }
                  newValue = this.enhancer_(newValue, oldValue);
                  var changed = newValue !== oldValue;
                  if (changed) {
                    values[index] = newValue;
                    this.notifyArrayChildUpdate_(index, newValue, oldValue);
                  }
                } else {
                  // For out of bound index, we don't create an actual sparse array,
                  // but rather fill the holes with undefined (same as setArrayLength_).
                  // This could be considered a bug.
                  var newItems = new Array(index + 1 - values.length);
                  for (var i = 0; i < newItems.length - 1; i++) {
                    newItems[i] = undefined;
                  } // No Array.fill everywhere...
                  newItems[newItems.length - 1] = newValue;
                  this.spliceWithArray_(values.length, 0, newItems);
                }
              };
              return ObservableArrayAdministration;
            }();
            function createObservableArray(initialValues, enhancer, name, owned) {
              if (name === void 0) {
                name = process.env.NODE_ENV !== "production" ? "ObservableArray@" + getNextId() : "ObservableArray";
              }
              if (owned === void 0) {
                owned = false;
              }
              assertProxies();
              var adm = new ObservableArrayAdministration(name, enhancer, owned, false);
              addHiddenFinalProp(adm.values_, $mobx, adm);
              var proxy = new Proxy(adm.values_, arrayTraps);
              adm.proxy_ = proxy;
              if (initialValues && initialValues.length) {
                var prev = allowStateChangesStart(true);
                adm.spliceWithArray_(0, 0, initialValues);
                allowStateChangesEnd(prev);
              }
              return proxy;
            }
            // eslint-disable-next-line
            var arrayExtensions = {
              clear: function clear() {
                return this.splice(0);
              },
              replace: function replace(newItems) {
                var adm = this[$mobx];
                return adm.spliceWithArray_(0, adm.values_.length, newItems);
              },
              // Used by JSON.stringify
              toJSON: function toJSON() {
                return this.slice();
              },
              /*
               * functions that do alter the internal structure of the array, (based on lib.es6.d.ts)
               * since these functions alter the inner structure of the array, the have side effects.
               * Because the have side effects, they should not be used in computed function,
               * and for that reason the do not call dependencyState.notifyObserved
               */
              splice: function splice(index, deleteCount) {
                for (var _len = arguments.length, newItems = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
                  newItems[_key - 2] = arguments[_key];
                }
                var adm = this[$mobx];
                switch (arguments.length) {
                  case 0:
                    return [];
                  case 1:
                    return adm.spliceWithArray_(index);
                  case 2:
                    return adm.spliceWithArray_(index, deleteCount);
                }
                return adm.spliceWithArray_(index, deleteCount, newItems);
              },
              spliceWithArray: function spliceWithArray(index, deleteCount, newItems) {
                return this[$mobx].spliceWithArray_(index, deleteCount, newItems);
              },
              push: function push() {
                var adm = this[$mobx];
                for (var _len2 = arguments.length, items = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                  items[_key2] = arguments[_key2];
                }
                adm.spliceWithArray_(adm.values_.length, 0, items);
                return adm.values_.length;
              },
              pop: function pop() {
                return this.splice(Math.max(this[$mobx].values_.length - 1, 0), 1)[0];
              },
              shift: function shift() {
                return this.splice(0, 1)[0];
              },
              unshift: function unshift() {
                var adm = this[$mobx];
                for (var _len3 = arguments.length, items = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                  items[_key3] = arguments[_key3];
                }
                adm.spliceWithArray_(0, 0, items);
                return adm.values_.length;
              },
              reverse: function reverse() {
                // reverse by default mutates in place before returning the result
                // which makes it both a 'derivation' and a 'mutation'.
                if (globalState.trackingDerivation) {
                  die(37, "reverse");
                }
                this.replace(this.slice().reverse());
                return this;
              },
              sort: function sort() {
                // sort by default mutates in place before returning the result
                // which goes against all good practices. Let's not change the array in place!
                if (globalState.trackingDerivation) {
                  die(37, "sort");
                }
                var copy = this.slice();
                copy.sort.apply(copy, arguments);
                this.replace(copy);
                return this;
              },
              remove: function remove(value) {
                var adm = this[$mobx];
                var idx = adm.dehanceValues_(adm.values_).indexOf(value);
                if (idx > -1) {
                  this.splice(idx, 1);
                  return true;
                }
                return false;
              }
            };
            /**
             * Wrap function from prototype
             * Without this, everything works as well, but this works
             * faster as everything works on unproxied values
             */
            addArrayExtension("concat", simpleFunc);
            addArrayExtension("flat", simpleFunc);
            addArrayExtension("includes", simpleFunc);
            addArrayExtension("indexOf", simpleFunc);
            addArrayExtension("join", simpleFunc);
            addArrayExtension("lastIndexOf", simpleFunc);
            addArrayExtension("slice", simpleFunc);
            addArrayExtension("toString", simpleFunc);
            addArrayExtension("toLocaleString", simpleFunc);
            // map
            addArrayExtension("every", mapLikeFunc);
            addArrayExtension("filter", mapLikeFunc);
            addArrayExtension("find", mapLikeFunc);
            addArrayExtension("findIndex", mapLikeFunc);
            addArrayExtension("flatMap", mapLikeFunc);
            addArrayExtension("forEach", mapLikeFunc);
            addArrayExtension("map", mapLikeFunc);
            addArrayExtension("some", mapLikeFunc);
            // reduce
            addArrayExtension("reduce", reduceLikeFunc);
            addArrayExtension("reduceRight", reduceLikeFunc);
            function addArrayExtension(funcName, funcFactory) {
              if (typeof Array.prototype[funcName] === "function") {
                arrayExtensions[funcName] = funcFactory(funcName);
              }
            }
            // Report and delegate to dehanced array
            function simpleFunc(funcName) {
              return function () {
                var adm = this[$mobx];
                adm.atom_.reportObserved();
                var dehancedValues = adm.dehanceValues_(adm.values_);
                return dehancedValues[funcName].apply(dehancedValues, arguments);
              };
            }
            // Make sure callbacks recieve correct array arg #2326
            function mapLikeFunc(funcName) {
              return function (callback, thisArg) {
                var _this2 = this;
                var adm = this[$mobx];
                adm.atom_.reportObserved();
                var dehancedValues = adm.dehanceValues_(adm.values_);
                return dehancedValues[funcName](function (element, index) {
                  return callback.call(thisArg, element, index, _this2);
                });
              };
            }
            // Make sure callbacks recieve correct array arg #2326
            function reduceLikeFunc(funcName) {
              return function () {
                var _this3 = this;
                var adm = this[$mobx];
                adm.atom_.reportObserved();
                var dehancedValues = adm.dehanceValues_(adm.values_);
                // #2432 - reduce behavior depends on arguments.length
                var callback = arguments[0];
                arguments[0] = function (accumulator, currentValue, index) {
                  return callback(accumulator, currentValue, index, _this3);
                };
                return dehancedValues[funcName].apply(dehancedValues, arguments);
              };
            }
            var isObservableArrayAdministration = /*#__PURE__*/createInstanceofPredicate("ObservableArrayAdministration", ObservableArrayAdministration);
            function isObservableArray(thing) {
              return isObject(thing) && isObservableArrayAdministration(thing[$mobx]);
            }

            var _Symbol$iterator, _Symbol$toStringTag;
            var ObservableMapMarker = {};
            var ADD = "add";
            var DELETE = "delete";
            // just extend Map? See also https://gist.github.com/nestharus/13b4d74f2ef4a2f4357dbd3fc23c1e54
            // But: https://github.com/mobxjs/mobx/issues/1556
            _Symbol$iterator = Symbol.iterator;
            _Symbol$toStringTag = Symbol.toStringTag;
            var ObservableMap = /*#__PURE__*/function () {
              // hasMap, not hashMap >-).

              function ObservableMap(initialData, enhancer_, name_) {
                var _this = this;
                if (enhancer_ === void 0) {
                  enhancer_ = deepEnhancer;
                }
                if (name_ === void 0) {
                  name_ = process.env.NODE_ENV !== "production" ? "ObservableMap@" + getNextId() : "ObservableMap";
                }
                this.enhancer_ = void 0;
                this.name_ = void 0;
                this[$mobx] = ObservableMapMarker;
                this.data_ = void 0;
                this.hasMap_ = void 0;
                this.keysAtom_ = void 0;
                this.interceptors_ = void 0;
                this.changeListeners_ = void 0;
                this.dehancer = void 0;
                this.enhancer_ = enhancer_;
                this.name_ = name_;
                if (!isFunction(Map)) {
                  die(18);
                }
                this.keysAtom_ = createAtom(process.env.NODE_ENV !== "production" ? this.name_ + ".keys()" : "ObservableMap.keys()");
                this.data_ = new Map();
                this.hasMap_ = new Map();
                allowStateChanges(true, function () {
                  _this.merge(initialData);
                });
              }
              var _proto = ObservableMap.prototype;
              _proto.has_ = function has_(key) {
                return this.data_.has(key);
              };
              _proto.has = function has(key) {
                var _this2 = this;
                if (!globalState.trackingDerivation) {
                  return this.has_(key);
                }
                var entry = this.hasMap_.get(key);
                if (!entry) {
                  var newEntry = entry = new ObservableValue(this.has_(key), referenceEnhancer, process.env.NODE_ENV !== "production" ? this.name_ + "." + stringifyKey(key) + "?" : "ObservableMap.key?", false);
                  this.hasMap_.set(key, newEntry);
                  onBecomeUnobserved(newEntry, function () {
                    return _this2.hasMap_["delete"](key);
                  });
                }
                return entry.get();
              };
              _proto.set = function set(key, value) {
                var hasKey = this.has_(key);
                if (hasInterceptors(this)) {
                  var change = interceptChange(this, {
                    type: hasKey ? UPDATE : ADD,
                    object: this,
                    newValue: value,
                    name: key
                  });
                  if (!change) {
                    return this;
                  }
                  value = change.newValue;
                }
                if (hasKey) {
                  this.updateValue_(key, value);
                } else {
                  this.addValue_(key, value);
                }
                return this;
              };
              _proto["delete"] = function _delete(key) {
                var _this3 = this;
                checkIfStateModificationsAreAllowed(this.keysAtom_);
                if (hasInterceptors(this)) {
                  var change = interceptChange(this, {
                    type: DELETE,
                    object: this,
                    name: key
                  });
                  if (!change) {
                    return false;
                  }
                }
                if (this.has_(key)) {
                  var notifySpy = isSpyEnabled();
                  var notify = hasListeners(this);
                  var _change = notify || notifySpy ? {
                    observableKind: "map",
                    debugObjectName: this.name_,
                    type: DELETE,
                    object: this,
                    oldValue: this.data_.get(key).value_,
                    name: key
                  } : null;
                  if (process.env.NODE_ENV !== "production" && notifySpy) {
                    spyReportStart(_change);
                  } // TODO fix type
                  transaction(function () {
                    var _this3$hasMap_$get;
                    _this3.keysAtom_.reportChanged();
                    (_this3$hasMap_$get = _this3.hasMap_.get(key)) == null ? void 0 : _this3$hasMap_$get.setNewValue_(false);
                    var observable = _this3.data_.get(key);
                    observable.setNewValue_(undefined);
                    _this3.data_["delete"](key);
                  });
                  if (notify) {
                    notifyListeners(this, _change);
                  }
                  if (process.env.NODE_ENV !== "production" && notifySpy) {
                    spyReportEnd();
                  }
                  return true;
                }
                return false;
              };
              _proto.updateValue_ = function updateValue_(key, newValue) {
                var observable = this.data_.get(key);
                newValue = observable.prepareNewValue_(newValue);
                if (newValue !== globalState.UNCHANGED) {
                  var notifySpy = isSpyEnabled();
                  var notify = hasListeners(this);
                  var change = notify || notifySpy ? {
                    observableKind: "map",
                    debugObjectName: this.name_,
                    type: UPDATE,
                    object: this,
                    oldValue: observable.value_,
                    name: key,
                    newValue: newValue
                  } : null;
                  if (process.env.NODE_ENV !== "production" && notifySpy) {
                    spyReportStart(change);
                  } // TODO fix type
                  observable.setNewValue_(newValue);
                  if (notify) {
                    notifyListeners(this, change);
                  }
                  if (process.env.NODE_ENV !== "production" && notifySpy) {
                    spyReportEnd();
                  }
                }
              };
              _proto.addValue_ = function addValue_(key, newValue) {
                var _this4 = this;
                checkIfStateModificationsAreAllowed(this.keysAtom_);
                transaction(function () {
                  var _this4$hasMap_$get;
                  var observable = new ObservableValue(newValue, _this4.enhancer_, process.env.NODE_ENV !== "production" ? _this4.name_ + "." + stringifyKey(key) : "ObservableMap.key", false);
                  _this4.data_.set(key, observable);
                  newValue = observable.value_; // value might have been changed
                  (_this4$hasMap_$get = _this4.hasMap_.get(key)) == null ? void 0 : _this4$hasMap_$get.setNewValue_(true);
                  _this4.keysAtom_.reportChanged();
                });
                var notifySpy = isSpyEnabled();
                var notify = hasListeners(this);
                var change = notify || notifySpy ? {
                  observableKind: "map",
                  debugObjectName: this.name_,
                  type: ADD,
                  object: this,
                  name: key,
                  newValue: newValue
                } : null;
                if (process.env.NODE_ENV !== "production" && notifySpy) {
                  spyReportStart(change);
                } // TODO fix type
                if (notify) {
                  notifyListeners(this, change);
                }
                if (process.env.NODE_ENV !== "production" && notifySpy) {
                  spyReportEnd();
                }
              };
              _proto.get = function get(key) {
                if (this.has(key)) {
                  return this.dehanceValue_(this.data_.get(key).get());
                }
                return this.dehanceValue_(undefined);
              };
              _proto.dehanceValue_ = function dehanceValue_(value) {
                if (this.dehancer !== undefined) {
                  return this.dehancer(value);
                }
                return value;
              };
              _proto.keys = function keys() {
                this.keysAtom_.reportObserved();
                return this.data_.keys();
              };
              _proto.values = function values() {
                var self = this;
                var keys = this.keys();
                return makeIterable({
                  next: function next() {
                    var _keys$next = keys.next(),
                      done = _keys$next.done,
                      value = _keys$next.value;
                    return {
                      done: done,
                      value: done ? undefined : self.get(value)
                    };
                  }
                });
              };
              _proto.entries = function entries() {
                var self = this;
                var keys = this.keys();
                return makeIterable({
                  next: function next() {
                    var _keys$next2 = keys.next(),
                      done = _keys$next2.done,
                      value = _keys$next2.value;
                    return {
                      done: done,
                      value: done ? undefined : [value, self.get(value)]
                    };
                  }
                });
              };
              _proto[_Symbol$iterator] = function () {
                return this.entries();
              };
              _proto.forEach = function forEach(callback, thisArg) {
                for (var _iterator = _createForOfIteratorHelperLoose(this), _step; !(_step = _iterator()).done;) {
                  var _step$value = _step.value,
                    key = _step$value[0],
                    value = _step$value[1];
                  callback.call(thisArg, value, key, this);
                }
              }
              /** Merge another object into this object, returns this. */;
              _proto.merge = function merge(other) {
                var _this5 = this;
                if (isObservableMap(other)) {
                  other = new Map(other);
                }
                transaction(function () {
                  if (isPlainObject(other)) {
                    getPlainObjectKeys(other).forEach(function (key) {
                      return _this5.set(key, other[key]);
                    });
                  } else if (Array.isArray(other)) {
                    other.forEach(function (_ref) {
                      var key = _ref[0],
                        value = _ref[1];
                      return _this5.set(key, value);
                    });
                  } else if (isES6Map(other)) {
                    if (other.constructor !== Map) {
                      die(19, other);
                    }
                    other.forEach(function (value, key) {
                      return _this5.set(key, value);
                    });
                  } else if (other !== null && other !== undefined) {
                    die(20, other);
                  }
                });
                return this;
              };
              _proto.clear = function clear() {
                var _this6 = this;
                transaction(function () {
                  untracked(function () {
                    for (var _iterator2 = _createForOfIteratorHelperLoose(_this6.keys()), _step2; !(_step2 = _iterator2()).done;) {
                      var key = _step2.value;
                      _this6["delete"](key);
                    }
                  });
                });
              };
              _proto.replace = function replace(values) {
                var _this7 = this;
                // Implementation requirements:
                // - respect ordering of replacement map
                // - allow interceptors to run and potentially prevent individual operations
                // - don't recreate observables that already exist in original map (so we don't destroy existing subscriptions)
                // - don't _keysAtom.reportChanged if the keys of resulting map are indentical (order matters!)
                // - note that result map may differ from replacement map due to the interceptors
                transaction(function () {
                  // Convert to map so we can do quick key lookups
                  var replacementMap = convertToMap(values);
                  var orderedData = new Map();
                  // Used for optimization
                  var keysReportChangedCalled = false;
                  // Delete keys that don't exist in replacement map
                  // if the key deletion is prevented by interceptor
                  // add entry at the beginning of the result map
                  for (var _iterator3 = _createForOfIteratorHelperLoose(_this7.data_.keys()), _step3; !(_step3 = _iterator3()).done;) {
                    var key = _step3.value;
                    // Concurrently iterating/deleting keys
                    // iterator should handle this correctly
                    if (!replacementMap.has(key)) {
                      var deleted = _this7["delete"](key);
                      // Was the key removed?
                      if (deleted) {
                        // _keysAtom.reportChanged() was already called
                        keysReportChangedCalled = true;
                      } else {
                        // Delete prevented by interceptor
                        var value = _this7.data_.get(key);
                        orderedData.set(key, value);
                      }
                    }
                  }
                  // Merge entries
                  for (var _iterator4 = _createForOfIteratorHelperLoose(replacementMap.entries()), _step4; !(_step4 = _iterator4()).done;) {
                    var _step4$value = _step4.value,
                      _key = _step4$value[0],
                      _value = _step4$value[1];
                    // We will want to know whether a new key is added
                    var keyExisted = _this7.data_.has(_key);
                    // Add or update value
                    _this7.set(_key, _value);
                    // The addition could have been prevent by interceptor
                    if (_this7.data_.has(_key)) {
                      // The update could have been prevented by interceptor
                      // and also we want to preserve existing values
                      // so use value from _data map (instead of replacement map)
                      var _value2 = _this7.data_.get(_key);
                      orderedData.set(_key, _value2);
                      // Was a new key added?
                      if (!keyExisted) {
                        // _keysAtom.reportChanged() was already called
                        keysReportChangedCalled = true;
                      }
                    }
                  }
                  // Check for possible key order change
                  if (!keysReportChangedCalled) {
                    if (_this7.data_.size !== orderedData.size) {
                      // If size differs, keys are definitely modified
                      _this7.keysAtom_.reportChanged();
                    } else {
                      var iter1 = _this7.data_.keys();
                      var iter2 = orderedData.keys();
                      var next1 = iter1.next();
                      var next2 = iter2.next();
                      while (!next1.done) {
                        if (next1.value !== next2.value) {
                          _this7.keysAtom_.reportChanged();
                          break;
                        }
                        next1 = iter1.next();
                        next2 = iter2.next();
                      }
                    }
                  }
                  // Use correctly ordered map
                  _this7.data_ = orderedData;
                });
                return this;
              };
              _proto.toString = function toString() {
                return "[object ObservableMap]";
              };
              _proto.toJSON = function toJSON() {
                return Array.from(this);
              };
              /**
               * Observes this object. Triggers for the events 'add', 'update' and 'delete'.
               * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/observe
               * for callback details
               */
              _proto.observe_ = function observe_(listener, fireImmediately) {
                if (process.env.NODE_ENV !== "production" && fireImmediately === true) {
                  die("`observe` doesn't support fireImmediately=true in combination with maps.");
                }
                return registerListener(this, listener);
              };
              _proto.intercept_ = function intercept_(handler) {
                return registerInterceptor(this, handler);
              };
              _createClass(ObservableMap, [{
                key: "size",
                get: function get() {
                  this.keysAtom_.reportObserved();
                  return this.data_.size;
                }
              }, {
                key: _Symbol$toStringTag,
                get: function get() {
                  return "Map";
                }
              }]);
              return ObservableMap;
            }();
            // eslint-disable-next-line
            var isObservableMap = /*#__PURE__*/createInstanceofPredicate("ObservableMap", ObservableMap);
            function convertToMap(dataStructure) {
              if (isES6Map(dataStructure) || isObservableMap(dataStructure)) {
                return dataStructure;
              } else if (Array.isArray(dataStructure)) {
                return new Map(dataStructure);
              } else if (isPlainObject(dataStructure)) {
                var map = new Map();
                for (var key in dataStructure) {
                  map.set(key, dataStructure[key]);
                }
                return map;
              } else {
                return die(21, dataStructure);
              }
            }

            var _Symbol$iterator$1, _Symbol$toStringTag$1;
            var ObservableSetMarker = {};
            _Symbol$iterator$1 = Symbol.iterator;
            _Symbol$toStringTag$1 = Symbol.toStringTag;
            var ObservableSet = /*#__PURE__*/function () {
              function ObservableSet(initialData, enhancer, name_) {
                if (enhancer === void 0) {
                  enhancer = deepEnhancer;
                }
                if (name_ === void 0) {
                  name_ = process.env.NODE_ENV !== "production" ? "ObservableSet@" + getNextId() : "ObservableSet";
                }
                this.name_ = void 0;
                this[$mobx] = ObservableSetMarker;
                this.data_ = new Set();
                this.atom_ = void 0;
                this.changeListeners_ = void 0;
                this.interceptors_ = void 0;
                this.dehancer = void 0;
                this.enhancer_ = void 0;
                this.name_ = name_;
                if (!isFunction(Set)) {
                  die(22);
                }
                this.atom_ = createAtom(this.name_);
                this.enhancer_ = function (newV, oldV) {
                  return enhancer(newV, oldV, name_);
                };
                if (initialData) {
                  this.replace(initialData);
                }
              }
              var _proto = ObservableSet.prototype;
              _proto.dehanceValue_ = function dehanceValue_(value) {
                if (this.dehancer !== undefined) {
                  return this.dehancer(value);
                }
                return value;
              };
              _proto.clear = function clear() {
                var _this = this;
                transaction(function () {
                  untracked(function () {
                    for (var _iterator = _createForOfIteratorHelperLoose(_this.data_.values()), _step; !(_step = _iterator()).done;) {
                      var value = _step.value;
                      _this["delete"](value);
                    }
                  });
                });
              };
              _proto.forEach = function forEach(callbackFn, thisArg) {
                for (var _iterator2 = _createForOfIteratorHelperLoose(this), _step2; !(_step2 = _iterator2()).done;) {
                  var value = _step2.value;
                  callbackFn.call(thisArg, value, value, this);
                }
              };
              _proto.add = function add(value) {
                var _this2 = this;
                checkIfStateModificationsAreAllowed(this.atom_);
                if (hasInterceptors(this)) {
                  var change = interceptChange(this, {
                    type: ADD,
                    object: this,
                    newValue: value
                  });
                  if (!change) {
                    return this;
                  }
                  // ideally, value = change.value would be done here, so that values can be
                  // changed by interceptor. Same applies for other Set and Map api's.
                }

                if (!this.has(value)) {
                  transaction(function () {
                    _this2.data_.add(_this2.enhancer_(value, undefined));
                    _this2.atom_.reportChanged();
                  });
                  var notifySpy = process.env.NODE_ENV !== "production" && isSpyEnabled();
                  var notify = hasListeners(this);
                  var _change = notify || notifySpy ? {
                    observableKind: "set",
                    debugObjectName: this.name_,
                    type: ADD,
                    object: this,
                    newValue: value
                  } : null;
                  if (notifySpy && process.env.NODE_ENV !== "production") {
                    spyReportStart(_change);
                  }
                  if (notify) {
                    notifyListeners(this, _change);
                  }
                  if (notifySpy && process.env.NODE_ENV !== "production") {
                    spyReportEnd();
                  }
                }
                return this;
              };
              _proto["delete"] = function _delete(value) {
                var _this3 = this;
                if (hasInterceptors(this)) {
                  var change = interceptChange(this, {
                    type: DELETE,
                    object: this,
                    oldValue: value
                  });
                  if (!change) {
                    return false;
                  }
                }
                if (this.has(value)) {
                  var notifySpy = process.env.NODE_ENV !== "production" && isSpyEnabled();
                  var notify = hasListeners(this);
                  var _change2 = notify || notifySpy ? {
                    observableKind: "set",
                    debugObjectName: this.name_,
                    type: DELETE,
                    object: this,
                    oldValue: value
                  } : null;
                  if (notifySpy && process.env.NODE_ENV !== "production") {
                    spyReportStart(_change2);
                  }
                  transaction(function () {
                    _this3.atom_.reportChanged();
                    _this3.data_["delete"](value);
                  });
                  if (notify) {
                    notifyListeners(this, _change2);
                  }
                  if (notifySpy && process.env.NODE_ENV !== "production") {
                    spyReportEnd();
                  }
                  return true;
                }
                return false;
              };
              _proto.has = function has(value) {
                this.atom_.reportObserved();
                return this.data_.has(this.dehanceValue_(value));
              };
              _proto.entries = function entries() {
                var nextIndex = 0;
                var keys = Array.from(this.keys());
                var values = Array.from(this.values());
                return makeIterable({
                  next: function next() {
                    var index = nextIndex;
                    nextIndex += 1;
                    return index < values.length ? {
                      value: [keys[index], values[index]],
                      done: false
                    } : {
                      done: true
                    };
                  }
                });
              };
              _proto.keys = function keys() {
                return this.values();
              };
              _proto.values = function values() {
                this.atom_.reportObserved();
                var self = this;
                var nextIndex = 0;
                var observableValues = Array.from(this.data_.values());
                return makeIterable({
                  next: function next() {
                    return nextIndex < observableValues.length ? {
                      value: self.dehanceValue_(observableValues[nextIndex++]),
                      done: false
                    } : {
                      done: true
                    };
                  }
                });
              };
              _proto.replace = function replace(other) {
                var _this4 = this;
                if (isObservableSet(other)) {
                  other = new Set(other);
                }
                transaction(function () {
                  if (Array.isArray(other)) {
                    _this4.clear();
                    other.forEach(function (value) {
                      return _this4.add(value);
                    });
                  } else if (isES6Set(other)) {
                    _this4.clear();
                    other.forEach(function (value) {
                      return _this4.add(value);
                    });
                  } else if (other !== null && other !== undefined) {
                    die("Cannot initialize set from " + other);
                  }
                });
                return this;
              };
              _proto.observe_ = function observe_(listener, fireImmediately) {
                // ... 'fireImmediately' could also be true?
                if (process.env.NODE_ENV !== "production" && fireImmediately === true) {
                  die("`observe` doesn't support fireImmediately=true in combination with sets.");
                }
                return registerListener(this, listener);
              };
              _proto.intercept_ = function intercept_(handler) {
                return registerInterceptor(this, handler);
              };
              _proto.toJSON = function toJSON() {
                return Array.from(this);
              };
              _proto.toString = function toString() {
                return "[object ObservableSet]";
              };
              _proto[_Symbol$iterator$1] = function () {
                return this.values();
              };
              _createClass(ObservableSet, [{
                key: "size",
                get: function get() {
                  this.atom_.reportObserved();
                  return this.data_.size;
                }
              }, {
                key: _Symbol$toStringTag$1,
                get: function get() {
                  return "Set";
                }
              }]);
              return ObservableSet;
            }();
            // eslint-disable-next-line
            var isObservableSet = /*#__PURE__*/createInstanceofPredicate("ObservableSet", ObservableSet);

            var descriptorCache = /*#__PURE__*/Object.create(null);
            var REMOVE = "remove";
            var ObservableObjectAdministration = /*#__PURE__*/function () {
              function ObservableObjectAdministration(target_, values_, name_,
              // Used anytime annotation is not explicitely provided
              defaultAnnotation_) {
                if (values_ === void 0) {
                  values_ = new Map();
                }
                if (defaultAnnotation_ === void 0) {
                  defaultAnnotation_ = autoAnnotation;
                }
                this.target_ = void 0;
                this.values_ = void 0;
                this.name_ = void 0;
                this.defaultAnnotation_ = void 0;
                this.keysAtom_ = void 0;
                this.changeListeners_ = void 0;
                this.interceptors_ = void 0;
                this.proxy_ = void 0;
                this.isPlainObject_ = void 0;
                this.appliedAnnotations_ = void 0;
                this.pendingKeys_ = void 0;
                this.target_ = target_;
                this.values_ = values_;
                this.name_ = name_;
                this.defaultAnnotation_ = defaultAnnotation_;
                this.keysAtom_ = new Atom(process.env.NODE_ENV !== "production" ? this.name_ + ".keys" : "ObservableObject.keys");
                // Optimization: we use this frequently
                this.isPlainObject_ = isPlainObject(this.target_);
                if (process.env.NODE_ENV !== "production" && !isAnnotation(this.defaultAnnotation_)) {
                  die("defaultAnnotation must be valid annotation");
                }
                if (process.env.NODE_ENV !== "production") {
                  // Prepare structure for tracking which fields were already annotated
                  this.appliedAnnotations_ = {};
                }
              }
              var _proto = ObservableObjectAdministration.prototype;
              _proto.getObservablePropValue_ = function getObservablePropValue_(key) {
                return this.values_.get(key).get();
              };
              _proto.setObservablePropValue_ = function setObservablePropValue_(key, newValue) {
                var observable = this.values_.get(key);
                if (observable instanceof ComputedValue) {
                  observable.set(newValue);
                  return true;
                }
                // intercept
                if (hasInterceptors(this)) {
                  var change = interceptChange(this, {
                    type: UPDATE,
                    object: this.proxy_ || this.target_,
                    name: key,
                    newValue: newValue
                  });
                  if (!change) {
                    return null;
                  }
                  newValue = change.newValue;
                }
                newValue = observable.prepareNewValue_(newValue);
                // notify spy & observers
                if (newValue !== globalState.UNCHANGED) {
                  var notify = hasListeners(this);
                  var notifySpy = process.env.NODE_ENV !== "production" && isSpyEnabled();
                  var _change = notify || notifySpy ? {
                    type: UPDATE,
                    observableKind: "object",
                    debugObjectName: this.name_,
                    object: this.proxy_ || this.target_,
                    oldValue: observable.value_,
                    name: key,
                    newValue: newValue
                  } : null;
                  if (process.env.NODE_ENV !== "production" && notifySpy) {
                    spyReportStart(_change);
                  }
                  observable.setNewValue_(newValue);
                  if (notify) {
                    notifyListeners(this, _change);
                  }
                  if (process.env.NODE_ENV !== "production" && notifySpy) {
                    spyReportEnd();
                  }
                }
                return true;
              };
              _proto.get_ = function get_(key) {
                if (globalState.trackingDerivation && !hasProp(this.target_, key)) {
                  // Key doesn't exist yet, subscribe for it in case it's added later
                  this.has_(key);
                }
                return this.target_[key];
              }
              /**
               * @param {PropertyKey} key
               * @param {any} value
               * @param {Annotation|boolean} annotation true - use default annotation, false - copy as is
               * @param {boolean} proxyTrap whether it's called from proxy trap
               * @returns {boolean|null} true on success, false on failure (proxyTrap + non-configurable), null when cancelled by interceptor
               */;
              _proto.set_ = function set_(key, value, proxyTrap) {
                if (proxyTrap === void 0) {
                  proxyTrap = false;
                }
                // Don't use .has(key) - we care about own
                if (hasProp(this.target_, key)) {
                  // Existing prop
                  if (this.values_.has(key)) {
                    // Observable (can be intercepted)
                    return this.setObservablePropValue_(key, value);
                  } else if (proxyTrap) {
                    // Non-observable - proxy
                    return Reflect.set(this.target_, key, value);
                  } else {
                    // Non-observable
                    this.target_[key] = value;
                    return true;
                  }
                } else {
                  // New prop
                  return this.extend_(key, {
                    value: value,
                    enumerable: true,
                    writable: true,
                    configurable: true
                  }, this.defaultAnnotation_, proxyTrap);
                }
              }
              // Trap for "in"
              ;
              _proto.has_ = function has_(key) {
                if (!globalState.trackingDerivation) {
                  // Skip key subscription outside derivation
                  return key in this.target_;
                }
                this.pendingKeys_ || (this.pendingKeys_ = new Map());
                var entry = this.pendingKeys_.get(key);
                if (!entry) {
                  entry = new ObservableValue(key in this.target_, referenceEnhancer, process.env.NODE_ENV !== "production" ? this.name_ + "." + stringifyKey(key) + "?" : "ObservableObject.key?", false);
                  this.pendingKeys_.set(key, entry);
                }
                return entry.get();
              }
              /**
               * @param {PropertyKey} key
               * @param {Annotation|boolean} annotation true - use default annotation, false - ignore prop
               */;
              _proto.make_ = function make_(key, annotation) {
                if (annotation === true) {
                  annotation = this.defaultAnnotation_;
                }
                if (annotation === false) {
                  return;
                }
                assertAnnotable(this, annotation, key);
                if (!(key in this.target_)) {
                  var _this$target_$storedA;
                  // Throw on missing key, except for decorators:
                  // Decorator annotations are collected from whole prototype chain.
                  // When called from super() some props may not exist yet.
                  // However we don't have to worry about missing prop,
                  // because the decorator must have been applied to something.
                  if ((_this$target_$storedA = this.target_[storedAnnotationsSymbol]) != null && _this$target_$storedA[key]) {
                    return; // will be annotated by subclass constructor
                  } else {
                    die(1, annotation.annotationType_, this.name_ + "." + key.toString());
                  }
                }
                var source = this.target_;
                while (source && source !== objectPrototype) {
                  var descriptor = getDescriptor(source, key);
                  if (descriptor) {
                    var outcome = annotation.make_(this, key, descriptor, source);
                    if (outcome === 0 /* Cancel */) {
                      return;
                    }
                    if (outcome === 1 /* Break */) {
                      break;
                    }
                  }
                  source = Object.getPrototypeOf(source);
                }
                recordAnnotationApplied(this, annotation, key);
              }
              /**
               * @param {PropertyKey} key
               * @param {PropertyDescriptor} descriptor
               * @param {Annotation|boolean} annotation true - use default annotation, false - copy as is
               * @param {boolean} proxyTrap whether it's called from proxy trap
               * @returns {boolean|null} true on success, false on failure (proxyTrap + non-configurable), null when cancelled by interceptor
               */;
              _proto.extend_ = function extend_(key, descriptor, annotation, proxyTrap) {
                if (proxyTrap === void 0) {
                  proxyTrap = false;
                }
                if (annotation === true) {
                  annotation = this.defaultAnnotation_;
                }
                if (annotation === false) {
                  return this.defineProperty_(key, descriptor, proxyTrap);
                }
                assertAnnotable(this, annotation, key);
                var outcome = annotation.extend_(this, key, descriptor, proxyTrap);
                if (outcome) {
                  recordAnnotationApplied(this, annotation, key);
                }
                return outcome;
              }
              /**
               * @param {PropertyKey} key
               * @param {PropertyDescriptor} descriptor
               * @param {boolean} proxyTrap whether it's called from proxy trap
               * @returns {boolean|null} true on success, false on failure (proxyTrap + non-configurable), null when cancelled by interceptor
               */;
              _proto.defineProperty_ = function defineProperty_(key, descriptor, proxyTrap) {
                if (proxyTrap === void 0) {
                  proxyTrap = false;
                }
                try {
                  startBatch();
                  // Delete
                  var deleteOutcome = this.delete_(key);
                  if (!deleteOutcome) {
                    // Failure or intercepted
                    return deleteOutcome;
                  }
                  // ADD interceptor
                  if (hasInterceptors(this)) {
                    var change = interceptChange(this, {
                      object: this.proxy_ || this.target_,
                      name: key,
                      type: ADD,
                      newValue: descriptor.value
                    });
                    if (!change) {
                      return null;
                    }
                    var newValue = change.newValue;
                    if (descriptor.value !== newValue) {
                      descriptor = _extends({}, descriptor, {
                        value: newValue
                      });
                    }
                  }
                  // Define
                  if (proxyTrap) {
                    if (!Reflect.defineProperty(this.target_, key, descriptor)) {
                      return false;
                    }
                  } else {
                    defineProperty(this.target_, key, descriptor);
                  }
                  // Notify
                  this.notifyPropertyAddition_(key, descriptor.value);
                } finally {
                  endBatch();
                }
                return true;
              }
              // If original descriptor becomes relevant, move this to annotation directly
              ;
              _proto.defineObservableProperty_ = function defineObservableProperty_(key, value, enhancer, proxyTrap) {
                if (proxyTrap === void 0) {
                  proxyTrap = false;
                }
                try {
                  startBatch();
                  // Delete
                  var deleteOutcome = this.delete_(key);
                  if (!deleteOutcome) {
                    // Failure or intercepted
                    return deleteOutcome;
                  }
                  // ADD interceptor
                  if (hasInterceptors(this)) {
                    var change = interceptChange(this, {
                      object: this.proxy_ || this.target_,
                      name: key,
                      type: ADD,
                      newValue: value
                    });
                    if (!change) {
                      return null;
                    }
                    value = change.newValue;
                  }
                  var cachedDescriptor = getCachedObservablePropDescriptor(key);
                  var descriptor = {
                    configurable: globalState.safeDescriptors ? this.isPlainObject_ : true,
                    enumerable: true,
                    get: cachedDescriptor.get,
                    set: cachedDescriptor.set
                  };
                  // Define
                  if (proxyTrap) {
                    if (!Reflect.defineProperty(this.target_, key, descriptor)) {
                      return false;
                    }
                  } else {
                    defineProperty(this.target_, key, descriptor);
                  }
                  var observable = new ObservableValue(value, enhancer, process.env.NODE_ENV !== "production" ? this.name_ + "." + key.toString() : "ObservableObject.key", false);
                  this.values_.set(key, observable);
                  // Notify (value possibly changed by ObservableValue)
                  this.notifyPropertyAddition_(key, observable.value_);
                } finally {
                  endBatch();
                }
                return true;
              }
              // If original descriptor becomes relevant, move this to annotation directly
              ;
              _proto.defineComputedProperty_ = function defineComputedProperty_(key, options, proxyTrap) {
                if (proxyTrap === void 0) {
                  proxyTrap = false;
                }
                try {
                  startBatch();
                  // Delete
                  var deleteOutcome = this.delete_(key);
                  if (!deleteOutcome) {
                    // Failure or intercepted
                    return deleteOutcome;
                  }
                  // ADD interceptor
                  if (hasInterceptors(this)) {
                    var change = interceptChange(this, {
                      object: this.proxy_ || this.target_,
                      name: key,
                      type: ADD,
                      newValue: undefined
                    });
                    if (!change) {
                      return null;
                    }
                  }
                  options.name || (options.name = process.env.NODE_ENV !== "production" ? this.name_ + "." + key.toString() : "ObservableObject.key");
                  options.context = this.proxy_ || this.target_;
                  var cachedDescriptor = getCachedObservablePropDescriptor(key);
                  var descriptor = {
                    configurable: globalState.safeDescriptors ? this.isPlainObject_ : true,
                    enumerable: false,
                    get: cachedDescriptor.get,
                    set: cachedDescriptor.set
                  };
                  // Define
                  if (proxyTrap) {
                    if (!Reflect.defineProperty(this.target_, key, descriptor)) {
                      return false;
                    }
                  } else {
                    defineProperty(this.target_, key, descriptor);
                  }
                  this.values_.set(key, new ComputedValue(options));
                  // Notify
                  this.notifyPropertyAddition_(key, undefined);
                } finally {
                  endBatch();
                }
                return true;
              }
              /**
               * @param {PropertyKey} key
               * @param {PropertyDescriptor} descriptor
               * @param {boolean} proxyTrap whether it's called from proxy trap
               * @returns {boolean|null} true on success, false on failure (proxyTrap + non-configurable), null when cancelled by interceptor
               */;
              _proto.delete_ = function delete_(key, proxyTrap) {
                if (proxyTrap === void 0) {
                  proxyTrap = false;
                }
                // No such prop
                if (!hasProp(this.target_, key)) {
                  return true;
                }
                // Intercept
                if (hasInterceptors(this)) {
                  var change = interceptChange(this, {
                    object: this.proxy_ || this.target_,
                    name: key,
                    type: REMOVE
                  });
                  // Cancelled
                  if (!change) {
                    return null;
                  }
                }
                // Delete
                try {
                  var _this$pendingKeys_, _this$pendingKeys_$ge;
                  startBatch();
                  var notify = hasListeners(this);
                  var notifySpy = process.env.NODE_ENV !== "production" && isSpyEnabled();
                  var observable = this.values_.get(key);
                  // Value needed for spies/listeners
                  var value = undefined;
                  // Optimization: don't pull the value unless we will need it
                  if (!observable && (notify || notifySpy)) {
                    var _getDescriptor;
                    value = (_getDescriptor = getDescriptor(this.target_, key)) == null ? void 0 : _getDescriptor.value;
                  }
                  // delete prop (do first, may fail)
                  if (proxyTrap) {
                    if (!Reflect.deleteProperty(this.target_, key)) {
                      return false;
                    }
                  } else {
                    delete this.target_[key];
                  }
                  // Allow re-annotating this field
                  if (process.env.NODE_ENV !== "production") {
                    delete this.appliedAnnotations_[key];
                  }
                  // Clear observable
                  if (observable) {
                    this.values_["delete"](key);
                    // for computed, value is undefined
                    if (observable instanceof ObservableValue) {
                      value = observable.value_;
                    }
                    // Notify: autorun(() => obj[key]), see #1796
                    propagateChanged(observable);
                  }
                  // Notify "keys/entries/values" observers
                  this.keysAtom_.reportChanged();
                  // Notify "has" observers
                  // "in" as it may still exist in proto
                  (_this$pendingKeys_ = this.pendingKeys_) == null ? void 0 : (_this$pendingKeys_$ge = _this$pendingKeys_.get(key)) == null ? void 0 : _this$pendingKeys_$ge.set(key in this.target_);
                  // Notify spies/listeners
                  if (notify || notifySpy) {
                    var _change2 = {
                      type: REMOVE,
                      observableKind: "object",
                      object: this.proxy_ || this.target_,
                      debugObjectName: this.name_,
                      oldValue: value,
                      name: key
                    };
                    if (process.env.NODE_ENV !== "production" && notifySpy) {
                      spyReportStart(_change2);
                    }
                    if (notify) {
                      notifyListeners(this, _change2);
                    }
                    if (process.env.NODE_ENV !== "production" && notifySpy) {
                      spyReportEnd();
                    }
                  }
                } finally {
                  endBatch();
                }
                return true;
              }
              /**
               * Observes this object. Triggers for the events 'add', 'update' and 'delete'.
               * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/observe
               * for callback details
               */;
              _proto.observe_ = function observe_(callback, fireImmediately) {
                if (process.env.NODE_ENV !== "production" && fireImmediately === true) {
                  die("`observe` doesn't support the fire immediately property for observable objects.");
                }
                return registerListener(this, callback);
              };
              _proto.intercept_ = function intercept_(handler) {
                return registerInterceptor(this, handler);
              };
              _proto.notifyPropertyAddition_ = function notifyPropertyAddition_(key, value) {
                var _this$pendingKeys_2, _this$pendingKeys_2$g;
                var notify = hasListeners(this);
                var notifySpy = process.env.NODE_ENV !== "production" && isSpyEnabled();
                if (notify || notifySpy) {
                  var change = notify || notifySpy ? {
                    type: ADD,
                    observableKind: "object",
                    debugObjectName: this.name_,
                    object: this.proxy_ || this.target_,
                    name: key,
                    newValue: value
                  } : null;
                  if (process.env.NODE_ENV !== "production" && notifySpy) {
                    spyReportStart(change);
                  }
                  if (notify) {
                    notifyListeners(this, change);
                  }
                  if (process.env.NODE_ENV !== "production" && notifySpy) {
                    spyReportEnd();
                  }
                }
                (_this$pendingKeys_2 = this.pendingKeys_) == null ? void 0 : (_this$pendingKeys_2$g = _this$pendingKeys_2.get(key)) == null ? void 0 : _this$pendingKeys_2$g.set(true);
                // Notify "keys/entries/values" observers
                this.keysAtom_.reportChanged();
              };
              _proto.ownKeys_ = function ownKeys_() {
                this.keysAtom_.reportObserved();
                return ownKeys(this.target_);
              };
              _proto.keys_ = function keys_() {
                // Returns enumerable && own, but unfortunately keysAtom will report on ANY key change.
                // There is no way to distinguish between Object.keys(object) and Reflect.ownKeys(object) - both are handled by ownKeys trap.
                // We can either over-report in Object.keys(object) or under-report in Reflect.ownKeys(object)
                // We choose to over-report in Object.keys(object), because:
                // - typically it's used with simple data objects
                // - when symbolic/non-enumerable keys are relevant Reflect.ownKeys works as expected
                this.keysAtom_.reportObserved();
                return Object.keys(this.target_);
              };
              return ObservableObjectAdministration;
            }();
            function asObservableObject(target, options) {
              var _options$name;
              if (process.env.NODE_ENV !== "production" && options && isObservableObject(target)) {
                die("Options can't be provided for already observable objects.");
              }
              if (hasProp(target, $mobx)) {
                if (process.env.NODE_ENV !== "production" && !(getAdministration(target) instanceof ObservableObjectAdministration)) {
                  die("Cannot convert '" + getDebugName(target) + "' into observable object:" + "\nThe target is already observable of different type." + "\nExtending builtins is not supported.");
                }
                return target;
              }
              if (process.env.NODE_ENV !== "production" && !Object.isExtensible(target)) {
                die("Cannot make the designated object observable; it is not extensible");
              }
              var name = (_options$name = options == null ? void 0 : options.name) != null ? _options$name : process.env.NODE_ENV !== "production" ? (isPlainObject(target) ? "ObservableObject" : target.constructor.name) + "@" + getNextId() : "ObservableObject";
              var adm = new ObservableObjectAdministration(target, new Map(), String(name), getAnnotationFromOptions(options));
              addHiddenProp(target, $mobx, adm);
              return target;
            }
            var isObservableObjectAdministration = /*#__PURE__*/createInstanceofPredicate("ObservableObjectAdministration", ObservableObjectAdministration);
            function getCachedObservablePropDescriptor(key) {
              return descriptorCache[key] || (descriptorCache[key] = {
                get: function get() {
                  return this[$mobx].getObservablePropValue_(key);
                },
                set: function set(value) {
                  return this[$mobx].setObservablePropValue_(key, value);
                }
              });
            }
            function isObservableObject(thing) {
              if (isObject(thing)) {
                return isObservableObjectAdministration(thing[$mobx]);
              }
              return false;
            }
            function recordAnnotationApplied(adm, annotation, key) {
              var _adm$target_$storedAn;
              if (process.env.NODE_ENV !== "production") {
                adm.appliedAnnotations_[key] = annotation;
              }
              // Remove applied decorator annotation so we don't try to apply it again in subclass constructor
              (_adm$target_$storedAn = adm.target_[storedAnnotationsSymbol]) == null ? true : delete _adm$target_$storedAn[key];
            }
            function assertAnnotable(adm, annotation, key) {
              // Valid annotation
              if (process.env.NODE_ENV !== "production" && !isAnnotation(annotation)) {
                die("Cannot annotate '" + adm.name_ + "." + key.toString() + "': Invalid annotation.");
              }
              /*
              // Configurable, not sealed, not frozen
              // Possibly not needed, just a little better error then the one thrown by engine.
              // Cases where this would be useful the most (subclass field initializer) are not interceptable by this.
              if (__DEV__) {
                  const configurable = getDescriptor(adm.target_, key)?.configurable
                  const frozen = Object.isFrozen(adm.target_)
                  const sealed = Object.isSealed(adm.target_)
                  if (!configurable || frozen || sealed) {
                      const fieldName = `${adm.name_}.${key.toString()}`
                      const requestedAnnotationType = annotation.annotationType_
                      let error = `Cannot apply '${requestedAnnotationType}' to '${fieldName}':`
                      if (frozen) {
                          error += `\nObject is frozen.`
                      }
                      if (sealed) {
                          error += `\nObject is sealed.`
                      }
                      if (!configurable) {
                          error += `\nproperty is not configurable.`
                          // Mention only if caused by us to avoid confusion
                          if (hasProp(adm.appliedAnnotations!, key)) {
                              error += `\nTo prevent accidental re-definition of a field by a subclass, `
                              error += `all annotated fields of non-plain objects (classes) are not configurable.`
                          }
                      }
                      die(error)
                  }
              }
              */
              // Not annotated
              if (process.env.NODE_ENV !== "production" && !isOverride(annotation) && hasProp(adm.appliedAnnotations_, key)) {
                var fieldName = adm.name_ + "." + key.toString();
                var currentAnnotationType = adm.appliedAnnotations_[key].annotationType_;
                var requestedAnnotationType = annotation.annotationType_;
                die("Cannot apply '" + requestedAnnotationType + "' to '" + fieldName + "':" + ("\nThe field is already annotated with '" + currentAnnotationType + "'.") + "\nRe-annotating fields is not allowed." + "\nUse 'override' annotation for methods overridden by subclass.");
              }
            }

            // Bug in safari 9.* (or iOS 9 safari mobile). See #364
            var ENTRY_0 = /*#__PURE__*/createArrayEntryDescriptor(0);
            /**
             * This array buffer contains two lists of properties, so that all arrays
             * can recycle their property definitions, which significantly improves performance of creating
             * properties on the fly.
             */
            var OBSERVABLE_ARRAY_BUFFER_SIZE = 0;
            // Typescript workaround to make sure ObservableArray extends Array
            var StubArray = function StubArray() {};
            function inherit(ctor, proto) {
              if (Object.setPrototypeOf) {
                Object.setPrototypeOf(ctor.prototype, proto);
              } else if (ctor.prototype.__proto__ !== undefined) {
                ctor.prototype.__proto__ = proto;
              } else {
                ctor.prototype = proto;
              }
            }
            inherit(StubArray, Array.prototype);
            // Weex proto freeze protection was here,
            // but it is unclear why the hack is need as MobX never changed the prototype
            // anyway, so removed it in V6
            var LegacyObservableArray = /*#__PURE__*/function (_StubArray, _Symbol$toStringTag, _Symbol$iterator) {
              _inheritsLoose(LegacyObservableArray, _StubArray);
              function LegacyObservableArray(initialValues, enhancer, name, owned) {
                var _this;
                if (name === void 0) {
                  name = process.env.NODE_ENV !== "production" ? "ObservableArray@" + getNextId() : "ObservableArray";
                }
                if (owned === void 0) {
                  owned = false;
                }
                _this = _StubArray.call(this) || this;
                var adm = new ObservableArrayAdministration(name, enhancer, owned, true);
                adm.proxy_ = _assertThisInitialized(_this);
                addHiddenFinalProp(_assertThisInitialized(_this), $mobx, adm);
                if (initialValues && initialValues.length) {
                  var prev = allowStateChangesStart(true);
                  // @ts-ignore
                  _this.spliceWithArray(0, 0, initialValues);
                  allowStateChangesEnd(prev);
                }
                {
                  // Seems that Safari won't use numeric prototype setter untill any * numeric property is
                  // defined on the instance. After that it works fine, even if this property is deleted.
                  Object.defineProperty(_assertThisInitialized(_this), "0", ENTRY_0);
                }
                return _this;
              }
              var _proto = LegacyObservableArray.prototype;
              _proto.concat = function concat() {
                this[$mobx].atom_.reportObserved();
                for (var _len = arguments.length, arrays = new Array(_len), _key = 0; _key < _len; _key++) {
                  arrays[_key] = arguments[_key];
                }
                return Array.prototype.concat.apply(this.slice(),
                //@ts-ignore
                arrays.map(function (a) {
                  return isObservableArray(a) ? a.slice() : a;
                }));
              };
              _proto[_Symbol$iterator] = function () {
                var self = this;
                var nextIndex = 0;
                return makeIterable({
                  next: function next() {
                    return nextIndex < self.length ? {
                      value: self[nextIndex++],
                      done: false
                    } : {
                      done: true,
                      value: undefined
                    };
                  }
                });
              };
              _createClass(LegacyObservableArray, [{
                key: "length",
                get: function get() {
                  return this[$mobx].getArrayLength_();
                },
                set: function set(newLength) {
                  this[$mobx].setArrayLength_(newLength);
                }
              }, {
                key: _Symbol$toStringTag,
                get: function get() {
                  return "Array";
                }
              }]);
              return LegacyObservableArray;
            }(StubArray, Symbol.toStringTag, Symbol.iterator);
            Object.entries(arrayExtensions).forEach(function (_ref) {
              var prop = _ref[0],
                fn = _ref[1];
              if (prop !== "concat") {
                addHiddenProp(LegacyObservableArray.prototype, prop, fn);
              }
            });
            function createArrayEntryDescriptor(index) {
              return {
                enumerable: false,
                configurable: true,
                get: function get() {
                  return this[$mobx].get_(index);
                },
                set: function set(value) {
                  this[$mobx].set_(index, value);
                }
              };
            }
            function createArrayBufferItem(index) {
              defineProperty(LegacyObservableArray.prototype, "" + index, createArrayEntryDescriptor(index));
            }
            function reserveArrayBuffer(max) {
              if (max > OBSERVABLE_ARRAY_BUFFER_SIZE) {
                for (var index = OBSERVABLE_ARRAY_BUFFER_SIZE; index < max + 100; index++) {
                  createArrayBufferItem(index);
                }
                OBSERVABLE_ARRAY_BUFFER_SIZE = max;
              }
            }
            reserveArrayBuffer(1000);
            function createLegacyArray(initialValues, enhancer, name) {
              return new LegacyObservableArray(initialValues, enhancer, name);
            }

            function getAtom(thing, property) {
              if (typeof thing === "object" && thing !== null) {
                if (isObservableArray(thing)) {
                  if (property !== undefined) {
                    die(23);
                  }
                  return thing[$mobx].atom_;
                }
                if (isObservableSet(thing)) {
                  return thing.atom_;
                }
                if (isObservableMap(thing)) {
                  if (property === undefined) {
                    return thing.keysAtom_;
                  }
                  var observable = thing.data_.get(property) || thing.hasMap_.get(property);
                  if (!observable) {
                    die(25, property, getDebugName(thing));
                  }
                  return observable;
                }
                if (isObservableObject(thing)) {
                  if (!property) {
                    return die(26);
                  }
                  var _observable = thing[$mobx].values_.get(property);
                  if (!_observable) {
                    die(27, property, getDebugName(thing));
                  }
                  return _observable;
                }
                if (isAtom(thing) || isComputedValue(thing) || isReaction(thing)) {
                  return thing;
                }
              } else if (isFunction(thing)) {
                if (isReaction(thing[$mobx])) {
                  // disposer function
                  return thing[$mobx];
                }
              }
              die(28);
            }
            function getAdministration(thing, property) {
              if (!thing) {
                die(29);
              }
              if (property !== undefined) {
                return getAdministration(getAtom(thing, property));
              }
              if (isAtom(thing) || isComputedValue(thing) || isReaction(thing)) {
                return thing;
              }
              if (isObservableMap(thing) || isObservableSet(thing)) {
                return thing;
              }
              if (thing[$mobx]) {
                return thing[$mobx];
              }
              die(24, thing);
            }
            function getDebugName(thing, property) {
              var named;
              if (property !== undefined) {
                named = getAtom(thing, property);
              } else if (isAction(thing)) {
                return thing.name;
              } else if (isObservableObject(thing) || isObservableMap(thing) || isObservableSet(thing)) {
                named = getAdministration(thing);
              } else {
                // valid for arrays as well
                named = getAtom(thing);
              }
              return named.name_;
            }

            var toString = objectPrototype.toString;
            function deepEqual(a, b, depth) {
              if (depth === void 0) {
                depth = -1;
              }
              return eq(a, b, depth);
            }
            // Copied from https://github.com/jashkenas/underscore/blob/5c237a7c682fb68fd5378203f0bf22dce1624854/underscore.js#L1186-L1289
            // Internal recursive comparison function for `isEqual`.
            function eq(a, b, depth, aStack, bStack) {
              // Identical objects are equal. `0 === -0`, but they aren't identical.
              // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
              if (a === b) {
                return a !== 0 || 1 / a === 1 / b;
              }
              // `null` or `undefined` only equal to itself (strict comparison).
              if (a == null || b == null) {
                return false;
              }
              // `NaN`s are equivalent, but non-reflexive.
              if (a !== a) {
                return b !== b;
              }
              // Exhaust primitive checks
              var type = typeof a;
              if (type !== "function" && type !== "object" && typeof b != "object") {
                return false;
              }
              // Compare `[[Class]]` names.
              var className = toString.call(a);
              if (className !== toString.call(b)) {
                return false;
              }
              switch (className) {
                // Strings, numbers, regular expressions, dates, and booleans are compared by value.
                case "[object RegExp]":
                // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
                case "[object String]":
                  // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
                  // equivalent to `new String("5")`.
                  return "" + a === "" + b;
                case "[object Number]":
                  // `NaN`s are equivalent, but non-reflexive.
                  // Object(NaN) is equivalent to NaN.
                  if (+a !== +a) {
                    return +b !== +b;
                  }
                  // An `egal` comparison is performed for other numeric values.
                  return +a === 0 ? 1 / +a === 1 / b : +a === +b;
                case "[object Date]":
                case "[object Boolean]":
                  // Coerce dates and booleans to numeric primitive values. Dates are compared by their
                  // millisecond representations. Note that invalid dates with millisecond representations
                  // of `NaN` are not equivalent.
                  return +a === +b;
                case "[object Symbol]":
                  return typeof Symbol !== "undefined" && Symbol.valueOf.call(a) === Symbol.valueOf.call(b);
                case "[object Map]":
                case "[object Set]":
                  // Maps and Sets are unwrapped to arrays of entry-pairs, adding an incidental level.
                  // Hide this extra level by increasing the depth.
                  if (depth >= 0) {
                    depth++;
                  }
                  break;
              }
              // Unwrap any wrapped objects.
              a = unwrap(a);
              b = unwrap(b);
              var areArrays = className === "[object Array]";
              if (!areArrays) {
                if (typeof a != "object" || typeof b != "object") {
                  return false;
                }
                // Objects with different constructors are not equivalent, but `Object`s or `Array`s
                // from different frames are.
                var aCtor = a.constructor,
                  bCtor = b.constructor;
                if (aCtor !== bCtor && !(isFunction(aCtor) && aCtor instanceof aCtor && isFunction(bCtor) && bCtor instanceof bCtor) && "constructor" in a && "constructor" in b) {
                  return false;
                }
              }
              if (depth === 0) {
                return false;
              } else if (depth < 0) {
                depth = -1;
              }
              // Assume equality for cyclic structures. The algorithm for detecting cyclic
              // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
              // Initializing stack of traversed objects.
              // It's done here since we only need them for objects and arrays comparison.
              aStack = aStack || [];
              bStack = bStack || [];
              var length = aStack.length;
              while (length--) {
                // Linear search. Performance is inversely proportional to the number of
                // unique nested structures.
                if (aStack[length] === a) {
                  return bStack[length] === b;
                }
              }
              // Add the first object to the stack of traversed objects.
              aStack.push(a);
              bStack.push(b);
              // Recursively compare objects and arrays.
              if (areArrays) {
                // Compare array lengths to determine if a deep comparison is necessary.
                length = a.length;
                if (length !== b.length) {
                  return false;
                }
                // Deep compare the contents, ignoring non-numeric properties.
                while (length--) {
                  if (!eq(a[length], b[length], depth - 1, aStack, bStack)) {
                    return false;
                  }
                }
              } else {
                // Deep compare objects.
                var keys = Object.keys(a);
                var key;
                length = keys.length;
                // Ensure that both objects contain the same number of properties before comparing deep equality.
                if (Object.keys(b).length !== length) {
                  return false;
                }
                while (length--) {
                  // Deep compare each member
                  key = keys[length];
                  if (!(hasProp(b, key) && eq(a[key], b[key], depth - 1, aStack, bStack))) {
                    return false;
                  }
                }
              }
              // Remove the first object from the stack of traversed objects.
              aStack.pop();
              bStack.pop();
              return true;
            }
            function unwrap(a) {
              if (isObservableArray(a)) {
                return a.slice();
              }
              if (isES6Map(a) || isObservableMap(a)) {
                return Array.from(a.entries());
              }
              if (isES6Set(a) || isObservableSet(a)) {
                return Array.from(a.entries());
              }
              return a;
            }

            function makeIterable(iterator) {
              iterator[Symbol.iterator] = getSelf;
              return iterator;
            }
            function getSelf() {
              return this;
            }

            function isAnnotation(thing) {
              return (
                // Can be function
                thing instanceof Object && typeof thing.annotationType_ === "string" && isFunction(thing.make_) && isFunction(thing.extend_)
              );
            }

            /**
             * (c) Michel Weststrate 2015 - 2020
             * MIT Licensed
             *
             * Welcome to the mobx sources! To get a global overview of how MobX internally works,
             * this is a good place to start:
             * https://medium.com/@mweststrate/becoming-fully-reactive-an-in-depth-explanation-of-mobservable-55995262a254#.xvbh6qd74
             *
             * Source folders:
             * ===============
             *
             * - api/     Most of the public static methods exposed by the module can be found here.
             * - core/    Implementation of the MobX algorithm; atoms, derivations, reactions, dependency trees, optimizations. Cool stuff can be found here.
             * - types/   All the magic that is need to have observable objects, arrays and values is in this folder. Including the modifiers like `asFlat`.
             * - utils/   Utility stuff.
             *
             */
            ["Symbol", "Map", "Set"].forEach(function (m) {
              var g = getGlobal();
              if (typeof g[m] === "undefined") {
                die("MobX requires global '" + m + "' to be available or polyfilled");
              }
            });
            if (typeof __MOBX_DEVTOOLS_GLOBAL_HOOK__ === "object") {
              // See: https://github.com/andykog/mobx-devtools/
              __MOBX_DEVTOOLS_GLOBAL_HOOK__.injectMobx({
                spy: spy,
                extras: {
                  getDebugName: getDebugName
                },
                $mobx: $mobx
              });
            }

            const properties = [
                {
                    name: "visible",
                    getRule: (c) => c.visible,
                    getFromControl: (c) => c.getVisible(),
                    setToControl: (c, v) => { var _a; return (_a = c.setVisible) === null || _a === void 0 ? void 0 : _a.call(c, v); },
                    setState: (s, v) => (s.visible = v),
                    getState: (s) => s.visible,
                    addWatcher: null,
                },
                {
                    name: "required",
                    getRule: (c) => c.required,
                    getFromControl: (c) => {
                        var _a, _b;
                        const requiredLevel = (_b = (_a = c.getAttribute) === null || _a === void 0 ? void 0 : _a.call(c)) === null || _b === void 0 ? void 0 : _b.getRequiredLevel();
                        return requiredLevel == "required";
                    },
                    setToControl: (c, v) => { var _a; return (_a = c.getAttribute) === null || _a === void 0 ? void 0 : _a.call(c).setRequiredLevel(v ? "required" : "none"); },
                    setState: (s, v) => (s.required = v),
                    getState: (s) => s.required,
                    addWatcher: null,
                },
                {
                    name: "disabled",
                    getRule: (c) => c.disabled,
                    getFromControl: (c) => { var _a; return !!((_a = c.getDisabled) === null || _a === void 0 ? void 0 : _a.call(c)); },
                    setToControl: (c, v) => c.setDisabled(v),
                    setState: (s, v) => (s.disabled = v),
                    getState: (s) => s.disabled,
                    addWatcher: null,
                },
                {
                    name: "value",
                    getRule: (c) => c.value,
                    getFromControl: (c) => { var _a, _b; return (_b = (_a = c.getAttribute) === null || _a === void 0 ? void 0 : _a.call(c)) === null || _b === void 0 ? void 0 : _b.getValue(); },
                    setToControl: (c, v) => { var _a, _b, _c; return (_c = (_b = (_a = c.getAttribute) === null || _a === void 0 ? void 0 : _a.call(c)) === null || _b === void 0 ? void 0 : _b.setValue) === null || _c === void 0 ? void 0 : _c.call(c, v); },
                    setState: (s, v) => (s.value = v),
                    getState: (s) => s.value,
                    addWatcher: (c, h) => {
                        var _a, _b;
                        const attribute = (_a = c.getAttribute) === null || _a === void 0 ? void 0 : _a.call(c);
                        (_b = attribute === null || attribute === void 0 ? void 0 : attribute.addOnChange) === null || _b === void 0 ? void 0 : _b.call(attribute, h);
                    },
                }
            ];
            async function init(context, configWebResourceName) {
                var _a;
                const formContext = context.getFormContext();
                try {
                    Xrm.Utility.showProgressIndicator("Loading business rules...");
                    const config = await loadConfig(context, configWebResourceName);
                    const { controls, state } = getInitialState(formContext);
                    makeAutoObservable(state);
                    for (const id in config) {
                        const control = controls[id];
                        const controlConfig = config[id];
                        const controlState = state[id];
                        for (const property of properties) {
                            autorun(() => {
                                try {
                                    let functionOrString = property.getRule(controlConfig);
                                    if (functionOrString) {
                                        let fn;
                                        if (typeof functionOrString === "string") {
                                            fn = (s) => new Function("control", "return " + functionOrString)(s);
                                        }
                                        else {
                                            fn = functionOrString;
                                        }
                                        let newValue = fn(state);
                                        let oldValue = property.getState(controlState);
                                        if (newValue !== oldValue) {
                                            console.info("DVJS control state updated by result", { control: control.getName(), property: property.name, value: newValue });
                                            property.setState(controlState, newValue);
                                            property.setToControl(control, newValue);
                                            console.info("DVJS updated state", toJS(state));
                                        }
                                        formContext.ui.clearFormNotification(`dvjsrule.${id}.${property.name}`);
                                        console.info("DVJS function executed", { control: id, property: property.name, result: newValue });
                                    }
                                }
                                catch (e) {
                                    console.error("DVJS error in function execution", { control: id, property: property.name, error: e });
                                    formContext.ui.setFormNotification(`Business rules error - ${id}.${property.name} - ${e.message}`, "ERROR", `dvjsrule.${id}.${property.name}`);
                                    throw e;
                                }
                            });
                        }
                    }
                    Xrm.Utility.closeProgressIndicator();
                }
                catch (e) {
                    console.error("DVJS loading error", e);
                    Xrm.Utility.closeProgressIndicator();
                    await Xrm.Navigation.openErrorDialog({ message: `Error loading business rules - ${(_a = e.message) !== null && _a !== void 0 ? _a : "unknown error"}`, details: `DvJs error: ${e}` });
                }
            }
            function getInitialState(formContext) {
                var _a;
                const state = {};
                let initialStateLoaded = false;
                const controls = {};
                formContext.ui.controls.forEach((c) => (controls[c.getName()] = c));
                formContext.ui.tabs.forEach((t) => {
                    controls[t.getName()] = t;
                    t.sections.forEach((s) => (controls[s.getName()] = s));
                });
                for (const controlName in controls) {
                    const i = controls[controlName];
                    state[i.getName()] = {};
                    for (const property of properties) {
                        const propertyValue = property.getFromControl(i);
                        property.setState(state[i.getName()], propertyValue);
                        (_a = property.addWatcher) === null || _a === void 0 ? void 0 : _a.call(property, i, () => {
                            if (!initialStateLoaded) {
                                return;
                            }
                            const propertyValue = property.getFromControl(i);
                            const oldvalue = property.getState(state[i.getName()]);
                            if (propertyValue != oldvalue) {
                                runInAction(() => {
                                    console.info("DVJS control state changed", { control: i.getName(), property: property.name, value: propertyValue });
                                    property.setState(state[i.getName()], propertyValue);
                                    console.info("DVJS updated state", toJS(state));
                                });
                            }
                        });
                    }
                }
                console.info("DVJS initial state", toJS(state));
                initialStateLoaded = true;
                return { state: state, controls: controls };
            }
            async function loadConfig(context, configWebResourceName) {
                const baseUrl = context.getContext().getClientUrl();
                let configScript = await (await fetch(baseUrl + "/webresources/" + configWebResourceName)).text();
                if (configScript.trim().startsWith("{")) {
                    configScript = "return " + configScript;
                }
                return new Function(configScript)();
            }

            exports.init = init;

            Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

            return exports;

})({});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHZqcy5qcyIsInNvdXJjZXMiOlsiLi4vbm9kZV9tb2R1bGVzL3JvbGx1cC1wbHVnaW4tbm9kZS1nbG9iYWxzL3NyYy9nbG9iYWwuanMiLCIuLi9ub2RlX21vZHVsZXMvcHJvY2Vzcy1lczYvYnJvd3Nlci5qcyIsIi4uL25vZGVfbW9kdWxlcy9tb2J4L3NyYy9lcnJvcnMudHMiLCIuLi9ub2RlX21vZHVsZXMvbW9ieC9zcmMvdXRpbHMvZ2xvYmFsLnRzIiwiLi4vbm9kZV9tb2R1bGVzL21vYngvc3JjL3V0aWxzL3V0aWxzLnRzIiwiLi4vbm9kZV9tb2R1bGVzL21vYngvc3JjL2FwaS9kZWNvcmF0b3JzLnRzIiwiLi4vbm9kZV9tb2R1bGVzL21vYngvc3JjL2NvcmUvYXRvbS50cyIsIi4uL25vZGVfbW9kdWxlcy9tb2J4L3NyYy91dGlscy9jb21wYXJlci50cyIsIi4uL25vZGVfbW9kdWxlcy9tb2J4L3NyYy90eXBlcy9tb2RpZmllcnMudHMiLCIuLi9ub2RlX21vZHVsZXMvbW9ieC9zcmMvdHlwZXMvb3ZlcnJpZGVhbm5vdGF0aW9uLnRzIiwiLi4vbm9kZV9tb2R1bGVzL21vYngvc3JjL3R5cGVzL2FjdGlvbmFubm90YXRpb24udHMiLCIuLi9ub2RlX21vZHVsZXMvbW9ieC9zcmMvdHlwZXMvZmxvd2Fubm90YXRpb24udHMiLCIuLi9ub2RlX21vZHVsZXMvbW9ieC9zcmMvdHlwZXMvY29tcHV0ZWRhbm5vdGF0aW9uLnRzIiwiLi4vbm9kZV9tb2R1bGVzL21vYngvc3JjL3R5cGVzL29ic2VydmFibGVhbm5vdGF0aW9uLnRzIiwiLi4vbm9kZV9tb2R1bGVzL21vYngvc3JjL3R5cGVzL2F1dG9hbm5vdGF0aW9uLnRzIiwiLi4vbm9kZV9tb2R1bGVzL21vYngvc3JjL2FwaS9vYnNlcnZhYmxlLnRzIiwiLi4vbm9kZV9tb2R1bGVzL21vYngvc3JjL2FwaS9jb21wdXRlZC50cyIsIi4uL25vZGVfbW9kdWxlcy9tb2J4L3NyYy9jb3JlL2FjdGlvbi50cyIsIi4uL25vZGVfbW9kdWxlcy9tb2J4L3NyYy90eXBlcy9vYnNlcnZhYmxldmFsdWUudHMiLCIuLi9ub2RlX21vZHVsZXMvbW9ieC9zcmMvY29yZS9jb21wdXRlZHZhbHVlLnRzIiwiLi4vbm9kZV9tb2R1bGVzL21vYngvc3JjL2NvcmUvZGVyaXZhdGlvbi50cyIsIi4uL25vZGVfbW9kdWxlcy9tb2J4L3NyYy9jb3JlL2dsb2JhbHN0YXRlLnRzIiwiLi4vbm9kZV9tb2R1bGVzL21vYngvc3JjL2NvcmUvb2JzZXJ2YWJsZS50cyIsIi4uL25vZGVfbW9kdWxlcy9tb2J4L3NyYy9jb3JlL3JlYWN0aW9uLnRzIiwiLi4vbm9kZV9tb2R1bGVzL21vYngvc3JjL2NvcmUvc3B5LnRzIiwiLi4vbm9kZV9tb2R1bGVzL21vYngvc3JjL2FwaS9hY3Rpb24udHMiLCIuLi9ub2RlX21vZHVsZXMvbW9ieC9zcmMvYXBpL2F1dG9ydW4udHMiLCIuLi9ub2RlX21vZHVsZXMvbW9ieC9zcmMvYXBpL2JlY29tZS1vYnNlcnZlZC50cyIsIi4uL25vZGVfbW9kdWxlcy9tb2J4L3NyYy9hcGkvZXh0ZW5kb2JzZXJ2YWJsZS50cyIsIi4uL25vZGVfbW9kdWxlcy9tb2J4L3NyYy9hcGkvZXh0cmFzLnRzIiwiLi4vbm9kZV9tb2R1bGVzL21vYngvc3JjL2FwaS9mbG93LnRzIiwiLi4vbm9kZV9tb2R1bGVzL21vYngvc3JjL2FwaS9pc29ic2VydmFibGUudHMiLCIuLi9ub2RlX21vZHVsZXMvbW9ieC9zcmMvYXBpL29iamVjdC1hcGkudHMiLCIuLi9ub2RlX21vZHVsZXMvbW9ieC9zcmMvYXBpL3RvanMudHMiLCIuLi9ub2RlX21vZHVsZXMvbW9ieC9zcmMvYXBpL3RyYWNlLnRzIiwiLi4vbm9kZV9tb2R1bGVzL21vYngvc3JjL2FwaS90cmFuc2FjdGlvbi50cyIsIi4uL25vZGVfbW9kdWxlcy9tb2J4L3NyYy90eXBlcy9keW5hbWljb2JqZWN0LnRzIiwiLi4vbm9kZV9tb2R1bGVzL21vYngvc3JjL3R5cGVzL2ludGVyY2VwdC11dGlscy50cyIsIi4uL25vZGVfbW9kdWxlcy9tb2J4L3NyYy90eXBlcy9saXN0ZW4tdXRpbHMudHMiLCIuLi9ub2RlX21vZHVsZXMvbW9ieC9zcmMvYXBpL21ha2VPYnNlcnZhYmxlLnRzIiwiLi4vbm9kZV9tb2R1bGVzL21vYngvc3JjL3R5cGVzL29ic2VydmFibGVhcnJheS50cyIsIi4uL25vZGVfbW9kdWxlcy9tb2J4L3NyYy90eXBlcy9vYnNlcnZhYmxlbWFwLnRzIiwiLi4vbm9kZV9tb2R1bGVzL21vYngvc3JjL3R5cGVzL29ic2VydmFibGVzZXQudHMiLCIuLi9ub2RlX21vZHVsZXMvbW9ieC9zcmMvdHlwZXMvb2JzZXJ2YWJsZW9iamVjdC50cyIsIi4uL25vZGVfbW9kdWxlcy9tb2J4L3NyYy90eXBlcy9sZWdhY3lvYnNlcnZhYmxlYXJyYXkudHMiLCIuLi9ub2RlX21vZHVsZXMvbW9ieC9zcmMvdHlwZXMvdHlwZS11dGlscy50cyIsIi4uL25vZGVfbW9kdWxlcy9tb2J4L3NyYy91dGlscy9lcS50cyIsIi4uL25vZGVfbW9kdWxlcy9tb2J4L3NyYy91dGlscy9pdGVyYWJsZS50cyIsIi4uL25vZGVfbW9kdWxlcy9tb2J4L3NyYy9hcGkvYW5ub3RhdGlvbi50cyIsIi4uL25vZGVfbW9kdWxlcy9tb2J4L3NyYy9tb2J4LnRzIiwiLi4vc3JjL2R2anMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgKHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOlxuICAgICAgICAgICAgdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDpcbiAgICAgICAgICAgIHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSk7XG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcbi8vIGJhc2VkIG9mZiBodHRwczovL2dpdGh1Yi5jb20vZGVmdW5jdHpvbWJpZS9ub2RlLXByb2Nlc3MvYmxvYi9tYXN0ZXIvYnJvd3Nlci5qc1xuXG5mdW5jdGlvbiBkZWZhdWx0U2V0VGltb3V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2V0VGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuZnVuY3Rpb24gZGVmYXVsdENsZWFyVGltZW91dCAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdjbGVhclRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbnZhciBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbnZhciBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuaWYgKHR5cGVvZiBnbG9iYWwuc2V0VGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xufVxuaWYgKHR5cGVvZiBnbG9iYWwuY2xlYXJUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xufVxuXG5mdW5jdGlvbiBydW5UaW1lb3V0KGZ1bikge1xuICAgIGlmIChjYWNoZWRTZXRUaW1lb3V0ID09PSBzZXRUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICAvLyBpZiBzZXRUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkU2V0VGltZW91dCA9PT0gZGVmYXVsdFNldFRpbW91dCB8fCAhY2FjaGVkU2V0VGltZW91dCkgJiYgc2V0VGltZW91dCkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dChmdW4sIDApO1xuICAgIH0gY2F0Y2goZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwobnVsbCwgZnVuLCAwKTtcbiAgICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yXG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKHRoaXMsIGZ1biwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cblxufVxuZnVuY3Rpb24gcnVuQ2xlYXJUaW1lb3V0KG1hcmtlcikge1xuICAgIGlmIChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGNsZWFyVGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICAvLyBpZiBjbGVhclRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGRlZmF1bHRDbGVhclRpbWVvdXQgfHwgIWNhY2hlZENsZWFyVGltZW91dCkgJiYgY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCAgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbChudWxsLCBtYXJrZXIpO1xuICAgICAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yLlxuICAgICAgICAgICAgLy8gU29tZSB2ZXJzaW9ucyBvZiBJLkUuIGhhdmUgZGlmZmVyZW50IHJ1bGVzIGZvciBjbGVhclRpbWVvdXQgdnMgc2V0VGltZW91dFxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKHRoaXMsIG1hcmtlcik7XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG59XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBpZiAoIWRyYWluaW5nIHx8ICFjdXJyZW50UXVldWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBydW5UaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBydW5DbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5leHBvcnQgZnVuY3Rpb24gbmV4dFRpY2soZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBydW5UaW1lb3V0KGRyYWluUXVldWUpO1xuICAgIH1cbn1cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5leHBvcnQgdmFyIHRpdGxlID0gJ2Jyb3dzZXInO1xuZXhwb3J0IHZhciBwbGF0Zm9ybSA9ICdicm93c2VyJztcbmV4cG9ydCB2YXIgYnJvd3NlciA9IHRydWU7XG5leHBvcnQgdmFyIGVudiA9IHt9O1xuZXhwb3J0IHZhciBhcmd2ID0gW107XG5leHBvcnQgdmFyIHZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbmV4cG9ydCB2YXIgdmVyc2lvbnMgPSB7fTtcbmV4cG9ydCB2YXIgcmVsZWFzZSA9IHt9O1xuZXhwb3J0IHZhciBjb25maWcgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbmV4cG9ydCB2YXIgb24gPSBub29wO1xuZXhwb3J0IHZhciBhZGRMaXN0ZW5lciA9IG5vb3A7XG5leHBvcnQgdmFyIG9uY2UgPSBub29wO1xuZXhwb3J0IHZhciBvZmYgPSBub29wO1xuZXhwb3J0IHZhciByZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5leHBvcnQgdmFyIHJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5leHBvcnQgdmFyIGVtaXQgPSBub29wO1xuXG5leHBvcnQgZnVuY3Rpb24gYmluZGluZyhuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3dkICgpIHsgcmV0dXJuICcvJyB9XG5leHBvcnQgZnVuY3Rpb24gY2hkaXIgKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuZXhwb3J0IGZ1bmN0aW9uIHVtYXNrKCkgeyByZXR1cm4gMDsgfVxuXG4vLyBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9rdW1hdmlzL2Jyb3dzZXItcHJvY2Vzcy1ocnRpbWUvYmxvYi9tYXN0ZXIvaW5kZXguanNcbnZhciBwZXJmb3JtYW5jZSA9IGdsb2JhbC5wZXJmb3JtYW5jZSB8fCB7fVxudmFyIHBlcmZvcm1hbmNlTm93ID1cbiAgcGVyZm9ybWFuY2Uubm93ICAgICAgICB8fFxuICBwZXJmb3JtYW5jZS5tb3pOb3cgICAgIHx8XG4gIHBlcmZvcm1hbmNlLm1zTm93ICAgICAgfHxcbiAgcGVyZm9ybWFuY2Uub05vdyAgICAgICB8fFxuICBwZXJmb3JtYW5jZS53ZWJraXROb3cgIHx8XG4gIGZ1bmN0aW9uKCl7IHJldHVybiAobmV3IERhdGUoKSkuZ2V0VGltZSgpIH1cblxuLy8gZ2VuZXJhdGUgdGltZXN0YW1wIG9yIGRlbHRhXG4vLyBzZWUgaHR0cDovL25vZGVqcy5vcmcvYXBpL3Byb2Nlc3MuaHRtbCNwcm9jZXNzX3Byb2Nlc3NfaHJ0aW1lXG5leHBvcnQgZnVuY3Rpb24gaHJ0aW1lKHByZXZpb3VzVGltZXN0YW1wKXtcbiAgdmFyIGNsb2NrdGltZSA9IHBlcmZvcm1hbmNlTm93LmNhbGwocGVyZm9ybWFuY2UpKjFlLTNcbiAgdmFyIHNlY29uZHMgPSBNYXRoLmZsb29yKGNsb2NrdGltZSlcbiAgdmFyIG5hbm9zZWNvbmRzID0gTWF0aC5mbG9vcigoY2xvY2t0aW1lJTEpKjFlOSlcbiAgaWYgKHByZXZpb3VzVGltZXN0YW1wKSB7XG4gICAgc2Vjb25kcyA9IHNlY29uZHMgLSBwcmV2aW91c1RpbWVzdGFtcFswXVxuICAgIG5hbm9zZWNvbmRzID0gbmFub3NlY29uZHMgLSBwcmV2aW91c1RpbWVzdGFtcFsxXVxuICAgIGlmIChuYW5vc2Vjb25kczwwKSB7XG4gICAgICBzZWNvbmRzLS1cbiAgICAgIG5hbm9zZWNvbmRzICs9IDFlOVxuICAgIH1cbiAgfVxuICByZXR1cm4gW3NlY29uZHMsbmFub3NlY29uZHNdXG59XG5cbnZhciBzdGFydFRpbWUgPSBuZXcgRGF0ZSgpO1xuZXhwb3J0IGZ1bmN0aW9uIHVwdGltZSgpIHtcbiAgdmFyIGN1cnJlbnRUaW1lID0gbmV3IERhdGUoKTtcbiAgdmFyIGRpZiA9IGN1cnJlbnRUaW1lIC0gc3RhcnRUaW1lO1xuICByZXR1cm4gZGlmIC8gMTAwMDtcbn1cblxuZXhwb3J0IGRlZmF1bHQge1xuICBuZXh0VGljazogbmV4dFRpY2ssXG4gIHRpdGxlOiB0aXRsZSxcbiAgYnJvd3NlcjogYnJvd3NlcixcbiAgZW52OiBlbnYsXG4gIGFyZ3Y6IGFyZ3YsXG4gIHZlcnNpb246IHZlcnNpb24sXG4gIHZlcnNpb25zOiB2ZXJzaW9ucyxcbiAgb246IG9uLFxuICBhZGRMaXN0ZW5lcjogYWRkTGlzdGVuZXIsXG4gIG9uY2U6IG9uY2UsXG4gIG9mZjogb2ZmLFxuICByZW1vdmVMaXN0ZW5lcjogcmVtb3ZlTGlzdGVuZXIsXG4gIHJlbW92ZUFsbExpc3RlbmVyczogcmVtb3ZlQWxsTGlzdGVuZXJzLFxuICBlbWl0OiBlbWl0LFxuICBiaW5kaW5nOiBiaW5kaW5nLFxuICBjd2Q6IGN3ZCxcbiAgY2hkaXI6IGNoZGlyLFxuICB1bWFzazogdW1hc2ssXG4gIGhydGltZTogaHJ0aW1lLFxuICBwbGF0Zm9ybTogcGxhdGZvcm0sXG4gIHJlbGVhc2U6IHJlbGVhc2UsXG4gIGNvbmZpZzogY29uZmlnLFxuICB1cHRpbWU6IHVwdGltZVxufTtcbiIsImNvbnN0IG5pY2VFcnJvcnMgPSB7XG4gICAgMDogYEludmFsaWQgdmFsdWUgZm9yIGNvbmZpZ3VyYXRpb24gJ2VuZm9yY2VBY3Rpb25zJywgZXhwZWN0ZWQgJ25ldmVyJywgJ2Fsd2F5cycgb3IgJ29ic2VydmVkJ2AsXG4gICAgMShhbm5vdGF0aW9uVHlwZSwga2V5OiBQcm9wZXJ0eUtleSkge1xuICAgICAgICByZXR1cm4gYENhbm5vdCBhcHBseSAnJHthbm5vdGF0aW9uVHlwZX0nIHRvICcke2tleS50b1N0cmluZygpfSc6IEZpZWxkIG5vdCBmb3VuZC5gXG4gICAgfSxcbiAgICAvKlxuICAgIDIocHJvcCkge1xuICAgICAgICByZXR1cm4gYGludmFsaWQgZGVjb3JhdG9yIGZvciAnJHtwcm9wLnRvU3RyaW5nKCl9J2BcbiAgICB9LFxuICAgIDMocHJvcCkge1xuICAgICAgICByZXR1cm4gYENhbm5vdCBkZWNvcmF0ZSAnJHtwcm9wLnRvU3RyaW5nKCl9JzogYWN0aW9uIGNhbiBvbmx5IGJlIHVzZWQgb24gcHJvcGVydGllcyB3aXRoIGEgZnVuY3Rpb24gdmFsdWUuYFxuICAgIH0sXG4gICAgNChwcm9wKSB7XG4gICAgICAgIHJldHVybiBgQ2Fubm90IGRlY29yYXRlICcke3Byb3AudG9TdHJpbmcoKX0nOiBjb21wdXRlZCBjYW4gb25seSBiZSB1c2VkIG9uIGdldHRlciBwcm9wZXJ0aWVzLmBcbiAgICB9LFxuICAgICovXG4gICAgNTogXCIna2V5cygpJyBjYW4gb25seSBiZSB1c2VkIG9uIG9ic2VydmFibGUgb2JqZWN0cywgYXJyYXlzLCBzZXRzIGFuZCBtYXBzXCIsXG4gICAgNjogXCIndmFsdWVzKCknIGNhbiBvbmx5IGJlIHVzZWQgb24gb2JzZXJ2YWJsZSBvYmplY3RzLCBhcnJheXMsIHNldHMgYW5kIG1hcHNcIixcbiAgICA3OiBcIidlbnRyaWVzKCknIGNhbiBvbmx5IGJlIHVzZWQgb24gb2JzZXJ2YWJsZSBvYmplY3RzLCBhcnJheXMgYW5kIG1hcHNcIixcbiAgICA4OiBcIidzZXQoKScgY2FuIG9ubHkgYmUgdXNlZCBvbiBvYnNlcnZhYmxlIG9iamVjdHMsIGFycmF5cyBhbmQgbWFwc1wiLFxuICAgIDk6IFwiJ3JlbW92ZSgpJyBjYW4gb25seSBiZSB1c2VkIG9uIG9ic2VydmFibGUgb2JqZWN0cywgYXJyYXlzIGFuZCBtYXBzXCIsXG4gICAgMTA6IFwiJ2hhcygpJyBjYW4gb25seSBiZSB1c2VkIG9uIG9ic2VydmFibGUgb2JqZWN0cywgYXJyYXlzIGFuZCBtYXBzXCIsXG4gICAgMTE6IFwiJ2dldCgpJyBjYW4gb25seSBiZSB1c2VkIG9uIG9ic2VydmFibGUgb2JqZWN0cywgYXJyYXlzIGFuZCBtYXBzXCIsXG4gICAgMTI6IGBJbnZhbGlkIGFubm90YXRpb25gLFxuICAgIDEzOiBgRHluYW1pYyBvYnNlcnZhYmxlIG9iamVjdHMgY2Fubm90IGJlIGZyb3plbi4gSWYgeW91J3JlIHBhc3Npbmcgb2JzZXJ2YWJsZXMgdG8gM3JkIHBhcnR5IGNvbXBvbmVudC9mdW5jdGlvbiB0aGF0IGNhbGxzIE9iamVjdC5mcmVlemUsIHBhc3MgY29weSBpbnN0ZWFkOiB0b0pTKG9ic2VydmFibGUpYCxcbiAgICAxNDogXCJJbnRlcmNlcHQgaGFuZGxlcnMgc2hvdWxkIHJldHVybiBub3RoaW5nIG9yIGEgY2hhbmdlIG9iamVjdFwiLFxuICAgIDE1OiBgT2JzZXJ2YWJsZSBhcnJheXMgY2Fubm90IGJlIGZyb3plbi4gSWYgeW91J3JlIHBhc3Npbmcgb2JzZXJ2YWJsZXMgdG8gM3JkIHBhcnR5IGNvbXBvbmVudC9mdW5jdGlvbiB0aGF0IGNhbGxzIE9iamVjdC5mcmVlemUsIHBhc3MgY29weSBpbnN0ZWFkOiB0b0pTKG9ic2VydmFibGUpYCxcbiAgICAxNjogYE1vZGlmaWNhdGlvbiBleGNlcHRpb246IHRoZSBpbnRlcm5hbCBzdHJ1Y3R1cmUgb2YgYW4gb2JzZXJ2YWJsZSBhcnJheSB3YXMgY2hhbmdlZC5gLFxuICAgIDE3KGluZGV4LCBsZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIGBbbW9ieC5hcnJheV0gSW5kZXggb3V0IG9mIGJvdW5kcywgJHtpbmRleH0gaXMgbGFyZ2VyIHRoYW4gJHtsZW5ndGh9YFxuICAgIH0sXG4gICAgMTg6IFwibW9ieC5tYXAgcmVxdWlyZXMgTWFwIHBvbHlmaWxsIGZvciB0aGUgY3VycmVudCBicm93c2VyLiBDaGVjayBiYWJlbC1wb2x5ZmlsbCBvciBjb3JlLWpzL2VzNi9tYXAuanNcIixcbiAgICAxOShvdGhlcikge1xuICAgICAgICByZXR1cm4gXCJDYW5ub3QgaW5pdGlhbGl6ZSBmcm9tIGNsYXNzZXMgdGhhdCBpbmhlcml0IGZyb20gTWFwOiBcIiArIG90aGVyLmNvbnN0cnVjdG9yLm5hbWVcbiAgICB9LFxuICAgIDIwKG90aGVyKSB7XG4gICAgICAgIHJldHVybiBcIkNhbm5vdCBpbml0aWFsaXplIG1hcCBmcm9tIFwiICsgb3RoZXJcbiAgICB9LFxuICAgIDIxKGRhdGFTdHJ1Y3R1cmUpIHtcbiAgICAgICAgcmV0dXJuIGBDYW5ub3QgY29udmVydCB0byBtYXAgZnJvbSAnJHtkYXRhU3RydWN0dXJlfSdgXG4gICAgfSxcbiAgICAyMjogXCJtb2J4LnNldCByZXF1aXJlcyBTZXQgcG9seWZpbGwgZm9yIHRoZSBjdXJyZW50IGJyb3dzZXIuIENoZWNrIGJhYmVsLXBvbHlmaWxsIG9yIGNvcmUtanMvZXM2L3NldC5qc1wiLFxuICAgIDIzOiBcIkl0IGlzIG5vdCBwb3NzaWJsZSB0byBnZXQgaW5kZXggYXRvbXMgZnJvbSBhcnJheXNcIixcbiAgICAyNCh0aGluZykge1xuICAgICAgICByZXR1cm4gXCJDYW5ub3Qgb2J0YWluIGFkbWluaXN0cmF0aW9uIGZyb20gXCIgKyB0aGluZ1xuICAgIH0sXG4gICAgMjUocHJvcGVydHksIG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIGB0aGUgZW50cnkgJyR7cHJvcGVydHl9JyBkb2VzIG5vdCBleGlzdCBpbiB0aGUgb2JzZXJ2YWJsZSBtYXAgJyR7bmFtZX0nYFxuICAgIH0sXG4gICAgMjY6IFwicGxlYXNlIHNwZWNpZnkgYSBwcm9wZXJ0eVwiLFxuICAgIDI3KHByb3BlcnR5LCBuYW1lKSB7XG4gICAgICAgIHJldHVybiBgbm8gb2JzZXJ2YWJsZSBwcm9wZXJ0eSAnJHtwcm9wZXJ0eS50b1N0cmluZygpfScgZm91bmQgb24gdGhlIG9ic2VydmFibGUgb2JqZWN0ICcke25hbWV9J2BcbiAgICB9LFxuICAgIDI4KHRoaW5nKSB7XG4gICAgICAgIHJldHVybiBcIkNhbm5vdCBvYnRhaW4gYXRvbSBmcm9tIFwiICsgdGhpbmdcbiAgICB9LFxuICAgIDI5OiBcIkV4cGVjdGluZyBzb21lIG9iamVjdFwiLFxuICAgIDMwOiBcImludmFsaWQgYWN0aW9uIHN0YWNrLiBkaWQgeW91IGZvcmdldCB0byBmaW5pc2ggYW4gYWN0aW9uP1wiLFxuICAgIDMxOiBcIm1pc3Npbmcgb3B0aW9uIGZvciBjb21wdXRlZDogZ2V0XCIsXG4gICAgMzIobmFtZSwgZGVyaXZhdGlvbikge1xuICAgICAgICByZXR1cm4gYEN5Y2xlIGRldGVjdGVkIGluIGNvbXB1dGF0aW9uICR7bmFtZX06ICR7ZGVyaXZhdGlvbn1gXG4gICAgfSxcbiAgICAzMyhuYW1lKSB7XG4gICAgICAgIHJldHVybiBgVGhlIHNldHRlciBvZiBjb21wdXRlZCB2YWx1ZSAnJHtuYW1lfScgaXMgdHJ5aW5nIHRvIHVwZGF0ZSBpdHNlbGYuIERpZCB5b3UgaW50ZW5kIHRvIHVwZGF0ZSBhbiBfb2JzZXJ2YWJsZV8gdmFsdWUsIGluc3RlYWQgb2YgdGhlIGNvbXB1dGVkIHByb3BlcnR5P2BcbiAgICB9LFxuICAgIDM0KG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIGBbQ29tcHV0ZWRWYWx1ZSAnJHtuYW1lfSddIEl0IGlzIG5vdCBwb3NzaWJsZSB0byBhc3NpZ24gYSBuZXcgdmFsdWUgdG8gYSBjb21wdXRlZCB2YWx1ZS5gXG4gICAgfSxcbiAgICAzNTogXCJUaGVyZSBhcmUgbXVsdGlwbGUsIGRpZmZlcmVudCB2ZXJzaW9ucyBvZiBNb2JYIGFjdGl2ZS4gTWFrZSBzdXJlIE1vYlggaXMgbG9hZGVkIG9ubHkgb25jZSBvciB1c2UgYGNvbmZpZ3VyZSh7IGlzb2xhdGVHbG9iYWxTdGF0ZTogdHJ1ZSB9KWBcIixcbiAgICAzNjogXCJpc29sYXRlR2xvYmFsU3RhdGUgc2hvdWxkIGJlIGNhbGxlZCBiZWZvcmUgTW9iWCBpcyBydW5uaW5nIGFueSByZWFjdGlvbnNcIixcbiAgICAzNyhtZXRob2QpIHtcbiAgICAgICAgcmV0dXJuIGBbbW9ieF0gXFxgb2JzZXJ2YWJsZUFycmF5LiR7bWV0aG9kfSgpXFxgIG11dGF0ZXMgdGhlIGFycmF5IGluLXBsYWNlLCB3aGljaCBpcyBub3QgYWxsb3dlZCBpbnNpZGUgYSBkZXJpdmF0aW9uLiBVc2UgXFxgYXJyYXkuc2xpY2UoKS4ke21ldGhvZH0oKVxcYCBpbnN0ZWFkYFxuICAgIH0sXG4gICAgMzg6IFwiJ293bktleXMoKScgY2FuIG9ubHkgYmUgdXNlZCBvbiBvYnNlcnZhYmxlIG9iamVjdHNcIixcbiAgICAzOTogXCInZGVmaW5lUHJvcGVydHkoKScgY2FuIG9ubHkgYmUgdXNlZCBvbiBvYnNlcnZhYmxlIG9iamVjdHNcIlxufSBhcyBjb25zdFxuXG5jb25zdCBlcnJvcnM6IHR5cGVvZiBuaWNlRXJyb3JzID0gX19ERVZfXyA/IG5pY2VFcnJvcnMgOiAoe30gYXMgYW55KVxuXG5leHBvcnQgZnVuY3Rpb24gZGllKGVycm9yOiBzdHJpbmcgfCBrZXlvZiB0eXBlb2YgZXJyb3JzLCAuLi5hcmdzOiBhbnlbXSk6IG5ldmVyIHtcbiAgICBpZiAoX19ERVZfXykge1xuICAgICAgICBsZXQgZTogYW55ID0gdHlwZW9mIGVycm9yID09PSBcInN0cmluZ1wiID8gZXJyb3IgOiBlcnJvcnNbZXJyb3JdXG4gICAgICAgIGlmICh0eXBlb2YgZSA9PT0gXCJmdW5jdGlvblwiKSBlID0gZS5hcHBseShudWxsLCBhcmdzIGFzIGFueSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBbTW9iWF0gJHtlfWApXG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgdHlwZW9mIGVycm9yID09PSBcIm51bWJlclwiXG4gICAgICAgICAgICA/IGBbTW9iWF0gbWluaWZpZWQgZXJyb3IgbnI6ICR7ZXJyb3J9JHtcbiAgICAgICAgICAgICAgICAgIGFyZ3MubGVuZ3RoID8gXCIgXCIgKyBhcmdzLm1hcChTdHJpbmcpLmpvaW4oXCIsXCIpIDogXCJcIlxuICAgICAgICAgICAgICB9LiBGaW5kIHRoZSBmdWxsIGVycm9yIGF0OiBodHRwczovL2dpdGh1Yi5jb20vbW9ieGpzL21vYngvYmxvYi9tYWluL3BhY2thZ2VzL21vYngvc3JjL2Vycm9ycy50c2BcbiAgICAgICAgICAgIDogYFtNb2JYXSAke2Vycm9yfWBcbiAgICApXG59XG4iLCJkZWNsYXJlIGNvbnN0IHdpbmRvdzogYW55XG5kZWNsYXJlIGNvbnN0IHNlbGY6IGFueVxuXG5jb25zdCBtb2NrR2xvYmFsID0ge31cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEdsb2JhbCgpIHtcbiAgICBpZiAodHlwZW9mIGdsb2JhbFRoaXMgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgcmV0dXJuIGdsb2JhbFRoaXNcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgcmV0dXJuIHdpbmRvd1xuICAgIH1cbiAgICBpZiAodHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICByZXR1cm4gZ2xvYmFsXG4gICAgfVxuICAgIGlmICh0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICByZXR1cm4gc2VsZlxuICAgIH1cbiAgICByZXR1cm4gbW9ja0dsb2JhbFxufVxuIiwiaW1wb3J0IHsgZ2xvYmFsU3RhdGUsIGRpZSB9IGZyb20gXCIuLi9pbnRlcm5hbFwiXG5cbi8vIFdlIHNob3J0ZW4gYW55dGhpbmcgdXNlZCA+IDUgdGltZXNcbmV4cG9ydCBjb25zdCBhc3NpZ24gPSBPYmplY3QuYXNzaWduXG5leHBvcnQgY29uc3QgZ2V0RGVzY3JpcHRvciA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JcbmV4cG9ydCBjb25zdCBkZWZpbmVQcm9wZXJ0eSA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eVxuZXhwb3J0IGNvbnN0IG9iamVjdFByb3RvdHlwZSA9IE9iamVjdC5wcm90b3R5cGVcblxuZXhwb3J0IGNvbnN0IEVNUFRZX0FSUkFZID0gW11cbk9iamVjdC5mcmVlemUoRU1QVFlfQVJSQVkpXG5cbmV4cG9ydCBjb25zdCBFTVBUWV9PQkpFQ1QgPSB7fVxuT2JqZWN0LmZyZWV6ZShFTVBUWV9PQkpFQ1QpXG5cbmV4cG9ydCBpbnRlcmZhY2UgTGFtYmRhIHtcbiAgICAoKTogdm9pZFxuICAgIG5hbWU/OiBzdHJpbmdcbn1cblxuY29uc3QgaGFzUHJveHkgPSB0eXBlb2YgUHJveHkgIT09IFwidW5kZWZpbmVkXCJcbmNvbnN0IHBsYWluT2JqZWN0U3RyaW5nID0gT2JqZWN0LnRvU3RyaW5nKClcblxuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydFByb3hpZXMoKSB7XG4gICAgaWYgKCFoYXNQcm94eSkge1xuICAgICAgICBkaWUoXG4gICAgICAgICAgICBfX0RFVl9fXG4gICAgICAgICAgICAgICAgPyBcImBQcm94eWAgb2JqZWN0cyBhcmUgbm90IGF2YWlsYWJsZSBpbiB0aGUgY3VycmVudCBlbnZpcm9ubWVudC4gUGxlYXNlIGNvbmZpZ3VyZSBNb2JYIHRvIGVuYWJsZSBhIGZhbGxiYWNrIGltcGxlbWVudGF0aW9uLmBcIlxuICAgICAgICAgICAgICAgIDogXCJQcm94eSBub3QgYXZhaWxhYmxlXCJcbiAgICAgICAgKVxuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdhcm5BYm91dFByb3h5UmVxdWlyZW1lbnQobXNnOiBzdHJpbmcpIHtcbiAgICBpZiAoX19ERVZfXyAmJiBnbG9iYWxTdGF0ZS52ZXJpZnlQcm94aWVzKSB7XG4gICAgICAgIGRpZShcbiAgICAgICAgICAgIFwiTW9iWCBpcyBjdXJyZW50bHkgY29uZmlndXJlZCB0byBiZSBhYmxlIHRvIHJ1biBpbiBFUzUgbW9kZSwgYnV0IGluIEVTNSBNb2JYIHdvbid0IGJlIGFibGUgdG8gXCIgK1xuICAgICAgICAgICAgICAgIG1zZ1xuICAgICAgICApXG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0TmV4dElkKCkge1xuICAgIHJldHVybiArK2dsb2JhbFN0YXRlLm1vYnhHdWlkXG59XG5cbi8qKlxuICogTWFrZXMgc3VyZSB0aGF0IHRoZSBwcm92aWRlZCBmdW5jdGlvbiBpcyBpbnZva2VkIGF0IG1vc3Qgb25jZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG9uY2UoZnVuYzogTGFtYmRhKTogTGFtYmRhIHtcbiAgICBsZXQgaW52b2tlZCA9IGZhbHNlXG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKGludm9rZWQpIHtcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIGludm9rZWQgPSB0cnVlXG4gICAgICAgIHJldHVybiAoZnVuYyBhcyBhbnkpLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcbiAgICB9XG59XG5cbmV4cG9ydCBjb25zdCBub29wID0gKCkgPT4ge31cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRnVuY3Rpb24oZm46IGFueSk6IGZuIGlzIEZ1bmN0aW9uIHtcbiAgICByZXR1cm4gdHlwZW9mIGZuID09PSBcImZ1bmN0aW9uXCJcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzU3RyaW5nKHZhbHVlOiBhbnkpOiB2YWx1ZSBpcyBzdHJpbmcge1xuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09IFwic3RyaW5nXCJcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzU3RyaW5naXNoKHZhbHVlOiBhbnkpOiB2YWx1ZSBpcyBzdHJpbmcgfCBudW1iZXIgfCBzeW1ib2wge1xuICAgIGNvbnN0IHQgPSB0eXBlb2YgdmFsdWVcbiAgICBzd2l0Y2ggKHQpIHtcbiAgICAgICAgY2FzZSBcInN0cmluZ1wiOlxuICAgICAgICBjYXNlIFwic3ltYm9sXCI6XG4gICAgICAgIGNhc2UgXCJudW1iZXJcIjpcbiAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICAgIHJldHVybiBmYWxzZVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNPYmplY3QodmFsdWU6IGFueSk6IHZhbHVlIGlzIE9iamVjdCB7XG4gICAgcmV0dXJuIHZhbHVlICE9PSBudWxsICYmIHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIlxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNQbGFpbk9iamVjdCh2YWx1ZTogYW55KSB7XG4gICAgaWYgKCFpc09iamVjdCh2YWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICAgIGNvbnN0IHByb3RvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHZhbHVlKVxuICAgIGlmIChwcm90byA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICAgIGNvbnN0IHByb3RvQ29uc3RydWN0b3IgPSBPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChwcm90bywgXCJjb25zdHJ1Y3RvclwiKSAmJiBwcm90by5jb25zdHJ1Y3RvclxuICAgIHJldHVybiAoXG4gICAgICAgIHR5cGVvZiBwcm90b0NvbnN0cnVjdG9yID09PSBcImZ1bmN0aW9uXCIgJiYgcHJvdG9Db25zdHJ1Y3Rvci50b1N0cmluZygpID09PSBwbGFpbk9iamVjdFN0cmluZ1xuICAgIClcbn1cblxuLy8gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9hLzM3ODY1MTcwXG5leHBvcnQgZnVuY3Rpb24gaXNHZW5lcmF0b3Iob2JqOiBhbnkpOiBib29sZWFuIHtcbiAgICBjb25zdCBjb25zdHJ1Y3RvciA9IG9iaj8uY29uc3RydWN0b3JcbiAgICBpZiAoIWNvbnN0cnVjdG9yKSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgICBpZiAoXG4gICAgICAgIFwiR2VuZXJhdG9yRnVuY3Rpb25cIiA9PT0gY29uc3RydWN0b3IubmFtZSB8fFxuICAgICAgICBcIkdlbmVyYXRvckZ1bmN0aW9uXCIgPT09IGNvbnN0cnVjdG9yLmRpc3BsYXlOYW1lXG4gICAgKSB7XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICAgIHJldHVybiBmYWxzZVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYWRkSGlkZGVuUHJvcChvYmplY3Q6IGFueSwgcHJvcE5hbWU6IFByb3BlcnR5S2V5LCB2YWx1ZTogYW55KSB7XG4gICAgZGVmaW5lUHJvcGVydHkob2JqZWN0LCBwcm9wTmFtZSwge1xuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWVcbiAgICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYWRkSGlkZGVuRmluYWxQcm9wKG9iamVjdDogYW55LCBwcm9wTmFtZTogUHJvcGVydHlLZXksIHZhbHVlOiBhbnkpIHtcbiAgICBkZWZpbmVQcm9wZXJ0eShvYmplY3QsIHByb3BOYW1lLCB7XG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB3cml0YWJsZTogZmFsc2UsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWVcbiAgICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlSW5zdGFuY2VvZlByZWRpY2F0ZTxUPihcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgdGhlQ2xhc3M6IG5ldyAoLi4uYXJnczogYW55W10pID0+IFRcbik6ICh4OiBhbnkpID0+IHggaXMgVCB7XG4gICAgY29uc3QgcHJvcE5hbWUgPSBcImlzTW9iWFwiICsgbmFtZVxuICAgIHRoZUNsYXNzLnByb3RvdHlwZVtwcm9wTmFtZV0gPSB0cnVlXG4gICAgcmV0dXJuIGZ1bmN0aW9uICh4KSB7XG4gICAgICAgIHJldHVybiBpc09iamVjdCh4KSAmJiB4W3Byb3BOYW1lXSA9PT0gdHJ1ZVxuICAgIH0gYXMgYW55XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0VTNk1hcCh0aGluZzogYW55KTogdGhpbmcgaXMgTWFwPGFueSwgYW55PiB7XG4gICAgcmV0dXJuIHRoaW5nIGluc3RhbmNlb2YgTWFwXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0VTNlNldCh0aGluZzogYW55KTogdGhpbmcgaXMgU2V0PGFueT4ge1xuICAgIHJldHVybiB0aGluZyBpbnN0YW5jZW9mIFNldFxufVxuXG5jb25zdCBoYXNHZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPSB0eXBlb2YgT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyAhPT0gXCJ1bmRlZmluZWRcIlxuXG4vKipcbiAqIFJldHVybnMgdGhlIGZvbGxvd2luZzogb3duIGVudW1lcmFibGUga2V5cyBhbmQgc3ltYm9scy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFBsYWluT2JqZWN0S2V5cyhvYmplY3Q6IGFueSkge1xuICAgIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyhvYmplY3QpXG4gICAgLy8gTm90IHN1cHBvcnRlZCBpbiBJRSwgc28gdGhlcmUgYXJlIG5vdCBnb2luZyB0byBiZSBzeW1ib2wgcHJvcHMgYW55d2F5Li4uXG4gICAgaWYgKCFoYXNHZXRPd25Qcm9wZXJ0eVN5bWJvbHMpIHtcbiAgICAgICAgcmV0dXJuIGtleXNcbiAgICB9XG4gICAgY29uc3Qgc3ltYm9scyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMob2JqZWN0KVxuICAgIGlmICghc3ltYm9scy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIGtleXNcbiAgICB9XG4gICAgcmV0dXJuIFsuLi5rZXlzLCAuLi5zeW1ib2xzLmZpbHRlcihzID0+IG9iamVjdFByb3RvdHlwZS5wcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKG9iamVjdCwgcykpXVxufVxuXG4vLyBGcm9tIEltbWVyIHV0aWxzXG4vLyBSZXR1cm5zIGFsbCBvd24ga2V5cywgaW5jbHVkaW5nIG5vbi1lbnVtZXJhYmxlIGFuZCBzeW1ib2xpY1xuZXhwb3J0IGNvbnN0IG93bktleXM6ICh0YXJnZXQ6IGFueSkgPT4gQXJyYXk8c3RyaW5nIHwgc3ltYm9sPiA9XG4gICAgdHlwZW9mIFJlZmxlY3QgIT09IFwidW5kZWZpbmVkXCIgJiYgUmVmbGVjdC5vd25LZXlzXG4gICAgICAgID8gUmVmbGVjdC5vd25LZXlzXG4gICAgICAgIDogaGFzR2V0T3duUHJvcGVydHlTeW1ib2xzXG4gICAgICAgID8gb2JqID0+IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKG9iaikuY29uY2F0KE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMob2JqKSBhcyBhbnkpXG4gICAgICAgIDogLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi8gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXNcblxuZXhwb3J0IGZ1bmN0aW9uIHN0cmluZ2lmeUtleShrZXk6IGFueSk6IHN0cmluZyB7XG4gICAgaWYgKHR5cGVvZiBrZXkgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgcmV0dXJuIGtleVxuICAgIH1cbiAgICBpZiAodHlwZW9mIGtleSA9PT0gXCJzeW1ib2xcIikge1xuICAgICAgICByZXR1cm4ga2V5LnRvU3RyaW5nKClcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBTdHJpbmcoa2V5KS50b1N0cmluZygpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0b1ByaW1pdGl2ZSh2YWx1ZTogYW55KSB7XG4gICAgcmV0dXJuIHZhbHVlID09PSBudWxsID8gbnVsbCA6IHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiA/IFwiXCIgKyB2YWx1ZSA6IHZhbHVlXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNQcm9wKHRhcmdldDogT2JqZWN0LCBwcm9wOiBQcm9wZXJ0eUtleSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBvYmplY3RQcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0YXJnZXQsIHByb3ApXG59XG5cbi8vIEZyb20gSW1tZXIgdXRpbHNcbmV4cG9ydCBjb25zdCBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzID1cbiAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyB8fFxuICAgIGZ1bmN0aW9uIGdldE93blByb3BlcnR5RGVzY3JpcHRvcnModGFyZ2V0OiBhbnkpIHtcbiAgICAgICAgLy8gUG9seWZpbGwgbmVlZGVkIGZvciBIZXJtZXMgYW5kIElFLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2ZhY2Vib29rL2hlcm1lcy9pc3N1ZXMvMjc0XG4gICAgICAgIGNvbnN0IHJlczogYW55ID0ge31cbiAgICAgICAgLy8gTm90ZTogd2l0aG91dCBwb2x5ZmlsbCBmb3Igb3duS2V5cywgc3ltYm9scyB3b24ndCBiZSBwaWNrZWQgdXBcbiAgICAgICAgb3duS2V5cyh0YXJnZXQpLmZvckVhY2goa2V5ID0+IHtcbiAgICAgICAgICAgIHJlc1trZXldID0gZ2V0RGVzY3JpcHRvcih0YXJnZXQsIGtleSlcbiAgICAgICAgfSlcbiAgICAgICAgcmV0dXJuIHJlc1xuICAgIH1cbiIsImltcG9ydCB7IEFubm90YXRpb24sIGFkZEhpZGRlblByb3AsIEFubm90YXRpb25zTWFwLCBoYXNQcm9wLCBkaWUsIGlzT3ZlcnJpZGUgfSBmcm9tIFwiLi4vaW50ZXJuYWxcIlxuXG5leHBvcnQgY29uc3Qgc3RvcmVkQW5ub3RhdGlvbnNTeW1ib2wgPSBTeW1ib2woXCJtb2J4LXN0b3JlZC1hbm5vdGF0aW9uc1wiKVxuXG4vKipcbiAqIENyZWF0ZXMgYSBmdW5jdGlvbiB0aGF0IGFjdHMgYXNcbiAqIC0gZGVjb3JhdG9yXG4gKiAtIGFubm90YXRpb24gb2JqZWN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVEZWNvcmF0b3JBbm5vdGF0aW9uKGFubm90YXRpb246IEFubm90YXRpb24pOiBQcm9wZXJ0eURlY29yYXRvciAmIEFubm90YXRpb24ge1xuICAgIGZ1bmN0aW9uIGRlY29yYXRvcih0YXJnZXQsIHByb3BlcnR5KSB7XG4gICAgICAgIHN0b3JlQW5ub3RhdGlvbih0YXJnZXQsIHByb3BlcnR5LCBhbm5vdGF0aW9uKVxuICAgIH1cbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihkZWNvcmF0b3IsIGFubm90YXRpb24pXG59XG5cbi8qKlxuICogU3RvcmVzIGFubm90YXRpb24gdG8gcHJvdG90eXBlLFxuICogc28gaXQgY2FuIGJlIGluc3BlY3RlZCBsYXRlciBieSBgbWFrZU9ic2VydmFibGVgIGNhbGxlZCBmcm9tIGNvbnN0cnVjdG9yXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdG9yZUFubm90YXRpb24ocHJvdG90eXBlOiBhbnksIGtleTogUHJvcGVydHlLZXksIGFubm90YXRpb246IEFubm90YXRpb24pIHtcbiAgICBpZiAoIWhhc1Byb3AocHJvdG90eXBlLCBzdG9yZWRBbm5vdGF0aW9uc1N5bWJvbCkpIHtcbiAgICAgICAgYWRkSGlkZGVuUHJvcChwcm90b3R5cGUsIHN0b3JlZEFubm90YXRpb25zU3ltYm9sLCB7XG4gICAgICAgICAgICAvLyBJbmhlcml0IGFubm90YXRpb25zXG4gICAgICAgICAgICAuLi5wcm90b3R5cGVbc3RvcmVkQW5ub3RhdGlvbnNTeW1ib2xdXG4gICAgICAgIH0pXG4gICAgfVxuICAgIC8vIEBvdmVycmlkZSBtdXN0IG92ZXJyaWRlIHNvbWV0aGluZ1xuICAgIGlmIChfX0RFVl9fICYmIGlzT3ZlcnJpZGUoYW5ub3RhdGlvbikgJiYgIWhhc1Byb3AocHJvdG90eXBlW3N0b3JlZEFubm90YXRpb25zU3ltYm9sXSwga2V5KSkge1xuICAgICAgICBjb25zdCBmaWVsZE5hbWUgPSBgJHtwcm90b3R5cGUuY29uc3RydWN0b3IubmFtZX0ucHJvdG90eXBlLiR7a2V5LnRvU3RyaW5nKCl9YFxuICAgICAgICBkaWUoXG4gICAgICAgICAgICBgJyR7ZmllbGROYW1lfScgaXMgZGVjb3JhdGVkIHdpdGggJ292ZXJyaWRlJywgYCArXG4gICAgICAgICAgICAgICAgYGJ1dCBubyBzdWNoIGRlY29yYXRlZCBtZW1iZXIgd2FzIGZvdW5kIG9uIHByb3RvdHlwZS5gXG4gICAgICAgIClcbiAgICB9XG4gICAgLy8gQ2Fubm90IHJlLWRlY29yYXRlXG4gICAgYXNzZXJ0Tm90RGVjb3JhdGVkKHByb3RvdHlwZSwgYW5ub3RhdGlvbiwga2V5KVxuXG4gICAgLy8gSWdub3JlIG92ZXJyaWRlXG4gICAgaWYgKCFpc092ZXJyaWRlKGFubm90YXRpb24pKSB7XG4gICAgICAgIHByb3RvdHlwZVtzdG9yZWRBbm5vdGF0aW9uc1N5bWJvbF1ba2V5XSA9IGFubm90YXRpb25cbiAgICB9XG59XG5cbmZ1bmN0aW9uIGFzc2VydE5vdERlY29yYXRlZChwcm90b3R5cGU6IG9iamVjdCwgYW5ub3RhdGlvbjogQW5ub3RhdGlvbiwga2V5OiBQcm9wZXJ0eUtleSkge1xuICAgIGlmIChfX0RFVl9fICYmICFpc092ZXJyaWRlKGFubm90YXRpb24pICYmIGhhc1Byb3AocHJvdG90eXBlW3N0b3JlZEFubm90YXRpb25zU3ltYm9sXSwga2V5KSkge1xuICAgICAgICBjb25zdCBmaWVsZE5hbWUgPSBgJHtwcm90b3R5cGUuY29uc3RydWN0b3IubmFtZX0ucHJvdG90eXBlLiR7a2V5LnRvU3RyaW5nKCl9YFxuICAgICAgICBjb25zdCBjdXJyZW50QW5ub3RhdGlvblR5cGUgPSBwcm90b3R5cGVbc3RvcmVkQW5ub3RhdGlvbnNTeW1ib2xdW2tleV0uYW5ub3RhdGlvblR5cGVfXG4gICAgICAgIGNvbnN0IHJlcXVlc3RlZEFubm90YXRpb25UeXBlID0gYW5ub3RhdGlvbi5hbm5vdGF0aW9uVHlwZV9cbiAgICAgICAgZGllKFxuICAgICAgICAgICAgYENhbm5vdCBhcHBseSAnQCR7cmVxdWVzdGVkQW5ub3RhdGlvblR5cGV9JyB0byAnJHtmaWVsZE5hbWV9JzpgICtcbiAgICAgICAgICAgICAgICBgXFxuVGhlIGZpZWxkIGlzIGFscmVhZHkgZGVjb3JhdGVkIHdpdGggJ0Ake2N1cnJlbnRBbm5vdGF0aW9uVHlwZX0nLmAgK1xuICAgICAgICAgICAgICAgIGBcXG5SZS1kZWNvcmF0aW5nIGZpZWxkcyBpcyBub3QgYWxsb3dlZC5gICtcbiAgICAgICAgICAgICAgICBgXFxuVXNlICdAb3ZlcnJpZGUnIGRlY29yYXRvciBmb3IgbWV0aG9kcyBvdmVycmlkZGVuIGJ5IHN1YmNsYXNzLmBcbiAgICAgICAgKVxuICAgIH1cbn1cblxuLyoqXG4gKiBDb2xsZWN0cyBhbm5vdGF0aW9ucyBmcm9tIHByb3RvdHlwZXMgYW5kIHN0b3JlcyB0aGVtIG9uIHRhcmdldCAoaW5zdGFuY2UpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb2xsZWN0U3RvcmVkQW5ub3RhdGlvbnModGFyZ2V0KTogQW5ub3RhdGlvbnNNYXA8YW55LCBhbnk+IHtcbiAgICBpZiAoIWhhc1Byb3AodGFyZ2V0LCBzdG9yZWRBbm5vdGF0aW9uc1N5bWJvbCkpIHtcbiAgICAgICAgaWYgKF9fREVWX18gJiYgIXRhcmdldFtzdG9yZWRBbm5vdGF0aW9uc1N5bWJvbF0pIHtcbiAgICAgICAgICAgIGRpZShcbiAgICAgICAgICAgICAgICBgTm8gYW5ub3RhdGlvbnMgd2VyZSBwYXNzZWQgdG8gbWFrZU9ic2VydmFibGUsIGJ1dCBubyBkZWNvcmF0ZWQgbWVtYmVycyBoYXZlIGJlZW4gZm91bmQgZWl0aGVyYFxuICAgICAgICAgICAgKVxuICAgICAgICB9XG4gICAgICAgIC8vIFdlIG5lZWQgYSBjb3B5IGFzIHdlIHdpbGwgcmVtb3ZlIGFubm90YXRpb24gZnJvbSB0aGUgbGlzdCBvbmNlIGl0J3MgYXBwbGllZC5cbiAgICAgICAgYWRkSGlkZGVuUHJvcCh0YXJnZXQsIHN0b3JlZEFubm90YXRpb25zU3ltYm9sLCB7IC4uLnRhcmdldFtzdG9yZWRBbm5vdGF0aW9uc1N5bWJvbF0gfSlcbiAgICB9XG4gICAgcmV0dXJuIHRhcmdldFtzdG9yZWRBbm5vdGF0aW9uc1N5bWJvbF1cbn1cbiIsImltcG9ydCB7XG4gICAgSURlcml2YXRpb25TdGF0ZV8sXG4gICAgSU9ic2VydmFibGUsXG4gICAgSURlcml2YXRpb24sXG4gICAgY3JlYXRlSW5zdGFuY2VvZlByZWRpY2F0ZSxcbiAgICBlbmRCYXRjaCxcbiAgICBnZXROZXh0SWQsXG4gICAgbm9vcCxcbiAgICBvbkJlY29tZU9ic2VydmVkLFxuICAgIG9uQmVjb21lVW5vYnNlcnZlZCxcbiAgICBwcm9wYWdhdGVDaGFuZ2VkLFxuICAgIHJlcG9ydE9ic2VydmVkLFxuICAgIHN0YXJ0QmF0Y2gsXG4gICAgTGFtYmRhXG59IGZyb20gXCIuLi9pbnRlcm5hbFwiXG5cbmV4cG9ydCBjb25zdCAkbW9ieCA9IFN5bWJvbChcIm1vYnggYWRtaW5pc3RyYXRpb25cIilcblxuZXhwb3J0IGludGVyZmFjZSBJQXRvbSBleHRlbmRzIElPYnNlcnZhYmxlIHtcbiAgICByZXBvcnRPYnNlcnZlZCgpOiBib29sZWFuXG4gICAgcmVwb3J0Q2hhbmdlZCgpXG59XG5cbmV4cG9ydCBjbGFzcyBBdG9tIGltcGxlbWVudHMgSUF0b20ge1xuICAgIGlzUGVuZGluZ1Vub2JzZXJ2YXRpb25fID0gZmFsc2UgLy8gZm9yIGVmZmVjdGl2ZSB1bm9ic2VydmluZy4gQmFzZUF0b20gaGFzIHRydWUsIGZvciBleHRyYSBvcHRpbWl6YXRpb24sIHNvIGl0cyBvbkJlY29tZVVub2JzZXJ2ZWQgbmV2ZXIgZ2V0cyBjYWxsZWQsIGJlY2F1c2UgaXQncyBub3QgbmVlZGVkXG4gICAgaXNCZWluZ09ic2VydmVkXyA9IGZhbHNlXG4gICAgb2JzZXJ2ZXJzXyA9IG5ldyBTZXQ8SURlcml2YXRpb24+KClcblxuICAgIGRpZmZWYWx1ZV8gPSAwXG4gICAgbGFzdEFjY2Vzc2VkQnlfID0gMFxuICAgIGxvd2VzdE9ic2VydmVyU3RhdGVfID0gSURlcml2YXRpb25TdGF0ZV8uTk9UX1RSQUNLSU5HX1xuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIG5ldyBhdG9tLiBGb3IgZGVidWdnaW5nIHB1cnBvc2VzIGl0IGlzIHJlY29tbWVuZGVkIHRvIGdpdmUgaXQgYSBuYW1lLlxuICAgICAqIFRoZSBvbkJlY29tZU9ic2VydmVkIGFuZCBvbkJlY29tZVVub2JzZXJ2ZWQgY2FsbGJhY2tzIGNhbiBiZSB1c2VkIGZvciByZXNvdXJjZSBtYW5hZ2VtZW50LlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBuYW1lXyA9IF9fREVWX18gPyBcIkF0b21AXCIgKyBnZXROZXh0SWQoKSA6IFwiQXRvbVwiKSB7fVxuXG4gICAgLy8gb25CZWNvbWVPYnNlcnZlZExpc3RlbmVyc1xuICAgIHB1YmxpYyBvbkJPTDogU2V0PExhbWJkYT4gfCB1bmRlZmluZWRcbiAgICAvLyBvbkJlY29tZVVub2JzZXJ2ZWRMaXN0ZW5lcnNcbiAgICBwdWJsaWMgb25CVU9MOiBTZXQ8TGFtYmRhPiB8IHVuZGVmaW5lZFxuXG4gICAgcHVibGljIG9uQk8oKSB7XG4gICAgICAgIGlmICh0aGlzLm9uQk9MKSB7XG4gICAgICAgICAgICB0aGlzLm9uQk9MLmZvckVhY2gobGlzdGVuZXIgPT4gbGlzdGVuZXIoKSlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBvbkJVTygpIHtcbiAgICAgICAgaWYgKHRoaXMub25CVU9MKSB7XG4gICAgICAgICAgICB0aGlzLm9uQlVPTC5mb3JFYWNoKGxpc3RlbmVyID0+IGxpc3RlbmVyKCkpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJbnZva2UgdGhpcyBtZXRob2QgdG8gbm90aWZ5IG1vYnggdGhhdCB5b3VyIGF0b20gaGFzIGJlZW4gdXNlZCBzb21laG93LlxuICAgICAqIFJldHVybnMgdHJ1ZSBpZiB0aGVyZSBpcyBjdXJyZW50bHkgYSByZWFjdGl2ZSBjb250ZXh0LlxuICAgICAqL1xuICAgIHB1YmxpYyByZXBvcnRPYnNlcnZlZCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHJlcG9ydE9ic2VydmVkKHRoaXMpXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW52b2tlIHRoaXMgbWV0aG9kIF9hZnRlcl8gdGhpcyBtZXRob2QgaGFzIGNoYW5nZWQgdG8gc2lnbmFsIG1vYnggdGhhdCBhbGwgaXRzIG9ic2VydmVycyBzaG91bGQgaW52YWxpZGF0ZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVwb3J0Q2hhbmdlZCgpIHtcbiAgICAgICAgc3RhcnRCYXRjaCgpXG4gICAgICAgIHByb3BhZ2F0ZUNoYW5nZWQodGhpcylcbiAgICAgICAgZW5kQmF0Y2goKVxuICAgIH1cblxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5uYW1lX1xuICAgIH1cbn1cblxuZXhwb3J0IGNvbnN0IGlzQXRvbSA9IGNyZWF0ZUluc3RhbmNlb2ZQcmVkaWNhdGUoXCJBdG9tXCIsIEF0b20pXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVBdG9tKFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBvbkJlY29tZU9ic2VydmVkSGFuZGxlcjogKCkgPT4gdm9pZCA9IG5vb3AsXG4gICAgb25CZWNvbWVVbm9ic2VydmVkSGFuZGxlcjogKCkgPT4gdm9pZCA9IG5vb3Bcbik6IElBdG9tIHtcbiAgICBjb25zdCBhdG9tID0gbmV3IEF0b20obmFtZSlcbiAgICAvLyBkZWZhdWx0IGBub29wYCBsaXN0ZW5lciB3aWxsIG5vdCBpbml0aWFsaXplIHRoZSBob29rIFNldFxuICAgIGlmIChvbkJlY29tZU9ic2VydmVkSGFuZGxlciAhPT0gbm9vcCkge1xuICAgICAgICBvbkJlY29tZU9ic2VydmVkKGF0b20sIG9uQmVjb21lT2JzZXJ2ZWRIYW5kbGVyKVxuICAgIH1cblxuICAgIGlmIChvbkJlY29tZVVub2JzZXJ2ZWRIYW5kbGVyICE9PSBub29wKSB7XG4gICAgICAgIG9uQmVjb21lVW5vYnNlcnZlZChhdG9tLCBvbkJlY29tZVVub2JzZXJ2ZWRIYW5kbGVyKVxuICAgIH1cbiAgICByZXR1cm4gYXRvbVxufVxuIiwiaW1wb3J0IHsgZGVlcEVxdWFsIH0gZnJvbSBcIi4uL2ludGVybmFsXCJcblxuZXhwb3J0IGludGVyZmFjZSBJRXF1YWxzQ29tcGFyZXI8VD4ge1xuICAgIChhOiBULCBiOiBUKTogYm9vbGVhblxufVxuXG5mdW5jdGlvbiBpZGVudGl0eUNvbXBhcmVyKGE6IGFueSwgYjogYW55KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGEgPT09IGJcbn1cblxuZnVuY3Rpb24gc3RydWN0dXJhbENvbXBhcmVyKGE6IGFueSwgYjogYW55KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGRlZXBFcXVhbChhLCBiKVxufVxuXG5mdW5jdGlvbiBzaGFsbG93Q29tcGFyZXIoYTogYW55LCBiOiBhbnkpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZGVlcEVxdWFsKGEsIGIsIDEpXG59XG5cbmZ1bmN0aW9uIGRlZmF1bHRDb21wYXJlcihhOiBhbnksIGI6IGFueSk6IGJvb2xlYW4ge1xuICAgIGlmIChPYmplY3QuaXMpIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5pcyhhLCBiKVxuICAgIH1cblxuICAgIHJldHVybiBhID09PSBiID8gYSAhPT0gMCB8fCAxIC8gYSA9PT0gMSAvIGIgOiBhICE9PSBhICYmIGIgIT09IGJcbn1cblxuZXhwb3J0IGNvbnN0IGNvbXBhcmVyID0ge1xuICAgIGlkZW50aXR5OiBpZGVudGl0eUNvbXBhcmVyLFxuICAgIHN0cnVjdHVyYWw6IHN0cnVjdHVyYWxDb21wYXJlcixcbiAgICBkZWZhdWx0OiBkZWZhdWx0Q29tcGFyZXIsXG4gICAgc2hhbGxvdzogc2hhbGxvd0NvbXBhcmVyXG59XG4iLCJpbXBvcnQge1xuICAgIGRlZXBFcXVhbCxcbiAgICBpc0VTNk1hcCxcbiAgICBpc0VTNlNldCxcbiAgICBpc09ic2VydmFibGUsXG4gICAgaXNPYnNlcnZhYmxlQXJyYXksXG4gICAgaXNPYnNlcnZhYmxlTWFwLFxuICAgIGlzT2JzZXJ2YWJsZVNldCxcbiAgICBpc09ic2VydmFibGVPYmplY3QsXG4gICAgaXNQbGFpbk9iamVjdCxcbiAgICBvYnNlcnZhYmxlLFxuICAgIGRpZSxcbiAgICBpc0FjdGlvbixcbiAgICBhdXRvQWN0aW9uLFxuICAgIGZsb3csXG4gICAgaXNGbG93LFxuICAgIGlzR2VuZXJhdG9yXG59IGZyb20gXCIuLi9pbnRlcm5hbFwiXG5cbmV4cG9ydCBpbnRlcmZhY2UgSUVuaGFuY2VyPFQ+IHtcbiAgICAobmV3VmFsdWU6IFQsIG9sZFZhbHVlOiBUIHwgdW5kZWZpbmVkLCBuYW1lOiBzdHJpbmcpOiBUXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWVwRW5oYW5jZXIodiwgXywgbmFtZSkge1xuICAgIC8vIGl0IGlzIGFuIG9ic2VydmFibGUgYWxyZWFkeSwgZG9uZVxuICAgIGlmIChpc09ic2VydmFibGUodikpIHtcbiAgICAgICAgcmV0dXJuIHZcbiAgICB9XG5cbiAgICAvLyBzb21ldGhpbmcgdGhhdCBjYW4gYmUgY29udmVydGVkIGFuZCBtdXRhdGVkP1xuICAgIGlmIChBcnJheS5pc0FycmF5KHYpKSB7XG4gICAgICAgIHJldHVybiBvYnNlcnZhYmxlLmFycmF5KHYsIHsgbmFtZSB9KVxuICAgIH1cbiAgICBpZiAoaXNQbGFpbk9iamVjdCh2KSkge1xuICAgICAgICByZXR1cm4gb2JzZXJ2YWJsZS5vYmplY3QodiwgdW5kZWZpbmVkLCB7IG5hbWUgfSlcbiAgICB9XG4gICAgaWYgKGlzRVM2TWFwKHYpKSB7XG4gICAgICAgIHJldHVybiBvYnNlcnZhYmxlLm1hcCh2LCB7IG5hbWUgfSlcbiAgICB9XG4gICAgaWYgKGlzRVM2U2V0KHYpKSB7XG4gICAgICAgIHJldHVybiBvYnNlcnZhYmxlLnNldCh2LCB7IG5hbWUgfSlcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB2ID09PSBcImZ1bmN0aW9uXCIgJiYgIWlzQWN0aW9uKHYpICYmICFpc0Zsb3codikpIHtcbiAgICAgICAgaWYgKGlzR2VuZXJhdG9yKHYpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmxvdyh2KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGF1dG9BY3Rpb24obmFtZSwgdilcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdlxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2hhbGxvd0VuaGFuY2VyKHYsIF8sIG5hbWUpOiBhbnkge1xuICAgIGlmICh2ID09PSB1bmRlZmluZWQgfHwgdiA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdlxuICAgIH1cbiAgICBpZiAoaXNPYnNlcnZhYmxlT2JqZWN0KHYpIHx8IGlzT2JzZXJ2YWJsZUFycmF5KHYpIHx8IGlzT2JzZXJ2YWJsZU1hcCh2KSB8fCBpc09ic2VydmFibGVTZXQodikpIHtcbiAgICAgICAgcmV0dXJuIHZcbiAgICB9XG4gICAgaWYgKEFycmF5LmlzQXJyYXkodikpIHtcbiAgICAgICAgcmV0dXJuIG9ic2VydmFibGUuYXJyYXkodiwgeyBuYW1lLCBkZWVwOiBmYWxzZSB9KVxuICAgIH1cbiAgICBpZiAoaXNQbGFpbk9iamVjdCh2KSkge1xuICAgICAgICByZXR1cm4gb2JzZXJ2YWJsZS5vYmplY3QodiwgdW5kZWZpbmVkLCB7IG5hbWUsIGRlZXA6IGZhbHNlIH0pXG4gICAgfVxuICAgIGlmIChpc0VTNk1hcCh2KSkge1xuICAgICAgICByZXR1cm4gb2JzZXJ2YWJsZS5tYXAodiwgeyBuYW1lLCBkZWVwOiBmYWxzZSB9KVxuICAgIH1cbiAgICBpZiAoaXNFUzZTZXQodikpIHtcbiAgICAgICAgcmV0dXJuIG9ic2VydmFibGUuc2V0KHYsIHsgbmFtZSwgZGVlcDogZmFsc2UgfSlcbiAgICB9XG5cbiAgICBpZiAoX19ERVZfXykge1xuICAgICAgICBkaWUoXG4gICAgICAgICAgICBcIlRoZSBzaGFsbG93IG1vZGlmaWVyIC8gZGVjb3JhdG9yIGNhbiBvbmx5IHVzZWQgaW4gY29tYmluYXRpb24gd2l0aCBhcnJheXMsIG9iamVjdHMsIG1hcHMgYW5kIHNldHNcIlxuICAgICAgICApXG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVmZXJlbmNlRW5oYW5jZXIobmV3VmFsdWU/KSB7XG4gICAgLy8gbmV2ZXIgdHVybiBpbnRvIGFuIG9ic2VydmFibGVcbiAgICByZXR1cm4gbmV3VmFsdWVcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZlN0cnVjdEVuaGFuY2VyKHYsIG9sZFZhbHVlKTogYW55IHtcbiAgICBpZiAoX19ERVZfXyAmJiBpc09ic2VydmFibGUodikpIHtcbiAgICAgICAgZGllKGBvYnNlcnZhYmxlLnN0cnVjdCBzaG91bGQgbm90IGJlIHVzZWQgd2l0aCBvYnNlcnZhYmxlIHZhbHVlc2ApXG4gICAgfVxuICAgIGlmIChkZWVwRXF1YWwodiwgb2xkVmFsdWUpKSB7XG4gICAgICAgIHJldHVybiBvbGRWYWx1ZVxuICAgIH1cbiAgICByZXR1cm4gdlxufVxuIiwiaW1wb3J0IHtcbiAgICBkaWUsXG4gICAgQW5ub3RhdGlvbixcbiAgICBoYXNQcm9wLFxuICAgIGNyZWF0ZURlY29yYXRvckFubm90YXRpb24sXG4gICAgT2JzZXJ2YWJsZU9iamVjdEFkbWluaXN0cmF0aW9uLFxuICAgIE1ha2VSZXN1bHRcbn0gZnJvbSBcIi4uL2ludGVybmFsXCJcblxuY29uc3QgT1ZFUlJJREUgPSBcIm92ZXJyaWRlXCJcblxuZXhwb3J0IGNvbnN0IG92ZXJyaWRlOiBBbm5vdGF0aW9uICYgUHJvcGVydHlEZWNvcmF0b3IgPSBjcmVhdGVEZWNvcmF0b3JBbm5vdGF0aW9uKHtcbiAgICBhbm5vdGF0aW9uVHlwZV86IE9WRVJSSURFLFxuICAgIG1ha2VfLFxuICAgIGV4dGVuZF9cbn0pXG5cbmV4cG9ydCBmdW5jdGlvbiBpc092ZXJyaWRlKGFubm90YXRpb246IEFubm90YXRpb24pOiBib29sZWFuIHtcbiAgICByZXR1cm4gYW5ub3RhdGlvbi5hbm5vdGF0aW9uVHlwZV8gPT09IE9WRVJSSURFXG59XG5cbmZ1bmN0aW9uIG1ha2VfKGFkbTogT2JzZXJ2YWJsZU9iamVjdEFkbWluaXN0cmF0aW9uLCBrZXkpOiBNYWtlUmVzdWx0IHtcbiAgICAvLyBNdXN0IG5vdCBiZSBwbGFpbiBvYmplY3RcbiAgICBpZiAoX19ERVZfXyAmJiBhZG0uaXNQbGFpbk9iamVjdF8pIHtcbiAgICAgICAgZGllKFxuICAgICAgICAgICAgYENhbm5vdCBhcHBseSAnJHt0aGlzLmFubm90YXRpb25UeXBlX30nIHRvICcke2FkbS5uYW1lX30uJHtrZXkudG9TdHJpbmcoKX0nOmAgK1xuICAgICAgICAgICAgICAgIGBcXG4nJHt0aGlzLmFubm90YXRpb25UeXBlX30nIGNhbm5vdCBiZSB1c2VkIG9uIHBsYWluIG9iamVjdHMuYFxuICAgICAgICApXG4gICAgfVxuICAgIC8vIE11c3Qgb3ZlcnJpZGUgc29tZXRoaW5nXG4gICAgaWYgKF9fREVWX18gJiYgIWhhc1Byb3AoYWRtLmFwcGxpZWRBbm5vdGF0aW9uc18hLCBrZXkpKSB7XG4gICAgICAgIGRpZShcbiAgICAgICAgICAgIGAnJHthZG0ubmFtZV99LiR7a2V5LnRvU3RyaW5nKCl9JyBpcyBhbm5vdGF0ZWQgd2l0aCAnJHt0aGlzLmFubm90YXRpb25UeXBlX30nLCBgICtcbiAgICAgICAgICAgICAgICBgYnV0IG5vIHN1Y2ggYW5ub3RhdGVkIG1lbWJlciB3YXMgZm91bmQgb24gcHJvdG90eXBlLmBcbiAgICAgICAgKVxuICAgIH1cbiAgICByZXR1cm4gTWFrZVJlc3VsdC5DYW5jZWxcbn1cblxuZnVuY3Rpb24gZXh0ZW5kXyhhZG0sIGtleSwgZGVzY3JpcHRvciwgcHJveHlUcmFwKTogYm9vbGVhbiB7XG4gICAgZGllKGAnJHt0aGlzLmFubm90YXRpb25UeXBlX30nIGNhbiBvbmx5IGJlIHVzZWQgd2l0aCAnbWFrZU9ic2VydmFibGUnYClcbn1cbiIsImltcG9ydCB7XG4gICAgT2JzZXJ2YWJsZU9iamVjdEFkbWluaXN0cmF0aW9uLFxuICAgIGNyZWF0ZUFjdGlvbixcbiAgICBpc0FjdGlvbixcbiAgICBkZWZpbmVQcm9wZXJ0eSxcbiAgICBkaWUsXG4gICAgaXNGdW5jdGlvbixcbiAgICBBbm5vdGF0aW9uLFxuICAgIGdsb2JhbFN0YXRlLFxuICAgIE1ha2VSZXN1bHRcbn0gZnJvbSBcIi4uL2ludGVybmFsXCJcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUFjdGlvbkFubm90YXRpb24obmFtZTogc3RyaW5nLCBvcHRpb25zPzogb2JqZWN0KTogQW5ub3RhdGlvbiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgYW5ub3RhdGlvblR5cGVfOiBuYW1lLFxuICAgICAgICBvcHRpb25zXzogb3B0aW9ucyxcbiAgICAgICAgbWFrZV8sXG4gICAgICAgIGV4dGVuZF9cbiAgICB9XG59XG5cbmZ1bmN0aW9uIG1ha2VfKFxuICAgIGFkbTogT2JzZXJ2YWJsZU9iamVjdEFkbWluaXN0cmF0aW9uLFxuICAgIGtleTogUHJvcGVydHlLZXksXG4gICAgZGVzY3JpcHRvcjogUHJvcGVydHlEZXNjcmlwdG9yLFxuICAgIHNvdXJjZTogb2JqZWN0XG4pOiBNYWtlUmVzdWx0IHtcbiAgICAvLyBib3VuZFxuICAgIGlmICh0aGlzLm9wdGlvbnNfPy5ib3VuZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5leHRlbmRfKGFkbSwga2V5LCBkZXNjcmlwdG9yLCBmYWxzZSkgPT09IG51bGxcbiAgICAgICAgICAgID8gTWFrZVJlc3VsdC5DYW5jZWxcbiAgICAgICAgICAgIDogTWFrZVJlc3VsdC5CcmVha1xuICAgIH1cbiAgICAvLyBvd25cbiAgICBpZiAoc291cmNlID09PSBhZG0udGFyZ2V0Xykge1xuICAgICAgICByZXR1cm4gdGhpcy5leHRlbmRfKGFkbSwga2V5LCBkZXNjcmlwdG9yLCBmYWxzZSkgPT09IG51bGxcbiAgICAgICAgICAgID8gTWFrZVJlc3VsdC5DYW5jZWxcbiAgICAgICAgICAgIDogTWFrZVJlc3VsdC5Db250aW51ZVxuICAgIH1cbiAgICAvLyBwcm90b3R5cGVcbiAgICBpZiAoaXNBY3Rpb24oZGVzY3JpcHRvci52YWx1ZSkpIHtcbiAgICAgICAgLy8gQSBwcm90b3R5cGUgY291bGQgaGF2ZSBiZWVuIGFubm90YXRlZCBhbHJlYWR5IGJ5IG90aGVyIGNvbnN0cnVjdG9yLFxuICAgICAgICAvLyByZXN0IG9mIHRoZSBwcm90byBjaGFpbiBtdXN0IGJlIGFubm90YXRlZCBhbHJlYWR5XG4gICAgICAgIHJldHVybiBNYWtlUmVzdWx0LkJyZWFrXG4gICAgfVxuICAgIGNvbnN0IGFjdGlvbkRlc2NyaXB0b3IgPSBjcmVhdGVBY3Rpb25EZXNjcmlwdG9yKGFkbSwgdGhpcywga2V5LCBkZXNjcmlwdG9yLCBmYWxzZSlcbiAgICBkZWZpbmVQcm9wZXJ0eShzb3VyY2UsIGtleSwgYWN0aW9uRGVzY3JpcHRvcilcbiAgICByZXR1cm4gTWFrZVJlc3VsdC5Db250aW51ZVxufVxuXG5mdW5jdGlvbiBleHRlbmRfKFxuICAgIGFkbTogT2JzZXJ2YWJsZU9iamVjdEFkbWluaXN0cmF0aW9uLFxuICAgIGtleTogUHJvcGVydHlLZXksXG4gICAgZGVzY3JpcHRvcjogUHJvcGVydHlEZXNjcmlwdG9yLFxuICAgIHByb3h5VHJhcDogYm9vbGVhblxuKTogYm9vbGVhbiB8IG51bGwge1xuICAgIGNvbnN0IGFjdGlvbkRlc2NyaXB0b3IgPSBjcmVhdGVBY3Rpb25EZXNjcmlwdG9yKGFkbSwgdGhpcywga2V5LCBkZXNjcmlwdG9yKVxuICAgIHJldHVybiBhZG0uZGVmaW5lUHJvcGVydHlfKGtleSwgYWN0aW9uRGVzY3JpcHRvciwgcHJveHlUcmFwKVxufVxuXG5mdW5jdGlvbiBhc3NlcnRBY3Rpb25EZXNjcmlwdG9yKFxuICAgIGFkbTogT2JzZXJ2YWJsZU9iamVjdEFkbWluaXN0cmF0aW9uLFxuICAgIHsgYW5ub3RhdGlvblR5cGVfIH06IEFubm90YXRpb24sXG4gICAga2V5OiBQcm9wZXJ0eUtleSxcbiAgICB7IHZhbHVlIH06IFByb3BlcnR5RGVzY3JpcHRvclxuKSB7XG4gICAgaWYgKF9fREVWX18gJiYgIWlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgICAgIGRpZShcbiAgICAgICAgICAgIGBDYW5ub3QgYXBwbHkgJyR7YW5ub3RhdGlvblR5cGVffScgdG8gJyR7YWRtLm5hbWVffS4ke2tleS50b1N0cmluZygpfSc6YCArXG4gICAgICAgICAgICAgICAgYFxcbicke2Fubm90YXRpb25UeXBlX30nIGNhbiBvbmx5IGJlIHVzZWQgb24gcHJvcGVydGllcyB3aXRoIGEgZnVuY3Rpb24gdmFsdWUuYFxuICAgICAgICApXG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQWN0aW9uRGVzY3JpcHRvcihcbiAgICBhZG06IE9ic2VydmFibGVPYmplY3RBZG1pbmlzdHJhdGlvbixcbiAgICBhbm5vdGF0aW9uOiBBbm5vdGF0aW9uLFxuICAgIGtleTogUHJvcGVydHlLZXksXG4gICAgZGVzY3JpcHRvcjogUHJvcGVydHlEZXNjcmlwdG9yLFxuICAgIC8vIHByb3ZpZGVzIGFiaWxpdHkgdG8gZGlzYWJsZSBzYWZlRGVzY3JpcHRvcnMgZm9yIHByb3RvdHlwZXNcbiAgICBzYWZlRGVzY3JpcHRvcnM6IGJvb2xlYW4gPSBnbG9iYWxTdGF0ZS5zYWZlRGVzY3JpcHRvcnNcbikge1xuICAgIGFzc2VydEFjdGlvbkRlc2NyaXB0b3IoYWRtLCBhbm5vdGF0aW9uLCBrZXksIGRlc2NyaXB0b3IpXG4gICAgbGV0IHsgdmFsdWUgfSA9IGRlc2NyaXB0b3JcbiAgICBpZiAoYW5ub3RhdGlvbi5vcHRpb25zXz8uYm91bmQpIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS5iaW5kKGFkbS5wcm94eV8gPz8gYWRtLnRhcmdldF8pXG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIHZhbHVlOiBjcmVhdGVBY3Rpb24oXG4gICAgICAgICAgICBhbm5vdGF0aW9uLm9wdGlvbnNfPy5uYW1lID8/IGtleS50b1N0cmluZygpLFxuICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgICBhbm5vdGF0aW9uLm9wdGlvbnNfPy5hdXRvQWN0aW9uID8/IGZhbHNlLFxuICAgICAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL21vYnhqcy9tb2J4L2Rpc2N1c3Npb25zLzMxNDBcbiAgICAgICAgICAgIGFubm90YXRpb24ub3B0aW9uc18/LmJvdW5kID8gYWRtLnByb3h5XyA/PyBhZG0udGFyZ2V0XyA6IHVuZGVmaW5lZFxuICAgICAgICApLFxuICAgICAgICAvLyBOb24tY29uZmlndXJhYmxlIGZvciBjbGFzc2VzXG4gICAgICAgIC8vIHByZXZlbnRzIGFjY2lkZW50YWwgZmllbGQgcmVkZWZpbml0aW9uIGluIHN1YmNsYXNzXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogc2FmZURlc2NyaXB0b3JzID8gYWRtLmlzUGxhaW5PYmplY3RfIDogdHJ1ZSxcbiAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL21vYnhqcy9tb2J4L3B1bGwvMjY0MSNpc3N1ZWNvbW1lbnQtNzM3MjkyMDU4XG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICAvLyBOb24tb2JzZXZhYmxlLCB0aGVyZWZvcmUgbm9uLXdyaXRhYmxlXG4gICAgICAgIC8vIEFsc28gcHJldmVudHMgcmV3cml0aW5nIGluIHN1YmNsYXNzIGNvbnN0cnVjdG9yXG4gICAgICAgIHdyaXRhYmxlOiBzYWZlRGVzY3JpcHRvcnMgPyBmYWxzZSA6IHRydWVcbiAgICB9XG59XG4iLCJpbXBvcnQge1xuICAgIE9ic2VydmFibGVPYmplY3RBZG1pbmlzdHJhdGlvbixcbiAgICBBbm5vdGF0aW9uLFxuICAgIGRlZmluZVByb3BlcnR5LFxuICAgIGRpZSxcbiAgICBmbG93LFxuICAgIGlzRmxvdyxcbiAgICBpc0Z1bmN0aW9uLFxuICAgIGdsb2JhbFN0YXRlLFxuICAgIE1ha2VSZXN1bHQsXG4gICAgaGFzUHJvcFxufSBmcm9tIFwiLi4vaW50ZXJuYWxcIlxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRmxvd0Fubm90YXRpb24obmFtZTogc3RyaW5nLCBvcHRpb25zPzogb2JqZWN0KTogQW5ub3RhdGlvbiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgYW5ub3RhdGlvblR5cGVfOiBuYW1lLFxuICAgICAgICBvcHRpb25zXzogb3B0aW9ucyxcbiAgICAgICAgbWFrZV8sXG4gICAgICAgIGV4dGVuZF9cbiAgICB9XG59XG5cbmZ1bmN0aW9uIG1ha2VfKFxuICAgIGFkbTogT2JzZXJ2YWJsZU9iamVjdEFkbWluaXN0cmF0aW9uLFxuICAgIGtleTogUHJvcGVydHlLZXksXG4gICAgZGVzY3JpcHRvcjogUHJvcGVydHlEZXNjcmlwdG9yLFxuICAgIHNvdXJjZTogb2JqZWN0XG4pOiBNYWtlUmVzdWx0IHtcbiAgICAvLyBvd25cbiAgICBpZiAoc291cmNlID09PSBhZG0udGFyZ2V0Xykge1xuICAgICAgICByZXR1cm4gdGhpcy5leHRlbmRfKGFkbSwga2V5LCBkZXNjcmlwdG9yLCBmYWxzZSkgPT09IG51bGxcbiAgICAgICAgICAgID8gTWFrZVJlc3VsdC5DYW5jZWxcbiAgICAgICAgICAgIDogTWFrZVJlc3VsdC5Db250aW51ZVxuICAgIH1cbiAgICAvLyBwcm90b3R5cGVcbiAgICAvLyBib3VuZCAtIG11c3QgYW5ub3RhdGUgcHJvdG9zIHRvIHN1cHBvcnQgc3VwZXIuZmxvdygpXG4gICAgaWYgKHRoaXMub3B0aW9uc18/LmJvdW5kICYmICghaGFzUHJvcChhZG0udGFyZ2V0Xywga2V5KSB8fCAhaXNGbG93KGFkbS50YXJnZXRfW2tleV0pKSkge1xuICAgICAgICBpZiAodGhpcy5leHRlbmRfKGFkbSwga2V5LCBkZXNjcmlwdG9yLCBmYWxzZSkgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBNYWtlUmVzdWx0LkNhbmNlbFxuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChpc0Zsb3coZGVzY3JpcHRvci52YWx1ZSkpIHtcbiAgICAgICAgLy8gQSBwcm90b3R5cGUgY291bGQgaGF2ZSBiZWVuIGFubm90YXRlZCBhbHJlYWR5IGJ5IG90aGVyIGNvbnN0cnVjdG9yLFxuICAgICAgICAvLyByZXN0IG9mIHRoZSBwcm90byBjaGFpbiBtdXN0IGJlIGFubm90YXRlZCBhbHJlYWR5XG4gICAgICAgIHJldHVybiBNYWtlUmVzdWx0LkJyZWFrXG4gICAgfVxuICAgIGNvbnN0IGZsb3dEZXNjcmlwdG9yID0gY3JlYXRlRmxvd0Rlc2NyaXB0b3IoYWRtLCB0aGlzLCBrZXksIGRlc2NyaXB0b3IsIGZhbHNlLCBmYWxzZSlcbiAgICBkZWZpbmVQcm9wZXJ0eShzb3VyY2UsIGtleSwgZmxvd0Rlc2NyaXB0b3IpXG4gICAgcmV0dXJuIE1ha2VSZXN1bHQuQ29udGludWVcbn1cblxuZnVuY3Rpb24gZXh0ZW5kXyhcbiAgICBhZG06IE9ic2VydmFibGVPYmplY3RBZG1pbmlzdHJhdGlvbixcbiAgICBrZXk6IFByb3BlcnR5S2V5LFxuICAgIGRlc2NyaXB0b3I6IFByb3BlcnR5RGVzY3JpcHRvcixcbiAgICBwcm94eVRyYXA6IGJvb2xlYW5cbik6IGJvb2xlYW4gfCBudWxsIHtcbiAgICBjb25zdCBmbG93RGVzY3JpcHRvciA9IGNyZWF0ZUZsb3dEZXNjcmlwdG9yKGFkbSwgdGhpcywga2V5LCBkZXNjcmlwdG9yLCB0aGlzLm9wdGlvbnNfPy5ib3VuZClcbiAgICByZXR1cm4gYWRtLmRlZmluZVByb3BlcnR5XyhrZXksIGZsb3dEZXNjcmlwdG9yLCBwcm94eVRyYXApXG59XG5cbmZ1bmN0aW9uIGFzc2VydEZsb3dEZXNjcmlwdG9yKFxuICAgIGFkbTogT2JzZXJ2YWJsZU9iamVjdEFkbWluaXN0cmF0aW9uLFxuICAgIHsgYW5ub3RhdGlvblR5cGVfIH06IEFubm90YXRpb24sXG4gICAga2V5OiBQcm9wZXJ0eUtleSxcbiAgICB7IHZhbHVlIH06IFByb3BlcnR5RGVzY3JpcHRvclxuKSB7XG4gICAgaWYgKF9fREVWX18gJiYgIWlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgICAgIGRpZShcbiAgICAgICAgICAgIGBDYW5ub3QgYXBwbHkgJyR7YW5ub3RhdGlvblR5cGVffScgdG8gJyR7YWRtLm5hbWVffS4ke2tleS50b1N0cmluZygpfSc6YCArXG4gICAgICAgICAgICAgICAgYFxcbicke2Fubm90YXRpb25UeXBlX30nIGNhbiBvbmx5IGJlIHVzZWQgb24gcHJvcGVydGllcyB3aXRoIGEgZ2VuZXJhdG9yIGZ1bmN0aW9uIHZhbHVlLmBcbiAgICAgICAgKVxuICAgIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlRmxvd0Rlc2NyaXB0b3IoXG4gICAgYWRtOiBPYnNlcnZhYmxlT2JqZWN0QWRtaW5pc3RyYXRpb24sXG4gICAgYW5ub3RhdGlvbjogQW5ub3RhdGlvbixcbiAgICBrZXk6IFByb3BlcnR5S2V5LFxuICAgIGRlc2NyaXB0b3I6IFByb3BlcnR5RGVzY3JpcHRvcixcbiAgICBib3VuZDogYm9vbGVhbixcbiAgICAvLyBwcm92aWRlcyBhYmlsaXR5IHRvIGRpc2FibGUgc2FmZURlc2NyaXB0b3JzIGZvciBwcm90b3R5cGVzXG4gICAgc2FmZURlc2NyaXB0b3JzOiBib29sZWFuID0gZ2xvYmFsU3RhdGUuc2FmZURlc2NyaXB0b3JzXG4pOiBQcm9wZXJ0eURlc2NyaXB0b3Ige1xuICAgIGFzc2VydEZsb3dEZXNjcmlwdG9yKGFkbSwgYW5ub3RhdGlvbiwga2V5LCBkZXNjcmlwdG9yKVxuICAgIGxldCB7IHZhbHVlIH0gPSBkZXNjcmlwdG9yXG4gICAgLy8gSW4gY2FzZSBvZiBmbG93LmJvdW5kLCB0aGUgZGVzY3JpcHRvciBjYW4gYmUgZnJvbSBhbHJlYWR5IGFubm90YXRlZCBwcm90b3R5cGVcbiAgICBpZiAoIWlzRmxvdyh2YWx1ZSkpIHtcbiAgICAgICAgdmFsdWUgPSBmbG93KHZhbHVlKVxuICAgIH1cbiAgICBpZiAoYm91bmQpIHtcbiAgICAgICAgLy8gV2UgZG8gbm90IGtlZXAgb3JpZ2luYWwgZnVuY3Rpb24gYXJvdW5kLCBzbyB3ZSBiaW5kIHRoZSBleGlzdGluZyBmbG93XG4gICAgICAgIHZhbHVlID0gdmFsdWUuYmluZChhZG0ucHJveHlfID8/IGFkbS50YXJnZXRfKVxuICAgICAgICAvLyBUaGlzIGlzIG5vcm1hbGx5IHNldCBieSBgZmxvd2AsIGJ1dCBgYmluZGAgcmV0dXJucyBuZXcgZnVuY3Rpb24uLi5cbiAgICAgICAgdmFsdWUuaXNNb2JYRmxvdyA9IHRydWVcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmFsdWUsXG4gICAgICAgIC8vIE5vbi1jb25maWd1cmFibGUgZm9yIGNsYXNzZXNcbiAgICAgICAgLy8gcHJldmVudHMgYWNjaWRlbnRhbCBmaWVsZCByZWRlZmluaXRpb24gaW4gc3ViY2xhc3NcbiAgICAgICAgY29uZmlndXJhYmxlOiBzYWZlRGVzY3JpcHRvcnMgPyBhZG0uaXNQbGFpbk9iamVjdF8gOiB0cnVlLFxuICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vbW9ieGpzL21vYngvcHVsbC8yNjQxI2lzc3VlY29tbWVudC03MzcyOTIwNThcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIC8vIE5vbi1vYnNldmFibGUsIHRoZXJlZm9yZSBub24td3JpdGFibGVcbiAgICAgICAgLy8gQWxzbyBwcmV2ZW50cyByZXdyaXRpbmcgaW4gc3ViY2xhc3MgY29uc3RydWN0b3JcbiAgICAgICAgd3JpdGFibGU6IHNhZmVEZXNjcmlwdG9ycyA/IGZhbHNlIDogdHJ1ZVxuICAgIH1cbn1cbiIsImltcG9ydCB7IE9ic2VydmFibGVPYmplY3RBZG1pbmlzdHJhdGlvbiwgZGllLCBBbm5vdGF0aW9uLCBNYWtlUmVzdWx0IH0gZnJvbSBcIi4uL2ludGVybmFsXCJcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUNvbXB1dGVkQW5ub3RhdGlvbihuYW1lOiBzdHJpbmcsIG9wdGlvbnM/OiBvYmplY3QpOiBBbm5vdGF0aW9uIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBhbm5vdGF0aW9uVHlwZV86IG5hbWUsXG4gICAgICAgIG9wdGlvbnNfOiBvcHRpb25zLFxuICAgICAgICBtYWtlXyxcbiAgICAgICAgZXh0ZW5kX1xuICAgIH1cbn1cblxuZnVuY3Rpb24gbWFrZV8oXG4gICAgYWRtOiBPYnNlcnZhYmxlT2JqZWN0QWRtaW5pc3RyYXRpb24sXG4gICAga2V5OiBQcm9wZXJ0eUtleSxcbiAgICBkZXNjcmlwdG9yOiBQcm9wZXJ0eURlc2NyaXB0b3Jcbik6IE1ha2VSZXN1bHQge1xuICAgIHJldHVybiB0aGlzLmV4dGVuZF8oYWRtLCBrZXksIGRlc2NyaXB0b3IsIGZhbHNlKSA9PT0gbnVsbCA/IE1ha2VSZXN1bHQuQ2FuY2VsIDogTWFrZVJlc3VsdC5CcmVha1xufVxuXG5mdW5jdGlvbiBleHRlbmRfKFxuICAgIGFkbTogT2JzZXJ2YWJsZU9iamVjdEFkbWluaXN0cmF0aW9uLFxuICAgIGtleTogUHJvcGVydHlLZXksXG4gICAgZGVzY3JpcHRvcjogUHJvcGVydHlEZXNjcmlwdG9yLFxuICAgIHByb3h5VHJhcDogYm9vbGVhblxuKTogYm9vbGVhbiB8IG51bGwge1xuICAgIGFzc2VydENvbXB1dGVkRGVzY3JpcHRvcihhZG0sIHRoaXMsIGtleSwgZGVzY3JpcHRvcilcbiAgICByZXR1cm4gYWRtLmRlZmluZUNvbXB1dGVkUHJvcGVydHlfKFxuICAgICAgICBrZXksXG4gICAgICAgIHtcbiAgICAgICAgICAgIC4uLnRoaXMub3B0aW9uc18sXG4gICAgICAgICAgICBnZXQ6IGRlc2NyaXB0b3IuZ2V0LFxuICAgICAgICAgICAgc2V0OiBkZXNjcmlwdG9yLnNldFxuICAgICAgICB9LFxuICAgICAgICBwcm94eVRyYXBcbiAgICApXG59XG5cbmZ1bmN0aW9uIGFzc2VydENvbXB1dGVkRGVzY3JpcHRvcihcbiAgICBhZG06IE9ic2VydmFibGVPYmplY3RBZG1pbmlzdHJhdGlvbixcbiAgICB7IGFubm90YXRpb25UeXBlXyB9OiBBbm5vdGF0aW9uLFxuICAgIGtleTogUHJvcGVydHlLZXksXG4gICAgeyBnZXQgfTogUHJvcGVydHlEZXNjcmlwdG9yXG4pIHtcbiAgICBpZiAoX19ERVZfXyAmJiAhZ2V0KSB7XG4gICAgICAgIGRpZShcbiAgICAgICAgICAgIGBDYW5ub3QgYXBwbHkgJyR7YW5ub3RhdGlvblR5cGVffScgdG8gJyR7YWRtLm5hbWVffS4ke2tleS50b1N0cmluZygpfSc6YCArXG4gICAgICAgICAgICAgICAgYFxcbicke2Fubm90YXRpb25UeXBlX30nIGNhbiBvbmx5IGJlIHVzZWQgb24gZ2V0dGVyKCtzZXR0ZXIpIHByb3BlcnRpZXMuYFxuICAgICAgICApXG4gICAgfVxufVxuIiwiaW1wb3J0IHtcbiAgICBPYnNlcnZhYmxlT2JqZWN0QWRtaW5pc3RyYXRpb24sXG4gICAgZGVlcEVuaGFuY2VyLFxuICAgIGRpZSxcbiAgICBBbm5vdGF0aW9uLFxuICAgIE1ha2VSZXN1bHRcbn0gZnJvbSBcIi4uL2ludGVybmFsXCJcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU9ic2VydmFibGVBbm5vdGF0aW9uKG5hbWU6IHN0cmluZywgb3B0aW9ucz86IG9iamVjdCk6IEFubm90YXRpb24ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGFubm90YXRpb25UeXBlXzogbmFtZSxcbiAgICAgICAgb3B0aW9uc186IG9wdGlvbnMsXG4gICAgICAgIG1ha2VfLFxuICAgICAgICBleHRlbmRfXG4gICAgfVxufVxuXG5mdW5jdGlvbiBtYWtlXyhcbiAgICBhZG06IE9ic2VydmFibGVPYmplY3RBZG1pbmlzdHJhdGlvbixcbiAgICBrZXk6IFByb3BlcnR5S2V5LFxuICAgIGRlc2NyaXB0b3I6IFByb3BlcnR5RGVzY3JpcHRvclxuKTogTWFrZVJlc3VsdCB7XG4gICAgcmV0dXJuIHRoaXMuZXh0ZW5kXyhhZG0sIGtleSwgZGVzY3JpcHRvciwgZmFsc2UpID09PSBudWxsID8gTWFrZVJlc3VsdC5DYW5jZWwgOiBNYWtlUmVzdWx0LkJyZWFrXG59XG5cbmZ1bmN0aW9uIGV4dGVuZF8oXG4gICAgYWRtOiBPYnNlcnZhYmxlT2JqZWN0QWRtaW5pc3RyYXRpb24sXG4gICAga2V5OiBQcm9wZXJ0eUtleSxcbiAgICBkZXNjcmlwdG9yOiBQcm9wZXJ0eURlc2NyaXB0b3IsXG4gICAgcHJveHlUcmFwOiBib29sZWFuXG4pOiBib29sZWFuIHwgbnVsbCB7XG4gICAgYXNzZXJ0T2JzZXJ2YWJsZURlc2NyaXB0b3IoYWRtLCB0aGlzLCBrZXksIGRlc2NyaXB0b3IpXG4gICAgcmV0dXJuIGFkbS5kZWZpbmVPYnNlcnZhYmxlUHJvcGVydHlfKFxuICAgICAgICBrZXksXG4gICAgICAgIGRlc2NyaXB0b3IudmFsdWUsXG4gICAgICAgIHRoaXMub3B0aW9uc18/LmVuaGFuY2VyID8/IGRlZXBFbmhhbmNlcixcbiAgICAgICAgcHJveHlUcmFwXG4gICAgKVxufVxuXG5mdW5jdGlvbiBhc3NlcnRPYnNlcnZhYmxlRGVzY3JpcHRvcihcbiAgICBhZG06IE9ic2VydmFibGVPYmplY3RBZG1pbmlzdHJhdGlvbixcbiAgICB7IGFubm90YXRpb25UeXBlXyB9OiBBbm5vdGF0aW9uLFxuICAgIGtleTogUHJvcGVydHlLZXksXG4gICAgZGVzY3JpcHRvcjogUHJvcGVydHlEZXNjcmlwdG9yXG4pIHtcbiAgICBpZiAoX19ERVZfXyAmJiAhKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSkge1xuICAgICAgICBkaWUoXG4gICAgICAgICAgICBgQ2Fubm90IGFwcGx5ICcke2Fubm90YXRpb25UeXBlX30nIHRvICcke2FkbS5uYW1lX30uJHtrZXkudG9TdHJpbmcoKX0nOmAgK1xuICAgICAgICAgICAgICAgIGBcXG4nJHthbm5vdGF0aW9uVHlwZV99JyBjYW5ub3QgYmUgdXNlZCBvbiBnZXR0ZXIvc2V0dGVyIHByb3BlcnRpZXNgXG4gICAgICAgIClcbiAgICB9XG59XG4iLCJpbXBvcnQge1xuICAgIE9ic2VydmFibGVPYmplY3RBZG1pbmlzdHJhdGlvbixcbiAgICBvYnNlcnZhYmxlLFxuICAgIEFubm90YXRpb24sXG4gICAgZGVmaW5lUHJvcGVydHksXG4gICAgY3JlYXRlQWN0aW9uLFxuICAgIGdsb2JhbFN0YXRlLFxuICAgIGZsb3csXG4gICAgY29tcHV0ZWQsXG4gICAgYXV0b0FjdGlvbixcbiAgICBpc0dlbmVyYXRvcixcbiAgICBNYWtlUmVzdWx0XG59IGZyb20gXCIuLi9pbnRlcm5hbFwiXG5cbmNvbnN0IEFVVE8gPSBcInRydWVcIlxuXG5leHBvcnQgY29uc3QgYXV0b0Fubm90YXRpb246IEFubm90YXRpb24gPSBjcmVhdGVBdXRvQW5ub3RhdGlvbigpXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVBdXRvQW5ub3RhdGlvbihvcHRpb25zPzogb2JqZWN0KTogQW5ub3RhdGlvbiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgYW5ub3RhdGlvblR5cGVfOiBBVVRPLFxuICAgICAgICBvcHRpb25zXzogb3B0aW9ucyxcbiAgICAgICAgbWFrZV8sXG4gICAgICAgIGV4dGVuZF9cbiAgICB9XG59XG5cbmZ1bmN0aW9uIG1ha2VfKFxuICAgIGFkbTogT2JzZXJ2YWJsZU9iamVjdEFkbWluaXN0cmF0aW9uLFxuICAgIGtleTogUHJvcGVydHlLZXksXG4gICAgZGVzY3JpcHRvcjogUHJvcGVydHlEZXNjcmlwdG9yLFxuICAgIHNvdXJjZTogb2JqZWN0XG4pOiBNYWtlUmVzdWx0IHtcbiAgICAvLyBnZXR0ZXIgLT4gY29tcHV0ZWRcbiAgICBpZiAoZGVzY3JpcHRvci5nZXQpIHtcbiAgICAgICAgcmV0dXJuIGNvbXB1dGVkLm1ha2VfKGFkbSwga2V5LCBkZXNjcmlwdG9yLCBzb3VyY2UpXG4gICAgfVxuICAgIC8vIGxvbmUgc2V0dGVyIC0+IGFjdGlvbiBzZXR0ZXJcbiAgICBpZiAoZGVzY3JpcHRvci5zZXQpIHtcbiAgICAgICAgLy8gVE9ETyBtYWtlIGFjdGlvbiBhcHBsaWNhYmxlIHRvIHNldHRlciBhbmQgZGVsZWdhdGUgdG8gYWN0aW9uLm1ha2VfXG4gICAgICAgIGNvbnN0IHNldCA9IGNyZWF0ZUFjdGlvbihrZXkudG9TdHJpbmcoKSwgZGVzY3JpcHRvci5zZXQpIGFzICh2OiBhbnkpID0+IHZvaWRcbiAgICAgICAgLy8gb3duXG4gICAgICAgIGlmIChzb3VyY2UgPT09IGFkbS50YXJnZXRfKSB7XG4gICAgICAgICAgICByZXR1cm4gYWRtLmRlZmluZVByb3BlcnR5XyhrZXksIHtcbiAgICAgICAgICAgICAgICBjb25maWd1cmFibGU6IGdsb2JhbFN0YXRlLnNhZmVEZXNjcmlwdG9ycyA/IGFkbS5pc1BsYWluT2JqZWN0XyA6IHRydWUsXG4gICAgICAgICAgICAgICAgc2V0XG4gICAgICAgICAgICB9KSA9PT0gbnVsbFxuICAgICAgICAgICAgICAgID8gTWFrZVJlc3VsdC5DYW5jZWxcbiAgICAgICAgICAgICAgICA6IE1ha2VSZXN1bHQuQ29udGludWVcbiAgICAgICAgfVxuICAgICAgICAvLyBwcm90b1xuICAgICAgICBkZWZpbmVQcm9wZXJ0eShzb3VyY2UsIGtleSwge1xuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgc2V0XG4gICAgICAgIH0pXG4gICAgICAgIHJldHVybiBNYWtlUmVzdWx0LkNvbnRpbnVlXG4gICAgfVxuICAgIC8vIGZ1bmN0aW9uIG9uIHByb3RvIC0+IGF1dG9BY3Rpb24vZmxvd1xuICAgIGlmIChzb3VyY2UgIT09IGFkbS50YXJnZXRfICYmIHR5cGVvZiBkZXNjcmlwdG9yLnZhbHVlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgaWYgKGlzR2VuZXJhdG9yKGRlc2NyaXB0b3IudmFsdWUpKSB7XG4gICAgICAgICAgICBjb25zdCBmbG93QW5ub3RhdGlvbiA9IHRoaXMub3B0aW9uc18/LmF1dG9CaW5kID8gZmxvdy5ib3VuZCA6IGZsb3dcbiAgICAgICAgICAgIHJldHVybiBmbG93QW5ub3RhdGlvbi5tYWtlXyhhZG0sIGtleSwgZGVzY3JpcHRvciwgc291cmNlKVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGFjdGlvbkFubm90YXRpb24gPSB0aGlzLm9wdGlvbnNfPy5hdXRvQmluZCA/IGF1dG9BY3Rpb24uYm91bmQgOiBhdXRvQWN0aW9uXG4gICAgICAgIHJldHVybiBhY3Rpb25Bbm5vdGF0aW9uLm1ha2VfKGFkbSwga2V5LCBkZXNjcmlwdG9yLCBzb3VyY2UpXG4gICAgfVxuICAgIC8vIG90aGVyIC0+IG9ic2VydmFibGVcbiAgICAvLyBDb3B5IHByb3BzIGZyb20gcHJvdG8gYXMgd2VsbCwgc2VlIHRlc3Q6XG4gICAgLy8gXCJkZWNvcmF0ZSBzaG91bGQgd29yayB3aXRoIE9iamVjdC5jcmVhdGVcIlxuICAgIGxldCBvYnNlcnZhYmxlQW5ub3RhdGlvbiA9IHRoaXMub3B0aW9uc18/LmRlZXAgPT09IGZhbHNlID8gb2JzZXJ2YWJsZS5yZWYgOiBvYnNlcnZhYmxlXG4gICAgLy8gaWYgZnVuY3Rpb24gcmVzcGVjdCBhdXRvQmluZCBvcHRpb25cbiAgICBpZiAodHlwZW9mIGRlc2NyaXB0b3IudmFsdWUgPT09IFwiZnVuY3Rpb25cIiAmJiB0aGlzLm9wdGlvbnNfPy5hdXRvQmluZCkge1xuICAgICAgICBkZXNjcmlwdG9yLnZhbHVlID0gZGVzY3JpcHRvci52YWx1ZS5iaW5kKGFkbS5wcm94eV8gPz8gYWRtLnRhcmdldF8pXG4gICAgfVxuICAgIHJldHVybiBvYnNlcnZhYmxlQW5ub3RhdGlvbi5tYWtlXyhhZG0sIGtleSwgZGVzY3JpcHRvciwgc291cmNlKVxufVxuXG5mdW5jdGlvbiBleHRlbmRfKFxuICAgIGFkbTogT2JzZXJ2YWJsZU9iamVjdEFkbWluaXN0cmF0aW9uLFxuICAgIGtleTogUHJvcGVydHlLZXksXG4gICAgZGVzY3JpcHRvcjogUHJvcGVydHlEZXNjcmlwdG9yLFxuICAgIHByb3h5VHJhcDogYm9vbGVhblxuKTogYm9vbGVhbiB8IG51bGwge1xuICAgIC8vIGdldHRlciAtPiBjb21wdXRlZFxuICAgIGlmIChkZXNjcmlwdG9yLmdldCkge1xuICAgICAgICByZXR1cm4gY29tcHV0ZWQuZXh0ZW5kXyhhZG0sIGtleSwgZGVzY3JpcHRvciwgcHJveHlUcmFwKVxuICAgIH1cbiAgICAvLyBsb25lIHNldHRlciAtPiBhY3Rpb24gc2V0dGVyXG4gICAgaWYgKGRlc2NyaXB0b3Iuc2V0KSB7XG4gICAgICAgIC8vIFRPRE8gbWFrZSBhY3Rpb24gYXBwbGljYWJsZSB0byBzZXR0ZXIgYW5kIGRlbGVnYXRlIHRvIGFjdGlvbi5leHRlbmRfXG4gICAgICAgIHJldHVybiBhZG0uZGVmaW5lUHJvcGVydHlfKFxuICAgICAgICAgICAga2V5LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogZ2xvYmFsU3RhdGUuc2FmZURlc2NyaXB0b3JzID8gYWRtLmlzUGxhaW5PYmplY3RfIDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBzZXQ6IGNyZWF0ZUFjdGlvbihrZXkudG9TdHJpbmcoKSwgZGVzY3JpcHRvci5zZXQpIGFzICh2OiBhbnkpID0+IHZvaWRcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwcm94eVRyYXBcbiAgICAgICAgKVxuICAgIH1cbiAgICAvLyBvdGhlciAtPiBvYnNlcnZhYmxlXG4gICAgLy8gaWYgZnVuY3Rpb24gcmVzcGVjdCBhdXRvQmluZCBvcHRpb25cbiAgICBpZiAodHlwZW9mIGRlc2NyaXB0b3IudmFsdWUgPT09IFwiZnVuY3Rpb25cIiAmJiB0aGlzLm9wdGlvbnNfPy5hdXRvQmluZCkge1xuICAgICAgICBkZXNjcmlwdG9yLnZhbHVlID0gZGVzY3JpcHRvci52YWx1ZS5iaW5kKGFkbS5wcm94eV8gPz8gYWRtLnRhcmdldF8pXG4gICAgfVxuICAgIGxldCBvYnNlcnZhYmxlQW5ub3RhdGlvbiA9IHRoaXMub3B0aW9uc18/LmRlZXAgPT09IGZhbHNlID8gb2JzZXJ2YWJsZS5yZWYgOiBvYnNlcnZhYmxlXG4gICAgcmV0dXJuIG9ic2VydmFibGVBbm5vdGF0aW9uLmV4dGVuZF8oYWRtLCBrZXksIGRlc2NyaXB0b3IsIHByb3h5VHJhcClcbn1cbiIsImltcG9ydCB7XG4gICAgSUVuaGFuY2VyLFxuICAgIElFcXVhbHNDb21wYXJlcixcbiAgICBJT2JzZXJ2YWJsZUFycmF5LFxuICAgIElPYnNlcnZhYmxlTWFwSW5pdGlhbFZhbHVlcyxcbiAgICBJT2JzZXJ2YWJsZVNldEluaXRpYWxWYWx1ZXMsXG4gICAgSU9ic2VydmFibGVWYWx1ZSxcbiAgICBPYnNlcnZhYmxlTWFwLFxuICAgIE9ic2VydmFibGVTZXQsXG4gICAgT2JzZXJ2YWJsZVZhbHVlLFxuICAgIGFzRHluYW1pY09ic2VydmFibGVPYmplY3QsXG4gICAgY3JlYXRlT2JzZXJ2YWJsZUFycmF5LFxuICAgIGRlZXBFbmhhbmNlcixcbiAgICBleHRlbmRPYnNlcnZhYmxlLFxuICAgIGlzRVM2TWFwLFxuICAgIGlzRVM2U2V0LFxuICAgIGlzT2JzZXJ2YWJsZSxcbiAgICBpc1BsYWluT2JqZWN0LFxuICAgIHJlZmVyZW5jZUVuaGFuY2VyLFxuICAgIEFubm90YXRpb24sXG4gICAgc2hhbGxvd0VuaGFuY2VyLFxuICAgIHJlZlN0cnVjdEVuaGFuY2VyLFxuICAgIEFubm90YXRpb25zTWFwLFxuICAgIGFzT2JzZXJ2YWJsZU9iamVjdCxcbiAgICBzdG9yZUFubm90YXRpb24sXG4gICAgY3JlYXRlRGVjb3JhdG9yQW5ub3RhdGlvbixcbiAgICBjcmVhdGVMZWdhY3lBcnJheSxcbiAgICBnbG9iYWxTdGF0ZSxcbiAgICBhc3NpZ24sXG4gICAgaXNTdHJpbmdpc2gsXG4gICAgY3JlYXRlT2JzZXJ2YWJsZUFubm90YXRpb24sXG4gICAgY3JlYXRlQXV0b0Fubm90YXRpb25cbn0gZnJvbSBcIi4uL2ludGVybmFsXCJcblxuZXhwb3J0IGNvbnN0IE9CU0VSVkFCTEUgPSBcIm9ic2VydmFibGVcIlxuZXhwb3J0IGNvbnN0IE9CU0VSVkFCTEVfUkVGID0gXCJvYnNlcnZhYmxlLnJlZlwiXG5leHBvcnQgY29uc3QgT0JTRVJWQUJMRV9TSEFMTE9XID0gXCJvYnNlcnZhYmxlLnNoYWxsb3dcIlxuZXhwb3J0IGNvbnN0IE9CU0VSVkFCTEVfU1RSVUNUID0gXCJvYnNlcnZhYmxlLnN0cnVjdFwiXG5cbmV4cG9ydCB0eXBlIENyZWF0ZU9ic2VydmFibGVPcHRpb25zID0ge1xuICAgIG5hbWU/OiBzdHJpbmdcbiAgICBlcXVhbHM/OiBJRXF1YWxzQ29tcGFyZXI8YW55PlxuICAgIGRlZXA/OiBib29sZWFuXG4gICAgZGVmYXVsdERlY29yYXRvcj86IEFubm90YXRpb25cbiAgICBwcm94eT86IGJvb2xlYW5cbiAgICBhdXRvQmluZD86IGJvb2xlYW5cbn1cblxuLy8gUHJlZGVmaW5lZCBiYWdzIG9mIGNyZWF0ZSBvYnNlcnZhYmxlIG9wdGlvbnMsIHRvIGF2b2lkIGFsbG9jYXRpbmcgdGVtcG9yYXJpbHkgb3B0aW9uIG9iamVjdHNcbi8vIGluIHRoZSBtYWpvcml0eSBvZiBjYXNlc1xuZXhwb3J0IGNvbnN0IGRlZmF1bHRDcmVhdGVPYnNlcnZhYmxlT3B0aW9uczogQ3JlYXRlT2JzZXJ2YWJsZU9wdGlvbnMgPSB7XG4gICAgZGVlcDogdHJ1ZSxcbiAgICBuYW1lOiB1bmRlZmluZWQsXG4gICAgZGVmYXVsdERlY29yYXRvcjogdW5kZWZpbmVkLFxuICAgIHByb3h5OiB0cnVlXG59XG5PYmplY3QuZnJlZXplKGRlZmF1bHRDcmVhdGVPYnNlcnZhYmxlT3B0aW9ucylcblxuZXhwb3J0IGZ1bmN0aW9uIGFzQ3JlYXRlT2JzZXJ2YWJsZU9wdGlvbnModGhpbmc6IGFueSk6IENyZWF0ZU9ic2VydmFibGVPcHRpb25zIHtcbiAgICByZXR1cm4gdGhpbmcgfHwgZGVmYXVsdENyZWF0ZU9ic2VydmFibGVPcHRpb25zXG59XG5cbmNvbnN0IG9ic2VydmFibGVBbm5vdGF0aW9uID0gY3JlYXRlT2JzZXJ2YWJsZUFubm90YXRpb24oT0JTRVJWQUJMRSlcbmNvbnN0IG9ic2VydmFibGVSZWZBbm5vdGF0aW9uID0gY3JlYXRlT2JzZXJ2YWJsZUFubm90YXRpb24oT0JTRVJWQUJMRV9SRUYsIHtcbiAgICBlbmhhbmNlcjogcmVmZXJlbmNlRW5oYW5jZXJcbn0pXG5jb25zdCBvYnNlcnZhYmxlU2hhbGxvd0Fubm90YXRpb24gPSBjcmVhdGVPYnNlcnZhYmxlQW5ub3RhdGlvbihPQlNFUlZBQkxFX1NIQUxMT1csIHtcbiAgICBlbmhhbmNlcjogc2hhbGxvd0VuaGFuY2VyXG59KVxuY29uc3Qgb2JzZXJ2YWJsZVN0cnVjdEFubm90YXRpb24gPSBjcmVhdGVPYnNlcnZhYmxlQW5ub3RhdGlvbihPQlNFUlZBQkxFX1NUUlVDVCwge1xuICAgIGVuaGFuY2VyOiByZWZTdHJ1Y3RFbmhhbmNlclxufSlcbmNvbnN0IG9ic2VydmFibGVEZWNvcmF0b3JBbm5vdGF0aW9uID0gY3JlYXRlRGVjb3JhdG9yQW5ub3RhdGlvbihvYnNlcnZhYmxlQW5ub3RhdGlvbilcblxuZXhwb3J0IGZ1bmN0aW9uIGdldEVuaGFuY2VyRnJvbU9wdGlvbnMob3B0aW9uczogQ3JlYXRlT2JzZXJ2YWJsZU9wdGlvbnMpOiBJRW5oYW5jZXI8YW55PiB7XG4gICAgcmV0dXJuIG9wdGlvbnMuZGVlcCA9PT0gdHJ1ZVxuICAgICAgICA/IGRlZXBFbmhhbmNlclxuICAgICAgICA6IG9wdGlvbnMuZGVlcCA9PT0gZmFsc2VcbiAgICAgICAgPyByZWZlcmVuY2VFbmhhbmNlclxuICAgICAgICA6IGdldEVuaGFuY2VyRnJvbUFubm90YXRpb24ob3B0aW9ucy5kZWZhdWx0RGVjb3JhdG9yKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0QW5ub3RhdGlvbkZyb21PcHRpb25zKFxuICAgIG9wdGlvbnM/OiBDcmVhdGVPYnNlcnZhYmxlT3B0aW9uc1xuKTogQW5ub3RhdGlvbiB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIG9wdGlvbnMgPyBvcHRpb25zLmRlZmF1bHREZWNvcmF0b3IgPz8gY3JlYXRlQXV0b0Fubm90YXRpb24ob3B0aW9ucykgOiB1bmRlZmluZWRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEVuaGFuY2VyRnJvbUFubm90YXRpb24oYW5ub3RhdGlvbj86IEFubm90YXRpb24pOiBJRW5oYW5jZXI8YW55PiB7XG4gICAgcmV0dXJuICFhbm5vdGF0aW9uID8gZGVlcEVuaGFuY2VyIDogYW5ub3RhdGlvbi5vcHRpb25zXz8uZW5oYW5jZXIgPz8gZGVlcEVuaGFuY2VyXG59XG5cbi8qKlxuICogVHVybnMgYW4gb2JqZWN0LCBhcnJheSBvciBmdW5jdGlvbiBpbnRvIGEgcmVhY3RpdmUgc3RydWN0dXJlLlxuICogQHBhcmFtIHYgdGhlIHZhbHVlIHdoaWNoIHNob3VsZCBiZWNvbWUgb2JzZXJ2YWJsZS5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlT2JzZXJ2YWJsZSh2OiBhbnksIGFyZzI/OiBhbnksIGFyZzM/OiBhbnkpIHtcbiAgICAvLyBAb2JzZXJ2YWJsZSBzb21lUHJvcDtcbiAgICBpZiAoaXNTdHJpbmdpc2goYXJnMikpIHtcbiAgICAgICAgc3RvcmVBbm5vdGF0aW9uKHYsIGFyZzIsIG9ic2VydmFibGVBbm5vdGF0aW9uKVxuICAgICAgICByZXR1cm5cbiAgICB9XG5cbiAgICAvLyBhbHJlYWR5IG9ic2VydmFibGUgLSBpZ25vcmVcbiAgICBpZiAoaXNPYnNlcnZhYmxlKHYpKSB7XG4gICAgICAgIHJldHVybiB2XG4gICAgfVxuXG4gICAgLy8gcGxhaW4gb2JqZWN0XG4gICAgaWYgKGlzUGxhaW5PYmplY3QodikpIHtcbiAgICAgICAgcmV0dXJuIG9ic2VydmFibGUub2JqZWN0KHYsIGFyZzIsIGFyZzMpXG4gICAgfVxuXG4gICAgLy8gQXJyYXlcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2KSkge1xuICAgICAgICByZXR1cm4gb2JzZXJ2YWJsZS5hcnJheSh2LCBhcmcyKVxuICAgIH1cblxuICAgIC8vIE1hcFxuICAgIGlmIChpc0VTNk1hcCh2KSkge1xuICAgICAgICByZXR1cm4gb2JzZXJ2YWJsZS5tYXAodiwgYXJnMilcbiAgICB9XG5cbiAgICAvLyBTZXRcbiAgICBpZiAoaXNFUzZTZXQodikpIHtcbiAgICAgICAgcmV0dXJuIG9ic2VydmFibGUuc2V0KHYsIGFyZzIpXG4gICAgfVxuXG4gICAgLy8gb3RoZXIgb2JqZWN0IC0gaWdub3JlXG4gICAgaWYgKHR5cGVvZiB2ID09PSBcIm9iamVjdFwiICYmIHYgIT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHZcbiAgICB9XG5cbiAgICAvLyBhbnl0aGluZyBlbHNlXG4gICAgcmV0dXJuIG9ic2VydmFibGUuYm94KHYsIGFyZzIpXG59XG5hc3NpZ24oY3JlYXRlT2JzZXJ2YWJsZSwgb2JzZXJ2YWJsZURlY29yYXRvckFubm90YXRpb24pXG5cbmV4cG9ydCBpbnRlcmZhY2UgSU9ic2VydmFibGVWYWx1ZUZhY3Rvcnkge1xuICAgIDxUPih2YWx1ZTogVCwgb3B0aW9ucz86IENyZWF0ZU9ic2VydmFibGVPcHRpb25zKTogSU9ic2VydmFibGVWYWx1ZTxUPlxuICAgIDxUPih2YWx1ZT86IFQsIG9wdGlvbnM/OiBDcmVhdGVPYnNlcnZhYmxlT3B0aW9ucyk6IElPYnNlcnZhYmxlVmFsdWU8VCB8IHVuZGVmaW5lZD5cbn1cblxuZXhwb3J0IGludGVyZmFjZSBJT2JzZXJ2YWJsZUZhY3RvcnkgZXh0ZW5kcyBBbm5vdGF0aW9uLCBQcm9wZXJ0eURlY29yYXRvciB7XG4gICAgPFQgPSBhbnk+KHZhbHVlOiBUW10sIG9wdGlvbnM/OiBDcmVhdGVPYnNlcnZhYmxlT3B0aW9ucyk6IElPYnNlcnZhYmxlQXJyYXk8VD5cbiAgICA8VCA9IGFueT4odmFsdWU6IFNldDxUPiwgb3B0aW9ucz86IENyZWF0ZU9ic2VydmFibGVPcHRpb25zKTogT2JzZXJ2YWJsZVNldDxUPlxuICAgIDxLID0gYW55LCBWID0gYW55Pih2YWx1ZTogTWFwPEssIFY+LCBvcHRpb25zPzogQ3JlYXRlT2JzZXJ2YWJsZU9wdGlvbnMpOiBPYnNlcnZhYmxlTWFwPEssIFY+XG4gICAgPFQgZXh0ZW5kcyBvYmplY3Q+KFxuICAgICAgICB2YWx1ZTogVCxcbiAgICAgICAgZGVjb3JhdG9ycz86IEFubm90YXRpb25zTWFwPFQsIG5ldmVyPixcbiAgICAgICAgb3B0aW9ucz86IENyZWF0ZU9ic2VydmFibGVPcHRpb25zXG4gICAgKTogVFxuXG4gICAgYm94OiBJT2JzZXJ2YWJsZVZhbHVlRmFjdG9yeVxuICAgIGFycmF5OiA8VCA9IGFueT4oaW5pdGlhbFZhbHVlcz86IFRbXSwgb3B0aW9ucz86IENyZWF0ZU9ic2VydmFibGVPcHRpb25zKSA9PiBJT2JzZXJ2YWJsZUFycmF5PFQ+XG4gICAgc2V0OiA8VCA9IGFueT4oXG4gICAgICAgIGluaXRpYWxWYWx1ZXM/OiBJT2JzZXJ2YWJsZVNldEluaXRpYWxWYWx1ZXM8VD4sXG4gICAgICAgIG9wdGlvbnM/OiBDcmVhdGVPYnNlcnZhYmxlT3B0aW9uc1xuICAgICkgPT4gT2JzZXJ2YWJsZVNldDxUPlxuICAgIG1hcDogPEsgPSBhbnksIFYgPSBhbnk+KFxuICAgICAgICBpbml0aWFsVmFsdWVzPzogSU9ic2VydmFibGVNYXBJbml0aWFsVmFsdWVzPEssIFY+LFxuICAgICAgICBvcHRpb25zPzogQ3JlYXRlT2JzZXJ2YWJsZU9wdGlvbnNcbiAgICApID0+IE9ic2VydmFibGVNYXA8SywgVj5cbiAgICBvYmplY3Q6IDxUID0gYW55PihcbiAgICAgICAgcHJvcHM6IFQsXG4gICAgICAgIGRlY29yYXRvcnM/OiBBbm5vdGF0aW9uc01hcDxULCBuZXZlcj4sXG4gICAgICAgIG9wdGlvbnM/OiBDcmVhdGVPYnNlcnZhYmxlT3B0aW9uc1xuICAgICkgPT4gVFxuXG4gICAgLyoqXG4gICAgICogRGVjb3JhdG9yIHRoYXQgY3JlYXRlcyBhbiBvYnNlcnZhYmxlIHRoYXQgb25seSBvYnNlcnZlcyB0aGUgcmVmZXJlbmNlcywgYnV0IGRvZXNuJ3QgdHJ5IHRvIHR1cm4gdGhlIGFzc2lnbmVkIHZhbHVlIGludG8gYW4gb2JzZXJ2YWJsZS50cy5cbiAgICAgKi9cbiAgICByZWY6IEFubm90YXRpb24gJiBQcm9wZXJ0eURlY29yYXRvclxuICAgIC8qKlxuICAgICAqIERlY29yYXRvciB0aGF0IGNyZWF0ZXMgYW4gb2JzZXJ2YWJsZSBjb252ZXJ0cyBpdHMgdmFsdWUgKG9iamVjdHMsIG1hcHMgb3IgYXJyYXlzKSBpbnRvIGEgc2hhbGxvdyBvYnNlcnZhYmxlIHN0cnVjdHVyZVxuICAgICAqL1xuICAgIHNoYWxsb3c6IEFubm90YXRpb24gJiBQcm9wZXJ0eURlY29yYXRvclxuICAgIGRlZXA6IEFubm90YXRpb24gJiBQcm9wZXJ0eURlY29yYXRvclxuICAgIHN0cnVjdDogQW5ub3RhdGlvbiAmIFByb3BlcnR5RGVjb3JhdG9yXG59XG5cbmNvbnN0IG9ic2VydmFibGVGYWN0b3JpZXM6IElPYnNlcnZhYmxlRmFjdG9yeSA9IHtcbiAgICBib3g8VCA9IGFueT4odmFsdWU6IFQsIG9wdGlvbnM/OiBDcmVhdGVPYnNlcnZhYmxlT3B0aW9ucyk6IElPYnNlcnZhYmxlVmFsdWU8VD4ge1xuICAgICAgICBjb25zdCBvID0gYXNDcmVhdGVPYnNlcnZhYmxlT3B0aW9ucyhvcHRpb25zKVxuICAgICAgICByZXR1cm4gbmV3IE9ic2VydmFibGVWYWx1ZSh2YWx1ZSwgZ2V0RW5oYW5jZXJGcm9tT3B0aW9ucyhvKSwgby5uYW1lLCB0cnVlLCBvLmVxdWFscylcbiAgICB9LFxuICAgIGFycmF5PFQgPSBhbnk+KGluaXRpYWxWYWx1ZXM/OiBUW10sIG9wdGlvbnM/OiBDcmVhdGVPYnNlcnZhYmxlT3B0aW9ucyk6IElPYnNlcnZhYmxlQXJyYXk8VD4ge1xuICAgICAgICBjb25zdCBvID0gYXNDcmVhdGVPYnNlcnZhYmxlT3B0aW9ucyhvcHRpb25zKVxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgZ2xvYmFsU3RhdGUudXNlUHJveGllcyA9PT0gZmFsc2UgfHwgby5wcm94eSA9PT0gZmFsc2VcbiAgICAgICAgICAgICAgICA/IGNyZWF0ZUxlZ2FjeUFycmF5XG4gICAgICAgICAgICAgICAgOiBjcmVhdGVPYnNlcnZhYmxlQXJyYXlcbiAgICAgICAgKShpbml0aWFsVmFsdWVzLCBnZXRFbmhhbmNlckZyb21PcHRpb25zKG8pLCBvLm5hbWUpXG4gICAgfSxcbiAgICBtYXA8SyA9IGFueSwgViA9IGFueT4oXG4gICAgICAgIGluaXRpYWxWYWx1ZXM/OiBJT2JzZXJ2YWJsZU1hcEluaXRpYWxWYWx1ZXM8SywgVj4sXG4gICAgICAgIG9wdGlvbnM/OiBDcmVhdGVPYnNlcnZhYmxlT3B0aW9uc1xuICAgICk6IE9ic2VydmFibGVNYXA8SywgVj4ge1xuICAgICAgICBjb25zdCBvID0gYXNDcmVhdGVPYnNlcnZhYmxlT3B0aW9ucyhvcHRpb25zKVxuICAgICAgICByZXR1cm4gbmV3IE9ic2VydmFibGVNYXA8SywgVj4oaW5pdGlhbFZhbHVlcywgZ2V0RW5oYW5jZXJGcm9tT3B0aW9ucyhvKSwgby5uYW1lKVxuICAgIH0sXG4gICAgc2V0PFQgPSBhbnk+KFxuICAgICAgICBpbml0aWFsVmFsdWVzPzogSU9ic2VydmFibGVTZXRJbml0aWFsVmFsdWVzPFQ+LFxuICAgICAgICBvcHRpb25zPzogQ3JlYXRlT2JzZXJ2YWJsZU9wdGlvbnNcbiAgICApOiBPYnNlcnZhYmxlU2V0PFQ+IHtcbiAgICAgICAgY29uc3QgbyA9IGFzQ3JlYXRlT2JzZXJ2YWJsZU9wdGlvbnMob3B0aW9ucylcbiAgICAgICAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlU2V0PFQ+KGluaXRpYWxWYWx1ZXMsIGdldEVuaGFuY2VyRnJvbU9wdGlvbnMobyksIG8ubmFtZSlcbiAgICB9LFxuICAgIG9iamVjdDxUIGV4dGVuZHMgb2JqZWN0ID0gYW55PihcbiAgICAgICAgcHJvcHM6IFQsXG4gICAgICAgIGRlY29yYXRvcnM/OiBBbm5vdGF0aW9uc01hcDxULCBuZXZlcj4sXG4gICAgICAgIG9wdGlvbnM/OiBDcmVhdGVPYnNlcnZhYmxlT3B0aW9uc1xuICAgICk6IFQge1xuICAgICAgICByZXR1cm4gZXh0ZW5kT2JzZXJ2YWJsZShcbiAgICAgICAgICAgIGdsb2JhbFN0YXRlLnVzZVByb3hpZXMgPT09IGZhbHNlIHx8IG9wdGlvbnM/LnByb3h5ID09PSBmYWxzZVxuICAgICAgICAgICAgICAgID8gYXNPYnNlcnZhYmxlT2JqZWN0KHt9LCBvcHRpb25zKVxuICAgICAgICAgICAgICAgIDogYXNEeW5hbWljT2JzZXJ2YWJsZU9iamVjdCh7fSwgb3B0aW9ucyksXG4gICAgICAgICAgICBwcm9wcyxcbiAgICAgICAgICAgIGRlY29yYXRvcnNcbiAgICAgICAgKVxuICAgIH0sXG4gICAgcmVmOiBjcmVhdGVEZWNvcmF0b3JBbm5vdGF0aW9uKG9ic2VydmFibGVSZWZBbm5vdGF0aW9uKSxcbiAgICBzaGFsbG93OiBjcmVhdGVEZWNvcmF0b3JBbm5vdGF0aW9uKG9ic2VydmFibGVTaGFsbG93QW5ub3RhdGlvbiksXG4gICAgZGVlcDogb2JzZXJ2YWJsZURlY29yYXRvckFubm90YXRpb24sXG4gICAgc3RydWN0OiBjcmVhdGVEZWNvcmF0b3JBbm5vdGF0aW9uKG9ic2VydmFibGVTdHJ1Y3RBbm5vdGF0aW9uKVxufSBhcyBhbnlcblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lXG5leHBvcnQgdmFyIG9ic2VydmFibGU6IElPYnNlcnZhYmxlRmFjdG9yeSA9IGFzc2lnbihjcmVhdGVPYnNlcnZhYmxlLCBvYnNlcnZhYmxlRmFjdG9yaWVzKVxuIiwiaW1wb3J0IHtcbiAgICBDb21wdXRlZFZhbHVlLFxuICAgIElDb21wdXRlZFZhbHVlT3B0aW9ucyxcbiAgICBBbm5vdGF0aW9uLFxuICAgIHN0b3JlQW5ub3RhdGlvbixcbiAgICBjcmVhdGVEZWNvcmF0b3JBbm5vdGF0aW9uLFxuICAgIGlzU3RyaW5naXNoLFxuICAgIGlzUGxhaW5PYmplY3QsXG4gICAgaXNGdW5jdGlvbixcbiAgICBkaWUsXG4gICAgSUNvbXB1dGVkVmFsdWUsXG4gICAgY3JlYXRlQ29tcHV0ZWRBbm5vdGF0aW9uLFxuICAgIGNvbXBhcmVyXG59IGZyb20gXCIuLi9pbnRlcm5hbFwiXG5cbmV4cG9ydCBjb25zdCBDT01QVVRFRCA9IFwiY29tcHV0ZWRcIlxuZXhwb3J0IGNvbnN0IENPTVBVVEVEX1NUUlVDVCA9IFwiY29tcHV0ZWQuc3RydWN0XCJcblxuZXhwb3J0IGludGVyZmFjZSBJQ29tcHV0ZWRGYWN0b3J5IGV4dGVuZHMgQW5ub3RhdGlvbiwgUHJvcGVydHlEZWNvcmF0b3Ige1xuICAgIC8vIEBjb21wdXRlZChvcHRzKVxuICAgIDxUPihvcHRpb25zOiBJQ29tcHV0ZWRWYWx1ZU9wdGlvbnM8VD4pOiBBbm5vdGF0aW9uICYgUHJvcGVydHlEZWNvcmF0b3JcbiAgICAvLyBjb21wdXRlZChmbiwgb3B0cylcbiAgICA8VD4oZnVuYzogKCkgPT4gVCwgb3B0aW9ucz86IElDb21wdXRlZFZhbHVlT3B0aW9uczxUPik6IElDb21wdXRlZFZhbHVlPFQ+XG5cbiAgICBzdHJ1Y3Q6IEFubm90YXRpb24gJiBQcm9wZXJ0eURlY29yYXRvclxufVxuXG5jb25zdCBjb21wdXRlZEFubm90YXRpb24gPSBjcmVhdGVDb21wdXRlZEFubm90YXRpb24oQ09NUFVURUQpXG5jb25zdCBjb21wdXRlZFN0cnVjdEFubm90YXRpb24gPSBjcmVhdGVDb21wdXRlZEFubm90YXRpb24oQ09NUFVURURfU1RSVUNULCB7XG4gICAgZXF1YWxzOiBjb21wYXJlci5zdHJ1Y3R1cmFsXG59KVxuXG4vKipcbiAqIERlY29yYXRvciBmb3IgY2xhc3MgcHJvcGVydGllczogQGNvbXB1dGVkIGdldCB2YWx1ZSgpIHsgcmV0dXJuIGV4cHI7IH0uXG4gKiBGb3IgbGVnYWN5IHB1cnBvc2VzIGFsc28gaW52b2thYmxlIGFzIEVTNSBvYnNlcnZhYmxlIGNyZWF0ZWQ6IGBjb21wdXRlZCgoKSA9PiBleHByKWA7XG4gKi9cbmV4cG9ydCBjb25zdCBjb21wdXRlZDogSUNvbXB1dGVkRmFjdG9yeSA9IGZ1bmN0aW9uIGNvbXB1dGVkKGFyZzEsIGFyZzIpIHtcbiAgICBpZiAoaXNTdHJpbmdpc2goYXJnMikpIHtcbiAgICAgICAgLy8gQGNvbXB1dGVkXG4gICAgICAgIHJldHVybiBzdG9yZUFubm90YXRpb24oYXJnMSwgYXJnMiwgY29tcHV0ZWRBbm5vdGF0aW9uKVxuICAgIH1cbiAgICBpZiAoaXNQbGFpbk9iamVjdChhcmcxKSkge1xuICAgICAgICAvLyBAY29tcHV0ZWQoeyBvcHRpb25zIH0pXG4gICAgICAgIHJldHVybiBjcmVhdGVEZWNvcmF0b3JBbm5vdGF0aW9uKGNyZWF0ZUNvbXB1dGVkQW5ub3RhdGlvbihDT01QVVRFRCwgYXJnMSkpXG4gICAgfVxuXG4gICAgLy8gY29tcHV0ZWQoZXhwciwgb3B0aW9ucz8pXG4gICAgaWYgKF9fREVWX18pIHtcbiAgICAgICAgaWYgKCFpc0Z1bmN0aW9uKGFyZzEpKSB7XG4gICAgICAgICAgICBkaWUoXCJGaXJzdCBhcmd1bWVudCB0byBgY29tcHV0ZWRgIHNob3VsZCBiZSBhbiBleHByZXNzaW9uLlwiKVxuICAgICAgICB9XG4gICAgICAgIGlmIChpc0Z1bmN0aW9uKGFyZzIpKSB7XG4gICAgICAgICAgICBkaWUoXG4gICAgICAgICAgICAgICAgXCJBIHNldHRlciBhcyBzZWNvbmQgYXJndW1lbnQgaXMgbm8gbG9uZ2VyIHN1cHBvcnRlZCwgdXNlIGB7IHNldDogZm4gfWAgb3B0aW9uIGluc3RlYWRcIlxuICAgICAgICAgICAgKVxuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnN0IG9wdHM6IElDb21wdXRlZFZhbHVlT3B0aW9uczxhbnk+ID0gaXNQbGFpbk9iamVjdChhcmcyKSA/IGFyZzIgOiB7fVxuICAgIG9wdHMuZ2V0ID0gYXJnMVxuICAgIG9wdHMubmFtZSB8fD0gYXJnMS5uYW1lIHx8IFwiXCIgLyogZm9yIGdlbmVyYXRlZCBuYW1lICovXG5cbiAgICByZXR1cm4gbmV3IENvbXB1dGVkVmFsdWUob3B0cylcbn0gYXMgYW55XG5cbk9iamVjdC5hc3NpZ24oY29tcHV0ZWQsIGNvbXB1dGVkQW5ub3RhdGlvbilcblxuY29tcHV0ZWQuc3RydWN0ID0gY3JlYXRlRGVjb3JhdG9yQW5ub3RhdGlvbihjb21wdXRlZFN0cnVjdEFubm90YXRpb24pXG4iLCJpbXBvcnQge1xuICAgIElEZXJpdmF0aW9uLFxuICAgIGVuZEJhdGNoLFxuICAgIGdsb2JhbFN0YXRlLFxuICAgIGlzU3B5RW5hYmxlZCxcbiAgICBzcHlSZXBvcnRFbmQsXG4gICAgc3B5UmVwb3J0U3RhcnQsXG4gICAgc3RhcnRCYXRjaCxcbiAgICB1bnRyYWNrZWRFbmQsXG4gICAgdW50cmFja2VkU3RhcnQsXG4gICAgaXNGdW5jdGlvbixcbiAgICBhbGxvd1N0YXRlUmVhZHNTdGFydCxcbiAgICBhbGxvd1N0YXRlUmVhZHNFbmQsXG4gICAgQUNUSU9OLFxuICAgIEVNUFRZX0FSUkFZLFxuICAgIGRpZSxcbiAgICBnZXREZXNjcmlwdG9yLFxuICAgIGRlZmluZVByb3BlcnR5XG59IGZyb20gXCIuLi9pbnRlcm5hbFwiXG5cbi8vIHdlIGRvbid0IHVzZSBnbG9iYWxTdGF0ZSBmb3IgdGhlc2UgaW4gb3JkZXIgdG8gYXZvaWQgcG9zc2libGUgaXNzdWVzIHdpdGggbXVsdGlwbGVcbi8vIG1vYnggdmVyc2lvbnNcbmxldCBjdXJyZW50QWN0aW9uSWQgPSAwXG5sZXQgbmV4dEFjdGlvbklkID0gMVxuY29uc3QgaXNGdW5jdGlvbk5hbWVDb25maWd1cmFibGUgPSBnZXREZXNjcmlwdG9yKCgpID0+IHt9LCBcIm5hbWVcIik/LmNvbmZpZ3VyYWJsZSA/PyBmYWxzZVxuXG4vLyB3ZSBjYW4gc2FmZWx5IHJlY3ljbGUgdGhpcyBvYmplY3RcbmNvbnN0IHRtcE5hbWVEZXNjcmlwdG9yOiBQcm9wZXJ0eURlc2NyaXB0b3IgPSB7XG4gICAgdmFsdWU6IFwiYWN0aW9uXCIsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIHdyaXRhYmxlOiBmYWxzZSxcbiAgICBlbnVtZXJhYmxlOiBmYWxzZVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQWN0aW9uKFxuICAgIGFjdGlvbk5hbWU6IHN0cmluZyxcbiAgICBmbjogRnVuY3Rpb24sXG4gICAgYXV0b0FjdGlvbjogYm9vbGVhbiA9IGZhbHNlLFxuICAgIHJlZj86IE9iamVjdFxuKTogRnVuY3Rpb24ge1xuICAgIGlmIChfX0RFVl9fKSB7XG4gICAgICAgIGlmICghaXNGdW5jdGlvbihmbikpIHtcbiAgICAgICAgICAgIGRpZShcImBhY3Rpb25gIGNhbiBvbmx5IGJlIGludm9rZWQgb24gZnVuY3Rpb25zXCIpXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiBhY3Rpb25OYW1lICE9PSBcInN0cmluZ1wiIHx8ICFhY3Rpb25OYW1lKSB7XG4gICAgICAgICAgICBkaWUoYGFjdGlvbnMgc2hvdWxkIGhhdmUgdmFsaWQgbmFtZXMsIGdvdDogJyR7YWN0aW9uTmFtZX0nYClcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiByZXMoKSB7XG4gICAgICAgIHJldHVybiBleGVjdXRlQWN0aW9uKGFjdGlvbk5hbWUsIGF1dG9BY3Rpb24sIGZuLCByZWYgfHwgdGhpcywgYXJndW1lbnRzKVxuICAgIH1cbiAgICByZXMuaXNNb2J4QWN0aW9uID0gdHJ1ZVxuICAgIGlmIChpc0Z1bmN0aW9uTmFtZUNvbmZpZ3VyYWJsZSkge1xuICAgICAgICB0bXBOYW1lRGVzY3JpcHRvci52YWx1ZSA9IGFjdGlvbk5hbWVcbiAgICAgICAgZGVmaW5lUHJvcGVydHkocmVzLCBcIm5hbWVcIiwgdG1wTmFtZURlc2NyaXB0b3IpXG4gICAgfVxuICAgIHJldHVybiByZXNcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4ZWN1dGVBY3Rpb24oXG4gICAgYWN0aW9uTmFtZTogc3RyaW5nLFxuICAgIGNhblJ1bkFzRGVyaXZhdGlvbjogYm9vbGVhbixcbiAgICBmbjogRnVuY3Rpb24sXG4gICAgc2NvcGU/OiBhbnksXG4gICAgYXJncz86IElBcmd1bWVudHNcbikge1xuICAgIGNvbnN0IHJ1bkluZm8gPSBfc3RhcnRBY3Rpb24oYWN0aW9uTmFtZSwgY2FuUnVuQXNEZXJpdmF0aW9uLCBzY29wZSwgYXJncylcbiAgICB0cnkge1xuICAgICAgICByZXR1cm4gZm4uYXBwbHkoc2NvcGUsIGFyZ3MpXG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHJ1bkluZm8uZXJyb3JfID0gZXJyXG4gICAgICAgIHRocm93IGVyclxuICAgIH0gZmluYWxseSB7XG4gICAgICAgIF9lbmRBY3Rpb24ocnVuSW5mbylcbiAgICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSUFjdGlvblJ1bkluZm8ge1xuICAgIHByZXZEZXJpdmF0aW9uXzogSURlcml2YXRpb24gfCBudWxsXG4gICAgcHJldkFsbG93U3RhdGVDaGFuZ2VzXzogYm9vbGVhblxuICAgIHByZXZBbGxvd1N0YXRlUmVhZHNfOiBib29sZWFuXG4gICAgbm90aWZ5U3B5XzogYm9vbGVhblxuICAgIHN0YXJ0VGltZV86IG51bWJlclxuICAgIGVycm9yXz86IGFueVxuICAgIHBhcmVudEFjdGlvbklkXzogbnVtYmVyXG4gICAgYWN0aW9uSWRfOiBudW1iZXJcbiAgICBydW5Bc0FjdGlvbl8/OiBib29sZWFuXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBfc3RhcnRBY3Rpb24oXG4gICAgYWN0aW9uTmFtZTogc3RyaW5nLFxuICAgIGNhblJ1bkFzRGVyaXZhdGlvbjogYm9vbGVhbiwgLy8gdHJ1ZSBmb3IgYXV0b0FjdGlvblxuICAgIHNjb3BlOiBhbnksXG4gICAgYXJncz86IElBcmd1bWVudHNcbik6IElBY3Rpb25SdW5JbmZvIHtcbiAgICBjb25zdCBub3RpZnlTcHlfID0gX19ERVZfXyAmJiBpc1NweUVuYWJsZWQoKSAmJiAhIWFjdGlvbk5hbWVcbiAgICBsZXQgc3RhcnRUaW1lXzogbnVtYmVyID0gMFxuICAgIGlmIChfX0RFVl9fICYmIG5vdGlmeVNweV8pIHtcbiAgICAgICAgc3RhcnRUaW1lXyA9IERhdGUubm93KClcbiAgICAgICAgY29uc3QgZmxhdHRlbmVkQXJncyA9IGFyZ3MgPyBBcnJheS5mcm9tKGFyZ3MpIDogRU1QVFlfQVJSQVlcbiAgICAgICAgc3B5UmVwb3J0U3RhcnQoe1xuICAgICAgICAgICAgdHlwZTogQUNUSU9OLFxuICAgICAgICAgICAgbmFtZTogYWN0aW9uTmFtZSxcbiAgICAgICAgICAgIG9iamVjdDogc2NvcGUsXG4gICAgICAgICAgICBhcmd1bWVudHM6IGZsYXR0ZW5lZEFyZ3NcbiAgICAgICAgfSlcbiAgICB9XG4gICAgY29uc3QgcHJldkRlcml2YXRpb25fID0gZ2xvYmFsU3RhdGUudHJhY2tpbmdEZXJpdmF0aW9uXG4gICAgY29uc3QgcnVuQXNBY3Rpb24gPSAhY2FuUnVuQXNEZXJpdmF0aW9uIHx8ICFwcmV2RGVyaXZhdGlvbl9cbiAgICBzdGFydEJhdGNoKClcbiAgICBsZXQgcHJldkFsbG93U3RhdGVDaGFuZ2VzXyA9IGdsb2JhbFN0YXRlLmFsbG93U3RhdGVDaGFuZ2VzIC8vIGJ5IGRlZmF1bHQgcHJlc2VydmUgcHJldmlvdXMgYWxsb3dcbiAgICBpZiAocnVuQXNBY3Rpb24pIHtcbiAgICAgICAgdW50cmFja2VkU3RhcnQoKVxuICAgICAgICBwcmV2QWxsb3dTdGF0ZUNoYW5nZXNfID0gYWxsb3dTdGF0ZUNoYW5nZXNTdGFydCh0cnVlKVxuICAgIH1cbiAgICBjb25zdCBwcmV2QWxsb3dTdGF0ZVJlYWRzXyA9IGFsbG93U3RhdGVSZWFkc1N0YXJ0KHRydWUpXG4gICAgY29uc3QgcnVuSW5mbyA9IHtcbiAgICAgICAgcnVuQXNBY3Rpb25fOiBydW5Bc0FjdGlvbixcbiAgICAgICAgcHJldkRlcml2YXRpb25fLFxuICAgICAgICBwcmV2QWxsb3dTdGF0ZUNoYW5nZXNfLFxuICAgICAgICBwcmV2QWxsb3dTdGF0ZVJlYWRzXyxcbiAgICAgICAgbm90aWZ5U3B5XyxcbiAgICAgICAgc3RhcnRUaW1lXyxcbiAgICAgICAgYWN0aW9uSWRfOiBuZXh0QWN0aW9uSWQrKyxcbiAgICAgICAgcGFyZW50QWN0aW9uSWRfOiBjdXJyZW50QWN0aW9uSWRcbiAgICB9XG4gICAgY3VycmVudEFjdGlvbklkID0gcnVuSW5mby5hY3Rpb25JZF9cbiAgICByZXR1cm4gcnVuSW5mb1xufVxuXG5leHBvcnQgZnVuY3Rpb24gX2VuZEFjdGlvbihydW5JbmZvOiBJQWN0aW9uUnVuSW5mbykge1xuICAgIGlmIChjdXJyZW50QWN0aW9uSWQgIT09IHJ1bkluZm8uYWN0aW9uSWRfKSB7XG4gICAgICAgIGRpZSgzMClcbiAgICB9XG4gICAgY3VycmVudEFjdGlvbklkID0gcnVuSW5mby5wYXJlbnRBY3Rpb25JZF9cblxuICAgIGlmIChydW5JbmZvLmVycm9yXyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGdsb2JhbFN0YXRlLnN1cHByZXNzUmVhY3Rpb25FcnJvcnMgPSB0cnVlXG4gICAgfVxuICAgIGFsbG93U3RhdGVDaGFuZ2VzRW5kKHJ1bkluZm8ucHJldkFsbG93U3RhdGVDaGFuZ2VzXylcbiAgICBhbGxvd1N0YXRlUmVhZHNFbmQocnVuSW5mby5wcmV2QWxsb3dTdGF0ZVJlYWRzXylcbiAgICBlbmRCYXRjaCgpXG4gICAgaWYgKHJ1bkluZm8ucnVuQXNBY3Rpb25fKSB7XG4gICAgICAgIHVudHJhY2tlZEVuZChydW5JbmZvLnByZXZEZXJpdmF0aW9uXylcbiAgICB9XG4gICAgaWYgKF9fREVWX18gJiYgcnVuSW5mby5ub3RpZnlTcHlfKSB7XG4gICAgICAgIHNweVJlcG9ydEVuZCh7IHRpbWU6IERhdGUubm93KCkgLSBydW5JbmZvLnN0YXJ0VGltZV8gfSlcbiAgICB9XG4gICAgZ2xvYmFsU3RhdGUuc3VwcHJlc3NSZWFjdGlvbkVycm9ycyA9IGZhbHNlXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbGxvd1N0YXRlQ2hhbmdlczxUPihhbGxvd1N0YXRlQ2hhbmdlczogYm9vbGVhbiwgZnVuYzogKCkgPT4gVCk6IFQge1xuICAgIGNvbnN0IHByZXYgPSBhbGxvd1N0YXRlQ2hhbmdlc1N0YXJ0KGFsbG93U3RhdGVDaGFuZ2VzKVxuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBmdW5jKClcbiAgICB9IGZpbmFsbHkge1xuICAgICAgICBhbGxvd1N0YXRlQ2hhbmdlc0VuZChwcmV2KVxuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFsbG93U3RhdGVDaGFuZ2VzU3RhcnQoYWxsb3dTdGF0ZUNoYW5nZXM6IGJvb2xlYW4pIHtcbiAgICBjb25zdCBwcmV2ID0gZ2xvYmFsU3RhdGUuYWxsb3dTdGF0ZUNoYW5nZXNcbiAgICBnbG9iYWxTdGF0ZS5hbGxvd1N0YXRlQ2hhbmdlcyA9IGFsbG93U3RhdGVDaGFuZ2VzXG4gICAgcmV0dXJuIHByZXZcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFsbG93U3RhdGVDaGFuZ2VzRW5kKHByZXY6IGJvb2xlYW4pIHtcbiAgICBnbG9iYWxTdGF0ZS5hbGxvd1N0YXRlQ2hhbmdlcyA9IHByZXZcbn1cbiIsImltcG9ydCB7XG4gICAgQXRvbSxcbiAgICBJRW5oYW5jZXIsXG4gICAgSUludGVyY2VwdGFibGUsXG4gICAgSUVxdWFsc0NvbXBhcmVyLFxuICAgIElJbnRlcmNlcHRvcixcbiAgICBJTGlzdGVuYWJsZSxcbiAgICBMYW1iZGEsXG4gICAgY2hlY2tJZlN0YXRlTW9kaWZpY2F0aW9uc0FyZUFsbG93ZWQsXG4gICAgY29tcGFyZXIsXG4gICAgY3JlYXRlSW5zdGFuY2VvZlByZWRpY2F0ZSxcbiAgICBnZXROZXh0SWQsXG4gICAgaGFzSW50ZXJjZXB0b3JzLFxuICAgIGhhc0xpc3RlbmVycyxcbiAgICBpbnRlcmNlcHRDaGFuZ2UsXG4gICAgaXNTcHlFbmFibGVkLFxuICAgIG5vdGlmeUxpc3RlbmVycyxcbiAgICByZWdpc3RlckludGVyY2VwdG9yLFxuICAgIHJlZ2lzdGVyTGlzdGVuZXIsXG4gICAgc3B5UmVwb3J0LFxuICAgIHNweVJlcG9ydEVuZCxcbiAgICBzcHlSZXBvcnRTdGFydCxcbiAgICB0b1ByaW1pdGl2ZSxcbiAgICBnbG9iYWxTdGF0ZSxcbiAgICBJVU5DSEFOR0VELFxuICAgIFVQREFURVxufSBmcm9tIFwiLi4vaW50ZXJuYWxcIlxuXG5leHBvcnQgaW50ZXJmYWNlIElWYWx1ZVdpbGxDaGFuZ2U8VD4ge1xuICAgIG9iamVjdDogSU9ic2VydmFibGVWYWx1ZTxUPlxuICAgIHR5cGU6IFwidXBkYXRlXCJcbiAgICBuZXdWYWx1ZTogVFxufVxuXG5leHBvcnQgdHlwZSBJVmFsdWVEaWRDaGFuZ2U8VCA9IGFueT4gPSB7XG4gICAgdHlwZTogXCJ1cGRhdGVcIlxuICAgIG9ic2VydmFibGVLaW5kOiBcInZhbHVlXCJcbiAgICBvYmplY3Q6IElPYnNlcnZhYmxlVmFsdWU8VD5cbiAgICBkZWJ1Z09iamVjdE5hbWU6IHN0cmluZ1xuICAgIG5ld1ZhbHVlOiBUXG4gICAgb2xkVmFsdWU6IFQgfCB1bmRlZmluZWRcbn1cbmV4cG9ydCB0eXBlIElCb3hEaWRDaGFuZ2U8VCA9IGFueT4gPVxuICAgIHwge1xuICAgICAgICAgIHR5cGU6IFwiY3JlYXRlXCJcbiAgICAgICAgICBvYnNlcnZhYmxlS2luZDogXCJ2YWx1ZVwiXG4gICAgICAgICAgb2JqZWN0OiBJT2JzZXJ2YWJsZVZhbHVlPFQ+XG4gICAgICAgICAgZGVidWdPYmplY3ROYW1lOiBzdHJpbmdcbiAgICAgICAgICBuZXdWYWx1ZTogVFxuICAgICAgfVxuICAgIHwgSVZhbHVlRGlkQ2hhbmdlPFQ+XG5cbmV4cG9ydCBpbnRlcmZhY2UgSU9ic2VydmFibGVWYWx1ZTxUPiB7XG4gICAgZ2V0KCk6IFRcbiAgICBzZXQodmFsdWU6IFQpOiB2b2lkXG59XG5cbmNvbnN0IENSRUFURSA9IFwiY3JlYXRlXCJcblxuZXhwb3J0IGNsYXNzIE9ic2VydmFibGVWYWx1ZTxUPlxuICAgIGV4dGVuZHMgQXRvbVxuICAgIGltcGxlbWVudHMgSU9ic2VydmFibGVWYWx1ZTxUPiwgSUludGVyY2VwdGFibGU8SVZhbHVlV2lsbENoYW5nZTxUPj4sIElMaXN0ZW5hYmxlXG57XG4gICAgaGFzVW5yZXBvcnRlZENoYW5nZV8gPSBmYWxzZVxuICAgIGludGVyY2VwdG9yc19cbiAgICBjaGFuZ2VMaXN0ZW5lcnNfXG4gICAgdmFsdWVfXG4gICAgZGVoYW5jZXI6IGFueVxuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHZhbHVlOiBULFxuICAgICAgICBwdWJsaWMgZW5oYW5jZXI6IElFbmhhbmNlcjxUPixcbiAgICAgICAgcHVibGljIG5hbWVfID0gX19ERVZfXyA/IFwiT2JzZXJ2YWJsZVZhbHVlQFwiICsgZ2V0TmV4dElkKCkgOiBcIk9ic2VydmFibGVWYWx1ZVwiLFxuICAgICAgICBub3RpZnlTcHkgPSB0cnVlLFxuICAgICAgICBwcml2YXRlIGVxdWFsczogSUVxdWFsc0NvbXBhcmVyPGFueT4gPSBjb21wYXJlci5kZWZhdWx0XG4gICAgKSB7XG4gICAgICAgIHN1cGVyKG5hbWVfKVxuICAgICAgICB0aGlzLnZhbHVlXyA9IGVuaGFuY2VyKHZhbHVlLCB1bmRlZmluZWQsIG5hbWVfKVxuICAgICAgICBpZiAoX19ERVZfXyAmJiBub3RpZnlTcHkgJiYgaXNTcHlFbmFibGVkKCkpIHtcbiAgICAgICAgICAgIC8vIG9ubHkgbm90aWZ5IHNweSBpZiB0aGlzIGlzIGEgc3RhbmQtYWxvbmUgb2JzZXJ2YWJsZVxuICAgICAgICAgICAgc3B5UmVwb3J0KHtcbiAgICAgICAgICAgICAgICB0eXBlOiBDUkVBVEUsXG4gICAgICAgICAgICAgICAgb2JqZWN0OiB0aGlzLFxuICAgICAgICAgICAgICAgIG9ic2VydmFibGVLaW5kOiBcInZhbHVlXCIsXG4gICAgICAgICAgICAgICAgZGVidWdPYmplY3ROYW1lOiB0aGlzLm5hbWVfLFxuICAgICAgICAgICAgICAgIG5ld1ZhbHVlOiBcIlwiICsgdGhpcy52YWx1ZV9cbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGRlaGFuY2VWYWx1ZSh2YWx1ZTogVCk6IFQge1xuICAgICAgICBpZiAodGhpcy5kZWhhbmNlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kZWhhbmNlcih2YWx1ZSlcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFsdWVcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0KG5ld1ZhbHVlOiBUKSB7XG4gICAgICAgIGNvbnN0IG9sZFZhbHVlID0gdGhpcy52YWx1ZV9cbiAgICAgICAgbmV3VmFsdWUgPSB0aGlzLnByZXBhcmVOZXdWYWx1ZV8obmV3VmFsdWUpIGFzIGFueVxuICAgICAgICBpZiAobmV3VmFsdWUgIT09IGdsb2JhbFN0YXRlLlVOQ0hBTkdFRCkge1xuICAgICAgICAgICAgY29uc3Qgbm90aWZ5U3B5ID0gaXNTcHlFbmFibGVkKClcbiAgICAgICAgICAgIGlmIChfX0RFVl9fICYmIG5vdGlmeVNweSkge1xuICAgICAgICAgICAgICAgIHNweVJlcG9ydFN0YXJ0KHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogVVBEQVRFLFxuICAgICAgICAgICAgICAgICAgICBvYmplY3Q6IHRoaXMsXG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmFibGVLaW5kOiBcInZhbHVlXCIsXG4gICAgICAgICAgICAgICAgICAgIGRlYnVnT2JqZWN0TmFtZTogdGhpcy5uYW1lXyxcbiAgICAgICAgICAgICAgICAgICAgbmV3VmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIG9sZFZhbHVlXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2V0TmV3VmFsdWVfKG5ld1ZhbHVlKVxuICAgICAgICAgICAgaWYgKF9fREVWX18gJiYgbm90aWZ5U3B5KSB7XG4gICAgICAgICAgICAgICAgc3B5UmVwb3J0RW5kKClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgcHJlcGFyZU5ld1ZhbHVlXyhuZXdWYWx1ZSk6IFQgfCBJVU5DSEFOR0VEIHtcbiAgICAgICAgY2hlY2tJZlN0YXRlTW9kaWZpY2F0aW9uc0FyZUFsbG93ZWQodGhpcylcbiAgICAgICAgaWYgKGhhc0ludGVyY2VwdG9ycyh0aGlzKSkge1xuICAgICAgICAgICAgY29uc3QgY2hhbmdlID0gaW50ZXJjZXB0Q2hhbmdlPElWYWx1ZVdpbGxDaGFuZ2U8VD4+KHRoaXMsIHtcbiAgICAgICAgICAgICAgICBvYmplY3Q6IHRoaXMsXG4gICAgICAgICAgICAgICAgdHlwZTogVVBEQVRFLFxuICAgICAgICAgICAgICAgIG5ld1ZhbHVlXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgaWYgKCFjaGFuZ2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZ2xvYmFsU3RhdGUuVU5DSEFOR0VEXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBuZXdWYWx1ZSA9IGNoYW5nZS5uZXdWYWx1ZVxuICAgICAgICB9XG4gICAgICAgIC8vIGFwcGx5IG1vZGlmaWVyXG4gICAgICAgIG5ld1ZhbHVlID0gdGhpcy5lbmhhbmNlcihuZXdWYWx1ZSwgdGhpcy52YWx1ZV8sIHRoaXMubmFtZV8pXG4gICAgICAgIHJldHVybiB0aGlzLmVxdWFscyh0aGlzLnZhbHVlXywgbmV3VmFsdWUpID8gZ2xvYmFsU3RhdGUuVU5DSEFOR0VEIDogbmV3VmFsdWVcbiAgICB9XG5cbiAgICBzZXROZXdWYWx1ZV8obmV3VmFsdWU6IFQpIHtcbiAgICAgICAgY29uc3Qgb2xkVmFsdWUgPSB0aGlzLnZhbHVlX1xuICAgICAgICB0aGlzLnZhbHVlXyA9IG5ld1ZhbHVlXG4gICAgICAgIHRoaXMucmVwb3J0Q2hhbmdlZCgpXG4gICAgICAgIGlmIChoYXNMaXN0ZW5lcnModGhpcykpIHtcbiAgICAgICAgICAgIG5vdGlmeUxpc3RlbmVycyh0aGlzLCB7XG4gICAgICAgICAgICAgICAgdHlwZTogVVBEQVRFLFxuICAgICAgICAgICAgICAgIG9iamVjdDogdGhpcyxcbiAgICAgICAgICAgICAgICBuZXdWYWx1ZSxcbiAgICAgICAgICAgICAgICBvbGRWYWx1ZVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBnZXQoKTogVCB7XG4gICAgICAgIHRoaXMucmVwb3J0T2JzZXJ2ZWQoKVxuICAgICAgICByZXR1cm4gdGhpcy5kZWhhbmNlVmFsdWUodGhpcy52YWx1ZV8pXG4gICAgfVxuXG4gICAgaW50ZXJjZXB0XyhoYW5kbGVyOiBJSW50ZXJjZXB0b3I8SVZhbHVlV2lsbENoYW5nZTxUPj4pOiBMYW1iZGEge1xuICAgICAgICByZXR1cm4gcmVnaXN0ZXJJbnRlcmNlcHRvcih0aGlzLCBoYW5kbGVyKVxuICAgIH1cblxuICAgIG9ic2VydmVfKGxpc3RlbmVyOiAoY2hhbmdlOiBJVmFsdWVEaWRDaGFuZ2U8VD4pID0+IHZvaWQsIGZpcmVJbW1lZGlhdGVseT86IGJvb2xlYW4pOiBMYW1iZGEge1xuICAgICAgICBpZiAoZmlyZUltbWVkaWF0ZWx5KSB7XG4gICAgICAgICAgICBsaXN0ZW5lcih7XG4gICAgICAgICAgICAgICAgb2JzZXJ2YWJsZUtpbmQ6IFwidmFsdWVcIixcbiAgICAgICAgICAgICAgICBkZWJ1Z09iamVjdE5hbWU6IHRoaXMubmFtZV8sXG4gICAgICAgICAgICAgICAgb2JqZWN0OiB0aGlzLFxuICAgICAgICAgICAgICAgIHR5cGU6IFVQREFURSxcbiAgICAgICAgICAgICAgICBuZXdWYWx1ZTogdGhpcy52YWx1ZV8sXG4gICAgICAgICAgICAgICAgb2xkVmFsdWU6IHVuZGVmaW5lZFxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVnaXN0ZXJMaXN0ZW5lcih0aGlzLCBsaXN0ZW5lcilcbiAgICB9XG5cbiAgICByYXcoKSB7XG4gICAgICAgIC8vIHVzZWQgYnkgTVNUIG90IGdldCB1bmRlaGFuY2VkIHZhbHVlXG4gICAgICAgIHJldHVybiB0aGlzLnZhbHVlX1xuICAgIH1cblxuICAgIHRvSlNPTigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KClcbiAgICB9XG5cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIGAke3RoaXMubmFtZV99WyR7dGhpcy52YWx1ZV99XWBcbiAgICB9XG5cbiAgICB2YWx1ZU9mKCk6IFQge1xuICAgICAgICByZXR1cm4gdG9QcmltaXRpdmUodGhpcy5nZXQoKSlcbiAgICB9XG5cbiAgICBbU3ltYm9sLnRvUHJpbWl0aXZlXSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudmFsdWVPZigpXG4gICAgfVxufVxuXG5leHBvcnQgY29uc3QgaXNPYnNlcnZhYmxlVmFsdWUgPSBjcmVhdGVJbnN0YW5jZW9mUHJlZGljYXRlKFwiT2JzZXJ2YWJsZVZhbHVlXCIsIE9ic2VydmFibGVWYWx1ZSkgYXMgKFxuICAgIHg6IGFueVxuKSA9PiB4IGlzIElPYnNlcnZhYmxlVmFsdWU8YW55PlxuIiwiaW1wb3J0IHtcbiAgICBDYXVnaHRFeGNlcHRpb24sXG4gICAgSURlcml2YXRpb24sXG4gICAgSURlcml2YXRpb25TdGF0ZV8sXG4gICAgSUVxdWFsc0NvbXBhcmVyLFxuICAgIElPYnNlcnZhYmxlLFxuICAgIExhbWJkYSxcbiAgICBUcmFjZU1vZGUsXG4gICAgYXV0b3J1bixcbiAgICBjbGVhck9ic2VydmluZyxcbiAgICBjb21wYXJlcixcbiAgICBjcmVhdGVBY3Rpb24sXG4gICAgY3JlYXRlSW5zdGFuY2VvZlByZWRpY2F0ZSxcbiAgICBlbmRCYXRjaCxcbiAgICBnZXROZXh0SWQsXG4gICAgZ2xvYmFsU3RhdGUsXG4gICAgaXNDYXVnaHRFeGNlcHRpb24sXG4gICAgaXNTcHlFbmFibGVkLFxuICAgIHByb3BhZ2F0ZUNoYW5nZUNvbmZpcm1lZCxcbiAgICBwcm9wYWdhdGVNYXliZUNoYW5nZWQsXG4gICAgcmVwb3J0T2JzZXJ2ZWQsXG4gICAgc2hvdWxkQ29tcHV0ZSxcbiAgICBzcHlSZXBvcnQsXG4gICAgc3RhcnRCYXRjaCxcbiAgICB0b1ByaW1pdGl2ZSxcbiAgICB0cmFja0Rlcml2ZWRGdW5jdGlvbixcbiAgICB1bnRyYWNrZWRFbmQsXG4gICAgdW50cmFja2VkU3RhcnQsXG4gICAgVVBEQVRFLFxuICAgIGRpZSxcbiAgICBhbGxvd1N0YXRlQ2hhbmdlc1N0YXJ0LFxuICAgIGFsbG93U3RhdGVDaGFuZ2VzRW5kXG59IGZyb20gXCIuLi9pbnRlcm5hbFwiXG5cbmV4cG9ydCBpbnRlcmZhY2UgSUNvbXB1dGVkVmFsdWU8VD4ge1xuICAgIGdldCgpOiBUXG4gICAgc2V0KHZhbHVlOiBUKTogdm9pZFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIElDb21wdXRlZFZhbHVlT3B0aW9uczxUPiB7XG4gICAgZ2V0PzogKCkgPT4gVFxuICAgIHNldD86ICh2YWx1ZTogVCkgPT4gdm9pZFxuICAgIG5hbWU/OiBzdHJpbmdcbiAgICBlcXVhbHM/OiBJRXF1YWxzQ29tcGFyZXI8VD5cbiAgICBjb250ZXh0PzogYW55XG4gICAgcmVxdWlyZXNSZWFjdGlvbj86IGJvb2xlYW5cbiAgICBrZWVwQWxpdmU/OiBib29sZWFuXG59XG5cbmV4cG9ydCB0eXBlIElDb21wdXRlZERpZENoYW5nZTxUID0gYW55PiA9IHtcbiAgICB0eXBlOiBcInVwZGF0ZVwiXG4gICAgb2JzZXJ2YWJsZUtpbmQ6IFwiY29tcHV0ZWRcIlxuICAgIG9iamVjdDogdW5rbm93blxuICAgIGRlYnVnT2JqZWN0TmFtZTogc3RyaW5nXG4gICAgbmV3VmFsdWU6IFRcbiAgICBvbGRWYWx1ZTogVCB8IHVuZGVmaW5lZFxufVxuXG4vKipcbiAqIEEgbm9kZSBpbiB0aGUgc3RhdGUgZGVwZW5kZW5jeSByb290IHRoYXQgb2JzZXJ2ZXMgb3RoZXIgbm9kZXMsIGFuZCBjYW4gYmUgb2JzZXJ2ZWQgaXRzZWxmLlxuICpcbiAqIENvbXB1dGVkVmFsdWUgd2lsbCByZW1lbWJlciB0aGUgcmVzdWx0IG9mIHRoZSBjb21wdXRhdGlvbiBmb3IgdGhlIGR1cmF0aW9uIG9mIHRoZSBiYXRjaCwgb3JcbiAqIHdoaWxlIGJlaW5nIG9ic2VydmVkLlxuICpcbiAqIER1cmluZyB0aGlzIHRpbWUgaXQgd2lsbCByZWNvbXB1dGUgb25seSB3aGVuIG9uZSBvZiBpdHMgZGlyZWN0IGRlcGVuZGVuY2llcyBjaGFuZ2VkLFxuICogYnV0IG9ubHkgd2hlbiBpdCBpcyBiZWluZyBhY2Nlc3NlZCB3aXRoIGBDb21wdXRlZFZhbHVlLmdldCgpYC5cbiAqXG4gKiBJbXBsZW1lbnRhdGlvbiBkZXNjcmlwdGlvbjpcbiAqIDEuIEZpcnN0IHRpbWUgaXQncyBiZWluZyBhY2Nlc3NlZCBpdCB3aWxsIGNvbXB1dGUgYW5kIHJlbWVtYmVyIHJlc3VsdFxuICogICAgZ2l2ZSBiYWNrIHJlbWVtYmVyZWQgcmVzdWx0IHVudGlsIDIuIGhhcHBlbnNcbiAqIDIuIEZpcnN0IHRpbWUgYW55IGRlZXAgZGVwZW5kZW5jeSBjaGFuZ2UsIHByb3BhZ2F0ZSBQT1NTSUJMWV9TVEFMRSB0byBhbGwgb2JzZXJ2ZXJzLCB3YWl0IGZvciAzLlxuICogMy4gV2hlbiBpdCdzIGJlaW5nIGFjY2Vzc2VkLCByZWNvbXB1dGUgaWYgYW55IHNoYWxsb3cgZGVwZW5kZW5jeSBjaGFuZ2VkLlxuICogICAgaWYgcmVzdWx0IGNoYW5nZWQ6IHByb3BhZ2F0ZSBTVEFMRSB0byBhbGwgb2JzZXJ2ZXJzLCB0aGF0IHdlcmUgUE9TU0lCTFlfU1RBTEUgZnJvbSB0aGUgbGFzdCBzdGVwLlxuICogICAgZ28gdG8gc3RlcCAyLiBlaXRoZXIgd2F5XG4gKlxuICogSWYgYXQgYW55IHBvaW50IGl0J3Mgb3V0c2lkZSBiYXRjaCBhbmQgaXQgaXNuJ3Qgb2JzZXJ2ZWQ6IHJlc2V0IGV2ZXJ5dGhpbmcgYW5kIGdvIHRvIDEuXG4gKi9cbmV4cG9ydCBjbGFzcyBDb21wdXRlZFZhbHVlPFQ+IGltcGxlbWVudHMgSU9ic2VydmFibGUsIElDb21wdXRlZFZhbHVlPFQ+LCBJRGVyaXZhdGlvbiB7XG4gICAgZGVwZW5kZW5jaWVzU3RhdGVfID0gSURlcml2YXRpb25TdGF0ZV8uTk9UX1RSQUNLSU5HX1xuICAgIG9ic2VydmluZ186IElPYnNlcnZhYmxlW10gPSBbXSAvLyBub2RlcyB3ZSBhcmUgbG9va2luZyBhdC4gT3VyIHZhbHVlIGRlcGVuZHMgb24gdGhlc2Ugbm9kZXNcbiAgICBuZXdPYnNlcnZpbmdfID0gbnVsbCAvLyBkdXJpbmcgdHJhY2tpbmcgaXQncyBhbiBhcnJheSB3aXRoIG5ldyBvYnNlcnZlZCBvYnNlcnZlcnNcbiAgICBpc0JlaW5nT2JzZXJ2ZWRfID0gZmFsc2VcbiAgICBpc1BlbmRpbmdVbm9ic2VydmF0aW9uXzogYm9vbGVhbiA9IGZhbHNlXG4gICAgb2JzZXJ2ZXJzXyA9IG5ldyBTZXQ8SURlcml2YXRpb24+KClcbiAgICBkaWZmVmFsdWVfID0gMFxuICAgIHJ1bklkXyA9IDBcbiAgICBsYXN0QWNjZXNzZWRCeV8gPSAwXG4gICAgbG93ZXN0T2JzZXJ2ZXJTdGF0ZV8gPSBJRGVyaXZhdGlvblN0YXRlXy5VUF9UT19EQVRFX1xuICAgIHVuYm91bmREZXBzQ291bnRfID0gMFxuICAgIHByb3RlY3RlZCB2YWx1ZV86IFQgfCB1bmRlZmluZWQgfCBDYXVnaHRFeGNlcHRpb24gPSBuZXcgQ2F1Z2h0RXhjZXB0aW9uKG51bGwpXG4gICAgbmFtZV86IHN0cmluZ1xuICAgIHRyaWdnZXJlZEJ5Xz86IHN0cmluZ1xuICAgIGlzQ29tcHV0aW5nXzogYm9vbGVhbiA9IGZhbHNlIC8vIHRvIGNoZWNrIGZvciBjeWNsZXNcbiAgICBpc1J1bm5pbmdTZXR0ZXJfOiBib29sZWFuID0gZmFsc2VcbiAgICBkZXJpdmF0aW9uOiAoKSA9PiBUIC8vIE4uQjogdW5taW5pZmllZCBhcyBpdCBpcyB1c2VkIGJ5IE1TVFxuICAgIHNldHRlcl8/OiAodmFsdWU6IFQpID0+IHZvaWRcbiAgICBpc1RyYWNpbmdfOiBUcmFjZU1vZGUgPSBUcmFjZU1vZGUuTk9ORVxuICAgIHNjb3BlXzogT2JqZWN0IHwgdW5kZWZpbmVkXG4gICAgcHJpdmF0ZSBlcXVhbHNfOiBJRXF1YWxzQ29tcGFyZXI8YW55PlxuICAgIHByaXZhdGUgcmVxdWlyZXNSZWFjdGlvbl86IGJvb2xlYW4gfCB1bmRlZmluZWRcbiAgICBrZWVwQWxpdmVfOiBib29sZWFuXG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgY29tcHV0ZWQgdmFsdWUgYmFzZWQgb24gYSBmdW5jdGlvbiBleHByZXNzaW9uLlxuICAgICAqXG4gICAgICogVGhlIGBuYW1lYCBwcm9wZXJ0eSBpcyBmb3IgZGVidWcgcHVycG9zZXMgb25seS5cbiAgICAgKlxuICAgICAqIFRoZSBgZXF1YWxzYCBwcm9wZXJ0eSBzcGVjaWZpZXMgdGhlIGNvbXBhcmVyIGZ1bmN0aW9uIHRvIHVzZSB0byBkZXRlcm1pbmUgaWYgYSBuZXdseSBwcm9kdWNlZFxuICAgICAqIHZhbHVlIGRpZmZlcnMgZnJvbSB0aGUgcHJldmlvdXMgdmFsdWUuIFR3byBjb21wYXJlcnMgYXJlIHByb3ZpZGVkIGluIHRoZSBsaWJyYXJ5OyBgZGVmYXVsdENvbXBhcmVyYFxuICAgICAqIGNvbXBhcmVzIGJhc2VkIG9uIGlkZW50aXR5IGNvbXBhcmlzb24gKD09PSksIGFuZCBgc3RydWN0dXJhbENvbXBhcmVyYCBkZWVwbHkgY29tcGFyZXMgdGhlIHN0cnVjdHVyZS5cbiAgICAgKiBTdHJ1Y3R1cmFsIGNvbXBhcmlzb24gY2FuIGJlIGNvbnZlbmllbnQgaWYgeW91IGFsd2F5cyBwcm9kdWNlIGEgbmV3IGFnZ3JlZ2F0ZWQgb2JqZWN0IGFuZFxuICAgICAqIGRvbid0IHdhbnQgdG8gbm90aWZ5IG9ic2VydmVycyBpZiBpdCBpcyBzdHJ1Y3R1cmFsbHkgdGhlIHNhbWUuXG4gICAgICogVGhpcyBpcyB1c2VmdWwgZm9yIHdvcmtpbmcgd2l0aCB2ZWN0b3JzLCBtb3VzZSBjb29yZGluYXRlcyBldGMuXG4gICAgICovXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczogSUNvbXB1dGVkVmFsdWVPcHRpb25zPFQ+KSB7XG4gICAgICAgIGlmICghb3B0aW9ucy5nZXQpIHtcbiAgICAgICAgICAgIGRpZSgzMSlcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmRlcml2YXRpb24gPSBvcHRpb25zLmdldCFcbiAgICAgICAgdGhpcy5uYW1lXyA9IG9wdGlvbnMubmFtZSB8fCAoX19ERVZfXyA/IFwiQ29tcHV0ZWRWYWx1ZUBcIiArIGdldE5leHRJZCgpIDogXCJDb21wdXRlZFZhbHVlXCIpXG4gICAgICAgIGlmIChvcHRpb25zLnNldCkge1xuICAgICAgICAgICAgdGhpcy5zZXR0ZXJfID0gY3JlYXRlQWN0aW9uKFxuICAgICAgICAgICAgICAgIF9fREVWX18gPyB0aGlzLm5hbWVfICsgXCItc2V0dGVyXCIgOiBcIkNvbXB1dGVkVmFsdWUtc2V0dGVyXCIsXG4gICAgICAgICAgICAgICAgb3B0aW9ucy5zZXRcbiAgICAgICAgICAgICkgYXMgYW55XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5lcXVhbHNfID1cbiAgICAgICAgICAgIG9wdGlvbnMuZXF1YWxzIHx8XG4gICAgICAgICAgICAoKG9wdGlvbnMgYXMgYW55KS5jb21wYXJlU3RydWN0dXJhbCB8fCAob3B0aW9ucyBhcyBhbnkpLnN0cnVjdFxuICAgICAgICAgICAgICAgID8gY29tcGFyZXIuc3RydWN0dXJhbFxuICAgICAgICAgICAgICAgIDogY29tcGFyZXIuZGVmYXVsdClcbiAgICAgICAgdGhpcy5zY29wZV8gPSBvcHRpb25zLmNvbnRleHRcbiAgICAgICAgdGhpcy5yZXF1aXJlc1JlYWN0aW9uXyA9IG9wdGlvbnMucmVxdWlyZXNSZWFjdGlvblxuICAgICAgICB0aGlzLmtlZXBBbGl2ZV8gPSAhIW9wdGlvbnMua2VlcEFsaXZlXG4gICAgfVxuXG4gICAgb25CZWNvbWVTdGFsZV8oKSB7XG4gICAgICAgIHByb3BhZ2F0ZU1heWJlQ2hhbmdlZCh0aGlzKVxuICAgIH1cblxuICAgIHB1YmxpYyBvbkJPTDogU2V0PExhbWJkYT4gfCB1bmRlZmluZWRcbiAgICBwdWJsaWMgb25CVU9MOiBTZXQ8TGFtYmRhPiB8IHVuZGVmaW5lZFxuXG4gICAgcHVibGljIG9uQk8oKSB7XG4gICAgICAgIGlmICh0aGlzLm9uQk9MKSB7XG4gICAgICAgICAgICB0aGlzLm9uQk9MLmZvckVhY2gobGlzdGVuZXIgPT4gbGlzdGVuZXIoKSlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBvbkJVTygpIHtcbiAgICAgICAgaWYgKHRoaXMub25CVU9MKSB7XG4gICAgICAgICAgICB0aGlzLm9uQlVPTC5mb3JFYWNoKGxpc3RlbmVyID0+IGxpc3RlbmVyKCkpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBjdXJyZW50IHZhbHVlIG9mIHRoaXMgY29tcHV0ZWQgdmFsdWUuXG4gICAgICogV2lsbCBldmFsdWF0ZSBpdHMgY29tcHV0YXRpb24gZmlyc3QgaWYgbmVlZGVkLlxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQoKTogVCB7XG4gICAgICAgIGlmICh0aGlzLmlzQ29tcHV0aW5nXykge1xuICAgICAgICAgICAgZGllKDMyLCB0aGlzLm5hbWVfLCB0aGlzLmRlcml2YXRpb24pXG4gICAgICAgIH1cbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgZ2xvYmFsU3RhdGUuaW5CYXRjaCA9PT0gMCAmJlxuICAgICAgICAgICAgLy8gIWdsb2JhbFN0YXRlLnRyYWNraW5nRGVyaXZhdHBpb24gJiZcbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXJzXy5zaXplID09PSAwICYmXG4gICAgICAgICAgICAhdGhpcy5rZWVwQWxpdmVfXG4gICAgICAgICkge1xuICAgICAgICAgICAgaWYgKHNob3VsZENvbXB1dGUodGhpcykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLndhcm5BYm91dFVudHJhY2tlZFJlYWRfKClcbiAgICAgICAgICAgICAgICBzdGFydEJhdGNoKCkgLy8gU2VlIHBlcmYgdGVzdCAnY29tcHV0ZWQgbWVtb2l6YXRpb24nXG4gICAgICAgICAgICAgICAgdGhpcy52YWx1ZV8gPSB0aGlzLmNvbXB1dGVWYWx1ZV8oZmFsc2UpXG4gICAgICAgICAgICAgICAgZW5kQmF0Y2goKVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVwb3J0T2JzZXJ2ZWQodGhpcylcbiAgICAgICAgICAgIGlmIChzaG91bGRDb21wdXRlKHRoaXMpKSB7XG4gICAgICAgICAgICAgICAgbGV0IHByZXZUcmFja2luZ0NvbnRleHQgPSBnbG9iYWxTdGF0ZS50cmFja2luZ0NvbnRleHRcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5rZWVwQWxpdmVfICYmICFwcmV2VHJhY2tpbmdDb250ZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgIGdsb2JhbFN0YXRlLnRyYWNraW5nQ29udGV4dCA9IHRoaXNcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudHJhY2tBbmRDb21wdXRlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcGFnYXRlQ2hhbmdlQ29uZmlybWVkKHRoaXMpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGdsb2JhbFN0YXRlLnRyYWNraW5nQ29udGV4dCA9IHByZXZUcmFja2luZ0NvbnRleHRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb25zdCByZXN1bHQgPSB0aGlzLnZhbHVlXyFcblxuICAgICAgICBpZiAoaXNDYXVnaHRFeGNlcHRpb24ocmVzdWx0KSkge1xuICAgICAgICAgICAgdGhyb3cgcmVzdWx0LmNhdXNlXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdFxuICAgIH1cblxuICAgIHB1YmxpYyBzZXQodmFsdWU6IFQpIHtcbiAgICAgICAgaWYgKHRoaXMuc2V0dGVyXykge1xuICAgICAgICAgICAgaWYgKHRoaXMuaXNSdW5uaW5nU2V0dGVyXykge1xuICAgICAgICAgICAgICAgIGRpZSgzMywgdGhpcy5uYW1lXylcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuaXNSdW5uaW5nU2V0dGVyXyA9IHRydWVcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXR0ZXJfLmNhbGwodGhpcy5zY29wZV8sIHZhbHVlKVxuICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0aGlzLmlzUnVubmluZ1NldHRlcl8gPSBmYWxzZVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGllKDM0LCB0aGlzLm5hbWVfKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgdHJhY2tBbmRDb21wdXRlKCk6IGJvb2xlYW4ge1xuICAgICAgICAvLyBOLkI6IHVubWluaWZpZWQgYXMgaXQgaXMgdXNlZCBieSBNU1RcbiAgICAgICAgY29uc3Qgb2xkVmFsdWUgPSB0aGlzLnZhbHVlX1xuICAgICAgICBjb25zdCB3YXNTdXNwZW5kZWQgPVxuICAgICAgICAgICAgLyogc2VlICMxMjA4ICovIHRoaXMuZGVwZW5kZW5jaWVzU3RhdGVfID09PSBJRGVyaXZhdGlvblN0YXRlXy5OT1RfVFJBQ0tJTkdfXG4gICAgICAgIGNvbnN0IG5ld1ZhbHVlID0gdGhpcy5jb21wdXRlVmFsdWVfKHRydWUpXG5cbiAgICAgICAgY29uc3QgY2hhbmdlZCA9XG4gICAgICAgICAgICB3YXNTdXNwZW5kZWQgfHxcbiAgICAgICAgICAgIGlzQ2F1Z2h0RXhjZXB0aW9uKG9sZFZhbHVlKSB8fFxuICAgICAgICAgICAgaXNDYXVnaHRFeGNlcHRpb24obmV3VmFsdWUpIHx8XG4gICAgICAgICAgICAhdGhpcy5lcXVhbHNfKG9sZFZhbHVlLCBuZXdWYWx1ZSlcblxuICAgICAgICBpZiAoY2hhbmdlZCkge1xuICAgICAgICAgICAgdGhpcy52YWx1ZV8gPSBuZXdWYWx1ZVxuXG4gICAgICAgICAgICBpZiAoX19ERVZfXyAmJiBpc1NweUVuYWJsZWQoKSkge1xuICAgICAgICAgICAgICAgIHNweVJlcG9ydCh7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmFibGVLaW5kOiBcImNvbXB1dGVkXCIsXG4gICAgICAgICAgICAgICAgICAgIGRlYnVnT2JqZWN0TmFtZTogdGhpcy5uYW1lXyxcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiB0aGlzLnNjb3BlXyxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJ1cGRhdGVcIixcbiAgICAgICAgICAgICAgICAgICAgb2xkVmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIG5ld1ZhbHVlXG4gICAgICAgICAgICAgICAgfSBhcyBJQ29tcHV0ZWREaWRDaGFuZ2UpXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY2hhbmdlZFxuICAgIH1cblxuICAgIGNvbXB1dGVWYWx1ZV8odHJhY2s6IGJvb2xlYW4pIHtcbiAgICAgICAgdGhpcy5pc0NvbXB1dGluZ18gPSB0cnVlXG4gICAgICAgIC8vIGRvbid0IGFsbG93IHN0YXRlIGNoYW5nZXMgZHVyaW5nIGNvbXB1dGF0aW9uXG4gICAgICAgIGNvbnN0IHByZXYgPSBhbGxvd1N0YXRlQ2hhbmdlc1N0YXJ0KGZhbHNlKVxuICAgICAgICBsZXQgcmVzOiBUIHwgQ2F1Z2h0RXhjZXB0aW9uXG4gICAgICAgIGlmICh0cmFjaykge1xuICAgICAgICAgICAgcmVzID0gdHJhY2tEZXJpdmVkRnVuY3Rpb24odGhpcywgdGhpcy5kZXJpdmF0aW9uLCB0aGlzLnNjb3BlXylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChnbG9iYWxTdGF0ZS5kaXNhYmxlRXJyb3JCb3VuZGFyaWVzID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgcmVzID0gdGhpcy5kZXJpdmF0aW9uLmNhbGwodGhpcy5zY29wZV8pXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHJlcyA9IHRoaXMuZGVyaXZhdGlvbi5jYWxsKHRoaXMuc2NvcGVfKVxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzID0gbmV3IENhdWdodEV4Y2VwdGlvbihlKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBhbGxvd1N0YXRlQ2hhbmdlc0VuZChwcmV2KVxuICAgICAgICB0aGlzLmlzQ29tcHV0aW5nXyA9IGZhbHNlXG4gICAgICAgIHJldHVybiByZXNcbiAgICB9XG5cbiAgICBzdXNwZW5kXygpIHtcbiAgICAgICAgaWYgKCF0aGlzLmtlZXBBbGl2ZV8pIHtcbiAgICAgICAgICAgIGNsZWFyT2JzZXJ2aW5nKHRoaXMpXG4gICAgICAgICAgICB0aGlzLnZhbHVlXyA9IHVuZGVmaW5lZCAvLyBkb24ndCBob2xkIG9uIHRvIGNvbXB1dGVkIHZhbHVlIVxuICAgICAgICAgICAgaWYgKF9fREVWX18gJiYgdGhpcy5pc1RyYWNpbmdfICE9PSBUcmFjZU1vZGUuTk9ORSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgICAgICAgICAgICBgW21vYngudHJhY2VdIENvbXB1dGVkIHZhbHVlICcke3RoaXMubmFtZV99JyB3YXMgc3VzcGVuZGVkIGFuZCBpdCB3aWxsIHJlY29tcHV0ZSBvbiB0aGUgbmV4dCBhY2Nlc3MuYFxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9ic2VydmVfKGxpc3RlbmVyOiAoY2hhbmdlOiBJQ29tcHV0ZWREaWRDaGFuZ2U8VD4pID0+IHZvaWQsIGZpcmVJbW1lZGlhdGVseT86IGJvb2xlYW4pOiBMYW1iZGEge1xuICAgICAgICBsZXQgZmlyc3RUaW1lID0gdHJ1ZVxuICAgICAgICBsZXQgcHJldlZhbHVlOiBUIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkXG4gICAgICAgIHJldHVybiBhdXRvcnVuKCgpID0+IHtcbiAgICAgICAgICAgIC8vIFRPRE86IHdoeSBpcyB0aGlzIGluIGEgZGlmZmVyZW50IHBsYWNlIHRoYW4gdGhlIHNweVJlcG9ydCgpIGZ1bmN0aW9uPyBpbiBhbGwgb3RoZXIgb2JzZXJ2YWJsZXMgaXQncyBjYWxsZWQgaW4gdGhlIHNhbWUgcGxhY2VcbiAgICAgICAgICAgIGxldCBuZXdWYWx1ZSA9IHRoaXMuZ2V0KClcbiAgICAgICAgICAgIGlmICghZmlyc3RUaW1lIHx8IGZpcmVJbW1lZGlhdGVseSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHByZXZVID0gdW50cmFja2VkU3RhcnQoKVxuICAgICAgICAgICAgICAgIGxpc3RlbmVyKHtcbiAgICAgICAgICAgICAgICAgICAgb2JzZXJ2YWJsZUtpbmQ6IFwiY29tcHV0ZWRcIixcbiAgICAgICAgICAgICAgICAgICAgZGVidWdPYmplY3ROYW1lOiB0aGlzLm5hbWVfLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBVUERBVEUsXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdDogdGhpcyxcbiAgICAgICAgICAgICAgICAgICAgbmV3VmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIG9sZFZhbHVlOiBwcmV2VmFsdWVcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIHVudHJhY2tlZEVuZChwcmV2VSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpcnN0VGltZSA9IGZhbHNlXG4gICAgICAgICAgICBwcmV2VmFsdWUgPSBuZXdWYWx1ZVxuICAgICAgICB9KVxuICAgIH1cblxuICAgIHdhcm5BYm91dFVudHJhY2tlZFJlYWRfKCkge1xuICAgICAgICBpZiAoIV9fREVWX18pIHtcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmlzVHJhY2luZ18gIT09IFRyYWNlTW9kZS5OT05FKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICAgICAgICBgW21vYngudHJhY2VdIENvbXB1dGVkIHZhbHVlICcke3RoaXMubmFtZV99JyBpcyBiZWluZyByZWFkIG91dHNpZGUgYSByZWFjdGl2ZSBjb250ZXh0LiBEb2luZyBhIGZ1bGwgcmVjb21wdXRlLmBcbiAgICAgICAgICAgIClcbiAgICAgICAgfVxuICAgICAgICBpZiAoXG4gICAgICAgICAgICB0eXBlb2YgdGhpcy5yZXF1aXJlc1JlYWN0aW9uXyA9PT0gXCJib29sZWFuXCJcbiAgICAgICAgICAgICAgICA/IHRoaXMucmVxdWlyZXNSZWFjdGlvbl9cbiAgICAgICAgICAgICAgICA6IGdsb2JhbFN0YXRlLmNvbXB1dGVkUmVxdWlyZXNSZWFjdGlvblxuICAgICAgICApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICAgICAgICBgW21vYnhdIENvbXB1dGVkIHZhbHVlICcke3RoaXMubmFtZV99JyBpcyBiZWluZyByZWFkIG91dHNpZGUgYSByZWFjdGl2ZSBjb250ZXh0LiBEb2luZyBhIGZ1bGwgcmVjb21wdXRlLmBcbiAgICAgICAgICAgIClcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gYCR7dGhpcy5uYW1lX31bJHt0aGlzLmRlcml2YXRpb24udG9TdHJpbmcoKX1dYFxuICAgIH1cblxuICAgIHZhbHVlT2YoKTogVCB7XG4gICAgICAgIHJldHVybiB0b1ByaW1pdGl2ZSh0aGlzLmdldCgpKVxuICAgIH1cblxuICAgIFtTeW1ib2wudG9QcmltaXRpdmVdKCkge1xuICAgICAgICByZXR1cm4gdGhpcy52YWx1ZU9mKClcbiAgICB9XG59XG5cbmV4cG9ydCBjb25zdCBpc0NvbXB1dGVkVmFsdWUgPSBjcmVhdGVJbnN0YW5jZW9mUHJlZGljYXRlKFwiQ29tcHV0ZWRWYWx1ZVwiLCBDb21wdXRlZFZhbHVlKVxuIiwiaW1wb3J0IHtcbiAgICBJQXRvbSxcbiAgICBJRGVwVHJlZU5vZGUsXG4gICAgSU9ic2VydmFibGUsXG4gICAgYWRkT2JzZXJ2ZXIsXG4gICAgZ2xvYmFsU3RhdGUsXG4gICAgaXNDb21wdXRlZFZhbHVlLFxuICAgIHJlbW92ZU9ic2VydmVyXG59IGZyb20gXCIuLi9pbnRlcm5hbFwiXG5cbmV4cG9ydCBlbnVtIElEZXJpdmF0aW9uU3RhdGVfIHtcbiAgICAvLyBiZWZvcmUgYmVpbmcgcnVuIG9yIChvdXRzaWRlIGJhdGNoIGFuZCBub3QgYmVpbmcgb2JzZXJ2ZWQpXG4gICAgLy8gYXQgdGhpcyBwb2ludCBkZXJpdmF0aW9uIGlzIG5vdCBob2xkaW5nIGFueSBkYXRhIGFib3V0IGRlcGVuZGVuY3kgdHJlZVxuICAgIE5PVF9UUkFDS0lOR18gPSAtMSxcbiAgICAvLyBubyBzaGFsbG93IGRlcGVuZGVuY3kgY2hhbmdlZCBzaW5jZSBsYXN0IGNvbXB1dGF0aW9uXG4gICAgLy8gd29uJ3QgcmVjYWxjdWxhdGUgZGVyaXZhdGlvblxuICAgIC8vIHRoaXMgaXMgd2hhdCBtYWtlcyBtb2J4IGZhc3RcbiAgICBVUF9UT19EQVRFXyA9IDAsXG4gICAgLy8gc29tZSBkZWVwIGRlcGVuZGVuY3kgY2hhbmdlZCwgYnV0IGRvbid0IGtub3cgaWYgc2hhbGxvdyBkZXBlbmRlbmN5IGNoYW5nZWRcbiAgICAvLyB3aWxsIHJlcXVpcmUgdG8gY2hlY2sgZmlyc3QgaWYgVVBfVE9fREFURSBvciBQT1NTSUJMWV9TVEFMRVxuICAgIC8vIGN1cnJlbnRseSBvbmx5IENvbXB1dGVkVmFsdWUgd2lsbCBwcm9wYWdhdGUgUE9TU0lCTFlfU1RBTEVcbiAgICAvL1xuICAgIC8vIGhhdmluZyB0aGlzIHN0YXRlIGlzIHNlY29uZCBiaWcgb3B0aW1pemF0aW9uOlxuICAgIC8vIGRvbid0IGhhdmUgdG8gcmVjb21wdXRlIG9uIGV2ZXJ5IGRlcGVuZGVuY3kgY2hhbmdlLCBidXQgb25seSB3aGVuIGl0J3MgbmVlZGVkXG4gICAgUE9TU0lCTFlfU1RBTEVfID0gMSxcbiAgICAvLyBBIHNoYWxsb3cgZGVwZW5kZW5jeSBoYXMgY2hhbmdlZCBzaW5jZSBsYXN0IGNvbXB1dGF0aW9uIGFuZCB0aGUgZGVyaXZhdGlvblxuICAgIC8vIHdpbGwgbmVlZCB0byByZWNvbXB1dGUgd2hlbiBpdCdzIG5lZWRlZCBuZXh0LlxuICAgIFNUQUxFXyA9IDJcbn1cblxuZXhwb3J0IGVudW0gVHJhY2VNb2RlIHtcbiAgICBOT05FLFxuICAgIExPRyxcbiAgICBCUkVBS1xufVxuXG4vKipcbiAqIEEgZGVyaXZhdGlvbiBpcyBldmVyeXRoaW5nIHRoYXQgY2FuIGJlIGRlcml2ZWQgZnJvbSB0aGUgc3RhdGUgKGFsbCB0aGUgYXRvbXMpIGluIGEgcHVyZSBtYW5uZXIuXG4gKiBTZWUgaHR0cHM6Ly9tZWRpdW0uY29tL0Btd2VzdHN0cmF0ZS9iZWNvbWluZy1mdWxseS1yZWFjdGl2ZS1hbi1pbi1kZXB0aC1leHBsYW5hdGlvbi1vZi1tb2JzZXJ2YWJsZS01NTk5NTI2MmEyNTQjLnh2Ymg2cWQ3NFxuICovXG5leHBvcnQgaW50ZXJmYWNlIElEZXJpdmF0aW9uIGV4dGVuZHMgSURlcFRyZWVOb2RlIHtcbiAgICBvYnNlcnZpbmdfOiBJT2JzZXJ2YWJsZVtdXG4gICAgbmV3T2JzZXJ2aW5nXzogbnVsbCB8IElPYnNlcnZhYmxlW11cbiAgICBkZXBlbmRlbmNpZXNTdGF0ZV86IElEZXJpdmF0aW9uU3RhdGVfXG4gICAgLyoqXG4gICAgICogSWQgb2YgdGhlIGN1cnJlbnQgcnVuIG9mIGEgZGVyaXZhdGlvbi4gRWFjaCB0aW1lIHRoZSBkZXJpdmF0aW9uIGlzIHRyYWNrZWRcbiAgICAgKiB0aGlzIG51bWJlciBpcyBpbmNyZWFzZWQgYnkgb25lLiBUaGlzIG51bWJlciBpcyBnbG9iYWxseSB1bmlxdWVcbiAgICAgKi9cbiAgICBydW5JZF86IG51bWJlclxuICAgIC8qKlxuICAgICAqIGFtb3VudCBvZiBkZXBlbmRlbmNpZXMgdXNlZCBieSB0aGUgZGVyaXZhdGlvbiBpbiB0aGlzIHJ1biwgd2hpY2ggaGFzIG5vdCBiZWVuIGJvdW5kIHlldC5cbiAgICAgKi9cbiAgICB1bmJvdW5kRGVwc0NvdW50XzogbnVtYmVyXG4gICAgb25CZWNvbWVTdGFsZV8oKTogdm9pZFxuICAgIGlzVHJhY2luZ186IFRyYWNlTW9kZVxuXG4gICAgLyoqXG4gICAgICogIHdhcm4gaWYgdGhlIGRlcml2YXRpb24gaGFzIG5vIGRlcGVuZGVuY2llcyBhZnRlciBjcmVhdGlvbi91cGRhdGVcbiAgICAgKi9cbiAgICByZXF1aXJlc09ic2VydmFibGVfPzogYm9vbGVhblxufVxuXG5leHBvcnQgY2xhc3MgQ2F1Z2h0RXhjZXB0aW9uIHtcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgY2F1c2U6IGFueSkge1xuICAgICAgICAvLyBFbXB0eVxuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzQ2F1Z2h0RXhjZXB0aW9uKGU6IGFueSk6IGUgaXMgQ2F1Z2h0RXhjZXB0aW9uIHtcbiAgICByZXR1cm4gZSBpbnN0YW5jZW9mIENhdWdodEV4Y2VwdGlvblxufVxuXG4vKipcbiAqIEZpbmRzIG91dCB3aGV0aGVyIGFueSBkZXBlbmRlbmN5IG9mIHRoZSBkZXJpdmF0aW9uIGhhcyBhY3R1YWxseSBjaGFuZ2VkLlxuICogSWYgZGVwZW5kZW5jaWVzU3RhdGUgaXMgMSB0aGVuIGl0IHdpbGwgcmVjYWxjdWxhdGUgZGVwZW5kZW5jaWVzLFxuICogaWYgYW55IGRlcGVuZGVuY3kgY2hhbmdlZCBpdCB3aWxsIHByb3BhZ2F0ZSBpdCBieSBjaGFuZ2luZyBkZXBlbmRlbmNpZXNTdGF0ZSB0byAyLlxuICpcbiAqIEJ5IGl0ZXJhdGluZyBvdmVyIHRoZSBkZXBlbmRlbmNpZXMgaW4gdGhlIHNhbWUgb3JkZXIgdGhhdCB0aGV5IHdlcmUgcmVwb3J0ZWQgYW5kXG4gKiBzdG9wcGluZyBvbiB0aGUgZmlyc3QgY2hhbmdlLCBhbGwgdGhlIHJlY2FsY3VsYXRpb25zIGFyZSBvbmx5IGNhbGxlZCBmb3IgQ29tcHV0ZWRWYWx1ZXNcbiAqIHRoYXQgd2lsbCBiZSB0cmFja2VkIGJ5IGRlcml2YXRpb24uIFRoYXQgaXMgYmVjYXVzZSB3ZSBhc3N1bWUgdGhhdCBpZiB0aGUgZmlyc3QgeFxuICogZGVwZW5kZW5jaWVzIG9mIHRoZSBkZXJpdmF0aW9uIGRvZXNuJ3QgY2hhbmdlIHRoZW4gdGhlIGRlcml2YXRpb24gc2hvdWxkIHJ1biB0aGUgc2FtZSB3YXlcbiAqIHVwIHVudGlsIGFjY2Vzc2luZyB4LXRoIGRlcGVuZGVuY3kuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzaG91bGRDb21wdXRlKGRlcml2YXRpb246IElEZXJpdmF0aW9uKTogYm9vbGVhbiB7XG4gICAgc3dpdGNoIChkZXJpdmF0aW9uLmRlcGVuZGVuY2llc1N0YXRlXykge1xuICAgICAgICBjYXNlIElEZXJpdmF0aW9uU3RhdGVfLlVQX1RPX0RBVEVfOlxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIGNhc2UgSURlcml2YXRpb25TdGF0ZV8uTk9UX1RSQUNLSU5HXzpcbiAgICAgICAgY2FzZSBJRGVyaXZhdGlvblN0YXRlXy5TVEFMRV86XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICBjYXNlIElEZXJpdmF0aW9uU3RhdGVfLlBPU1NJQkxZX1NUQUxFXzoge1xuICAgICAgICAgICAgLy8gc3RhdGUgcHJvcGFnYXRpb24gY2FuIG9jY3VyIG91dHNpZGUgb2YgYWN0aW9uL3JlYWN0aXZlIGNvbnRleHQgIzIxOTVcbiAgICAgICAgICAgIGNvbnN0IHByZXZBbGxvd1N0YXRlUmVhZHMgPSBhbGxvd1N0YXRlUmVhZHNTdGFydCh0cnVlKVxuICAgICAgICAgICAgY29uc3QgcHJldlVudHJhY2tlZCA9IHVudHJhY2tlZFN0YXJ0KCkgLy8gbm8gbmVlZCBmb3IgdGhvc2UgY29tcHV0ZWRzIHRvIGJlIHJlcG9ydGVkLCB0aGV5IHdpbGwgYmUgcGlja2VkIHVwIGluIHRyYWNrRGVyaXZlZEZ1bmN0aW9uLlxuICAgICAgICAgICAgY29uc3Qgb2JzID0gZGVyaXZhdGlvbi5vYnNlcnZpbmdfLFxuICAgICAgICAgICAgICAgIGwgPSBvYnMubGVuZ3RoXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IG9iaiA9IG9ic1tpXVxuICAgICAgICAgICAgICAgIGlmIChpc0NvbXB1dGVkVmFsdWUob2JqKSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZ2xvYmFsU3RhdGUuZGlzYWJsZUVycm9yQm91bmRhcmllcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JqLmdldCgpXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9iai5nZXQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdlIGFyZSBub3QgaW50ZXJlc3RlZCBpbiB0aGUgdmFsdWUgKm9yKiBleGNlcHRpb24gYXQgdGhpcyBtb21lbnQsIGJ1dCBpZiB0aGVyZSBpcyBvbmUsIG5vdGlmeSBhbGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bnRyYWNrZWRFbmQocHJldlVudHJhY2tlZClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbGxvd1N0YXRlUmVhZHNFbmQocHJldkFsbG93U3RhdGVSZWFkcylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIGlmIENvbXB1dGVkVmFsdWUgYG9iamAgYWN0dWFsbHkgY2hhbmdlZCBpdCB3aWxsIGJlIGNvbXB1dGVkIGFuZCBwcm9wYWdhdGVkIHRvIGl0cyBvYnNlcnZlcnMuXG4gICAgICAgICAgICAgICAgICAgIC8vIGFuZCBgZGVyaXZhdGlvbmAgaXMgYW4gb2JzZXJ2ZXIgb2YgYG9iamBcbiAgICAgICAgICAgICAgICAgICAgLy8gaW52YXJpYW50U2hvdWxkQ29tcHV0ZShkZXJpdmF0aW9uKVxuICAgICAgICAgICAgICAgICAgICBpZiAoKGRlcml2YXRpb24uZGVwZW5kZW5jaWVzU3RhdGVfIGFzIGFueSkgPT09IElEZXJpdmF0aW9uU3RhdGVfLlNUQUxFXykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdW50cmFja2VkRW5kKHByZXZVbnRyYWNrZWQpXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGxvd1N0YXRlUmVhZHNFbmQocHJldkFsbG93U3RhdGVSZWFkcylcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjaGFuZ2VEZXBlbmRlbmNpZXNTdGF0ZVRvMChkZXJpdmF0aW9uKVxuICAgICAgICAgICAgdW50cmFja2VkRW5kKHByZXZVbnRyYWNrZWQpXG4gICAgICAgICAgICBhbGxvd1N0YXRlUmVhZHNFbmQocHJldkFsbG93U3RhdGVSZWFkcylcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNDb21wdXRpbmdEZXJpdmF0aW9uKCkge1xuICAgIHJldHVybiBnbG9iYWxTdGF0ZS50cmFja2luZ0Rlcml2YXRpb24gIT09IG51bGwgLy8gZmlsdGVyIG91dCBhY3Rpb25zIGluc2lkZSBjb21wdXRhdGlvbnNcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrSWZTdGF0ZU1vZGlmaWNhdGlvbnNBcmVBbGxvd2VkKGF0b206IElBdG9tKSB7XG4gICAgaWYgKCFfX0RFVl9fKSB7XG4gICAgICAgIHJldHVyblxuICAgIH1cbiAgICBjb25zdCBoYXNPYnNlcnZlcnMgPSBhdG9tLm9ic2VydmVyc18uc2l6ZSA+IDBcbiAgICAvLyBTaG91bGQgbm90IGJlIHBvc3NpYmxlIHRvIGNoYW5nZSBvYnNlcnZlZCBzdGF0ZSBvdXRzaWRlIHN0cmljdCBtb2RlLCBleGNlcHQgZHVyaW5nIGluaXRpYWxpemF0aW9uLCBzZWUgIzU2M1xuICAgIGlmIChcbiAgICAgICAgIWdsb2JhbFN0YXRlLmFsbG93U3RhdGVDaGFuZ2VzICYmXG4gICAgICAgIChoYXNPYnNlcnZlcnMgfHwgZ2xvYmFsU3RhdGUuZW5mb3JjZUFjdGlvbnMgPT09IFwiYWx3YXlzXCIpXG4gICAgKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICAgIFwiW01vYlhdIFwiICtcbiAgICAgICAgICAgICAgICAoZ2xvYmFsU3RhdGUuZW5mb3JjZUFjdGlvbnNcbiAgICAgICAgICAgICAgICAgICAgPyBcIlNpbmNlIHN0cmljdC1tb2RlIGlzIGVuYWJsZWQsIGNoYW5naW5nIChvYnNlcnZlZCkgb2JzZXJ2YWJsZSB2YWx1ZXMgd2l0aG91dCB1c2luZyBhbiBhY3Rpb24gaXMgbm90IGFsbG93ZWQuIFRyaWVkIHRvIG1vZGlmeTogXCJcbiAgICAgICAgICAgICAgICAgICAgOiBcIlNpZGUgZWZmZWN0cyBsaWtlIGNoYW5naW5nIHN0YXRlIGFyZSBub3QgYWxsb3dlZCBhdCB0aGlzIHBvaW50LiBBcmUgeW91IHRyeWluZyB0byBtb2RpZnkgc3RhdGUgZnJvbSwgZm9yIGV4YW1wbGUsIGEgY29tcHV0ZWQgdmFsdWUgb3IgdGhlIHJlbmRlciBmdW5jdGlvbiBvZiBhIFJlYWN0IGNvbXBvbmVudD8gWW91IGNhbiB3cmFwIHNpZGUgZWZmZWN0cyBpbiAncnVuSW5BY3Rpb24nIChvciBkZWNvcmF0ZSBmdW5jdGlvbnMgd2l0aCAnYWN0aW9uJykgaWYgbmVlZGVkLiBUcmllZCB0byBtb2RpZnk6IFwiKSArXG4gICAgICAgICAgICAgICAgYXRvbS5uYW1lX1xuICAgICAgICApXG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tJZlN0YXRlUmVhZHNBcmVBbGxvd2VkKG9ic2VydmFibGU6IElPYnNlcnZhYmxlKSB7XG4gICAgaWYgKF9fREVWX18gJiYgIWdsb2JhbFN0YXRlLmFsbG93U3RhdGVSZWFkcyAmJiBnbG9iYWxTdGF0ZS5vYnNlcnZhYmxlUmVxdWlyZXNSZWFjdGlvbikge1xuICAgICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICAgICBgW21vYnhdIE9ic2VydmFibGUgJyR7b2JzZXJ2YWJsZS5uYW1lX30nIGJlaW5nIHJlYWQgb3V0c2lkZSBhIHJlYWN0aXZlIGNvbnRleHQuYFxuICAgICAgICApXG4gICAgfVxufVxuXG4vKipcbiAqIEV4ZWN1dGVzIHRoZSBwcm92aWRlZCBmdW5jdGlvbiBgZmAgYW5kIHRyYWNrcyB3aGljaCBvYnNlcnZhYmxlcyBhcmUgYmVpbmcgYWNjZXNzZWQuXG4gKiBUaGUgdHJhY2tpbmcgaW5mb3JtYXRpb24gaXMgc3RvcmVkIG9uIHRoZSBgZGVyaXZhdGlvbmAgb2JqZWN0IGFuZCB0aGUgZGVyaXZhdGlvbiBpcyByZWdpc3RlcmVkXG4gKiBhcyBvYnNlcnZlciBvZiBhbnkgb2YgdGhlIGFjY2Vzc2VkIG9ic2VydmFibGVzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJhY2tEZXJpdmVkRnVuY3Rpb248VD4oZGVyaXZhdGlvbjogSURlcml2YXRpb24sIGY6ICgpID0+IFQsIGNvbnRleHQ6IGFueSkge1xuICAgIGNvbnN0IHByZXZBbGxvd1N0YXRlUmVhZHMgPSBhbGxvd1N0YXRlUmVhZHNTdGFydCh0cnVlKVxuICAgIC8vIHByZSBhbGxvY2F0ZSBhcnJheSBhbGxvY2F0aW9uICsgcm9vbSBmb3IgdmFyaWF0aW9uIGluIGRlcHNcbiAgICAvLyBhcnJheSB3aWxsIGJlIHRyaW1tZWQgYnkgYmluZERlcGVuZGVuY2llc1xuICAgIGNoYW5nZURlcGVuZGVuY2llc1N0YXRlVG8wKGRlcml2YXRpb24pXG4gICAgZGVyaXZhdGlvbi5uZXdPYnNlcnZpbmdfID0gbmV3IEFycmF5KGRlcml2YXRpb24ub2JzZXJ2aW5nXy5sZW5ndGggKyAxMDApXG4gICAgZGVyaXZhdGlvbi51bmJvdW5kRGVwc0NvdW50XyA9IDBcbiAgICBkZXJpdmF0aW9uLnJ1bklkXyA9ICsrZ2xvYmFsU3RhdGUucnVuSWRcbiAgICBjb25zdCBwcmV2VHJhY2tpbmcgPSBnbG9iYWxTdGF0ZS50cmFja2luZ0Rlcml2YXRpb25cbiAgICBnbG9iYWxTdGF0ZS50cmFja2luZ0Rlcml2YXRpb24gPSBkZXJpdmF0aW9uXG4gICAgZ2xvYmFsU3RhdGUuaW5CYXRjaCsrXG4gICAgbGV0IHJlc3VsdFxuICAgIGlmIChnbG9iYWxTdGF0ZS5kaXNhYmxlRXJyb3JCb3VuZGFyaWVzID09PSB0cnVlKSB7XG4gICAgICAgIHJlc3VsdCA9IGYuY2FsbChjb250ZXh0KVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXN1bHQgPSBmLmNhbGwoY29udGV4dClcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgcmVzdWx0ID0gbmV3IENhdWdodEV4Y2VwdGlvbihlKVxuICAgICAgICB9XG4gICAgfVxuICAgIGdsb2JhbFN0YXRlLmluQmF0Y2gtLVxuICAgIGdsb2JhbFN0YXRlLnRyYWNraW5nRGVyaXZhdGlvbiA9IHByZXZUcmFja2luZ1xuICAgIGJpbmREZXBlbmRlbmNpZXMoZGVyaXZhdGlvbilcblxuICAgIHdhcm5BYm91dERlcml2YXRpb25XaXRob3V0RGVwZW5kZW5jaWVzKGRlcml2YXRpb24pXG4gICAgYWxsb3dTdGF0ZVJlYWRzRW5kKHByZXZBbGxvd1N0YXRlUmVhZHMpXG4gICAgcmV0dXJuIHJlc3VsdFxufVxuXG5mdW5jdGlvbiB3YXJuQWJvdXREZXJpdmF0aW9uV2l0aG91dERlcGVuZGVuY2llcyhkZXJpdmF0aW9uOiBJRGVyaXZhdGlvbikge1xuICAgIGlmICghX19ERVZfXykge1xuICAgICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBpZiAoZGVyaXZhdGlvbi5vYnNlcnZpbmdfLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBpZiAoXG4gICAgICAgIHR5cGVvZiBkZXJpdmF0aW9uLnJlcXVpcmVzT2JzZXJ2YWJsZV8gPT09IFwiYm9vbGVhblwiXG4gICAgICAgICAgICA/IGRlcml2YXRpb24ucmVxdWlyZXNPYnNlcnZhYmxlX1xuICAgICAgICAgICAgOiBnbG9iYWxTdGF0ZS5yZWFjdGlvblJlcXVpcmVzT2JzZXJ2YWJsZVxuICAgICkge1xuICAgICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICAgICBgW21vYnhdIERlcml2YXRpb24gJyR7ZGVyaXZhdGlvbi5uYW1lX30nIGlzIGNyZWF0ZWQvdXBkYXRlZCB3aXRob3V0IHJlYWRpbmcgYW55IG9ic2VydmFibGUgdmFsdWUuYFxuICAgICAgICApXG4gICAgfVxufVxuXG4vKipcbiAqIGRpZmZzIG5ld09ic2VydmluZyB3aXRoIG9ic2VydmluZy5cbiAqIHVwZGF0ZSBvYnNlcnZpbmcgdG8gYmUgbmV3T2JzZXJ2aW5nIHdpdGggdW5pcXVlIG9ic2VydmFibGVzXG4gKiBub3RpZnkgb2JzZXJ2ZXJzIHRoYXQgYmVjb21lIG9ic2VydmVkL3Vub2JzZXJ2ZWRcbiAqL1xuZnVuY3Rpb24gYmluZERlcGVuZGVuY2llcyhkZXJpdmF0aW9uOiBJRGVyaXZhdGlvbikge1xuICAgIC8vIGludmFyaWFudChkZXJpdmF0aW9uLmRlcGVuZGVuY2llc1N0YXRlICE9PSBJRGVyaXZhdGlvblN0YXRlLk5PVF9UUkFDS0lORywgXCJJTlRFUk5BTCBFUlJPUiBiaW5kRGVwZW5kZW5jaWVzIGV4cGVjdHMgZGVyaXZhdGlvbi5kZXBlbmRlbmNpZXNTdGF0ZSAhPT0gLTFcIik7XG4gICAgY29uc3QgcHJldk9ic2VydmluZyA9IGRlcml2YXRpb24ub2JzZXJ2aW5nX1xuICAgIGNvbnN0IG9ic2VydmluZyA9IChkZXJpdmF0aW9uLm9ic2VydmluZ18gPSBkZXJpdmF0aW9uLm5ld09ic2VydmluZ18hKVxuICAgIGxldCBsb3dlc3ROZXdPYnNlcnZpbmdEZXJpdmF0aW9uU3RhdGUgPSBJRGVyaXZhdGlvblN0YXRlXy5VUF9UT19EQVRFX1xuXG4gICAgLy8gR28gdGhyb3VnaCBhbGwgbmV3IG9ic2VydmFibGVzIGFuZCBjaGVjayBkaWZmVmFsdWU6ICh0aGlzIGxpc3QgY2FuIGNvbnRhaW4gZHVwbGljYXRlcyk6XG4gICAgLy8gICAwOiBmaXJzdCBvY2N1cnJlbmNlLCBjaGFuZ2UgdG8gMSBhbmQga2VlcCBpdFxuICAgIC8vICAgMTogZXh0cmEgb2NjdXJyZW5jZSwgZHJvcCBpdFxuICAgIGxldCBpMCA9IDAsXG4gICAgICAgIGwgPSBkZXJpdmF0aW9uLnVuYm91bmREZXBzQ291bnRfXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgY29uc3QgZGVwID0gb2JzZXJ2aW5nW2ldXG4gICAgICAgIGlmIChkZXAuZGlmZlZhbHVlXyA9PT0gMCkge1xuICAgICAgICAgICAgZGVwLmRpZmZWYWx1ZV8gPSAxXG4gICAgICAgICAgICBpZiAoaTAgIT09IGkpIHtcbiAgICAgICAgICAgICAgICBvYnNlcnZpbmdbaTBdID0gZGVwXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpMCsrXG4gICAgICAgIH1cblxuICAgICAgICAvLyBVcGNhc3QgaXMgJ3NhZmUnIGhlcmUsIGJlY2F1c2UgaWYgZGVwIGlzIElPYnNlcnZhYmxlLCBgZGVwZW5kZW5jaWVzU3RhdGVgIHdpbGwgYmUgdW5kZWZpbmVkLFxuICAgICAgICAvLyBub3QgaGl0dGluZyB0aGUgY29uZGl0aW9uXG4gICAgICAgIGlmICgoZGVwIGFzIGFueSBhcyBJRGVyaXZhdGlvbikuZGVwZW5kZW5jaWVzU3RhdGVfID4gbG93ZXN0TmV3T2JzZXJ2aW5nRGVyaXZhdGlvblN0YXRlKSB7XG4gICAgICAgICAgICBsb3dlc3ROZXdPYnNlcnZpbmdEZXJpdmF0aW9uU3RhdGUgPSAoZGVwIGFzIGFueSBhcyBJRGVyaXZhdGlvbikuZGVwZW5kZW5jaWVzU3RhdGVfXG4gICAgICAgIH1cbiAgICB9XG4gICAgb2JzZXJ2aW5nLmxlbmd0aCA9IGkwXG5cbiAgICBkZXJpdmF0aW9uLm5ld09ic2VydmluZ18gPSBudWxsIC8vIG5ld09ic2VydmluZyBzaG91bGRuJ3QgYmUgbmVlZGVkIG91dHNpZGUgdHJhY2tpbmcgKHN0YXRlbWVudCBtb3ZlZCBkb3duIHRvIHdvcmsgYXJvdW5kIEZGIGJ1Zywgc2VlICM2MTQpXG5cbiAgICAvLyBHbyB0aHJvdWdoIGFsbCBvbGQgb2JzZXJ2YWJsZXMgYW5kIGNoZWNrIGRpZmZWYWx1ZTogKGl0IGlzIHVuaXF1ZSBhZnRlciBsYXN0IGJpbmREZXBlbmRlbmNpZXMpXG4gICAgLy8gICAwOiBpdCdzIG5vdCBpbiBuZXcgb2JzZXJ2YWJsZXMsIHVub2JzZXJ2ZSBpdFxuICAgIC8vICAgMTogaXQga2VlcHMgYmVpbmcgb2JzZXJ2ZWQsIGRvbid0IHdhbnQgdG8gbm90aWZ5IGl0LiBjaGFuZ2UgdG8gMFxuICAgIGwgPSBwcmV2T2JzZXJ2aW5nLmxlbmd0aFxuICAgIHdoaWxlIChsLS0pIHtcbiAgICAgICAgY29uc3QgZGVwID0gcHJldk9ic2VydmluZ1tsXVxuICAgICAgICBpZiAoZGVwLmRpZmZWYWx1ZV8gPT09IDApIHtcbiAgICAgICAgICAgIHJlbW92ZU9ic2VydmVyKGRlcCwgZGVyaXZhdGlvbilcbiAgICAgICAgfVxuICAgICAgICBkZXAuZGlmZlZhbHVlXyA9IDBcbiAgICB9XG5cbiAgICAvLyBHbyB0aHJvdWdoIGFsbCBuZXcgb2JzZXJ2YWJsZXMgYW5kIGNoZWNrIGRpZmZWYWx1ZTogKG5vdyBpdCBzaG91bGQgYmUgdW5pcXVlKVxuICAgIC8vICAgMDogaXQgd2FzIHNldCB0byAwIGluIGxhc3QgbG9vcC4gZG9uJ3QgbmVlZCB0byBkbyBhbnl0aGluZy5cbiAgICAvLyAgIDE6IGl0IHdhc24ndCBvYnNlcnZlZCwgbGV0J3Mgb2JzZXJ2ZSBpdC4gc2V0IGJhY2sgdG8gMFxuICAgIHdoaWxlIChpMC0tKSB7XG4gICAgICAgIGNvbnN0IGRlcCA9IG9ic2VydmluZ1tpMF1cbiAgICAgICAgaWYgKGRlcC5kaWZmVmFsdWVfID09PSAxKSB7XG4gICAgICAgICAgICBkZXAuZGlmZlZhbHVlXyA9IDBcbiAgICAgICAgICAgIGFkZE9ic2VydmVyKGRlcCwgZGVyaXZhdGlvbilcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFNvbWUgbmV3IG9ic2VydmVkIGRlcml2YXRpb25zIG1heSBiZWNvbWUgc3RhbGUgZHVyaW5nIHRoaXMgZGVyaXZhdGlvbiBjb21wdXRhdGlvblxuICAgIC8vIHNvIHRoZXkgaGF2ZSBoYWQgbm8gY2hhbmNlIHRvIHByb3BhZ2F0ZSBzdGFsZW5lc3MgKCM5MTYpXG4gICAgaWYgKGxvd2VzdE5ld09ic2VydmluZ0Rlcml2YXRpb25TdGF0ZSAhPT0gSURlcml2YXRpb25TdGF0ZV8uVVBfVE9fREFURV8pIHtcbiAgICAgICAgZGVyaXZhdGlvbi5kZXBlbmRlbmNpZXNTdGF0ZV8gPSBsb3dlc3ROZXdPYnNlcnZpbmdEZXJpdmF0aW9uU3RhdGVcbiAgICAgICAgZGVyaXZhdGlvbi5vbkJlY29tZVN0YWxlXygpXG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY2xlYXJPYnNlcnZpbmcoZGVyaXZhdGlvbjogSURlcml2YXRpb24pIHtcbiAgICAvLyBpbnZhcmlhbnQoZ2xvYmFsU3RhdGUuaW5CYXRjaCA+IDAsIFwiSU5URVJOQUwgRVJST1IgY2xlYXJPYnNlcnZpbmcgc2hvdWxkIGJlIGNhbGxlZCBvbmx5IGluc2lkZSBiYXRjaFwiKTtcbiAgICBjb25zdCBvYnMgPSBkZXJpdmF0aW9uLm9ic2VydmluZ19cbiAgICBkZXJpdmF0aW9uLm9ic2VydmluZ18gPSBbXVxuICAgIGxldCBpID0gb2JzLmxlbmd0aFxuICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgcmVtb3ZlT2JzZXJ2ZXIob2JzW2ldLCBkZXJpdmF0aW9uKVxuICAgIH1cblxuICAgIGRlcml2YXRpb24uZGVwZW5kZW5jaWVzU3RhdGVfID0gSURlcml2YXRpb25TdGF0ZV8uTk9UX1RSQUNLSU5HX1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW50cmFja2VkPFQ+KGFjdGlvbjogKCkgPT4gVCk6IFQge1xuICAgIGNvbnN0IHByZXYgPSB1bnRyYWNrZWRTdGFydCgpXG4gICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIGFjdGlvbigpXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgICAgdW50cmFja2VkRW5kKHByZXYpXG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdW50cmFja2VkU3RhcnQoKTogSURlcml2YXRpb24gfCBudWxsIHtcbiAgICBjb25zdCBwcmV2ID0gZ2xvYmFsU3RhdGUudHJhY2tpbmdEZXJpdmF0aW9uXG4gICAgZ2xvYmFsU3RhdGUudHJhY2tpbmdEZXJpdmF0aW9uID0gbnVsbFxuICAgIHJldHVybiBwcmV2XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bnRyYWNrZWRFbmQocHJldjogSURlcml2YXRpb24gfCBudWxsKSB7XG4gICAgZ2xvYmFsU3RhdGUudHJhY2tpbmdEZXJpdmF0aW9uID0gcHJldlxufVxuXG5leHBvcnQgZnVuY3Rpb24gYWxsb3dTdGF0ZVJlYWRzU3RhcnQoYWxsb3dTdGF0ZVJlYWRzOiBib29sZWFuKSB7XG4gICAgY29uc3QgcHJldiA9IGdsb2JhbFN0YXRlLmFsbG93U3RhdGVSZWFkc1xuICAgIGdsb2JhbFN0YXRlLmFsbG93U3RhdGVSZWFkcyA9IGFsbG93U3RhdGVSZWFkc1xuICAgIHJldHVybiBwcmV2XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbGxvd1N0YXRlUmVhZHNFbmQocHJldjogYm9vbGVhbikge1xuICAgIGdsb2JhbFN0YXRlLmFsbG93U3RhdGVSZWFkcyA9IHByZXZcbn1cblxuLyoqXG4gKiBuZWVkZWQgdG8ga2VlcCBgbG93ZXN0T2JzZXJ2ZXJTdGF0ZWAgY29ycmVjdC4gd2hlbiBjaGFuZ2luZyBmcm9tICgyIG9yIDEpIHRvIDBcbiAqXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjaGFuZ2VEZXBlbmRlbmNpZXNTdGF0ZVRvMChkZXJpdmF0aW9uOiBJRGVyaXZhdGlvbikge1xuICAgIGlmIChkZXJpdmF0aW9uLmRlcGVuZGVuY2llc1N0YXRlXyA9PT0gSURlcml2YXRpb25TdGF0ZV8uVVBfVE9fREFURV8pIHtcbiAgICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGRlcml2YXRpb24uZGVwZW5kZW5jaWVzU3RhdGVfID0gSURlcml2YXRpb25TdGF0ZV8uVVBfVE9fREFURV9cblxuICAgIGNvbnN0IG9icyA9IGRlcml2YXRpb24ub2JzZXJ2aW5nX1xuICAgIGxldCBpID0gb2JzLmxlbmd0aFxuICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgb2JzW2ldLmxvd2VzdE9ic2VydmVyU3RhdGVfID0gSURlcml2YXRpb25TdGF0ZV8uVVBfVE9fREFURV9cbiAgICB9XG59XG4iLCJpbXBvcnQgeyBJRGVyaXZhdGlvbiwgSU9ic2VydmFibGUsIFJlYWN0aW9uLCBkaWUsIGdldEdsb2JhbCB9IGZyb20gXCIuLi9pbnRlcm5hbFwiXG5pbXBvcnQgeyBDb21wdXRlZFZhbHVlIH0gZnJvbSBcIi4vY29tcHV0ZWR2YWx1ZVwiXG5cbi8qKlxuICogVGhlc2UgdmFsdWVzIHdpbGwgcGVyc2lzdCBpZiBnbG9iYWwgc3RhdGUgaXMgcmVzZXRcbiAqL1xuY29uc3QgcGVyc2lzdGVudEtleXM6IChrZXlvZiBNb2JYR2xvYmFscylbXSA9IFtcbiAgICBcIm1vYnhHdWlkXCIsXG4gICAgXCJzcHlMaXN0ZW5lcnNcIixcbiAgICBcImVuZm9yY2VBY3Rpb25zXCIsXG4gICAgXCJjb21wdXRlZFJlcXVpcmVzUmVhY3Rpb25cIixcbiAgICBcInJlYWN0aW9uUmVxdWlyZXNPYnNlcnZhYmxlXCIsXG4gICAgXCJvYnNlcnZhYmxlUmVxdWlyZXNSZWFjdGlvblwiLFxuICAgIFwiYWxsb3dTdGF0ZVJlYWRzXCIsXG4gICAgXCJkaXNhYmxlRXJyb3JCb3VuZGFyaWVzXCIsXG4gICAgXCJydW5JZFwiLFxuICAgIFwiVU5DSEFOR0VEXCIsXG4gICAgXCJ1c2VQcm94aWVzXCJcbl1cblxuZXhwb3J0IHR5cGUgSVVOQ0hBTkdFRCA9IHt9XG5cbmV4cG9ydCBjbGFzcyBNb2JYR2xvYmFscyB7XG4gICAgLyoqXG4gICAgICogTW9iWEdsb2JhbHMgdmVyc2lvbi5cbiAgICAgKiBNb2JYIGNvbXBhdGlibGl0eSB3aXRoIG90aGVyIHZlcnNpb25zIGxvYWRlZCBpbiBtZW1vcnkgYXMgbG9uZyBhcyB0aGlzIHZlcnNpb24gbWF0Y2hlcy5cbiAgICAgKiBJdCBpbmRpY2F0ZXMgdGhhdCB0aGUgZ2xvYmFsIHN0YXRlIHN0aWxsIHN0b3JlcyBzaW1pbGFyIGluZm9ybWF0aW9uXG4gICAgICpcbiAgICAgKiBOLkI6IHRoaXMgdmVyc2lvbiBpcyB1bnJlbGF0ZWQgdG8gdGhlIHBhY2thZ2UgdmVyc2lvbiBvZiBNb2JYLCBhbmQgaXMgb25seSB0aGUgdmVyc2lvbiBvZiB0aGVcbiAgICAgKiBpbnRlcm5hbCBzdGF0ZSBzdG9yYWdlIG9mIE1vYlgsIGFuZCBjYW4gYmUgdGhlIHNhbWUgYWNyb3NzIG1hbnkgZGlmZmVyZW50IHBhY2thZ2UgdmVyc2lvbnNcbiAgICAgKi9cbiAgICB2ZXJzaW9uID0gNlxuXG4gICAgLyoqXG4gICAgICogZ2xvYmFsbHkgdW5pcXVlIHRva2VuIHRvIHNpZ25hbCB1bmNoYW5nZWRcbiAgICAgKi9cbiAgICBVTkNIQU5HRUQ6IElVTkNIQU5HRUQgPSB7fVxuXG4gICAgLyoqXG4gICAgICogQ3VycmVudGx5IHJ1bm5pbmcgZGVyaXZhdGlvblxuICAgICAqL1xuICAgIHRyYWNraW5nRGVyaXZhdGlvbjogSURlcml2YXRpb24gfCBudWxsID0gbnVsbFxuXG4gICAgLyoqXG4gICAgICogQ3VycmVudGx5IHJ1bm5pbmcgcmVhY3Rpb24uIFRoaXMgZGV0ZXJtaW5lcyBpZiB3ZSBjdXJyZW50bHkgaGF2ZSBhIHJlYWN0aXZlIGNvbnRleHQuXG4gICAgICogKFRyYWNraW5nIGRlcml2YXRpb24gaXMgYWxzbyBzZXQgZm9yIHRlbXBvcmFsIHRyYWNraW5nIG9mIGNvbXB1dGVkIHZhbHVlcyBpbnNpZGUgYWN0aW9ucyxcbiAgICAgKiBidXQgdHJhY2tpbmdSZWFjdGlvbiBjYW4gb25seSBiZSBzZXQgYnkgYSBmb3JtIG9mIFJlYWN0aW9uKVxuICAgICAqL1xuICAgIHRyYWNraW5nQ29udGV4dDogUmVhY3Rpb24gfCBDb21wdXRlZFZhbHVlPGFueT4gfCBudWxsID0gbnVsbFxuXG4gICAgLyoqXG4gICAgICogRWFjaCB0aW1lIGEgZGVyaXZhdGlvbiBpcyB0cmFja2VkLCBpdCBpcyBhc3NpZ25lZCBhIHVuaXF1ZSBydW4taWRcbiAgICAgKi9cbiAgICBydW5JZCA9IDBcblxuICAgIC8qKlxuICAgICAqICdndWlkJyBmb3IgZ2VuZXJhbCBwdXJwb3NlLiBXaWxsIGJlIHBlcnNpc3RlZCBhbW9uZ3N0IHJlc2V0cy5cbiAgICAgKi9cbiAgICBtb2J4R3VpZCA9IDBcblxuICAgIC8qKlxuICAgICAqIEFyZSB3ZSBpbiBhIGJhdGNoIGJsb2NrPyAoYW5kIGhvdyBtYW55IG9mIHRoZW0pXG4gICAgICovXG4gICAgaW5CYXRjaDogbnVtYmVyID0gMFxuXG4gICAgLyoqXG4gICAgICogT2JzZXJ2YWJsZXMgdGhhdCBkb24ndCBoYXZlIG9ic2VydmVycyBhbnltb3JlLCBhbmQgYXJlIGFib3V0IHRvIGJlXG4gICAgICogc3VzcGVuZGVkLCB1bmxlc3Mgc29tZWJvZHkgZWxzZSBhY2Nlc3NlcyBpdCBpbiB0aGUgc2FtZSBiYXRjaFxuICAgICAqXG4gICAgICogQHR5cGUge0lPYnNlcnZhYmxlW119XG4gICAgICovXG4gICAgcGVuZGluZ1Vub2JzZXJ2YXRpb25zOiBJT2JzZXJ2YWJsZVtdID0gW11cblxuICAgIC8qKlxuICAgICAqIExpc3Qgb2Ygc2NoZWR1bGVkLCBub3QgeWV0IGV4ZWN1dGVkLCByZWFjdGlvbnMuXG4gICAgICovXG4gICAgcGVuZGluZ1JlYWN0aW9uczogUmVhY3Rpb25bXSA9IFtdXG5cbiAgICAvKipcbiAgICAgKiBBcmUgd2UgY3VycmVudGx5IHByb2Nlc3NpbmcgcmVhY3Rpb25zP1xuICAgICAqL1xuICAgIGlzUnVubmluZ1JlYWN0aW9ucyA9IGZhbHNlXG5cbiAgICAvKipcbiAgICAgKiBJcyBpdCBhbGxvd2VkIHRvIGNoYW5nZSBvYnNlcnZhYmxlcyBhdCB0aGlzIHBvaW50P1xuICAgICAqIEluIGdlbmVyYWwsIE1vYlggZG9lc24ndCBhbGxvdyB0aGF0IHdoZW4gcnVubmluZyBjb21wdXRhdGlvbnMgYW5kIFJlYWN0LnJlbmRlci5cbiAgICAgKiBUbyBlbnN1cmUgdGhhdCB0aG9zZSBmdW5jdGlvbnMgc3RheSBwdXJlLlxuICAgICAqL1xuICAgIGFsbG93U3RhdGVDaGFuZ2VzID0gZmFsc2VcblxuICAgIC8qKlxuICAgICAqIElzIGl0IGFsbG93ZWQgdG8gcmVhZCBvYnNlcnZhYmxlcyBhdCB0aGlzIHBvaW50P1xuICAgICAqIFVzZWQgdG8gaG9sZCB0aGUgc3RhdGUgbmVlZGVkIGZvciBgb2JzZXJ2YWJsZVJlcXVpcmVzUmVhY3Rpb25gXG4gICAgICovXG4gICAgYWxsb3dTdGF0ZVJlYWRzID0gdHJ1ZVxuXG4gICAgLyoqXG4gICAgICogSWYgc3RyaWN0IG1vZGUgaXMgZW5hYmxlZCwgc3RhdGUgY2hhbmdlcyBhcmUgYnkgZGVmYXVsdCBub3QgYWxsb3dlZFxuICAgICAqL1xuICAgIGVuZm9yY2VBY3Rpb25zOiBib29sZWFuIHwgXCJhbHdheXNcIiA9IHRydWVcblxuICAgIC8qKlxuICAgICAqIFNweSBjYWxsYmFja3NcbiAgICAgKi9cbiAgICBzcHlMaXN0ZW5lcnM6IHsgKGNoYW5nZTogYW55KTogdm9pZCB9W10gPSBbXVxuXG4gICAgLyoqXG4gICAgICogR2xvYmFsbHkgYXR0YWNoZWQgZXJyb3IgaGFuZGxlcnMgdGhhdCByZWFjdCBzcGVjaWZpY2FsbHkgdG8gZXJyb3JzIGluIHJlYWN0aW9uc1xuICAgICAqL1xuICAgIGdsb2JhbFJlYWN0aW9uRXJyb3JIYW5kbGVyczogKChlcnJvcjogYW55LCBkZXJpdmF0aW9uOiBJRGVyaXZhdGlvbikgPT4gdm9pZClbXSA9IFtdXG5cbiAgICAvKipcbiAgICAgKiBXYXJuIGlmIGNvbXB1dGVkIHZhbHVlcyBhcmUgYWNjZXNzZWQgb3V0c2lkZSBhIHJlYWN0aXZlIGNvbnRleHRcbiAgICAgKi9cbiAgICBjb21wdXRlZFJlcXVpcmVzUmVhY3Rpb24gPSBmYWxzZVxuXG4gICAgLyoqXG4gICAgICogKEV4cGVyaW1lbnRhbClcbiAgICAgKiBXYXJuIGlmIHlvdSB0cnkgdG8gY3JlYXRlIHRvIGRlcml2YXRpb24gLyByZWFjdGl2ZSBjb250ZXh0IHdpdGhvdXQgYWNjZXNzaW5nIGFueSBvYnNlcnZhYmxlLlxuICAgICAqL1xuICAgIHJlYWN0aW9uUmVxdWlyZXNPYnNlcnZhYmxlID0gZmFsc2VcblxuICAgIC8qKlxuICAgICAqIChFeHBlcmltZW50YWwpXG4gICAgICogV2FybiBpZiBvYnNlcnZhYmxlcyBhcmUgYWNjZXNzZWQgb3V0c2lkZSBhIHJlYWN0aXZlIGNvbnRleHRcbiAgICAgKi9cbiAgICBvYnNlcnZhYmxlUmVxdWlyZXNSZWFjdGlvbiA9IGZhbHNlXG5cbiAgICAvKlxuICAgICAqIERvbid0IGNhdGNoIGFuZCByZXRocm93IGV4Y2VwdGlvbnMuIFRoaXMgaXMgdXNlZnVsIGZvciBpbnNwZWN0aW5nIHRoZSBzdGF0ZSBvZlxuICAgICAqIHRoZSBzdGFjayB3aGVuIGFuIGV4Y2VwdGlvbiBvY2N1cnMgd2hpbGUgZGVidWdnaW5nLlxuICAgICAqL1xuICAgIGRpc2FibGVFcnJvckJvdW5kYXJpZXMgPSBmYWxzZVxuXG4gICAgLypcbiAgICAgKiBJZiB0cnVlLCB3ZSBhcmUgYWxyZWFkeSBoYW5kbGluZyBhbiBleGNlcHRpb24gaW4gYW4gYWN0aW9uLiBBbnkgZXJyb3JzIGluIHJlYWN0aW9ucyBzaG91bGQgYmUgc3VwcHJlc3NlZCwgYXNcbiAgICAgKiB0aGV5IGFyZSBub3QgdGhlIGNhdXNlLCBzZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9tb2J4anMvbW9ieC9pc3N1ZXMvMTgzNlxuICAgICAqL1xuICAgIHN1cHByZXNzUmVhY3Rpb25FcnJvcnMgPSBmYWxzZVxuXG4gICAgdXNlUHJveGllcyA9IHRydWVcbiAgICAvKlxuICAgICAqIHByaW50IHdhcm5pbmdzIGFib3V0IGNvZGUgdGhhdCB3b3VsZCBmYWlsIGlmIHByb3hpZXMgd2VyZW4ndCBhdmFpbGFibGVcbiAgICAgKi9cbiAgICB2ZXJpZnlQcm94aWVzID0gZmFsc2VcblxuICAgIC8qKlxuICAgICAqIEZhbHNlIGZvcmNlcyBhbGwgb2JqZWN0J3MgZGVzY3JpcHRvcnMgdG9cbiAgICAgKiB3cml0YWJsZTogdHJ1ZVxuICAgICAqIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAqL1xuICAgIHNhZmVEZXNjcmlwdG9ycyA9IHRydWVcbn1cblxubGV0IGNhbk1lcmdlR2xvYmFsU3RhdGUgPSB0cnVlXG5sZXQgaXNvbGF0ZUNhbGxlZCA9IGZhbHNlXG5cbmV4cG9ydCBsZXQgZ2xvYmFsU3RhdGU6IE1vYlhHbG9iYWxzID0gKGZ1bmN0aW9uICgpIHtcbiAgICBsZXQgZ2xvYmFsID0gZ2V0R2xvYmFsKClcbiAgICBpZiAoZ2xvYmFsLl9fbW9ieEluc3RhbmNlQ291bnQgPiAwICYmICFnbG9iYWwuX19tb2J4R2xvYmFscykge1xuICAgICAgICBjYW5NZXJnZUdsb2JhbFN0YXRlID0gZmFsc2VcbiAgICB9XG4gICAgaWYgKGdsb2JhbC5fX21vYnhHbG9iYWxzICYmIGdsb2JhbC5fX21vYnhHbG9iYWxzLnZlcnNpb24gIT09IG5ldyBNb2JYR2xvYmFscygpLnZlcnNpb24pIHtcbiAgICAgICAgY2FuTWVyZ2VHbG9iYWxTdGF0ZSA9IGZhbHNlXG4gICAgfVxuXG4gICAgaWYgKCFjYW5NZXJnZUdsb2JhbFN0YXRlKSB7XG4gICAgICAgIC8vIEJlY2F1c2UgdGhpcyBpcyBhIElJRkUgd2UgbmVlZCB0byBsZXQgaXNvbGF0ZUNhbGxlZCBhIGNoYW5jZSB0byBjaGFuZ2VcbiAgICAgICAgLy8gc28gd2UgcnVuIGl0IGFmdGVyIHRoZSBldmVudCBsb29wIGNvbXBsZXRlZCBhdCBsZWFzdCAxIGl0ZXJhdGlvblxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGlmICghaXNvbGF0ZUNhbGxlZCkge1xuICAgICAgICAgICAgICAgIGRpZSgzNSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgMSlcbiAgICAgICAgcmV0dXJuIG5ldyBNb2JYR2xvYmFscygpXG4gICAgfSBlbHNlIGlmIChnbG9iYWwuX19tb2J4R2xvYmFscykge1xuICAgICAgICBnbG9iYWwuX19tb2J4SW5zdGFuY2VDb3VudCArPSAxXG4gICAgICAgIGlmICghZ2xvYmFsLl9fbW9ieEdsb2JhbHMuVU5DSEFOR0VEKSB7XG4gICAgICAgICAgICBnbG9iYWwuX19tb2J4R2xvYmFscy5VTkNIQU5HRUQgPSB7fVxuICAgICAgICB9IC8vIG1ha2UgbWVyZ2UgYmFja3dhcmQgY29tcGF0aWJsZVxuICAgICAgICByZXR1cm4gZ2xvYmFsLl9fbW9ieEdsb2JhbHNcbiAgICB9IGVsc2Uge1xuICAgICAgICBnbG9iYWwuX19tb2J4SW5zdGFuY2VDb3VudCA9IDFcbiAgICAgICAgcmV0dXJuIChnbG9iYWwuX19tb2J4R2xvYmFscyA9IG5ldyBNb2JYR2xvYmFscygpKVxuICAgIH1cbn0pKClcblxuZXhwb3J0IGZ1bmN0aW9uIGlzb2xhdGVHbG9iYWxTdGF0ZSgpIHtcbiAgICBpZiAoXG4gICAgICAgIGdsb2JhbFN0YXRlLnBlbmRpbmdSZWFjdGlvbnMubGVuZ3RoIHx8XG4gICAgICAgIGdsb2JhbFN0YXRlLmluQmF0Y2ggfHxcbiAgICAgICAgZ2xvYmFsU3RhdGUuaXNSdW5uaW5nUmVhY3Rpb25zXG4gICAgKSB7XG4gICAgICAgIGRpZSgzNilcbiAgICB9XG4gICAgaXNvbGF0ZUNhbGxlZCA9IHRydWVcbiAgICBpZiAoY2FuTWVyZ2VHbG9iYWxTdGF0ZSkge1xuICAgICAgICBsZXQgZ2xvYmFsID0gZ2V0R2xvYmFsKClcbiAgICAgICAgaWYgKC0tZ2xvYmFsLl9fbW9ieEluc3RhbmNlQ291bnQgPT09IDApIHtcbiAgICAgICAgICAgIGdsb2JhbC5fX21vYnhHbG9iYWxzID0gdW5kZWZpbmVkXG4gICAgICAgIH1cbiAgICAgICAgZ2xvYmFsU3RhdGUgPSBuZXcgTW9iWEdsb2JhbHMoKVxuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEdsb2JhbFN0YXRlKCk6IGFueSB7XG4gICAgcmV0dXJuIGdsb2JhbFN0YXRlXG59XG5cbi8qKlxuICogRm9yIHRlc3RpbmcgcHVycG9zZXMgb25seTsgdGhpcyB3aWxsIGJyZWFrIHRoZSBpbnRlcm5hbCBzdGF0ZSBvZiBleGlzdGluZyBvYnNlcnZhYmxlcyxcbiAqIGJ1dCBjYW4gYmUgdXNlZCB0byBnZXQgYmFjayBhdCBhIHN0YWJsZSBzdGF0ZSBhZnRlciB0aHJvd2luZyBlcnJvcnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0R2xvYmFsU3RhdGUoKSB7XG4gICAgY29uc3QgZGVmYXVsdEdsb2JhbHMgPSBuZXcgTW9iWEdsb2JhbHMoKVxuICAgIGZvciAobGV0IGtleSBpbiBkZWZhdWx0R2xvYmFscykge1xuICAgICAgICBpZiAocGVyc2lzdGVudEtleXMuaW5kZXhPZihrZXkgYXMgYW55KSA9PT0gLTEpIHtcbiAgICAgICAgICAgIGdsb2JhbFN0YXRlW2tleV0gPSBkZWZhdWx0R2xvYmFsc1trZXldXG4gICAgICAgIH1cbiAgICB9XG4gICAgZ2xvYmFsU3RhdGUuYWxsb3dTdGF0ZUNoYW5nZXMgPSAhZ2xvYmFsU3RhdGUuZW5mb3JjZUFjdGlvbnNcbn1cbiIsImltcG9ydCB7XG4gICAgTGFtYmRhLFxuICAgIENvbXB1dGVkVmFsdWUsXG4gICAgSURlcGVuZGVuY3lUcmVlLFxuICAgIElEZXJpdmF0aW9uLFxuICAgIElEZXJpdmF0aW9uU3RhdGVfLFxuICAgIFRyYWNlTW9kZSxcbiAgICBnZXREZXBlbmRlbmN5VHJlZSxcbiAgICBnbG9iYWxTdGF0ZSxcbiAgICBydW5SZWFjdGlvbnMsXG4gICAgY2hlY2tJZlN0YXRlUmVhZHNBcmVBbGxvd2VkXG59IGZyb20gXCIuLi9pbnRlcm5hbFwiXG5cbmV4cG9ydCBpbnRlcmZhY2UgSURlcFRyZWVOb2RlIHtcbiAgICBuYW1lXzogc3RyaW5nXG4gICAgb2JzZXJ2aW5nXz86IElPYnNlcnZhYmxlW11cbn1cblxuZXhwb3J0IGludGVyZmFjZSBJT2JzZXJ2YWJsZSBleHRlbmRzIElEZXBUcmVlTm9kZSB7XG4gICAgZGlmZlZhbHVlXzogbnVtYmVyXG4gICAgLyoqXG4gICAgICogSWQgb2YgdGhlIGRlcml2YXRpb24gKnJ1biogdGhhdCBsYXN0IGFjY2Vzc2VkIHRoaXMgb2JzZXJ2YWJsZS5cbiAgICAgKiBJZiB0aGlzIGlkIGVxdWFscyB0aGUgKnJ1biogaWQgb2YgdGhlIGN1cnJlbnQgZGVyaXZhdGlvbixcbiAgICAgKiB0aGUgZGVwZW5kZW5jeSBpcyBhbHJlYWR5IGVzdGFibGlzaGVkXG4gICAgICovXG4gICAgbGFzdEFjY2Vzc2VkQnlfOiBudW1iZXJcbiAgICBpc0JlaW5nT2JzZXJ2ZWRfOiBib29sZWFuXG5cbiAgICBsb3dlc3RPYnNlcnZlclN0YXRlXzogSURlcml2YXRpb25TdGF0ZV8gLy8gVXNlZCB0byBhdm9pZCByZWR1bmRhbnQgcHJvcGFnYXRpb25zXG4gICAgaXNQZW5kaW5nVW5vYnNlcnZhdGlvbl86IGJvb2xlYW4gLy8gVXNlZCB0byBwdXNoIGl0c2VsZiB0byBnbG9iYWwucGVuZGluZ1Vub2JzZXJ2YXRpb25zIGF0IG1vc3Qgb25jZSBwZXIgYmF0Y2guXG5cbiAgICBvYnNlcnZlcnNfOiBTZXQ8SURlcml2YXRpb24+XG5cbiAgICBvbkJVTygpOiB2b2lkXG4gICAgb25CTygpOiB2b2lkXG5cbiAgICBvbkJVT0w6IFNldDxMYW1iZGE+IHwgdW5kZWZpbmVkXG4gICAgb25CT0w6IFNldDxMYW1iZGE+IHwgdW5kZWZpbmVkXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNPYnNlcnZlcnMob2JzZXJ2YWJsZTogSU9ic2VydmFibGUpOiBib29sZWFuIHtcbiAgICByZXR1cm4gb2JzZXJ2YWJsZS5vYnNlcnZlcnNfICYmIG9ic2VydmFibGUub2JzZXJ2ZXJzXy5zaXplID4gMFxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0T2JzZXJ2ZXJzKG9ic2VydmFibGU6IElPYnNlcnZhYmxlKTogU2V0PElEZXJpdmF0aW9uPiB7XG4gICAgcmV0dXJuIG9ic2VydmFibGUub2JzZXJ2ZXJzX1xufVxuXG4vLyBmdW5jdGlvbiBpbnZhcmlhbnRPYnNlcnZlcnMob2JzZXJ2YWJsZTogSU9ic2VydmFibGUpIHtcbi8vICAgICBjb25zdCBsaXN0ID0gb2JzZXJ2YWJsZS5vYnNlcnZlcnNcbi8vICAgICBjb25zdCBtYXAgPSBvYnNlcnZhYmxlLm9ic2VydmVyc0luZGV4ZXNcbi8vICAgICBjb25zdCBsID0gbGlzdC5sZW5ndGhcbi8vICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGw7IGkrKykge1xuLy8gICAgICAgICBjb25zdCBpZCA9IGxpc3RbaV0uX19tYXBpZFxuLy8gICAgICAgICBpZiAoaSkge1xuLy8gICAgICAgICAgICAgaW52YXJpYW50KG1hcFtpZF0gPT09IGksIFwiSU5URVJOQUwgRVJST1IgbWFwcyBkZXJpdmF0aW9uLl9fbWFwaWQgdG8gaW5kZXggaW4gbGlzdFwiKSAvLyBmb3IgcGVyZm9ybWFuY2Vcbi8vICAgICAgICAgfSBlbHNlIHtcbi8vICAgICAgICAgICAgIGludmFyaWFudCghKGlkIGluIG1hcCksIFwiSU5URVJOQUwgRVJST1Igb2JzZXJ2ZXIgb24gaW5kZXggMCBzaG91bGRuJ3QgYmUgaGVsZCBpbiBtYXAuXCIpIC8vIGZvciBwZXJmb3JtYW5jZVxuLy8gICAgICAgICB9XG4vLyAgICAgfVxuLy8gICAgIGludmFyaWFudChcbi8vICAgICAgICAgbGlzdC5sZW5ndGggPT09IDAgfHwgT2JqZWN0LmtleXMobWFwKS5sZW5ndGggPT09IGxpc3QubGVuZ3RoIC0gMSxcbi8vICAgICAgICAgXCJJTlRFUk5BTCBFUlJPUiB0aGVyZSBpcyBubyBqdW5rIGluIG1hcFwiXG4vLyAgICAgKVxuLy8gfVxuZXhwb3J0IGZ1bmN0aW9uIGFkZE9ic2VydmVyKG9ic2VydmFibGU6IElPYnNlcnZhYmxlLCBub2RlOiBJRGVyaXZhdGlvbikge1xuICAgIC8vIGludmFyaWFudChub2RlLmRlcGVuZGVuY2llc1N0YXRlICE9PSAtMSwgXCJJTlRFUk5BTCBFUlJPUiwgY2FuIGFkZCBvbmx5IGRlcGVuZGVuY2llc1N0YXRlICE9PSAtMVwiKTtcbiAgICAvLyBpbnZhcmlhbnQob2JzZXJ2YWJsZS5fb2JzZXJ2ZXJzLmluZGV4T2Yobm9kZSkgPT09IC0xLCBcIklOVEVSTkFMIEVSUk9SIGFkZCBhbHJlYWR5IGFkZGVkIG5vZGVcIik7XG4gICAgLy8gaW52YXJpYW50T2JzZXJ2ZXJzKG9ic2VydmFibGUpO1xuXG4gICAgb2JzZXJ2YWJsZS5vYnNlcnZlcnNfLmFkZChub2RlKVxuICAgIGlmIChvYnNlcnZhYmxlLmxvd2VzdE9ic2VydmVyU3RhdGVfID4gbm9kZS5kZXBlbmRlbmNpZXNTdGF0ZV8pIHtcbiAgICAgICAgb2JzZXJ2YWJsZS5sb3dlc3RPYnNlcnZlclN0YXRlXyA9IG5vZGUuZGVwZW5kZW5jaWVzU3RhdGVfXG4gICAgfVxuXG4gICAgLy8gaW52YXJpYW50T2JzZXJ2ZXJzKG9ic2VydmFibGUpO1xuICAgIC8vIGludmFyaWFudChvYnNlcnZhYmxlLl9vYnNlcnZlcnMuaW5kZXhPZihub2RlKSAhPT0gLTEsIFwiSU5URVJOQUwgRVJST1IgZGlkbid0IGFkZCBub2RlXCIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlT2JzZXJ2ZXIob2JzZXJ2YWJsZTogSU9ic2VydmFibGUsIG5vZGU6IElEZXJpdmF0aW9uKSB7XG4gICAgLy8gaW52YXJpYW50KGdsb2JhbFN0YXRlLmluQmF0Y2ggPiAwLCBcIklOVEVSTkFMIEVSUk9SLCByZW1vdmUgc2hvdWxkIGJlIGNhbGxlZCBvbmx5IGluc2lkZSBiYXRjaFwiKTtcbiAgICAvLyBpbnZhcmlhbnQob2JzZXJ2YWJsZS5fb2JzZXJ2ZXJzLmluZGV4T2Yobm9kZSkgIT09IC0xLCBcIklOVEVSTkFMIEVSUk9SIHJlbW92ZSBhbHJlYWR5IHJlbW92ZWQgbm9kZVwiKTtcbiAgICAvLyBpbnZhcmlhbnRPYnNlcnZlcnMob2JzZXJ2YWJsZSk7XG4gICAgb2JzZXJ2YWJsZS5vYnNlcnZlcnNfLmRlbGV0ZShub2RlKVxuICAgIGlmIChvYnNlcnZhYmxlLm9ic2VydmVyc18uc2l6ZSA9PT0gMCkge1xuICAgICAgICAvLyBkZWxldGluZyBsYXN0IG9ic2VydmVyXG4gICAgICAgIHF1ZXVlRm9yVW5vYnNlcnZhdGlvbihvYnNlcnZhYmxlKVxuICAgIH1cbiAgICAvLyBpbnZhcmlhbnRPYnNlcnZlcnMob2JzZXJ2YWJsZSk7XG4gICAgLy8gaW52YXJpYW50KG9ic2VydmFibGUuX29ic2VydmVycy5pbmRleE9mKG5vZGUpID09PSAtMSwgXCJJTlRFUk5BTCBFUlJPUiByZW1vdmUgYWxyZWFkeSByZW1vdmVkIG5vZGUyXCIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcXVldWVGb3JVbm9ic2VydmF0aW9uKG9ic2VydmFibGU6IElPYnNlcnZhYmxlKSB7XG4gICAgaWYgKG9ic2VydmFibGUuaXNQZW5kaW5nVW5vYnNlcnZhdGlvbl8gPT09IGZhbHNlKSB7XG4gICAgICAgIC8vIGludmFyaWFudChvYnNlcnZhYmxlLl9vYnNlcnZlcnMubGVuZ3RoID09PSAwLCBcIklOVEVSTkFMIEVSUk9SLCBzaG91bGQgb25seSBxdWV1ZSBmb3IgdW5vYnNlcnZhdGlvbiB1bm9ic2VydmVkIG9ic2VydmFibGVzXCIpO1xuICAgICAgICBvYnNlcnZhYmxlLmlzUGVuZGluZ1Vub2JzZXJ2YXRpb25fID0gdHJ1ZVxuICAgICAgICBnbG9iYWxTdGF0ZS5wZW5kaW5nVW5vYnNlcnZhdGlvbnMucHVzaChvYnNlcnZhYmxlKVxuICAgIH1cbn1cblxuLyoqXG4gKiBCYXRjaCBzdGFydHMgYSB0cmFuc2FjdGlvbiwgYXQgbGVhc3QgZm9yIHB1cnBvc2VzIG9mIG1lbW9pemluZyBDb21wdXRlZFZhbHVlcyB3aGVuIG5vdGhpbmcgZWxzZSBkb2VzLlxuICogRHVyaW5nIGEgYmF0Y2ggYG9uQmVjb21lVW5vYnNlcnZlZGAgd2lsbCBiZSBjYWxsZWQgYXQgbW9zdCBvbmNlIHBlciBvYnNlcnZhYmxlLlxuICogQXZvaWRzIHVubmVjZXNzYXJ5IHJlY2FsY3VsYXRpb25zLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RhcnRCYXRjaCgpIHtcbiAgICBnbG9iYWxTdGF0ZS5pbkJhdGNoKytcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVuZEJhdGNoKCkge1xuICAgIGlmICgtLWdsb2JhbFN0YXRlLmluQmF0Y2ggPT09IDApIHtcbiAgICAgICAgcnVuUmVhY3Rpb25zKClcbiAgICAgICAgLy8gdGhlIGJhdGNoIGlzIGFjdHVhbGx5IGFib3V0IHRvIGZpbmlzaCwgYWxsIHVub2JzZXJ2aW5nIHNob3VsZCBoYXBwZW4gaGVyZS5cbiAgICAgICAgY29uc3QgbGlzdCA9IGdsb2JhbFN0YXRlLnBlbmRpbmdVbm9ic2VydmF0aW9uc1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IG9ic2VydmFibGUgPSBsaXN0W2ldXG4gICAgICAgICAgICBvYnNlcnZhYmxlLmlzUGVuZGluZ1Vub2JzZXJ2YXRpb25fID0gZmFsc2VcbiAgICAgICAgICAgIGlmIChvYnNlcnZhYmxlLm9ic2VydmVyc18uc2l6ZSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGlmIChvYnNlcnZhYmxlLmlzQmVpbmdPYnNlcnZlZF8pIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgdGhpcyBvYnNlcnZhYmxlIGhhZCByZWFjdGl2ZSBvYnNlcnZlcnMsIHRyaWdnZXIgdGhlIGhvb2tzXG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmFibGUuaXNCZWluZ09ic2VydmVkXyA9IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmFibGUub25CVU8oKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAob2JzZXJ2YWJsZSBpbnN0YW5jZW9mIENvbXB1dGVkVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gY29tcHV0ZWQgdmFsdWVzIGFyZSBhdXRvbWF0aWNhbGx5IHRlYXJlZCBkb3duIHdoZW4gdGhlIGxhc3Qgb2JzZXJ2ZXIgbGVhdmVzXG4gICAgICAgICAgICAgICAgICAgIC8vIHRoaXMgcHJvY2VzcyBoYXBwZW5zIHJlY3Vyc2l2ZWx5LCB0aGlzIGNvbXB1dGVkIG1pZ2h0IGJlIHRoZSBsYXN0IG9ic2VydmFiZSBvZiBhbm90aGVyLCBldGMuLlxuICAgICAgICAgICAgICAgICAgICBvYnNlcnZhYmxlLnN1c3BlbmRfKClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZ2xvYmFsU3RhdGUucGVuZGluZ1Vub2JzZXJ2YXRpb25zID0gW11cbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXBvcnRPYnNlcnZlZChvYnNlcnZhYmxlOiBJT2JzZXJ2YWJsZSk6IGJvb2xlYW4ge1xuICAgIGNoZWNrSWZTdGF0ZVJlYWRzQXJlQWxsb3dlZChvYnNlcnZhYmxlKVxuXG4gICAgY29uc3QgZGVyaXZhdGlvbiA9IGdsb2JhbFN0YXRlLnRyYWNraW5nRGVyaXZhdGlvblxuICAgIGlmIChkZXJpdmF0aW9uICE9PSBudWxsKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTaW1wbGUgb3B0aW1pemF0aW9uLCBnaXZlIGVhY2ggZGVyaXZhdGlvbiBydW4gYW4gdW5pcXVlIGlkIChydW5JZClcbiAgICAgICAgICogQ2hlY2sgaWYgbGFzdCB0aW1lIHRoaXMgb2JzZXJ2YWJsZSB3YXMgYWNjZXNzZWQgdGhlIHNhbWUgcnVuSWQgaXMgdXNlZFxuICAgICAgICAgKiBpZiB0aGlzIGlzIHRoZSBjYXNlLCB0aGUgcmVsYXRpb24gaXMgYWxyZWFkeSBrbm93blxuICAgICAgICAgKi9cbiAgICAgICAgaWYgKGRlcml2YXRpb24ucnVuSWRfICE9PSBvYnNlcnZhYmxlLmxhc3RBY2Nlc3NlZEJ5Xykge1xuICAgICAgICAgICAgb2JzZXJ2YWJsZS5sYXN0QWNjZXNzZWRCeV8gPSBkZXJpdmF0aW9uLnJ1bklkX1xuICAgICAgICAgICAgLy8gVHJpZWQgc3RvcmluZyBuZXdPYnNlcnZpbmcsIG9yIG9ic2VydmluZywgb3IgYm90aCBhcyBTZXQsIGJ1dCBwZXJmb3JtYW5jZSBkaWRuJ3QgY29tZSBjbG9zZS4uLlxuICAgICAgICAgICAgZGVyaXZhdGlvbi5uZXdPYnNlcnZpbmdfIVtkZXJpdmF0aW9uLnVuYm91bmREZXBzQ291bnRfKytdID0gb2JzZXJ2YWJsZVxuICAgICAgICAgICAgaWYgKCFvYnNlcnZhYmxlLmlzQmVpbmdPYnNlcnZlZF8gJiYgZ2xvYmFsU3RhdGUudHJhY2tpbmdDb250ZXh0KSB7XG4gICAgICAgICAgICAgICAgb2JzZXJ2YWJsZS5pc0JlaW5nT2JzZXJ2ZWRfID0gdHJ1ZVxuICAgICAgICAgICAgICAgIG9ic2VydmFibGUub25CTygpXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG9ic2VydmFibGUuaXNCZWluZ09ic2VydmVkX1xuICAgIH0gZWxzZSBpZiAob2JzZXJ2YWJsZS5vYnNlcnZlcnNfLnNpemUgPT09IDAgJiYgZ2xvYmFsU3RhdGUuaW5CYXRjaCA+IDApIHtcbiAgICAgICAgcXVldWVGb3JVbm9ic2VydmF0aW9uKG9ic2VydmFibGUpXG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlXG59XG5cbi8vIGZ1bmN0aW9uIGludmFyaWFudExPUyhvYnNlcnZhYmxlOiBJT2JzZXJ2YWJsZSwgbXNnOiBzdHJpbmcpIHtcbi8vICAgICAvLyBpdCdzIGV4cGVuc2l2ZSBzbyBiZXR0ZXIgbm90IHJ1biBpdCBpbiBwcm9kdWNpdG9uLiBidXQgdGVtcG9yYXJpbHkgaGVscGZ1bCBmb3IgdGVzdGluZ1xuLy8gICAgIGNvbnN0IG1pbiA9IGdldE9ic2VydmVycyhvYnNlcnZhYmxlKS5yZWR1Y2UoKGEsIGIpID0+IE1hdGgubWluKGEsIGIuZGVwZW5kZW5jaWVzU3RhdGUpLCAyKVxuLy8gICAgIGlmIChtaW4gPj0gb2JzZXJ2YWJsZS5sb3dlc3RPYnNlcnZlclN0YXRlKSByZXR1cm4gLy8gPC0gdGhlIG9ubHkgYXNzdW1wdGlvbiBhYm91dCBgbG93ZXN0T2JzZXJ2ZXJTdGF0ZWBcbi8vICAgICB0aHJvdyBuZXcgRXJyb3IoXG4vLyAgICAgICAgIFwibG93ZXN0T2JzZXJ2ZXJTdGF0ZSBpcyB3cm9uZyBmb3IgXCIgK1xuLy8gICAgICAgICAgICAgbXNnICtcbi8vICAgICAgICAgICAgIFwiIGJlY2F1c2UgXCIgK1xuLy8gICAgICAgICAgICAgbWluICtcbi8vICAgICAgICAgICAgIFwiIDwgXCIgK1xuLy8gICAgICAgICAgICAgb2JzZXJ2YWJsZS5sb3dlc3RPYnNlcnZlclN0YXRlXG4vLyAgICAgKVxuLy8gfVxuXG4vKipcbiAqIE5PVEU6IGN1cnJlbnQgcHJvcGFnYXRpb24gbWVjaGFuaXNtIHdpbGwgaW4gY2FzZSBvZiBzZWxmIHJlcnVuaW5nIGF1dG9ydW5zIGJlaGF2ZSB1bmV4cGVjdGVkbHlcbiAqIEl0IHdpbGwgcHJvcGFnYXRlIGNoYW5nZXMgdG8gb2JzZXJ2ZXJzIGZyb20gcHJldmlvdXMgcnVuXG4gKiBJdCdzIGhhcmQgb3IgbWF5YmUgaW1wb3NzaWJsZSAod2l0aCByZWFzb25hYmxlIHBlcmYpIHRvIGdldCBpdCByaWdodCB3aXRoIGN1cnJlbnQgYXBwcm9hY2hcbiAqIEhvcGVmdWxseSBzZWxmIHJlcnVuaW5nIGF1dG9ydW5zIGFyZW4ndCBhIGZlYXR1cmUgcGVvcGxlIHNob3VsZCBkZXBlbmQgb25cbiAqIEFsc28gbW9zdCBiYXNpYyB1c2UgY2FzZXMgc2hvdWxkIGJlIG9rXG4gKi9cblxuLy8gQ2FsbGVkIGJ5IEF0b20gd2hlbiBpdHMgdmFsdWUgY2hhbmdlc1xuZXhwb3J0IGZ1bmN0aW9uIHByb3BhZ2F0ZUNoYW5nZWQob2JzZXJ2YWJsZTogSU9ic2VydmFibGUpIHtcbiAgICAvLyBpbnZhcmlhbnRMT1Mob2JzZXJ2YWJsZSwgXCJjaGFuZ2VkIHN0YXJ0XCIpO1xuICAgIGlmIChvYnNlcnZhYmxlLmxvd2VzdE9ic2VydmVyU3RhdGVfID09PSBJRGVyaXZhdGlvblN0YXRlXy5TVEFMRV8pIHtcbiAgICAgICAgcmV0dXJuXG4gICAgfVxuICAgIG9ic2VydmFibGUubG93ZXN0T2JzZXJ2ZXJTdGF0ZV8gPSBJRGVyaXZhdGlvblN0YXRlXy5TVEFMRV9cblxuICAgIC8vIElkZWFsbHkgd2UgdXNlIGZvci4ub2YgaGVyZSwgYnV0IHRoZSBkb3duY29tcGlsZWQgdmVyc2lvbiBpcyByZWFsbHkgc2xvdy4uLlxuICAgIG9ic2VydmFibGUub2JzZXJ2ZXJzXy5mb3JFYWNoKGQgPT4ge1xuICAgICAgICBpZiAoZC5kZXBlbmRlbmNpZXNTdGF0ZV8gPT09IElEZXJpdmF0aW9uU3RhdGVfLlVQX1RPX0RBVEVfKSB7XG4gICAgICAgICAgICBpZiAoX19ERVZfXyAmJiBkLmlzVHJhY2luZ18gIT09IFRyYWNlTW9kZS5OT05FKSB7XG4gICAgICAgICAgICAgICAgbG9nVHJhY2VJbmZvKGQsIG9ic2VydmFibGUpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkLm9uQmVjb21lU3RhbGVfKClcbiAgICAgICAgfVxuICAgICAgICBkLmRlcGVuZGVuY2llc1N0YXRlXyA9IElEZXJpdmF0aW9uU3RhdGVfLlNUQUxFX1xuICAgIH0pXG4gICAgLy8gaW52YXJpYW50TE9TKG9ic2VydmFibGUsIFwiY2hhbmdlZCBlbmRcIik7XG59XG5cbi8vIENhbGxlZCBieSBDb21wdXRlZFZhbHVlIHdoZW4gaXQgcmVjYWxjdWxhdGUgYW5kIGl0cyB2YWx1ZSBjaGFuZ2VkXG5leHBvcnQgZnVuY3Rpb24gcHJvcGFnYXRlQ2hhbmdlQ29uZmlybWVkKG9ic2VydmFibGU6IElPYnNlcnZhYmxlKSB7XG4gICAgLy8gaW52YXJpYW50TE9TKG9ic2VydmFibGUsIFwiY29uZmlybWVkIHN0YXJ0XCIpO1xuICAgIGlmIChvYnNlcnZhYmxlLmxvd2VzdE9ic2VydmVyU3RhdGVfID09PSBJRGVyaXZhdGlvblN0YXRlXy5TVEFMRV8pIHtcbiAgICAgICAgcmV0dXJuXG4gICAgfVxuICAgIG9ic2VydmFibGUubG93ZXN0T2JzZXJ2ZXJTdGF0ZV8gPSBJRGVyaXZhdGlvblN0YXRlXy5TVEFMRV9cblxuICAgIG9ic2VydmFibGUub2JzZXJ2ZXJzXy5mb3JFYWNoKGQgPT4ge1xuICAgICAgICBpZiAoZC5kZXBlbmRlbmNpZXNTdGF0ZV8gPT09IElEZXJpdmF0aW9uU3RhdGVfLlBPU1NJQkxZX1NUQUxFXykge1xuICAgICAgICAgICAgZC5kZXBlbmRlbmNpZXNTdGF0ZV8gPSBJRGVyaXZhdGlvblN0YXRlXy5TVEFMRV9cbiAgICAgICAgICAgIGlmIChfX0RFVl9fICYmIGQuaXNUcmFjaW5nXyAhPT0gVHJhY2VNb2RlLk5PTkUpIHtcbiAgICAgICAgICAgICAgICBsb2dUcmFjZUluZm8oZCwgb2JzZXJ2YWJsZSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgIGQuZGVwZW5kZW5jaWVzU3RhdGVfID09PSBJRGVyaXZhdGlvblN0YXRlXy5VUF9UT19EQVRFXyAvLyB0aGlzIGhhcHBlbnMgZHVyaW5nIGNvbXB1dGluZyBvZiBgZGAsIGp1c3Qga2VlcCBsb3dlc3RPYnNlcnZlclN0YXRlIHVwIHRvIGRhdGUuXG4gICAgICAgICkge1xuICAgICAgICAgICAgb2JzZXJ2YWJsZS5sb3dlc3RPYnNlcnZlclN0YXRlXyA9IElEZXJpdmF0aW9uU3RhdGVfLlVQX1RPX0RBVEVfXG4gICAgICAgIH1cbiAgICB9KVxuICAgIC8vIGludmFyaWFudExPUyhvYnNlcnZhYmxlLCBcImNvbmZpcm1lZCBlbmRcIik7XG59XG5cbi8vIFVzZWQgYnkgY29tcHV0ZWQgd2hlbiBpdHMgZGVwZW5kZW5jeSBjaGFuZ2VkLCBidXQgd2UgZG9uJ3Qgd2FuJ3QgdG8gaW1tZWRpYXRlbHkgcmVjb21wdXRlLlxuZXhwb3J0IGZ1bmN0aW9uIHByb3BhZ2F0ZU1heWJlQ2hhbmdlZChvYnNlcnZhYmxlOiBJT2JzZXJ2YWJsZSkge1xuICAgIC8vIGludmFyaWFudExPUyhvYnNlcnZhYmxlLCBcIm1heWJlIHN0YXJ0XCIpO1xuICAgIGlmIChvYnNlcnZhYmxlLmxvd2VzdE9ic2VydmVyU3RhdGVfICE9PSBJRGVyaXZhdGlvblN0YXRlXy5VUF9UT19EQVRFXykge1xuICAgICAgICByZXR1cm5cbiAgICB9XG4gICAgb2JzZXJ2YWJsZS5sb3dlc3RPYnNlcnZlclN0YXRlXyA9IElEZXJpdmF0aW9uU3RhdGVfLlBPU1NJQkxZX1NUQUxFX1xuXG4gICAgb2JzZXJ2YWJsZS5vYnNlcnZlcnNfLmZvckVhY2goZCA9PiB7XG4gICAgICAgIGlmIChkLmRlcGVuZGVuY2llc1N0YXRlXyA9PT0gSURlcml2YXRpb25TdGF0ZV8uVVBfVE9fREFURV8pIHtcbiAgICAgICAgICAgIGQuZGVwZW5kZW5jaWVzU3RhdGVfID0gSURlcml2YXRpb25TdGF0ZV8uUE9TU0lCTFlfU1RBTEVfXG4gICAgICAgICAgICBkLm9uQmVjb21lU3RhbGVfKClcbiAgICAgICAgfVxuICAgIH0pXG4gICAgLy8gaW52YXJpYW50TE9TKG9ic2VydmFibGUsIFwibWF5YmUgZW5kXCIpO1xufVxuXG5mdW5jdGlvbiBsb2dUcmFjZUluZm8oZGVyaXZhdGlvbjogSURlcml2YXRpb24sIG9ic2VydmFibGU6IElPYnNlcnZhYmxlKSB7XG4gICAgY29uc29sZS5sb2coXG4gICAgICAgIGBbbW9ieC50cmFjZV0gJyR7ZGVyaXZhdGlvbi5uYW1lX30nIGlzIGludmFsaWRhdGVkIGR1ZSB0byBhIGNoYW5nZSBpbjogJyR7b2JzZXJ2YWJsZS5uYW1lX30nYFxuICAgIClcbiAgICBpZiAoZGVyaXZhdGlvbi5pc1RyYWNpbmdfID09PSBUcmFjZU1vZGUuQlJFQUspIHtcbiAgICAgICAgY29uc3QgbGluZXMgPSBbXVxuICAgICAgICBwcmludERlcFRyZWUoZ2V0RGVwZW5kZW5jeVRyZWUoZGVyaXZhdGlvbiksIGxpbmVzLCAxKVxuXG4gICAgICAgIC8vIHByZXR0aWVyLWlnbm9yZVxuICAgICAgICBuZXcgRnVuY3Rpb24oXG5gZGVidWdnZXI7XG4vKlxuVHJhY2luZyAnJHtkZXJpdmF0aW9uLm5hbWVffSdcblxuWW91IGFyZSBlbnRlcmluZyB0aGlzIGJyZWFrIHBvaW50IGJlY2F1c2UgZGVyaXZhdGlvbiAnJHtkZXJpdmF0aW9uLm5hbWVffScgaXMgYmVpbmcgdHJhY2VkIGFuZCAnJHtvYnNlcnZhYmxlLm5hbWVffScgaXMgbm93IGZvcmNpbmcgaXQgdG8gdXBkYXRlLlxuSnVzdCBmb2xsb3cgdGhlIHN0YWNrdHJhY2UgeW91IHNob3VsZCBub3cgc2VlIGluIHRoZSBkZXZ0b29scyB0byBzZWUgcHJlY2lzZWx5IHdoYXQgcGllY2Ugb2YgeW91ciBjb2RlIGlzIGNhdXNpbmcgdGhpcyB1cGRhdGVcblRoZSBzdGFja2ZyYW1lIHlvdSBhcmUgbG9va2luZyBmb3IgaXMgYXQgbGVhc3QgfjYtOCBzdGFjay1mcmFtZXMgdXAuXG5cbiR7ZGVyaXZhdGlvbiBpbnN0YW5jZW9mIENvbXB1dGVkVmFsdWUgPyBkZXJpdmF0aW9uLmRlcml2YXRpb24udG9TdHJpbmcoKS5yZXBsYWNlKC9bKl1cXC8vZywgXCIvXCIpIDogXCJcIn1cblxuVGhlIGRlcGVuZGVuY2llcyBmb3IgdGhpcyBkZXJpdmF0aW9uIGFyZTpcblxuJHtsaW5lcy5qb2luKFwiXFxuXCIpfVxuKi9cbiAgICBgKSgpXG4gICAgfVxufVxuXG5mdW5jdGlvbiBwcmludERlcFRyZWUodHJlZTogSURlcGVuZGVuY3lUcmVlLCBsaW5lczogc3RyaW5nW10sIGRlcHRoOiBudW1iZXIpIHtcbiAgICBpZiAobGluZXMubGVuZ3RoID49IDEwMDApIHtcbiAgICAgICAgbGluZXMucHVzaChcIihhbmQgbWFueSBtb3JlKVwiKVxuICAgICAgICByZXR1cm5cbiAgICB9XG4gICAgbGluZXMucHVzaChgJHtcIlxcdFwiLnJlcGVhdChkZXB0aCAtIDEpfSR7dHJlZS5uYW1lfWApXG4gICAgaWYgKHRyZWUuZGVwZW5kZW5jaWVzKSB7XG4gICAgICAgIHRyZWUuZGVwZW5kZW5jaWVzLmZvckVhY2goY2hpbGQgPT4gcHJpbnREZXBUcmVlKGNoaWxkLCBsaW5lcywgZGVwdGggKyAxKSlcbiAgICB9XG59XG4iLCJpbXBvcnQge1xuICAgICRtb2J4LFxuICAgIElEZXJpdmF0aW9uLFxuICAgIElEZXJpdmF0aW9uU3RhdGVfLFxuICAgIElPYnNlcnZhYmxlLFxuICAgIExhbWJkYSxcbiAgICBUcmFjZU1vZGUsXG4gICAgY2xlYXJPYnNlcnZpbmcsXG4gICAgY3JlYXRlSW5zdGFuY2VvZlByZWRpY2F0ZSxcbiAgICBlbmRCYXRjaCxcbiAgICBnZXROZXh0SWQsXG4gICAgZ2xvYmFsU3RhdGUsXG4gICAgaXNDYXVnaHRFeGNlcHRpb24sXG4gICAgaXNTcHlFbmFibGVkLFxuICAgIHNob3VsZENvbXB1dGUsXG4gICAgc3B5UmVwb3J0LFxuICAgIHNweVJlcG9ydEVuZCxcbiAgICBzcHlSZXBvcnRTdGFydCxcbiAgICBzdGFydEJhdGNoLFxuICAgIHRyYWNlLFxuICAgIHRyYWNrRGVyaXZlZEZ1bmN0aW9uXG59IGZyb20gXCIuLi9pbnRlcm5hbFwiXG5cbi8qKlxuICogUmVhY3Rpb25zIGFyZSBhIHNwZWNpYWwga2luZCBvZiBkZXJpdmF0aW9ucy4gU2V2ZXJhbCB0aGluZ3MgZGlzdGluZ3Vpc2hlcyB0aGVtIGZyb20gbm9ybWFsIHJlYWN0aXZlIGNvbXB1dGF0aW9uc1xuICpcbiAqIDEpIFRoZXkgd2lsbCBhbHdheXMgcnVuLCB3aGV0aGVyIHRoZXkgYXJlIHVzZWQgYnkgb3RoZXIgY29tcHV0YXRpb25zIG9yIG5vdC5cbiAqIFRoaXMgbWVhbnMgdGhhdCB0aGV5IGFyZSB2ZXJ5IHN1aXRhYmxlIGZvciB0cmlnZ2VyaW5nIHNpZGUgZWZmZWN0cyBsaWtlIGxvZ2dpbmcsIHVwZGF0aW5nIHRoZSBET00gYW5kIG1ha2luZyBuZXR3b3JrIHJlcXVlc3RzLlxuICogMikgVGhleSBhcmUgbm90IG9ic2VydmFibGUgdGhlbXNlbHZlc1xuICogMykgVGhleSB3aWxsIGFsd2F5cyBydW4gYWZ0ZXIgYW55ICdub3JtYWwnIGRlcml2YXRpb25zXG4gKiA0KSBUaGV5IGFyZSBhbGxvd2VkIHRvIGNoYW5nZSB0aGUgc3RhdGUgYW5kIHRoZXJlYnkgdHJpZ2dlcmluZyB0aGVtc2VsdmVzIGFnYWluLCBhcyBsb25nIGFzIHRoZXkgbWFrZSBzdXJlIHRoZSBzdGF0ZSBwcm9wYWdhdGVzIHRvIGEgc3RhYmxlIHN0YXRlIGluIGEgcmVhc29uYWJsZSBhbW91bnQgb2YgaXRlcmF0aW9ucy5cbiAqXG4gKiBUaGUgc3RhdGUgbWFjaGluZSBvZiBhIFJlYWN0aW9uIGlzIGFzIGZvbGxvd3M6XG4gKlxuICogMSkgYWZ0ZXIgY3JlYXRpbmcsIHRoZSByZWFjdGlvbiBzaG91bGQgYmUgc3RhcnRlZCBieSBjYWxsaW5nIGBydW5SZWFjdGlvbmAgb3IgYnkgc2NoZWR1bGluZyBpdCAoc2VlIGFsc28gYGF1dG9ydW5gKVxuICogMikgdGhlIGBvbkludmFsaWRhdGVgIGhhbmRsZXIgc2hvdWxkIHNvbWVob3cgcmVzdWx0IGluIGEgY2FsbCB0byBgdGhpcy50cmFjayhzb21lRnVuY3Rpb24pYFxuICogMykgYWxsIG9ic2VydmFibGVzIGFjY2Vzc2VkIGluIGBzb21lRnVuY3Rpb25gIHdpbGwgYmUgb2JzZXJ2ZWQgYnkgdGhpcyByZWFjdGlvbi5cbiAqIDQpIGFzIHNvb24gYXMgc29tZSBvZiB0aGUgZGVwZW5kZW5jaWVzIGhhcyBjaGFuZ2VkIHRoZSBSZWFjdGlvbiB3aWxsIGJlIHJlc2NoZWR1bGVkIGZvciBhbm90aGVyIHJ1biAoYWZ0ZXIgdGhlIGN1cnJlbnQgbXV0YXRpb24gb3IgdHJhbnNhY3Rpb24pLiBgaXNTY2hlZHVsZWRgIHdpbGwgeWllbGQgdHJ1ZSBvbmNlIGEgZGVwZW5kZW5jeSBpcyBzdGFsZSBhbmQgZHVyaW5nIHRoaXMgcGVyaW9kXG4gKiA1KSBgb25JbnZhbGlkYXRlYCB3aWxsIGJlIGNhbGxlZCwgYW5kIHdlIGFyZSBiYWNrIGF0IHN0ZXAgMS5cbiAqXG4gKi9cblxuZXhwb3J0IGludGVyZmFjZSBJUmVhY3Rpb25QdWJsaWMge1xuICAgIGRpc3Bvc2UoKTogdm9pZFxuICAgIHRyYWNlKGVudGVyQnJlYWtQb2ludD86IGJvb2xlYW4pOiB2b2lkXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVJlYWN0aW9uRGlzcG9zZXIge1xuICAgICgpOiB2b2lkXG4gICAgJG1vYng6IFJlYWN0aW9uXG59XG5cbmV4cG9ydCBjbGFzcyBSZWFjdGlvbiBpbXBsZW1lbnRzIElEZXJpdmF0aW9uLCBJUmVhY3Rpb25QdWJsaWMge1xuICAgIG9ic2VydmluZ186IElPYnNlcnZhYmxlW10gPSBbXSAvLyBub2RlcyB3ZSBhcmUgbG9va2luZyBhdC4gT3VyIHZhbHVlIGRlcGVuZHMgb24gdGhlc2Ugbm9kZXNcbiAgICBuZXdPYnNlcnZpbmdfOiBJT2JzZXJ2YWJsZVtdID0gW11cbiAgICBkZXBlbmRlbmNpZXNTdGF0ZV8gPSBJRGVyaXZhdGlvblN0YXRlXy5OT1RfVFJBQ0tJTkdfXG4gICAgZGlmZlZhbHVlXyA9IDBcbiAgICBydW5JZF8gPSAwXG4gICAgdW5ib3VuZERlcHNDb3VudF8gPSAwXG4gICAgaXNEaXNwb3NlZF8gPSBmYWxzZVxuICAgIGlzU2NoZWR1bGVkXyA9IGZhbHNlXG4gICAgaXNUcmFja1BlbmRpbmdfID0gZmFsc2VcbiAgICBpc1J1bm5pbmdfID0gZmFsc2VcbiAgICBpc1RyYWNpbmdfOiBUcmFjZU1vZGUgPSBUcmFjZU1vZGUuTk9ORVxuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHB1YmxpYyBuYW1lXzogc3RyaW5nID0gX19ERVZfXyA/IFwiUmVhY3Rpb25AXCIgKyBnZXROZXh0SWQoKSA6IFwiUmVhY3Rpb25cIixcbiAgICAgICAgcHJpdmF0ZSBvbkludmFsaWRhdGVfOiAoKSA9PiB2b2lkLFxuICAgICAgICBwcml2YXRlIGVycm9ySGFuZGxlcl8/OiAoZXJyb3I6IGFueSwgZGVyaXZhdGlvbjogSURlcml2YXRpb24pID0+IHZvaWQsXG4gICAgICAgIHB1YmxpYyByZXF1aXJlc09ic2VydmFibGVfP1xuICAgICkge31cblxuICAgIG9uQmVjb21lU3RhbGVfKCkge1xuICAgICAgICB0aGlzLnNjaGVkdWxlXygpXG4gICAgfVxuXG4gICAgc2NoZWR1bGVfKCkge1xuICAgICAgICBpZiAoIXRoaXMuaXNTY2hlZHVsZWRfKSB7XG4gICAgICAgICAgICB0aGlzLmlzU2NoZWR1bGVkXyA9IHRydWVcbiAgICAgICAgICAgIGdsb2JhbFN0YXRlLnBlbmRpbmdSZWFjdGlvbnMucHVzaCh0aGlzKVxuICAgICAgICAgICAgcnVuUmVhY3Rpb25zKClcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlzU2NoZWR1bGVkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pc1NjaGVkdWxlZF9cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBpbnRlcm5hbCwgdXNlIHNjaGVkdWxlKCkgaWYgeW91IGludGVuZCB0byBraWNrIG9mZiBhIHJlYWN0aW9uXG4gICAgICovXG4gICAgcnVuUmVhY3Rpb25fKCkge1xuICAgICAgICBpZiAoIXRoaXMuaXNEaXNwb3NlZF8pIHtcbiAgICAgICAgICAgIHN0YXJ0QmF0Y2goKVxuICAgICAgICAgICAgdGhpcy5pc1NjaGVkdWxlZF8gPSBmYWxzZVxuICAgICAgICAgICAgY29uc3QgcHJldiA9IGdsb2JhbFN0YXRlLnRyYWNraW5nQ29udGV4dFxuICAgICAgICAgICAgZ2xvYmFsU3RhdGUudHJhY2tpbmdDb250ZXh0ID0gdGhpc1xuICAgICAgICAgICAgaWYgKHNob3VsZENvbXB1dGUodGhpcykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmlzVHJhY2tQZW5kaW5nXyA9IHRydWVcblxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25JbnZhbGlkYXRlXygpXG4gICAgICAgICAgICAgICAgICAgIGlmIChfX0RFVl9fICYmIHRoaXMuaXNUcmFja1BlbmRpbmdfICYmIGlzU3B5RW5hYmxlZCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBvbkludmFsaWRhdGUgZGlkbid0IHRyaWdnZXIgdHJhY2sgcmlnaHQgYXdheS4uXG4gICAgICAgICAgICAgICAgICAgICAgICBzcHlSZXBvcnQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHRoaXMubmFtZV8sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJzY2hlZHVsZWQtcmVhY3Rpb25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXBvcnRFeGNlcHRpb25JbkRlcml2YXRpb25fKGUpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZ2xvYmFsU3RhdGUudHJhY2tpbmdDb250ZXh0ID0gcHJldlxuICAgICAgICAgICAgZW5kQmF0Y2goKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgdHJhY2soZm46ICgpID0+IHZvaWQpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNEaXNwb3NlZF8pIHtcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgLy8gY29uc29sZS53YXJuKFwiUmVhY3Rpb24gYWxyZWFkeSBkaXNwb3NlZFwiKSAvLyBOb3RlOiBOb3QgYSB3YXJuaW5nIC8gZXJyb3IgaW4gbW9ieCA0IGVpdGhlclxuICAgICAgICB9XG4gICAgICAgIHN0YXJ0QmF0Y2goKVxuICAgICAgICBjb25zdCBub3RpZnkgPSBpc1NweUVuYWJsZWQoKVxuICAgICAgICBsZXQgc3RhcnRUaW1lXG4gICAgICAgIGlmIChfX0RFVl9fICYmIG5vdGlmeSkge1xuICAgICAgICAgICAgc3RhcnRUaW1lID0gRGF0ZS5ub3coKVxuICAgICAgICAgICAgc3B5UmVwb3J0U3RhcnQoe1xuICAgICAgICAgICAgICAgIG5hbWU6IHRoaXMubmFtZV8sXG4gICAgICAgICAgICAgICAgdHlwZTogXCJyZWFjdGlvblwiXG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuaXNSdW5uaW5nXyA9IHRydWVcbiAgICAgICAgY29uc3QgcHJldlJlYWN0aW9uID0gZ2xvYmFsU3RhdGUudHJhY2tpbmdDb250ZXh0IC8vIHJlYWN0aW9ucyBjb3VsZCBjcmVhdGUgcmVhY3Rpb25zLi4uXG4gICAgICAgIGdsb2JhbFN0YXRlLnRyYWNraW5nQ29udGV4dCA9IHRoaXNcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gdHJhY2tEZXJpdmVkRnVuY3Rpb24odGhpcywgZm4sIHVuZGVmaW5lZClcbiAgICAgICAgZ2xvYmFsU3RhdGUudHJhY2tpbmdDb250ZXh0ID0gcHJldlJlYWN0aW9uXG4gICAgICAgIHRoaXMuaXNSdW5uaW5nXyA9IGZhbHNlXG4gICAgICAgIHRoaXMuaXNUcmFja1BlbmRpbmdfID0gZmFsc2VcbiAgICAgICAgaWYgKHRoaXMuaXNEaXNwb3NlZF8pIHtcbiAgICAgICAgICAgIC8vIGRpc3Bvc2VkIGR1cmluZyBsYXN0IHJ1bi4gQ2xlYW4gdXAgZXZlcnl0aGluZyB0aGF0IHdhcyBib3VuZCBhZnRlciB0aGUgZGlzcG9zZSBjYWxsLlxuICAgICAgICAgICAgY2xlYXJPYnNlcnZpbmcodGhpcylcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNDYXVnaHRFeGNlcHRpb24ocmVzdWx0KSkge1xuICAgICAgICAgICAgdGhpcy5yZXBvcnRFeGNlcHRpb25JbkRlcml2YXRpb25fKHJlc3VsdC5jYXVzZSlcbiAgICAgICAgfVxuICAgICAgICBpZiAoX19ERVZfXyAmJiBub3RpZnkpIHtcbiAgICAgICAgICAgIHNweVJlcG9ydEVuZCh7XG4gICAgICAgICAgICAgICAgdGltZTogRGF0ZS5ub3coKSAtIHN0YXJ0VGltZVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgICBlbmRCYXRjaCgpXG4gICAgfVxuXG4gICAgcmVwb3J0RXhjZXB0aW9uSW5EZXJpdmF0aW9uXyhlcnJvcjogYW55KSB7XG4gICAgICAgIGlmICh0aGlzLmVycm9ySGFuZGxlcl8pIHtcbiAgICAgICAgICAgIHRoaXMuZXJyb3JIYW5kbGVyXyhlcnJvciwgdGhpcylcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGdsb2JhbFN0YXRlLmRpc2FibGVFcnJvckJvdW5kYXJpZXMpIHtcbiAgICAgICAgICAgIHRocm93IGVycm9yXG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBtZXNzYWdlID0gX19ERVZfX1xuICAgICAgICAgICAgPyBgW21vYnhdIEVuY291bnRlcmVkIGFuIHVuY2F1Z2h0IGV4Y2VwdGlvbiB0aGF0IHdhcyB0aHJvd24gYnkgYSByZWFjdGlvbiBvciBvYnNlcnZlciBjb21wb25lbnQsIGluOiAnJHt0aGlzfSdgXG4gICAgICAgICAgICA6IGBbbW9ieF0gdW5jYXVnaHQgZXJyb3IgaW4gJyR7dGhpc30nYFxuICAgICAgICBpZiAoIWdsb2JhbFN0YXRlLnN1cHByZXNzUmVhY3Rpb25FcnJvcnMpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IobWVzc2FnZSwgZXJyb3IpXG4gICAgICAgICAgICAvKiogSWYgZGVidWdnaW5nIGJyb3VnaHQgeW91IGhlcmUsIHBsZWFzZSwgcmVhZCB0aGUgYWJvdmUgbWVzc2FnZSA6LSkuIFRueCEgKi9cbiAgICAgICAgfSBlbHNlIGlmIChfX0RFVl9fKSB7IGNvbnNvbGUud2FybihgW21vYnhdIChlcnJvciBpbiByZWFjdGlvbiAnJHt0aGlzLm5hbWVffScgc3VwcHJlc3NlZCwgZml4IGVycm9yIG9mIGNhdXNpbmcgYWN0aW9uIGJlbG93KWApIH0gLy8gcHJldHRpZXItaWdub3JlXG5cbiAgICAgICAgaWYgKF9fREVWX18gJiYgaXNTcHlFbmFibGVkKCkpIHtcbiAgICAgICAgICAgIHNweVJlcG9ydCh7XG4gICAgICAgICAgICAgICAgdHlwZTogXCJlcnJvclwiLFxuICAgICAgICAgICAgICAgIG5hbWU6IHRoaXMubmFtZV8sXG4gICAgICAgICAgICAgICAgbWVzc2FnZSxcbiAgICAgICAgICAgICAgICBlcnJvcjogXCJcIiArIGVycm9yXG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG5cbiAgICAgICAgZ2xvYmFsU3RhdGUuZ2xvYmFsUmVhY3Rpb25FcnJvckhhbmRsZXJzLmZvckVhY2goZiA9PiBmKGVycm9yLCB0aGlzKSlcbiAgICB9XG5cbiAgICBkaXNwb3NlKCkge1xuICAgICAgICBpZiAoIXRoaXMuaXNEaXNwb3NlZF8pIHtcbiAgICAgICAgICAgIHRoaXMuaXNEaXNwb3NlZF8gPSB0cnVlXG4gICAgICAgICAgICBpZiAoIXRoaXMuaXNSdW5uaW5nXykge1xuICAgICAgICAgICAgICAgIC8vIGlmIGRpc3Bvc2VkIHdoaWxlIHJ1bm5pbmcsIGNsZWFuIHVwIGxhdGVyLiBNYXliZSBub3Qgb3B0aW1hbCwgYnV0IHJhcmUgY2FzZVxuICAgICAgICAgICAgICAgIHN0YXJ0QmF0Y2goKVxuICAgICAgICAgICAgICAgIGNsZWFyT2JzZXJ2aW5nKHRoaXMpXG4gICAgICAgICAgICAgICAgZW5kQmF0Y2goKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0RGlzcG9zZXJfKCk6IElSZWFjdGlvbkRpc3Bvc2VyIHtcbiAgICAgICAgY29uc3QgciA9IHRoaXMuZGlzcG9zZS5iaW5kKHRoaXMpIGFzIElSZWFjdGlvbkRpc3Bvc2VyXG4gICAgICAgIHJbJG1vYnhdID0gdGhpc1xuICAgICAgICByZXR1cm4gclxuICAgIH1cblxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gYFJlYWN0aW9uWyR7dGhpcy5uYW1lX31dYFxuICAgIH1cblxuICAgIHRyYWNlKGVudGVyQnJlYWtQb2ludDogYm9vbGVhbiA9IGZhbHNlKSB7XG4gICAgICAgIHRyYWNlKHRoaXMsIGVudGVyQnJlYWtQb2ludClcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvblJlYWN0aW9uRXJyb3IoaGFuZGxlcjogKGVycm9yOiBhbnksIGRlcml2YXRpb246IElEZXJpdmF0aW9uKSA9PiB2b2lkKTogTGFtYmRhIHtcbiAgICBnbG9iYWxTdGF0ZS5nbG9iYWxSZWFjdGlvbkVycm9ySGFuZGxlcnMucHVzaChoYW5kbGVyKVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGlkeCA9IGdsb2JhbFN0YXRlLmdsb2JhbFJlYWN0aW9uRXJyb3JIYW5kbGVycy5pbmRleE9mKGhhbmRsZXIpXG4gICAgICAgIGlmIChpZHggPj0gMCkge1xuICAgICAgICAgICAgZ2xvYmFsU3RhdGUuZ2xvYmFsUmVhY3Rpb25FcnJvckhhbmRsZXJzLnNwbGljZShpZHgsIDEpXG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogTWFnaWMgbnVtYmVyIGFsZXJ0IVxuICogRGVmaW5lcyB3aXRoaW4gaG93IG1hbnkgdGltZXMgYSByZWFjdGlvbiBpcyBhbGxvd2VkIHRvIHJlLXRyaWdnZXIgaXRzZWxmXG4gKiB1bnRpbCBpdCBpcyBhc3N1bWVkIHRoYXQgdGhpcyBpcyBnb25uYSBiZSBhIG5ldmVyIGVuZGluZyBsb29wLi4uXG4gKi9cbmNvbnN0IE1BWF9SRUFDVElPTl9JVEVSQVRJT05TID0gMTAwXG5cbmxldCByZWFjdGlvblNjaGVkdWxlcjogKGZuOiAoKSA9PiB2b2lkKSA9PiB2b2lkID0gZiA9PiBmKClcblxuZXhwb3J0IGZ1bmN0aW9uIHJ1blJlYWN0aW9ucygpIHtcbiAgICAvLyBUcmFtcG9saW5pbmcsIGlmIHJ1blJlYWN0aW9ucyBhcmUgYWxyZWFkeSBydW5uaW5nLCBuZXcgcmVhY3Rpb25zIHdpbGwgYmUgcGlja2VkIHVwXG4gICAgaWYgKGdsb2JhbFN0YXRlLmluQmF0Y2ggPiAwIHx8IGdsb2JhbFN0YXRlLmlzUnVubmluZ1JlYWN0aW9ucykge1xuICAgICAgICByZXR1cm5cbiAgICB9XG4gICAgcmVhY3Rpb25TY2hlZHVsZXIocnVuUmVhY3Rpb25zSGVscGVyKVxufVxuXG5mdW5jdGlvbiBydW5SZWFjdGlvbnNIZWxwZXIoKSB7XG4gICAgZ2xvYmFsU3RhdGUuaXNSdW5uaW5nUmVhY3Rpb25zID0gdHJ1ZVxuICAgIGNvbnN0IGFsbFJlYWN0aW9ucyA9IGdsb2JhbFN0YXRlLnBlbmRpbmdSZWFjdGlvbnNcbiAgICBsZXQgaXRlcmF0aW9ucyA9IDBcblxuICAgIC8vIFdoaWxlIHJ1bm5pbmcgcmVhY3Rpb25zLCBuZXcgcmVhY3Rpb25zIG1pZ2h0IGJlIHRyaWdnZXJlZC5cbiAgICAvLyBIZW5jZSB3ZSB3b3JrIHdpdGggdHdvIHZhcmlhYmxlcyBhbmQgY2hlY2sgd2hldGhlclxuICAgIC8vIHdlIGNvbnZlcmdlIHRvIG5vIHJlbWFpbmluZyByZWFjdGlvbnMgYWZ0ZXIgYSB3aGlsZS5cbiAgICB3aGlsZSAoYWxsUmVhY3Rpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgaWYgKCsraXRlcmF0aW9ucyA9PT0gTUFYX1JFQUNUSU9OX0lURVJBVElPTlMpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICAgICAgICAgICAgX19ERVZfX1xuICAgICAgICAgICAgICAgICAgICA/IGBSZWFjdGlvbiBkb2Vzbid0IGNvbnZlcmdlIHRvIGEgc3RhYmxlIHN0YXRlIGFmdGVyICR7TUFYX1JFQUNUSU9OX0lURVJBVElPTlN9IGl0ZXJhdGlvbnMuYCArXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGAgUHJvYmFibHkgdGhlcmUgaXMgYSBjeWNsZSBpbiB0aGUgcmVhY3RpdmUgZnVuY3Rpb246ICR7YWxsUmVhY3Rpb25zWzBdfWBcbiAgICAgICAgICAgICAgICAgICAgOiBgW21vYnhdIGN5Y2xlIGluIHJlYWN0aW9uOiAke2FsbFJlYWN0aW9uc1swXX1gXG4gICAgICAgICAgICApXG4gICAgICAgICAgICBhbGxSZWFjdGlvbnMuc3BsaWNlKDApIC8vIGNsZWFyIHJlYWN0aW9uc1xuICAgICAgICB9XG4gICAgICAgIGxldCByZW1haW5pbmdSZWFjdGlvbnMgPSBhbGxSZWFjdGlvbnMuc3BsaWNlKDApXG4gICAgICAgIGZvciAobGV0IGkgPSAwLCBsID0gcmVtYWluaW5nUmVhY3Rpb25zLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgcmVtYWluaW5nUmVhY3Rpb25zW2ldLnJ1blJlYWN0aW9uXygpXG4gICAgICAgIH1cbiAgICB9XG4gICAgZ2xvYmFsU3RhdGUuaXNSdW5uaW5nUmVhY3Rpb25zID0gZmFsc2Vcbn1cblxuZXhwb3J0IGNvbnN0IGlzUmVhY3Rpb24gPSBjcmVhdGVJbnN0YW5jZW9mUHJlZGljYXRlKFwiUmVhY3Rpb25cIiwgUmVhY3Rpb24pXG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRSZWFjdGlvblNjaGVkdWxlcihmbjogKGY6ICgpID0+IHZvaWQpID0+IHZvaWQpIHtcbiAgICBjb25zdCBiYXNlU2NoZWR1bGVyID0gcmVhY3Rpb25TY2hlZHVsZXJcbiAgICByZWFjdGlvblNjaGVkdWxlciA9IGYgPT4gZm4oKCkgPT4gYmFzZVNjaGVkdWxlcihmKSlcbn1cbiIsImltcG9ydCB7IElDb21wdXRlZERpZENoYW5nZSB9IGZyb20gXCIuL2NvbXB1dGVkdmFsdWVcIlxuaW1wb3J0IHsgSVZhbHVlRGlkQ2hhbmdlLCBJQm94RGlkQ2hhbmdlIH0gZnJvbSBcIi4vLi4vdHlwZXMvb2JzZXJ2YWJsZXZhbHVlXCJcbmltcG9ydCB7IElPYmplY3REaWRDaGFuZ2UgfSBmcm9tIFwiLi8uLi90eXBlcy9vYnNlcnZhYmxlb2JqZWN0XCJcbmltcG9ydCB7IElBcnJheURpZENoYW5nZSB9IGZyb20gXCIuLy4uL3R5cGVzL29ic2VydmFibGVhcnJheVwiXG5pbXBvcnQgeyBMYW1iZGEsIGdsb2JhbFN0YXRlLCBvbmNlLCBJU2V0RGlkQ2hhbmdlLCBJTWFwRGlkQ2hhbmdlIH0gZnJvbSBcIi4uL2ludGVybmFsXCJcblxuZXhwb3J0IGZ1bmN0aW9uIGlzU3B5RW5hYmxlZCgpIHtcbiAgICByZXR1cm4gX19ERVZfXyAmJiAhIWdsb2JhbFN0YXRlLnNweUxpc3RlbmVycy5sZW5ndGhcbn1cblxuZXhwb3J0IHR5cGUgUHVyZVNweUV2ZW50ID1cbiAgICB8IHsgdHlwZTogXCJhY3Rpb25cIjsgbmFtZTogc3RyaW5nOyBvYmplY3Q6IHVua25vd247IGFyZ3VtZW50czogdW5rbm93bltdIH1cbiAgICB8IHsgdHlwZTogXCJzY2hlZHVsZWQtcmVhY3Rpb25cIjsgbmFtZTogc3RyaW5nIH1cbiAgICB8IHsgdHlwZTogXCJyZWFjdGlvblwiOyBuYW1lOiBzdHJpbmcgfVxuICAgIHwgeyB0eXBlOiBcImVycm9yXCI7IG5hbWU6IHN0cmluZzsgbWVzc2FnZTogc3RyaW5nOyBlcnJvcjogc3RyaW5nIH1cbiAgICB8IElDb21wdXRlZERpZENoYW5nZTx1bmtub3duPlxuICAgIHwgSU9iamVjdERpZENoYW5nZTx1bmtub3duPlxuICAgIHwgSUFycmF5RGlkQ2hhbmdlPHVua25vd24+XG4gICAgfCBJTWFwRGlkQ2hhbmdlPHVua25vd24sIHVua25vd24+XG4gICAgfCBJU2V0RGlkQ2hhbmdlPHVua25vd24+XG4gICAgfCBJVmFsdWVEaWRDaGFuZ2U8dW5rbm93bj5cbiAgICB8IElCb3hEaWRDaGFuZ2U8dW5rbm93bj5cbiAgICB8IHsgdHlwZTogXCJyZXBvcnQtZW5kXCI7IHNweVJlcG9ydEVuZDogdHJ1ZTsgdGltZT86IG51bWJlciB9XG5cbnR5cGUgU3B5RXZlbnQgPSBQdXJlU3B5RXZlbnQgJiB7IHNweVJlcG9ydFN0YXJ0PzogdHJ1ZSB9XG5cbmV4cG9ydCBmdW5jdGlvbiBzcHlSZXBvcnQoZXZlbnQ6IFNweUV2ZW50KSB7XG4gICAgaWYgKCFfX0RFVl9fKSB7XG4gICAgICAgIHJldHVyblxuICAgIH0gLy8gZGVhZCBjb2RlIGVsaW1pbmF0aW9uIGNhbiBkbyB0aGUgcmVzdFxuICAgIGlmICghZ2xvYmFsU3RhdGUuc3B5TGlzdGVuZXJzLmxlbmd0aCkge1xuICAgICAgICByZXR1cm5cbiAgICB9XG4gICAgY29uc3QgbGlzdGVuZXJzID0gZ2xvYmFsU3RhdGUuc3B5TGlzdGVuZXJzXG4gICAgZm9yIChsZXQgaSA9IDAsIGwgPSBsaXN0ZW5lcnMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIGxpc3RlbmVyc1tpXShldmVudClcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzcHlSZXBvcnRTdGFydChldmVudDogUHVyZVNweUV2ZW50KSB7XG4gICAgaWYgKCFfX0RFVl9fKSB7XG4gICAgICAgIHJldHVyblxuICAgIH1cbiAgICBjb25zdCBjaGFuZ2UgPSB7IC4uLmV2ZW50LCBzcHlSZXBvcnRTdGFydDogdHJ1ZSBhcyBjb25zdCB9XG4gICAgc3B5UmVwb3J0KGNoYW5nZSlcbn1cblxuY29uc3QgRU5EX0VWRU5UOiBTcHlFdmVudCA9IHsgdHlwZTogXCJyZXBvcnQtZW5kXCIsIHNweVJlcG9ydEVuZDogdHJ1ZSB9XG5cbmV4cG9ydCBmdW5jdGlvbiBzcHlSZXBvcnRFbmQoY2hhbmdlPzogeyB0aW1lPzogbnVtYmVyIH0pIHtcbiAgICBpZiAoIV9fREVWX18pIHtcbiAgICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGlmIChjaGFuZ2UpIHtcbiAgICAgICAgc3B5UmVwb3J0KHsgLi4uY2hhbmdlLCB0eXBlOiBcInJlcG9ydC1lbmRcIiwgc3B5UmVwb3J0RW5kOiB0cnVlIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgICAgc3B5UmVwb3J0KEVORF9FVkVOVClcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzcHkobGlzdGVuZXI6IChjaGFuZ2U6IFNweUV2ZW50KSA9PiB2b2lkKTogTGFtYmRhIHtcbiAgICBpZiAoIV9fREVWX18pIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBbbW9ieC5zcHldIElzIGEgbm8tb3AgaW4gcHJvZHVjdGlvbiBidWlsZHNgKVxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge31cbiAgICB9IGVsc2Uge1xuICAgICAgICBnbG9iYWxTdGF0ZS5zcHlMaXN0ZW5lcnMucHVzaChsaXN0ZW5lcilcbiAgICAgICAgcmV0dXJuIG9uY2UoKCkgPT4ge1xuICAgICAgICAgICAgZ2xvYmFsU3RhdGUuc3B5TGlzdGVuZXJzID0gZ2xvYmFsU3RhdGUuc3B5TGlzdGVuZXJzLmZpbHRlcihsID0+IGwgIT09IGxpc3RlbmVyKVxuICAgICAgICB9KVxuICAgIH1cbn1cbiIsImltcG9ydCB7XG4gICAgY3JlYXRlQWN0aW9uLFxuICAgIGV4ZWN1dGVBY3Rpb24sXG4gICAgQW5ub3RhdGlvbixcbiAgICBzdG9yZUFubm90YXRpb24sXG4gICAgZGllLFxuICAgIGlzRnVuY3Rpb24sXG4gICAgaXNTdHJpbmdpc2gsXG4gICAgY3JlYXRlRGVjb3JhdG9yQW5ub3RhdGlvbixcbiAgICBjcmVhdGVBY3Rpb25Bbm5vdGF0aW9uXG59IGZyb20gXCIuLi9pbnRlcm5hbFwiXG5cbmV4cG9ydCBjb25zdCBBQ1RJT04gPSBcImFjdGlvblwiXG5leHBvcnQgY29uc3QgQUNUSU9OX0JPVU5EID0gXCJhY3Rpb24uYm91bmRcIlxuZXhwb3J0IGNvbnN0IEFVVE9BQ1RJT04gPSBcImF1dG9BY3Rpb25cIlxuZXhwb3J0IGNvbnN0IEFVVE9BQ1RJT05fQk9VTkQgPSBcImF1dG9BY3Rpb24uYm91bmRcIlxuXG5jb25zdCBERUZBVUxUX0FDVElPTl9OQU1FID0gXCI8dW5uYW1lZCBhY3Rpb24+XCJcblxuY29uc3QgYWN0aW9uQW5ub3RhdGlvbiA9IGNyZWF0ZUFjdGlvbkFubm90YXRpb24oQUNUSU9OKVxuY29uc3QgYWN0aW9uQm91bmRBbm5vdGF0aW9uID0gY3JlYXRlQWN0aW9uQW5ub3RhdGlvbihBQ1RJT05fQk9VTkQsIHtcbiAgICBib3VuZDogdHJ1ZVxufSlcbmNvbnN0IGF1dG9BY3Rpb25Bbm5vdGF0aW9uID0gY3JlYXRlQWN0aW9uQW5ub3RhdGlvbihBVVRPQUNUSU9OLCB7XG4gICAgYXV0b0FjdGlvbjogdHJ1ZVxufSlcbmNvbnN0IGF1dG9BY3Rpb25Cb3VuZEFubm90YXRpb24gPSBjcmVhdGVBY3Rpb25Bbm5vdGF0aW9uKEFVVE9BQ1RJT05fQk9VTkQsIHtcbiAgICBhdXRvQWN0aW9uOiB0cnVlLFxuICAgIGJvdW5kOiB0cnVlXG59KVxuXG5leHBvcnQgaW50ZXJmYWNlIElBY3Rpb25GYWN0b3J5IGV4dGVuZHMgQW5ub3RhdGlvbiwgUHJvcGVydHlEZWNvcmF0b3Ige1xuICAgIC8vIG5hbWVsZXNzIGFjdGlvbnNcbiAgICA8VCBleHRlbmRzIEZ1bmN0aW9uIHwgdW5kZWZpbmVkIHwgbnVsbD4oZm46IFQpOiBUXG4gICAgLy8gbmFtZWQgYWN0aW9uc1xuICAgIDxUIGV4dGVuZHMgRnVuY3Rpb24gfCB1bmRlZmluZWQgfCBudWxsPihuYW1lOiBzdHJpbmcsIGZuOiBUKTogVFxuXG4gICAgLy8gbmFtZWQgZGVjb3JhdG9yXG4gICAgKGN1c3RvbU5hbWU6IHN0cmluZyk6IFByb3BlcnR5RGVjb3JhdG9yICYgQW5ub3RhdGlvblxuXG4gICAgLy8gZGVjb3JhdG9yIChuYW1lIG5vIGxvbmdlciBzdXBwb3J0ZWQpXG4gICAgYm91bmQ6IEFubm90YXRpb24gJiBQcm9wZXJ0eURlY29yYXRvclxufVxuXG5mdW5jdGlvbiBjcmVhdGVBY3Rpb25GYWN0b3J5KGF1dG9BY3Rpb246IGJvb2xlYW4pOiBJQWN0aW9uRmFjdG9yeSB7XG4gICAgY29uc3QgcmVzOiBJQWN0aW9uRmFjdG9yeSA9IGZ1bmN0aW9uIGFjdGlvbihhcmcxLCBhcmcyPyk6IGFueSB7XG4gICAgICAgIC8vIGFjdGlvbihmbigpIHt9KVxuICAgICAgICBpZiAoaXNGdW5jdGlvbihhcmcxKSkge1xuICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZUFjdGlvbihhcmcxLm5hbWUgfHwgREVGQVVMVF9BQ1RJT05fTkFNRSwgYXJnMSwgYXV0b0FjdGlvbilcbiAgICAgICAgfVxuICAgICAgICAvLyBhY3Rpb24oXCJuYW1lXCIsIGZuKCkge30pXG4gICAgICAgIGlmIChpc0Z1bmN0aW9uKGFyZzIpKSB7XG4gICAgICAgICAgICByZXR1cm4gY3JlYXRlQWN0aW9uKGFyZzEsIGFyZzIsIGF1dG9BY3Rpb24pXG4gICAgICAgIH1cbiAgICAgICAgLy8gQGFjdGlvblxuICAgICAgICBpZiAoaXNTdHJpbmdpc2goYXJnMikpIHtcbiAgICAgICAgICAgIHJldHVybiBzdG9yZUFubm90YXRpb24oYXJnMSwgYXJnMiwgYXV0b0FjdGlvbiA/IGF1dG9BY3Rpb25Bbm5vdGF0aW9uIDogYWN0aW9uQW5ub3RhdGlvbilcbiAgICAgICAgfVxuICAgICAgICAvLyBhY3Rpb24oXCJuYW1lXCIpICYgQGFjdGlvbihcIm5hbWVcIilcbiAgICAgICAgaWYgKGlzU3RyaW5naXNoKGFyZzEpKSB7XG4gICAgICAgICAgICByZXR1cm4gY3JlYXRlRGVjb3JhdG9yQW5ub3RhdGlvbihcbiAgICAgICAgICAgICAgICBjcmVhdGVBY3Rpb25Bbm5vdGF0aW9uKGF1dG9BY3Rpb24gPyBBVVRPQUNUSU9OIDogQUNUSU9OLCB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IGFyZzEsXG4gICAgICAgICAgICAgICAgICAgIGF1dG9BY3Rpb25cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgKVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF9fREVWX18pIHtcbiAgICAgICAgICAgIGRpZShcIkludmFsaWQgYXJndW1lbnRzIGZvciBgYWN0aW9uYFwiKVxuICAgICAgICB9XG4gICAgfSBhcyBJQWN0aW9uRmFjdG9yeVxuICAgIHJldHVybiByZXNcbn1cblxuZXhwb3J0IGNvbnN0IGFjdGlvbjogSUFjdGlvbkZhY3RvcnkgPSBjcmVhdGVBY3Rpb25GYWN0b3J5KGZhbHNlKVxuT2JqZWN0LmFzc2lnbihhY3Rpb24sIGFjdGlvbkFubm90YXRpb24pXG5leHBvcnQgY29uc3QgYXV0b0FjdGlvbjogSUFjdGlvbkZhY3RvcnkgPSBjcmVhdGVBY3Rpb25GYWN0b3J5KHRydWUpXG5PYmplY3QuYXNzaWduKGF1dG9BY3Rpb24sIGF1dG9BY3Rpb25Bbm5vdGF0aW9uKVxuXG5hY3Rpb24uYm91bmQgPSBjcmVhdGVEZWNvcmF0b3JBbm5vdGF0aW9uKGFjdGlvbkJvdW5kQW5ub3RhdGlvbilcbmF1dG9BY3Rpb24uYm91bmQgPSBjcmVhdGVEZWNvcmF0b3JBbm5vdGF0aW9uKGF1dG9BY3Rpb25Cb3VuZEFubm90YXRpb24pXG5cbmV4cG9ydCBmdW5jdGlvbiBydW5JbkFjdGlvbjxUPihmbjogKCkgPT4gVCk6IFQge1xuICAgIHJldHVybiBleGVjdXRlQWN0aW9uKGZuLm5hbWUgfHwgREVGQVVMVF9BQ1RJT05fTkFNRSwgZmFsc2UsIGZuLCB0aGlzLCB1bmRlZmluZWQpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0FjdGlvbih0aGluZzogYW55KSB7XG4gICAgcmV0dXJuIGlzRnVuY3Rpb24odGhpbmcpICYmIHRoaW5nLmlzTW9ieEFjdGlvbiA9PT0gdHJ1ZVxufVxuIiwiaW1wb3J0IHtcbiAgICBFTVBUWV9PQkpFQ1QsXG4gICAgSUVxdWFsc0NvbXBhcmVyLFxuICAgIElSZWFjdGlvbkRpc3Bvc2VyLFxuICAgIElSZWFjdGlvblB1YmxpYyxcbiAgICBMYW1iZGEsXG4gICAgUmVhY3Rpb24sXG4gICAgYWN0aW9uLFxuICAgIGNvbXBhcmVyLFxuICAgIGdldE5leHRJZCxcbiAgICBpc0FjdGlvbixcbiAgICBpc0Z1bmN0aW9uLFxuICAgIGlzUGxhaW5PYmplY3QsXG4gICAgZGllLFxuICAgIGFsbG93U3RhdGVDaGFuZ2VzXG59IGZyb20gXCIuLi9pbnRlcm5hbFwiXG5cbmV4cG9ydCBpbnRlcmZhY2UgSUF1dG9ydW5PcHRpb25zIHtcbiAgICBkZWxheT86IG51bWJlclxuICAgIG5hbWU/OiBzdHJpbmdcbiAgICAvKipcbiAgICAgKiBFeHBlcmltZW50YWwuXG4gICAgICogV2FybnMgaWYgdGhlIHZpZXcgZG9lc24ndCB0cmFjayBvYnNlcnZhYmxlc1xuICAgICAqL1xuICAgIHJlcXVpcmVzT2JzZXJ2YWJsZT86IGJvb2xlYW5cbiAgICBzY2hlZHVsZXI/OiAoY2FsbGJhY2s6ICgpID0+IHZvaWQpID0+IGFueVxuICAgIG9uRXJyb3I/OiAoZXJyb3I6IGFueSkgPT4gdm9pZFxufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBuYW1lZCByZWFjdGl2ZSB2aWV3IGFuZCBrZWVwcyBpdCBhbGl2ZSwgc28gdGhhdCB0aGUgdmlldyBpcyBhbHdheXNcbiAqIHVwZGF0ZWQgaWYgb25lIG9mIHRoZSBkZXBlbmRlbmNpZXMgY2hhbmdlcywgZXZlbiB3aGVuIHRoZSB2aWV3IGlzIG5vdCBmdXJ0aGVyIHVzZWQgYnkgc29tZXRoaW5nIGVsc2UuXG4gKiBAcGFyYW0gdmlldyBUaGUgcmVhY3RpdmUgdmlld1xuICogQHJldHVybnMgZGlzcG9zZXIgZnVuY3Rpb24sIHdoaWNoIGNhbiBiZSB1c2VkIHRvIHN0b3AgdGhlIHZpZXcgZnJvbSBiZWluZyB1cGRhdGVkIGluIHRoZSBmdXR1cmUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhdXRvcnVuKFxuICAgIHZpZXc6IChyOiBJUmVhY3Rpb25QdWJsaWMpID0+IGFueSxcbiAgICBvcHRzOiBJQXV0b3J1bk9wdGlvbnMgPSBFTVBUWV9PQkpFQ1Rcbik6IElSZWFjdGlvbkRpc3Bvc2VyIHtcbiAgICBpZiAoX19ERVZfXykge1xuICAgICAgICBpZiAoIWlzRnVuY3Rpb24odmlldykpIHtcbiAgICAgICAgICAgIGRpZShcIkF1dG9ydW4gZXhwZWN0cyBhIGZ1bmN0aW9uIGFzIGZpcnN0IGFyZ3VtZW50XCIpXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzQWN0aW9uKHZpZXcpKSB7XG4gICAgICAgICAgICBkaWUoXCJBdXRvcnVuIGRvZXMgbm90IGFjY2VwdCBhY3Rpb25zIHNpbmNlIGFjdGlvbnMgYXJlIHVudHJhY2thYmxlXCIpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBuYW1lOiBzdHJpbmcgPVxuICAgICAgICBvcHRzPy5uYW1lID8/IChfX0RFVl9fID8gKHZpZXcgYXMgYW55KS5uYW1lIHx8IFwiQXV0b3J1bkBcIiArIGdldE5leHRJZCgpIDogXCJBdXRvcnVuXCIpXG4gICAgY29uc3QgcnVuU3luYyA9ICFvcHRzLnNjaGVkdWxlciAmJiAhb3B0cy5kZWxheVxuICAgIGxldCByZWFjdGlvbjogUmVhY3Rpb25cblxuICAgIGlmIChydW5TeW5jKSB7XG4gICAgICAgIC8vIG5vcm1hbCBhdXRvcnVuXG4gICAgICAgIHJlYWN0aW9uID0gbmV3IFJlYWN0aW9uKFxuICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgIGZ1bmN0aW9uICh0aGlzOiBSZWFjdGlvbikge1xuICAgICAgICAgICAgICAgIHRoaXMudHJhY2socmVhY3Rpb25SdW5uZXIpXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb3B0cy5vbkVycm9yLFxuICAgICAgICAgICAgb3B0cy5yZXF1aXJlc09ic2VydmFibGVcbiAgICAgICAgKVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHNjaGVkdWxlciA9IGNyZWF0ZVNjaGVkdWxlckZyb21PcHRpb25zKG9wdHMpXG4gICAgICAgIC8vIGRlYm91bmNlZCBhdXRvcnVuXG4gICAgICAgIGxldCBpc1NjaGVkdWxlZCA9IGZhbHNlXG5cbiAgICAgICAgcmVhY3Rpb24gPSBuZXcgUmVhY3Rpb24oXG4gICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghaXNTY2hlZHVsZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgaXNTY2hlZHVsZWQgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIHNjaGVkdWxlcigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpc1NjaGVkdWxlZCA9IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXJlYWN0aW9uLmlzRGlzcG9zZWRfKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVhY3Rpb24udHJhY2socmVhY3Rpb25SdW5uZXIpXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9wdHMub25FcnJvcixcbiAgICAgICAgICAgIG9wdHMucmVxdWlyZXNPYnNlcnZhYmxlXG4gICAgICAgIClcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZWFjdGlvblJ1bm5lcigpIHtcbiAgICAgICAgdmlldyhyZWFjdGlvbilcbiAgICB9XG5cbiAgICByZWFjdGlvbi5zY2hlZHVsZV8oKVxuICAgIHJldHVybiByZWFjdGlvbi5nZXREaXNwb3Nlcl8oKVxufVxuXG5leHBvcnQgdHlwZSBJUmVhY3Rpb25PcHRpb25zPFQsIEZpcmVJbW1lZGlhdGVseSBleHRlbmRzIGJvb2xlYW4+ID0gSUF1dG9ydW5PcHRpb25zICYge1xuICAgIGZpcmVJbW1lZGlhdGVseT86IEZpcmVJbW1lZGlhdGVseVxuICAgIGVxdWFscz86IElFcXVhbHNDb21wYXJlcjxUPlxufVxuXG5jb25zdCBydW4gPSAoZjogTGFtYmRhKSA9PiBmKClcblxuZnVuY3Rpb24gY3JlYXRlU2NoZWR1bGVyRnJvbU9wdGlvbnMob3B0czogSUF1dG9ydW5PcHRpb25zKSB7XG4gICAgcmV0dXJuIG9wdHMuc2NoZWR1bGVyXG4gICAgICAgID8gb3B0cy5zY2hlZHVsZXJcbiAgICAgICAgOiBvcHRzLmRlbGF5XG4gICAgICAgID8gKGY6IExhbWJkYSkgPT4gc2V0VGltZW91dChmLCBvcHRzLmRlbGF5ISlcbiAgICAgICAgOiBydW5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlYWN0aW9uPFQsIEZpcmVJbW1lZGlhdGVseSBleHRlbmRzIGJvb2xlYW4gPSBmYWxzZT4oXG4gICAgZXhwcmVzc2lvbjogKHI6IElSZWFjdGlvblB1YmxpYykgPT4gVCxcbiAgICBlZmZlY3Q6IChcbiAgICAgICAgYXJnOiBULFxuICAgICAgICBwcmV2OiBGaXJlSW1tZWRpYXRlbHkgZXh0ZW5kcyB0cnVlID8gVCB8IHVuZGVmaW5lZCA6IFQsXG4gICAgICAgIHI6IElSZWFjdGlvblB1YmxpY1xuICAgICkgPT4gdm9pZCxcbiAgICBvcHRzOiBJUmVhY3Rpb25PcHRpb25zPFQsIEZpcmVJbW1lZGlhdGVseT4gPSBFTVBUWV9PQkpFQ1Rcbik6IElSZWFjdGlvbkRpc3Bvc2VyIHtcbiAgICBpZiAoX19ERVZfXykge1xuICAgICAgICBpZiAoIWlzRnVuY3Rpb24oZXhwcmVzc2lvbikgfHwgIWlzRnVuY3Rpb24oZWZmZWN0KSkge1xuICAgICAgICAgICAgZGllKFwiRmlyc3QgYW5kIHNlY29uZCBhcmd1bWVudCB0byByZWFjdGlvbiBzaG91bGQgYmUgZnVuY3Rpb25zXCIpXG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFpc1BsYWluT2JqZWN0KG9wdHMpKSB7XG4gICAgICAgICAgICBkaWUoXCJUaGlyZCBhcmd1bWVudCBvZiByZWFjdGlvbnMgc2hvdWxkIGJlIGFuIG9iamVjdFwiKVxuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnN0IG5hbWUgPSBvcHRzLm5hbWUgPz8gKF9fREVWX18gPyBcIlJlYWN0aW9uQFwiICsgZ2V0TmV4dElkKCkgOiBcIlJlYWN0aW9uXCIpXG4gICAgY29uc3QgZWZmZWN0QWN0aW9uID0gYWN0aW9uKFxuICAgICAgICBuYW1lLFxuICAgICAgICBvcHRzLm9uRXJyb3IgPyB3cmFwRXJyb3JIYW5kbGVyKG9wdHMub25FcnJvciwgZWZmZWN0KSA6IGVmZmVjdFxuICAgIClcbiAgICBjb25zdCBydW5TeW5jID0gIW9wdHMuc2NoZWR1bGVyICYmICFvcHRzLmRlbGF5XG4gICAgY29uc3Qgc2NoZWR1bGVyID0gY3JlYXRlU2NoZWR1bGVyRnJvbU9wdGlvbnMob3B0cylcblxuICAgIGxldCBmaXJzdFRpbWUgPSB0cnVlXG4gICAgbGV0IGlzU2NoZWR1bGVkID0gZmFsc2VcbiAgICBsZXQgdmFsdWU6IFRcbiAgICBsZXQgb2xkVmFsdWU6IFQgfCB1bmRlZmluZWRcblxuICAgIGNvbnN0IGVxdWFsczogSUVxdWFsc0NvbXBhcmVyPFQ+ID0gKG9wdHMgYXMgYW55KS5jb21wYXJlU3RydWN0dXJhbFxuICAgICAgICA/IGNvbXBhcmVyLnN0cnVjdHVyYWxcbiAgICAgICAgOiBvcHRzLmVxdWFscyB8fCBjb21wYXJlci5kZWZhdWx0XG5cbiAgICBjb25zdCByID0gbmV3IFJlYWN0aW9uKFxuICAgICAgICBuYW1lLFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoZmlyc3RUaW1lIHx8IHJ1blN5bmMpIHtcbiAgICAgICAgICAgICAgICByZWFjdGlvblJ1bm5lcigpXG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFpc1NjaGVkdWxlZCkge1xuICAgICAgICAgICAgICAgIGlzU2NoZWR1bGVkID0gdHJ1ZVxuICAgICAgICAgICAgICAgIHNjaGVkdWxlciEocmVhY3Rpb25SdW5uZXIpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIG9wdHMub25FcnJvcixcbiAgICAgICAgb3B0cy5yZXF1aXJlc09ic2VydmFibGVcbiAgICApXG5cbiAgICBmdW5jdGlvbiByZWFjdGlvblJ1bm5lcigpIHtcbiAgICAgICAgaXNTY2hlZHVsZWQgPSBmYWxzZVxuICAgICAgICBpZiAoci5pc0Rpc3Bvc2VkXykge1xuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgbGV0IGNoYW5nZWQ6IGJvb2xlYW4gPSBmYWxzZVxuICAgICAgICByLnRyYWNrKCgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5leHRWYWx1ZSA9IGFsbG93U3RhdGVDaGFuZ2VzKGZhbHNlLCAoKSA9PiBleHByZXNzaW9uKHIpKVxuICAgICAgICAgICAgY2hhbmdlZCA9IGZpcnN0VGltZSB8fCAhZXF1YWxzKHZhbHVlLCBuZXh0VmFsdWUpXG4gICAgICAgICAgICBvbGRWYWx1ZSA9IHZhbHVlXG4gICAgICAgICAgICB2YWx1ZSA9IG5leHRWYWx1ZVxuICAgICAgICB9KVxuXG4gICAgICAgIC8vIFRoaXMgY2FzdGluZyBpcyBuZXNlc3NhcnkgYXMgVFMgY2Fubm90IGluZmVyIHByb3BlciB0eXBlIGluIGN1cnJlbnQgZnVuY2l0b24gaW1wbGVtZW50YXRpb25cbiAgICAgICAgdHlwZSBPbGRWYWx1ZSA9IEZpcmVJbW1lZGlhdGVseSBleHRlbmRzIHRydWUgPyBUIHwgdW5kZWZpbmVkIDogVFxuICAgICAgICBpZiAoZmlyc3RUaW1lICYmIG9wdHMuZmlyZUltbWVkaWF0ZWx5ISkge1xuICAgICAgICAgICAgZWZmZWN0QWN0aW9uKHZhbHVlLCBvbGRWYWx1ZSBhcyBPbGRWYWx1ZSwgcilcbiAgICAgICAgfSBlbHNlIGlmICghZmlyc3RUaW1lICYmIGNoYW5nZWQpIHtcbiAgICAgICAgICAgIGVmZmVjdEFjdGlvbih2YWx1ZSwgb2xkVmFsdWUgYXMgT2xkVmFsdWUsIHIpXG4gICAgICAgIH1cbiAgICAgICAgZmlyc3RUaW1lID0gZmFsc2VcbiAgICB9XG5cbiAgICByLnNjaGVkdWxlXygpXG4gICAgcmV0dXJuIHIuZ2V0RGlzcG9zZXJfKClcbn1cblxuZnVuY3Rpb24gd3JhcEVycm9ySGFuZGxlcihlcnJvckhhbmRsZXIsIGJhc2VGbikge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm4gYmFzZUZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgZXJyb3JIYW5kbGVyLmNhbGwodGhpcywgZSlcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsImltcG9ydCB7XG4gICAgSUNvbXB1dGVkVmFsdWUsXG4gICAgSU9ic2VydmFibGUsXG4gICAgSU9ic2VydmFibGVBcnJheSxcbiAgICBMYW1iZGEsXG4gICAgT2JzZXJ2YWJsZU1hcCxcbiAgICBnZXRBdG9tLFxuICAgIE9ic2VydmFibGVTZXQsXG4gICAgaXNGdW5jdGlvbixcbiAgICBJT2JzZXJ2YWJsZVZhbHVlXG59IGZyb20gXCIuLi9pbnRlcm5hbFwiXG5cbmNvbnN0IE9OX0JFQ09NRV9PQlNFUlZFRCA9IFwib25CT1wiXG5jb25zdCBPTl9CRUNPTUVfVU5PQlNFUlZFRCA9IFwib25CVU9cIlxuXG5leHBvcnQgZnVuY3Rpb24gb25CZWNvbWVPYnNlcnZlZChcbiAgICB2YWx1ZTpcbiAgICAgICAgfCBJT2JzZXJ2YWJsZVxuICAgICAgICB8IElDb21wdXRlZFZhbHVlPGFueT5cbiAgICAgICAgfCBJT2JzZXJ2YWJsZUFycmF5PGFueT5cbiAgICAgICAgfCBPYnNlcnZhYmxlTWFwPGFueSwgYW55PlxuICAgICAgICB8IE9ic2VydmFibGVTZXQ8YW55PlxuICAgICAgICB8IElPYnNlcnZhYmxlVmFsdWU8YW55PixcbiAgICBsaXN0ZW5lcjogTGFtYmRhXG4pOiBMYW1iZGFcbmV4cG9ydCBmdW5jdGlvbiBvbkJlY29tZU9ic2VydmVkPEssIFYgPSBhbnk+KFxuICAgIHZhbHVlOiBPYnNlcnZhYmxlTWFwPEssIFY+IHwgT2JqZWN0LFxuICAgIHByb3BlcnR5OiBLLFxuICAgIGxpc3RlbmVyOiBMYW1iZGFcbik6IExhbWJkYVxuZXhwb3J0IGZ1bmN0aW9uIG9uQmVjb21lT2JzZXJ2ZWQodGhpbmcsIGFyZzIsIGFyZzM/KTogTGFtYmRhIHtcbiAgICByZXR1cm4gaW50ZXJjZXB0SG9vayhPTl9CRUNPTUVfT0JTRVJWRUQsIHRoaW5nLCBhcmcyLCBhcmczKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gb25CZWNvbWVVbm9ic2VydmVkKFxuICAgIHZhbHVlOlxuICAgICAgICB8IElPYnNlcnZhYmxlXG4gICAgICAgIHwgSUNvbXB1dGVkVmFsdWU8YW55PlxuICAgICAgICB8IElPYnNlcnZhYmxlQXJyYXk8YW55PlxuICAgICAgICB8IE9ic2VydmFibGVNYXA8YW55LCBhbnk+XG4gICAgICAgIHwgT2JzZXJ2YWJsZVNldDxhbnk+XG4gICAgICAgIHwgSU9ic2VydmFibGVWYWx1ZTxhbnk+LFxuICAgIGxpc3RlbmVyOiBMYW1iZGFcbik6IExhbWJkYVxuZXhwb3J0IGZ1bmN0aW9uIG9uQmVjb21lVW5vYnNlcnZlZDxLLCBWID0gYW55PihcbiAgICB2YWx1ZTogT2JzZXJ2YWJsZU1hcDxLLCBWPiB8IE9iamVjdCxcbiAgICBwcm9wZXJ0eTogSyxcbiAgICBsaXN0ZW5lcjogTGFtYmRhXG4pOiBMYW1iZGFcbmV4cG9ydCBmdW5jdGlvbiBvbkJlY29tZVVub2JzZXJ2ZWQodGhpbmcsIGFyZzIsIGFyZzM/KTogTGFtYmRhIHtcbiAgICByZXR1cm4gaW50ZXJjZXB0SG9vayhPTl9CRUNPTUVfVU5PQlNFUlZFRCwgdGhpbmcsIGFyZzIsIGFyZzMpXG59XG5cbmZ1bmN0aW9uIGludGVyY2VwdEhvb2soaG9vazogXCJvbkJPXCIgfCBcIm9uQlVPXCIsIHRoaW5nLCBhcmcyLCBhcmczKSB7XG4gICAgY29uc3QgYXRvbTogSU9ic2VydmFibGUgPVxuICAgICAgICB0eXBlb2YgYXJnMyA9PT0gXCJmdW5jdGlvblwiID8gZ2V0QXRvbSh0aGluZywgYXJnMikgOiAoZ2V0QXRvbSh0aGluZykgYXMgYW55KVxuICAgIGNvbnN0IGNiID0gaXNGdW5jdGlvbihhcmczKSA/IGFyZzMgOiBhcmcyXG4gICAgY29uc3QgbGlzdGVuZXJzS2V5ID0gYCR7aG9va31MYCBhcyBcIm9uQk9MXCIgfCBcIm9uQlVPTFwiXG5cbiAgICBpZiAoYXRvbVtsaXN0ZW5lcnNLZXldKSB7XG4gICAgICAgIGF0b21bbGlzdGVuZXJzS2V5XSEuYWRkKGNiKVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGF0b21bbGlzdGVuZXJzS2V5XSA9IG5ldyBTZXQ8TGFtYmRhPihbY2JdKVxuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNvbnN0IGhvb2tMaXN0ZW5lcnMgPSBhdG9tW2xpc3RlbmVyc0tleV1cbiAgICAgICAgaWYgKGhvb2tMaXN0ZW5lcnMpIHtcbiAgICAgICAgICAgIGhvb2tMaXN0ZW5lcnMuZGVsZXRlKGNiKVxuICAgICAgICAgICAgaWYgKGhvb2tMaXN0ZW5lcnMuc2l6ZSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBhdG9tW2xpc3RlbmVyc0tleV1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbiIsImltcG9ydCB7XG4gICAgQ3JlYXRlT2JzZXJ2YWJsZU9wdGlvbnMsXG4gICAgaXNPYnNlcnZhYmxlTWFwLFxuICAgIEFubm90YXRpb25zTWFwLFxuICAgIHN0YXJ0QmF0Y2gsXG4gICAgZW5kQmF0Y2gsXG4gICAgYXNPYnNlcnZhYmxlT2JqZWN0LFxuICAgIGlzUGxhaW5PYmplY3QsXG4gICAgT2JzZXJ2YWJsZU9iamVjdEFkbWluaXN0cmF0aW9uLFxuICAgIGlzT2JzZXJ2YWJsZSxcbiAgICBkaWUsXG4gICAgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyxcbiAgICAkbW9ieCxcbiAgICBvd25LZXlzXG59IGZyb20gXCIuLi9pbnRlcm5hbFwiXG5cbmV4cG9ydCBmdW5jdGlvbiBleHRlbmRPYnNlcnZhYmxlPEEgZXh0ZW5kcyBPYmplY3QsIEIgZXh0ZW5kcyBPYmplY3Q+KFxuICAgIHRhcmdldDogQSxcbiAgICBwcm9wZXJ0aWVzOiBCLFxuICAgIGFubm90YXRpb25zPzogQW5ub3RhdGlvbnNNYXA8QiwgbmV2ZXI+LFxuICAgIG9wdGlvbnM/OiBDcmVhdGVPYnNlcnZhYmxlT3B0aW9uc1xuKTogQSAmIEIge1xuICAgIGlmIChfX0RFVl9fKSB7XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gNCkge1xuICAgICAgICAgICAgZGllKFwiJ2V4dGVuZE9ic2VydmFibGUnIGV4cGVjdGVkIDItNCBhcmd1bWVudHNcIilcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIHRhcmdldCAhPT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgZGllKFwiJ2V4dGVuZE9ic2VydmFibGUnIGV4cGVjdHMgYW4gb2JqZWN0IGFzIGZpcnN0IGFyZ3VtZW50XCIpXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzT2JzZXJ2YWJsZU1hcCh0YXJnZXQpKSB7XG4gICAgICAgICAgICBkaWUoXCInZXh0ZW5kT2JzZXJ2YWJsZScgc2hvdWxkIG5vdCBiZSB1c2VkIG9uIG1hcHMsIHVzZSBtYXAubWVyZ2UgaW5zdGVhZFwiKVxuICAgICAgICB9XG4gICAgICAgIGlmICghaXNQbGFpbk9iamVjdChwcm9wZXJ0aWVzKSkge1xuICAgICAgICAgICAgZGllKGAnZXh0ZW5kT2JzZXJ2YWJsZScgb25seSBhY2NlcHRzIHBsYWluIG9iamVjdHMgYXMgc2Vjb25kIGFyZ3VtZW50YClcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNPYnNlcnZhYmxlKHByb3BlcnRpZXMpIHx8IGlzT2JzZXJ2YWJsZShhbm5vdGF0aW9ucykpIHtcbiAgICAgICAgICAgIGRpZShgRXh0ZW5kaW5nIGFuIG9iamVjdCB3aXRoIGFub3RoZXIgb2JzZXJ2YWJsZSAob2JqZWN0KSBpcyBub3Qgc3VwcG9ydGVkYClcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBQdWxsIGRlc2NyaXB0b3JzIGZpcnN0LCBzbyB3ZSBkb24ndCBoYXZlIHRvIGRlYWwgd2l0aCBwcm9wcyBhZGRlZCBieSBhZG1pbmlzdHJhdGlvbiAoJG1vYngpXG4gICAgY29uc3QgZGVzY3JpcHRvcnMgPSBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHByb3BlcnRpZXMpXG5cbiAgICBjb25zdCBhZG06IE9ic2VydmFibGVPYmplY3RBZG1pbmlzdHJhdGlvbiA9IGFzT2JzZXJ2YWJsZU9iamVjdCh0YXJnZXQsIG9wdGlvbnMpWyRtb2J4XVxuICAgIHN0YXJ0QmF0Y2goKVxuICAgIHRyeSB7XG4gICAgICAgIG93bktleXMoZGVzY3JpcHRvcnMpLmZvckVhY2goa2V5ID0+IHtcbiAgICAgICAgICAgIGFkbS5leHRlbmRfKFxuICAgICAgICAgICAgICAgIGtleSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdG9yc1trZXkgYXMgYW55XSxcbiAgICAgICAgICAgICAgICAvLyBtdXN0IHBhc3MgXCJ1bmRlZmluZWRcIiBmb3IgeyBrZXk6IHVuZGVmaW5lZCB9XG4gICAgICAgICAgICAgICAgIWFubm90YXRpb25zID8gdHJ1ZSA6IGtleSBpbiBhbm5vdGF0aW9ucyA/IGFubm90YXRpb25zW2tleV0gOiB0cnVlXG4gICAgICAgICAgICApXG4gICAgICAgIH0pXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgICAgZW5kQmF0Y2goKVxuICAgIH1cbiAgICByZXR1cm4gdGFyZ2V0IGFzIGFueVxufVxuIiwiaW1wb3J0IHsgSURlcFRyZWVOb2RlLCBnZXRBdG9tLCBnZXRPYnNlcnZlcnMsIGhhc09ic2VydmVycyB9IGZyb20gXCIuLi9pbnRlcm5hbFwiXG5cbmV4cG9ydCBpbnRlcmZhY2UgSURlcGVuZGVuY3lUcmVlIHtcbiAgICBuYW1lOiBzdHJpbmdcbiAgICBkZXBlbmRlbmNpZXM/OiBJRGVwZW5kZW5jeVRyZWVbXVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIElPYnNlcnZlclRyZWUge1xuICAgIG5hbWU6IHN0cmluZ1xuICAgIG9ic2VydmVycz86IElPYnNlcnZlclRyZWVbXVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RGVwZW5kZW5jeVRyZWUodGhpbmc6IGFueSwgcHJvcGVydHk/OiBzdHJpbmcpOiBJRGVwZW5kZW5jeVRyZWUge1xuICAgIHJldHVybiBub2RlVG9EZXBlbmRlbmN5VHJlZShnZXRBdG9tKHRoaW5nLCBwcm9wZXJ0eSkpXG59XG5cbmZ1bmN0aW9uIG5vZGVUb0RlcGVuZGVuY3lUcmVlKG5vZGU6IElEZXBUcmVlTm9kZSk6IElEZXBlbmRlbmN5VHJlZSB7XG4gICAgY29uc3QgcmVzdWx0OiBJRGVwZW5kZW5jeVRyZWUgPSB7XG4gICAgICAgIG5hbWU6IG5vZGUubmFtZV9cbiAgICB9XG4gICAgaWYgKG5vZGUub2JzZXJ2aW5nXyAmJiBub2RlLm9ic2VydmluZ18ubGVuZ3RoID4gMCkge1xuICAgICAgICByZXN1bHQuZGVwZW5kZW5jaWVzID0gdW5pcXVlKG5vZGUub2JzZXJ2aW5nXykubWFwKG5vZGVUb0RlcGVuZGVuY3lUcmVlKVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRPYnNlcnZlclRyZWUodGhpbmc6IGFueSwgcHJvcGVydHk/OiBzdHJpbmcpOiBJT2JzZXJ2ZXJUcmVlIHtcbiAgICByZXR1cm4gbm9kZVRvT2JzZXJ2ZXJUcmVlKGdldEF0b20odGhpbmcsIHByb3BlcnR5KSlcbn1cblxuZnVuY3Rpb24gbm9kZVRvT2JzZXJ2ZXJUcmVlKG5vZGU6IElEZXBUcmVlTm9kZSk6IElPYnNlcnZlclRyZWUge1xuICAgIGNvbnN0IHJlc3VsdDogSU9ic2VydmVyVHJlZSA9IHtcbiAgICAgICAgbmFtZTogbm9kZS5uYW1lX1xuICAgIH1cbiAgICBpZiAoaGFzT2JzZXJ2ZXJzKG5vZGUgYXMgYW55KSkge1xuICAgICAgICByZXN1bHQub2JzZXJ2ZXJzID0gQXJyYXkuZnJvbSg8YW55PmdldE9ic2VydmVycyhub2RlIGFzIGFueSkpLm1hcCg8YW55Pm5vZGVUb09ic2VydmVyVHJlZSlcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdFxufVxuXG5mdW5jdGlvbiB1bmlxdWU8VD4obGlzdDogVFtdKTogVFtdIHtcbiAgICByZXR1cm4gQXJyYXkuZnJvbShuZXcgU2V0KGxpc3QpKVxufVxuIiwiaW1wb3J0IHtcbiAgICBhY3Rpb24sXG4gICAgbm9vcCxcbiAgICBkaWUsXG4gICAgaXNGdW5jdGlvbixcbiAgICBBbm5vdGF0aW9uLFxuICAgIGlzU3RyaW5naXNoLFxuICAgIHN0b3JlQW5ub3RhdGlvbixcbiAgICBjcmVhdGVGbG93QW5ub3RhdGlvbixcbiAgICBjcmVhdGVEZWNvcmF0b3JBbm5vdGF0aW9uXG59IGZyb20gXCIuLi9pbnRlcm5hbFwiXG5cbmV4cG9ydCBjb25zdCBGTE9XID0gXCJmbG93XCJcblxubGV0IGdlbmVyYXRvcklkID0gMFxuXG5leHBvcnQgZnVuY3Rpb24gRmxvd0NhbmNlbGxhdGlvbkVycm9yKCkge1xuICAgIHRoaXMubWVzc2FnZSA9IFwiRkxPV19DQU5DRUxMRURcIlxufVxuRmxvd0NhbmNlbGxhdGlvbkVycm9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRXJyb3IucHJvdG90eXBlKVxuXG5leHBvcnQgZnVuY3Rpb24gaXNGbG93Q2FuY2VsbGF0aW9uRXJyb3IoZXJyb3I6IEVycm9yKSB7XG4gICAgcmV0dXJuIGVycm9yIGluc3RhbmNlb2YgRmxvd0NhbmNlbGxhdGlvbkVycm9yXG59XG5cbmV4cG9ydCB0eXBlIENhbmNlbGxhYmxlUHJvbWlzZTxUPiA9IFByb21pc2U8VD4gJiB7IGNhbmNlbCgpOiB2b2lkIH1cblxuaW50ZXJmYWNlIEZsb3cgZXh0ZW5kcyBBbm5vdGF0aW9uLCBQcm9wZXJ0eURlY29yYXRvciB7XG4gICAgPFIsIEFyZ3MgZXh0ZW5kcyBhbnlbXT4oXG4gICAgICAgIGdlbmVyYXRvcjogKC4uLmFyZ3M6IEFyZ3MpID0+IEdlbmVyYXRvcjxhbnksIFIsIGFueT4gfCBBc3luY0dlbmVyYXRvcjxhbnksIFIsIGFueT5cbiAgICApOiAoLi4uYXJnczogQXJncykgPT4gQ2FuY2VsbGFibGVQcm9taXNlPFI+XG4gICAgYm91bmQ6IEFubm90YXRpb24gJiBQcm9wZXJ0eURlY29yYXRvclxufVxuXG5jb25zdCBmbG93QW5ub3RhdGlvbiA9IGNyZWF0ZUZsb3dBbm5vdGF0aW9uKFwiZmxvd1wiKVxuY29uc3QgZmxvd0JvdW5kQW5ub3RhdGlvbiA9IGNyZWF0ZUZsb3dBbm5vdGF0aW9uKFwiZmxvdy5ib3VuZFwiLCB7IGJvdW5kOiB0cnVlIH0pXG5cbmV4cG9ydCBjb25zdCBmbG93OiBGbG93ID0gT2JqZWN0LmFzc2lnbihcbiAgICBmdW5jdGlvbiBmbG93KGFyZzEsIGFyZzI/KSB7XG4gICAgICAgIC8vIEBmbG93XG4gICAgICAgIGlmIChpc1N0cmluZ2lzaChhcmcyKSkge1xuICAgICAgICAgICAgcmV0dXJuIHN0b3JlQW5ub3RhdGlvbihhcmcxLCBhcmcyLCBmbG93QW5ub3RhdGlvbilcbiAgICAgICAgfVxuICAgICAgICAvLyBmbG93KGZuKVxuICAgICAgICBpZiAoX19ERVZfXyAmJiBhcmd1bWVudHMubGVuZ3RoICE9PSAxKSB7XG4gICAgICAgICAgICBkaWUoYEZsb3cgZXhwZWN0cyBzaW5nbGUgYXJndW1lbnQgd2l0aCBnZW5lcmF0b3IgZnVuY3Rpb25gKVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGdlbmVyYXRvciA9IGFyZzFcbiAgICAgICAgY29uc3QgbmFtZSA9IGdlbmVyYXRvci5uYW1lIHx8IFwiPHVubmFtZWQgZmxvdz5cIlxuXG4gICAgICAgIC8vIEltcGxlbWVudGF0aW9uIGJhc2VkIG9uIGh0dHBzOi8vZ2l0aHViLmNvbS90ai9jby9ibG9iL21hc3Rlci9pbmRleC5qc1xuICAgICAgICBjb25zdCByZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjb25zdCBjdHggPSB0aGlzXG4gICAgICAgICAgICBjb25zdCBhcmdzID0gYXJndW1lbnRzXG4gICAgICAgICAgICBjb25zdCBydW5JZCA9ICsrZ2VuZXJhdG9ySWRcbiAgICAgICAgICAgIGNvbnN0IGdlbiA9IGFjdGlvbihgJHtuYW1lfSAtIHJ1bmlkOiAke3J1bklkfSAtIGluaXRgLCBnZW5lcmF0b3IpLmFwcGx5KGN0eCwgYXJncylcbiAgICAgICAgICAgIGxldCByZWplY3RvcjogKGVycm9yOiBhbnkpID0+IHZvaWRcbiAgICAgICAgICAgIGxldCBwZW5kaW5nUHJvbWlzZTogQ2FuY2VsbGFibGVQcm9taXNlPGFueT4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWRcblxuICAgICAgICAgICAgY29uc3QgcHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgICAgICBsZXQgc3RlcElkID0gMFxuICAgICAgICAgICAgICAgIHJlamVjdG9yID0gcmVqZWN0XG5cbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBvbkZ1bGZpbGxlZChyZXM6IGFueSkge1xuICAgICAgICAgICAgICAgICAgICBwZW5kaW5nUHJvbWlzZSA9IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICBsZXQgcmV0XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXQgPSBhY3Rpb24oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYCR7bmFtZX0gLSBydW5pZDogJHtydW5JZH0gLSB5aWVsZCAke3N0ZXBJZCsrfWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2VuLm5leHRcbiAgICAgICAgICAgICAgICAgICAgICAgICkuY2FsbChnZW4sIHJlcylcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChlKVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgbmV4dChyZXQpXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gb25SZWplY3RlZChlcnI6IGFueSkge1xuICAgICAgICAgICAgICAgICAgICBwZW5kaW5nUHJvbWlzZSA9IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICBsZXQgcmV0XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXQgPSBhY3Rpb24oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYCR7bmFtZX0gLSBydW5pZDogJHtydW5JZH0gLSB5aWVsZCAke3N0ZXBJZCsrfWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2VuLnRocm93IVxuICAgICAgICAgICAgICAgICAgICAgICAgKS5jYWxsKGdlbiwgZXJyKVxuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVqZWN0KGUpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbmV4dChyZXQpXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gbmV4dChyZXQ6IGFueSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXNGdW5jdGlvbihyZXQ/LnRoZW4pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBhbiBhc3luYyBpdGVyYXRvclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0LnRoZW4obmV4dCwgcmVqZWN0KVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHJldC5kb25lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzb2x2ZShyZXQudmFsdWUpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcGVuZGluZ1Byb21pc2UgPSBQcm9taXNlLnJlc29sdmUocmV0LnZhbHVlKSBhcyBhbnlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBlbmRpbmdQcm9taXNlIS50aGVuKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkKVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIG9uRnVsZmlsbGVkKHVuZGVmaW5lZCkgLy8ga2ljayBvZmYgdGhlIHByb2Nlc3NcbiAgICAgICAgICAgIH0pIGFzIGFueVxuXG4gICAgICAgICAgICBwcm9taXNlLmNhbmNlbCA9IGFjdGlvbihgJHtuYW1lfSAtIHJ1bmlkOiAke3J1bklkfSAtIGNhbmNlbGAsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAocGVuZGluZ1Byb21pc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbmNlbFByb21pc2UocGVuZGluZ1Byb21pc2UpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gRmluYWxseSBibG9jayBjYW4gcmV0dXJuIChvciB5aWVsZCkgc3R1ZmYuLlxuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXMgPSBnZW4ucmV0dXJuISh1bmRlZmluZWQgYXMgYW55KVxuICAgICAgICAgICAgICAgICAgICAvLyBlYXQgYW55dGhpbmcgdGhhdCBwcm9taXNlIHdvdWxkIGRvLCBpdCdzIGNhbmNlbGxlZCFcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgeWllbGRlZFByb21pc2UgPSBQcm9taXNlLnJlc29sdmUocmVzLnZhbHVlKVxuICAgICAgICAgICAgICAgICAgICB5aWVsZGVkUHJvbWlzZS50aGVuKG5vb3AsIG5vb3ApXG4gICAgICAgICAgICAgICAgICAgIGNhbmNlbFByb21pc2UoeWllbGRlZFByb21pc2UpIC8vIG1heWJlIGl0IGNhbiBiZSBjYW5jZWxsZWQgOilcbiAgICAgICAgICAgICAgICAgICAgLy8gcmVqZWN0IG91ciBvcmlnaW5hbCBwcm9taXNlXG4gICAgICAgICAgICAgICAgICAgIHJlamVjdG9yKG5ldyBGbG93Q2FuY2VsbGF0aW9uRXJyb3IoKSlcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdG9yKGUpIC8vIHRoZXJlIGNvdWxkIGJlIGEgdGhyb3dpbmcgZmluYWxseSBibG9ja1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzZVxuICAgICAgICB9XG4gICAgICAgIHJlcy5pc01vYlhGbG93ID0gdHJ1ZVxuICAgICAgICByZXR1cm4gcmVzXG4gICAgfSBhcyBhbnksXG4gICAgZmxvd0Fubm90YXRpb25cbilcblxuZmxvdy5ib3VuZCA9IGNyZWF0ZURlY29yYXRvckFubm90YXRpb24oZmxvd0JvdW5kQW5ub3RhdGlvbilcblxuZnVuY3Rpb24gY2FuY2VsUHJvbWlzZShwcm9taXNlKSB7XG4gICAgaWYgKGlzRnVuY3Rpb24ocHJvbWlzZS5jYW5jZWwpKSB7XG4gICAgICAgIHByb21pc2UuY2FuY2VsKClcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmbG93UmVzdWx0PFQ+KFxuICAgIHJlc3VsdDogVFxuKTogVCBleHRlbmRzIEdlbmVyYXRvcjxhbnksIGluZmVyIFIsIGFueT5cbiAgICA/IENhbmNlbGxhYmxlUHJvbWlzZTxSPlxuICAgIDogVCBleHRlbmRzIENhbmNlbGxhYmxlUHJvbWlzZTxhbnk+XG4gICAgPyBUXG4gICAgOiBuZXZlciB7XG4gICAgcmV0dXJuIHJlc3VsdCBhcyBhbnkgLy8ganVzdCB0cmlja2luZyBUeXBlU2NyaXB0IDopXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0Zsb3coZm46IGFueSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBmbj8uaXNNb2JYRmxvdyA9PT0gdHJ1ZVxufVxuIiwiaW1wb3J0IHtcbiAgICAkbW9ieCxcbiAgICBpc0F0b20sXG4gICAgaXNDb21wdXRlZFZhbHVlLFxuICAgIGlzT2JzZXJ2YWJsZUFycmF5LFxuICAgIGlzT2JzZXJ2YWJsZU1hcCxcbiAgICBpc09ic2VydmFibGVPYmplY3QsXG4gICAgaXNSZWFjdGlvbixcbiAgICBkaWUsXG4gICAgaXNTdHJpbmdpc2hcbn0gZnJvbSBcIi4uL2ludGVybmFsXCJcblxuZnVuY3Rpb24gX2lzT2JzZXJ2YWJsZSh2YWx1ZSwgcHJvcGVydHk/OiBQcm9wZXJ0eUtleSk6IGJvb2xlYW4ge1xuICAgIGlmICghdmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICAgIGlmIChwcm9wZXJ0eSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGlmIChfX0RFVl9fICYmIChpc09ic2VydmFibGVNYXAodmFsdWUpIHx8IGlzT2JzZXJ2YWJsZUFycmF5KHZhbHVlKSkpIHtcbiAgICAgICAgICAgIHJldHVybiBkaWUoXG4gICAgICAgICAgICAgICAgXCJpc09ic2VydmFibGUob2JqZWN0LCBwcm9wZXJ0eU5hbWUpIGlzIG5vdCBzdXBwb3J0ZWQgZm9yIGFycmF5cyBhbmQgbWFwcy4gVXNlIG1hcC5oYXMgb3IgYXJyYXkubGVuZ3RoIGluc3RlYWQuXCJcbiAgICAgICAgICAgIClcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNPYnNlcnZhYmxlT2JqZWN0KHZhbHVlKSkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlWyRtb2J4XS52YWx1ZXNfLmhhcyhwcm9wZXJ0eSlcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gICAgLy8gRm9yIGZpcnN0IGNoZWNrLCBzZWUgIzcwMVxuICAgIHJldHVybiAoXG4gICAgICAgIGlzT2JzZXJ2YWJsZU9iamVjdCh2YWx1ZSkgfHxcbiAgICAgICAgISF2YWx1ZVskbW9ieF0gfHxcbiAgICAgICAgaXNBdG9tKHZhbHVlKSB8fFxuICAgICAgICBpc1JlYWN0aW9uKHZhbHVlKSB8fFxuICAgICAgICBpc0NvbXB1dGVkVmFsdWUodmFsdWUpXG4gICAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNPYnNlcnZhYmxlKHZhbHVlOiBhbnkpOiBib29sZWFuIHtcbiAgICBpZiAoX19ERVZfXyAmJiBhcmd1bWVudHMubGVuZ3RoICE9PSAxKSB7XG4gICAgICAgIGRpZShcbiAgICAgICAgICAgIGBpc09ic2VydmFibGUgZXhwZWN0cyBvbmx5IDEgYXJndW1lbnQuIFVzZSBpc09ic2VydmFibGVQcm9wIHRvIGluc3BlY3QgdGhlIG9ic2VydmFiaWxpdHkgb2YgYSBwcm9wZXJ0eWBcbiAgICAgICAgKVxuICAgIH1cbiAgICByZXR1cm4gX2lzT2JzZXJ2YWJsZSh2YWx1ZSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzT2JzZXJ2YWJsZVByb3AodmFsdWU6IGFueSwgcHJvcE5hbWU6IFByb3BlcnR5S2V5KTogYm9vbGVhbiB7XG4gICAgaWYgKF9fREVWX18gJiYgIWlzU3RyaW5naXNoKHByb3BOYW1lKSkge1xuICAgICAgICByZXR1cm4gZGllKGBleHBlY3RlZCBhIHByb3BlcnR5IG5hbWUgYXMgc2Vjb25kIGFyZ3VtZW50YClcbiAgICB9XG4gICAgcmV0dXJuIF9pc09ic2VydmFibGUodmFsdWUsIHByb3BOYW1lKVxufVxuIiwiaW1wb3J0IHtcbiAgICAkbW9ieCxcbiAgICBJSXNPYnNlcnZhYmxlT2JqZWN0LFxuICAgIElPYnNlcnZhYmxlQXJyYXksXG4gICAgT2JzZXJ2YWJsZU1hcCxcbiAgICBPYnNlcnZhYmxlU2V0LFxuICAgIE9ic2VydmFibGVPYmplY3RBZG1pbmlzdHJhdGlvbixcbiAgICBlbmRCYXRjaCxcbiAgICBpc09ic2VydmFibGVBcnJheSxcbiAgICBpc09ic2VydmFibGVNYXAsXG4gICAgaXNPYnNlcnZhYmxlU2V0LFxuICAgIGlzT2JzZXJ2YWJsZU9iamVjdCxcbiAgICBzdGFydEJhdGNoLFxuICAgIGRpZVxufSBmcm9tIFwiLi4vaW50ZXJuYWxcIlxuXG5leHBvcnQgZnVuY3Rpb24ga2V5czxLPihtYXA6IE9ic2VydmFibGVNYXA8SywgYW55Pik6IFJlYWRvbmx5QXJyYXk8Sz5cbmV4cG9ydCBmdW5jdGlvbiBrZXlzPFQ+KGFyOiBJT2JzZXJ2YWJsZUFycmF5PFQ+KTogUmVhZG9ubHlBcnJheTxudW1iZXI+XG5leHBvcnQgZnVuY3Rpb24ga2V5czxUPihzZXQ6IE9ic2VydmFibGVTZXQ8VD4pOiBSZWFkb25seUFycmF5PFQ+XG5leHBvcnQgZnVuY3Rpb24ga2V5czxUIGV4dGVuZHMgT2JqZWN0PihvYmo6IFQpOiBSZWFkb25seUFycmF5PFByb3BlcnR5S2V5PlxuZXhwb3J0IGZ1bmN0aW9uIGtleXMob2JqOiBhbnkpOiBhbnkge1xuICAgIGlmIChpc09ic2VydmFibGVPYmplY3Qob2JqKSkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgKG9iaiBhcyBhbnkgYXMgSUlzT2JzZXJ2YWJsZU9iamVjdClbJG1vYnhdIGFzIE9ic2VydmFibGVPYmplY3RBZG1pbmlzdHJhdGlvblxuICAgICAgICApLmtleXNfKClcbiAgICB9XG4gICAgaWYgKGlzT2JzZXJ2YWJsZU1hcChvYmopIHx8IGlzT2JzZXJ2YWJsZVNldChvYmopKSB7XG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKG9iai5rZXlzKCkpXG4gICAgfVxuICAgIGlmIChpc09ic2VydmFibGVBcnJheShvYmopKSB7XG4gICAgICAgIHJldHVybiBvYmoubWFwKChfLCBpbmRleCkgPT4gaW5kZXgpXG4gICAgfVxuICAgIGRpZSg1KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdmFsdWVzPEssIFQ+KG1hcDogT2JzZXJ2YWJsZU1hcDxLLCBUPik6IFJlYWRvbmx5QXJyYXk8VD5cbmV4cG9ydCBmdW5jdGlvbiB2YWx1ZXM8VD4oc2V0OiBPYnNlcnZhYmxlU2V0PFQ+KTogUmVhZG9ubHlBcnJheTxUPlxuZXhwb3J0IGZ1bmN0aW9uIHZhbHVlczxUPihhcjogSU9ic2VydmFibGVBcnJheTxUPik6IFJlYWRvbmx5QXJyYXk8VD5cbmV4cG9ydCBmdW5jdGlvbiB2YWx1ZXM8VCA9IGFueT4ob2JqOiBUKTogUmVhZG9ubHlBcnJheTxUIGV4dGVuZHMgb2JqZWN0ID8gVFtrZXlvZiBUXSA6IGFueT5cbmV4cG9ydCBmdW5jdGlvbiB2YWx1ZXMob2JqOiBhbnkpOiBzdHJpbmdbXSB7XG4gICAgaWYgKGlzT2JzZXJ2YWJsZU9iamVjdChvYmopKSB7XG4gICAgICAgIHJldHVybiBrZXlzKG9iaikubWFwKGtleSA9PiBvYmpba2V5XSlcbiAgICB9XG4gICAgaWYgKGlzT2JzZXJ2YWJsZU1hcChvYmopKSB7XG4gICAgICAgIHJldHVybiBrZXlzKG9iaikubWFwKGtleSA9PiBvYmouZ2V0KGtleSkpXG4gICAgfVxuICAgIGlmIChpc09ic2VydmFibGVTZXQob2JqKSkge1xuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbShvYmoudmFsdWVzKCkpXG4gICAgfVxuICAgIGlmIChpc09ic2VydmFibGVBcnJheShvYmopKSB7XG4gICAgICAgIHJldHVybiBvYmouc2xpY2UoKVxuICAgIH1cbiAgICBkaWUoNilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVudHJpZXM8SywgVD4obWFwOiBPYnNlcnZhYmxlTWFwPEssIFQ+KTogUmVhZG9ubHlBcnJheTxbSywgVF0+XG5leHBvcnQgZnVuY3Rpb24gZW50cmllczxUPihzZXQ6IE9ic2VydmFibGVTZXQ8VD4pOiBSZWFkb25seUFycmF5PFtULCBUXT5cbmV4cG9ydCBmdW5jdGlvbiBlbnRyaWVzPFQ+KGFyOiBJT2JzZXJ2YWJsZUFycmF5PFQ+KTogUmVhZG9ubHlBcnJheTxbbnVtYmVyLCBUXT5cbmV4cG9ydCBmdW5jdGlvbiBlbnRyaWVzPFQgPSBhbnk+KFxuICAgIG9iajogVFxuKTogUmVhZG9ubHlBcnJheTxbc3RyaW5nLCBUIGV4dGVuZHMgb2JqZWN0ID8gVFtrZXlvZiBUXSA6IGFueV0+XG5leHBvcnQgZnVuY3Rpb24gZW50cmllcyhvYmo6IGFueSk6IGFueSB7XG4gICAgaWYgKGlzT2JzZXJ2YWJsZU9iamVjdChvYmopKSB7XG4gICAgICAgIHJldHVybiBrZXlzKG9iaikubWFwKGtleSA9PiBba2V5LCBvYmpba2V5XV0pXG4gICAgfVxuICAgIGlmIChpc09ic2VydmFibGVNYXAob2JqKSkge1xuICAgICAgICByZXR1cm4ga2V5cyhvYmopLm1hcChrZXkgPT4gW2tleSwgb2JqLmdldChrZXkpXSlcbiAgICB9XG4gICAgaWYgKGlzT2JzZXJ2YWJsZVNldChvYmopKSB7XG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKG9iai5lbnRyaWVzKCkpXG4gICAgfVxuICAgIGlmIChpc09ic2VydmFibGVBcnJheShvYmopKSB7XG4gICAgICAgIHJldHVybiBvYmoubWFwKChrZXksIGluZGV4KSA9PiBbaW5kZXgsIGtleV0pXG4gICAgfVxuICAgIGRpZSg3KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0PFY+KG9iajogT2JzZXJ2YWJsZU1hcDxQcm9wZXJ0eUtleSwgVj4sIHZhbHVlczogeyBba2V5OiBzdHJpbmddOiBWIH0pXG5leHBvcnQgZnVuY3Rpb24gc2V0PEssIFY+KG9iajogT2JzZXJ2YWJsZU1hcDxLLCBWPiwga2V5OiBLLCB2YWx1ZTogVilcbmV4cG9ydCBmdW5jdGlvbiBzZXQ8VD4ob2JqOiBPYnNlcnZhYmxlU2V0PFQ+LCB2YWx1ZTogVClcbmV4cG9ydCBmdW5jdGlvbiBzZXQ8VD4ob2JqOiBJT2JzZXJ2YWJsZUFycmF5PFQ+LCBpbmRleDogbnVtYmVyLCB2YWx1ZTogVClcbmV4cG9ydCBmdW5jdGlvbiBzZXQ8VCBleHRlbmRzIE9iamVjdD4ob2JqOiBULCB2YWx1ZXM6IHsgW2tleTogc3RyaW5nXTogYW55IH0pXG5leHBvcnQgZnVuY3Rpb24gc2V0PFQgZXh0ZW5kcyBPYmplY3Q+KG9iajogVCwga2V5OiBQcm9wZXJ0eUtleSwgdmFsdWU6IGFueSlcbmV4cG9ydCBmdW5jdGlvbiBzZXQob2JqOiBhbnksIGtleTogYW55LCB2YWx1ZT86IGFueSk6IHZvaWQge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyICYmICFpc09ic2VydmFibGVTZXQob2JqKSkge1xuICAgICAgICBzdGFydEJhdGNoKClcbiAgICAgICAgY29uc3QgdmFsdWVzID0ga2V5XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBmb3IgKGxldCBrZXkgaW4gdmFsdWVzKSB7XG4gICAgICAgICAgICAgICAgc2V0KG9iaiwga2V5LCB2YWx1ZXNba2V5XSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIGVuZEJhdGNoKClcbiAgICAgICAgfVxuICAgICAgICByZXR1cm5cbiAgICB9XG4gICAgaWYgKGlzT2JzZXJ2YWJsZU9iamVjdChvYmopKSB7XG4gICAgICAgIDsob2JqIGFzIGFueSBhcyBJSXNPYnNlcnZhYmxlT2JqZWN0KVskbW9ieF0uc2V0XyhrZXksIHZhbHVlKVxuICAgIH0gZWxzZSBpZiAoaXNPYnNlcnZhYmxlTWFwKG9iaikpIHtcbiAgICAgICAgb2JqLnNldChrZXksIHZhbHVlKVxuICAgIH0gZWxzZSBpZiAoaXNPYnNlcnZhYmxlU2V0KG9iaikpIHtcbiAgICAgICAgb2JqLmFkZChrZXkpXG4gICAgfSBlbHNlIGlmIChpc09ic2VydmFibGVBcnJheShvYmopKSB7XG4gICAgICAgIGlmICh0eXBlb2Yga2V5ICE9PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgICBrZXkgPSBwYXJzZUludChrZXksIDEwKVxuICAgICAgICB9XG4gICAgICAgIGlmIChrZXkgPCAwKSB7XG4gICAgICAgICAgICBkaWUoYEludmFsaWQgaW5kZXg6ICcke2tleX0nYClcbiAgICAgICAgfVxuICAgICAgICBzdGFydEJhdGNoKClcbiAgICAgICAgaWYgKGtleSA+PSBvYmoubGVuZ3RoKSB7XG4gICAgICAgICAgICBvYmoubGVuZ3RoID0ga2V5ICsgMVxuICAgICAgICB9XG4gICAgICAgIG9ialtrZXldID0gdmFsdWVcbiAgICAgICAgZW5kQmF0Y2goKVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGRpZSg4KVxuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZTxLLCBWPihvYmo6IE9ic2VydmFibGVNYXA8SywgVj4sIGtleTogSylcbmV4cG9ydCBmdW5jdGlvbiByZW1vdmU8VD4ob2JqOiBPYnNlcnZhYmxlU2V0PFQ+LCBrZXk6IFQpXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlPFQ+KG9iajogSU9ic2VydmFibGVBcnJheTxUPiwgaW5kZXg6IG51bWJlcilcbmV4cG9ydCBmdW5jdGlvbiByZW1vdmU8VCBleHRlbmRzIE9iamVjdD4ob2JqOiBULCBrZXk6IHN0cmluZylcbmV4cG9ydCBmdW5jdGlvbiByZW1vdmUob2JqOiBhbnksIGtleTogYW55KTogdm9pZCB7XG4gICAgaWYgKGlzT2JzZXJ2YWJsZU9iamVjdChvYmopKSB7XG4gICAgICAgIDsob2JqIGFzIGFueSBhcyBJSXNPYnNlcnZhYmxlT2JqZWN0KVskbW9ieF0uZGVsZXRlXyhrZXkpXG4gICAgfSBlbHNlIGlmIChpc09ic2VydmFibGVNYXAob2JqKSkge1xuICAgICAgICBvYmouZGVsZXRlKGtleSlcbiAgICB9IGVsc2UgaWYgKGlzT2JzZXJ2YWJsZVNldChvYmopKSB7XG4gICAgICAgIG9iai5kZWxldGUoa2V5KVxuICAgIH0gZWxzZSBpZiAoaXNPYnNlcnZhYmxlQXJyYXkob2JqKSkge1xuICAgICAgICBpZiAodHlwZW9mIGtleSAhPT0gXCJudW1iZXJcIikge1xuICAgICAgICAgICAga2V5ID0gcGFyc2VJbnQoa2V5LCAxMClcbiAgICAgICAgfVxuICAgICAgICBvYmouc3BsaWNlKGtleSwgMSlcbiAgICB9IGVsc2Uge1xuICAgICAgICBkaWUoOSlcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXM8Sz4ob2JqOiBPYnNlcnZhYmxlTWFwPEssIGFueT4sIGtleTogSyk6IGJvb2xlYW5cbmV4cG9ydCBmdW5jdGlvbiBoYXM8VD4ob2JqOiBPYnNlcnZhYmxlU2V0PFQ+LCBrZXk6IFQpOiBib29sZWFuXG5leHBvcnQgZnVuY3Rpb24gaGFzPFQ+KG9iajogSU9ic2VydmFibGVBcnJheTxUPiwgaW5kZXg6IG51bWJlcik6IGJvb2xlYW5cbmV4cG9ydCBmdW5jdGlvbiBoYXM8VCBleHRlbmRzIE9iamVjdD4ob2JqOiBULCBrZXk6IHN0cmluZyk6IGJvb2xlYW5cbmV4cG9ydCBmdW5jdGlvbiBoYXMob2JqOiBhbnksIGtleTogYW55KTogYm9vbGVhbiB7XG4gICAgaWYgKGlzT2JzZXJ2YWJsZU9iamVjdChvYmopKSB7XG4gICAgICAgIHJldHVybiAob2JqIGFzIGFueSBhcyBJSXNPYnNlcnZhYmxlT2JqZWN0KVskbW9ieF0uaGFzXyhrZXkpXG4gICAgfSBlbHNlIGlmIChpc09ic2VydmFibGVNYXAob2JqKSkge1xuICAgICAgICByZXR1cm4gb2JqLmhhcyhrZXkpXG4gICAgfSBlbHNlIGlmIChpc09ic2VydmFibGVTZXQob2JqKSkge1xuICAgICAgICByZXR1cm4gb2JqLmhhcyhrZXkpXG4gICAgfSBlbHNlIGlmIChpc09ic2VydmFibGVBcnJheShvYmopKSB7XG4gICAgICAgIHJldHVybiBrZXkgPj0gMCAmJiBrZXkgPCBvYmoubGVuZ3RoXG4gICAgfVxuICAgIGRpZSgxMClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldDxLLCBWPihvYmo6IE9ic2VydmFibGVNYXA8SywgVj4sIGtleTogSyk6IFYgfCB1bmRlZmluZWRcbmV4cG9ydCBmdW5jdGlvbiBnZXQ8VD4ob2JqOiBJT2JzZXJ2YWJsZUFycmF5PFQ+LCBpbmRleDogbnVtYmVyKTogVCB8IHVuZGVmaW5lZFxuZXhwb3J0IGZ1bmN0aW9uIGdldDxUIGV4dGVuZHMgT2JqZWN0PihvYmo6IFQsIGtleTogc3RyaW5nKTogYW55XG5leHBvcnQgZnVuY3Rpb24gZ2V0KG9iajogYW55LCBrZXk6IGFueSk6IGFueSB7XG4gICAgaWYgKCFoYXMob2JqLCBrZXkpKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWRcbiAgICB9XG4gICAgaWYgKGlzT2JzZXJ2YWJsZU9iamVjdChvYmopKSB7XG4gICAgICAgIHJldHVybiAob2JqIGFzIGFueSBhcyBJSXNPYnNlcnZhYmxlT2JqZWN0KVskbW9ieF0uZ2V0XyhrZXkpXG4gICAgfSBlbHNlIGlmIChpc09ic2VydmFibGVNYXAob2JqKSkge1xuICAgICAgICByZXR1cm4gb2JqLmdldChrZXkpXG4gICAgfSBlbHNlIGlmIChpc09ic2VydmFibGVBcnJheShvYmopKSB7XG4gICAgICAgIHJldHVybiBvYmpba2V5XVxuICAgIH1cbiAgICBkaWUoMTEpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhcGlEZWZpbmVQcm9wZXJ0eShvYmo6IE9iamVjdCwga2V5OiBQcm9wZXJ0eUtleSwgZGVzY3JpcHRvcjogUHJvcGVydHlEZXNjcmlwdG9yKSB7XG4gICAgaWYgKGlzT2JzZXJ2YWJsZU9iamVjdChvYmopKSB7XG4gICAgICAgIHJldHVybiAob2JqIGFzIGFueSBhcyBJSXNPYnNlcnZhYmxlT2JqZWN0KVskbW9ieF0uZGVmaW5lUHJvcGVydHlfKGtleSwgZGVzY3JpcHRvcilcbiAgICB9XG4gICAgZGllKDM5KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYXBpT3duS2V5cyhvYmo6IE9iamVjdCkge1xuICAgIGlmIChpc09ic2VydmFibGVPYmplY3Qob2JqKSkge1xuICAgICAgICByZXR1cm4gKG9iaiBhcyBhbnkgYXMgSUlzT2JzZXJ2YWJsZU9iamVjdClbJG1vYnhdLm93bktleXNfKClcbiAgICB9XG4gICAgZGllKDM4KVxufVxuIiwiaW1wb3J0IHtcbiAgICBpc09ic2VydmFibGUsXG4gICAgaXNPYnNlcnZhYmxlQXJyYXksXG4gICAgaXNPYnNlcnZhYmxlVmFsdWUsXG4gICAgaXNPYnNlcnZhYmxlTWFwLFxuICAgIGlzT2JzZXJ2YWJsZVNldCxcbiAgICBpc0NvbXB1dGVkVmFsdWUsXG4gICAgZGllLFxuICAgIGFwaU93bktleXMsXG4gICAgb2JqZWN0UHJvdG90eXBlXG59IGZyb20gXCIuLi9pbnRlcm5hbFwiXG5cbmZ1bmN0aW9uIGNhY2hlPEssIFY+KG1hcDogTWFwPGFueSwgYW55Piwga2V5OiBLLCB2YWx1ZTogVik6IFYge1xuICAgIG1hcC5zZXQoa2V5LCB2YWx1ZSlcbiAgICByZXR1cm4gdmFsdWVcbn1cblxuZnVuY3Rpb24gdG9KU0hlbHBlcihzb3VyY2UsIF9fYWxyZWFkeVNlZW46IE1hcDxhbnksIGFueT4pIHtcbiAgICBpZiAoXG4gICAgICAgIHNvdXJjZSA9PSBudWxsIHx8XG4gICAgICAgIHR5cGVvZiBzb3VyY2UgIT09IFwib2JqZWN0XCIgfHxcbiAgICAgICAgc291cmNlIGluc3RhbmNlb2YgRGF0ZSB8fFxuICAgICAgICAhaXNPYnNlcnZhYmxlKHNvdXJjZSlcbiAgICApIHtcbiAgICAgICAgcmV0dXJuIHNvdXJjZVxuICAgIH1cblxuICAgIGlmIChpc09ic2VydmFibGVWYWx1ZShzb3VyY2UpIHx8IGlzQ29tcHV0ZWRWYWx1ZShzb3VyY2UpKSB7XG4gICAgICAgIHJldHVybiB0b0pTSGVscGVyKHNvdXJjZS5nZXQoKSwgX19hbHJlYWR5U2VlbilcbiAgICB9XG4gICAgaWYgKF9fYWxyZWFkeVNlZW4uaGFzKHNvdXJjZSkpIHtcbiAgICAgICAgcmV0dXJuIF9fYWxyZWFkeVNlZW4uZ2V0KHNvdXJjZSlcbiAgICB9XG4gICAgaWYgKGlzT2JzZXJ2YWJsZUFycmF5KHNvdXJjZSkpIHtcbiAgICAgICAgY29uc3QgcmVzID0gY2FjaGUoX19hbHJlYWR5U2Vlbiwgc291cmNlLCBuZXcgQXJyYXkoc291cmNlLmxlbmd0aCkpXG4gICAgICAgIHNvdXJjZS5mb3JFYWNoKCh2YWx1ZSwgaWR4KSA9PiB7XG4gICAgICAgICAgICByZXNbaWR4XSA9IHRvSlNIZWxwZXIodmFsdWUsIF9fYWxyZWFkeVNlZW4pXG4gICAgICAgIH0pXG4gICAgICAgIHJldHVybiByZXNcbiAgICB9XG4gICAgaWYgKGlzT2JzZXJ2YWJsZVNldChzb3VyY2UpKSB7XG4gICAgICAgIGNvbnN0IHJlcyA9IGNhY2hlKF9fYWxyZWFkeVNlZW4sIHNvdXJjZSwgbmV3IFNldCgpKVxuICAgICAgICBzb3VyY2UuZm9yRWFjaCh2YWx1ZSA9PiB7XG4gICAgICAgICAgICByZXMuYWRkKHRvSlNIZWxwZXIodmFsdWUsIF9fYWxyZWFkeVNlZW4pKVxuICAgICAgICB9KVxuICAgICAgICByZXR1cm4gcmVzXG4gICAgfVxuICAgIGlmIChpc09ic2VydmFibGVNYXAoc291cmNlKSkge1xuICAgICAgICBjb25zdCByZXMgPSBjYWNoZShfX2FscmVhZHlTZWVuLCBzb3VyY2UsIG5ldyBNYXAoKSlcbiAgICAgICAgc291cmNlLmZvckVhY2goKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgICAgICAgIHJlcy5zZXQoa2V5LCB0b0pTSGVscGVyKHZhbHVlLCBfX2FscmVhZHlTZWVuKSlcbiAgICAgICAgfSlcbiAgICAgICAgcmV0dXJuIHJlc1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIG11c3QgYmUgb2JzZXJ2YWJsZSBvYmplY3RcbiAgICAgICAgY29uc3QgcmVzID0gY2FjaGUoX19hbHJlYWR5U2Vlbiwgc291cmNlLCB7fSlcbiAgICAgICAgYXBpT3duS2V5cyhzb3VyY2UpLmZvckVhY2goKGtleTogYW55KSA9PiB7XG4gICAgICAgICAgICBpZiAob2JqZWN0UHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwoc291cmNlLCBrZXkpKSB7XG4gICAgICAgICAgICAgICAgcmVzW2tleV0gPSB0b0pTSGVscGVyKHNvdXJjZVtrZXldLCBfX2FscmVhZHlTZWVuKVxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICByZXR1cm4gcmVzXG4gICAgfVxufVxuXG4vKipcbiAqIFJlY3Vyc2l2ZWx5IGNvbnZlcnRzIGFuIG9ic2VydmFibGUgdG8gaXQncyBub24tb2JzZXJ2YWJsZSBuYXRpdmUgY291bnRlcnBhcnQuXG4gKiBJdCBkb2VzIE5PVCByZWN1cnNlIGludG8gbm9uLW9ic2VydmFibGVzLCB0aGVzZSBhcmUgbGVmdCBhcyB0aGV5IGFyZSwgZXZlbiBpZiB0aGV5IGNvbnRhaW4gb2JzZXJ2YWJsZXMuXG4gKiBDb21wdXRlZCBhbmQgb3RoZXIgbm9uLWVudW1lcmFibGUgcHJvcGVydGllcyBhcmUgY29tcGxldGVseSBpZ25vcmVkLlxuICogQ29tcGxleCBzY2VuYXJpb3MgcmVxdWlyZSBjdXN0b20gc29sdXRpb24sIGVnIGltcGxlbWVudGluZyBgdG9KU09OYCBvciB1c2luZyBgc2VyaWFsaXpyYCBsaWIuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0b0pTPFQ+KHNvdXJjZTogVCwgb3B0aW9ucz86IGFueSk6IFQge1xuICAgIGlmIChfX0RFVl9fICYmIG9wdGlvbnMpIHtcbiAgICAgICAgZGllKFwidG9KUyBubyBsb25nZXIgc3VwcG9ydHMgb3B0aW9uc1wiKVxuICAgIH1cbiAgICByZXR1cm4gdG9KU0hlbHBlcihzb3VyY2UsIG5ldyBNYXAoKSlcbn1cbiIsImltcG9ydCB7IFRyYWNlTW9kZSwgZGllLCBnZXRBdG9tLCBnbG9iYWxTdGF0ZSB9IGZyb20gXCIuLi9pbnRlcm5hbFwiXG5cbmV4cG9ydCBmdW5jdGlvbiB0cmFjZSh0aGluZz86IGFueSwgcHJvcD86IHN0cmluZywgZW50ZXJCcmVha1BvaW50PzogYm9vbGVhbik6IHZvaWRcbmV4cG9ydCBmdW5jdGlvbiB0cmFjZSh0aGluZz86IGFueSwgZW50ZXJCcmVha1BvaW50PzogYm9vbGVhbik6IHZvaWRcbmV4cG9ydCBmdW5jdGlvbiB0cmFjZShlbnRlckJyZWFrUG9pbnQ/OiBib29sZWFuKTogdm9pZFxuZXhwb3J0IGZ1bmN0aW9uIHRyYWNlKC4uLmFyZ3M6IGFueVtdKTogdm9pZCB7XG4gICAgaWYgKCFfX0RFVl9fKSB7XG4gICAgICAgIGRpZShgdHJhY2UoKSBpcyBub3QgYXZhaWxhYmxlIGluIHByb2R1Y3Rpb24gYnVpbGRzYClcbiAgICB9XG4gICAgbGV0IGVudGVyQnJlYWtQb2ludCA9IGZhbHNlXG4gICAgaWYgKHR5cGVvZiBhcmdzW2FyZ3MubGVuZ3RoIC0gMV0gPT09IFwiYm9vbGVhblwiKSB7XG4gICAgICAgIGVudGVyQnJlYWtQb2ludCA9IGFyZ3MucG9wKClcbiAgICB9XG4gICAgY29uc3QgZGVyaXZhdGlvbiA9IGdldEF0b21Gcm9tQXJncyhhcmdzKVxuICAgIGlmICghZGVyaXZhdGlvbikge1xuICAgICAgICByZXR1cm4gZGllKFxuICAgICAgICAgICAgYCd0cmFjZShicmVhaz8pJyBjYW4gb25seSBiZSB1c2VkIGluc2lkZSBhIHRyYWNrZWQgY29tcHV0ZWQgdmFsdWUgb3IgYSBSZWFjdGlvbi4gQ29uc2lkZXIgcGFzc2luZyBpbiB0aGUgY29tcHV0ZWQgdmFsdWUgb3IgcmVhY3Rpb24gZXhwbGljaXRseWBcbiAgICAgICAgKVxuICAgIH1cbiAgICBpZiAoZGVyaXZhdGlvbi5pc1RyYWNpbmdfID09PSBUcmFjZU1vZGUuTk9ORSkge1xuICAgICAgICBjb25zb2xlLmxvZyhgW21vYngudHJhY2VdICcke2Rlcml2YXRpb24ubmFtZV99JyB0cmFjaW5nIGVuYWJsZWRgKVxuICAgIH1cbiAgICBkZXJpdmF0aW9uLmlzVHJhY2luZ18gPSBlbnRlckJyZWFrUG9pbnQgPyBUcmFjZU1vZGUuQlJFQUsgOiBUcmFjZU1vZGUuTE9HXG59XG5cbmZ1bmN0aW9uIGdldEF0b21Gcm9tQXJncyhhcmdzKTogYW55IHtcbiAgICBzd2l0Y2ggKGFyZ3MubGVuZ3RoKSB7XG4gICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgIHJldHVybiBnbG9iYWxTdGF0ZS50cmFja2luZ0Rlcml2YXRpb25cbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgcmV0dXJuIGdldEF0b20oYXJnc1swXSlcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgcmV0dXJuIGdldEF0b20oYXJnc1swXSwgYXJnc1sxXSlcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBlbmRCYXRjaCwgc3RhcnRCYXRjaCB9IGZyb20gXCIuLi9pbnRlcm5hbFwiXG5cbi8qKlxuICogRHVyaW5nIGEgdHJhbnNhY3Rpb24gbm8gdmlld3MgYXJlIHVwZGF0ZWQgdW50aWwgdGhlIGVuZCBvZiB0aGUgdHJhbnNhY3Rpb24uXG4gKiBUaGUgdHJhbnNhY3Rpb24gd2lsbCBiZSBydW4gc3luY2hyb25vdXNseSBub25ldGhlbGVzcy5cbiAqXG4gKiBAcGFyYW0gYWN0aW9uIGEgZnVuY3Rpb24gdGhhdCB1cGRhdGVzIHNvbWUgcmVhY3RpdmUgc3RhdGVcbiAqIEByZXR1cm5zIGFueSB2YWx1ZSB0aGF0IHdhcyByZXR1cm5lZCBieSB0aGUgJ2FjdGlvbicgcGFyYW1ldGVyLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNhY3Rpb248VD4oYWN0aW9uOiAoKSA9PiBULCB0aGlzQXJnID0gdW5kZWZpbmVkKTogVCB7XG4gICAgc3RhcnRCYXRjaCgpXG4gICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIGFjdGlvbi5hcHBseSh0aGlzQXJnKVxuICAgIH0gZmluYWxseSB7XG4gICAgICAgIGVuZEJhdGNoKClcbiAgICB9XG59XG4iLCJpbXBvcnQge1xuICAgICRtb2J4LFxuICAgIElJc09ic2VydmFibGVPYmplY3QsXG4gICAgT2JzZXJ2YWJsZU9iamVjdEFkbWluaXN0cmF0aW9uLFxuICAgIHdhcm5BYm91dFByb3h5UmVxdWlyZW1lbnQsXG4gICAgYXNzZXJ0UHJveGllcyxcbiAgICBkaWUsXG4gICAgaXNTdHJpbmdpc2gsXG4gICAgZ2xvYmFsU3RhdGUsXG4gICAgQ3JlYXRlT2JzZXJ2YWJsZU9wdGlvbnMsXG4gICAgYXNPYnNlcnZhYmxlT2JqZWN0XG59IGZyb20gXCIuLi9pbnRlcm5hbFwiXG5cbmZ1bmN0aW9uIGdldEFkbSh0YXJnZXQpOiBPYnNlcnZhYmxlT2JqZWN0QWRtaW5pc3RyYXRpb24ge1xuICAgIHJldHVybiB0YXJnZXRbJG1vYnhdXG59XG5cbi8vIE9wdGltaXphdGlvbjogd2UgZG9uJ3QgbmVlZCB0aGUgaW50ZXJtZWRpYXRlIG9iamVjdHMgYW5kIGNvdWxkIGhhdmUgYSBjb21wbGV0ZWx5IGN1c3RvbSBhZG1pbmlzdHJhdGlvbiBmb3IgRHluYW1pY09iamVjdHMsXG4vLyBhbmQgc2tpcCBlaXRoZXIgdGhlIGludGVybmFsIHZhbHVlcyBtYXAsIG9yIHRoZSBiYXNlIG9iamVjdCB3aXRoIGl0cyBwcm9wZXJ0eSBkZXNjcmlwdG9ycyFcbmNvbnN0IG9iamVjdFByb3h5VHJhcHM6IFByb3h5SGFuZGxlcjxhbnk+ID0ge1xuICAgIGhhcyh0YXJnZXQ6IElJc09ic2VydmFibGVPYmplY3QsIG5hbWU6IFByb3BlcnR5S2V5KTogYm9vbGVhbiB7XG4gICAgICAgIGlmIChfX0RFVl9fICYmIGdsb2JhbFN0YXRlLnRyYWNraW5nRGVyaXZhdGlvbikge1xuICAgICAgICAgICAgd2FybkFib3V0UHJveHlSZXF1aXJlbWVudChcbiAgICAgICAgICAgICAgICBcImRldGVjdCBuZXcgcHJvcGVydGllcyB1c2luZyB0aGUgJ2luJyBvcGVyYXRvci4gVXNlICdoYXMnIGZyb20gJ21vYngnIGluc3RlYWQuXCJcbiAgICAgICAgICAgIClcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZ2V0QWRtKHRhcmdldCkuaGFzXyhuYW1lKVxuICAgIH0sXG4gICAgZ2V0KHRhcmdldDogSUlzT2JzZXJ2YWJsZU9iamVjdCwgbmFtZTogUHJvcGVydHlLZXkpOiBhbnkge1xuICAgICAgICByZXR1cm4gZ2V0QWRtKHRhcmdldCkuZ2V0XyhuYW1lKVxuICAgIH0sXG4gICAgc2V0KHRhcmdldDogSUlzT2JzZXJ2YWJsZU9iamVjdCwgbmFtZTogUHJvcGVydHlLZXksIHZhbHVlOiBhbnkpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKCFpc1N0cmluZ2lzaChuYW1lKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH1cbiAgICAgICAgaWYgKF9fREVWX18gJiYgIWdldEFkbSh0YXJnZXQpLnZhbHVlc18uaGFzKG5hbWUpKSB7XG4gICAgICAgICAgICB3YXJuQWJvdXRQcm94eVJlcXVpcmVtZW50KFxuICAgICAgICAgICAgICAgIFwiYWRkIGEgbmV3IG9ic2VydmFibGUgcHJvcGVydHkgdGhyb3VnaCBkaXJlY3QgYXNzaWdubWVudC4gVXNlICdzZXQnIGZyb20gJ21vYngnIGluc3RlYWQuXCJcbiAgICAgICAgICAgIClcbiAgICAgICAgfVxuICAgICAgICAvLyBudWxsIChpbnRlcmNlcHRlZCkgLT4gdHJ1ZSAoc3VjY2VzcylcbiAgICAgICAgcmV0dXJuIGdldEFkbSh0YXJnZXQpLnNldF8obmFtZSwgdmFsdWUsIHRydWUpID8/IHRydWVcbiAgICB9LFxuICAgIGRlbGV0ZVByb3BlcnR5KHRhcmdldDogSUlzT2JzZXJ2YWJsZU9iamVjdCwgbmFtZTogUHJvcGVydHlLZXkpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKF9fREVWX18pIHtcbiAgICAgICAgICAgIHdhcm5BYm91dFByb3h5UmVxdWlyZW1lbnQoXG4gICAgICAgICAgICAgICAgXCJkZWxldGUgcHJvcGVydGllcyBmcm9tIGFuIG9ic2VydmFibGUgb2JqZWN0LiBVc2UgJ3JlbW92ZScgZnJvbSAnbW9ieCcgaW5zdGVhZC5cIlxuICAgICAgICAgICAgKVxuICAgICAgICB9XG4gICAgICAgIGlmICghaXNTdHJpbmdpc2gobmFtZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICB9XG4gICAgICAgIC8vIG51bGwgKGludGVyY2VwdGVkKSAtPiB0cnVlIChzdWNjZXNzKVxuICAgICAgICByZXR1cm4gZ2V0QWRtKHRhcmdldCkuZGVsZXRlXyhuYW1lLCB0cnVlKSA/PyB0cnVlXG4gICAgfSxcbiAgICBkZWZpbmVQcm9wZXJ0eShcbiAgICAgICAgdGFyZ2V0OiBJSXNPYnNlcnZhYmxlT2JqZWN0LFxuICAgICAgICBuYW1lOiBQcm9wZXJ0eUtleSxcbiAgICAgICAgZGVzY3JpcHRvcjogUHJvcGVydHlEZXNjcmlwdG9yXG4gICAgKTogYm9vbGVhbiB7XG4gICAgICAgIGlmIChfX0RFVl9fKSB7XG4gICAgICAgICAgICB3YXJuQWJvdXRQcm94eVJlcXVpcmVtZW50KFxuICAgICAgICAgICAgICAgIFwiZGVmaW5lIHByb3BlcnR5IG9uIGFuIG9ic2VydmFibGUgb2JqZWN0LiBVc2UgJ2RlZmluZVByb3BlcnR5JyBmcm9tICdtb2J4JyBpbnN0ZWFkLlwiXG4gICAgICAgICAgICApXG4gICAgICAgIH1cbiAgICAgICAgLy8gbnVsbCAoaW50ZXJjZXB0ZWQpIC0+IHRydWUgKHN1Y2Nlc3MpXG4gICAgICAgIHJldHVybiBnZXRBZG0odGFyZ2V0KS5kZWZpbmVQcm9wZXJ0eV8obmFtZSwgZGVzY3JpcHRvcikgPz8gdHJ1ZVxuICAgIH0sXG4gICAgb3duS2V5cyh0YXJnZXQ6IElJc09ic2VydmFibGVPYmplY3QpOiBBcnJheUxpa2U8c3RyaW5nIHwgc3ltYm9sPiB7XG4gICAgICAgIGlmIChfX0RFVl9fICYmIGdsb2JhbFN0YXRlLnRyYWNraW5nRGVyaXZhdGlvbikge1xuICAgICAgICAgICAgd2FybkFib3V0UHJveHlSZXF1aXJlbWVudChcbiAgICAgICAgICAgICAgICBcIml0ZXJhdGUga2V5cyB0byBkZXRlY3QgYWRkZWQgLyByZW1vdmVkIHByb3BlcnRpZXMuIFVzZSAna2V5cycgZnJvbSAnbW9ieCcgaW5zdGVhZC5cIlxuICAgICAgICAgICAgKVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBnZXRBZG0odGFyZ2V0KS5vd25LZXlzXygpXG4gICAgfSxcbiAgICBwcmV2ZW50RXh0ZW5zaW9ucyh0YXJnZXQpIHtcbiAgICAgICAgZGllKDEzKVxuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFzRHluYW1pY09ic2VydmFibGVPYmplY3QoXG4gICAgdGFyZ2V0OiBhbnksXG4gICAgb3B0aW9ucz86IENyZWF0ZU9ic2VydmFibGVPcHRpb25zXG4pOiBJSXNPYnNlcnZhYmxlT2JqZWN0IHtcbiAgICBhc3NlcnRQcm94aWVzKClcbiAgICB0YXJnZXQgPSBhc09ic2VydmFibGVPYmplY3QodGFyZ2V0LCBvcHRpb25zKVxuICAgIHJldHVybiAodGFyZ2V0WyRtb2J4XS5wcm94eV8gPz89IG5ldyBQcm94eSh0YXJnZXQsIG9iamVjdFByb3h5VHJhcHMpKVxufVxuIiwiaW1wb3J0IHsgTGFtYmRhLCBvbmNlLCB1bnRyYWNrZWRFbmQsIHVudHJhY2tlZFN0YXJ0LCBkaWUgfSBmcm9tIFwiLi4vaW50ZXJuYWxcIlxuXG5leHBvcnQgdHlwZSBJSW50ZXJjZXB0b3I8VD4gPSAoY2hhbmdlOiBUKSA9PiBUIHwgbnVsbFxuXG5leHBvcnQgaW50ZXJmYWNlIElJbnRlcmNlcHRhYmxlPFQ+IHtcbiAgICBpbnRlcmNlcHRvcnNfOiBJSW50ZXJjZXB0b3I8VD5bXSB8IHVuZGVmaW5lZFxufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFzSW50ZXJjZXB0b3JzKGludGVyY2VwdGFibGU6IElJbnRlcmNlcHRhYmxlPGFueT4pIHtcbiAgICByZXR1cm4gaW50ZXJjZXB0YWJsZS5pbnRlcmNlcHRvcnNfICE9PSB1bmRlZmluZWQgJiYgaW50ZXJjZXB0YWJsZS5pbnRlcmNlcHRvcnNfLmxlbmd0aCA+IDBcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVySW50ZXJjZXB0b3I8VD4oXG4gICAgaW50ZXJjZXB0YWJsZTogSUludGVyY2VwdGFibGU8VD4sXG4gICAgaGFuZGxlcjogSUludGVyY2VwdG9yPFQ+XG4pOiBMYW1iZGEge1xuICAgIGNvbnN0IGludGVyY2VwdG9ycyA9IGludGVyY2VwdGFibGUuaW50ZXJjZXB0b3JzXyB8fCAoaW50ZXJjZXB0YWJsZS5pbnRlcmNlcHRvcnNfID0gW10pXG4gICAgaW50ZXJjZXB0b3JzLnB1c2goaGFuZGxlcilcbiAgICByZXR1cm4gb25jZSgoKSA9PiB7XG4gICAgICAgIGNvbnN0IGlkeCA9IGludGVyY2VwdG9ycy5pbmRleE9mKGhhbmRsZXIpXG4gICAgICAgIGlmIChpZHggIT09IC0xKSB7XG4gICAgICAgICAgICBpbnRlcmNlcHRvcnMuc3BsaWNlKGlkeCwgMSlcbiAgICAgICAgfVxuICAgIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbnRlcmNlcHRDaGFuZ2U8VD4oXG4gICAgaW50ZXJjZXB0YWJsZTogSUludGVyY2VwdGFibGU8VCB8IG51bGw+LFxuICAgIGNoYW5nZTogVCB8IG51bGxcbik6IFQgfCBudWxsIHtcbiAgICBjb25zdCBwcmV2VSA9IHVudHJhY2tlZFN0YXJ0KClcbiAgICB0cnkge1xuICAgICAgICAvLyBJbnRlcmNlcHRvciBjYW4gbW9kaWZ5IHRoZSBhcnJheSwgY29weSBpdCB0byBhdm9pZCBjb25jdXJyZW50IG1vZGlmaWNhdGlvbiwgc2VlICMxOTUwXG4gICAgICAgIGNvbnN0IGludGVyY2VwdG9ycyA9IFsuLi4oaW50ZXJjZXB0YWJsZS5pbnRlcmNlcHRvcnNfIHx8IFtdKV1cbiAgICAgICAgZm9yIChsZXQgaSA9IDAsIGwgPSBpbnRlcmNlcHRvcnMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICBjaGFuZ2UgPSBpbnRlcmNlcHRvcnNbaV0oY2hhbmdlKVxuICAgICAgICAgICAgaWYgKGNoYW5nZSAmJiAhKGNoYW5nZSBhcyBhbnkpLnR5cGUpIHtcbiAgICAgICAgICAgICAgICBkaWUoMTQpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWNoYW5nZSkge1xuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNoYW5nZVxuICAgIH0gZmluYWxseSB7XG4gICAgICAgIHVudHJhY2tlZEVuZChwcmV2VSlcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBMYW1iZGEsIG9uY2UsIHVudHJhY2tlZEVuZCwgdW50cmFja2VkU3RhcnQgfSBmcm9tIFwiLi4vaW50ZXJuYWxcIlxuXG5leHBvcnQgaW50ZXJmYWNlIElMaXN0ZW5hYmxlIHtcbiAgICBjaGFuZ2VMaXN0ZW5lcnNfOiBGdW5jdGlvbltdIHwgdW5kZWZpbmVkXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNMaXN0ZW5lcnMobGlzdGVuYWJsZTogSUxpc3RlbmFibGUpIHtcbiAgICByZXR1cm4gbGlzdGVuYWJsZS5jaGFuZ2VMaXN0ZW5lcnNfICE9PSB1bmRlZmluZWQgJiYgbGlzdGVuYWJsZS5jaGFuZ2VMaXN0ZW5lcnNfLmxlbmd0aCA+IDBcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyTGlzdGVuZXIobGlzdGVuYWJsZTogSUxpc3RlbmFibGUsIGhhbmRsZXI6IEZ1bmN0aW9uKTogTGFtYmRhIHtcbiAgICBjb25zdCBsaXN0ZW5lcnMgPSBsaXN0ZW5hYmxlLmNoYW5nZUxpc3RlbmVyc18gfHwgKGxpc3RlbmFibGUuY2hhbmdlTGlzdGVuZXJzXyA9IFtdKVxuICAgIGxpc3RlbmVycy5wdXNoKGhhbmRsZXIpXG4gICAgcmV0dXJuIG9uY2UoKCkgPT4ge1xuICAgICAgICBjb25zdCBpZHggPSBsaXN0ZW5lcnMuaW5kZXhPZihoYW5kbGVyKVxuICAgICAgICBpZiAoaWR4ICE9PSAtMSkge1xuICAgICAgICAgICAgbGlzdGVuZXJzLnNwbGljZShpZHgsIDEpXG4gICAgICAgIH1cbiAgICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbm90aWZ5TGlzdGVuZXJzPFQ+KGxpc3RlbmFibGU6IElMaXN0ZW5hYmxlLCBjaGFuZ2U6IFQpIHtcbiAgICBjb25zdCBwcmV2VSA9IHVudHJhY2tlZFN0YXJ0KClcbiAgICBsZXQgbGlzdGVuZXJzID0gbGlzdGVuYWJsZS5jaGFuZ2VMaXN0ZW5lcnNfXG4gICAgaWYgKCFsaXN0ZW5lcnMpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGxpc3RlbmVycyA9IGxpc3RlbmVycy5zbGljZSgpXG4gICAgZm9yIChsZXQgaSA9IDAsIGwgPSBsaXN0ZW5lcnMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIGxpc3RlbmVyc1tpXShjaGFuZ2UpXG4gICAgfVxuICAgIHVudHJhY2tlZEVuZChwcmV2VSlcbn1cbiIsImltcG9ydCB7XG4gICAgJG1vYngsXG4gICAgYXNPYnNlcnZhYmxlT2JqZWN0LFxuICAgIEFubm90YXRpb25zTWFwLFxuICAgIGVuZEJhdGNoLFxuICAgIHN0YXJ0QmF0Y2gsXG4gICAgQ3JlYXRlT2JzZXJ2YWJsZU9wdGlvbnMsXG4gICAgT2JzZXJ2YWJsZU9iamVjdEFkbWluaXN0cmF0aW9uLFxuICAgIGNvbGxlY3RTdG9yZWRBbm5vdGF0aW9ucyxcbiAgICBpc1BsYWluT2JqZWN0LFxuICAgIGlzT2JzZXJ2YWJsZU9iamVjdCxcbiAgICBkaWUsXG4gICAgb3duS2V5cyxcbiAgICBleHRlbmRPYnNlcnZhYmxlLFxuICAgIGFkZEhpZGRlblByb3AsXG4gICAgc3RvcmVkQW5ub3RhdGlvbnNTeW1ib2xcbn0gZnJvbSBcIi4uL2ludGVybmFsXCJcblxuLy8gSGFjayBiYXNlZCBvbiBodHRwczovL2dpdGh1Yi5jb20vTWljcm9zb2Z0L1R5cGVTY3JpcHQvaXNzdWVzLzE0ODI5I2lzc3VlY29tbWVudC0zMjIyNjcwODlcbi8vIFdlIG5lZWQgdGhpcywgYmVjYXVzZSBvdGhlcndpc2UsIEFkZGl0aW9uYWxLZXlzIGlzIGdvaW5nIHRvIGJlIGluZmVycmVkIHRvIGJlIGFueVxuLy8gc2V0IG9mIHN1cGVyZmx1b3VzIGtleXMuIEJ1dCwgd2UgcmF0aGVyIHdhbnQgdG8gZ2V0IGEgY29tcGlsZSBlcnJvciB1bmxlc3MgQWRkaXRpb25hbEtleXMgaXNcbi8vIF9leHBsaWNpdHlfIHBhc3NlZCBhcyBnZW5lcmljIGFyZ3VtZW50XG4vLyBGaXhlczogaHR0cHM6Ly9naXRodWIuY29tL21vYnhqcy9tb2J4L2lzc3Vlcy8yMzI1I2lzc3VlY29tbWVudC02OTEwNzAwMjJcbnR5cGUgTm9JbmZlcjxUPiA9IFtUXVtUIGV4dGVuZHMgYW55ID8gMCA6IG5ldmVyXVxuXG5leHBvcnQgZnVuY3Rpb24gbWFrZU9ic2VydmFibGU8VCBleHRlbmRzIG9iamVjdCwgQWRkaXRpb25hbEtleXMgZXh0ZW5kcyBQcm9wZXJ0eUtleSA9IG5ldmVyPihcbiAgICB0YXJnZXQ6IFQsXG4gICAgYW5ub3RhdGlvbnM/OiBBbm5vdGF0aW9uc01hcDxULCBOb0luZmVyPEFkZGl0aW9uYWxLZXlzPj4sXG4gICAgb3B0aW9ucz86IENyZWF0ZU9ic2VydmFibGVPcHRpb25zXG4pOiBUIHtcbiAgICBjb25zdCBhZG06IE9ic2VydmFibGVPYmplY3RBZG1pbmlzdHJhdGlvbiA9IGFzT2JzZXJ2YWJsZU9iamVjdCh0YXJnZXQsIG9wdGlvbnMpWyRtb2J4XVxuICAgIHN0YXJ0QmF0Y2goKVxuICAgIHRyeSB7XG4gICAgICAgIGlmIChfX0RFVl9fICYmIGFubm90YXRpb25zICYmIHRhcmdldFtzdG9yZWRBbm5vdGF0aW9uc1N5bWJvbF0pIHtcbiAgICAgICAgICAgIGRpZShcbiAgICAgICAgICAgICAgICBgbWFrZU9ic2VydmFibGUgc2Vjb25kIGFyZyBtdXN0IGJlIG51bGxpc2ggd2hlbiB1c2luZyBkZWNvcmF0b3JzLiBNaXhpbmcgQGRlY29yYXRvciBzeW50YXggd2l0aCBhbm5vdGF0aW9ucyBpcyBub3Qgc3VwcG9ydGVkLmBcbiAgICAgICAgICAgIClcbiAgICAgICAgfVxuICAgICAgICAvLyBEZWZhdWx0IHRvIGRlY29yYXRvcnNcbiAgICAgICAgYW5ub3RhdGlvbnMgPz89IGNvbGxlY3RTdG9yZWRBbm5vdGF0aW9ucyh0YXJnZXQpXG5cbiAgICAgICAgLy8gQW5ub3RhdGVcbiAgICAgICAgb3duS2V5cyhhbm5vdGF0aW9ucykuZm9yRWFjaChrZXkgPT4gYWRtLm1ha2VfKGtleSwgYW5ub3RhdGlvbnMhW2tleV0pKVxuICAgIH0gZmluYWxseSB7XG4gICAgICAgIGVuZEJhdGNoKClcbiAgICB9XG4gICAgcmV0dXJuIHRhcmdldFxufVxuXG4vLyBwcm90b1trZXlzU3ltYm9sXSA9IG5ldyBTZXQ8UHJvcGVydHlLZXk+KClcbmNvbnN0IGtleXNTeW1ib2wgPSBTeW1ib2woXCJtb2J4LWtleXNcIilcblxuZXhwb3J0IGZ1bmN0aW9uIG1ha2VBdXRvT2JzZXJ2YWJsZTxUIGV4dGVuZHMgb2JqZWN0LCBBZGRpdGlvbmFsS2V5cyBleHRlbmRzIFByb3BlcnR5S2V5ID0gbmV2ZXI+KFxuICAgIHRhcmdldDogVCxcbiAgICBvdmVycmlkZXM/OiBBbm5vdGF0aW9uc01hcDxULCBOb0luZmVyPEFkZGl0aW9uYWxLZXlzPj4sXG4gICAgb3B0aW9ucz86IENyZWF0ZU9ic2VydmFibGVPcHRpb25zXG4pOiBUIHtcbiAgICBpZiAoX19ERVZfXykge1xuICAgICAgICBpZiAoIWlzUGxhaW5PYmplY3QodGFyZ2V0KSAmJiAhaXNQbGFpbk9iamVjdChPYmplY3QuZ2V0UHJvdG90eXBlT2YodGFyZ2V0KSkpIHtcbiAgICAgICAgICAgIGRpZShgJ21ha2VBdXRvT2JzZXJ2YWJsZScgY2FuIG9ubHkgYmUgdXNlZCBmb3IgY2xhc3NlcyB0aGF0IGRvbid0IGhhdmUgYSBzdXBlcmNsYXNzYClcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNPYnNlcnZhYmxlT2JqZWN0KHRhcmdldCkpIHtcbiAgICAgICAgICAgIGRpZShgbWFrZUF1dG9PYnNlcnZhYmxlIGNhbiBvbmx5IGJlIHVzZWQgb24gb2JqZWN0cyBub3QgYWxyZWFkeSBtYWRlIG9ic2VydmFibGVgKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gT3B0aW1pemF0aW9uOiBhdm9pZCB2aXNpdGluZyBwcm90b3NcbiAgICAvLyBBc3N1bWVzIHRoYXQgYW5ub3RhdGlvbi5tYWtlXy8uZXh0ZW5kXyB3b3JrcyB0aGUgc2FtZSBmb3IgcGxhaW4gb2JqZWN0c1xuICAgIGlmIChpc1BsYWluT2JqZWN0KHRhcmdldCkpIHtcbiAgICAgICAgcmV0dXJuIGV4dGVuZE9ic2VydmFibGUodGFyZ2V0LCB0YXJnZXQsIG92ZXJyaWRlcywgb3B0aW9ucylcbiAgICB9XG5cbiAgICBjb25zdCBhZG06IE9ic2VydmFibGVPYmplY3RBZG1pbmlzdHJhdGlvbiA9IGFzT2JzZXJ2YWJsZU9iamVjdCh0YXJnZXQsIG9wdGlvbnMpWyRtb2J4XVxuXG4gICAgLy8gT3B0aW1pemF0aW9uOiBjYWNoZSBrZXlzIG9uIHByb3RvXG4gICAgLy8gQXNzdW1lcyBtYWtlQXV0b09ic2VydmFibGUgY2FuIGJlIGNhbGxlZCBvbmx5IG9uY2UgcGVyIG9iamVjdCBhbmQgY2FuJ3QgYmUgdXNlZCBpbiBzdWJjbGFzc1xuICAgIGlmICghdGFyZ2V0W2tleXNTeW1ib2xdKSB7XG4gICAgICAgIGNvbnN0IHByb3RvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHRhcmdldClcbiAgICAgICAgY29uc3Qga2V5cyA9IG5ldyBTZXQoWy4uLm93bktleXModGFyZ2V0KSwgLi4ub3duS2V5cyhwcm90byldKVxuICAgICAgICBrZXlzLmRlbGV0ZShcImNvbnN0cnVjdG9yXCIpXG4gICAgICAgIGtleXMuZGVsZXRlKCRtb2J4KVxuICAgICAgICBhZGRIaWRkZW5Qcm9wKHByb3RvLCBrZXlzU3ltYm9sLCBrZXlzKVxuICAgIH1cblxuICAgIHN0YXJ0QmF0Y2goKVxuICAgIHRyeSB7XG4gICAgICAgIHRhcmdldFtrZXlzU3ltYm9sXS5mb3JFYWNoKGtleSA9PlxuICAgICAgICAgICAgYWRtLm1ha2VfKFxuICAgICAgICAgICAgICAgIGtleSxcbiAgICAgICAgICAgICAgICAvLyBtdXN0IHBhc3MgXCJ1bmRlZmluZWRcIiBmb3IgeyBrZXk6IHVuZGVmaW5lZCB9XG4gICAgICAgICAgICAgICAgIW92ZXJyaWRlcyA/IHRydWUgOiBrZXkgaW4gb3ZlcnJpZGVzID8gb3ZlcnJpZGVzW2tleV0gOiB0cnVlXG4gICAgICAgICAgICApXG4gICAgICAgIClcbiAgICB9IGZpbmFsbHkge1xuICAgICAgICBlbmRCYXRjaCgpXG4gICAgfVxuICAgIHJldHVybiB0YXJnZXRcbn1cbiIsImltcG9ydCB7XG4gICAgJG1vYngsXG4gICAgQXRvbSxcbiAgICBFTVBUWV9BUlJBWSxcbiAgICBJQXRvbSxcbiAgICBJRW5oYW5jZXIsXG4gICAgSUludGVyY2VwdGFibGUsXG4gICAgSUludGVyY2VwdG9yLFxuICAgIElMaXN0ZW5hYmxlLFxuICAgIExhbWJkYSxcbiAgICBhZGRIaWRkZW5GaW5hbFByb3AsXG4gICAgY2hlY2tJZlN0YXRlTW9kaWZpY2F0aW9uc0FyZUFsbG93ZWQsXG4gICAgY3JlYXRlSW5zdGFuY2VvZlByZWRpY2F0ZSxcbiAgICBnZXROZXh0SWQsXG4gICAgaGFzSW50ZXJjZXB0b3JzLFxuICAgIGhhc0xpc3RlbmVycyxcbiAgICBpbnRlcmNlcHRDaGFuZ2UsXG4gICAgaXNPYmplY3QsXG4gICAgaXNTcHlFbmFibGVkLFxuICAgIG5vdGlmeUxpc3RlbmVycyxcbiAgICByZWdpc3RlckludGVyY2VwdG9yLFxuICAgIHJlZ2lzdGVyTGlzdGVuZXIsXG4gICAgc3B5UmVwb3J0RW5kLFxuICAgIHNweVJlcG9ydFN0YXJ0LFxuICAgIGFsbG93U3RhdGVDaGFuZ2VzU3RhcnQsXG4gICAgYWxsb3dTdGF0ZUNoYW5nZXNFbmQsXG4gICAgYXNzZXJ0UHJveGllcyxcbiAgICByZXNlcnZlQXJyYXlCdWZmZXIsXG4gICAgaGFzUHJvcCxcbiAgICBkaWUsXG4gICAgZ2xvYmFsU3RhdGVcbn0gZnJvbSBcIi4uL2ludGVybmFsXCJcblxuY29uc3QgU1BMSUNFID0gXCJzcGxpY2VcIlxuZXhwb3J0IGNvbnN0IFVQREFURSA9IFwidXBkYXRlXCJcbmV4cG9ydCBjb25zdCBNQVhfU1BMSUNFX1NJWkUgPSAxMDAwMCAvLyBTZWUgZS5nLiBodHRwczovL2dpdGh1Yi5jb20vbW9ieGpzL21vYngvaXNzdWVzLzg1OVxuXG5leHBvcnQgaW50ZXJmYWNlIElPYnNlcnZhYmxlQXJyYXk8VCA9IGFueT4gZXh0ZW5kcyBBcnJheTxUPiB7XG4gICAgc3BsaWNlV2l0aEFycmF5KGluZGV4OiBudW1iZXIsIGRlbGV0ZUNvdW50PzogbnVtYmVyLCBuZXdJdGVtcz86IFRbXSk6IFRbXVxuICAgIGNsZWFyKCk6IFRbXVxuICAgIHJlcGxhY2UobmV3SXRlbXM6IFRbXSk6IFRbXVxuICAgIHJlbW92ZSh2YWx1ZTogVCk6IGJvb2xlYW5cbiAgICB0b0pTT04oKTogVFtdXG59XG5cbmludGVyZmFjZSBJQXJyYXlCYXNlQ2hhbmdlPFQ+IHtcbiAgICBvYmplY3Q6IElPYnNlcnZhYmxlQXJyYXk8VD5cbiAgICBvYnNlcnZhYmxlS2luZDogXCJhcnJheVwiXG4gICAgZGVidWdPYmplY3ROYW1lOiBzdHJpbmdcbiAgICBpbmRleDogbnVtYmVyXG59XG5cbmV4cG9ydCB0eXBlIElBcnJheURpZENoYW5nZTxUID0gYW55PiA9IElBcnJheVVwZGF0ZTxUPiB8IElBcnJheVNwbGljZTxUPlxuXG5leHBvcnQgaW50ZXJmYWNlIElBcnJheVVwZGF0ZTxUID0gYW55PiBleHRlbmRzIElBcnJheUJhc2VDaGFuZ2U8VD4ge1xuICAgIHR5cGU6IFwidXBkYXRlXCJcbiAgICBuZXdWYWx1ZTogVFxuICAgIG9sZFZhbHVlOiBUXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSUFycmF5U3BsaWNlPFQgPSBhbnk+IGV4dGVuZHMgSUFycmF5QmFzZUNoYW5nZTxUPiB7XG4gICAgdHlwZTogXCJzcGxpY2VcIlxuICAgIGFkZGVkOiBUW11cbiAgICBhZGRlZENvdW50OiBudW1iZXJcbiAgICByZW1vdmVkOiBUW11cbiAgICByZW1vdmVkQ291bnQ6IG51bWJlclxufVxuXG5leHBvcnQgaW50ZXJmYWNlIElBcnJheVdpbGxDaGFuZ2U8VCA9IGFueT4ge1xuICAgIG9iamVjdDogSU9ic2VydmFibGVBcnJheTxUPlxuICAgIGluZGV4OiBudW1iZXJcbiAgICB0eXBlOiBcInVwZGF0ZVwiXG4gICAgbmV3VmFsdWU6IFRcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJQXJyYXlXaWxsU3BsaWNlPFQgPSBhbnk+IHtcbiAgICBvYmplY3Q6IElPYnNlcnZhYmxlQXJyYXk8VD5cbiAgICBpbmRleDogbnVtYmVyXG4gICAgdHlwZTogXCJzcGxpY2VcIlxuICAgIGFkZGVkOiBUW11cbiAgICByZW1vdmVkQ291bnQ6IG51bWJlclxufVxuXG5jb25zdCBhcnJheVRyYXBzID0ge1xuICAgIGdldCh0YXJnZXQsIG5hbWUpIHtcbiAgICAgICAgY29uc3QgYWRtOiBPYnNlcnZhYmxlQXJyYXlBZG1pbmlzdHJhdGlvbiA9IHRhcmdldFskbW9ieF1cbiAgICAgICAgaWYgKG5hbWUgPT09ICRtb2J4KSB7XG4gICAgICAgICAgICByZXR1cm4gYWRtXG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5hbWUgPT09IFwibGVuZ3RoXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBhZG0uZ2V0QXJyYXlMZW5ndGhfKClcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIG5hbWUgPT09IFwic3RyaW5nXCIgJiYgIWlzTmFOKG5hbWUgYXMgYW55KSkge1xuICAgICAgICAgICAgcmV0dXJuIGFkbS5nZXRfKHBhcnNlSW50KG5hbWUpKVxuICAgICAgICB9XG4gICAgICAgIGlmIChoYXNQcm9wKGFycmF5RXh0ZW5zaW9ucywgbmFtZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBhcnJheUV4dGVuc2lvbnNbbmFtZV1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGFyZ2V0W25hbWVdXG4gICAgfSxcbiAgICBzZXQodGFyZ2V0LCBuYW1lLCB2YWx1ZSk6IGJvb2xlYW4ge1xuICAgICAgICBjb25zdCBhZG06IE9ic2VydmFibGVBcnJheUFkbWluaXN0cmF0aW9uID0gdGFyZ2V0WyRtb2J4XVxuICAgICAgICBpZiAobmFtZSA9PT0gXCJsZW5ndGhcIikge1xuICAgICAgICAgICAgYWRtLnNldEFycmF5TGVuZ3RoXyh2YWx1ZSlcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIG5hbWUgPT09IFwic3ltYm9sXCIgfHwgaXNOYU4obmFtZSkpIHtcbiAgICAgICAgICAgIHRhcmdldFtuYW1lXSA9IHZhbHVlXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBudW1lcmljIHN0cmluZ1xuICAgICAgICAgICAgYWRtLnNldF8ocGFyc2VJbnQobmFtZSksIHZhbHVlKVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgfSxcbiAgICBwcmV2ZW50RXh0ZW5zaW9ucygpIHtcbiAgICAgICAgZGllKDE1KVxuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIE9ic2VydmFibGVBcnJheUFkbWluaXN0cmF0aW9uXG4gICAgaW1wbGVtZW50cyBJSW50ZXJjZXB0YWJsZTxJQXJyYXlXaWxsQ2hhbmdlPGFueT4gfCBJQXJyYXlXaWxsU3BsaWNlPGFueT4+LCBJTGlzdGVuYWJsZVxue1xuICAgIGF0b21fOiBJQXRvbVxuICAgIHJlYWRvbmx5IHZhbHVlc186IGFueVtdID0gW10gLy8gdGhpcyBpcyB0aGUgcHJvcCB0aGF0IGdldHMgcHJveGllZCwgc28gY2FuJ3QgcmVwbGFjZSBpdCFcbiAgICBpbnRlcmNlcHRvcnNfXG4gICAgY2hhbmdlTGlzdGVuZXJzX1xuICAgIGVuaGFuY2VyXzogKG5ld1Y6IGFueSwgb2xkVjogYW55IHwgdW5kZWZpbmVkKSA9PiBhbnlcbiAgICBkZWhhbmNlcjogYW55XG4gICAgcHJveHlfITogSU9ic2VydmFibGVBcnJheTxhbnk+XG4gICAgbGFzdEtub3duTGVuZ3RoXyA9IDBcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBuYW1lID0gX19ERVZfXyA/IFwiT2JzZXJ2YWJsZUFycmF5QFwiICsgZ2V0TmV4dElkKCkgOiBcIk9ic2VydmFibGVBcnJheVwiLFxuICAgICAgICBlbmhhbmNlcjogSUVuaGFuY2VyPGFueT4sXG4gICAgICAgIHB1YmxpYyBvd25lZF86IGJvb2xlYW4sXG4gICAgICAgIHB1YmxpYyBsZWdhY3lNb2RlXzogYm9vbGVhblxuICAgICkge1xuICAgICAgICB0aGlzLmF0b21fID0gbmV3IEF0b20obmFtZSlcbiAgICAgICAgdGhpcy5lbmhhbmNlcl8gPSAobmV3Viwgb2xkVikgPT5cbiAgICAgICAgICAgIGVuaGFuY2VyKG5ld1YsIG9sZFYsIF9fREVWX18gPyBuYW1lICsgXCJbLi5dXCIgOiBcIk9ic2VydmFibGVBcnJheVsuLl1cIilcbiAgICB9XG5cbiAgICBkZWhhbmNlVmFsdWVfKHZhbHVlOiBhbnkpOiBhbnkge1xuICAgICAgICBpZiAodGhpcy5kZWhhbmNlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kZWhhbmNlcih2YWx1ZSlcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFsdWVcbiAgICB9XG5cbiAgICBkZWhhbmNlVmFsdWVzXyh2YWx1ZXM6IGFueVtdKTogYW55W10ge1xuICAgICAgICBpZiAodGhpcy5kZWhhbmNlciAhPT0gdW5kZWZpbmVkICYmIHZhbHVlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWVzLm1hcCh0aGlzLmRlaGFuY2VyKSBhcyBhbnlcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFsdWVzXG4gICAgfVxuXG4gICAgaW50ZXJjZXB0XyhoYW5kbGVyOiBJSW50ZXJjZXB0b3I8SUFycmF5V2lsbENoYW5nZTxhbnk+IHwgSUFycmF5V2lsbFNwbGljZTxhbnk+Pik6IExhbWJkYSB7XG4gICAgICAgIHJldHVybiByZWdpc3RlckludGVyY2VwdG9yPElBcnJheVdpbGxDaGFuZ2U8YW55PiB8IElBcnJheVdpbGxTcGxpY2U8YW55Pj4odGhpcywgaGFuZGxlcilcbiAgICB9XG5cbiAgICBvYnNlcnZlXyhcbiAgICAgICAgbGlzdGVuZXI6IChjaGFuZ2VEYXRhOiBJQXJyYXlEaWRDaGFuZ2U8YW55PikgPT4gdm9pZCxcbiAgICAgICAgZmlyZUltbWVkaWF0ZWx5ID0gZmFsc2VcbiAgICApOiBMYW1iZGEge1xuICAgICAgICBpZiAoZmlyZUltbWVkaWF0ZWx5KSB7XG4gICAgICAgICAgICBsaXN0ZW5lcig8SUFycmF5U3BsaWNlPGFueT4+e1xuICAgICAgICAgICAgICAgIG9ic2VydmFibGVLaW5kOiBcImFycmF5XCIsXG4gICAgICAgICAgICAgICAgb2JqZWN0OiB0aGlzLnByb3h5XyBhcyBhbnksXG4gICAgICAgICAgICAgICAgZGVidWdPYmplY3ROYW1lOiB0aGlzLmF0b21fLm5hbWVfLFxuICAgICAgICAgICAgICAgIHR5cGU6IFwic3BsaWNlXCIsXG4gICAgICAgICAgICAgICAgaW5kZXg6IDAsXG4gICAgICAgICAgICAgICAgYWRkZWQ6IHRoaXMudmFsdWVzXy5zbGljZSgpLFxuICAgICAgICAgICAgICAgIGFkZGVkQ291bnQ6IHRoaXMudmFsdWVzXy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgcmVtb3ZlZDogW10sXG4gICAgICAgICAgICAgICAgcmVtb3ZlZENvdW50OiAwXG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZWdpc3Rlckxpc3RlbmVyKHRoaXMsIGxpc3RlbmVyKVxuICAgIH1cblxuICAgIGdldEFycmF5TGVuZ3RoXygpOiBudW1iZXIge1xuICAgICAgICB0aGlzLmF0b21fLnJlcG9ydE9ic2VydmVkKClcbiAgICAgICAgcmV0dXJuIHRoaXMudmFsdWVzXy5sZW5ndGhcbiAgICB9XG5cbiAgICBzZXRBcnJheUxlbmd0aF8obmV3TGVuZ3RoOiBudW1iZXIpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBuZXdMZW5ndGggIT09IFwibnVtYmVyXCIgfHwgaXNOYU4obmV3TGVuZ3RoKSB8fCBuZXdMZW5ndGggPCAwKSB7XG4gICAgICAgICAgICBkaWUoXCJPdXQgb2YgcmFuZ2U6IFwiICsgbmV3TGVuZ3RoKVxuICAgICAgICB9XG4gICAgICAgIGxldCBjdXJyZW50TGVuZ3RoID0gdGhpcy52YWx1ZXNfLmxlbmd0aFxuICAgICAgICBpZiAobmV3TGVuZ3RoID09PSBjdXJyZW50TGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfSBlbHNlIGlmIChuZXdMZW5ndGggPiBjdXJyZW50TGVuZ3RoKSB7XG4gICAgICAgICAgICBjb25zdCBuZXdJdGVtcyA9IG5ldyBBcnJheShuZXdMZW5ndGggLSBjdXJyZW50TGVuZ3RoKVxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuZXdMZW5ndGggLSBjdXJyZW50TGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBuZXdJdGVtc1tpXSA9IHVuZGVmaW5lZFxuICAgICAgICAgICAgfSAvLyBObyBBcnJheS5maWxsIGV2ZXJ5d2hlcmUuLi5cbiAgICAgICAgICAgIHRoaXMuc3BsaWNlV2l0aEFycmF5XyhjdXJyZW50TGVuZ3RoLCAwLCBuZXdJdGVtcylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc3BsaWNlV2l0aEFycmF5XyhuZXdMZW5ndGgsIGN1cnJlbnRMZW5ndGggLSBuZXdMZW5ndGgpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB1cGRhdGVBcnJheUxlbmd0aF8ob2xkTGVuZ3RoOiBudW1iZXIsIGRlbHRhOiBudW1iZXIpIHtcbiAgICAgICAgaWYgKG9sZExlbmd0aCAhPT0gdGhpcy5sYXN0S25vd25MZW5ndGhfKSB7XG4gICAgICAgICAgICBkaWUoMTYpXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5sYXN0S25vd25MZW5ndGhfICs9IGRlbHRhXG4gICAgICAgIGlmICh0aGlzLmxlZ2FjeU1vZGVfICYmIGRlbHRhID4gMCkge1xuICAgICAgICAgICAgcmVzZXJ2ZUFycmF5QnVmZmVyKG9sZExlbmd0aCArIGRlbHRhICsgMSlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNwbGljZVdpdGhBcnJheV8oaW5kZXg6IG51bWJlciwgZGVsZXRlQ291bnQ/OiBudW1iZXIsIG5ld0l0ZW1zPzogYW55W10pOiBhbnlbXSB7XG4gICAgICAgIGNoZWNrSWZTdGF0ZU1vZGlmaWNhdGlvbnNBcmVBbGxvd2VkKHRoaXMuYXRvbV8pXG4gICAgICAgIGNvbnN0IGxlbmd0aCA9IHRoaXMudmFsdWVzXy5sZW5ndGhcblxuICAgICAgICBpZiAoaW5kZXggPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgaW5kZXggPSAwXG4gICAgICAgIH0gZWxzZSBpZiAoaW5kZXggPiBsZW5ndGgpIHtcbiAgICAgICAgICAgIGluZGV4ID0gbGVuZ3RoXG4gICAgICAgIH0gZWxzZSBpZiAoaW5kZXggPCAwKSB7XG4gICAgICAgICAgICBpbmRleCA9IE1hdGgubWF4KDAsIGxlbmd0aCArIGluZGV4KVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgIGRlbGV0ZUNvdW50ID0gbGVuZ3RoIC0gaW5kZXhcbiAgICAgICAgfSBlbHNlIGlmIChkZWxldGVDb3VudCA9PT0gdW5kZWZpbmVkIHx8IGRlbGV0ZUNvdW50ID09PSBudWxsKSB7XG4gICAgICAgICAgICBkZWxldGVDb3VudCA9IDBcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRlbGV0ZUNvdW50ID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oZGVsZXRlQ291bnQsIGxlbmd0aCAtIGluZGV4KSlcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChuZXdJdGVtcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBuZXdJdGVtcyA9IEVNUFRZX0FSUkFZXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaGFzSW50ZXJjZXB0b3JzKHRoaXMpKSB7XG4gICAgICAgICAgICBjb25zdCBjaGFuZ2UgPSBpbnRlcmNlcHRDaGFuZ2U8SUFycmF5V2lsbFNwbGljZTxhbnk+Pih0aGlzIGFzIGFueSwge1xuICAgICAgICAgICAgICAgIG9iamVjdDogdGhpcy5wcm94eV8gYXMgYW55LFxuICAgICAgICAgICAgICAgIHR5cGU6IFNQTElDRSxcbiAgICAgICAgICAgICAgICBpbmRleCxcbiAgICAgICAgICAgICAgICByZW1vdmVkQ291bnQ6IGRlbGV0ZUNvdW50LFxuICAgICAgICAgICAgICAgIGFkZGVkOiBuZXdJdGVtc1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGlmICghY2hhbmdlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEVNUFRZX0FSUkFZXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWxldGVDb3VudCA9IGNoYW5nZS5yZW1vdmVkQ291bnRcbiAgICAgICAgICAgIG5ld0l0ZW1zID0gY2hhbmdlLmFkZGVkXG4gICAgICAgIH1cblxuICAgICAgICBuZXdJdGVtcyA9XG4gICAgICAgICAgICBuZXdJdGVtcy5sZW5ndGggPT09IDAgPyBuZXdJdGVtcyA6IG5ld0l0ZW1zLm1hcCh2ID0+IHRoaXMuZW5oYW5jZXJfKHYsIHVuZGVmaW5lZCkpXG4gICAgICAgIGlmICh0aGlzLmxlZ2FjeU1vZGVfIHx8IF9fREVWX18pIHtcbiAgICAgICAgICAgIGNvbnN0IGxlbmd0aERlbHRhID0gbmV3SXRlbXMubGVuZ3RoIC0gZGVsZXRlQ291bnRcbiAgICAgICAgICAgIHRoaXMudXBkYXRlQXJyYXlMZW5ndGhfKGxlbmd0aCwgbGVuZ3RoRGVsdGEpIC8vIGNoZWNrcyBpZiBpbnRlcm5hbCBhcnJheSB3YXNuJ3QgbW9kaWZpZWRcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByZXMgPSB0aGlzLnNwbGljZUl0ZW1zSW50b1ZhbHVlc18oaW5kZXgsIGRlbGV0ZUNvdW50LCBuZXdJdGVtcylcblxuICAgICAgICBpZiAoZGVsZXRlQ291bnQgIT09IDAgfHwgbmV3SXRlbXMubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICB0aGlzLm5vdGlmeUFycmF5U3BsaWNlXyhpbmRleCwgbmV3SXRlbXMsIHJlcylcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5kZWhhbmNlVmFsdWVzXyhyZXMpXG4gICAgfVxuXG4gICAgc3BsaWNlSXRlbXNJbnRvVmFsdWVzXyhpbmRleDogbnVtYmVyLCBkZWxldGVDb3VudDogbnVtYmVyLCBuZXdJdGVtczogYW55W10pOiBhbnlbXSB7XG4gICAgICAgIGlmIChuZXdJdGVtcy5sZW5ndGggPCBNQVhfU1BMSUNFX1NJWkUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnZhbHVlc18uc3BsaWNlKGluZGV4LCBkZWxldGVDb3VudCwgLi4ubmV3SXRlbXMpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBUaGUgaXRlbXMgcmVtb3ZlZCBieSB0aGUgc3BsaWNlXG4gICAgICAgICAgICBjb25zdCByZXMgPSB0aGlzLnZhbHVlc18uc2xpY2UoaW5kZXgsIGluZGV4ICsgZGVsZXRlQ291bnQpXG4gICAgICAgICAgICAvLyBUaGUgaXRlbXMgdGhhdCB0aGF0IHNob3VsZCByZW1haW4gYXQgdGhlIGVuZCBvZiB0aGUgYXJyYXlcbiAgICAgICAgICAgIGxldCBvbGRJdGVtcyA9IHRoaXMudmFsdWVzXy5zbGljZShpbmRleCArIGRlbGV0ZUNvdW50KVxuICAgICAgICAgICAgLy8gTmV3IGxlbmd0aCBpcyB0aGUgcHJldmlvdXMgbGVuZ3RoICsgYWRkaXRpb24gY291bnQgLSBkZWxldGlvbiBjb3VudFxuICAgICAgICAgICAgdGhpcy52YWx1ZXNfLmxlbmd0aCArPSBuZXdJdGVtcy5sZW5ndGggLSBkZWxldGVDb3VudFxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuZXdJdGVtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHRoaXMudmFsdWVzX1tpbmRleCArIGldID0gbmV3SXRlbXNbaV1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb2xkSXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLnZhbHVlc19baW5kZXggKyBuZXdJdGVtcy5sZW5ndGggKyBpXSA9IG9sZEl0ZW1zW2ldXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBub3RpZnlBcnJheUNoaWxkVXBkYXRlXyhpbmRleDogbnVtYmVyLCBuZXdWYWx1ZTogYW55LCBvbGRWYWx1ZTogYW55KSB7XG4gICAgICAgIGNvbnN0IG5vdGlmeVNweSA9ICF0aGlzLm93bmVkXyAmJiBpc1NweUVuYWJsZWQoKVxuICAgICAgICBjb25zdCBub3RpZnkgPSBoYXNMaXN0ZW5lcnModGhpcylcbiAgICAgICAgY29uc3QgY2hhbmdlOiBJQXJyYXlEaWRDaGFuZ2UgfCBudWxsID1cbiAgICAgICAgICAgIG5vdGlmeSB8fCBub3RpZnlTcHlcbiAgICAgICAgICAgICAgICA/ICh7XG4gICAgICAgICAgICAgICAgICAgICAgb2JzZXJ2YWJsZUtpbmQ6IFwiYXJyYXlcIixcbiAgICAgICAgICAgICAgICAgICAgICBvYmplY3Q6IHRoaXMucHJveHlfLFxuICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFVQREFURSxcbiAgICAgICAgICAgICAgICAgICAgICBkZWJ1Z09iamVjdE5hbWU6IHRoaXMuYXRvbV8ubmFtZV8sXG4gICAgICAgICAgICAgICAgICAgICAgaW5kZXgsXG4gICAgICAgICAgICAgICAgICAgICAgbmV3VmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgb2xkVmFsdWVcbiAgICAgICAgICAgICAgICAgIH0gYXMgY29uc3QpXG4gICAgICAgICAgICAgICAgOiBudWxsXG5cbiAgICAgICAgLy8gVGhlIHJlYXNvbiB3aHkgdGhpcyBpcyBvbiByaWdodCBoYW5kIHNpZGUgaGVyZSAoYW5kIG5vdCBhYm92ZSksIGlzIHRoaXMgd2F5IHRoZSB1Z2xpZmllciB3aWxsIGRyb3AgaXQsIGJ1dCBpdCB3b24ndFxuICAgICAgICAvLyBjYXVzZSBhbnkgcnVudGltZSBvdmVyaGVhZCBpbiBkZXZlbG9wbWVudCBtb2RlIHdpdGhvdXQgTk9ERV9FTlYgc2V0LCB1bmxlc3Mgc3B5aW5nIGlzIGVuYWJsZWRcbiAgICAgICAgaWYgKF9fREVWX18gJiYgbm90aWZ5U3B5KSB7XG4gICAgICAgICAgICBzcHlSZXBvcnRTdGFydChjaGFuZ2UhKVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuYXRvbV8ucmVwb3J0Q2hhbmdlZCgpXG4gICAgICAgIGlmIChub3RpZnkpIHtcbiAgICAgICAgICAgIG5vdGlmeUxpc3RlbmVycyh0aGlzLCBjaGFuZ2UpXG4gICAgICAgIH1cbiAgICAgICAgaWYgKF9fREVWX18gJiYgbm90aWZ5U3B5KSB7XG4gICAgICAgICAgICBzcHlSZXBvcnRFbmQoKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgbm90aWZ5QXJyYXlTcGxpY2VfKGluZGV4OiBudW1iZXIsIGFkZGVkOiBhbnlbXSwgcmVtb3ZlZDogYW55W10pIHtcbiAgICAgICAgY29uc3Qgbm90aWZ5U3B5ID0gIXRoaXMub3duZWRfICYmIGlzU3B5RW5hYmxlZCgpXG4gICAgICAgIGNvbnN0IG5vdGlmeSA9IGhhc0xpc3RlbmVycyh0aGlzKVxuICAgICAgICBjb25zdCBjaGFuZ2U6IElBcnJheVNwbGljZSB8IG51bGwgPVxuICAgICAgICAgICAgbm90aWZ5IHx8IG5vdGlmeVNweVxuICAgICAgICAgICAgICAgID8gKHtcbiAgICAgICAgICAgICAgICAgICAgICBvYnNlcnZhYmxlS2luZDogXCJhcnJheVwiLFxuICAgICAgICAgICAgICAgICAgICAgIG9iamVjdDogdGhpcy5wcm94eV8sXG4gICAgICAgICAgICAgICAgICAgICAgZGVidWdPYmplY3ROYW1lOiB0aGlzLmF0b21fLm5hbWVfLFxuICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFNQTElDRSxcbiAgICAgICAgICAgICAgICAgICAgICBpbmRleCxcbiAgICAgICAgICAgICAgICAgICAgICByZW1vdmVkLFxuICAgICAgICAgICAgICAgICAgICAgIGFkZGVkLFxuICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZWRDb3VudDogcmVtb3ZlZC5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgICAgYWRkZWRDb3VudDogYWRkZWQubGVuZ3RoXG4gICAgICAgICAgICAgICAgICB9IGFzIGNvbnN0KVxuICAgICAgICAgICAgICAgIDogbnVsbFxuXG4gICAgICAgIGlmIChfX0RFVl9fICYmIG5vdGlmeVNweSkge1xuICAgICAgICAgICAgc3B5UmVwb3J0U3RhcnQoY2hhbmdlISlcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmF0b21fLnJlcG9ydENoYW5nZWQoKVxuICAgICAgICAvLyBjb25mb3JtOiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9BcnJheS9vYnNlcnZlXG4gICAgICAgIGlmIChub3RpZnkpIHtcbiAgICAgICAgICAgIG5vdGlmeUxpc3RlbmVycyh0aGlzLCBjaGFuZ2UpXG4gICAgICAgIH1cbiAgICAgICAgaWYgKF9fREVWX18gJiYgbm90aWZ5U3B5KSB7XG4gICAgICAgICAgICBzcHlSZXBvcnRFbmQoKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0XyhpbmRleDogbnVtYmVyKTogYW55IHwgdW5kZWZpbmVkIHtcbiAgICAgICAgaWYgKHRoaXMubGVnYWN5TW9kZV8gJiYgaW5kZXggPj0gdGhpcy52YWx1ZXNfLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgICAgICAgIF9fREVWX19cbiAgICAgICAgICAgICAgICAgICAgPyBgW21vYnguYXJyYXldIEF0dGVtcHQgdG8gcmVhZCBhbiBhcnJheSBpbmRleCAoJHtpbmRleH0pIHRoYXQgaXMgb3V0IG9mIGJvdW5kcyAoJHt0aGlzLnZhbHVlc18ubGVuZ3RofSkuIFBsZWFzZSBjaGVjayBsZW5ndGggZmlyc3QuIE91dCBvZiBib3VuZCBpbmRpY2VzIHdpbGwgbm90IGJlIHRyYWNrZWQgYnkgTW9iWGBcbiAgICAgICAgICAgICAgICAgICAgOiBgW21vYnhdIE91dCBvZiBib3VuZHMgcmVhZDogJHtpbmRleH1gXG4gICAgICAgICAgICApXG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5hdG9tXy5yZXBvcnRPYnNlcnZlZCgpXG4gICAgICAgIHJldHVybiB0aGlzLmRlaGFuY2VWYWx1ZV8odGhpcy52YWx1ZXNfW2luZGV4XSlcbiAgICB9XG5cbiAgICBzZXRfKGluZGV4OiBudW1iZXIsIG5ld1ZhbHVlOiBhbnkpIHtcbiAgICAgICAgY29uc3QgdmFsdWVzID0gdGhpcy52YWx1ZXNfXG4gICAgICAgIGlmICh0aGlzLmxlZ2FjeU1vZGVfICYmIGluZGV4ID4gdmFsdWVzLmxlbmd0aCkge1xuICAgICAgICAgICAgLy8gb3V0IG9mIGJvdW5kc1xuICAgICAgICAgICAgZGllKDE3LCBpbmRleCwgdmFsdWVzLmxlbmd0aClcbiAgICAgICAgfVxuICAgICAgICBpZiAoaW5kZXggPCB2YWx1ZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAvLyB1cGRhdGUgYXQgaW5kZXggaW4gcmFuZ2VcbiAgICAgICAgICAgIGNoZWNrSWZTdGF0ZU1vZGlmaWNhdGlvbnNBcmVBbGxvd2VkKHRoaXMuYXRvbV8pXG4gICAgICAgICAgICBjb25zdCBvbGRWYWx1ZSA9IHZhbHVlc1tpbmRleF1cbiAgICAgICAgICAgIGlmIChoYXNJbnRlcmNlcHRvcnModGhpcykpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjaGFuZ2UgPSBpbnRlcmNlcHRDaGFuZ2U8SUFycmF5V2lsbENoYW5nZTxhbnk+Pih0aGlzIGFzIGFueSwge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBVUERBVEUsXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdDogdGhpcy5wcm94eV8gYXMgYW55LCAvLyBzaW5jZSBcInRoaXNcIiBpcyB0aGUgcmVhbCBhcnJheSB3ZSBuZWVkIHRvIHBhc3MgaXRzIHByb3h5XG4gICAgICAgICAgICAgICAgICAgIGluZGV4LFxuICAgICAgICAgICAgICAgICAgICBuZXdWYWx1ZVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgaWYgKCFjaGFuZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG5ld1ZhbHVlID0gY2hhbmdlLm5ld1ZhbHVlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBuZXdWYWx1ZSA9IHRoaXMuZW5oYW5jZXJfKG5ld1ZhbHVlLCBvbGRWYWx1ZSlcbiAgICAgICAgICAgIGNvbnN0IGNoYW5nZWQgPSBuZXdWYWx1ZSAhPT0gb2xkVmFsdWVcbiAgICAgICAgICAgIGlmIChjaGFuZ2VkKSB7XG4gICAgICAgICAgICAgICAgdmFsdWVzW2luZGV4XSA9IG5ld1ZhbHVlXG4gICAgICAgICAgICAgICAgdGhpcy5ub3RpZnlBcnJheUNoaWxkVXBkYXRlXyhpbmRleCwgbmV3VmFsdWUsIG9sZFZhbHVlKVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gRm9yIG91dCBvZiBib3VuZCBpbmRleCwgd2UgZG9uJ3QgY3JlYXRlIGFuIGFjdHVhbCBzcGFyc2UgYXJyYXksXG4gICAgICAgICAgICAvLyBidXQgcmF0aGVyIGZpbGwgdGhlIGhvbGVzIHdpdGggdW5kZWZpbmVkIChzYW1lIGFzIHNldEFycmF5TGVuZ3RoXykuXG4gICAgICAgICAgICAvLyBUaGlzIGNvdWxkIGJlIGNvbnNpZGVyZWQgYSBidWcuXG4gICAgICAgICAgICBjb25zdCBuZXdJdGVtcyA9IG5ldyBBcnJheShpbmRleCArIDEgLSB2YWx1ZXMubGVuZ3RoKVxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuZXdJdGVtcy5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgICAgICAgICAgICBuZXdJdGVtc1tpXSA9IHVuZGVmaW5lZFxuICAgICAgICAgICAgfSAvLyBObyBBcnJheS5maWxsIGV2ZXJ5d2hlcmUuLi5cbiAgICAgICAgICAgIG5ld0l0ZW1zW25ld0l0ZW1zLmxlbmd0aCAtIDFdID0gbmV3VmFsdWVcbiAgICAgICAgICAgIHRoaXMuc3BsaWNlV2l0aEFycmF5Xyh2YWx1ZXMubGVuZ3RoLCAwLCBuZXdJdGVtcylcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU9ic2VydmFibGVBcnJheTxUPihcbiAgICBpbml0aWFsVmFsdWVzOiBUW10gfCB1bmRlZmluZWQsXG4gICAgZW5oYW5jZXI6IElFbmhhbmNlcjxUPixcbiAgICBuYW1lID0gX19ERVZfXyA/IFwiT2JzZXJ2YWJsZUFycmF5QFwiICsgZ2V0TmV4dElkKCkgOiBcIk9ic2VydmFibGVBcnJheVwiLFxuICAgIG93bmVkID0gZmFsc2Vcbik6IElPYnNlcnZhYmxlQXJyYXk8VD4ge1xuICAgIGFzc2VydFByb3hpZXMoKVxuICAgIGNvbnN0IGFkbSA9IG5ldyBPYnNlcnZhYmxlQXJyYXlBZG1pbmlzdHJhdGlvbihuYW1lLCBlbmhhbmNlciwgb3duZWQsIGZhbHNlKVxuICAgIGFkZEhpZGRlbkZpbmFsUHJvcChhZG0udmFsdWVzXywgJG1vYngsIGFkbSlcbiAgICBjb25zdCBwcm94eSA9IG5ldyBQcm94eShhZG0udmFsdWVzXywgYXJyYXlUcmFwcykgYXMgYW55XG4gICAgYWRtLnByb3h5XyA9IHByb3h5XG4gICAgaWYgKGluaXRpYWxWYWx1ZXMgJiYgaW5pdGlhbFZhbHVlcy5sZW5ndGgpIHtcbiAgICAgICAgY29uc3QgcHJldiA9IGFsbG93U3RhdGVDaGFuZ2VzU3RhcnQodHJ1ZSlcbiAgICAgICAgYWRtLnNwbGljZVdpdGhBcnJheV8oMCwgMCwgaW5pdGlhbFZhbHVlcylcbiAgICAgICAgYWxsb3dTdGF0ZUNoYW5nZXNFbmQocHJldilcbiAgICB9XG4gICAgcmV0dXJuIHByb3h5XG59XG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZVxuZXhwb3J0IHZhciBhcnJheUV4dGVuc2lvbnMgPSB7XG4gICAgY2xlYXIoKTogYW55W10ge1xuICAgICAgICByZXR1cm4gdGhpcy5zcGxpY2UoMClcbiAgICB9LFxuXG4gICAgcmVwbGFjZShuZXdJdGVtczogYW55W10pIHtcbiAgICAgICAgY29uc3QgYWRtOiBPYnNlcnZhYmxlQXJyYXlBZG1pbmlzdHJhdGlvbiA9IHRoaXNbJG1vYnhdXG4gICAgICAgIHJldHVybiBhZG0uc3BsaWNlV2l0aEFycmF5XygwLCBhZG0udmFsdWVzXy5sZW5ndGgsIG5ld0l0ZW1zKVxuICAgIH0sXG5cbiAgICAvLyBVc2VkIGJ5IEpTT04uc3RyaW5naWZ5XG4gICAgdG9KU09OKCk6IGFueVtdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2xpY2UoKVxuICAgIH0sXG5cbiAgICAvKlxuICAgICAqIGZ1bmN0aW9ucyB0aGF0IGRvIGFsdGVyIHRoZSBpbnRlcm5hbCBzdHJ1Y3R1cmUgb2YgdGhlIGFycmF5LCAoYmFzZWQgb24gbGliLmVzNi5kLnRzKVxuICAgICAqIHNpbmNlIHRoZXNlIGZ1bmN0aW9ucyBhbHRlciB0aGUgaW5uZXIgc3RydWN0dXJlIG9mIHRoZSBhcnJheSwgdGhlIGhhdmUgc2lkZSBlZmZlY3RzLlxuICAgICAqIEJlY2F1c2UgdGhlIGhhdmUgc2lkZSBlZmZlY3RzLCB0aGV5IHNob3VsZCBub3QgYmUgdXNlZCBpbiBjb21wdXRlZCBmdW5jdGlvbixcbiAgICAgKiBhbmQgZm9yIHRoYXQgcmVhc29uIHRoZSBkbyBub3QgY2FsbCBkZXBlbmRlbmN5U3RhdGUubm90aWZ5T2JzZXJ2ZWRcbiAgICAgKi9cbiAgICBzcGxpY2UoaW5kZXg6IG51bWJlciwgZGVsZXRlQ291bnQ/OiBudW1iZXIsIC4uLm5ld0l0ZW1zOiBhbnlbXSk6IGFueVtdIHtcbiAgICAgICAgY29uc3QgYWRtOiBPYnNlcnZhYmxlQXJyYXlBZG1pbmlzdHJhdGlvbiA9IHRoaXNbJG1vYnhdXG4gICAgICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgIHJldHVybiBbXVxuICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgIHJldHVybiBhZG0uc3BsaWNlV2l0aEFycmF5XyhpbmRleClcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICByZXR1cm4gYWRtLnNwbGljZVdpdGhBcnJheV8oaW5kZXgsIGRlbGV0ZUNvdW50KVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhZG0uc3BsaWNlV2l0aEFycmF5XyhpbmRleCwgZGVsZXRlQ291bnQsIG5ld0l0ZW1zKVxuICAgIH0sXG5cbiAgICBzcGxpY2VXaXRoQXJyYXkoaW5kZXg6IG51bWJlciwgZGVsZXRlQ291bnQ/OiBudW1iZXIsIG5ld0l0ZW1zPzogYW55W10pOiBhbnlbXSB7XG4gICAgICAgIHJldHVybiAodGhpc1skbW9ieF0gYXMgT2JzZXJ2YWJsZUFycmF5QWRtaW5pc3RyYXRpb24pLnNwbGljZVdpdGhBcnJheV8oXG4gICAgICAgICAgICBpbmRleCxcbiAgICAgICAgICAgIGRlbGV0ZUNvdW50LFxuICAgICAgICAgICAgbmV3SXRlbXNcbiAgICAgICAgKVxuICAgIH0sXG5cbiAgICBwdXNoKC4uLml0ZW1zOiBhbnlbXSk6IG51bWJlciB7XG4gICAgICAgIGNvbnN0IGFkbTogT2JzZXJ2YWJsZUFycmF5QWRtaW5pc3RyYXRpb24gPSB0aGlzWyRtb2J4XVxuICAgICAgICBhZG0uc3BsaWNlV2l0aEFycmF5XyhhZG0udmFsdWVzXy5sZW5ndGgsIDAsIGl0ZW1zKVxuICAgICAgICByZXR1cm4gYWRtLnZhbHVlc18ubGVuZ3RoXG4gICAgfSxcblxuICAgIHBvcCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3BsaWNlKE1hdGgubWF4KHRoaXNbJG1vYnhdLnZhbHVlc18ubGVuZ3RoIC0gMSwgMCksIDEpWzBdXG4gICAgfSxcblxuICAgIHNoaWZ0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zcGxpY2UoMCwgMSlbMF1cbiAgICB9LFxuXG4gICAgdW5zaGlmdCguLi5pdGVtczogYW55W10pOiBudW1iZXIge1xuICAgICAgICBjb25zdCBhZG06IE9ic2VydmFibGVBcnJheUFkbWluaXN0cmF0aW9uID0gdGhpc1skbW9ieF1cbiAgICAgICAgYWRtLnNwbGljZVdpdGhBcnJheV8oMCwgMCwgaXRlbXMpXG4gICAgICAgIHJldHVybiBhZG0udmFsdWVzXy5sZW5ndGhcbiAgICB9LFxuXG4gICAgcmV2ZXJzZSgpOiBhbnlbXSB7XG4gICAgICAgIC8vIHJldmVyc2UgYnkgZGVmYXVsdCBtdXRhdGVzIGluIHBsYWNlIGJlZm9yZSByZXR1cm5pbmcgdGhlIHJlc3VsdFxuICAgICAgICAvLyB3aGljaCBtYWtlcyBpdCBib3RoIGEgJ2Rlcml2YXRpb24nIGFuZCBhICdtdXRhdGlvbicuXG4gICAgICAgIGlmIChnbG9iYWxTdGF0ZS50cmFja2luZ0Rlcml2YXRpb24pIHtcbiAgICAgICAgICAgIGRpZSgzNywgXCJyZXZlcnNlXCIpXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yZXBsYWNlKHRoaXMuc2xpY2UoKS5yZXZlcnNlKCkpXG4gICAgICAgIHJldHVybiB0aGlzXG4gICAgfSxcblxuICAgIHNvcnQoKTogYW55W10ge1xuICAgICAgICAvLyBzb3J0IGJ5IGRlZmF1bHQgbXV0YXRlcyBpbiBwbGFjZSBiZWZvcmUgcmV0dXJuaW5nIHRoZSByZXN1bHRcbiAgICAgICAgLy8gd2hpY2ggZ29lcyBhZ2FpbnN0IGFsbCBnb29kIHByYWN0aWNlcy4gTGV0J3Mgbm90IGNoYW5nZSB0aGUgYXJyYXkgaW4gcGxhY2UhXG4gICAgICAgIGlmIChnbG9iYWxTdGF0ZS50cmFja2luZ0Rlcml2YXRpb24pIHtcbiAgICAgICAgICAgIGRpZSgzNywgXCJzb3J0XCIpXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY29weSA9IHRoaXMuc2xpY2UoKVxuICAgICAgICBjb3B5LnNvcnQuYXBwbHkoY29weSwgYXJndW1lbnRzKVxuICAgICAgICB0aGlzLnJlcGxhY2UoY29weSlcbiAgICAgICAgcmV0dXJuIHRoaXNcbiAgICB9LFxuXG4gICAgcmVtb3ZlKHZhbHVlOiBhbnkpOiBib29sZWFuIHtcbiAgICAgICAgY29uc3QgYWRtOiBPYnNlcnZhYmxlQXJyYXlBZG1pbmlzdHJhdGlvbiA9IHRoaXNbJG1vYnhdXG4gICAgICAgIGNvbnN0IGlkeCA9IGFkbS5kZWhhbmNlVmFsdWVzXyhhZG0udmFsdWVzXykuaW5kZXhPZih2YWx1ZSlcbiAgICAgICAgaWYgKGlkeCA+IC0xKSB7XG4gICAgICAgICAgICB0aGlzLnNwbGljZShpZHgsIDEpXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbn1cblxuLyoqXG4gKiBXcmFwIGZ1bmN0aW9uIGZyb20gcHJvdG90eXBlXG4gKiBXaXRob3V0IHRoaXMsIGV2ZXJ5dGhpbmcgd29ya3MgYXMgd2VsbCwgYnV0IHRoaXMgd29ya3NcbiAqIGZhc3RlciBhcyBldmVyeXRoaW5nIHdvcmtzIG9uIHVucHJveGllZCB2YWx1ZXNcbiAqL1xuYWRkQXJyYXlFeHRlbnNpb24oXCJjb25jYXRcIiwgc2ltcGxlRnVuYylcbmFkZEFycmF5RXh0ZW5zaW9uKFwiZmxhdFwiLCBzaW1wbGVGdW5jKVxuYWRkQXJyYXlFeHRlbnNpb24oXCJpbmNsdWRlc1wiLCBzaW1wbGVGdW5jKVxuYWRkQXJyYXlFeHRlbnNpb24oXCJpbmRleE9mXCIsIHNpbXBsZUZ1bmMpXG5hZGRBcnJheUV4dGVuc2lvbihcImpvaW5cIiwgc2ltcGxlRnVuYylcbmFkZEFycmF5RXh0ZW5zaW9uKFwibGFzdEluZGV4T2ZcIiwgc2ltcGxlRnVuYylcbmFkZEFycmF5RXh0ZW5zaW9uKFwic2xpY2VcIiwgc2ltcGxlRnVuYylcbmFkZEFycmF5RXh0ZW5zaW9uKFwidG9TdHJpbmdcIiwgc2ltcGxlRnVuYylcbmFkZEFycmF5RXh0ZW5zaW9uKFwidG9Mb2NhbGVTdHJpbmdcIiwgc2ltcGxlRnVuYylcbi8vIG1hcFxuYWRkQXJyYXlFeHRlbnNpb24oXCJldmVyeVwiLCBtYXBMaWtlRnVuYylcbmFkZEFycmF5RXh0ZW5zaW9uKFwiZmlsdGVyXCIsIG1hcExpa2VGdW5jKVxuYWRkQXJyYXlFeHRlbnNpb24oXCJmaW5kXCIsIG1hcExpa2VGdW5jKVxuYWRkQXJyYXlFeHRlbnNpb24oXCJmaW5kSW5kZXhcIiwgbWFwTGlrZUZ1bmMpXG5hZGRBcnJheUV4dGVuc2lvbihcImZsYXRNYXBcIiwgbWFwTGlrZUZ1bmMpXG5hZGRBcnJheUV4dGVuc2lvbihcImZvckVhY2hcIiwgbWFwTGlrZUZ1bmMpXG5hZGRBcnJheUV4dGVuc2lvbihcIm1hcFwiLCBtYXBMaWtlRnVuYylcbmFkZEFycmF5RXh0ZW5zaW9uKFwic29tZVwiLCBtYXBMaWtlRnVuYylcbi8vIHJlZHVjZVxuYWRkQXJyYXlFeHRlbnNpb24oXCJyZWR1Y2VcIiwgcmVkdWNlTGlrZUZ1bmMpXG5hZGRBcnJheUV4dGVuc2lvbihcInJlZHVjZVJpZ2h0XCIsIHJlZHVjZUxpa2VGdW5jKVxuXG5mdW5jdGlvbiBhZGRBcnJheUV4dGVuc2lvbihmdW5jTmFtZSwgZnVuY0ZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIEFycmF5LnByb3RvdHlwZVtmdW5jTmFtZV0gPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICBhcnJheUV4dGVuc2lvbnNbZnVuY05hbWVdID0gZnVuY0ZhY3RvcnkoZnVuY05hbWUpXG4gICAgfVxufVxuXG4vLyBSZXBvcnQgYW5kIGRlbGVnYXRlIHRvIGRlaGFuY2VkIGFycmF5XG5mdW5jdGlvbiBzaW1wbGVGdW5jKGZ1bmNOYW1lKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY29uc3QgYWRtOiBPYnNlcnZhYmxlQXJyYXlBZG1pbmlzdHJhdGlvbiA9IHRoaXNbJG1vYnhdXG4gICAgICAgIGFkbS5hdG9tXy5yZXBvcnRPYnNlcnZlZCgpXG4gICAgICAgIGNvbnN0IGRlaGFuY2VkVmFsdWVzID0gYWRtLmRlaGFuY2VWYWx1ZXNfKGFkbS52YWx1ZXNfKVxuICAgICAgICByZXR1cm4gZGVoYW5jZWRWYWx1ZXNbZnVuY05hbWVdLmFwcGx5KGRlaGFuY2VkVmFsdWVzLCBhcmd1bWVudHMpXG4gICAgfVxufVxuXG4vLyBNYWtlIHN1cmUgY2FsbGJhY2tzIHJlY2lldmUgY29ycmVjdCBhcnJheSBhcmcgIzIzMjZcbmZ1bmN0aW9uIG1hcExpa2VGdW5jKGZ1bmNOYW1lKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChjYWxsYmFjaywgdGhpc0FyZykge1xuICAgICAgICBjb25zdCBhZG06IE9ic2VydmFibGVBcnJheUFkbWluaXN0cmF0aW9uID0gdGhpc1skbW9ieF1cbiAgICAgICAgYWRtLmF0b21fLnJlcG9ydE9ic2VydmVkKClcbiAgICAgICAgY29uc3QgZGVoYW5jZWRWYWx1ZXMgPSBhZG0uZGVoYW5jZVZhbHVlc18oYWRtLnZhbHVlc18pXG4gICAgICAgIHJldHVybiBkZWhhbmNlZFZhbHVlc1tmdW5jTmFtZV0oKGVsZW1lbnQsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2suY2FsbCh0aGlzQXJnLCBlbGVtZW50LCBpbmRleCwgdGhpcylcbiAgICAgICAgfSlcbiAgICB9XG59XG5cbi8vIE1ha2Ugc3VyZSBjYWxsYmFja3MgcmVjaWV2ZSBjb3JyZWN0IGFycmF5IGFyZyAjMjMyNlxuZnVuY3Rpb24gcmVkdWNlTGlrZUZ1bmMoZnVuY05hbWUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICBjb25zdCBhZG06IE9ic2VydmFibGVBcnJheUFkbWluaXN0cmF0aW9uID0gdGhpc1skbW9ieF1cbiAgICAgICAgYWRtLmF0b21fLnJlcG9ydE9ic2VydmVkKClcbiAgICAgICAgY29uc3QgZGVoYW5jZWRWYWx1ZXMgPSBhZG0uZGVoYW5jZVZhbHVlc18oYWRtLnZhbHVlc18pXG4gICAgICAgIC8vICMyNDMyIC0gcmVkdWNlIGJlaGF2aW9yIGRlcGVuZHMgb24gYXJndW1lbnRzLmxlbmd0aFxuICAgICAgICBjb25zdCBjYWxsYmFjayA9IGFyZ3VtZW50c1swXVxuICAgICAgICBhcmd1bWVudHNbMF0gPSAoYWNjdW11bGF0b3IsIGN1cnJlbnRWYWx1ZSwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhhY2N1bXVsYXRvciwgY3VycmVudFZhbHVlLCBpbmRleCwgdGhpcylcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGVoYW5jZWRWYWx1ZXNbZnVuY05hbWVdLmFwcGx5KGRlaGFuY2VkVmFsdWVzLCBhcmd1bWVudHMpXG4gICAgfVxufVxuXG5jb25zdCBpc09ic2VydmFibGVBcnJheUFkbWluaXN0cmF0aW9uID0gY3JlYXRlSW5zdGFuY2VvZlByZWRpY2F0ZShcbiAgICBcIk9ic2VydmFibGVBcnJheUFkbWluaXN0cmF0aW9uXCIsXG4gICAgT2JzZXJ2YWJsZUFycmF5QWRtaW5pc3RyYXRpb25cbilcblxuZXhwb3J0IGZ1bmN0aW9uIGlzT2JzZXJ2YWJsZUFycmF5KHRoaW5nKTogdGhpbmcgaXMgSU9ic2VydmFibGVBcnJheTxhbnk+IHtcbiAgICByZXR1cm4gaXNPYmplY3QodGhpbmcpICYmIGlzT2JzZXJ2YWJsZUFycmF5QWRtaW5pc3RyYXRpb24odGhpbmdbJG1vYnhdKVxufVxuIiwiaW1wb3J0IHtcbiAgICAkbW9ieCxcbiAgICBJRW5oYW5jZXIsXG4gICAgSUludGVyY2VwdGFibGUsXG4gICAgSUludGVyY2VwdG9yLFxuICAgIElMaXN0ZW5hYmxlLFxuICAgIExhbWJkYSxcbiAgICBPYnNlcnZhYmxlVmFsdWUsXG4gICAgY2hlY2tJZlN0YXRlTW9kaWZpY2F0aW9uc0FyZUFsbG93ZWQsXG4gICAgY3JlYXRlQXRvbSxcbiAgICBjcmVhdGVJbnN0YW5jZW9mUHJlZGljYXRlLFxuICAgIGRlZXBFbmhhbmNlcixcbiAgICBnZXROZXh0SWQsXG4gICAgZ2V0UGxhaW5PYmplY3RLZXlzLFxuICAgIGhhc0ludGVyY2VwdG9ycyxcbiAgICBoYXNMaXN0ZW5lcnMsXG4gICAgaW50ZXJjZXB0Q2hhbmdlLFxuICAgIGlzRVM2TWFwLFxuICAgIGlzUGxhaW5PYmplY3QsXG4gICAgaXNTcHlFbmFibGVkLFxuICAgIG1ha2VJdGVyYWJsZSxcbiAgICBub3RpZnlMaXN0ZW5lcnMsXG4gICAgcmVmZXJlbmNlRW5oYW5jZXIsXG4gICAgcmVnaXN0ZXJJbnRlcmNlcHRvcixcbiAgICByZWdpc3Rlckxpc3RlbmVyLFxuICAgIHNweVJlcG9ydEVuZCxcbiAgICBzcHlSZXBvcnRTdGFydCxcbiAgICBzdHJpbmdpZnlLZXksXG4gICAgdHJhbnNhY3Rpb24sXG4gICAgdW50cmFja2VkLFxuICAgIG9uQmVjb21lVW5vYnNlcnZlZCxcbiAgICBnbG9iYWxTdGF0ZSxcbiAgICBkaWUsXG4gICAgaXNGdW5jdGlvbixcbiAgICBVUERBVEUsXG4gICAgSUF0b20sXG4gICAgUHVyZVNweUV2ZW50LFxuICAgIGFsbG93U3RhdGVDaGFuZ2VzXG59IGZyb20gXCIuLi9pbnRlcm5hbFwiXG5cbmV4cG9ydCBpbnRlcmZhY2UgSUtleVZhbHVlTWFwPFYgPSBhbnk+IHtcbiAgICBba2V5OiBzdHJpbmddOiBWXG59XG5cbmV4cG9ydCB0eXBlIElNYXBFbnRyeTxLID0gYW55LCBWID0gYW55PiA9IFtLLCBWXVxuZXhwb3J0IHR5cGUgSVJlYWRvbmx5TWFwRW50cnk8SyA9IGFueSwgViA9IGFueT4gPSByZWFkb25seSBbSywgVl1cbmV4cG9ydCB0eXBlIElNYXBFbnRyaWVzPEsgPSBhbnksIFYgPSBhbnk+ID0gSU1hcEVudHJ5PEssIFY+W11cbmV4cG9ydCB0eXBlIElSZWFkb25seU1hcEVudHJpZXM8SyA9IGFueSwgViA9IGFueT4gPSBJUmVhZG9ubHlNYXBFbnRyeTxLLCBWPltdXG5cbmV4cG9ydCB0eXBlIElNYXBEaWRDaGFuZ2U8SyA9IGFueSwgViA9IGFueT4gPSB7IG9ic2VydmFibGVLaW5kOiBcIm1hcFwiOyBkZWJ1Z09iamVjdE5hbWU6IHN0cmluZyB9ICYgKFxuICAgIHwge1xuICAgICAgICAgIG9iamVjdDogT2JzZXJ2YWJsZU1hcDxLLCBWPlxuICAgICAgICAgIG5hbWU6IEsgLy8gYWN0dWFsIHRoZSBrZXkgb3IgaW5kZXgsIGJ1dCB0aGlzIGlzIGJhc2VkIG9uIHRoZSBhbmNpZW50IC5vYnNlcnZlIHByb3Bvc2FsIGZvciBjb25zaXN0ZW5jeVxuICAgICAgICAgIHR5cGU6IFwidXBkYXRlXCJcbiAgICAgICAgICBuZXdWYWx1ZTogVlxuICAgICAgICAgIG9sZFZhbHVlOiBWXG4gICAgICB9XG4gICAgfCB7XG4gICAgICAgICAgb2JqZWN0OiBPYnNlcnZhYmxlTWFwPEssIFY+XG4gICAgICAgICAgbmFtZTogS1xuICAgICAgICAgIHR5cGU6IFwiYWRkXCJcbiAgICAgICAgICBuZXdWYWx1ZTogVlxuICAgICAgfVxuICAgIHwge1xuICAgICAgICAgIG9iamVjdDogT2JzZXJ2YWJsZU1hcDxLLCBWPlxuICAgICAgICAgIG5hbWU6IEtcbiAgICAgICAgICB0eXBlOiBcImRlbGV0ZVwiXG4gICAgICAgICAgb2xkVmFsdWU6IFZcbiAgICAgIH1cbilcblxuZXhwb3J0IGludGVyZmFjZSBJTWFwV2lsbENoYW5nZTxLID0gYW55LCBWID0gYW55PiB7XG4gICAgb2JqZWN0OiBPYnNlcnZhYmxlTWFwPEssIFY+XG4gICAgdHlwZTogXCJ1cGRhdGVcIiB8IFwiYWRkXCIgfCBcImRlbGV0ZVwiXG4gICAgbmFtZTogS1xuICAgIG5ld1ZhbHVlPzogVlxufVxuXG5jb25zdCBPYnNlcnZhYmxlTWFwTWFya2VyID0ge31cblxuZXhwb3J0IGNvbnN0IEFERCA9IFwiYWRkXCJcbmV4cG9ydCBjb25zdCBERUxFVEUgPSBcImRlbGV0ZVwiXG5cbmV4cG9ydCB0eXBlIElPYnNlcnZhYmxlTWFwSW5pdGlhbFZhbHVlczxLID0gYW55LCBWID0gYW55PiA9XG4gICAgfCBJTWFwRW50cmllczxLLCBWPlxuICAgIHwgSVJlYWRvbmx5TWFwRW50cmllczxLLCBWPlxuICAgIHwgSUtleVZhbHVlTWFwPFY+XG4gICAgfCBNYXA8SywgVj5cblxuLy8ganVzdCBleHRlbmQgTWFwPyBTZWUgYWxzbyBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9uZXN0aGFydXMvMTNiNGQ3NGYyZWY0YTJmNDM1N2RiZDNmYzIzYzFlNTRcbi8vIEJ1dDogaHR0cHM6Ly9naXRodWIuY29tL21vYnhqcy9tb2J4L2lzc3Vlcy8xNTU2XG5leHBvcnQgY2xhc3MgT2JzZXJ2YWJsZU1hcDxLID0gYW55LCBWID0gYW55PlxuICAgIGltcGxlbWVudHMgTWFwPEssIFY+LCBJSW50ZXJjZXB0YWJsZTxJTWFwV2lsbENoYW5nZTxLLCBWPj4sIElMaXN0ZW5hYmxlIHtcbiAgICBbJG1vYnhdID0gT2JzZXJ2YWJsZU1hcE1hcmtlclxuICAgIGRhdGFfOiBNYXA8SywgT2JzZXJ2YWJsZVZhbHVlPFY+PlxuICAgIGhhc01hcF86IE1hcDxLLCBPYnNlcnZhYmxlVmFsdWU8Ym9vbGVhbj4+IC8vIGhhc01hcCwgbm90IGhhc2hNYXAgPi0pLlxuICAgIGtleXNBdG9tXzogSUF0b21cbiAgICBpbnRlcmNlcHRvcnNfXG4gICAgY2hhbmdlTGlzdGVuZXJzX1xuICAgIGRlaGFuY2VyOiBhbnlcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBpbml0aWFsRGF0YT86IElPYnNlcnZhYmxlTWFwSW5pdGlhbFZhbHVlczxLLCBWPixcbiAgICAgICAgcHVibGljIGVuaGFuY2VyXzogSUVuaGFuY2VyPFY+ID0gZGVlcEVuaGFuY2VyLFxuICAgICAgICBwdWJsaWMgbmFtZV8gPSBfX0RFVl9fID8gXCJPYnNlcnZhYmxlTWFwQFwiICsgZ2V0TmV4dElkKCkgOiBcIk9ic2VydmFibGVNYXBcIlxuICAgICkge1xuICAgICAgICBpZiAoIWlzRnVuY3Rpb24oTWFwKSkge1xuICAgICAgICAgICAgZGllKDE4KVxuICAgICAgICB9XG4gICAgICAgIHRoaXMua2V5c0F0b21fID0gY3JlYXRlQXRvbShfX0RFVl9fID8gYCR7dGhpcy5uYW1lX30ua2V5cygpYCA6IFwiT2JzZXJ2YWJsZU1hcC5rZXlzKClcIilcbiAgICAgICAgdGhpcy5kYXRhXyA9IG5ldyBNYXAoKVxuICAgICAgICB0aGlzLmhhc01hcF8gPSBuZXcgTWFwKClcbiAgICAgICAgYWxsb3dTdGF0ZUNoYW5nZXModHJ1ZSwgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5tZXJnZShpbml0aWFsRGF0YSlcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICBwcml2YXRlIGhhc18oa2V5OiBLKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLmRhdGFfLmhhcyhrZXkpXG4gICAgfVxuXG4gICAgaGFzKGtleTogSyk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoIWdsb2JhbFN0YXRlLnRyYWNraW5nRGVyaXZhdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaGFzXyhrZXkpXG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZW50cnkgPSB0aGlzLmhhc01hcF8uZ2V0KGtleSlcbiAgICAgICAgaWYgKCFlbnRyeSkge1xuICAgICAgICAgICAgY29uc3QgbmV3RW50cnkgPSAoZW50cnkgPSBuZXcgT2JzZXJ2YWJsZVZhbHVlKFxuICAgICAgICAgICAgICAgIHRoaXMuaGFzXyhrZXkpLFxuICAgICAgICAgICAgICAgIHJlZmVyZW5jZUVuaGFuY2VyLFxuICAgICAgICAgICAgICAgIF9fREVWX18gPyBgJHt0aGlzLm5hbWVffS4ke3N0cmluZ2lmeUtleShrZXkpfT9gIDogXCJPYnNlcnZhYmxlTWFwLmtleT9cIixcbiAgICAgICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgKSlcbiAgICAgICAgICAgIHRoaXMuaGFzTWFwXy5zZXQoa2V5LCBuZXdFbnRyeSlcbiAgICAgICAgICAgIG9uQmVjb21lVW5vYnNlcnZlZChuZXdFbnRyeSwgKCkgPT4gdGhpcy5oYXNNYXBfLmRlbGV0ZShrZXkpKVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGVudHJ5LmdldCgpXG4gICAgfVxuXG4gICAgc2V0KGtleTogSywgdmFsdWU6IFYpIHtcbiAgICAgICAgY29uc3QgaGFzS2V5ID0gdGhpcy5oYXNfKGtleSlcbiAgICAgICAgaWYgKGhhc0ludGVyY2VwdG9ycyh0aGlzKSkge1xuICAgICAgICAgICAgY29uc3QgY2hhbmdlID0gaW50ZXJjZXB0Q2hhbmdlPElNYXBXaWxsQ2hhbmdlPEssIFY+Pih0aGlzLCB7XG4gICAgICAgICAgICAgICAgdHlwZTogaGFzS2V5ID8gVVBEQVRFIDogQURELFxuICAgICAgICAgICAgICAgIG9iamVjdDogdGhpcyxcbiAgICAgICAgICAgICAgICBuZXdWYWx1ZTogdmFsdWUsXG4gICAgICAgICAgICAgICAgbmFtZToga2V5XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgaWYgKCFjaGFuZ2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpc1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFsdWUgPSBjaGFuZ2UubmV3VmFsdWUhXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGhhc0tleSkge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVWYWx1ZV8oa2V5LCB2YWx1ZSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYWRkVmFsdWVfKGtleSwgdmFsdWUpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXNcbiAgICB9XG5cbiAgICBkZWxldGUoa2V5OiBLKTogYm9vbGVhbiB7XG4gICAgICAgIGNoZWNrSWZTdGF0ZU1vZGlmaWNhdGlvbnNBcmVBbGxvd2VkKHRoaXMua2V5c0F0b21fKVxuICAgICAgICBpZiAoaGFzSW50ZXJjZXB0b3JzKHRoaXMpKSB7XG4gICAgICAgICAgICBjb25zdCBjaGFuZ2UgPSBpbnRlcmNlcHRDaGFuZ2U8SU1hcFdpbGxDaGFuZ2U8SywgVj4+KHRoaXMsIHtcbiAgICAgICAgICAgICAgICB0eXBlOiBERUxFVEUsXG4gICAgICAgICAgICAgICAgb2JqZWN0OiB0aGlzLFxuICAgICAgICAgICAgICAgIG5hbWU6IGtleVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGlmICghY2hhbmdlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuaGFzXyhrZXkpKSB7XG4gICAgICAgICAgICBjb25zdCBub3RpZnlTcHkgPSBpc1NweUVuYWJsZWQoKVxuICAgICAgICAgICAgY29uc3Qgbm90aWZ5ID0gaGFzTGlzdGVuZXJzKHRoaXMpXG4gICAgICAgICAgICBjb25zdCBjaGFuZ2U6IElNYXBEaWRDaGFuZ2U8SywgVj4gfCBudWxsID1cbiAgICAgICAgICAgICAgICBub3RpZnkgfHwgbm90aWZ5U3B5XG4gICAgICAgICAgICAgICAgICAgID8ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBvYnNlcnZhYmxlS2luZDogXCJtYXBcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZGVidWdPYmplY3ROYW1lOiB0aGlzLm5hbWVfLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBERUxFVEUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdDogdGhpcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgb2xkVmFsdWU6ICg8YW55PnRoaXMuZGF0YV8uZ2V0KGtleSkpLnZhbHVlXyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZToga2V5XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICA6IG51bGxcblxuICAgICAgICAgICAgaWYgKF9fREVWX18gJiYgbm90aWZ5U3B5KSB7XG4gICAgICAgICAgICAgICAgc3B5UmVwb3J0U3RhcnQoY2hhbmdlISBhcyBQdXJlU3B5RXZlbnQpXG4gICAgICAgICAgICB9IC8vIFRPRE8gZml4IHR5cGVcbiAgICAgICAgICAgIHRyYW5zYWN0aW9uKCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmtleXNBdG9tXy5yZXBvcnRDaGFuZ2VkKClcbiAgICAgICAgICAgICAgICB0aGlzLmhhc01hcF8uZ2V0KGtleSk/LnNldE5ld1ZhbHVlXyhmYWxzZSlcbiAgICAgICAgICAgICAgICBjb25zdCBvYnNlcnZhYmxlID0gdGhpcy5kYXRhXy5nZXQoa2V5KSFcbiAgICAgICAgICAgICAgICBvYnNlcnZhYmxlLnNldE5ld1ZhbHVlXyh1bmRlZmluZWQgYXMgYW55KVxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YV8uZGVsZXRlKGtleSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBpZiAobm90aWZ5KSB7XG4gICAgICAgICAgICAgICAgbm90aWZ5TGlzdGVuZXJzKHRoaXMsIGNoYW5nZSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChfX0RFVl9fICYmIG5vdGlmeVNweSkge1xuICAgICAgICAgICAgICAgIHNweVJlcG9ydEVuZCgpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIHByaXZhdGUgdXBkYXRlVmFsdWVfKGtleTogSywgbmV3VmFsdWU6IFYgfCB1bmRlZmluZWQpIHtcbiAgICAgICAgY29uc3Qgb2JzZXJ2YWJsZSA9IHRoaXMuZGF0YV8uZ2V0KGtleSkhXG4gICAgICAgIG5ld1ZhbHVlID0gKG9ic2VydmFibGUgYXMgYW55KS5wcmVwYXJlTmV3VmFsdWVfKG5ld1ZhbHVlKSBhcyBWXG4gICAgICAgIGlmIChuZXdWYWx1ZSAhPT0gZ2xvYmFsU3RhdGUuVU5DSEFOR0VEKSB7XG4gICAgICAgICAgICBjb25zdCBub3RpZnlTcHkgPSBpc1NweUVuYWJsZWQoKVxuICAgICAgICAgICAgY29uc3Qgbm90aWZ5ID0gaGFzTGlzdGVuZXJzKHRoaXMpXG4gICAgICAgICAgICBjb25zdCBjaGFuZ2U6IElNYXBEaWRDaGFuZ2U8SywgVj4gfCBudWxsID1cbiAgICAgICAgICAgICAgICBub3RpZnkgfHwgbm90aWZ5U3B5XG4gICAgICAgICAgICAgICAgICAgID8ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBvYnNlcnZhYmxlS2luZDogXCJtYXBcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZGVidWdPYmplY3ROYW1lOiB0aGlzLm5hbWVfLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBVUERBVEUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdDogdGhpcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgb2xkVmFsdWU6IChvYnNlcnZhYmxlIGFzIGFueSkudmFsdWVfLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBrZXksXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1ZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICA6IG51bGxcbiAgICAgICAgICAgIGlmIChfX0RFVl9fICYmIG5vdGlmeVNweSkge1xuICAgICAgICAgICAgICAgIHNweVJlcG9ydFN0YXJ0KGNoYW5nZSEgYXMgUHVyZVNweUV2ZW50KVxuICAgICAgICAgICAgfSAvLyBUT0RPIGZpeCB0eXBlXG4gICAgICAgICAgICBvYnNlcnZhYmxlLnNldE5ld1ZhbHVlXyhuZXdWYWx1ZSBhcyBWKVxuICAgICAgICAgICAgaWYgKG5vdGlmeSkge1xuICAgICAgICAgICAgICAgIG5vdGlmeUxpc3RlbmVycyh0aGlzLCBjaGFuZ2UpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoX19ERVZfXyAmJiBub3RpZnlTcHkpIHtcbiAgICAgICAgICAgICAgICBzcHlSZXBvcnRFbmQoKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhZGRWYWx1ZV8oa2V5OiBLLCBuZXdWYWx1ZTogVikge1xuICAgICAgICBjaGVja0lmU3RhdGVNb2RpZmljYXRpb25zQXJlQWxsb3dlZCh0aGlzLmtleXNBdG9tXylcbiAgICAgICAgdHJhbnNhY3Rpb24oKCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgb2JzZXJ2YWJsZSA9IG5ldyBPYnNlcnZhYmxlVmFsdWUoXG4gICAgICAgICAgICAgICAgbmV3VmFsdWUsXG4gICAgICAgICAgICAgICAgdGhpcy5lbmhhbmNlcl8sXG4gICAgICAgICAgICAgICAgX19ERVZfXyA/IGAke3RoaXMubmFtZV99LiR7c3RyaW5naWZ5S2V5KGtleSl9YCA6IFwiT2JzZXJ2YWJsZU1hcC5rZXlcIixcbiAgICAgICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgdGhpcy5kYXRhXy5zZXQoa2V5LCBvYnNlcnZhYmxlKVxuICAgICAgICAgICAgbmV3VmFsdWUgPSAob2JzZXJ2YWJsZSBhcyBhbnkpLnZhbHVlXyAvLyB2YWx1ZSBtaWdodCBoYXZlIGJlZW4gY2hhbmdlZFxuICAgICAgICAgICAgdGhpcy5oYXNNYXBfLmdldChrZXkpPy5zZXROZXdWYWx1ZV8odHJ1ZSlcbiAgICAgICAgICAgIHRoaXMua2V5c0F0b21fLnJlcG9ydENoYW5nZWQoKVxuICAgICAgICB9KVxuICAgICAgICBjb25zdCBub3RpZnlTcHkgPSBpc1NweUVuYWJsZWQoKVxuICAgICAgICBjb25zdCBub3RpZnkgPSBoYXNMaXN0ZW5lcnModGhpcylcbiAgICAgICAgY29uc3QgY2hhbmdlOiBJTWFwRGlkQ2hhbmdlPEssIFY+IHwgbnVsbCA9XG4gICAgICAgICAgICBub3RpZnkgfHwgbm90aWZ5U3B5XG4gICAgICAgICAgICAgICAgPyB7XG4gICAgICAgICAgICAgICAgICAgICAgb2JzZXJ2YWJsZUtpbmQ6IFwibWFwXCIsXG4gICAgICAgICAgICAgICAgICAgICAgZGVidWdPYmplY3ROYW1lOiB0aGlzLm5hbWVfLFxuICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IEFERCxcbiAgICAgICAgICAgICAgICAgICAgICBvYmplY3Q6IHRoaXMsXG4gICAgICAgICAgICAgICAgICAgICAgbmFtZToga2V5LFxuICAgICAgICAgICAgICAgICAgICAgIG5ld1ZhbHVlXG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgOiBudWxsXG4gICAgICAgIGlmIChfX0RFVl9fICYmIG5vdGlmeVNweSkge1xuICAgICAgICAgICAgc3B5UmVwb3J0U3RhcnQoY2hhbmdlISBhcyBQdXJlU3B5RXZlbnQpXG4gICAgICAgIH0gLy8gVE9ETyBmaXggdHlwZVxuICAgICAgICBpZiAobm90aWZ5KSB7XG4gICAgICAgICAgICBub3RpZnlMaXN0ZW5lcnModGhpcywgY2hhbmdlKVxuICAgICAgICB9XG4gICAgICAgIGlmIChfX0RFVl9fICYmIG5vdGlmeVNweSkge1xuICAgICAgICAgICAgc3B5UmVwb3J0RW5kKClcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldChrZXk6IEspOiBWIHwgdW5kZWZpbmVkIHtcbiAgICAgICAgaWYgKHRoaXMuaGFzKGtleSkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRlaGFuY2VWYWx1ZV8odGhpcy5kYXRhXy5nZXQoa2V5KSEuZ2V0KCkpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZGVoYW5jZVZhbHVlXyh1bmRlZmluZWQpXG4gICAgfVxuXG4gICAgcHJpdmF0ZSBkZWhhbmNlVmFsdWVfPFggZXh0ZW5kcyBWIHwgdW5kZWZpbmVkPih2YWx1ZTogWCk6IFgge1xuICAgICAgICBpZiAodGhpcy5kZWhhbmNlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kZWhhbmNlcih2YWx1ZSlcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFsdWVcbiAgICB9XG5cbiAgICBrZXlzKCk6IEl0ZXJhYmxlSXRlcmF0b3I8Sz4ge1xuICAgICAgICB0aGlzLmtleXNBdG9tXy5yZXBvcnRPYnNlcnZlZCgpXG4gICAgICAgIHJldHVybiB0aGlzLmRhdGFfLmtleXMoKVxuICAgIH1cblxuICAgIHZhbHVlcygpOiBJdGVyYWJsZUl0ZXJhdG9yPFY+IHtcbiAgICAgICAgY29uc3Qgc2VsZiA9IHRoaXNcbiAgICAgICAgY29uc3Qga2V5cyA9IHRoaXMua2V5cygpXG4gICAgICAgIHJldHVybiBtYWtlSXRlcmFibGUoe1xuICAgICAgICAgICAgbmV4dCgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB7IGRvbmUsIHZhbHVlIH0gPSBrZXlzLm5leHQoKVxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGRvbmUsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBkb25lID8gKHVuZGVmaW5lZCBhcyBhbnkpIDogc2VsZi5nZXQodmFsdWUpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIH1cblxuICAgIGVudHJpZXMoKTogSXRlcmFibGVJdGVyYXRvcjxJTWFwRW50cnk8SywgVj4+IHtcbiAgICAgICAgY29uc3Qgc2VsZiA9IHRoaXNcbiAgICAgICAgY29uc3Qga2V5cyA9IHRoaXMua2V5cygpXG4gICAgICAgIHJldHVybiBtYWtlSXRlcmFibGUoe1xuICAgICAgICAgICAgbmV4dCgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB7IGRvbmUsIHZhbHVlIH0gPSBrZXlzLm5leHQoKVxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGRvbmUsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBkb25lID8gKHVuZGVmaW5lZCBhcyBhbnkpIDogKFt2YWx1ZSwgc2VsZi5nZXQodmFsdWUpIV0gYXMgW0ssIFZdKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICBbU3ltYm9sLml0ZXJhdG9yXSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZW50cmllcygpXG4gICAgfVxuXG4gICAgZm9yRWFjaChjYWxsYmFjazogKHZhbHVlOiBWLCBrZXk6IEssIG9iamVjdDogTWFwPEssIFY+KSA9PiB2b2lkLCB0aGlzQXJnPykge1xuICAgICAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiB0aGlzKSB7XG4gICAgICAgICAgICBjYWxsYmFjay5jYWxsKHRoaXNBcmcsIHZhbHVlLCBrZXksIHRoaXMpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogTWVyZ2UgYW5vdGhlciBvYmplY3QgaW50byB0aGlzIG9iamVjdCwgcmV0dXJucyB0aGlzLiAqL1xuICAgIG1lcmdlKG90aGVyPzogSU9ic2VydmFibGVNYXBJbml0aWFsVmFsdWVzPEssIFY+KTogT2JzZXJ2YWJsZU1hcDxLLCBWPiB7XG4gICAgICAgIGlmIChpc09ic2VydmFibGVNYXAob3RoZXIpKSB7XG4gICAgICAgICAgICBvdGhlciA9IG5ldyBNYXAob3RoZXIpXG4gICAgICAgIH1cbiAgICAgICAgdHJhbnNhY3Rpb24oKCkgPT4ge1xuICAgICAgICAgICAgaWYgKGlzUGxhaW5PYmplY3Qob3RoZXIpKSB7XG4gICAgICAgICAgICAgICAgZ2V0UGxhaW5PYmplY3RLZXlzKG90aGVyKS5mb3JFYWNoKChrZXk6IGFueSkgPT5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXQoa2V5IGFzIEssIChvdGhlciBhcyBJS2V5VmFsdWVNYXApW2tleV0pXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KG90aGVyKSkge1xuICAgICAgICAgICAgICAgIG90aGVyLmZvckVhY2goKFtrZXksIHZhbHVlXSkgPT4gdGhpcy5zZXQoa2V5LCB2YWx1ZSkpXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGlzRVM2TWFwKG90aGVyKSkge1xuICAgICAgICAgICAgICAgIGlmIChvdGhlci5jb25zdHJ1Y3RvciAhPT0gTWFwKSB7XG4gICAgICAgICAgICAgICAgICAgIGRpZSgxOSwgb3RoZXIpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG90aGVyLmZvckVhY2goKHZhbHVlLCBrZXkpID0+IHRoaXMuc2V0KGtleSwgdmFsdWUpKVxuICAgICAgICAgICAgfSBlbHNlIGlmIChvdGhlciAhPT0gbnVsbCAmJiBvdGhlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgZGllKDIwLCBvdGhlcilcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgcmV0dXJuIHRoaXNcbiAgICB9XG5cbiAgICBjbGVhcigpIHtcbiAgICAgICAgdHJhbnNhY3Rpb24oKCkgPT4ge1xuICAgICAgICAgICAgdW50cmFja2VkKCgpID0+IHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiB0aGlzLmtleXMoKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlbGV0ZShrZXkpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICByZXBsYWNlKHZhbHVlczogSU9ic2VydmFibGVNYXBJbml0aWFsVmFsdWVzPEssIFY+KTogT2JzZXJ2YWJsZU1hcDxLLCBWPiB7XG4gICAgICAgIC8vIEltcGxlbWVudGF0aW9uIHJlcXVpcmVtZW50czpcbiAgICAgICAgLy8gLSByZXNwZWN0IG9yZGVyaW5nIG9mIHJlcGxhY2VtZW50IG1hcFxuICAgICAgICAvLyAtIGFsbG93IGludGVyY2VwdG9ycyB0byBydW4gYW5kIHBvdGVudGlhbGx5IHByZXZlbnQgaW5kaXZpZHVhbCBvcGVyYXRpb25zXG4gICAgICAgIC8vIC0gZG9uJ3QgcmVjcmVhdGUgb2JzZXJ2YWJsZXMgdGhhdCBhbHJlYWR5IGV4aXN0IGluIG9yaWdpbmFsIG1hcCAoc28gd2UgZG9uJ3QgZGVzdHJveSBleGlzdGluZyBzdWJzY3JpcHRpb25zKVxuICAgICAgICAvLyAtIGRvbid0IF9rZXlzQXRvbS5yZXBvcnRDaGFuZ2VkIGlmIHRoZSBrZXlzIG9mIHJlc3VsdGluZyBtYXAgYXJlIGluZGVudGljYWwgKG9yZGVyIG1hdHRlcnMhKVxuICAgICAgICAvLyAtIG5vdGUgdGhhdCByZXN1bHQgbWFwIG1heSBkaWZmZXIgZnJvbSByZXBsYWNlbWVudCBtYXAgZHVlIHRvIHRoZSBpbnRlcmNlcHRvcnNcbiAgICAgICAgdHJhbnNhY3Rpb24oKCkgPT4ge1xuICAgICAgICAgICAgLy8gQ29udmVydCB0byBtYXAgc28gd2UgY2FuIGRvIHF1aWNrIGtleSBsb29rdXBzXG4gICAgICAgICAgICBjb25zdCByZXBsYWNlbWVudE1hcCA9IGNvbnZlcnRUb01hcCh2YWx1ZXMpXG4gICAgICAgICAgICBjb25zdCBvcmRlcmVkRGF0YSA9IG5ldyBNYXAoKVxuICAgICAgICAgICAgLy8gVXNlZCBmb3Igb3B0aW1pemF0aW9uXG4gICAgICAgICAgICBsZXQga2V5c1JlcG9ydENoYW5nZWRDYWxsZWQgPSBmYWxzZVxuICAgICAgICAgICAgLy8gRGVsZXRlIGtleXMgdGhhdCBkb24ndCBleGlzdCBpbiByZXBsYWNlbWVudCBtYXBcbiAgICAgICAgICAgIC8vIGlmIHRoZSBrZXkgZGVsZXRpb24gaXMgcHJldmVudGVkIGJ5IGludGVyY2VwdG9yXG4gICAgICAgICAgICAvLyBhZGQgZW50cnkgYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgcmVzdWx0IG1hcFxuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgb2YgdGhpcy5kYXRhXy5rZXlzKCkpIHtcbiAgICAgICAgICAgICAgICAvLyBDb25jdXJyZW50bHkgaXRlcmF0aW5nL2RlbGV0aW5nIGtleXNcbiAgICAgICAgICAgICAgICAvLyBpdGVyYXRvciBzaG91bGQgaGFuZGxlIHRoaXMgY29ycmVjdGx5XG4gICAgICAgICAgICAgICAgaWYgKCFyZXBsYWNlbWVudE1hcC5oYXMoa2V5KSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBkZWxldGVkID0gdGhpcy5kZWxldGUoa2V5KVxuICAgICAgICAgICAgICAgICAgICAvLyBXYXMgdGhlIGtleSByZW1vdmVkP1xuICAgICAgICAgICAgICAgICAgICBpZiAoZGVsZXRlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gX2tleXNBdG9tLnJlcG9ydENoYW5nZWQoKSB3YXMgYWxyZWFkeSBjYWxsZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleXNSZXBvcnRDaGFuZ2VkQ2FsbGVkID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gRGVsZXRlIHByZXZlbnRlZCBieSBpbnRlcmNlcHRvclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLmRhdGFfLmdldChrZXkpXG4gICAgICAgICAgICAgICAgICAgICAgICBvcmRlcmVkRGF0YS5zZXQoa2V5LCB2YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIE1lcmdlIGVudHJpZXNcbiAgICAgICAgICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIHJlcGxhY2VtZW50TWFwLmVudHJpZXMoKSkge1xuICAgICAgICAgICAgICAgIC8vIFdlIHdpbGwgd2FudCB0byBrbm93IHdoZXRoZXIgYSBuZXcga2V5IGlzIGFkZGVkXG4gICAgICAgICAgICAgICAgY29uc3Qga2V5RXhpc3RlZCA9IHRoaXMuZGF0YV8uaGFzKGtleSlcbiAgICAgICAgICAgICAgICAvLyBBZGQgb3IgdXBkYXRlIHZhbHVlXG4gICAgICAgICAgICAgICAgdGhpcy5zZXQoa2V5LCB2YWx1ZSlcbiAgICAgICAgICAgICAgICAvLyBUaGUgYWRkaXRpb24gY291bGQgaGF2ZSBiZWVuIHByZXZlbnQgYnkgaW50ZXJjZXB0b3JcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5kYXRhXy5oYXMoa2V5KSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBUaGUgdXBkYXRlIGNvdWxkIGhhdmUgYmVlbiBwcmV2ZW50ZWQgYnkgaW50ZXJjZXB0b3JcbiAgICAgICAgICAgICAgICAgICAgLy8gYW5kIGFsc28gd2Ugd2FudCB0byBwcmVzZXJ2ZSBleGlzdGluZyB2YWx1ZXNcbiAgICAgICAgICAgICAgICAgICAgLy8gc28gdXNlIHZhbHVlIGZyb20gX2RhdGEgbWFwIChpbnN0ZWFkIG9mIHJlcGxhY2VtZW50IG1hcClcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLmRhdGFfLmdldChrZXkpXG4gICAgICAgICAgICAgICAgICAgIG9yZGVyZWREYXRhLnNldChrZXksIHZhbHVlKVxuICAgICAgICAgICAgICAgICAgICAvLyBXYXMgYSBuZXcga2V5IGFkZGVkP1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWtleUV4aXN0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIF9rZXlzQXRvbS5yZXBvcnRDaGFuZ2VkKCkgd2FzIGFscmVhZHkgY2FsbGVkXG4gICAgICAgICAgICAgICAgICAgICAgICBrZXlzUmVwb3J0Q2hhbmdlZENhbGxlZCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIENoZWNrIGZvciBwb3NzaWJsZSBrZXkgb3JkZXIgY2hhbmdlXG4gICAgICAgICAgICBpZiAoIWtleXNSZXBvcnRDaGFuZ2VkQ2FsbGVkKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZGF0YV8uc2l6ZSAhPT0gb3JkZXJlZERhdGEuc2l6ZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBJZiBzaXplIGRpZmZlcnMsIGtleXMgYXJlIGRlZmluaXRlbHkgbW9kaWZpZWRcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5rZXlzQXRvbV8ucmVwb3J0Q2hhbmdlZCgpXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaXRlcjEgPSB0aGlzLmRhdGFfLmtleXMoKVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBpdGVyMiA9IG9yZGVyZWREYXRhLmtleXMoKVxuICAgICAgICAgICAgICAgICAgICBsZXQgbmV4dDEgPSBpdGVyMS5uZXh0KClcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5leHQyID0gaXRlcjIubmV4dCgpXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlICghbmV4dDEuZG9uZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5leHQxLnZhbHVlICE9PSBuZXh0Mi52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMua2V5c0F0b21fLnJlcG9ydENoYW5nZWQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXh0MSA9IGl0ZXIxLm5leHQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dDIgPSBpdGVyMi5uZXh0KClcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFVzZSBjb3JyZWN0bHkgb3JkZXJlZCBtYXBcbiAgICAgICAgICAgIHRoaXMuZGF0YV8gPSBvcmRlcmVkRGF0YVxuICAgICAgICB9KVxuICAgICAgICByZXR1cm4gdGhpc1xuICAgIH1cblxuICAgIGdldCBzaXplKCk6IG51bWJlciB7XG4gICAgICAgIHRoaXMua2V5c0F0b21fLnJlcG9ydE9ic2VydmVkKClcbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0YV8uc2l6ZVxuICAgIH1cblxuICAgIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBcIltvYmplY3QgT2JzZXJ2YWJsZU1hcF1cIlxuICAgIH1cblxuICAgIHRvSlNPTigpOiBbSywgVl1bXSB7XG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMpXG4gICAgfVxuXG4gICAgZ2V0IFtTeW1ib2wudG9TdHJpbmdUYWddKCkge1xuICAgICAgICByZXR1cm4gXCJNYXBcIlxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE9ic2VydmVzIHRoaXMgb2JqZWN0LiBUcmlnZ2VycyBmb3IgdGhlIGV2ZW50cyAnYWRkJywgJ3VwZGF0ZScgYW5kICdkZWxldGUnLlxuICAgICAqIFNlZTogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvT2JqZWN0L29ic2VydmVcbiAgICAgKiBmb3IgY2FsbGJhY2sgZGV0YWlsc1xuICAgICAqL1xuICAgIG9ic2VydmVfKGxpc3RlbmVyOiAoY2hhbmdlczogSU1hcERpZENoYW5nZTxLLCBWPikgPT4gdm9pZCwgZmlyZUltbWVkaWF0ZWx5PzogYm9vbGVhbik6IExhbWJkYSB7XG4gICAgICAgIGlmIChfX0RFVl9fICYmIGZpcmVJbW1lZGlhdGVseSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgZGllKFwiYG9ic2VydmVgIGRvZXNuJ3Qgc3VwcG9ydCBmaXJlSW1tZWRpYXRlbHk9dHJ1ZSBpbiBjb21iaW5hdGlvbiB3aXRoIG1hcHMuXCIpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlZ2lzdGVyTGlzdGVuZXIodGhpcywgbGlzdGVuZXIpXG4gICAgfVxuXG4gICAgaW50ZXJjZXB0XyhoYW5kbGVyOiBJSW50ZXJjZXB0b3I8SU1hcFdpbGxDaGFuZ2U8SywgVj4+KTogTGFtYmRhIHtcbiAgICAgICAgcmV0dXJuIHJlZ2lzdGVySW50ZXJjZXB0b3IodGhpcywgaGFuZGxlcilcbiAgICB9XG59XG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZVxuZXhwb3J0IHZhciBpc09ic2VydmFibGVNYXAgPSBjcmVhdGVJbnN0YW5jZW9mUHJlZGljYXRlKFwiT2JzZXJ2YWJsZU1hcFwiLCBPYnNlcnZhYmxlTWFwKSBhcyAoXG4gICAgdGhpbmc6IGFueVxuKSA9PiB0aGluZyBpcyBPYnNlcnZhYmxlTWFwPGFueSwgYW55PlxuXG5mdW5jdGlvbiBjb252ZXJ0VG9NYXAoZGF0YVN0cnVjdHVyZTogYW55KTogTWFwPGFueSwgYW55PiB7XG4gICAgaWYgKGlzRVM2TWFwKGRhdGFTdHJ1Y3R1cmUpIHx8IGlzT2JzZXJ2YWJsZU1hcChkYXRhU3RydWN0dXJlKSkge1xuICAgICAgICByZXR1cm4gZGF0YVN0cnVjdHVyZVxuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShkYXRhU3RydWN0dXJlKSkge1xuICAgICAgICByZXR1cm4gbmV3IE1hcChkYXRhU3RydWN0dXJlKVxuICAgIH0gZWxzZSBpZiAoaXNQbGFpbk9iamVjdChkYXRhU3RydWN0dXJlKSkge1xuICAgICAgICBjb25zdCBtYXAgPSBuZXcgTWFwKClcbiAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gZGF0YVN0cnVjdHVyZSkge1xuICAgICAgICAgICAgbWFwLnNldChrZXksIGRhdGFTdHJ1Y3R1cmVba2V5XSlcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWFwXG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGRpZSgyMSwgZGF0YVN0cnVjdHVyZSlcbiAgICB9XG59XG4iLCJpbXBvcnQge1xuICAgICRtb2J4LFxuICAgIGNyZWF0ZUF0b20sXG4gICAgZGVlcEVuaGFuY2VyLFxuICAgIGdldE5leHRJZCxcbiAgICBJRW5oYW5jZXIsXG4gICAgaXNTcHlFbmFibGVkLFxuICAgIGhhc0xpc3RlbmVycyxcbiAgICBJTGlzdGVuYWJsZSxcbiAgICByZWdpc3Rlckxpc3RlbmVyLFxuICAgIExhbWJkYSxcbiAgICBzcHlSZXBvcnRTdGFydCxcbiAgICBub3RpZnlMaXN0ZW5lcnMsXG4gICAgc3B5UmVwb3J0RW5kLFxuICAgIGNyZWF0ZUluc3RhbmNlb2ZQcmVkaWNhdGUsXG4gICAgaGFzSW50ZXJjZXB0b3JzLFxuICAgIGludGVyY2VwdENoYW5nZSxcbiAgICBJSW50ZXJjZXB0YWJsZSxcbiAgICBJSW50ZXJjZXB0b3IsXG4gICAgcmVnaXN0ZXJJbnRlcmNlcHRvcixcbiAgICBjaGVja0lmU3RhdGVNb2RpZmljYXRpb25zQXJlQWxsb3dlZCxcbiAgICB1bnRyYWNrZWQsXG4gICAgbWFrZUl0ZXJhYmxlLFxuICAgIHRyYW5zYWN0aW9uLFxuICAgIGlzRVM2U2V0LFxuICAgIElBdG9tLFxuICAgIERFTEVURSxcbiAgICBBREQsXG4gICAgZGllLFxuICAgIGlzRnVuY3Rpb25cbn0gZnJvbSBcIi4uL2ludGVybmFsXCJcblxuY29uc3QgT2JzZXJ2YWJsZVNldE1hcmtlciA9IHt9XG5cbmV4cG9ydCB0eXBlIElPYnNlcnZhYmxlU2V0SW5pdGlhbFZhbHVlczxUPiA9IFNldDxUPiB8IHJlYWRvbmx5IFRbXVxuXG5leHBvcnQgdHlwZSBJU2V0RGlkQ2hhbmdlPFQgPSBhbnk+ID1cbiAgICB8IHtcbiAgICAgICAgICBvYmplY3Q6IE9ic2VydmFibGVTZXQ8VD5cbiAgICAgICAgICBvYnNlcnZhYmxlS2luZDogXCJzZXRcIlxuICAgICAgICAgIGRlYnVnT2JqZWN0TmFtZTogc3RyaW5nXG4gICAgICAgICAgdHlwZTogXCJhZGRcIlxuICAgICAgICAgIG5ld1ZhbHVlOiBUXG4gICAgICB9XG4gICAgfCB7XG4gICAgICAgICAgb2JqZWN0OiBPYnNlcnZhYmxlU2V0PFQ+XG4gICAgICAgICAgb2JzZXJ2YWJsZUtpbmQ6IFwic2V0XCJcbiAgICAgICAgICBkZWJ1Z09iamVjdE5hbWU6IHN0cmluZ1xuICAgICAgICAgIHR5cGU6IFwiZGVsZXRlXCJcbiAgICAgICAgICBvbGRWYWx1ZTogVFxuICAgICAgfVxuXG5leHBvcnQgdHlwZSBJU2V0V2lsbENoYW5nZTxUID0gYW55PiA9XG4gICAgfCB7XG4gICAgICAgICAgdHlwZTogXCJkZWxldGVcIlxuICAgICAgICAgIG9iamVjdDogT2JzZXJ2YWJsZVNldDxUPlxuICAgICAgICAgIG9sZFZhbHVlOiBUXG4gICAgICB9XG4gICAgfCB7XG4gICAgICAgICAgdHlwZTogXCJhZGRcIlxuICAgICAgICAgIG9iamVjdDogT2JzZXJ2YWJsZVNldDxUPlxuICAgICAgICAgIG5ld1ZhbHVlOiBUXG4gICAgICB9XG5cbmV4cG9ydCBjbGFzcyBPYnNlcnZhYmxlU2V0PFQgPSBhbnk+IGltcGxlbWVudHMgU2V0PFQ+LCBJSW50ZXJjZXB0YWJsZTxJU2V0V2lsbENoYW5nZT4sIElMaXN0ZW5hYmxlIHtcbiAgICBbJG1vYnhdID0gT2JzZXJ2YWJsZVNldE1hcmtlclxuICAgIHByaXZhdGUgZGF0YV86IFNldDxhbnk+ID0gbmV3IFNldCgpXG4gICAgYXRvbV86IElBdG9tXG4gICAgY2hhbmdlTGlzdGVuZXJzX1xuICAgIGludGVyY2VwdG9yc19cbiAgICBkZWhhbmNlcjogYW55XG4gICAgZW5oYW5jZXJfOiAobmV3VjogYW55LCBvbGRWOiBhbnkgfCB1bmRlZmluZWQpID0+IGFueVxuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIGluaXRpYWxEYXRhPzogSU9ic2VydmFibGVTZXRJbml0aWFsVmFsdWVzPFQ+LFxuICAgICAgICBlbmhhbmNlcjogSUVuaGFuY2VyPFQ+ID0gZGVlcEVuaGFuY2VyLFxuICAgICAgICBwdWJsaWMgbmFtZV8gPSBfX0RFVl9fID8gXCJPYnNlcnZhYmxlU2V0QFwiICsgZ2V0TmV4dElkKCkgOiBcIk9ic2VydmFibGVTZXRcIlxuICAgICkge1xuICAgICAgICBpZiAoIWlzRnVuY3Rpb24oU2V0KSkge1xuICAgICAgICAgICAgZGllKDIyKVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuYXRvbV8gPSBjcmVhdGVBdG9tKHRoaXMubmFtZV8pXG4gICAgICAgIHRoaXMuZW5oYW5jZXJfID0gKG5ld1YsIG9sZFYpID0+IGVuaGFuY2VyKG5ld1YsIG9sZFYsIG5hbWVfKVxuICAgICAgICBpZiAoaW5pdGlhbERhdGEpIHtcbiAgICAgICAgICAgIHRoaXMucmVwbGFjZShpbml0aWFsRGF0YSlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgZGVoYW5jZVZhbHVlXzxYIGV4dGVuZHMgVCB8IHVuZGVmaW5lZD4odmFsdWU6IFgpOiBYIHtcbiAgICAgICAgaWYgKHRoaXMuZGVoYW5jZXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGVoYW5jZXIodmFsdWUpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZhbHVlXG4gICAgfVxuXG4gICAgY2xlYXIoKSB7XG4gICAgICAgIHRyYW5zYWN0aW9uKCgpID0+IHtcbiAgICAgICAgICAgIHVudHJhY2tlZCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCB2YWx1ZSBvZiB0aGlzLmRhdGFfLnZhbHVlcygpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVsZXRlKHZhbHVlKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgZm9yRWFjaChjYWxsYmFja0ZuOiAodmFsdWU6IFQsIHZhbHVlMjogVCwgc2V0OiBTZXQ8VD4pID0+IHZvaWQsIHRoaXNBcmc/OiBhbnkpIHtcbiAgICAgICAgZm9yIChjb25zdCB2YWx1ZSBvZiB0aGlzKSB7XG4gICAgICAgICAgICBjYWxsYmFja0ZuLmNhbGwodGhpc0FyZywgdmFsdWUsIHZhbHVlLCB0aGlzKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0IHNpemUoKSB7XG4gICAgICAgIHRoaXMuYXRvbV8ucmVwb3J0T2JzZXJ2ZWQoKVxuICAgICAgICByZXR1cm4gdGhpcy5kYXRhXy5zaXplXG4gICAgfVxuXG4gICAgYWRkKHZhbHVlOiBUKSB7XG4gICAgICAgIGNoZWNrSWZTdGF0ZU1vZGlmaWNhdGlvbnNBcmVBbGxvd2VkKHRoaXMuYXRvbV8pXG4gICAgICAgIGlmIChoYXNJbnRlcmNlcHRvcnModGhpcykpIHtcbiAgICAgICAgICAgIGNvbnN0IGNoYW5nZSA9IGludGVyY2VwdENoYW5nZTxJU2V0V2lsbENoYW5nZTxUPj4odGhpcywge1xuICAgICAgICAgICAgICAgIHR5cGU6IEFERCxcbiAgICAgICAgICAgICAgICBvYmplY3Q6IHRoaXMsXG4gICAgICAgICAgICAgICAgbmV3VmFsdWU6IHZhbHVlXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgaWYgKCFjaGFuZ2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpc1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gaWRlYWxseSwgdmFsdWUgPSBjaGFuZ2UudmFsdWUgd291bGQgYmUgZG9uZSBoZXJlLCBzbyB0aGF0IHZhbHVlcyBjYW4gYmVcbiAgICAgICAgICAgIC8vIGNoYW5nZWQgYnkgaW50ZXJjZXB0b3IuIFNhbWUgYXBwbGllcyBmb3Igb3RoZXIgU2V0IGFuZCBNYXAgYXBpJ3MuXG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLmhhcyh2YWx1ZSkpIHtcbiAgICAgICAgICAgIHRyYW5zYWN0aW9uKCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFfLmFkZCh0aGlzLmVuaGFuY2VyXyh2YWx1ZSwgdW5kZWZpbmVkKSlcbiAgICAgICAgICAgICAgICB0aGlzLmF0b21fLnJlcG9ydENoYW5nZWQoKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGNvbnN0IG5vdGlmeVNweSA9IF9fREVWX18gJiYgaXNTcHlFbmFibGVkKClcbiAgICAgICAgICAgIGNvbnN0IG5vdGlmeSA9IGhhc0xpc3RlbmVycyh0aGlzKVxuICAgICAgICAgICAgY29uc3QgY2hhbmdlID1cbiAgICAgICAgICAgICAgICBub3RpZnkgfHwgbm90aWZ5U3B5XG4gICAgICAgICAgICAgICAgICAgID8gPElTZXREaWRDaGFuZ2U8VD4+e1xuICAgICAgICAgICAgICAgICAgICAgICAgICBvYnNlcnZhYmxlS2luZDogXCJzZXRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZGVidWdPYmplY3ROYW1lOiB0aGlzLm5hbWVfLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBBREQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdDogdGhpcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3VmFsdWU6IHZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICA6IG51bGxcbiAgICAgICAgICAgIGlmIChub3RpZnlTcHkgJiYgX19ERVZfXykge1xuICAgICAgICAgICAgICAgIHNweVJlcG9ydFN0YXJ0KGNoYW5nZSEpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobm90aWZ5KSB7XG4gICAgICAgICAgICAgICAgbm90aWZ5TGlzdGVuZXJzKHRoaXMsIGNoYW5nZSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChub3RpZnlTcHkgJiYgX19ERVZfXykge1xuICAgICAgICAgICAgICAgIHNweVJlcG9ydEVuZCgpXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpc1xuICAgIH1cblxuICAgIGRlbGV0ZSh2YWx1ZTogVCkge1xuICAgICAgICBpZiAoaGFzSW50ZXJjZXB0b3JzKHRoaXMpKSB7XG4gICAgICAgICAgICBjb25zdCBjaGFuZ2UgPSBpbnRlcmNlcHRDaGFuZ2U8SVNldFdpbGxDaGFuZ2U8VD4+KHRoaXMsIHtcbiAgICAgICAgICAgICAgICB0eXBlOiBERUxFVEUsXG4gICAgICAgICAgICAgICAgb2JqZWN0OiB0aGlzLFxuICAgICAgICAgICAgICAgIG9sZFZhbHVlOiB2YWx1ZVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGlmICghY2hhbmdlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuaGFzKHZhbHVlKSkge1xuICAgICAgICAgICAgY29uc3Qgbm90aWZ5U3B5ID0gX19ERVZfXyAmJiBpc1NweUVuYWJsZWQoKVxuICAgICAgICAgICAgY29uc3Qgbm90aWZ5ID0gaGFzTGlzdGVuZXJzKHRoaXMpXG4gICAgICAgICAgICBjb25zdCBjaGFuZ2UgPVxuICAgICAgICAgICAgICAgIG5vdGlmeSB8fCBub3RpZnlTcHlcbiAgICAgICAgICAgICAgICAgICAgPyA8SVNldERpZENoYW5nZTxUPj57XG4gICAgICAgICAgICAgICAgICAgICAgICAgIG9ic2VydmFibGVLaW5kOiBcInNldFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBkZWJ1Z09iamVjdE5hbWU6IHRoaXMubmFtZV8sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IERFTEVURSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiB0aGlzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBvbGRWYWx1ZTogdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIDogbnVsbFxuXG4gICAgICAgICAgICBpZiAobm90aWZ5U3B5ICYmIF9fREVWX18pIHtcbiAgICAgICAgICAgICAgICBzcHlSZXBvcnRTdGFydChjaGFuZ2UhKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdHJhbnNhY3Rpb24oKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuYXRvbV8ucmVwb3J0Q2hhbmdlZCgpXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhXy5kZWxldGUodmFsdWUpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgaWYgKG5vdGlmeSkge1xuICAgICAgICAgICAgICAgIG5vdGlmeUxpc3RlbmVycyh0aGlzLCBjaGFuZ2UpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobm90aWZ5U3B5ICYmIF9fREVWX18pIHtcbiAgICAgICAgICAgICAgICBzcHlSZXBvcnRFbmQoKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICBoYXModmFsdWU6IFQpIHtcbiAgICAgICAgdGhpcy5hdG9tXy5yZXBvcnRPYnNlcnZlZCgpXG4gICAgICAgIHJldHVybiB0aGlzLmRhdGFfLmhhcyh0aGlzLmRlaGFuY2VWYWx1ZV8odmFsdWUpKVxuICAgIH1cblxuICAgIGVudHJpZXMoKSB7XG4gICAgICAgIGxldCBuZXh0SW5kZXggPSAwXG4gICAgICAgIGNvbnN0IGtleXMgPSBBcnJheS5mcm9tKHRoaXMua2V5cygpKVxuICAgICAgICBjb25zdCB2YWx1ZXMgPSBBcnJheS5mcm9tKHRoaXMudmFsdWVzKCkpXG4gICAgICAgIHJldHVybiBtYWtlSXRlcmFibGU8W1QsIFRdPih7XG4gICAgICAgICAgICBuZXh0KCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gbmV4dEluZGV4XG4gICAgICAgICAgICAgICAgbmV4dEluZGV4ICs9IDFcbiAgICAgICAgICAgICAgICByZXR1cm4gaW5kZXggPCB2YWx1ZXMubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgID8geyB2YWx1ZTogW2tleXNbaW5kZXhdLCB2YWx1ZXNbaW5kZXhdXSwgZG9uZTogZmFsc2UgfVxuICAgICAgICAgICAgICAgICAgICA6IHsgZG9uZTogdHJ1ZSB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gYXMgYW55KVxuICAgIH1cblxuICAgIGtleXMoKTogSXRlcmFibGVJdGVyYXRvcjxUPiB7XG4gICAgICAgIHJldHVybiB0aGlzLnZhbHVlcygpXG4gICAgfVxuXG4gICAgdmFsdWVzKCk6IEl0ZXJhYmxlSXRlcmF0b3I8VD4ge1xuICAgICAgICB0aGlzLmF0b21fLnJlcG9ydE9ic2VydmVkKClcbiAgICAgICAgY29uc3Qgc2VsZiA9IHRoaXNcbiAgICAgICAgbGV0IG5leHRJbmRleCA9IDBcbiAgICAgICAgY29uc3Qgb2JzZXJ2YWJsZVZhbHVlcyA9IEFycmF5LmZyb20odGhpcy5kYXRhXy52YWx1ZXMoKSlcbiAgICAgICAgcmV0dXJuIG1ha2VJdGVyYWJsZTxUPih7XG4gICAgICAgICAgICBuZXh0KCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXh0SW5kZXggPCBvYnNlcnZhYmxlVmFsdWVzLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICA/IHsgdmFsdWU6IHNlbGYuZGVoYW5jZVZhbHVlXyhvYnNlcnZhYmxlVmFsdWVzW25leHRJbmRleCsrXSksIGRvbmU6IGZhbHNlIH1cbiAgICAgICAgICAgICAgICAgICAgOiB7IGRvbmU6IHRydWUgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGFzIGFueSlcbiAgICB9XG5cbiAgICByZXBsYWNlKG90aGVyOiBPYnNlcnZhYmxlU2V0PFQ+IHwgSU9ic2VydmFibGVTZXRJbml0aWFsVmFsdWVzPFQ+KTogT2JzZXJ2YWJsZVNldDxUPiB7XG4gICAgICAgIGlmIChpc09ic2VydmFibGVTZXQob3RoZXIpKSB7XG4gICAgICAgICAgICBvdGhlciA9IG5ldyBTZXQob3RoZXIpXG4gICAgICAgIH1cblxuICAgICAgICB0cmFuc2FjdGlvbigoKSA9PiB7XG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShvdGhlcikpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNsZWFyKClcbiAgICAgICAgICAgICAgICBvdGhlci5mb3JFYWNoKHZhbHVlID0+IHRoaXMuYWRkKHZhbHVlKSlcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNFUzZTZXQob3RoZXIpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jbGVhcigpXG4gICAgICAgICAgICAgICAgb3RoZXIuZm9yRWFjaCh2YWx1ZSA9PiB0aGlzLmFkZCh2YWx1ZSkpXG4gICAgICAgICAgICB9IGVsc2UgaWYgKG90aGVyICE9PSBudWxsICYmIG90aGVyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBkaWUoXCJDYW5ub3QgaW5pdGlhbGl6ZSBzZXQgZnJvbSBcIiArIG90aGVyKVxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuXG4gICAgICAgIHJldHVybiB0aGlzXG4gICAgfVxuICAgIG9ic2VydmVfKGxpc3RlbmVyOiAoY2hhbmdlczogSVNldERpZENoYW5nZTxUPikgPT4gdm9pZCwgZmlyZUltbWVkaWF0ZWx5PzogYm9vbGVhbik6IExhbWJkYSB7XG4gICAgICAgIC8vIC4uLiAnZmlyZUltbWVkaWF0ZWx5JyBjb3VsZCBhbHNvIGJlIHRydWU/XG4gICAgICAgIGlmIChfX0RFVl9fICYmIGZpcmVJbW1lZGlhdGVseSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgZGllKFwiYG9ic2VydmVgIGRvZXNuJ3Qgc3VwcG9ydCBmaXJlSW1tZWRpYXRlbHk9dHJ1ZSBpbiBjb21iaW5hdGlvbiB3aXRoIHNldHMuXCIpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlZ2lzdGVyTGlzdGVuZXIodGhpcywgbGlzdGVuZXIpXG4gICAgfVxuXG4gICAgaW50ZXJjZXB0XyhoYW5kbGVyOiBJSW50ZXJjZXB0b3I8SVNldFdpbGxDaGFuZ2U8VD4+KTogTGFtYmRhIHtcbiAgICAgICAgcmV0dXJuIHJlZ2lzdGVySW50ZXJjZXB0b3IodGhpcywgaGFuZGxlcilcbiAgICB9XG5cbiAgICB0b0pTT04oKTogVFtdIHtcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20odGhpcylcbiAgICB9XG5cbiAgICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gXCJbb2JqZWN0IE9ic2VydmFibGVTZXRdXCJcbiAgICB9XG5cbiAgICBbU3ltYm9sLml0ZXJhdG9yXSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudmFsdWVzKClcbiAgICB9XG5cbiAgICBnZXQgW1N5bWJvbC50b1N0cmluZ1RhZ10oKSB7XG4gICAgICAgIHJldHVybiBcIlNldFwiXG4gICAgfVxufVxuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmVcbmV4cG9ydCB2YXIgaXNPYnNlcnZhYmxlU2V0ID0gY3JlYXRlSW5zdGFuY2VvZlByZWRpY2F0ZShcIk9ic2VydmFibGVTZXRcIiwgT2JzZXJ2YWJsZVNldCkgYXMgKFxuICAgIHRoaW5nOiBhbnlcbikgPT4gdGhpbmcgaXMgT2JzZXJ2YWJsZVNldDxhbnk+XG4iLCJpbXBvcnQge1xuICAgIENyZWF0ZU9ic2VydmFibGVPcHRpb25zLFxuICAgIGdldEFubm90YXRpb25Gcm9tT3B0aW9ucyxcbiAgICBwcm9wYWdhdGVDaGFuZ2VkLFxuICAgIGlzQW5ub3RhdGlvbixcbiAgICAkbW9ieCxcbiAgICBBdG9tLFxuICAgIEFubm90YXRpb24sXG4gICAgQ29tcHV0ZWRWYWx1ZSxcbiAgICBJQXRvbSxcbiAgICBJQ29tcHV0ZWRWYWx1ZU9wdGlvbnMsXG4gICAgSUVuaGFuY2VyLFxuICAgIElJbnRlcmNlcHRhYmxlLFxuICAgIElMaXN0ZW5hYmxlLFxuICAgIExhbWJkYSxcbiAgICBPYnNlcnZhYmxlVmFsdWUsXG4gICAgYWRkSGlkZGVuUHJvcCxcbiAgICBjcmVhdGVJbnN0YW5jZW9mUHJlZGljYXRlLFxuICAgIGVuZEJhdGNoLFxuICAgIGdldE5leHRJZCxcbiAgICBoYXNJbnRlcmNlcHRvcnMsXG4gICAgaGFzTGlzdGVuZXJzLFxuICAgIGludGVyY2VwdENoYW5nZSxcbiAgICBpc09iamVjdCxcbiAgICBpc1BsYWluT2JqZWN0LFxuICAgIGlzU3B5RW5hYmxlZCxcbiAgICBub3RpZnlMaXN0ZW5lcnMsXG4gICAgcmVmZXJlbmNlRW5oYW5jZXIsXG4gICAgcmVnaXN0ZXJJbnRlcmNlcHRvcixcbiAgICByZWdpc3Rlckxpc3RlbmVyLFxuICAgIHNweVJlcG9ydEVuZCxcbiAgICBzcHlSZXBvcnRTdGFydCxcbiAgICBzdGFydEJhdGNoLFxuICAgIHN0cmluZ2lmeUtleSxcbiAgICBnbG9iYWxTdGF0ZSxcbiAgICBBREQsXG4gICAgVVBEQVRFLFxuICAgIGRpZSxcbiAgICBoYXNQcm9wLFxuICAgIGdldERlc2NyaXB0b3IsXG4gICAgc3RvcmVkQW5ub3RhdGlvbnNTeW1ib2wsXG4gICAgb3duS2V5cyxcbiAgICBpc092ZXJyaWRlLFxuICAgIGRlZmluZVByb3BlcnR5LFxuICAgIGF1dG9Bbm5vdGF0aW9uLFxuICAgIGdldEFkbWluaXN0cmF0aW9uLFxuICAgIGdldERlYnVnTmFtZSxcbiAgICBvYmplY3RQcm90b3R5cGUsXG4gICAgTWFrZVJlc3VsdFxufSBmcm9tIFwiLi4vaW50ZXJuYWxcIlxuXG5jb25zdCBkZXNjcmlwdG9yQ2FjaGUgPSBPYmplY3QuY3JlYXRlKG51bGwpXG5cbmV4cG9ydCB0eXBlIElPYmplY3REaWRDaGFuZ2U8VCA9IGFueT4gPSB7XG4gICAgb2JzZXJ2YWJsZUtpbmQ6IFwib2JqZWN0XCJcbiAgICBuYW1lOiBQcm9wZXJ0eUtleVxuICAgIG9iamVjdDogVFxuICAgIGRlYnVnT2JqZWN0TmFtZTogc3RyaW5nXG59ICYgKFxuICAgIHwge1xuICAgICAgICAgIHR5cGU6IFwiYWRkXCJcbiAgICAgICAgICBuZXdWYWx1ZTogYW55XG4gICAgICB9XG4gICAgfCB7XG4gICAgICAgICAgdHlwZTogXCJ1cGRhdGVcIlxuICAgICAgICAgIG9sZFZhbHVlOiBhbnlcbiAgICAgICAgICBuZXdWYWx1ZTogYW55XG4gICAgICB9XG4gICAgfCB7XG4gICAgICAgICAgdHlwZTogXCJyZW1vdmVcIlxuICAgICAgICAgIG9sZFZhbHVlOiBhbnlcbiAgICAgIH1cbilcblxuZXhwb3J0IHR5cGUgSU9iamVjdFdpbGxDaGFuZ2U8VCA9IGFueT4gPVxuICAgIHwge1xuICAgICAgICAgIG9iamVjdDogVFxuICAgICAgICAgIHR5cGU6IFwidXBkYXRlXCIgfCBcImFkZFwiXG4gICAgICAgICAgbmFtZTogUHJvcGVydHlLZXlcbiAgICAgICAgICBuZXdWYWx1ZTogYW55XG4gICAgICB9XG4gICAgfCB7XG4gICAgICAgICAgb2JqZWN0OiBUXG4gICAgICAgICAgdHlwZTogXCJyZW1vdmVcIlxuICAgICAgICAgIG5hbWU6IFByb3BlcnR5S2V5XG4gICAgICB9XG5cbmNvbnN0IFJFTU9WRSA9IFwicmVtb3ZlXCJcblxuZXhwb3J0IGNsYXNzIE9ic2VydmFibGVPYmplY3RBZG1pbmlzdHJhdGlvblxuICAgIGltcGxlbWVudHMgSUludGVyY2VwdGFibGU8SU9iamVjdFdpbGxDaGFuZ2U+LCBJTGlzdGVuYWJsZVxue1xuICAgIGtleXNBdG9tXzogSUF0b21cbiAgICBjaGFuZ2VMaXN0ZW5lcnNfXG4gICAgaW50ZXJjZXB0b3JzX1xuICAgIHByb3h5XzogYW55XG4gICAgaXNQbGFpbk9iamVjdF86IGJvb2xlYW5cbiAgICBhcHBsaWVkQW5ub3RhdGlvbnNfPzogb2JqZWN0XG4gICAgcHJpdmF0ZSBwZW5kaW5nS2V5c186IHVuZGVmaW5lZCB8IE1hcDxQcm9wZXJ0eUtleSwgT2JzZXJ2YWJsZVZhbHVlPGJvb2xlYW4+PlxuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHB1YmxpYyB0YXJnZXRfOiBhbnksXG4gICAgICAgIHB1YmxpYyB2YWx1ZXNfID0gbmV3IE1hcDxQcm9wZXJ0eUtleSwgT2JzZXJ2YWJsZVZhbHVlPGFueT4gfCBDb21wdXRlZFZhbHVlPGFueT4+KCksXG4gICAgICAgIHB1YmxpYyBuYW1lXzogc3RyaW5nLFxuICAgICAgICAvLyBVc2VkIGFueXRpbWUgYW5ub3RhdGlvbiBpcyBub3QgZXhwbGljaXRlbHkgcHJvdmlkZWRcbiAgICAgICAgcHVibGljIGRlZmF1bHRBbm5vdGF0aW9uXzogQW5ub3RhdGlvbiA9IGF1dG9Bbm5vdGF0aW9uXG4gICAgKSB7XG4gICAgICAgIHRoaXMua2V5c0F0b21fID0gbmV3IEF0b20oX19ERVZfXyA/IGAke3RoaXMubmFtZV99LmtleXNgIDogXCJPYnNlcnZhYmxlT2JqZWN0LmtleXNcIilcbiAgICAgICAgLy8gT3B0aW1pemF0aW9uOiB3ZSB1c2UgdGhpcyBmcmVxdWVudGx5XG4gICAgICAgIHRoaXMuaXNQbGFpbk9iamVjdF8gPSBpc1BsYWluT2JqZWN0KHRoaXMudGFyZ2V0XylcbiAgICAgICAgaWYgKF9fREVWX18gJiYgIWlzQW5ub3RhdGlvbih0aGlzLmRlZmF1bHRBbm5vdGF0aW9uXykpIHtcbiAgICAgICAgICAgIGRpZShgZGVmYXVsdEFubm90YXRpb24gbXVzdCBiZSB2YWxpZCBhbm5vdGF0aW9uYClcbiAgICAgICAgfVxuICAgICAgICBpZiAoX19ERVZfXykge1xuICAgICAgICAgICAgLy8gUHJlcGFyZSBzdHJ1Y3R1cmUgZm9yIHRyYWNraW5nIHdoaWNoIGZpZWxkcyB3ZXJlIGFscmVhZHkgYW5ub3RhdGVkXG4gICAgICAgICAgICB0aGlzLmFwcGxpZWRBbm5vdGF0aW9uc18gPSB7fVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0T2JzZXJ2YWJsZVByb3BWYWx1ZV8oa2V5OiBQcm9wZXJ0eUtleSk6IGFueSB7XG4gICAgICAgIHJldHVybiB0aGlzLnZhbHVlc18uZ2V0KGtleSkhLmdldCgpXG4gICAgfVxuXG4gICAgc2V0T2JzZXJ2YWJsZVByb3BWYWx1ZV8oa2V5OiBQcm9wZXJ0eUtleSwgbmV3VmFsdWUpOiBib29sZWFuIHwgbnVsbCB7XG4gICAgICAgIGNvbnN0IG9ic2VydmFibGUgPSB0aGlzLnZhbHVlc18uZ2V0KGtleSlcbiAgICAgICAgaWYgKG9ic2VydmFibGUgaW5zdGFuY2VvZiBDb21wdXRlZFZhbHVlKSB7XG4gICAgICAgICAgICBvYnNlcnZhYmxlLnNldChuZXdWYWx1ZSlcbiAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIH1cblxuICAgICAgICAvLyBpbnRlcmNlcHRcbiAgICAgICAgaWYgKGhhc0ludGVyY2VwdG9ycyh0aGlzKSkge1xuICAgICAgICAgICAgY29uc3QgY2hhbmdlID0gaW50ZXJjZXB0Q2hhbmdlPElPYmplY3RXaWxsQ2hhbmdlPih0aGlzLCB7XG4gICAgICAgICAgICAgICAgdHlwZTogVVBEQVRFLFxuICAgICAgICAgICAgICAgIG9iamVjdDogdGhpcy5wcm94eV8gfHwgdGhpcy50YXJnZXRfLFxuICAgICAgICAgICAgICAgIG5hbWU6IGtleSxcbiAgICAgICAgICAgICAgICBuZXdWYWx1ZVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGlmICghY2hhbmdlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG5ld1ZhbHVlID0gKGNoYW5nZSBhcyBhbnkpLm5ld1ZhbHVlXG4gICAgICAgIH1cbiAgICAgICAgbmV3VmFsdWUgPSAob2JzZXJ2YWJsZSBhcyBhbnkpLnByZXBhcmVOZXdWYWx1ZV8obmV3VmFsdWUpXG5cbiAgICAgICAgLy8gbm90aWZ5IHNweSAmIG9ic2VydmVyc1xuICAgICAgICBpZiAobmV3VmFsdWUgIT09IGdsb2JhbFN0YXRlLlVOQ0hBTkdFRCkge1xuICAgICAgICAgICAgY29uc3Qgbm90aWZ5ID0gaGFzTGlzdGVuZXJzKHRoaXMpXG4gICAgICAgICAgICBjb25zdCBub3RpZnlTcHkgPSBfX0RFVl9fICYmIGlzU3B5RW5hYmxlZCgpXG4gICAgICAgICAgICBjb25zdCBjaGFuZ2U6IElPYmplY3REaWRDaGFuZ2UgfCBudWxsID1cbiAgICAgICAgICAgICAgICBub3RpZnkgfHwgbm90aWZ5U3B5XG4gICAgICAgICAgICAgICAgICAgID8ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBVUERBVEUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG9ic2VydmFibGVLaW5kOiBcIm9iamVjdFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBkZWJ1Z09iamVjdE5hbWU6IHRoaXMubmFtZV8sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdDogdGhpcy5wcm94eV8gfHwgdGhpcy50YXJnZXRfLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBvbGRWYWx1ZTogKG9ic2VydmFibGUgYXMgYW55KS52YWx1ZV8sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGtleSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3VmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIDogbnVsbFxuXG4gICAgICAgICAgICBpZiAoX19ERVZfXyAmJiBub3RpZnlTcHkpIHtcbiAgICAgICAgICAgICAgICBzcHlSZXBvcnRTdGFydChjaGFuZ2UhKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgOyhvYnNlcnZhYmxlIGFzIE9ic2VydmFibGVWYWx1ZTxhbnk+KS5zZXROZXdWYWx1ZV8obmV3VmFsdWUpXG4gICAgICAgICAgICBpZiAobm90aWZ5KSB7XG4gICAgICAgICAgICAgICAgbm90aWZ5TGlzdGVuZXJzKHRoaXMsIGNoYW5nZSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChfX0RFVl9fICYmIG5vdGlmeVNweSkge1xuICAgICAgICAgICAgICAgIHNweVJlcG9ydEVuZCgpXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG5cbiAgICBnZXRfKGtleTogUHJvcGVydHlLZXkpOiBhbnkge1xuICAgICAgICBpZiAoZ2xvYmFsU3RhdGUudHJhY2tpbmdEZXJpdmF0aW9uICYmICFoYXNQcm9wKHRoaXMudGFyZ2V0Xywga2V5KSkge1xuICAgICAgICAgICAgLy8gS2V5IGRvZXNuJ3QgZXhpc3QgeWV0LCBzdWJzY3JpYmUgZm9yIGl0IGluIGNhc2UgaXQncyBhZGRlZCBsYXRlclxuICAgICAgICAgICAgdGhpcy5oYXNfKGtleSlcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy50YXJnZXRfW2tleV1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1Byb3BlcnR5S2V5fSBrZXlcbiAgICAgKiBAcGFyYW0ge2FueX0gdmFsdWVcbiAgICAgKiBAcGFyYW0ge0Fubm90YXRpb258Ym9vbGVhbn0gYW5ub3RhdGlvbiB0cnVlIC0gdXNlIGRlZmF1bHQgYW5ub3RhdGlvbiwgZmFsc2UgLSBjb3B5IGFzIGlzXG4gICAgICogQHBhcmFtIHtib29sZWFufSBwcm94eVRyYXAgd2hldGhlciBpdCdzIGNhbGxlZCBmcm9tIHByb3h5IHRyYXBcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbnxudWxsfSB0cnVlIG9uIHN1Y2Nlc3MsIGZhbHNlIG9uIGZhaWx1cmUgKHByb3h5VHJhcCArIG5vbi1jb25maWd1cmFibGUpLCBudWxsIHdoZW4gY2FuY2VsbGVkIGJ5IGludGVyY2VwdG9yXG4gICAgICovXG4gICAgc2V0XyhrZXk6IFByb3BlcnR5S2V5LCB2YWx1ZTogYW55LCBwcm94eVRyYXA6IGJvb2xlYW4gPSBmYWxzZSk6IGJvb2xlYW4gfCBudWxsIHtcbiAgICAgICAgLy8gRG9uJ3QgdXNlIC5oYXMoa2V5KSAtIHdlIGNhcmUgYWJvdXQgb3duXG4gICAgICAgIGlmIChoYXNQcm9wKHRoaXMudGFyZ2V0Xywga2V5KSkge1xuICAgICAgICAgICAgLy8gRXhpc3RpbmcgcHJvcFxuICAgICAgICAgICAgaWYgKHRoaXMudmFsdWVzXy5oYXMoa2V5KSkge1xuICAgICAgICAgICAgICAgIC8vIE9ic2VydmFibGUgKGNhbiBiZSBpbnRlcmNlcHRlZClcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRPYnNlcnZhYmxlUHJvcFZhbHVlXyhrZXksIHZhbHVlKVxuICAgICAgICAgICAgfSBlbHNlIGlmIChwcm94eVRyYXApIHtcbiAgICAgICAgICAgICAgICAvLyBOb24tb2JzZXJ2YWJsZSAtIHByb3h5XG4gICAgICAgICAgICAgICAgcmV0dXJuIFJlZmxlY3Quc2V0KHRoaXMudGFyZ2V0Xywga2V5LCB2YWx1ZSlcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gTm9uLW9ic2VydmFibGVcbiAgICAgICAgICAgICAgICB0aGlzLnRhcmdldF9ba2V5XSA9IHZhbHVlXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIE5ldyBwcm9wXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5leHRlbmRfKFxuICAgICAgICAgICAgICAgIGtleSxcbiAgICAgICAgICAgICAgICB7IHZhbHVlLCBlbnVtZXJhYmxlOiB0cnVlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgdGhpcy5kZWZhdWx0QW5ub3RhdGlvbl8sXG4gICAgICAgICAgICAgICAgcHJveHlUcmFwXG4gICAgICAgICAgICApXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBUcmFwIGZvciBcImluXCJcbiAgICBoYXNfKGtleTogUHJvcGVydHlLZXkpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKCFnbG9iYWxTdGF0ZS50cmFja2luZ0Rlcml2YXRpb24pIHtcbiAgICAgICAgICAgIC8vIFNraXAga2V5IHN1YnNjcmlwdGlvbiBvdXRzaWRlIGRlcml2YXRpb25cbiAgICAgICAgICAgIHJldHVybiBrZXkgaW4gdGhpcy50YXJnZXRfXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wZW5kaW5nS2V5c18gfHw9IG5ldyBNYXAoKVxuICAgICAgICBsZXQgZW50cnkgPSB0aGlzLnBlbmRpbmdLZXlzXy5nZXQoa2V5KVxuICAgICAgICBpZiAoIWVudHJ5KSB7XG4gICAgICAgICAgICBlbnRyeSA9IG5ldyBPYnNlcnZhYmxlVmFsdWUoXG4gICAgICAgICAgICAgICAga2V5IGluIHRoaXMudGFyZ2V0XyxcbiAgICAgICAgICAgICAgICByZWZlcmVuY2VFbmhhbmNlcixcbiAgICAgICAgICAgICAgICBfX0RFVl9fID8gYCR7dGhpcy5uYW1lX30uJHtzdHJpbmdpZnlLZXkoa2V5KX0/YCA6IFwiT2JzZXJ2YWJsZU9iamVjdC5rZXk/XCIsXG4gICAgICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIHRoaXMucGVuZGluZ0tleXNfLnNldChrZXksIGVudHJ5KVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbnRyeS5nZXQoKVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7UHJvcGVydHlLZXl9IGtleVxuICAgICAqIEBwYXJhbSB7QW5ub3RhdGlvbnxib29sZWFufSBhbm5vdGF0aW9uIHRydWUgLSB1c2UgZGVmYXVsdCBhbm5vdGF0aW9uLCBmYWxzZSAtIGlnbm9yZSBwcm9wXG4gICAgICovXG4gICAgbWFrZV8oa2V5OiBQcm9wZXJ0eUtleSwgYW5ub3RhdGlvbjogQW5ub3RhdGlvbiB8IGJvb2xlYW4pOiB2b2lkIHtcbiAgICAgICAgaWYgKGFubm90YXRpb24gPT09IHRydWUpIHtcbiAgICAgICAgICAgIGFubm90YXRpb24gPSB0aGlzLmRlZmF1bHRBbm5vdGF0aW9uX1xuICAgICAgICB9XG4gICAgICAgIGlmIChhbm5vdGF0aW9uID09PSBmYWxzZSkge1xuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgYXNzZXJ0QW5ub3RhYmxlKHRoaXMsIGFubm90YXRpb24sIGtleSlcbiAgICAgICAgaWYgKCEoa2V5IGluIHRoaXMudGFyZ2V0XykpIHtcbiAgICAgICAgICAgIC8vIFRocm93IG9uIG1pc3Npbmcga2V5LCBleGNlcHQgZm9yIGRlY29yYXRvcnM6XG4gICAgICAgICAgICAvLyBEZWNvcmF0b3IgYW5ub3RhdGlvbnMgYXJlIGNvbGxlY3RlZCBmcm9tIHdob2xlIHByb3RvdHlwZSBjaGFpbi5cbiAgICAgICAgICAgIC8vIFdoZW4gY2FsbGVkIGZyb20gc3VwZXIoKSBzb21lIHByb3BzIG1heSBub3QgZXhpc3QgeWV0LlxuICAgICAgICAgICAgLy8gSG93ZXZlciB3ZSBkb24ndCBoYXZlIHRvIHdvcnJ5IGFib3V0IG1pc3NpbmcgcHJvcCxcbiAgICAgICAgICAgIC8vIGJlY2F1c2UgdGhlIGRlY29yYXRvciBtdXN0IGhhdmUgYmVlbiBhcHBsaWVkIHRvIHNvbWV0aGluZy5cbiAgICAgICAgICAgIGlmICh0aGlzLnRhcmdldF9bc3RvcmVkQW5ub3RhdGlvbnNTeW1ib2xdPy5ba2V5XSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAvLyB3aWxsIGJlIGFubm90YXRlZCBieSBzdWJjbGFzcyBjb25zdHJ1Y3RvclxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkaWUoMSwgYW5ub3RhdGlvbi5hbm5vdGF0aW9uVHlwZV8sIGAke3RoaXMubmFtZV99LiR7a2V5LnRvU3RyaW5nKCl9YClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBsZXQgc291cmNlID0gdGhpcy50YXJnZXRfXG4gICAgICAgIHdoaWxlIChzb3VyY2UgJiYgc291cmNlICE9PSBvYmplY3RQcm90b3R5cGUpIHtcbiAgICAgICAgICAgIGNvbnN0IGRlc2NyaXB0b3IgPSBnZXREZXNjcmlwdG9yKHNvdXJjZSwga2V5KVxuICAgICAgICAgICAgaWYgKGRlc2NyaXB0b3IpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBvdXRjb21lID0gYW5ub3RhdGlvbi5tYWtlXyh0aGlzLCBrZXksIGRlc2NyaXB0b3IsIHNvdXJjZSlcbiAgICAgICAgICAgICAgICBpZiAob3V0Y29tZSA9PT0gTWFrZVJlc3VsdC5DYW5jZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChvdXRjb21lID09PSBNYWtlUmVzdWx0LkJyZWFrKSB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc291cmNlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHNvdXJjZSlcbiAgICAgICAgfVxuICAgICAgICByZWNvcmRBbm5vdGF0aW9uQXBwbGllZCh0aGlzLCBhbm5vdGF0aW9uLCBrZXkpXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtQcm9wZXJ0eUtleX0ga2V5XG4gICAgICogQHBhcmFtIHtQcm9wZXJ0eURlc2NyaXB0b3J9IGRlc2NyaXB0b3JcbiAgICAgKiBAcGFyYW0ge0Fubm90YXRpb258Ym9vbGVhbn0gYW5ub3RhdGlvbiB0cnVlIC0gdXNlIGRlZmF1bHQgYW5ub3RhdGlvbiwgZmFsc2UgLSBjb3B5IGFzIGlzXG4gICAgICogQHBhcmFtIHtib29sZWFufSBwcm94eVRyYXAgd2hldGhlciBpdCdzIGNhbGxlZCBmcm9tIHByb3h5IHRyYXBcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbnxudWxsfSB0cnVlIG9uIHN1Y2Nlc3MsIGZhbHNlIG9uIGZhaWx1cmUgKHByb3h5VHJhcCArIG5vbi1jb25maWd1cmFibGUpLCBudWxsIHdoZW4gY2FuY2VsbGVkIGJ5IGludGVyY2VwdG9yXG4gICAgICovXG4gICAgZXh0ZW5kXyhcbiAgICAgICAga2V5OiBQcm9wZXJ0eUtleSxcbiAgICAgICAgZGVzY3JpcHRvcjogUHJvcGVydHlEZXNjcmlwdG9yLFxuICAgICAgICBhbm5vdGF0aW9uOiBBbm5vdGF0aW9uIHwgYm9vbGVhbixcbiAgICAgICAgcHJveHlUcmFwOiBib29sZWFuID0gZmFsc2VcbiAgICApOiBib29sZWFuIHwgbnVsbCB7XG4gICAgICAgIGlmIChhbm5vdGF0aW9uID09PSB0cnVlKSB7XG4gICAgICAgICAgICBhbm5vdGF0aW9uID0gdGhpcy5kZWZhdWx0QW5ub3RhdGlvbl9cbiAgICAgICAgfVxuICAgICAgICBpZiAoYW5ub3RhdGlvbiA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRlZmluZVByb3BlcnR5XyhrZXksIGRlc2NyaXB0b3IsIHByb3h5VHJhcClcbiAgICAgICAgfVxuICAgICAgICBhc3NlcnRBbm5vdGFibGUodGhpcywgYW5ub3RhdGlvbiwga2V5KVxuICAgICAgICBjb25zdCBvdXRjb21lID0gYW5ub3RhdGlvbi5leHRlbmRfKHRoaXMsIGtleSwgZGVzY3JpcHRvciwgcHJveHlUcmFwKVxuICAgICAgICBpZiAob3V0Y29tZSkge1xuICAgICAgICAgICAgcmVjb3JkQW5ub3RhdGlvbkFwcGxpZWQodGhpcywgYW5ub3RhdGlvbiwga2V5KVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvdXRjb21lXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtQcm9wZXJ0eUtleX0ga2V5XG4gICAgICogQHBhcmFtIHtQcm9wZXJ0eURlc2NyaXB0b3J9IGRlc2NyaXB0b3JcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IHByb3h5VHJhcCB3aGV0aGVyIGl0J3MgY2FsbGVkIGZyb20gcHJveHkgdHJhcFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufG51bGx9IHRydWUgb24gc3VjY2VzcywgZmFsc2Ugb24gZmFpbHVyZSAocHJveHlUcmFwICsgbm9uLWNvbmZpZ3VyYWJsZSksIG51bGwgd2hlbiBjYW5jZWxsZWQgYnkgaW50ZXJjZXB0b3JcbiAgICAgKi9cbiAgICBkZWZpbmVQcm9wZXJ0eV8oXG4gICAgICAgIGtleTogUHJvcGVydHlLZXksXG4gICAgICAgIGRlc2NyaXB0b3I6IFByb3BlcnR5RGVzY3JpcHRvcixcbiAgICAgICAgcHJveHlUcmFwOiBib29sZWFuID0gZmFsc2VcbiAgICApOiBib29sZWFuIHwgbnVsbCB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBzdGFydEJhdGNoKClcblxuICAgICAgICAgICAgLy8gRGVsZXRlXG4gICAgICAgICAgICBjb25zdCBkZWxldGVPdXRjb21lID0gdGhpcy5kZWxldGVfKGtleSlcbiAgICAgICAgICAgIGlmICghZGVsZXRlT3V0Y29tZSkge1xuICAgICAgICAgICAgICAgIC8vIEZhaWx1cmUgb3IgaW50ZXJjZXB0ZWRcbiAgICAgICAgICAgICAgICByZXR1cm4gZGVsZXRlT3V0Y29tZVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBBREQgaW50ZXJjZXB0b3JcbiAgICAgICAgICAgIGlmIChoYXNJbnRlcmNlcHRvcnModGhpcykpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjaGFuZ2UgPSBpbnRlcmNlcHRDaGFuZ2U8SU9iamVjdFdpbGxDaGFuZ2U+KHRoaXMsIHtcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiB0aGlzLnByb3h5XyB8fCB0aGlzLnRhcmdldF8sXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IGtleSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogQURELFxuICAgICAgICAgICAgICAgICAgICBuZXdWYWx1ZTogZGVzY3JpcHRvci52YWx1ZVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgaWYgKCFjaGFuZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QgeyBuZXdWYWx1ZSB9ID0gY2hhbmdlIGFzIGFueVxuICAgICAgICAgICAgICAgIGlmIChkZXNjcmlwdG9yLnZhbHVlICE9PSBuZXdWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdG9yID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgLi4uZGVzY3JpcHRvcixcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBuZXdWYWx1ZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBEZWZpbmVcbiAgICAgICAgICAgIGlmIChwcm94eVRyYXApIHtcbiAgICAgICAgICAgICAgICBpZiAoIVJlZmxlY3QuZGVmaW5lUHJvcGVydHkodGhpcy50YXJnZXRfLCBrZXksIGRlc2NyaXB0b3IpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZGVmaW5lUHJvcGVydHkodGhpcy50YXJnZXRfLCBrZXksIGRlc2NyaXB0b3IpXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIE5vdGlmeVxuICAgICAgICAgICAgdGhpcy5ub3RpZnlQcm9wZXJ0eUFkZGl0aW9uXyhrZXksIGRlc2NyaXB0b3IudmFsdWUpXG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICBlbmRCYXRjaCgpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG5cbiAgICAvLyBJZiBvcmlnaW5hbCBkZXNjcmlwdG9yIGJlY29tZXMgcmVsZXZhbnQsIG1vdmUgdGhpcyB0byBhbm5vdGF0aW9uIGRpcmVjdGx5XG4gICAgZGVmaW5lT2JzZXJ2YWJsZVByb3BlcnR5XyhcbiAgICAgICAga2V5OiBQcm9wZXJ0eUtleSxcbiAgICAgICAgdmFsdWU6IGFueSxcbiAgICAgICAgZW5oYW5jZXI6IElFbmhhbmNlcjxhbnk+LFxuICAgICAgICBwcm94eVRyYXA6IGJvb2xlYW4gPSBmYWxzZVxuICAgICk6IGJvb2xlYW4gfCBudWxsIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHN0YXJ0QmF0Y2goKVxuXG4gICAgICAgICAgICAvLyBEZWxldGVcbiAgICAgICAgICAgIGNvbnN0IGRlbGV0ZU91dGNvbWUgPSB0aGlzLmRlbGV0ZV8oa2V5KVxuICAgICAgICAgICAgaWYgKCFkZWxldGVPdXRjb21lKSB7XG4gICAgICAgICAgICAgICAgLy8gRmFpbHVyZSBvciBpbnRlcmNlcHRlZFxuICAgICAgICAgICAgICAgIHJldHVybiBkZWxldGVPdXRjb21lXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEFERCBpbnRlcmNlcHRvclxuICAgICAgICAgICAgaWYgKGhhc0ludGVyY2VwdG9ycyh0aGlzKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNoYW5nZSA9IGludGVyY2VwdENoYW5nZTxJT2JqZWN0V2lsbENoYW5nZT4odGhpcywge1xuICAgICAgICAgICAgICAgICAgICBvYmplY3Q6IHRoaXMucHJveHlfIHx8IHRoaXMudGFyZ2V0XyxcbiAgICAgICAgICAgICAgICAgICAgbmFtZToga2V5LFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBBREQsXG4gICAgICAgICAgICAgICAgICAgIG5ld1ZhbHVlOiB2YWx1ZVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgaWYgKCFjaGFuZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFsdWUgPSAoY2hhbmdlIGFzIGFueSkubmV3VmFsdWVcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgY2FjaGVkRGVzY3JpcHRvciA9IGdldENhY2hlZE9ic2VydmFibGVQcm9wRGVzY3JpcHRvcihrZXkpXG4gICAgICAgICAgICBjb25zdCBkZXNjcmlwdG9yID0ge1xuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogZ2xvYmFsU3RhdGUuc2FmZURlc2NyaXB0b3JzID8gdGhpcy5pc1BsYWluT2JqZWN0XyA6IHRydWUsXG4gICAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBnZXQ6IGNhY2hlZERlc2NyaXB0b3IuZ2V0LFxuICAgICAgICAgICAgICAgIHNldDogY2FjaGVkRGVzY3JpcHRvci5zZXRcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gRGVmaW5lXG4gICAgICAgICAgICBpZiAocHJveHlUcmFwKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFSZWZsZWN0LmRlZmluZVByb3BlcnR5KHRoaXMudGFyZ2V0Xywga2V5LCBkZXNjcmlwdG9yKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRlZmluZVByb3BlcnR5KHRoaXMudGFyZ2V0Xywga2V5LCBkZXNjcmlwdG9yKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBvYnNlcnZhYmxlID0gbmV3IE9ic2VydmFibGVWYWx1ZShcbiAgICAgICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgICAgICBlbmhhbmNlcixcbiAgICAgICAgICAgICAgICBfX0RFVl9fID8gYCR7dGhpcy5uYW1lX30uJHtrZXkudG9TdHJpbmcoKX1gIDogXCJPYnNlcnZhYmxlT2JqZWN0LmtleVwiLFxuICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICApXG5cbiAgICAgICAgICAgIHRoaXMudmFsdWVzXy5zZXQoa2V5LCBvYnNlcnZhYmxlKVxuXG4gICAgICAgICAgICAvLyBOb3RpZnkgKHZhbHVlIHBvc3NpYmx5IGNoYW5nZWQgYnkgT2JzZXJ2YWJsZVZhbHVlKVxuICAgICAgICAgICAgdGhpcy5ub3RpZnlQcm9wZXJ0eUFkZGl0aW9uXyhrZXksIG9ic2VydmFibGUudmFsdWVfKVxuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgZW5kQmF0Y2goKVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuXG4gICAgLy8gSWYgb3JpZ2luYWwgZGVzY3JpcHRvciBiZWNvbWVzIHJlbGV2YW50LCBtb3ZlIHRoaXMgdG8gYW5ub3RhdGlvbiBkaXJlY3RseVxuICAgIGRlZmluZUNvbXB1dGVkUHJvcGVydHlfKFxuICAgICAgICBrZXk6IFByb3BlcnR5S2V5LFxuICAgICAgICBvcHRpb25zOiBJQ29tcHV0ZWRWYWx1ZU9wdGlvbnM8YW55PixcbiAgICAgICAgcHJveHlUcmFwOiBib29sZWFuID0gZmFsc2VcbiAgICApOiBib29sZWFuIHwgbnVsbCB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBzdGFydEJhdGNoKClcblxuICAgICAgICAgICAgLy8gRGVsZXRlXG4gICAgICAgICAgICBjb25zdCBkZWxldGVPdXRjb21lID0gdGhpcy5kZWxldGVfKGtleSlcbiAgICAgICAgICAgIGlmICghZGVsZXRlT3V0Y29tZSkge1xuICAgICAgICAgICAgICAgIC8vIEZhaWx1cmUgb3IgaW50ZXJjZXB0ZWRcbiAgICAgICAgICAgICAgICByZXR1cm4gZGVsZXRlT3V0Y29tZVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBBREQgaW50ZXJjZXB0b3JcbiAgICAgICAgICAgIGlmIChoYXNJbnRlcmNlcHRvcnModGhpcykpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjaGFuZ2UgPSBpbnRlcmNlcHRDaGFuZ2U8SU9iamVjdFdpbGxDaGFuZ2U+KHRoaXMsIHtcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiB0aGlzLnByb3h5XyB8fCB0aGlzLnRhcmdldF8sXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IGtleSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogQURELFxuICAgICAgICAgICAgICAgICAgICBuZXdWYWx1ZTogdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICBpZiAoIWNoYW5nZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9wdGlvbnMubmFtZSB8fD0gX19ERVZfXyA/IGAke3RoaXMubmFtZV99LiR7a2V5LnRvU3RyaW5nKCl9YCA6IFwiT2JzZXJ2YWJsZU9iamVjdC5rZXlcIlxuICAgICAgICAgICAgb3B0aW9ucy5jb250ZXh0ID0gdGhpcy5wcm94eV8gfHwgdGhpcy50YXJnZXRfXG4gICAgICAgICAgICBjb25zdCBjYWNoZWREZXNjcmlwdG9yID0gZ2V0Q2FjaGVkT2JzZXJ2YWJsZVByb3BEZXNjcmlwdG9yKGtleSlcbiAgICAgICAgICAgIGNvbnN0IGRlc2NyaXB0b3IgPSB7XG4gICAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiBnbG9iYWxTdGF0ZS5zYWZlRGVzY3JpcHRvcnMgPyB0aGlzLmlzUGxhaW5PYmplY3RfIDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBnZXQ6IGNhY2hlZERlc2NyaXB0b3IuZ2V0LFxuICAgICAgICAgICAgICAgIHNldDogY2FjaGVkRGVzY3JpcHRvci5zZXRcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gRGVmaW5lXG4gICAgICAgICAgICBpZiAocHJveHlUcmFwKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFSZWZsZWN0LmRlZmluZVByb3BlcnR5KHRoaXMudGFyZ2V0Xywga2V5LCBkZXNjcmlwdG9yKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRlZmluZVByb3BlcnR5KHRoaXMudGFyZ2V0Xywga2V5LCBkZXNjcmlwdG9yKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnZhbHVlc18uc2V0KGtleSwgbmV3IENvbXB1dGVkVmFsdWUob3B0aW9ucykpXG5cbiAgICAgICAgICAgIC8vIE5vdGlmeVxuICAgICAgICAgICAgdGhpcy5ub3RpZnlQcm9wZXJ0eUFkZGl0aW9uXyhrZXksIHVuZGVmaW5lZClcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIGVuZEJhdGNoKClcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7UHJvcGVydHlLZXl9IGtleVxuICAgICAqIEBwYXJhbSB7UHJvcGVydHlEZXNjcmlwdG9yfSBkZXNjcmlwdG9yXG4gICAgICogQHBhcmFtIHtib29sZWFufSBwcm94eVRyYXAgd2hldGhlciBpdCdzIGNhbGxlZCBmcm9tIHByb3h5IHRyYXBcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbnxudWxsfSB0cnVlIG9uIHN1Y2Nlc3MsIGZhbHNlIG9uIGZhaWx1cmUgKHByb3h5VHJhcCArIG5vbi1jb25maWd1cmFibGUpLCBudWxsIHdoZW4gY2FuY2VsbGVkIGJ5IGludGVyY2VwdG9yXG4gICAgICovXG4gICAgZGVsZXRlXyhrZXk6IFByb3BlcnR5S2V5LCBwcm94eVRyYXA6IGJvb2xlYW4gPSBmYWxzZSk6IGJvb2xlYW4gfCBudWxsIHtcbiAgICAgICAgLy8gTm8gc3VjaCBwcm9wXG4gICAgICAgIGlmICghaGFzUHJvcCh0aGlzLnRhcmdldF8sIGtleSkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIH1cblxuICAgICAgICAvLyBJbnRlcmNlcHRcbiAgICAgICAgaWYgKGhhc0ludGVyY2VwdG9ycyh0aGlzKSkge1xuICAgICAgICAgICAgY29uc3QgY2hhbmdlID0gaW50ZXJjZXB0Q2hhbmdlPElPYmplY3RXaWxsQ2hhbmdlPih0aGlzLCB7XG4gICAgICAgICAgICAgICAgb2JqZWN0OiB0aGlzLnByb3h5XyB8fCB0aGlzLnRhcmdldF8sXG4gICAgICAgICAgICAgICAgbmFtZToga2V5LFxuICAgICAgICAgICAgICAgIHR5cGU6IFJFTU9WRVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC8vIENhbmNlbGxlZFxuICAgICAgICAgICAgaWYgKCFjaGFuZ2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gRGVsZXRlXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBzdGFydEJhdGNoKClcbiAgICAgICAgICAgIGNvbnN0IG5vdGlmeSA9IGhhc0xpc3RlbmVycyh0aGlzKVxuICAgICAgICAgICAgY29uc3Qgbm90aWZ5U3B5ID0gX19ERVZfXyAmJiBpc1NweUVuYWJsZWQoKVxuICAgICAgICAgICAgY29uc3Qgb2JzZXJ2YWJsZSA9IHRoaXMudmFsdWVzXy5nZXQoa2V5KVxuICAgICAgICAgICAgLy8gVmFsdWUgbmVlZGVkIGZvciBzcGllcy9saXN0ZW5lcnNcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IHVuZGVmaW5lZFxuICAgICAgICAgICAgLy8gT3B0aW1pemF0aW9uOiBkb24ndCBwdWxsIHRoZSB2YWx1ZSB1bmxlc3Mgd2Ugd2lsbCBuZWVkIGl0XG4gICAgICAgICAgICBpZiAoIW9ic2VydmFibGUgJiYgKG5vdGlmeSB8fCBub3RpZnlTcHkpKSB7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBnZXREZXNjcmlwdG9yKHRoaXMudGFyZ2V0Xywga2V5KT8udmFsdWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGRlbGV0ZSBwcm9wIChkbyBmaXJzdCwgbWF5IGZhaWwpXG4gICAgICAgICAgICBpZiAocHJveHlUcmFwKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFSZWZsZWN0LmRlbGV0ZVByb3BlcnR5KHRoaXMudGFyZ2V0Xywga2V5KSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLnRhcmdldF9ba2V5XVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gQWxsb3cgcmUtYW5ub3RhdGluZyB0aGlzIGZpZWxkXG4gICAgICAgICAgICBpZiAoX19ERVZfXykge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLmFwcGxpZWRBbm5vdGF0aW9uc18hW2tleV1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIENsZWFyIG9ic2VydmFibGVcbiAgICAgICAgICAgIGlmIChvYnNlcnZhYmxlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy52YWx1ZXNfLmRlbGV0ZShrZXkpXG4gICAgICAgICAgICAgICAgLy8gZm9yIGNvbXB1dGVkLCB2YWx1ZSBpcyB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICBpZiAob2JzZXJ2YWJsZSBpbnN0YW5jZW9mIE9ic2VydmFibGVWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IG9ic2VydmFibGUudmFsdWVfXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIE5vdGlmeTogYXV0b3J1bigoKSA9PiBvYmpba2V5XSksIHNlZSAjMTc5NlxuICAgICAgICAgICAgICAgIHByb3BhZ2F0ZUNoYW5nZWQob2JzZXJ2YWJsZSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIE5vdGlmeSBcImtleXMvZW50cmllcy92YWx1ZXNcIiBvYnNlcnZlcnNcbiAgICAgICAgICAgIHRoaXMua2V5c0F0b21fLnJlcG9ydENoYW5nZWQoKVxuXG4gICAgICAgICAgICAvLyBOb3RpZnkgXCJoYXNcIiBvYnNlcnZlcnNcbiAgICAgICAgICAgIC8vIFwiaW5cIiBhcyBpdCBtYXkgc3RpbGwgZXhpc3QgaW4gcHJvdG9cbiAgICAgICAgICAgIHRoaXMucGVuZGluZ0tleXNfPy5nZXQoa2V5KT8uc2V0KGtleSBpbiB0aGlzLnRhcmdldF8pXG5cbiAgICAgICAgICAgIC8vIE5vdGlmeSBzcGllcy9saXN0ZW5lcnNcbiAgICAgICAgICAgIGlmIChub3RpZnkgfHwgbm90aWZ5U3B5KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2hhbmdlOiBJT2JqZWN0RGlkQ2hhbmdlID0ge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBSRU1PVkUsXG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmFibGVLaW5kOiBcIm9iamVjdFwiLFxuICAgICAgICAgICAgICAgICAgICBvYmplY3Q6IHRoaXMucHJveHlfIHx8IHRoaXMudGFyZ2V0XyxcbiAgICAgICAgICAgICAgICAgICAgZGVidWdPYmplY3ROYW1lOiB0aGlzLm5hbWVfLFxuICAgICAgICAgICAgICAgICAgICBvbGRWYWx1ZTogdmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IGtleVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoX19ERVZfXyAmJiBub3RpZnlTcHkpIHtcbiAgICAgICAgICAgICAgICAgICAgc3B5UmVwb3J0U3RhcnQoY2hhbmdlISlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG5vdGlmeSkge1xuICAgICAgICAgICAgICAgICAgICBub3RpZnlMaXN0ZW5lcnModGhpcywgY2hhbmdlKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoX19ERVZfXyAmJiBub3RpZnlTcHkpIHtcbiAgICAgICAgICAgICAgICAgICAgc3B5UmVwb3J0RW5kKClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICBlbmRCYXRjaCgpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBPYnNlcnZlcyB0aGlzIG9iamVjdC4gVHJpZ2dlcnMgZm9yIHRoZSBldmVudHMgJ2FkZCcsICd1cGRhdGUnIGFuZCAnZGVsZXRlJy5cbiAgICAgKiBTZWU6IGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL09iamVjdC9vYnNlcnZlXG4gICAgICogZm9yIGNhbGxiYWNrIGRldGFpbHNcbiAgICAgKi9cbiAgICBvYnNlcnZlXyhjYWxsYmFjazogKGNoYW5nZXM6IElPYmplY3REaWRDaGFuZ2UpID0+IHZvaWQsIGZpcmVJbW1lZGlhdGVseT86IGJvb2xlYW4pOiBMYW1iZGEge1xuICAgICAgICBpZiAoX19ERVZfXyAmJiBmaXJlSW1tZWRpYXRlbHkgPT09IHRydWUpIHtcbiAgICAgICAgICAgIGRpZShcImBvYnNlcnZlYCBkb2Vzbid0IHN1cHBvcnQgdGhlIGZpcmUgaW1tZWRpYXRlbHkgcHJvcGVydHkgZm9yIG9ic2VydmFibGUgb2JqZWN0cy5cIilcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVnaXN0ZXJMaXN0ZW5lcih0aGlzLCBjYWxsYmFjaylcbiAgICB9XG5cbiAgICBpbnRlcmNlcHRfKGhhbmRsZXIpOiBMYW1iZGEge1xuICAgICAgICByZXR1cm4gcmVnaXN0ZXJJbnRlcmNlcHRvcih0aGlzLCBoYW5kbGVyKVxuICAgIH1cblxuICAgIG5vdGlmeVByb3BlcnR5QWRkaXRpb25fKGtleTogUHJvcGVydHlLZXksIHZhbHVlOiBhbnkpIHtcbiAgICAgICAgY29uc3Qgbm90aWZ5ID0gaGFzTGlzdGVuZXJzKHRoaXMpXG4gICAgICAgIGNvbnN0IG5vdGlmeVNweSA9IF9fREVWX18gJiYgaXNTcHlFbmFibGVkKClcbiAgICAgICAgaWYgKG5vdGlmeSB8fCBub3RpZnlTcHkpIHtcbiAgICAgICAgICAgIGNvbnN0IGNoYW5nZTogSU9iamVjdERpZENoYW5nZSB8IG51bGwgPVxuICAgICAgICAgICAgICAgIG5vdGlmeSB8fCBub3RpZnlTcHlcbiAgICAgICAgICAgICAgICAgICAgPyAoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBBREQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG9ic2VydmFibGVLaW5kOiBcIm9iamVjdFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBkZWJ1Z09iamVjdE5hbWU6IHRoaXMubmFtZV8sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdDogdGhpcy5wcm94eV8gfHwgdGhpcy50YXJnZXRfLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBrZXksXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1ZhbHVlOiB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgIH0gYXMgY29uc3QpXG4gICAgICAgICAgICAgICAgICAgIDogbnVsbFxuXG4gICAgICAgICAgICBpZiAoX19ERVZfXyAmJiBub3RpZnlTcHkpIHtcbiAgICAgICAgICAgICAgICBzcHlSZXBvcnRTdGFydChjaGFuZ2UhKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG5vdGlmeSkge1xuICAgICAgICAgICAgICAgIG5vdGlmeUxpc3RlbmVycyh0aGlzLCBjaGFuZ2UpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoX19ERVZfXyAmJiBub3RpZnlTcHkpIHtcbiAgICAgICAgICAgICAgICBzcHlSZXBvcnRFbmQoKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5wZW5kaW5nS2V5c18/LmdldChrZXkpPy5zZXQodHJ1ZSlcblxuICAgICAgICAvLyBOb3RpZnkgXCJrZXlzL2VudHJpZXMvdmFsdWVzXCIgb2JzZXJ2ZXJzXG4gICAgICAgIHRoaXMua2V5c0F0b21fLnJlcG9ydENoYW5nZWQoKVxuICAgIH1cblxuICAgIG93bktleXNfKCk6IEFycmF5TGlrZTxzdHJpbmcgfCBzeW1ib2w+IHtcbiAgICAgICAgdGhpcy5rZXlzQXRvbV8ucmVwb3J0T2JzZXJ2ZWQoKVxuICAgICAgICByZXR1cm4gb3duS2V5cyh0aGlzLnRhcmdldF8pXG4gICAgfVxuXG4gICAga2V5c18oKTogUHJvcGVydHlLZXlbXSB7XG4gICAgICAgIC8vIFJldHVybnMgZW51bWVyYWJsZSAmJiBvd24sIGJ1dCB1bmZvcnR1bmF0ZWx5IGtleXNBdG9tIHdpbGwgcmVwb3J0IG9uIEFOWSBrZXkgY2hhbmdlLlxuICAgICAgICAvLyBUaGVyZSBpcyBubyB3YXkgdG8gZGlzdGluZ3Vpc2ggYmV0d2VlbiBPYmplY3Qua2V5cyhvYmplY3QpIGFuZCBSZWZsZWN0Lm93bktleXMob2JqZWN0KSAtIGJvdGggYXJlIGhhbmRsZWQgYnkgb3duS2V5cyB0cmFwLlxuICAgICAgICAvLyBXZSBjYW4gZWl0aGVyIG92ZXItcmVwb3J0IGluIE9iamVjdC5rZXlzKG9iamVjdCkgb3IgdW5kZXItcmVwb3J0IGluIFJlZmxlY3Qub3duS2V5cyhvYmplY3QpXG4gICAgICAgIC8vIFdlIGNob29zZSB0byBvdmVyLXJlcG9ydCBpbiBPYmplY3Qua2V5cyhvYmplY3QpLCBiZWNhdXNlOlxuICAgICAgICAvLyAtIHR5cGljYWxseSBpdCdzIHVzZWQgd2l0aCBzaW1wbGUgZGF0YSBvYmplY3RzXG4gICAgICAgIC8vIC0gd2hlbiBzeW1ib2xpYy9ub24tZW51bWVyYWJsZSBrZXlzIGFyZSByZWxldmFudCBSZWZsZWN0Lm93bktleXMgd29ya3MgYXMgZXhwZWN0ZWRcbiAgICAgICAgdGhpcy5rZXlzQXRvbV8ucmVwb3J0T2JzZXJ2ZWQoKVxuICAgICAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy50YXJnZXRfKVxuICAgIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBJSXNPYnNlcnZhYmxlT2JqZWN0IHtcbiAgICAkbW9ieDogT2JzZXJ2YWJsZU9iamVjdEFkbWluaXN0cmF0aW9uXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhc09ic2VydmFibGVPYmplY3QoXG4gICAgdGFyZ2V0OiBhbnksXG4gICAgb3B0aW9ucz86IENyZWF0ZU9ic2VydmFibGVPcHRpb25zXG4pOiBJSXNPYnNlcnZhYmxlT2JqZWN0IHtcbiAgICBpZiAoX19ERVZfXyAmJiBvcHRpb25zICYmIGlzT2JzZXJ2YWJsZU9iamVjdCh0YXJnZXQpKSB7XG4gICAgICAgIGRpZShgT3B0aW9ucyBjYW4ndCBiZSBwcm92aWRlZCBmb3IgYWxyZWFkeSBvYnNlcnZhYmxlIG9iamVjdHMuYClcbiAgICB9XG5cbiAgICBpZiAoaGFzUHJvcCh0YXJnZXQsICRtb2J4KSkge1xuICAgICAgICBpZiAoX19ERVZfXyAmJiAhKGdldEFkbWluaXN0cmF0aW9uKHRhcmdldCkgaW5zdGFuY2VvZiBPYnNlcnZhYmxlT2JqZWN0QWRtaW5pc3RyYXRpb24pKSB7XG4gICAgICAgICAgICBkaWUoXG4gICAgICAgICAgICAgICAgYENhbm5vdCBjb252ZXJ0ICcke2dldERlYnVnTmFtZSh0YXJnZXQpfScgaW50byBvYnNlcnZhYmxlIG9iamVjdDpgICtcbiAgICAgICAgICAgICAgICAgICAgYFxcblRoZSB0YXJnZXQgaXMgYWxyZWFkeSBvYnNlcnZhYmxlIG9mIGRpZmZlcmVudCB0eXBlLmAgK1xuICAgICAgICAgICAgICAgICAgICBgXFxuRXh0ZW5kaW5nIGJ1aWx0aW5zIGlzIG5vdCBzdXBwb3J0ZWQuYFxuICAgICAgICAgICAgKVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0YXJnZXRcbiAgICB9XG5cbiAgICBpZiAoX19ERVZfXyAmJiAhT2JqZWN0LmlzRXh0ZW5zaWJsZSh0YXJnZXQpKSB7XG4gICAgICAgIGRpZShcIkNhbm5vdCBtYWtlIHRoZSBkZXNpZ25hdGVkIG9iamVjdCBvYnNlcnZhYmxlOyBpdCBpcyBub3QgZXh0ZW5zaWJsZVwiKVxuICAgIH1cblxuICAgIGNvbnN0IG5hbWUgPVxuICAgICAgICBvcHRpb25zPy5uYW1lID8/XG4gICAgICAgIChfX0RFVl9fXG4gICAgICAgICAgICA/IGAke1xuICAgICAgICAgICAgICAgICAgaXNQbGFpbk9iamVjdCh0YXJnZXQpID8gXCJPYnNlcnZhYmxlT2JqZWN0XCIgOiB0YXJnZXQuY29uc3RydWN0b3IubmFtZVxuICAgICAgICAgICAgICB9QCR7Z2V0TmV4dElkKCl9YFxuICAgICAgICAgICAgOiBcIk9ic2VydmFibGVPYmplY3RcIilcblxuICAgIGNvbnN0IGFkbSA9IG5ldyBPYnNlcnZhYmxlT2JqZWN0QWRtaW5pc3RyYXRpb24oXG4gICAgICAgIHRhcmdldCxcbiAgICAgICAgbmV3IE1hcCgpLFxuICAgICAgICBTdHJpbmcobmFtZSksXG4gICAgICAgIGdldEFubm90YXRpb25Gcm9tT3B0aW9ucyhvcHRpb25zKVxuICAgIClcblxuICAgIGFkZEhpZGRlblByb3AodGFyZ2V0LCAkbW9ieCwgYWRtKVxuXG4gICAgcmV0dXJuIHRhcmdldFxufVxuXG5jb25zdCBpc09ic2VydmFibGVPYmplY3RBZG1pbmlzdHJhdGlvbiA9IGNyZWF0ZUluc3RhbmNlb2ZQcmVkaWNhdGUoXG4gICAgXCJPYnNlcnZhYmxlT2JqZWN0QWRtaW5pc3RyYXRpb25cIixcbiAgICBPYnNlcnZhYmxlT2JqZWN0QWRtaW5pc3RyYXRpb25cbilcblxuZnVuY3Rpb24gZ2V0Q2FjaGVkT2JzZXJ2YWJsZVByb3BEZXNjcmlwdG9yKGtleSkge1xuICAgIHJldHVybiAoXG4gICAgICAgIGRlc2NyaXB0b3JDYWNoZVtrZXldIHx8XG4gICAgICAgIChkZXNjcmlwdG9yQ2FjaGVba2V5XSA9IHtcbiAgICAgICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpc1skbW9ieF0uZ2V0T2JzZXJ2YWJsZVByb3BWYWx1ZV8oa2V5KVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldCh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzWyRtb2J4XS5zZXRPYnNlcnZhYmxlUHJvcFZhbHVlXyhrZXksIHZhbHVlKVxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzT2JzZXJ2YWJsZU9iamVjdCh0aGluZzogYW55KTogYm9vbGVhbiB7XG4gICAgaWYgKGlzT2JqZWN0KHRoaW5nKSkge1xuICAgICAgICByZXR1cm4gaXNPYnNlcnZhYmxlT2JqZWN0QWRtaW5pc3RyYXRpb24oKHRoaW5nIGFzIGFueSlbJG1vYnhdKVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2Vcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlY29yZEFubm90YXRpb25BcHBsaWVkKFxuICAgIGFkbTogT2JzZXJ2YWJsZU9iamVjdEFkbWluaXN0cmF0aW9uLFxuICAgIGFubm90YXRpb246IEFubm90YXRpb24sXG4gICAga2V5OiBQcm9wZXJ0eUtleVxuKSB7XG4gICAgaWYgKF9fREVWX18pIHtcbiAgICAgICAgYWRtLmFwcGxpZWRBbm5vdGF0aW9uc18hW2tleV0gPSBhbm5vdGF0aW9uXG4gICAgfVxuICAgIC8vIFJlbW92ZSBhcHBsaWVkIGRlY29yYXRvciBhbm5vdGF0aW9uIHNvIHdlIGRvbid0IHRyeSB0byBhcHBseSBpdCBhZ2FpbiBpbiBzdWJjbGFzcyBjb25zdHJ1Y3RvclxuICAgIGRlbGV0ZSBhZG0udGFyZ2V0X1tzdG9yZWRBbm5vdGF0aW9uc1N5bWJvbF0/LltrZXldXG59XG5cbmZ1bmN0aW9uIGFzc2VydEFubm90YWJsZShcbiAgICBhZG06IE9ic2VydmFibGVPYmplY3RBZG1pbmlzdHJhdGlvbixcbiAgICBhbm5vdGF0aW9uOiBBbm5vdGF0aW9uLFxuICAgIGtleTogUHJvcGVydHlLZXlcbikge1xuICAgIC8vIFZhbGlkIGFubm90YXRpb25cbiAgICBpZiAoX19ERVZfXyAmJiAhaXNBbm5vdGF0aW9uKGFubm90YXRpb24pKSB7XG4gICAgICAgIGRpZShgQ2Fubm90IGFubm90YXRlICcke2FkbS5uYW1lX30uJHtrZXkudG9TdHJpbmcoKX0nOiBJbnZhbGlkIGFubm90YXRpb24uYClcbiAgICB9XG5cbiAgICAvKlxuICAgIC8vIENvbmZpZ3VyYWJsZSwgbm90IHNlYWxlZCwgbm90IGZyb3plblxuICAgIC8vIFBvc3NpYmx5IG5vdCBuZWVkZWQsIGp1c3QgYSBsaXR0bGUgYmV0dGVyIGVycm9yIHRoZW4gdGhlIG9uZSB0aHJvd24gYnkgZW5naW5lLlxuICAgIC8vIENhc2VzIHdoZXJlIHRoaXMgd291bGQgYmUgdXNlZnVsIHRoZSBtb3N0IChzdWJjbGFzcyBmaWVsZCBpbml0aWFsaXplcikgYXJlIG5vdCBpbnRlcmNlcHRhYmxlIGJ5IHRoaXMuXG4gICAgaWYgKF9fREVWX18pIHtcbiAgICAgICAgY29uc3QgY29uZmlndXJhYmxlID0gZ2V0RGVzY3JpcHRvcihhZG0udGFyZ2V0Xywga2V5KT8uY29uZmlndXJhYmxlXG4gICAgICAgIGNvbnN0IGZyb3plbiA9IE9iamVjdC5pc0Zyb3plbihhZG0udGFyZ2V0XylcbiAgICAgICAgY29uc3Qgc2VhbGVkID0gT2JqZWN0LmlzU2VhbGVkKGFkbS50YXJnZXRfKVxuICAgICAgICBpZiAoIWNvbmZpZ3VyYWJsZSB8fCBmcm96ZW4gfHwgc2VhbGVkKSB7XG4gICAgICAgICAgICBjb25zdCBmaWVsZE5hbWUgPSBgJHthZG0ubmFtZV99LiR7a2V5LnRvU3RyaW5nKCl9YFxuICAgICAgICAgICAgY29uc3QgcmVxdWVzdGVkQW5ub3RhdGlvblR5cGUgPSBhbm5vdGF0aW9uLmFubm90YXRpb25UeXBlX1xuICAgICAgICAgICAgbGV0IGVycm9yID0gYENhbm5vdCBhcHBseSAnJHtyZXF1ZXN0ZWRBbm5vdGF0aW9uVHlwZX0nIHRvICcke2ZpZWxkTmFtZX0nOmBcbiAgICAgICAgICAgIGlmIChmcm96ZW4pIHtcbiAgICAgICAgICAgICAgICBlcnJvciArPSBgXFxuT2JqZWN0IGlzIGZyb3plbi5gXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc2VhbGVkKSB7XG4gICAgICAgICAgICAgICAgZXJyb3IgKz0gYFxcbk9iamVjdCBpcyBzZWFsZWQuYFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFjb25maWd1cmFibGUpIHtcbiAgICAgICAgICAgICAgICBlcnJvciArPSBgXFxucHJvcGVydHkgaXMgbm90IGNvbmZpZ3VyYWJsZS5gXG4gICAgICAgICAgICAgICAgLy8gTWVudGlvbiBvbmx5IGlmIGNhdXNlZCBieSB1cyB0byBhdm9pZCBjb25mdXNpb25cbiAgICAgICAgICAgICAgICBpZiAoaGFzUHJvcChhZG0uYXBwbGllZEFubm90YXRpb25zISwga2V5KSkge1xuICAgICAgICAgICAgICAgICAgICBlcnJvciArPSBgXFxuVG8gcHJldmVudCBhY2NpZGVudGFsIHJlLWRlZmluaXRpb24gb2YgYSBmaWVsZCBieSBhIHN1YmNsYXNzLCBgXG4gICAgICAgICAgICAgICAgICAgIGVycm9yICs9IGBhbGwgYW5ub3RhdGVkIGZpZWxkcyBvZiBub24tcGxhaW4gb2JqZWN0cyAoY2xhc3NlcykgYXJlIG5vdCBjb25maWd1cmFibGUuYFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRpZShlcnJvcilcbiAgICAgICAgfVxuICAgIH1cbiAgICAqL1xuXG4gICAgLy8gTm90IGFubm90YXRlZFxuICAgIGlmIChfX0RFVl9fICYmICFpc092ZXJyaWRlKGFubm90YXRpb24pICYmIGhhc1Byb3AoYWRtLmFwcGxpZWRBbm5vdGF0aW9uc18hLCBrZXkpKSB7XG4gICAgICAgIGNvbnN0IGZpZWxkTmFtZSA9IGAke2FkbS5uYW1lX30uJHtrZXkudG9TdHJpbmcoKX1gXG4gICAgICAgIGNvbnN0IGN1cnJlbnRBbm5vdGF0aW9uVHlwZSA9IGFkbS5hcHBsaWVkQW5ub3RhdGlvbnNfIVtrZXldLmFubm90YXRpb25UeXBlX1xuICAgICAgICBjb25zdCByZXF1ZXN0ZWRBbm5vdGF0aW9uVHlwZSA9IGFubm90YXRpb24uYW5ub3RhdGlvblR5cGVfXG4gICAgICAgIGRpZShcbiAgICAgICAgICAgIGBDYW5ub3QgYXBwbHkgJyR7cmVxdWVzdGVkQW5ub3RhdGlvblR5cGV9JyB0byAnJHtmaWVsZE5hbWV9JzpgICtcbiAgICAgICAgICAgICAgICBgXFxuVGhlIGZpZWxkIGlzIGFscmVhZHkgYW5ub3RhdGVkIHdpdGggJyR7Y3VycmVudEFubm90YXRpb25UeXBlfScuYCArXG4gICAgICAgICAgICAgICAgYFxcblJlLWFubm90YXRpbmcgZmllbGRzIGlzIG5vdCBhbGxvd2VkLmAgK1xuICAgICAgICAgICAgICAgIGBcXG5Vc2UgJ292ZXJyaWRlJyBhbm5vdGF0aW9uIGZvciBtZXRob2RzIG92ZXJyaWRkZW4gYnkgc3ViY2xhc3MuYFxuICAgICAgICApXG4gICAgfVxufVxuIiwiaW1wb3J0IHtcbiAgICBnZXROZXh0SWQsXG4gICAgYWRkSGlkZGVuRmluYWxQcm9wLFxuICAgIGFsbG93U3RhdGVDaGFuZ2VzU3RhcnQsXG4gICAgYWxsb3dTdGF0ZUNoYW5nZXNFbmQsXG4gICAgbWFrZUl0ZXJhYmxlLFxuICAgIGFkZEhpZGRlblByb3AsXG4gICAgT2JzZXJ2YWJsZUFycmF5QWRtaW5pc3RyYXRpb24sXG4gICAgJG1vYngsXG4gICAgYXJyYXlFeHRlbnNpb25zLFxuICAgIElFbmhhbmNlcixcbiAgICBpc09ic2VydmFibGVBcnJheSxcbiAgICBJT2JzZXJ2YWJsZUFycmF5LFxuICAgIGRlZmluZVByb3BlcnR5XG59IGZyb20gXCIuLi9pbnRlcm5hbFwiXG5cbi8vIEJ1ZyBpbiBzYWZhcmkgOS4qIChvciBpT1MgOSBzYWZhcmkgbW9iaWxlKS4gU2VlICMzNjRcbmNvbnN0IEVOVFJZXzAgPSBjcmVhdGVBcnJheUVudHJ5RGVzY3JpcHRvcigwKVxuXG5jb25zdCBzYWZhcmlQcm90b3R5cGVTZXR0ZXJJbmhlcml0YW5jZUJ1ZyA9ICgoKSA9PiB7XG4gICAgbGV0IHYgPSBmYWxzZVxuICAgIGNvbnN0IHAgPSB7fVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShwLCBcIjBcIiwge1xuICAgICAgICBzZXQ6ICgpID0+IHtcbiAgICAgICAgICAgIHYgPSB0cnVlXG4gICAgICAgIH1cbiAgICB9KVxuICAgIE9iamVjdC5jcmVhdGUocClbXCIwXCJdID0gMVxuICAgIHJldHVybiB2ID09PSBmYWxzZVxufSkoKVxuXG4vKipcbiAqIFRoaXMgYXJyYXkgYnVmZmVyIGNvbnRhaW5zIHR3byBsaXN0cyBvZiBwcm9wZXJ0aWVzLCBzbyB0aGF0IGFsbCBhcnJheXNcbiAqIGNhbiByZWN5Y2xlIHRoZWlyIHByb3BlcnR5IGRlZmluaXRpb25zLCB3aGljaCBzaWduaWZpY2FudGx5IGltcHJvdmVzIHBlcmZvcm1hbmNlIG9mIGNyZWF0aW5nXG4gKiBwcm9wZXJ0aWVzIG9uIHRoZSBmbHkuXG4gKi9cbmxldCBPQlNFUlZBQkxFX0FSUkFZX0JVRkZFUl9TSVpFID0gMFxuXG4vLyBUeXBlc2NyaXB0IHdvcmthcm91bmQgdG8gbWFrZSBzdXJlIE9ic2VydmFibGVBcnJheSBleHRlbmRzIEFycmF5XG5jbGFzcyBTdHViQXJyYXkge31cbmZ1bmN0aW9uIGluaGVyaXQoY3RvciwgcHJvdG8pIHtcbiAgICBpZiAoT2JqZWN0LnNldFByb3RvdHlwZU9mKSB7XG4gICAgICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZihjdG9yLnByb3RvdHlwZSwgcHJvdG8pXG4gICAgfSBlbHNlIGlmIChjdG9yLnByb3RvdHlwZS5fX3Byb3RvX18gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjdG9yLnByb3RvdHlwZS5fX3Byb3RvX18gPSBwcm90b1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGN0b3IucHJvdG90eXBlID0gcHJvdG9cbiAgICB9XG59XG5pbmhlcml0KFN0dWJBcnJheSwgQXJyYXkucHJvdG90eXBlKVxuXG4vLyBXZWV4IHByb3RvIGZyZWV6ZSBwcm90ZWN0aW9uIHdhcyBoZXJlLFxuLy8gYnV0IGl0IGlzIHVuY2xlYXIgd2h5IHRoZSBoYWNrIGlzIG5lZWQgYXMgTW9iWCBuZXZlciBjaGFuZ2VkIHRoZSBwcm90b3R5cGVcbi8vIGFueXdheSwgc28gcmVtb3ZlZCBpdCBpbiBWNlxuXG5jbGFzcyBMZWdhY3lPYnNlcnZhYmxlQXJyYXk8VD4gZXh0ZW5kcyBTdHViQXJyYXkge1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBpbml0aWFsVmFsdWVzOiBUW10gfCB1bmRlZmluZWQsXG4gICAgICAgIGVuaGFuY2VyOiBJRW5oYW5jZXI8VD4sXG4gICAgICAgIG5hbWUgPSBfX0RFVl9fID8gXCJPYnNlcnZhYmxlQXJyYXlAXCIgKyBnZXROZXh0SWQoKSA6IFwiT2JzZXJ2YWJsZUFycmF5XCIsXG4gICAgICAgIG93bmVkID0gZmFsc2VcbiAgICApIHtcbiAgICAgICAgc3VwZXIoKVxuXG4gICAgICAgIGNvbnN0IGFkbSA9IG5ldyBPYnNlcnZhYmxlQXJyYXlBZG1pbmlzdHJhdGlvbihuYW1lLCBlbmhhbmNlciwgb3duZWQsIHRydWUpXG4gICAgICAgIGFkbS5wcm94eV8gPSB0aGlzIGFzIGFueVxuICAgICAgICBhZGRIaWRkZW5GaW5hbFByb3AodGhpcywgJG1vYngsIGFkbSlcblxuICAgICAgICBpZiAoaW5pdGlhbFZhbHVlcyAmJiBpbml0aWFsVmFsdWVzLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc3QgcHJldiA9IGFsbG93U3RhdGVDaGFuZ2VzU3RhcnQodHJ1ZSlcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIHRoaXMuc3BsaWNlV2l0aEFycmF5KDAsIDAsIGluaXRpYWxWYWx1ZXMpXG4gICAgICAgICAgICBhbGxvd1N0YXRlQ2hhbmdlc0VuZChwcmV2KVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNhZmFyaVByb3RvdHlwZVNldHRlckluaGVyaXRhbmNlQnVnKSB7XG4gICAgICAgICAgICAvLyBTZWVtcyB0aGF0IFNhZmFyaSB3b24ndCB1c2UgbnVtZXJpYyBwcm90b3R5cGUgc2V0dGVyIHVudGlsbCBhbnkgKiBudW1lcmljIHByb3BlcnR5IGlzXG4gICAgICAgICAgICAvLyBkZWZpbmVkIG9uIHRoZSBpbnN0YW5jZS4gQWZ0ZXIgdGhhdCBpdCB3b3JrcyBmaW5lLCBldmVuIGlmIHRoaXMgcHJvcGVydHkgaXMgZGVsZXRlZC5cbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBcIjBcIiwgRU5UUllfMClcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbmNhdCguLi5hcnJheXM6IFRbXVtdKTogVFtdIHtcbiAgICAgICAgOyh0aGlzWyRtb2J4XSBhcyBPYnNlcnZhYmxlQXJyYXlBZG1pbmlzdHJhdGlvbikuYXRvbV8ucmVwb3J0T2JzZXJ2ZWQoKVxuICAgICAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLmNvbmNhdC5hcHBseShcbiAgICAgICAgICAgICh0aGlzIGFzIGFueSkuc2xpY2UoKSxcbiAgICAgICAgICAgIC8vQHRzLWlnbm9yZVxuICAgICAgICAgICAgYXJyYXlzLm1hcChhID0+IChpc09ic2VydmFibGVBcnJheShhKSA/IGEuc2xpY2UoKSA6IGEpKVxuICAgICAgICApXG4gICAgfVxuXG4gICAgZ2V0IGxlbmd0aCgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gKHRoaXNbJG1vYnhdIGFzIE9ic2VydmFibGVBcnJheUFkbWluaXN0cmF0aW9uKS5nZXRBcnJheUxlbmd0aF8oKVxuICAgIH1cblxuICAgIHNldCBsZW5ndGgobmV3TGVuZ3RoOiBudW1iZXIpIHtcbiAgICAgICAgOyh0aGlzWyRtb2J4XSBhcyBPYnNlcnZhYmxlQXJyYXlBZG1pbmlzdHJhdGlvbikuc2V0QXJyYXlMZW5ndGhfKG5ld0xlbmd0aClcbiAgICB9XG5cbiAgICBnZXQgW1N5bWJvbC50b1N0cmluZ1RhZ10oKSB7XG4gICAgICAgIHJldHVybiBcIkFycmF5XCJcbiAgICB9XG5cbiAgICBbU3ltYm9sLml0ZXJhdG9yXSgpIHtcbiAgICAgICAgY29uc3Qgc2VsZiA9IHRoaXNcbiAgICAgICAgbGV0IG5leHRJbmRleCA9IDBcbiAgICAgICAgcmV0dXJuIG1ha2VJdGVyYWJsZSh7XG4gICAgICAgICAgICBuZXh0KCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXh0SW5kZXggPCBzZWxmLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICA/IHsgdmFsdWU6IHNlbGZbbmV4dEluZGV4KytdLCBkb25lOiBmYWxzZSB9XG4gICAgICAgICAgICAgICAgICAgIDogeyBkb25lOiB0cnVlLCB2YWx1ZTogdW5kZWZpbmVkIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9XG59XG5cbk9iamVjdC5lbnRyaWVzKGFycmF5RXh0ZW5zaW9ucykuZm9yRWFjaCgoW3Byb3AsIGZuXSkgPT4ge1xuICAgIGlmIChwcm9wICE9PSBcImNvbmNhdFwiKSB7XG4gICAgICAgIGFkZEhpZGRlblByb3AoTGVnYWN5T2JzZXJ2YWJsZUFycmF5LnByb3RvdHlwZSwgcHJvcCwgZm4pXG4gICAgfVxufSlcblxuZnVuY3Rpb24gY3JlYXRlQXJyYXlFbnRyeURlc2NyaXB0b3IoaW5kZXg6IG51bWJlcikge1xuICAgIHJldHVybiB7XG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXNbJG1vYnhdLmdldF8oaW5kZXgpXG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzWyRtb2J4XS5zZXRfKGluZGV4LCB2YWx1ZSlcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlQXJyYXlCdWZmZXJJdGVtKGluZGV4OiBudW1iZXIpIHtcbiAgICBkZWZpbmVQcm9wZXJ0eShMZWdhY3lPYnNlcnZhYmxlQXJyYXkucHJvdG90eXBlLCBcIlwiICsgaW5kZXgsIGNyZWF0ZUFycmF5RW50cnlEZXNjcmlwdG9yKGluZGV4KSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlc2VydmVBcnJheUJ1ZmZlcihtYXg6IG51bWJlcikge1xuICAgIGlmIChtYXggPiBPQlNFUlZBQkxFX0FSUkFZX0JVRkZFUl9TSVpFKSB7XG4gICAgICAgIGZvciAobGV0IGluZGV4ID0gT0JTRVJWQUJMRV9BUlJBWV9CVUZGRVJfU0laRTsgaW5kZXggPCBtYXggKyAxMDA7IGluZGV4KyspIHtcbiAgICAgICAgICAgIGNyZWF0ZUFycmF5QnVmZmVySXRlbShpbmRleClcbiAgICAgICAgfVxuICAgICAgICBPQlNFUlZBQkxFX0FSUkFZX0JVRkZFUl9TSVpFID0gbWF4XG4gICAgfVxufVxuXG5yZXNlcnZlQXJyYXlCdWZmZXIoMTAwMClcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUxlZ2FjeUFycmF5PFQ+KFxuICAgIGluaXRpYWxWYWx1ZXM6IFRbXSB8IHVuZGVmaW5lZCxcbiAgICBlbmhhbmNlcjogSUVuaGFuY2VyPFQ+LFxuICAgIG5hbWU/OiBzdHJpbmdcbik6IElPYnNlcnZhYmxlQXJyYXk8VD4ge1xuICAgIHJldHVybiBuZXcgTGVnYWN5T2JzZXJ2YWJsZUFycmF5KGluaXRpYWxWYWx1ZXMsIGVuaGFuY2VyLCBuYW1lKSBhcyBhbnlcbn1cbiIsImltcG9ydCB7IGlzQWN0aW9uIH0gZnJvbSBcIi4uL2FwaS9hY3Rpb25cIlxuaW1wb3J0IHtcbiAgICAkbW9ieCxcbiAgICBJRGVwVHJlZU5vZGUsXG4gICAgaXNBdG9tLFxuICAgIGlzQ29tcHV0ZWRWYWx1ZSxcbiAgICBpc09ic2VydmFibGVBcnJheSxcbiAgICBpc09ic2VydmFibGVNYXAsXG4gICAgaXNPYnNlcnZhYmxlT2JqZWN0LFxuICAgIGlzUmVhY3Rpb24sXG4gICAgaXNPYnNlcnZhYmxlU2V0LFxuICAgIGRpZSxcbiAgICBpc0Z1bmN0aW9uXG59IGZyb20gXCIuLi9pbnRlcm5hbFwiXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRBdG9tKHRoaW5nOiBhbnksIHByb3BlcnR5PzogUHJvcGVydHlLZXkpOiBJRGVwVHJlZU5vZGUge1xuICAgIGlmICh0eXBlb2YgdGhpbmcgPT09IFwib2JqZWN0XCIgJiYgdGhpbmcgIT09IG51bGwpIHtcbiAgICAgICAgaWYgKGlzT2JzZXJ2YWJsZUFycmF5KHRoaW5nKSkge1xuICAgICAgICAgICAgaWYgKHByb3BlcnR5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBkaWUoMjMpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gKHRoaW5nIGFzIGFueSlbJG1vYnhdLmF0b21fXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzT2JzZXJ2YWJsZVNldCh0aGluZykpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGluZy5hdG9tX1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc09ic2VydmFibGVNYXAodGhpbmcpKSB7XG4gICAgICAgICAgICBpZiAocHJvcGVydHkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGluZy5rZXlzQXRvbV9cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IG9ic2VydmFibGUgPSB0aGluZy5kYXRhXy5nZXQocHJvcGVydHkpIHx8IHRoaW5nLmhhc01hcF8uZ2V0KHByb3BlcnR5KVxuICAgICAgICAgICAgaWYgKCFvYnNlcnZhYmxlKSB7XG4gICAgICAgICAgICAgICAgZGllKDI1LCBwcm9wZXJ0eSwgZ2V0RGVidWdOYW1lKHRoaW5nKSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBvYnNlcnZhYmxlXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHByb3BlcnR5ICYmICF0aGluZ1skbW9ieF0pIHtcbiAgICAgICAgICAgIHRoaW5nW3Byb3BlcnR5XVxuICAgICAgICB9IC8vIFNlZSAjMTA3MlxuICAgICAgICBpZiAoaXNPYnNlcnZhYmxlT2JqZWN0KHRoaW5nKSkge1xuICAgICAgICAgICAgaWYgKCFwcm9wZXJ0eSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBkaWUoMjYpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBvYnNlcnZhYmxlID0gKHRoaW5nIGFzIGFueSlbJG1vYnhdLnZhbHVlc18uZ2V0KHByb3BlcnR5KVxuICAgICAgICAgICAgaWYgKCFvYnNlcnZhYmxlKSB7XG4gICAgICAgICAgICAgICAgZGllKDI3LCBwcm9wZXJ0eSwgZ2V0RGVidWdOYW1lKHRoaW5nKSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBvYnNlcnZhYmxlXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzQXRvbSh0aGluZykgfHwgaXNDb21wdXRlZFZhbHVlKHRoaW5nKSB8fCBpc1JlYWN0aW9uKHRoaW5nKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaW5nXG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGlzRnVuY3Rpb24odGhpbmcpKSB7XG4gICAgICAgIGlmIChpc1JlYWN0aW9uKHRoaW5nWyRtb2J4XSkpIHtcbiAgICAgICAgICAgIC8vIGRpc3Bvc2VyIGZ1bmN0aW9uXG4gICAgICAgICAgICByZXR1cm4gdGhpbmdbJG1vYnhdXG4gICAgICAgIH1cbiAgICB9XG4gICAgZGllKDI4KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0QWRtaW5pc3RyYXRpb24odGhpbmc6IGFueSwgcHJvcGVydHk/OiBzdHJpbmcpIHtcbiAgICBpZiAoIXRoaW5nKSB7XG4gICAgICAgIGRpZSgyOSlcbiAgICB9XG4gICAgaWYgKHByb3BlcnR5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIGdldEFkbWluaXN0cmF0aW9uKGdldEF0b20odGhpbmcsIHByb3BlcnR5KSlcbiAgICB9XG4gICAgaWYgKGlzQXRvbSh0aGluZykgfHwgaXNDb21wdXRlZFZhbHVlKHRoaW5nKSB8fCBpc1JlYWN0aW9uKHRoaW5nKSkge1xuICAgICAgICByZXR1cm4gdGhpbmdcbiAgICB9XG4gICAgaWYgKGlzT2JzZXJ2YWJsZU1hcCh0aGluZykgfHwgaXNPYnNlcnZhYmxlU2V0KHRoaW5nKSkge1xuICAgICAgICByZXR1cm4gdGhpbmdcbiAgICB9XG4gICAgaWYgKHRoaW5nWyRtb2J4XSkge1xuICAgICAgICByZXR1cm4gdGhpbmdbJG1vYnhdXG4gICAgfVxuICAgIGRpZSgyNCwgdGhpbmcpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXREZWJ1Z05hbWUodGhpbmc6IGFueSwgcHJvcGVydHk/OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGxldCBuYW1lZFxuICAgIGlmIChwcm9wZXJ0eSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIG5hbWVkID0gZ2V0QXRvbSh0aGluZywgcHJvcGVydHkpXG4gICAgfSBlbHNlIGlmIChpc0FjdGlvbih0aGluZykpIHtcbiAgICAgICAgcmV0dXJuIHRoaW5nLm5hbWVcbiAgICB9IGVsc2UgaWYgKGlzT2JzZXJ2YWJsZU9iamVjdCh0aGluZykgfHwgaXNPYnNlcnZhYmxlTWFwKHRoaW5nKSB8fCBpc09ic2VydmFibGVTZXQodGhpbmcpKSB7XG4gICAgICAgIG5hbWVkID0gZ2V0QWRtaW5pc3RyYXRpb24odGhpbmcpXG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gdmFsaWQgZm9yIGFycmF5cyBhcyB3ZWxsXG4gICAgICAgIG5hbWVkID0gZ2V0QXRvbSh0aGluZylcbiAgICB9XG4gICAgcmV0dXJuIG5hbWVkLm5hbWVfXG59XG4iLCJpbXBvcnQge1xuICAgIGlzRVM2TWFwLFxuICAgIGlzT2JzZXJ2YWJsZUFycmF5LFxuICAgIGlzT2JzZXJ2YWJsZU1hcCxcbiAgICBpc0VTNlNldCxcbiAgICBpc09ic2VydmFibGVTZXQsXG4gICAgaGFzUHJvcCxcbiAgICBpc0Z1bmN0aW9uLFxuICAgIG9iamVjdFByb3RvdHlwZVxufSBmcm9tIFwiLi4vaW50ZXJuYWxcIlxuXG5kZWNsYXJlIGNvbnN0IFN5bWJvbFxuY29uc3QgdG9TdHJpbmcgPSBvYmplY3RQcm90b3R5cGUudG9TdHJpbmdcblxuZXhwb3J0IGZ1bmN0aW9uIGRlZXBFcXVhbChhOiBhbnksIGI6IGFueSwgZGVwdGg6IG51bWJlciA9IC0xKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGVxKGEsIGIsIGRlcHRoKVxufVxuXG4vLyBDb3BpZWQgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vamFzaGtlbmFzL3VuZGVyc2NvcmUvYmxvYi81YzIzN2E3YzY4MmZiNjhmZDUzNzgyMDNmMGJmMjJkY2UxNjI0ODU0L3VuZGVyc2NvcmUuanMjTDExODYtTDEyODlcbi8vIEludGVybmFsIHJlY3Vyc2l2ZSBjb21wYXJpc29uIGZ1bmN0aW9uIGZvciBgaXNFcXVhbGAuXG5mdW5jdGlvbiBlcShhOiBhbnksIGI6IGFueSwgZGVwdGg6IG51bWJlciwgYVN0YWNrPzogYW55W10sIGJTdGFjaz86IGFueVtdKSB7XG4gICAgLy8gSWRlbnRpY2FsIG9iamVjdHMgYXJlIGVxdWFsLiBgMCA9PT0gLTBgLCBidXQgdGhleSBhcmVuJ3QgaWRlbnRpY2FsLlxuICAgIC8vIFNlZSB0aGUgW0hhcm1vbnkgYGVnYWxgIHByb3Bvc2FsXShodHRwOi8vd2lraS5lY21hc2NyaXB0Lm9yZy9kb2t1LnBocD9pZD1oYXJtb255OmVnYWwpLlxuICAgIGlmIChhID09PSBiKSB7XG4gICAgICAgIHJldHVybiBhICE9PSAwIHx8IDEgLyBhID09PSAxIC8gYlxuICAgIH1cbiAgICAvLyBgbnVsbGAgb3IgYHVuZGVmaW5lZGAgb25seSBlcXVhbCB0byBpdHNlbGYgKHN0cmljdCBjb21wYXJpc29uKS5cbiAgICBpZiAoYSA9PSBudWxsIHx8IGIgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gICAgLy8gYE5hTmBzIGFyZSBlcXVpdmFsZW50LCBidXQgbm9uLXJlZmxleGl2ZS5cbiAgICBpZiAoYSAhPT0gYSkge1xuICAgICAgICByZXR1cm4gYiAhPT0gYlxuICAgIH1cbiAgICAvLyBFeGhhdXN0IHByaW1pdGl2ZSBjaGVja3NcbiAgICBjb25zdCB0eXBlID0gdHlwZW9mIGFcbiAgICBpZiAodHlwZSAhPT0gXCJmdW5jdGlvblwiICYmIHR5cGUgIT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIGIgIT0gXCJvYmplY3RcIikge1xuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICAvLyBDb21wYXJlIGBbW0NsYXNzXV1gIG5hbWVzLlxuICAgIGNvbnN0IGNsYXNzTmFtZSA9IHRvU3RyaW5nLmNhbGwoYSlcbiAgICBpZiAoY2xhc3NOYW1lICE9PSB0b1N0cmluZy5jYWxsKGIpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgICBzd2l0Y2ggKGNsYXNzTmFtZSkge1xuICAgICAgICAvLyBTdHJpbmdzLCBudW1iZXJzLCByZWd1bGFyIGV4cHJlc3Npb25zLCBkYXRlcywgYW5kIGJvb2xlYW5zIGFyZSBjb21wYXJlZCBieSB2YWx1ZS5cbiAgICAgICAgY2FzZSBcIltvYmplY3QgUmVnRXhwXVwiOlxuICAgICAgICAvLyBSZWdFeHBzIGFyZSBjb2VyY2VkIHRvIHN0cmluZ3MgZm9yIGNvbXBhcmlzb24gKE5vdGU6ICcnICsgL2EvaSA9PT0gJy9hL2knKVxuICAgICAgICBjYXNlIFwiW29iamVjdCBTdHJpbmddXCI6XG4gICAgICAgICAgICAvLyBQcmltaXRpdmVzIGFuZCB0aGVpciBjb3JyZXNwb25kaW5nIG9iamVjdCB3cmFwcGVycyBhcmUgZXF1aXZhbGVudDsgdGh1cywgYFwiNVwiYCBpc1xuICAgICAgICAgICAgLy8gZXF1aXZhbGVudCB0byBgbmV3IFN0cmluZyhcIjVcIilgLlxuICAgICAgICAgICAgcmV0dXJuIFwiXCIgKyBhID09PSBcIlwiICsgYlxuICAgICAgICBjYXNlIFwiW29iamVjdCBOdW1iZXJdXCI6XG4gICAgICAgICAgICAvLyBgTmFOYHMgYXJlIGVxdWl2YWxlbnQsIGJ1dCBub24tcmVmbGV4aXZlLlxuICAgICAgICAgICAgLy8gT2JqZWN0KE5hTikgaXMgZXF1aXZhbGVudCB0byBOYU4uXG4gICAgICAgICAgICBpZiAoK2EgIT09ICthKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICtiICE9PSArYlxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gQW4gYGVnYWxgIGNvbXBhcmlzb24gaXMgcGVyZm9ybWVkIGZvciBvdGhlciBudW1lcmljIHZhbHVlcy5cbiAgICAgICAgICAgIHJldHVybiArYSA9PT0gMCA/IDEgLyArYSA9PT0gMSAvIGIgOiArYSA9PT0gK2JcbiAgICAgICAgY2FzZSBcIltvYmplY3QgRGF0ZV1cIjpcbiAgICAgICAgY2FzZSBcIltvYmplY3QgQm9vbGVhbl1cIjpcbiAgICAgICAgICAgIC8vIENvZXJjZSBkYXRlcyBhbmQgYm9vbGVhbnMgdG8gbnVtZXJpYyBwcmltaXRpdmUgdmFsdWVzLiBEYXRlcyBhcmUgY29tcGFyZWQgYnkgdGhlaXJcbiAgICAgICAgICAgIC8vIG1pbGxpc2Vjb25kIHJlcHJlc2VudGF0aW9ucy4gTm90ZSB0aGF0IGludmFsaWQgZGF0ZXMgd2l0aCBtaWxsaXNlY29uZCByZXByZXNlbnRhdGlvbnNcbiAgICAgICAgICAgIC8vIG9mIGBOYU5gIGFyZSBub3QgZXF1aXZhbGVudC5cbiAgICAgICAgICAgIHJldHVybiArYSA9PT0gK2JcbiAgICAgICAgY2FzZSBcIltvYmplY3QgU3ltYm9sXVwiOlxuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICB0eXBlb2YgU3ltYm9sICE9PSBcInVuZGVmaW5lZFwiICYmIFN5bWJvbC52YWx1ZU9mLmNhbGwoYSkgPT09IFN5bWJvbC52YWx1ZU9mLmNhbGwoYilcbiAgICAgICAgICAgIClcbiAgICAgICAgY2FzZSBcIltvYmplY3QgTWFwXVwiOlxuICAgICAgICBjYXNlIFwiW29iamVjdCBTZXRdXCI6XG4gICAgICAgICAgICAvLyBNYXBzIGFuZCBTZXRzIGFyZSB1bndyYXBwZWQgdG8gYXJyYXlzIG9mIGVudHJ5LXBhaXJzLCBhZGRpbmcgYW4gaW5jaWRlbnRhbCBsZXZlbC5cbiAgICAgICAgICAgIC8vIEhpZGUgdGhpcyBleHRyYSBsZXZlbCBieSBpbmNyZWFzaW5nIHRoZSBkZXB0aC5cbiAgICAgICAgICAgIGlmIChkZXB0aCA+PSAwKSB7XG4gICAgICAgICAgICAgICAgZGVwdGgrK1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWtcbiAgICB9XG4gICAgLy8gVW53cmFwIGFueSB3cmFwcGVkIG9iamVjdHMuXG4gICAgYSA9IHVud3JhcChhKVxuICAgIGIgPSB1bndyYXAoYilcblxuICAgIGNvbnN0IGFyZUFycmF5cyA9IGNsYXNzTmFtZSA9PT0gXCJbb2JqZWN0IEFycmF5XVwiXG4gICAgaWYgKCFhcmVBcnJheXMpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBhICE9IFwib2JqZWN0XCIgfHwgdHlwZW9mIGIgIT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH1cblxuICAgICAgICAvLyBPYmplY3RzIHdpdGggZGlmZmVyZW50IGNvbnN0cnVjdG9ycyBhcmUgbm90IGVxdWl2YWxlbnQsIGJ1dCBgT2JqZWN0YHMgb3IgYEFycmF5YHNcbiAgICAgICAgLy8gZnJvbSBkaWZmZXJlbnQgZnJhbWVzIGFyZS5cbiAgICAgICAgY29uc3QgYUN0b3IgPSBhLmNvbnN0cnVjdG9yLFxuICAgICAgICAgICAgYkN0b3IgPSBiLmNvbnN0cnVjdG9yXG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIGFDdG9yICE9PSBiQ3RvciAmJlxuICAgICAgICAgICAgIShcbiAgICAgICAgICAgICAgICBpc0Z1bmN0aW9uKGFDdG9yKSAmJlxuICAgICAgICAgICAgICAgIGFDdG9yIGluc3RhbmNlb2YgYUN0b3IgJiZcbiAgICAgICAgICAgICAgICBpc0Z1bmN0aW9uKGJDdG9yKSAmJlxuICAgICAgICAgICAgICAgIGJDdG9yIGluc3RhbmNlb2YgYkN0b3JcbiAgICAgICAgICAgICkgJiZcbiAgICAgICAgICAgIFwiY29uc3RydWN0b3JcIiBpbiBhICYmXG4gICAgICAgICAgICBcImNvbnN0cnVjdG9yXCIgaW4gYlxuICAgICAgICApIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGRlcHRoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgIH0gZWxzZSBpZiAoZGVwdGggPCAwKSB7XG4gICAgICAgIGRlcHRoID0gLTFcbiAgICB9XG5cbiAgICAvLyBBc3N1bWUgZXF1YWxpdHkgZm9yIGN5Y2xpYyBzdHJ1Y3R1cmVzLiBUaGUgYWxnb3JpdGhtIGZvciBkZXRlY3RpbmcgY3ljbGljXG4gICAgLy8gc3RydWN0dXJlcyBpcyBhZGFwdGVkIGZyb20gRVMgNS4xIHNlY3Rpb24gMTUuMTIuMywgYWJzdHJhY3Qgb3BlcmF0aW9uIGBKT2AuXG5cbiAgICAvLyBJbml0aWFsaXppbmcgc3RhY2sgb2YgdHJhdmVyc2VkIG9iamVjdHMuXG4gICAgLy8gSXQncyBkb25lIGhlcmUgc2luY2Ugd2Ugb25seSBuZWVkIHRoZW0gZm9yIG9iamVjdHMgYW5kIGFycmF5cyBjb21wYXJpc29uLlxuICAgIGFTdGFjayA9IGFTdGFjayB8fCBbXVxuICAgIGJTdGFjayA9IGJTdGFjayB8fCBbXVxuICAgIGxldCBsZW5ndGggPSBhU3RhY2subGVuZ3RoXG4gICAgd2hpbGUgKGxlbmd0aC0tKSB7XG4gICAgICAgIC8vIExpbmVhciBzZWFyY2guIFBlcmZvcm1hbmNlIGlzIGludmVyc2VseSBwcm9wb3J0aW9uYWwgdG8gdGhlIG51bWJlciBvZlxuICAgICAgICAvLyB1bmlxdWUgbmVzdGVkIHN0cnVjdHVyZXMuXG4gICAgICAgIGlmIChhU3RhY2tbbGVuZ3RoXSA9PT0gYSkge1xuICAgICAgICAgICAgcmV0dXJuIGJTdGFja1tsZW5ndGhdID09PSBiXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBBZGQgdGhlIGZpcnN0IG9iamVjdCB0byB0aGUgc3RhY2sgb2YgdHJhdmVyc2VkIG9iamVjdHMuXG4gICAgYVN0YWNrLnB1c2goYSlcbiAgICBiU3RhY2sucHVzaChiKVxuXG4gICAgLy8gUmVjdXJzaXZlbHkgY29tcGFyZSBvYmplY3RzIGFuZCBhcnJheXMuXG4gICAgaWYgKGFyZUFycmF5cykge1xuICAgICAgICAvLyBDb21wYXJlIGFycmF5IGxlbmd0aHMgdG8gZGV0ZXJtaW5lIGlmIGEgZGVlcCBjb21wYXJpc29uIGlzIG5lY2Vzc2FyeS5cbiAgICAgICAgbGVuZ3RoID0gYS5sZW5ndGhcbiAgICAgICAgaWYgKGxlbmd0aCAhPT0gYi5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICB9XG4gICAgICAgIC8vIERlZXAgY29tcGFyZSB0aGUgY29udGVudHMsIGlnbm9yaW5nIG5vbi1udW1lcmljIHByb3BlcnRpZXMuXG4gICAgICAgIHdoaWxlIChsZW5ndGgtLSkge1xuICAgICAgICAgICAgaWYgKCFlcShhW2xlbmd0aF0sIGJbbGVuZ3RoXSwgZGVwdGggLSAxLCBhU3RhY2ssIGJTdGFjaykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIERlZXAgY29tcGFyZSBvYmplY3RzLlxuICAgICAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMoYSlcbiAgICAgICAgbGV0IGtleVxuICAgICAgICBsZW5ndGggPSBrZXlzLmxlbmd0aFxuICAgICAgICAvLyBFbnN1cmUgdGhhdCBib3RoIG9iamVjdHMgY29udGFpbiB0aGUgc2FtZSBudW1iZXIgb2YgcHJvcGVydGllcyBiZWZvcmUgY29tcGFyaW5nIGRlZXAgZXF1YWxpdHkuXG4gICAgICAgIGlmIChPYmplY3Qua2V5cyhiKS5sZW5ndGggIT09IGxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH1cbiAgICAgICAgd2hpbGUgKGxlbmd0aC0tKSB7XG4gICAgICAgICAgICAvLyBEZWVwIGNvbXBhcmUgZWFjaCBtZW1iZXJcbiAgICAgICAgICAgIGtleSA9IGtleXNbbGVuZ3RoXVxuICAgICAgICAgICAgaWYgKCEoaGFzUHJvcChiLCBrZXkpICYmIGVxKGFba2V5XSwgYltrZXldLCBkZXB0aCAtIDEsIGFTdGFjaywgYlN0YWNrKSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBSZW1vdmUgdGhlIGZpcnN0IG9iamVjdCBmcm9tIHRoZSBzdGFjayBvZiB0cmF2ZXJzZWQgb2JqZWN0cy5cbiAgICBhU3RhY2sucG9wKClcbiAgICBiU3RhY2sucG9wKClcbiAgICByZXR1cm4gdHJ1ZVxufVxuXG5mdW5jdGlvbiB1bndyYXAoYTogYW55KSB7XG4gICAgaWYgKGlzT2JzZXJ2YWJsZUFycmF5KGEpKSB7XG4gICAgICAgIHJldHVybiBhLnNsaWNlKClcbiAgICB9XG4gICAgaWYgKGlzRVM2TWFwKGEpIHx8IGlzT2JzZXJ2YWJsZU1hcChhKSkge1xuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbShhLmVudHJpZXMoKSlcbiAgICB9XG4gICAgaWYgKGlzRVM2U2V0KGEpIHx8IGlzT2JzZXJ2YWJsZVNldChhKSkge1xuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbShhLmVudHJpZXMoKSlcbiAgICB9XG4gICAgcmV0dXJuIGFcbn1cbiIsImV4cG9ydCBmdW5jdGlvbiBtYWtlSXRlcmFibGU8VD4oaXRlcmF0b3I6IEl0ZXJhdG9yPFQ+KTogSXRlcmFibGVJdGVyYXRvcjxUPiB7XG4gICAgaXRlcmF0b3JbU3ltYm9sLml0ZXJhdG9yXSA9IGdldFNlbGZcbiAgICByZXR1cm4gaXRlcmF0b3IgYXMgYW55XG59XG5cbmZ1bmN0aW9uIGdldFNlbGYoKSB7XG4gICAgcmV0dXJuIHRoaXNcbn1cbiIsImltcG9ydCB7IE9ic2VydmFibGVPYmplY3RBZG1pbmlzdHJhdGlvbiwgaXNGdW5jdGlvbiB9IGZyb20gXCIuLi9pbnRlcm5hbFwiXG5cbmV4cG9ydCBjb25zdCBlbnVtIE1ha2VSZXN1bHQge1xuICAgIENhbmNlbCxcbiAgICBCcmVhayxcbiAgICBDb250aW51ZVxufVxuXG5leHBvcnQgdHlwZSBBbm5vdGF0aW9uID0ge1xuICAgIGFubm90YXRpb25UeXBlXzogc3RyaW5nXG4gICAgbWFrZV8oXG4gICAgICAgIGFkbTogT2JzZXJ2YWJsZU9iamVjdEFkbWluaXN0cmF0aW9uLFxuICAgICAgICBrZXk6IFByb3BlcnR5S2V5LFxuICAgICAgICBkZXNjcmlwdG9yOiBQcm9wZXJ0eURlc2NyaXB0b3IsXG4gICAgICAgIHNvdXJjZTogb2JqZWN0XG4gICAgKTogTWFrZVJlc3VsdFxuICAgIGV4dGVuZF8oXG4gICAgICAgIGFkbTogT2JzZXJ2YWJsZU9iamVjdEFkbWluaXN0cmF0aW9uLFxuICAgICAgICBrZXk6IFByb3BlcnR5S2V5LFxuICAgICAgICBkZXNjcmlwdG9yOiBQcm9wZXJ0eURlc2NyaXB0b3IsXG4gICAgICAgIHByb3h5VHJhcDogYm9vbGVhblxuICAgICk6IGJvb2xlYW4gfCBudWxsXG4gICAgb3B0aW9uc18/OiBhbnlcbn1cblxuZXhwb3J0IHR5cGUgQW5ub3RhdGlvbk1hcEVudHJ5ID1cbiAgICB8IEFubm90YXRpb25cbiAgICB8IHRydWUgLyogZm9sbG93IHRoZSBkZWZhdWx0IGRlY29yYXRvciwgdXN1YWxseSBkZWVwICovXG4gICAgfCBmYWxzZSAvKiBkb24ndCBkZWNvcmF0ZSB0aGlzIHByb3BlcnR5ICovXG5cbi8vIEFkZGl0aW9uYWxGaWVsZHMgY2FuIGJlIHVzZWQgdG8gZGVjbGFyZSBhZGRpdGlvbmFsIGtleXMgdGhhdCBjYW4gYmUgdXNlZCwgZm9yIGV4YW1wbGUgdG8gYmUgYWJsZSB0b1xuLy8gZGVjbGFyZSBhbm5vdGF0aW9ucyBmb3IgcHJpdmF0ZS8gcHJvdGVjdGVkIG1lbWJlcnMsIHNlZSAjMjMzOVxuZXhwb3J0IHR5cGUgQW5ub3RhdGlvbnNNYXA8VCwgQWRkaXRpb25hbEZpZWxkcyBleHRlbmRzIFByb3BlcnR5S2V5PiA9IHtcbiAgICBbUCBpbiBFeGNsdWRlPGtleW9mIFQsIFwidG9TdHJpbmdcIj5dPzogQW5ub3RhdGlvbk1hcEVudHJ5XG59ICYgUmVjb3JkPEFkZGl0aW9uYWxGaWVsZHMsIEFubm90YXRpb25NYXBFbnRyeT5cblxuZXhwb3J0IGZ1bmN0aW9uIGlzQW5ub3RhdGlvbih0aGluZzogYW55KSB7XG4gICAgcmV0dXJuIChcbiAgICAgICAgLy8gQ2FuIGJlIGZ1bmN0aW9uXG4gICAgICAgIHRoaW5nIGluc3RhbmNlb2YgT2JqZWN0ICYmXG4gICAgICAgIHR5cGVvZiB0aGluZy5hbm5vdGF0aW9uVHlwZV8gPT09IFwic3RyaW5nXCIgJiZcbiAgICAgICAgaXNGdW5jdGlvbih0aGluZy5tYWtlXykgJiZcbiAgICAgICAgaXNGdW5jdGlvbih0aGluZy5leHRlbmRfKVxuICAgIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzQW5ub3RhdGlvbk1hcEVudHJ5KHRoaW5nOiBhbnkpIHtcbiAgICByZXR1cm4gdHlwZW9mIHRoaW5nID09PSBcImJvb2xlYW5cIiB8fCBpc0Fubm90YXRpb24odGhpbmcpXG59XG4iLCIvKipcbiAqIChjKSBNaWNoZWwgV2VzdHN0cmF0ZSAyMDE1IC0gMjAyMFxuICogTUlUIExpY2Vuc2VkXG4gKlxuICogV2VsY29tZSB0byB0aGUgbW9ieCBzb3VyY2VzISBUbyBnZXQgYSBnbG9iYWwgb3ZlcnZpZXcgb2YgaG93IE1vYlggaW50ZXJuYWxseSB3b3JrcyxcbiAqIHRoaXMgaXMgYSBnb29kIHBsYWNlIHRvIHN0YXJ0OlxuICogaHR0cHM6Ly9tZWRpdW0uY29tL0Btd2VzdHN0cmF0ZS9iZWNvbWluZy1mdWxseS1yZWFjdGl2ZS1hbi1pbi1kZXB0aC1leHBsYW5hdGlvbi1vZi1tb2JzZXJ2YWJsZS01NTk5NTI2MmEyNTQjLnh2Ymg2cWQ3NFxuICpcbiAqIFNvdXJjZSBmb2xkZXJzOlxuICogPT09PT09PT09PT09PT09XG4gKlxuICogLSBhcGkvICAgICBNb3N0IG9mIHRoZSBwdWJsaWMgc3RhdGljIG1ldGhvZHMgZXhwb3NlZCBieSB0aGUgbW9kdWxlIGNhbiBiZSBmb3VuZCBoZXJlLlxuICogLSBjb3JlLyAgICBJbXBsZW1lbnRhdGlvbiBvZiB0aGUgTW9iWCBhbGdvcml0aG07IGF0b21zLCBkZXJpdmF0aW9ucywgcmVhY3Rpb25zLCBkZXBlbmRlbmN5IHRyZWVzLCBvcHRpbWl6YXRpb25zLiBDb29sIHN0dWZmIGNhbiBiZSBmb3VuZCBoZXJlLlxuICogLSB0eXBlcy8gICBBbGwgdGhlIG1hZ2ljIHRoYXQgaXMgbmVlZCB0byBoYXZlIG9ic2VydmFibGUgb2JqZWN0cywgYXJyYXlzIGFuZCB2YWx1ZXMgaXMgaW4gdGhpcyBmb2xkZXIuIEluY2x1ZGluZyB0aGUgbW9kaWZpZXJzIGxpa2UgYGFzRmxhdGAuXG4gKiAtIHV0aWxzLyAgIFV0aWxpdHkgc3R1ZmYuXG4gKlxuICovXG5pbXBvcnQgeyBkaWUgfSBmcm9tIFwiLi9lcnJvcnNcIlxuaW1wb3J0IHsgZ2V0R2xvYmFsIH0gZnJvbSBcIi4vdXRpbHMvZ2xvYmFsXCJcbjtbXCJTeW1ib2xcIiwgXCJNYXBcIiwgXCJTZXRcIl0uZm9yRWFjaChtID0+IHtcbiAgICBsZXQgZyA9IGdldEdsb2JhbCgpXG4gICAgaWYgKHR5cGVvZiBnW21dID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIGRpZShgTW9iWCByZXF1aXJlcyBnbG9iYWwgJyR7bX0nIHRvIGJlIGF2YWlsYWJsZSBvciBwb2x5ZmlsbGVkYClcbiAgICB9XG59KVxuXG5pbXBvcnQgeyBzcHksIGdldERlYnVnTmFtZSwgJG1vYnggfSBmcm9tIFwiLi9pbnRlcm5hbFwiXG5cbmV4cG9ydCB7XG4gICAgSU9ic2VydmFibGUsXG4gICAgSURlcFRyZWVOb2RlLFxuICAgIFJlYWN0aW9uLFxuICAgIElSZWFjdGlvblB1YmxpYyxcbiAgICBJUmVhY3Rpb25EaXNwb3NlcixcbiAgICB1bnRyYWNrZWQsXG4gICAgSUF0b20sXG4gICAgY3JlYXRlQXRvbSxcbiAgICBzcHksXG4gICAgSUNvbXB1dGVkVmFsdWUsXG4gICAgSUVxdWFsc0NvbXBhcmVyLFxuICAgIGNvbXBhcmVyLFxuICAgIElFbmhhbmNlcixcbiAgICBJSW50ZXJjZXB0YWJsZSxcbiAgICBJSW50ZXJjZXB0b3IsXG4gICAgSUxpc3RlbmFibGUsXG4gICAgSU9iamVjdFdpbGxDaGFuZ2UsXG4gICAgSU9iamVjdERpZENoYW5nZSxcbiAgICBpc09ic2VydmFibGVPYmplY3QsXG4gICAgSVZhbHVlRGlkQ2hhbmdlLFxuICAgIElWYWx1ZVdpbGxDaGFuZ2UsXG4gICAgSU9ic2VydmFibGVWYWx1ZSxcbiAgICBpc09ic2VydmFibGVWYWx1ZSBhcyBpc0JveGVkT2JzZXJ2YWJsZSxcbiAgICBJT2JzZXJ2YWJsZUFycmF5LFxuICAgIElBcnJheVdpbGxDaGFuZ2UsXG4gICAgSUFycmF5V2lsbFNwbGljZSxcbiAgICBJQXJyYXlTcGxpY2UsXG4gICAgSUFycmF5VXBkYXRlLFxuICAgIElBcnJheURpZENoYW5nZSxcbiAgICBpc09ic2VydmFibGVBcnJheSxcbiAgICBJS2V5VmFsdWVNYXAsXG4gICAgT2JzZXJ2YWJsZU1hcCxcbiAgICBJTWFwRW50cmllcyxcbiAgICBJTWFwRW50cnksXG4gICAgSU1hcFdpbGxDaGFuZ2UsXG4gICAgSU1hcERpZENoYW5nZSxcbiAgICBpc09ic2VydmFibGVNYXAsXG4gICAgSU9ic2VydmFibGVNYXBJbml0aWFsVmFsdWVzLFxuICAgIE9ic2VydmFibGVTZXQsXG4gICAgaXNPYnNlcnZhYmxlU2V0LFxuICAgIElTZXREaWRDaGFuZ2UsXG4gICAgSVNldFdpbGxDaGFuZ2UsXG4gICAgSU9ic2VydmFibGVTZXRJbml0aWFsVmFsdWVzLFxuICAgIHRyYW5zYWN0aW9uLFxuICAgIG9ic2VydmFibGUsXG4gICAgSU9ic2VydmFibGVGYWN0b3J5LFxuICAgIENyZWF0ZU9ic2VydmFibGVPcHRpb25zLFxuICAgIGNvbXB1dGVkLFxuICAgIElDb21wdXRlZEZhY3RvcnksXG4gICAgaXNPYnNlcnZhYmxlLFxuICAgIGlzT2JzZXJ2YWJsZVByb3AsXG4gICAgaXNDb21wdXRlZCxcbiAgICBpc0NvbXB1dGVkUHJvcCxcbiAgICBleHRlbmRPYnNlcnZhYmxlLFxuICAgIG9ic2VydmUsXG4gICAgaW50ZXJjZXB0LFxuICAgIGF1dG9ydW4sXG4gICAgSUF1dG9ydW5PcHRpb25zLFxuICAgIHJlYWN0aW9uLFxuICAgIElSZWFjdGlvbk9wdGlvbnMsXG4gICAgd2hlbixcbiAgICBJV2hlbk9wdGlvbnMsXG4gICAgYWN0aW9uLFxuICAgIGlzQWN0aW9uLFxuICAgIHJ1bkluQWN0aW9uLFxuICAgIElBY3Rpb25GYWN0b3J5LFxuICAgIGtleXMsXG4gICAgdmFsdWVzLFxuICAgIGVudHJpZXMsXG4gICAgc2V0LFxuICAgIHJlbW92ZSxcbiAgICBoYXMsXG4gICAgZ2V0LFxuICAgIGFwaU93bktleXMgYXMgb3duS2V5cyxcbiAgICBhcGlEZWZpbmVQcm9wZXJ0eSBhcyBkZWZpbmVQcm9wZXJ0eSxcbiAgICBjb25maWd1cmUsXG4gICAgb25CZWNvbWVPYnNlcnZlZCxcbiAgICBvbkJlY29tZVVub2JzZXJ2ZWQsXG4gICAgZmxvdyxcbiAgICBpc0Zsb3csXG4gICAgZmxvd1Jlc3VsdCxcbiAgICBGbG93Q2FuY2VsbGF0aW9uRXJyb3IsXG4gICAgaXNGbG93Q2FuY2VsbGF0aW9uRXJyb3IsXG4gICAgdG9KUyxcbiAgICB0cmFjZSxcbiAgICBJT2JzZXJ2ZXJUcmVlLFxuICAgIElEZXBlbmRlbmN5VHJlZSxcbiAgICBnZXREZXBlbmRlbmN5VHJlZSxcbiAgICBnZXRPYnNlcnZlclRyZWUsXG4gICAgcmVzZXRHbG9iYWxTdGF0ZSBhcyBfcmVzZXRHbG9iYWxTdGF0ZSxcbiAgICBnZXRHbG9iYWxTdGF0ZSBhcyBfZ2V0R2xvYmFsU3RhdGUsXG4gICAgZ2V0RGVidWdOYW1lLFxuICAgIGdldEF0b20sXG4gICAgZ2V0QWRtaW5pc3RyYXRpb24gYXMgX2dldEFkbWluaXN0cmF0aW9uLFxuICAgIGFsbG93U3RhdGVDaGFuZ2VzIGFzIF9hbGxvd1N0YXRlQ2hhbmdlcyxcbiAgICBydW5JbkFjdGlvbiBhcyBfYWxsb3dTdGF0ZUNoYW5nZXNJbnNpZGVDb21wdXRlZCwgLy8gVGhpcyBoYXMgYmVjb21lIHRoZSBkZWZhdWx0IGJlaGF2aW9yIGluIE1vYnggNlxuICAgIExhbWJkYSxcbiAgICAkbW9ieCxcbiAgICBpc0NvbXB1dGluZ0Rlcml2YXRpb24gYXMgX2lzQ29tcHV0aW5nRGVyaXZhdGlvbixcbiAgICBvblJlYWN0aW9uRXJyb3IsXG4gICAgaW50ZXJjZXB0UmVhZHMgYXMgX2ludGVyY2VwdFJlYWRzLFxuICAgIElDb21wdXRlZFZhbHVlT3B0aW9ucyxcbiAgICBJQWN0aW9uUnVuSW5mbyxcbiAgICBfc3RhcnRBY3Rpb24sXG4gICAgX2VuZEFjdGlvbixcbiAgICBhbGxvd1N0YXRlUmVhZHNTdGFydCBhcyBfYWxsb3dTdGF0ZVJlYWRzU3RhcnQsXG4gICAgYWxsb3dTdGF0ZVJlYWRzRW5kIGFzIF9hbGxvd1N0YXRlUmVhZHNFbmQsXG4gICAgbWFrZU9ic2VydmFibGUsXG4gICAgbWFrZUF1dG9PYnNlcnZhYmxlLFxuICAgIGF1dG9BY3Rpb24gYXMgX2F1dG9BY3Rpb24sXG4gICAgQW5ub3RhdGlvbnNNYXAsXG4gICAgQW5ub3RhdGlvbk1hcEVudHJ5LFxuICAgIG92ZXJyaWRlXG59IGZyb20gXCIuL2ludGVybmFsXCJcblxuLy8gRGV2dG9vbHMgc3VwcG9ydFxuZGVjbGFyZSBjb25zdCBfX01PQlhfREVWVE9PTFNfR0xPQkFMX0hPT0tfXzogeyBpbmplY3RNb2J4OiAoYW55KSA9PiB2b2lkIH1cbmlmICh0eXBlb2YgX19NT0JYX0RFVlRPT0xTX0dMT0JBTF9IT09LX18gPT09IFwib2JqZWN0XCIpIHtcbiAgICAvLyBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9hbmR5a29nL21vYngtZGV2dG9vbHMvXG4gICAgX19NT0JYX0RFVlRPT0xTX0dMT0JBTF9IT09LX18uaW5qZWN0TW9ieCh7XG4gICAgICAgIHNweSxcbiAgICAgICAgZXh0cmFzOiB7XG4gICAgICAgICAgICBnZXREZWJ1Z05hbWVcbiAgICAgICAgfSxcbiAgICAgICAgJG1vYnhcbiAgICB9KVxufVxuIiwiaW1wb3J0IENvbmZpZywgeyBTdGF0ZSwgUnVsZSwgQ29udHJvbENvbmZpZywgQ29udHJvbFN0YXRlIH0gZnJvbSBcIi4vY29uZmlnXCI7XHJcbmltcG9ydCAqIGFzIG1vYnggZnJvbSBcIm1vYnhcIjtcclxuXHJcbnR5cGUgQ29udHJvbFR5cGUgPSBYcm0uQ29udHJvbHMuQ29udHJvbCB8IFhybS5Db250cm9scy5UYWIgfCBYcm0uQ29udHJvbHMuU2VjdGlvbjtcclxudHlwZSBDb250cm9sc1R5cGUgPSB7IFtpZDogc3RyaW5nXTogQ29udHJvbFR5cGUgfTtcclxuXHJcbnR5cGUgUHJvcGVydHk8VD4gPSB7XHJcbiAgICBuYW1lOiBzdHJpbmc7XHJcbiAgICBnZXRSdWxlOiAoYzogQ29udHJvbENvbmZpZykgPT4gUnVsZTxUPjtcclxuICAgIGdldEZyb21Db250cm9sOiAoYzogQ29udHJvbFR5cGUpID0+IFQ7XHJcbiAgICBzZXRUb0NvbnRyb2w6IChjOiBDb250cm9sVHlwZSwgdjogVCkgPT4gdm9pZDtcclxuICAgIHNldFN0YXRlOiAoczogQ29udHJvbFN0YXRlLCB2OiBUKSA9PiB2b2lkO1xyXG4gICAgZ2V0U3RhdGU6IChzOiBDb250cm9sU3RhdGUpID0+IFQ7XHJcbiAgICBhZGRXYXRjaGVyOiBudWxsIHwgKChjOiBDb250cm9sVHlwZSwgaDogKCkgPT4gdm9pZCkgPT4gdm9pZCk7XHJcbn07XHJcblxyXG5jb25zdCBwcm9wZXJ0aWVzOiBQcm9wZXJ0eTxhbnk+W10gPSBbXHJcbiAgICB7XHJcbiAgICAgICAgbmFtZTogXCJ2aXNpYmxlXCIsXHJcbiAgICAgICAgZ2V0UnVsZTogKGMpID0+IGMudmlzaWJsZSxcclxuICAgICAgICBnZXRGcm9tQ29udHJvbDogKGMpID0+IGMuZ2V0VmlzaWJsZSgpLFxyXG4gICAgICAgIHNldFRvQ29udHJvbDogKGMsIHYpID0+ICg8WHJtLkNvbnRyb2xzLlN0YW5kYXJkQ29udHJvbD5jKS5zZXRWaXNpYmxlPy5jYWxsKGMsIHYpLFxyXG4gICAgICAgIHNldFN0YXRlOiAocywgdikgPT4gKHMudmlzaWJsZSA9IHYpLFxyXG4gICAgICAgIGdldFN0YXRlOiAocykgPT4gcy52aXNpYmxlLFxyXG4gICAgICAgIGFkZFdhdGNoZXI6IG51bGwsXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAgIG5hbWU6IFwicmVxdWlyZWRcIixcclxuICAgICAgICBnZXRSdWxlOiAoYykgPT4gYy5yZXF1aXJlZCxcclxuICAgICAgICBnZXRGcm9tQ29udHJvbDogKGMpID0+IHtcclxuICAgICAgICAgICAgIGNvbnN0IHJlcXVpcmVkTGV2ZWwgPSAoPFhybS5Db250cm9scy5TdGFuZGFyZENvbnRyb2w+YykuZ2V0QXR0cmlidXRlPy5jYWxsKGMpPy5nZXRSZXF1aXJlZExldmVsKCk7XHJcbiAgICAgICAgICAgICByZXR1cm4gcmVxdWlyZWRMZXZlbCA9PSBcInJlcXVpcmVkXCI7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZXRUb0NvbnRyb2w6IChjLCB2KSA9PiAoPFhybS5Db250cm9scy5TdGFuZGFyZENvbnRyb2w+YykuZ2V0QXR0cmlidXRlPy5jYWxsKGMpLnNldFJlcXVpcmVkTGV2ZWwodiA/IFwicmVxdWlyZWRcIiA6IFwibm9uZVwiKSxcclxuICAgICAgICBzZXRTdGF0ZTogKHMsIHYpID0+IChzLnJlcXVpcmVkID0gdiksXHJcbiAgICAgICAgZ2V0U3RhdGU6IChzKSA9PiBzLnJlcXVpcmVkLFxyXG4gICAgICAgIGFkZFdhdGNoZXI6IG51bGwsXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAgIG5hbWU6IFwiZGlzYWJsZWRcIixcclxuICAgICAgICBnZXRSdWxlOiAoYykgPT4gYy5kaXNhYmxlZCxcclxuICAgICAgICBnZXRGcm9tQ29udHJvbDogKGMpID0+ICEhKDxYcm0uQ29udHJvbHMuU3RhbmRhcmRDb250cm9sPmMpLmdldERpc2FibGVkPy5jYWxsKGMpLFxyXG4gICAgICAgIHNldFRvQ29udHJvbDogKGMsIHYpID0+ICg8WHJtLkNvbnRyb2xzLlN0YW5kYXJkQ29udHJvbD5jKS5zZXREaXNhYmxlZCh2KSxcclxuICAgICAgICBzZXRTdGF0ZTogKHMsIHYpID0+IChzLmRpc2FibGVkID0gdiksXHJcbiAgICAgICAgZ2V0U3RhdGU6IChzKSA9PiBzLmRpc2FibGVkLFxyXG4gICAgICAgIGFkZFdhdGNoZXI6IG51bGwsXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAgIG5hbWU6IFwidmFsdWVcIixcclxuICAgICAgICBnZXRSdWxlOiAoYykgPT4gYy52YWx1ZSxcclxuICAgICAgICBnZXRGcm9tQ29udHJvbDogKGMpID0+ICg8WHJtLkNvbnRyb2xzLlN0YW5kYXJkQ29udHJvbD5jKS5nZXRBdHRyaWJ1dGU/LmNhbGwoYyk/LmdldFZhbHVlKCksXHJcbiAgICAgICAgc2V0VG9Db250cm9sOiAoYywgdikgPT4gKDxYcm0uQ29udHJvbHMuU3RhbmRhcmRDb250cm9sPmMpLmdldEF0dHJpYnV0ZT8uY2FsbChjKT8uc2V0VmFsdWU/LmNhbGwoYywgdiksXHJcbiAgICAgICAgc2V0U3RhdGU6IChzLCB2KSA9PiAocy52YWx1ZSA9IHYpLFxyXG4gICAgICAgIGdldFN0YXRlOiAocykgPT4gcy52YWx1ZSxcclxuICAgICAgICBhZGRXYXRjaGVyOiAoYywgaCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBhdHRyaWJ1dGUgPSAoPFhybS5Db250cm9scy5TdGFuZGFyZENvbnRyb2w+YykuZ2V0QXR0cmlidXRlPy5jYWxsKGMpO1xyXG4gICAgICAgICAgICBhdHRyaWJ1dGU/LmFkZE9uQ2hhbmdlPy5jYWxsKGF0dHJpYnV0ZSwgaCk7XHJcbiAgICAgICAgfSxcclxuICAgIH1cclxuICAgIFxyXG5dO1xyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGluaXQoY29udGV4dDogWHJtLkV2ZW50cy5FdmVudENvbnRleHQsIGNvbmZpZ1dlYlJlc291cmNlTmFtZTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICBjb25zdCBmb3JtQ29udGV4dCA9IGNvbnRleHQuZ2V0Rm9ybUNvbnRleHQoKTtcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICAgIFhybS5VdGlsaXR5LnNob3dQcm9ncmVzc0luZGljYXRvcihcIkxvYWRpbmcgYnVzaW5lc3MgcnVsZXMuLi5cIik7XHJcblxyXG4gICAgICAgIGNvbnN0IGNvbmZpZyA9IGF3YWl0IGxvYWRDb25maWcoY29udGV4dCwgY29uZmlnV2ViUmVzb3VyY2VOYW1lKTtcclxuXHJcbiAgICAgICAgY29uc3QgeyBjb250cm9scywgc3RhdGUgfSA9IGdldEluaXRpYWxTdGF0ZShmb3JtQ29udGV4dCk7XHJcbiAgICAgICAgbW9ieC5tYWtlQXV0b09ic2VydmFibGUoc3RhdGUpO1xyXG5cclxuICAgICAgICBmb3IgKGNvbnN0IGlkIGluIGNvbmZpZykge1xyXG4gICAgICAgICAgICBjb25zdCBjb250cm9sID0gY29udHJvbHNbaWRdO1xyXG4gICAgICAgICAgICBjb25zdCBjb250cm9sQ29uZmlnID0gY29uZmlnW2lkXTtcclxuICAgICAgICAgICAgY29uc3QgY29udHJvbFN0YXRlID0gc3RhdGVbaWRdO1xyXG5cclxuICAgICAgICAgICAgZm9yIChjb25zdCBwcm9wZXJ0eSBvZiBwcm9wZXJ0aWVzKSB7XHJcbiAgICAgICAgICAgICAgICBtb2J4LmF1dG9ydW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBmdW5jdGlvbk9yU3RyaW5nID0gcHJvcGVydHkuZ2V0UnVsZShjb250cm9sQ29uZmlnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZ1bmN0aW9uT3JTdHJpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBmbjogKHM6IFN0YXRlKSA9PiBhbnk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGZ1bmN0aW9uT3JTdHJpbmcgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmbiA9IChzOiBTdGF0ZSkgPT4gbmV3IEZ1bmN0aW9uKFwiY29udHJvbFwiLCBcInJldHVybiBcIiArIGZ1bmN0aW9uT3JTdHJpbmcpKHMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmbiA9IGZ1bmN0aW9uT3JTdHJpbmc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG5ld1ZhbHVlID0gZm4oc3RhdGUpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBvbGRWYWx1ZSA9IHByb3BlcnR5LmdldFN0YXRlKGNvbnRyb2xTdGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3VmFsdWUgIT09IG9sZFZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKFwiRFZKUyBjb250cm9sIHN0YXRlIHVwZGF0ZWQgYnkgcmVzdWx0XCIsIHsgY29udHJvbDogY29udHJvbC5nZXROYW1lKCksIHByb3BlcnR5OiBwcm9wZXJ0eS5uYW1lLCB2YWx1ZTogbmV3VmFsdWUgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHkuc2V0U3RhdGUoY29udHJvbFN0YXRlLCBuZXdWYWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHkuc2V0VG9Db250cm9sKGNvbnRyb2wsIG5ld1ZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oXCJEVkpTIHVwZGF0ZWQgc3RhdGVcIiwgbW9ieC50b0pTKHN0YXRlKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9ybUNvbnRleHQudWkuY2xlYXJGb3JtTm90aWZpY2F0aW9uKGBkdmpzcnVsZS4ke2lkfS4ke3Byb3BlcnR5Lm5hbWV9YCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oXCJEVkpTIGZ1bmN0aW9uIGV4ZWN1dGVkXCIsIHsgY29udHJvbDogaWQsIHByb3BlcnR5OiBwcm9wZXJ0eS5uYW1lLCByZXN1bHQ6IG5ld1ZhbHVlIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJEVkpTIGVycm9yIGluIGZ1bmN0aW9uIGV4ZWN1dGlvblwiLCB7IGNvbnRyb2w6IGlkLCBwcm9wZXJ0eTogcHJvcGVydHkubmFtZSwgZXJyb3I6IGUgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcm1Db250ZXh0LnVpLnNldEZvcm1Ob3RpZmljYXRpb24oYEJ1c2luZXNzIHJ1bGVzIGVycm9yIC0gJHtpZH0uJHtwcm9wZXJ0eS5uYW1lfSAtICR7ZS5tZXNzYWdlfWAsIFwiRVJST1JcIiwgYGR2anNydWxlLiR7aWR9LiR7cHJvcGVydHkubmFtZX1gKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgWHJtLlV0aWxpdHkuY2xvc2VQcm9ncmVzc0luZGljYXRvcigpO1xyXG4gICAgfSBjYXRjaCAoZTogYW55KSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihcIkRWSlMgbG9hZGluZyBlcnJvclwiLCBlKTtcclxuICAgICAgICBYcm0uVXRpbGl0eS5jbG9zZVByb2dyZXNzSW5kaWNhdG9yKCk7XHJcbiAgICAgICAgYXdhaXQgWHJtLk5hdmlnYXRpb24ub3BlbkVycm9yRGlhbG9nKHsgbWVzc2FnZTogYEVycm9yIGxvYWRpbmcgYnVzaW5lc3MgcnVsZXMgLSAke2UubWVzc2FnZSA/PyBcInVua25vd24gZXJyb3JcIn1gLCBkZXRhaWxzOiBgRHZKcyBlcnJvcjogJHtlfWAgfSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEluaXRpYWxTdGF0ZShmb3JtQ29udGV4dDogWHJtLkZvcm1Db250ZXh0KTogeyBzdGF0ZTogU3RhdGU7IGNvbnRyb2xzOiBDb250cm9sc1R5cGUgfSB7XHJcbiAgICBjb25zdCBzdGF0ZTogU3RhdGUgPSB7fTtcclxuICAgIGxldCBpbml0aWFsU3RhdGVMb2FkZWQgPSBmYWxzZTtcclxuXHJcbiAgICBjb25zdCBjb250cm9sczogQ29udHJvbHNUeXBlID0ge307XHJcbiAgICBmb3JtQ29udGV4dC51aS5jb250cm9scy5mb3JFYWNoKChjKSA9PiAoY29udHJvbHNbYy5nZXROYW1lKCldID0gYykpO1xyXG5cclxuICAgIGZvcm1Db250ZXh0LnVpLnRhYnMuZm9yRWFjaCgodCkgPT4ge1xyXG4gICAgICAgIGNvbnRyb2xzW3QuZ2V0TmFtZSgpXSA9IHQ7XHJcblxyXG4gICAgICAgIHQuc2VjdGlvbnMuZm9yRWFjaCgocykgPT4gKGNvbnRyb2xzW3MuZ2V0TmFtZSgpXSA9IHMpKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGZvciAoY29uc3QgY29udHJvbE5hbWUgaW4gY29udHJvbHMpIHtcclxuICAgICAgICBjb25zdCBpID0gY29udHJvbHNbY29udHJvbE5hbWVdO1xyXG4gICAgICAgIHN0YXRlW2kuZ2V0TmFtZSgpXSA9IDxhbnk+e307XHJcblxyXG4gICAgICAgIGZvciAoY29uc3QgcHJvcGVydHkgb2YgcHJvcGVydGllcykge1xyXG4gICAgICAgICAgICBjb25zdCBwcm9wZXJ0eVZhbHVlID0gcHJvcGVydHkuZ2V0RnJvbUNvbnRyb2woaSk7XHJcbiAgICAgICAgICAgIHByb3BlcnR5LnNldFN0YXRlKHN0YXRlW2kuZ2V0TmFtZSgpXSwgcHJvcGVydHlWYWx1ZSk7XHJcblxyXG4gICAgICAgICAgICBwcm9wZXJ0eS5hZGRXYXRjaGVyPy5jYWxsKHByb3BlcnR5LCBpLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWluaXRpYWxTdGF0ZUxvYWRlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnN0IHByb3BlcnR5VmFsdWUgPSBwcm9wZXJ0eS5nZXRGcm9tQ29udHJvbChpKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG9sZHZhbHVlID0gcHJvcGVydHkuZ2V0U3RhdGUoc3RhdGVbaS5nZXROYW1lKCldKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAocHJvcGVydHlWYWx1ZSAhPSBvbGR2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG1vYngucnVuSW5BY3Rpb24oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oXCJEVkpTIGNvbnRyb2wgc3RhdGUgY2hhbmdlZFwiLCB7IGNvbnRyb2w6IGkuZ2V0TmFtZSgpLCBwcm9wZXJ0eTogcHJvcGVydHkubmFtZSwgdmFsdWU6IHByb3BlcnR5VmFsdWUgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5LnNldFN0YXRlKHN0YXRlW2kuZ2V0TmFtZSgpXSwgcHJvcGVydHlWYWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhcIkRWSlMgdXBkYXRlZCBzdGF0ZVwiLCBtb2J4LnRvSlMoc3RhdGUpKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnNvbGUuaW5mbyhcIkRWSlMgaW5pdGlhbCBzdGF0ZVwiLCBtb2J4LnRvSlMoc3RhdGUpKTtcclxuXHJcbiAgICBpbml0aWFsU3RhdGVMb2FkZWQgPSB0cnVlO1xyXG4gICAgcmV0dXJuIHsgc3RhdGU6IHN0YXRlLCBjb250cm9sczogY29udHJvbHMgfTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gbG9hZENvbmZpZyhjb250ZXh0OiBYcm0uRXZlbnRzLkV2ZW50Q29udGV4dCwgY29uZmlnV2ViUmVzb3VyY2VOYW1lOiBzdHJpbmcpIHtcclxuICAgIGNvbnN0IGJhc2VVcmwgPSBjb250ZXh0LmdldENvbnRleHQoKS5nZXRDbGllbnRVcmwoKTtcclxuXHJcbiAgICBsZXQgY29uZmlnU2NyaXB0ID0gYXdhaXQgKGF3YWl0IGZldGNoKGJhc2VVcmwgKyBcIi93ZWJyZXNvdXJjZXMvXCIgKyBjb25maWdXZWJSZXNvdXJjZU5hbWUpKS50ZXh0KCk7XHJcblxyXG4gICAgaWYgKGNvbmZpZ1NjcmlwdC50cmltKCkuc3RhcnRzV2l0aChcIntcIikpIHtcclxuICAgICAgICBjb25maWdTY3JpcHQgPSBcInJldHVybiBcIiArIGNvbmZpZ1NjcmlwdDtcclxuICAgIH1cclxuICAgIHJldHVybiA8Q29uZmlnPm5ldyBGdW5jdGlvbihjb25maWdTY3JpcHQpKCk7XHJcbn1cclxuIl0sIm5hbWVzIjpbImdsb2JhbCIsIm5vb3AiLCJvbmNlIiwibmljZUVycm9ycyIsImFubm90YXRpb25UeXBlIiwia2V5IiwidG9TdHJpbmciLCJpbmRleCIsImxlbmd0aCIsIm90aGVyIiwiY29uc3RydWN0b3IiLCJuYW1lIiwiZGF0YVN0cnVjdHVyZSIsInRoaW5nIiwicHJvcGVydHkiLCJkZXJpdmF0aW9uIiwibWV0aG9kIiwiZXJyb3JzIiwiZGllIiwiZXJyb3IiLCJhcmdzIiwiZSIsImFwcGx5IiwiRXJyb3IiLCJtYXAiLCJTdHJpbmciLCJqb2luIiwibW9ja0dsb2JhbCIsImdldEdsb2JhbCIsImdsb2JhbFRoaXMiLCJ3aW5kb3ciLCJzZWxmIiwiYXNzaWduIiwiT2JqZWN0IiwiZ2V0RGVzY3JpcHRvciIsImdldE93blByb3BlcnR5RGVzY3JpcHRvciIsImRlZmluZVByb3BlcnR5Iiwib2JqZWN0UHJvdG90eXBlIiwicHJvdG90eXBlIiwiRU1QVFlfQVJSQVkiLCJmcmVlemUiLCJFTVBUWV9PQkpFQ1QiLCJoYXNQcm94eSIsIlByb3h5IiwicGxhaW5PYmplY3RTdHJpbmciLCJhc3NlcnRQcm94aWVzIiwid2FybkFib3V0UHJveHlSZXF1aXJlbWVudCIsIm1zZyIsImdsb2JhbFN0YXRlIiwidmVyaWZ5UHJveGllcyIsImdldE5leHRJZCIsIm1vYnhHdWlkIiwiZnVuYyIsImludm9rZWQiLCJhcmd1bWVudHMiLCJpc0Z1bmN0aW9uIiwiZm4iLCJpc1N0cmluZ2lzaCIsInZhbHVlIiwidCIsImlzT2JqZWN0IiwiaXNQbGFpbk9iamVjdCIsInByb3RvIiwiZ2V0UHJvdG90eXBlT2YiLCJwcm90b0NvbnN0cnVjdG9yIiwiaGFzT3duUHJvcGVydHkiLCJjYWxsIiwiaXNHZW5lcmF0b3IiLCJvYmoiLCJkaXNwbGF5TmFtZSIsImFkZEhpZGRlblByb3AiLCJvYmplY3QiLCJwcm9wTmFtZSIsImVudW1lcmFibGUiLCJ3cml0YWJsZSIsImNvbmZpZ3VyYWJsZSIsImFkZEhpZGRlbkZpbmFsUHJvcCIsImNyZWF0ZUluc3RhbmNlb2ZQcmVkaWNhdGUiLCJ0aGVDbGFzcyIsIngiLCJpc0VTNk1hcCIsIk1hcCIsImlzRVM2U2V0IiwiU2V0IiwiaGFzR2V0T3duUHJvcGVydHlTeW1ib2xzIiwiZ2V0T3duUHJvcGVydHlTeW1ib2xzIiwiZ2V0UGxhaW5PYmplY3RLZXlzIiwia2V5cyIsInN5bWJvbHMiLCJmaWx0ZXIiLCJzIiwicHJvcGVydHlJc0VudW1lcmFibGUiLCJvd25LZXlzIiwiUmVmbGVjdCIsImdldE93blByb3BlcnR5TmFtZXMiLCJjb25jYXQiLCJzdHJpbmdpZnlLZXkiLCJ0b1ByaW1pdGl2ZSIsImhhc1Byb3AiLCJ0YXJnZXQiLCJwcm9wIiwiZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyIsInJlcyIsImZvckVhY2giLCJzdG9yZWRBbm5vdGF0aW9uc1N5bWJvbCIsIlN5bWJvbCIsImNyZWF0ZURlY29yYXRvckFubm90YXRpb24iLCJhbm5vdGF0aW9uIiwiZGVjb3JhdG9yIiwic3RvcmVBbm5vdGF0aW9uIiwiaXNPdmVycmlkZSIsImZpZWxkTmFtZSIsImFzc2VydE5vdERlY29yYXRlZCIsImN1cnJlbnRBbm5vdGF0aW9uVHlwZSIsImFubm90YXRpb25UeXBlXyIsInJlcXVlc3RlZEFubm90YXRpb25UeXBlIiwiJG1vYngiLCJBdG9tIiwibmFtZV8iLCJpc1BlbmRpbmdVbm9ic2VydmF0aW9uXyIsImlzQmVpbmdPYnNlcnZlZF8iLCJvYnNlcnZlcnNfIiwiZGlmZlZhbHVlXyIsImxhc3RBY2Nlc3NlZEJ5XyIsImxvd2VzdE9ic2VydmVyU3RhdGVfIiwiSURlcml2YXRpb25TdGF0ZV8iLCJOT1RfVFJBQ0tJTkdfIiwib25CT0wiLCJvbkJVT0wiLCJvbkJPIiwibGlzdGVuZXIiLCJvbkJVTyIsInJlcG9ydE9ic2VydmVkIiwicmVwb3J0Q2hhbmdlZCIsInN0YXJ0QmF0Y2giLCJwcm9wYWdhdGVDaGFuZ2VkIiwiZW5kQmF0Y2giLCJpc0F0b20iLCJjcmVhdGVBdG9tIiwib25CZWNvbWVPYnNlcnZlZEhhbmRsZXIiLCJvbkJlY29tZVVub2JzZXJ2ZWRIYW5kbGVyIiwiYXRvbSIsIm9uQmVjb21lT2JzZXJ2ZWQiLCJvbkJlY29tZVVub2JzZXJ2ZWQiLCJpZGVudGl0eUNvbXBhcmVyIiwiYSIsImIiLCJzdHJ1Y3R1cmFsQ29tcGFyZXIiLCJkZWVwRXF1YWwiLCJzaGFsbG93Q29tcGFyZXIiLCJkZWZhdWx0Q29tcGFyZXIiLCJpcyIsImNvbXBhcmVyIiwiaWRlbnRpdHkiLCJzdHJ1Y3R1cmFsIiwic2hhbGxvdyIsImRlZXBFbmhhbmNlciIsInYiLCJfIiwiaXNPYnNlcnZhYmxlIiwiQXJyYXkiLCJpc0FycmF5Iiwib2JzZXJ2YWJsZSIsImFycmF5IiwidW5kZWZpbmVkIiwic2V0IiwiaXNBY3Rpb24iLCJpc0Zsb3ciLCJmbG93IiwiYXV0b0FjdGlvbiIsInNoYWxsb3dFbmhhbmNlciIsImlzT2JzZXJ2YWJsZU9iamVjdCIsImlzT2JzZXJ2YWJsZUFycmF5IiwiaXNPYnNlcnZhYmxlTWFwIiwiaXNPYnNlcnZhYmxlU2V0IiwiZGVlcCIsInJlZmVyZW5jZUVuaGFuY2VyIiwibmV3VmFsdWUiLCJyZWZTdHJ1Y3RFbmhhbmNlciIsIm9sZFZhbHVlIiwiT1ZFUlJJREUiLCJjcmVhdGVBY3Rpb25Bbm5vdGF0aW9uIiwib3B0aW9ucyIsIm9wdGlvbnNfIiwibWFrZV8iLCJleHRlbmRfIiwiYWRtIiwiZGVzY3JpcHRvciIsInNvdXJjZSIsImJvdW5kIiwidGFyZ2V0XyIsImFjdGlvbkRlc2NyaXB0b3IiLCJjcmVhdGVBY3Rpb25EZXNjcmlwdG9yIiwicHJveHlUcmFwIiwiZGVmaW5lUHJvcGVydHlfIiwiYXNzZXJ0QWN0aW9uRGVzY3JpcHRvciIsInNhZmVEZXNjcmlwdG9ycyIsImJpbmQiLCJwcm94eV8iLCJjcmVhdGVBY3Rpb24iLCJpc1BsYWluT2JqZWN0XyIsImNyZWF0ZUZsb3dBbm5vdGF0aW9uIiwiZmxvd0Rlc2NyaXB0b3IiLCJjcmVhdGVGbG93RGVzY3JpcHRvciIsImFzc2VydEZsb3dEZXNjcmlwdG9yIiwiaXNNb2JYRmxvdyIsImNyZWF0ZUNvbXB1dGVkQW5ub3RhdGlvbiIsImFzc2VydENvbXB1dGVkRGVzY3JpcHRvciIsImRlZmluZUNvbXB1dGVkUHJvcGVydHlfIiwiZ2V0IiwiY3JlYXRlT2JzZXJ2YWJsZUFubm90YXRpb24iLCJhc3NlcnRPYnNlcnZhYmxlRGVzY3JpcHRvciIsImRlZmluZU9ic2VydmFibGVQcm9wZXJ0eV8iLCJlbmhhbmNlciIsIkFVVE8iLCJhdXRvQW5ub3RhdGlvbiIsImNyZWF0ZUF1dG9Bbm5vdGF0aW9uIiwiY29tcHV0ZWQiLCJmbG93QW5ub3RhdGlvbiIsImF1dG9CaW5kIiwiYWN0aW9uQW5ub3RhdGlvbiIsIm9ic2VydmFibGVBbm5vdGF0aW9uIiwicmVmIiwiT0JTRVJWQUJMRSIsIk9CU0VSVkFCTEVfUkVGIiwiT0JTRVJWQUJMRV9TSEFMTE9XIiwiT0JTRVJWQUJMRV9TVFJVQ1QiLCJkZWZhdWx0Q3JlYXRlT2JzZXJ2YWJsZU9wdGlvbnMiLCJkZWZhdWx0RGVjb3JhdG9yIiwicHJveHkiLCJhc0NyZWF0ZU9ic2VydmFibGVPcHRpb25zIiwib2JzZXJ2YWJsZVJlZkFubm90YXRpb24iLCJvYnNlcnZhYmxlU2hhbGxvd0Fubm90YXRpb24iLCJvYnNlcnZhYmxlU3RydWN0QW5ub3RhdGlvbiIsIm9ic2VydmFibGVEZWNvcmF0b3JBbm5vdGF0aW9uIiwiZ2V0RW5oYW5jZXJGcm9tT3B0aW9ucyIsImdldEVuaGFuY2VyRnJvbUFubm90YXRpb24iLCJnZXRBbm5vdGF0aW9uRnJvbU9wdGlvbnMiLCJjcmVhdGVPYnNlcnZhYmxlIiwiYXJnMiIsImFyZzMiLCJib3giLCJvYnNlcnZhYmxlRmFjdG9yaWVzIiwibyIsIk9ic2VydmFibGVWYWx1ZSIsImVxdWFscyIsImluaXRpYWxWYWx1ZXMiLCJ1c2VQcm94aWVzIiwiY3JlYXRlTGVnYWN5QXJyYXkiLCJjcmVhdGVPYnNlcnZhYmxlQXJyYXkiLCJPYnNlcnZhYmxlTWFwIiwiT2JzZXJ2YWJsZVNldCIsInByb3BzIiwiZGVjb3JhdG9ycyIsImV4dGVuZE9ic2VydmFibGUiLCJhc09ic2VydmFibGVPYmplY3QiLCJhc0R5bmFtaWNPYnNlcnZhYmxlT2JqZWN0Iiwic3RydWN0IiwiQ09NUFVURUQiLCJDT01QVVRFRF9TVFJVQ1QiLCJjb21wdXRlZEFubm90YXRpb24iLCJjb21wdXRlZFN0cnVjdEFubm90YXRpb24iLCJhcmcxIiwib3B0cyIsIkNvbXB1dGVkVmFsdWUiLCJjdXJyZW50QWN0aW9uSWQiLCJuZXh0QWN0aW9uSWQiLCJpc0Z1bmN0aW9uTmFtZUNvbmZpZ3VyYWJsZSIsInRtcE5hbWVEZXNjcmlwdG9yIiwiYWN0aW9uTmFtZSIsImV4ZWN1dGVBY3Rpb24iLCJpc01vYnhBY3Rpb24iLCJjYW5SdW5Bc0Rlcml2YXRpb24iLCJzY29wZSIsInJ1bkluZm8iLCJfc3RhcnRBY3Rpb24iLCJlcnIiLCJlcnJvcl8iLCJfZW5kQWN0aW9uIiwibm90aWZ5U3B5XyIsImlzU3B5RW5hYmxlZCIsInN0YXJ0VGltZV8iLCJEYXRlIiwibm93IiwiZmxhdHRlbmVkQXJncyIsImZyb20iLCJzcHlSZXBvcnRTdGFydCIsInR5cGUiLCJBQ1RJT04iLCJwcmV2RGVyaXZhdGlvbl8iLCJ0cmFja2luZ0Rlcml2YXRpb24iLCJydW5Bc0FjdGlvbiIsInByZXZBbGxvd1N0YXRlQ2hhbmdlc18iLCJhbGxvd1N0YXRlQ2hhbmdlcyIsInVudHJhY2tlZFN0YXJ0IiwiYWxsb3dTdGF0ZUNoYW5nZXNTdGFydCIsInByZXZBbGxvd1N0YXRlUmVhZHNfIiwiYWxsb3dTdGF0ZVJlYWRzU3RhcnQiLCJydW5Bc0FjdGlvbl8iLCJhY3Rpb25JZF8iLCJwYXJlbnRBY3Rpb25JZF8iLCJzdXBwcmVzc1JlYWN0aW9uRXJyb3JzIiwiYWxsb3dTdGF0ZUNoYW5nZXNFbmQiLCJhbGxvd1N0YXRlUmVhZHNFbmQiLCJ1bnRyYWNrZWRFbmQiLCJzcHlSZXBvcnRFbmQiLCJ0aW1lIiwicHJldiIsIkNSRUFURSIsIm5vdGlmeVNweSIsImhhc1VucmVwb3J0ZWRDaGFuZ2VfIiwiaW50ZXJjZXB0b3JzXyIsImNoYW5nZUxpc3RlbmVyc18iLCJ2YWx1ZV8iLCJkZWhhbmNlciIsInNweVJlcG9ydCIsIm9ic2VydmFibGVLaW5kIiwiZGVidWdPYmplY3ROYW1lIiwiZGVoYW5jZVZhbHVlIiwicHJlcGFyZU5ld1ZhbHVlXyIsIlVOQ0hBTkdFRCIsIlVQREFURSIsInNldE5ld1ZhbHVlXyIsImNoZWNrSWZTdGF0ZU1vZGlmaWNhdGlvbnNBcmVBbGxvd2VkIiwiaGFzSW50ZXJjZXB0b3JzIiwiY2hhbmdlIiwiaW50ZXJjZXB0Q2hhbmdlIiwiaGFzTGlzdGVuZXJzIiwibm90aWZ5TGlzdGVuZXJzIiwiaW50ZXJjZXB0XyIsImhhbmRsZXIiLCJyZWdpc3RlckludGVyY2VwdG9yIiwib2JzZXJ2ZV8iLCJmaXJlSW1tZWRpYXRlbHkiLCJyZWdpc3Rlckxpc3RlbmVyIiwicmF3IiwidG9KU09OIiwidmFsdWVPZiIsImlzT2JzZXJ2YWJsZVZhbHVlIiwiX1N5bWJvbCR0b1ByaW1pdGl2ZSIsImRlcGVuZGVuY2llc1N0YXRlXyIsIm9ic2VydmluZ18iLCJuZXdPYnNlcnZpbmdfIiwicnVuSWRfIiwiVVBfVE9fREFURV8iLCJ1bmJvdW5kRGVwc0NvdW50XyIsIkNhdWdodEV4Y2VwdGlvbiIsInRyaWdnZXJlZEJ5XyIsImlzQ29tcHV0aW5nXyIsImlzUnVubmluZ1NldHRlcl8iLCJzZXR0ZXJfIiwiaXNUcmFjaW5nXyIsIlRyYWNlTW9kZSIsIk5PTkUiLCJzY29wZV8iLCJlcXVhbHNfIiwicmVxdWlyZXNSZWFjdGlvbl8iLCJrZWVwQWxpdmVfIiwiY29tcGFyZVN0cnVjdHVyYWwiLCJjb250ZXh0IiwicmVxdWlyZXNSZWFjdGlvbiIsImtlZXBBbGl2ZSIsIm9uQmVjb21lU3RhbGVfIiwicHJvcGFnYXRlTWF5YmVDaGFuZ2VkIiwiaW5CYXRjaCIsInNpemUiLCJzaG91bGRDb21wdXRlIiwid2FybkFib3V0VW50cmFja2VkUmVhZF8iLCJjb21wdXRlVmFsdWVfIiwicHJldlRyYWNraW5nQ29udGV4dCIsInRyYWNraW5nQ29udGV4dCIsInRyYWNrQW5kQ29tcHV0ZSIsInByb3BhZ2F0ZUNoYW5nZUNvbmZpcm1lZCIsInJlc3VsdCIsImlzQ2F1Z2h0RXhjZXB0aW9uIiwiY2F1c2UiLCJ3YXNTdXNwZW5kZWQiLCJjaGFuZ2VkIiwidHJhY2siLCJ0cmFja0Rlcml2ZWRGdW5jdGlvbiIsImRpc2FibGVFcnJvckJvdW5kYXJpZXMiLCJzdXNwZW5kXyIsImNsZWFyT2JzZXJ2aW5nIiwiY29uc29sZSIsImxvZyIsImZpcnN0VGltZSIsInByZXZWYWx1ZSIsImF1dG9ydW4iLCJwcmV2VSIsImNvbXB1dGVkUmVxdWlyZXNSZWFjdGlvbiIsIndhcm4iLCJpc0NvbXB1dGVkVmFsdWUiLCJTVEFMRV8iLCJQT1NTSUJMWV9TVEFMRV8iLCJwcmV2QWxsb3dTdGF0ZVJlYWRzIiwicHJldlVudHJhY2tlZCIsIm9icyIsImwiLCJpIiwiY2hhbmdlRGVwZW5kZW5jaWVzU3RhdGVUbzAiLCJoYXNPYnNlcnZlcnMiLCJlbmZvcmNlQWN0aW9ucyIsImNoZWNrSWZTdGF0ZVJlYWRzQXJlQWxsb3dlZCIsImFsbG93U3RhdGVSZWFkcyIsIm9ic2VydmFibGVSZXF1aXJlc1JlYWN0aW9uIiwiZiIsInJ1bklkIiwicHJldlRyYWNraW5nIiwiYmluZERlcGVuZGVuY2llcyIsIndhcm5BYm91dERlcml2YXRpb25XaXRob3V0RGVwZW5kZW5jaWVzIiwicmVxdWlyZXNPYnNlcnZhYmxlXyIsInJlYWN0aW9uUmVxdWlyZXNPYnNlcnZhYmxlIiwicHJldk9ic2VydmluZyIsIm9ic2VydmluZyIsImxvd2VzdE5ld09ic2VydmluZ0Rlcml2YXRpb25TdGF0ZSIsImkwIiwiZGVwIiwicmVtb3ZlT2JzZXJ2ZXIiLCJhZGRPYnNlcnZlciIsInVudHJhY2tlZCIsImFjdGlvbiIsIk1vYlhHbG9iYWxzIiwidmVyc2lvbiIsInBlbmRpbmdVbm9ic2VydmF0aW9ucyIsInBlbmRpbmdSZWFjdGlvbnMiLCJpc1J1bm5pbmdSZWFjdGlvbnMiLCJzcHlMaXN0ZW5lcnMiLCJnbG9iYWxSZWFjdGlvbkVycm9ySGFuZGxlcnMiLCJjYW5NZXJnZUdsb2JhbFN0YXRlIiwiX19tb2J4SW5zdGFuY2VDb3VudCIsIl9fbW9ieEdsb2JhbHMiLCJzZXRUaW1lb3V0Iiwibm9kZSIsImFkZCIsInF1ZXVlRm9yVW5vYnNlcnZhdGlvbiIsInB1c2giLCJydW5SZWFjdGlvbnMiLCJsaXN0IiwiZCIsImxvZ1RyYWNlSW5mbyIsIkJSRUFLIiwibGluZXMiLCJwcmludERlcFRyZWUiLCJnZXREZXBlbmRlbmN5VHJlZSIsIkZ1bmN0aW9uIiwicmVwbGFjZSIsInRyZWUiLCJkZXB0aCIsInJlcGVhdCIsImRlcGVuZGVuY2llcyIsImNoaWxkIiwiUmVhY3Rpb24iLCJvbkludmFsaWRhdGVfIiwiZXJyb3JIYW5kbGVyXyIsImlzRGlzcG9zZWRfIiwiaXNTY2hlZHVsZWRfIiwiaXNUcmFja1BlbmRpbmdfIiwiaXNSdW5uaW5nXyIsInNjaGVkdWxlXyIsImlzU2NoZWR1bGVkIiwicnVuUmVhY3Rpb25fIiwicmVwb3J0RXhjZXB0aW9uSW5EZXJpdmF0aW9uXyIsIm5vdGlmeSIsInN0YXJ0VGltZSIsInByZXZSZWFjdGlvbiIsIm1lc3NhZ2UiLCJkaXNwb3NlIiwiZ2V0RGlzcG9zZXJfIiwiciIsInRyYWNlIiwiZW50ZXJCcmVha1BvaW50IiwiTUFYX1JFQUNUSU9OX0lURVJBVElPTlMiLCJyZWFjdGlvblNjaGVkdWxlciIsInJ1blJlYWN0aW9uc0hlbHBlciIsImFsbFJlYWN0aW9ucyIsIml0ZXJhdGlvbnMiLCJzcGxpY2UiLCJyZW1haW5pbmdSZWFjdGlvbnMiLCJpc1JlYWN0aW9uIiwiZXZlbnQiLCJsaXN0ZW5lcnMiLCJFTkRfRVZFTlQiLCJzcHkiLCJBQ1RJT05fQk9VTkQiLCJBVVRPQUNUSU9OIiwiQVVUT0FDVElPTl9CT1VORCIsIkRFRkFVTFRfQUNUSU9OX05BTUUiLCJhY3Rpb25Cb3VuZEFubm90YXRpb24iLCJhdXRvQWN0aW9uQW5ub3RhdGlvbiIsImF1dG9BY3Rpb25Cb3VuZEFubm90YXRpb24iLCJjcmVhdGVBY3Rpb25GYWN0b3J5IiwicnVuSW5BY3Rpb24iLCJ2aWV3IiwicnVuU3luYyIsInNjaGVkdWxlciIsImRlbGF5IiwicmVhY3Rpb24iLCJyZWFjdGlvblJ1bm5lciIsIm9uRXJyb3IiLCJyZXF1aXJlc09ic2VydmFibGUiLCJjcmVhdGVTY2hlZHVsZXJGcm9tT3B0aW9ucyIsInJ1biIsIk9OX0JFQ09NRV9PQlNFUlZFRCIsIk9OX0JFQ09NRV9VTk9CU0VSVkVEIiwiaW50ZXJjZXB0SG9vayIsImhvb2siLCJnZXRBdG9tIiwiY2IiLCJsaXN0ZW5lcnNLZXkiLCJob29rTGlzdGVuZXJzIiwicHJvcGVydGllcyIsImFubm90YXRpb25zIiwiZGVzY3JpcHRvcnMiLCJub2RlVG9EZXBlbmRlbmN5VHJlZSIsInVuaXF1ZSIsImdlbmVyYXRvcklkIiwiRmxvd0NhbmNlbGxhdGlvbkVycm9yIiwiY3JlYXRlIiwiZmxvd0JvdW5kQW5ub3RhdGlvbiIsImdlbmVyYXRvciIsImN0eCIsImdlbiIsInJlamVjdG9yIiwicGVuZGluZ1Byb21pc2UiLCJwcm9taXNlIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJzdGVwSWQiLCJvbkZ1bGZpbGxlZCIsInJldCIsIm5leHQiLCJvblJlamVjdGVkIiwidGhlbiIsImRvbmUiLCJjYW5jZWwiLCJjYW5jZWxQcm9taXNlIiwieWllbGRlZFByb21pc2UiLCJfaXNPYnNlcnZhYmxlIiwidmFsdWVzXyIsImhhcyIsImFwaU93bktleXMiLCJvd25LZXlzXyIsImNhY2hlIiwidG9KU0hlbHBlciIsIl9fYWxyZWFkeVNlZW4iLCJpZHgiLCJ0b0pTIiwicG9wIiwiZ2V0QXRvbUZyb21BcmdzIiwiTE9HIiwidHJhbnNhY3Rpb24iLCJ0aGlzQXJnIiwiZ2V0QWRtIiwib2JqZWN0UHJveHlUcmFwcyIsImhhc18iLCJnZXRfIiwic2V0XyIsImRlbGV0ZVByb3BlcnR5IiwiZGVsZXRlXyIsInByZXZlbnRFeHRlbnNpb25zIiwiaW50ZXJjZXB0YWJsZSIsImludGVyY2VwdG9ycyIsImluZGV4T2YiLCJsaXN0ZW5hYmxlIiwic2xpY2UiLCJrZXlzU3ltYm9sIiwibWFrZUF1dG9PYnNlcnZhYmxlIiwib3ZlcnJpZGVzIiwiU1BMSUNFIiwiTUFYX1NQTElDRV9TSVpFIiwiYXJyYXlUcmFwcyIsImdldEFycmF5TGVuZ3RoXyIsImlzTmFOIiwicGFyc2VJbnQiLCJhcnJheUV4dGVuc2lvbnMiLCJzZXRBcnJheUxlbmd0aF8iLCJPYnNlcnZhYmxlQXJyYXlBZG1pbmlzdHJhdGlvbiIsIm93bmVkXyIsImxlZ2FjeU1vZGVfIiwiYXRvbV8iLCJlbmhhbmNlcl8iLCJsYXN0S25vd25MZW5ndGhfIiwibmV3ViIsIm9sZFYiLCJkZWhhbmNlVmFsdWVfIiwiZGVoYW5jZVZhbHVlc18iLCJ2YWx1ZXMiLCJhZGRlZCIsImFkZGVkQ291bnQiLCJyZW1vdmVkIiwicmVtb3ZlZENvdW50IiwibmV3TGVuZ3RoIiwiY3VycmVudExlbmd0aCIsIm5ld0l0ZW1zIiwic3BsaWNlV2l0aEFycmF5XyIsInVwZGF0ZUFycmF5TGVuZ3RoXyIsIm9sZExlbmd0aCIsImRlbHRhIiwicmVzZXJ2ZUFycmF5QnVmZmVyIiwiZGVsZXRlQ291bnQiLCJNYXRoIiwibWF4IiwibWluIiwibGVuZ3RoRGVsdGEiLCJzcGxpY2VJdGVtc0ludG9WYWx1ZXNfIiwibm90aWZ5QXJyYXlTcGxpY2VfIiwib2xkSXRlbXMiLCJub3RpZnlBcnJheUNoaWxkVXBkYXRlXyIsIm93bmVkIiwiY2xlYXIiLCJzcGxpY2VXaXRoQXJyYXkiLCJpdGVtcyIsInNoaWZ0IiwidW5zaGlmdCIsInJldmVyc2UiLCJzb3J0IiwiY29weSIsInJlbW92ZSIsImFkZEFycmF5RXh0ZW5zaW9uIiwic2ltcGxlRnVuYyIsIm1hcExpa2VGdW5jIiwicmVkdWNlTGlrZUZ1bmMiLCJmdW5jTmFtZSIsImZ1bmNGYWN0b3J5IiwiZGVoYW5jZWRWYWx1ZXMiLCJjYWxsYmFjayIsImVsZW1lbnQiLCJhY2N1bXVsYXRvciIsImN1cnJlbnRWYWx1ZSIsImlzT2JzZXJ2YWJsZUFycmF5QWRtaW5pc3RyYXRpb24iLCJPYnNlcnZhYmxlTWFwTWFya2VyIiwiQUREIiwiREVMRVRFIiwiaXRlcmF0b3IiLCJ0b1N0cmluZ1RhZyIsImluaXRpYWxEYXRhIiwiZGF0YV8iLCJoYXNNYXBfIiwia2V5c0F0b21fIiwibWVyZ2UiLCJlbnRyeSIsIm5ld0VudHJ5IiwiaGFzS2V5IiwidXBkYXRlVmFsdWVfIiwiYWRkVmFsdWVfIiwibWFrZUl0ZXJhYmxlIiwiZW50cmllcyIsInJlcGxhY2VtZW50TWFwIiwiY29udmVydFRvTWFwIiwib3JkZXJlZERhdGEiLCJrZXlzUmVwb3J0Q2hhbmdlZENhbGxlZCIsImRlbGV0ZWQiLCJrZXlFeGlzdGVkIiwiaXRlcjEiLCJpdGVyMiIsIm5leHQxIiwibmV4dDIiLCJPYnNlcnZhYmxlU2V0TWFya2VyIiwiX1N5bWJvbCRpdGVyYXRvciIsIl9TeW1ib2wkdG9TdHJpbmdUYWciLCJjYWxsYmFja0ZuIiwibmV4dEluZGV4Iiwib2JzZXJ2YWJsZVZhbHVlcyIsImRlc2NyaXB0b3JDYWNoZSIsIlJFTU9WRSIsIk9ic2VydmFibGVPYmplY3RBZG1pbmlzdHJhdGlvbiIsImRlZmF1bHRBbm5vdGF0aW9uXyIsImFwcGxpZWRBbm5vdGF0aW9uc18iLCJwZW5kaW5nS2V5c18iLCJpc0Fubm90YXRpb24iLCJnZXRPYnNlcnZhYmxlUHJvcFZhbHVlXyIsInNldE9ic2VydmFibGVQcm9wVmFsdWVfIiwiYXNzZXJ0QW5ub3RhYmxlIiwib3V0Y29tZSIsInJlY29yZEFubm90YXRpb25BcHBsaWVkIiwiZGVsZXRlT3V0Y29tZSIsIm5vdGlmeVByb3BlcnR5QWRkaXRpb25fIiwiY2FjaGVkRGVzY3JpcHRvciIsImdldENhY2hlZE9ic2VydmFibGVQcm9wRGVzY3JpcHRvciIsImtleXNfIiwiZ2V0QWRtaW5pc3RyYXRpb24iLCJnZXREZWJ1Z05hbWUiLCJpc0V4dGVuc2libGUiLCJpc09ic2VydmFibGVPYmplY3RBZG1pbmlzdHJhdGlvbiIsIkVOVFJZXzAiLCJjcmVhdGVBcnJheUVudHJ5RGVzY3JpcHRvciIsIk9CU0VSVkFCTEVfQVJSQVlfQlVGRkVSX1NJWkUiLCJTdHViQXJyYXkiLCJpbmhlcml0IiwiY3RvciIsInNldFByb3RvdHlwZU9mIiwiX19wcm90b19fIiwiTGVnYWN5T2JzZXJ2YWJsZUFycmF5IiwiYXJyYXlzIiwiY3JlYXRlQXJyYXlCdWZmZXJJdGVtIiwibmFtZWQiLCJlcSIsImFTdGFjayIsImJTdGFjayIsImNsYXNzTmFtZSIsInVud3JhcCIsImFyZUFycmF5cyIsImFDdG9yIiwiYkN0b3IiLCJnZXRTZWxmIiwibSIsImciLCJfX01PQlhfREVWVE9PTFNfR0xPQkFMX0hPT0tfXyIsImluamVjdE1vYngiLCJleHRyYXMiLCJtb2J4Lm1ha2VBdXRvT2JzZXJ2YWJsZSIsIm1vYnguYXV0b3J1biIsIm1vYngudG9KUyIsIm1vYngucnVuSW5BY3Rpb24iXSwibWFwcGluZ3MiOiI7OztBQUFBLDZCQUFlLENBQUMsT0FBTyxNQUFNLEtBQUssV0FBVyxHQUFHLE1BQU07WUFDdEQsWUFBWSxPQUFPLElBQUksS0FBSyxXQUFXLEdBQUcsSUFBSTtZQUM5QyxZQUFZLE9BQU8sTUFBTSxLQUFLLFdBQVcsR0FBRyxNQUFNLEdBQUcsRUFBRTs7WUNGdkQ7OztZQUdBLFNBQVMsZ0JBQWdCLEdBQUc7WUFDeEIsSUFBQSxNQUFNLElBQUksS0FBSyxDQUFDLGlDQUFpQyxDQUFDLENBQUM7WUFDdEQsQ0FBQTtZQUNELFNBQVMsbUJBQW1CLElBQUk7WUFDNUIsSUFBQSxNQUFNLElBQUksS0FBSyxDQUFDLG1DQUFtQyxDQUFDLENBQUM7WUFDeEQsQ0FBQTtZQUNELElBQUksZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUM7WUFDeEMsSUFBSSxrQkFBa0IsR0FBRyxtQkFBbUIsQ0FBQztZQUM3QyxJQUFJLE9BQU9BLFFBQU0sQ0FBQyxVQUFVLEtBQUssVUFBVSxFQUFFO2dCQUN6QyxnQkFBZ0IsR0FBRyxVQUFVLENBQUM7WUFDakMsQ0FBQTtZQUNELElBQUksT0FBT0EsUUFBTSxDQUFDLFlBQVksS0FBSyxVQUFVLEVBQUU7Z0JBQzNDLGtCQUFrQixHQUFHLFlBQVksQ0FBQztZQUNyQyxDQUFBOztZQUVELFNBQVMsVUFBVSxDQUFDLEdBQUcsRUFBRTtnQkFDckIsSUFBSSxnQkFBZ0IsS0FBSyxVQUFVLEVBQUU7O1lBRWpDLFFBQUEsT0FBTyxV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
