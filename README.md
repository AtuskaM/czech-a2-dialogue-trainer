# Czech A2 Dialogue Trainer

A static browser trainer for Czech A2 speaking practice: listen to a question, speak an answer, and receive feedback from explicit dialogue rules. It is a practice aid, not an official exam assessment, grammar checker or pronunciation evaluator.

[Published version](https://atuskam.github.io/czech-a2-dialogue-trainer/) · [Expansion and design roadmap](ROADMAP.md)

## Using the trainer

1. Choose one of the ten dialogues and a mode.
2. Choose **Play question**. Choose **Speak answer**, speak Czech, then choose **End answer**.
3. Read the feedback and retry or choose **Continue**.

**Guided** shows Czech with English translations. **Practice** shows Czech. **Exam** hides the question text until you request a hint. All modes are practice modes; their scores are not predictions of an exam result.

Speech recognition requires a supported browser such as Chrome, microphone permission, and possibly internet access. The browser/device must also provide Czech speech synthesis for reliable audio playback. If recognition fails, check site microphone permissions and your input device and retry speaking. The app explains permission, network and microphone errors, and lets you replay retry questions.

## Content status

Dialogues 1–3 have been teacher-revised. Dialogues 4–5 have expanded contextual answer rules and clarification branches and await teacher review; review status is kept in the teacher documentation and content metadata. The reviewed dialogue wording and routes are preserved; shared matching metadata is maintained in `content/matching-rules.js`, with the expanded dialogue 4–5 intentions in `content/expanded-intents.js`. Newly active rules on all five dialogues still require classroom verification.

See [ROADMAP.md](ROADMAP.md) for review of the remaining two, nine batches of five additional dialogues (45 new, 50 total), and the final visual design phase. The expansion follows the supplied 50-dialogue collection. Exact titles, pages and batches for entries 6–50 are recorded in `docs/expansion-catalog.json`; the source PDF stays local.

## Feedback and scoring

Acceptance is based on named concepts and whole phrase/token matching. Required concepts must all be present; alternative `patterns` combine concepts for contextual intentions; `anyOf` needs at least one; forbidden concepts reject incompatible answers. Optional `allowedAmounts` reject explicitly stated wrong amounts, including digit and common Czech cardinal forms. Acknowledgement nodes may explicitly accept any nonempty reply. Explicit contextual priority handles combined intentions; equal-strength rules pointing to different routes request clarification. Student feedback uses acceptance. The restored word-by-word comparison shows wording similarity separately and never determines correctness or points.

Matching is deterministic and conservative. It does not understand unrestricted Czech. A natural answer may require an additional phrase variant or a scoped concept rule. Do not make the matcher more permissive just to raise acceptance rates; add accepted and rejected examples for the intended meaning.

Each dialogue starts with 10 points. An accepted question earns its stated reward once, including on return branches. A hint costs 2 points once per question. After three unsuccessful attempts on a normal question, the app follows the authored retry route (a clarification loop in dialogues 4–5) and subtracts 1 point once; unsuccessful acknowledgements do not force an exit. Points cannot go below zero. Selecting another dialogue or restarting resets the run. Switching modes preserves attempts and the current phase. Runs with mode changes after answering are recorded as Mixed modes.

## Privacy and offline limits

The app stores completed-run summaries only: count, best/last points, accepted/skipped question counts and completion date. Storage is local to the browser; clearing site data removes it. No audio or answer transcripts are persisted by this app. Storage failures do not prevent practice.

The browser's speech recognition service may send audio to its provider. Recognition is not promised to work offline. All displayed artwork is local; the app no longer requests an external avatar. GitHub Pages serves the app, but there is no service worker or offline-install support. Speech behavior remains browser-dependent, including when running the downloaded project locally.

## Development

Plain HTML, CSS and JavaScript; no runtime dependencies or build step. Node.js 22 or later is sufficient for the development checks:

```sh
npm run validate
npm test
npm run serve
```

The local preview uses `http://127.0.0.1:4173`. Automated checks also run on GitHub pushes and pull requests. On environments that restrict test subprocesses, run `node --test --test-isolation=none tests/engine.test.js tests/conversation.test.js tests/meaning.test.js tests/app.test.js tests/speech.test.js`.

File layout:

- `content/`: dialogue scripts, shared concepts and matching/review metadata.
- `engine/text.js`: normalization and model wording comparison.
- `engine/matcher.js`: explicit answer-rule evaluation.
- `engine/session.js`: scoring, attempts and dialogue progression.
- `engine/speech.js`: recognition/playback lifecycle and cancellation.
- `engine/progress.js`: local completion summaries.
- `engine/validator.js`: schema, concepts and route validation.
- `app.js`: rendering and control wiring.
- `tests/`: content-route, scoring, persistence and speech regression checks.

## Authoring a dialogue

Use schema version 1 with a stable `id`, title, speaker label, Czech situation, English situation translation, `start` node and `nodes`. A node has `clerk`, `translation`, response options, and a translated `retry` prompt with an explicit next node. Endings use `next: null`.

Each response needs an ID, named intent, Czech model examples, matching rules, next node, `kind` (`correct`, `choice` or `alternative`) and finite nonnegative reward. Concepts are arrays of whole Czech phrase variants. A dialogue can define local concepts to avoid changing the meaning of another dialogue's rules. Reserve `acceptAny` for acknowledgement nodes.

Run validation and add route fixtures for every new answer: accepted paraphrases, missing information, refusals, wrong amounts and conflicting choices. Review any reported cycles; loops with exits are allowed but should be intentional. The tests currently exercise every existing model answer and its authored next route. The first expansion batch will introduce the manifest and broader content fixtures described in the roadmap.

The reusable expansion process is documented in [docs/DIALOGUE_AUTHORING.md](docs/DIALOGUE_AUTHORING.md) and referenced by project instructions in AGENTS.md. Dialogues 4–5 use contextual intentions, scoped choices and clarification loops through `content/conversation-tools.js` and `content/expanded-intents.js`. See [the coverage inventory](docs/DIALOGUE_4_5_COVERAGE.md). Every open prompt requires at least ten distinct acceptable formulations across its reasonable intentions. All valid moves receive positive feedback and equal first-visit credit; clarification loops share their source question's credit. `tests/meaning.test.js` checks reported and additional formulations against acceptance, points and the appropriate next reply.

Dialogues 6–10 are implemented from the supplied materials; see [batch 1 coverage](docs/BATCH_1_COVERAGE.md). The next batch is 11–15. Word comparison is retained at the teacher’s request; no visual redesign is included.
