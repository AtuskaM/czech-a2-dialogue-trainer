# Czech A2 Dialogue Trainer

An interactive, browser-based tool for practicing spoken Czech dialogues 
for the **A2 exam for permanent residency in the Czech Republic** (Úloha 2 — mluvení).

## What it does

- Plays a Czech clerk/cashier/official speaking a question out loud
- Lets the student respond with their own voice
- Recognizes Czech speech and evaluates the answer
- Gives instant feedback: correct, natural alternative, or unclear
- Three difficulty levels: **Dumb** (Czech + English), **Easy** (Czech only), **Normal** (spoken only)

## Why

There are many Czech learning apps, but few let you practice the *oral exam format* 
where you must respond to a spoken question in real time. This tool simulates that 
situation, in the browser, offline, for free.

## How to use

1. Download `Dialogue_V3.html`
2. Open it in **Chrome**
3. Allow microphone access when asked
4. Choose a dialogue and a level, then start speaking

## Technical details

- Pure HTML/CSS/JavaScript — no server, no build step, no dependencies
- Uses the browser's built-in **Web Speech API** (Chrome required)
- All dialogues are stored in a simple JavaScript array inside the HTML file
- Easily extendable: add new dialogues by editing the `dialogues` array

## Status

Work in progress. Currently includes: Nádraží – slevová karta (varianta 1 & 2).
More dialogues from the A2 exam preparation set will be added over time.

## Author

Created by a Czech language teacher for their students.
