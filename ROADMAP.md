# Roadmap: 50 Czech A2 dialogues

## Scope and order

The catalog currently has ten dialogues. Batch 1 (6–10) is implemented; its coverage and adaptations are recorded in docs/BATCH_1_COVERAGE.md. The next batch is 11–15. Dialogues 1–3 have been revised by the teacher; dialogues 4–5 now have expanded answer variants and clarification loops and await teacher language/classroom review. Preserve reviewed Czech lines, translations and branching unless the teacher requests a correction. Answer-rule improvements are a separate review task, even for revised dialogues.

Implement the reliability and access improvements first. Finish teacher review of dialogues 4–5 next. Add another 45 dialogues in nine batches of five, bringing the catalog to 50. Make the full visual redesign the last phase, after the catalog and interaction patterns have settled.

This plan follows the teacher's supplied 28-page collection, **Úloha 2 – příklady dialogů**, dated 13 February 2023. Its contents list has exactly 50 dialogues: existing trainer entries 1–5 and the 45 additions numbered 6–50. The table of contents on PDF pages 2–3 supplies the exact title/page mapping recorded in [docs/expansion-catalog.json](docs/expansion-catalog.json). Keep the original order and numbering. The supplied PDF stays local and is excluded from Git; this plan does not reproduce the 45 scripts or publish the source file.

## Phase 1 — Reliable trainer (implemented in this change)

- Explicit phrase/concept rules decide acceptance; wording similarity is supplementary.
- Opposite meanings and conflicting choices are kept separate.
- Accessible controls, mobile layout, clear modes and microphone help.
- Speech-only answers, repeatable playback and explicit continuation.
- Per-dialogue scoring, no repeated rewards on return branches, preserved attempts when changing modes.
- Completed-run summaries saved locally, without transcripts or audio.
- Catalog validation, answer-route regression tests and automated checks.

Release gate: all existing examples retain their authored route; refusals, incompatible choices, amounts and retry behavior have regression coverage; browser checks pass; the teacher verifies newly active answer rules with student phrasing. Speech recognition and Czech voice playback also need a real-device check before classroom rollout.

## Phase 2 — Finish existing content review

Review dialogue 4 (optician, variant 2) and dialogue 5 (driving licence). Check Czech naturalness, A2 vocabulary, translations, clarification routes, exits from repeat loops, question/answer alignment and model answers. Treat all prices and administrative details as fictional practice unless verified against an identified current source. Keep pending status in teacher documentation and content metadata until the teacher approves them.

Audit the intent rules on all five dialogues using examples outside the model-answer set. Use contextual combinations of concepts and safe paraphrases, with clarification when meaning is uncertain. Follow [the reusable authoring process](docs/DIALOGUE_AUTHORING.md), demonstrated in dialogues 4–5. In particular check negation scope ("I do not have a prescription, but I have old glasses"), quoted alternatives, amounts, and requests to repeat.

## Phase 3 — Add 45 dialogues in batches

| Batch | Source/trainer IDs | Exact source situations | PDF pages |
|---|---|---|---|
| 1 | 6–10 | 6. Úřad – řidičský průkaz (varianta 2); 7. Lékárna (varianta 1); 8. Lékárna (varianta 2); 9. Lékař – objednání; 10. Lékař – změna termínu | 6–8 |
| 2 | 11–15 | 11. Lékař – nachlazení; 12. Zubař – ošetření; 13. Banka – otevření účtu; 14. Banka – výměna peněz; 15. Banka – zrušení účtu | 9–11 |
| 3 | 16–20 | 16. Pošta – poslání balíku; 17. Pošta – poslání dopisu; 18. Hotel – rezervace; 19. Cestovní kancelář – zájezd; 20. Divadlo – lístky | 11–13 |
| 4 | 21–25 | 21. Kino – lístky; 22. Knihovna – registrace; 23. Dopravní podnik – roční jízdenka; 24. Realitní kancelář – pronájem bytu (varianta 1); 25. Realitní kancelář – pronájem bytu (varianta 2) | 14–16 |
| 5 | 26–30 | 26. Realitní kancelář – nákup domu; 27. Obchod s obuví – nákup; 28. Obchod s oděvy – nákup (varianta 1); 29. Obchod s oděvy – nákup (varianta 2); 30. Obchod s oděvy – výměna | 16–18 |
| 6 | 31–35 | 31. Půjčovna oděvů; 32. Čistírna; 33. Květinářství – nákup; 34. Mobilní operátor – nákup tarifu; 35. Hospoda – oběd | 19–21 |
| 7 | 36–40 | 36. Restaurace – rezervace; 37. Opravna mobilních telefonů (varianta 1); 38. Opravna mobilních telefonů (varianta 2); 39. Opravna bot; 40. Hodinářství – oprava hodinek | 21–23 |
| 8 | 41–45 | 41. Instalatér – oprava WC; 42. Firma – hledání ředitele; 43. Ulice – hledání hotelu; 44. Škola – omluva syna; 45. Policie – ukradené auto | 24–26 |
| 9 | 46–50 | 46. Policie – ztráta peněženky; 47. OAMP – trvalý pobyt; 48. OAMP – zkouška z češtiny; 49. Úřad práce – hledání práce (varianta 1); 50. Úřad práce – hledání práce (varianta 2) | 26–28 |

