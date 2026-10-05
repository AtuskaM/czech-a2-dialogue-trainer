// Matching metadata is separate from teacher-reviewed dialogue wording.
(function(root) {
  'use strict';
  const shared=root.DialogueConcepts;
  Object.assign(shared,{
    refusal:['ne','nechci','nechceme','nepotřebuji','nepotřebuju','nezaplatím','nemám','nesouhlasím','nevyplním','nevyplnil','nevyplnila'],
    cash:['hotově','hotovost','v hotovosti'],
    cardPayment:['kartou','platební kartou','kreditkou'],
    missingPrescription:['nemám','nemáme','nemam předpis','bez předpisu','zapomněl','zapomněla'],
    negativeFit:['ne','nesedí','nejsou mi','nechci','nekoupím','nevezmu'],
    decline:['ne','nechci','nekoupím','nevezmu','nesouhlasím','nemůžu','nevyhovuje','neobjednávejte'],
    clarification:['co znamená','co je','co jsou','jaký je rozdíl','nerozumím','zopakujte','zopakovat','opakovat','pomaleji'],
    metal:['kovové','kovových','hranaté','hranatých'],
    plastic:['plastové','plastových','kulaté','kulatých'],
    tooSmall:['malé','těsné','větší'],
    tooLarge:['velké','menší'],
    daily:['denní','denních'],
    monthly:['měsíční','měsíčních'],
    black:['černé','černých'],
    brown:['hnědé','hnědých'],
    standard:['standardní','normální','normálně','tři týdny'],
    express:['expresní','expresně','pět dnů','pět dní'],
    wrongStandardPrice:['sedm set','sedmset'],
    wrongExpressPrice:['dvě stě','dvěstě']
  });
  shared.refuse=[...new Set([...shared.refuse,...shared.refusal])];
  shared.oneYear.push('jeden','jednoho','roční');
  shared.otherYears.push('dvou','třech','čtyř','pěti');
  shared.discount25.push('pětadvacet procent');
  // Exact phrase alternatives allow safe recognition of established model answers.
  // Intent-specific exclusions stop opposite choices from sharing a route.
  const exclusions={
    has_prescription:['missingPrescription','clarification'],
    metal_frames:['plastic','clarification','refusal'],
    plastic_frames:['metal','clarification','refusal'],
    need_larger:['tooLarge'],need_smaller:['tooSmall'],
    frames_fit:['negativeFit','tooSmall','tooLarge'],
    larger_fit:['negativeFit'],smaller_fit:['negativeFit'],good_fit:['negativeFit'],
    agree_test:['decline','clarification'],agree_measure:['decline','clarification'],
    buy_glasses:['refusal'],repair_glasses:['refusal'],buy_selected:['decline'],
    accept_week:['decline'],accept_lens_date:['decline'],confirm_glasses:['decline'],
    daily_lenses:['monthly','clarification','refusal'],monthly_lenses:['daily','clarification','refusal'],
    black_frames:['brown','refusal'],brown_frames:['black','refusal'],
    express_service:['standard','refusal','clarification'],standard_service:['express','refusal','clarification'],
    show_identity:['missingPrescription','clarification'],
    accept_photo:['negativeFit','clarification'],accept_new_photo:['negativeFit','clarification'],
    pay_standard:['wrongStandardPrice','refusal'],pay_express:['wrongExpressPrice','refusal']
  };
  const extra={
    buy_glasses:['nové brýle','rozbité brýle','rozbila jsem brýle','rozbil jsem brýle'],
    repair_glasses:['opravit brýle','opravu brýlí'],
    metal_frames:['kovové','hranaté'],plastic_frames:['plastové','kulaté'],
    need_larger:['větší','těsné','jsou malé'],need_smaller:['menší','jsou velké'],
    has_prescription:['mám předpis','mám ho','ano'],no_prescription:['nemám předpis','nemám ho','nemám'],
    daily_lenses:['denní'],monthly_lenses:['měsíční'],
    black_frames:['černé'],brown_frames:['hnědé'],
    express_service:['expresně','expresní','za pět dní','za pět dnů'],
    standard_service:['normálně','standardní','za tři týdny'],
    show_identity:['mám pas','mám občanku','tady je pas'],no_identity:['nemám doklad','nemám pas'],
    budget_2000:['dva tisíce','dvou tisíc'],budget_1500:['tisíc pět set','patnáct set'],
    finish:['na shledanou','nashledanou']
  };
  const amounts={pay:740,pay_740:740,pay_3740:3740,pay_standard:200,pay_express:700,budget_2000:2000,budget_1500:1500,choose_25_percent:25,choose_50_percent:50};
  for(const dialogue of root.DialogueCatalog) {
    dialogue.reviewStatus=['station-card-1','station-card-2','optika-1'].includes(dialogue.id)?'revised':'pending';
    for(const node of Object.values(dialogue.nodes))for(const response of node.responses) {
      if(Object.hasOwn(amounts,response.intent))response.match.allowedAmounts=[amounts[response.intent]];
      if(dialogue.concepts && dialogue.matchingRevision!==2) {
        const id=response.id;
        // Retain existing examples and routing; add only matching metadata.
        dialogue.concepts[id]=[...new Set([...dialogue.concepts[id],...(extra[id]||[])])];
        response.match.forbidden=exclusions[id]||[];
        if(id.startsWith('finish'))dialogue.concepts[id].push('na shledanou','nashledanou');
      }
      if(response.intent==='pay_740'||response.intent==='pay_3740')response.match.forbidden.push('cardPayment');
      if(response.intent==='provide_photo')response.match.forbidden.push('clarification');
    }
  }
})(globalThis);
