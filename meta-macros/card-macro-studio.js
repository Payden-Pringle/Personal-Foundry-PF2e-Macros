// Card Macro Studio for Foundry VTT 14 and PF2e.
// Run this as a Script macro. Generated macros are self-contained.

const STUDIO_VERSION = "1.4.0";
const STUDIO_FLAG = "cardMacroStudio";
const STUDIO_THEMES = {
  divine:  { label: "Divine light", background: "#182846", panel: "#0b1323", accent: "#e8cc83", text: "#fff8e8" },
  storm:   { label: "Storm and sky", background: "#174562", panel: "#0c2231", accent: "#8beaff", text: "#ffffff" },
  arcane:  { label: "Arcane", background: "#29204c", panel: "#130e27", accent: "#cba9ff", text: "#fff9ff" },
  carnival:{ label: "Carnival", background: "#641b3a", panel: "#32102a", accent: "#ffd66d", text: "#fff8ed" },
  shadow:  { label: "Shadow and steel", background: "#202731", panel: "#10151b", accent: "#b4c9d6", text: "#ffffff" },
  simple:  { label: "Simple parchment", background: "#594d40", panel: "#302820", accent: "#e3c793", text: "#fff8e9" }
};

// Optional starting points. Applying one fills editable text and a theme;
// it never installs an effect or supplies external artwork.
const STUDIO_CASES = {
  summon: { label: "Summon an ally", mode: "summon", theme: "arcane", title: "THE CALL IS ANSWERED", subtitle: "", paragraphs: ["{actor} reaches beyond the veil.", "{summon} answers the call."] },
  spellResult: { label: "Spell outcome", mode: "result", theme: "arcane", title: "THE SPELL UNFOLDS", subtitle: "{target} • {result}", paragraphs: [], results: { criticalSuccess: "The magic breaks around {target}.", success: "{target} withstands the worst of the magic.", failure: "The spell finds its mark.", criticalFailure: "The magic closes around {target}, leaving nowhere to hide." } },
  transformation: { label: "Transformation", mode: "transform", theme: "divine", title: "A NEW FORM AWAKENS", subtitle: "", paragraphs: ["Light gathers around {actor}.", "When it fades, a new form rises."] },
  spellstrike: { label: "Spellstrike", mode: "result", theme: "arcane", title: "SPELLSTRIKE", subtitle: "Steel and spell as one.", paragraphs: [], results: { criticalSuccess: "The spell erupts through the perfect strike.", success: "Magic follows the blade to its mark.", failure: "The spell flashes past its mark.", criticalFailure: "The spell and strike go wide." } },
  champion: { label: "Protective reaction", mode: "card", theme: "divine", title: "YOU ARE NOT ALONE", subtitle: "", paragraphs: ["{actor} steps between danger and an ally.", "Not while I still stand."] },
  counterspell: { label: "Counterspell", mode: "result", theme: "arcane", title: "COUNTERSPELL", subtitle: "Two spells meet.", paragraphs: [], results: { criticalSuccess: "The opposing magic unravels.", success: "The opposing magic unravels.", failure: "The opposing magic slips through.", criticalFailure: "The opposing magic slips through." } },
  hero: { label: "Hero Point: last stand", mode: "card", theme: "divine", title: "NOT YET", subtitle: "", paragraphs: ["The story is not finished."] },
  criticalStrike: { label: "Critical strike", mode: "card", theme: "shadow", title: "THE DECISIVE BLOW", subtitle: "", paragraphs: ["Every scar, every lesson, every promise—", "All of it behind a single strike."] },
  fish: { label: "Recall Knowledge: fish!", mode: "card", theme: "carnival", title: "CONGRATULATIONS!", subtitle: "It's a fish!", paragraphs: ["After careful consideration, {actor} has reached a conclusion.", "It is, unquestionably, some kind of fish."] },
  boss: { label: "GM: villain entrance", mode: "card", theme: "shadow", title: "THE VILLAIN ARRIVES", subtitle: "", paragraphs: ["The room falls silent.", "Something wicked has come to claim its due."] }
};

