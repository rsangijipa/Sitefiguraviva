"use strict";

const modern = require("minimatch-modern");

// Minimatch 3 exported a callable CommonJS value. New versions export an object.
// Keep the callable shape while delegating all matching to the patched engine.
function facade(engine) {
  function match(path, pattern, options) {
    return engine(path, pattern, options);
  }
  Object.assign(match, engine);
  // eslint-plugin-import only calls .test() on makeRe's result. Minimatch 11
  // intentionally removed regex compilation; retain that matcher contract
  // without reintroducing an older regex engine or claiming to return RegExp.
  match.makeRe = (pattern, options) => {
    const matcher = new engine.Minimatch(pattern, options);
    return Object.freeze({ test: (path) => matcher.match(path) });
  };
  match.defaults = (options) => facade(engine.defaults(options));
  return match;
}

module.exports = facade(modern.minimatch);
