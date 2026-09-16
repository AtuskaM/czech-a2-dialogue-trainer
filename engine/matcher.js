(function(root) {
  'use strict';
  const CORRECT_THRESHOLD = 40;
  function matchResponse(response, actual) {
    const comparison = root.DialogueText.bestMatch(response.examples, actual);
    return {accepted: comparison.score >= CORRECT_THRESHOLD, comparison};
  }
  function evaluate(node, actual) {
    const candidates = node.responses.map(response => ({response,...matchResponse(response,actual)}));
    // Acknowledgements use the same word score and threshold as other answers.
    // Content's concept rules are intentionally inactive.
    // Restore evaluateAnswer's original priority and choice tie-breaking.
    const correct = candidates.find(c => c.response.kind === 'correct');
    if (correct?.accepted) return {...correct, outcome:'accepted'};
    let choice = null;
    for (const candidate of candidates.filter(c => c.response.kind === 'choice')) {
      if (candidate.accepted && (!choice || candidate.comparison.score > choice.comparison.score)) choice = candidate;
    }
    if (choice) return {...choice, outcome:'accepted'};
    const alternative = candidates.find(c => c.response.kind === 'alternative');
    if (alternative?.accepted) return {...alternative, outcome:'accepted'};
    const fallback = correct || candidates.find(c => c.response.kind === 'choice') || candidates[0];
    return {outcome:'unclear', comparison:fallback.comparison};
  }
  root.DialogueMatcher = {CORRECT_THRESHOLD,matchResponse,evaluate};
})(globalThis);
