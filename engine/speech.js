(function(root) {
  'use strict';
  class Speech {
    constructor(callbacks) {
      this.callbacks=callbacks;this.recognition=null;this.generation=0;
      this.SR=root.SpeechRecognition||root.webkitSpeechRecognition;
      this.state='idle';this.parts=[];this.restartTimer=null;
    }
    get supported() {return !!this.SR;}
    cancel() {
      const active=this.state!=='idle', r=this.recognition;
      this.generation++;this.state='idle';this.recognition=null;this.parts=[];
      clearTimeout(this.restartTimer);this.restartTimer=null;
      if(r)r.abort();
      root.speechSynthesis?.cancel();
      if(active)this.callbacks.end();
    }
    speak(text,onEnd=()=>{}) {
      if(!root.speechSynthesis||!root.SpeechSynthesisUtterance){this.callbacks.error('Speech synthesis is not supported in this browser.');return;}
      root.speechSynthesis.cancel();
      const u=new root.SpeechSynthesisUtterance(root.DialogueText.formatText(text));
      u.lang='cs-CZ';u.rate=0.9;
      const voice=root.speechSynthesis.getVoices().find(v=>v.lang?.toLowerCase().startsWith('cs'));
      if(voice)u.voice=voice;
      const generation=this.generation;
      u.onend=()=>{if(generation===this.generation)onEnd();};
      u.onerror=e=>{if(generation===this.generation&&e.error!=='interrupted'&&e.error!=='canceled')this.callbacks.error('Speech playback: '+e.error);};
      root.speechSynthesis.speak(u);
    }
    start() {
      if(!this.SR)return;
      if(this.state==='listening'){this.endAnswer();return;}
      if(this.state==='stopping')return;
      root.speechSynthesis?.cancel();
      this.parts=[];this.state='listening';this.generation++;
      this.callbacks.start();
      this.listen(this.generation);
    }
    listen(generation) {
      if(generation!==this.generation||this.state!=='listening')return;
      const r=new this.SR(), slots=[];
      this.recognition=r;r.lang='cs-CZ';r.continuous=true;r.interimResults=true;
      const current=()=>generation===this.generation&&this.recognition===r;
      r.onresult=event=>{
        if(!current())return;
        // Results are cumulative within a recognition run. Replace slots instead
        // of appending repeated interim/final versions of the same phrase.
        slots.length=event.results.length;
        for(let i=event.resultIndex??0;i<event.results.length;i++) {
          slots[i]=event.results[i]?.[0]?.transcript||'';
        }
      };
      r.onerror=event=>{
        if(!current()||event.error==='no-speech')return;
        this.cancel();this.callbacks.error('Error: '+event.error+'. Try again.');
      };
      r.onend=()=>{
        if(!current())return;
        this.recognition=null;
        this.parts.push(...slots.filter(text=>text.trim()));
        if(this.state==='stopping')this.finish(generation);
        else if(this.state==='listening') {
          // Browser silence ends only this recognition run, not the answer.
          this.restartTimer=setTimeout(()=>{this.restartTimer=null;this.listen(generation);},150);
        }
      };
      try {r.start();} catch(error) {if(current()){this.cancel();this.callbacks.error(error.message);}}
    }
    endAnswer() {
      if(this.state!=='listening')return;
      this.state='stopping';
      clearTimeout(this.restartTimer);this.restartTimer=null;
      this.callbacks.stopping?.();
      // stop() lets the browser deliver its final result before onend. If End
      // was clicked between silence restarts, all speech is already collected.
      if(this.recognition) {
        try {this.recognition.stop();} catch(error) {this.cancel();this.callbacks.error(error.message);}
      } else this.finish(this.generation);
    }
    finish(generation) {
      if(generation!==this.generation||this.state!=='stopping')return;
      const transcript=this.parts.join(' ').replace(/\s+/g,' ').trim();
      this.generation++;this.state='idle';this.recognition=null;this.parts=[];
      this.callbacks.end();
      if(transcript)this.callbacks.result(transcript);
      else this.callbacks.empty?.();
    }
  }
  root.DialogueSpeech=Speech;
})(globalThis);
