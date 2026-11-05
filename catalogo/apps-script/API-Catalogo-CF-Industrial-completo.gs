/*
 * CF INDUSTRIAL — API CATÁLOGO COMPLETA
 * Substitua o código antigo somente no projeto API Catálogo CF Industrial.
 * ESTOQUE é lido em cada consulta. O catálogo consulta a API a cada 5 minutos.
 * O Drive é indexado a cada 2 horas ou manualmente em atualizarImagensAgora.
 */
const CONFIG = {
  SPREADSHEET_ID: '1vQm6qf-kJP4GC5DxCJMJP0cHdlKzkg98RR_ITPuc0Eg',
  SHEET_NAME: 'ESTOQUE',
  DRIVE_REFRESH_HOURS: 2,
  CACHE_SECONDS: 7200,
  DRIVE_CACHE_VERSION: 'V3',
  DRIVE_FOLDERS: {
    Componente: '12JkuO2_ICDP2p4Gw_f6y56APLUWmhu1A',
    Ferramenta: '1h5aOuTsnBkVli_vRKCd3tSqPOXqGKCiM',
    'Máquina': '1v8F-FXry_QFK83mBd-1psq-FaLwp0VKq',
    'Serviço': '1MB9vtNKHyuCZje93VaTc6DqkY-urjMpy'
  }
};

function doGet(e) {
  try {
    const params = e && e.parameter ? e.parameter : {};
    const mapaDrive = getDriveCatalogMapFast_();
    let produtos = getProdutos_(mapaDrive).filter(p => normalize_(p.prioridade) !== 'inativo');
    if (params.codigo) produtos = produtos.filter(p => normalizeCode_(p.codigo) === normalizeCode_(params.codigo));
    if (params.familia || params.tipo) produtos = produtos.filter(p => normalize_(p.familia || p.tipo) === normalize_(params.familia || params.tipo));
    if (params.categoria) produtos = produtos.filter(p => normalize_(p.categoria) === normalize_(params.categoria));
    if (params.prioridade) produtos = produtos.filter(p => normalize_(p.prioridade) === normalize_(params.prioridade));
    if (params.q) {
      const busca = normalize_(params.q);
      produtos = produtos.filter(p => normalize_([p.codigo, p.nome, p.familia, p.tipo, p.categoria, p.descricao, p.aplicacao, p.prioridade, p.tags].join(' ')).includes(busca));
    }
    return jsonResponse_({
      sucesso: true,
      atualizado_em: new Date().toISOString(),
      imagens_atualizadas_em: PropertiesService.getScriptProperties().getProperty(getUpdatedAtKey_()) || null,
      total: produtos.length,
      produtos: produtos
    });
  } catch (erro) {
    console.error(erro);
    return jsonResponse_({sucesso: false, erro: 'Não foi possível carregar o catálogo.', detalhe: String(erro)});
  }
}

function getProdutos_(mapaDrive) {
  const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) throw new Error('A aba "' + CONFIG.SHEET_NAME + '" não foi encontrada.');
  const valores = sheet.getDataRange().getDisplayValues();
  if (valores.length < 2) return [];
  const cabecalhos = valores[0].map(normalizeHeader_);
  return valores.slice(1).filter(linha => linha.some(v => String(v).trim() !== '')).map(linha => {
    const dados = {};
    cabecalhos.forEach((cabecalho, index) => { dados[cabecalho] = String(linha[index] == null ? '' : linha[index]).trim(); });
    const get = nomes => getField_(dados, nomes);
    const codigo = get(['codigo']);
    const dadosDrive = mapaDrive[normalizeCode_(codigo)] || null;
    const familia = get(['familia', 'tipo']) || (dadosDrive && (dadosDrive.familia || dadosDrive.tipo)) || '';
    const prioridade = get(['prioridade', 'status']);
    const imagens = dadosDrive && Array.isArray(dadosDrive.imagens) ? dadosDrive.imagens : [];
    return {
      codigo: codigo,
      nome: get(['ferramenta_maquina_servicos', 'ferramenta_maquina_servico', 'ferramenta', 'nome', 'produto']),
      familia: familia,
      tipo: familia,
      categoria: get(['categoria']),
      descricao: get(['descricao']),
      aplicacao: get(['aplicacao']),
      estoque_pr: parseEstoque_(get(['estoque_pr'])),
      estoque_sc: parseEstoque_(get(['estoque_sc'])),
      prioridade: prioridade,
      status: prioridade,
      resumo: get(['resumo_curto', 'resumo']),
      ordem: get(['ordem']),
      destaque: get(['destaque']),
      tags: get(['tags']),
      preco: get(['preco', 'valor']),
      producao: get(['producao']),
      prazo: get(['prazo']),
      video: get(['video']),
      manual_pdf: get(['manual_pdf']),
      imagem: imagens.length ? imagens[0].thumbnail : '',
      imagem_grande: imagens.length ? imagens[0].url : '',
      imagens: imagens,
      quantidade_imagens: imagens.length
    };
  }).filter(produto => produto.codigo || produto.nome);
}

