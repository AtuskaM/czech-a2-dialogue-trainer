(function(root) {
  'use strict';
  const object = v => v !== null && typeof v === 'object' && !Array.isArray(v);
  const text = v => typeof v === 'string' && v.trim().length > 0;
  function validateDialogue(d, shared = {}) {
    const issues = [];
    const add = (code,path,message,severity='error') => issues.push({severity,code,path,message});
    if (!object(d)) return [{severity:'error',code:'invalid-dialogue',path:'',message:'Expected a dialogue object.'}];
    if(d.schemaVersion !== 1) add('schema-version','schemaVersion','Expected schemaVersion 1.');
    for(const field of ['id','title','clerkLabel','situation','situationTranslation']) if(!text(d[field])) add(field.includes('Translation')?'missing-translation':'missing-metadata',field,'Required nonempty text.');
    if(!object(d.nodes) || !Object.keys(d.nodes).length) { add('missing-node-id','nodes','Provide nodes keyed by nonempty IDs.'); return issues; }
    const ids=Object.keys(d.nodes), edges=new Map(ids.map(id=>[id,[]])), concepts={...shared,...d.concepts};
    for(const [name,variants] of Object.entries(concepts)) if(!Array.isArray(variants)||!variants.length||variants.some(v=>!text(v))) add('invalid-concept','concepts.'+name,'A concept needs nonempty phrase variants.');
    const reference = (target,path,source) => {
      if (target === null) {if(source) edges.get(source).push(null); return;}
      if(!text(target)) {add('missing-node-id',path,'Use a node ID or explicit null for an ending.');return;}
      if(!Object.hasOwn(d.nodes,target)) {add('broken-next',path,'Unknown node: '+target);return;}
      if(source && !edges.get(source).includes(target)) edges.get(source).push(target);
    };
    if(!text(d.start)) add('missing-node-id','start','Start must identify a node.'); else reference(d.start,'start');
    const line = (n,path) => {
      if(!text(n.clerk)) add('missing-clerk-text',path+'.clerk','Missing Czech clerk text.');
      if(!text(n.translation)) add('missing-translation',path+'.translation','Missing English translation.');
    };
    for(const [id,n] of Object.entries(d.nodes)) {
      const path='nodes.'+id;
      if(!text(id)) add('missing-node-id',path,'Node ID is empty.');
      if(!object(n)) {add('invalid-node',path,'Expected a node object.');continue;}
      line(n,path);
      if(n.mode!==undefined && n.mode!=='acknowledgement') add('invalid-mode',path+'.mode','Unknown node mode.');
      if(!Array.isArray(n.responses)||!n.responses.length) add('missing-responses',path+'.responses','Node needs acceptable student responses.');
      const responseIds=new Set();
      for(const [i,r] of (Array.isArray(n.responses)?n.responses:[]).entries()) {
        const rp=path+'.responses.'+i;
        if(!object(r)) {add('invalid-response',rp,'Expected a response object.');continue;}
        if(!text(r.id)||responseIds.has(r.id)) add('response-id',rp+'.id','Response IDs must be nonempty and unique within a node.');
        responseIds.add(r.id);
        if(!text(r.intent)) add('missing-intent',rp+'.intent','Name the student intention.');
        if(!['correct','alternative','choice'].includes(r.kind)) add('invalid-kind',rp+'.kind','Use correct, alternative, or choice.');
        if(!Number.isFinite(r.reward)) add('invalid-reward',rp+'.reward','Provide a finite points reward.');
        if(!Array.isArray(r.examples)||!r.examples.length||r.examples.some(v=>!text(v))) add('missing-responses',rp+'.examples','Provide at least one model answer for feedback.');
        reference(r.next,rp+'.next',id);
        if(!object(r.match)) {add('invalid-match',rp+'.match','Provide intent matching rules.');continue;}
        for(const field of Object.keys(r.match)) if(!['required','anyOf','optional','forbidden','acceptAny'].includes(field)) add('invalid-match',rp+'.match.'+field,'Unknown matching field.');
        if(r.match.acceptAny!==undefined && r.match.acceptAny!==true) add('invalid-match',rp+'.match.acceptAny','Omit acceptAny or set it to true.');
        if(r.match.acceptAny && n.mode!=='acknowledgement') add('unsafe-accept-any',rp+'.match','acceptAny is only for acknowledgement nodes.');
        if(!r.match.acceptAny && !['required','anyOf'].some(f=>Array.isArray(r.match[f])&&r.match[f].length)) add('missing-responses',rp+'.match','Require at least one positive concept.');
        for(const field of ['required','anyOf','optional','forbidden']) {
          if(r.match[field]===undefined) continue;
          if(!Array.isArray(r.match[field])) {add('invalid-match',rp+'.match.'+field,'Expected concept ID array.');continue;}
          for(const name of r.match[field]) if(!text(name)||!Object.hasOwn(concepts,name)) add('unknown-concept',rp+'.match.'+field,'Unknown concept: '+name);
        }
      }
      if(!object(n.retry)) add('missing-retry',path+'.retry','Provide translated retry text and an explicit next after three attempts.');
      else {line(n.retry,path+'.retry');reference(n.retry.next,path+'.retry.next',id);}
    }
    const reachable=new Set(), pending=text(d.start)&&edges.has(d.start)?[d.start]:[];
    while(pending.length) {const id=pending.pop();if(reachable.has(id))continue;reachable.add(id);for(const next of edges.get(id))if(next!==null)pending.push(next);}
    for(const id of ids) if(!reachable.has(id)) add('unreachable-node','nodes.'+id,'Node cannot be reached from start.');
    // Reverse reachability identifies every node that has no path to any ending.
    const canEnd=new Set(ids.filter(id=>edges.get(id).includes(null)));
    let changed=true;
    while(changed) {changed=false;for(const id of ids)if(!canEnd.has(id)&&edges.get(id).some(n=>canEnd.has(n))) {canEnd.add(id);changed=true;}}
    for(const id of ids) if(!canEnd.has(id)) add('nonterminating-branch','nodes.'+id,'No path from this node reaches an ending.');
    // Cycles with exits are valid return paths, but authors should review them.
    const visiting=new Set(),done=new Set();
    function visit(id) {
      if(visiting.has(id)) {if(canEnd.has(id))add('cycle-with-exit','nodes.'+id,'Repeatable path has an exit; check that returning here is intentional.','warning');return;}
      if(done.has(id))return;visiting.add(id);
      for(const next of edges.get(id))if(next!==null)visit(next);
      visiting.delete(id);done.add(id);
    }
    for(const id of ids)visit(id);
    return issues;
  }
  function validateCatalog(catalog,concepts) {
    if(!Array.isArray(catalog)||!catalog.length) return [{severity:'error',code:'empty-catalog',path:'catalog',message:'Load at least one dialogue.'}];
    const ids=new Set();
    return catalog.flatMap((d,i)=>{
      const issues=validateDialogue(d,concepts);
      if(d && ids.has(d.id))issues.push({severity:'error',code:'duplicate-dialogue-id',path:'id',message:'Duplicate dialogue ID.'});
      if(d)ids.add(d.id);
      return issues.map(issue=>({...issue,dialogue:d?.id||String(i)}));
    });
  }
  root.DialogueValidator={validateDialogue,validateCatalog};
})(globalThis);
