# Comic Transcript Style Guide

This guide defines the house style for comic-page alt text and transcripts. Its purpose is to keep the archive accurate, readable, and consistent even when many people or agents work on it.

The central rule is simple:

> The alt text is a concise overview. The transcript is a transcription with necessary visual description, not a synopsis.

Every legible, story-bearing word on the page should appear in the transcript. The transcript should also describe the actions and visual information needed to follow the story without seeing the image.

## Page file structure

Keep the existing YAML frontmatter. The relevant accessibility field is `alt`:

```yaml
---
title: '1.123 Example Title'
alt: 'Theresa pushes Chrystalline out of a turret’s line of fire and is struck across the back.'
date: '2009-01-01'
author: 'J Gray'
artist: 'Keira'
chapter: '1 More Heavens and Earths'
filler: false
---
```

After the closing `---`, leave one blank line and begin the transcript. Do not add a `Transcript`, `Description`, or other Markdown heading. The page template supplies the transcript title.

When a YAML value is enclosed in straight single quotes, a straight apostrophe inside it must be doubled. Curly apostrophes do not need YAML escaping.

## Transcript structure

### Multi-panel pages

Use a Markdown numbered list with one item for each actual panel, in reading order:

```markdown
1. Theresa raises her pistol while Chrystalline watches. “Ready?”
2. A red turret deploys from the ceiling with a *VTNNNNNNN!!!*
3. Theresa pushes Chrystalline aside with a *SHOVE!* “Go!”
```

Keep each panel in one list item. Do not make separate list items for speech balloons, captions, close views, or inset images that belong to the same panel.

Describe an inset inside its parent panel at the point where it is read:

```markdown
4. Chrystalline looks toward the door. In a circular close view, her expression tightens. “Someone is coming.”
```

### Single-panel and special pages

A true single-panel page, splash page, or cover uses unnumbered prose. A page composed as a document, character sheet, Tarot card, or set of photographs may use the structure that most clearly preserves its reading order. Do not force those pages into fictional panel divisions.

These are deliberate exceptions. An ordinary page with two or more panels always uses the numbered-list form.

## Order within a panel

Follow the intended reading order of the panel.

1. Give enough visual context to orient the reader.
2. Place dialogue, narration, written text, and sound effects where they occur in that sequence.
3. Describe the consequential action or reaction that follows.

Do not collect all dialogue at the end if doing so changes the apparent sequence. Do not describe the final state of the panel before the action that produces it.

## Dialogue

Integrate dialogue into the visual description as natural prose. When the immediately preceding action clearly identifies one character as the speaker, give the quotation without another label:

```markdown
Theresa rubs her forehead. “Fine. Whatever.”
Chrystalline folds her arms. “I am capable of independent movement, you know.”
The Surgeon raises one metal hand. “[REPLY] Affirmative.”
```

This is the preferred form. The action and the quotation belong to the same character, so repeating the name would make the transcript mechanical.

Omit the label only when the speaker is unmistakable. The identifying action must be in the same panel item, immediately before the quotation, and must not introduce another plausible speaker between the character and the line.

When the visual action does not establish the speaker, use a natural prose attribution. Choose a verb that either clarifies the exchange or conveys meaningful delivery:

```markdown
Theresa asks, “Are you certain?”
Chrystalline replies, “Yes.”
William calls from off panel, “Aye.”
An unidentified voice asks, “Who goes there?”
```

Use plain `says` when attribution is necessary but no special delivery needs to be conveyed. Do not add a speech verb when an adjacent action already does the work.

| Avoid | Use |
| --- | --- |
| `Theresa rubs her forehead. Theresa: “Fine.”` | `Theresa rubs her forehead. “Fine.”` |
| `Chrystalline looks up. Chrystalline says, “Wait.”` | `Chrystalline looks up. “Wait.”` |
| `She speaks. “Are you certain?”` when two women are present | `Theresa asks, “Are you certain?”` |
| `**Theresa:** Go!` | `Theresa shoves Chrystalline aside. “Go!”` |

