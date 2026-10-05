/* DOM rendering and event wiring; answer rules and state live in the engine. */
(function(root) {
  'use strict';
  const $=id=>document.getElementById(id);
  const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const catalog=root.DialogueCatalog, concepts=root.DialogueConcepts;
  const issues=root.DialogueValidator.validateCatalog(catalog,concepts);
  if(issues.length)console.table(issues);
  if(issues.some(i=>i.severity==='error')) {
    $('status').textContent='This dialogue could not be loaded. Please try again later.';
    for(const id of ['playBtn','recordBtn','hintBtn','restartBtn','dialogueSelect','dumbBtn','easyBtn','normalBtn','questionSelect','goQuestionBtn','previousQuestionBtn','forwardQuestionBtn'])$(id).disabled=true;
    return;
  }
  const session=new root.DialogueSession(catalog[0],concepts);
  let displayedLine=session.node, savedCompletion=false;
  const speech=new root.DialogueSpeech({
    result:submit,
    error:message=>{$('status').textContent=message;syncControls();},
    start:()=>{syncControls();$('recordBtn').textContent='⏹ End answer';$('recordBtn').classList.add('recording');$('status').textContent='Listening. Speak now, then choose “End answer”.';},
    stopping:()=>{syncControls();$('status').textContent='Finishing your answer…';},
    end:()=>{$('recordBtn').textContent='🎤 Speak answer';$('recordBtn').classList.remove('recording');syncControls();},
    empty:()=>{$('status').textContent='No answer was heard. Check your microphone and try speaking again. No attempt was used.';}
  });
  function syncControls() {
    const idle=speech.state==='idle', answering=session.phase==='answer';
    $('recordBtn').disabled=!speech.supported||!answering||speech.state==='stopping';
    $('playBtn').disabled=!idle;
    $('hintBtn').disabled=!idle||!answering||session.level!=='normal'||session.hintUsed;
    $('previousQuestionBtn').disabled=session.history.length===0;
    $('forwardQuestionBtn').disabled=!session.nextQuestion;
  }
  function points() {$('pointsValue').textContent=session.points;}
  function display(line) {
    displayedLine=line;
    $('clerkSpoken').textContent='Choose “Play question” to hear the speaker.';
    $('clerkWritten').textContent=root.DialogueText.formatText(line.clerk,session.level);
    $('clerkTranslation').textContent=line.translation;
    $('clerkWritten').classList.toggle('revealed',session.level!=='normal'||session.hintUsed);
    $('clerkTranslation').classList.toggle('revealed',session.level==='dumb'||session.hintUsed);
    $('hintBtn').textContent=session.level==='normal'?(session.hintUsed?'💡 Text shown':'💡 Show text (−2 ⭐)'):'💡 Text visible';
    syncControls();
  }
  function render({keepFeedback=false,autoSpeak=true}={}) {
    speech.cancel();points();
    $('dialogueTitle').textContent=session.dialogue.title;
    $('clerkLabel').textContent=session.dialogue.clerkLabel;
    $('situationText').textContent=session.dialogue.situation;
    $('situationTranslation').textContent=session.dialogue.situationTranslation;
    $('situationTranslation').classList.toggle('revealed',session.level==='dumb');
    for(const l of ['dumb','easy','normal']) {
      $(l+'Btn').classList.toggle('active',session.level===l);
      $(l+'Btn').setAttribute('aria-pressed',String(session.level===l));
    }
    display(session.node);
    $('questionSelect').innerHTML='';
    for(const [i,id]of session.questionIds.entries()) {
      const option=document.createElement('option');option.value=id;
      option.textContent=session.level==='normal'?'Question '+(i+1):(i+1)+'. '+session.dialogue.nodes[id].clerk;
      $('questionSelect').appendChild(option);
    }
    $('questionSelect').value=session.nodeId.startsWith('repeat_')?session.nodeId.slice(7):session.nodeId;
    if(!keepFeedback) {
      $('studentBubble').classList.remove('revealed');
      $('resultBox').textContent='Your feedback will appear here after you answer.';
    }
    $('nextBtn').hidden=true;$('continueBtn').hidden=true;
    $('recordBtn').classList.remove('recording');$('recordBtn').textContent='🎤 Speak answer';
    $('status').textContent=speech.supported?'':'Speech recognition is unavailable here. Please open the trainer in a supported browser such as Chrome.';
    syncControls();
    if(session.phase!=='answer')navigation(session.node.mode==='acknowledgement');
    else if(session.node.autoSpeak&&autoSpeak)speech.speak(session.node.clerk);
  }
  function feedback(transcript,result) {
    const c=result.comparison, accepted=result.outcome==='accepted';
    const heading=accepted?'Good answer!':result.outcome==='ambiguous'?'Please make one choice clear':'Try again';
    const reason=accepted?'':result.wrongAmount?'The amount does not match this option. Listen again and check the number.':result.forbidden.length?'Your answer contains a conflicting choice or refusal.':result.outcome==='ambiguous'?'Your answer matches more than one route. Say which option you want.':'The answer did not include the required phrase or information. A valid answer may be missing from our rules.';
    $('resultBox').innerHTML='<div class="score '+(accepted?'good':'bad')+'">'+heading+'</div>'+
      (reason?'<p>'+reason+'</p>':'')+'<div class="expected">Example answer: <span lang="cs">'+escape(root.DialogueText.formatText(c.matchedAnswer))+'</span></div>'+
      '<details open><summary>Compare model wording ('+c.score+'% similarity)</summary>'+
      '<p>This compares wording only. Different wording can still be a correct answer.</p>'+
      '<div class="word-feedback" lang="cs">'+c.results.map(r=>'<span class="'+(r.correct?'word-correct':'word-wrong')+'">'+(r.correct?'✓ ':'○ ')+escape(r.word)+'</span>').join(' ')+'</div>'+
      '<p>✓ Matched wording · ○ Different or missing model wording</p></details>'+
      '<p>'+ (accepted&&result.pointsEarned===0?(result.alreadyCredited?'Answer accepted. Points for this question have already been awarded.':'Answer accepted.'):(result.pointsEarned>0?'+':'')+result.pointsEarned+' points')+'</p>';
  }
  function navigation(acknowledgement=false) {
    syncControls();
    const button=$(acknowledgement&&session.phase!=='complete'?'continueBtn':'nextBtn');
    button.hidden=false;
    button.textContent=session.phase==='complete'?'🔄 Restart dialogue':'➡️ Continue';
    button.onclick=()=>{if(session.phase==='complete'){session.restart();savedCompletion=false;}else session.advance();render();$('playBtn').focus();};
  }
  function completion(result) {
    if(!result.complete)return;
    if(!savedCompletion&&!session.freePractice)root.DialogueProgress.save(session);savedCompletion=true;
    $('resultBox').innerHTML+='<p class="score good">'+(session.freePractice?'Question practice finished':'Dialogue finished')+': '+session.points+' points.</p>'+
      '<p>'+session.acceptedCount+' questions accepted; '+session.skippedCount+' skipped after three attempts.</p>';
  }
  function submit(transcript) {
    const acknowledgement=session.node.mode==='acknowledgement';
    const result=session.answer(transcript);
    if(result.outcome==='ignored')return;
    $('studentLine').textContent=transcript;$('studentBubble').classList.add('revealed');
    points();feedback(transcript,result);completion(result);
    if(result.outcome==='accepted'||result.exhausted) {
      if(result.exhausted)$('resultBox').innerHTML+='<p>Three attempts used. Continue to the next part, then try this dialogue again.</p>';
      $('status').textContent=result.complete?'Dialogue finished.':result.exhausted?'Three attempts used. Choose Continue.':'Choose Continue.';
      navigation(acknowledgement);
    } else {
      display(session.node.retry);speech.speak(session.node.retry.clerk);
      $('status').textContent=acknowledgement?'Try a short acknowledgement.':('Attempt '+session.attempts+' of 3. Listen again and retry.');
    }
  }
  catalog.forEach((d,i)=>{const option=document.createElement('option');option.value=i;option.textContent=d.title;$('dialogueSelect').appendChild(option);});
  $('dialogueSelect').addEventListener('change',e=>{speech.cancel();session.select(catalog[Number(e.target.value)]);savedCompletion=false;render();});
  for(const l of ['dumb','easy','normal'])$(l+'Btn').addEventListener('click',()=>{speech.cancel();session.setLevel(l);render({keepFeedback:true,autoSpeak:false});});
  $('playBtn').addEventListener('click',()=>{
    $('clerkSpoken').textContent='Playing question…';
    speech.speak(displayedLine.clerk,()=>{$('clerkSpoken').textContent='Question played. You can play it again.';});
  });
  $('hintBtn').addEventListener('click',()=>{if(session.hint()){points();display(displayedLine);$('status').textContent='Text hint shown. 2 points used.';}});
  $('recordBtn').addEventListener('click',()=>speech.start());
  $('restartBtn').addEventListener('click',()=>{speech.cancel();session.restart();savedCompletion=false;render();});
  function moveQuestion(action) {speech.cancel();if(action()){render({autoSpeak:false});$('playBtn').focus();}}
  $('goQuestionBtn').addEventListener('click',()=>moveQuestion(()=>session.jump($('questionSelect').value)));
  $('previousQuestionBtn').addEventListener('click',()=>moveQuestion(()=>session.back()));
  $('forwardQuestionBtn').addEventListener('click',()=>moveQuestion(()=>session.nextQuestion&&session.jump(session.nextQuestion)));
  render();
})(globalThis);
