(function(root) {
  const base=root.DialogueCatalog.find(d=>d.id==='ridicsky-prukaz-1');
  const b=root.BatchDialogue({id:'ridicsky-prukaz-2',title:'6. Úřad – řidičský průkaz (varianta 2)',clerkLabel:'Úředník (Clerk)',
    situation:'Jste na úřadě. Ztratil/a jste řidičský průkaz a potřebujete nový. Máte vyplněnou žádost a pas.',
    situationTranslation:'You are at an administrative office. You lost your driving licence and need a new one. You have a completed application and your passport.',
    source:{file:'zkouska_A2_uloha_2_dialogy_1-rayoyf.pdf',page:6,dialogue:6}},JSON.parse(JSON.stringify(base.concepts)));
  const {c,nodes,t,r,n,finish}=b;
  // Reuse the already-tested service/payment conversation, without copying dialogue 5's opening.
  const pending=['times'];
  while(pending.length) {
    const id=pending.pop();if(nodes[id])continue;
    const node=JSON.parse(JSON.stringify(base.nodes[id]));
    node.responses=node.responses.filter(r=>!r.id.startsWith('request_repeat_'));
    node.retry.next=id;nodes[id]=node;
    for(const answer of node.responses)if(answer.next!==null)pending.push(answer.next);
  }
  nodes.leave=nodes.later;delete nodes.later;
  nodes.leave.retry.next='leave';
  for(const node of Object.values(nodes))for(const answer of node.responses)if(answer.next==='later')answer.next='leave';
  Object.assign(c,{
    newLicence:['řidičský průkaz','řidičák','řidičského průkazu'],newRequest:['nový','náhradní','duplikát','ztratil','ztratila','ukradli','vyměnit'],
    missingOld:['nemám','ztratil','ztratila','ztracený','ukradli','nenašel','nenašla','ztratil se'],
    foundOld:['našel','našla','mám ho','tady je starý','přinesl jsem starý','přinesla jsem starý'],
    photoQuery:['fotku','fotografii','fotografie'],formQuery:['formulář','žádost','vyplnit','podepsat'],
    whichDocument:['který','jaký','myslíte','na mysli'],documentObject:['průkaz','řidičák','starý','pas','občanku','doklad'],
    enoughDocument:['stačí','stačilo','dostačuje','můžu ukázat','mohu ukázat','můžu použít','mohu použít'],
    formNeed:['jak','kde','co','nemám','pomoct','pomoci','mám vyplnit']
  });
  n('start','Dobrý den. Co pro vás můžu udělat?','Hello. What can I do for you?',[
    r('new_licence','old',['Potřebuju nový řidičský průkaz.','Potřebuji nový řidičák.','Ztratila jsem řidičák.','Ztratil jsem řidičský průkaz.','Chtěla bych náhradní řidičský průkaz.','Chtěl bych nový řidičák.','Ukradli mi řidičák.','Chci požádat o duplikát řidičského průkazu.'],[['newLicence','newRequest']],['refuse']),
    r('opening_help','opening_help',['Můžete mi pomoct?','Nevím, jak požádat o nový doklad.','Potřebuji poradit.','Jak mám postupovat?'],[['help']])
  ]);
  t.clarify('start','opening_help','Pomůžu vám s žádostí o nový řidičský průkaz. Potřebujete nový průkaz, protože jste starý ztratil nebo ztratila?','I can help you apply for a new driving licence. Do you need a new one because you lost the old one?');
  n('old','A máte ten starý řidičský průkaz?','Do you have the old driving licence?',[
    r('old_missing','identity',['Ne, nemám, ztratila jsem ho. Tady je vyplněná žádost. Fotku nepotřebujete, že?','Ne, ztratil jsem ho.','Nemám ho.','Bohužel jsem ho ztratila.','Někdo mi ho ukradl.','Nemůžu ho najít.','Ne, už ho nemám.'],[['missingOld']]),
    r('old_found','found',['Ano, už jsem ho našel.','Našla jsem ho.','Mám ho tady.','Tady je starý průkaz.'],[['foundOld']],['missingOld']),
    r('old_help','old_help',['Který průkaz myslíte?','Myslíte řidičák?','Proč ho potřebujete?','Jaký starý?'],[['whichDocument','documentObject']])
  ]);
  t.clarify('old','old_help','Myslím váš původní řidičský průkaz. Máte ho, nebo se ztratil?','I mean your original driving licence. Do you have it, or was it lost?');
  n('found','Jestli jste ho našel nebo našla, nový kvůli ztrátě nepotřebujete. Chcete přesto řešit výměnu, nebo žádost zrušit?','If you found it, you do not need a replacement for a lost licence. Would you still like to discuss replacing it, or cancel the application?',[
    r('continue_replace','identity',['Chci ho vyměnit.','Potřebuji výměnu.','Stejně chci nový.','Ano, výměnu prosím.','Je poškozený.','Už není platný.']),
    r('cancel_replace','leave',['Tak žádost zruším.','Nový nepotřebuji.','Nechám si starý.','Dobře, zrušte ji.','Už nic nepotřebuji.'])
  ]);
  n('identity','Fotku nepotřebujeme. Ještě prosím průkaz totožnosti, pas nebo občanku.','We do not need a photo. Please also show identification: a passport or identity card.',[
    r('show_document','times',['Tady je můj pas. A jak dlouho to bude trvat?','Tady máte pas.','Mám občanku.','Ano, tady je.','Pas mám s sebou.','Občanku nemám, ale pas mám.'],[['documentAvailable']],['identityAllMissing','identityQuestion'],0,['documentAvailable']),
    r('missing_document','bring_document',['Doklady jsem zapomněl doma.','Nemám pas ani občanku.','Nemám žádný doklad.','Dnes je nemám s sebou.'],[['identityNo']],['documentAvailable'],0,['documentAvailable']),
    r('document_question','document_help',['Co je průkaz totožnosti?','Stačí pas?','Jaký doklad potřebujete?','Můžu ukázat občanku?'],[['identityQuestion'],['enoughDocument','documentObject']],[],15),
    r('form_question','form_help',['Mám žádost vyplnit?','Kde se mám podepsat?','Ještě nemám formulář.','Potřebuji pomoct s žádostí.'],[['formQuery','formNeed']],[],20)
  ]);
  t.clarify('identity','document_help','Stačí váš pas nebo občanský průkaz. Máte jeden z nich u sebe?','Your passport or identity card is sufficient. Do you have one with you?');
  t.clarify('identity','form_help','Vyplňte žádost a na druhé straně se podepište. Potom mi ji dejte spolu s pasem nebo občankou.','Complete the application and sign the second side. Then give it to me with your passport or identity card.');
  n('bring_document','Bez dokladu žádost nedokončíme. Můžete ho přinést?','We cannot complete the application without identification. Can you bring it?',[
    r('fetch_document','identity',['Dojdu pro pas.','Přinesu občanku.','Hned se vrátím s dokladem.','Ano, přinesu ho.','Mám ho v autě, dojdu pro něj.']),
    r('document_later','leave',['Dnes už nemůžu.','Přijdu s pasem zítra.','Vrátím se jiný den.','Přinesu ho později.','Teď nemám čas.'])
  ]);
  for(const [id,node]of Object.entries(nodes))if(['times','fees','fees_explained','times_repeat','express_explained','service_advice'].includes(id)) {
    node.openPrompt=true;
    for(const mode of ['standard','express'])node.responses.push(r('choose_'+mode+'_card',mode+'_payment',[
      ...(mode==='express'?['Jasně. Spěchám, tak radši zaplatím víc. Můžu platit kartou?','Chci expresní a můžu platit kartou?']:['Stačí normální vydání, můžu platit kartou?','Nespěchám. Berete karty?'])
    ],[[mode==='express'?'expressWords':'standardWords','paymentQuestion']],[],40));
  }
  finish();
})(globalThis);
