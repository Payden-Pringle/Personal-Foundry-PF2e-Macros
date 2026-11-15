const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const AsyncFunction = Object.getPrototypeOf(async function() {}).constructor;
const program = fs.readFileSync(path.join(__dirname, '..', 'meta-macros', 'card-macro-studio.js'), 'utf8')
  .replace('await studioOpen();', 'return { studioDefaults, studioMacroData, studioRenderCard, studioSafePath, studioManifestationDraft, studioManifestationLimit, studioResolveCasting, studioLinkedSummonSettings, studioLinkedMessageMode, studioResumeLinkedCast, studioEditor, studioValidate, studioSummonRules, studioSummonMaxLevel, studioSummonAdjustedLevel, studioSummonName, studioSummonEligible, studioSummonImage, studioIndexCreatures, studioHash, studioCommandMatches, studioHelpContent, studioShowHelp };');

function fixture({ linked = true, synthetic = false, initialEffect = false } = {}) {
  const events = [], messages = [], warnings = [], errors = [], registry = new Map();
  let n = 0, failNextTokenUpdate = false;
  function makeActor(uuid) {
    const actor = {
      id: 'example', uuid, name: 'Example Caster', img: 'human.webp', isToken: uuid.startsWith('Scene.'),
      _source: { img: 'human.webp', prototypeToken: { texture: { src: 'prototype.webp' }, ring: { subject: { texture: 'prototype-ring.webp' } } } }, isOwner: true,
      flags: {}, items: [], system: { traits: { size: { tokenDimensions: { width: 1, height: 1, depth: 1 } } } },
      getFlag(_scope, key) { return this.flags[key]; },
      async setFlag(_scope, key, value) { events.push('save-state'); this.flags[key] = structuredClone(value); },
      async unsetFlag(_scope, key) { events.push('clear-state'); delete this.flags[key]; },
      async update(change) {
        if ('img' in change) { events.push('portrait:' + change.img); this.img = change.img; this._source.img = change.img; }
        if ('prototypeToken.texture.src' in change) this._source.prototypeToken.texture.src = change['prototypeToken.texture.src'];
        if ('prototypeToken.ring.subject.texture' in change) this._source.prototypeToken.ring.subject.texture = change['prototypeToken.ring.subject.texture'];
      },
      async createEmbeddedDocuments(type, data) {
        events.push('effect:add:' + data[0].system.level.value);
        const item = { id: 'effect-' + ++n, type: 'effect', _stats: data[0]._stats, flags: data[0].flags };
        this.items.push(item);
        const d = data[0].system.level.value >= 8 ? 3 : 2;
        this.system.traits.size.tokenDimensions = { width: d, height: d, depth: d };
        return [item];
      },
      async deleteEmbeddedDocuments(type, ids) {
        events.push('effect:remove'); this.items = this.items.filter(item => !ids.includes(item.id));
        if (!this.items.length) this.system.traits.size.tokenDimensions = { width: 1, height: 1, depth: 1 };
      }
    };
    registry.set(uuid, actor); return actor;
  }
  const world = makeActor('Actor.example');
  const actor = synthetic ? makeActor('Scene.test.Token.one.Actor.example') : world;
  if (initialEffect) {
    actor.items.push({ id: 'existing', type: 'effect', _stats: { compendiumSource: 'Compendium.pf2e.spell-effects.Item.test' }, flags: {} });
    actor.system.traits.size.tokenDimensions = { width: 2, height: 2, depth: 2 };
  }
  const doc = {
    id: 'one', uuid: 'Scene.test.Token.one', actorId: 'example', actor, name: 'Example Caster',
    texture: { src: 'human-token.webp' }, ring: { enabled: true, subject: { texture: 'human-ring.webp' } },
    _source: { texture: { src: 'human-token.webp' }, ring: { enabled: true, subject: { texture: 'human-ring.webp' } } },
    flags: { pf2e: { linkToActorSize: linked } }, width: 1, height: 1, depth: 1,
    async update(change) {
      if (failNextTokenUpdate) { failNextTokenUpdate = false; throw new Error('simulated token update failure'); }
      if ('flags.pf2e.linkToActorSize' in change) { this.flags.pf2e.linkToActorSize = change['flags.pf2e.linkToActorSize']; events.push('link:' + change['flags.pf2e.linkToActorSize']); }
      for (const key of ['width', 'height', 'depth']) if (key in change) { this[key] = change[key]; if (key === 'width') events.push('size:' + change[key]); }
      if ('texture.src' in change) { this.texture.src = this._source.texture.src = change['texture.src']; events.push('texture:' + change['texture.src']); }
      if ('ring.enabled' in change) this.ring.enabled = this._source.ring.enabled = change['ring.enabled'];
      if ('ring.subject.texture' in change) this.ring.subject.texture = this._source.ring.subject.texture = change['ring.subject.texture'];
    }
  };
  registry.set(doc.uuid, doc);
  registry.set('Compendium.pf2e.spell-effects.Item.test', { type: 'effect', toObject: () => ({ _id: 'source', system: { level: { value: 6 } }, flags: {} }) });
  global.foundry = { utils: { randomID: () => 'id' + ++n } };
  global.game = { user: { id: 'player', character: world, targets: new Set() }, actors: { contents: [world] } };
  global.canvas = { scene: { uuid: 'Scene.test', tokens: { contents: [doc] } }, tokens: { controlled: [] } };
  global.fromUuid = async uuid => registry.get(uuid);
  global.ui = { notifications: { info: text => events.push('info:' + text), warn: text => warnings.push(text), error: text => errors.push(text) } };
  global.ChatMessage = { getSpeaker: data => data || {}, create: async data => { events.push('chat'); messages.push(data); } };
  global.CONFIG = { ChatMessage: { documentClass: { create: async data => messages.push(data) } } };
  return { actor, world, doc, events, messages, warnings, errors, registry, failToken: () => { failNextTokenUpdate = true; } };
}