function getDriveCatalogMapFast_() {
  const cache = loadMapFromCache_();
  if (cache) return cache;
  const persistente = loadPersistentDriveMap_();
  if (persistente) { saveMapToCache_(persistente); return persistente; }
  return atualizarIndiceDrive_(false);
}

function atualizarCacheDrive() { return atualizarIndiceDrive_(true); }

function atualizarImagensAgora() {
  const mapa = atualizarIndiceDrive_(true);
  verificarStatus();
  return mapa;
}

function atualizarIndiceDrive_(forcar) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) {
    const anterior = loadPersistentDriveMap_() || loadMapFromCache_();
    if (anterior) { console.log('Já existe uma atualização em andamento. Mantido o índice disponível.'); return anterior; }
    throw new Error('O índice de imagens está sendo preparado. Aguarde e tente novamente.');
  }
  try {
    if (!forcar) {
      const pronto = loadMapFromCache_() || loadPersistentDriveMap_();
      if (pronto) return pronto;
    }
    const inicio = Date.now();
    const mapa = getDriveCatalogMap_();
    const atualizadoEm = new Date().toISOString();
    const metricas = {
      duracao_ms: Date.now() - inicio,
      codigos: Object.keys(mapa).length,
      imagens: Object.keys(mapa).reduce((total, codigo) => total + mapa[codigo].imagens.length, 0)
    };
    savePersistentDriveMap_(mapa, atualizadoEm, metricas);
    CacheService.getScriptCache().remove(getCacheKey_());
    saveMapToCache_(mapa);
    console.log('Índice atualizado: ' + JSON.stringify(metricas));
    return mapa;
  } finally { lock.releaseLock(); }
}

function getCacheKey_() { return 'CF_DRIVE_MAP_' + CONFIG.DRIVE_CACHE_VERSION; }
function getUpdatedAtKey_() { return 'CF_DRIVE_UPDATED_AT_' + CONFIG.DRIVE_CACHE_VERSION; }
function getChunkPrefix_() { return 'CF_DRIVE_' + CONFIG.DRIVE_CACHE_VERSION + '_CHUNK_'; }
function getChunkCountKey_() { return 'CF_DRIVE_' + CONFIG.DRIVE_CACHE_VERSION + '_CHUNKS'; }
function getManifestKey_() { return 'CF_DRIVE_' + CONFIG.DRIVE_CACHE_VERSION + '_MANIFEST'; }

function pack_(mapa) {
  const json = JSON.stringify(mapa);
  return Utilities.base64Encode(Utilities.gzip(Utilities.newBlob(json, 'application/json')).getBytes());
}
function unpack_(texto) {
  const bytes = Utilities.base64Decode(texto);
  return JSON.parse(Utilities.ungzip(Utilities.newBlob(bytes)).getDataAsString('UTF-8'));
}
function saveMapToCache_(mapa) {
  try {
    const valor = 'GZ:' + pack_(mapa);
    if (valor.length <= 90000) CacheService.getScriptCache().put(getCacheKey_(), valor, CONFIG.CACHE_SECONDS);
  } catch (erro) { console.log('Cache rápido indisponível; será usado o índice persistente: ' + erro); }
}
function loadMapFromCache_() {
  try {
    const valor = CacheService.getScriptCache().get(getCacheKey_());
    if (!valor) return null;
    return valor.startsWith('GZ:') ? unpack_(valor.substring(3)) : JSON.parse(valor);
  } catch (erro) { return null; }
}

