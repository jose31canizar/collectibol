// Polyfill for Array.prototype.toReversed() for Node.js < 20
// This file should be imported at the very beginning of index.ts

if (!Array.prototype.toReversed) {
  Array.prototype.toReversed = function() {
    return [...this].reverse();
  };
}
