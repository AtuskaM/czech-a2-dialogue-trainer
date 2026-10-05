// Context-specific response banks. Phrases are authored examples, not an exhaustive Czech grammar.
(function(root) {
  'use strict';
  function author(nodes,concepts,tools) {
    function variants(id,examples) {
      concepts[id]=[...new Set([...(concepts[id]||[]),...examples])];
      for(const n of Object.values(nodes))for(const r of n.responses)if(r.id===id)r.examples=[...new Set([...r.examples,...examples])];
    }
    function add(targets,id,next,examples,match={}) {
      const response=tools.response(id,next,examples,match);
      for(const target of targets)nodes[target].responses=[...nodes[target].responses.filter(r=>r.id!==id),response];
      return response;
    }
    function update(id,change) {
      for(const n of Object.values(nodes))for(const r of n.responses)if(r.id===id)change(r);
    }
    function credit(groups) {
      for(const [key,ids]of Object.entries(groups))for(const id of ids)nodes[id].creditKey=key;
      // Every valid conversational move is credited, not only the source's preferred route.
      for(const n of Object.values(nodes))for(const r of n.responses)r.reward=1;
    }
    return {variants,add,update,credit};
  }
  function optician(nodes,c,t) {
    const {variants,add,update,credit}=author(nodes,c,t);
    Object.assign(c,{
      buyAcceptance:['koupím','koupíme','vezmu','beru','vyberu','chtěl nové','chtěla nové','co se dá dělat','nedá se nic dělat','tak tedy nové','tak nové','tak dobře','tak si je koupím'],
      buyRejection:['nechci','nechceme','nekoupím','nebudu kupovat','nechce se mi kupovat','nepotřebuji nové','nepotřebuju nové','chci si nechat staré','chci ty staré','nové nepotřebuji'],
      glassesPriceQuestion:['kolik stojí','kolik by stály','kolik budou stát','kolik to stojí','kolik zaplatím','kolik za ně','jaká je cena','za kolik','kolik vyjdou','kolik mě vyjdou','kolik by mě stály','kolik to bude','kolik stojí takové normální'],
      selectionQuestion:['jaké máte','co máte','jaký máte výběr','jaké nabízíte','máte na výběr','ukažte mi','můžete ukázat','můžu se podívat','mohu se podívat','chtěl bych vidět','chtěla bych vidět','co nabízíte'],
      leaveShop:['nic nechci','nic koupit','přijdu jindy','přijdu později','vrátím se později','rozmyslím si to','na shledanou'],
      cannotAfford:['nemám peníze','nemám tolik peněz','nemůžu si dovolit','nemohu si dovolit','moc drahé','příliš drahé','levnější','levnějšího'],
      lensChoiceQuestion:['co doporučujete','co mi doporučíte','které jsou lepší','které doporučujete','nevím které','nevím, které','nevím co vybrat'],
      notBuyAcceptance:['nekoupím','nevezmu','nebudu kupovat','nechci si koupit','nechci koupit'],
      tryBoth:['oboje','obojí','obě','jedny i druhé','černé i hnědé','hnědé i černé'],
      frameAdvice:['nevím','poraďte','poradíte','doporučíte','doporučujete','jiné barvy','jinou barvu'],
      selectionType:['jaké','jaký','které','co'],selectionOffer:['nabízíte','máte','ukázat','ukážete'],
      noFunds:['nemám','nemáme','málo'],moneyObject:['peněz','peníze'],
      wontBuy:['nebudu','nebudeme'],buyAction:['kupovat','koupit'],
      repairPossibility:['nedá se','nemůžete','nešlo by'],repairAttempt:['dělat','udělat','zkusit'],
      resignedAcceptance:['nedá se nic dělat','co se dá dělat']
    });
    c.lensChoiceQuestion.push('doporučíte','doporučila','poradit','pomůžete','neumím si vybrat');
    variants('repair_glasses',[
      'Potřebuji spravit brýle.','Můžete mi opravit brýle?','Rozbily se mi brýle.','Chtěla bych nechat spravit brýle.',
      'Prosím o opravu brýlí.','Šlo by opravit tyto brýle?','Mám poškozené brýle.','Opravujete brýle?',
      'Praskly mi brýle, můžete se na ně podívat?','Potřeboval bych opravu těchto brýlí.'
    ]);
    const objections=[
      'Nemůžete je opravit?','A určitě je nemůžete opravit?','Opravdu nejdou spravit?','Nešlo by je ještě opravit?',
      'Nemůžete to aspoň zkusit?','Nedají se nějak opravit?','Jste si jistá, že to nejde?',
      'A opravdu s tím nic neuděláte?','Proč je nejde spravit?','Musím opravdu kupovat nové?',
      'Ale já chci opravit ty staré.','Nemůžete je přece jenom spravit?'
    ];
    variants('explain_repair',objections);
    update('explain_repair',r=>{r.match.forbidden=['resignedAcceptance'];r.match.priority=20;r.match.patterns.push(['repairPossibility','repairAttempt']);});
    variants('insist_repair',objections);
    update('insist_repair',r=>{r.match.forbidden=['resignedAcceptance'];r.match.priority=21;r.match.patterns.push(['repairPossibility','repairAttempt']);});
    variants('choose_glasses',[
      'Dobře, koupím si nové.','Tak si je koupím.','Tak dobře.','Tak tedy nové.',
      'Nechtěl jsem kupovat nové, ale co se dá dělat.','Nechtěla jsem kupovat nové, ale co se dá dělat.',
      'No dobře, vezmu si nové.','Tak si nějaké vyberu.','Nedá se nic dělat, koupím je.',
      'Chtěla bych tedy nové.','Chtěl bych tedy nové.','Dobře, potřebuji jiné brýle.'
    ]);
    update('choose_glasses',r=>{r.match.patterns.push(['buyAcceptance']);r.match.forbidden=['notBuyAcceptance','glassesPriceQuestion','selectionQuestion','repairObjection'];});
    // Refusal continues the discussion; only an explicit departure ends the visit.
    update('cancel_purchase',r=>{r.match.patterns=[['leaveShop']];r.match.forbidden=[];r.match.priority=30;});
    const purchaseNodes=['repair','repair_explained','repair_options','repair_price'];
    const refusal=add(purchaseNodes,'refuse_new_glasses','purchase_alternatives',[
      'Ale já si nechci koupit nové brýle.','Nové brýle nechci.','Nechci kupovat nové.',
      'Další brýle si nekoupím.','Nechci za nové utrácet.','Chci si nechat staré.',
      'Já nové nepotřebuji.','Nechce se mi kupovat nové brýle.','Já chci ty staré.',
      'Nebudu si kupovat nové brýle.','Nemám na nové peníze.'
    ],{patterns:[['buyRejection'],['cannotAfford'],['noFunds','moneyObject'],['wontBuy','buyAction']],forbidden:['buyAcceptance','repairObjection','leaveShop','glassesPriceQuestion','selectionQuestion']});
    t.node('purchase_alternatives','Rozumím, nové brýle nechcete. Staré bohužel opravit nejdou. Můžu vám ukázat levnější brýle nebo nabídnout čočky. Chcete se na něco zeptat, nebo si to rozmyslet?',
      'I understand that you do not want new glasses. Unfortunately, the old ones cannot be repaired. I can show you cheaper glasses or offer contact lenses. Would you like to ask something or think it over?',[], 'repair');
    const price=add(purchaseNodes,'repair_price_question','repair_price',[
      'A kolik stojí takové normální?','Kolik stojí nové brýle?','A kolik stojí?','Za kolik jsou?',
      'Kolik by mě stály nové?','Jaká je jejich cena?','Kolik za ně zaplatím?','Na kolik vyjdou?',
      'Kolik to bude stát?','Tak dobře, koupím si nové. A kolik stojí?','A jaká je cena čoček?'
    ],{patterns:[['glassesPriceQuestion'],['costQuery','glassesObject'],['costQuery','lensesObject']],priority:40});
    const browse=add(purchaseNodes,'browse_new_glasses','frame_cost',[
      'A jaké máte?','Jaké brýle nabízíte?','Co máte na výběr?','Můžete mi nějaké ukázat?',
      'Ukažte mi prosím nové brýle.','Můžu se na ně podívat?','Jaký máte výběr?',
      'Chtěla bych vidět nějaké brýle.','Co mi můžete nabídnout?','Tak dobře, ukažte mi nějaké.'
    ],{patterns:[['selectionQuestion'],['selectionType','selectionOffer']],forbidden:['lensesObject','glassesPriceQuestion'],priority:30});
    // Keep the original general request to look at glasses compatible with its budget route.
    c.selectionQuestion=c.selectionQuestion.filter(p=>p!=='ukažte mi');
    nodes.purchase_alternatives.responses=[...nodes.repair.responses];
    nodes.repair_price.responses=[...nodes.repair.responses.filter(r=>r.id!=='explain_repair'),price];
    // Rejoin the remaining conversation with source-specific, deduplicated responses.
    for(const id of ['repair_options','repair_explained']) {
      if(!nodes[id].responses.some(r=>r.id===refusal.id))nodes[id].responses.push(refusal);
      if(!nodes[id].responses.some(r=>r.id===browse.id))nodes[id].responses.push(browse);
    }
    variants('ask_contacts',[
      'A co čočky?','Dají se koupit kontaktní čočky?','Mohla bych místo brýlí nosit čočky?',
      'Máte taky čočky?','Zajímaly by mě kontaktní čočky.','Chtěla bych raději čočky.',
      'Jak je to s čočkami?','Prodáváte i kontaktní čočky?','Můžete mi nabídnout čočky?','Tak zkusím čočky.'
    ]);
    variants('has_prescription',['Předpis mám s sebou.','Ano, přinesl jsem ho.','Ano, přinesla jsem ho.','Tady ho máte.','Mám ho v tašce.']);
    variants('unknown_dioptres',['Nevzpomínám si.','Nevím, kolik mám.','Nepamatuji si ta čísla.','Předpis zůstal doma.','Nemám ho s sebou.']);
    variants('agree_measure',['Klidně mi ho změřte.','Můžeme začít.','Tak to zkusíme.','Ano, chci měření.','Můžete mě změřit.']);
    variants('postpone_measure',['Teď na měření nechci.','Dnes se mi to nehodí.','Přijdu na měření později.']);
    variants('daily_lenses',['Ty na jeden den.','Chci ty jednodenní.','Vybral bych denní.','Vybrala bych denní.','Vezmu ty denní.']);
    variants('monthly_lenses',['Ty na celý měsíc.','Vybral bych měsíční.','Vybrala bych měsíční.','Stačí měsíční.','Vezmu ty měsíční.']);
    add(['lens_prices','lenses_explained','lens_prices_repeat'],'lens_advice','lens_advice',[
      'Co mi doporučíte?','Nevím, které vybrat.','Které jsou lepší?','Můžete mi poradit?',
      'Neumím si vybrat.','Jaké byste doporučila?','Které se víc hodí?','Pomůžete mi s výběrem?',
      'Nevím, jestli denní nebo měsíční.','Jaké čočky byste mi doporučila?'
    ],{patterns:[['lensChoiceQuestion']],priority:30});
    t.node('lens_advice','Denní čočky po použití vyhodíte, měsíční musíte čistit. Vhodné čočky s vámi vyzkoušíme. Chcete denní, měsíční, nebo raději brýle?',
      'Daily lenses are discarded after use; monthly lenses need cleaning. We will try suitable lenses with you. Would you like daily lenses, monthly lenses, or glasses?',nodes.lens_prices.responses,'lens_prices');
    c.lensMention=[...c.dailyChoice,...c.monthlyChoice,...c.lensesObject];
    add(['lens_prices','lenses_explained','lens_prices_repeat','lens_advice'],'decline_lens_option','lens_advice',[
      'Nechci denní čočky.','Měsíční nechci.','Čočky si nevyberu.','Já nechci čočky.'
    ],{patterns:[['refusal','lensMention']],forbidden:['dailyChoice','monthlyChoice','glassesObject'],positiveConcepts:['dailyChoice','monthlyChoice','glassesObject']});
    add(['daily','monthly','lens_ready'],'decline_lens_order','purchase_alternatives',[
      'Nechci je objednat.','Čočky si nekoupím.','Ještě si to rozmyslím.','To je na mě drahé.','Raději bez čoček.'
    ],{patterns:[['buyRefusal'],['cannotAfford']],forbidden:['glassesChoice']});
    variants('budget_other',['Můj rozpočet je malý.','Jaké jsou nejlevnější?','Nevím, kolik bych měl dát.','Nevím, kolik bych měla dát.','Nemůžu moc utrácet.']);
    variants('good_fit',['Ty mi vyhovují.','Cítím se v nich dobře.','Vypadají dobře.','Jsou akorát.','Netlačí mě.']);
    variants('bad_fit',['Tlačí mě za ušima.','Není mi to pohodlné.','Potřeboval bych větší.','Potřebovala bych větší.']);
    variants('need_smaller_frames',['Padají mi z nosu.','Jsou příliš široké.','Potřeboval bych menší.','Potřebovala bych menší.']);
    add(['choose_frames','cheaper_frames','trying_explained','frame_cost'],'try_both_frames','try_both',[
      'Můžu zkusit oboje?','Rád bych zkusil obě barvy.','Ráda bych zkusila obě barvy.','Jedny i druhé prosím.',
      'Nejdřív černé a pak hnědé.','Zkusím oboje.','Můžete mi ukázat oboje?','Obě bych chtěla zkusit.',
      'Černé i hnědé prosím.','Vyzkouším si jedny i druhé.'
    ],{patterns:[['tryBoth']],priority:30});
    t.node('try_both','Samozřejmě, můžete si vyzkoušet oboje. Které vám vyhovují víc, černé nebo hnědé?',
      'Of course, you can try both. Which do you prefer, black or brown?',nodes.choose_frames.responses,'choose_frames');
    add(['choose_frames','cheaper_frames','trying_explained','frame_cost','try_both'],'frame_advice','frame_advice',[
      'Nevím, které si vybrat.','Co byste mi doporučila?','Máte ještě jiné barvy?','Poradíte mi?',
      'Které mi víc sluší?','Můžete mi pomoct vybrat?','Nejsem si jistá.','Nejsem si jistý.',
      'Chci jinou barvu.','Nemáte jiné?'
    ],{patterns:[['frameAdvice']],priority:10});
    t.node('frame_advice','V této nabídce jsou černé a hnědé. Můžete si zkusit oboje a podívat se do zrcadla. Které chcete zkusit, nebo přijdete jindy?',
      'This selection has black and brown frames. You can try both and look in the mirror. Which would you like to try, or would you prefer to return later?',nodes.choose_frames.responses,'choose_frames');
    for(const id of ['frame_advice','try_both','choose_frames','cheaper_frames','frame_cost'])nodes[id].responses.push(nodes.repair.responses.find(r=>r.id==='cancel_purchase'));
    credit({repair:['repair','repair_explained','repair_options','repair_price','purchase_alternatives'],
      lens_prices:['lens_prices','lenses_explained','lens_prices_repeat','lens_advice'],
      choose_frames:['choose_frames','cheaper_frames','trying_explained','frame_cost','try_both','frame_advice'],
      budget:['budget','budget_repeat','budget_options']});
  }
  function licence(nodes,c,t) {
    const {variants,add,update,credit}=author(nodes,c,t);
    Object.assign(c,{
      servicePriceAsk:['kolik','jaká je cena','za kolik','jaký je poplatek','cenu','poplatek'],
      standardAcceptance:['počkám','stačí normální','stačí běžné','běžné vydání','běžně','levnější','nemusí to být rychle','nespěchá to'],
      expressAcceptance:['co nejdřív','nejrychleji','rychlé vydání','urychlit','zrychleně','zrychlené'],
      serviceDecline:['nechci ani jedno','nechci ani jednu','rozmyslím si to','přijdu později','přijdu jindy','dnes to nechci','žádost ruším'],
      serviceAdvice:['nevím','doporučíte','doporučujete','poraďte','nemůžu se rozhodnout','nemohu se rozhodnout'],
      documentAvailable:['mám pas','pas mám','mám občanku','občanku mám','mám občanský průkaz','tady je pas','tady je občanka'],
      identityAllMissing:['ani pas','ani občanku','žádný doklad','nemám doklady','pas nemám a občanku také ne'],
      formAssistance:['pomoc','pomoct','pomoci','pomůžete','nevím','nevyplnil','nevyplnila','nepodepsal','nepodepsala','nemám pero'],
      photoRefusal:['nechci fotku','nechci se fotit','nefoťte','nechci fotografii'],
      negativeService:['nechci','nepotřebuji','nepotřebuju','nemusí','ne expresně','ne normálně'],
      otherService:['druhou možnost','druhá možnost','tu druhou','druhé vydání'],
      photoAnother:['jinou','další','ještě jednu'],photoKeep:['necháme','nechat','spokojený','spokojená','může být'],
      paymentAbility:['dalo by se','dá se','můžu','mohu','můžeme','lze','je možné','musím','přijímáte','berete'],
      paymentAction:['platit','zaplatit','kartu','karty','kartou','hotově']
    });
    c.photoRefusal.push('nechci fotit','nechci vyfotit');
    // Declarative payment is not a question about payment facilities.
    c.paymentQuestion=c.paymentQuestion.filter(p=>!['platit kartou','platit hotově'].includes(p));
    c.paymentQuestion.push('dá se platit','je možné platit','můžu použít kartu','přijímáte platební karty','musím platit');
    variants('replace_lost_licence',[
      'Ztratil jsem řidičský průkaz.','Ztratila jsem řidičský průkaz.','Potřebuji náhradní řidičák.',
      'Chtěl bych nový řidičský průkaz, starý nemám.','Chtěla bych nový řidičský průkaz, starý nemám.',
      'Někdo mi ukradl řidičák.','Nemůžu najít řidičský průkaz.','Přišel jsem o řidičský průkaz.',
      'Přišla jsem o řidičský průkaz.','Chci požádat o duplikát řidičského průkazu.'
    ]);
    variants('show_identity',[
      'Ano, tady máte pas.','Mám u sebe občanku.','Tady je můj doklad.','Pas mám v tašce.',
      'Přinesl jsem občanský průkaz.','Přinesla jsem občanský průkaz.','Můžu vám dát pas.',
      'Občanku nemám, ale mám pas.','Pas nemám, ale mám občanku.','Tady prosím, můj pas.'
    ]);
    update('show_identity',r=>{r.match.forbidden=['identityQuestion','identityAllMissing'];r.match.positiveConcepts=['identityYes','show_identity'];});
    // A scoped affirmative document wins over the missing alternative.
    add(['identity','identity_explained'],'alternative_identity','form',[
      'Občanku nemám, ale mám pas.','Pas nemám, ale mám občanku.','Nemám občanku, pas mám.',
      'Občanku jsem zapomněla, ale mám pas.','Pas jsem zapomněl, ale mám občanku.'
    ],{patterns:[['documentAvailable']],positiveConcepts:['documentAvailable'],forbidden:['identityAllMissing','identityQuestion'],priority:20});
    // These examples belong to the more specific rule above, with the same destination.
    variants('no_identity',['Ne, nechal jsem je doma.','Ne, nechala jsem je doma.','Bohužel nemám ani jeden.','Nic takového u sebe nemám.','Dnes nemám doklady.']);
    variants('need_form_help',[
      'Pomůžete mi s tím?','Nevím, co sem napsat.','Nerozumím tomuto políčku.','Nemám tužku.',
      'Můžete mi půjčit pero?','Ještě jsem to nevyplnil.','Ještě jsem to nevyplnila.',
      'Neumím vyplnit ten formulář.','Co mám napsat do žádosti?','Prosím, potřebuji pomoc.'
    ]);
    update('need_form_help',r=>{r.match.patterns=[['formAssistance']];r.match.priority=20;});
    variants('ask_signature',['Kde má být podpis?','Kam se podepisuje?','Podepsat tady?','Mám se podepsat dole?','Kde přesně mám podepsat?']);
    variants('completed_form',['Už to mám.','Všechno jsem vyplnil.','Všechno jsem vyplnila.','Prosím, je to hotové.','Tady máte vyplněný formulář.']);
    variants('retake_photo',[
      'Mohli bychom to zkusit znovu?','Na té fotce se mi nelíbím.','Ta fotka není povedená.',
      'Prosím ještě jednu fotku.','Zkusíme další?','Můžete udělat jinou fotku?','Raději ještě jednu.',
      'Mám tam zavřené oči.','Nevypadám tam dobře.','Tahle se mi nelíbí.'
    ]);
    variants('accept_photo',['Klidně tuhle.','Tahle může být.','Jsem s ní spokojený.','Jsem s ní spokojená.','Necháme ji.','Ano, vyhovuje mi.']);
    variants('accept_new_photo',['Tuhle necháme.','Teď už je dobrá.','Jsem spokojený.','Jsem spokojená.','Takto to může být.']);
    variants('another_photo',['Ještě jednu fotku prosím.','Pořád se mi nelíbí.','Můžete udělat další?']);
    for(const id of ['accept_photo','accept_new_photo'])update(id,r=>{r.match.patterns.push(['photoKeep']);r.match.forbidden.push('photoRefusal');});
    for(const id of ['retake_photo','another_photo'])update(id,r=>{r.match.patterns.push(['photoAnother','photoObject']);});
    add(['photo','photo_information','photo_again','photo_instructions'],'decline_photo','photo_required',[
      'Nechci se fotit.','Já už fotku mám.','Mám vlastní fotografii.','Musíte mě fotit?',
      'Nestačí moje fotka?','Nemůžu přinést vlastní?','Proč nemůžu použít svou fotku?',
      'Prosím nefoťte mě.','Fotografii jsem si přinesla.','Fotografii jsem si přinesl.'
    ],{patterns:[['photoRefusal']],priority:20});
    t.node('photo_required','V tomto rozhovoru vás vyfotíme tady. Můžeme fotografii zopakovat. Chcete pokračovat, nebo přijít jindy?',
      'In this conversation we take the photo here. We can take it again. Would you like to continue or come another time?',[
        t.response('agree_to_photo','photo',['Dobře, vyfoťte mě.','Tak ano.','Můžeme pokračovat.','Souhlasím.','Ano, pokračujme.']),
        t.response('postpone_photo','later',['Přijdu jindy.','Ne, děkuji.','Dnes nechci pokračovat.','Vrátím se později.'])
      ],'photo');
    variants('standard_service',[
      'Dobře, počkám.','Stačí mi normální.','Tak to levnější.','Nespěchá to.',
      'Nemusí to být rychle.','Počkám tři týdny.','Běžné vydání prosím.',
      'Chci tu levnější možnost.','Tři týdny mi nevadí.','Stačí mi to za tři týdny.'
    ]);
    variants('express_service',[
      'Potřebuji ho co nejdřív.','Chci rychlé vydání.','Co nejrychleji prosím.','Vezmu expresní.',
      'Nemůžu čekat tři týdny, chci expresní.','Radši si připlatím za rychlejší.',
      'Potřebuji průkaz brzy.','Zrychleně prosím.','Za pět dní to potřebuji.','Prosím tu rychlejší možnost.'
    ]);
    for(const id of ['standard_service','change_to_standard'])update(id,r=>{
      r.match.patterns.push(['standardAcceptance']);r.match.forbidden=r.match.forbidden.filter(x=>x!=='refusal');
      r.match.positiveConcepts.push('standardAcceptance');
    });
    for(const id of ['express_service','change_to_express'])update(id,r=>{
      r.match.patterns.push(['expressAcceptance']);r.match.forbidden=r.match.forbidden.filter(x=>x!=='refusal');
      r.match.positiveConcepts.push('expressAcceptance');
    });
    // A question about one service receives that service's price, then a confirmation question.
    const choiceNodes=['times','fees','times_repeat','express_explained','fees_explained'];
    // A targeted price question now has a targeted reply rather than the generic price list.
    update('fees_clarification',r=>{r.examples=r.examples.filter(p=>p!=='Kolik stojí normální vydání?');});
    c.fees_clarification=c.fees_clarification.filter(p=>p!=='Kolik stojí normální vydání?');
    for(const [mode,word,amount,period]of [['standard','standardWords',200,'tři týdny'],['express','expressWords',700,'pět dnů']]) {
      const fast=mode==='express';
      const examples=fast?[
        'A kolik stojí expresní?','Kolik stojí ta rychlejší možnost?','Chci expresní, kolik zaplatím?',
        'Potřebuji to rychle, jaká je cena?','Kolik za pět dnů?','Jaký je poplatek za expresní?',
        'Kolik bych zaplatila za expresní?','Kolik bych zaplatil za expresní?','A za kolik je to zrychlené?',
        'Tak dobře, expresně, ale kolik to stojí?'
      ]:[
        'Kolik stojí normální vydání?','A kolik za to levnější?','Počkám, kolik zaplatím?',
        'Chci normální, jaká je cena?','Kolik stojí běžné vydání?','Jaký je poplatek za standardní?',
        'Kolik bych zaplatila za normální?','Kolik bych zaplatil za normální?','Za kolik je to za tři týdny?',
        'Nespěchám, kolik to bude stát?'
      ];
      add(choiceNodes,mode+'_price_question',mode+'_offer',examples,{patterns:[['servicePriceAsk',word],['servicePriceAsk',fast?'expressAcceptance':'standardAcceptance']],
        positiveConcepts:[word,fast?'expressAcceptance':'standardAcceptance'],forbidden:[fast?'standardWords':'expressWords'],priority:30});
      t.node(mode+'_offer',(fast?'Expresní':'Normální')+' vydání je za '+amount+' korun a průkaz bude za '+period+'. Chcete tuto možnost?',
        (fast?'Express':'Standard')+' service costs '+amount+' crowns and takes '+(fast?'five days':'three weeks')+'. Would you like this option?',[
          t.response('accept_'+mode+'_offer',mode,['Ano.','Dobře.','Tak to chci.','Souhlasím.','Tuhle možnost beru.','To mi vyhovuje.','Dobře, vyberu si to.','Tak tuto prosím.','Ano, za tuto cenu.','To bude dobré.']),
          t.response('reject_'+mode+'_offer',fast?'standard':'express',['Raději tu druhou možnost.','Ne, tu druhou.','Změním to.']),
          ...nodes.times.responses.filter(r=>!r.id.endsWith('_price_question'))
        ],'times');
    }
    const defer=add(choiceNodes,'postpone_service','later',[
      'Ještě si to rozmyslím.','Přijdu jindy.','Dnes to nechci vyřídit.','Nechci ani jednu možnost.',
      'Vrátím se později.','Potřebuji čas na rozmyšlenou.','Nechám to na zítra.',
      'Dnes žádost nepodám.','Teď nemám čas.','Žádost ruším.'
    ],{patterns:[['serviceDecline']],priority:40});
    const advice=add(choiceNodes,'service_advice','service_advice',[
      'Nevím, co vybrat.','Co mi doporučíte?','Můžete mi poradit?','Nemůžu se rozhodnout.',
      'Jaká možnost je lepší?','Potřebuji s výběrem pomoct.','Co byste zvolil?',
      'Nejsem si jistá.','Nejsem si jistý.','Jak se mám rozhodnout?'
    ],{patterns:[['serviceAdvice']],priority:10});
    t.node('service_advice','Pokud nespěcháte, normální vydání je levnější. Pokud průkaz potřebujete brzy, můžete zvolit expresní. Chcete normální, expresní, nebo znát cenu?',
      'Standard service is cheaper if you are not in a hurry. Choose express if you need it soon. Would you like standard, express, or the prices?',nodes.times.responses,'times');
    c.serviceMention=[...c.standardWords,...c.expressWords];
    add([...choiceNodes,'service_advice'],'decline_service_option','service_advice',[
      'Nechci expresní.','Normální nechci.','Nepotřebuji expresní vydání.','Nechci to za tři týdny.'
    ],{patterns:[['negativeService','serviceMention']],forbidden:['standardWords','expressWords'],positiveConcepts:['standardWords','expressWords']});
    for(const mode of ['standard','express']) {
      nodes[mode+'_offer'].responses.push(defer,advice);
      update('reject_'+mode+'_offer',r=>{r.match.patterns=[['otherService']];});
      variants('pay_'+mode,['Zaplatím kartou.','Budu platit hotově.','Tady máte přesně.','Prosím, tady to je.','Kartou prosím.']);
      variants('ask_'+mode+'_payment',['Dá se platit kartou?','Můžu použít kartu?','Přijímáte platební karty?','Musím platit hotově?','Je možné platit kartou?']);
      update('ask_'+mode+'_payment',r=>{r.match.patterns.push(['paymentAbility','paymentAction']);r.match.forbidden=['cannotPay'];r.match.priority=20;});
      update('pay_'+mode,r=>{r.match.forbidden.push('paymentAbility');});
    }
    credit({identity:['identity','identity_explained'],form:['form','form_help','signature_explained','application_explained'],
      photo:['photo','photo_information','photo_again','photo_explained','photo_instructions','photo_required'],
      times:['times','fees','times_repeat','express_explained','fees_explained','standard_offer','express_offer','service_advice']});
  }
  root.ExpandedIntents={optician,licence};
})(globalThis);
