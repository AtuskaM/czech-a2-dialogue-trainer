(function(root) {
  const {c,nodes,t,r,n,finish}=root.BatchDialogue({id:'lekar-objednani',title:'9. Lékař – objednání',clerkLabel:'Sestra (Nurse)',
    situation:'Jste v ordinaci a chcete se objednat k lékaři na preventivní prohlídku.',situationTranslation:'You are at a doctor’s office and want to book a preventive check-up.',
    source:{file:'zkouska_A2_uloha_2_dialogy_1-rayoyf.pdf',page:8,dialogue:9}}, {
      appointment:['objednat','objednání','termín','prohlídku','kontrolu','k doktorovi','k lékaři'],
      prevention:['preventivní','prevence','prohlídka','prohlídku','kontrola','kontrolu','nemám potíže','nic mi není','žádné problémy','nemám problémy'],
      problem:['bolí','nemocný','nemocná','kašlu','horečku','potíže mám','problémy mám'],
      tuesday:['úterý'],wednesday:['středa','středu'],thursday:['čtvrtek','čtvrtka'],
      otherDay:['pondělí','pátek','sobotu','neděli','jiný den','jindy','další týden','příští týden','ráno','dopoledne'],
      dayQuestion:['které dny','jaké dny','kdy máte','jaké termíny','který den','co je volné'],
      timeQuestion:['v kolik','kolik hodin','jaký čas','přesný čas'],
      foodQuestion:['jíst','nalačno','snídat','najíst','snídaně','pít'],
      bringQuestion:['s sebou','přinést','doklady','kartičku','připravit'],
      otherTime:['později','dřív','dříve','jiný čas','od rána'],
      thanks:['děkuji','děkuju','díky','výborně','skvělé']
    });
  n('start','Dobrý den. Co potřebujete?','Hello. What do you need?',[
    r('book','reason',['Chci se objednat k panu doktorovi.','Chtěla bych se objednat.','Potřebuji termín u lékaře.','Rád bych přišel na prohlídku.','Chci se objednat na kontrolu.','Máte volný termín?','Můžu se objednat k doktorovi?'],[['appointment']]),
    r('book_help','booking_help',['Můžete mi poradit?','Nevím, jak se přihlásit.','Potřebuji pomoc.','Jak to tady funguje?'],[['help']])
  ]);
  t.clarify('start','booking_help','Objednám vás k lékaři. Řekněte mi prosím, jestli chcete prohlídku nebo máte zdravotní potíže.','I can book a doctor’s appointment for you. Please tell me whether you want a check-up or have symptoms.');
  n('reason','Moment… Máte nějaké problémy?','One moment… Do you have any symptoms?',[
    r('preventive','days',['Ne, chtěla bych přijít na preventivní prohlídku.','Ne, jen preventivní prohlídku.','Nic mi není, chci kontrolu.','Nemám problémy.','Chci pravidelnou prohlídku.','Jde o prevenci.'],[['prevention']],['problem']),
    r('symptomatic','symptom_help',['Ano, bolí mě v krku.','Jsem nemocná.','Mám horečku.','Kašlu.','Ano, mám potíže.'],[['problem']]),
    r('reason_help','prevention_help',['Co znamená preventivní?','Jakou prohlídku myslíte?','Nevím, jak to říct.','Co je prevence?'],[['help']],[],10)
  ]);
  t.clarify('reason','prevention_help','Preventivní prohlídka je pravidelná kontrola, i když nemáte potíže. Chcete takovou prohlídku, nebo máte nějaké potíže?','A preventive check-up is a regular examination even when you have no symptoms. Would you like that check-up, or do you have symptoms?');
  n('symptom_help','Děkuji. Zdravotní potíže musíme nejdřív probrat s lékařem. Chcete se poradit kvůli potížím, nebo objednat zvlášť preventivní prohlídku?','Thank you. We need to discuss symptoms with the doctor first. Would you like advice about symptoms, or to book a separate preventive check-up?',[
    r('consult_symptoms','consult_done',['Chci se poradit s lékařem.','Potřebuji řešit ty potíže.','Raději proberu nemoc.','Ano, kvůli potížím.','Nejdřív nemoc.']),
    r('separate_prevention','days',['Preventivní prohlídku zvlášť.','Objednám si prevenci.','Chci teď domluvit jen kontrolu.','Prohlídku prosím.','Pravidelnou kontrolu.'],[['prevention']])
  ]);
  n('consult_done','Dobře, domluvíme nejdřív konzultaci s lékařem o vašich potížích. Děkuji.','All right, we will arrange a consultation with the doctor about your symptoms first. Thank you.',[
    r('finish_consult',null,['Dobře, děkuji.','Děkuju.','Rozumím, děkuji.','Na shledanou.'],[['bye']])
  ],false);
  const choices=[];
  for(const [day,label,cz]of [['tuesday','úterý','v úterý'],['wednesday','středu','ve středu'],['thursday','čtvrtek','ve čtvrtek']])choices.push(
    r('choose_'+day,day+'_time',['Tak '+cz+'. V kolik hodin?','Můžu přijít '+cz+'.',cz.charAt(0).toUpperCase()+cz.slice(1)+' prosím.','Vyberu si '+label+'.'],[[day]],['tuesday','wednesday','thursday'].filter(d=>d!==day),15,['choose_'+day,'tuesday','wednesday','thursday'])
  );
  for(const [day,cz]of [['tuesday','v úterý'],['wednesday','ve středu'],['thursday','ve čtvrtek']]) {
    choices.push(r('choose_'+day+'_food',day+'_food',['Přijdu '+cz+'. Můžu předtím jíst?','Tak '+cz+', musím být nalačno?'],[[day,'foodQuestion']],['tuesday','wednesday','thursday'].filter(d=>d!==day),40,['tuesday','wednesday','thursday']));
    choices.push(r('choose_'+day+'_bring',day+'_bring',['Přijdu '+cz+'. Co mám mít s sebou?','Tak '+cz+', mám něco přinést?'],[[day,'bringQuestion']],['tuesday','wednesday','thursday'].filter(d=>d!==day),40,['tuesday','wednesday','thursday']));
  }
  choices.push(r('other_day','alternatives',['Nemůžu ani jeden den.','Máte něco v pátek?','Dopoledne by to nešlo?','Můžu příští týden?','Nehodí se mi to.'],[['otherDay'],['no']],[],10));
  choices.push(r('days_help','days_help',['Které dny máte volno?','Můžete zopakovat termíny?','Jaké jsou možnosti?','Nevím, který den.'],[['dayQuestion'],['help']],[],20));
  n('days','Můžete přijít v úterý, ve středu nebo ve čtvrtek odpoledne. Který den vám vyhovuje?','You can come on Tuesday, Wednesday or Thursday afternoon. Which day suits you?',choices);
  n('days_help','Volno je v úterý, ve středu a ve čtvrtek odpoledne. Vyberte si den, nebo řekněte, že se vám žádný nehodí.','Tuesday, Wednesday and Thursday afternoons are available. Choose a day, or say that none suits you.',choices);
  n('alternatives','V této nabídce máme jen úterý, středu a čtvrtek odpoledne. Můžete některý z těchto dnů, nebo chcete zavolat později kvůli jinému termínu?','This appointment list has only Tuesday, Wednesday and Thursday afternoons. Can you attend on one of these days, or would you like to call later about another date?',choices);
  nodes.days_help.creditKey=nodes.alternatives.creditKey='days';
  for(const [day,cz,en]of [['tuesday','v úterý','on Tuesday'],['wednesday','ve středu','on Wednesday'],['thursday','ve čtvrtek','on Thursday']]) {
    const confirm=r('confirm_'+day,day+'_done',['Ano, to mi vyhovuje.','Dobře, přijdu.','Ve 13:30 můžu.','V půl druhé odpoledne, dobře.','Platí, děkuji.','Tak ano.'],[['yes'],['thanks']],['no','foodQuestion','bringQuestion','timeQuestion','otherTime']);
    confirm.match.slots={kind:'time',allowed:['13:30'],mode:'compatible',afternoon:true};
    const exact=r('time_'+day,day+'_done',['Ve třináct třicet.','Ve 13.30.','V půl druhé.'],[],['no','foodQuestion','bringQuestion','timeQuestion','otherTime']);
    exact.match.slots={kind:'time',allowed:['13:30'],mode:'match',afternoon:true};
    const other=r('other_time_'+day,day+'_alternatives',['Můžu ve 14:30?','Ve dvě bych mohl.','Šlo by to v 15:00?','Můžu později?','Dřív nemáte volno?'],[['no'],['otherTime']]);
    const otherValue=r('different_time_'+day,day+'_alternatives',['Ve 14:30 prosím.','Ve dvě odpoledne.'],[],[],20);
    otherValue.match.slots={kind:'time',allowed:['13:30'],mode:'different',afternoon:true};
    const responses=[confirm,exact,other,otherValue,
      r('food_'+day,day+'_food',['A můžu předtím jíst?','Musím přijít nalačno?','Můžu se nasnídat?','Můžu předtím pít?'],[['foodQuestion']],[],30),
      r('bring_'+day,day+'_bring',['Co mám mít s sebou?','Mám něco přinést?','Jaké doklady potřebuju?','Mám přinést kartičku pojišťovny?'],[['bringQuestion']],[],30),
      r('repeat_time_'+day,day+'_time',['V kolik hodin?','Jaký je přesný čas?','Kolik jste říkala?','Můžete zopakovat čas?'],[['timeQuestion']],['tuesday','wednesday','thursday'].filter(d=>d!==day),10),
      ...choices.filter(x=>x.id!=='choose_'+day)
    ];
    n(day+'_time','Můžu vás objednat '+cz+' ve třináct třicet. Vyhovuje vám to?','I can book you '+en+' at 1:30 p.m. Does that suit you?',responses);
    n(day+'_food','Před touto preventivní prohlídkou můžete jíst. Krevní testy uděláme až později. Platí tedy '+cz+' ve třináct třicet?','You can eat before this preventive check-up. The blood tests will be done later. Shall we confirm '+en+' at 1:30 p.m.?',responses);
    n(day+'_bring','Vezměte si doklad totožnosti a kartičku pojišťovny. Platí tedy '+cz+' ve třináct třicet?','Bring identification and your health insurance card. Shall we confirm '+en+' at 1:30 p.m.?',responses);
    n(day+'_alternatives','Na tento den nabízím třináct třicet. Můžete v tuto dobu, zvolíte jiný den, nebo se ozvete později?','On this day I can offer 1:30 p.m. Can you attend then, choose another day, or contact us later?',responses);
    for(const suffix of ['food','bring','alternatives'])nodes[day+'_'+suffix].creditKey=day+'_time';
    n(day+'_done','Jste objednaný nebo objednaná '+cz+' ve třináct třicet na preventivní prohlídku. Na shledanou.','Your preventive check-up is booked '+en+' at 1:30 p.m. Goodbye.',[
      r('finish_'+day,null,['Děkuji, na shledanou.','Dobře, děkuju.','Hezký den.','Na shledanou.'],[['bye']])
    ],false);
  }
  finish();
})(globalThis);
