(function(root) {
  'use strict';
  class Session {
    constructor(dialogue,concepts) {this.level='easy';this.sharedConcepts=concepts;this.select(dialogue);}
    select(dialogue) {this.dialogue=dialogue;this.concepts={...this.sharedConcepts,...dialogue.concepts};this.restart();}
    get node() {return this.dialogue.nodes[this.nodeId];}
    load(id) {if(!Object.hasOwn(this.dialogue.nodes,id))throw new Error('Unknown node '+id);if(this.nodeId)this.history.push(this.nodeId);this.nodeId=id;this.attempts=0;this.hintUsed=this.hinted.has(id);this.phase='answer';this.pending=null;}
    get questionIds() {
      const ids=[],seen=new Set();let id=this.dialogue.start;
      while(id&&!seen.has(id)){ids.push(id);seen.add(id);id=this.dialogue.nodes[id].responses[0]?.next;}
      return [...ids,...Object.keys(this.dialogue.nodes).filter(id=>!seen.has(id)&&!id.startsWith('repeat_'))];
    }
    get nextQuestion() {return this.phase==='advance'?this.pending:this.phase==='complete'?null:this.node.responses.find(r=>r.next&&r.next!==this.nodeId&&!r.next.startsWith('repeat_'))?.next||null;}
    jump(id) {if(!Object.hasOwn(this.dialogue.nodes,id))return false;this.freePractice=true;this.load(id);return true;}
    back() {const id=this.history.pop();if(!id)return false;this.nodeId=null;return this.jump(id);}
    hint() {if(this.phase!=='answer'||this.level!=='normal'||this.hintUsed)return false;this.started=true;this.points=Math.max(0,this.points-2);this.hintUsed=true;this.hinted.add(this.nodeId);return true;}
    setLevel(level) {if(!['dumb','easy','normal'].includes(level))throw new Error('Unknown level');if(level!==this.level&&this.started)this.mixed=true;this.level=level;}
    restart() {this.history=[];this.nodeId=null;this.freePractice=false;this.points=10;this.awarded=new Set();this.penalized=new Set();this.hinted=new Set();this.started=false;this.mixed=false;this.acceptedCount=0;this.skippedCount=0;this.load(this.dialogue.start);}
    answer(transcript) {
      if(this.phase!=='answer'||!transcript.trim())return {outcome:'ignored'};
      this.started=true;
      const result=root.DialogueMatcher.evaluate(this.node,transcript,this.concepts);
      if(result.outcome==='accepted') {
        const creditKey=this.node.creditKey||this.nodeId;
        const alreadyCredited=this.awarded.has(creditKey);
        const pointsEarned=this.node.mode==='acknowledgement'||alreadyCredited?0:result.response.reward;
        this.points+=pointsEarned;
        if(this.node.mode!=='acknowledgement'&&!this.awarded.has(creditKey))this.acceptedCount++;
        this.awarded.add(creditKey);this.pending=result.response.next;
        this.phase=this.pending===null?'complete':'advance';
        return {...result,pointsEarned,alreadyCredited,complete:this.phase==='complete'};
      }
      this.attempts++;
      const exhausted=this.node.mode!=='acknowledgement'&&this.attempts>=3;
      let pointsEarned=0;
      if(exhausted) {
        if(!this.penalized.has(this.nodeId)){pointsEarned=this.points>0?-1:0;this.points=Math.max(0,this.points-1);this.skippedCount++;this.penalized.add(this.nodeId);}
        this.pending=this.node.retry.next;this.phase=this.pending===null?'complete':'advance';
      }
      return {...result,pointsEarned,exhausted,complete:this.phase==='complete'};
    }
    advance() {if(this.phase==='advance')this.load(this.pending);}
  }
  root.DialogueSession=Session;
})(globalThis);
