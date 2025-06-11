import assert from 'assert';
import { applyEntry } from './finance.js';

assert.strictEqual(applyEntry(10, 'recette', 5), 15);
assert.strictEqual(applyEntry(10, 'depense', 5), 5);

console.log('Tests passed');
