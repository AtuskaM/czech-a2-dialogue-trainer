# Expanding a source dialogue into speaking practice

The teacher's source gives one example path. It is a starting point, not a list of the only acceptable sentences. Dialogues 4 and 5 demonstrate the expansion process; repeat it for source dialogues 6–50 in the expansion catalog. Dialogues 1–3 retain their reviewed wording and branches.

## Process

1. Read the source situation and identify the communicative goal, essential information, decisions and ending. Keep source facts separate from added teaching material. Prices and administrative details are fictional practice examples.
2. For every question, list plausible intentions: the expected answer, another offered choice, refusal, uncertainty, missing information, a related question, a request for help, and a request to repeat. Include polite and short replies, synonyms, gender forms, and answers without diacritics. For each open prompt, author at least ten distinct acceptable formulations across these intentions. Ten cosmetic rewrites of one answer do not meet this requirement. Particularly broad intentions may each need ten or more variants.
3. Define local concepts and contextual combinations with `patterns`. An example sentence illustrates an intention; it does not define its entire vocabulary. For example, a glasses repair request combines a repair concept (including `spravit`) with the glasses object. Challenges such as `Skutečně nejdou opravit?` and `Nemůžete je přece jenom opravit?` belong to a repair-objection intention in the relevant context.
4. Distinguish contradictory meanings explicitly. Use forbidden concepts, allowed amounts and scoped positive choices where needed. Test `Nechci denní, chci měsíční` separately from a request for daily lenses. Do not globally treat different numbers, choices or opposite meanings as synonyms.
5. Add a meaningful response and route for each intention. A clarification explains the current issue, then offers the original decisions. A brief acknowledgement returns to the pending question. An actionable answer given during clarification can continue directly. Repeated objections can lead to a clearer choice prompt.
6. Use `ConversationTools.clarify`, `rejoin` and `repeatSupport` to retain choices and exits. Keep response arrays independent. Unknown answers should lead to a contextual retry or clarification after repeated failures, never silently select an option for the learner. Every loop must have a usable exit.
7. Keep student feedback concise: show the recognized answer once, one acceptance/retry message, and an example expressing the matched intention when useful. Keep the requested word-by-word comparison and wording-similarity percentage visible. Explain that different wording can still be correct; similarity never changes acceptance or points. Give every accepted intention the same credit, including objections and refusals. Keep the interaction speech-only and review notes in documentation/metadata.
8. Add held-out route tests, using phrasing different from the model examples. Cover synonym requests, questions, acknowledgements, refusals, negation, wrong values and conflicting choices. Test complete conversations through clarification and return loops, plus the speech-to-visible-feedback pipeline. Verify repeated routes do not award points repeatedly.
9. Run validation and all regression tests. Review intentional cycle warnings. Ask the teacher to review Czech naturalness, A2 suitability, translations and added branches; retain pending metadata until approval. Trial spoken answers on students' devices and add fixtures for reported misses.

## Coverage and limits

Aim to cover the reasonable intentions within the situation, with multiple ways of expressing each. No finite deterministic phrase matcher can enumerate every Czech sentence. An unfamiliar or ambiguous answer must receive a helpful clarification rather than a guessed route. Classroom reports should improve contextual rules and regression examples together.

Use `tests/conversation.test.js` for expanded-route examples, `tests/engine.test.js` for catalog and scoring checks, and `tests/app.test.js` plus `tests/speech.test.js` for feedback and speech lifecycle checks. The shared helpers live in `content/conversation-tools.js`; dialogue-specific concepts belong in each dialogue file.

## Required design record before implementation

Create a coverage table for each dialogue with one row per conversational stage. Record the Czech prompt, whether it is open, each reasonable intention, the information that must be present, incompatible meanings, the clerk's immediate response, the next node, and its scoring group. List the minimum ten varied formulations beneath each open prompt. Separately record held-out examples that were not used to define the rules. See `DIALOGUE_4_5_COVERAGE.md` for the current stage inventory.

The original PDF determines the situation and baseline facts. It does not restrict what the learner may say to one model sentence. Clearly distinguish source facts, dictionary-supported vocabulary, and newly authored branches. Research ordinary contemporary Czech; do not copy irrelevant historical dictionary meanings into a synonym list. These are communicative practice rules, not official exam grading criteria.

## Matching contract