Punctuation usually conveys whether a line is a question or exclamation. Do not write `asks` or `shouts` merely to restate `?` or `!` when the preceding action already identifies the speaker. Retain a delivery or location note when it communicates something important that the lettering and action do not:

```markdown
Theresa leans close and whispers, “Deep breath.”
William calls from off panel, “Aye.”
```

Attribute each speaking turn only as much as comprehension requires. Consecutive balloons from the same speaker are one turn and may be combined into one quotation without preserving decorative line wraps. Re-establish the speaker whenever another character intervenes or the attribution could become unclear.

Preserve the printed dialogue exactly, including its spelling, grammar, capitalization, punctuation, hesitation, and intentional errors. Do not silently repair lines such as `!GNAB`, unusual robot speech tags, or a character’s idiosyncratic wording.

Use full canonical names in descriptions and prose attributions. A nickname belongs in the transcript only when it is part of the printed dialogue.

## Narration, thoughts, and captions

Identify the owner of narration or thoughts whenever the page or surrounding sequence establishes one:

```markdown
Theresa narrates, “I didn’t leave a note.”
Theresa thinks, “Deep breath.”
```

Do not use `Caption:` when a character owns the caption. For a continuous run of captions by the same narrator, establish the narrator once and avoid repeating the attribution for every caption box when it remains unambiguous. Re-establish it after another voice, a scene change, or any possible ambiguity.

For an unowned time, place, or editorial caption, use natural prose:

```markdown
A caption reads “Later.”
The closing text reads “The End.”
```

Do not turn narration into dialogue, and do not infer a narrator when the owner is genuinely unknown.

## Sound effects and nonverbal vocalizations

Preserve the exact visible spelling, capitalization, spacing, and punctuation of a sound effect. Italicize it and connect it to its source or action:

```markdown
The robot strikes Chrystalline with a *THWOK!*
The wall falls inward with a *WHUMP!*
Theresa fires. *KA-BLAM!*
```

Do not use `Sound effect:`, quotation marks around the sound, or bare unformatted capitals:

| Avoid | Use |
| --- | --- |
| `Sound effect: “THUD!”` | `Chrystalline hits the floor with a *THUD!*` |
| `The door opens with a “CREEEEAK.”` | `The door opens with a *CREEEEAK.*` |
| `Theresa strikes William. KA-WHAM!` | `Theresa strikes William with a *KA-WHAM!*` |

When the source cannot be established, say so rather than guessing:

```markdown
An unidentified source makes a *WHRRRR!*
```

Transcribe distinct sound effects in reading order. If one printed effect continues across several panels as a single sustained sound, describe it once when it begins unless a later change in spelling or intensity carries information.

Nonverbal vocalizations use the same italic treatment inside dialogue when the comic presents them as part of speech:

```markdown
Theresa bends over, struggling to catch her breath. “*Huff* Need to stop... *huff*”
```

Markdown italics inside dialogue should reproduce emphasis that is visible in the comic. Do not add emphasis based on interpretation.

## Visual description

Write concise present-tense prose. Describe what changes the story, establishes the setting, identifies a character, conveys an important expression, or explains otherwise inaccessible action.

Prefer:

- canonical character and object names when known;
- direct verbs such as `fires`, `falls`, `grabs`, and `turns`;
- concrete spatial relationships when they matter;
- `a close view` rather than treating a close-up as a separate panel;
- colors when they identify a character, object, effect, or plot point;
- neutral, factual descriptions of bodies, disability, injury, intimacy, and violence.

Avoid:

