// Content for PDF dialogue 5, page 6. Fees/times are the PDF's practice scenario.
(function() {
  const concepts={},nodes={};
  const r=(id,next,examples)=>{concepts[id]=examples;return {id,intent:id,examples,match:{required:[id]},next,kind:'choice',reward:1};};
  const n=(id,clerk,translation,responses,retry,english)=>nodes[id]={clerk,translation,responses,retry:{clerk:retry,translation:english,next:responses[0].next}};
  const repeat=(id,source,clerk,translation)=>{const base=nodes[source],responses=base.responses.filter(r=>r.next!==id);nodes[id]={...base,clerk,translation,responses,retry:{...base.retry,next:responses[0].next}};};
  const again=['Nerozumím. Můžete to zopakovat?','Zopakujte to, prosím.','Můžete mluvit pomaleji?','Ještě jednou, prosím.','Nerozumím.'];
  const bye=['Děkuji, na shledanou.','Děkuju. Na shledanou.','Na shledanou.','Díky, nashledanou.'];

  n('start','Dobrý den. Co potřebujete vyřídit?','Hello. What do you need to arrange?',[
    r('replace_lost_licence','identity',['Dobrý den. Ztratila jsem řidičák a potřebuju nový.','Ztratil jsem řidičský průkaz. Potřebuji nový.','Potřebuju nový řidičák, starý jsem ztratil.','Ztratila jsem svůj řidičský průkaz.','Ztratil jsem řidičák.']),
    r('repeat_start','start_repeat',again)
  ],'Co jste ztratil nebo ztratila? Jaký nový doklad potřebujete?','What have you lost? What new document do you need?');
  repeat('start_repeat','start','Jaký doklad potřebujete? Řekněte mi, co se stalo.','What document do you need? Tell me what happened.');

  n('identity','Rozumím. Máte občanku nebo pas?','I understand. Do you have an identity card or a passport?',[
    r('explain_identity','identity_explained',['Co je průkaz totožnosti?','Co znamená občanka?','Jaký doklad potřebujete?','Nerozumím. Zopakujte to, prosím.','Nerozumím.']),
    r('no_identity','bring_identity',['Nemám u sebe žádný doklad.','Ne, pas ani občanku nemám.','Zapomněl jsem doklady doma.','Nemám.']),
    r('show_identity','form',['Ano, tady je můj pas.','Tady máte moji občanku.','Mám pas, prosím.','Ano, mám občanský průkaz.','Pas.','Občanku.'])
  ],'Potřebuji váš pas nebo občanku. Máte nějaký z těchto dokladů?','I need your passport or identity card. Do you have either of these documents?');
  repeat('identity_explained','identity','Potřebuji doklad s vaší fotografií a jménem. Může to být pas nebo občanka. Máte ho u sebe?','I need a document with your photo and name. It can be a passport or an identity card. Do you have it with you?');
  n('bring_identity','Bez dokladu dnes žádost nevyřídíme. Přineste prosím pas nebo občanku a vraťte se.','We cannot process the application today without identification. Please bring your passport or identity card and come back.',[
    r('return_with_document','identity',['Dobře, přinesu pas a vrátím se.','Dojdu pro občanku.','Přinesu si doklad.','Vrátím se s pasem.']),
    r('leave_for_today','later',['Dnes už nemůžu. Přijdu zítra.','Přijdu jiný den.','Vrátím se zítra.','Dnes nemám čas.'])
  ],'Přinesete doklad a vrátíte se, nebo přijdete jiný den?','Will you bring identification and come back, or come another day?');

  n('form','Vyplňte žádost a na druhé straně se podepište. Potom se ke mně vraťte.','Fill in the application and sign it on the other side. Then come back to me.',[
    r('ask_signature','signature_explained',['Kde se mám podepsat?','Na které straně mám podpis?','Kam mám dát podpis?','Kde mám podepsat žádost?']),
    r('explain_application','application_explained',['Co znamená žádost?','Co je žádost?','Nerozumím. Můžete to zopakovat?','Co mám vyplnit?']),
    r('completed_form_photo_question','photo_information',['Tady je ta žádost. Nepotřebujete fotku?','Žádost je hotová. Potřebujete fotografii?','Tady je formulář. Fotku nepotřebujete?','Potřebujete fotku?','Fotku mám přinést?']),
    r('completed_form','photo',['Tady je vyplněná žádost.','Vyplnil jsem žádost a podepsal ji.','Hotovo, žádost je podepsaná.','Hotovo.','Tady je žádost.'])
  ],'Vyplňte tento formulář a podepište ho na druhé straně. Pak mi ho vraťte.','Fill in this form and sign it on the other side. Then return it to me.');
  repeat('signature_explained','form','Podepište se na druhé straně dole. Pak mi vraťte vyplněnou žádost.','Sign at the bottom of the second side. Then return the completed application to me.');
  repeat('application_explained','form','Žádost je tento formulář. Napište jméno a adresu a na druhé straně se podepište. Pak mi ji vraťte.','The application is this form. Write your name and address and sign on the other side. Then return it to me.');
  for(const id of ['signature_explained','application_explained']){
    nodes[id].responses=nodes.form.responses.filter(r=>r.id.startsWith('completed_form'));
    nodes[id].retry.next='photo_information';
  }

  const photoAnswers=[
    r('repeat_photo','photo_explained',['Nerozumím.','Zopakujte otázku, prosím.','Můžete zopakovat otázku?','Mluvte pomaleji, prosím.']),
    r('retake_photo','photo_again',['Ne, nelíbí se mi. Můžete mě vyfotit znovu?','Mám zavřené oči. Ještě jednou, prosím.','Fotka není dobrá.','Znovu, prosím.','Ještě jednou, prosím.','Ne.']),
    r('accept_photo','times',['Ano, to je v pořádku. A za jak dlouho to bude hotové?','Fotka je dobrá. Kdy bude průkaz hotový?','Ano, je to v pořádku.','Fotka se mi líbí.','Ano.','Za jak dlouho bude průkaz hotový?'])
  ];
  n('photo_information','Ne, fotku nepotřebujete, vyfotím vás tady. Dívejte se do kamery. Hotovo. Může být?','No, you do not need a photo; I will photograph you here. Look into the camera. Done. Is this OK?',photoAnswers,'Je fotografie v pořádku, nebo vás mám vyfotit znovu?','Is the photo OK, or should I photograph you again?');
  n('photo','Děkuji za žádost. Teď vás vyfotím. Dívejte se do kamery. Hotovo. Může být?','Thank you for the application. Now I will photograph you. Look into the camera. Done. Is this OK?',photoAnswers,'Je fotografie v pořádku, nebo vás mám vyfotit znovu?','Is the photo OK, or should I photograph you again?');
  repeat('photo_explained','photo','Ptám se, jestli se vám fotka líbí. Můžeme ji nechat, nebo vás vyfotím znovu.','I am asking whether you like the photo. We can keep it, or I can photograph you again.');
  n('photo_again','Dobře, vyfotím vás ještě jednou. Hotovo. Je tato fotografie lepší?','All right, I will photograph you once more. Done. Is this photo better?',[
    r('accept_new_photo','times',['Ano, tato je lepší.','Teď je to v pořádku.','Tato fotka je dobrá.','Ano.','Kdy bude průkaz hotový?']),
    r('another_photo','photo_again',['Ještě jednou, prosím.','Ne, znovu.','Pořád mám zavřené oči.','Ani tato se mi nelíbí.'])
  ],'Je nová fotografie dobrá, nebo ji máme udělat znovu?','Is the new photo good, or should we take it again?');

  const serviceOptions=[
    r('explain_express','express_explained',['Co znamená expresní vydání?','Co je expresní?','Nerozumím, co znamená expresně.','Jaký je rozdíl?']),
    r('ask_fees','fees',['A kolik musím zaplatit?','Kolik to stojí?','Jaká je cena?','Kolik stojí normální a expresní vydání?','Kolik?']),
    r('repeat_times','times_repeat',['Za jak dlouho bude průkaz hotový?','Kdy si ho můžu vyzvednout?','Zopakujte termíny, prosím.','Jak dlouho to trvá?']),
    r('express_service','express',['Spěchám, potřebuji průkaz za pět dnů.','Chci expresní vydání.','Raději za pět dní.','Expresně, prosím.','Za pět dnů.']),
    r('standard_service','standard',['Stačí mi tři týdny.','Nespěchám, stačí normální vydání.','Chci standardní vydání.','Normálně, prosím.','Za tři týdny.'])
  ];
  n('times','Průkaz bude hotový za tři týdny. Jestli spěcháte, může to být za pět dnů, ale to je dražší.','The licence will be ready in three weeks. If you are in a hurry, it can be ready in five days, but that costs more.',serviceOptions,'Chcete počkat tři týdny, expresní vydání za pět dnů, nebo se zeptat na cenu?','Would you like to wait three weeks, use the five-day express service, or ask the price?');
  n('fees','Normální vydání stojí 200 korun, expresní vydání 700 korun. Které chcete?','Standard service costs 200 crowns and express service costs 700 crowns. Which would you like?',serviceOptions.filter(r=>r.id!=='ask_fees'),'Vyberte normální vydání za 200 korun, nebo expresní za 700 korun.','Choose standard service for 200 crowns or express service for 700 crowns.');
  repeat('express_explained','times','Expresní znamená rychlejší. Průkaz je za pět dnů a stojí 700 korun. Normálně je za tři týdny a stojí 200 korun. Co si vyberete?','Express means faster. The licence is ready in five days and costs 700 crowns. Standard service takes three weeks and costs 200 crowns. Which would you choose?');
  repeat('times_repeat','times','Normálně čekáte tři týdny. Expresně čekáte pět dnů. Co si vyberete?','With standard service you wait three weeks. With express service you wait five days. Which would you choose?');
  for(const id of ['express_explained','times_repeat']){
    nodes[id].responses=serviceOptions.filter(r=>['express_service','standard_service','ask_fees'].includes(r.id));
    nodes[id].retry.next='fees';
  }

  n('standard','Dobře, normální vydání. Zaplatíte 200 korun. Průkaz si vyzvednete za tři týdny.','All right, standard service. You will pay 200 crowns. You can collect the licence in three weeks.',[
    r('change_to_express','express',['Raději expresně.','Rozmyslela jsem si to, spěchám.','Chci to za pět dnů.','Změňte to na expresní vydání.']),
    r('pay_standard','standard_done',['Tady je 200 korun.','Zaplatím dvě stě korun.','Dobře, tady máte peníze.','Platím.']),
    r('ask_standard_collection','standard_collection',['Kde si průkaz vyzvednu?','Mám přijít sem?','Kdy a kde si ho vyzvednu?','Kde bude hotový průkaz?'])
  ],'Poplatek je 200 korun. Můžete zaplatit nebo se zeptat na vyzvednutí.','The fee is 200 crowns. You can pay or ask about collection.');
  n('express','Dobře, expresní vydání. Zaplatíte 700 korun. Průkaz si vyzvednete za pět dnů.','All right, express service. You will pay 700 crowns. You can collect the licence in five days.',[
    r('change_to_standard','standard',['Raději normálně.','To je moc drahé, počkám tři týdny.','Změňte to na normální vydání.','Stačí mi tři týdny.']),
    r('pay_express','express_done',['Tady je 700 korun.','Zaplatím sedm set korun.','Dobře, tady máte peníze.','Platím.']),
    r('ask_express_collection','express_collection',['Kde si průkaz vyzvednu?','Mám přijít sem?','Kdy a kde si ho vyzvednu?','Kde bude hotový průkaz?'])
  ],'Poplatek je 700 korun. Můžete zaplatit nebo se zeptat na vyzvednutí.','The fee is 700 crowns. You can pay or ask about collection.');
  n('standard_collection','Přijďte sem za tři týdny a vezměte si pas nebo občanku. Teď prosím zaplaťte 200 korun.','Come here in three weeks and bring your passport or identity card. Please pay 200 crowns now.',nodes.standard.responses.filter(r=>r.id!=='ask_standard_collection'),'Zaplaťte 200 korun, nebo požádejte o změnu na expresní vydání.','Pay 200 crowns, or ask to change to express service.');
  n('express_collection','Přijďte sem za pět dnů a vezměte si pas nebo občanku. Teď prosím zaplaťte 700 korun.','Come here in five days and bring your passport or identity card. Please pay 700 crowns now.',nodes.express.responses.filter(r=>r.id!=='ask_express_collection'),'Zaplaťte 700 korun, nebo požádejte o změnu na normální vydání.','Pay 700 crowns, or ask to change to standard service.');
  n('standard_done','Děkuji. Tady je potvrzení. Přijďte si za tři týdny pro nový průkaz. Na shledanou.','Thank you. Here is the receipt. Come for your new licence in three weeks. Goodbye.',[r('finish_standard',null,bye)],'Na shledanou.','Goodbye.');
  n('express_done','Děkuji. Tady je potvrzení. Přijďte si za pět dnů pro nový průkaz. Na shledanou.','Thank you. Here is the receipt. Come for your new licence in five days. Goodbye.',[r('finish_express',null,bye)],'Na shledanou.','Goodbye.');
  n('later','Dobře, až přijdete znovu, vezměte si pas nebo občanku. Na shledanou.','All right, bring your passport or identity card when you come back. Goodbye.',[r('finish_later',null,bye)],'Na shledanou.','Goodbye.');


  const tools=globalThis.ConversationTools(nodes,concepts);
  Object.assign(concepts,{
    repeatRequest:['říct ještě jednou','řekněte ještě jednou','mluvte pomaleji','nerozuměl','nerozuměla','opakujte otázku'],
    understood:['rozumím','dobře','jasně','aha','chápu','děkuji za vysvětlení'],
    notUnderstood:['nerozumím','nerozuměl','nerozuměla','nechápu','nevím'],
    licenceObject:['řidičák','řidičský průkaz','řidičského průkazu','řidičské oprávnění'],
    lostWords:['ztratil','ztratila','ztracený','ukradli','ukradený','nemám řidičák','nový','náhradní','duplikát'],
    identityYes:['pas','občanku','občanka','občanský průkaz','doklad','tady','zde','ano','mám'],
    identityNo:['nemám','zapomněl','zapomněla','bez dokladu','bez pasu','žádný doklad'],
    identityQuestion:['co je','co znamená','jaký doklad','co potřebujete','nerozumím','vysvětlit'],
    formObject:['žádost','žádosti','formulář','formuláře'],
    formDone:['hotovo','hotové','vyplnil','vyplnila','vyplněná','vyplněný','podepsaná','podepsal','podepsala','tady je'],
    formNotDone:['nevyplnil','nevyplnila','nepodepsal','nepodepsala','není hotová','nemám hotovo'],
    questionWords:['kde','kam','jak','co','které','který','kterou'],
    signatureWords:['podepsat','podpis','podepisuje','podepisovat'],
    photoObject:['fotku','fotka','fotografii','fotografie','fotografovat','vyfotit','fotit'],
    photoQuestion:['potřebujete','nepotřebujete','potřebuji','přinést','musím','nemám fotku'],
    photoBad:['ne','nelíbí','zavřené oči','špatná','není dobrá','znovu','znova','ještě jednou'],
    photoGood:['ano','v pořádku','dobrá','dobře','líbí','lepší','vyhovuje'],
    feesWords:['kolik','cena','cenu','poplatek','poplatky','zaplatit','stojí'],
    timeWords:['kdy','jak dlouho','termín','termíny','vyzvednout','hotový','čekat'],
    expressWords:['expresní','expresně','rychlejší','rychle','spěchám','pět dnů','pět dní'],
    standardWords:['normální','normálně','standardní','standardně','nespěchám','tři týdny'],
    expressQuery:['co znamená','co je','jaký je rozdíl','vysvětlíte','vysvětlit','nerozumím'],
    collectionWords:['kde','kam','sem','místo','vyzvednutí'],
    payWords:['tady','zde','platím','zaplatím','peníze','kartou','hotově'],
    cannotPay:['nemám peníze','nemůžu zaplatit','nemohu zaplatit','zaplatit později','zaplatím později'],
    paymentQuestion:['můžu platit','mohu platit','můžu zaplatit','mohu zaplatit','lze platit','berete karty','zaplatit kartou','platit kartou','zaplatit hotově','platit hotově'],
    returnWords:['přinesu','dojdu','vrátím se','donést','přinést'],
    laterWords:['jindy','zítra','později','jiný den','nemám čas','nemůžu'],
    refusal:['nechci','nevezmu','nezaplatím','nepotřebuji','nepotřebuju'],
    goodbyeWords:['na shledanou','nashledanou','hezký den','mějte se']
  });
  const set=(id,variants,patterns,forbidden=[],positive=[])=>tools.configure(id,variants,patterns,forbidden,positive);
  set('replace_lost_licence',['Ukradli mi řidičský průkaz.','Potřebuji náhradní řidičák.'],[['licenceObject','lostWords']],['refusal']);
  set('show_identity',['Ano, mám ho tady.','Přinesla jsem pas.'],[['identityYes']],['identityNo','identityQuestion']);
  set('no_identity',[],[['identityNo']]);
  set('explain_identity',[],[['identityQuestion']]);
  set('return_with_document',[],[['returnWords']],['laterWords']);
  set('leave_for_today',[],[['laterWords']]);
  set('ask_signature',[],[['questionWords','signatureWords']]);
  set('explain_application',[],[['questionWords','formObject']],['formDone','signatureWords','photoObject']);
  set('completed_form',[],[['formDone']],['formNotDone','photoObject','signatureWords']);
  // Signing is valid in a completed statement; a question about signing is a clarification.
  for(const n of Object.values(nodes))for(const r of n.responses)if(r.id==='completed_form')r.match.forbidden=['formNotDone','photoObject'];
  set('completed_form_photo_question',[],[['photoObject','photoQuestion']]);
  set('retake_photo',[],[['photoBad']]);
  set('accept_photo',[],[['photoGood'],['timeWords']],['photoBad']);
  set('accept_new_photo',[],[['photoGood'],['timeWords']],['photoBad']);
  set('another_photo',[],[['photoBad']]);
  set('ask_fees',[],[['feesWords']],['expressQuery']);
  set('repeat_times',[],[['timeWords']],['standardWords','expressWords']);
  set('express_service',[],[['expressWords']],['standardWords','expressQuery','feesWords','refusal'],['express_service','expressWords','standardWords']);
  set('standard_service',[],[['standardWords']],['expressWords','expressQuery','feesWords','refusal'],['standard_service','standardWords','expressWords']);
  set('explain_express',[],[['expressQuery']]);
  set('change_to_express',[],[['expressWords']],['standardWords','feesWords','refusal'],['change_to_express','expressWords','standardWords']);
  set('change_to_standard',[],[['standardWords']],['expressWords','feesWords','refusal'],['change_to_standard','standardWords','expressWords']);
  for(const id of ['pay_standard','pay_express'])set(id,[],[['payWords']],['paymentQuestion','collectionWords','refusal','cannotPay']);
  for(const id of ['ask_standard_collection','ask_express_collection'])set(id,[],[['collectionWords']],['paymentQuestion']);
  for(const id of ['finish_standard','finish_express','finish_later'])set(id,[],[['goodbyeWords']]);

  nodes.start.responses.push(tools.response('licence_reason','licence_reason_question',['Potřebuji nový průkaz.','Potřebuji nový doklad.'],{forbidden:['licenceObject']},0));
  tools.node('licence_reason_question','Myslíte řidičský průkaz? A co se stalo s tím starým?','Do you mean your driving licence? What happened to the old one?',[
    tools.response('explain_lost','identity',['Ztratil jsem ho.','Ztratila jsem ho.','Ukradli mi ho.','Ano, nový řidičák.'],{patterns:[['lostWords']],forbidden:['refusal']})
  ],'start');
  tools.clarify('identity','identity_explained','Potřebuji doklad s vaším jménem a fotografií, například pas nebo občanku. Máte ho u sebe?','I need a document with your name and photo, such as a passport or identity card. Do you have it with you?');
  tools.clarify('form','signature_explained','Podepište se dole na druhé straně. Potom mi vraťte vyplněnou žádost.','Sign at the bottom of the second page, then return the completed application to me.');
  tools.clarify('form','application_explained','Žádost je tento formulář. Vyplňte údaje a podepište se na druhé straně. Potom mi ji vraťte.','The application is this form. Fill in the details and sign the second page, then return it to me.');
  const formHelp=tools.response('need_form_help','form_help',['Nevím, jak to vyplnit.','Můžete mi pomoct s formulářem?','Nemám pero.','Co mám napsat?'],{patterns:[['notUnderstood','formObject']]},0);
  nodes.form.responses.push(formHelp);
  tools.clarify('form','form_help','Napište své jméno a adresu do označených polí. Pero je tady. Potom se podepište a vraťte mi formulář.','Write your name and address in the marked fields. The pen is here. Then sign and return the form.');
  const photoPurpose=tools.response('photo_explanation','photo_instructions',['Proč mě fotíte?','Kam se mám dívat?','Mám si sundat brýle?','Jak mě vyfotíte?'],{patterns:[['questionWords','photoObject']]},0);
  for(const id of ['photo','photo_information','photo_again'])nodes[id].responses.push(photoPurpose);
  tools.clarify('photo','photo_instructions','Fotografie bude na novém průkazu. Podívejte se do kamery. Teď vám ukážu výsledek. Je v pořádku, nebo chcete další fotku?','The photo will be on your new licence. Look at the camera. I will show you the result. Is it OK, or would you like another photo?');
  const feesAgain=tools.response('fees_clarification','fees_explained',['Kolik to stojí?','Můžete zopakovat cenu?','Kolik stojí normální vydání?','To je drahé, nemáte levnější?'],{patterns:[['feesWords']]},0);
  nodes.fees.responses.push(feesAgain);
  tools.node('fees_explained','V tomto příkladu stojí normální vydání 200 korun a trvá tři týdny. Expresní je za 700 korun a pět dnů. Které chcete?','In this practice example, standard service costs 200 crowns and takes three weeks. Express costs 700 crowns and takes five days. Which would you like?',nodes.fees.responses.filter(r=>r.id!=='fees_clarification'),'fees');
  tools.clarify('times','express_explained','Expresní znamená rychlejší vydání za pět dnů. Normální trvá tři týdny. Chcete rychlejší vydání, normální vydání, nebo vědět cenu?','Express means faster service in five days. Standard takes three weeks. Would you like express, standard, or to know the price?');
  for(const mode of ['standard','express']) {
    const payment=tools.response('ask_'+mode+'_payment',mode+'_payment',['Můžu platit kartou?','Mohu zaplatit hotově?','Berete karty?'],{patterns:[['paymentQuestion']]},0);
    nodes[mode].responses.push(payment);nodes[mode+'_collection'].responses.push(payment);
    tools.node(mode+'_payment','V tomto příkladu můžete platit kartou nebo hotově. Jak chcete zaplatit?','In this practice example, you can pay by card or cash. How would you like to pay?',[
      nodes[mode].responses.find(r=>r.id==='pay_'+mode),
      nodes[mode].responses.find(r=>r.id==='ask_'+mode+'_collection')
    ],mode);
    nodes[mode].responses.push(feesAgain);
    const paymentHelp=tools.response('cannot_pay_'+mode,mode+'_payment_help',['Nemám teď peníze.','Můžu zaplatit později?'],{patterns:[['cannotPay']]},0);
    nodes[mode].responses.push(paymentHelp);nodes[mode+'_payment'].responses.push(paymentHelp);
    tools.node(mode+'_payment_help','Můžete přijít zaplatit později. Než žádost dokončíme, potřebujeme poplatek. Chcete přijít jindy, nebo pokračovat teď?','You can return to pay later. In this practice situation, we need the fee before completing the application. Would you like to return another time or continue now?',[
      tools.response('return_to_pay_'+mode,'later',['Přijdu zítra.','Vrátím se později.'],{patterns:[['laterWords']]}),
      tools.response('pay_now_'+mode,mode,['Dobře, zaplatím teď.','Tak budu platit kartou.'],{patterns:[['payWords']],forbidden:['cannotPay']},0)
    ],mode);
  }
  globalThis.ExpandedIntents.licence(nodes,concepts,tools);
  tools.rejoin('start_repeat','start');
  for(const [id,source]of [['identity_explained','identity'],['signature_explained','form'],['application_explained','form'],['form_help','form'],['photo_instructions','photo'],['photo_explained','photo'],['express_explained','times'],['times_repeat','times'],['fees_explained','fees']])tools.rejoin(id,source);
  tools.repeatSupport();

  globalThis.DialogueCatalog.push({schemaVersion:1,matchingRevision:2,id:'ridicsky-prukaz-1',title:'5. Úřad – řidičský průkaz (varianta 1)',clerkLabel:'Úředník (Clerk)',situation:'Jste na úřadě. Ztratil/a jste řidičský průkaz a potřebujete nový průkaz.',situationTranslation:'You are at an administrative office. You have lost your driving licence and need a new licence.',source:{file:'zkouska_A2_uloha_2_dialogy_1-rayoyf.pdf',page:6,dialogue:5},start:'start',concepts,nodes});
})();