- A response has an intention, `examples`, `match`, an immediate `next` reply and `reward: 1`. Every model example must route to that response's destination. Only genuinely equivalent answers share an intention.
- `required` and `anyOf` describe positive evidence. Each `patterns` group is a conjunction of concepts; groups are alternatives. Use these combinations to support word order and intervening polite wording instead of collecting complete sentences alone.
- `forbidden` prevents incompatible meanings. Use `positiveConcepts` for choices that must actually be affirmed: negative mentions of an alternative do not forbid the chosen option. Keep diacritics-independent tests and punctuation-free speech variants. A historical preference such as “Nechtěla jsem…, ale…” is not necessarily a present refusal.
- `allowedAmounts` applies to actual amount-sensitive commitments. Asking a price is a valid question, not an incorrect payment. Future dialogue batches need dedicated time, date, decimal and contact parsers as listed in the roadmap.
- Default response `priority` is zero. Explicit information or mixed-intention routes can take precedence over generic acceptance. Use priority only where the next clerk response resolves the learner's expressed need; add a contrast test proving it does not override a refusal. Among equal-priority matches, specificity chooses the route; equal-strength different destinations request clarification.
- Do not let an exact model phrase embedded in a longer sentence override a conflicting choice. Do not turn all unknown replies into accepted answers. A missing rule is a request for clearer wording, not proof the learner's Czech is incorrect.

## Combined intentions and continuity

When a learner accepts and asks a question, answer the question before requesting the next decision. For example, “Dobře, koupím si nové. Kolik stojí?” goes to a price reply; “Chci expresní, kolik zaplatím?” goes to the express price and confirmation. A question about card payment does not count as having paid. A refusal of new glasses opens discussion of alternatives; it does not mean the learner has left the shop. Only an explicit departure ends that visit.

If the answer contains information that the next prompt would otherwise request, provide a combined route or carry explicit state for it. Do not silently discard one clause. If state is needed in a future dialogue, define its lifecycle, reset behavior and tests before adding it; the present trainer uses explicit nodes rather than arbitrary remembered facts.

Clarifications retain original choices. An acknowledgement returns to the pending decision, while an actionable answer continues directly. Each repeat/clarification node shares `creditKey` with its source question, so looping cannot create extra points. Every valid move still gets positive feedback. A first accepted move earns one point; revisiting the same scoring group earns no additional points and explains that credit was already awarded.

## Required acceptance checks

1. Every authored model sentence: accepted, correct next reply, no structural errors. Include accents and unaccented copies of the expanded content.
2. Each open prompt: at least ten distinct meaningful formulations and an explicit inventory of the relevant intentions. Count a phrase once; repeat requests cannot inflate the count.
3. Each intention: at least two held-out valid formulations, including short/context-dependent forms where natural. For choices, add negated alternatives and incompatible alternatives. For amounts, test correct and wrong values.
4. Each open stage: test acceptance plus a question, refusal plus a question, reluctant acceptance, uncertainty, and repeat/help requests where relevant. Verify the clerk actually answers the question.
5. At least two full sessions per dialogue: the baseline and an alternative path with clarification/rejoining. Assert completion, zero unintended skips, and no duplicate credit after returning to a question.
6. Interface tests through the speech-result callback: recognized answer visible once, positive feedback for each valid intention, expected points, usable Continue, and a separate word-comparison display that never changes correctness. A correct matcher route alone does not pass this gate.
7. Validate reachability, exits and translations. Review cycles as intentional conversation loops. Maintain pending teacher-review metadata until the teacher approves the new language; keep these notes out of student screens.
8. Test real microphone behavior with students. Automated speech mocks verify the app's response to transcripts, not a browser recognizer's ability to hear every speaker. Turn reported failures into fixtures before changing the rules.

Run `npm run validate` and `npm test`. In restricted environments use `node --test --test-isolation=none tests/engine.test.js tests/conversation.test.js tests/meaning.test.js tests/app.test.js tests/speech.test.js`.

## Research basis for this revision

- The teacher's supplied collection provides dialogues 4 (page 5) and 5 (page 6), their situations and practice facts.
- The Ústav pro jazyk český [SSJČ entry for opraviti](https://ssjc.ujc.cas.cz/search.php?heslo=opraviti&sti=51588) explicitly associates repair of a damaged object with `spravit`. This supports the repair synonym; it does not certify every newly authored sentence.
- The NPI [model speaking task](https://cestina-pro-cizince.cz/trvaly-pobyt/a2/en/priprava-na-zkousku/modelovy-test/?sekce=mluveni&uloha=2) supplies situational response practice, including the lost-licence scenario. It was consulted for the communicative setting, not copied as current fees, rules or scoring. The teacher's requested wider conversational coverage remains the implementation requirement.
- All additional variants and clerk replies in `content/expanded-intents.js` are authored adaptations awaiting teacher language/classroom review.

## Expansion order

Follow `docs/expansion-catalog.json` and the nine batches in `ROADMAP.md`. Implement tested handling for new dates, times, units, larger amounts and contact formats before the relevant batch. Complete the content expansion and interaction review before the final visual design phase.

Batch 1 (6–10) is implemented; see BATCH_1_COVERAGE.md. Continue with batch 2 (11–15). Do not change the visual design during content expansion.