function savePersistentDriveMap_(mapa, atualizadoEm, metricas) {
  const props = PropertiesService.getScriptProperties();
  const texto = pack_(mapa);
  const tamanhoAtual = Utilities.newBlob(JSON.stringify(props.getProperties())).getBytes().length;
  if (texto.length > 200000 || tamanhoAtual + texto.length > 450000) throw new Error('Índice de imagens muito grande para as propriedades. O índice anterior foi preservado.');
  const geracao = Utilities.getUuid();
  const prefixo = getChunkPrefix_() + geracao + '_';
  const salvar = {};
  for (let i = 0, numero = 0; i < texto.length; i += 7500, numero++) salvar[prefixo + numero] = texto.substring(i, i + 7500);
  props.setProperties(salvar, false);
  const manifesto = {generation: geracao, chunks: Object.keys(salvar).length, encoding: 'gzip-base64', updated_at: atualizadoEm, metricas: metricas};
  props.setProperty(getManifestKey_(), JSON.stringify(manifesto));
  props.setProperty(getUpdatedAtKey_(), atualizadoEm);
  const chaveAtual = 'CF_DRIVE_' + CONFIG.DRIVE_CACHE_VERSION + '_CURRENT_PREFIX';
  const chaveAnterior = 'CF_DRIVE_' + CONFIG.DRIVE_CACHE_VERSION + '_PREVIOUS_PREFIX';
  const descartar = props.getProperty(chaveAnterior);
  const manter = props.getProperty(chaveAtual);
  props.setProperty(chaveAtual, prefixo);
  if (manter) props.setProperty(chaveAnterior, manter);
  if (descartar && descartar !== prefixo && descartar !== manter) Object.keys(props.getProperties()).filter(chave => chave.startsWith(descartar)).forEach(chave => props.deleteProperty(chave));
}

function loadPersistentDriveMap_() {
  try {
    const props = PropertiesService.getScriptProperties();
    const manifestoTexto = props.getProperty(getManifestKey_());
    if (manifestoTexto) {
      const m = JSON.parse(manifestoTexto);
      if (m.encoding !== 'gzip-base64' || !Number.isInteger(m.chunks) || m.chunks < 1 || m.chunks > 100) return null;
      let texto = '';
      for (let i = 0; i < m.chunks; i++) {
        const bloco = props.getProperty(getChunkPrefix_() + m.generation + '_' + i);
        if (bloco == null) return null;
        texto += bloco;
      }
      return unpack_(texto);
    }
    const quantidade = Number(props.getProperty(getChunkCountKey_()));
    if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > 100) return null;
    let json = '';
    for (let i = 0; i < quantidade; i++) {
      const bloco = props.getProperty(getChunkPrefix_() + i);
      if (bloco == null) return null;
      json += bloco;
    }
    return JSON.parse(json);
  } catch (erro) { console.log('Índice persistente inválido: ' + erro); return null; }
}

