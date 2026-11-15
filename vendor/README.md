# Security compatibility packages

These private local packages repair lint/test/build dependency chains.
They must be included in the repository and in clean installations; no postinstall
rewriting of node_modules or audit suppression is used.

## deepmerge

`deepmerge/` vendors the CommonJS build and declarations from deepmerge 4.3.1,
with its MIT license. `UPSTREAM.json` records the source and original SHA-256.
The original package has no published fix for
[GHSA-gcqx-w48m-w2h4](https://github.com/advisories/GHSA-gcqx-w48m-w2h4).

The local fork (`4.3.1-fv.1`, not an upstream release) replaces each assignment to a merge destination with
`Object.defineProperty`. Copying a target or merging a source can therefore never
invoke the inherited `__proto__` setter, including with null-prototype inputs.
Array merging, symbols, cloning and custom merge options retain upstream behavior.
The application does not import this package; Jest uses the override.

## minimatch-compat

Legacy lint packages call `require('minimatch')` as a function. The fixed Minimatch
11 exports an object. This facade preserves the callable export, helper functions,
constructor and defaults factory, delegating matching to official Minimatch 11.0.4.
The workspace version `11.0.4-fv.1` identifies this facade. It contains no copied matching engine. The published package is installed under
the explicit `minimatch-modern` npm alias and is still audited by npm.

Explicit overrides for legacy lint consumers select the workspace
by version. This avoids npm resolving relative file overrides inside parent
packages. Modern
consumers receive official Minimatch 11 directly. Node 24 is already the project's
documented runtime. Avoid replacing the facade with an unadapted global override.

Minimatch 11 removed regex compilation. For the legacy import rule, `makeRe`
returns a frozen object with `.test(path)` delegated to the new matcher; it does
not claim to return a RegExp. This is the only makeRe contract used by the scoped
consumers. Tests exercise the actual import rule as well as Glob and matching
helpers. New consumers requiring RegExp internals need a compatibility review.

Coverage uses test-exclude 8 and official Glob 14/Minimatch 11. It no longer
depends on the old Glob 7 matcher internals. Both packages here are npm workspaces;
scoped version overrides keep installation paths portable across operating systems.

Run `npm run test:dependency-security` after changing these packages or their
consumers, in addition to lint, unit tests, coverage, types and build.
Remove the local packages when upstream consumers provide corrected compatible
dependencies; re-run the complete audit and compatibility checks before removal.
