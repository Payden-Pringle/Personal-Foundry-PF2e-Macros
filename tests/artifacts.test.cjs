const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');

execFileSync(process.execPath, [path.join(root, 'scripts', 'build-artifacts.cjs'), '--check'], { stdio: 'pipe' });
const studio = JSON.parse(read('meta-macros/card-macro-studio.json'));
assert.equal(studio.command, read('meta-macros/card-macro-studio.js'));
assert.equal(studio.type, 'script');
new AsyncFunction(studio.command);

const examples = [
  ['manifestation-spell-picker', 'manifestation'],
  ['summon-creature', 'summon'],
  ['recall-knowledge-fish', 'card'],
  ['dragon-form-transformation', 'transform']
];
const ids = new Set();
for (const [name, mode] of examples) {
  const macro = JSON.parse(read(`macros/${name}.json`));
  const meta = macro.flags.world.cardMacroStudio;
  assert.equal(macro.command, read(`macros/${name}.js`));
  assert.equal(macro.type, 'script');
  assert.equal(meta.recipe.mode, mode);
  assert(!ids.has(meta.recipe.id), `${name} must have a distinct recipe id`);
  ids.add(meta.recipe.id);
  assert.equal(meta.recipe.actorBinding, 'assigned');
  for (const key of ['artPath', 'overlayPath']) assert.equal(meta.recipe.card[key], '');
  for (const key of ['tokenPath', 'portraitPath', 'transitionPath']) assert.equal(meta.recipe.behavior[key], '');
  new AsyncFunction(macro.command);
}
const dragon = JSON.parse(read('macros/dragon-form-transformation.json')).flags.world.cardMacroStudio.recipe;
assert.equal(dragon.behavior.effectUuid, 'Compendium.pf2e.spell-effects.Item.1pC1qjvCuAKzjYo8');
assert.equal(dragon.behavior.syncSize, true);
console.log('PASS: importable artifacts match their sources and generic examples.');
