// Content authoring only: common conversational vocabulary for source dialogues 6–10.
(function(root) {
  root.BatchDialogue=function(meta,extra={}) {
    const concepts={
      repeatRequest:['zopakovat','zopakujte','ještě jednou','pomaleji','nerozumím','nerozuměl','nerozuměla'],
      understood:['rozumím','dobře','jasně','aha','chápu','děkuji za vysvětlení'],
      notUnderstood:['nerozumím','nechápu','nevím'],
      yes:['ano','dobře','souhlasím','vyhovuje','můžu','mohu','hodí se','platí','v pořádku','beru','vezmu'],
      no:['ne','nechci','nemůžu','nemohu','nevyhovuje','nehodí','nesouhlasím','nevezmu','nemám čas'],
      askPrice:['kolik','cena','cenu','ceny','stojí','zaplatit','zaplatím'],
      askDifference:['rozdíl','liší','jaký je','jak funguje','vysvětlit','vysvětlíte'],
      help:['pomoc','pomoct','pomoci','poradit','poradíte','doporučíte','nevím','neumím'],
      leave:['na shledanou','nashledanou','přijdu jindy','přijdu později','vrátím se později','rozmyslím si to'],
      pay:['platím','zaplatím','budu platit','tady máte','tady je','kartou','hotově','hotovostí'],
      payQuestion:['můžu platit','mohu platit','můžu zaplatit','mohu zaplatit','berete karty','přijímáte karty','dá se platit','lze platit','jde platit','můžu kartou'],
      noPay:['nemám peníze','nemůžu zaplatit','nemohu zaplatit','nezaplatím','zaplatit později'],
      buy:['vezmu','beru','koupím','chci','prosím'],
      refuse:['nechci','nevezmu','nekoupím','nepotřebuji','nepotřebuju'],
      bye:['na shledanou','nashledanou','hezký den','mějte se','děkuji','děkuju','díky'],
      ...extra
    },nodes={},tools=root.ConversationTools(nodes,concepts);
    const r=(id,next,examples,patterns=[],forbidden=[],priority=0,positiveConcepts=[])=>tools.response(id,next,examples,{...(patterns.length?{patterns}:{}),forbidden,priority,positiveConcepts});
    const n=(id,cz,en,responses,open=true)=>{const value=tools.node(id,cz,en,responses,id);value.openPrompt=open;return value;};
    const finish=()=>{
      if(!nodes.leave)n('leave','Dobře. Můžete přijít jindy. Na shledanou.','All right. You can come another time. Goodbye.',[
        r('finish_leave',null,['Děkuji, na shledanou.','Na shledanou.','Hezký den.','Děkuju.','Mějte se.'],[['bye']])
      ],false);
      for(const [id,node]of Object.entries(nodes)) {
        if(node.responses.every(r=>r.next===null))continue;
        node.responses.push(r('leave_'+id,'leave',['Přijdu jindy.','Vrátím se později.','Děkuji, na shledanou.'],[['leave']],[],60));
      }
      tools.repeatSupport();
      for(const node of Object.values(nodes))for(const response of node.responses)response.reward=1;
      root.DialogueCatalog.push({schemaVersion:1,matchingRevision:2,reviewStatus:'pending',start:'start',...meta,concepts,nodes});
    };
    return {c:concepts,nodes,t:tools,r,n,finish};
  };
})(globalThis);
