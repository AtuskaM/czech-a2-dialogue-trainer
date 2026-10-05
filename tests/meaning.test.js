const test=require('node:test');
const assert=require('node:assert/strict');
const load=require('../scripts/load');
const c=load();
const fixtures=[
  ['optika-2','repair','Nemuzete je opravit?','repair_explained'],
  ['optika-2','repair','A urcite je nemuzete opravit?','repair_explained'],
  ['optika-2','repair','Ale ja si nechci koupit nove bryle.','purchase_alternatives'],
  ['optika-2','repair','Ja nove bryle kupovat nechci.','purchase_alternatives'],
  ['optika-2','repair','Nove si kupovat nebudu.','purchase_alternatives'],
  ['optika-2','repair','Nechci nove, nemuzete spravit ty stare?','repair_explained'],
  ['optika-2','repair','Dobre koupim si nove.','budget'],
  ['optika-2','repair','Tak si je koupim.','budget'],
  ['optika-2','repair','Nechtel jsem kupovat nove, ale co se da delat.','budget'],
  ['optika-2','repair','Nechtela jsem kupovat nove, ale co se da delat.','budget'],
  ['optika-2','repair','A kolik stoji takove normalni?','repair_price'],
  ['optika-2','repair','Tak dobre koupim si nove a kolik stoji?','repair_price'],
  ['optika-2','repair','A jake mate?','frame_cost'],
  ['optika-2','repair','Dobre a muzete mi nejake ukazat?','frame_cost'],
  ['optika-2','repair','To je skoda. Neda se s tim opravdu nic delat?','repair_explained'],
  ['optika-2','repair','Dobre, tak si nejake vezmu.','budget'],
  ['optika-2','repair','Jake nove bryle tady vlastne nabizite?','frame_cost'],
  ['optika-2','repair','A kolik by me prosim staly nove bryle?','repair_price'],
  ['optika-2','repair','Nemam moc penez na nove.','purchase_alternatives'],
  ['optika-2','repair','To si jeste rozmyslim, prijdu jindy.','later'],
  ['optika-2','purchase_alternatives','Tak dobre a kolik stoji?','repair_price'],
  ['optika-2','repair_price','A jake mate na vyber?','frame_cost'],
  ['optika-2','repair_explained','Tak tedy koupim nove, jaka je cena?','repair_price'],
  ['optika-2','lens_prices','Ktere cocky mi doporucite?','lens_advice'],
  ['optika-2','lens_prices','Nechci mesicni, denni prosim.','daily'],
  ['optika-2','lens_prices','Nechci denni, mesicni prosim.','monthly'],
  ['optika-2','lens_prices','Mesicni cocky opravdu nechci.','lens_advice'],
  ['optika-2','choose_frames','Chtela bych vyzkouset oboje.','try_both'],
  ['optika-2','choose_frames','Vubec nevim, poradite mi?','frame_advice'],
  ['optika-2','try_black','Padaji mi z nosu.','smaller_size'],
  ['optika-2','try_brown','Jsou akorat.','glasses_ready'],
  ['ridicsky-prukaz-1','start','Ztratil jsem nekde ridicak, potrebuji duplikat.','identity'],
  ['ridicsky-prukaz-1','identity','Obcanku bohuzel nemam, ale pas mam tady.','form'],
  ['ridicsky-prukaz-1','identity','Pas nemam, ale obcanku mam.','form'],
  ['ridicsky-prukaz-1','identity','Nemam ani pas ani obcanku.','bring_identity'],
  ['ridicsky-prukaz-1','form','Muzete mi s tim prosim pomoct?','form_help'],
  ['ridicsky-prukaz-1','form','Ja jsem to jeste nepodepsala.','form_help'],
  ['ridicsky-prukaz-1','form_help','Ted uz to mam hotove.','photo'],
  ['ridicsky-prukaz-1','photo','Ja se ale nechci fotit.','photo_required'],
  ['ridicsky-prukaz-1','photo','Mohli bychom zkusit jinou fotku?','photo_again'],
  ['ridicsky-prukaz-1','photo','Tuhle muzeme nechat.','times'],
  ['ridicsky-prukaz-1','times','Nespecham, staci bezne vydani.','standard'],
  ['ridicsky-prukaz-1','times','Nechci expresni, normalni prosim.','standard'],
  ['ridicsky-prukaz-1','fees','Expresni vydani nechci.','service_advice'],
  ['ridicsky-prukaz-1','times','Nemuzu cekat tri tydny, potrebuju to rychle.','express'],
  ['ridicsky-prukaz-1','times','Dobre, pockam ty tri tydny.','standard'],
  ['ridicsky-prukaz-1','times','Staci mi normalni, kolik zaplatim?','standard_offer'],
  ['ridicsky-prukaz-1','times','Chci to co nejdriv, kolik to stoji?','express_offer'],
  ['ridicsky-prukaz-1','fees','Radsi expresne. A jaka je cena?','express_offer'],
  ['ridicsky-prukaz-1','fees','No nevim, co byste mi doporucil?','service_advice'],
  ['ridicsky-prukaz-1','fees','Dnes to necham, prijdu pozdeji.','later'],
  ['ridicsky-prukaz-1','standard_offer','Ano, to mi vyhovuje.','standard'],
  ['ridicsky-prukaz-1','express_offer','Tak tu druhou moznost prosim.','standard'],
  ['ridicsky-prukaz-1','standard','Budu platit hotove.','standard_done'],
  ['ridicsky-prukaz-1','express','Dalo by se platit kartou?','express_payment'],
  ['ridicsky-prukaz-1','express_payment','Tak zaplatim kartou.','express_done']
];

