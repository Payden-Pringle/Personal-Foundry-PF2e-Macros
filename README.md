# Personal Foundry PF2e Macros

I could've bothered to make this a Module for Foundry, but maybe we'll tackle that another time.

A collection of macros for **Foundry Virtual Tabletop** and the **Pathfinder Second Edition** game system. The initial focus is Card Macro Studio, a configurable macro that creates other macros for memorable chat cards, transformations, summons, and spell moments.

This is an **AI vibe-coded** project: AI helped design and write the code and documentation. Macros run JavaScript with your Foundry user's permissions, so read the code, test in a development world, and check the results before relying on them in a game.

## Repository layout

| Directory | Purpose |
| --- | --- |
| [meta-macros](meta-macros/) | Macros that build or configure other macros. Start here for **Card Macro Studio**. |
| [macros](macros/) | Ready-to-import examples: Manifestation, summoning, a Recall Knowledge joke, and a transformation. |
| [mini-macros](mini-macros/) | Reserved for reusable fragments intended to be inserted into other macros. Initially empty apart from Git's placeholder. |
| [scripts](scripts/) and [tests](tests/) | Rebuild scripts and automated checks for maintainers. |

## Quick start

1. In Foundry's **Macros** directory, create and save a new macro. Right-click it and select **Import Data**.
2. Import [card-macro-studio.json](meta-macros/card-macro-studio.json) and run **Card Macro Studio**. Alternatively, paste [card-macro-studio.js](meta-macros/card-macro-studio.js) into a Script macro.
3. Choose an optional preset, edit the card, and click **Create New**. Use the **?** button for the in-app tutorial.
4. Run the generated macro when the moment happens. Cards can be text-only, or use your own artwork and animated WebP/GIF overlays.

For a ready-made example, import one of the `.json` files in [macros](macros/) instead. The matching `.js` file is provided for reading or pasting as a Script macro. The importable examples retain studio settings for later editing; pasting only their JavaScript does not attach those settings.

See the [studio guide](meta-macros/README.md) for installation, use, the optional Toolbelt integration, and maintenance. The [example guide](macros/README.md) describes each included macro.

## Requirements and limitations

- Designed for Foundry VTT 14 and PF2e; behavior, compendium contents, and permissions can vary between versions and worlds. A user needs permission to run Script macros and, where applicable, modify actors, tokens, and effects.
- **PF2e Toolbelt is optional.** Its Spell Macro feature can link a generated macro to a spell's Cast action; see the [Toolbelt documentation](https://github.com/reonZ/pf2e-toolbelt/wiki/Actionable#spell-macro) and the studio guide. Standalone macros do not cast the originating spell or spend its slot.
- These cards do not automatically detect attacks, saves, or outcomes. The summon picker announces a creature but does not place it or apply Elite/Weak to its statistics. Check spell restrictions, rarity, and access with your GM.
- No personal images or URLs are included. Optional media fields are blank; provide Foundry-accessible paths such as `path/to/your-image.webp` or `path/to/your-transition.webm`. All viewers need access to shared media.
- Transformation and effect macros change game data. Test activation and restoration on a copy of an actor and scene first. Restoration depends on the saved state and permissions; it is not a general undo feature.

## Development

With Node.js available, run from the repository root:

```sh
node scripts/build-artifacts.cjs --check
node tests/card-macro-studio.test.cjs
node tests/artifacts.test.cjs
```

After modifying the studio or its example recipes, run `node scripts/build-artifacts.cjs` and commit the resulting `.js` and `.json` artifacts together. These tests use Foundry/PF2e test doubles; they do not replace testing in your own world.