- summarizing the page’s meaning instead of transcribing its events;
- inventing motives, causes, identities, or unseen actions;
- repeating dialogue in paraphrase;
- cataloguing decorative details that do not aid comprehension;
- `we see`, `the viewer sees`, or repeated phrases such as `the panel shows`;
- calling a known recurring character `the woman`, `the elf`, or `the jackal-headed man`;
- interpreting ordinary coloring as a glow, shield, smoke, or other effect without visual or contextual support.

Use `appears to` only for genuine visual uncertainty:

```markdown
Theresa appears to vault over the low cover and charges behind the robot.
```

Later pages may clarify the name or function of an object. Use that confirmed term when it makes the visible action clearer, but do not add future plot information unrelated to the image.

## Text embedded in the artwork

Transcribe story-bearing signs, labels, screens, notes, and background words in reading order:

```markdown
The station sign reads “GALAXRIA.”
The scanner displays “20 LBS threshold.”
```

Do not reproduce purely decorative credits, watermarks, or repeated page branding unless they are part of the joke or story.

For Mandrake and other symbol-based communication, describe the visible symbols in order. Do not invent a verbal translation that the page does not provide.

For a document-heavy page, introduce the object and then transcribe its headings and body in their natural order. Preserve meaningful paragraph divisions, but ignore arbitrary line wrapping caused by the artwork.

## Alt text

The `alt` field is not a second transcript. It should usually be one concise sentence describing the page’s central visual action or composition.

Good alt text:

- names the principal characters;
- states the main action or visual change;
- includes an important setting, object, or contrast when needed;
- avoids dialogue unless the visible wording is the page’s central point;
- does not begin with `Image of`, `Comic page showing`, or a filename;
- does not attempt to list every panel.

Example:

```yaml
alt: 'Theresa pushes Chrystalline out of a ceiling turret’s line of fire and is struck across the back.'
```

The transcript beneath that alt text still includes every panel, line of dialogue, and sound effect.

## Uncertainty and human review

Do not guess when a character, object, action, speaker, or word cannot be identified reliably.

- Use a stable neutral description for an unknown figure.
- Use `unidentified` for a voice or sound source.
- Use `appears to` for an ambiguous visible action.
- Mark illegible story text as `[illegible]` only after checking the original-resolution image.
- Ask the editor a specific question outside the Markdown file when an answer would materially improve the transcript.

Once the editor confirms an identity or term, use it consistently on that page and later relevant pages.

When a real person appears, descriptive prose should use their current name. If the artwork itself contains a former name, transcribe the visible text exactly and describe the context without editorializing.

## Final review checklist

Before considering a page complete, verify all of the following against the original-resolution image:

- The panel count and reading order are correct.
- Every legible dialogue balloon, caption, sign, label, and story-bearing background word is present.
- Every meaningful sound effect is present and spelled exactly as printed.
- Every quotation has a clear speaker or an explicit unknown-speaker label.
- Dialogue follows an unambiguous character action without a redundant label, or uses a natural prose attribution when one is needed.
- Speaker names, `says`, `asks`, and similar tags are not repeated when the adjacent action already makes the speaker obvious.
- Narration and thoughts identify their owner when known.
- Insets remain inside their parent panel item.
- Description states visible action rather than plot summary or unsupported interpretation.
- Known characters and recurring objects use their canonical names.
- The alt text is concise and does not duplicate the transcript.
- There is no redundant Markdown transcript heading.

## Complete house-style example

```markdown
1. A red turret deploys from the ceiling and powers up with a *VTNNNNNNN!!!*
2. The turret opens fire down the corridor. Theresa recoils. “Crap!”
3. Theresa pushes Chrystalline out of the line of fire with a *SHOVE!* “Go!”
4. Chrystalline falls low as Theresa runs past her through the turret fire.
5. A shot strikes Theresa across the back with a *SIZZLE!* “AAGH!”
6. Smoke rises from Theresa’s shirt as she collapses. “Son of a b...”
```

This example is compact, but it is not a summary. It preserves the sequence, all dialogue, the important visual action, and the distinct printed sounds.
