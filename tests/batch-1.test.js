const test=require('node:test');
const assert=require('node:assert/strict');
const c=require('../scripts/load')();
const dialogue=id=>c.DialogueCatalog.find(d=>d.id===id);
const routes={
  'ridicsky-prukaz-2':[
    ['start','Potrebovala bych nahradni ridicak.','old'],
    ['start','Ukradli mi ridicsky prukaz.','old'],
    ['old','Ne, bohuzel jsem ho nekde ztratil.','identity'],
    ['old','Uz jsem ho nasla.','found'],
    ['old','Ktery prukaz mate na mysli?','old_help'],
    ['identity','Obcanku nemam, ale pas mam s sebou.','times'],
    ['identity','Nemam zadny doklad u sebe.','bring_document'],
    ['identity','Staci vam muj pas?','document_help'],
    ['identity','Jak mam vyplnit tu zadost?','form_help'],
    ['times','Specham, muzu platit kartou?','express_payment'],
    ['fees','Staci normalni, berete karty?','standard_payment'],
    ['fees','Chci expresni. A kolik to stoji?','express_offer'],
    ['standard_payment','Hotove prosim.','standard_done'],
    ['express_payment','Tak zaplatim kartou.','express_done'],
    ['express','Nemuzu zaplatit ted.','express_payment_help']
  ],
  'lekarna-1':[
    ['start','Strasne me skrabe v krku.','symptoms'],
    ['start','Potrebuju neco na bolest v krku.','symptoms'],
    ['symptoms','Nekaslu, ale mam ucpany nos.','offer'],
    ['symptoms','Nic jineho mi neni, jen krk.','offer'],
    ['offer','A jaky je mezi tim rozdil?','details'],
    ['offer','Radeji sirup prosim.','syrup_info'],
    ['offer','Nechci sprej, chtela bych sirup.','syrup_info'],
    ['offer','Sprej nechci.','alternatives'],
    ['offer','Mate neco levnejsiho?','cheap'],
    ['offer','Beru jeste jine leky.','safety'],
    ['details','Tak sprej, jak casto ho mam pouzivat?','spray_info'],
    ['spray_info','Muzu po tom pit?','spray_usage'],
    ['spray_info','Muzu zaplatit kartou?','spray_payment'],
    ['spray_payment','Zaplatim sto ctyricet korun.','paid'],
    ['spray_payment','Hotove prosim.','paid'],
    ['syrup_info','Radsi tablety prosim.','tablets_info']
  ],
  'lekarna-2':[
    ['start','Jsem nachlazena a potrebuju neco.','symptoms'],
    ['symptoms','Teplotu nemam, kasel mam.','cough_type'],
    ['symptoms','Ani kasel ani teplotu nemam.','no_cough_help'],
    ['symptoms','Mam horecku.','fever_help'],
    ['cough_type','Je to suchy kasel. Kolik stoji kapky?','drops_info'],
    ['cough_type','Nevykaslavam zadny hlen.','drops_info'],
    ['cough_type','Kaslu a vykaslavam hleny.','pills_info'],
    ['cough_type','Nevim jaky kasel mam.','cough_help'],
    ['cough_help','Porad si nejsem jista.','consultation'],
    ['drops_info','Jeste nejake vitaminy prosim.','vitamins_drops'],
    ['drops_info','Nic dalsiho nechci.','payment_drops'],
    ['drops_info','Jak je mam uzivat?','usage_drops'],
    ['vitamins_drops','Vezmu to cecko.','payment_vitamins_drops'],
    ['vitamins_drops','Nakonec jen ten puvodni lek.','payment_drops'],
    ['payment_drops','Kartou prosim.','paid'],
    ['no_cough_help','Radeji jen vitaminy.','vitamins_only']
  ],
  'lekar-objednani':[
    ['start','Chtela bych termin na kontrolu.','reason'],
    ['reason','Nemam potize, jen prevenci.','days'],
    ['reason','Jsem nemocna, mam horecku.','symptom_help'],
    ['days','V utery nemuzu, ve stredu muzu.','wednesday_time'],
    ['days','Tak ve stredu a v kolik hodin?','wednesday_time'],
    ['days','Prijdu ve ctvrtek. Co mam mit s sebou?','thursday_bring'],
    ['days','V utery, muzu predtim jist?','tuesday_food'],
    ['days','Muzu prijit v patek?','alternatives'],
    ['wednesday_time','Dobře, ve 13:30 prijdu.','wednesday_done'],
    ['wednesday_time','Ano, ale ve 14:30.','wednesday_alternatives'],
    ['wednesday_time','V pul druhe odpoledne mi to vyhovuje.','wednesday_done'],
    ['wednesday_time','Musim prijit nalacno?','wednesday_food'],
    ['wednesday_food','Dobre, dekuji.','wednesday_done'],
    ['thursday_time','Tak radeji v utery.','tuesday_time'],
    ['wednesday_time','Muzu v jednu?','wednesday_alternatives']
  ],
  'lekar-zmena-terminu':[
    ['start','Potrebuju se preobjednat na jindy.','old_date'],
    ['start','Chci kontrolu zrusit.','cancel_check'],
    ['old_date','Na ctrnacteho dubna odpoledne.','name'],
    ['old_date','14/4.','name'],
    ['old_date','Na patnacteho dubna.','old_date_help'],
    ['old_date','Nepamatuju si to.','old_date_help'],
    ['name','Jsem Lucie Novakova.','availability'],
    ['name','Jmenuji se Pavel.','name_check'],
    ['availability','Mohl bych o tyden pozdeji?','may_offer'],
    ['availability','Co takhle nekdy v kvetnu?','date_offer'],
    ['may_offer','Moment podivam se do kalendare ano muzu.','changed'],
    ['may_offer','14.5. mi vyhovuje.','changed'],
    ['may_offer','Ano, ale 15.5.','may_alternatives'],
    ['may_offer','V kolik hodin tam mam byt?','may_time'],
    ['may_offer','Ten den bohuzel nemuzu.','may_alternatives'],
    ['may_offer','Necham puvodni termin.','kept']
  ]
};

