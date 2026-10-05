(function(root) {
  const {c,nodes,t,r,n,finish}=root.BatchDialogue({id:'lekarna-1',title:'7. Lékárna (varianta 1)',clerkLabel:'Lékárnice (Pharmacist)',
    situation:'Jste v lékárně. Bolí vás v krku a potřebujete si koupit lék.',situationTranslation:'You are at a pharmacy. You have a sore throat and need to buy medicine.',
    source:{file:'zkouska_A2_uloha_2_dialogy_1-rayoyf.pdf',page:7,dialogue:7}}, {
      throat:['bolest v krku','bolí mě v krku','bolí v krku','škrábe v krku','na krk','na bolest','nachlazený','nachlazená'],
      symptoms:['kašel','kašlu','rýmu','rýma','ucpaný nos','smrkám','teplotu','horečku'],
      none:['ne','nemám','nekašlu','nic jiného','jen krk','jenom krk','pouze krk'],
      spray:['sprej','spreje','sprejem'],syrup:['sirup','sirupu','sirupem'],tablets:['tablety','tablet','tabletami','prášky'],
      useQuestion:['jak často','kolikrát','jak používat','jak ho používat','jak je používat','dávkování','jak se používá','jak to brát','jak užívat'],
      eatQuestion:['jíst','pít','jídlo','pití','půl hodiny','třicet minut'],
      safetyQuestion:['alergii','alergický','alergická','těhotná','jiné léky','vedlejší účinky','pro děti'],
      expensive:['drahé','drahý','levnější','nejlevnější','málo peněz','nemám tolik'],
      declineAll:['nic nechci','nechci žádný','nechci žádné','nekoupím nic'],
      confirm:['ano','dobře','vezmu','beru','chci ho','chci je','to bude dobré','tak jo'],
      notSore:['nebolí','nechci nic na krk']
    });
  n('start','Dobrý den, jak vám můžu pomoct?','Hello. How can I help you?',[
    r('sore_throat','symptoms',['Potřeboval bych něco na bolest v krku.','Potřebovala bych něco na krk.','Bolí mě v krku.','Škrábe mě v krku, máte na to něco?','Chci lék na bolest v krku.','Jsem nachlazená a bolí mě v krku.','Mám bolest v krku.'],[['throat']],['notSore']),
    r('other_symptoms','symptoms',['Mám rýmu.','Potřebuji něco na kašel.','Jsem nachlazený.','Kašlu a potřebuju lék.'],[['symptoms']]),
    r('opening_advice','opening_advice',['Můžete mi něco doporučit?','Nevím, jaký lék potřebuji.','Chtěl bych poradit.','Potřebuji pomoc s výběrem.'],[['help']])
  ]);
  t.clarify('start','opening_advice','Řekněte mi, co vás trápí. Bolí vás v krku, máte rýmu nebo kašel?','Tell me what is bothering you. Do you have a sore throat, a runny nose or a cough?');
  n('symptoms','A máte kašel nebo jiné potíže?','Do you have a cough or any other symptoms?',[
    r('describe_symptoms','offer',['Kašel ne, ale mám rýmu.','Nemám kašel, jen rýmu.','Ano, taky kašlu.','Mám ucpaný nos.','Mám rýmu a trochu kašlu.','Kašel mám, rýmu ne.'],[['symptoms']]),
    r('no_other_symptoms','offer',['Ne, jen mě bolí v krku.','Nic jiného nemám.','Nemám jiné potíže.','Nekašlu.','Jenom ten krk.'],[['none']]),
    r('symptoms_explain','symptoms_help',['Co znamená potíže?','Jaké jiné potíže myslíte?','Co je kašel?','Nerozumím otázce.'])
  ]);
  t.clarify('symptoms','symptoms_help','Ptám se, jestli kromě bolesti v krku kašlete, máte rýmu, nebo vás trápí ještě něco jiného.','I am asking whether, besides the sore throat, you have a cough, a runny nose or something else bothering you.');
  const choices=[
    r('choose_spray','spray_info',['Tak já bych si vzal ten sprej. A jak často ho mám používat?','Vezmu si sprej.','Sprej prosím.','Raději ten sprej.','Chtěla bych sprej.'],[['spray']],['syrup','tablets','refuse'],0,['spray','syrup','tablets']),
    r('choose_syrup','syrup_info',['Radši sirup.','Vezmu ten sirup.','Chtěl bych sirup.','Sirup prosím.','Kolik stojí sirup?'],[['syrup']],['spray','tablets','refuse'],0,['spray','syrup','tablets']),
    r('choose_tablets','tablets_info',['Zkusím tablety.','Chtěla bych rozpustné tablety.','Vezmu ty tablety.','Prášky prosím.','Kolik stojí tablety?'],[['tablets']],['spray','syrup','refuse'],0,['spray','syrup','tablets']),
    r('compare_products','details',['Jaký je rozdíl? A kolik stojí, prosím vás?','Kolik to stojí?','Jaký je mezi nimi rozdíl?','Co mi doporučíte?','Nevím, co vybrat.'],[['askDifference'],['help']],[],20),
    r('all_prices','details',['Jaké jsou ceny?','A za kolik jsou?','Kolik stojí všechny možnosti?','Můžete mi říct ceny?'],[['askPrice']],['spray','syrup','tablets']),
    r('cheaper_product','cheap',['To je drahé.','Máte něco levnějšího?','Co je nejlevnější?','Nemám tolik peněz.'],[['expensive']],[],30),
    r('reject_product','alternatives',['Sprej nechci.','Sirup nechci.','Tablety nechci.','Nechci tenhle lék.'],[['refuse']],[],10),
    r('ask_safety','safety',['Mám alergii.','Beru jiné léky.','Je to vhodné pro děti?','Jsem těhotná, můžu to používat?'],[['safetyQuestion']],[],40)
  ];
  n('offer','Můžu vám nabídnout sprej, sirup nebo rozpustné tablety.','I can offer a spray, syrup or dissolvable tablets.',choices);
  n('details','Sprej stojí 140 korun, sirup 80 korun a rozpustné tablety 200 korun. Liší se způsobem použití. Kterou možnost chcete probrat?','The spray costs 140 crowns, syrup 80 crowns and dissolvable tablets 200 crowns. They differ in how they are used. Which option would you like to discuss?',choices);
  n('cheap','Z těchto možností je nejlevnější sirup za 80 korun. Chcete ho, nebo raději jinou možnost?','Of these options, the syrup is cheapest at 80 crowns. Would you like it or another option?',[
    r('take_cheap','syrup_info',['Ano, vezmu ten levnější.','Dobře, tak sirup.','Ten za osmdesát prosím.','Ano, to mi vyhovuje.'],[],[],35),...choices
  ]);
  n('alternatives','Dobře, vybereme jinou možnost. Máme sprej, sirup a rozpustné tablety. Co by vám vyhovovalo?','All right, let us choose another option. We have a spray, syrup and dissolvable tablets. What would suit you?',choices);
  n('safety','Děkuji, že mi to říkáte. Nejdřív ověříme, který přípravek je pro vás vhodný. Chcete probrat jinou možnost, nebo se nejdřív poradit s lékařem?','Thank you for telling me. First we will check which product is suitable for you. Would you like to discuss another option, or consult your doctor first?',[
    r('discuss_alternative','offer',['Probereme jiné možnosti.','Můžeme vybrat jiný přípravek.','Chci se zeptat na jiný lék.','Ano, jinou možnost.','Co jiného máte?']),
    r('consult_doctor','leave',['Nejdřív se poradím s lékařem.','Zavolám doktorovi.','Raději zatím nic nekoupím.','Nejdřív si to ověřím.','Přijdu potom.'])
  ]);
  for(const [product,price,cz,en]of [
    ['spray',140,'Tento sprej stojí 140 korun. Používá se dvakrát až třikrát denně. Potom 30 minut nejezte ani nepijte. Chcete ho?', 'This spray costs 140 crowns. It is used two to three times a day. Do not eat or drink for 30 minutes afterwards. Would you like it?'],
    ['syrup',80,'Tento sirup stojí 80 korun. Způsob použití spolu zkontrolujeme v příbalovém letáku. Chcete ho?','This syrup costs 80 crowns. We will check its instructions in the leaflet together. Would you like it?'],
    ['tablets',200,'Tyto rozpustné tablety stojí 200 korun. Způsob použití spolu zkontrolujeme v příbalovém letáku. Chcete je?','These dissolvable tablets cost 200 crowns. We will check their instructions in the leaflet together. Would you like them?']
  ]) {
    const responses=[
      r('pay_'+product,'paid',['Dobře, děkuju. Budu platit kartou.','Zaplatím hotově.','Kartou prosím.','Tady máte '+price+' korun.'],[['pay']],['payQuestion','noPay','refuse'],10),
      r('confirm_'+product,product+'_payment',['Ano, vezmu si ho.','Dobře, beru.','Ano prosím.','Tak jo, koupím to.','To bude dobré.'],[['confirm']],['no','refuse','payQuestion','askPrice','useQuestion','eatQuestion']),
      r('payment_question_'+product,product+'_payment',['Můžu platit kartou?','Berete karty?','Můžu zaplatit hotově?','Dá se platit kartou?'],[['payQuestion']],[],30),
      r('usage_'+product,product+'_usage',['Jak často to mám používat?','Kolikrát denně?','Jak je to s jídlem?','Můžu potom pít?'],[['useQuestion'],['eatQuestion']],['spray','syrup','tablets'].filter(p=>p!==product),30),
      ...choices.filter(x=>x.id!=='choose_'+product)
    ];
    responses[0].match.allowedAmounts=[price];
    n(product+'_info',cz,en,responses);
    n(product+'_usage',product==='spray'?'U tohoto spreje je to dvakrát až třikrát denně. Po použití půl hodiny nejezte ani nepijte. Chcete ho koupit?':'Použití záleží na konkrétním přípravku. Ukážu vám pokyny v příbalovém letáku. Chcete tento přípravek?',
      product==='spray'?'For this spray, it is two to three times daily. Do not eat or drink for half an hour afterwards. Would you like to buy it?':'Use depends on the specific product. I will show you the instructions in its leaflet. Would you like this product?',responses);
    nodes[product+'_usage'].creditKey=product+'_info';
    n(product+'_payment','Můžete platit kartou nebo hotově. Celkem je to '+price+' korun. Jak zaplatíte?','You can pay by card or cash. The total is '+price+' crowns. How would you like to pay?',[
      responses[0],responses[2],
      r('no_money_'+product,'cheap',['Nemám tolik peněz.','To je na mě moc.','Nemůžu zaplatit.','Máte levnější?'],[['noPay'],['expensive']],[],40)
    ]);
  }
  n('paid','Děkuji. Tady je účtenka. Na shledanou.','Thank you. Here is your receipt. Goodbye.',[
    r('finish_sale',null,['Děkuji, na shledanou.','Děkuju.','Na shledanou.','Hezký den.'],[['bye']])
  ],false);
  for(const id of ['details','cheap','alternatives'])nodes[id].creditKey='offer';
  for(const response of choices)if(response.id.startsWith('choose_')) {
    response.match.forbidden=response.match.forbidden.filter(x=>x!=='refuse');
    response.match.positiveConcepts.push(response.id);response.match.priority=20;
  }
  finish();
})(globalThis);
