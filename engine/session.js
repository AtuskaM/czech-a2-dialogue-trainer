(function(root) {
  'use strict';
  class Session {
    constructor(dialogue,concepts) {this.points=10;this.level='easy';this.sharedConcepts=concepts;this.select(dialogue);}
    select(dialogue) {this.dialogue=dialogue;this.concepts={...this.sharedConcepts,...dialogue.concepts};this.load(dialogue.start);}
    get node() {return this.dialogue.nodes[this.nodeId];}
    load(id) {if(!Object.hasOwn(this.dialogue.nodes,id))throw new Error('Unknown node '+id);this.nodeId=id;this.attempts=0;this.hintUsed=false;this.phase='answer';this.pending=null;}
    hint() {if(this.level!=='normal'||this.hintUsed)return false;this.points-=2;this.hintUsed=true;return true;}
    setLevel(level) {if(!['dumb','easy','normal'].includes(level))throw new Error('Unknown level');this.level=level;this.load(this.nodeId);}
    restart() {this.points=10;this.load(this.dialogue.start);}
    answer(transcript) {
      if(this.phase!=='answer')return {outcome:'ignored'};
      const result=root.DialogueMatcher.evaluate(this.node,transcript,this.concepts);
      if(result.outcome==='accepted') {
        const pointsEarned=this.node.mode==='acknowledgement'?0:result.response.reward;
        this.points+=pointsEarned;
        this.pending=result.response.next;
        this.phase=this.pending===null?'complete':'advance';
        return {...result,pointsEarned,complete:this.phase==='complete'};
      }
      this.attempts++;
      // An unsuccessful acknowledgement never spends points or leaves its node.
      const exhausted=this.node.mode!=='acknowledgement'&&this.attempts>=3;
      if(exhausted) {this.points--;this.pending=this.node.retry.next;this.phase=this.pending===null?'complete':'advance';}
      return {...result,pointsEarned:exhausted?-1:0,exhausted,complete:this.phase==='complete'};
    }
    advance() {if(this.phase==='advance')this.load(this.pending);}
  }
  root.DialogueSession=Session;
})(globalThis);
