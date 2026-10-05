# Dialogues 4 and 5: conversational coverage

This inventory records the expanded design, not teacher approval. `content/expanded-intents.js` holds the new response banks; the dialogue files supply the baseline and earlier branches. `tests/meaning.test.js` contains the reported phrases and additional formulations, with the required next reply and credit. The interface regressions verify the learner sees a correct result.

## Dialogue 4 — optician

| Stage | Valid intentions and immediate response |
|---|---|
| Opening | Request repair using opravit/spravit, describe broken glasses, ask for new glasses, request repetition. |
| Repair impossible | Challenge/ask why → explanation; refuse new glasses → discuss alternatives; accept/reluctantly accept → budget; ask price (alone or with acceptance) → prices; ask selection → show options; request lenses → prescription; explicitly leave → farewell. |
| Prescription | Present prescription, give known strength, report missing/forgotten prescription or unknown values, ask what the terms mean. |
| Eye test | Agree, ask how it works, postpone/refuse; explanation rejoins the decision. |
| Lens selection | Daily/monthly choice, change to glasses, ask difference or prices, ask advice when uncertain. Negated alternatives do not count as selected. |
| Lens order | Order, ask availability, switch to glasses, decline order/discuss alternatives. |
| Budget | Source budgets, other amounts, insufficient money, cheapest option, uncertainty; offer affordable frames or return later. |
| Frame choice | Black/brown, try both, ask price, ask advice/other colors, explicitly leave. |
| Fit | Good fit, tight/larger, loose/smaller; allow short descriptions such as “Jsou akorát.” |
| Order | Confirm, ask collection details, decline/postpone; finish with farewell. |

The repair-impossible prompt has separate banks with at least ten examples for objections, refusal, acceptance, price, selection and contact-lens alternatives. They include every wording reported by the teacher, masculine/feminine reluctant acceptance and combined acceptance/price questions. The price route does not place an order.

Repair explanation, alternatives and price discussion share one scoring group. A valid objection receives the same initial credit as agreement. Subsequent valid discussion remains positively assessed without repeated credit for that stage.

## Dialogue 5 — lost driving licence

| Stage | Valid intentions and immediate response |
|---|---|
| Opening | Lost/stolen/missing licence or duplicate request; clarify an unspecified document. |
| Identity | Show either document, say one is missing but the other available, report neither available, ask what is needed. |
| Missing identity | Fetch identification or return another day. |
| Form | Complete it, ask where to sign/what to write, request help/pen, report incomplete form, ask whether to bring a photo. |
| Photo | Accept, request another, ask instructions, object to being photographed/offer own photo; explain the scenario and ask whether to continue. |
| Timing and service | Standard, express, reluctant acceptance, price inquiry for either service, combined choice/price question, uncertainty/advice, defer the application. |
| Targeted price offer | Confirm that service, choose the other, ask further questions or defer. |
| Payment | State payment, ask about card/cash facilities, ask collection details, report inability to pay now, change service. |
| Ending | Confirmed payment → receipt and collection reminder → farewell. |

Both service choices have at least ten authored formulations, as do targeted price inquiries, deferral and advice. Identity accepts “Občanku nemám, ale mám pas” without confusing the missing document with the available one. Asking how to pay does not complete payment.

## Verification and known scope

- The 17 main open prompts are checked for at least ten distinct examples each. This count is a floor, not proof of complete natural-language coverage.
- All model examples are tested against their authored destinations. Held-out tests assert acceptance, one point on first visit and the expected reply; interface tests verify that the restored model-word comparison does not change acceptance or points.
- Structural validation checks exits and translations. Speech remains microphone-only; automated tests provide transcripts through the speech callback.
- New variants remain pending teacher review. The next batches must add held-out cases for every new intention and preserve this full acceptance-to-feedback contract.
