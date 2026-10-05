const test=require('node:test');
const assert=require('node:assert/strict');
const load=require('../scripts/load');
function setup() {
  const instances=[],events=[],timers=[];
  class Recognition {
    constructor(){instances.push(this);}
    start(){} stop(){this.stopped=true;} abort(){this.aborted=true;}
  }
  const c=load({SpeechRecognition:Recognition,setTimeout:fn=>{timers.push(fn);return timers.length;},clearTimeout:()=>{},speechSynthesis:{cancel(){}}});
  const speech=new c.DialogueSpeech({start:()=>events.push('start'),stopping:()=>events.push('stopping'),end:()=>events.push('end'),result:text=>events.push(text),empty:()=>events.push('empty'),error:text=>events.push(text)});
  return {speech,instances,events,timers};
}
test('recognition replaces cumulative interim words and submits once after End answer',()=>{
  const {speech,instances,events}=setup();speech.start();const r=instances[0];
  r.onresult({resultIndex:0,results:[[{transcript:'Potřebuji'}]]});
  r.onresult({resultIndex:0,results:[[{transcript:'Potřebuji slevovou kartu.'}]]});
  speech.start();assert.equal(speech.state,'stopping');assert.equal(r.stopped,true);
  r.onend();assert.equal(speech.state,'idle');assert.equal(events.filter(e=>e==='Potřebuji slevovou kartu.').length,1);
  r.onend();assert.equal(events.filter(e=>e==='Potřebuji slevovou kartu.').length,1);
});
test('cancelled recordings never submit into a newly selected dialogue',()=>{
  const {speech,instances,events}=setup();speech.start();const r=instances[0];speech.cancel();
  r.onresult({resultIndex:0,results:[[{transcript:'old answer'}]]});r.onend();
  assert.ok(!events.includes('old answer'));assert.equal(r.aborted,true);assert.equal(speech.state,'idle');
});
test('permission denial ends recording and explains microphone recovery',()=>{
  const {speech,instances,events}=setup();speech.start();instances[0].onerror({error:'not-allowed'});
  assert.equal(speech.state,'idle');assert.match(events.at(-1),/denied.*site settings/);
});
test('stop timeout restores idle state without grading a partial answer',()=>{
  const {speech,timers,events}=setup();speech.start();speech.endAnswer();timers.at(-1)();
  assert.equal(speech.state,'idle');assert.match(events.at(-1),/too long.*No attempt/);
});
test('silence restarts listening but only End answer submits',()=>{
  const {speech,instances,timers,events}=setup();speech.start();
  instances[0].onresult({resultIndex:0,results:[[{transcript:'Ano.'}]]});instances[0].onend();
  assert.equal(speech.state,'listening');assert.ok(!events.includes('Ano.'));
  timers.at(-1)();assert.equal(instances.length,2);
  speech.endAnswer();instances[1].onend();assert.equal(events.at(-1),'Ano.');
});
