(function(root) {

// ============================================================
// SYNONYM GROUPS
// ============================================================
const synonyms = [
  ["chci","chtěl","chtěla","přeji","přeju"],
  ["potřebuji","potřebuju","potřeboval","potřebovala"],
  ["kartu","karta","karty"], ["vlak","vlakem","vlaku"],
  ["slevová","slevovou","slevové"], ["fotku","fotka","fotografii","fotografie"],
  ["děkuji","děkuju","díky"], ["ano","jo","jistě","samozřejmě"],
  ["rok","roky","roku"], ["jeden","jedna","jedno"], ["dva","dvě"],
  ["měsíc","měsíce","měsíců"], ["den","dny","dní"],
  ["korun","koruna","kč","koruny"], ["prosím","prosim"]
];

const synonymMap = {};
for (const group of synonyms) {
  const canonical = group[0];
  for (const word of group) synonymMap[word] = canonical;
}
function canonicalize(word) { return synonymMap[word] || word; }

// ============================================================
// NUMBER WORD CONVERTER (for Dumb/Easy levels)
// ============================================================
function numberToCzechWords(num) {
  const map = {
    0:"nula",1:"jeden",2:"dva",3:"tři",4:"čtyři",5:"pět",6:"šest",7:"sedm",8:"osm",9:"devět",
    10:"deset",11:"jedenáct",12:"dvanáct",13:"třináct",14:"čtrnáct",15:"patnáct",16:"šestnáct",
    17:"sedmnáct",18:"osmnáct",19:"devatenáct",20:"dvacet",30:"třicet",40:"čtyřicet",50:"padesát",
    60:"šedesát",70:"sedmdesát",80:"osmdesát",90:"devadesát",100:"sto",200:"dvě stě",300:"tři sta",
    400:"čtyři sta",500:"pět set",600:"šest set",700:"sedm set",800:"osm set",900:"devět set",
    1000:"jeden tisíc",2000:"dva tisíce",3000:"tři tisíce",4000:"čtyři tisíce",5000:"pět tisíc",
    6000:"šest tisíc",7000:"sedm tisíc",8000:"osm tisíc",9000:"devět tisíc"
  };
  if (Object.hasOwn(map,num)) return map[num];
  if (num < 100) {
    const tens = Math.floor(num/10)*10;
    const units = num%10;
    return map[tens] + " " + map[units];
  }
  if (num < 1000) {
    const hundreds = Math.floor(num/100)*100;
    const rest = num%100;
    return map[hundreds] + (rest ? " " + numberToCzechWords(rest) : "");
  }
  if (num < 10000) {
    const thousands = Math.floor(num/1000)*1000;
    const rest = num%1000;
    return map[thousands] + (rest ? " " + numberToCzechWords(rest) : "");
  }
  return String(num);
}

function convertNumbersToWords(text) {
  return text.replace(/\b(\d{1,4})\b/g, (match) => numberToCzechWords(parseInt(match)));
}

function formatText(text, level) {
  // Always convert numbers to Czech words — TTS reads them correctly this way
  return convertNumbersToWords(text);
}

// ============================================================
// DIALOGUE DATABASE
// ============================================================
function normalize(text) {
  // First convert numbers to Czech words, then lowercase & clean
  const withWords = convertNumbersToWords(text);
  return withWords.toLowerCase().replace(/nashledanou/g, 'na shledanou').replace(/dobrýden/g, 'dobrý den').replace(/[.,!?;:…%]/g, ' ').replace(/\s+/g, ' ').trim();
}

function wordsMatch(a, b) {
  const fold = word => word.normalize('NFD').replace(/\p{M}/gu,'');
  return fold(canonicalize(a)) === fold(canonicalize(b));
}

// Model wording comparison is descriptive, never an acceptance decision.
// Courtesy words do not reduce similarity to an otherwise complete answer.
const FILLERS = ['hm', 'no', 'tak', 'já', 'ty', 'prostě', 'jako', 'eee', 'ehm', 'hmm'];
const COURTESY = new Set(['děkuju','děkuji','díky','dekuju','děkujem','děkujimockrát',
  'prosím','prosim','promiňte','promiň','omlouvám','mockrát']);
function withoutCourtesy(text) {
  return normalize(text)
    .replace(/(^|\s)(dobrý den|dobry den|dobrýden|dobrý večer|dobry vecer|dobrývečer|dobré ráno|dobre rano|dobrérano)(?=\s|$)/g, ' ')
    .split(' ').filter(w => w && !FILLERS.includes(w) && !COURTESY.has(w));
}
function scoreOne(expected, actual) {
  const meaningful = withoutCourtesy(expected);
  // A courtesy-only model answer (e.g. "Prosím." when paying) is essential.
  // Otherwise courtesy contributes neither matches nor the expected total.
  const expWords = meaningful.length ? meaningful : normalize(expected).split(' ').filter(w => w && !FILLERS.includes(w));
  const actWords = meaningful.length ? withoutCourtesy(actual) : normalize(actual).split(' ').filter(w => w);
  const used = new Array(actWords.length).fill(false);
  const results = [];

  for (const expWord of expWords) {
    let found = false;
    // First: exact/synonym match
    for (let i = 0; i < actWords.length; i++) {
      if (!used[i] && wordsMatch(expWord, actWords[i])) {
        used[i] = true;
        found = true;
        break;
      }
    }
    results.push({ word: expWord, correct: found });
  }

  const correctCount = results.filter(r => r.correct).length;
  const score = expWords.length > 0 ? Math.round((correctCount / expWords.length) * 100) : 0;
  return { results, score, correctCount, total: expWords.length };
}

function bestMatch(expectedAnswers, actual) {
  let best = null;
  for (const exp of expectedAnswers) {
    const result = scoreOne(exp, actual);
    if (!best || result.score > best.score) best = { ...result, matchedAnswer: exp };
  }
  return best;
}

// ============================================================

root.DialogueText = {formatText, bestMatch, normalize};
})(globalThis);
