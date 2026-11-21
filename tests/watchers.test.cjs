const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const AsyncFunction = Object.getPrototypeOf(async function() {}).constructor;
const source = fs.readFileSync(path.join(__dirname, '..', 'meta-macros', 'card-macro-studio.js'), 'utf8')
  .replace('await studioOpen();', 'return { studioDefaults, studioNormalizeRecipe, studioMacroData, studioValidate, studioEditor, studioSizeScrollArea };');

const actor = { id: 'hero', uuid: 'Actor.hero', name: 'Hero', img: 'hero.webp', isOwner: true };
let listener, choice, notifications, messages, targets;

function setup() {
  listener = null; choice = null; messages = []; notifications = []; targets = new Map();
  globalThis.cardMacroStudioWatchers = new Map();
  global.game = { user: { id: 'player', character: actor, targets: new Set() }, actors: { contents: [actor] } };
  global.foundry = { utils: { randomID: () => 'recipe' }, applications: { api: { DialogV2: { wait: async () => choice } } } };
  global.document = { createElement: () => ({ innerHTML: '' }) };
  global.ui = { notifications: {
    info: message => notifications.push(['info', message]), warn: message => notifications.push(['warn', message]),
    error: message => notifications.push(['error', message])
  } };
  global.Hooks = { on: (event, fn) => { assert.equal(event, 'createChatMessage'); listener = fn; return 10; },
    off: (event, id) => { assert.equal(event, 'createChatMessage'); assert.equal(id, 10); listener = null; } };
  global.fromUuid = async uuid => uuid === actor.uuid ? actor : targets.get(uuid);
  global.CONFIG = { ChatMessage: { documentClass: {
    applyMode(data, mode) {
      if (mode === 'self') return { ...data, whisper: ['player'], blind: false };
      if (mode === 'public') return { ...data, whisper: [], blind: false };
      return { ...data, whisper: data.whisper.length ? data.whisper : ['gm'], blind: mode === 'blind' };
    },
    async create(data, options) { messages.push({ ...data, messageMode: options.messageMode }); }
  } } };
  global.ChatMessage = CONFIG.ChatMessage.documentClass;
}

let messageNumber = 0;
function send({ type = 'attack-roll', who = actor.id, author = 'player', outcome = 'criticalSuccess', degree,
  options = [], whisper = [], blind = false, target, action } = {}) {
  const message = { id: 'm' + ++messageNumber, author: { id: author }, speaker: { actor: who }, whisper, blind,
    flags: { pf2e: { context: { type, actor: who, outcome, options, target, action } } }, rolls: [{ options: { degreeOfSuccess: degree } }] };
  listener(message, {}, author);
  return message;
}
const tick = () => new Promise(resolve => setImmediate(resolve));

