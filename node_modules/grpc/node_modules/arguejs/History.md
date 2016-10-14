
## v0.2.3

* For now on, consider `undefined` as a non passed argument. (#12)
* Forbid numeric parameter names. (#13)

## v0.2.2

* Added a list of given and expected arguments when error by "Incompatible type signature".

## v0.2.1

* Fix on `belongs` when dealing with `undefined` and `null` values

## v0.2.0

* COMPATIBILITY BREAK! The wildcard to avoid type-check is now `null`, not `undefined` anymore
* *special data types* are now defined inside `__.type`
* Added `global` as new *special data type* and removed `undefined` from them
* Added the public utility methods `getType`, `typeof`, `belongs` and `noConflict`

## v0.1.3

* more consistent bug fix to #1

## v0.1.2

* fixed a bug with optional arguments ordering #1
* Data type 'Arguments' added;

## v0.1.1

* Added strict mode compatibility

## v0.1.0

* Fixed bug on node that do not allow to recognize global objects
* Installation notes added

## v0.0.1

* Initial public launch
