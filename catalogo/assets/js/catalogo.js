(() => {
  const $ = selector => document.querySelector(selector);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fold = CF_API.fold;
  const families = ['Ferramentas', 'Componentes', 'Máquinas', 'Serviços'];
  let products = [], demo = CF_CONFIG.USE_MOCK_DATA, lastFocus;
  let deepLinkHandled = false;
  let printBalanced = false;
  const qrCache = new Map();
  const sellerContext=CF_CONTACTS.resolve(),seller=sellerContext.selected;
  const messageFor=p=>p?`Olá, gostaria de informações sobre ${p.familia === 'Serviços' ? 'o serviço' : p.familia === 'Máquinas' ? 'a máquina' : p.familia === 'Componentes' ? 'o componente' : 'a ferramenta'} ${p.codigo} – ${p.nome}.`:'Olá, gostaria de solicitar uma análise ou orçamento.';
  const whatsapp=(p,c=seller||CF_CONTACTS.primary)=>c?CF_CONTACTS.whatsapp(c,messageFor(p)):'#contato';
  const digitalURL=p=>{const url=CF_CONTACTS.catalogURL(seller);url.searchParams.set('produto',p.codigo);return url.href;};
  const flyerLink=p=>{const url=new URL('panfleto.html',location.href);url.searchParams.set('produto',p.codigo);if(seller){url.searchParams.set('vendedor',seller.id);url.searchParams.set('contato',seller.id);}return `<a class="flyer-link" data-flyer="${p.id}" href="${esc(url.href)}" target="_blank" rel="noopener">Panfleto ↗</a>`;};
  function chooseSeller(link,kind,p,baseURL){
    let picker=$('#flyer-contacts');if(!picker){picker=document.createElement('dialog');picker.id='flyer-contacts';document.body.append(picker);}
    picker.innerHTML=`<button class="close" aria-label="Fechar escolha de vendedor">×</button><h2>${kind==='flyer'?'Qual vendedor vai no panfleto?':'Com qual vendedor deseja falar?'}</h2><p>${p?esc(p.codigo+' · '+p.nome):'Escolha o atendimento da CF Industrial.'}</p><div class="flyer-contact-options">${CF_CONTACTS.list.map(c=>{const url=kind==='flyer'?new URL(baseURL):new URL(whatsapp(p,c));if(kind==='flyer')url.searchParams.set('contato',c.id);return `<a class="button" target="_blank" rel="noopener" href="${esc(url.href)}"><strong>${esc(c.name)}</strong><span>${esc(c.region)} · ${esc(CF_CONTACTS.format(c))}</span>${c.id===CF_CONTACTS.primary?.id?'<small>Contato principal</small>':''}</a>`;}).join('')||'<p>Nenhum vendedor disponível no momento.</p>'}</div>`;
    picker.querySelector('.close').onclick=()=>picker.close();picker.querySelectorAll('a').forEach(a=>a.onclick=()=>picker.close());picker.addEventListener('close',()=>link.focus(),{once:true});picker.showModal();
  }
  document.addEventListener('click',e=>{
    const inquiry=e.target.closest('[data-consult]');
    if(inquiry){if(seller)return;e.preventDefault();const p=products.find(p=>p.id===Number(inquiry.dataset.consult));chooseSeller(inquiry,'consult',p);return;}
    const link=e.target.closest('[data-flyer]');if(!link)return;
    const p=products.find(p=>p.id===Number(link.dataset.flyer));if(!p)return;
    const token=Date.now().toString(36),url=new URL(link.href),selected=link.closest('#detail')?.querySelector('.detail-main')?.src;
    const item={codigo:p.codigo,nome:p.nome,familia:p.familia,categoria:p.categoria,categoria_preenchida:p.categoria_preenchida,descricao:p.descricao,nome_por_descricao:p.nome_por_descricao,aplicacao:p.aplicacao,imagem:p.imagem,imagem_grande:selected&&!selected.includes('placeholder.svg')?selected:p.imagem_grande,imagens:p.imagens};
    try{localStorage.setItem('cf-panfleto:'+p.codigo,JSON.stringify({token,createdAt:Date.now(),item}));url.searchParams.set('ref',token);}catch{}
    if(seller){link.href=url.href;return;}
    e.preventDefault();chooseSeller(link,'flyer',p,url);
  });
  const footer = (label, number) => `<footer class="folio"><span>CF INDUSTRIAL / ${esc(label)}</span><span>CATÁLOGO TÉCNICO</span><span>${String(number).padStart(2,'0')}</span></footer>`;
  const context = (family,category) => `<span class="section-context"><strong>${esc(family)}</strong>${category && category !== 'Sem categoria' ? '<span class="context-slash">/</span><span class="context-category">'+esc(category)+'</span>' : ''}</span>`;
  const running = (family,category) => `<div class="running product-running"><div class="running-brand"><img src="assets/img/logo-cf-industrial.png" alt="CF"><span>CF INDUSTRIAL <small>CATÁLOGO TÉCNICO</small></span></div>${context(family,category)}</div>`;
  const cta = p => ({Ferramentas:'Consultar ferramenta',Componentes:'Consultar componente','Máquinas':'Solicitar proposta da máquina','Serviços':'Solicitar orçamento do serviço'})[p.familia] || 'Solicitar orçamento';
  function stockHTML(p,detail=false) {
    const entries=[['PR','Paraná',p.estoque_pr,p.estoque_pr_preenchido],['SC','Santa Catarina',p.estoque_sc,p.estoque_sc_preenchido]].filter(e=>p.familia!=='Serviços'||e[3]);
    if(!entries.length)return '';
    return detail ? entries.map(e=>`<dt>Estoque ${e[1]}</dt><dd>${esc(e[2])}</dd>`).join('') : `<div class="stock">${entries.map(e=>'<span>Estoque '+e[0]+' · '+esc(e[2])+'</span>').join('')}</div>`;
  }
  function picture(url, name, cls = '') {const urls=(Array.isArray(url)?url:[url]).filter(Boolean);return `<img class="${cls}" src="${esc(urls[0] || CF_CONFIG.PLACEHOLDER)}" data-image-urls="${esc(JSON.stringify(urls))}" data-image-index="0" alt="${esc(name)}" loading="lazy" decoding="async">`;}
  function wireImages(root) {root.querySelectorAll('img').forEach(img => {img.onerror=()=>{const urls=JSON.parse(img.dataset.imageUrls||'[]'),next=Number(img.dataset.imageIndex||0)+1;img.dataset.imageIndex=next;if(next<urls.length)img.src=urls[next];else {img.onerror=null;img.src=CF_CONFIG.PLACEHOLDER;}};if(img.complete&&!img.naturalWidth)img.onerror();});}
  function categoryId(t, c) {return 'categoria-' + products.find(p => p.familia === t && p.categoria === c)?.id;}
  function active() {return products.filter(p => fold(p.status) !== 'inativo');}
  function categoryOpening(t,c,group,number) {
    const photos = group.filter(p=>p.imagem).slice(0,4);
    const tiles = photos.map(p=>`<figure>${picture(CF_API.imageURLs(p),p.nome)}<figcaption>${esc(p.codigo)}</figcaption></figure>`).join('');
    return `<section id="${categoryId(t,c)}" class="sheet category-divider category-editorial"><div class="running">${context(t,c)}<span>${group.length} ITENS</span></div><div class="category-band"><span>CF INDUSTRIAL / ${esc(t)}</span></div><p class="eyebrow">PRECISÃO POR ESPECIALIDADE</p><h2>${esc(c)}<span class="orange">.</span></h2><div class="category-mosaic${photos.length <= 1 ? ' mosaic-single' : ''}">${tiles || `<figure>${picture(CF_CONFIG.PLACEHOLDER,c)}<figcaption>CF INDUSTRIAL</figcaption></figure>`}</div><div class="category-bottom"><span>${group.length} ${group.length === 1 ? 'item' : 'itens'} nesta coleção</span><span>ESPECIFICAÇÕES · APLICAÇÕES · SOLUÇÕES</span></div>${footer(c,number)}</section>`;
  }
  function allFamilies() {return [...families, ...new Set(products.map(p=>p.familia).filter(f=>!families.includes(f)))];}
  function buildIndex() {
    $('#index-content').innerHTML = allFamilies().map((t, i) => {
      const items = active().filter(p => p.familia === t); const cats = [...new Set(items.map(p => p.categoria))];
      return `<div class="index-entry"><a class="index-main" href="#tipo-${i}"><span class="index-number">0${i+1}</span><h3>${esc(t)}</h3><span>${items.length} itens ↗</span></a><div class="index-categories">${cats.map(c => `<a href="#${categoryId(t,c)}" data-index-type="${esc(t)}">${esc(c)} <span>→</span></a>`).join('') || '<p class="muted">Nenhum item disponível na base.</p>'}</div></div>`;
    }).join('') + `<div class="index-entry"><a class="index-main" href="#contato"><span class="index-number">${String(allFamilies().length+1).padStart(2,'0')}</span><h3>Contato</h3><span>Atendimento técnico ↗</span></a></div>`;
    $('#index-content').querySelectorAll('a').forEach(a => a.addEventListener('click', () => {resetFilters(); render();}));
  }
  function options() {
    const current = $('#category').value; const type = $('#type').value;
    const cats = [...new Set(products.filter(p => !type || p.familia === type).map(p => p.categoria))].sort((a,b) => a.localeCompare(b,'pt-BR'));
    $('#category').innerHTML = '<option value="">Todas as categorias</option>' + cats.map(c => `<option>${esc(c)}</option>`).join('');
    if (cats.includes(current)) $('#category').value = current;
  }
  function productHTML(p) {
    const multiple = p.quantidade_imagens >= 2;
    const wide = multiple || p.familia === 'Máquinas' || p.familia === 'Serviços';
    const count = Math.max(p.quantidade_imagens, p.imagens.length);
    const urls = [CF_API.imageURLs(p)];
    if (multiple) urls.push([p.imagens[1]?.thumbnail,p.imagens[1]?.url,p.imagens[1]?.url_original].filter(Boolean));
    return `<article class="product ${multiple ? 'ferramenta-multipla' : 'ferramenta-simples'}${wide ? ' product-wide' : ''}" data-code="${esc(p.codigo)}"><div class="product-photos">${urls.map((url, i) => `<div class="product-image" data-detail="${p.id}" role="img" aria-label="${esc(p.nome)} — foto ${i+1}">${picture(url, `${p.nome} — foto ${i+1}`)}</div>`).join('')}${count > 2 ? `<span class="extra-photos">+ ${count - 2} ${count - 2 === 1 ? 'foto' : 'fotos'}</span>` : ''}</div><div class="product-copy"><div class="product-meta"><span class="code">${esc(p.codigo)}</span>${fold(p.status) !== 'ativo' ? `<span class="status">${esc(p.status)}</span>` : ''}</div><h3 class="product-name">${esc(p.nome)}</h3>${p.categoria_preenchida ? `<p class="category-label">${esc(p.categoria)}</p>` : ''}${p.aplicacao ? `<div class="technical"><h4>Aplicação</h4><p>${esc(p.aplicacao)}</p></div>` : ''}${p.descricao && !p.nome_por_descricao ? `<div class="technical description"><h4>Descrição técnica</h4><p>${esc(p.descricao)}</p></div>` : ''}${stockHTML(p)}<div class="product-actions"><button class="detail-link" data-detail="${p.id}">Ver detalhes +</button>${flyerLink(p)}<a class="quote" data-consult="${p.id}" href="${esc(whatsapp(p))}" target="_blank" rel="noopener">${esc(cta(p))} ↗</a></div><a class="print-qr" data-qr-url="${esc(digitalURL(p))}" href="${esc(digitalURL(p))}"><span class="qr-symbol"></span><span>Ver produto digital<br><small>Mais imagens e informações</small></span></a></div></article>`;
  }
  function paginate(group) {
    const capacity = Math.max(2, Math.floor(Number(CF_CONFIG.PRODUCTS_PER_PAGE) / 2) * 2 || 6);
    const pages = []; let current = [], used = 0, unpaired = false;
    for (const p of group) {
      const wide = p.quantidade_imagens >= 2 || p.familia === 'Máquinas' || p.familia === 'Serviços';
      // Two wide items or six simple items fit a sheet when text permits.
      // Track unmatched half-width items independently of the space budget.
      const cost = wide ? 3 : 1;
      const gap = wide && unpaired ? 1 : 0;
      if (current.length && used + gap + cost > capacity) { pages.push(current); current = []; used = 0; unpaired = false; }
      if (wide && unpaired) used++;
      current.push(p); used += cost; unpaired = wide ? false : !unpaired;
    }
    if (current.length) pages.push(current);
    return pages;
  }
  function render() {
    printBalanced = false;
    const q = fold($('#search').value), type = $('#type').value, cat = $('#category').value, status = $('#status').value;
    const filtered = products.filter(p => (status ? p.status === status : fold(p.status) !== 'inativo') && (!type || p.familia === type) && (!cat || p.categoria === cat) && (!q || fold([p.codigo,p.nome,p.aplicacao,p.categoria,p.familia,p.status].join(' ')).includes(q)));
    $('#result-count').textContent = `${filtered.length} ${filtered.length === 1 ? 'item' : 'itens'}${demo ? ' · demonstração' : ''}`;
    let page = 3, html = '';
    allFamilies().forEach((t, ti) => {
      const items = filtered.filter(p => p.familia === t);
      if (!items.length && (q || type || cat || status)) return;
      html += `<section id="tipo-${ti}" class="sheet divider"><div class="running">${context(t)}<span>CF INDUSTRIAL</span></div><p class="eyebrow">CATÁLOGO / ${String(ti+1).padStart(2,'0')}</p><h2>${esc(t)}<span class="orange">.</span></h2><p class="intro">${items.length ? `${items.length} itens para consulta técnica.` : 'Os itens desta seção aparecerão quando estiverem disponíveis na base.'}</p><div class="divider-visual">${picture(items.find(p => p.imagem)?.imagem || 'assets/img/usinagem.jpg', `Referência técnica — ${t}`)}</div>${footer(t,page++)}</section>`;
      [...new Set(items.map(p => p.categoria))].forEach(c => {
        const group = items.filter(p => p.categoria === c);
        if (c !== 'Sem categoria') {
          html += categoryOpening(t,c,group,page++);
        }
        const pages = paginate(group);
        for (let i = 0; i < pages.length; i++) {
          const id = c === 'Sem categoria' && i === 0 ? ` id="${categoryId(t,c)}"` : '';
          html += `<section${id} class="sheet product-page" data-section="${esc(t)}" data-category="${esc(c)}">${running(t,c)}<div class="product-grid">${pages[i].map(productHTML).join('')}</div>${footer(c,page++)}</section>`;
        }
      });
    });
    $('#colecao').innerHTML = filtered.length || !(q || type || cat || status) ? html : '<div class="empty"><h3>Nenhum item encontrado.</h3><p>Tente outro termo ou limpe os filtros.</p></div>';
    $('.last-page').textContent = String(page).padStart(2,'0');
    wireImages($('#colecao'));
    $('#colecao').querySelectorAll('[data-detail]').forEach(b => b.addEventListener('click', () => openDetail(Number(b.dataset.detail))));
  }
  function openDetail(id) {
    const p = products.find(p => p.id === id); if (!p) return;
    const gallery = p.imagens.length ? p.imagens.map((img,i) => ({...img, urls:i===0?CF_API.imageURLs(p,true):[img.url,img.thumbnail,img.url_original].filter(Boolean), url: i === 0 ? p.imagem_grande || img.url : img.url})) : [{url:p.imagem_grande || p.imagem,urls:CF_API.imageURLs(p,true), thumbnail:p.imagem, nome:p.nome}].filter(img=>img.url);
    if (!gallery.length) gallery.push({url:CF_CONFIG.PLACEHOLDER,nome:p.nome});
    lastFocus = document.activeElement;
    $('#detail-content').innerHTML = `<div class="detail-gallery"><button id="zoom" aria-label="Ampliar imagem">${picture(gallery[0].url,p.nome,'detail-main')}</button><div class="gallery-controls"><button id="prev" aria-label="Imagem anterior">←</button><span id="gallery-count"></span><button id="next" aria-label="Próxima imagem">→</button></div><div class="thumbnails">${gallery.map((img,i) => `<button data-photo="${i}" aria-label="Imagem ${i+1}" aria-pressed="${i===0}">${picture([img.thumbnail,img.url,img.url_original].filter(Boolean),img.nome || p.nome)}</button>`).join('')}</div><p class="muted">Clique na imagem para ampliar.</p></div><div class="detail-copy"><p class="eyebrow">${esc(p.familia)}${p.categoria_preenchida ? ' / ' + esc(p.categoria) : ''}</p><p class="code">${esc(p.codigo)}</p><h2 id="detail-title">${esc(p.nome)}</h2><p class="status">${esc(p.status)}</p><dl>${p.aplicacao ? `<dt>Aplicação</dt><dd>${esc(p.aplicacao)}</dd>` : ''}${p.descricao && !p.nome_por_descricao ? `<dt>Descrição técnica</dt><dd>${esc(p.descricao)}</dd>` : ''}${stockHTML(p,true)}</dl><a class="button primary" data-consult="${p.id}" href="${esc(whatsapp(p))}" target="_blank" rel="noopener">${esc(cta(p))} pelo WhatsApp ↗</a><div class="detail-flyer-action">${flyerLink(p)}</div></div>`;
    let index = 0;
    const select = i => {index = (i + gallery.length) % gallery.length; const img=$('.detail-main'),urls=gallery[index].urls||[gallery[index].url];img.dataset.imageUrls=JSON.stringify(urls);img.dataset.imageIndex='0';img.src=urls[0];wireImages($('#zoom'));$('#gallery-count').textContent = `${index+1} / ${gallery.length}`; document.querySelectorAll('[data-photo]').forEach(b => b.setAttribute('aria-pressed',Number(b.dataset.photo) === index));};
    $('#prev').onclick = () => select(index-1); $('#next').onclick = () => select(index+1);
    document.querySelectorAll('[data-photo]').forEach(b => b.onclick = () => select(Number(b.dataset.photo)));
    $('#zoom').onclick = () => {$('#detail').classList.toggle('zoomed');};
    wireImages($('#detail-content')); select(0); if (!$('#detail').open) $('#detail').showModal(); document.body.classList.add('modal-open');
    const url = new URL(location.href); url.searchParams.set('produto',p.codigo); history.replaceState(null,'',url);
  }
  function openDeepLink() {
    const code = new URLSearchParams(location.search).get('produto');
    if (!code) return;
    const p = products.find(p => fold(p.codigo) === fold(code));
    if (p) openDetail(p.id);
    else { const note = document.createElement('p'); note.className='deep-link-note'; note.textContent=`O produto ${code} não foi encontrado na base atual. Pesquise no catálogo ou fale com nossa equipe.`; $('#data-message').append(note); }
  }
  function resetFilters() {$('#search').value = ''; $('#type').value = ''; $('#category').value = ''; $('#status').value = ''; options();}
  async function load(force = false) {
    $('#reload').disabled = true; $('#data-message').textContent = 'Consultando a base do catálogo…';
    try {
      const result = await CF_API.getProducts(force,demo); products = result.products; document.querySelector('.demo-mark')?.remove(); if (demo) { const mark = document.createElement('p'); mark.className='demo-mark'; mark.textContent='DEMONSTRAÇÃO LOCAL · Dados incompletos do briefing. Estoques e imagens reais não disponíveis.'; document.querySelector('.cover').prepend(mark); }
      $('#type').innerHTML = '<option value="">Todas as famílias</option>' + allFamilies().map(f=>'<option>'+esc(f)+'</option>').join(''); options(); $('#status').innerHTML = '<option value="">Todos os disponíveis</option>' + [...new Set(products.map(p => p.status))].sort().map(s => `<option>${esc(s)}</option>`).join('');
      buildIndex(); render();
      $('#data-message').className = 'data-message' + (demo ? ' demo' : '');
      $('#data-message').innerHTML = demo ? 'DEMONSTRAÇÃO LOCAL · Nomes e códigos fornecidos no briefing. Estoques, aplicações e fotos reais não foram recebidos. <button id="real" class="text-button">Voltar à API real</button>' : `Base consultada em ${result.fetchedAt.toLocaleString('pt-BR')}. Disponibilidade sujeita a confirmação.`;
      if (demo) $('#real').onclick = () => {demo=false; load(true);};
      if (!deepLinkHandled) { deepLinkHandled = true; openDeepLink(); }
    } catch (e) {
      products=[]; options(); buildIndex(); render(); $('#data-message').className='data-message error';
      $('#data-message').innerHTML = `<strong>Não foi possível carregar os produtos.</strong><p>${esc(e.message)}</p><button id="retry" class="button">Recarregar</button>`;
      $('#retry').onclick = () => load(true);
    } finally {$('#reload').disabled=false;}
  }
  let delay;
  $('#search').addEventListener('input', () => {clearTimeout(delay); delay=setTimeout(render,160);});
  ['type','category','status'].forEach(id => $('#'+id).addEventListener('change', () => {if(id==='type') options(); render();}));
  $('#clear').onclick = () => {resetFilters(); render();}; $('#reload').onclick=()=>load(true);
  $('#close-detail').onclick=()=>$('#detail').close();
  $('#detail').addEventListener('close',()=> {document.body.classList.remove('modal-open'); $('#detail').classList.remove('zoomed'); lastFocus?.focus(); const url = new URL(location.href); url.searchParams.delete('produto'); history.replaceState(null,'',url);});
  $('#detail').addEventListener('click', e => {if(e.target === $('#detail')) {const r=e.target.getBoundingClientRect();if(e.clientX<r.left || e.clientX>r.right || e.clientY<r.top || e.clientY>r.bottom) e.target.close();}});
  $('#print-stock').onchange=()=>document.body.classList.toggle('hide-print-stock',!$('#print-stock').checked);
  function prepareQRs() {
    document.querySelectorAll('[data-qr-url]').forEach(link => {
      const url = link.dataset.qrUrl;
      if (!qrCache.has(url)) {
        const qr = qrcodegen.QrCode.encodeText(url,qrcodegen.QrCode.Ecc.MEDIUM);
        const border = 4, size = qr.size + border*2; const parts = [];
        for (let y=0;y<qr.size;y++) for (let x=0;x<qr.size;x++) if (qr.getModule(x,y)) parts.push(`M${x+border},${y+border}h1v1h-1z`);
        qrCache.set(url,`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" role="img" aria-label="QR Code do produto digital" shape-rendering="crispEdges"><rect width="${size}" height="${size}" fill="#fff"/><path d="${parts.join(' ')}" fill="#111"/></svg>`);
      }
      link.querySelector('.qr-symbol').innerHTML=qrCache.get(url);
    });
  }
  function balancePrintPages() {
    if (printBalanced || !window.matchMedia('print').matches) return;
    printBalanced = true;
    // Measure at the actual A4 content width. Long technical text reduces density
    // rather than pushing an entire product grid onto a page after its header.
    const groups = [];
    document.querySelectorAll('.product-page').forEach(sheet => {
      const key = JSON.stringify([sheet.dataset.section,sheet.dataset.category]);
      const last = groups.at(-1);
      if (last?.key === key) last.pages.push(sheet);
      else groups.push({key,pages:[sheet]});
    });
    groups.forEach(group => {
      const original = group.pages[0];
      const limit = parseFloat(getComputedStyle(original).minHeight);
      const items = group.pages.flatMap(sheet => [...sheet.querySelectorAll('.product')]);
      // Repack the whole category so an overflow item can share the following
      // sheet instead of becoming an otherwise empty page by itself.
      group.pages.slice(1).forEach(sheet => sheet.remove());
      const makePage = after => {
        const next = original.cloneNode(true); next.removeAttribute('id');
        next.querySelector('.product-grid').replaceChildren(); after.after(next); return next;
      };
      original.querySelector('.product-grid').replaceChildren();
      let current = original;
      for (const item of items) {
        let grid = current.querySelector('.product-grid'); grid.append(item);
        if (current.getBoundingClientRect().height > limit + 1 && grid.children.length > 1) {
          item.remove(); current = makePage(current); current.querySelector('.product-grid').append(item);
        }
      }
    });
    document.querySelectorAll('.sheet').forEach((sheet,i) => {
      const number = sheet.querySelector('.folio span:last-child'); if (number) number.textContent = String(i+1).padStart(2,'0');
    });
  }
  async function preparePrint() {
    prepareQRs();
    const imgs = [...document.querySelectorAll('main img')]; imgs.forEach(img => img.loading='eager');
    await Promise.all(imgs.map(img => img.complete ? Promise.resolve() : new Promise(resolve => {img.addEventListener('load',resolve,{once:true});img.addEventListener('error',resolve,{once:true});setTimeout(resolve,10000);}))); 
  }
  async function print() {
    if ($('#detail').open) $('#detail').close();
    await preparePrint(); window.print();
  }
  window.addEventListener('beforeprint',() => {prepareQRs(); balancePrintPages();});
  window.addEventListener('afterprint',render);
  window.CF_CATALOG = {preparePrint};
  document.querySelectorAll('.print-button').forEach(b=>b.addEventListener('click',print));
  const contactList=document.createElement('div');contactList.className='regional-contacts';
  contactList.innerHTML=[...new Set(CF_CONTACTS.list.map(c=>c.region))].map(region=>`<section><h3>${esc(region)}</h3>${CF_CONTACTS.list.filter(c=>c.region===region).map(c=>`<div class="seller-entry"><p><strong>${esc(c.name)}</strong>${c.id===seller?.id?' <small>Seu atendimento</small>':c.id===CF_CONTACTS.primary?.id?' <small>Principal</small>':''}<br><a href="${esc(CF_CONTACTS.whatsapp(c))}" target="_blank" rel="noopener">${esc(CF_CONTACTS.format(c))} ↗</a></p><button class="seller-copy" data-copy-seller="${esc(c.id)}">Copiar link do catálogo</button><input class="seller-url" aria-label="Link do catálogo de ${esc(c.name)}" value="${esc(CF_CONTACTS.catalogURL(c).href)}" readonly hidden></div>`).join('')}</section>`).join('');
  $('#contato .contact-grid').after(contactList);
  contactList.querySelectorAll('[data-copy-seller]').forEach(button=>button.onclick=async()=>{const c=CF_CONTACTS.find(button.dataset.copySeller),input=button.nextElementSibling;try{await navigator.clipboard.writeText(CF_CONTACTS.catalogURL(c).href);button.textContent='Link copiado';}catch{input.hidden=false;input.select();button.textContent='Copie o link abaixo';}});
  const attendance=seller||CF_CONTACTS.primary;
  const mainContact=$('#contato .contact-grid .small-label')?.closest('.contact-grid')?.querySelector('a[href^="https://wa.me/"]');
  if(mainContact){const paragraph=mainContact.closest('p');paragraph.innerHTML=attendance?`<span class="small-label">WHATSAPP · ${esc(attendance.name.toUpperCase())}</span><a href="${esc(CF_CONTACTS.whatsapp(attendance))}" target="_blank" rel="noopener">${esc(CF_CONTACTS.format(attendance))} ↗</a>`:'';}
  const generalCTA=$('#contato > .button');generalCTA.href=whatsapp();generalCTA.dataset.consult='general';generalCTA.textContent=seller?'Falar com '+seller.name+' ↗':'Escolher vendedor ↗';
  if(sellerContext.requested){const banner=document.createElement('aside');banner.className='seller-context';const general=new URL(location.href);general.searchParams.delete('vendedor');banner.innerHTML=seller?`<strong>Atendimento: ${esc(seller.name)} · ${esc(seller.region)}</strong><span>Consultas e panfletos usarão este contato.</span><a href="${esc(general.href)}">Catálogo geral</a>`:`<strong>Este vendedor não está mais disponível.</strong><span>Escolha outro atendimento ao consultar ou gerar um panfleto.</span><a href="${esc(general.href)}">Catálogo geral</a>`;document.querySelector('.navigation').after(banner);}
  window.addEventListener('pageshow',event=>{if(event.persisted)load(true);});
  load();
})();




