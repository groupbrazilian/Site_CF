/* Links diretos conferidos por código/SKU em 14/11/2026.
 * Para incluir/alterar um produto, edite somente o par CODIGO: URL abaixo.
 * Não coloque valores aqui: o cliente consulta o preço atual na própria loja.
 * Itens sem correspondência confirmada não recebem botão.
 */
(() => {
  'use strict';
  const links=Object.freeze({
  "CF167": "https://www.brazilianimports.com.br/sacador-da-porca-da-polia-cvt-60mm-cambio-automatico-k113",
  "CF168": "https://www.brazilianimports.com.br/sacador-de-bomba-de-transmissao-universal",
  "CF176": "https://www.brazilianimports.com.br/soquete-especial-pito-quadrado-de-34-de-polegada-38-mm-para-extracao-da-porca-superior-da-polia-primaria-do-conjunto-cvt-vt2",
  "CF178": "https://www.brazilianimports.com.br/ferramenta-de-teste-do-tambor-e1-e-e2-al4",
  "MCVT": "https://www.brazilianimports.com.br/maquina-de-teste-cvt-em-bancada-pre-venda-exclusiva",
  "TK0006": "https://www.brazilianimports.com.br/kit-de-manifold-3",
  "TK0062": "https://www.brazilianimports.com.br/placa-acrilica-de-teste-do-corpo-de-valvulas-cambio-6t30",
  "TK0064": "https://www.brazilianimports.com.br/placa-acrilica-de-teste-do-corpo-de-valvulas-cambio-tf-72",
  "TK0065": "https://www.brazilianimports.com.br/air-check-al4",
  "TK0066": "https://www.brazilianimports.com.br/placa-acrilica-de-teste-do-corpo-de-valvulas-cambio-6f35",
  "TK0067": "https://www.brazilianimports.com.br/ferramenta-de-instalacao-do-pistao-5l40",
  "TK011": "https://www.brazilianimports.com.br/valvula-de-bomba-de-oleo-retorno-jf011e-jf015e-jf016e-jf017e-nissan-suzuki-mitsubishi-dodge-jeep-renault",
  "TK018": "https://www.brazilianimports.com.br/encolhedor-de-polias-cvt-jf018",
  "TK050": "https://www.brazilianimports.com.br/ferramenta-de-testes-de-vacuo-para-corpo-de-valvulas-de-transmissao-automatica",
  "TK051": "https://www.brazilianimports.com.br/base-de-teste-do-dq200-das-solenoides",
  "TK053": "https://www.brazilianimports.com.br/ferramenta-de-teste-de-aircheck-spider-em-placas-dq200-transkolben",
  "TK0909": "https://www.brazilianimports.com.br/ferramenta-de-abertura-de-solenoide-09g-antigo-transkolben",
  "TK1010": "https://www.brazilianimports.com.br/sacador-sextavado-da-porca-superior-da-polia-do-cvt-46mm",
  "TK1011": "https://www.brazilianimports.com.br/ferramenta-de-instalacao-dos-aneis-de-teflon-da-hub-6t30-6t35-6t40-6f35",
  "TK1117": "https://www.brazilianimports.com.br/vareta-de-oleo-do-9hp48",
  "TK1130": "https://www.brazilianimports.com.br/ferramenta-de-abertura-de-solenoide-linha-6t30-6t40-6t45-6f35",
  "TK125": "https://www.brazilianimports.com.br/kit-removedor-e-instalador-de-anel-oring-cambio-automatico",
  "TK1442": "https://www.brazilianimports.com.br/suporte-para-reparo-em-corpo-de-valvula-universal",
  "TK1511": "https://www.brazilianimports.com.br/ferramenta-de-abertura-de-solenoide-jf015e-re0f11a-cvt",
  "TK1520": "https://www.brazilianimports.com.br/encolhedor-de-polia-cvt-jf015-jf020",
  "TK1567": "https://www.brazilianimports.com.br/ferramenta-abertura-reparo-solenoides-tf70-tf72-09g-moderno-u341",
  "TK160": "https://www.brazilianimports.com.br/buchas-cabo-seletor-marcha-cambio-automatico-aw50-40-astra-vectra-zafira",
  "TK164": "https://www.brazilianimports.com.br/valvula-da-re-cambio-automatico-aw50-40-astra-zafira-vect",
  "TK165": "https://www.brazilianimports.com.br/ferramenta-de-abertura-de-solenoide-6t31-transkolben",
  "TK166": "https://www.brazilianimports.com.br/kit-ferramenta-teste-do-pistao-cvt-jf011-jf015-jf016-jf020-transkolben",
  "TK1717": "https://www.brazilianimports.com.br/none-278838464",
  "TK176": "https://www.brazilianimports.com.br/none-338923100",
  "TK200A": "https://www.brazilianimports.com.br/anel-vedacao-eixo-garfo",
  "TK200E": "https://www.brazilianimports.com.br/eixo-acionamento-garfo-dq200-0am",
  "TK2012": "https://www.brazilianimports.com.br/parafuso-de-regulagem-da-cinta-do-al4-transkolben",
  "TK206": "https://www.brazilianimports.com.br/ferramenta-de-instalacao-e-extracao-do-kit-de-embreagem-dsg-dq200",
  "TK251": "https://www.brazilianimports.com.br/ferramenta-encolhedor-universal-de-pistao-cambio-automatico",
  "TK2626": "https://www.brazilianimports.com.br/bucha-protetora-transkolben-instalacao-trava-al4",
  "TK3075": "https://www.brazilianimports.com.br/ferramenta-de-reparo-dos-acumuladores-6t30",
  "TK4589": "https://www.brazilianimports.com.br/ferramenta-centralizadora-bomba-oleo-6l45-6l50-6l80-6l90",
  "TK482": "https://www.brazilianimports.com.br/pino-de-regulagem-valvula-manual-al4",
  "TK500": "https://www.brazilianimports.com.br/ferramenta-para-remocao-e-instalacao-do-tambor-35re-6l50-6l80-6l90",
  "TK5080": "https://www.brazilianimports.com.br/alicate-de-travas-6l50-6l80",
  "TK5427": "https://www.brazilianimports.com.br/bucha-de-recuperacao-do-pistao-da-carcaca-cambio-automatico-fnr5-4f27e",
  "TK680": "https://www.brazilianimports.com.br/valvula-bypass-6r80-clr-transkolben",
  "TK6L": "https://www.brazilianimports.com.br/ferramenta-de-teste-do-tambor-reverso-6l50-6l80-6l90",
  "TK761": "https://www.brazilianimports.com.br/ferramenta-de-remocao-do-atuador-d7uf1-new-tucson-dsg",
  "TK773": "https://www.brazilianimports.com.br/ferramenta-de-instalacao-e-extracao-do-kit-de-embreagem-modelo-d7uf1",
  "TKBG": "https://www.brazilianimports.com.br/bandeja-organizadora-de-bancada-para-cambio-automatico",
  "TKPS1": "https://www.brazilianimports.com.br/ferramenta-de-extrair-e-instalar-embreagem-e-retentor-power-shift",
  "TKPS2": "https://www.brazilianimports.com.br/ferramenta-para-resetar-embreagem-do-powershift"
});
  function urlFor(code){
    const key=String(code??'').trim().toUpperCase();
    if(!Object.prototype.hasOwnProperty.call(links,key))return '';
    try{const url=new URL(links[key]);return url.protocol==='https:'&&['www.brazilianimports.com.br','brazilianimports.com.br'].includes(url.hostname)&&url.pathname!=='/'&&url.pathname!=='/buscar'?url.href:'';}catch{return '';}
  }
  window.CF_STORE=Object.freeze({links,urlFor,checkedAt:'2026-11-14'});
})();