test('batch 1 held-out meanings receive the correct reply and positive credit',()=>{
  const failures=[];
  for(const [id,cases]of Object.entries(routes))for(const [node,text,next]of cases) {
    const s=new c.DialogueSession(dialogue(id),c.DialogueConcepts);s.load(node);const result=s.answer(text);
    if(result.outcome!=='accepted'||result.response.next!==next||result.pointsEarned!==1)failures.push({id,node,text,next,actual:result.response.next,outcome:result.outcome,points:result.pointsEarned});
  }
  assert.deepEqual(failures,[]);
});

test('batch 1 preserves source order, source pages and broad open-prompt coverage',()=>{
  assert.equal(c.DialogueCatalog.length,10);
  for(const [i,d]of c.DialogueCatalog.slice(5).entries()) {
    assert.equal(d.source.dialogue,i+6);assert.equal(d.source.page,[6,7,7,8,8][i]);
    for(const [id,node]of Object.entries(d.nodes))if(node.openPrompt&&!id.startsWith('repeat_')) {
      const variants=new Set(node.responses.filter(r=>!r.id.startsWith('request_')&&!r.id.startsWith('leave_')).flatMap(r=>r.examples.map(c.DialogueMatcher.normalize)));
      assert.ok(variants.size>=10,d.id+'/'+id+': '+variants.size);
    }
  }
});