function getDriveCatalogMap_() {
  const mapa = {};
  Object.entries(CONFIG.DRIVE_FOLDERS).forEach(([familia, folderId]) => scanFamiliaFolder_(folderId, familia, mapa));
  return mapa;
}
function scanFamiliaFolder_(folderId, familia, mapa) {
  const subpastas = DriveApp.getFolderById(folderId).getFolders();
  while (subpastas.hasNext()) {
    const subpasta = subpastas.next();
    const codigo = normalizeCode_(subpasta.getName());
    if (!codigo) continue;
    const imagens = getImagesFromFolder_(subpasta);
    if (mapa[codigo]) {
      console.log('Código em mais de uma família no Drive: ' + codigo);
      const existentes = new Set(mapa[codigo].imagens.map(imagem => imagem.id));
      mapa[codigo].imagens = mapa[codigo].imagens.concat(imagens.filter(imagem => !existentes.has(imagem.id)));
    } else mapa[codigo] = {familia: familia, tipo: familia, imagens: imagens};
  }
}
function getImagesFromFolder_(folder) {
  const imagens = [], arquivos = folder.getFiles();
  while (arquivos.hasNext()) { const arquivo = arquivos.next(); if (isImageFile_(arquivo)) imagens.push(createImageObject_(arquivo)); }
  imagens.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', {numeric: true, sensitivity: 'base'}));
  return imagens;
}
function createImageObject_(arquivo) {
  const id = arquivo.getId();
  return {id: id, nome: arquivo.getName(), mime_type: arquivo.getMimeType(), thumbnail: 'https://drive.google.com/thumbnail?id=' + id + '&sz=w800', url: 'https://drive.google.com/thumbnail?id=' + id + '&sz=w1600', url_original: 'https://drive.google.com/uc?export=view&id=' + id};
}
function isImageFile_(arquivo) { return ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(String(arquivo.getMimeType() || '').toLowerCase()); }

function configurarAutomacao() {
  configurarGatilhoDrive_('2h');
  atualizarImagensAgora();
}
function configurarAutomacao10Minutos() {
  configurarGatilhoDrive_('10m');
  atualizarImagensAgora();
}
function configurarGatilhoDrive_(modo) {
  const builder = ScriptApp.newTrigger('atualizarCacheDrive').timeBased();
  const criado = (modo === '10m' ? builder.everyMinutes(10) : builder.everyHours(CONFIG.DRIVE_REFRESH_HOURS)).create();
  ScriptApp.getProjectTriggers().filter(trigger => trigger.getHandlerFunction() === 'atualizarCacheDrive' && trigger.getUniqueId() !== criado.getUniqueId()).forEach(trigger => ScriptApp.deleteTrigger(trigger));
  PropertiesService.getScriptProperties().setProperty('CF_DRIVE_' + CONFIG.DRIVE_CACHE_VERSION + '_SCHEDULE', modo);
  console.log('Atualização de imagens: ' + modo + '. Estoque é lido em cada requisição.');
}
function verificarStatus() {
  const props = PropertiesService.getScriptProperties(), manifesto = props.getProperty(getManifestKey_());
  console.log(JSON.stringify({imagens_atualizadas_em: props.getProperty(getUpdatedAtKey_()), agenda: props.getProperty('CF_DRIVE_' + CONFIG.DRIVE_CACHE_VERSION + '_SCHEDULE') || 'Verifique os gatilhos existentes', indice: manifesto ? JSON.parse(manifesto) : 'Formato anterior V3', planilha: 'ESTOQUE lida em tempo real em cada consulta'}, null, 2));
}
function testeImagens() {
  const mapa = getDriveCatalogMapFast_();
  ['TK200A', 'TK011', 'MCVT', 'SERV01'].forEach(codigo => console.log(codigo + ': ' + JSON.stringify(mapa[codigo] || null, null, 2)));
}
function getField_(dados, possibilidades) {
  for (const campo of possibilidades) if (Object.prototype.hasOwnProperty.call(dados, campo) && dados[campo] !== '') return dados[campo];
  return '';
}
function parseEstoque_(valor) {
  if (valor === '' || valor == null || valor === '-') return null;
  const numero = Number(String(valor).replace(',', '.').trim());
  return Number.isNaN(numero) ? String(valor).trim() : numero;
}
function normalizeHeader_(texto) { return normalize_(texto).replace(/[^\w]+/g, '_').replace(/^_+|_+$/g, ''); }
function normalize_(texto) { return String(texto || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim(); }
function normalizeCode_(codigo) { return String(codigo || '').trim().toUpperCase().replace(/\s+/g, ''); }
function jsonResponse_(dados) { return ContentService.createTextOutput(JSON.stringify(dados)).setMimeType(ContentService.MimeType.JSON); }
