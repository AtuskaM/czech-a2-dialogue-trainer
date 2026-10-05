# Project instructions

- This is a speaking trainer. Keep answers microphone-based; do not add a writing input.
- Preserve the teacher-revised wording and branches in dialogues 1–3 unless the user requests corrections.
- Expand each supplied source conversation into contextual answer variants and clarification loops using [the authoring process](docs/DIALOGUE_AUTHORING.md). Apply this process to the planned 45 additional dialogues.
- Keep teacher review notes and implementation instructions out of the student interface.
- Follow the supplied materials and their original numbering. Keep the supplied PDF local.
- Complete content and interaction work before the final visual redesign.
- Run catalog validation and the route, session, speech and interface regression tests after changes to dialogue behavior.
- Correctness means a contextually valid conversational move, including refusal, objection, clarification and mixed intentions. Accepted speech must receive positive feedback and credit on the same basis as the source answer. Preserve the word-by-word model comparison requested by the user; label it as wording similarity, independent of correctness and points.
- Do not change the visual design during dialogue expansion. Add content and necessary matching/coverage tests only, unless the user requests a particular interface change.
- Before implementing each new dialogue, inventory its intentions and next replies. Author at least ten distinct acceptable formulations per open prompt across its reasonable intentions, then test additional unseen paraphrases, negation and combined answers. Do not satisfy this by adding ten cosmetic versions of one answer.
- Apply the acceptance checklist in docs/DIALOGUE_AUTHORING.md and keep a per-dialogue coverage record like docs/DIALOGUE_4_5_COVERAGE.md. A model-example test alone is insufficient.
