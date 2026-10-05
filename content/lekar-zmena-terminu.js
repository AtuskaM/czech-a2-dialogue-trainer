(function(root) {
  const {c,nodes,t,r,n,finish}=root.BatchDialogue({id:'lekar-zmena-terminu',title:'10. Lékař – změna termínu',clerkLabel:'Sestra (Nurse)',
    situation:'Jste v ordinaci a potřebujete změnit termín kontroly. V této situaci jste Lucie Nováková a máte termín 14. dubna odpoledne.',
    situationTranslation:'You are at a doctor’s office and need to change your check-up appointment. In this situation you are Lucie Nováková and your appointment is on 14 April in the afternoon.',
    source:{file:'zkouska_A2_uloha_2_dialogy_1-rayoyf.pdf',page:8,dialogue:10}}, {
      change:['změnit','změna','přeobjednat','přeobjednání','na jindy','jiný termín','nehodí se','posunout'],
      cancel:['zrušit','zruším','ruším','odhlásit','zrušte'],
      forgotten:['nevím','nepamatuji','nepamatuju','zapomněl','zapomněla','najít termín'],
      patientName:['nováková','novakova','lucie nováková','nováková lucie'],
      nameIntro:['jmenuji se','moje jméno je','na jméno','jmenuju se','já jsem'],
      laterWeek:['o týden','příští týden','za týden'],
      availability:['května','květen','květnu','června','červnu','dříve','později','dřív','ráno','dopoledne','odpoledne','jiný den'],
      calendar:['kalendář','kalendáře','podívám','moment','chvilku','ověřím'],
      timeQuestion:['v kolik','kolik hodin','jaký čas'],
      oldDateQuestion:['původní termín','starý termín','který termín','jaké datum'],
      dateRepeat:['jaké datum','kterého','jaký měsíc','zopakovat datum'],
      keepOriginal:['nechám původní','původní platí','ponechám původní','nechci měnit'],
      callLater:['zavolám','zavoláme','ozvu se','zatelefonuji','zatelefonuju','zavolat později','ozvat později']
    });
  n('start','Dobrý den. Co si přejete?','Hello. What would you like?',[
    r('change_appointment','old_date',['Jsem objednaná k paní doktorce, ale nehodí se mi to. Můžu se objednat na jindy?','Potřebuji změnit termín kontroly.','Chtěla bych se přeobjednat.','Chtěla bych jiný termín.','Můžeme posunout moji kontrolu?','Chci změnit den kontroly.'],[['change']],['cancel']),
    r('cancel_appointment','cancel_check',['Potřebuji zrušit termín.','Chci se odhlásit.','Ruším objednání.','Kontrolu chci zrušit.'],[['cancel']]),
    r('opening_help','change_help',['Potřebuji poradit.','Nevím, jak to změnit.','Můžete mi pomoct?','Jak mám postupovat?'],[['help']],[],10)
  ]);
  t.clarify('start','change_help','Pomůžu vám. Chcete přesunout kontrolu na jiný den, nebo termín úplně zrušit?','I can help. Would you like to move your check-up to another day or cancel the appointment?');
  const knownDate=r('old_date_known','name',['Na 14. dubna odpoledne.','Čtrnáctého dubna.','Mám termín 14.4.','Jsem objednaná na čtrnáctého dubna.','Na čtrnáctého čtvrtý.','Čtrnáctého čtvrtý odpoledne.']);
  // Numeric and spoken month forms are parsed; the two colloquial numeric-month phrases remain explicit examples.
  const exactDate=r('old_date_value','name',['14. dubna.','Čtrnáctého dubna odpoledne.']);exactDate.match.slots={kind:'date',allowed:['14-4'],mode:'match'};
  const wrongDate=r('other_old_date','old_date_help',['Na 15. dubna.','Čtrnáctého května.']);wrongDate.match.slots={kind:'date',allowed:['14-4'],mode:'different'};wrongDate.match.priority=20;
  n('old_date','A na kdy jste objednaný nebo objednaná?','When is your current appointment?',[
    knownDate,exactDate,wrongDate,
    r('forgot_old_date','old_date_help',['Nevím přesně.','Zapomněla jsem datum.','Nepamatuju si termín.','Můžete ho najít?','Nejsem si jistá.'],[['forgotten']]),
    r('ask_old_date','old_date_help',['Myslíte původní termín?','Jaké datum chcete vědět?','Ten starý termín?','Který termín myslíte?'],[['oldDateQuestion']])
  ]);
  n('old_date_help','V kalendáři mám původní kontrolu na čtrnáctého dubna odpoledne. Je to ten termín, který chcete změnit?','The calendar shows the original check-up on 14 April in the afternoon. Is that the appointment you want to change?',[
    r('confirm_old_date','name',['Ano, to je ono.','Ano, čtrnáctého dubna.','Přesně ten.','To je můj termín.','Dobře, ano.'],[['yes']],['no']),
    r('not_my_date','lookup_help',['Ne, to není můj termín.','Mám jiné datum.','To není ono.','Ne, jde o jinou kontrolu.','Asi máme jiné datum.'])
  ]);
  nodes.old_date_help.responses[0].match.slots={kind:'date',allowed:['14-4'],mode:'compatible'};
  nodes.old_date_help.responses.push(wrongDate);
  n('lookup_help','Ověříme rezervaci podle jména. Na jaké jméno jste objednáná?','Let us check the booking by name. What name is it under?',[],true);
  n('name','Na jaké jméno?','What name is the appointment under?',[
    r('give_name','availability',['Nováková, Lucie.','Lucie Nováková.','Jmenuji se Lucie Nováková.','Na jméno Nováková.','Jsem paní Nováková.','Nováková.'],[['patientName']]),
    r('name_help','name_help',['Příjmení, nebo celé jméno?','Chcete i křestní jméno?','Mám ho hláskovat?','Jaké jméno potřebujete?']),
    r('other_name','name_check',['Jmenuji se Anna.','Na jméno Pavel Novák.','Moje jméno je Petr.','Jmenuju se Jana.'],[['nameIntro']],['patientName'])
  ]);
  nodes.lookup_help.responses=[...nodes.name.responses];
  t.clarify('name','name_help','Prosím vaše jméno a příjmení, pod kterým je kontrola objednaná.','Please give the first name and surname used for the booking.');
  n('name_check','Našla jsem rezervaci na jméno Lucie Nováková. Je to vaše rezervace?','I found a booking under Lucie Nováková. Is that your booking?',[
    r('correct_name','availability',['Ano, to jsem já.','Ano, Lucie Nováková.','Je to moje rezervace.','To je správně.','Přesně tak.'],[['yes'],['patientName']],['no']),
    r('different_person','leave',['Ne, to nejsem já.','To není moje rezervace.','Mám jiné jméno.','Ověřím si údaje a zavolám.','Zkusím to později.'])
  ]);
  const callLater=r('call_later','call_later_done',[
    'Zavolám později.','Já ještě zavolám později.','Ještě se ozvu.','Ozvu se zítra.',
    'Zavolám, až budu vědět.','Raději vám zavolám.','Můžu zavolat později?',
    'Zatelefonuji vám později.','Teď nevím, zavolám zítra.','Domluvím se doma a pak zavolám.'
  ],[['callLater']],['cancel'],50);
  const cancelRequest=r('request_cancellation','cancel_check',[
    'Tak kontrolu zruším.','Chci raději termín zrušit.','Můžete kontrolu zrušit?',
    'Raději se odhlásím.','Prosím zrušte původní termín.'
  ],[['cancel']],[],45);
  const proposedDate=r('propose_specific_date','date_offer',[
    '17. dubna ráno','19. dubna odpoledne','Na 21. dubna?',
    'Můžu přijít dvacátého dubna.','Šlo by to 3. června?','Patnáctého května prosím.'
  ],[],['callLater','cancel'],20);
  proposedDate.match.slots={kind:'date',allowed:['14-5'],mode:'different'};
  const proposedMay=r('propose_available_date','may_available',[
    'Můžu čtrnáctého května.','14.5. prosím.','Vyhovoval by mi 14. květen.','Na čtrnáctého května?'
  ],[],['callLater','cancel'],20);
  proposedMay.match.slots={kind:'date',allowed:['14-5'],mode:'compatible'};
  const parsedMay=r('propose_available_date_value','may_available',['Čtrnáctého května.','14/5.'],[],['callLater','cancel'],20);
  parsedMay.match.slots={kind:'date',allowed:['14-5'],mode:'match'};
  const alternatives=[
    r('one_week_later','may_offer',['Šlo by to o týden později?','Můžu příští týden?','O týden později prosím.','Raději za týden.'],[['laterWeek']]),
    r('ask_other_date','date_offer',['Můžu v květnu.','Jaké máte další termíny?','Chtěla bych později.','Šlo by to dříve?','Máte ráno volno?','Kdy máte volno?'],[['availability']]),
    proposedDate,proposedMay,parsedMay,callLater,cancelRequest,
    r('availability_help','availability_help',['Nevím, musím se podívat.','Podívám se do kalendáře.','Moment prosím.','Ještě to ověřím.'],[['calendar'],['help']],[],10),
    r('keep_old','kept',['Nechám původní termín.','Nakonec původní platí.','Nechci měnit termín.','Ponechám původní kontrolu.'],[['keepOriginal']],[],20)
  ];
  n('availability','Už to vidím. A kdy můžete přijít?','I can see the booking now. When can you come?',alternatives);
  n('availability_help','Podívejte se v klidu do kalendáře. Můžete navrhnout jiný termín nebo nechat původní kontrolu.','Take a moment to check your calendar. You can suggest another date or keep the original appointment.',alternatives);
  const accept=r('accept_may','changed',['Moment, podívám se do kalendáře… Ano, můžu. Děkuju.','Ano, můžu.','Dobře, to mi vyhovuje.','Čtrnáctého května přijdu.','Platí, děkuji.','Ano, ten den mám čas.'],[['yes']],['no','timeQuestion','dateRepeat']);
  accept.match.slots={kind:'date',allowed:['14-5'],mode:'compatible'};
  const mayValue=r('may_date_value','changed',['14. května.','Čtrnáctého května.','14.5. prosím.'],[],['no','timeQuestion','dateRepeat']);mayValue.match.slots={kind:'date',allowed:['14-5'],mode:'match'};
  const otherValue=r('other_new_date','may_alternatives',['Patnáctého května prosím.','Můžu 14. června?']);otherValue.match.slots={kind:'date',allowed:['14-5'],mode:'different'};otherValue.match.priority=20;
  const mayResponses=[accept,mayValue,otherValue,
    r('decline_may','may_alternatives',['Bohužel nemůžu.','Ten den nemám čas.','Čtrnáctého května se mi to nehodí.','Máte jiný termín?','Ne, nevyhovuje.','Ne, to nejde.'],[['no']]),
    r('may_time','may_time',['V kolik hodin?','A jaký čas?','Kolik hodin to bude?','Bude to odpoledne?'],[['timeQuestion']],[],30),
    r('check_calendar','may_calendar',['Moment, podívám se do kalendáře.','Počkejte prosím.','Ještě si to ověřím.','Musím se podívat.'],[['calendar']],['yes','no'],10),
    r('repeat_may','may_repeat',['Jaké datum jste říkala?','Kterého května?','Můžete zopakovat datum?','Čtrnáctého čeho?'],[['dateRepeat']],[],30),
    alternatives.find(x=>x.id==='keep_old'),callLater,cancelRequest
  ];
  n('may_offer','O týden později to bohužel nejde. Můžete čtrnáctého května?','Unfortunately, one week later is not available. Can you come on 14 May?',mayResponses);
  n('date_offer','Podívám se do kalendáře. Pro nový termín vám teď můžu nabídnout čtrnáctého května. Vyhovuje vám tento den?','Let me check the calendar. For a new appointment I can currently offer 14 May. Does that day suit you?',mayResponses);
  n('may_available','Ano, čtrnáctého května máme volno. Mám vám na tento den přesunout kontrolu?','Yes, 14 May is available. Shall I move your check-up to that day?',mayResponses);
  n('may_calendar','Samozřejmě, podívejte se. Nabízím čtrnáctého května. Vyhovuje vám to?','Of course, take a look. I am offering 14 May. Does that suit you?',mayResponses);
  n('may_repeat','Nabízím čtrnáctého května. Můžete v tento den?','I am offering 14 May. Can you come that day?',mayResponses);
  n('may_time','Přesný čas s vámi ještě potvrdíme. Teď ověřuji, jestli vám vyhovuje den čtrnáctého května. Můžete ten den?','We will confirm the exact time with you separately. For now I am checking whether 14 May suits you. Can you come that day?',mayResponses);
  n('may_alternatives','Jiný nový termín vám teď nemůžu potvrdit. Můžete přijít čtrnáctého května, ponechat původní termín, zrušit kontrolu, nebo zavolat později. Co si přejete?','I cannot confirm another new date now. You can attend on 14 May, keep the original appointment, cancel the check-up, or call later. What would you like?',mayResponses);
  for(const id of ['date_offer','may_available','may_calendar','may_repeat','may_time','may_alternatives'])nodes[id].creditKey='may_offer';
  n('cancel_check','Chcete původní kontrolu zrušit bez nového termínu, nebo ji raději přesunout?','Would you like to cancel the original check-up without a new date, or move it instead?',[
    r('confirm_cancel','cancelled',['Ano, zrušte ji.','Bez nového termínu.','Chci ji jen zrušit.','Teď nový termín nechci.','Kontrolu ruším.'],[['cancel']]),
    r('reschedule_instead','old_date',['Raději ji přesunu.','Chci jiný termín.','Přeobjednat prosím.','Nakonec chci změnu.','Ne, jen přesunout.'],[['change']],[],10),
    callLater
  ]);
  for(const [id,cz,en]of [
    ['call_later_done','Dobře, zavolejte, až budete vědět, kdy můžete přijít. Zatím původní termín nechávám beze změny. Na shledanou.','All right, call when you know when you can come. For now I am leaving your original appointment unchanged. Goodbye.'],
    ['changed','Dobře, kontrolu přesouváme na čtrnáctého května. Přesný čas vám ještě potvrdíme. Na shledanou.','All right, we are moving the check-up to 14 May. We will confirm the exact time separately. Goodbye.'],
    ['kept','Dobře, původní kontrola čtrnáctého dubna odpoledne zůstává. Na shledanou.','All right, your original appointment on 14 April in the afternoon remains. Goodbye.'],
    ['cancelled','Dobře, původní termín kontroly ruším. Na shledanou.','All right, I am cancelling the original check-up. Goodbye.']
  ])n(id,cz,en,[r('finish_'+id,null,['Děkuji, na shledanou.','Dobře, děkuju.','Na shledanou.','Hezký den.'],[['bye']])],false);
  finish();
})(globalThis);
