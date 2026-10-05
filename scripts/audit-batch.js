const c=require('./load')();
const issues=c.DialogueValidator.validateCatalog(c.DialogueCatalog,c.DialogueConcepts).filter(x=>x.severity==='error');
const failures=[],coverage=[];
for(const d of c.DialogueCatalog.slice(5))for(const [id,node]of Object.entries(d.nodes)) {
  if(id.startsWith('repeat_'))continue;
  const examples=new Set();
  for(const r of node.responses) {
    if(r.id.startsWith('request_')||r.id.startsWith('leave_'))continue;
    for(const text of r.examples) {
      examples.add(c.DialogueMatcher.normalize(text));
      const result=c.DialogueMatcher.evaluate(node,text,{...c.DialogueConcepts,...d.concepts});
      if(result.outcome!=='accepted'||result.response.next!==r.next)failures.push({d:d.id,node:id,text,want:r.next,got:result.response.next,outcome:result.outcome});
    }
  }
  if(node.openPrompt&&examples.size<10)coverage.push([d.id,id,examples.size]);
}
console.log(JSON.stringify({issues,coverage,failures},null,2));
process.exitCode=issues.length||coverage.length||failures.length?1:0;
