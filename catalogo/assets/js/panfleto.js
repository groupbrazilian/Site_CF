(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const canvas = $('renderer');
  const ctx = canvas.getContext('2d');
  const orange = '#ff6500';
  const white = '#ffffff';

  let item, posterURL;

  const paper = {
    width: 1748,
    height: 2480,
    stageWidth: 1080
  };

  // Ajustes principais da composição.
  const layout = {
    titleSize: 60,
    titleY: 158,
    titleMaxHeight: 138,
    footerHeight: 140,
    detailSize: 27,
    photoPadding: 12,
    imageWidth: 554,
    gap: 20,
    margin: 36
  };

  const contacts = CF_CONFIG.CONTACTS;

  let contact =
    contacts.find(c =>
      c.id === new URLSearchParams(location.search).get('contato')
    ) ||
    contacts.find(c => c.phone === CF_CONFIG.WHATSAPP) ||
    contacts[0];

  const clean = v => v == null ? '' : String(v).trim();

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
        'Abra o botão Panfleto no item desejado do catálogo.'
      );
    }

    try {
      const saved = JSON.parse(
        localStorage.getItem('cf-panfleto:' + code)
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
  function panelIcon(kind,x,y){
    ctx.save();ctx.translate(x,y);ctx.strokeStyle=orange;ctx.fillStyle=orange;ctx.lineWidth=3.5;ctx.lineJoin='round';
    if(kind==='gear'){ctx.beginPath();for(let i=0;i<48;i++){const a=i*Math.PI/24,r=(i%4===0||i%4===3)?23:18;const px=25+Math.cos(a)*r,py=25+Math.sin(a)*r;i?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.closePath();ctx.fill();ctx.beginPath();ctx.arc(25,25,10,0,Math.PI*2);ctx.fillStyle='#000';ctx.fill();}
    else{ctx.beginPath();ctx.moveTo(10,1);ctx.lineTo(34,1);ctx.lineTo(44,12);ctx.lineTo(44,49);ctx.lineTo(10,49);ctx.closePath();ctx.stroke();ctx.beginPath();ctx.moveTo(32,2);ctx.lineTo(32,14);ctx.lineTo(43,14);ctx.moveTo(17,24);ctx.lineTo(37,24);ctx.moveTo(17,32);ctx.lineTo(37,32);ctx.moveTo(17,40);ctx.lineTo(37,40);ctx.stroke();}
    ctx.restore();
  }
  function personIcon(x,y){ctx.save();ctx.translate(x,y);ctx.strokeStyle=orange;ctx.lineWidth=3;ctx.beginPath();ctx.arc(24,16,14,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(0,68);ctx.bezierCurveTo(0,30,48,30,48,68);ctx.closePath();ctx.stroke();ctx.restore();}

  async function printDensity(blob) {
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const view = new DataView(bytes.buffer);

    let offset = 8;

    while (offset + 12 <= bytes.length) {
      const length = view.getUint32(offset);
      const type = String.fromCharCode(
        ...bytes.slice(offset + 4, offset + 8)
      );

      if (type === 'pHYs') break;
      offset += length + 12;
    }

    const chunk = new Uint8Array(21);
    const metadata = new DataView(chunk.buffer);

    metadata.setUint32(0, 9);
    chunk.set([112, 72, 89, 115], 4);
    metadata.setUint32(8, 11811);
    metadata.setUint32(12, 11811);
    chunk[16] = 1;

    let crc = 0xffffffff;

    for (let i = 4; i < 17; i++) {
      crc ^= chunk[i];

      for (let bit = 0; bit < 8; bit++) {
        crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
      }
    }

    metadata.setUint32(17, (crc ^ 0xffffffff) >>> 0);

    if (offset + 21 <= bytes.length) {
      bytes.set(chunk, offset);
      return new Blob([bytes], { type: 'image/png' });
    }

    const output = new Uint8Array(bytes.length + 21);
    output.set(bytes.slice(0, 33));
    output.set(chunk, 33);
    output.set(bytes.slice(33), 54);

    return new Blob([output], { type: 'image/png' });
  }

  async function render(p) {
    const [brand,photoResult,...icons]=await Promise.all([logos(),photo(p),...Object.keys(symbols).map(icon)]);
    await loadTitleFont();
    const [cf,brazilian]=brand,titleFamily='"CF Bebas Neue", sans-serif';
    const title=clean(p.nome).toLocaleUpperCase('pt-BR');
    let titleSize=layout.titleSize,titleLines=lines(title,1008,titleSize,400,titleFamily);
    while(titleLines.length*titleSize*1.12>layout.titleMaxHeight&&titleSize>34){titleSize-=2;titleLines=lines(title,1008,titleSize,400,titleFamily);}
    if(titleLines.length*titleSize*1.12>layout.titleMaxHeight)throw new Error('O nome deste item é muito extenso para o panfleto A5. Revise o nome na base antes de gerar a arte.');
    const scale=paper.width/paper.stageWidth,stageHeight=paper.height/scale;
    const footerY=stageHeight-layout.footerHeight,contactY=footerY-138;
    const heroY=Math.max(306,layout.titleY+titleLines.length*titleSize*1.12+28),bodyBottom=contactY-20,heroHeight=bodyBottom-heroY;
    const photoX=layout.margin,photoWidth=layout.imageWidth,panelX=photoX+photoWidth+layout.gap,panelWidth=1080-layout.margin-panelX;
    const blocks=[];
    if(clean(p.aplicacao))blocks.push({label:'APLICAÇÃO',value:p.aplicacao,icon:'gear'});
    if(clean(p.descricao)&&!p.nome_por_descricao)blocks.push({label:'DESCRIÇÃO TÉCNICA',value:p.descricao,icon:'document'});
    if(!blocks.length&&p.categoria_preenchida)blocks.push({label:'CATEGORIA',value:p.categoria,icon:'gear'});
    const panelGap=16,panelTextWidth=panelWidth-64,availableHeight=heroHeight-Math.max(0,blocks.length-1)*panelGap;
    let detailSize=layout.detailSize,needed=0;
    do{needed=0;for(const b of blocks){b.lines=lines(b.value,panelTextWidth,detailSize);b.minHeight=116+b.lines.length*detailSize*1.28+28;needed+=b.minHeight;}if(needed<=availableHeight||detailSize===22)break;detailSize--;}while(true);
    if(needed>availableHeight)throw new Error('As informações deste item são extensas demais para as caixas do panfleto A5. Revise os textos na base; nenhum conteúdo foi cortado.');
    canvas.width=paper.width;canvas.height=paper.height;ctx.scale(scale,scale);ctx.textBaseline='top';rect(0,0,1080,stageHeight,orange);
    rect(0,0,1080,138,'#000');
    const symbol=brandSymbol(cf),symbolScale=Math.min(80/symbol.w,82/symbol.h);
    ctx.drawImage(cf,symbol.x,symbol.y,symbol.w,symbol.h,52,30,symbol.w*symbolScale,symbol.h*symbolScale);
    text('CF INDUSTRIAL',176,27,50,white,800);text('PRECISÃO PARA TRANSMISSÕES AUTOMÁTICAS',178,94,16,white);
    rect(685,35,2,73,orange);text('CÓDIGO',710,43,12,white);text(p.codigo,710,63,fitText(p.codigo,298,40,18,800),white,800);
    titleLines.forEach((line,i)=>{font(titleSize,400,titleFamily);text(line,(1080-ctx.measureText(line).width)/2,layout.titleY+i*titleSize*1.12,titleSize,white,400,titleFamily);});
    let photoBounds=null;
    if(photoResult){const pic=softenBackground(photoResult.img),padding=layout.photoPadding,ratio=Math.min((photoWidth-padding*2)/pic.width,(heroHeight-padding*2)/pic.height),w=pic.width*ratio,h=pic.height*ratio,x=photoX+(photoWidth-w)/2,y=heroY+(heroHeight-h)/2;ctx.save();ctx.beginPath();ctx.roundRect(x,y,w,h,26);ctx.clip();ctx.drawImage(pic,x,y,w,h);ctx.restore();photoBounds={x,y,width:w,height:h};}
    else{rounded(photoX,heroY,photoWidth,heroHeight,26,'#000');text('FOTO INDISPONÍVEL',photoX+60,heroY+heroHeight/2,25,white,700);}
    let panelY=heroY;
    for(let i=0;i<blocks.length;i++){const b=blocks[i],extra=availableHeight-needed,weight=blocks.length===1?1:(i===0?.42:.58),height=b.minHeight+extra*weight;rounded(panelX,panelY,panelWidth,height,28,'#000');panelIcon(b.icon,panelX+30,panelY+29);text(b.label,panelX+108,panelY+43,fitText(b.label,panelWidth-138,23,18),orange,700);rect(panelX+108,panelY+86,panelWidth-138,3,orange);multiline(b.lines,panelX+32,panelY+116,detailSize,white,400,1.28);panelY+=height+panelGap;}
    rounded(36,contactY,1008,118,25,'#000');ctx.drawImage(icons[0],66,contactY+20,78,78);rect(184,contactY+20,2,78,orange);
    const number=clean(contact.phone).replace(/^55/,''),display=number.length===11?`(${number.slice(0,2)}) ${number.slice(2,7)}-${number.slice(7)}`:contact.phone;
    text(display,216,contactY+35,fitText(display,470,46,30,800),white,800);text('W H A T S A P P',218,contactY+88,11,white);
    rect(710,contactY+20,1,78,orange);personIcon(740,contactY+24);text(contact.name.toLocaleUpperCase('pt-BR'),810,contactY+29,fitText(contact.name.toLocaleUpperCase('pt-BR'),212,30,16),white,700);text(contact.region.toLocaleUpperCase('pt-BR'),810,contactY+70,fitText(contact.region.toLocaleUpperCase('pt-BR'),212,19,14,400),white);
    rect(0,footerY,1080,layout.footerHeight,'#000');text('www.cfindustrial.com.br',36,footerY+55,24,white);rect(386,footerY+35,1,72,orange);
    icons.slice(1).forEach((img,i)=>ctx.drawImage(img,433+i*50,footerY+35,27,27));const handle='@oficial.cfindustrial';font(20);text(handle,532-ctx.measureText(handle).width/2,footerY+80,20,white);
    rect(681,footerY+35,1,72,orange);text('DISTRIBUIDOR',707,footerY+51,13,white);text('OFICIAL',707,footerY+72,13,white);
    const logoScale=Math.min(210/brazilian.naturalWidth,76/brazilian.naturalHeight),logoWidth=brazilian.naturalWidth*logoScale,logoHeight=brazilian.naturalHeight*logoScale;ctx.drawImage(brazilian,829+(210-logoWidth)/2,footerY+34+(76-logoHeight)/2,logoWidth,logoHeight);
    const rawBlob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!rawBlob)throw new Error('Não foi possível preparar a imagem para download.');const blob=await printDensity(rawBlob);posterURL=URL.createObjectURL(blob);$('poster').src=posterURL;
    $('poster').alt=`${p.codigo} — ${p.nome}. ${blocks.map(b=>b.label+': '+b.value).join(' ')}. CF Industrial, ${contact.name}, WhatsApp ${display}, www.cfindustrial.com.br, @oficial.cfindustrial. Distribuidor oficial Brazilian Imports.`;
    await $('poster').decode();$('poster').hidden=false;
    return {contact,layout:{heroY,heroHeight,detailY:heroY,footerY,panelWidth,photoBounds,titleSize,detailSize},font:'Bebas Neue',photoSource:photoResult?.url||'',photoLoaded:Boolean(photoResult),width:canvas.width,height:canvas.height,paper:'A5',printWidthMM:148,printHeightMM:210};
  }


  $('download').onclick = () => {
    const a = document.createElement('a');
    a.href = posterURL;
    a.download =
      'CF-Industrial-' +
      clean(item.codigo).replace(/[^a-zA-Z0-9_-]/g, '_') +
      '-panfleto.png';

    document.body.append(a);
    a.click();
    a.remove();
  };

  $('print').onclick = () => window.print();

  // Seletor do contato.
  const contactLabel = document.createElement('label');
  contactLabel.className = 'contact-picker';
  contactLabel.textContent = 'Contato do panfleto ';

  const contactSelect = document.createElement('select');
  contactSelect.id = 'flyer-contact';
  contactSelect.setAttribute('aria-label', 'Contato do panfleto');

  for (const entry of contacts) {
    const option = document.createElement('option');
    option.value = entry.id;
    option.textContent = entry.name + ' · ' + entry.region;
    contactSelect.append(option);
  }

  contactSelect.value = contact.id;
  contactSelect.disabled = true;
  contactLabel.append(contactSelect);

  document.querySelector('.toolbar').insertBefore(
    contactLabel,
    document.querySelector('.toolbar>div')
  );

  contactSelect.onchange = async () => {
    contact = contacts.find(c => c.id === contactSelect.value);

    const url = new URL(location.href);
    url.searchParams.set('contato', contact.id);
    history.replaceState(null, '', url);

    $('download').disabled = true;
    $('print').disabled = true;
    contactSelect.disabled = true;

    try {
      const previousURL = posterURL;
      const rendered = await render(item);

      if (previousURL) URL.revokeObjectURL(previousURL);

      window.CF_FLYER = {
        ...window.CF_FLYER,
        ...rendered,
        ready: true
      };

      $('download').disabled = false;
      $('print').disabled = false;
    } catch (e) {
      $('message').textContent = e.message;
      window.CF_FLYER = { ready: false, error: e.message };
    } finally {
      contactSelect.disabled = false;
    }
  };

  const waitForContact = setInterval(() => {
    if (window.CF_FLYER) {
      clearInterval(waitForContact);
      contactSelect.disabled = !window.CF_FLYER.ready;
    }
  }, 100);

  // Carregamento inicial.
  (async () => {
    try {
      const result = await product();
      item = result.item;

      document.title = item.codigo + ' — Panfleto A5 CF Industrial';
      $('item-label').textContent = item.codigo + ' · ' + item.nome;

      const rendered = await render(item);

      $('download').disabled = false;
      $('print').disabled = false;

      $('message').textContent = rendered.photoLoaded
        ? 'Panfleto A5 pronto (148 × 210 mm). PNG: 1748 × 2480 px. Na impressão, escolha A5; se usar A4, mantenha escala 100% para imprimir no tamanho A5.'
        : 'A foto não pôde ser carregada ou não foi informada na base. O panfleto A5 indica foto indisponível. Confira o acesso público da imagem.';

      $('message').classList.toggle(
        'warning',
        !rendered.photoLoaded
      );

      window.CF_FLYER = {
        ready: true,
        item,
        source: result.source,
        ...rendered
      };
    } catch (e) {
      const message = e.name === 'SecurityError'
        ? 'O navegador bloqueou a exportação de uma imagem. Abra pelo endereço http://127.0.0.1:4173/catalogo/ e tente novamente.'
        : e.message;

      $('message').textContent = message;
      $('message').classList.add('warning');
      window.CF_FLYER = { ready: false, error: message };
    }
  })();
})();
