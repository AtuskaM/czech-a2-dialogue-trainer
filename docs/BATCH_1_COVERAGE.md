# Batch 1 — dialogues 6–10

Implemented from the teacher's supplied collection, pages 6–8. Language and added branches await classroom/teacher review. The trainer now contains ten dialogues; the next content batch is 11–15. No visual redesign is part of this batch.

## Source and adaptation record

| Dialogue | Source facts preserved | Added conversational coverage |
|---|---|---|
| 6 — Úřad, řidičský průkaz, varianta 2 | Lost old licence; completed application; no supplied photo needed; identification; three weeks/200 Kč or five days/700 Kč; card payment | Help at opening, old licence found, missing identification, document/form clarification, service choice with price/payment questions, standard or express, deferral, collection, payment trouble. The tested service/payment sections are reused from dialogue 5 without changing dialogue 5. |
| 7 — Lékárna, varianta 1 | Sore throat; cough/runny nose question; spray 140 Kč, syrup 80 Kč, dissolvable tablets 200 Kč; source spray instructions; card payment | Other symptom descriptions, no additional symptoms, product comparison, cheaper option, refusal and changed selection, allergy/other-medicine discussion, usage and eating questions, card/cash questions, wrong amount checks, receipt/farewell. |
| 8 — Lékárna, varianta 2 | Cold/sore throat; fever/cough distinction; dry cough/drops vs productive cough/tablets; drops 120 Kč; optional vitamins | Uncertain symptoms and cough type, neither symptom, fever consultation branch, no cough medicine, questions on use, refusal, add/decline vitamins, vitamin-only checkout, payment and farewell. |
| 9 — Lékař, objednání | Preventive appointment; Tuesday/Wednesday/Thursday afternoons; Wednesday 13:30; eating permitted before this appointment, blood tests later | Symptom consultation, choice/refusal/change of day, another time, numeric/spoken time, food or documents question combined with day choice, confirmation and farewell. Tuesday and Thursday at 13:30 and the document reminder are authored additions. |
| 10 — Lékař, změna termínu | Original 14 April afternoon; source persona Lucie Nováková; one week later unavailable; proposed 14 May; calendar check and acceptance | Unknown/different original date, name clarification, another name, alternative date proposal, declined new date, keep original booking, cancellation, repeat date and time query. No time for 14 May is invented: it is explicitly left for separate confirmation. |

The PDF supplies illustrative pharmacy and office conversations. These are language-practice scenarios, not current medical or administrative guidance. No new drug-specific doses were invented. The source spray instructions are retained only for that unnamed source product. Syrup/tablet dosages, tablet prices and vitamin prices absent from the PDF are not guessed: those branches refer to the product leaflet/pack. No real personal information is requested for the source persona.

## Intention coverage and progression

Every authored main open prompt is tagged `openPrompt`. Its response set contains at least ten distinct meaningful examples, excluding generic repeat/exit replies from the count. Each intention has its own response and next reply, with local concept combinations where appropriate. The files contain the complete wording banks and translations.

Questions receive information before commitment. Refusing a product opens alternatives. Saying that no extra vitamins are wanted proceeds with the selected medicine. A card-payment question does not count as completed payment. An incompatible appointment value requests another choice instead of being confirmed merely because the sentence contains “ano”. Day-specific appointment branches retain the chosen day when answering a food or document question.

Unknown replies repeat the current decision. Clarification branches retain their choices and have exits. Valid replies earn positive feedback and one point the first time their scoring group is answered. Loops share credit where they repeat the same question.

## Dates and times

Dialogue 10 separates relative next-week requests from specific proposed dates. Specific dates receive a calendar-based offer; proposing 14 May leads to confirmation of that available date. Calling later is a valid, credited choice throughout scheduling and cancellation clarification, and explicitly leaves the original booking unchanged. It never silently cancels or confirms a new appointment. Regression coverage is in `tests/reschedule.test.js`.

The trainer loads `content/lekar-zmena-terminu.js` directly from `index.html`, not a JSON copy. Add each new answer to the response set for the question where it can be spoken, with the appropriate next reply. An example added only to cancellation confirmation is not available at an earlier scheduling question.

`engine/slots.js` is used only where a response declares a `slots` rule. It recognizes numeric and spoken dates and times used by this batch: `14.4.`, `14/4`, `čtrnáctého dubna`, `14. května`, `13:30`, `13.30`, `ve třináct třicet`, `v jednu třicet` and `v půl druhé`. The afternoon context maps the last two to 13:30. Different explicit values have clarification routes. Date values are day/month because the supplied scenario does not specify a year. This is not a general natural-language calendar parser.

## Verification

- `tests/batch-1.test.js`: held-out phrases with expected next reply and positive credit; ten-example coverage; two complete conversations per dialogue; dates/times; wrong payments; unaccented copies of authored responses.
- `tests/engine.test.js`: all ten dialogues' structural validity and every authored model response's route, including generated repeats.
- `tests/app.test.js`: speech-result callback displays feedback and updates points for all ten dialogues; restored word comparison remains independent from acceptance and points.
- `scripts/audit-batch.js`: human-readable inventory of structural errors, insufficient example counts and model-route mismatches for batch 1.
- Word comparison uses the existing presentation and styles. No CSS, visual layout, writing input or new student-facing teacher notes were added.

Follow `DIALOGUE_AUTHORING.md` for batch 2, retaining the word comparison as requested on 5 October 2026. Keep implementation/review notes in this documentation rather than the student interface.
