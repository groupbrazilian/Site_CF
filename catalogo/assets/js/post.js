(() => {
'use strict';
const $=id=>document.getElementById(id),canvas=$('renderer'),ctx=canvas.getContext('2d');
const orange='#ff6500',white='#fff';
const clean=v=>v==null?'':String(v).trim();
  function image(url, cors = false) {
    return new Promise((resolve, reject) => {
      const i = new Image();

      if (cors) i.crossOrigin = 'anonymous';

      const timer = setTimeout(() => {
        i.src = '';
        reject(new Error('Tempo de carregamento da foto excedido.'));
      }, 15000);

      i.onload = () => {
        clearTimeout(timer);
        resolve(i);
      };

      i.onerror = () => {
        clearTimeout(timer);
        reject(new Error('Imagem indisponível.'));
      };

      i.src = url;
    });
  }

  function photoURLs(p) {
    const supplied = CF_API.imageURLs(p, true);
    const exportURLs = [];

    // Alternativa para exportar a mesma foto pública do Drive.
    for (const value of supplied) {
      const url = new URL(value);

      if (url.hostname === 'drive.google.com') {
        const id =
          url.searchParams.get('id') ||
          url.pathname.match(/\/d\/([\w-]+)/)?.[1];

        if (id && /^[\w-]+$/.test(id)) {
          exportURLs.push(
            'https://lh3.googleusercontent.com/d/' + id + '=w1600'
          );
        }
      }
    }

    return [...new Set([...supplied, ...exportURLs])];
  }

  async function photo(p) {
    for (const url of photoURLs(p)) {
      try {
        const img = await image(url, true);
        return { img, url };
      } catch {}
    }

    return null;
  }

  function font(size, weight = 400, family = 'Arial, Helvetica, sans-serif') {
    ctx.font = `${weight} ${size}px ${family}`;
  }

  function lines(value, width, size, weight = 400, family) {
    font(size, weight, family);
    const output = [];

    for (const paragraph of clean(value).split(/\r?\n/)) {
      let line = '';

      for (const word of paragraph.split(/\s+/).filter(Boolean)) {
        if (ctx.measureText(word).width > width) {
          if (line) {
            output.push(line);
            line = '';
          }

          let part = '';

          for (const c of word) {
            if (part && ctx.measureText(part + c).width > width) {
              output.push(part);
              part = '';
            }

            part += c;
          }

          line = part;
          continue;
        }

        const next = line ? line + ' ' + word : word;

        if (line && ctx.measureText(next).width > width) {
          output.push(line);
          line = word;
        } else {
          line = next;
        }
      }

      output.push(line);
    }

    return output;
  }

  function text(value, x, y, size, color = white, weight = 400, family) {
    font(size, weight, family);
    ctx.fillStyle = color;
    ctx.fillText(value, x, y);
  }

  function multiline(
    values, x, y, size, color, weight = 400, lineHeight = 1.3
  ) {
    values.forEach((value, i) =>
      text(value, x, y + i * size * lineHeight, size, color, weight)
    );
  }

  function rect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  }

  function rule(x, y, width, color = '#333') {
    rect(x, y, width, 1, color);
  }

  // Remove somente o fundo quase branco conectado às bordas.
  function softenBackground(img) {
    const c = document.createElement('canvas');
    const scale = Math.min(
      1,
      1200 / Math.max(img.naturalWidth, img.naturalHeight)
    );

    c.width = Math.round(img.naturalWidth * scale);
    c.height = Math.round(img.naturalHeight * scale);

    const g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(img, 0, 0, c.width, c.height);

    const data = g.getImageData(0, 0, c.width, c.height);
    const pixels = data.data;
    const w = c.width;
    const h = c.height;
    const seen = new Uint8Array(w * h);
    const queue = new Int32Array(w * h);

    let tail = 0;
    let head = 0;

    const add = n => {
      if (n < 0 || n >= w * h || seen[n]) return;

      seen[n] = 1;

      const i = n * 4;
      const r = pixels[i];
      const green = pixels[i + 1];
      const b = pixels[i + 2];

      if (
        pixels[i + 3] &&
        Math.min(r, green, b) >= 246 &&
        Math.max(r, green, b) - Math.min(r, green, b) <= 9
      ) {
        queue[tail++] = n;
      }
    };

    for (let x = 0; x < w; x++) {
      add(x);
      add((h - 1) * w + x);
    }

    for (let y = 0; y < h; y++) {
      add(y * w);
      add(y * w + w - 1);
    }

    while (head < tail) {
      const n = queue[head++];
      pixels[n * 4 + 3] = 0;

      if (n % w) add(n - 1);
      if (n % w < w - 1) add(n + 1);
      if (n >= w) add(n - w);
      if (n < w * (h - 1)) add(n + w);
    }

    g.putImageData(data, 0, 0);

    let left = w;
    let top = h;
    let right = -1;
    let bottom = -1;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (pixels[(y * w + x) * 4 + 3] > 16) {
          left = Math.min(left, x);
          right = Math.max(right, x);
          top = Math.min(top, y);
          bottom = Math.max(bottom, y);
        }
      }
    }

    if (right < left) return c;

    const trimmed = document.createElement('canvas');
    trimmed.width = right - left + 1;
    trimmed.height = bottom - top + 1;

    trimmed.getContext('2d').drawImage(
      c,
      left,
      top,
      trimmed.width,
      trimmed.height,
      0,
      0,
      trimmed.width,
      trimmed.height
    );

    return trimmed;
  }

  const symbols = {
    whatsapp:
      '<path d="M27.5 15.4a11.4 11.4 0 0 1-16.8 10.1L4 27.4l1.9-6.6A11.4 11.4 0 1 1 27.5 15.4Z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M11 9.8c-.4-.1-.8 0-1.1.4-.7.8-.9 1.7-.6 2.9.7 2.5 4.6 6.5 7.2 7.5 1.5.6 3.1.5 4.2-.4.5-.4.8-1.3.7-1.7-.1-.3-2.7-1.8-3.1-1.7-.3.1-1 1.2-1.3 1.3-.6.2-3.8-2.3-4.3-3.4-.1-.4.7-1.1.9-1.5.2-.4-1.5-3.3-1.8-3.4Z"/>',
    tiktok:
      '<path d="M15.1 2h-3.5v13.2a3 3 0 1 1-2.1-2.9V8.7a6.5 6.5 0 1 0 5.6 6.5V8.5a8.5 8.5 0 0 0 5 1.6V6.7c-2.6-.1-4.7-2-5-4.7Z"/>',
    youtube:
      '<path d="M22.5 6.3a2.9 2.9 0 0 0-2-2.1C18.7 3.7 12 3.7 12 3.7s-6.7 0-8.5.5a2.9 2.9 0 0 0-2 2.1A30 30 0 0 0 1 12a30 30 0 0 0 .5 5.7 2.9 2.9 0 0 0 2 2.1c1.8.5 8.5.5 8.5.5s6.7 0 8.5-.5a2.9 2.9 0 0 0 2-2.1A30 30 0 0 0 23 12a30 30 0 0 0-.5-5.7ZM9.8 15.5v-7l6 3.5-6 3.5Z"/>',
    instagram:
      '<rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.6" cy="6.6" r="1.2"/>',
    facebook:
      '<path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.7-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.2c-1.2 0-1.6.7-1.6 1.5V12h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12Z"/>'
  };

  async function icon(name) {
    const size = name === 'whatsapp' ? 32 : 24;
    const color = name === 'whatsapp' ? orange : '#ffffff';

    return image(
      'data:image/svg+xml;charset=utf-8,' +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 ${size} ${size}" color="${color}" fill="currentColor">${symbols[name]}</svg>`
      )
    );
  }

  async function product() {
    const params = new URLSearchParams(location.search);
    const code = clean(params.get('produto'));

    if (!code) {
      throw new Error(
        'Abra o botão Post no item desejado do catálogo.'
      );
    }

    try {
      const saved = JSON.parse(
        localStorage.getItem('cf-post:' + code)
      );

      if (
        saved?.token === params.get('ref') &&
        Date.now() - saved.createdAt < 15 * 60 * 1000 &&
        Date.now() >= saved.createdAt &&
        CF_API.fold(saved.item?.codigo) === CF_API.fold(code)
      ) {
        return { item: saved.item, source: 'catalogo' };
      }
    } catch {}

    const result = await CF_API.getProducts(false, false);
    const p = result.products.find(
      p => CF_API.fold(p.codigo) === CF_API.fold(code)
    );

    if (!p) {
      throw new Error(
        'Este item não está disponível na base atual. Volte ao catálogo e escolha outro item.'
      );
    }

    return { item: p, source: 'api' };
  }

  async function logos() {
    if (location.protocol === 'file:') {
      if (!window.CF_FLYER_ASSETS) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'assets/js/panfleto-assets.js?v=20261027a';
          script.onload = resolve;
          script.onerror = () => reject(new Error(
            'Não foi possível carregar as logos. Abra o catálogo pelo endereço local http://127.0.0.1:4173/catalogo/.'
          ));
          document.head.append(script);
        });
      }

      return Promise.all([
        image(CF_FLYER_ASSETS.cf),
        image(CF_FLYER_ASSETS.brazilian)
      ]);
    }

    return Promise.all([
      image('assets/img/panfleto/cf-logo.png', true),
      image(
        'assets/img/panfleto/brazilian-referencia.png?v=20261014',
        true
      )
    ]);
  }

  let titleFontReady;
  async function loadTitleFont() {
    if(!titleFontReady)titleFontReady=(async()=>{
      const source=location.protocol==='file:' ? window.CF_FLYER_ASSETS.font : 'assets/fonts/BebasNeue-Regular.ttf?v=20261027a';
      const face=new FontFace('CF Bebas Neue',`url("${source}")`,{weight:'400',style:'normal'});
      await face.load();document.fonts.add(face);
      await document.fonts.load('60px "CF Bebas Neue"');
    })();
    try{await titleFontReady;}catch{throw new Error('Não foi possível carregar a fonte Bebas Neue. Confira se a pasta assets/fonts foi copiada junto com o panfleto.');}
  }

  function rounded(x,y,w,h,r,color){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=color;ctx.fill();}
  function fitText(value,width,startSize,minSize,weight=700){let size=startSize;while(size>minSize){font(size,weight);if(ctx.measureText(value).width<=width)break;size--;}return size;}
  function brandSymbol(img){
    const c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;const g=c.getContext('2d');g.drawImage(img,0,0);const data=g.getImageData(0,0,c.width,c.height).data;
    let left=c.width,top=c.height,right=-1,bottom=-1;
    for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){const i=(y*c.width+x)*4;if(data[i+3]>20&&data[i]>130&&data[i+1]>30&&data[i+2]<100){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}}
    return right<left?{img,x:0,y:0,w:c.width,h:c.height}:{img,x:left,y:top,w:right-left+1,h:bottom-top+1};
  }

  let item,resources,revision=0,downloads={},source;
  const back=new URL('./',location.href),params=new URLSearchParams(location.search);
  if(params.get('vendedor'))back.searchParams.set('vendedor',params.get('vendedor'));
  document.querySelector('.toolbar>a').href=CF_I18N.withLanguage(back).href;
  const socialNames=['tiktok','youtube','instagram','facebook'];
  function center(value,x,y,size,weight=400,family){font(size,weight,family);text(value,x-ctx.measureText(value).width/2,y,size,white,weight,family);}
  function badge(x,y,partner=false){
    ctx.save();ctx.translate(x,y);ctx.strokeStyle=orange;ctx.lineWidth=3;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.arc(0,0,38,0,Math.PI*2);ctx.stroke();
    if(!partner){ctx.beginPath();ctx.moveTo(0,-23);ctx.lineTo(20,-15);ctx.lineTo(18,7);ctx.quadraticCurveTo(14,20,0,26);ctx.quadraticCurveTo(-14,20,-18,7);ctx.lineTo(-20,-15);ctx.closePath();ctx.stroke();ctx.beginPath();ctx.moveTo(-10,1);ctx.lineTo(-2,9);ctx.lineTo(12,-8);ctx.stroke();}
    else{ctx.beginPath();ctx.moveTo(-27,-4);ctx.lineTo(-14,-17);ctx.lineTo(-4,-13);ctx.lineTo(6,-17);ctx.lineTo(27,-3);ctx.lineTo(13,14);ctx.lineTo(5,21);ctx.lineTo(-2,17);ctx.lineTo(-8,18);ctx.lineTo(-26,1);ctx.moveTo(-4,-13);ctx.lineTo(-12,-4);ctx.quadraticCurveTo(-9,3,-3,-1);ctx.lineTo(3,-6);ctx.lineTo(20,7);ctx.moveTo(1,9);ctx.lineTo(9,16);ctx.moveTo(-5,13);ctx.lineTo(2,19);ctx.stroke();}
    ctx.restore();
  }
  function draw(p,assets){
    const [brand,photoResult,icons]=assets,[cf,brazilian]=brand;
    canvas.width=2160;canvas.height=2700;ctx.setTransform(2,0,0,2,0,0);ctx.textBaseline='top';ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';rect(0,0,1080,1350,'#000');
    const title=clean(CF_I18N.t(p.nome)).toLocaleUpperCase(CF_I18N.locale),family='"CF Bebas Neue", sans-serif';
    let size=64,wrapped=lines(title,964,size,400,family);
    while((wrapped.length>3||wrapped.length*size*1.04>166)&&size>38){size-=2;wrapped=lines(title,964,size,400,family);}
    if(wrapped.length*size*1.04>270)throw new Error('O título deste item é muito extenso para o post.');
    const titleY=36;wrapped.forEach((line,i)=>center(line,540,titleY+i*size*1.04,size,400,family));
    const codeY=titleY+wrapped.length*size*1.04+12,codeSize=fitText(p.codigo,920,38,20);font(codeSize,700);text(p.codigo,(1080-ctx.measureText(p.codigo).width)/2,codeY,codeSize,orange,700);
    let heroY=codeY+codeSize+24;
    const application=clean(CF_I18N.t(p.aplicacao));let applicationSize=22,applicationLines=[],applicationTruncated=false;
    if(application){
      applicationLines=lines(application,950,applicationSize);
      while(applicationLines.length>3&&applicationSize>19){applicationSize--;applicationLines=lines(application,950,applicationSize);}
      if(applicationLines.length>3){applicationTruncated=true;applicationLines=applicationLines.slice(0,3);font(applicationSize);let last=applicationLines[2];while(last&&ctx.measureText(last+'…').width>950)last=last.slice(0,-1);applicationLines[2]=last+'…';}
      font(16,700);const label=CF_I18N.t('APLICAÇÃO');text(label,(1080-ctx.measureText(label).width)/2,heroY,16,orange,700);heroY+=25;
      applicationLines.forEach((line,i)=>center(line,540,heroY+i*applicationSize*1.23,applicationSize));heroY+=applicationLines.length*applicationSize*1.23+18;
    }
    const heroBottom=1155,heroHeight=heroBottom-heroY;
    let photoBounds=null;
    if(photoResult){const pic=softenBackground(photoResult.img),scale=Math.min(1008/pic.width,(heroHeight-12)/pic.height),w=pic.width*scale,h=pic.height*scale,x=(1080-w)/2,y=heroY+(heroHeight-h)/2;ctx.drawImage(pic,x,y,w,h);photoBounds={x,y,width:w,height:h};}
    else center(CF_I18N.t('FOTO INDISPONÍVEL'),540,heroY+heroHeight/2,28,700);
    rect(80,1175,920,1,'#292929');
    center(CF_I18N.t('QUALIDADE'),205,1196,19,400,family);
    ctx.save();ctx.translate(205,1244);ctx.scale(.63,.63);badge(0,0);ctx.restore();
    const manufacturerLabel=CF_I18N.t(p.familia==='Serviços'?'REALIZADO POR':'FABRICADO POR');center(manufacturerLabel,540,1197,15);
    const symbol=brandSymbol(cf),ratio=Math.min(34/symbol.w,38/symbol.h);font(20,800);const brandWidth=ctx.measureText('CF INDUSTRIAL').width,total=34+12+brandWidth,start=540-total/2;
    ctx.drawImage(cf,symbol.x,symbol.y,symbol.w,symbol.h,start,1227,symbol.w*ratio,symbol.h*ratio);text('CF INDUSTRIAL',start+46,1235,20,white,800);
    center(CF_I18N.t('PARCEIRO'),875,1197,15);
    const logoScale=Math.min(176/brazilian.naturalWidth,42/brazilian.naturalHeight),bw=brazilian.naturalWidth*logoScale,bh=brazilian.naturalHeight*logoScale;ctx.drawImage(brazilian,875-bw/2,1223+(42-bh)/2,bw,bh);
    const handle='@oficial.cfIndustrial   ·   @oficialbrazilian';
    let handleSize=25;font(handleSize);while(4*28+3*23+36+ctx.measureText(handle).width>950&&handleSize>20){handleSize--;font(handleSize);}
    const fullWidth=4*28+3*23+36+ctx.measureText(handle).width,left=(1080-fullWidth)/2;
    icons.forEach((img,i)=>ctx.drawImage(img,left+i*51,1293,28,28));text(handle,left+4*28+3*23+36,1294,handleSize,white);
    return {layout:{titleSize:size,titleY,titleLines:wrapped,application,applicationLines,applicationSize,applicationTruncated,heroY,heroHeight,photoBounds,footerY:1175,manufacturerLabel},photoLoaded:Boolean(photoResult),photoSource:photoResult?.url||'',width:2160,height:2700,format:'4:5',font:'Bebas Neue'};
  }
  function disabled(value){for(const id of ['download','download-jpg','print'])$(id).disabled=value;}
  // Legenda determinística: somente dados do item e links já cadastrados, sem IA.
  const captionLabels={
    'pt-BR':{title:'Legenda do post',help:'Texto pronto para copiar, com os dados do catálogo.',application:'Aplicação',catalog:'Conheça este item e outras soluções da CF Industrial:',price:'Valor',partner:'Comercialização pela Brazilian Imports, distribuidora oficial e exclusiva das ferramentas CF Industrial.',copy:'Copiar legenda',copied:'Legenda copiada.',manual:'Selecione e copie o texto acima.'},
    en:{title:'Post caption',help:'Ready to copy, using catalog information.',application:'Application',catalog:'Discover this item and other CF Industrial solutions:',price:'Price',partner:'Sold by Brazilian Imports, the official and exclusive distributor of CF Industrial tools.',copy:'Copy caption',copied:'Caption copied.',manual:'Select and copy the text above.'},
    es:{title:'Texto de la publicación',help:'Listo para copiar, con los datos del catálogo.',application:'Aplicación',catalog:'Conozca este artículo y otras soluciones de CF Industrial:',price:'Precio',partner:'Comercialización por Brazilian Imports, distribuidora oficial y exclusiva de las herramientas CF Industrial.',copy:'Copiar texto',copied:'Texto copiado.',manual:'Seleccione y copie el texto de arriba.'}
  };
  const captionHashtags='#cfindustrial #brazilianimports #cambioautomatico #automatictransmission #transmissiontools #transmissionrepair #valvebody';
  function captionUI(){return captionLabels[CF_I18N.language]||captionLabels['pt-BR'];}
  function updateCaption(){
    const ui=captionUI(),name=clean(CF_I18N.t(item.nome)),description=clean(CF_I18N.t(item.descricao)),application=clean(CF_I18N.t(item.aplicacao));
    const blocks=[[clean(item.codigo),name].filter(Boolean).join(' — ')];
    if(description)blocks.push(description);
    if(application)blocks.push(ui.application+': '+application);
    blocks.push(ui.catalog+'\nhttps://www.cfindustrial.com.br/catalogo/');
    const storeURL=window.CF_STORE?.urlFor(item.codigo);
    if(storeURL)blocks.push(ui.price+': '+storeURL);
    blocks.push(ui.partner,captionHashtags);
    $('caption').value=blocks.join('\n\n');
    $('caption-title').textContent=ui.title;$('caption-help').textContent=ui.help;$('copy-caption').textContent=ui.copy;$('caption-status').textContent='';$('caption-panel').hidden=false;
  }
  $('copy-caption').onclick=async()=>{
    const value=$('caption').value,ui=captionUI();
    try{await navigator.clipboard.writeText(value);$('caption-status').textContent=ui.copied;}
    catch{
      $('caption').focus();$('caption').select();
      let copied=false;try{copied=document.execCommand('copy');}catch{}
      $('caption-status').textContent=copied?ui.copied:ui.manual;
    }
  };
  async function generate(){
    updateCaption();
    const ticket=++revision;disabled(true);window.CF_POST={ready:false};$('message').textContent=CF_I18N.t('Preparando o post…');
    try{
      const assets=await(resources||(resources=Promise.all([logos(),photo(item),Promise.all(socialNames.map(icon))])));await loadTitleFont();if(ticket!==revision)return;
      const metadata=draw(item,assets),[png,jpg]=await Promise.all([new Promise(r=>canvas.toBlob(r,'image/png')),new Promise(r=>canvas.toBlob(r,'image/jpeg',.98))]);
      if(ticket!==revision)return;if(!png||!jpg)throw new Error('Não foi possível preparar a imagem para download.');
      const next={png:URL.createObjectURL(png),jpg:URL.createObjectURL(jpg)};
      for(const url of Object.values(downloads))URL.revokeObjectURL(url);downloads=next;
      $('poster').src=next.png;$('poster').alt=item.codigo+' — '+CF_I18N.t(item.nome)+'. '+(item.aplicacao?CF_I18N.t('APLICAÇÃO')+': '+CF_I18N.t(item.aplicacao)+'. ':'')+metadata.layout.manufacturerLabel+' CF Industrial. '+CF_I18N.t('QUALIDADE')+'. '+CF_I18N.t('PARCEIRO')+' Brazilian. @oficial.cfIndustrial e @oficialbrazilian.';
      await $('poster').decode();if(ticket!==revision)return;$('poster').hidden=false;
      $('message').textContent=CF_I18N.t(metadata.photoLoaded?'Post pronto para baixar.':'Post pronto, mas a foto não pôde ser carregada. Confira o acesso público da imagem.');$('message').classList.toggle('warning',!metadata.photoLoaded);
      $('item-label').textContent=item.codigo+' · '+CF_I18N.t(item.nome);document.title=item.codigo+' — '+CF_I18N.t('Post CF Industrial');
      window.CF_POST={ready:true,item,source,language:CF_I18N.language,...metadata};disabled(false);
    }catch(e){if(ticket!==revision)return;$('message').textContent=CF_I18N.t(e.message);$('message').classList.add('warning');window.CF_POST={ready:false,error:e.message};}
  }
  function download(format){if(!window.CF_POST?.ready)return;const a=document.createElement('a');a.href=downloads[format];a.download='CF-Industrial-'+clean(item.codigo).replace(/[^a-zA-Z0-9_-]/g,'_')+'-post.'+(format==='jpg'?'jpg':'png');document.body.append(a);a.click();a.remove();}
  $('download').onclick=()=>download('png');$('download-jpg').onclick=()=>download('jpg');$('print').onclick=()=>window.print();
  document.addEventListener('cf:languagechange',()=>{if(item)generate();});
  window.addEventListener('pagehide',()=>{for(const url of Object.values(downloads))URL.revokeObjectURL(url);});
  (async()=>{try{const result=await product();item=result.item;source=result.source;await generate();}catch(e){$('message').textContent=CF_I18N.t(e.message);$('message').classList.add('warning');window.CF_POST={ready:false,error:e.message};}})();
})();

