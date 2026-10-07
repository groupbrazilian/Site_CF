(() => {
  const clean = value => value == null ? '' : String(value).trim();
  const fold = value => clean(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const safeURL = value => { if (!clean(value)) return ""; try { const u = new URL(clean(value), location.href); return ['http:', 'https:'].includes(u.protocol) ? u.href : ''; } catch { return ''; } };
  const family = value => ({ferramenta:'Ferramentas', ferramentas:'Ferramentas', componente:'Componentes', componentes:'Componentes', maquina:'Máquinas', maquinas:'Máquinas', servico:'Serviços', servicos:'Serviços'})[fold(value)] || clean(value) || 'Outros';
  const collator = new Intl.Collator('pt-BR', {numeric:true, sensitivity:'base'});
  function field(record, names) {
    for (const name of names) {
      const key = Object.keys(record).find(k => fold(k).replace(/\s+/g,' ') === fold(name).replace(/\s+/g,' '));
      if (key && clean(record[key])) return clean(record[key]);
    }
    return '';
  }
  // Family is authoritative; legacy type is consulted only when family is absent.
  const productFamily = record => family(field(record,['familia','tipo','Tipo de produto','Tipo do item']));
  function normalize(raw) {
    const rows = Array.isArray(raw) ? raw : raw.produtos ?? raw.items ?? raw.data ?? raw.dados;
    const list = Array.isArray(rows) ? rows : rows?.produtos ?? rows?.items;
    if (!Array.isArray(list)) throw new Error('A API não retornou uma lista de produtos reconhecida.');
    return list.map((p, i) => {
      const nome = field(p,['nome','item','Ferramenta / Máquina / Serviços','Ferramenta/Máquina/Serviços','Ferramenta','Produto']);
      const descricao = field(p,['descricao','Descrição']);
      const imagens = (Array.isArray(p.imagens) ? p.imagens : []).filter(Boolean).map(img => {
        const url = safeURL(typeof img === 'string' ? img : img.url);
        const thumbnail = safeURL(typeof img === 'string' ? img : img.thumbnail) || url;
        return {url: url || thumbnail, thumbnail, nome: clean(img.nome), id: clean(img.id)};
      }).filter(img => img.url);
      const declaredCount = Number(p.quantidade_imagens);
      const quantidade_imagens = p.quantidade_imagens != null && clean(p.quantidade_imagens) !== '' && Number.isFinite(declaredCount) && declaredCount >= 0 ? Math.floor(declaredCount) : imagens.length;
      return {
      id: i, codigo: clean(p.codigo ?? p['Código']), nome: nome || descricao || clean(p.codigo ?? p['Código']),
      nome_por_descricao: !nome && Boolean(descricao),
      familia: productFamily(p), tipo: productFamily(p), prioridade: field(p,['prioridade']), categoria: clean(p.categoria ?? p['Categoria']) || 'Sem categoria',
      categoria_preenchida: Boolean(clean(p.categoria ?? p['Categoria'])),
      descricao, aplicacao: clean(p.aplicacao ?? p['Aplicação']),
      estoque_pr: stock(p.estoque_pr ?? p['Estoque PR']), estoque_sc: stock(p.estoque_sc ?? p['Estoque SC']),
      estoque_pr_preenchido: hasStock(p.estoque_pr ?? p['Estoque PR']), estoque_sc_preenchido: hasStock(p.estoque_sc ?? p['Estoque SC']),
      status: clean(p.status ?? p['Status']) || 'Sob consulta', imagem: safeURL(p.imagem) || imagens[0]?.thumbnail || '',
      imagem_grande: safeURL(p.imagem_grande) || imagens[0]?.url || safeURL(p.imagem),
      imagens, quantidade_imagens
    }; }).filter(p => (p.codigo || p.nome) && fold(p.prioridade) !== 'inativo').sort((a,b) => {
      const order = ['Ferramentas','Componentes','Máquinas','Serviços'];
      const rank = p => order.includes(p.familia) ? order.indexOf(p.familia) : order.length;
      return rank(a)-rank(b) || collator.compare(a.familia,b.familia)
        || Number(!a.categoria_preenchida)-Number(!b.categoria_preenchida)
        || collator.compare(a.categoria,b.categoria)
        || Number(!a.descricao)-Number(!b.descricao)
        || collator.compare(a.descricao,b.descricao)
        || collator.compare(a.nome,b.nome)
        || collator.compare(a.codigo,b.codigo);
    });
  }
  function stock(value) { if (value == null || clean(value) === '') return 'Sob consulta'; const n = Number(value); return Number.isFinite(n) && n >= 0 ? String(n) : 'Sob consulta'; }
  function hasStock(value) {return value != null && clean(value) !== '' && Number.isFinite(Number(value)) && Number(value) >= 0;}
  let cache, pending;
  async function getProducts(force = false, demo = CF_CONFIG.USE_MOCK_DATA) {
    if (cache && !force && cache.demo === demo) return cache;
    if (pending) return pending;
    pending = (async () => {
      const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), CF_CONFIG.REQUEST_TIMEOUT_MS);
      try {
        const response = await fetch(demo ? CF_CONFIG.MOCK_URL : CF_CONFIG.API_URL, {signal: controller.signal, cache:'no-store', credentials:'omit'});
        if (!response.ok) throw new Error('A base está indisponível (HTTP ' + response.status + ').');
        const body = await response.text();
        if (/^\s*</.test(body)) throw new Error('A API retornou uma página de login ou HTML em vez dos dados públicos.');
        let raw; try {raw = JSON.parse(body);} catch {throw new Error('A resposta da API não é um JSON válido.');}
        if (raw.success === false || raw.sucesso === false || raw.error) throw new Error('A API informou um erro ao consultar a base.');
        cache = {products: normalize(raw), demo, fetchedAt: new Date()}; return cache;
      } catch (e) {
        if (e.name === 'AbortError') throw new Error('A consulta demorou mais que o esperado. Tente novamente.');
        if (e instanceof TypeError) throw new Error('Não foi possível acessar a API. Verifique a conexão e o acesso público/CORS da implantação do Google Apps Script.');
        throw e;
      } finally {clearTimeout(timer); pending = undefined;}
    })(); return pending;
  }
  window.CF_API = {getProducts, normalize, fold, safeURL};
})();

