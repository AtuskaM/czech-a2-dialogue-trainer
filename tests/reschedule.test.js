const test=require('node:test');
const assert=require('node:assert/strict');
const c=require('../scripts/load')();
const d=c.DialogueCatalog.find(d=>d.id==='lekar-zmena-terminu');
function answer(node,text,next) {
  const s=new c.DialogueSession(d,c.DialogueConcepts);s.load(node);
  const result=s.answer(text);
  assert.equal(result.outcome,'accepted',node+': '+text);
  assert.equal(result.response.next,next,node+': '+text);
  assert.equal(result.pointsEarned,1);
  return s;
}
test('specific proposed dates get a calendar reply, not an unrelated next-week refusal',()=>{
  for(const node of ['availability','availability_help']) {
    for(const text of ['17. dubna ráno','19. dubna odpoledne','Muzu dvacateho druheho dubna.','3/6','Muzu prijit 21. dubna?'])answer(node,text,'date_offer');
    for(const text of ['14.5.','Muzu ctrnacteho kvetna.','14. května odpoledne'])answer(node,text,'may_available');
    answer(node,'O tyden pozdeji prosim.','may_offer');
  }
  assert.doesNotMatch(d.nodes.date_offer.clerk,/týden/);
});
test('calling later is accepted at every scheduling decision without cancelling or booking',()=>{
  for(const node of ['availability','availability_help','may_offer','date_offer','may_available','may_calendar','may_repeat','may_time','may_alternatives','cancel_check']) {
    for(const text of ['Zavolam pozdeji.','Ja jeste zavolam pozdeji.','Ozvu se az budu vedet.','Ted nemuzu, zavolam vam zitra.'])answer(node,text,'call_later_done');
  }
  const s=answer('may_alternatives','Zavolám později.','call_later_done');
  s.advance();assert.equal(s.nodeId,'call_later_done');
  assert.equal(s.answer('Na shledanou.').complete,true);
});
test('date confirmation and cancellation remain separate decisions',()=>{
  for(const node of ['date_offer','may_available','may_alternatives']) {
    answer(node,'Ano, muzu.','changed');
    answer(node,'Ano, ale 15.5.','may_alternatives');
    answer(node,'Chci termin zrusit.','cancel_check');
  }
  answer('cancel_check','Ano, zruste ji.','cancelled');
  answer('availability','14.5. prosím, nebo 15.5.','date_offer');
});
