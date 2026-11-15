# Card Macro Studio

Card Macro Studio 1.3 builds self-contained Foundry VTT 14 / PF2e Script macros. It can create art-free cards, use optional artwork or an animated WebP/GIF overlay, and configure common spell, summon, effect, or transformation workflows. It does not create or upload media. See [the example macros](../macros/) for starting recipes.

## Initial setup

1. Create and save a macro in Foundry's **Macros** directory.
2. Right-click the macro, choose **Import Data**, and select [card-macro-studio.json](card-macro-studio.json). Alternatively, paste [card-macro-studio.js](card-macro-studio.js) into a Script macro.
3. Run the studio. Script execution, macro creation, compendium access, and actor/token updates are subject to the world's permissions.

The **?** in the studio's title bar opens an optional in-app tutorial. Expand a section to read it and close the help window to resume editing.

## Ongoing use

1. Optionally choose a preset and click **Apply preset**. This replaces its editable title, text, behavior, and theme; it does not add effects or media.
2. Choose a behavior and actor. **My assigned character** follows the current user. A specific actor is stored by UUID; select it again if transferring between worlds.
3. Edit the text, theme, colors, and optional illustration or overlay. Choose **None — text only** for an art-free card. Media must be available to the viewers through Foundry or an accessible URL.
4. Configure any outcome text, summon defaults, effect, art, or token transition needed by the behavior. The preview is approximate. **Test Card** posts a real whisper to you and leaves it in chat; it does not perform effects or test the full picker.
5. Click **Create New** or **Download JSON**. Both retain the recipe for later editing. **Show Script** provides runnable code but pasting it alone does not retain recipe metadata.

To edit a generated macro, select it at the top and click **Load settings**, then **Update Loaded** or **Create New**. The studio refuses to overwrite scripts manually changed outside it; create a new macro to preserve those edits. Existing arbitrary macros are not editable recipes.

Placeholders include `{actor}`, `{target}`, `{result}`, `{spell}`, `{spellRank}`, `{tradition}`, `{summon}`, `{summonLevel}`, `{summonSpell}`, `{summonRank}`, and `{summonAdjustment}`. `{target}` uses your first targeted token, which is separate from selecting a token.

### Behaviors

- **Chat card only:** post the configured card, including jokes or spell announcements.
- **Summon creature card:** choose a creature from accessible NPC compendiums, filtered by supported spell, rank, traits, and adjusted level. Common creatures are shown by default. Weak/Elite affects the card and filtering, not the actual creature or scene. Verify special restrictions and rarity.
- **Choose an outcome:** choose the result manually and post the corresponding text. It does not watch rolls.
- **Apply effect / changes once:** optionally apply an effect, refresh size, play a transition, and set art.
- **Transformation toggle:** apply configured changes on one run and attempt to restore them on the next. Existing matching effects are kept; interrupted transformations require the same macro and original scene for recovery.
- **Temporary token animation:** temporarily replace and restore token art.
- **Manifestation spell picker:** use the selected casting entry's tradition for spells through rank 9 and the other traditions through rank 7. If the actor or usable entry is unavailable, choose the primary tradition; the resulting descriptive card requires manual checks and heightening. The duplicated spell's effects are not applied automatically.

Token-changing modes can use all matching owned tokens on the viewed scene or only selected matching tokens. Other clients load token textures independently, so timing may differ. Card animation comes from the supplied animated media rather than inline CSS keyframes.

## Optional PF2e Toolbelt spell linking

1. A GM enables PF2e Toolbelt's **Spell Macro** feature. See its [documentation](https://github.com/reonZ/pf2e-toolbelt/wiki/Actionable#spell-macro).
2. In the studio, expand **PF2e Toolbelt spell linking**, select **Use this generated macro as a Toolbelt Spell Macro**, and create or update the generated macro.
3. Open the relevant spell on the actor's sheet, select **Details**, and drag the generated macro into the **Macro** drop area. The empty control may say “Drop Effect.”
4. Use that spell's **Cast** button. The linked actor, spell, casting entry, and options are used when available. Picker choices happen first; canceling a picker does not cast. After a choice, the macro resumes the original cast once. A transformation's return run restores it without casting again.

For supported linked summons, the spell and cast rank are supplied and locked when available. Unknown spells use the custom trait filter and require manual rule checks. Summon Lesser Servitor is supported through rank 4. The linked cast's message visibility is respected. Running the macro directly is standalone and does not spend a slot.

Some PF2e/Toolbelt callbacks provide no success signal if a cast fails, so a special card may still appear after an expended-slot warning. Check the original spell message and resource. End-to-end linking and resource consumption should be verified in your own world.

## Maintenance and architecture

The studio editor builds and validates a recipe, renders a preview, and generates a self-contained script. The generated document stores its recipe, version, and command hash under `flags.world.cardMacroStudio` for safe re-editing. A per-client lock prevents overlapping runs of the same recipe and actor; it is not a cross-client lock.

`studioRenderCard` renders escaped user text and validated media paths. The summon picker indexes accessible NPC compendiums and filters records; the Manifestation picker resolves a casting entry or asks for a tradition. The Toolbelt path forwards the original options and callback. Transformations store snapshots and effect markers on actors for best-effort recovery, and refresh token dimensions from PF2e's prepared actor size.

The list in `studioGeneratedSource` explicitly determines which helper functions are included in generated macros. When adding runtime helpers or fields, update defaults, editor controls, validation, the helper list, tests, and this guide. The in-app tutorial is maintained separately in `studioHelpContent` and is not included in generated macros. Previously generated macros need to be loaded and updated to receive runtime changes.

After changes, run from the repository root:

```sh
node scripts/build-artifacts.cjs
node scripts/build-artifacts.cjs --check
node tests/card-macro-studio.test.cjs
node tests/artifacts.test.cjs
```

The builder synchronizes the studio JSON and four example `.js`/`.json` pairs. Automated tests use doubles; also test changes in Foundry with appropriate permissions and current PF2e/Toolbelt versions.