All 45 entries are recorded with source number, exact title, page, batch, planned status, pending teacher review and pending answer fixtures. Source page numbering matches PDF page numbering. Before drafting each batch, add learning objectives and distinguish source dialogue lines from teacher-authored translations, retries, alternative paths and endings. Several source conversations stop without a farewell; any added ending requires teacher review. Preserve the first three already-revised trainer scripts rather than replacing them with verbatim source text.

The source introduces its prices and office instructions as illustrative examples. Retain that distinction in the adapted content. Health, banking and administrative situations are language practice, not current advice. Names, addresses and contacts should use clearly fictional practice data where interactive answers are needed.

The current normalizer is designed for the first five dialogues. The source expansion requires dedicated tested treatment of times/dates (9–10, 18–20, 36), decimals and units (11, 35, 37), amounts over 9,999 (24–26), letter sizes (29–30), and contact details/letter-number sequences (41–42, 45–46). Implement each parser before its batch, with fixtures distinguishing the source answer from a wrong value. Do not apply the current small-cardinal matcher to those formats unchanged.

### Workflow for every batch

1. Confirm the five source situations, source permissions, and the learning objective of each dialogue.
2. Draft one content file per dialogue: situation, Czech clerk lines, English translations, model replies, clarification and alternative branches, and an ending.
3. Author scoped meaning rules. Specify essential information and incompatible choices explicitly. Accept natural gender variants and polite short replies where appropriate.
4. Add answer fixtures before teacher review: accepted paraphrases, missing essential information, refusals, wrong numbers, opposite options and ambiguous choices.
5. Teacher reviews language and every branch. Mark a dialogue revised only after approval; newly authored content starts pending.
6. Validate the catalog and run all route tests. Trial the batch with students on desktop and phones, including accented Czech speech.
7. Release the approved batch, collect confusing-answer reports without recording students' audio, and fix rules before starting the next batch.

Do not use a fixed delivery date before the source materials and teacher review capacity are known. The first batch establishes the actual drafting/review effort; use that measured effort to schedule the other eight batches.

### Minimum acceptance criteria per new dialogue

- Clear A2 communicative goal and source/review metadata.
- All Czech turns and retry prompts have English translations.
- Every route is reachable and can reach an ending; intentional loops are documented.
- Every model example routes correctly; each intent has at least two additional valid paraphrases, two invalid or incomplete answers, and a conflicting-choice fixture where applicable.
- Refusals, amounts, dates, sizes and payment methods are checked by meaning rules, never by model-word overlap.
- A teacher can inspect the full conversation and approve it without editing engine code.
- Spoken interactions can complete the dialogue; replay, retry, hints and restart remain usable.

### Catalog work before the first expansion batch

Replace the hardcoded content script list with a single catalog manifest that includes stable ID, order, topic, source and review status. Keep a generated static browser bundle so GitHub Pages remains sufficient. Include only approved entries in the main learning catalog, with an explicit preview area for pending content. Add topic filtering when the catalog exceeds ten entries and a stable shareable dialogue link. These are planned expansion tasks, not implemented in this change.

## Phase 4 — Visual design (last)

Begin after the content batches and core interaction patterns are approved. Keep the functional accessibility/mobile fixes from phase 1; they are prerequisites, not the final redesign.

1. Establish a visual direction for adults preparing for Czech A2: calm, clear, welcoming, with restrained illustration and readable Czech typography.
2. Prepare two reviewable screen mockups: dialogue/topic selection and an active conversation including feedback. Cover 360 px mobile and desktop layouts.
3. Define consistent typography, spacing, colors, buttons, feedback states and speaker illustration style. Use local assets and retain visible keyboard focus, reduced-motion support and sufficient contrast.
4. Implement the approved direction across the complete 50-dialogue catalog, including help, feedback and completion summaries.
5. Validate mobile, keyboard and screen-reader navigation and observe students completing a dialogue. Release only after the design improves task clarity and maintains all engine tests.

Completion: 50 teacher-approved dialogues, reliable and explainable answer rules, usable speaking workflows, and a consistent visual design across desktop and mobile.
