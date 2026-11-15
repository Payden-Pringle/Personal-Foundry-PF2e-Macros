# Example macros

Each example includes a Foundry-importable `.json` and a matching readable `.js` script. Importing the JSON preserves the recipe, so Card Macro Studio can load and update it. To use the script instead, create a Script macro and paste its complete contents.

The examples use the running user's assigned character by default. Assign a character in Foundry or load the recipe in Card Macro Studio and select a specific owned actor. Artwork and transition paths are optional and start blank unless stated otherwise.

## Manifestation Spell Picker

Import [manifestation-spell-picker.json](manifestation-spell-picker.json). The picker uses the spellcasting entry's tradition for spells through rank 9 and the other traditions through rank 7. If no usable entry is available, it asks for the primary tradition and posts a descriptive spell card; resolve checks and heightening manually. An entry lets PF2e create a spell card using the actor's statistics.

Running this directly does not cast Manifestation or spend a slot. Optionally enable Toolbelt spell linking in the studio and attach the generated macro to Manifestation, following the [studio guide](../meta-macros/README.md#optional-pf2e-toolbelt-spell-linking).

## Summon a Creature

Import [summon-creature.json](summon-creature.json). Choose a supported summon spell, rank, creature, and Normal, Weak, or Elite. The picker searches accessible NPC compendiums and filters by supported traits and adjusted level. It uses the chosen creature's existing compendium art when available.

This posts a card only: it does not place a token or change the creature's statistics. Verify access and spell-specific restrictions. Toolbelt linking can supply a supported linked spell and cast rank.

## Congratulations! It's a Fish!

Import [recall-knowledge-fish.json](recall-knowledge-fish.json). Run it after a humorous Recall Knowledge result for a carnival-themed text card. It neither rolls nor judges the result. Use the studio to add optional artwork or an animated confetti overlay if desired.

## Dragon Form Transformation

Import [dragon-form-transformation.json](dragon-form-transformation.json). Its default effect is PF2e's Dragon Form spell effect at rank 6, and it refreshes the owned actor's matching token sizes on the current scene. Run it again on the original scene to restore its own effect and saved changes. PF2e may ask for an effect choice.

In the studio, adjust the effect rank, effect UUID, token art, portrait, transition, and timing for your character. Paths such as `path/to/your-token.webp` and `path/to/your-transition.webm` are examples: upload your media and enter its actual Foundry-accessible path. If a matching effect already exists, the macro keeps it and does not remove it. The macro does not automatically restore art or size when an effect expires.

Test this on a copied actor and scene. For an active or interrupted transformation, keep the same generated macro and return to the original scene before running it again to restore.
