// Dialogue content only. See README.md for the schema.
globalThis.DialogueCatalog.push({
  "schemaVersion": 1,
  "id": "station-card-1",
  "title": "1. Nádraží – slevová karta",
  "clerkLabel": "Pokladní (Clerk)",
  "situation": "Jste u pokladny na nádraží a potřebujete si zařídit slevovou kartu na vlak.",
  "situationTranslation": "You are at the ticket counter at the train station and you need to arrange a discount card for the train.",
  "start": "q1",
  "nodes": {
    "q1": {
      "clerk": "Dobrý den. Co si přejete?",
      "translation": "Good day. What would you like?",
      "responses": [
        {
          "id": "correct",
          "intent": "request_discount_card",
          "examples": [
            "Dobrý den. Chci si zařídit slevovou kartu.",
            "Dobrý den. Chci si koupit slevovou kartu.",
            "Dobrý den. Přeji si zařídit slevovou kartu.",
            "Dobrý den. Potřebuji slevovou kartu.",
            "Dobrý den. Chtěl bych slevovou kartu.",
            "Dobrý den. Mám zájem o slevovou kartu.",
            "Dobrý den. Chci slevovou kartu na vlak.",
            "Dobrý den. Prosím vás, jednu slevovou kartu na vlak."
          ],
          "match": {
            "required": [
              "discount",
              "card"
            ],
            "forbidden": [
              "refuse"
            ]
          },
          "next": "q2",
          "kind": "correct",
          "reward": 1
        }
      ],
      "retry": {
        "clerk": "Nerozumím. Přejete si něco?",
        "translation": "I don't understand. Would you like something?",
        "next": "q2"
      }
    },
    "q2": {
      "clerk": "Dobře. Tady je formulář, musíte ho vyplnit. Pero máte tady.",
      "translation": "OK. Here is a form, you need to fill it in.",
      "responses": [
        {
          "id": "correct",
          "intent": "complete_form",
          "examples": [
            "Děkuju. Hotovo. Prosím.",
            "Děkuju, už je to hotové.",
            "Děkuju, tady to je.",
            "Děkuju, hned to vyplním.",
            "Dobře, děkuju. Tady je vyplněný formulář.",
            "Ano, už jsem to vyplnil."
          ],
          "match": {
            "anyOf": [
              "thanks",
              "formDone"
            ],
            "forbidden": [
              "refuse"
            ]
          },
          "next": "q3",
          "kind": "correct",
          "reward": 1
        }
      ],
      "retry": {
        "clerk": "Musíte vyplnit tento formulář. Rozumíte?",
        "translation": "You must fill in this form. Do you understand?",
        "next": "q3"
      }
    },
    "q3_ack": {
      "clerk": "Nevadí, tady za rohem je fotografická kabina, skočte si tam a vraťte se.",
      "translation": "No problem, there's a photo booth around the corner, run there and come back.",
      "mode": "acknowledgement",
      "autoSpeak": true,
      "responses": [
        {
          "id": "acknowledge",
          "intent": "acknowledge_photo_booth",
          "examples": [
            "Supr, děkuji.",
            "Dobře, děkuji.",
            "Ano, děkuji.",
            "Dobře, jdu tam.",
            "Děkuji, hned se vrátím.",
            "Tak to je supr, hned se vrátím.",
            "Fajn, děkuji."
          ],
          "match": {
            "acceptAny": true
          },
          "next": "q3",
          "kind": "correct",
          "reward": 0
        }
      ],
      "retry": {
        "clerk": "Nevadí, tady za rohem je fotografická kabina, skočte si tam a vraťte se.",
        "translation": "No problem, there's a photo booth around the corner, run there and come back.",
        "next": "q3"
      }
    },
    "q3": {
      "clerk": "Máte fotku?",
      "translation": "Do you have a photo?",
      "responses": [
        {
          "id": "correct",
          "intent": "provide_photo",
          "examples": [
            "Ano, tady je.",
            "Ano, tady prosím.",
            "Jistě, tady ji mám.",
            "Samozřejmě, tady je.",
            "Ano, mám ji tady.",
            "Ano, tady je moje fotka."
          ],
          "match": {
            "anyOf": [
              "yes",
              "havePhoto"
            ],
            "forbidden": [
              "noPhoto"
            ]
          },
          "next": "q4",
          "kind": "correct",
          "reward": 1
        },
        {
          "id": "alternative",
          "intent": "missing_photo",
          "examples": [
            "Ne, nemám.",
            "Bohužel nemám.",
            "Ježišmária, nemám.",
            "Nemám, promiňte."
          ],
          "match": {
            "required": [
              "noPhoto"
            ]
          },
          "next": "q3_ack",
          "kind": "alternative",
          "reward": 1
        }
      ],
      "retry": {
        "clerk": "Nerozumím. Potřebuju vaši fotografii. Máte ji?",
        "translation": "I don't understand. I need your photo. Do you have it?",
        "next": "q4"
      }
    },
    "q4": {
      "clerk": "Na jak dlouho si to chcete předplatit? Na jeden rok, dva, nebo tři?",
      "translation": "For how long do you want to subscribe? One year, two, or three?",
      "responses": [
        {
          "id": "correct",
          "intent": "choose_one_year",
          "examples": [
            "Na jeden rok, prosím.",
            "Jeden rok, prosím.",
            "Chtěl bych na jeden rok.",
            "Na rok, prosím.",
            "Stačí jeden rok."
          ],
          "match": {
            "required": [
              "oneYear"
            ],
            "forbidden": [
              "otherYears",
              "refuse"
            ]
          },
          "next": "q5",
          "kind": "correct",
          "reward": 1
        }
      ],
      "retry": {
        "clerk": "Na jak dlouho? Jeden rok, dva, nebo tři?",
        "translation": "For how long? One year, two, or three?",
        "next": "q5"
      }
    },
    "q5_ack": {
      "clerk": "740 korun, prosím.",
      "translation": "740 crowns, please.",
      "mode": "acknowledgement",
      "autoSpeak": true,
      "responses": [
        {
          "id": "acknowledge",
          "intent": "acknowledge_price",
          "examples": [
            "Aha, dobře.",
            "Dobře, děkuji.",
            "Aha, tady to je.",
            "Dobře. Tady prosím.",
            "Aha, děkuji."
          ],
          "match": {
            "acceptAny": true
          },
          "next": "q6a",
          "kind": "correct",
          "reward": 0
        }
      ],
      "retry": {
        "clerk": "740 korun, prosím.",
        "translation": "740 crowns, please.",
        "next": "q6a"
      }
    },
    "q5": {
      "clerk": "Tak to bude 740 korun.",
      "translation": "So that will be 740 crowns.",
      "responses": [
        {
          "id": "correct",
          "intent": "pay",
          "examples": [
            "Prosím, tady to je.",
            "Tady prosím.",
            "Tady máte.",
            "Tady je.",
            "Prosím."
          ],
          "match": {
            "anyOf": [
              "handOver",
              "please"
            ],
            "forbidden": [
              "price",
              "refuse"
            ]
          },
          "next": "q6a",
          "kind": "correct",
          "reward": 1
        },
        {
          "id": "alternative",
          "intent": "ask_price",
          "examples": [
            "Kolik?",
            "Kolik to stojí?",
            "Kolik to bude stát?",
            "Prosím? Kolik?"
          ],
          "match": {
            "required": [
              "price"
            ]
          },
          "next": "q5_ack",
          "kind": "alternative",
          "reward": 1
        }
      ],
      "retry": {
        "clerk": "Tak to bude 740 korun. Rozumíte?",
        "translation": "So that will be 740 crowns. Do you understand?",
        "next": "q6a"
      }
    },
    "q6a": {
      "clerk": "Děkuji. 740 korun. A tady je vaše slevová karta.",
      "translation": "Thank you. 740 crowns. And here is your discount card.",
      "responses": [
        {
          "id": "correct",
          "intent": "say_goodbye",
          "examples": [
            "Děkuji. Na shledanou.",
            "Děkuji, na shledanou.",
            "Díky. Na shledanou.",
            "Děkuji mockrát. Na shledanou.",
            "Děkuju. Na shledanou."
          ],
          "match": {
            "required": [
              "goodbye"
            ],
            "optional": [
              "thanks"
            ]
          },
          "next": null,
          "kind": "correct",
          "reward": 1
        }
      ],
      "retry": {
        "clerk": "Tady je vaše karta. Děkuji. Na shledanou.",
        "translation": "Here is your card. Thank you. Goodbye.",
        "next": null
      }
    }
  }
});
