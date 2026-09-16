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

  globalThis.DialogueCatalog.push({schemaVersion:1,id:'ridicsky-prukaz-1',title:'5. Úřad – řidičský průkaz (varianta 1)',clerkLabel:'Úředník (Clerk)',situation:'Jste na úřadě. Ztratil/a jste řidičský průkaz a potřebujete nový průkaz.',situationTranslation:'You are at an administrative office. You have lost your driving licence and need a new licence.',source:{file:'zkouska_A2_uloha_2_dialogy_1-rayoyf.pdf',page:6,dialogue:5},start:'start',concepts,nodes});
})();