test('reported and held-out meanings receive acceptance, credit and the appropriate reply',()=>{
  const failures=[];
  for(const [id,node,text,next]of fixtures) {
    const d=c.DialogueCatalog.find(d=>d.id===id),s=new c.DialogueSession(d,c.DialogueConcepts);
    s.load(node);const result=s.answer(text);
    if(result.outcome!=='accepted'||result.response.next!==next||result.pointsEarned!==1)
      failures.push({id,node,text,expected:next,actual:result.response.next,outcome:result.outcome,points:result.pointsEarned});
  }
  assert.deepEqual(failures,[]);
});

test('each main open prompt offers at least ten distinct meaningful response examples',()=>{
  const prompts={'optika-2':['start','repair','prescription','measure','lens_prices','budget','choose_frames','try_black','glasses_ready'],
    'ridicsky-prukaz-1':['start','identity','form','photo','times','fees','standard','express']};
  for(const [id,ids]of Object.entries(prompts))for(const node of ids) {
    const d=c.DialogueCatalog.find(d=>d.id===id);
    const examples=new Set(d.nodes[node].responses.filter(r=>!r.id.startsWith('repeat')&&!r.id.startsWith('request_')).flatMap(r=>r.examples.map(c.DialogueMatcher.normalize)));
    assert.ok(examples.size>=10,id+'/'+node+': '+examples.size);
  }
});

test('expanded model responses retain their routes without diacritics',()=>{
  for(const d of c.DialogueCatalog.filter(d=>['optika-2','ridicsky-prukaz-1'].includes(d.id))) {
    const concepts={...c.DialogueConcepts,...d.concepts};
    for(const [id,node]of Object.entries(d.nodes)) {
      if(id.startsWith('repeat_'))continue; // Generated repeats use the already-tested source responses.
      for(const r of node.responses)for(const example of r.examples) {
        const text=example.normalize('NFD').replace(/\p{M}/gu,'');
        const result=c.DialogueMatcher.evaluate(node,text,concepts);
        assert.equal(result.outcome,'accepted',d.id+'/'+id+': '+text);
        assert.equal(result.response.next,r.next,d.id+'/'+id+': '+text);
      }
    }
  }
});

test('a valid objection and a price question both count as correct without farming loop points',()=>{
  const d=c.DialogueCatalog.find(d=>d.id==='optika-2'),s=new c.DialogueSession(d,c.DialogueConcepts);
  s.load('repair');assert.equal(s.answer('Nemůžete je opravit?').pointsEarned,1);s.advance();
  const result=s.answer('A kolik stojí?');assert.equal(result.outcome,'accepted');assert.equal(result.pointsEarned,0);
  assert.equal(s.points,11);assert.equal(s.skippedCount,0);assert.equal(s.acceptedCount,1);
});

test('questions and refusals never silently purchase, pay or select an unwanted option',()=>{
  for(const [id,node,text,forbidden]of [
    ['optika-2','repair','Nové nechci.',['budget','glasses_done']],
    ['ridicsky-prukaz-1','identity','Pas nemám.',['form']],
    ['ridicsky-prukaz-1','fees','Nechci expresní.',['express']],
    ['ridicsky-prukaz-1','standard','Můžu platit kartou?',['standard_done']],
    ['ridicsky-prukaz-1','standard','Tady je 700 korun.',['standard_done']]
  ]) {
    const d=c.DialogueCatalog.find(d=>d.id===id),r=c.DialogueMatcher.evaluate(d.nodes[node],text,{...c.DialogueConcepts,...d.concepts});
    assert.ok(r.outcome!=='accepted'||!forbidden.includes(r.response.next),text);
  }
});

test('combined questions and refusals complete both dialogues through appropriate replies',()=>{
  const paths={
    'optika-2':[
      'Potřebuji spravit brýle.','Ale já si nechci koupit nové brýle.',
      'Dobře, koupím si nové, kolik stojí?','A jaké máte?','Můžu zkusit oboje?',
      'Černé prosím.','Jsou akorát.','Dobře, objednejte je.','Na shledanou.'
    ],
    'ridicsky-prukaz-1':[
      'Ztratila jsem řidičák.','Občanku nemám, ale mám pas.','Ještě jsem to nevyplnila.',
      'Hotovo.','Tahle může být.','Nespěchám, kolik to bude stát?',
      'Ano, to mi vyhovuje.','Můžu použít kartu?','Zaplatím kartou.','Na shledanou.'
    ]
  };
  for(const [id,path]of Object.entries(paths)) {
    const d=c.DialogueCatalog.find(d=>d.id===id),s=new c.DialogueSession(d,c.DialogueConcepts);
    for(const text of path) {
      const r=s.answer(text);assert.equal(r.outcome,'accepted',s.nodeId+': '+text);
      if(!r.complete)s.advance();
    }
    assert.equal(s.phase,'complete',id);assert.equal(s.skippedCount,0,id);
  }
});
