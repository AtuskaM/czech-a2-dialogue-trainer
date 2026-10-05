const test=require('node:test');
const assert=require('node:assert/strict');
const load=require('../scripts/load');
const c=load();
const dialogue=id=>c.DialogueCatalog.find(d=>d.id===id);
const evaluate=(id,node,text)=>{const d=dialogue(id);return c.DialogueMatcher.evaluate(d.nodes[node],text,{...c.DialogueConcepts,...d.concepts});};
test('all ten catalog entries are structurally valid',()=>{
  assert.equal(c.DialogueCatalog.length,10);
  assert.equal(c.DialogueValidator.validateCatalog(c.DialogueCatalog,c.DialogueConcepts).filter(i=>i.severity==='error').length,0);
});
test('every existing model answer keeps its authored route',()=>{
  let count=0;
  for(const d of c.DialogueCatalog)for(const [id,n] of Object.entries(d.nodes))for(const r of n.responses)for(const text of r.examples) {
    const result=evaluate(d.id,id,text);count++;
    assert.equal(result.outcome,'accepted',d.id+'/'+id+': '+text);
    assert.equal(result.response.next,r.next,d.id+'/'+id+': '+text);
  }
  assert.ok(count>800);
});
test('refusal, wrong duration and payment methods cannot pass by shared words',()=>{
  for(const answer of ['Nechci slevovou kartu.','Ne, nepotřebuji slevovou kartu.','Chci kartu.'])assert.notEqual(evaluate('station-card-1','q1',answer).outcome,'accepted',answer);
  for(const answer of ['Na dva roky.','Na tři roky.','Nechci na rok.'])assert.notEqual(evaluate('station-card-1','q4',answer).outcome,'accepted',answer);
  assert.equal(evaluate('station-card-1','q4','Na jeden rok, prosím.').outcome,'accepted');
  assert.notEqual(evaluate('station-card-2','q4_25','Prosím, zaplatím kartou.').outcome,'accepted');
});
test('opposite meanings stay different in model wording feedback',()=>{
  for(const [a,b] of [['Rozumím.','Nerozumím.'],['Kartou.','Hotově.'],['Mám.','Nemám.']])assert.equal(c.DialogueText.bestMatch([a],b).score,0);
});
test('photo branches and explicit clarification follow their intended route',()=>{
  assert.equal(evaluate('station-card-1','q3','Nemám fotku.').response.next,'q3_ack');
  assert.equal(evaluate('station-card-1','q3','Ano, tady je.').response.next,'q4');
  assert.equal(evaluate('optika-1','prescription','Nemám předpis.').response.next,'eye_test');
  assert.equal(evaluate('optika-1','prescription','Ano, mám předpis.').response.next,'frames');
  assert.notEqual(evaluate('optika-1','prescription','Ano, nemám předpis.').response.next,'frames');
});
test('wrong choices do not steal a route',()=>{
  assert.equal(evaluate('optika-1','try_metal','Jsou mi velké. Máte menší?').response.next,'try_smaller');
  assert.equal(evaluate('optika-2','lens_prices','Nechci denní čočky.').response.next,'lens_advice');
  assert.notEqual(evaluate('optika-2','lens_prices','Denní i měsíční.').outcome,'accepted');
  assert.notEqual(evaluate('ridicsky-prukaz-1','standard','Tady je 700 korun.').outcome,'accepted');
  assert.notEqual(evaluate('ridicsky-prukaz-1','standard','Tady je 300 korun.').outcome,'accepted');
  assert.notEqual(evaluate('station-card-1','q5','Tady je 800 korun.').outcome,'accepted');
  assert.notEqual(evaluate('station-card-1','q5','Tady je 10000 korun.').outcome,'accepted');
});
test('a high wording score never overrides essential concepts',()=>{
  const result=evaluate('station-card-2','q1','Chci si zařídit slevovou kartu.');
  assert.ok(result.comparison.score>=40);
  assert.equal(result.outcome,'unclear');
});
test('diacritics and digit amounts are normalized for phrase rules',()=>{
  assert.equal(evaluate('station-card-1','q1','Potrebuji slevovou kartu.').outcome,'accepted');
  assert.equal(evaluate('station-card-2','q4','25%, prosím.').response.next,'q4_25');
  assert.equal(c.DialogueText.formatText('0 korun'),'nula korun');
});
test('changing mode preserves attempts and completed phase; selecting resets points',()=>{
  const s=new c.DialogueSession(dialogue('station-card-1'),c.DialogueConcepts);
  s.answer('nic');s.setLevel('normal');assert.equal(s.attempts,1);
  s.hint();assert.equal(s.points,8);s.setLevel('easy');s.setLevel('normal');assert.equal(s.hint(),false);
  s.answer('Potřebuji slevovou kartu.');assert.equal(s.phase,'advance');
  const points=s.points;s.setLevel('dumb');assert.equal(s.phase,'advance');assert.equal(s.answer('Potřebuji slevovou kartu.').outcome,'ignored');assert.equal(s.points,points);
  s.select(dialogue('station-card-2'));assert.equal(s.points,10);assert.equal(s.attempts,0);
});
test('return branches cannot farm points',()=>{
  const s=new c.DialogueSession(dialogue('station-card-1'),c.DialogueConcepts);
  s.load('q3');s.answer('Nemám.');s.advance();s.answer('Ano.');s.advance();
  assert.equal(s.nodeId,'q3');const points=s.points;s.answer('Nemám.');assert.equal(s.points,points);
});
test('three unsuccessful attempts move on once and reduce points once',()=>{
  const s=new c.DialogueSession(dialogue('station-card-1'),c.DialogueConcepts);
  assert.equal(s.answer('nic').exhausted,false);s.answer('nic');assert.equal(s.answer('nic').exhausted,true);assert.equal(s.points,9);assert.equal(s.answer('nic').outcome,'ignored');
  s.advance();assert.equal(s.nodeId,'q2');
});
test('progress stores only completion summaries and survives unavailable storage',()=>{
  const store=new Map();const ctx=load({localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)}});
  const s=new ctx.DialogueSession(ctx.DialogueCatalog[0],ctx.DialogueConcepts);
  assert.equal(ctx.DialogueProgress.save(s),true);
  const raw=[...store.values()][0];assert.ok(!raw.includes('transcript'));assert.ok(!raw.includes('audio'));
  assert.equal(ctx.DialogueProgress.read().records['station-card-1:easy'].runs,1);
  assert.equal(load().DialogueProgress.save(s),false);
});
