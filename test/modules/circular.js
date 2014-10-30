Esquire.define('circular-a', ['circular-g'], function() {
  return "a value";
});

Esquire.define('circular-b', ['circular-a'], function() {
  return "b value";
});

Esquire.define('circular-c', ['circular-b'], function() {
  return "c value";
});

Esquire.define('circular-d', ['circular-c'], function() {
  return "d value";
});

Esquire.define('circular-e', ['circular-d'], function() {
  return "e value";
});

Esquire.define('circular-f', ['circular-e'], function() {
  return "f value";
});

Esquire.define('circular-g', ['circular-f'], function() {
  return "g value";
});



Esquire.define('circular-self', ['circular-self'], function() {
  return "self value";
});