function studioEscape(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

function studioSafePath(value) {
  const path = String(value ?? "").trim();
  if (!path || /[\x00-\x1f\x7f]/.test(path) || /^\/\//.test(path)) return "";
  if (/^[a-z][a-z0-9+.-]*:/i.test(path) && !/^https?:\/\//i.test(path)) return "";
  return path;
}

function studioColor(value, fallback) {
  return /^#[0-9a-f]{6}$/i.test(String(value ?? "")) ? value : fallback;
}

function studioText(value, context) {
  const replacements = {
    actor: context.actor?.name || "",
    target: context.targetName || "",
    result: context.resultLabel || "",
    spell: context.spellName || "",
    spellrank: context.spellRank == null ? "" : String(context.spellRank),
    tradition: context.tradition || "",
    summon: context.summon?.displayName || "",
    summonlevel: context.summon?.level == null ? "" : String(context.summon.level),
    summonspell: context.summon?.spellName || "",
    summonrank: context.summon?.rank == null ? "" : String(context.summon.rank),
    summonadjustment: context.summon?.adjustmentLabel || ""
  };
  const text = String(value ?? "").replace(/\{(actor|target|result|spell|spellrank|tradition|summon|summonlevel|summonspell|summonrank|summonadjustment)\}/gi,
    (_, key) => replacements[key.toLowerCase()] ?? "");
  return studioEscape(text).replace(/\r?\n/g, "<br>");
}

function studioRenderCard(recipe, context = {}) {
  const c = recipe.card;
  const bg = studioColor(c.background, "#182846");
  const panel = studioColor(c.panel, "#0b1323");
  const accent = studioColor(c.accent, "#e8cc83");
  const color = studioColor(c.text, "#fff8e8");
  const align = ["left", "center", "right"].includes(c.align) ? c.align : "center";
  const font = c.font === "serif" ? "Georgia,serif" : "inherit";
  const opacity = Math.max(0, Math.min(1, Number(c.overlayOpacity) || 0));
  const radius = Math.max(0, Math.min(24, Number(c.radius) || 0));
  const overlayPath = studioSafePath(c.overlayPath);
  const overlay = overlayPath ? `<img src="${studioEscape(overlayPath)}" alt="" aria-hidden="true" style="position:absolute;inset:0;width:100%;height:100%;max-width:none;margin:0;padding:0;border:0;object-fit:fill;pointer-events:none;opacity:${opacity};z-index:3;">` : "";
  let imagePath = "";
  if (c.artMode === "url") imagePath = studioSafePath(c.artPath);
  if (c.artMode === "actor") imagePath = studioSafePath(context.actor?.img);
  if (c.artMode === "target") imagePath = studioSafePath(context.targetImage);
  if (c.artMode === "summon") imagePath = studioSafePath(context.summon?.image);
  const image = imagePath ? `<img src="${studioEscape(imagePath)}" alt="${studioEscape(c.imageAlt || "Card artwork")}" style="display:block;width:100%;height:auto;max-width:none;margin:0;padding:0;border:0;">` : "";
  const actor = context.actor;
  const link = c.imageLink === "actor" && actor?.uuid && actor?.id
    ? `<a class="content-link" data-link data-uuid="${studioEscape(actor.uuid)}" data-id="${studioEscape(actor.id)}" data-type="Actor" title="Open character sheet" style="display:block;width:100%;margin:0;padding:0;border:0;background:transparent;cursor:pointer;">${image}</a>`
    : image;
  const imagePanel = image ? `<div style="position:relative;overflow:hidden;width:100%;max-width:250px;margin:12px auto 0;border:2px solid ${accent};border-radius:${radius}px;line-height:0;">${link}${c.overlayPlacement === "art" ? overlay : ""}</div>` : "";
  const paragraphs = (context.resultText ? [context.resultText] : c.paragraphs).filter(Boolean)
    .map((line, index) => `<p style="margin:${index ? "10px 0 0" : "0"};line-height:1.5;">${studioText(line, context)}</p>`).join("");
  const heading = c.title ? `<h3 style="margin:0 0 6px;border:0;color:${color};font-family:${font};font-size:1.25em;line-height:1.2;letter-spacing:1px;text-shadow:0 1px 3px #000,0 0 5px #000;">${studioText(c.title, context)}</h3>` : "";
  const subtitle = c.subtitle ? `<p style="margin:0 0 12px;color:${color};font-style:italic;line-height:1.35;">${studioText(c.subtitle, context)}</p>` : "";
  const body = paragraphs ? `<div style="padding:12px;border:1px solid ${accent};border-radius:${Math.max(0, radius - 2)}px;background:${panel};color:${color};">${paragraphs}</div>` : "";
  const summon = context.summon;
  const details = summon && c.showSummonDetails !== false ? `<p style="margin:10px 0 0;color:${color};font-size:.88em;line-height:1.4;">${studioEscape(summon.displayName)} · Level ${studioEscape(summon.level)}<br>${studioEscape(summon.spellName)} · Rank ${studioEscape(summon.rank)}</p>` : "";
  const content = c.artPosition === "before" ? `${imagePanel}${body}${details}` : `${body}${details}${imagePanel}`;
  return `<div style="position:relative;overflow:hidden;padding:14px;border:2px solid ${accent};border-radius:${radius}px;background:${bg};text-align:${align};font-family:${font};color:${color};text-shadow:0 1px 3px #000;">${heading}${subtitle}${content}${c.overlayPlacement === "card" ? overlay : ""}</div>`;
}

function studioClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function studioHash(text) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) hash = Math.imul(hash ^ text.charCodeAt(i), 16777619);
  return (hash >>> 0).toString(16);
}

function studioCommandMatches(command, expectedHash) {
  if (typeof command !== "string" || typeof expectedHash !== "string") return false;
  // Foundry can remove the final newline when a macro is saved or executed.
  return studioHash(command) === expectedHash ||
    (!command.endsWith("\n") && studioHash(`${command}\n`) === expectedHash);
}

function studioId() {
  if (globalThis.foundry?.utils?.randomID) return foundry.utils.randomID(16);
  return `s${Math.random().toString(36).slice(2, 13)}`;
}

function studioDialogContent(html) {
  const element = document.createElement("div");
  element.innerHTML = html;
  return element;
}

// The in-app guide is intentionally self-contained: the macro cannot assume
// that the README or any external file is available in the Foundry world.
function studioHelpContent() {
  const sections = [
    ["Quick start", `<ol>
      <li>Optionally choose a preset and click <strong>Apply preset</strong>.</li>
      <li>Name the macro; choose its behavior and actor.</li>
      <li>Edit the card text, theme, optional artwork, and behavior settings.</li>
      <li>Review the preview and use <strong>Test Card</strong> if you wish.</li>
      <li>Click <strong>Create New</strong>, then run the generated macro when the moment happens.</li>
    </ol><p>Applying a preset replaces the editable title, subtitle, paragraphs, behavior, and theme. It does not supply an effect or media.</p>`],
    ["Setup and permissions", `<p>Install the studio by importing its JSON into a macro, or paste the studio script into a Script macro. Run the studio to build other macros; the generated macros run independently.</p>
      <p>You need permission to run scripts. Creating or editing macros, accessing compendiums, and changing actors or tokens depend on the world's permissions. Ask the GM if a required action is unavailable.</p>`],
    ["Presets, jokes, and custom cards", `<p>Presets include summons, spell outcomes, transformations, Spellstrike, protective reactions, Counterspell, Hero Points, critical strikes, the <strong>Recall Knowledge: fish!</strong> joke, and a villain entrance.</p>
      <p>For another joke, feat, spell, or character moment, start from a preset or choose <strong>Chat card only</strong> and write your own text. Artwork is optional.</p>`],
    ["Choose a behavior", `<ul>
      <li><strong>Chat card only:</strong> post the configured card.</li>
      <li><strong>Summon creature card:</strong> pick a creature and announce it.</li>
      <li><strong>Choose an outcome:</strong> select a result and post its text.</li>
      <li><strong>Apply effect / changes once:</strong> apply configured changes without a regular toggle back.</li>
      <li><strong>Transformation toggle:</strong> apply changes on one run and restore them on the next.</li>
      <li><strong>Temporary token animation:</strong> briefly replace and restore token art.</li>
      <li><strong>Manifestation spell picker:</strong> choose an eligible spell and post its PF2e card.</li>
    </ul><p>Chat and outcome cards can optionally watch your actor's PF2e rolls. Choose a roll type and degree of success; outcome cards use the matching outcome text. The watcher runs in this client until stopped or reloaded.</p>
      <p>Reactive Strike rolls are not always labelled. If needed, run the watcher again and mark the next attack before rolling. An optional exact roll option can narrow the watcher; right-click a roll and use Inspect Roll to find its options. A DC or target is needed for a degree of success.</p>`],
    ["Actors, targets, and placeholders", `<p><strong>My assigned character</strong> uses the current user's assigned actor. You can instead choose an owned actor or, for card-only uses, no actor. Token-changing modes need an owned actor and the relevant permissions.</p>
      <p>Use <code>{actor}</code>, <code>{target}</code>, and <code>{result}</code> in card text. <code>{target}</code> refers to your first targeted token; targeting is separate from selecting a token.</p>
      <p>Summon cards also support <code>{summon}</code>, <code>{summonLevel}</code>, <code>{summonSpell}</code>, <code>{summonRank}</code>, and <code>{summonAdjustment}</code>.</p>`],
    ["Artwork and animated decoration", `<p>Choose <strong>None — text only</strong>, a specified image, actor portrait, targeted token image, or chosen summoned creature. You can also provide a decorative image or animated WebP/GIF for the whole card or illustration frame.</p>
      <p>Use a Foundry-accessible path or HTTP(S) URL that viewers can load. A local Windows path is not a shared asset. The studio does not generate or upload media.</p>
      <p>Card animation comes from the supplied animated image; inline CSS keyframes are not used. <strong>Open actor sheet</strong> makes the illustration a link for viewers with permission; it is not an image-preview window.</p>`],
    ["Summon a creature", `<ol><li>Apply <strong>Summon an ally</strong> and set optional picker defaults.</li><li>Choose creature art, a specified image, or no illustration.</li><li>Create and run the macro; choose the spell, rank, and Normal, Weak, or Elite; search and select a creature.</li></ol>
      <p>The picker searches accessible NPC compendiums and filters supported spells by traits and adjusted level. Common creatures are shown by default; other rarities can be included. Summon Dragon also asks for the casting tradition.</p>
      <p>The adjustment changes eligibility and card text only: it does not place a token or change its statistics. Low-level PF2e exceptions apply; a Weak level-1 Wolf is level −1. Check access and special spell restrictions with your GM.</p>`],
    ["Transformations and effects", `<ol><li>Choose <strong>Transformation toggle</strong> and an owned actor.</li><li>Optionally enable a compendium effect, enter its UUID and rank, and enable size refresh.</li><li>Optionally configure final token/portrait art and a transition, then set activation and return durations.</li><li>Run the generated macro to transform; run the same macro again on the original scene to restore.</li></ol>
      <p>Existing matching effects are kept and are not removed by the toggle. Art and size are not automatically restored when an effect expires. If interrupted, return to the original scene and rerun the same macro for recovery.</p>
      <p>Example effect UUIDs:</p><ul><li>Dragon Form: <code>Compendium.pf2e.spell-effects.Item.1pC1qjvCuAKzjYo8</code></li><li>Element Embodied (air): <code>Compendium.pf2e.spell-effects.Item.J60rN48XzBGHmR6m</code></li></ul>`],
    ["Manifestation", `<p>Choose <strong>Manifestation spell picker</strong>. An actor's selected spellcasting entry supplies the primary tradition and statistic; if there is no usable entry, choose the tradition yourself.</p>
      <p>The primary tradition can duplicate spells through rank 9 and the other traditions through rank 7. With an entry, the duplicate uses that actor's casting statistic. Without one, the spell is posted as a descriptive card and checks must be handled manually. The picker does not apply the duplicated spell's effects.</p>`],
    ["PF2e Toolbelt spell linking", `<p>Ask your GM to enable PF2e Toolbelt's <strong>Spell Macro</strong> feature. In this studio, enable <strong>Use this generated macro as a Toolbelt Spell Macro</strong> and create or update the macro. Open the actor's spell, choose <strong>Details</strong>, and drag the generated macro into its <strong>Macro</strong> drop area.</p>
      <p>When invoked by that spell, the macro uses the linked actor, spell, rank, and casting entry. After required choices are made, it resumes the original cast once; canceling a picker does not cast. Running the macro directly is standalone and does not spend a slot. A transformation's return run restores it without casting again.</p>
      <p>Use <code>{spell}</code>, <code>{spellRank}</code>, and <code>{tradition}</code> in card text for linked spell context. Supported linked summon spells also set the picker spell and rank. If PF2e warns that a spell could not be cast, verify the resource: some failed casts do not report their outcome back to the macro.</p>`],
    ["Preview, save, and edit", `<p><strong>Test Card</strong> posts a real whisper to you and leaves it in chat. It previews a card, not effects or token changes; summon tests use an example creature.</p>
      <p><strong>Create New</strong> creates a macro. <strong>Download JSON</strong> exports one. Both retain settings for later editing. <strong>Show Script</strong> gives you runnable code, but pasting only that code does not add editable recipe metadata.</p>
      <p>To change a studio-created macro, select it at the top, click <strong>Load settings</strong>, and choose <strong>Update Loaded</strong> or <strong>Create New</strong> for a separate copy. The studio protects scripts edited outside it from being overwritten.</p>`],
    ["Troubleshooting", `<ul>
      <li><strong>Cannot run or save:</strong> check script, macro, actor, and token permissions.</li>
      <li><strong>Missing image:</strong> check the shared path, viewer access, and whether the compendium has artwork.</li>
      <li><strong>No summon results:</strong> check spell, rank, adjustment, search, rarity, and compendium access. Summon Dragon needs a tradition.</li>
      <li><strong>Token did not change:</strong> check the actor, current scene, token scope, ownership, effect, and media path.</li>
      <li><strong>Interrupted transformation:</strong> return to the original scene and run the same generated macro again.</li>
    </ul><p>Each client loads media independently, so token transitions may not appear perfectly synchronized.</p>`],
    ["For maintainers", `<p>The studio builds a recipe from the editor, validates it, and generates a self-contained script with runtime helpers and the recipe. The generated macro's document flags retain the recipe and a command hash for safe re-editing.</p>
      <p>Presets, themes, pickers, effect handling, rendering, and recovery are implemented in the studio source. When changing the source, update tests and regenerate the importable JSON. See the accompanying README for the architecture and maintenance workflow.</p>`]
  ];
  const body = sections.map(([title, html]) => `<details style="margin:0 0 7px;border:1px solid #786a60;border-radius:5px;background:#211e27;">
    <summary style="padding:8px 10px;cursor:pointer;color:#fff1cf;font-weight:700;">${studioEscape(title)}</summary>
    <div style="padding:0 12px 10px;color:#fff8ec;line-height:1.5;overflow-wrap:anywhere;">${html}</div>
  </details>`).join("");
  return studioDialogContent(`<div style="color:#fff8ec;line-height:1.4;">
    <p style="margin:0 0 10px;">Open a section to read it. Close this window to return to your unfinished card.</p>
    <div style="max-height:min(65vh,540px);overflow-y:auto;padding-right:4px;">${body}</div>
  </div>`);
}

async function studioShowHelp() {
  await foundry.applications.api.DialogV2.prompt({
    window: { title: "Card Macro Studio — Help", resizable: true },
    position: { width: 640, height: 700 }, content: studioHelpContent(),
    modal: true, ok: { label: "Close" }, rejectClose: false
  });
}

function studioTarget() {
  const target = [...(game.user.targets ?? [])][0] ?? null;
  const doc = target?.document;
  const image = doc?.ring?.enabled && doc.ring?.subject?.texture
    ? doc.ring.subject.texture : doc?.texture?.src;
  return { targetName: target?.name ?? "", targetImage: image ?? target?.actor?.img ?? "" };
}

async function studioChooseResult(recipe) {
  const choices = [
    ["criticalSuccess", "Critical success"], ["success", "Success"],
    ["failure", "Failure"], ["criticalFailure", "Critical failure"]
  ];
  const options = choices.map(([key, label]) => `<option value="${key}">${label}</option>`).join("");
  const selected = await foundry.applications.api.DialogV2.prompt({
    window: { title: `${recipe.name}: Choose the Result` },
    content: studioDialogContent(`<p>Choose the result already determined at the table.</p><label>Outcome <select name="outcome" style="color:#fff;background:#302a35;color-scheme:dark;">${options}</select></label>`),
    ok: { label: "Continue", callback: (_event, button) => button.form.elements.outcome.value },
    rejectClose: false
  });
  if (!selected) return null;
  return { resultLabel: choices.find(([key]) => key === selected)?.[1] ?? "", resultText: recipe.results[selected] ?? "" };
}

function studioSummonRules() {
  return [
    { id: "animal", name: "Summon Animal", min: 1, max: 10, traits: ["animal"] },
    { id: "construct", name: "Summon Construct", min: 1, max: 10, traits: ["construct"] },
    { id: "fey", name: "Summon Fey", min: 1, max: 10, traits: ["fey"] },
    { id: "plant", name: "Summon Plant or Fungus", min: 1, max: 10, traits: ["plant", "fungus"] },
    { id: "undead", name: "Summon Undead", min: 1, max: 10, traits: ["undead"] },
    { id: "lesser", name: "Summon Lesser Servitor", min: 1, max: 4, traits: ["celestial", "fiend", "monitor", "animal"] },
    { id: "elemental", name: "Summon Elemental", min: 2, max: 10, traits: ["elemental"] },
    { id: "celestial", name: "Summon Celestial", min: 5, max: 10, traits: ["celestial"] },
    { id: "dragon", name: "Summon Dragon", min: 5, max: 10, traits: ["dragon"] },
    { id: "entity", name: "Summon Entity", min: 5, max: 10, traits: ["aberration"] },
    { id: "fiend", name: "Summon Fiend", min: 5, max: 10, traits: ["fiend"] },
    { id: "giant", name: "Summon Giant", min: 5, max: 10, traits: ["giant"] },
    { id: "monitor", name: "Summon Monitor", min: 5, max: 10, traits: ["monitor"] },
    { id: "custom", name: "Custom summon (enter traits)", min: 1, max: 10, traits: [] }
  ];
}

function studioSummonMaxLevel(rank) {
  return [null, -1, 1, 2, 3, 5, 7, 9, 11, 13, 15][Number(rank)] ?? null;
}

// Match PF2e's NPC adjustment preparation, including the low-level exceptions.
function studioSummonAdjustedLevel(base, adjustment) {
  if (!Number.isInteger(base)) return null;
  if (adjustment === "elite") return base < 1 ? base + 2 : base + 1;
  if (adjustment === "weak") return base === 1 ? base - 2 : base - 1;
  return base;
}

function studioSummonName(record, adjustment) {
  const baseName = record.sourceAdjustment ? record.name.replace(/^(?:elite|weak)\s+/i, "") : record.name;
  const label = adjustment === "normal" ? "" : `${adjustment[0].toUpperCase()}${adjustment.slice(1)} `;
  return !label || baseName.toLowerCase().startsWith(label.toLowerCase()) ? baseName : label + baseName;
}

function studioSummonEligible(record, settings) {
  const rule = studioSummonRules().find(item => item.id === settings.spell);
  const rank = Number(settings.rank);
  if (!rule || !Number.isInteger(rank) || rank < rule.min || rank > rule.max) return false;
  if (!settings.includeNonCommon && record.rarity !== "common") return false;
  const required = rule.id === "custom"
    ? String(settings.customTraits ?? "").split(",").map(item => item.trim().toLowerCase()).filter(Boolean)
    : rule.traits;
  if (!required.length || !required.some(trait => record.traits.includes(trait))) return false;
  if (rule.id === "dragon") {
    const tradition = String(settings.tradition ?? "");
    if (!["arcane", "divine", "occult", "primal"].includes(tradition)) return false;
    const dragonTraditions = record.traits.filter(trait => ["arcane", "divine", "occult", "primal"].includes(trait));
    if (dragonTraditions.length && !dragonTraditions.includes(tradition)) return false;
  }
  const level = studioSummonAdjustedLevel(record.baseLevel, settings.adjustment);
  return level !== null && level <= studioSummonMaxLevel(rank);
}

function studioSummonImage(actor, record) {
  const paths = [actor?.img, actor?.prototypeToken?.texture?.src, record?.image]
    .map(studioSafePath).filter(Boolean);
  const isPlaceholder = path => /(?:^|\/)(?:mystery-man\.svg|default-icons\/npc\.svg)$/i.test(path.split("?")[0]);
  return paths.find(path => !isPlaceholder(path)) ?? paths[0] ?? "";
}

async function studioIndexCreatures() {
  const fields = ["type", "img", "system.details.level.value", "system.traits.value", "system.traits.rarity", "system.attributes.adjustment", "prototypeToken.texture.src"];
  const packs = [...game.packs].filter(pack => pack.documentName === "Actor" && pack.visible !== false);
  const records = [];
  let cursor = 0, skipped = 0;
  const value = (object, path) => foundry.utils.getProperty(object, path) ?? object[path];
  const worker = async () => {
    while (cursor < packs.length) {
      const pack = packs[cursor++];
      try {
        const index = await pack.getIndex({ fields });
        for (const item of index) {
          const baseLevel = Number(value(item, "system.details.level.value"));
          const traits = value(item, "system.traits.value");
          if (item.type !== "npc" || !item._id || !Number.isInteger(baseLevel) || !Array.isArray(traits)) continue;
          records.push({
            uuid: item.uuid ?? `Compendium.${pack.collection}.Actor.${item._id}`,
            name: String(item.name ?? "Creature"), baseLevel,
            traits: traits.map(trait => String(trait).toLowerCase()),
            rarity: String(value(item, "system.traits.rarity") ?? "common").toLowerCase(),
            sourceAdjustment: value(item, "system.attributes.adjustment") ?? null,
            image: item.img ?? value(item, "prototypeToken.texture.src") ?? "",
            source: pack.title ?? pack.metadata?.label ?? pack.collection
          });
        }
      } catch (error) { skipped++; console.warn("Card Macro Studio: could not index creature compendium", pack.collection, error); }
    }
  };
  await Promise.all(Array.from({ length: Math.min(4, packs.length) }, worker));
  records.sort((a, b) => a.name.localeCompare(b.name) || a.source.localeCompare(b.source));
  return { records, skipped };
}

function studioLinkedSummonSettings(config, invocation) {
  const spell = invocation?.spell;
  if (!spell) return { ...config };
  const slug = value => String(value ?? "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const sourceSlug = slug(spell.slug || spell.system?.slug || spell.name);
  const rule = studioSummonRules().find(candidate => slug(candidate.name) === sourceSlug);
  const rank = Number(invocation.options?.rank ?? spell.rank);
  const validRank = Number.isInteger(rank) && rank >= 1 && rank <= 10;
  if (!rule) ui.notifications.warn("The linked spell is not a built-in summon preset. Choose a spell or enter custom traits and verify its restrictions.");
  const selectedRule = rule ?? studioSummonRules().find(candidate => candidate.id === "custom");
  if (validRank && (rank < selectedRule.min || rank > selectedRule.max)) {
    throw new Error(`The linked spell's rank ${rank} is outside the supported range for ${selectedRule.name}.`);
  }
  const tradition = String(spell.spellcasting?.tradition ?? "").toLowerCase();
  return { ...config, spell: selectedRule.id, rank: validRank ? rank : config.rank,
    tradition: ["arcane", "divine", "occult", "primal"].includes(tradition) ? tradition : config.tradition,
    lockSpell: !!rule, lockRank: validRank, linked: true };
}

async function studioChooseSummon(config = {}) {
  const rules = studioSummonRules();
  const defaults = { spell: "animal", rank: 1, adjustment: "normal", tradition: "", includeNonCommon: false, customTraits: "", ...config };
  const options = rules.map(rule => `<option value="${rule.id}">${studioEscape(rule.name)}</option>`).join("");
  const indexPromise = studioIndexCreatures();
  const content = studioDialogContent(`
    <p>Choose the summon spell, its cast rank, and a creature from accessible actor compendiums.</p>
    <div style="display:flex;gap:10px;flex-wrap:wrap;">
      <label style="flex:2;min-width:180px;">Summon spell <select name="spell" style="width:100%;color:#fff;background:#302a35;color-scheme:dark;">${options}</select></label>
      <label style="flex:1;min-width:90px;">Cast rank <select name="rank" style="width:100%;color:#fff;background:#302a35;color-scheme:dark;"></select></label>
      <label style="flex:1;min-width:120px;">Adjustment <select name="adjustment" style="width:100%;color:#fff;background:#302a35;color-scheme:dark;"><option value="normal">Normal</option><option value="weak">Weak</option><option value="elite">Elite</option></select></label>
    </div>
    <label data-dragon-options style="display:none;margin:8px 0;">Spellcasting tradition <select name="tradition" style="color:#fff;background:#302a35;color-scheme:dark;"><option value="">Choose for Summon Dragon</option><option value="arcane">Arcane</option><option value="divine">Divine</option><option value="occult">Occult</option><option value="primal">Primal</option></select></label>
    <label data-custom-options style="display:none;margin:8px 0;">Custom creature traits <input name="customTraits" placeholder="e.g. animal, fey" style="width:100%;color:#fff;background:#302a35;"></label>
    <label><input name="includeNonCommon" type="checkbox"> Include uncommon, rare and unique creatures (check access)</label>
    <p data-rule-note style="font-size:.85em;margin:8px 0;color:#e5d5bd;"></p>
    <label>Search creatures <input name="search" type="search" autocomplete="off" style="width:100%;color:#fff;background:#302a35;"></label>
    <div data-count aria-live="polite" style="margin:5px 0;">Loading creature compendiums…</div>
    <div data-results role="listbox" aria-label="Eligible creatures" style="height:180px;overflow:auto;background:#18151d;border:1px solid #8f7a6b;"></div>
    <input name="selected" type="hidden" value="">
    <div data-preview style="min-height:70px;margin-top:8px;padding:8px;color:#fff;background:#18151d;border:1px solid #8f7a6b;">Loading…</div>
    <p style="font-size:.8em;">Selection changes the card only. Apply the chosen adjustment to a creature's actual statistics separately. Deity, access, and other spell-specific restrictions may still apply.</p>`);
  const selected = await foundry.applications.api.DialogV2.prompt({
    window: { title: "Summon: Choose a Creature", resizable: true }, position: { width: 650, height: 760 }, content,
    render: (_event, dialog) => {
      const root = dialog.element;
      const field = name => root.querySelector(`[name="${name}"]`);
      const spell = field("spell"), rank = field("rank"), adjustment = field("adjustment"), tradition = field("tradition");
      const customTraits = field("customTraits"), includeNonCommon = field("includeNonCommon"), search = field("search"), chosen = field("selected");
      const results = root.querySelector("[data-results]"), preview = root.querySelector("[data-preview]");
      const count = root.querySelector("[data-count]"), note = root.querySelector("[data-rule-note]");
      let records = [], loaded = false, sequence = 0;
      spell.value = rules.some(rule => rule.id === defaults.spell) ? defaults.spell : "animal";
      spell.disabled = !!defaults.lockSpell;
      rank.disabled = !!defaults.lockRank;
      adjustment.value = ["normal", "weak", "elite"].includes(defaults.adjustment) ? defaults.adjustment : "normal";
      tradition.value = defaults.tradition ?? "";
      includeNonCommon.checked = !!defaults.includeNonCommon;
      customTraits.value = defaults.customTraits ?? "";
      const settings = () => ({ spell: spell.value, rank: Number(rank.value), adjustment: adjustment.value,
        tradition: tradition.value, includeNonCommon: includeNonCommon.checked, customTraits: customTraits.value });
      const setRanks = desired => {
        const rule = rules.find(item => item.id === spell.value) ?? rules[0];
        rank.replaceChildren();
        for (let number = rule.min; number <= rule.max; number++) {
          const option = document.createElement("option"); option.value = String(number); option.textContent = `Rank ${number}`;
          option.style.color = "#fff"; option.style.background = "#302a35"; rank.append(option);
        }
        rank.value = String(Math.max(rule.min, Math.min(rule.max, Number(desired) || rule.min)));
      };
      setRanks(defaults.rank);
      const select = async index => {
        const record = records[index];
        chosen.value = record ? String(index) : "";
        const request = ++sequence;
        for (const button of results.querySelectorAll("button")) {
          const active = button.dataset.index === String(index);
          button.style.background = active ? "#6b4a32" : "#29242e";
          button.setAttribute("aria-selected", String(active));
        }
        if (!record) { preview.textContent = "No eligible creature selected."; return; }
        const selectedSettings = settings();
        const level = studioSummonAdjustedLevel(record.baseLevel, selectedSettings.adjustment);
        preview.textContent = `Loading ${record.name}…`;
        try {
          const actor = await fromUuid(record.uuid);
          if (request !== sequence) return;
          if (!actor) { preview.textContent = "Could not load this creature."; return; }
          const image = studioSummonImage(actor, record);
          const alt = selectedSettings.adjustment === "normal" ? "Normal" : selectedSettings.adjustment[0].toUpperCase() + selectedSettings.adjustment.slice(1);
          preview.innerHTML = `${image ? `<img src="${studioEscape(image)}" alt="" style="float:left;width:56px;height:56px;object-fit:cover;margin:0 8px 4px 0;border:1px solid #8f7a6b;">` : ""}<strong>${studioEscape(record.name)}</strong> — ${studioEscape(alt)}, level ${level} (base ${record.baseLevel})<br>${studioEscape(record.traits.join(", "))} · ${studioEscape(record.rarity)}<br>${studioEscape(record.source)}`;
        } catch (error) { if (request === sequence) preview.textContent = `Could not load the creature: ${error.message}`; }
      };
      const refresh = () => {
        const current = settings();
        const rule = rules.find(item => item.id === current.spell) ?? rules[0];
        root.querySelector("[data-dragon-options]").style.display = rule.id === "dragon" ? "block" : "none";
        root.querySelector("[data-custom-options]").style.display = rule.id === "custom" ? "block" : "none";
        const max = studioSummonMaxLevel(current.rank);
        let extra = "";
        if (rule.id === "dragon" && !current.tradition) extra = " Choose a spellcasting tradition to filter dragons.";
        if (rule.id === "lesser") extra = " Lesser Servitor animals and sanctification have extra restrictions; confirm with your GM.";
        if (rule.id === "custom") extra = " Enter at least one creature trait; verify your spell's own restrictions.";
        note.textContent = `Maximum adjusted creature level: ${max}.${extra}${defaults.linked ? " Linked cast supplies the spell and/or rank where available." : ""}`;
        if (!loaded) return;
        const query = search.value.trim().toLocaleLowerCase();
        const previous = chosen.value === "" ? null : Number(chosen.value);
        const matches = records.map((record, index) => ({ record, index })).filter(({ record }) =>
          studioSummonEligible(record, current) && record.name.toLocaleLowerCase().includes(query));
        const visible = matches.slice(0, 100);
        count.textContent = matches.length > 100 ? `Showing 100 of ${matches.length}; narrow the search.` : `${matches.length} eligible creatures`;
        results.replaceChildren();
        for (const { record, index } of visible) {
          const button = document.createElement("button"); button.type = "button"; button.dataset.index = String(index); button.setAttribute("role", "option");
          button.style.cssText = "display:block;width:100%;height:auto;min-height:0;margin:0;padding:7px;border:0;color:#fff8ec;background:#29242e;text-align:left;white-space:normal;";
          button.textContent = `${studioSummonName(record, current.adjustment)} — level ${studioSummonAdjustedLevel(record.baseLevel, current.adjustment)} (base ${record.baseLevel}) [${record.source}]`;
          button.addEventListener("click", () => void select(index)); results.append(button);
        }
        void select(visible.some(item => item.index === previous) ? previous : visible[0]?.index ?? null);
      };
      spell.addEventListener("change", () => { setRanks(rank.value); refresh(); });
      for (const element of [rank, adjustment, tradition, includeNonCommon]) element.addEventListener("change", refresh);
      for (const element of [customTraits, search]) element.addEventListener("input", refresh);
      refresh();
      indexPromise.then(({ records: result, skipped }) => {
        records = result; loaded = true;
        if (skipped) ui.notifications.warn(`${skipped} creature compendium(s) could not be searched.`);
        refresh();
      }).catch(error => { count.textContent = `Could not load creatures: ${error.message}`; preview.textContent = ""; });
    },
    ok: { label: "Create Summon Card", callback: (_event, button) => {
      const form = button.form;
      if (form.elements.selected.value === "") return null;
      return { index: Number(form.elements.selected.value), spell: form.elements.spell.value, rank: Number(form.elements.rank.value),
        adjustment: form.elements.adjustment.value, tradition: form.elements.tradition.value,
        customTraits: form.elements.customTraits.value, includeNonCommon: form.elements.includeNonCommon.checked };
    } }, rejectClose: false
  });
  if (!selected) return null;
  const { records } = await indexPromise;
  const record = records[selected.index];
  if (!record || !studioSummonEligible(record, selected)) throw new Error("The selected creature no longer matches the summon filters.");
  const actor = await fromUuid(record.uuid);
  if (!actor || actor.type !== "npc") throw new Error("The chosen creature could not be loaded.");
  const rule = rules.find(item => item.id === selected.spell);
  const adjustmentLabel = selected.adjustment === "normal" ? "Normal" : selected.adjustment[0].toUpperCase() + selected.adjustment.slice(1);
  const displayName = studioSummonName(record, selected.adjustment);
  return { uuid: record.uuid, displayName, baseLevel: record.baseLevel,
    level: studioSummonAdjustedLevel(record.baseLevel, selected.adjustment), adjustment: selected.adjustment,
    adjustmentLabel, spellName: rule.name, rank: selected.rank, image: studioSummonImage(actor, record), source: record.source };
}

function studioManifestationLimit(traditions, primary) {
  const valid = ["arcane", "divine", "occult", "primal"];
  if (!valid.includes(primary)) return 0;
  const available = [...(traditions ?? [])].map(value => String(value).toLowerCase());
  return available.includes(primary) ? 9 : available.some(value => valid.includes(value)) ? 7 : 0;
}

async function studioResolveCasting(actor, linkedSpell) {
  const valid = ["arcane", "divine", "occult", "primal"];
  const entries = (actor?.spellcasting?.contents ?? []).filter(entry => valid.includes(entry.tradition) && entry.statistic);
  let entry = null;
  const linkedEntry = linkedSpell?.spellcasting;
  if (linkedEntry && valid.includes(linkedEntry.tradition)) {
    entry = entries.find(candidate => candidate.id === linkedEntry.id) ?? (actor && linkedEntry.statistic ? linkedEntry : null);
    return { entry, primary: linkedEntry.tradition };
  }
  if (!entry && !linkedSpell && actor) {
    const spells = (actor.items?.filter?.(item => item.type === "spell" &&
      (item.slug === "manifestation" || item.system?.slug === "manifestation" || item.name === "Manifestation")) ?? []);
    const entryIds = [...new Set(spells.map(item => item.spellcasting?.id).filter(Boolean))];
    if (entryIds.length === 1) entry = entries.find(candidate => candidate.id === entryIds[0]) ?? null;
  }
  if (!entry && entries.length === 1) entry = entries[0];
  if (!entry && entries.length > 1) {
    const options = entries.map((item, index) => `<option value="${index}">${studioEscape(item.name)} — ${studioEscape(item.tradition)}</option>`).join("");
    const index = await foundry.applications.api.DialogV2.prompt({
      window: { title: "Manifestation: Spellcasting Entry" },
      content: studioDialogContent(`<p>Choose the entry used to cast this spell.</p><label>Spellcasting entry <select name="entry" style="color:#fff;background:#302a35;color-scheme:dark;">${options}</select></label>`),
      ok: { label: "Continue", callback: (_event, button) => Number(button.form.elements.entry.value) }, rejectClose: false
    });
    if (index == null || !entries[index]) return null;
    entry = entries[index];
  }
  if (entry) return { entry, primary: entry.tradition };
  const primary = await foundry.applications.api.DialogV2.prompt({
    window: { title: "Manifestation: Primary Tradition" },
    content: studioDialogContent(`<p>No usable spellcasting entry was found. Choose the primary tradition; its spells are eligible through rank 9, with other traditions through rank 7. The resulting spell card will not have actor-based casting statistics.</p><label>Primary tradition <select name="tradition" style="color:#fff;background:#302a35;color-scheme:dark;"><option value="">Choose a tradition…</option><option value="arcane">Arcane</option><option value="divine">Divine</option><option value="occult">Occult</option><option value="primal">Primal</option></select></label>`),
    ok: { label: "Continue", callback: (_event, button) => button.form.elements.tradition.value }, rejectClose: false
  });
  return valid.includes(primary) ? { entry: null, primary } : null;
}

// Build the duplicate spell card without adding a spell or consuming a slot.
async function studioManifestation(actor, linkedSpell = null) {
  const casting = await studioResolveCasting(actor, linkedSpell);
  if (!casting) return null;
  const { entry, primary } = casting;

  const records = [];
  const fields = ["type", "system.level.value", "system.traits.traditions", "system.traits.rarity"];
  const add = (item, uuid, source) => {
    const rank = Number(foundry.utils.getProperty(item, "system.level.value"));
    const traditions = foundry.utils.getProperty(item, "system.traits.traditions");
    if (item.type !== "spell" || !uuid || !Number.isInteger(rank) || rank < 1 || !Array.isArray(traditions)) return;
    const max = studioManifestationLimit(traditions, primary);
    if (rank <= max) records.push({ uuid, name: item.name, rank, max, traditions, source, rarity: foundry.utils.getProperty(item, "system.traits.rarity") ?? "common" });
  };
  for (const item of game.items.filter(item => item.type === "spell")) add(item, item.uuid, "World Items");
  let skipped = 0;
  for (const pack of game.packs) {
    if (pack.documentName !== "Item" || pack.visible === false) continue;
    try {
      for (const item of await pack.getIndex({ fields })) add(item, item.uuid ?? `Compendium.${pack.collection}.Item.${item._id}`, pack.title ?? pack.collection);
    } catch (error) { skipped++; console.warn("Card Macro Studio: could not index", pack.collection, error); }
  }
  records.sort((a, b) => a.name.localeCompare(b.name) || a.source.localeCompare(b.source));
  if (!records.length) throw new Error("No eligible spells were found in accessible items or compendiums.");
  if (skipped) ui.notifications.warn(`${skipped} item compendium(s) could not be searched.`);

  const content = studioDialogContent(`
    <p>${studioEscape(primary[0].toUpperCase() + primary.slice(1))} spells up to rank 9; the other traditions up to rank 7.</p>
    <p style="font-size:.85em;">Uncommon and rare spells require appropriate access or GM permission.</p>
    <label>Search <input name="search" type="search" autocomplete="off" style="width:100%;color:#fff;background:#302a35;"></label>
    <div data-count style="margin:5px 0;"></div>
    <div data-results role="listbox" aria-label="Eligible spells" style="height:150px;overflow:auto;background:#18151d;border:1px solid #8f7a6b;"></div>
    <input name="selected" type="hidden" value="">
    <label>Cast rank <select name="rank" style="color:#fff;background:#302a35;color-scheme:dark;"></select></label>
    <div data-description style="height:150px;overflow:auto;padding:8px;color:#fff;background:#18151d;border:1px solid #8f7a6b;"></div>`);
  const selected = await foundry.applications.api.DialogV2.prompt({
    window: { title: "Manifestation: Choose a Spell", resizable: true }, position: { width: 600 }, content,
    render: (_event, dialog) => {
      const root = dialog.element;
      const search = root.querySelector('[name="search"]');
      const chosen = root.querySelector('[name="selected"]');
      const ranks = root.querySelector('[name="rank"]');
      const results = root.querySelector('[data-results]');
      const description = root.querySelector('[data-description]');
      const count = root.querySelector('[data-count]');
      let request = 0;
      const select = async index => {
        const record = records[index];
        chosen.value = record ? String(index) : "";
        ranks.replaceChildren();
        const requestId = ++request;
        for (const button of results.querySelectorAll("button")) {
          const active = button.dataset.index === String(index);
          button.style.background = active ? "#6b4a32" : "#29242e";
          button.setAttribute("aria-selected", String(active));
        }
        if (!record) { description.textContent = "No eligible spell selected."; return; }
        for (let rank = record.rank; rank <= record.max; rank++) {
          const option = document.createElement("option");
          option.value = String(rank); option.textContent = `Rank ${rank}`;
          option.style.color = "#fff"; option.style.background = "#302a35"; ranks.append(option);
        }
        description.textContent = `Loading ${record.name}…`;
        try {
          const spell = await fromUuid(record.uuid);
          if (requestId !== request) return;
          if (!spell) { description.textContent = "Could not load this spell."; return; }
          const text = await foundry.applications.ux.TextEditor.enrichHTML(spell.system.description.value, {
            async: true, rollData: spell.getRollData(), relativeTo: spell
          });
          if (requestId === request) description.innerHTML = `<strong>${studioEscape(record.name)}</strong> — rank ${record.rank}; ${studioEscape(record.traditions.join(", "))}; ${studioEscape(record.rarity)}<hr>${text}`;
        } catch (error) { if (requestId === request) description.textContent = `Could not load preview: ${error.message}`; }
      };
      const refresh = () => {
        const query = search.value.trim().toLocaleLowerCase();
        const matches = records.map((record, index) => ({ record, index })).filter(({ record }) => record.name.toLocaleLowerCase().includes(query));
        const visible = matches.slice(0, 100);
        count.textContent = matches.length > 100 ? `Showing 100 of ${matches.length}; narrow the search.` : `${matches.length} matches`;
        results.replaceChildren();
        for (const { record, index } of visible) {
          const button = document.createElement("button");
          button.type = "button"; button.dataset.index = String(index); button.setAttribute("role", "option");
          button.style.cssText = "display:block;width:100%;height:auto;min-height:0;margin:0;padding:7px;border:0;color:#fff8ec;background:#29242e;text-align:left;white-space:normal;";
          button.textContent = `${record.name} — rank ${record.rank}; ${record.traditions.join(", ")} [${record.source}]`;
          button.addEventListener("click", () => void select(index)); results.append(button);
        }
        void select(visible[0]?.index ?? null);
      };
      search.addEventListener("input", refresh); refresh();
    },
    ok: { label: "Manifest Spell", callback: (_event, button) => {
      const form = button.form;
      if (form.elements.selected.value === "") return null;
      const record = records[Number(form.elements.selected.value)];
      const rank = Number(form.elements.rank.value);
      return record && Number.isInteger(rank) ? { uuid: record.uuid, rank } : null;
    } }, rejectClose: false
  });
  if (!selected) return null;
  return { message: await studioManifestationDraft(actor, entry, selected, primary), primary };
}

async function studioManifestationDraft(actor, entry, selected, primary = entry?.tradition) {
  const spell = await fromUuid(selected.uuid);
  if (!spell || spell.type !== "spell") throw new Error("The selected spell could not be loaded.");
  const traditions = [...(spell.traditions ?? spell.system?.traits?.traditions ?? [])];
  const max = studioManifestationLimit(traditions, primary);
  if (!max || !Number.isInteger(selected.rank) || selected.rank < 1 || spell.baseRank > selected.rank || selected.rank > max) throw new Error("That spell or cast rank is not eligible for Manifestation.");
  if (!entry || !actor) {
    const description = await foundry.applications.ux.TextEditor.enrichHTML(spell.system?.description?.value ?? "", {
      async: true, rollData: spell.getRollData?.() ?? {}, relativeTo: spell
    });
    return { speaker: actor ? ChatMessage.getSpeaker({ actor }) : { alias: game.user?.name ?? "Caster" },
      content: `<div class="pf2e chat-card" style="padding:8px;"><h3>${studioEscape(spell.name)}, via Manifestation</h3><p><strong>Rank ${selected.rank}</strong> · ${studioEscape(primary)} primary tradition</p><p><em>No spellcasting entry is available; resolve checks and heightening manually.</em></p>${description}</div>` };
  }
  const source = spell.toObject();
  source.name = `${spell.name}, via Manifestation`;
  source.system.location ??= {};
  source.system.location.value = entry.id;
  source.system.location.heightenedLevel = selected.rank;
  if (spell.isCantrip) source.system.location.autoHeightenLevel = selected.rank;
  const temporarySpell = new CONFIG.Item.documentClass(source, { parent: actor });
  if (!temporarySpell.spellcasting?.statistic) throw new Error("Could not attach the spell to the selected spellcasting entry.");
  const draft = await temporarySpell.toMessage(null, { actualCast: true, create: false, data: { castRank: selected.rank } });
  if (!draft) throw new Error("PF2e could not create the selected spell's chat card.");
  const message = draft.toObject();
  if (!message.flags?.pf2e?.casting) throw new Error("PF2e did not provide casting information for the spell card.");
  message.flags.pf2e.casting.embeddedSpell = temporarySpell.toObject();
  return message;
}

function studioTokens(actor, scope) {
  if (!actor || !canvas.scene) return [];
  const all = canvas.scene.tokens?.contents ?? [];
  const controlled = new Set((canvas.tokens?.controlled ?? []).map(token => token.document?.id ?? token.id));
  return all.filter(doc => doc.actorId === actor.id && doc.actor?.isOwner &&
    (scope !== "selected" || controlled.has(doc.id)));
}

function studioGroups(actor, documents) {
  const groups = new Map();
  for (const doc of documents) {
    const current = doc.actor;
    if (!groups.has(current.uuid)) groups.set(current.uuid, { actor: current, documents: [] });
    groups.get(current.uuid).documents.push(doc);
  }
  if (!groups.size && actor) groups.set(actor.uuid, { actor, documents: [] });
  return [...groups.values()];
}

async function studioSyncSize(actor, documents) {
  if (!documents.length) return;
  const size = actor.system?.traits?.size?.tokenDimensions;
  if (!size || !Number.isFinite(size.width) || !Number.isFinite(size.height)) {
    throw new Error("PF2e did not provide dimensions for the actor's current size.");
  }
  const dimensions = { width: size.width, height: size.height };
  if (Number.isFinite(size.depth)) dimensions.depth = size.depth;
  for (const doc of documents) {
    if (doc.flags?.pf2e?.linkToActorSize) {
      await doc.update({ "flags.pf2e.linkToActorSize": false });
      try { await doc.update({ "flags.pf2e.linkToActorSize": true, ...dimensions }); }
      catch (error) { await doc.update({ "flags.pf2e.linkToActorSize": true }); throw error; }
    } else await doc.update(dimensions);
  }
}

// This warms only the initiating client's Foundry texture cache. Other players
// still load the same assets independently.
async function studioPreload(paths) {
  const load = globalThis.foundry?.canvas?.loadTexture;
  if (typeof load !== "function") return;
  await Promise.all([...new Set(paths.map(studioSafePath).filter(Boolean))].slice(0, 16).map(async path => {
    let timer;
    try {
      const texture = await Promise.race([
        load(path), new Promise((_, reject) => { timer = setTimeout(() => reject(new Error("timed out")), 10000); })
      ]);
      if (!texture) throw new Error("no texture returned");
    } catch (error) { console.warn(`Card Macro Studio could not preload ${path}`, error); }
    finally { clearTimeout(timer); }
  }));
}

async function studioAddEffect(actor, config, marker) {
  if (!config.effectEnabled) return null;
  const uuid = String(config.effectUuid ?? "").trim();
  if (!uuid) throw new Error("An effect UUID is required.");
  const existing = actor.items.find(item => item.type === "effect" &&
    (item._stats?.compendiumSource === uuid || item.flags?.core?.sourceId === uuid || item.sourceId === uuid));
  if (existing) {
    if (existing.isExpired) throw new Error("The matching effect is expired; remove or renew it before running this macro.");
    ui.notifications.info(`${actor.name} already has that effect; it will be kept as-is.`);
    return null;
  }
  const effect = await fromUuid(uuid);
  if (!effect || effect.type !== "effect") throw new Error("The configured compendium effect could not be found.");
  const source = effect.toObject();
  delete source._id;
  source._stats ??= {};
  source._stats.compendiumSource = uuid;
  source.flags ??= {};
  source.flags.world ??= {};
  source.flags.world.cardMacroStudioEffect = marker;
  const rank = Number(config.effectRank);
  if (Number.isInteger(rank) && rank >= 1 && rank <= 10) {
    if (!source.system?.level) throw new Error("This effect has no rank field to change.");
    source.system.level.value = rank;
  }
  const created = await actor.createEmbeddedDocuments("Item", [source]);
  if (!created?.length) throw new Error("The effect was not applied; its selection may have been cancelled.");
  return created[0].id;
}

function studioSnapshot(actor, documents, marker, sceneUuid, config, mode) {
  return {
    marker, sceneUuid, status: "preparing", portrait: actor._source?.img ?? actor.img,
    behavior: { transitionPath: config.transitionPath, reverseMs: config.reverseMs,
      syncSize: mode === "transform" || mode === "apply" ? config.syncSize : false },
    prototype: {
      texture: actor._source?.prototypeToken?.texture?.src ?? actor.prototypeToken?.texture?.src ?? null,
      ringSubject: actor._source?.prototypeToken?.ring?.subject?.texture ?? actor.prototypeToken?.ring?.subject?.texture ?? null
    },
    createdEffectId: null, writtenPortrait: "", writtenPrototype: "", tokenWrites: [],
    tokens: documents.map(doc => ({
      uuid: doc.uuid, texture: doc._source?.texture?.src ?? doc.texture?.src,
      ringEnabled: doc._source?.ring?.enabled ?? doc.ring?.enabled ?? false,
      ringSubject: doc._source?.ring?.subject?.texture ?? doc.ring?.subject?.texture ?? null
    }))
  };
}

async function studioImage(doc, path, isTransition, originalRing) {
  const change = { "texture.src": path };
  if (isTransition) change["ring.enabled"] = false;
  else {
    change["ring.enabled"] = originalRing;
    change["ring.subject.texture"] = path;
  }
  await doc.update(change);
}

async function studioRestore(group, state, key, config, playTransition) {
  const actor = group.actor;
  config = { ...config, ...state.behavior };
  if (state.sceneUuid && canvas.scene?.uuid !== state.sceneUuid) {
    throw new Error("Return to the scene where the transformation began before restoring it.");
  }
  const docs = [];
  for (const snapshot of state.tokens ?? []) {
    const doc = await fromUuid(snapshot.uuid);
    if (!doc) throw new Error(`A transformed token could not be found: ${snapshot.uuid}`);
    docs.push({ doc, snapshot });
  }
  const transition = studioSafePath(config.transitionPath);
  if (playTransition && transition && docs.length) {
    for (const { doc, snapshot } of docs) {
      const current = doc._source?.texture?.src ?? doc.texture?.src;
      if (state.tokenWrites.includes(current) || current === snapshot.texture) await studioImage(doc, transition, true, snapshot.ringEnabled);
    }
    await new Promise(resolve => setTimeout(resolve, config.reverseMs));
  }
  const managed = actor.items.filter(item => item.type === "effect" &&
    (item.id === state.createdEffectId || item.flags?.world?.cardMacroStudioEffect === state.marker));
  if (managed.length) await actor.deleteEmbeddedDocuments("Item", managed.map(item => item.id));
  if (config.syncSize) await studioSyncSize(actor, docs.map(entry => entry.doc));
  for (const { doc, snapshot } of docs) {
    const current = doc._source?.texture?.src ?? doc.texture?.src;
    if (state.tokenWrites.includes(current)) {
      await doc.update({ "texture.src": snapshot.texture, "ring.enabled": snapshot.ringEnabled, "ring.subject.texture": snapshot.ringSubject });
    } else if (current !== snapshot.texture) {
      ui.notifications.warn(`The art of ${doc.name ?? "a token"} changed since activation; it was not overwritten.`);
    }
  }
  if (state.writtenPortrait) {
    const current = actor._source?.img ?? actor.img;
    if (current === state.writtenPortrait) await actor.update({ img: state.portrait });
    else if (current !== state.portrait) ui.notifications.warn(`${actor.name}'s portrait changed since activation; it was not overwritten.`);
  }
  if (state.writtenPrototype && state.prototype?.texture) {
    const texture = actor._source?.prototypeToken?.texture?.src ?? actor.prototypeToken?.texture?.src;
    const ring = actor._source?.prototypeToken?.ring?.subject?.texture ?? actor.prototypeToken?.ring?.subject?.texture ?? null;
    const change = {};
    if (texture === state.writtenPrototype) change["prototypeToken.texture.src"] = state.prototype.texture;
    else if (texture !== state.prototype.texture) ui.notifications.warn(`${actor.name}'s prototype token changed since activation; its art was not overwritten.`);
    if (ring === state.writtenPrototype) change["prototypeToken.ring.subject.texture"] = state.prototype.ringSubject;
    else if (ring !== state.prototype.ringSubject) ui.notifications.warn(`${actor.name}'s prototype ring changed since activation; it was not overwritten.`);
    if (Object.keys(change).length) await actor.update(change);
  }
  await actor.unsetFlag("world", key);
}

function studioLinkedMessageMode(data, linked) {
  const raw = linked?.options?.messageMode ?? linked?.options?.rollMode;
  const modes = { publicroll: "public", gmroll: "gm", blindroll: "blind", selfroll: "self", roll: undefined };
  const mode = Object.hasOwn(modes, raw) ? modes[raw] : raw;
  if (mode != null && !["public", "gm", "blind", "self"].includes(mode)) throw new Error("The linked cast has an unsupported message visibility mode.");
  const cls = globalThis.CONFIG?.ChatMessage?.documentClass ?? globalThis.ChatMessage;
  if (typeof cls?.applyMode === "function") return cls.applyMode(data, mode);
  if (mode !== "public") throw new Error("Cannot safely apply the selected message visibility.");
  return data;
}

async function studioResumeLinkedCast(linked, rank) {
  if (!linked) return true;
  const options = { ...(linked.options ?? {}) };
  if (Number.isInteger(rank)) options.rank = rank;
  const result = await linked.cast(options);
  if (result === false) { ui.notifications.warn("The linked spell cast did not complete; no special card was posted."); return false; }
  return true;
}

// Card, outcome, and summon macros do not need token or effect handling.
async function studioRunCardRecipe(recipe, invocation = {}, choose = null) {
  const hasLinkedCast = !!invocation.spell && typeof invocation.cast === "function";
  if (hasLinkedCast && !recipe.behavior?.toolbeltSpellMacro) {
    ui.notifications.warn("This macro was invoked by Toolbelt, but spell linking is not enabled in its studio settings; the spell was not cast.");
    return;
  }
  const linked = hasLinkedCast ? invocation : null;
  if (recipe.behavior?.toolbeltSpellMacro && !linked) ui.notifications.warn("No Toolbelt spell cast was provided. Running standalone; this macro will not cast or spend a spell slot.");
  let actor = linked?.actor ?? linked?.spell?.actor ?? null;
  if (!actor) actor = recipe.actorBinding === "none" ? null : recipe.actorBinding === "assigned"
    ? game.user.character : await fromUuid(recipe.actorBinding);
  if (recipe.actorBinding !== "none" && !actor) { ui.notifications.warn("The configured actor could not be found."); return; }
  const lockKey = `${recipe.id}:${actor?.uuid ?? game.user.id}`;
  globalThis.cardMacroStudioLocks ??= new Set();
  if (globalThis.cardMacroStudioLocks.has(lockKey)) { ui.notifications.warn("This macro is already running."); return; }
  globalThis.cardMacroStudioLocks.add(lockKey);
  try {
    const selection = choose ? await choose(recipe, linked) : {};
    if (!selection) return;
    const linkedRank = Number(linked?.options?.rank ?? linked?.spell?.rank);
    if (selection.castRank != null && linked && Number.isInteger(linkedRank) && selection.castRank !== linkedRank) throw new Error("The chosen rank does not match the linked spell cast.");
    const context = { actor, spellName: linked?.spell?.name ?? "", spellRank: Number.isInteger(linkedRank) ? linkedRank : null,
      tradition: linked?.spell?.spellcasting?.tradition ?? "", ...studioTarget(), ...selection.cardContext };
    const showMessages = linked?.options?.message !== false;
    if (linked && showMessages) studioLinkedMessageMode({}, linked);
    if (!await studioResumeLinkedCast(linked, selection.castRank)) return;
    if (showMessages) await ChatMessage.create(studioLinkedMessageMode({
      speaker: actor ? ChatMessage.getSpeaker({ actor }) : ChatMessage.getSpeaker(),
      content: studioRenderCard(recipe, context)
    }, linked));
  } catch (error) {
    console.error("Card Macro Studio generated macro failed", error);
    ui.notifications.error(`${recipe.name}: ${error.message}`);
  } finally { globalThis.cardMacroStudioLocks.delete(lockKey); }
}

async function studioSelectCardResult(recipe) {
  const outcome = await studioChooseResult(recipe);
  return outcome ? { cardContext: outcome } : null;
}

async function studioSelectCardSummon(recipe, linked) {
  const settings = linked ? studioLinkedSummonSettings(recipe.summon, linked) : recipe.summon;
  const summon = await studioChooseSummon(settings);
  return summon ? { cardContext: { summon }, castRank: summon.rank } : null;
}

// Watch only the selected actor's own rolls on this client. PF2e does not
// always label a Strike as a reaction, so reactive-only watchers also allow
// the user to explicitly mark the next attack.
async function studioRunWatcher(recipe) {
  const watch = recipe.behavior.watch;
  globalThis.cardMacroStudioWatchers ??= new Map();
  const watchers = globalThis.cardMacroStudioWatchers;
  const old = watchers.get(recipe.id);
  if (old) {
    const buttons = [];
    if (old.reactiveOnly) buttons.push({ action: "arm", label: "Mark Next Attack as Reactive", default: true });
    buttons.push({ action: "stop", label: "Stop Watching", default: !old.reactiveOnly }, { action: "cancel", label: "Cancel" });
    const choice = await foundry.applications.api.DialogV2.wait({
      window: { title: `${recipe.name}: Watcher` },
      content: studioDialogContent(old.reactiveOnly
        ? "<p>Mark your next attack as Reactive if the roll is not labelled, or stop this watcher.</p>"
        : "<p>This watcher is already running in this client.</p>"),
      buttons, rejectClose: false
    });
    if (choice === "arm") {
      old.armedUntil = Date.now() + 60000;
      ui.notifications.info(`${recipe.name}: the next attack is marked as Reactive for 60 seconds.`);
    } else if (choice === "stop") {
      Hooks.off("createChatMessage", old.hookId);
      watchers.delete(recipe.id);
      ui.notifications.info(`${recipe.name}: watcher stopped.`);
    }
    return;
  }

  const actor = recipe.actorBinding === "assigned" ? game.user.character : await fromUuid(recipe.actorBinding);
  if (!actor?.isOwner) { ui.notifications.warn(`${recipe.name}: choose an owned actor before starting the watcher.`); return; }
  const state = { hookId: null, reactiveOnly: !!watch.reactiveOnly, armedUntil: 0, posted: new Set() };
  const names = { criticalSuccess: "Critical success", success: "Success", failure: "Failure", criticalFailure: "Critical failure" };
  const onMessage = async (message, _options, userId) => {
    const authorId = userId ?? message.author?.id ?? message.user?.id ?? message.user;
    if (authorId !== game.user.id) return;
    const context = message.flags?.pf2e?.context;
    if (!context || (watch.type !== "any" && context.type !== watch.type)) return;
    if (watch.type === "any" && !["attack-roll", "saving-throw", "skill-check", "perception-check", "check", "counteract-check", "flat-check", "initiative"].includes(context.type)) return;
    if (context.actor !== actor.id && context.actor !== actor.uuid && message.speaker?.actor !== actor.id && message.actor?.id !== actor.id) return;
    const options = new Set(Array.isArray(context.options) ? context.options : []);
    const requiredOption = String(watch.requiredOption ?? "").trim();
    if (requiredOption && !options.has(requiredOption)) return;
    if (watch.reactiveOnly) {
      const action = context.action ?? message.rolls?.[0]?.options?.action;
      const tagged = ["action:reactive-strike", "reactive-strike", "action:attack-of-opportunity", "attack-of-opportunity"].some(option => options.has(option)) ||
        (typeof action === "string" && ["reactive-strike", "attack-of-opportunity"].includes(action.toLowerCase()));
      if (!tagged && Date.now() >= state.armedUntil) return;
      state.armedUntil = 0; // Consume an explicit mark even when this attack misses.
    }
    const outcome = context.outcome ?? ["criticalFailure", "failure", "success", "criticalSuccess"][message.rolls?.[0]?.options?.degreeOfSuccess];
    if (!names[outcome]) { ui.notifications.warn(`${recipe.name}: the roll has no degree of success; provide a DC or target.`); return; }
    if (watch.outcome !== "any" && watch.outcome !== outcome) return;
    if (message.id && state.posted.has(message.id)) return;
    if (message.blind && watch.visibility === "self" && !game.user.isGM) {
      ui.notifications.warn(`${recipe.name}: a blind roll cannot be posted to yourself. Use roll visibility instead.`);
      return;
    }
    if (message.id) state.posted.add(message.id);
    try {
      let targetName = "", targetImage = "";
      const targetUuid = context.target?.token ?? context.target?.actor;
      if (targetUuid) {
        try {
          const target = await fromUuid(targetUuid);
          targetName = target?.name ?? target?.actor?.name ?? "";
          targetImage = target?.ring?.enabled && target.ring.subject?.texture ? target.ring.subject.texture :
            target?.texture?.src ?? target?.actor?.img ?? target?.img ?? "";
        } catch (error) { console.warn("Card Macro Studio could not resolve the roll target", error); }
      }
      const cardContext = { actor, targetName, targetImage, resultLabel: names[outcome],
        ...(recipe.mode === "result" ? { resultText: recipe.results[outcome] } : {}) };
      const cls = globalThis.CONFIG?.ChatMessage?.documentClass ?? globalThis.ChatMessage;
      const recipients = [...(message.whisper ?? [])].map(user => typeof user === "string" ? user : user.id).filter(Boolean);
      const mode = watch.visibility === "self" ? "self" : message.blind ? "blind" : !recipients.length ? "public" :
        recipients.length === 1 && recipients[0] === game.user.id ? "self" : "gm";
      const data = { speaker: { ...message.speaker }, content: studioRenderCard(recipe, cardContext),
        whisper: recipients, blind: !!message.blind,
        flags: { world: { cardMacroStudioWatcher: { sourceMessageId: message.id } } } };
      if (typeof cls?.applyMode !== "function") throw new Error("Cannot safely apply the roll's chat visibility.");
      await cls.create(cls.applyMode(data, mode), { messageMode: mode });
    } catch (error) {
      if (message.id) state.posted.delete(message.id);
      console.error("Card Macro Studio watcher could not post", error);
      ui.notifications.error(`${recipe.name}: could not post the card: ${error.message}`);
    }
  };
  state.hookId = Hooks.on("createChatMessage", (...args) => {
    void onMessage(...args).catch(error => {
      console.error("Card Macro Studio watcher failed", error);
      ui.notifications.error(`${recipe.name}: watcher failed: ${error.message}`);
    });
  });
  watchers.set(recipe.id, state);
  ui.notifications.info(`${recipe.name}: watching ${actor.name}'s rolls. Run again to manage the watcher.`);
}

async function studioRunChangeRecipe(recipe, invocation = {}) {
  const hasLinkedCast = !!invocation.spell && typeof invocation.cast === "function";
  if (hasLinkedCast && !recipe.behavior?.toolbeltSpellMacro) {
    ui.notifications.warn("This macro was invoked by Toolbelt, but spell linking is not enabled in its studio settings; the spell was not cast.");
    return;
  }
  const linked = hasLinkedCast ? invocation : null;
  if (recipe.behavior?.toolbeltSpellMacro && !linked) ui.notifications.warn("No Toolbelt spell cast was provided. Running standalone; this macro will not cast or spend a spell slot.");
  let actor = linked?.actor ?? linked?.spell?.actor ?? null;
  if (!actor) actor = recipe.actorBinding === "none" ? null : recipe.actorBinding === "assigned"
    ? game.user.character : await fromUuid(recipe.actorBinding);
  if (recipe.actorBinding !== "none" && !actor) { ui.notifications.warn("The configured actor could not be found."); return; }
  if (!actor?.isOwner) {
    ui.notifications.warn("This macro needs an actor you own."); return;
  }
  const lockKey = `${recipe.id}:${actor?.uuid ?? game.user.id}`;
  globalThis.cardMacroStudioLocks ??= new Set();
  if (globalThis.cardMacroStudioLocks.has(lockKey)) { ui.notifications.warn("This macro is already running."); return; }
  globalThis.cardMacroStudioLocks.add(lockKey);
  try {
    const linkedRank = Number(linked?.options?.rank ?? linked?.spell?.rank);
    const context = { actor, spellName: linked?.spell?.name ?? "", spellRank: Number.isInteger(linkedRank) ? linkedRank : null,
      tradition: linked?.spell?.spellcasting?.tradition ?? "", ...studioTarget() };
    const showMessages = linked?.options?.message !== false;
    if (linked && showMessages) studioLinkedMessageMode({}, linked); // Fail before casting if visibility cannot be preserved.
    const postCard = async () => showMessages ? ChatMessage.create(studioLinkedMessageMode({
      speaker: context.actor ? ChatMessage.getSpeaker({ actor: context.actor }) : ChatMessage.getSpeaker(),
      content: studioRenderCard(recipe, context)
    }, linked)) : null;
    const docs = studioTokens(actor, recipe.behavior.tokenScope);
    const groups = studioGroups(actor, docs);
    if (groups.length === 1) context.actor = groups[0].actor;
    const key = `cardMacroStudio_${recipe.id}`;
    const active = groups.map(group => ({ group, state: group.actor.getFlag("world", key) })).filter(entry => entry.state);

    if (actor && recipe.behavior.tokenScope === "selected" && !docs.length && !active.length) {
      ui.notifications.warn("Select a matching owned token, or change the token scope to the current scene."); return;
    }
    if (!docs.length && recipe.behavior.tokenScope === "scene" &&
      (recipe.behavior.syncSize || recipe.behavior.tokenPath || recipe.behavior.transitionPath)) {
      ui.notifications.warn("No matching token is on this scene; token changes cannot be applied.");
    }

    if (recipe.mode === "transform" && active.length) {
      await studioPreload(active.flatMap(({ state }) => [state.behavior?.transitionPath, ...(state.tokens ?? []).flatMap(token => [token.texture, token.ringSubject])]));
      for (const { group, state } of active) await studioRestore(group, state, key, recipe.behavior, state.status === "active");
      if (recipe.behavior.postWhen === "both") await postCard();
      return;
    }
    if (recipe.mode === "apply" && active.length) {
      for (const { group, state } of active) await studioRestore(group, state, key, recipe.behavior, false);
      ui.notifications.info("Recovered the previous interrupted update. Run the macro again to apply it.");
      return;
    }

    if (!await studioResumeLinkedCast(linked)) return;

    const finalToken = studioSafePath(recipe.behavior.tokenPath);
    const finalPortrait = studioSafePath(recipe.behavior.portraitPath);
    const transition = studioSafePath(recipe.behavior.transitionPath);
    if (docs.length) await studioPreload([transition, finalToken, ...docs.flatMap(doc => [doc.texture?.src, doc.ring?.subject?.texture])]);
    const activeStates = [];
    for (const group of groups) {
      const state = studioSnapshot(group.actor, group.documents, studioId(), canvas.scene?.uuid ?? null, recipe.behavior, recipe.mode);
      state.tokenWrites = [transition, finalToken].filter(Boolean);
      state.writtenPortrait = finalPortrait;
      if (finalToken && recipe.behavior.prototypeToken && !group.actor.isToken && state.prototype.texture) state.writtenPrototype = finalToken;
      else if (finalToken && recipe.behavior.prototypeToken && group.actor.isToken) ui.notifications.warn("An unlinked token has its own actor; its world prototype token was not changed.");
      activeStates.push({ group, state });
      if (["apply", "transform"].includes(recipe.mode)) {
        await group.actor.setFlag("world", key, state);
      }
      state.createdEffectId = await studioAddEffect(group.actor, recipe.behavior, state.marker);
      if (["apply", "transform"].includes(recipe.mode)) await group.actor.setFlag("world", key, state);
      if (recipe.behavior.syncSize) await studioSyncSize(group.actor, group.documents);
      if (transition && group.documents.length) {
        for (const doc of group.documents) await studioImage(doc, transition, true, false);
      }
    }
    if (transition && docs.length) await new Promise(resolve => setTimeout(resolve, recipe.behavior.activateMs));
    for (const group of groups) {
      const state = activeStates.find(entry => entry.group === group)?.state;
      for (const doc of group.documents) {
        const snapshot = state?.tokens.find(token => token.uuid === doc.uuid);
        if (finalToken) await studioImage(doc, finalToken, false, snapshot?.ringEnabled ?? doc.ring?.enabled ?? false);
        else if (transition && snapshot) await doc.update({ "texture.src": snapshot.texture, "ring.enabled": snapshot.ringEnabled, "ring.subject.texture": snapshot.ringSubject });
      }
      if (finalPortrait) await group.actor.update({ img: finalPortrait });
      if (state?.writtenPrototype) await group.actor.update({ "prototypeToken.texture.src": finalToken, "prototypeToken.ring.subject.texture": finalToken });
      if (state && recipe.mode === "transform") { state.status = "active"; await group.actor.setFlag("world", key, state); }
    }
    if (recipe.mode === "apply") for (const { group } of activeStates) await group.actor.unsetFlag("world", key);
    if (recipe.behavior.postWhen !== "never") await postCard();
  } catch (error) {
    console.error("Card Macro Studio generated macro failed", error);
    ui.notifications.error(`${recipe.name}: ${error.message}. If a transformation was interrupted, run it again to restore.`);
  } finally { globalThis.cardMacroStudioLocks.delete(lockKey); }
}

async function studioRunTemporaryRecipe(recipe, invocation = {}, choose = null) {
  const hasLinkedCast = !!invocation.spell && typeof invocation.cast === "function";
  if (hasLinkedCast && !recipe.behavior?.toolbeltSpellMacro) {
    ui.notifications.warn("This macro was invoked by Toolbelt, but spell linking is not enabled in its studio settings; the spell was not cast.");
    return;
  }
  const linked = hasLinkedCast ? invocation : null;
  if (recipe.behavior?.toolbeltSpellMacro && !linked) ui.notifications.warn("No Toolbelt spell cast was provided. Running standalone; this macro will not cast or spend a spell slot.");
  let actor = linked?.actor ?? linked?.spell?.actor ?? null;
  if (!actor) actor = recipe.actorBinding === "none" ? null : recipe.actorBinding === "assigned"
    ? game.user.character : await fromUuid(recipe.actorBinding);
  if (recipe.actorBinding !== "none" && !actor && !choose) { ui.notifications.warn("The configured actor could not be found."); return; }
  if ((!choose && !actor?.isOwner) || (choose && actor && !actor.isOwner)) {
    ui.notifications.warn("This macro needs an actor you own."); return;
  }
  const lockKey = `${recipe.id}:${actor?.uuid ?? game.user.id}`;
  globalThis.cardMacroStudioLocks ??= new Set();
  if (globalThis.cardMacroStudioLocks.has(lockKey)) { ui.notifications.warn("This macro is already running."); return; }
  globalThis.cardMacroStudioLocks.add(lockKey);
  try {
    const selection = choose ? await choose(actor, linked?.spell) : null;
    if (choose && !selection) return;
    const linkedRank = Number(linked?.options?.rank ?? linked?.spell?.rank);
    const context = { actor, spellName: linked?.spell?.name ?? "", spellRank: Number.isInteger(linkedRank) ? linkedRank : null,
      tradition: selection?.primary ?? linked?.spell?.spellcasting?.tradition ?? "", ...studioTarget() };
    const showMessages = linked?.options?.message !== false;
    if (linked && showMessages) studioLinkedMessageMode({}, linked);
    const docs = studioTokens(actor, recipe.behavior.tokenScope);
    const groups = studioGroups(actor, docs);
    if (groups.length === 1) context.actor = groups[0].actor;
    const key = `cardMacroStudio_${recipe.id}`;
    const active = groups.map(group => ({ group, state: group.actor.getFlag("world", key) })).filter(entry => entry.state);
    if (actor && recipe.behavior.tokenScope === "selected" && !docs.length && !active.length && (!choose || recipe.behavior.transitionPath)) {
      ui.notifications.warn("Select a matching owned token, or change the token scope to the current scene."); return;
    }
    if (!docs.length && recipe.behavior.tokenScope === "scene" &&
      (recipe.behavior.syncSize || recipe.behavior.tokenPath || recipe.behavior.transitionPath)) {
      ui.notifications.warn("No matching token is on this scene; token changes cannot be applied.");
    }
    if (active.length) {
      for (const { group, state } of active) await studioRestore(group, state, key, recipe.behavior, false);
      ui.notifications.info("Recovered the previous interrupted transition. Run the macro again to start a new one.");
      return;
    }
    if (!await studioResumeLinkedCast(linked)) return;
    if (docs.length) await studioPreload([recipe.behavior.transitionPath, ...docs.flatMap(doc => [doc.texture?.src, doc.ring?.subject?.texture])]);
    if (showMessages) await ChatMessage.create(studioLinkedMessageMode({
      speaker: context.actor ? ChatMessage.getSpeaker({ actor: context.actor }) : ChatMessage.getSpeaker(),
      content: studioRenderCard(recipe, context)
    }, linked));
    const transition = studioSafePath(recipe.behavior.transitionPath);
    if (transition && docs.length) {
      const saved = [];
      try {
        for (const group of groups) {
          const state = studioSnapshot(group.actor, group.documents, studioId(), canvas.scene?.uuid ?? null, recipe.behavior, recipe.mode);
          state.tokenWrites = [transition];
          await group.actor.setFlag("world", key, state);
          saved.push({ group, state });
          for (const doc of group.documents) await studioImage(doc, transition, true, false);
        }
        await new Promise(resolve => setTimeout(resolve, recipe.behavior.activateMs));
      } finally {
        for (const { group, state } of saved) await studioRestore(group, state, key, { ...recipe.behavior, syncSize: false }, false);
      }
    } else if (transition && !docs.length) ui.notifications.warn("No matching token was found for the transition.");
    if (selection?.message && showMessages) await CONFIG.ChatMessage.documentClass.create(studioLinkedMessageMode(selection.message, linked));
  } catch (error) {
    console.error("Card Macro Studio generated macro failed", error);
    ui.notifications.error(`${recipe.name}: ${error.message}. If a transformation was interrupted, run it again to restore.`);
  } finally { globalThis.cardMacroStudioLocks.delete(lockKey); }
}

function studioDefaults() {
  return {
    schemaVersion: 1, id: studioId(), name: "My Special Moment", icon: "icons/svg/d20.svg",
    mode: "card", actorBinding: "assigned",
    card: {
      theme: "divine", ...STUDIO_THEMES.divine,
      title: "A MOMENT TO REMEMBER", subtitle: "", paragraphs: ["{actor} steps forward."],
      align: "center", font: "default", radius: 10,
      artMode: "none", artPath: "", artPosition: "after", imageAlt: "Card artwork", imageLink: "none", showSummonDetails: true,
      overlayPath: "", overlayPlacement: "card", overlayOpacity: 0.85
    },
    results: { criticalSuccess: "A brilliant success.", success: "The attempt succeeds.", failure: "The attempt falls short.", criticalFailure: "That did not go as planned." },
    summon: { spell: "animal", rank: 1, adjustment: "normal", tradition: "", includeNonCommon: false, customTraits: "" },
    behavior: {
      tokenScope: "scene", toolbeltSpellMacro: false, effectEnabled: false, effectUuid: "", effectRank: 0, syncSize: false,
      tokenPath: "", portraitPath: "", prototypeToken: false, transitionPath: "", activateMs: 5000, reverseMs: 4000, postWhen: "activate",
      watch: { enabled: false, type: "attack-roll", outcome: "criticalSuccess", reactiveOnly: false, requiredOption: "", visibility: "source" }
    }
  };
}

// Recipes saved by older studio versions have no watcher settings.
function studioNormalizeRecipe(recipe) {
  const defaults = studioDefaults();
  return { ...defaults, ...recipe,
    card: { ...defaults.card, ...recipe.card }, results: { ...defaults.results, ...recipe.results },
    summon: { ...defaults.summon, ...recipe.summon },
    behavior: { ...defaults.behavior, ...recipe.behavior,
      watch: { ...defaults.behavior.watch, ...recipe.behavior?.watch } } };
}

function studioExampleSummon(config = {}) {
  const rule = studioSummonRules().find(item => item.id === config.spell) ?? studioSummonRules()[0];
  const adjustment = ["normal", "weak", "elite"].includes(config.adjustment) ? config.adjustment : "normal";
  const label = adjustment === "normal" ? "Normal" : adjustment[0].toUpperCase() + adjustment.slice(1);
  return { displayName: adjustment === "normal" ? "Example creature" : `${label} example creature`,
    level: studioSummonAdjustedLevel(-1, adjustment), spellName: rule.name,
    rank: Math.max(rule.min, Math.min(rule.max, Number(config.rank) || rule.min)), adjustmentLabel: label, image: "" };
}

function studioGeneratedSource(recipe) {
  const helpers = [studioEscape, studioSafePath, studioColor, studioText, studioRenderCard];
  const watch = !!recipe.behavior?.watch?.enabled;
  const simple = ["card", "result", "summon"].includes(recipe.mode);
  let runtimeRecipe = recipe;
  let entry;
  if (watch) {
    helpers.push(studioDialogContent, studioRunWatcher);
    runtimeRecipe = { id: recipe.id, name: recipe.name, mode: recipe.mode, actorBinding: recipe.actorBinding,
      card: recipe.card, behavior: { watch: recipe.behavior.watch }, ...(recipe.mode === "result" ? { results: recipe.results } : {}) };
    entry = "await studioRunWatcher(CARD_RECIPE);";
  } else if (simple) {
    helpers.push(studioTarget, studioLinkedMessageMode, studioResumeLinkedCast);
    let chooser = "null";
    if (recipe.mode === "result") {
      helpers.push(studioDialogContent, studioChooseResult, studioSelectCardResult);
      chooser = "studioSelectCardResult";
    } else if (recipe.mode === "summon") {
      helpers.push(studioDialogContent, studioSummonRules, studioSummonMaxLevel, studioSummonAdjustedLevel, studioSummonName,
        studioSummonEligible, studioSummonImage, studioIndexCreatures, studioLinkedSummonSettings, studioChooseSummon, studioSelectCardSummon);
      chooser = "studioSelectCardSummon";
    }
    helpers.push(studioRunCardRecipe);
    runtimeRecipe = { id: recipe.id, name: recipe.name, mode: recipe.mode, actorBinding: recipe.actorBinding, card: recipe.card,
      behavior: { toolbeltSpellMacro: recipe.behavior.toolbeltSpellMacro },
      ...(recipe.mode === "result" ? { results: recipe.results } : {}),
      ...(recipe.mode === "summon" ? { summon: recipe.summon } : {}) };
    entry = `await studioRunCardRecipe(CARD_RECIPE, CARD_INVOCATION, ${chooser});`;
  } else {
    helpers.push(studioId, studioTarget, studioTokens, studioGroups, studioSyncSize, studioPreload,
      studioSnapshot, studioImage, studioRestore, studioLinkedMessageMode, studioResumeLinkedCast);
    if (["temporary", "manifestation"].includes(recipe.mode)) {
      if (recipe.mode === "manifestation") helpers.push(studioDialogContent, studioManifestationLimit, studioResolveCasting, studioManifestationDraft, studioManifestation);
      helpers.push(studioRunTemporaryRecipe);
      entry = `await studioRunTemporaryRecipe(CARD_RECIPE, CARD_INVOCATION, ${recipe.mode === "manifestation" ? "studioManifestation" : "null"});`;
    } else {
      helpers.push(studioAddEffect, studioRunChangeRecipe);
      entry = "await studioRunChangeRecipe(CARD_RECIPE, CARD_INVOCATION);";
    }
  }
  const invocation = watch ? "" : '\nconst CARD_INVOCATION = { actor: typeof actor === "undefined" ? null : actor, spell: typeof spell === "undefined" ? null : spell, options: typeof options === "undefined" ? null : options, cast: typeof cast === "function" ? cast : null };';
  return `// Generated by Card Macro Studio ${STUDIO_VERSION}. Reopen it in the studio to edit.\n${helpers.map(fn => fn.toString()).join("\n\n")}\n\nconst CARD_RECIPE = ${JSON.stringify(runtimeRecipe, null, 2)};${invocation}\n${entry}\n`;
}

function studioMacroData(recipe) {
  const command = studioGeneratedSource(recipe);
  return {
    name: recipe.name, type: "script", scope: "global", img: studioSafePath(recipe.icon) || "icons/svg/d20.svg", command,
    flags: { world: { [STUDIO_FLAG]: { schemaVersion: 1, generatorVersion: STUDIO_VERSION, recipe: studioClone(recipe), commandHash: studioHash(command) } } }
  };
}

function studioGet(object, path) {
  return path.split(".").reduce((value, part) => value?.[part], object);
}

function studioSet(object, path, value) {
  const parts = path.split(".");
  const last = parts.pop();
  const target = parts.reduce((value, part) => value[part] ??= {}, object);
  target[last] = value;
}

function studioFormData(form, original) {
  const recipe = studioClone(original);
  for (const field of form.querySelectorAll("[data-setting]")) {
    let value = field.type === "checkbox" ? field.checked : field.value;
    if (field.type === "number" || field.type === "range") value = Number(value);
    studioSet(recipe, field.dataset.setting, value);
  }
  recipe.card.paragraphs = [form.elements.paragraph1.value, form.elements.paragraph2.value, form.elements.paragraph3.value];
  recipe.behavior.activateMs = Math.max(0, Math.min(60000, Number(recipe.behavior.activateMs) || 0));
  recipe.behavior.reverseMs = Math.max(0, Math.min(60000, Number(recipe.behavior.reverseMs) || 0));
  recipe.card.overlayOpacity = Math.max(0, Math.min(1, Number(recipe.card.overlayOpacity) || 0));
  recipe.name = recipe.name.trim();
  return recipe;
}

function studioPopulate(form, recipe) {
  for (const field of form.querySelectorAll("[data-setting]")) {
    const value = studioGet(recipe, field.dataset.setting);
    if (field.dataset.setting === "actorBinding" && value && ![...field.options].some(option => option.value === value)) {
      const option = document.createElement("option"); option.value = value; option.textContent = `Unavailable actor: ${value}`; field.append(option);
    }
    if (field.type === "checkbox") field.checked = !!value;
    else if (value != null) field.value = String(value);
  }
  for (let i = 0; i < 3; i++) form.elements[`paragraph${i + 1}`].value = recipe.card.paragraphs?.[i] ?? "";
}

function studioValidate(recipe) {
  if (!recipe.name) return "Give the macro a name.";
  const watch = recipe.behavior.watch;
  if (watch?.enabled && !["card", "result"].includes(recipe.mode)) return "Roll watching is available for Chat Card Only and Choose an Outcome.";
  if (watch?.enabled && recipe.actorBinding === "none") return "Choose an actor for the roll watcher.";
  if (watch?.enabled && recipe.behavior.toolbeltSpellMacro) return "A roll watcher cannot be used as a Toolbelt Spell Macro.";
  if (watch?.enabled && watch.reactiveOnly && watch.type !== "attack-roll") return "Reactive Strike watching requires the Attack Roll type.";
  if (watch?.enabled && !["attack-roll", "saving-throw", "skill-check", "perception-check", "any"].includes(watch.type)) return "Choose a valid roll type to watch.";
  if (watch?.enabled && !["any", "criticalSuccess", "success", "failure", "criticalFailure"].includes(watch.outcome)) return "Choose a valid outcome to watch.";
  if (watch?.enabled && !["source", "self"].includes(watch.visibility)) return "Choose a valid watcher visibility.";
  if (["apply", "transform", "temporary"].includes(recipe.mode) && recipe.actorBinding === "none" && !recipe.behavior.toolbeltSpellMacro) return "Choose an actor for this behavior, or enable Toolbelt spell linking.";
  if (recipe.behavior.effectEnabled && ["apply", "transform"].includes(recipe.mode) && !recipe.behavior.effectUuid.trim()) return "Enter the compendium effect UUID.";
  if (recipe.mode === "temporary" && !recipe.behavior.transitionPath.trim()) return "Enter the temporary token animation path.";
  if (recipe.card.artMode === "url" && !recipe.card.artPath.trim()) return "Enter the card art path or choose no illustration.";
  for (const [label, path] of [["Card artwork", recipe.card.artPath], ["Overlay", recipe.card.overlayPath], ["Token art", recipe.behavior.tokenPath], ["Portrait", recipe.behavior.portraitPath], ["Transition", recipe.behavior.transitionPath]]) {
    if (path?.trim() && !studioSafePath(path)) return `${label} must be an HTTPS/HTTP URL or Foundry asset path.`;
  }
  if (recipe.card.overlayPath && recipe.card.overlayPlacement === "art" && recipe.card.artMode === "none") return "Choose card-border overlay placement, or enable an illustration.";
  return "";
}

function studioEditor(recipe, existing) {
  const input = (path, type = "text", extra = "") => `<input type="${type}" data-setting="${path}" ${extra} style="width:100%;min-height:30px;color:#fff8ec;background:#302a35;border:1px solid #8d7a6d;border-radius:4px;padding:4px 7px;">`;
  const area = name => `<textarea name="${name}" rows="2" style="width:100%;color:#fff8ec;background:#302a35;border:1px solid #8d7a6d;border-radius:4px;padding:5px;"></textarea>`;
  const select = (path, values) => `<select data-setting="${path}" style="width:100%;min-height:30px;color:#fff8ec;background:#302a35;color-scheme:dark;border:1px solid #8d7a6d;border-radius:4px;">${values.map(([v, label]) => `<option value="${studioEscape(v)}">${studioEscape(label)}</option>`).join("")}</select>`;
  const check = (path, label) => `<label style="display:block;margin:6px 0;"><input type="checkbox" data-setting="${path}"> ${label}</label>`;
  const field = (label, element, hint = "") => `<label style="display:block;margin:8px 0;color:#fff8ec;font-weight:600;">${label}${element}${hint ? `<small style="display:block;color:#d3c8b9;font-weight:normal;">${hint}</small>` : ""}</label>`;
  const ownedActors = (game.actors?.contents ?? []).filter(actor => actor.isOwner)
    .sort((a, b) => a.name.localeCompare(b.name)).map(actor => [actor.uuid, actor.name]);
  const themes = Object.entries(STUDIO_THEMES).map(([id, theme]) => [id, theme.label]);
  const cases = Object.entries(STUDIO_CASES).map(([id, preset]) => `<option value="${id}">${studioEscape(preset.label)}</option>`).join("");
  const macroOptions = existing.map(macro => `<option value="${studioEscape(macro.id)}">${studioEscape(macro.name)}</option>`).join("");
  const content = studioDialogContent(`
    <div data-studio-scroll style="color:#fff8ec;line-height:1.35;max-height:min(68vh,650px);overflow-y:auto;overscroll-behavior:contain;padding-right:6px;">
      <div style="display:flex;align-items:center;gap:8px;margin:0 0 8px;">
        <p style="flex:1;margin:0;">Build a reusable card. Artwork and animated decoration are optional.</p>
        <button type="button" data-studio-help aria-label="Open Card Macro Studio tutorial" title="Open tutorial" style="display:flex;align-items:center;justify-content:center;flex:0 0 28px;width:28px;height:28px;min-height:0;margin:0;padding:0;border:1px solid #bca995;border-radius:50%;background:#302a35;color:#fff8ec;font-weight:700;line-height:1;">?</button>
      </div>
      <div style="display:flex;gap:7px;align-items:center;"><select name="loadMacro" style="flex:1;color:#fff;background:#302a35;color-scheme:dark;"><option value="">Select a previously generated macro…</option>${macroOptions}</select><button type="button" data-load style="flex:0 0 auto;width:auto;">Load settings</button></div>
      <input type="hidden" name="loadedId" value="">
      <div data-loaded style="font-size:.85em;color:#d3c8b9;margin:5px 0;">Creating a new macro.</div>
      <div style="display:flex;gap:7px;align-items:center;margin:8px 0;"><select name="useCase" style="flex:1;color:#fff;background:#302a35;color-scheme:dark;"><option value="">Choose an optional use-case preset…</option>${cases}</select><button type="button" data-preset style="flex:0 0 auto;width:auto;">Apply preset</button></div>
      <p style="font-size:.8em;color:#d3c8b9;">Applying a preset replaces the editable title, text, behavior, and theme. It does not add images or effects. Create New or Download JSON retains settings for later editing.</p>
      <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-start;">
        <div style="flex:1 1 370px;min-width:280px;">
          <details open><summary><strong>1. Macro and actor</strong></summary>
            ${field("Macro name", input("name"))}
            ${field("Behavior", select("mode", [["card", "Chat card only"], ["summon", "Summon creature card"], ["result", "Choose an outcome, then post"], ["apply", "Apply effect / changes once"], ["transform", "Transformation toggle"], ["temporary", "Temporary token animation"], ["manifestation", "Manifestation spell picker"]]))}
            ${field("Actor", select("actorBinding", [["assigned", "My assigned character"], ["none", "No actor"], ...ownedActors]))}
            ${field("Scene tokens", select("behavior.tokenScope", [["scene", "All matching owned tokens"], ["selected", "Only selected matching tokens"]]))}
            ${field("Macro icon path", input("icon"))}
          </details>
          <details data-watch-settings><summary><strong>Roll watcher (optional)</strong></summary>
            ${check("behavior.watch.enabled", "Watch the actor's rolls instead of posting when run")}
            ${field("Roll type", select("behavior.watch.type", [["attack-roll", "Attack rolls"], ["saving-throw", "Saving throws"], ["skill-check", "Skill checks"], ["perception-check", "Perception checks"], ["any", "Any supported check"]]))}
            ${field("Post on", select("behavior.watch.outcome", [["criticalSuccess", "Critical success"], ["success", "Success"], ["failure", "Failure"], ["criticalFailure", "Critical failure"], ["any", "Any degree of success"]]))}
            ${check("behavior.watch.reactiveOnly", "Only Reactive Strike (attack rolls)")}
            ${field("Required PF2e roll option (optional)", input("behavior.watch.requiredOption"), "Exact roll option. Leave blank to accept any matching roll.")}
            ${field("Card visibility", select("behavior.watch.visibility", [["source", "Match the roll's visibility"], ["self", "Self only"]]))}
            <p style="font-size:.85em;">Run the generated macro once after connecting to start watching. Run again to stop. An unlabelled Reactive Strike must be marked before rolling; see the tutorial.</p>
          </details>
          <details open><summary><strong>2. Card content</strong></summary>
            ${field("Title", input("card.title"))}
            ${field("Subtitle", input("card.subtitle"))}
            ${field("Paragraph 1", area("paragraph1"))}${field("Paragraph 2", area("paragraph2"))}${field("Paragraph 3", area("paragraph3"), "Placeholders: {actor}, {target}, {result}, {spell}, {spellRank}, {tradition}, {summon}, {summonLevel}, {summonSpell}, {summonRank}, {summonAdjustment}.")}
            ${field("Illustration", select("card.artMode", [["none", "None — text only"], ["url", "Specified image"], ["actor", "Actor portrait"], ["target", "First targeted token's image"], ["summon", "Chosen summoned creature"]]))}
            ${field("Illustration path", input("card.artPath"))}
            ${field("Image placement", select("card.artPosition", [["after", "After text"], ["before", "Before text"]]))}
            ${field("Image click", select("card.imageLink", [["none", "No link"], ["actor", "Open actor sheet"]]))}
            ${field("Image description", input("card.imageAlt"))}
            ${field("Decorative overlay path", input("card.overlayPath"), "Optional animated WebP/GIF or static image; leave empty for no overlay.")}
            ${field("Overlay placement", select("card.overlayPlacement", [["card", "Whole card"], ["art", "Illustration frame"]]))}
            ${field("Overlay opacity (0–1)", input("card.overlayOpacity", "number", 'step="0.05" min="0" max="1"'))}
            ${check("card.showSummonDetails", "Show chosen creature, level, summon spell and rank")}
          </details>
          <details><summary><strong>3. Appearance</strong></summary>
            ${field("Theme preset", select("card.theme", themes))}
            ${field("Background", input("card.background", "color"))}${field("Text panel", input("card.panel", "color"))}
            ${field("Border / accent", input("card.accent", "color"))}${field("Text", input("card.text", "color"))}
            ${field("Text alignment", select("card.align", [["center", "Centered"], ["left", "Left"], ["right", "Right"]]))}
            ${field("Font", select("card.font", [["default", "Foundry default"], ["serif", "Serif"]]))}
            ${field("Corner radius", input("card.radius", "number", 'min="0" max="24"'))}
          </details>
          <details><summary><strong>4. Outcome text</strong></summary>
            <p>For the outcome mode, you choose a result when running the generated macro. These replace the normal paragraphs.</p>
            ${field("Critical success", input("results.criticalSuccess"))}${field("Success", input("results.success"))}${field("Failure", input("results.failure"))}${field("Critical failure", input("results.criticalFailure"))}
          </details>
          <details><summary><strong>Summon picker defaults</strong></summary>
            <p>The picker opens when the generated summon macro runs. Defaults can be changed there each time. Only creature compendiums you can access are searched.</p>
            ${field("Default summon spell", select("summon.spell", studioSummonRules().map(rule => [rule.id, rule.name])))}
            ${field("Default cast rank", select("summon.rank", Array.from({length:10}, (_, i) => [String(i + 1), `Rank ${i + 1}`])))}
            ${field("Default creature adjustment", select("summon.adjustment", [["normal", "Normal"], ["weak", "Weak"], ["elite", "Elite"]]))}
            ${field("Default spellcasting tradition", select("summon.tradition", [["", "Choose when needed"], ["arcane", "Arcane"], ["divine", "Divine"], ["occult", "Occult"], ["primal", "Primal"]]))}
            ${field("Custom traits, separated by commas", input("summon.customTraits"))}
            ${check("summon.includeNonCommon", "Include uncommon, rare and unique by default")}
            <p style="font-size:.85em;">Choose “Chosen summoned creature” under Illustration to show its existing portrait, or leave the card art-free.</p>
          </details>
          <details><summary><strong>PF2e Toolbelt spell linking</strong></summary>
            ${check("behavior.toolbeltSpellMacro", "Use this generated macro as a Toolbelt Spell Macro")}
            <p style="font-size:.85em;">Attach the generated macro to a spell using Toolbelt's Spell Macro feature. It uses the linked caster, spell, and cast options, and resumes that cast once after your choices. Canceling a picker leaves the spell uncast. Running this macro directly does not cast a spell.</p>
          </details>
          <details><summary><strong>5. Effects and transformations</strong></summary>
            <p>Used by Apply Once or Transformation Toggle. Existing matching effects are reused and never removed by the toggle.</p>
            ${check("behavior.effectEnabled", "Apply a PF2e compendium effect")}
            ${field("Effect UUID", input("behavior.effectUuid"))}
            ${field("Effect rank", select("behavior.effectRank", [["0", "Use effect default"], ...Array.from({length:10}, (_, i) => [String(i + 1), `Rank ${i + 1}`])]))}
            ${check("behavior.syncSize", "Refresh token size from actor after applying/removing effect")}
            ${field("Transformed token art", input("behavior.tokenPath"), "Leave empty to keep current token art.")}
            ${check("behavior.prototypeToken", "Also update the linked world actor's prototype token art")}
            ${field("Transformed actor portrait", input("behavior.portraitPath"), "Leave empty to keep current portrait.")}
            ${field("Temporary / transition token art", input("behavior.transitionPath"), "Use an accessible WebM or image. Optional except for Temporary Token Animation.")}
            ${field("Activation duration, milliseconds", input("behavior.activateMs", "number", 'min="0" max="60000" step="250"'))}
            ${field("Return duration, milliseconds", input("behavior.reverseMs", "number", 'min="0" max="60000" step="250"'))}
            ${field("Post transformation card", select("behavior.postWhen", [["activate", "On activation only"], ["both", "On activation and return"], ["never", "Do not post"]]))}
          </details>
        </div>
        <div style="flex:0 1 280px;min-width:240px;position:sticky;top:0;">
          <strong>Card preview</strong><p style="font-size:.85em;color:#d3c8b9;">The real chat rendering can differ. Test Card posts a whispered test message.</p>
          <label style="display:block;margin:6px 0;">Outcome to preview <select name="previewOutcome" style="width:100%;color:#fff;background:#302a35;color-scheme:dark;"><option value="criticalSuccess">Critical success</option><option value="success">Success</option><option value="failure">Failure</option><option value="criticalFailure">Critical failure</option></select></label>
          <div data-preview style="width:100%;max-width:280px;padding:8px;background:#2d2930;border-radius:5px;"></div>
          <p style="font-size:.85em;color:#d3c8b9;">Only an animated image supplies card motion. Outcome mode can ask you to choose a result or use the roll watcher.</p>
        </div>
      </div>
    </div>`);
  return content;
}

async function studioShowText(title, text) {
  const content = studioDialogContent('<p>Select the text below and copy it.</p><textarea readonly style="width:100%;height:450px;color:#fff;background:#201d24;font-family:monospace;"></textarea>');
  content.querySelector("textarea").textContent = text;
  await foundry.applications.api.DialogV2.prompt({ window: { title, resizable: true }, position: { width: 800 }, content,
    ok: { label: "Close" }, rejectClose: false });
}

function studioSizeScrollArea(element, form, scroll) {
  const bounds = element.getBoundingClientRect();
  const footer = form.querySelector("footer") ?? element.querySelector("footer");
  const footerHeight = footer?.getBoundingClientRect().height ?? 50;
  const bottom = Math.min(bounds.bottom, globalThis.innerHeight || bounds.bottom);
  scroll.style.maxHeight = `${Math.max(80, Math.floor(bottom - scroll.getBoundingClientRect().top - footerHeight - 16))}px`;
}

async function studioOpen() {
  let draft = studioDefaults();
  let loadedId = "";
  while (true) {
    let scrollObserver = null;
    const existing = (game.macros?.contents ?? []).filter(macro => macro.flags?.world?.[STUDIO_FLAG]?.schemaVersion === 1)
      .sort((a, b) => a.name.localeCompare(b.name));
    const result = await foundry.applications.api.DialogV2.wait({
      window: { title: `Card Macro Studio ${STUDIO_VERSION}`, resizable: true },
      position: { width: 850, height: Math.max(300, Math.min(820, (globalThis.innerHeight || 860) - 40)) },
      content: studioEditor(draft, existing),
      render: (_event, dialog) => {
        const form = dialog.element.querySelector("form");
        const scroll = form.querySelector("[data-studio-scroll]");
        const sizeScrollArea = () => studioSizeScrollArea(dialog.element, form, scroll);
        sizeScrollArea();
        if (globalThis.ResizeObserver) {
          scrollObserver = new ResizeObserver(sizeScrollArea);
          scrollObserver.observe(dialog.element);
        }
        studioPopulate(form, draft);
        form.elements.loadedId.value = loadedId;
        if (loadedId) form.querySelector("[data-loaded]").textContent = "Loaded settings. Use Update Loaded to replace that macro, or Create New for a separate copy.";
        const helpButton = form.querySelector("[data-studio-help]");
        const header = dialog.window?.header, closeButton = dialog.window?.close;
        // Keep help available while the form scrolls. The in-form button is a
        // fallback if this Foundry window does not expose its header controls.
        if (header && closeButton && header.contains(closeButton)) {
          header.querySelector("[data-studio-help]")?.remove();
          closeButton.before(helpButton);
        }
        let helpOpen = false;
        helpButton.addEventListener("click", async event => {
          event.preventDefault();
          if (helpOpen) return;
          helpOpen = true;
          try { await studioShowHelp(); }
          catch (error) {
            console.error("Card Macro Studio could not open the tutorial", error);
            ui.notifications.error(`Could not open the tutorial: ${error.message}`);
          } finally { helpOpen = false; }
        });
        const syncWatcherControls = () => {
          const supported = ["card", "result"].includes(form.querySelector('[data-setting="mode"]').value);
          form.querySelector("[data-watch-settings]").hidden = !supported;
          if (!supported) form.querySelector('[data-setting="behavior.watch.enabled"]').checked = false;
          const reactive = form.querySelector('[data-setting="behavior.watch.reactiveOnly"]');
          reactive.disabled = form.querySelector('[data-setting="behavior.watch.type"]').value !== "attack-roll";
          if (reactive.disabled) reactive.checked = false;
        };
        const preview = () => {
          const current = studioFormData(form, draft);
          const previewKey = form.elements.previewOutcome.value;
          const labels = { criticalSuccess: "Critical success", success: "Success", failure: "Failure", criticalFailure: "Critical failure" };
          const actor = current.actorBinding === "assigned" ? game.user.character :
            current.actorBinding === "none" ? null : (game.actors?.contents ?? []).find(item => item.uuid === current.actorBinding);
          form.querySelector("[data-preview]").innerHTML = studioRenderCard(current, {
            actor: actor ?? { name: "Actor" }, ...studioTarget(),
            ...(current.mode === "summon" ? { summon: studioExampleSummon(current.summon) } : {}),
            ...(current.mode === "result" ? { resultLabel: labels[previewKey], resultText: current.results[previewKey] } : {})
          });
        };
        form.addEventListener("input", preview);
        form.addEventListener("change", event => {
          syncWatcherControls();
          if (event.target.dataset.setting === "card.theme") {
            const theme = STUDIO_THEMES[event.target.value];
            if (theme) for (const key of ["background", "panel", "accent", "text"]) {
              form.querySelector(`[data-setting="card.${key}"]`).value = theme[key];
            }
          }
          preview();
        });
        form.querySelector("[data-load]").addEventListener("click", () => {
          const macro = game.macros.get(form.elements.loadMacro.value);
          const meta = macro?.flags?.world?.[STUDIO_FLAG];
          if (!meta?.recipe || meta.schemaVersion !== 1) { ui.notifications.warn("Choose a Card Macro Studio macro first."); return; }
          draft = studioNormalizeRecipe(studioClone(meta.recipe));
          loadedId = macro.id;
          form.elements.loadedId.value = loadedId;
          studioPopulate(form, draft);
          syncWatcherControls();
          form.querySelector("[data-loaded]").textContent = `Loaded: ${macro.name}. Update it or create a separate copy.`;
          preview();
        });
        form.querySelector("[data-preset]").addEventListener("click", () => {
          const preset = STUDIO_CASES[form.elements.useCase.value];
          if (!preset) { ui.notifications.warn("Choose a use-case preset first."); return; }
          for (const [path, value] of [["mode", preset.mode], ["card.theme", preset.theme], ["card.title", preset.title], ["card.subtitle", preset.subtitle]]) {
            form.querySelector(`[data-setting="${path}"]`).value = value;
          }
          for (const key of ["background", "panel", "accent", "text"]) form.querySelector(`[data-setting="card.${key}"]`).value = STUDIO_THEMES[preset.theme][key];
          for (let i = 0; i < 3; i++) form.elements[`paragraph${i + 1}`].value = preset.paragraphs[i] ?? "";
          if (preset.mode === "summon") form.querySelector('[data-setting="card.showSummonDetails"]').checked = true;
          if (preset.results) for (const [key, value] of Object.entries(preset.results)) form.querySelector(`[data-setting="results.${key}"]`).value = value;
          syncWatcherControls();
          preview();
        });
        syncWatcherControls();
        preview();
      },
      close: () => scrollObserver?.disconnect(),
      buttons: [
        { action: "create", label: "Create New", default: true, callback: (_event, button) => ({ action: "create", recipe: studioFormData(button.form, draft), loadedId: button.form.elements.loadedId.value }) },
        { action: "update", label: "Update Loaded", callback: (_event, button) => ({ action: "update", recipe: studioFormData(button.form, draft), loadedId: button.form.elements.loadedId.value }) },
        { action: "test", label: "Test Card", callback: (_event, button) => ({ action: "test", recipe: studioFormData(button.form, draft), loadedId: button.form.elements.loadedId.value, previewOutcome: button.form.elements.previewOutcome.value }) },
        { action: "download", label: "Download JSON", callback: (_event, button) => ({ action: "download", recipe: studioFormData(button.form, draft), loadedId: button.form.elements.loadedId.value }) },
        { action: "source", label: "Show Script", callback: (_event, button) => ({ action: "source", recipe: studioFormData(button.form, draft), loadedId: button.form.elements.loadedId.value }) },
        { action: "cancel", label: "Close", callback: () => null }
      ], rejectClose: false
    });
    if (!result) return;
    draft = result.recipe;
    loadedId = result.loadedId;
    const problem = studioValidate(draft);
    if (problem) { ui.notifications.warn(problem); continue; }
    if (result.action === "test") {
      try {
        const actor = draft.actorBinding === "none" ? null : draft.actorBinding === "assigned" ? game.user.character : await fromUuid(draft.actorBinding);
        if (draft.actorBinding !== "none" && !actor && draft.mode !== "manifestation") throw new Error("The configured actor could not be found.");
        const labels = { criticalSuccess: "Critical success", success: "Success", failure: "Failure", criticalFailure: "Critical failure" };
        const context = { actor, ...studioTarget(), ...(draft.mode === "summon" ? { summon: studioExampleSummon(draft.summon) } : {}), ...(draft.mode === "result" ? { resultLabel: labels[result.previewOutcome], resultText: draft.results[result.previewOutcome] } : {}) };
        await ChatMessage.create({ speaker: actor ? ChatMessage.getSpeaker({ actor }) : ChatMessage.getSpeaker(), whisper: [game.user.id], content: studioRenderCard(draft, context) });
        ui.notifications.info("Sent a whispered test card. Test messages remain in chat until removed.");
      } catch (error) { ui.notifications.error(`Could not post a test card: ${error.message}`); }
      continue;
    }
    if (result.action === "create") {
      if (loadedId) draft.id = studioId();
      const data = studioMacroData(draft);
      try {
        const MacroClass = CONFIG.Macro?.documentClass ?? globalThis.Macro;
        if (!MacroClass) throw new Error("Foundry's Macro document class is unavailable.");
        const created = await MacroClass.create(data);
        if (!created) throw new Error("Foundry did not create the macro.");
        ui.notifications.info(`Created macro: ${created.name}`);
        return;
      } catch (error) { ui.notifications.error(`Could not create macro: ${error.message}. You can download JSON or show the script instead.`); continue; }
    }
    if (result.action === "update") {
      const macro = game.macros.get(loadedId);
      const meta = macro?.flags?.world?.[STUDIO_FLAG];
      if (!macro || !meta) { ui.notifications.warn("Load a generated macro before updating it."); continue; }
      if (!studioCommandMatches(macro.command, meta.commandHash)) {
        ui.notifications.warn("The generated script was manually changed. Create a new macro instead of overwriting those changes."); continue;
      }
      try {
        const data = studioMacroData(draft);
        await macro.update({ name: data.name, img: data.img, command: data.command, [`flags.world.${STUDIO_FLAG}`]: data.flags.world[STUDIO_FLAG] });
        ui.notifications.info(`Updated macro: ${macro.name}`);
        return;
      } catch (error) { ui.notifications.error(`Could not update macro: ${error.message}`); continue; }
    }
    if (result.action === "download") {
      const data = studioMacroData(draft);
      try {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url; link.download = `${draft.name.replace(/[^a-z0-9_-]+/gi, "-") || "card-macro"}.json`;
        document.body.append(link); link.click(); link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        ui.notifications.info("Downloaded the macro JSON.");
      } catch (error) { await studioShowText("Macro JSON", JSON.stringify(data, null, 2)); }
      continue;
    }
    if (result.action === "source") { await studioShowText("Generated Macro Script", studioGeneratedSource(draft)); continue; }
  }
}

await studioOpen();
