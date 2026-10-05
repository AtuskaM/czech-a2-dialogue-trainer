const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const load=require('../scripts/load');

function setup() {
  const elements=new Map();let callbacks;
  const element=id=>{
    if(!elements.has(id))elements.set(id,{
      textContent:'',innerHTML:'',hidden:false,disabled:false,value:'0',
      classList:{toggle(){},add(){},remove(){}},setAttribute(){},
      appendChild(){},focus(){},addEventListener(event,handler){this[event]=handler;}
    });
    return elements.get(id);
  };
  const context=load({document:{getElementById:element,createElement:()=>({})},console:{table(){}}});
  context.DialogueSpeech=class {
    constructor(handlers){callbacks=handlers;this.state='idle';this.supported=true;}
    cancel(){} speak(){} start(){}
  };
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../app.js'),'utf8'),context);
  return {context,element,answer:text=>callbacks.result(text),select:index=>element('dialogueSelect').change({target:{value:String(index)}})};
}

test('question navigation jumps, repeats, follows answers and returns without extra credit',()=>{
  const {element,answer,select}=setup();select(9);
  element('questionSelect').value='availability';element('goQuestionBtn').click();
  assert.match(element('clerkWritten').textContent,/kdy můžete přijít/);
  answer('Nechám původní termín.');
  assert.equal(element('pointsValue').textContent,11);
  element('forwardQuestionBtn').click();
  assert.match(element('clerkWritten').textContent,/původní kontrola/);
  element('previousQuestionBtn').click();
  assert.match(element('clerkWritten').textContent,/kdy můžete přijít/);
  answer('Nechám původní termín.');
  assert.equal(element('pointsValue').textContent,11);
  element('goQuestionBtn').click();
  assert.equal(element('recordBtn').disabled,false);
  assert.equal(element('nextBtn').hidden,true);
});

test('jumping to the ending does not save an incomplete dialogue as a full run',()=>{
  const {context,element,answer,select}=setup();select(9);let saved=0;
  context.DialogueProgress.save=()=>saved++;
  element('questionSelect').value='changed';element('goQuestionBtn').click();
  answer('Na shledanou.');
  assert.equal(saved,0);assert.match(element('resultBox').innerHTML,/Question practice finished/);
  element('restartBtn').click();
  assert.equal(element('previousQuestionBtn').disabled,true);
  assert.equal(element('pointsValue').textContent,10);
});

test('spoken answers display feedback and update points in every dialogue',()=>{
  const {context,element,answer,select}=setup();
  for(let index=0;index<context.DialogueCatalog.length;index++) {
    select(index);
    const d=context.DialogueCatalog[index],example=d.nodes[d.start].responses[0].examples[0];
    answer(example);
    assert.match(element('resultBox').innerHTML,/Good answer!/,d.id);
    assert.match(element('resultBox').innerHTML,/Example answer:/,d.id);
    assert.equal(element('pointsValue').textContent,11,d.id);
    assert.equal(element('studentLine').textContent,example,d.id);
    assert.equal(element('nextBtn').hidden,false,d.id);
  }
});

test('unsuccessful speech displays retry feedback without awarding points',()=>{
  const {element,answer,select}=setup();select(3);answer('Náhodná odpověď.');
  assert.match(element('resultBox').innerHTML,/Try again/);
  assert.equal(element('pointsValue').textContent,10);
  assert.match(element('status').textContent,/Attempt 1 of 3/);
});

test('valid repair responses retain word comparison without changing acceptance or credit',()=>{
  for(const text of [
    'Nemuzete je opravit?','Ale ja si nechci koupit nove bryle.',
    'A urcite je nemuzete opravit?','Dobre koupim si nove.','Tak si je koupim.',
    'Nechtel jsem kupovat nove, ale co se da delat.',
    'Nechtela jsem kupovat nove, ale co se da delat.',
    'A kolik stoji takove normalni?','A jake mate?',
    'Tak dobre koupim si nove a kolik stoji?'
  ]) {
    const {element,answer,select}=setup();select(3);
    answer('Potřebuji spravit brýle.');element('nextBtn').onclick();answer(text);
    assert.match(element('resultBox').innerHTML,/Good answer!/,text);
    assert.match(element('resultBox').innerHTML,/\+1 points/,text);
    assert.match(element('resultBox').innerHTML,/Compare model wording/);
    assert.match(element('resultBox').innerHTML,/word-feedback/);
    assert.doesNotMatch(element('resultBox').innerHTML,/Try again|class="score bad"/,text);
    assert.equal(element('pointsValue').textContent,12,text);
    assert.equal(element('nextBtn').hidden,false,text);
  }
});

test('licence choice with a price question receives positive feedback then a targeted price reply',()=>{
  const {element,answer,select}=setup();select(4);
  for(const text of ['Ztratila jsem řidičák.','Pas mám tady.','Hotovo.','Ano.']) {
    answer(text);element('nextBtn').onclick();
  }
  answer('Chci to co nejdřív, kolik to stojí?');
  assert.match(element('resultBox').innerHTML,/Good answer!/);
  assert.equal(element('pointsValue').textContent,15);
  assert.match(element('resultBox').innerHTML,/Compare model wording/);
  element('nextBtn').onclick();
  assert.match(element('clerkWritten').textContent,/Expresní/);
  assert.match(element('clerkWritten').textContent,/Chcete tuto možnost/);
});

test('spoken completion displays final score and saves a summary',()=>{
  const {context,element,answer}=setup();let saved=0;
  context.DialogueProgress.save=()=>{saved++;return true;};
  for(const text of ['Potřebuji slevovou kartu.','Hotovo.','Ano, tady je.','Na jeden rok.','Tady prosím.','Děkuji. Na shledanou.']) {
    answer(text);
    if(text!=='Děkuji. Na shledanou.')element('nextBtn').onclick();
  }
  assert.match(element('resultBox').innerHTML,/Dialogue finished: 16 points/);
  assert.equal(element('pointsValue').textContent,16);
  assert.equal(saved,1);
});
