// Content for PDF dialogue 4, page 5. Examples use the unchanged word matcher.
(function() {
  const concepts={},nodes={};
  const r=(id,next,examples)=>{concepts[id]=examples;return {id,intent:id,examples,match:{required:[id]},next,kind:'choice',reward:1};};
  const n=(id,clerk,translation,responses,retry,english)=>nodes[id]={clerk,translation,responses,retry:{clerk:retry,translation:english,next:responses[0].next}};
  const repeat=(id,source,clerk,translation)=>{const base=nodes[source],responses=base.responses.filter(r=>r.next!==id);nodes[id]={...base,clerk,translation,responses,retry:{...base.retry,next:responses[0].next}};};
  const again=['Nerozumím. Můžete to zopakovat?','Zopakujte to, prosím.','Můžete mluvit pomaleji?','Ještě jednou, prosím.','Nerozumím.'];
  const bye=['Děkuji, na shledanou.','Děkuju. Na shledanou.','Na shledanou.','Díky, nashledanou.'];

  n('start','Dobrý den. Co pro vás můžu udělat?','Hello. What can I do for you?',[
    r('repair_glasses','repair',['Dobrý den. Rozbil jsem si brýle a nevidím bez nich. Šlo by to opravit?','Rozbila jsem si brýle. Můžete je opravit?','Mám rozbité brýle. Potřebuji opravu.','Chtěl bych opravit brýle.','Potřebuji opravit brýle.']),
    r('repeat_start','start_repeat',again)
  ],'Máte rozbité brýle? Řekněte mi, co potřebujete.','Are your glasses broken? Tell me what you need.');
  repeat('start_repeat','start','S čím vám můžu pomoct? Potřebujete opravit brýle?','What can I help you with? Do you need your glasses repaired?');

  n('repair','Ukažte. Hm, obávám se, že to nepůjde. Budete si muset koupit nové brýle.','Let me see. I am afraid they cannot be repaired. You will need to buy new glasses.',[
    r('ask_contacts','prescription',['A prodáváte čočky?','Máte kontaktní čočky?','Chtěl bych zkusit čočky.','Prodáváte kontaktní čočky?','Čočky máte?']),
    r('choose_glasses','budget',['Dobře, podívám se na nové brýle.','Tak si koupím nové brýle.','Chci si vybrat nové brýle.','Raději nové brýle.']),
    r('explain_repair','repair_explained',['Proč to nejde opravit?','Proč nejdou opravit?','Nerozumím. Zopakujte to, prosím.','Co se s nimi stalo?'])
  ],'Tyto brýle už opravit nejdou. Chcete nové brýle, nebo se zeptat na čočky?','These glasses cannot be repaired. Would you like new glasses, or would you like to ask about contact lenses?');
  repeat('repair_explained','repair','Brýle jsou moc poškozené. Oprava není možná. Můžeme vybrat nové brýle nebo kontaktní čočky.','The glasses are badly damaged. A repair is not possible. We can choose new glasses or contact lenses.');

  n('prescription','Ano, čočky máme. Máte předpis? Jaké máte dioptrie?','Yes, we have contact lenses. Do you have a prescription? What are your dioptres?',[
    r('explain_dioptres','dioptres_explained',['Co znamená dioptrie?','Co jsou dioptrie?','Jaké číslo potřebujete?','Nerozumím slovu dioptrie.','Nerozumím.']),
    r('known_dioptres','lens_prices',['Nemám, ale na levém oku mám minus dva a na pravém minus jedna a půl. A kolik čočky stojí?','Vlevo mám minus dva, vpravo minus jedna a půl.','Na levém minus dva a na pravém minus jedna a půl.','Minus dva a minus jedna a půl.']),
    r('has_prescription','lens_prices',['Ano, mám předpis. Tady je.','Mám předpis od lékaře.','Tady mám předpis.','Ano.']),
    r('unknown_dioptres','measure',['Nevím, jaké mám dioptrie.','Nemám předpis a dioptrie neznám.','To číslo si nepamatuju.','Nevím.'])
  ],'Máte předpis, znáte svoje dioptrie, nebo je neznáte?','Do you have a prescription, know your dioptres, or not know them?');
  repeat('dioptres_explained','prescription','Dioptrie je číslo, které říká, jak silná skla potřebujete. Číslo je na předpisu. Máte ho, nebo znáte ta čísla?','A dioptre value is a number that tells us how strong your lenses need to be. It is on the prescription. Do you have it, or do you know the numbers?');
  n('measure','Dobře, nejdřív vám změříme zrak. Pak můžeme vybrat vhodné čočky. Souhlasíte?','All right, first we will test your eyesight. Then we can choose suitable contact lenses. Is that OK?',[
    r('agree_measure','lens_prices',['Ano, změřte mi zrak.','Dobře, souhlasím.','Ano, prosím.','To je v pořádku.']),
    r('postpone_measure','later',['Raději přijdu jindy.','Dnes nemám čas.','Teď nemůžu.','Vrátím se později.'])
  ],'Chcete měření teď, nebo přijdete později?','Would you like the eye test now, or will you come back later?');

  n('lens_prices','Před výběrem čoček ještě ověříme dioptrie. Denní čočky stojí asi 800 korun za měsíc, měsíční jsou asi za 200 korun. Co si vyberete?','We will check the dioptres before choosing contact lenses. Daily lenses cost about 800 crowns per month; monthly lenses cost about 200 crowns. What would you choose?',[
    r('explain_lenses','lenses_explained',['Jaký je rozdíl mezi denními a měsíčními čočkami?','Co znamená denní čočky?','Co jsou měsíční čočky?','Nerozumím. Zopakujte to, prosím.']),
    r('repeat_lens_prices','lens_prices_repeat',['Kolik stojí čočky?','Zopakujte ceny, prosím.','Kolik stojí denní a měsíční čočky?','Jaká je cena?']),
    r('prefer_glasses','budget',['Možná se radši podívám na ty brýle. Můžu zaplatit maximálně dva tisíce.','Raději si vyberu brýle.','Čočky nechci, chci brýle.','Raději brýle.']),
    r('daily_lenses','daily',['Vyberu si denní čočky.','Denní čočky, prosím.','Raději ty denní za 800 korun.','Denní.']),
    r('monthly_lenses','monthly',['Chci měsíční čočky.','Měsíční čočky za 200 korun.','Raději ty měsíční.','Měsíční.'])
  ],'Vyberete si denní čočky, měsíční čočky, nebo raději brýle?','Will you choose daily lenses, monthly lenses, or glasses instead?');
  repeat('lenses_explained','lens_prices','Denní čočky jsou na jeden den. Měsíční jsou na měsíc a musí se čistit. Optička vám ukáže, jak je používat. Chcete denní, měsíční, nebo raději brýle?','Daily lenses are for one day. Monthly lenses are for a month and need cleaning. The optician will show you how to use them. Would you like daily lenses, monthly lenses, or glasses instead?');
  repeat('lens_prices_repeat','lens_prices','Denní čočky vyjdou asi na 800 korun za měsíc, měsíční asi na 200 korun. Které chcete? Nebo chcete raději brýle?','Daily lenses cost about 800 crowns per month and monthly ones about 200 crowns. Which would you like? Or would you prefer glasses?');
  // Clarification nodes rejoin the same three genuine options without cycling.
  for(const id of ['lenses_explained','lens_prices_repeat']){
    nodes[id].responses=nodes.lens_prices.responses.filter(r=>['prefer_glasses','daily_lenses','monthly_lenses'].includes(r.id));
    nodes[id].retry.next='budget';
  }

  const lensFollowUp=[
    r('ask_lens_ready','lens_ready',['Kdy budou čočky připravené?','Kdy si je můžu vyzvednout?','Za jak dlouho budou hotové?','Kdy budou?']),
    r('order_lenses','lens_done',['Dobře, objednejte mi je.','Chci si je objednat.','Vezmu si tyto čočky.','Objednejte je, prosím.']),
    r('change_to_glasses','budget',['Raději si koupím brýle.','Rozmyslel jsem si to. Chci brýle.','Místo čoček chci brýle.','Raději brýle.'])
  ];
  n('daily','Vybrala jste denní čočky. Cena na měsíc je asi 800 korun. Nejdřív je s vámi vyzkoušíme. Chcete je objednat?','You have chosen daily lenses. A month’s supply costs about 800 crowns. First we will try them with you. Would you like to order them?',lensFollowUp,'Chcete čočky objednat, zeptat se na termín, nebo raději vybrat brýle?','Would you like to order lenses, ask when they will be ready, or choose glasses instead?');
  n('monthly','Vybrala jste měsíční čočky za přibližně 200 korun. Nejdřív je s vámi vyzkoušíme a ukážeme vám čištění. Chcete je objednat?','You have chosen monthly lenses for about 200 crowns. First we will try them with you and show you how to clean them. Would you like to order them?',lensFollowUp,'Chcete čočky objednat, zeptat se na termín, nebo raději vybrat brýle?','Would you like to order lenses, ask when they will be ready, or choose glasses instead?');
  n('lens_ready','Čočky pro vás můžeme připravit do pátku. Vyhovuje vám to?','We can have the contact lenses ready for you by Friday. Does that suit you?',[
    r('accept_lens_date','lens_done',['Ano, pátek mi vyhovuje.','Dobře, přijdu v pátek.','Ano, objednejte je.','Počkám do pátku.']),
    r('decline_lens_date','later',['Do pátku nemůžu čekat.','Potřebuji je dnes.','Pátek mi nevyhovuje.','Rozmyslím si to.'])
  ],'Můžete počkat do pátku, nebo si to chcete rozmyslet?','Can you wait until Friday, or would you like to think about it?');

  n('budget','Podíváme se tedy na brýle. Kolik můžete zaplatit?','Let us look at glasses, then. How much can you spend?',[
    r('budget_2000','choose_frames',['Můžu zaplatit maximálně dva tisíce.','Mám nejvýš 2000 korun.','Do dvou tisíc korun.','Asi dva tisíce.','Maximálně 2000.']),
    r('budget_1500','cheaper_frames',['Mám jen 1500 korun.','Maximálně patnáct set.','Do 1500 korun.','Patnáct set korun.']),
    r('repeat_budget','budget_repeat',again)
  ],'Jaká je vaše nejvyšší cena? Například 1500 nebo 2000 korun.','What is your maximum price? For example, 1,500 or 2,000 crowns.');
  repeat('budget_repeat','budget','Kolik peněz chcete dát za nové brýle?','How much money would you like to spend on new glasses?');
  const chooseFrames=[
    r('black_frames','try_black',['Můžu si je zkusit? Ty černé, prosím.','Chtěla bych vyzkoušet černé brýle.','Ty černé, prosím.','Černé.']),
    r('brown_frames','try_brown',['Můžu si zkusit ty hnědé?','Raději hnědé brýle.','Ty hnědé, prosím.','Hnědé.']),
    r('explain_trying','trying_explained',['Můžu si brýle vyzkoušet?','Můžu si je zkusit?','Jak si je můžu vyzkoušet?','Nerozumím.'])
  ];
  n('choose_frames','Do 2000 korun máme tyto černé a hnědé brýle. Stojí 1500 korun. Které si chcete zkusit?','Within 2,000 crowns we have these black and brown glasses. They cost 1,500 crowns. Which would you like to try?',chooseFrames,'Chcete si zkusit černé, nebo hnědé brýle?','Would you like to try the black glasses or the brown ones?');
  n('cheaper_frames','Za 1500 korun máme tyto jednoduché černé a hnědé brýle. Které si chcete zkusit?','For 1,500 crowns we have these simple black and brown glasses. Which would you like to try?',chooseFrames,'Chcete si zkusit černé, nebo hnědé brýle?','Would you like to try the black glasses or the brown ones?');
  repeat('trying_explained','choose_frames','Ano, samozřejmě si je můžete nasadit a podívat se do zrcadla. Které chcete zkusit, černé nebo hnědé?','Yes, of course you can put them on and look in the mirror. Which would you like to try, black or brown?');
  const fit=[
    r('bad_fit','other_size',['Jsou moc těsné.','Jsou mi malé. Máte větší?','Nesedí mi dobře.','Potřebuji jinou velikost.']),
    r('good_fit','glasses_ready',['Tyhle jsou dobré, vezmu si je.','Sedí mi dobře.','Jsou pohodlné. Kdy budou hotové?','Tyhle si koupím.','Kdy si je můžu vyzvednout?'])
  ];
  n('try_black','Tady jsou černé brýle. Jak vám sedí?','Here are the black glasses. How do they fit?',fit,'Jsou vám brýle dobré, nebo potřebujete jinou velikost?','Do the glasses fit, or do you need a different size?');
  n('try_brown','Tady jsou hnědé brýle. Jak vám sedí?','Here are the brown glasses. How do they fit?',fit,'Jsou vám brýle dobré, nebo potřebujete jinou velikost?','Do the glasses fit, or do you need a different size?');
  n('other_size','Zkuste tyto větší brýle. Cena je také 1500 korun. Jsou lepší?','Try these larger glasses. The price is also 1,500 crowns. Are they better?',[
    r('larger_fit','glasses_ready',['Ano, tyto jsou lepší.','Sedí mi dobře. Vezmu si je.','Tyhle si koupím.','Ano.']),
    r('still_bad_fit','later',['Ne, ani ty mi nesedí.','Pořád jsou moc malé.','Nekoupím je.','Přijdu jindy.'])
  ],'Chcete tyto brýle koupit, nebo přijdete jindy?','Would you like to buy these glasses, or come another time?');
  n('glasses_ready','Brýle stojí 1500 korun a budou hotové v pátek. Mám je objednat?','The glasses cost 1,500 crowns and will be ready on Friday. Shall I order them?',[
    r('confirm_glasses','glasses_done',['Ano, objednejte je.','Dobře, v pátek si přijdu.','Ano, vezmu si je.','Objednejte mi je, prosím.']),
    r('decline_glasses','later',['Pátek je pozdě.','Nemůžu čekat do pátku.','Rozmyslím si to.','Neobjednávejte je.'])
  ],'Mám brýle objednat na pátek, nebo si to chcete rozmyslet?','Shall I order the glasses for Friday, or would you like to think about it?');
  n('glasses_done','Objednávku jsem zapsala. Přijďte si v pátek pro brýle. Na shledanou.','I have placed the order. Come for your glasses on Friday. Goodbye.',[r('finish_glasses',null,bye)],'Děkuji. Na shledanou.','Thank you. Goodbye.');
  n('lens_done','Dobře, objednávku čoček jsem zapsala. Připravíme je do pátku. Na shledanou.','Good, I have placed the contact-lens order. We will have them ready by Friday. Goodbye.',[r('finish_lenses',null,bye)],'Děkuji. Na shledanou.','Thank you. Goodbye.');
  n('later','Dobře, můžete se vrátit později. Na shledanou.','All right, you can come back later. Goodbye.',[r('finish_later',null,bye)],'Na shledanou.','Goodbye.');

  globalThis.DialogueCatalog.push({schemaVersion:1,id:'optika-2',title:'4. Optika – nové brýle (varianta 2)',clerkLabel:'Optička (Optician)',situation:'Jste v optice a potřebujete opravit brýle.',situationTranslation:'You are at an optician’s and you need to buy glasses.',source:{file:'zkouska_A2_uloha_2_dialogy_1-rayoyf.pdf',page:5,dialogue:4},start:'start',concepts,nodes});
})();