(async () => {
  const studio = await new AsyncFunction(program)();
  const legacyHash = studio.studioHash('await example();\n');
  assert(studio.studioCommandMatches('await example();', legacyHash));
  assert(studio.studioCommandMatches('await example();\n', legacyHash));
  assert(!studio.studioCommandMatches('await different();', legacyHash));
  assert.equal(studio.studioSummonImage({ img: 'systems/pf2e/icons/default-icons/npc.svg', prototypeToken: { texture: { src: 'wolf-token.webp' } } }, {}), 'wolf-token.webp');
  assert.equal(studio.studioSummonImage({ img: 'wolf-portrait.webp', prototypeToken: { texture: { src: 'wolf-token.webp' } } }, {}), 'wolf-portrait.webp');
  assert.equal(studio.studioSummonImage({ img: 'icons/svg/mystery-man.svg' }, {}), 'icons/svg/mystery-man.svg');
  let f = fixture();
  const artless = studio.studioDefaults();
  artless.actorBinding = 'none'; artless.card.title = '<script>alert(1)</script>';
  const html = studio.studioRenderCard(artless, {});
  assert(!html.includes('<img'));
  assert(!html.includes('<script>'));
  assert(html.includes('&lt;script&gt;'));
  assert.equal(studio.studioSafePath('javascript:alert(1)'), '');
  assert.deepEqual(Array.from({length:10}, (_,i) => studio.studioSummonMaxLevel(i+1)), [-1,1,2,3,5,7,9,11,13,15]);
  assert.equal(studio.studioSummonAdjustedLevel(1, 'weak'), -1);
  assert.equal(studio.studioSummonAdjustedLevel(0, 'weak'), -1);
  assert.equal(studio.studioSummonAdjustedLevel(-1, 'elite'), 1);
  assert.equal(studio.studioSummonAdjustedLevel(0, 'elite'), 2);
  assert.equal(studio.studioSummonAdjustedLevel(5, 'weak'), 4);
  assert.equal(studio.studioSummonAdjustedLevel(5, 'elite'), 6);
  const wolf = { name:'Wolf', baseLevel:1, traits:['animal'], rarity:'common' };
  const opts = { spell:'animal', rank:1, adjustment:'normal', includeNonCommon:false, tradition:'', customTraits:'' };
  assert.equal(studio.studioSummonEligible(wolf, opts), false);
  assert.equal(studio.studioSummonEligible(wolf, {...opts, adjustment:'weak'}), true, 'rank 1 can include a weak level-1 wolf');
  assert.equal(studio.studioSummonEligible({...wolf, baseLevel:6}, {...opts,rank:5,adjustment:'weak'}), true);
  assert.equal(studio.studioSummonEligible({...wolf, baseLevel:4}, {...opts,rank:5,adjustment:'elite'}), true);
  assert.equal(studio.studioSummonEligible({...wolf, rarity:'rare'}, {...opts, adjustment:'weak'}), false);
  assert.equal(studio.studioSummonEligible({...wolf, rarity:'rare'}, {...opts, adjustment:'weak', includeNonCommon:true}), true);
  assert.equal(studio.studioSummonEligible({...wolf, traits:['fungus'], baseLevel:-1}, {...opts, spell:'plant'}), true);
  assert.equal(studio.studioSummonEligible({...wolf, traits:['undead'], baseLevel:-1}, opts), false);
  assert.equal(studio.studioSummonEligible({...wolf, traits:['dragon','divine'], baseLevel:5}, {...opts,spell:'dragon',rank:5,tradition:'arcane'}), false);
  assert.equal(studio.studioSummonEligible({...wolf, traits:['dragon','divine'], baseLevel:5}, {...opts,spell:'dragon',rank:5,tradition:'divine'}), true);
  assert.equal(studio.studioSummonEligible(wolf, {...opts,spell:'lesser',rank:5,adjustment:'weak'}), false);
  assert.equal(studio.studioSummonEligible({...wolf,traits:['fey'],baseLevel:-1}, {...opts,spell:'custom',customTraits:'animal, fey'}), true);
  assert.equal(studio.studioSummonName(wolf, 'weak'), 'Weak Wolf');
  assert.equal(studio.studioSummonName({name:'Elite Wolf',sourceAdjustment:'elite'}, 'weak'), 'Weak Wolf');
  global.foundry.utils.getProperty = (obj, path) => path.split('.').reduce((v,k) => v?.[k], obj);
  global.game.packs = [
    { documentName:'Actor', visible:true, collection:'pf2e.example', title:'Example Bestiary', getIndex:async () => [
      { _id:'wolf', type:'npc', name:'Wolf', img:'wolf.webp', system:{ details:{level:{value:1}}, traits:{value:['animal'],rarity:'common'}, attributes:{adjustment:null} } },
      { _id:'hazard', type:'hazard', name:'Trap', system:{details:{level:{value:0}},traits:{value:['animal'],rarity:'common'}} }
    ] },
    { documentName:'Actor', visible:false, collection:'hidden', getIndex:async () => { throw Error('must not index hidden packs'); } },
    { documentName:'Item', visible:true, collection:'items', getIndex:async () => { throw Error('must not index item packs'); } }
  ];
  const index = await studio.studioIndexCreatures();
  assert.equal(index.records.length, 1); assert.equal(index.skipped, 0);
  assert.equal(index.records[0].uuid, 'Compendium.pf2e.example.Actor.wolf');
  assert.equal(index.records[0].baseLevel, 1);
  global.document = { createElement: () => ({ innerHTML: '' }) };
  const editorHtml = studio.studioEditor(studio.studioDefaults(), []).innerHTML;
  for (const item of ['data-preset', 'useCase', 'data-preview', 'paragraph1', 'card.artMode', 'behavior.effectUuid', 'behavior.tokenPath', 'behavior.transitionPath', 'results.criticalFailure', 'summon.spell', 'summon.adjustment']) {
    assert(editorHtml.includes(item), `editor must contain ${item}`);
  }
  assert.match(editorHtml, /<button type="button" data-studio-help aria-label="Open Card Macro Studio tutorial"/);
  const helpHtml = studio.studioHelpContent().innerHTML;
  const detailTags = helpHtml.match(/<details\b[^>]*>/g) ?? [];
  assert.equal(detailTags.length, 13, 'tutorial has its complete set of sections');
  assert(detailTags.every(tag => !/\sopen(?:\s|=|>)/i.test(tag)), 'tutorial sections start collapsed');
  for (const section of ['Quick start', 'Setup and permissions', 'Presets, jokes, and custom cards', 'Summon a creature', 'Transformations and effects', 'Manifestation', 'Troubleshooting', 'For maintainers']) assert(helpHtml.includes(section));
  let helpOptions;
  global.foundry.applications = { api: { DialogV2: { prompt: async options => { helpOptions = options; return null; } } } };
  await studio.studioShowHelp();
  assert.equal(helpOptions.modal, true, 'help uses a separate modal dialog');
  assert.equal(helpOptions.rejectClose, false, 'closing the help window is not an error');
  assert.equal(helpOptions.ok.label, 'Close');
  assert.match(helpOptions.window.title, /Card Macro Studio.*Help/);
  assert.equal(helpOptions.content.innerHTML, helpHtml);
  assert.equal(studio.studioValidate(artless), '');
  const basicMacro = studio.studioMacroData(artless);
  assert.equal(basicMacro.type, 'script');
  assert.equal(basicMacro.flags.world.cardMacroStudio.recipe.name, artless.name);
  await new AsyncFunction(basicMacro.command)();
  assert.equal(f.messages.length, 1);
  assert(!f.events.some(event => event.startsWith('effect:')));

  f = fixture();
  const picked = studio.studioDefaults(); picked.mode = 'summon'; picked.card.title = 'THE CALL';
  picked.card.paragraphs = ['{summon} answers {actor}.']; picked.card.artMode = 'summon';
  const mockSummon = { displayName:'Weak Wolf', level:-1, rank:1, spellName:'Summon Animal', adjustmentLabel:'Weak', image:'wolf.webp' };
  const pickedCode = studio.studioMacroData(picked).command.replace('await studioRunRecipe(CARD_RECIPE, CARD_INVOCATION);', `studioChooseSummon = async () => (${JSON.stringify(mockSummon)}); await studioRunRecipe(CARD_RECIPE, CARD_INVOCATION);`);
  await new AsyncFunction(pickedCode)();
  assert.match(f.messages[0].content, /Weak Wolf answers Example Caster/);
  assert.match(f.messages[0].content, /Level -1/);
  assert.match(f.messages[0].content, /Summon Animal/);
  assert.match(f.messages[0].content, /src="wolf\.webp"/);
  picked.card.artMode = 'none';
  const noArtCode = studio.studioMacroData(picked).command.replace('await studioRunRecipe(CARD_RECIPE, CARD_INVOCATION);', `studioChooseSummon = async () => (${JSON.stringify(mockSummon)}); await studioRunRecipe(CARD_RECIPE, CARD_INVOCATION);`);
  await new AsyncFunction(noArtCode)();
  assert(!f.messages[1].content.includes('<img'));

  f = fixture();
  global.document = { createElement: () => ({ innerHTML: '' }) };
  global.foundry.applications = { api: { DialogV2: { prompt: async () => 'criticalFailure' } } };
  global.game.user.targets.add({ name: 'Ghoul', document: { texture: { src: 'ghoul.webp' }, ring: { enabled: false } } });
  const outcome = studio.studioDefaults(); outcome.mode = 'result'; outcome.card.subtitle = '{target} — {result}';
  outcome.card.artMode = 'target'; outcome.results.criticalFailure = 'The spell takes hold of {target}.';
  await new AsyncFunction(studio.studioMacroData(outcome).command)();
  assert.match(f.messages[0].content, /Ghoul — Critical failure/);
  assert.match(f.messages[0].content, /spell takes hold of Ghoul/);
  assert.match(f.messages[0].content, /src="ghoul\.webp"/);

  f = fixture();
  const apply = studio.studioDefaults();
  apply.mode = 'apply'; apply.behavior.effectEnabled = true;
  apply.behavior.effectUuid = 'Compendium.pf2e.spell-effects.Item.test'; apply.behavior.effectRank = 8;
  apply.behavior.syncSize = true; apply.behavior.tokenPath = 'dragon.webp';
  apply.behavior.portraitPath = 'dragon-portrait.webp'; apply.behavior.transitionPath = 'flash.webm'; apply.behavior.activateMs = 0;
  const applyCode = studio.studioMacroData(apply).command;
  await new AsyncFunction(applyCode)();
  assert.equal(f.errors.length, 0); assert.equal(f.doc.width, 3); assert.equal(f.doc.texture.src, 'dragon.webp');
  assert.equal(f.doc.ring.enabled, true); assert.equal(f.actor.img, 'dragon-portrait.webp');
  assert(f.events.indexOf('effect:add:8') < f.events.indexOf('link:false'));
  assert(f.events.indexOf('link:true') < f.events.indexOf('texture:flash.webm'));
  assert.equal(Object.keys(f.actor.flags).length, 0);
  await new AsyncFunction(applyCode)();
  assert.equal(f.actor.items.length, 1, 'do not stack a matching effect');

  f = fixture();
  const applyWithoutFinalArt = studio.studioDefaults();
  applyWithoutFinalArt.mode = 'apply'; applyWithoutFinalArt.behavior.transitionPath = 'flash.webm'; applyWithoutFinalArt.behavior.activateMs = 0;
  await new AsyncFunction(studio.studioMacroData(applyWithoutFinalArt).command)();
  assert.equal(f.doc.texture.src, 'human-token.webp', 'a transition without a final image must restore the original');
  assert.equal(f.doc.ring.enabled, true);

  f = fixture({ linked: false });
  const toggle = studio.studioDefaults();
  toggle.mode = 'transform'; toggle.behavior.effectEnabled = true; toggle.behavior.effectUuid = 'Compendium.pf2e.spell-effects.Item.test';
  toggle.behavior.syncSize = true; toggle.behavior.transitionPath = 'flash.webm'; toggle.behavior.tokenPath = 'dragon.webp';
  toggle.behavior.portraitPath = 'dragon-portrait.webp'; toggle.behavior.activateMs = 0; toggle.behavior.reverseMs = 0;
  const toggleCode = studio.studioMacroData(toggle).command;
  await new AsyncFunction(toggleCode)();
  assert.equal(f.errors.length, 0); assert.equal(f.doc.width, 2); assert.equal(f.doc.flags.pf2e.linkToActorSize, false);
  assert.equal(f.doc.texture.src, 'dragon.webp'); assert.equal(f.actor.items.length, 1);
  await new AsyncFunction(toggleCode)();
  assert.equal(f.doc.width, 1); assert.equal(f.doc.texture.src, 'human-token.webp');
  assert.equal(f.doc.ring.subject.texture, 'human-ring.webp'); assert.equal(f.actor.img, 'human.webp');
  assert.equal(f.actor.items.length, 0); assert.equal(f.messages.length, 1); assert.equal(Object.keys(f.actor.flags).length, 0);

  f = fixture();
  const prototypeToggle = structuredClone(toggle); prototypeToggle.behavior.prototypeToken = true;
  const prototypeCode = studio.studioMacroData(prototypeToggle).command;
  await new AsyncFunction(prototypeCode)();
  assert.equal(f.actor._source.prototypeToken.texture.src, 'dragon.webp');
  assert.equal(f.actor._source.prototypeToken.ring.subject.texture, 'dragon.webp');
  await new AsyncFunction(prototypeCode)();
  assert.equal(f.actor._source.prototypeToken.texture.src, 'prototype.webp');
  assert.equal(f.actor._source.prototypeToken.ring.subject.texture, 'prototype-ring.webp');

  f = fixture();
  await new AsyncFunction(toggleCode)();
  const edited = structuredClone(toggle);
  edited.behavior.syncSize = false; edited.behavior.transitionPath = 'new-transition.webm';
  await new AsyncFunction(studio.studioMacroData(edited).command)();
  assert.equal(f.doc.width, 1, 'restoring must use the size setting saved at activation');
  assert.equal(f.doc.texture.src, 'human-token.webp', 'restoring must use the transition saved at activation');

  f = fixture({ initialEffect: true });
  await new AsyncFunction(toggleCode)(); await new AsyncFunction(toggleCode)();
  assert.equal(f.actor.items.length, 1, 'a pre-existing effect must not be removed');
  assert.equal(f.actor.items[0].id, 'existing'); assert.equal(f.doc.width, 2);

  f = fixture({ synthetic: true });
  await new AsyncFunction(toggleCode)();
  assert.equal(f.world.items.length, 0); assert.equal(f.actor.items.length, 1);
  await new AsyncFunction(toggleCode)(); assert.equal(f.actor.items.length, 0);

  f = fixture(); f.failToken();
  const originalError = console.error; console.error = () => {};
  try { await new AsyncFunction(toggleCode)(); } finally { console.error = originalError; }
  assert.equal(f.errors.length, 1); assert.equal(f.actor.items.length, 1); assert.equal(Object.keys(f.actor.flags).length, 1);
  await new AsyncFunction(toggleCode)();
  assert.equal(f.actor.items.length, 0); assert.equal(f.doc.width, 1); assert.equal(Object.keys(f.actor.flags).length, 0);

  f = fixture();
  await new AsyncFunction(toggleCode)();
  await f.doc.update({ 'texture.src': 'manual-change.webp' }); await f.actor.update({ img: 'manual-portrait.webp' });
  await new AsyncFunction(toggleCode)();
  assert.equal(f.doc.texture.src, 'manual-change.webp'); assert.equal(f.actor.img, 'manual-portrait.webp');
  assert.equal(f.warnings.length, 2);

  f = fixture();
  const temp = studio.studioDefaults(); temp.mode = 'temporary'; temp.behavior.transitionPath = 'flare.webm'; temp.behavior.activateMs = 0;
  global.foundry.canvas = { loadTexture: async path => { f.events.push('preload:' + path); return {}; } };
  await new AsyncFunction(studio.studioMacroData(temp).command)();
  assert.equal(f.doc.texture.src, 'human-token.webp'); assert.equal(f.doc.ring.enabled, true);
  assert.equal(f.actor.items.length, 0); assert.equal(f.messages.length, 1); assert.equal(Object.keys(f.actor.flags).length, 0);
  assert(f.events.indexOf('preload:flare.webm') < f.events.indexOf('texture:flare.webm'));

  f = fixture();
  const spell = { type: 'spell', name: 'Test Spell', traditions: new Set(['primal']), baseRank: 3, isCantrip: false,
    toObject: () => ({ name: 'Test Spell', system: {} }) };
  f.registry.set('Spell.test', spell);
  global.CONFIG.Item = { documentClass: class {
    constructor(source, { parent }) { this.source = source; this.parent = parent; this.spellcasting = { statistic: {} }; }
    async toMessage(_roll, options) { assert.equal(options.data.castRank, 9); return { toObject: () => ({ flags: { pf2e: { casting: {} } } }) }; }
    toObject() { return this.source; }
  } };
  const drafted = await studio.studioManifestationDraft(f.actor, { id: 'primal', tradition: 'primal' }, { uuid: 'Spell.test', rank: 9 });
  assert.equal(drafted.flags.pf2e.casting.embeddedSpell.name, 'Test Spell, via Manifestation');
  assert.equal(f.actor.items.length, 0, 'the copied spell must not be added to the actor');
  spell.traditions = new Set(['arcane']);
  await assert.rejects(() => studio.studioManifestationDraft(f.actor, { id: 'primal', tradition: 'primal' }, { uuid: 'Spell.test', rank: 8 }), /not eligible/);

  // The primary tradition determines the rank-nine list, including multi-tradition spells.
  for (const primary of ['arcane', 'divine', 'occult', 'primal']) {
    assert.equal(studio.studioManifestationLimit([primary], primary), 9);
    assert.equal(studio.studioManifestationLimit(['arcane', primary], primary), 9);
    const other = primary === 'divine' ? 'occult' : 'divine';
    assert.equal(studio.studioManifestationLimit([other], primary), 7);
  }
  assert.equal(studio.studioManifestationLimit(['arcane'], ''), 0);
  f.actor.spellcasting = { contents: [
    { id:'primal', name:'Primal', tradition:'primal', statistic:{} },
    { id:'arcane', name:'Arcane', tradition:'arcane', statistic:{} }
  ] };
  let casting = await studio.studioResolveCasting(f.actor, { spellcasting: f.actor.spellcasting.contents[1] });
  assert.equal(casting.primary, 'arcane'); assert.equal(casting.entry.id, 'arcane');
  global.foundry.applications = { api: { DialogV2: { prompt: async () => 0 } } };
  casting = await studio.studioResolveCasting(f.actor, null);
  assert.equal(casting.primary, 'primal', 'ambiguous actor entries are chosen by the user');
  global.foundry.applications.api.DialogV2.prompt = async () => 'occult';
  casting = await studio.studioResolveCasting(null, null);
  assert.equal(casting.primary, 'occult'); assert.equal(casting.entry, null);
  global.foundry.applications.api.DialogV2.prompt = async () => null;
  assert.equal(await studio.studioResolveCasting(null, null), null, 'canceling tradition selection aborts');
  const actorless = studio.studioDefaults(); actorless.mode='manifestation'; actorless.actorBinding='none';
  assert.equal(studio.studioValidate(actorless), '', 'Manifestation supports no configured actor');

  spell.system = { description: { value: '<p>A sample spell.</p>' } };
  spell.getRollData = () => ({});
  global.foundry.applications.ux = { TextEditor: { enrichHTML: async value => value } };
  const generic = await studio.studioManifestationDraft(null, null, { uuid:'Spell.test', rank:9 }, 'arcane');
  assert.match(generic.content, /Test Spell, via Manifestation/);
  assert.match(generic.content, /Rank 9/);
  assert.match(generic.content, /resolve checks and heightening manually/);
  assert(!generic.flags?.pf2e?.casting, 'an actorless card must not claim to have actor statistics');
  await assert.rejects(() => studio.studioManifestationDraft(null, null, { uuid:'Spell.test', rank:8 }, 'divine'), /not eligible/);

  const runGenerated = (recipe, setup='') => {
    const marker = 'await studioRunRecipe(CARD_RECIPE, CARD_INVOCATION);';
    const source = studio.studioMacroData(recipe).command.replace(marker, `${setup}\n${marker}`);
    return new AsyncFunction('actor', 'spell', 'options', 'cast', 'observe', source);
  };
  f = fixture();
  let linkedRecipe = studio.studioDefaults(); linkedRecipe.mode='card';
  linkedRecipe.behavior.toolbeltSpellMacro=true;
  linkedRecipe.card.paragraphs=['{actor}: {spell} at rank {spellRank}, {tradition}.'];
  const linkedActor = { id:'other', uuid:'Actor.other', name:'Linked Caster', isOwner:true };
  let linkedSpell = { type:'spell', name:'Summon Animal', slug:'summon-animal', actor:linkedActor,
    rank:4, spellcasting:{ id:'primal', tradition:'primal', statistic:{} } };
  global.CONFIG.ChatMessage.documentClass.applyMode = (data, mode) => ({ ...data, whisper: mode === 'gm' ? ['gm'] : [] });
  let calls = 0, castOptions;
  await runGenerated(linkedRecipe)(linkedActor, linkedSpell, {rank:4,slotId:2,messageMode:'gm'}, async opts => { calls++; castOptions=opts; f.events.push('cast'); });
  assert.equal(calls,1); assert.equal(castOptions.rank,4); assert.equal(castOptions.slotId,2);
  assert(f.events.indexOf('cast') < f.events.indexOf('chat'), 'original cast occurs before the special card');
  assert.equal(f.messages[0].speaker.actor,linkedActor, 'the Toolbelt caster overrides configured actor');
  assert.match(f.messages[0].content,/Linked Caster: Summon Animal at rank 4, primal/);
  assert.deepEqual(f.messages[0].whisper,['gm'], 'linked message visibility is preserved');

  f = fixture(); calls=0;
  linkedRecipe.behavior.toolbeltSpellMacro=false;
  await runGenerated(linkedRecipe)(f.actor, linkedSpell, {rank:4}, async () => { calls++; });
  assert.equal(calls,0); assert.equal(f.messages.length,0); assert(f.warnings.some(w => /not enabled/.test(w)));

  f = fixture(); calls=0; linkedRecipe.behavior.toolbeltSpellMacro=true; linkedRecipe.mode='result';
  await runGenerated(linkedRecipe,'studioChooseResult = async () => null;')(f.actor,linkedSpell,{rank:4},async () => { calls++; });
  assert.equal(calls,0); assert.equal(f.messages.length,0, 'canceling a picker does not cast or post');

  f = fixture(); calls=0; linkedRecipe.mode='card';
  await runGenerated(linkedRecipe)(f.actor,linkedSpell,{rank:4,message:false},async () => { calls++; });
  assert.equal(calls,1); assert.equal(f.messages.length,0, 'message:false suppresses the extra card');
  f = fixture(); calls=0;
  await runGenerated(linkedRecipe)(f.actor,linkedSpell,{rank:4},async () => { calls++; return false; });
  assert.equal(calls,1); assert.equal(f.messages.length,0, 'explicit cast failure suppresses the extra card');

  f = fixture(); calls=0; let seenSettings;
  linkedRecipe.mode='summon';
  const summoned={displayName:'Wolf',level:1,rank:4,spellName:'Summon Animal',adjustmentLabel:'Normal',image:''};
  const summonSetup=`studioChooseSummon = async config => { observe(config); return ${JSON.stringify(summoned)}; };`;
  await runGenerated(linkedRecipe,summonSetup)(f.actor,linkedSpell,{rank:4},async opts => {calls++;castOptions=opts;},settings=>{seenSettings=settings;});
  assert.equal(calls,1); assert.equal(castOptions.rank,4);
  assert.equal(seenSettings.spell,'animal'); assert.equal(seenSettings.rank,4);
  assert.equal(seenSettings.tradition,'primal'); assert(seenSettings.lockSpell && seenSettings.lockRank);
  assert.match(f.messages[0].content,/Wolf/);

  f = fixture(); calls=0;
  const mismatched={...summoned,rank:3};
  const restoreError = console.error; console.error=()=>{};
  try { await runGenerated(linkedRecipe,`studioChooseSummon = async () => (${JSON.stringify(mismatched)});`)(f.actor,linkedSpell,{rank:4},async()=>{calls++;}); }
  finally { console.error=restoreError; }
  assert.equal(calls,0); assert.equal(f.messages.length,0); assert(f.errors.some(e=>/does not match/.test(e)));

  f = fixture(); calls=0;
  const linkedToggle=studio.studioDefaults(); linkedToggle.mode='transform'; linkedToggle.behavior.toolbeltSpellMacro=true;
  linkedToggle.behavior.tokenPath='dragon.webp'; linkedToggle.behavior.transitionPath='';
  const toggleRun=runGenerated(linkedToggle);
  await toggleRun(f.actor,linkedSpell,{rank:4},async()=>{calls++;});
  assert.equal(f.doc.texture.src,'dragon.webp');
  await toggleRun(f.actor,linkedSpell,{rank:4},async()=>{calls++;});
  assert.equal(f.doc.texture.src,'human-token.webp'); assert.equal(calls,1,'ending a transformation must not cast a second time');

  f = fixture();
  const noActorRecipe=studio.studioDefaults(); noActorRecipe.mode='manifestation'; noActorRecipe.actorBinding='none';
  await runGenerated(noActorRecipe,`studioManifestation = async () => ({primary:'arcane',message:{content:'Actorless duplicate'}});`)();
  assert.equal(f.messages.length,2); assert.equal(f.messages[1].content,'Actorless duplicate');
  console.log('PASS: tradition-aware Manifestation and actorless fallback; Toolbelt context, privacy, cast order and cancellation; summon locks, transformations, tutorial and prior regressions.');
})().catch(error => { console.error(error); process.exitCode = 1; });
