// Shared authoring helpers for contextual answers and clarification loops.
(function(root) {
  'use strict';
  root.ConversationTools=function(nodes,concepts) {
    const response=(id,next,examples,match={},reward=1)=>{
      concepts[id]=[...new Set([...(concepts[id]||[]),...examples])];
      return {id,intent:id,next,examples,kind:'choice',reward,match:{required:[id],...match}};
    };
    const node=(id,clerk,translation,responses,next)=>{
      nodes[id]={clerk,translation,responses,retry:{clerk,translation,next:next||id}};
      return nodes[id];
    };
    function configure(id,variants=[],patterns=[],forbidden=[],positiveConcepts=[]) {
      concepts[id]=[...new Set([...(concepts[id]||[]),...variants])];
      for(const n of Object.values(nodes))for(const r of n.responses)if(r.id===id) {
        r.match={required:[id],forbidden,positiveConcepts};
        if(patterns.length)r.match.patterns=patterns;
      }
    }
    function clarify(source,id,clerk,translation) {
      const original=nodes[source];
      // Choice/answer routes stay available, alongside an acknowledgement back to the question.
      const answers=original.responses.filter(r=>r.next!==id);
      const explicit=answers.flatMap(r=>(r.match.patterns||[]).flat()).filter(name=>!['consent','photoGood','yesPrescription','identityYes'].includes(name));
      const acknowledgement=response('understood_'+id,source,['Aha, rozumím.','Dobře, už je mi to jasné.','Děkuji za vysvětlení.','Jasně.'],{patterns:[['understood']],forbidden:[...new Set(['notUnderstood',...explicit])]},0);
      node(id,clerk,translation,[...answers,acknowledgement],source);
      nodes[id].creditKey=original.creditKey||source;
    }
    function repeatSupport() {
      // Source nodes often share answer arrays; each question needs its own repeat route.
      for(const n of Object.values(nodes))n.responses=[...new Map(n.responses.map(r=>[r.id,r])).values()];
      for(const [id,n] of Object.entries(nodes)) {
        if(n.responses.every(r=>r.next===null)||id.startsWith('repeat_'))continue;
        const repeatId='repeat_'+id;
        const repeat=response('request_'+repeatId,repeatId,['Můžete to říct ještě jednou?','Prosím, mluvte pomaleji.','Nerozuměl jsem otázce.','Nerozuměla jsem.'],{patterns:[['repeatRequest']]},1);
        n.responses.push(repeat);
        node(repeatId,n.retry.clerk,n.retry.translation,[...n.responses],id);
        nodes[repeatId].creditKey=n.creditKey||id;
        // Unknown answers never silently choose an option on the student's behalf.
        n.retry.next=repeatId;
      }
    }
    function rejoin(id,source) {
      const answers=[...nodes[id].responses,...nodes[source].responses.filter(r=>r.next!==id)];
      nodes[id].responses=[...new Map(answers.map(r=>[r.id,r])).values()];
    }
    return {response,node,configure,clarify,rejoin,repeatSupport};
  };
})(globalThis);
