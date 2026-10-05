// Explicit appointment values; only responses declaring a slots rule use this parser.
(function(root) {
  const fold=s=>String(s).toLowerCase().normalize('NFD').replace(/\p{M}/gu,'');
  const cardinals=['nula','jedna','dva','tri','ctyri','pet','sest','sedm','osm','devet','deset','jedenact','dvanact','trinact','ctrnact','patnact','sestnact','sedmnact','osmnact','devatenact'];
  const word=n=>n<20?cardinals[n]:({2:'dvacet',3:'tricet',4:'ctyricet',5:'padesat'}[Math.floor(n/10)]+(n%10?' '+cardinals[n%10]:''));
  const ordinals=['','prvniho','druheho','tretiho','ctvrteho','pateho','sesteho','sedmeho','osmeho','devateho','desateho','jedenacteho','dvanacteho','trinacteho','ctrnacteho','patnacteho','sestnacteho','sedmnacteho','osmnacteho','devatenacteho','dvacateho'];
  const ordinal=n=>n<=20?ordinals[n]:n<30?'dvacateho '+ordinals[n-20]:n===30?'tricateho':'tricateho prvniho';
  const months=['','ledna','unora','brezna','dubna','kvetna','cervna','cervence','srpna','zari','rijna','listopadu','prosince'];
  const phrase=(text,p)=>(' '+text+' ').includes(' '+p+' ');
  function values(actual,rule) {
    const raw=fold(actual),plain=raw.replace(/[.,!?;:/]/g,' ').replace(/\s+/g,' ').trim(),found=[];
    if(rule.kind==='date') {
      for(const m of raw.matchAll(/\b(\d{1,2})\s*[./]\s*(\d{1,2})(?:\s*[./]\s*\d{4})?\.?/g))found.push(Number(m[1])+'-'+Number(m[2]));
      for(let month=1;month<=12;month++)for(let day=1;day<=31;day++) {
        for(const d of [String(day),word(day),ordinal(day)])if(phrase(plain,d+' '+months[month]))found.push(day+'-'+month);
      }
    } else {
      const add=(h,m)=>{h=Number(h);if(rule.afternoon&&h>=1&&h<8)h+=12;found.push(h+':'+String(m).padStart(2,'0'));};
      for(const m of raw.matchAll(/\b(\d{1,2})\s*[:.]\s*(\d{2})\b/g))add(m[1],m[2]);
      for(const m of raw.matchAll(/\b(?:v|ve)\s+(\d{1,2})(?!\d|\s*[:.])(?:\s+hodin(?:y|u)?)?\b/g))add(m[1],0);
      for(let h=0;h<24;h++) {
        const hours=[word(h),...(h===1?['jednu']:[]),...(h===2?['dve']:[])];
        for(const hour of hours) {
          let withMinutes=false;
          for(let minute=0;minute<60;minute++)if(phrase(plain,hour+' '+word(minute))){add(h,minute);withMinutes=true;}
          if(!withMinutes&&(phrase(plain,'v '+hour)||phrase(plain,'ve '+hour)))add(h,0);
        }
      }
      const half=['','prvni','druhe','treti','ctvrte','pate','seste','sedme','osme','devate','desate','jedenacte','dvanacte'];
      for(let next=1;next<=12;next++) {
        if(phrase(plain,'pul '+half[next]))add((next+11)%12,30);
        if(phrase(plain,'ctvrt na '+word(next)))add((next+11)%12,15);
        if(phrase(plain,'tri ctvrte na '+word(next)))add((next+11)%12,45);
      }
    }
    return [...new Set(found)];
  }
  function matches(actual,rule) {
    const found=values(actual,rule),all=found.every(v=>rule.allowed.includes(v));
    return rule.mode==='different'?found.length>0&&!all:rule.mode==='compatible'?all:found.length>0&&all;
  }
  root.DialogueSlots={values,matches};
})(globalThis);
