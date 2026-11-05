const fs=require('fs'),vm=require('vm'),zlib=require('zlib'),crypto=require('crypto'),assert=require('assert');
const code=fs.readFileSync('catalogo/apps-script/API-Catalogo-CF-Industrial.gs','utf8');
let props={},cache={},locked=false,lockAvailable=true,scans=0,sheetReads=0,failDrive=false,failSave=false;
let stock='5',priority='Médio',triggers=[{id:'old',handler:'atualizarCacheDrive'},{id:'estoque',handler:'registrarMovimentacao'}],schedule=null;
const blob=bytes=>({getBytes:()=>Array.from(Buffer.from(bytes)),getDataAsString:()=>Buffer.from(bytes).toString('utf8')});
const iterator=list=>{let i=0;return {hasNext:()=>i<list.length,next:()=>list[i++]};};
const propertyService={getProperty:k=>props[k]??null,getProperties:()=>({...props}),setProperty:(k,v)=>{props[k]=String(v);return propertyService;},deleteProperty:k=>delete props[k],setProperties:(obj)=>{if(failSave)throw Error('falha simulada');Object.assign(props,obj);}};
const fixtureMap={TK200A:{familia:'Componente',tipo:'Componente',imagens:[{id:'foto-velha',nome:'Foto 1',thumbnail:'https://example.com/small.png',url:'https://example.com/large.png'}]}};
const c={console:{log(){},error(){}},Date,JSON,Set,Number,String,Object,Array,
 PropertiesService:{getScriptProperties:()=>propertyService},
 CacheService:{getScriptCache:()=>({get:k=>cache[k]??null,put:(k,v,ttl)=>{assert(ttl<=21600);assert(Buffer.byteLength(v)<=100000);cache[k]=v;},remove:k=>delete cache[k]})},
 LockService:{getScriptLock:()=>({tryLock:()=>{if(!lockAvailable||locked)return false;locked=true;return true;},releaseLock:()=>locked=false})},
 Utilities:{newBlob:v=>blob(typeof v==='string'?Buffer.from(v):v),gzip:b=>blob(zlib.gzipSync(Buffer.from(b.getBytes()))),ungzip:b=>blob(zlib.gunzipSync(Buffer.from(b.getBytes()))),base64Encode:b=>Buffer.from(b).toString('base64'),base64Decode:v=>Array.from(Buffer.from(v,'base64')),getUuid:()=>crypto.randomUUID()},
 SpreadsheetApp:{openById:id=>{assert.equal(id,'1vQm6qf-kJP4GC5DxCJMJP0cHdlKzkg98RR_ITPuc0Eg');return {getSheetByName:name=>{assert.equal(name,'ESTOQUE');return {getDataRange:()=>({getDisplayValues:()=>{sheetReads++;return [['Código','Ferramenta / Máquina / Serviços','Família','Categoria','Descrição','Aplicação','Estoque PR','Estoque SC','Prioridade'],['TK200A','Anel de vedação','Componente','Componentes','Anel','DSG',stock,'',priority]];}})};}};}},
 ContentService:{MimeType:{JSON:'application/json'},createTextOutput:text=>({text,setMimeType(){return this;}})},
 DriveApp:{getFolderById:id=>{scans++;if(failDrive)throw Error('Drive indisponível');return {getFolders:()=>iterator([{getName:()=>id.includes('12J')?'TK200A':'CODE-'+scans,getFiles:()=>iterator([{getId:()=>id+'foto-nova',getName:()=> 'Peça ção 1.png',getMimeType:()=> 'image/png'},{getId:()=> 'texto',getName:()=> 'arquivo.txt',getMimeType:()=> 'text/plain'}])}])};}},
 ScriptApp:{getProjectTriggers:()=>triggers.map(t=>({getUniqueId:()=>t.id,getHandlerFunction:()=>t.handler})),deleteTrigger:t=>triggers=triggers.filter(v=>v.id!==t.getUniqueId()),newTrigger:handler=>{const builder={timeBased:()=>builder,everyHours:n=>{schedule=n+'h';return builder;},everyMinutes:n=>{schedule=n+'m';return builder;},create:()=>{const t={id:crypto.randomUUID(),handler};triggers.push(t);return {getUniqueId:()=>t.id};}};return builder;}}
};
vm.createContext(c);vm.runInContext(code,c);
const legacyJSON=JSON.stringify(fixtureMap);props.CF_DRIVE_V3_CHUNKS='1';props.CF_DRIVE_V3_CHUNK_0=legacyJSON;
const first=JSON.parse(c.doGet({parameter:{}}).text);assert.equal(first.produtos[0].estoque_pr,5);assert.equal(first.produtos[0].estoque_sc,null);assert.equal(scans,0);assert(cache.CF_DRIVE_MAP_V3.startsWith('GZ:'));
stock='0';priority='Alto';const second=JSON.parse(c.doGet({parameter:{codigo:'tk200a',familia:'Componente'}}).text);assert.equal(second.produtos[0].estoque_pr,0);assert.equal(second.produtos[0].prioridade,'Alto');assert.equal(sheetReads,2);assert.equal(scans,0);
priority='INATIVO';assert.equal(JSON.parse(c.doGet({parameter:{}}).text).total,0);priority='Alto';
c.atualizarImagensAgora();assert.equal(scans,4);cache={};const current=c.getDriveCatalogMapFast_();assert(current.TK200A.imagens[0].id.endsWith('foto-nova'));assert.equal(scans,4);
let previous=JSON.stringify(current);failDrive=true;assert.throws(()=>c.atualizarImagensAgora());failDrive=false;assert.equal(JSON.stringify(c.loadPersistentDriveMap_()),previous);assert(!locked);
failSave=true;assert.throws(()=>c.atualizarImagensAgora());failSave=false;assert.equal(JSON.stringify(c.loadPersistentDriveMap_()),previous);assert(!locked);
lockAvailable=false;const before=scans;assert.equal(JSON.stringify(c.atualizarImagensAgora()),previous);assert.equal(scans,before);lockAvailable=true;
const big={};for(let i=0;i<600;i++)big['COD'+i]={familia:'Componente',imagens:[{id:crypto.randomBytes(24).toString('hex'),nome:'Peça — válvula — '+crypto.randomBytes(50).toString('hex')}]};c.savePersistentDriveMap_(big,new Date().toISOString(),{});assert.equal(JSON.stringify(c.loadPersistentDriveMap_()),JSON.stringify(big));for(const [k,v] of Object.entries(props))if(k.startsWith('CF_DRIVE_V3_CHUNK_')&&k!=='CF_DRIVE_V3_CHUNK_0')assert(Buffer.byteLength(v,'utf8')<=7500);
c.configurarAutomacao();assert.equal(schedule,'2h');assert.equal(triggers.filter(t=>t.handler==='atualizarCacheDrive').length,1);assert(triggers.find(t=>t.id==='estoque'));
c.configurarAutomacao10Minutos();assert.equal(schedule,'10m');assert.equal(triggers.filter(t=>t.handler==='atualizarCacheDrive').length,1);assert(triggers.find(t=>t.id==='estoque'));
const result={liveSheetReadEveryRequest:true,legacyIndex:true,noDriveScanForStock:true,zeroStock:true,inactiveRemoved:true,manualImages:true,gzipAndUnicode:true,lock:true,failurePreservesIndex:true,schedules:true,otherTriggersPreserved:true,note:'Serviços Google simulados; tempos e cotas reais não medidos.'};fs.writeFileSync('catalogo/tests/apps-script-resultados.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
