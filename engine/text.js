(function(root) {

// ============================================================
// SYNONYM GROUPS
// ============================================================
const synonyms = [
  ["chci","chce","chtěl","chtěla","bych","přeji","přeju","rád","ráda","potřebuju","potřebuji","potřeboval","potřebovala","zájem","můžu","můžete","šlo"],
  ["zařídit","zařídil","zařídila","zakoupit","koupit","koupil","koupila","vyřídit","pořídit","vzít","prodáváte","máte"],
  ["kartu","karta","karty","kartou"],
  ["vlak","vlakem","vlaku"],
  ["slevu","sleva","slevou","slevová","slevovou","zlevněnou"],
  ["fotku","fotka","foto","fotografii","fotografie"],
  ["děkuju","děkuji","díky","dekuju","děkujem"],
  ["ano","jistě","samozřejmě","určitě","jasně","jo","ok","supr","super","aha"],
  ["ne","bohužel","nemám","nemáme","ježišmária"],
  ["dobrý","dobré","dobrou","ahoj"],
  ["prosím","prosim","promiňte","promiň"],
  ["rok","roky","roku","let","ročně","roční"],
  ["jeden","jedna","jedno","1"],
  ["měsíc","měsíce","měsíčně","měsíců"],
  ["den","dny","denně","dní"],
  ["korun","koruna","kč","kc","koruny"],
  ["formulář","žádost","žádostí"],
  ["pas","občanku","občanka","průkaz","průkazku","doklady","doklad"],
  ["kartou","hotově","hotovost","platit"],
  ["dva","dvě","2"],
  ["tři","3"],
  ["pět","5"],
  ["dvacet pět","25"],
  ["padesát","50"],
  ["nerozumím","nerozumim","rozumím"],
  ["zopakovat","zopakujte","opakovat"],
  ["promiňte","promiň","omlouvám"],
  ["kolik","stojí","cena","cenu","zaplatit"],
  // NEW: glued phrases (speech recognition often merges these)
  ["nashledanou","na shledanou","nashledanou"],
  ["dobrýden","dobrý den"],
  ["dobrývečer","dobrý večer"],
  ["dobrérano","dobré ráno"],
  ["děkujimockrát","děkuji mockrát","děkuju mockrát"],
  ["promiňte","promiňte","promiň"],
  ["není zač","není zač"],
  ["namít","na mít"],
  ["procent","procenta","procentech","%"],
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
  if (map[num]) return map[num];
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
  return withWords.toLowerCase().replace(/[.,!?;:]/g, '').replace(/\s+/g, ' ').trim();
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
    }
  }
  return dp[m][n];
}

// Try splitting a glued word into two parts and matching each part
function splitAndMatch(gluedWord, expWords) {
  // Only try for words > 6 chars
  if (gluedWord.length < 6) return null;
  for (let i = 3; i < gluedWord.length - 2; i++) {
    const part1 = gluedWord.slice(0, i);
    const part2 = gluedWord.slice(i);
    // Check if both parts match two different expected words
    const match1 = expWords.find(w => wordsMatch(w, part1));
    const match2 = expWords.find(w => wordsMatch(w, part2));
    if (match1 && match2 && match1 !== match2) {
      return [match1, match2];
    }
  }
  return null;
}

function wordsMatch(a, b) {
  if (a === b) return true;
  if (canonicalize(a) === canonicalize(b)) return true;
  const maxDist = Math.max(a.length, b.length) > 4 ? 1 : 0;
  return levenshtein(a, b) <= maxDist;
}

// Preserve v3's synonyms, edit-distance tolerance, glued-word matching and
// formula. Apply the explicitly requested non-essential courtesy exclusion.
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
    // Second: try to find this word inside a glued word
    if (!found) {
      for (let i = 0; i < actWords.length; i++) {
        if (used[i]) continue;
        // Try splitting the actual word and matching the expected word
        const glued = actWords[i];
        if (glued.length > 6) {
          for (let j = 2; j < glued.length - 1; j++) {
            const part1 = glued.slice(0, j);
            const part2 = glued.slice(j);
            if (wordsMatch(expWord, part1) || wordsMatch(expWord, part2)) {
              // Mark as found, but don't consume the whole glued word
              // (the other part will be matched by another expected word)
                found = true;
              break;
            }
          }
        }
        if (found) break;
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
