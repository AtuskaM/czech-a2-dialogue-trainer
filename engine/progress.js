(function(root) {
  'use strict';
  const key='czech-a2-progress-v1';
  function read() {
    try {const data=JSON.parse(root.localStorage.getItem(key));return data?.version===1 && data.records && typeof data.records==='object'?data:{version:1,records:{}};}
    catch {return {version:1,records:{}};}
  }
  function save(session) {
    const data=read(), id=session.dialogue.id+':'+(session.mixed?'mixed':session.level);
    const previous=data.records[id];
    data.records[id]={runs:(Number(previous?.runs)||0)+1,best:Math.max(Number(previous?.best)||0,session.points),last:session.points,accepted:session.acceptedCount,skipped:session.skippedCount,completedAt:new Date().toISOString()};
    try {root.localStorage.setItem(key,JSON.stringify(data));return true;} catch {return false;}
  }
  root.DialogueProgress={read,save};
})(globalThis);
