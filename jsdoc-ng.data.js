!function(){angular.module("jsDocNG-Data",[]).constant("$title","USRZ Esquire API (v. 0.0.0)").constant("$readme",'<h1>Esquire</h1><p>Esquire is a light weight script loader and injection framework for JavaScript.</p>\n<p>It is similar in conecpt to <em>RequireJS</em> but with a few twists:</p>\n<ul>\n<li>Module loading, definition and instantiation is completely separate.</li>\n<li>Many instances of the same injector can be used, module instances will be\nkept separate.</li>\n<li>It <a href="https://github.com/usrz/javascript-karma-esquire">plays nicely</a> with\n<a href="http://karma-runner.github.io/">Karma</a> for testing.</li>\n</ul>\n<div class="nojsdoc">\n  The full API documentation is avaiblable\n  <a target="_blank" href="http://usrz.github.io/javascript-esquire/">here</a>.\n</div>').constant("$doclets",[{description:'<p>A module exposing the current <a href="#!/Esquire"><code>Esquire</code></a> instance.</p> <p>The <a href="#!/Module"><code>Module</code></a> constructor function can use this instance to (for example) resolve optional dependencies.</p>',kind:"module",name:"$esquire",type:{names:["Esquire"]},examples:["-\nEsquire.define(\"myModule\", ['$esquire'], function($esquire) {\n var optionalModule;\n try {\n   optionalModule = $esquire.require('optionalModule');\n } catch (error) {\n   console.log(\"Optional module not available\");\n }\n //...\n});"],longname:"module:$esquire",$href:"module:$esquire",$id:"T000002R000002"},{description:'<p>A module exposing the <em>global</em> <a href="https://developer.mozilla.org/en-US/docs/Web/API/Window"><code>window</code></a> reference (in browsers) or whatever other object supposedly holds all <em>global</em> definitions.</p> <p>The primary intent of this module is to be used with <a href="https://developer.mozilla.org/en-US/docs/Web/Guide/Performance/Using_web_workers">web workers</a> where some (most?) of the <code>window</code> objects and methods are exposed through the <code>self</code> global reference, or with <em>Node.JS</em> where <code>global</code> is used.</p>',kind:"module",name:"$global",type:{names:["Window"]},examples:["-\nEsquire.define(\"crypto\", ['$global'], function($global) {\n var subtle = $global.crypto.subtle;\n //...\n});"],longname:"module:$global",$href:"module:$global",$id:"T000002R000003"},{kind:"class",name:"Module",classdesc:'<p>The definition of an <a href="#!/Esquire"><code>Esquire</code></a> module</p>',longname:"Module",scope:"global",$href:"Module",$id:"T000002R000031"},{description:'<p>The name of this <a href="#!/Module"><code>Module</code></a></p>',kind:"member",name:"name",type:{names:["string"]},memberof:"Module",readonly:!0,scope:"static",longname:"Module.name",$href:"Module#name",$id:"T000002R000033"},{description:'<p>The name of all dependencies required by this <a href="#!/Module"><code>Module</code></a> (in order).</p>',kind:"member",name:"dependencies",type:{names:["Array.<string>"]},memberof:"Module",readonly:!0,scope:"static",longname:"Module.dependencies",$href:"Module#dependencies",$id:"T000002R000037"},{description:'<p>The constructor function creating instances of this <a href="#!/Module"><code>Module</code></a>.</p>',kind:"member",name:"constructor",type:{names:["function"]},memberof:"Module",readonly:!0,scope:"static",longname:"Module.constructor",$href:"Module#constructor",$id:"T000002R000041"},{description:'<p>Define a <a href="#!/Module"><code>Module</code></a> as available to Esquire</p>',scope:"static",kind:"function",name:"define",memberof:"Esquire",examples:["-\nEsquire.define('foo', ['modA', 'depB'], function(a, b) {\n // 'a' will be an instance of 'modA'\n // 'b' will be an instance of 'depB'\n function Foo(aInstance, bInstance) {\n   // ...\n };\n return new Foo(a, b);\n});","Definition with a <a href=\"#!/Module\"><code>Module</code></a>-like object also works.\nEsquire.define({\n name: 'foo',\n dependencies: ['modA', 'depB'],\n constructor: function(a, b) {\n   // ...\n }\n});"],params:[{type:{names:["string"]},description:"<p>The name of the module to define.</p>",name:"name"},{type:{names:["Array.<string>"]},optional:!0,description:"<p>An array of required module names whose instances will be passed to the <code>constructor(...)</code> method.</p>",name:"dependencies"},{type:{names:["function"]},description:'<p>A function that will be invoked once per each <a href="#!/Esquire"><code>Esquire</code></a> instance. Its return value will be injected in any other module requiring this module as a dependency.</p>',name:"constructor"}],returns:[{type:{names:["Module"]},description:'<p>The new <a href="#!/Module"><code>Module</code></a> created by this call.</p>'}],longname:"Esquire.define",$href:"Esquire#define",$id:"T000002R000051"},{description:'<p>Return an array of <a href="#!/Module"><code>Module</code></a> dependencies for a <a href="#!/Module"><code>Module</code></a>.</p>',scope:"static",kind:"function",name:"resolve",memberof:"Esquire",params:[{type:{names:["string","Module"]},description:'<p>The <a href="#!/Module"><code>Module</code></a> (or its name) for which dependendencies should be resolved.</p>',name:"module"},{type:{names:["boolean"]},optional:!0,description:'<p>If <code>true</code> all direct and indirect <em>(transitive)</em> dependencies will be resolved. If <code>false</code> or <em>undefined</em>, only the <a href="#!/Module"><code>Module</code></a>\'s explicit dependencies will be resolved.</p>',name:"transitive"}],returns:[{type:{names:["Array.<Module>"]},description:'<p>An array of all required <a href="#!/Module"><code>Module</code></a>s.</p>'}],longname:"Esquire.resolve",$href:"Esquire#resolve",$id:"T000002R000062"},{description:'<p>Create a new <a href="#!/Esquire"><code>Esquire</code></a> injector instance.</p>',kind:"class",name:"Esquire",classdesc:'<p><a href="#!/Esquire#modules"><code>Modules</code></a> are <em>static</em> and shared amongst all <a href="#!/Esquire"><code>Esquire</code></a> instances (see <a href="#!/Esquire#define"><code>define(...)</code></a>), but their instances not, and are only created <em>once</em> for each <a href="#!/Esquire"><code>Esquire</code></a> instance.</p> <p>A <em>globally shared</em> <a href="#!/Esquire"><code>Esquire</code></a> instance can be used by invoking the <a href="#!/#esquire"><code>esquire(...)</code></a> method, rather than creating a new instance and using the <a href="#!/Esquire#require"><code>require(...)</code></a> call.</p>',longname:"Esquire",scope:"global",$href:"Esquire",$id:"T000002R000072"},{description:"<p>Require instances for the specified module(s).</p>",scope:"instance",kind:"function",memberof:"Esquire",examples:["-\nvar esq = new Esquire();\n\nvar fromArray = esq.require(['fooModule', 'barModule']);\n// fromArray[0] will be an instance of 'fooModule'\n// fromArray[1] will be an instance of 'barModule'","Injection with a single `string` argument\nvar fromString = esq.require('bazModule');\n// 'fromString' will be an instance of 'bazModule'","Injection with a number of different arguments\nvar fromArgs = esq.require('abcModule', 'xyzModule');\n// fromArgs[0] will be an instance of 'abcModule'\n// fromArgs[1] will be an instance of 'xyzModule'"],params:[{type:{names:["Array.<string>","string"]},description:"<p>An array of required module names (or a single module name) whose instance are to be returned.</p>",name:"dependencies"}],returns:[{type:{names:["Array.<object>","object"]},description:"<p>An array of module instances, or a single module instance, if this method was called with a single <code>string</code> parameter.</p>"}],name:"require",longname:"Esquire#require",$href:"Esquire#require",$id:"T000002R000084"},{description:"<p>Request injection for the specified modules.</p>",scope:"instance",kind:"function",name:"inject",memberof:"Esquire",examples:["-\nvar esq = new Esquire();\n\nesq.inject(['modA', 'depB'], function(a, b) {\n // 'a' will be an instance of 'modA'\n // 'b' will be an instance of 'depB'\n});","Injection also works without arrays (only arguments)\nesq.inject('modA', 'depB', function(a, b) {\n // 'a' will be an instance of 'modA'\n // 'b' will be an instance of 'depB'\n});","Angular-JS style injection (one big array) is supported, too\nesq.inject(['modA', 'depB', function(a, b) {\n // 'a' will be an instance of 'modA'\n // 'b' will be an instance of 'depB'\n}]);"],params:[{type:{names:["Array.<string>","string"]},optional:!0,description:"<p>An array of required module names whose instances will be passed to the <code>callback(...)</code> method.</p>",name:"dependencies"},{type:{names:["function"]},description:"<p>A function that will be called once all module dependencies have been instantiated, with each instance as a parameter.</p>",name:"callback"}],returns:[{description:"<p>Whatever value was returned by the <code>callback</code> function.</p>"}],longname:"Esquire#inject",$href:"Esquire#inject",$id:"T000002R000087"},{description:'<p>An unmodifiable dictionary of all <a href="#!/Module"><code>Module</code></a>s known by <a href="#!/Esquire"><code>Esquire</code></a>.</p>',scope:"static",readonly:!0,kind:"member",name:"modules",type:{names:["Object.<string, Module>"]},memberof:"Esquire",examples:['-\n{\n "modA": {\n   "name": "modA",\n   "dependencies": [ ... ],\n   "constructor": function(...) { ... }\n },\n "depB": {\n   "name": "depB",\n   "dependencies": [ ... ],\n   "constructor": function(...) { ... }\n },\n}'],longname:"Esquire.modules",$href:"Esquire#modules",$id:"T000002R000115"},{description:'<p>Return the <a href="#!/Module"><code>Module</code></a> associated with the given <code>name</code> as defined in <a href="#!/Esquire"><code>Esquire</code></a> or <code>null</code>.</p>',scope:"static",kind:"function",name:"module",params:[{type:{names:["string"]},description:'<p>The name of the <a href="#!/Module"><code>Module</code></a> to return.</p>',name:"name"}],memberof:"Esquire",returns:[{type:{names:["Module"]},description:'<p>The <a href="#!/Module"><code>Module</code></a> or <code>null</code></p>'}],longname:"Esquire.module",$href:"Esquire#module",$id:"T000002R000123"},{description:'<p>Request <strong>static</strong> injection for the specified modules.</p> <p>If a <code>callback</code> function was specified, then this method will behave like <a href="#!/Esquire#inject"><code>inject(...)</code></a>, thus dependencies will be resolved and passed to <code>callback</code> method, and its return value (if any) will be returned from this method.</p> <p>If no <code>callback</code> function was given, this method will behave like <code>require(...)</code> and simply return the required dependencies.</p> <p>Note that this method will use a globally shared <a href="#!/Esquire"><code>Esquire</code></a> instance to create and resolve dependencies.</p>',scope:"global",params:[{type:{names:["array"]},description:"<p>An array of required module names whose instances will be passed to the <code>callback(...)</code> method.</p>",name:"dependencies"},{type:{names:["function"]},optional:!0,description:"<p>A function that will be called once all module dependencies have been instantiated, with each instance as a parameter.</p>",name:"callback"}],returns:[{type:{names:["object"]},description:'<p>Whatever value was returned by the <code>callback</code> function (if one was specified) as in <a href="#!/Esquire#inject"><code>Esquire#inject</code></a>.</p>'},{type:{names:["Array.<object>","object"]},description:'<p>An array of module instances (or a single module instance) as in <a href="#!/Esquire#require"><code>Esquire#require</code></a> if this method was called wihtout any <code>callback</code> function.</p>'}],name:"esquire",longname:"esquire",kind:"function",$href:"#esquire",$id:"T000002R000134"},{description:'<p>Load an external script and return a <em>then-able</em> <a href="https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise"><code>Promise</code></a>.</p>',scope:"static",kind:"function",name:"load",memberof:"Esquire",examples:["-\nEsquire.load('scriptA.js', 'scriptB.js').then(\n function(modules) {\n   // All good: 'modules' will be the same as \"Esquire.modules\"\n },\n function(failure) {\n   // Something bad happend: 'failure' will contain the reason.\n }\n);"],params:[{type:{names:["string","Array.<string>"]},description:"<p>The script(s) to load.</p>",name:"scripts"},{type:{names:["string"]},optional:!0,description:"<p>Any other script names, as arguments, to support calls like <code>load('scriptA.js', 'scriptB.js')</code></p>",name:"..."}],returns:[{type:{names:["Promise"]},description:'<p>A <em>then-able</em> <code>Promise</code> resolving <a href="#!/Esquire#modules"><code>Esquire.modules</code></a>.</p>'}],longname:"Esquire.load",$href:"Esquire#load",$id:"T000002R000197"}])}();