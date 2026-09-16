/* DOM rendering and event wiring only; content, decisions, and state live elsewhere. */
(function(root) {
  'use strict';
  const $=id=>document.getElementById(id);
  const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const catalog=root.DialogueCatalog, concepts=root.DialogueConcepts;
  const issues=root.DialogueValidator.validateCatalog(catalog,concepts);
  if(issues.length)console.table(issues);
  if(issues.some(i=>i.severity==='error')) {
    $('status').textContent='Dialogue content has validation errors. Check the browser console or run npm run validate.';
    for(const id of ['playBtn','recordBtn','hintBtn'])$(id).disabled=true;
    return;
  }
  const session=new root.DialogueSession(catalog[0],concepts);
  let displayedLine=session.node;
  let playDisabledBeforeRecording=false;
  const speech=new root.DialogueSpeech({
    result:submit,
    error:message=>{$('status').textContent='⚠️ '+message;},
    start:()=>{playDisabledBeforeRecording=$('playBtn').disabled;$('playBtn').disabled=true;$('recordBtn').textContent='⏹ End answer';$('recordBtn').classList.add('recording');$('status').textContent='Listening... speak now.';},
    stopping:()=>{$('recordBtn').disabled=true;},
    end:()=>{$('recordBtn').disabled=false;$('recordBtn').textContent='🎤 Speak answer';$('recordBtn').classList.remove('recording');$('playBtn').disabled=playDisabledBeforeRecording;},
    empty:()=>{$('status').textContent='Nic jsem neslyšel. Zkuste to znovu.';}
  });
  function points() {$('pointsValue').textContent=session.points;}
  function display(line) {
    displayedLine=line;
    $('clerkSpoken').textContent='🔊 Click "Play question" to hear the clerk.';
    $('clerkWritten').textContent=root.DialogueText.formatText(line.clerk,session.level);
    // Always refresh the translation, including in Normal mode before revealing a hint.
    $('clerkTranslation').textContent=line.translation;
    $('clerkWritten').classList.toggle('revealed',session.level!=='normal'||session.hintUsed);
    $('clerkTranslation').classList.toggle('revealed',session.level==='dumb'||session.hintUsed);
    $('hintBtn').disabled=session.level!=='normal'||session.hintUsed;
    $('hintBtn').textContent=session.level==='normal'?(session.hintUsed?'💡 Text shown':'💡 Show text (−2 ⭐)'):'💡 Visible ('+(session.level==='dumb'?'Dumb':'Easy')+')';
  }
  function render({keepFeedback=false}={}) {
    speech.cancel();points();
    $('dialogueTitle').textContent=session.dialogue.title;
    $('clerkLabel').textContent=session.dialogue.clerkLabel;
    $('situationBox').style.display='block';
    $('situationText').textContent=session.dialogue.situation;
    $('situationTranslation').textContent=session.dialogue.situationTranslation;
    $('situationTranslation').classList.toggle('revealed',session.level==='dumb');
    for(const l of ['dumb','easy','normal'])$(l+'Btn').classList.toggle('active',session.level===l);
    display(session.node);
    if(!keepFeedback){$('studentBubble').classList.remove('revealed');$('resultBox').textContent='Your feedback will appear here after you speak.';}
    $('nextBtn').style.display='none';$('continueBtn').style.display='none';
    $('recordBtn').disabled=!speech.supported;$('playBtn').disabled=false;
    $('recordBtn').classList.remove('recording');
    $('recordBtn').textContent='🎤 Speak answer';
    $('status').textContent=speech.supported?(session.node.mode==='acknowledgement'?'Clerk replied. Please respond.':''):'⚠️ Speech recognition not supported. Please use Chrome.';
    if(session.node.autoSpeak)speech.speak(session.node.clerk);
  }
  function feedback(transcript,result) {
    const c=result.comparison;
    const accepted=result.outcome==='accepted';
    const label=accepted?(result.response.kind==='alternative'?'dobrá odpověď!':'správně!'):'zkuste to znovu.';
    $('resultBox').innerHTML=`<div class="transcript">You said: "${escape(transcript)}"</div>
      <div class="score ${accepted?'good':c.score>=40?'mid':'bad'}">${c.score}% — ${c.correctCount} / ${c.total} words correct</div>
      <div class="word-feedback">${c.results.map(r=>`<span class="${r.correct?'word-correct':'word-wrong'}">${escape(r.word)}</span>`).join(' ')}</div>
      <div class="expected">Expected: "${escape(root.DialogueText.formatText(c.matchedAnswer,session.level))}"</div>
      <div style="color:${accepted?'#27ae60':'#e74c3c'};font-weight:bold;margin-top:6px;">${result.pointsEarned>0?'+':''}${result.pointsEarned} ⭐ — ${label}</div>`;
    if(accepted)$('resultBox').innerHTML+='<div class="expected">Meaning accepted. The word score compares your wording with a model answer.</div>';
    if(result.outcome==='ambiguous')$('resultBox').innerHTML+='<div class="expected">More than one intention matched. Please make your choice clear.</div>';
  }
  function navigation(acknowledgement=false) {
    $('recordBtn').disabled=true;$('playBtn').disabled=true;
    const button=$(acknowledgement&&session.phase!=='complete'?'continueBtn':'nextBtn');
    button.style.display='';button.disabled=false;
    button.textContent=session.phase==='complete'?'🔄 Restartovat dialog':acknowledgement?'➡️ Zpět k otázce':'➡️ Další otázka';
    button.onclick=()=>{if(session.phase==='complete')session.restart();else session.advance();render();};
  }
  function submit(transcript) {
    const acknowledgement=session.node.mode==='acknowledgement';
    const result=session.answer(transcript);
    if(result.outcome==='ignored')return;
    $('studentLine').textContent=transcript;$('studentBubble').classList.add('revealed');
    points();feedback(transcript,result);
    if(result.outcome==='accepted') {
      if(acknowledgement)$('resultBox').innerHTML+= '<div class="score mid">Odpověď přijata. Vracíme se k otázce.</div>';
      if(result.complete)$('resultBox').innerHTML+=`<div class="score good">🎉 Dialogue complete! Final points: ${session.points} ⭐</div>`;
      if(result.response.kind==='alternative'&&!result.complete) {session.advance();render({keepFeedback:true});}
      else navigation(acknowledgement);
    } else if(result.exhausted) {
      $('resultBox').innerHTML+='<div style="color:#e74c3c;font-weight:bold;margin-top:6px;">Tři pokusy. Jdeme dál.</div>';
      if(result.complete)$('resultBox').innerHTML+=`<div class="score good">🎉 Konec dialogu. Body: ${session.points} ⭐</div>`;
      navigation();
    } else {
      display(session.node.retry);speech.speak(session.node.retry.clerk);
      $('recordBtn').textContent='🎤 Speak answer';
      $('playBtn').disabled=true;
      $('status').textContent=`Pokus ${session.attempts} ze 3. Zkuste to znovu.`;
    }
  }
  catalog.forEach((d,i)=>{const option=document.createElement('option');option.value=i;option.textContent=d.title;$('dialogueSelect').appendChild(option);});
  $('dialogueSelect').addEventListener('change',e=>{session.select(catalog[Number(e.target.value)]);render();});
  for(const l of ['dumb','easy','normal'])$(l+'Btn').addEventListener('click',()=>{session.setLevel(l);render();});
  $('playBtn').addEventListener('click',()=>{speech.speak(displayedLine.clerk,()=>{$('clerkSpoken').textContent='🔊 Question played. Click "Play question" to hear again.';});$('clerkSpoken').textContent='🔊 (playing...)';});
  $('hintBtn').addEventListener('click',()=>{if(session.hint()){points();display(displayedLine);$('status').textContent='−2 ⭐ for the text hint.';}});
  $('recordBtn').addEventListener('click',()=>speech.start());
  render();
})(globalThis);