(async () => {
  setup();
  const studio = await new AsyncFunction(source)();
  const recipe = studio.studioDefaults();
  recipe.name = 'Watch the Strike';

  // Old saved recipes still load with watcher defaults and their settings intact.
  const oldRecipe = structuredClone(recipe); delete oldRecipe.behavior.watch;
  oldRecipe.card.title = 'OLD CARD';
  const migrated = studio.studioNormalizeRecipe(oldRecipe);
  assert.equal(migrated.behavior.watch.enabled, false);
  assert.equal(migrated.behavior.watch.outcome, 'criticalSuccess');
  assert.equal(migrated.card.title, 'OLD CARD');
  assert.equal(studio.studioValidate(migrated), '');

  const editor = studio.studioEditor(recipe, []).innerHTML;
  assert.match(editor, /data-studio-scroll[^>]*overflow-y:auto/);
  assert.match(editor, /data-setting="behavior\.watch\.enabled"/);
  const scroll = { style: {}, getBoundingClientRect: () => ({ top: 80 }) };
  const form = { querySelector: () => ({ getBoundingClientRect: () => ({ height: 50 }) }) };
  const win = { getBoundingClientRect: () => ({ bottom: 720 }), querySelector: () => null };
  studio.studioSizeScrollArea(win, form, scroll); assert.equal(scroll.style.maxHeight, '574px');
  win.getBoundingClientRect = () => ({ bottom: 420 });
  studio.studioSizeScrollArea(win, form, scroll); assert.equal(scroll.style.maxHeight, '274px', 'resizing reduces the scroll region');
  const basic = studio.studioMacroData(recipe).command;
  assert(!basic.includes('function studioChooseSummon'));
  assert(!basic.includes('function studioManifestation'));
  assert(!basic.includes('function studioRestore'));
  assert(!basic.includes('function studioRunWatcher'));
  assert(!basic.includes('function studioRunRecipe('));
  assert(basic.length < 12000, `simple card code should be small: ${basic.length}`);
  const summon = structuredClone(recipe); summon.mode = 'summon';
  const summonSource = studio.studioMacroData(summon).command;
  assert(summonSource.includes('function studioChooseSummon'));
  assert(!summonSource.includes('function studioRestore'));
  assert(!summonSource.includes('function studioManifestation('));
  const transform = structuredClone(recipe); transform.mode = 'transform';
  const transformSource = studio.studioMacroData(transform).command;
  assert(transformSource.includes('function studioRestore'));
  assert(!transformSource.includes('function studioChooseSummon'));
  assert(!transformSource.includes('function studioManifestation('));
  assert(!transformSource.includes('function studioRunTemporaryRecipe'));
  const temporary = structuredClone(recipe); temporary.mode = 'temporary';
  const temporarySource = studio.studioMacroData(temporary).command;
  assert(!temporarySource.includes('function studioAddEffect'));
  assert(!temporarySource.includes('function studioRunChangeRecipe'));
  assert(!temporarySource.includes('function studioManifestation('));
  const manifestation = structuredClone(recipe); manifestation.mode = 'manifestation';
  const manifestationSource = studio.studioMacroData(manifestation).command;
  assert(manifestationSource.includes('function studioManifestation('));
  assert(!manifestationSource.includes('function studioAddEffect'));
  assert(!manifestationSource.includes('function studioChooseSummon'));

  recipe.behavior.watch.enabled = true;
  assert.equal(studio.studioValidate(recipe), '');
  const invalid = structuredClone(recipe); invalid.mode = 'transform';
  assert.match(studio.studioValidate(invalid), /available for/);
  invalid.mode = 'card'; invalid.actorBinding = 'none';
  assert.match(studio.studioValidate(invalid), /actor/);
  invalid.actorBinding = 'assigned'; invalid.behavior.toolbeltSpellMacro = true;
  assert.match(studio.studioValidate(invalid), /Toolbelt/);
  invalid.behavior.toolbeltSpellMacro = false; invalid.behavior.watch.reactiveOnly = true; invalid.behavior.watch.type = 'skill-check';
  assert.match(studio.studioValidate(invalid), /Attack Roll/);

  let macro = studio.studioMacroData(recipe);
  assert(!macro.command.includes('function studioChooseSummon'));
  assert(!macro.command.includes('function studioRestore'));
  assert(macro.flags.world.cardMacroStudio.recipe.summon, 'the full editable recipe remains in the flags');
  let run = new AsyncFunction(macro.command);
  await run(); assert(listener);
  send({ outcome: 'success' }); send({ who: 'other' }); send({ author: 'other' }); send({ type: 'skill-check' });
  await tick(); assert.equal(messages.length, 0, 'filter by outcome, actor, author, and roll type');
  const match = send(); await tick(); assert.equal(messages.length, 1);
  assert.equal(messages[0].messageMode, 'public'); assert.deepEqual(messages[0].whisper, []);
  listener(match, {}, 'player'); await tick(); assert.equal(messages.length, 1, 'do not repost the same message');
  send({ whisper: ['player'] }); await tick(); assert.equal(messages[1].messageMode, 'self');
  send({ whisper: ['gm'] }); await tick(); assert.equal(messages[2].messageMode, 'gm'); assert.deepEqual(messages[2].whisper, ['gm']);
  send({ whisper: ['gm'], blind: true }); await tick(); assert.equal(messages[3].messageMode, 'blind'); assert.equal(messages[3].blind, true);
  send({ outcome: null, degree: 3 }); await tick(); assert.equal(messages.length, 5, 'degree fallback');
  send({ outcome: null }); await tick(); assert(notifications.some(([kind, text]) => kind === 'warn' && text.includes('no degree')));
  choice = 'stop'; await run(); assert.equal(listener, null);

  setup();
  recipe.mode = 'result'; recipe.behavior.watch.type = 'saving-throw'; recipe.behavior.watch.outcome = 'any';
  recipe.behavior.watch.visibility = 'self';
  recipe.results.failure = 'FAILED against {target}: {result}'; recipe.card.artMode = 'target';
  targets.set('Scene.test.Token.target', { name: 'Target', texture: { src: 'target.webp' } });
  run = new AsyncFunction(studio.studioMacroData(recipe).command); await run();
  send({ type: 'saving-throw', outcome: 'failure', whisper: ['gm'],
    target: { token: 'Scene.test.Token.target' } });
  await tick(); assert.equal(messages.length, 1); assert.equal(messages[0].messageMode, 'self');
  assert.deepEqual(messages[0].whisper, ['player']); assert.equal(messages[0].blind, false);
  assert.match(messages[0].content, /FAILED against Target: Failure/); assert.match(messages[0].content, /target\.webp/);
  send({ type: 'saving-throw', outcome: 'failure', whisper: ['gm'], blind: true }); await tick();
  assert.equal(messages.length, 1, 'a player cannot expose their blind roll by choosing self visibility');
  assert(notifications.some(([kind, text]) => kind === 'warn' && text.includes('blind roll')));
  choice = 'stop'; await run();

  setup();
  recipe.mode = 'card'; recipe.behavior.watch.type = 'attack-roll'; recipe.behavior.watch.outcome = 'criticalSuccess';
  recipe.behavior.watch.reactiveOnly = true; recipe.behavior.watch.requiredOption = 'item:trait:finesse';
  run = new AsyncFunction(studio.studioMacroData(recipe).command); await run();
  send({ options: ['action:reactive-strike'] }); send({ options: ['item:trait:finesse'] }); await tick();
  assert.equal(messages.length, 0, 'both a reaction marker and required option are needed');
  send({ options: ['item:trait:finesse', 'action:reactive-strike'] }); await tick(); assert.equal(messages.length, 1);
  choice = 'arm'; await run(); send({ options: ['item:trait:finesse'], outcome: 'failure' }); await tick();
  send({ options: ['item:trait:finesse'] }); await tick(); assert.equal(messages.length, 1, 'a miss consumes the mark');
  choice = 'arm'; await run(); send({ options: ['item:trait:finesse'] }); await tick(); assert.equal(messages.length, 2);
  choice = 'arm'; await run(); globalThis.cardMacroStudioWatchers.get(recipe.id).armedUntil = Date.now() - 1;
  send({ options: ['item:trait:finesse'] }); await tick(); assert.equal(messages.length, 2, 'an expired mark cannot trigger');
  choice = 'stop'; await run(); assert.equal(listener, null);

  console.log('PASS: targeted code generation, old recipe migration, watcher filters, outcomes, privacy, and lifecycle.');
})().catch(error => { console.error(error); process.exitCode = 1; });
