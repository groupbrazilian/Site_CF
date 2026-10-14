(() => {
  'use strict';
  const $=id=>document.getElementById(id),canvas=$('renderer'),ctx=canvas.getContext('2d');
  const orange='#ff6500',white='#f8f8f6';let item,posterURL;
  const paper={width:1748,height:2480,stageWidth:1080};
  const clean=v=>v==null?'':String(v).trim();
  function image(url,cors=false){return new Promise((resolve,reject)=>{const i=new Image();if(cors)i.crossOrigin='anonymous';const timer=setTimeout(()=>{i.src='';reject(new Error('Tempo de carregamento da foto excedido.'));},15000);i.onload=()=>{clearTimeout(timer);resolve(i)};i.onerror=()=>{clearTimeout(timer);reject(new Error('Imagem indisponível.'))};i.src=url;});}
  function photoURLs(p){
    return CF_API.imageURLs(p,true);
  }
  async function photo(p){for(const url of photoURLs(p)){try{const img=await image(url,true);return {img,url};}catch{}}return null;}
  function font(size,weight=400){ctx.font=`${weight} ${size}px Arial, Helvetica, sans-serif`;}
  function lines(text,width,size,weight=400){
    font(size,weight);const output=[];
    for(const paragraph of clean(text).split(/\r?\n/)){let line='';for(const word of paragraph.split(/\s+/).filter(Boolean)){
      if(ctx.measureText(word).width>width){if(line){output.push(line);line='';}let part='';for(const c of word){if(part&&ctx.measureText(part+c).width>width){output.push(part);part='';}part+=c;}line=part;continue;}
      const next=line?line+' '+word:word;if(line&&ctx.measureText(next).width>width){output.push(line);line=word;}else line=next;
    }output.push(line);}return output;
  }
  function text(value,x,y,size,color=white,weight=400){font(size,weight);ctx.fillStyle=color;ctx.fillText(value,x,y);}
  function multiline(values,x,y,size,color,weight=400,lineHeight=1.3){values.forEach((value,i)=>text(value,x,y+i*size*lineHeight,size,color,weight));}
  function rect(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(x,y,w,h);}
  function rule(x,y,width,color='#333'){rect(x,y,width,1,color);}
  // Only border-connected nearly pure white is softened. Interior detail remains untouched.
  function softenBackground(img){
    const c=document.createElement('canvas'),scale=Math.min(1,1200/Math.max(img.naturalWidth,img.naturalHeight));c.width=Math.round(img.naturalWidth*scale);c.height=Math.round(img.naturalHeight*scale);const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(img,0,0,c.width,c.height);
    const data=g.getImageData(0,0,c.width,c.height),pixels=data.data,w=c.width,h=c.height,seen=new Uint8Array(w*h),queue=new Int32Array(w*h);let tail=0,head=0;
    const add=n=>{if(n<0||n>=w*h||seen[n])return;seen[n]=1;const i=n*4,r=pixels[i],b=pixels[i+2],green=pixels[i+1];if(pixels[i+3]&&Math.min(r,green,b)>=246&&Math.max(r,green,b)-Math.min(r,green,b)<=9)queue[tail++]=n;};
    for(let x=0;x<w;x++){add(x);add((h-1)*w+x);}for(let y=0;y<h;y++){add(y*w);add(y*w+w-1);}
    while(head<tail){const n=queue[head++];pixels[n*4+3]=0;if(n%w)add(n-1);if(n%w<w-1)add(n+1);if(n>=w)add(n-w);if(n<w*(h-1))add(n+w);}
    g.putImageData(data,0,0);return c;
  }
  const symbols={
    whatsapp:'<path d="M27.5 15.4a11.4 11.4 0 0 1-16.8 10.1L4 27.4l1.9-6.6A11.4 11.4 0 1 1 27.5 15.4Z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M11 9.8c-.4-.1-.8 0-1.1.4-.7.8-.9 1.7-.6 2.9.7 2.5 4.6 6.5 7.2 7.5 1.5.6 3.1.5 4.2-.4.5-.4.8-1.3.7-1.7-.1-.3-2.7-1.8-3.1-1.7-.3.1-1 1.2-1.3 1.3-.6.2-3.8-2.3-4.3-3.4-.1-.4.7-1.1.9-1.5.2-.4-1.5-3.3-1.8-3.4Z"/>',
    tiktok:'<path d="M15.1 2h-3.5v13.2a3 3 0 1 1-2.1-2.9V8.7a6.5 6.5 0 1 0 5.6 6.5V8.5a8.5 8.5 0 0 0 5 1.6V6.7c-2.6-.1-4.7-2-5-4.7Z"/>',
    youtube:'<path d="M22.5 6.3a2.9 2.9 0 0 0-2-2.1C18.7 3.7 12 3.7 12 3.7s-6.7 0-8.5.5a2.9 2.9 0 0 0-2 2.1A30 30 0 0 0 1 12a30 30 0 0 0 .5 5.7 2.9 2.9 0 0 0 2 2.1c1.8.5 8.5.5 8.5.5s6.7 0 8.5-.5a2.9 2.9 0 0 0 2-2.1A30 30 0 0 0 23 12a30 30 0 0 0-.5-5.7ZM9.8 15.5v-7l6 3.5-6 3.5Z"/>',
    instagram:'<rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.6" cy="6.6" r="1.2"/>',
    facebook:'<path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.7-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.2c-1.2 0-1.6.7-1.6 1.5V12h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12Z"/>'
  };
  async function icon(name){return image('data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 ${name==='whatsapp'?32:24} ${name==='whatsapp'?32:24}" color="${name==='whatsapp'?orange:'#cbcbce'}" fill="currentColor">${symbols[name]}</svg>`));}
  async function product(){
    const params=new URLSearchParams(location.search),code=clean(params.get('produto'));if(!code)throw new Error('Abra o botão Panfleto no item desejado do catálogo.');
    try{const saved=JSON.parse(localStorage.getItem('cf-panfleto:'+code));if(saved?.token===params.get('ref')&&Date.now()-saved.createdAt<15*60*1000&&Date.now()>=saved.createdAt&&CF_API.fold(saved.item?.codigo)===CF_API.fold(code)){return {item:saved.item,source:'catalogo'};}}catch{}
    const result=await CF_API.getProducts(false,false),p=result.products.find(p=>CF_API.fold(p.codigo)===CF_API.fold(code));if(!p)throw new Error('Este item não está disponível na base atual. Volte ao catálogo e escolha outro item.');return {item:p,source:'api'};
  }
  async function logos(){
    if(location.protocol==='file:'){
      // Local file images have opaque origins and would taint the export canvas.
      // Load embedded brand assets only in file mode; HTTP keeps its existing lazy images.
      if(!window.CF_FLYER_ASSETS)await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='assets/js/panfleto-assets.js?v=20261014';script.onload=resolve;script.onerror=()=>reject(new Error('Não foi possível carregar as logos. Abra o catálogo pelo endereço local http://127.0.0.1:4173/catalogo/.'));document.head.append(script);});
      return Promise.all([image(CF_FLYER_ASSETS.cf),image(CF_FLYER_ASSETS.brazilian)]);
    }
    return Promise.all([image('assets/img/panfleto/cf-logo.png',true),image('assets/img/panfleto/brazilian-referencia.png?v=20261014',true)]);
  }
  async function printDensity(blob){
    // Set PNG physical resolution to 300 dpi without resampling or recompressing the artwork.
    const bytes=new Uint8Array(await blob.arrayBuffer()),view=new DataView(bytes.buffer);
    let offset=8;while(offset+12<=bytes.length){const length=view.getUint32(offset),type=String.fromCharCode(...bytes.slice(offset+4,offset+8));if(type==='pHYs')break;offset+=length+12;}
    const chunk=new Uint8Array(21),metadata=new DataView(chunk.buffer);metadata.setUint32(0,9);chunk.set([112,72,89,115],4);metadata.setUint32(8,11811);metadata.setUint32(12,11811);chunk[16]=1;
    let crc=0xffffffff;for(let i=4;i<17;i++){crc^=chunk[i];for(let bit=0;bit<8;bit++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}metadata.setUint32(17,(crc^0xffffffff)>>>0);
    if(offset+21<=bytes.length){bytes.set(chunk,offset);return new Blob([bytes],{type:'image/png'});}
    const output=new Uint8Array(bytes.length+21);output.set(bytes.slice(0,33));output.set(chunk,33);output.set(bytes.slice(33),54);return new Blob([output],{type:'image/png'});
  }
  async function render(p){
    const [brand,photoResult,...icons]=await Promise.all([logos(),photo(p),...Object.keys(symbols).map(icon)]),[cf,brazilian]=brand;
    let titleSize=64,titleLines=lines(p.nome,952,titleSize,800);while(titleLines.length*titleSize*1.1>172&&titleSize>32){titleSize-=2;titleLines=lines(p.nome,952,titleSize,800);}
    if(titleLines.length*titleSize*1.1>172)throw new Error('O nome deste item é muito extenso para o panfleto A5. Revise o nome na base antes de gerar a arte.');
    const blocks=[];if(clean(p.aplicacao))blocks.push({label:'APLICAÇÃO',value:p.aplicacao});if(clean(p.descricao)&&!p.nome_por_descricao)blocks.push({label:'DESCRIÇÃO TÉCNICA',value:p.descricao});if(!blocks.length&&p.categoria_preenchida)blocks.push({label:'CATEGORIA',value:p.categoria});
    let detailSize=26,detailHeight;
    do{detailHeight=48;for(const block of blocks){block.lines=lines(block.value,936,detailSize);detailHeight+=24+block.lines.length*detailSize*1.3+16;}if(detailHeight<=550||detailSize===20)break;detailSize-=2;}while(true);
    if(detailHeight>550)throw new Error('As informações deste item são extensas demais para uma folha A5 legível. Revise os textos na base; nenhum conteúdo foi cortado.');
    detailHeight=Math.max(225,detailHeight);const scale=paper.width/paper.stageWidth,stageHeight=paper.height/scale,footerY=stageHeight-350,detailY=footerY-detailHeight,heroY=412,heroHeight=detailY-heroY;
    canvas.width=paper.width;canvas.height=paper.height;ctx.scale(scale,scale);rect(0,0,1080,stageHeight,'#000');ctx.textBaseline='top';
    ctx.drawImage(cf,64,20,104,104);text('CF INDUSTRIAL',187,38,52,white,800);text('PRECISÃO PARA TRANSMISSÕES AUTOMÁTICAS',187,107,14,'#ababaf');rule(64,149,952);rect(64,149,90,1,orange);
    text(clean(p.familia).toUpperCase(),64,177,18,'#d9d9db',400);text('CÓDIGO',850,169,11,'#b0b0b5');let codeSize=32;while(codeSize>16){font(codeSize,800);if(ctx.measureText(p.codigo).width<=260)break;codeSize--;}
    font(codeSize,800);text(p.codigo,1000-ctx.measureText(p.codigo).width,192,codeSize,white,800);rect(1011,170,4,58,orange);
    titleLines.forEach((line,i)=>text(line,64,238+i*titleSize*1.1,titleSize,i===titleLines.length-1?orange:white,800));
    const gradient=ctx.createLinearGradient(0,heroY,1080,detailY);gradient.addColorStop(0,'#090909');gradient.addColorStop(1,'#1e1713');rect(0,heroY,1080,heroHeight,gradient);
    ctx.save();ctx.beginPath();ctx.rect(0,heroY,1080,heroHeight);ctx.clip();ctx.translate(540,heroY+heroHeight/2);ctx.rotate(-28*Math.PI/180);const band=ctx.createLinearGradient(-800,0,800,0);band.addColorStop(0,'#b94300');band.addColorStop(.65,orange);band.addColorStop(1,'#f18432');rect(-800,-100,1600,200,band);rule(-800,-100,1600,'#ffb16e');ctx.restore();
    if(photoResult){const pic=softenBackground(photoResult.img),photoHeight=heroHeight-30,ratio=Math.min(840/pic.width,photoHeight/pic.height),x=150+(840-pic.width*ratio)/2,y=heroY+15+(photoHeight-pic.height*ratio)/2,w=pic.width*ratio,h=pic.height*ratio;ctx.save();ctx.beginPath();ctx.roundRect(x,y,w,h,22);ctx.clip();ctx.drawImage(pic,x,y,w,h);ctx.restore();}else{text('FOTO INDISPONÍVEL',340,heroY+heroHeight/2,27,'#ddd',700);}
    rect(0,detailY,1080,detailHeight,'#f6f5f1');rect(0,detailY,8,detailHeight,orange);ctx.beginPath();ctx.moveTo(1015,detailY);ctx.lineTo(1080,detailY);ctx.lineTo(1080,detailY+50);ctx.closePath();ctx.fillStyle='#000';ctx.fill();let y=detailY+24;
    for(const block of blocks){text(block.label,64,y,15,'#dc5500',700);y+=24;multiline(block.lines,64,y,detailSize,'#202023',400,1.3);y+=block.lines.length*detailSize*1.3+16;}
    rect(64,footerY+20,952,94,'#171718');rect(64,footerY+20,5,94,orange);ctx.drawImage(icons[0],101,footerY+38,56,56);text('FALE COM A CF INDUSTRIAL · WHATSAPP',183,footerY+36,12,'#bfbfc2');
    const number=clean(CF_CONFIG.WHATSAPP).replace(/^55/,'');const display=number.length===11?`(${number.slice(0,2)}) ${number.slice(2,7)}-${number.slice(7)}`:CF_CONFIG.WHATSAPP;text(display,183,footerY+60,46,white,750);
    font(25);const site='www.cfindustrial.com.br';text(site,(1080-ctx.measureText(site).width)/2,footerY+134,25,'#eee');
    const socialY=footerY+177;icons.slice(1).forEach((img,i)=>ctx.drawImage(img,337+i*42,socialY,25,25));rect(513,socialY,1,25,'#000000');text('@oficial.cfindustrial',539,socialY,22,'#cbcbce');rule(64,footerY+220,952,'#2c2c2e');
    text('DISTRIBUIDOR',316,footerY+254,14,'#99999f');text('OFICIAL',316,footerY+276,14,'#99999f');
    const logoScale=Math.min(260/brazilian.naturalWidth,90/brazilian.naturalHeight),logoWidth=brazilian.naturalWidth*logoScale,logoHeight=brazilian.naturalHeight*logoScale;
    ctx.drawImage(brazilian,478+(260-logoWidth)/2,footerY+239+(90-logoHeight)/2,logoWidth,logoHeight);
    const rawBlob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!rawBlob)throw new Error('Não foi possível preparar a imagem para download.');const blob=await printDensity(rawBlob);posterURL=URL.createObjectURL(blob);$('poster').src=posterURL;$('poster').alt=`${p.codigo} — ${p.nome}. ${blocks.map(b=>b.label+': '+b.value).join(' ')}. CF Industrial, WhatsApp ${display}, www.cfindustrial.com.br, @oficial.cfindustrial. Distribuidor oficial Brazilian Imports.`;await $('poster').decode();$('poster').hidden=false;
    return {photoSource:photoResult?.url||'',photoLoaded:Boolean(photoResult),width:canvas.width,height:canvas.height,paper:'A5',printWidthMM:148,printHeightMM:210};
  }
  $('download').onclick=()=>{const a=document.createElement('a');a.href=posterURL;a.download='CF-Industrial-'+clean(item.codigo).replace(/[^a-zA-Z0-9_-]/g,'_')+'-panfleto.png';document.body.append(a);a.click();a.remove();};
  $('print').onclick=()=>window.print();
  (async()=>{try{const result=await product();item=result.item;document.title=item.codigo+' — Panfleto A5 CF Industrial';$('item-label').textContent=item.codigo+' · '+item.nome;const rendered=await render(item);$('download').disabled=false;$('print').disabled=false;$('message').textContent=rendered.photoLoaded?'Panfleto A5 pronto (148 × 210 mm). PNG: 1748 × 2480 px. Na impressão, escolha A5; se usar A4, mantenha escala 100% para imprimir no tamanho A5.':'A foto não pôde ser carregada ou não foi informada na base. O panfleto A5 indica foto indisponível. Confira o acesso público da imagem.';$('message').classList.toggle('warning',!rendered.photoLoaded);window.CF_FLYER={ready:true,item,source:result.source,...rendered};}catch(e){const message=e.name==='SecurityError'?'O navegador bloqueou a exportação de uma imagem. Abra pelo endereço http://127.0.0.1:4173/catalogo/ e tente novamente.':e.message;$('message').textContent=message;$('message').classList.add('warning');window.CF_FLYER={ready:false,error:message};}})();
})();
