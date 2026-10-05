const test=require('node:test');
const assert=require('node:assert/strict');
const load=require('../scripts/load');
const c=load();
function answer(dialogue,node,text) {
  const d=c.DialogueCatalog.find(d=>d.id===dialogue);
  return c.DialogueMatcher.evaluate(d.nodes[node],text,{...c.DialogueConcepts,...d.concepts});
}
const routes=[
  ['optika-2','start','Potreboval bych spravit bryle.','repair'],
  ['optika-2','start','Slo by prosim spravit tyhle rozbite bryle?','repair'],
  ['optika-2','start','Rozbil jsem si brejle, muzete mi je spravit?','repair'],
  ['optika-2','repair','Skutecne nejdou opravit?','repair_explained'],
  ['optika-2','repair','Nemuzete je prece jenom opravit?','repair_explained'],
  ['optika-2','repair','Neslo by to jeste spravit?','repair_explained'],
  ['optika-2','repair','A co kontaktni cocky, prodavate je tady?','prescription'],
  ['optika-2','repair_explained','Ale prece to musi jit spravit.','repair_options'],
  ['optika-2','repair_explained','Aha, uz chapu.','repair'],
  ['optika-2','repair_options','Tak mi ukazte nejake nove bryle.','budget'],
  ['optika-2','prescription','Predpis jsem si bohuzel zapomnel doma.','measure'],
  ['optika-2','prescription','Vlevo jsou to minus tri a vpravo minus dva.','lens_prices'],
  ['optika-2','dioptres_explained','Aha, rozumim.','prescription'],
  ['optika-2','measure','Vysvetlite mi prosim jak to bude probihat.','measure_explained'],
  ['optika-2','measure_explained','Souhlasim s tim.','lens_prices'],
  ['optika-2','lens_prices','Ty jednodenni bych rad.','daily'],
  ['optika-2','lens_prices','Nechci denni, chci mesicni.','monthly'],
  ['optika-2','lens_prices','Nechci cocky, radeji bych nejake bryle.','budget'],
  ['optika-2','budget','Do dvou tisic se snad vejdu.','choose_frames'],
  ['optika-2','budget','Muzu utratit 1800 korun.','budget_options'],
  ['optika-2','choose_frames','Hnede nechci, chci cerne.','try_black'],
  ['optika-2','try_black','Trochu me tlaci, vetsich byste nemeli?','other_size'],
  ['optika-2','try_brown','Jsou mi moc volne, prosim mensi.','smaller_size'],
  ['optika-2','glasses_ready','Kde si je pak vyzvednu?','glasses_date_explained'],
  ['ridicsky-prukaz-1','start','Nekdo mi ukradl ridicak, potrebuju nahradni.','identity'],
  ['ridicsky-prukaz-1','start','Chtela bych duplikat ridicskeho prukazu.','identity'],
  ['ridicsky-prukaz-1','identity','Pas mam s sebou.','form'],
  ['ridicsky-prukaz-1','identity','Bohuzel jsem zapomnela doklady.','bring_identity'],
  ['ridicsky-prukaz-1','identity','Co znamena obcanka?','identity_explained'],
  ['ridicsky-prukaz-1','form','Kam mam prosim dat svuj podpis?','signature_explained'],
  ['ridicsky-prukaz-1','signature_explained','Dobře, už chápu.','form'],
  ['ridicsky-prukaz-1','form','Muzete mi pomoct s formularem?','form_help'],
  ['ridicsky-prukaz-1','form','Je to vyplnene, fotku mam prinest?','photo_information'],
  ['ridicsky-prukaz-1','photo','Prosim znova, zavrela jsem oci.','photo_again'],
  ['ridicsky-prukaz-1','photo_again','Tahleta se mi libi vic.','times'],
  ['ridicsky-prukaz-1','times','Potrebuju to rychlejsi.','express'],
  ['ridicsky-prukaz-1','fees','Bohuzel nespecham, standardne prosim.','standard'],
  ['ridicsky-prukaz-1','fees','A jaky je vlastne ten poplatek?','fees_explained'],
  ['ridicsky-prukaz-1','standard','Mohu tady zaplatit kartou?','standard_payment'],
  ['ridicsky-prukaz-1','standard_payment','Hotove, prosim.','standard_done'],
  ['ridicsky-prukaz-1','express','Radsi si to vyzvednu za tri tydny.','standard'],
  ['ridicsky-prukaz-1','express','Kam mam prijit pro prukaz?','express_collection']
];
for(const [d,node,text,next]of routes)test(d+'/'+node+': '+text,()=>{
  const result=answer(d,node,text);
  assert.equal(result.outcome,'accepted');assert.equal(result.response.next,next);
});
test('opposite options and unrelated answers do not become valid choices',()=>{
  for(const [d,node,text]of [
    ['optika-2','start','Nechci spravit bryle.'],
    ['ridicsky-prukaz-1','fees','Expresni i normalni.'],
    ['ridicsky-prukaz-1','standard_payment','Tady je 700 korun.']
  ])assert.notEqual(answer(d,node,text).outcome,'accepted',text);
});

