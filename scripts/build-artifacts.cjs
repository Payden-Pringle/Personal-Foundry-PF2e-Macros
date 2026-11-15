// Rebuild importable documents and the standalone examples from the studio.
// Run from any directory: node scripts/build-artifacts.cjs
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const check = process.argv.includes('--check');
const studioPath = path.join(root, 'meta-macros', 'card-macro-studio.js');
const studioSource = fs.readFileSync(studioPath, 'utf8');
const entryPoint = 'await studioOpen();';
assert.equal(studioSource.split(entryPoint).length, 2, 'Studio entry point must appear once');
const exportedSource = studioSource.replace(entryPoint,
  'return { studioDefaults, studioMacroData, STUDIO_CASES, STUDIO_THEMES };');
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

async function main() {
  const studio = await new AsyncFunction(exportedSource)();
  const studioDocument = {
    name: 'Card Macro Studio', type: 'script', scope: 'global',
    img: 'icons/svg/dice-target.svg', command: studioSource, flags: {}
  };
  writeJSON(path.join(root, 'meta-macros', 'card-macro-studio.json'), studioDocument);

  const makeRecipe = (id, name, presetName) => {
    const recipe = studio.studioDefaults();
    recipe.id = id;
    recipe.name = name;
    if (presetName) {
      const preset = studio.STUDIO_CASES[presetName];
      const theme = studio.STUDIO_THEMES[preset.theme];
      recipe.mode = preset.mode;
      Object.assign(recipe.card, theme, {
        theme: preset.theme, title: preset.title, subtitle: preset.subtitle,
        paragraphs: [...preset.paragraphs]
      });
      if (preset.results) Object.assign(recipe.results, preset.results);
    }
    return recipe;
  };

  const manifestation = makeRecipe('exampleManifest1', 'Manifestation Spell Picker');
  manifestation.mode = 'manifestation';
  Object.assign(manifestation.card, studio.STUDIO_THEMES.arcane, {
    theme: 'arcane', title: 'MANIFESTATION',
    subtitle: 'For one moment, possibility answers.',
    paragraphs: ['{actor} reaches beyond the possible.', 'Magic takes shape in answer to the wish.']
  });

  const summon = makeRecipe('exampleSummon001', 'Summon a Creature', 'summon');
  summon.card.artMode = 'summon';

  const fish = makeRecipe('exampleFish00001', "Congratulations! It's a Fish!", 'fish');

  const transformation = makeRecipe('exampleDragon001', 'Dragon Form Transformation', 'transformation');
  Object.assign(transformation.behavior, {
    effectEnabled: true,
    effectUuid: 'Compendium.pf2e.spell-effects.Item.1pC1qjvCuAKzjYo8',
    effectRank: 6, syncSize: true
  });

  for (const [name, recipe] of [
    ['manifestation-spell-picker', manifestation],
    ['summon-creature', summon],
    ['recall-knowledge-fish', fish],
    ['dragon-form-transformation', transformation]
  ]) {
    const data = studio.studioMacroData(recipe);
    writeJSON(path.join(root, 'macros', `${name}.json`), data);
    writeFile(path.join(root, 'macros', `${name}.js`), data.command);
  }
  console.log(`${check ? 'Verified' : 'Built'} the studio import and four editable, standalone examples.`);
}

function writeJSON(filename, data) {
  writeFile(filename, JSON.stringify(data, null, 2) + '\n');
}

function writeFile(filename, content) {
  if (check) assert.equal(fs.readFileSync(filename, 'utf8'), content, `${path.relative(root, filename)} is out of date`);
  else fs.writeFileSync(filename, content);
}

main().catch(error => { console.error(error); process.exitCode = 1; });
