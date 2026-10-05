const c=require('./load')();
const issues=c.DialogueValidator.validateCatalog(c.DialogueCatalog,c.DialogueConcepts);
for(const issue of issues)console.log(issue.severity+': '+issue.dialogue+' / '+issue.path+' — '+issue.message);
const errors=issues.filter(i=>i.severity==='error');
console.log(c.DialogueCatalog.length+' dialogues validated; '+errors.length+' errors.');
process.exitCode=errors.length?1:0;
