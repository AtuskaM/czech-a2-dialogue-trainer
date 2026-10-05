(function(root) {
  const {c,nodes,t,r,n,finish}=root.BatchDialogue({id:'lekarna-2',title:'8. Lékárna (varianta 2)',clerkLabel:'Lékárnice (Pharmacist)',
    situation:'Jste v lékárně. Jste nachlazený/á, bolí vás v krku a chcete si koupit lék.',situationTranslation:'You are at a pharmacy. You have a cold and a sore throat and want to buy medicine.',
    source:{file:'zkouska_A2_uloha_2_dialogy_1-rayoyf.pdf',page:7,dialogue:8}}, {
      illness:['bolí mě v krku','bolest v krku','nachlazený','nachlazená','kašel','kašlu','rýmu','rýma'],
      fever:['teplotu','horečku','horečka'],noFever:['teplotu ne','teplotu nemám','nemám teplotu','bez teploty','nemám horečku','horečku ne','ani teplotu','ani horečku'],
      cough:['kašel','kašlu'],noCough:['nekašlu','kašel nemám','nemám kašel','kašel ne','ani kašel'],
      dry:['suchý','suchého','dráždivý','nevykašlávám','bez hlenu'],wet:['hlen','hleny','vykašlávám','vlhký','vlhkého'],
      drops:['kapky','kapek','kapkami'],pills:['prášky','tabletky','tablety','tablet'],
      vitamins:['vitaminy','vitamíny','vitamin','vitamín','vitamínů'],vitaminC:['céčko','vitamin c','vitamín c','tyhle','tyto'],
      noExtra:['nic dalšího','nic jiného','to je všechno','to bude vše','jen kapky','jen prášky','jen lék','nechci vitaminy'],
      usage:['jak často','jak používat','jak užívat','kolikrát','dávkování','jak se berou','užívat','používat'],
      expensive:['drahé','levnější','nemám tolik','moc peněz'],
      safety:['alergii','alergický','alergická','těhotná','jiné léky','vedlejší účinky'],
      actualWet:['vykašlávám','vlhký','vlhkého'],
      unsure:['nejsem jistá','nejsem si jistá','nejsem jistý','nejsem si jistý','pořád nevím'],
      coughAffirm:['kašel mám','mám kašel','kašlu']
    });
  n('start','Dobrý den, co si přejete?','Hello. What would you like?',[
    r('cold','symptoms',['Bolí mě v krku, asi jsem nachlazený. Můžete mi něco doporučit?','Jsem nachlazená.','Potřebuji něco na kašel.','Mám bolest v krku.','Kašlu a bolí mě v krku.','Mám rýmu.'],[['illness']]),
    r('advice','opening_help',['Můžete mi poradit?','Chtěla bych nějaký lék.','Nevím, co si koupit.','Potřebuji pomoc.','Co byste mi doporučila?'],[['help']])
  ]);
  t.clarify('start','opening_help','Řekněte mi prosím, jaké máte potíže. Bolí vás v krku nebo kašlete?','Please tell me your symptoms. Do you have a sore throat or a cough?');
  n('symptoms','Máte teplotu a kašel?','Do you have a fever and a cough?',[
    r('cough_report','cough_type',['Teplotu ne, ale kašel ano.','Nemám teplotu, jen kašel.','Kašlu, horečku nemám.','Ano, kašel mám.','Mám suchý kašel.','Kašel ano.'],[['cough']],['noCough','fever'],0,['fever']),
    r('affirm_cough','cough_type',['Teplotu nemám, kašel mám.','Kašel mám, teplotu ne.','Ano, kašlu.'],[['coughAffirm']],['fever'],35,['coughAffirm','fever']),
    r('no_cough','no_cough_help',['Ne, ani jedno.','Kašel nemám.','Nemám teplotu ani kašel.','Nekašlu, jen mě bolí v krku.','Ani teplotu ani kašel.'],[['noCough']],[],20),
    r('fever_report','fever_help',['Ano, mám horečku.','Mám teplotu a kašel.','Horečku mám.','Jsem celý horký.'],[['fever']],['noFever'],30,['fever']),
    r('uncertain_symptoms','symptoms_help',['Nevím, neměřil jsem si teplotu.','Neměřila jsem se.','Jakou teplotu myslíte?','Co mám změřit?'],[['help']],[],40)
  ]);
  t.clarify('symptoms','symptoms_help','Ptám se zvlášť na zvýšenou teplotu a na kašel. Můžete říct, co z toho máte a co nemáte.','I am asking separately about a fever and a cough. You can say which you have and which you do not.');
  n('fever_help','Děkuji za informaci. Při teplotě je potřeba probrat další potíže a případně kontaktovat lékaře. Chcete se poradit s lékařem, nebo mi ještě popsat kašel?','Thank you for the information. With a fever, we need to discuss other symptoms and may need to contact a doctor. Would you like to consult a doctor or describe your cough?',[
    r('describe_cough','cough_type',['Popíšu vám kašel.','Mám suchý kašel.','Vykašlávám hlen.','Chci probrat kašel.','Je dráždivý.'],[['cough'],['dry'],['wet']]),
    r('see_doctor','leave',['Zavolám lékaři.','Půjdu k doktorovi.','Nejdřív se poradím s lékařem.','Raději teď nic nekoupím.','Přijdu potom.'])
  ]);
  n('no_cough_help','Dobře, kapky ani prášky na kašel tedy nevybíráme. Chcete se zeptat na vitaminy, nebo probrat jiný přípravek na krk?','All right, we will not choose cough drops or tablets. Would you like to ask about vitamins or discuss another product for your throat?',[
    r('vitamins_without_medicine','vitamins_only',['Chci vitaminy.','Můžu si vybrat vitaminy?','Co máte za vitaminy?','Vezmu nějaký vitamin.','Ano, vitaminy.'],[['vitamins']]),
    r('other_medicine','consultation',['Chci něco na krk.','Probereme jiný lék.','Potřebuji jiný přípravek.','Můžete mi nabídnout něco jiného?','Co jiného máte?'])
  ]);
  n('consultation','Nejdřív spolu probereme, který přípravek je vhodný. Chcete zatím vitaminy, nebo se vrátit později?','First we will discuss which product is suitable. Would you like vitamins for now, or would you prefer to return later?',[
    r('consult_vitamins','vitamins_only',['Vitaminy prosím.','Tak zatím vitaminy.','Vyberu si vitamin.','Ano, vitaminy.','Chci nějaké vitaminy.'],[['vitamins']]),
    r('consult_later','leave',['Raději přijdu později.','Zatím nic nechci.','Rozmyslím si to.','Dnes nic nekoupím.','Ne, děkuji.'])
  ]);
  const choose=[
    r('dry_cough','drops_info',['Mám suchý kašel, takže ty kapky. A jaká je cena?','Suchý kašel.','Nevykašlávám hlen.','Kašel je dráždivý.','Kapky prosím.','Chci ty kapky.'],[['dry'],['drops']],['actualWet','refuse'],0,['actualWet']),
    r('wet_cough','pills_info',['Vykašlávám hlen.','Mám vlhký kašel.','Tak ty prášky.','Prášky prosím.','Chci ty tablety.','Mám kašel s hlenem.'],[['wet'],['pills']],['dry','refuse'],0,['wet']),
    r('cough_explanation','cough_help',['Jaký je rozdíl?','Nevím, jaký mám kašel.','Co znamená suchý kašel?','Jak poznám vlhký kašel?'],[['help'],['askDifference']],[],30),
    r('general_price','price_help',['Kolik to stojí?','Jaká je cena?','A za kolik jsou?'],[['askPrice']],['dry','wet','drops','pills']),
    r('both_prices','price_help',['Kolik stojí kapky a prášky?','A ceny kapek i tablet?','Co je levnější, kapky nebo prášky?'],[['askPrice','drops','pills']],[],25),
    r('decline_cough_medicine','consultation',['Kapky nechci.','Nechci prášky.','Nic z toho nechci.','Mám alergii.','Beru jiné léky.'],[['refuse'],['safety']],[],40)
  ];
  n('cough_type','Jestli máte suchý kašel, nabízím tyto kapky. Jestli vykašláváte hlen, probereme tyto prášky. Jaký máte kašel?','For a dry cough I can offer these drops. If you are coughing up mucus, we can discuss these tablets. What kind of cough do you have?',choose);
  n('cough_help','Suchý kašel je bez hlenu. Při vlhkém kašli vykašláváte hlen. Který máte, nebo si nejste jistý či jistá?','A dry cough has no mucus. With a wet cough you cough up mucus. Which do you have, or are you unsure?',[
    ...choose,r('still_uncertain','consultation',['Pořád nevím.','Nejsem si jistá.','Nejsem si jistý.','Raději se poradím osobně.'],[['unsure']],[],35)
  ]);
  n('price_help','Kapky stojí 120 korun. U prášků nejdřív ověříme konkrétní přípravek a cenu na balení. Chcete probrat kapky, nebo prášky?','The drops cost 120 crowns. For tablets, we will first check the specific product and the price on the pack. Would you like to discuss drops or tablets?',choose);
  for(const product of ['drops','pills']) {
    const isDrops=product==='drops';
    n(product+'_info',isDrops?'Kapky stojí 120 korun. Musíte také hodně pít a odpočívat. Přejete si ještě něco?':'U těchto prášků zkontrolujeme vhodnost, použití a cenu na balení. Přejete si ještě něco?',
      isDrops?'The drops cost 120 crowns. You also need to drink plenty and rest. Would you like anything else?':'For these tablets we will check suitability, instructions and the price on the pack. Would you like anything else?',[
        r('add_vitamins_'+product,'vitamins_'+product,['Ještě bych si vzal nějaké vitaminy.','Chtěla bych taky vitaminy.','Máte vitaminy?','Ještě vitamin C.','Můžu přidat vitaminy?'],[['vitamins']],['noExtra','refuse'],20),
        r('no_extra_'+product,'payment_'+product,['Ne, děkuji, to je všechno.','To je vše.','Nic dalšího.','Jen ten lék.','Žádné vitaminy nechci.','Budu platit kartou.'],[['noExtra'],['pay']],['vitamins','payQuestion'],20,['vitamins']),
        r('use_'+product,'usage_'+product,['Jak často je mám používat?','Jak se berou?','Kolikrát denně?','Jaké je dávkování?'],[['usage']],[],30),
        r('pay_question_'+product,'payment_'+product,['Můžu platit kartou?','Mohu zaplatit hotově?','Berete karty?','Dá se platit kartou?'],[['payQuestion']],[],30),
        r('reconsider_'+product,'consultation',['To je drahé.','Nechci je.','Máte levnější?','Mám alergii.'],[['expensive'],['refuse'],['safety']],['vitamins'],10)
      ]);
    t.clarify(product+'_info','usage_'+product,'Dávkování zkontrolujeme podle konkrétního přípravku v příbalovém letáku. Chcete ještě něco přidat, nebo zaplatit?','We will check the dosage in the leaflet for the specific product. Would you like to add anything else or pay?');
    n('vitamins_'+product,'Prosím, můžete si vybrat. Chcete tyto vitaminy, nebo jen původní lék?','Please choose. Would you like these vitamins or just the original medicine?',[
      r('take_vitamins_'+product,'payment_vitamins_'+product,['Vezmu si tyhle, děkuji.','Tyto prosím.','Chci vitamin C.','Vezmu céčko.','Tyhle vitaminy.'],[['vitaminC']],['refuse']),
      r('skip_vitamins_'+product,'payment_'+product,['Raději bez vitaminů.','Nakonec vitaminy nechci.','Jen ten původní lék.','Ne, děkuji.','Pouze lék.']),
      r('vitamin_help_'+product,'vitamin_help_'+product,['Jaký je rozdíl?','Které mi doporučíte?','Kolik stojí vitaminy?','Jak je mám brát?'],[['help'],['askPrice'],['usage']],[],20)
    ]);
    t.clarify('vitamins_'+product,'vitamin_help_'+product,'Ukážu vám složení, cenu a použití na balení. Chcete tyto vitaminy přidat, nebo zůstaneme jen u léku?','I will show you the ingredients, price and instructions on the pack. Would you like to add these vitamins, or keep just the medicine?');
    for(const extra of ['', 'vitamins_'])n('payment_'+extra+product,extra?'Sečtu lék a vybrané vitaminy podle cen na balení. Můžete platit kartou nebo hotově. Jak zaplatíte?':isDrops?'Je to 120 korun. Můžete platit kartou nebo hotově. Jak zaplatíte?':'Cenu jsme zkontrolovali na balení. Můžete platit kartou nebo hotově. Jak zaplatíte?',
      extra?'I will add up the medicine and selected vitamins using the pack prices. You can pay by card or cash. How would you like to pay?':isDrops?'That is 120 crowns. You can pay by card or cash. How would you like to pay?':'We checked the price on the pack. You can pay by card or cash. How would you like to pay?',[
        r('pay_'+extra+product,'paid',['Kartou prosím.','Zaplatím hotově.','Budu platit kartou.','Tady máte peníze.','Hotovostí prosím.','Dobře, platím.'],[['pay']],['payQuestion','noPay','refuse']),
        r('payment_help_'+extra+product,'payment_'+extra+product,['Berete karty?','Můžu platit kartou?','Dá se platit hotově?','Mohu zaplatit kartou?'],[['payQuestion']],[],20),
        r('payment_problem_'+extra+product,'consultation',['Nemám dost peněz.','Nemůžu zaplatit.','Je to na mě drahé.','Nechci to koupit.'],[['noPay'],['expensive'],['refuse']],[],30)
      ]);
  }
  n('vitamins_only','Můžete si vybrat vitaminy. Chcete tyto, nebo se nejdřív podívat na složení a cenu?','You can choose vitamins. Would you like these, or look at their ingredients and price first?',[
    r('only_vitamins','vitamins_checkout',['Vezmu tyhle.','Vitamin C prosím.','Céčko prosím.','Tyto vitaminy.','Ano, tyhle.'],[['vitaminC']],['refuse']),
    r('only_vitamins_info','vitamins_only_info',['Jaké mají složení?','Kolik stojí?','Jak se užívají?','Chci se nejdřív podívat.','Co obsahují?'])
  ]);
  t.clarify('vitamins_only','vitamins_only_info','Tady na balení je složení, cena a způsob použití. Chcete tyto vitaminy?','The pack shows the ingredients, price and instructions. Would you like these vitamins?');
  n('vitamins_checkout','Dobře, jen vybrané vitaminy. Cena je podle balení. Platíte kartou nebo hotově?','All right, just the selected vitamins. The price is on the pack. Card or cash?',[
    r('pay_only_vitamins','paid',['Kartou.','Hotově.','Zaplatím kartou.','Tady máte peníze.','Budu platit hotově.','Prosím, platím.'],[['pay']],['noPay','payQuestion']),
    r('only_payment_help','vitamins_checkout',['Můžu kartou?','Berete karty?','Lze platit hotově?','Dá se platit kartou?'],[['payQuestion']])
  ]);
  n('paid','Děkuji. Tady je účtenka. Na shledanou.','Thank you. Here is the receipt. Goodbye.',[
    r('finish_sale',null,['Děkuji, na shledanou.','Děkuju.','Hezký den.','Na shledanou.'],[['bye']])
  ],false);
  for(const id of ['cough_help','price_help'])nodes[id].creditKey='cough_type';
  nodes.payment_drops.responses.find(r=>r.id==='pay_drops').match.allowedAmounts=[120];
  finish();
})(globalThis);
