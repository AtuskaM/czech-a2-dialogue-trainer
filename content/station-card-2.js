// Dialogue content only. See README.md for the schema.
globalThis.DialogueCatalog.push({
  "schemaVersion": 1,
  "id": "station-card-2",
  "title": "2. Nádraží – slevová karta (var. 2)",
  "clerkLabel": "Pokladní (Clerk)",
  "situation": "Jste u pokladny na nádraží a potřebujete si zařídit slevovou kartu na vlak.",
  "situationTranslation": "You are at the ticket counter at the train station and you need to arrange a discount card for the train.",
  "start": "q1",
  "nodes": {
    "q1": {
      "clerk": "Další, prosím!",
      "translation": "Next, please!",
      "responses": [
        {
          "id": "correct",
          "intent": "request_card_requirements",
          "examples": [
            "Dobrý den, já bych si chtěl zařídit slevovou kartu. Co na to potřebuju?",
            "Dobrý den, chtěl bych si zařídit slevovou kartu. Co k tomu potřebuju?",
            "Dobrý den, přeji si zařídit slevovou kartu. Co je potřeba?",
            "Dobrý den, chci si zařídit slevovou kartu. Co k tomu potřebuju?",
            "Dobrý den, mám zájem o slevovou kartu. Co k tomu potřebuju?"
          ],
          "match": {
            "required": [
              "discount",
              "card",
              "requirements"
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
        "clerk": "Prosím? Přejete si něco?",
        "translation": "Sorry? Would you like something?",
        "next": "q2"
      }
    },
    "q2_ack": {
      "clerk": "Fotka jako na pas.",
      "translation": "A photo like for a passport.",
      "mode": "acknowledgement",
      "autoSpeak": true,
      "responses": [
        {
          "id": "acknowledge",
          "intent": "acknowledge_photo_explanation",
          "examples": [
            "Aha, dobře. A kolik to stojí?",
            "Ano. A kolik to stojí?",
            "Dobře, děkuji. A kolik to bude stát?",
            "Aha, rozumím. A kolik to stojí?",
            "Dobře. A kolik to bude?"
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
        "clerk": "Fotka jako na pas.",
        "translation": "A photo like for a passport.",
        "next": "q3"
      }
    },
    "q2": {
      "clerk": "Musíte vyplnit tento formulář a přinést průkazové foto.",
      "translation": "You need to fill in this form and bring an ID photo.",
      "responses": [
        {
          "id": "correct",
          "intent": "ask_price",
          "examples": [
            "Aha, dobře. A kolik to stojí?",
            "Dobře, děkuji. A kolik to stojí?",
            "Dobře, rozumím. A kolik to bude stát?",
            "Aha, a kolik to stojí?",
            "Rozumím. A jaká je cena?"
          ],
          "match": {
            "required": [
              "price"
            ],
            "forbidden": [
              "photoQuestion"
            ]
          },
          "next": "q3",
          "kind": "correct",
          "reward": 1
        },
        {
          "id": "alternative",
          "intent": "clarify_id_photo",
          "examples": [
            "Nevím, co je to průkazové foto?",
            "Promiňte, co je průkazové foto?",
            "Co znamená průkazové foto?",
            "Jaké foto? Nerozumím."
          ],
          "match": {
            "required": [
              "photoQuestion"
            ]
          },
          "next": "q2_ack",
          "kind": "alternative",
          "reward": 1
        }
      ],
      "retry": {
        "clerk": "Nechcete vědět kolik to bude stát?",
        "translation": "Don't you want to know what it will cost",
        "next": "q3"
      }
    },
    "q3": {
      "clerk": "Poplatek za zřízení karty je 150 korun. Jak často jezdíte vlakem?",
      "translation": "The fee for issuing the card is 150 crowns. How often do you travel by train?",
      "responses": [
        {
          "id": "correct",
          "intent": "state_travel_frequency",
          "examples": [
            "Každý den dojíždím do práce.",
            "Jezdím vlakem každý den do práce.",
            "Dojíždím denně do práce.",
            "Dvakrát týdně.",
            "Třikrát týdně.",
            "Jednou týdně.",
            "Jednou měsíčně.",
            "Třikrát za měsíc.",
            "Pětkrát měsíčně.",
            "Každý den.",
            "Docela často."
          ],
          "match": {
            "required": [
              "frequency"
            ]
          },
          "next": "q4",
          "kind": "correct",
          "reward": 1
        }
      ],
      "retry": {
        "clerk": "Jak často jezdíte vlakem? Každý den, nebo méně?",
        "translation": "How often do you travel by train? Every day, or less?",
        "next": "q4"
      }
    },
    "q4": {
      "clerk": "Můžete si vybrat. Jestli chcete slevu 25 procent, zaplatíte 590 korun za rok, padesátiprocentní sleva je za 3590 korun ročně.",
      "translation": "You can choose. If you want a 25 percent discount, you'll pay 590 crowns per year; the fifty percent discount is 3590 crowns per year.",
      "responses": [
        {
          "id": "choice1",
          "intent": "choose_25_percent",
          "examples": [
            "Hm… Stačí 25 procent.",
            "25 procent.",
            "dvacet pět procent.",
            "25%, prosím.",
            "Stačí 25 procent, prosím.",
            "Vezmu 25 procent.",
            "Vezmu 25%.",
            "Chtěl bych 25 procent."
          ],
          "match": {
            "required": [
              "discount25"
            ],
            "forbidden": [
              "discount50",
              "refuse"
            ]
          },
          "next": "q4_25",
          "kind": "choice",
          "reward": 1
        },
        {
          "id": "choice2",
          "intent": "choose_50_percent",
          "examples": [
            "Prosím vás 50%",
            "50 procent.",
            "Potřebuji 50%.",
            "Potřebuji 50 procent.",
            "Chtěl bych 50 procent.",
            "Vezmu 50 procent.",
            "Padesát procent, prosím."
          ],
          "match": {
            "required": [
              "discount50"
            ],
            "forbidden": [
              "discount25",
              "refuse"
            ]
          },
          "next": "q4_50",
          "kind": "choice",
          "reward": 1
        }
      ],
      "retry": {
        "clerk": "Kolik procent? 25, nebo 50?",
        "translation": "How many percent? 25, or 50?",
        "next": "q4_25"
      }
    },
    "q4_25": {
      "clerk": "Tak to bude 740 korun a musíte platit hotově.",
      "translation": "So that will be 740 crowns, and you must pay in cash.",
      "responses": [
        {
          "id": "correct",
          "intent": "pay_740",
          "examples": [
            "Ano, tady to je.",
            "Ano, prosím, tady.",
            "Tady prosím.",
            "Tady máte.",
            "Prosím."
          ],
          "match": {
            "anyOf": [
              "handOver",
              "please"
            ],
            "forbidden": [
              "refuse"
            ]
          },
          "next": "q5",
          "kind": "correct",
          "reward": 1
        }
      ],
      "retry": {
        "clerk": "740 korun. Platíte hotově.",
        "translation": "740 crowns. You're paying in cash.",
        "next": "q5"
      }
    },
    "q4_50": {
      "clerk": "Tak to bude 3740 korun a musíte platit hotově.",
      "translation": "So that will be 3740 crowns, and you must pay in cash.",
      "responses": [
        {
          "id": "correct",
          "intent": "pay_3740",
          "examples": [
            "Ano, tady to je.",
            "Ano, prosím, tady.",
            "Tady prosím.",
            "Tady máte.",
            "Prosím."
          ],
          "match": {
            "anyOf": [
              "handOver",
              "please"
            ],
            "forbidden": [
              "refuse"
            ]
          },
          "next": "q5",
          "kind": "correct",
          "reward": 1
        }
      ],
      "retry": {
        "clerk": "3740 korun. Platíte hotově.",
        "translation": "3740 crowns. You're paying in cash.",
        "next": "q5"
      }
    },
    "q5": {
      "clerk": "Děkuji a kartu si můžete vyzvednout za měsíc.",
      "translation": "Thank you, and you can pick up the card in a month.",
      "responses": [
        {
          "id": "correct",
          "intent": "say_goodbye",
          "examples": [
            "Děkuji, na shledanou.",
            "Děkuju, na shledanou.",
            "Díky, na shledanou.",
            "Děkuji mockrát, na shledanou."
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
        "clerk": "Kartu si vyzvednete za měsíc. Děkuji, na shledanou.",
        "translation": "You'll pick up the card in a month. Thank you, goodbye.",
        "next": null
      }
    }
  }
});
