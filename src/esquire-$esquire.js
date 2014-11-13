/**
 * A module exposing the current {@link Esquire} instance.
 *
 * The {@link Module} constructor function can use this instance to (for
 * example) resolve optional dependencies.
 *
 * @module {Esquire} $esquire
 * @example -
 * Esquire.define("myModule", ['$esquire'], function($esquire) {
 *   var optionalModule;
 *   try {
 *     optionalModule = $esquire.require('optionalModule');
 *   } catch (error) {
 *     console.log("Optional module not available");
 *   }
 *   //...
 * });
 */
