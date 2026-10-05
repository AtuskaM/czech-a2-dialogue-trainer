const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
module.exports=function load(extra={}) {
  const context=vm.createContext({console,setTimeout,clearTimeout,...extra});
  const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
  for(const match of html.matchAll(/<script src="([^"]+)"/g)) {
    if(match[1]==='app.js')continue;
    vm.runInContext(fs.readFileSync(path.join(__dirname,'..',match[1]),'utf8'),context,{filename:match[1]});
  }
  return context;
};