test('uncertainty and incomplete forms are valid requests for assistance',()=>{
  assert.equal(answer('optika-2','choose_frames','Cerne nebo hnede, nevim.').response.next,'frame_advice');
  assert.equal(answer('ridicsky-prukaz-1','form','Zadost jsem nevyplnil.').response.next,'form_help');
  assert.equal(answer('optika-2','lens_prices','Nechci mesicni cocky.').response.next,'lens_advice');
});
test('unknown replies lead to a clarifying question rather than a guessed choice',()=>{
  for(const id of ['optika-2','ridicsky-prukaz-1']) {
    const d=c.DialogueCatalog.find(d=>d.id===id),s=new c.DialogueSession(d,c.DialogueConcepts);
    const original=s.nodeId;
    s.answer('Nevhodná odpověď.');s.answer('Nevhodná odpověď.');s.answer('Nevhodná odpověď.');s.advance();
    assert.equal(s.nodeId,'repeat_'+original);
    assert.ok(s.node.responses.some(r=>r.next!==s.nodeId));
  }
});
test('repair objections rejoin a complete glasses purchase conversation',()=>{
  const d=c.DialogueCatalog.find(d=>d.id==='optika-2'),s=new c.DialogueSession(d,c.DialogueConcepts);
  for(const text of [
    'Potřebuji spravit brýle.','Skutečně nejdou opravit?','Nemůžete je přece jenom opravit?',
    'Tak prodáváte čočky?','Předpis nemám a dioptrie neznám.','Ano, souhlasím.',
    'Nechci čočky, raději brýle.','Do dvou tisíc korun.','Hnědé prosím.',
    'Máte menší?','Tyto mi sedí dobře.','Kde si je vyzvednu?','Dobře, objednejte mi je.',
    'Děkuji, na shledanou.'
  ]) {
    const result=s.answer(text);assert.equal(result.outcome,'accepted',s.nodeId+': '+text);
    if(!result.complete)s.advance();
  }
  assert.equal(s.phase,'complete');assert.equal(s.skippedCount,0);
});
test('document, signature, photo and payment loops lead to a complete licence conversation',()=>{
  const d=c.DialogueCatalog.find(d=>d.id==='ridicsky-prukaz-1'),s=new c.DialogueSession(d,c.DialogueConcepts);
  for(const text of [
    'Ukradli mi řidičák.','Co znamená občanka?','Aha, rozumím.','Tady je pas.',
    'Kam mám dát podpis?','Dobře, už je mi to jasné.','Hotovo.','Ještě jednou prosím.',
    'Ano, tato je lepší.','Kolik to stojí?','Expresně prosím.','Mohu zaplatit kartou?',
    'Kartou prosím.','Na shledanou.'
  ]) {
    const result=s.answer(text);assert.equal(result.outcome,'accepted',s.nodeId+': '+text);
    if(!result.complete)s.advance();
  }
  assert.equal(s.phase,'complete');assert.equal(s.skippedCount,0);
});
