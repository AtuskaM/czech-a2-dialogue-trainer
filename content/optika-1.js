// Content for PDF dialogue 3, page 5. Matching metadata is inactive;
// the approved engine grades examples using bestMatch at 40%.
(function() {
  const concepts={},nodes={};
  const r=(id,next,examples)=>{concepts[id]=examples;return {id,intent:id,examples,match:{required:[id]},next,kind:'choice',reward:1};};
  const n=(id,clerk,translation,responses,retry,english)=>nodes[id]={clerk,translation,responses,retry:{clerk:retry,translation:english,next:responses[0].next}};
  const repeat=(id,source,clerk,translation)=>{const base=nodes[source],responses=base.responses.filter(r=>r.next!==id);nodes[id]={...base,clerk,translation,responses,retry:{...base.retry,next:responses[0].next}};};
  const again=['Nerozumím. Můžete to zopakovat?','Zopakujte to, prosím.','Můžete mluvit pomaleji?','Ještě jednou, prosím.','Nerozumím.'];
  const bye=['Děkuji, na shledanou.','Děkuju. Na shledanou.','Na shledanou.','Díky, nashledanou.'];

  n('start','Dobrý den. Jak vám můžu pomoct?','Hello. How can I help you?',[
    r('buy_glasses','prescription',['Dobrý den. Mám rozbité brýle a potřeboval bych nové.','Rozbila jsem si brýle. Potřebuji nové.','Potřebuji nové brýle.','Chtěl bych si koupit brýle.','Mám rozbité brýle.']),
    r('repeat_start','start_repeat',again)
  ],'Potřebujete nové brýle? Řekněte mi, s čím vám můžu pomoct.','Do you need new glasses? Tell me what I can help you with.');
  repeat('start_repeat','start','Co potřebujete? Chcete si koupit nové brýle?','What do you need? Would you like to buy new glasses?');

  n('prescription','Aha, a máte předpis od lékaře?','I see. Do you have a prescription from a doctor?',[
    r('explain_prescription','prescription_explained',['Co znamená předpis?','Co je to předpis?','Předpis? Nerozumím.','Jaký předpis potřebujete?']),
    r('repeat_prescription','prescription_repeat',again),
    r('no_prescription','eye_test',['Bohužel nemám. Ale tady jsou moje staré brýle. Pomůže to?','Předpis nemám. Mám jen staré brýle.','Ne, nemám předpis.','Bohužel nemám.','Nemám.']),
    r('has_prescription','frames',['Ano, tady je předpis.','Mám předpis od lékaře.','Tady mám předpis.','Ano, mám.','Ano.'])
  ],'Máte předpis od lékaře, nebo ho nemáte?','Do you have a prescription from a doctor, or not?');
  repeat('prescription_explained','prescription','Předpis je papír od očního lékaře. Je na něm napsáno, jaké brýle potřebujete. Máte ho?','A prescription is a paper from the eye doctor. It says what glasses you need. Do you have it?');
  repeat('prescription_repeat','prescription','Máte papír od očního lékaře na nové brýle?','Do you have a paper from the eye doctor for new glasses?');
  // Avoid explanation/repetition loops; the answer still selects the real yes/no path.
  for(const id of ['prescription_explained','prescription_repeat']){
    nodes[id].responses=nodes.prescription.responses.filter(r=>['has_prescription','no_prescription'].includes(r.id));
    nodes[id].retry.next='eye_test';
  }

  n('eye_test','Nevadí. Pokud máte staré brýle, podívám se na ně. Ještě vám změřím zrak. Souhlasíte?','That is all right. If you have your old glasses, I will look at them. I will also test your eyesight. Is that OK?',[
    r('agree_test','frames',['Ano, změřte mi zrak.','Dobře, souhlasím.','Ano, prosím.','Můžete mi změřit zrak.']),
    r('bring_prescription_later','later',['Raději přinesu předpis.','Přijdu později s předpisem.','Dnes nemám čas. Přijdu jindy.','Vrátím se s předpisem.']),
    r('explain_test','test_explained',['Co znamená změřit zrak?','Jak mi změříte zrak?','Co budete dělat?','Nerozumím.'])
  ],'Můžeme vám teď změřit zrak, nebo přijdete později s předpisem.','We can test your eyesight now, or you can come back later with a prescription.');
  repeat('test_explained','eye_test','Podíváte se na písmena a řeknete mi, co vidíte. Můžeme začít, nebo přijdete jindy?','You will look at letters and tell me what you see. Can we begin, or will you come another time?');

  n('frames','Dobře. Jaké brýle chcete? Máme malé kovové hranaté brýle i kulaté plastové.','Good. What glasses would you like? We have small rectangular metal glasses and round plastic ones.',[
    r('explain_frames','frames_explained',['Co znamená kovové?','Co jsou kovové brýle?','Co znamená hranaté?','Nerozumím. Zopakujte to, prosím.']),
    r('metal_frames','try_metal',['Prosím nějaké malé a kovové. Máte nějaké hranaté?','Chtěla bych malé kovové brýle.','Ty kovové hranaté, prosím.','Malé a hranaté.','Kovové.']),
    r('plastic_frames','try_plastic',['Chtěl bych kulaté plastové brýle.','Raději plastové.','Ty kulaté, prosím.','Plastové brýle.','Kulaté.'])
  ],'Chcete kovové hranaté brýle, nebo plastové kulaté?','Would you like rectangular metal glasses or round plastic glasses?');
  repeat('frames_explained','frames','Kovové znamená z kovu. Hranaté mají rohy, kulaté mají tvar kruhu. Chcete kovové hranaté, nebo plastové kulaté?','Metal means made of metal. Rectangular frames have corners; round frames are shaped like a circle. Would you like the rectangular metal ones or the round plastic ones?');

 const fit=[
  r('need_larger','try_another',[
    'Jsou malé. Máte větší?',
    'Jsou moc těsné.',
    'Jsou mi malé.',
    'Potřebuji větší.'
  ]),

  r('need_smaller','try_smaller',[
    'Ne, jsou mi trochu velké.',
    'Jsou mi velké.',
    'Jsou moc velké.',
    'Máte menší?',
    'Potřebuji menší.'
  ]),

  r('different_frames','try_another',[
    'Nesedí mi. Chci jiné.',
    'Tyhle nechci, prosím jiné.'
  ]),

  r('frames_fit','price',[
    'Myslím, že jsou dobré. Kolik stojí?',
    'Tyhle mi sedí. Jaká je cena?',
    'Jsou dobré.',
    'Sedí mi dobře.',
    'Kolik stojí?',
    'Kolik za ně zaplatím?'
  ]),

  r('repeat_fit','fit_explained',again)
];
  n('try_metal','Tady jsou malé kovové hranaté brýle. Zkuste si je. Jak vám sedí?','Here are small rectangular metal glasses. Try them on. How do they fit?',fit,'Jsou vám dobré, nebo potřebujete jinou velikost?','Do they fit, or do you need a different size?');
  n('try_plastic','Tady jsou kulaté plastové brýle. Zkuste si je. Jak vám sedí?','Here are round plastic glasses. Try them on. How do they fit?',fit,'Jsou vám dobré, nebo potřebujete jinou velikost?','Do they fit, or do you need a different size?');
  n('try_another','Zkuste tyto větší. Tento model stojí stejně. Sedí vám lépe?','Try these larger ones. This model costs the same. Do they fit you better?',[
    r('larger_fit','price',['Ano, tyhle jsou lepší.','Tyto mi sedí dobře.','Ano, jsou dobré.','Kolik stojí?']),
    r('no_suitable_frames','later',['Bohužel mi nesedí.','Ani tyto mi nejsou dobře.','Raději přijdu jindy.','Ne, nechci je.'])
  ],'Sedí vám tyto brýle, nebo chcete nákup nechat na jindy?','Do these glasses fit, or would you like to leave the purchase for another time?');
  
n('try_smaller',
  'Rozumím. Zkuste tyto menší. Sedí vám lépe?',
  'I understand. Try these smaller ones. Do they fit you better?',
  [
    r('smaller_fit','price',[
      'Ano, tyhle jsou lepší.',
      'Tyto mi sedí dobře.',
      'Ano, jsou dobré.',
      'Sedí mi lépe.',
      'Kolik stojí?'
    ]),

    r('no_suitable_smaller_frames','later',[
      'Bohužel mi nesedí.',
      'Ani tyto mi nejsou dobře.',
      'Raději přijdu jindy.',
      'Ne, nechci je.'
    ])
  ],
  'Sedí vám tyto menší brýle, nebo chcete přijít jindy?',
  'Do these smaller glasses fit, or would you prefer to come back another time?'
);

repeat('fit_explained','try_metal','Jsou vám tyto brýle dobré? Nebo jsou moc těsné?','Do these glasses fit you? Or are they too tight?');

  n('price','Tyto brýle stojí 1500 korun.','These glasses cost 1,500 crowns.',[
    r('ask_ready','ready',['Kdy budou brýle hotové?','Za jak dlouho budou hotové?','Kdy si je můžu vyzvednout?','Jak dlouho to bude trvat?']),
    r('decline_purchase','later',['To je drahé. Rozmyslím si to.','Jsou moc drahé.','Nekoupím je.','Teď si je nevezmu.']),
    r('buy_selected','collection',['Dobře, vezmu si je.','Tyto brýle si koupím.','Beru je.','Vezmu si tyhle.']),
    r('repeat_price','price_repeat',['Kolik stojí?','Jaká je cena?','Kolik jste říkala?','Zopakujte cenu, prosím.'])
  ],'Cena je 1500 korun. Chcete si je koupit, nebo se nejdřív zeptat na termín?','The price is 1,500 crowns. Would you like to buy them or first ask when they will be ready?');
  repeat('price_repeat','price','Cena je 1500 korun. Chcete si tyto brýle koupit?','The price is 1,500 crowns. Would you like to buy these glasses?');
  n('ready','Brýle budou hotové za týden. Vyhovuje vám to?','The glasses will be ready in a week. Does that suit you?',[
    r('accept_week','collection',['Ano, za týden je to v pořádku.','Týden mi vyhovuje. Vezmu si je.','Dobře, počkám týden.','Ano, koupím je.']),
    r('cannot_wait','later',['Týden je moc dlouho.','Potřebuji je hned.','Nemůžu čekat týden.','Rozmyslím si to.'])
  ],'Můžete počkat týden, nebo nákup necháte na jindy?','Can you wait a week, or would you like to leave the purchase for another time?');
  n('collection','Dobře, objednávku jsem zapsala. Brýle si vyzvednete tady za týden. Na shledanou.','Good, I have placed the order. You can collect the glasses here in a week. Goodbye.',[r('finish',null,bye)],'Děkuji za objednávku. Na shledanou.','Thank you for the order. Goodbye.');
  n('later','Dobře, můžete přijít později. Na shledanou.','All right, you can come back later. Goodbye.',[r('finish_later',null,bye)],'Na shledanou.','Goodbye.');

  globalThis.DialogueCatalog.push({schemaVersion:1,id:'optika-1',title:'3. Optika – nové brýle (varianta 1)',clerkLabel:'Optička (Optician)',situation:'Jste v optice a potřebujete si koupit brýle.',situationTranslation:'You are at an optician’s and you need to buy glasses.',source:{file:'zkouska_A2_uloha_2_dialogy_1-rayoyf.pdf',page:5,dialogue:3},start:'start',concepts,nodes});
})();
