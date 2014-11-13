/**
 * A module exposing the _global_
 * [`window`](https://developer.mozilla.org/en-US/docs/Web/API/Window)
 * reference.
 *
 * The primary intent of this module is to be used with
 * [web workers](https://developer.mozilla.org/en-US/docs/Web/Guide/Performance/Using_web_workers)
 * where some (most?) of the `window` objects and methods are exposed through
 * the `self` global reference.
 *
 * @module {Window} $window
 * @example -
 * Esquire.define("crypto", ['$window'], function($window) {
 *   var subtle = $window.crypto.subtle;
 *   //...
 * });
 */