const paths={
  'ridicsky-prukaz-2':[
    ['Potřebuju nový řidičský průkaz.','Ne, nemám, ztratila jsem ho. Tady je vyplněná žádost. Fotku nepotřebujete, že?','Tady je můj pas. A jak dlouho to bude trvat?','A kolik to stojí?','Jasně. Spěchám, tak radši zaplatím víc. Můžu platit kartou?','Kartou prosím.','Na shledanou.'],
    ['Ztratil jsem řidičák.','Ztratil jsem ho.','Jaký doklad potřebujete?','Tady máte pas.','Stačí mi tři týdny.','Můžu platit kartou?','Zaplatím kartou.','Děkuji, na shledanou.']
  ],
  'lekarna-1':[
    ['Potřeboval bych něco na bolest v krku.','Kašel ne, ale mám rýmu.','Jaký je rozdíl? A kolik stojí, prosím vás?','Tak já bych si vzal ten sprej. A jak často ho mám používat?','Dobře, děkuju. Budu platit kartou.','Na shledanou.'],
    ['Bolí mě v krku.','Nic jiného nemám.','Máte něco levnějšího?','Ano, vezmu ten levnější.','Můžu platit kartou?','Hotově prosím.','Děkuji.']
  ],
  'lekarna-2':[
    ['Bolí mě v krku, asi jsem nachlazený. Můžete mi něco doporučit?','Teplotu ne, ale kašel ano.','Mám suchý kašel, takže ty kapky. A jaká je cena?','Ještě bych si vzal nějaké vitaminy.','Vezmu si tyhle, děkuji.','Zaplatím kartou.','Na shledanou.'],
    ['Jsem nachlazená.','Nemám teplotu, jen kašel.','Nevím, jaký mám kašel.','Vykašlávám hlen.','Nic dalšího.','Hotově prosím.','Děkuji, na shledanou.']
  ],
  'lekar-objednani':[
    ['Chci se objednat k panu doktorovi.','Ne, chtěla bych přijít na preventivní prohlídku.','Tak ve středu. V kolik hodin?','A můžu předtím jíst?','Dobře, děkuji.','Na shledanou.'],
    ['Chci termín na prohlídku.','Nemám problémy.','Máte něco v pátek?','Tak ve čtvrtek.','Můžu ve 14:30?','V půl druhé můžu.','Na shledanou.']
  ],
  'lekar-zmena-terminu':[
    ['Jsem objednaná k paní doktorce, ale nehodí se mi to. Můžu se objednat na jindy?','Na 14. dubna odpoledne.','Nováková, Lucie.','Šlo by to o týden později?','Moment, podívám se do kalendáře… Ano, můžu. Děkuju.','Na shledanou.'],
    ['Chci změnit termín kontroly.','Nepamatuju si termín.','Ano, to je ono.','Lucie Nováková.','Můžu v květnu.','V kolik hodin?','Ano, můžu.','Děkuji, na shledanou.']
  ]
};
for(const [id,sessions]of Object.entries(paths))test(id+': source and alternative conversations complete without skips',()=>{
  for(const path of sessions) {
    const s=new c.DialogueSession(dialogue(id),c.DialogueConcepts);
    for(const text of path) {
      const result=s.answer(text);assert.equal(result.outcome,'accepted',s.nodeId+': '+text);
      if(!result.complete)s.advance();
    }
    assert.equal(s.phase,'complete');assert.equal(s.skippedCount,0);
  }
});

test('appointment values distinguish dates and times from generic agreement',()=>{
  const time={kind:'time',allowed:['13:30'],mode:'match',afternoon:true};
  for(const text of ['13:30','13.30','ve třináct třicet','v půl druhé','v jednu třicet'])assert.equal(c.DialogueSlots.matches(text,time),true,text);
  for(const text of ['13:03','14:30','v jednu','ve čtrnáct třicet','ve 13:30 nebo 14:30'])assert.equal(c.DialogueSlots.matches(text,time),false,text);
  const date={kind:'date',allowed:['14-5'],mode:'match'};
  for(const text of ['14.5.','14/5','čtrnáctého května','14. května'])assert.equal(c.DialogueSlots.matches(text,date),true,text);
  for(const text of ['14.4.','15. května','čtrnáctého června','14.5. nebo 15.5.'])assert.equal(c.DialogueSlots.matches(text,date),false,text);
});

test('wrong payments and unchosen alternatives cannot silently complete a transaction',()=>{
  for(const [id,node,text,target]of [
    ['ridicsky-prukaz-2','standard_payment','Tady je 700 korun.','standard_done'],
    ['lekarna-1','spray_payment','Tady je osmdesát korun.','paid'],
    ['lekarna-1','spray_info','Můžu platit kartou?','paid'],
    ['lekarna-2','payment_drops','Tady je dvě stě korun.','paid'],
    ['lekar-objednani','wednesday_time','Ano, ve 14:30.','wednesday_done'],
    ['lekar-zmena-terminu','may_offer','Ano, 15. května.','changed']
  ]) {
    const d=dialogue(id),result=c.DialogueMatcher.evaluate(d.nodes[node],text,{...c.DialogueConcepts,...d.concepts});
    assert.ok(result.outcome!=='accepted'||result.response.next!==target,text);
  }
});

test('batch 1 authored responses also work without diacritics',()=>{
  for(const d of c.DialogueCatalog.slice(5))for(const [id,node]of Object.entries(d.nodes)) {
    if(id.startsWith('repeat_'))continue;
    for(const response of node.responses)for(const example of response.examples) {
      const text=example.normalize('NFD').replace(/\p{M}/gu,'');
      const result=c.DialogueMatcher.evaluate(node,text,{...c.DialogueConcepts,...d.concepts});
      assert.equal(result.outcome,'accepted',d.id+'/'+id+': '+text);
      assert.equal(result.response.next,response.next,d.id+'/'+id+': '+text);
    }
  }
});
