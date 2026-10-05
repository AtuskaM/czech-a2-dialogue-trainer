(function(root) {
  'use strict';
  // Meaning checks use whole tokens/phrases, never fuzzy spelling or global synonyms.
  // Preserve ně (them) separately from ne (no), including unaccented prepositional forms.
  const normalize = text => root.DialogueText.normalize(text).replace(/(^|\s)ně(?=\s|$)/gu,'$1pronounne').normalize('NFD').replace(/\p{M}/gu,'').replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim().replace(/\b(na|za|pro|o|mezi|pred|nad|pod|pres|mimo) ne\b/g,'$1 pronounne');
  function phraseIn(actual, phrase) {
    const needle=normalize(phrase);
    return needle.length>0 && (' '+actual+' ').includes(' '+needle+' ');
  }
  function positivePhraseIn(actual, phrase) {
    // Respect explicit clause boundaries, including contrasts in speech transcripts.
    const clauses=actual.split(/[,;.!?]|\bale\b/iu);
    if(clauses.length>1)return clauses.some(clause=>positivePhraseIn(clause,phrase));
    actual=normalize(actual);
    const words=actual.split(' '),needle=normalize(phrase).split(' ');
    const negative=/^(ne|nechci|nechceme|neberu|nevezmu|nepotrebuji|nepotrebuju|nekoupim|nevyberu|nemam|nemame|nesedi|nelibi|nevyhovuje|nemuzu|nemohu|nemusi)$/;
    for(let i=0;i<=words.length-needle.length;i++) {
      if(!needle.every((word,j)=>words[i+j]===word))continue;
      let before=words.slice(Math.max(0,i-4),i);
      const pivot=before.findLastIndex(w=>['ale','chci','radeji','radsi','misto'].includes(w));
      if(pivot>=0)before=before.slice(pivot+1);
      let after=words.slice(i+needle.length,i+needle.length+4);
      const affirmation=after.findIndex(w=>['chci','beru','vezmu','koupim','mam'].includes(w));
      if(affirmation>=0)after=after.slice(0,affirmation);
      if(!before.some(w=>negative.test(w))&&!after.some(w=>negative.test(w)))return true;
    }
    return false;
  }
  function numbers(text) {
    const values={nula:0,jeden:1,jedna:1,jedno:1,dva:2,dve:2,dvou:2,tri:3,ctyri:4,pet:5,sest:6,sedm:7,osm:8,devet:9,deset:10,jedenact:11,dvanact:12,trinact:13,ctrnact:14,patnact:15,sestnact:16,sedmnact:17,osmnact:18,devatenact:19,dvacet:20,tricet:30,ctyricet:40,padesat:50,sedesat:60,sedmdesat:70,osmdesat:80,devadesat:90,petadvacet:25};
    const found=[];let amount=0,group=0,active=false;
    const flush=()=>{if(active)found.push(amount+group);amount=0;group=0;active=false;};
    for(const token of text.split(' ')) {
      if(/^\d+$/.test(token)){flush();found.push(Number(token));}
      else if(Object.hasOwn(values,token)){group+=values[token];active=true;}
      else if(['sto','ste','sta','set'].includes(token)){group=(group||1)*100;active=true;}
      else if(['tisic','tisice','tisicu'].includes(token)){amount+=(group||1)*1000;group=0;active=true;}
      else flush();
    }
    flush();return found;
  }
  function matchResponse(response, actual, concepts={}) {
    const comparison=root.DialogueText.bestMatch(response.examples,actual);
    const text=normalize(actual), rules=response.match;
    const has=name=>(concepts[name]||[]).some(phrase=>(rules.positiveConcepts||[]).includes(name)?positivePhraseIn(actual,phrase):phraseIn(text,phrase));
    const missing=(rules.required||[]).filter(name=>!has(name));
    const forbidden=(rules.forbidden||[]).filter(has);
    const anyMissing=rules.anyOf?.length && !rules.anyOf.some(has);
    const wrongAmount=rules.allowedAmounts && numbers(text).some(n=>!rules.allowedAmounts.includes(n));
    const patternMatched=(rules.patterns||[]).some(group=>group.every(has));
    const slotMatch=rules.slots&&root.DialogueSlots.matches(actual,rules.slots);
    const slotRequired=rules.slots&&rules.slots.mode!=='compatible';
    const accepted=!!text && (rules.acceptAny || (((!missing.length&&!anyMissing||patternMatched)||slotRequired&&slotMatch) && (!rules.slots||slotMatch) && !forbidden.length && !wrongAmount));
    const positive=[...(rules.required||[]),...(rules.anyOf||[]),...(rules.patterns||[]).filter(group=>group.every(has)).flat()];
    const length=name=>Math.max(0,...(concepts[name]||[]).filter(p=>phraseIn(text,p)).map(p=>normalize(p).split(' ').length));
    const specificity=Math.max(0,...positive.map(length),...(rules.patterns||[]).filter(group=>group.every(has)).map(group=>group.reduce((sum,name)=>sum+length(name),0)));
    return {accepted,comparison,missing,forbidden,anyMissing:!!anyMissing,wrongAmount:!!wrongAmount,specificity};
  }
  function evaluate(node, actual, concepts={}) {
    const candidates=node.responses.map(response=>({response,...matchResponse(response,actual,concepts)}));
    const valid=candidates.filter(c=>c.accepted);
    // An explicitly authored information/combined-intent route can precede a generic choice.
    const priority=Math.max(0,...valid.map(c=>c.response.match.priority||0));
    const accepted=valid.filter(c=>(c.response.match.priority||0)===priority);
    const strongest=accepted.filter(c=>c.specificity===Math.max(...accepted.map(c=>c.specificity)));
    if(strongest.length) {
      const targets=new Set(strongest.map(c=>c.response.next));
      if(targets.size>1) return {...strongest[0],outcome:'ambiguous'};
      return {...strongest.sort((a,b)=>b.comparison.score-a.comparison.score)[0],outcome:'accepted'};
    }
    const fallback=candidates.sort((a,b)=>b.comparison.score-a.comparison.score)[0];
    return {...fallback,outcome:'unclear'};
  }
  root.DialogueMatcher={normalize,phraseIn,matchResponse,evaluate};
})(globalThis);
