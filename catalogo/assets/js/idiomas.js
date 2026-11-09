(() => {
  'use strict';
  const dictionary={
    'Catálogo técnico':['Technical catalog','Catálogo técnico'],'Status':['Status','Estado'],
    'Catálogo técnico | CF Industrial':['Technical catalog | CF Industrial','Catálogo técnico | CF Industrial'],
    'Catálogo':['Catalog','Catálogo'],'Contato':['Contact','Contacto'],'Ir para o catálogo':['Skip to catalog','Ir al catálogo'],
    'CF Industrial — capa':['CF Industrial — cover','CF Industrial — portada'],'Navegação principal':['Main navigation','Navegación principal'],
    'Imprimir / Gerar PDF ↗':['Print / Save PDF ↗','Imprimir / Guardar PDF ↗'],'Buscar e filtrar catálogo':['Search and filter catalog','Buscar y filtrar catálogo'],
    'Consultar catálogo':['Browse catalog','Consultar catálogo'],'Buscar no catálogo':['Search catalog','Buscar en el catálogo'],
    'Código, nome ou aplicação…':['Code, name or application…','Código, nombre o aplicación…'],'Família':['Family','Familia'],'Categoria':['Category','Categoría'],
    'Todas as famílias':['All families','Todas las familias'],'Todas as categorias':['All categories','Todas las categorías'],
    'Todos os disponíveis':['All available items','Todos los disponibles'],'Limpar':['Clear','Limpiar'],'Estoque na impressão':['Show stock in print','Mostrar existencias al imprimir'],
    'Abrir catálogo →':['Open catalog →','Abrir catálogo →'],'Consultando a base do catálogo…':['Loading catalog data…','Consultando los datos del catálogo…'],
    'Atualizar dados ↻':['Refresh data ↻','Actualizar datos ↻'],'Ferramentas':['Tools','Herramientas'],'Ferramenta':['Tool','Herramienta'],
    'Componentes':['Components','Componentes'],'Componente':['Component','Componente'],'Máquinas':['Machines','Máquinas'],'Máquina':['Machine','Máquina'],
    'Serviços':['Services','Servicios'],'Serviço':['Service','Servicio'],'Sem categoria':['Uncategorized','Sin categoría'],'Outros':['Other','Otros'],
    'Componentes e Acessórios':['Components and Accessories','Componentes y accesorios'],'Buchas, Vedação e Reparo':['Bushings, Sealing and Repair','Casquillos, sellado y reparación'],
    'Testes e Reparos':['Testing and Repairs','Pruebas y reparaciones'],'CVT — Polias e Bombas':['CVT — Pulleys and Pumps','CVT — Poleas y bombas'],
    'Ativo':['Active','Activo'],'Inativo':['Inactive','Inactivo'],'Alto':['High','Alto'],'Médio':['Medium','Medio'],'Baixo':['Low','Bajo'],'Sob consulta':['On request','Consultar'],
    'Consultar ferramenta':['Ask about this tool','Consultar herramienta'],'Consultar componente':['Ask about this component','Consultar componente'],
    'Solicitar proposta da máquina':['Request a machine quote','Solicitar presupuesto de la máquina'],'Solicitar orçamento do serviço':['Request a service quote','Solicitar presupuesto del servicio'],
    'Solicitar orçamento':['Request a quote','Solicitar presupuesto'],'Prioridade':['Priority','Prioridad'],'Aplicação':['Application','Aplicación'],
    'Descrição técnica':['Technical description','Descripción técnica'],'Ver detalhes +':['View details +','Ver detalles +'],'Panfleto ↗':['Flyer ↗','Folleto ↗'],
    'Ver produto digital':['View product online','Ver producto en línea'],'Mais imagens e informações':['More photos and information','Más imágenes e información'],
    'CATÁLOGO TÉCNICO':['TECHNICAL CATALOG','CATÁLOGO TÉCNICO'],'CATÁLOGO':['CATALOG','CATÁLOGO'],'PRECISÃO POR ESPECIALIDADE':['PRECISION BY SPECIALTY','PRECISIÓN POR ESPECIALIDAD'],
    'ESPECIFICAÇÕES · APLICAÇÕES · SOLUÇÕES':['SPECIFICATIONS · APPLICATIONS · SOLUTIONS','ESPECIFICACIONES · APLICACIONES · SOLUCIONES'],
    'Nenhum item encontrado.':['No items found.','No se encontraron artículos.'],'Tente outro termo ou limpe os filtros.':['Try another term or clear the filters.','Pruebe otro término o borre los filtros.'],
    'Os itens desta seção aparecerão quando estiverem disponíveis na base.':['Items will appear here when available in the database.','Los artículos aparecerán aquí cuando estén disponibles en la base de datos.'],
    'Clique na imagem para ampliar.':['Click the image to enlarge.','Haga clic en la imagen para ampliarla.'],'Ampliar imagem':['Enlarge image','Ampliar imagen'],
    'Imagem anterior':['Previous image','Imagen anterior'],'Próxima imagem':['Next image','Siguiente imagen'],'Fechar detalhes':['Close details','Cerrar detalles'],
    'Qual vendedor vai no panfleto?':['Which salesperson should appear on the flyer?','¿Qué vendedor debe aparecer en el folleto?'],
    'Com qual vendedor deseja falar?':['Which salesperson would you like to contact?','¿Con qué vendedor desea hablar?'],
    'Escolha o atendimento da CF Industrial.':['Choose a CF Industrial contact.','Elija un contacto de CF Industrial.'],
    'Fechar escolha de vendedor':['Close salesperson selection','Cerrar selección de vendedor'],'Contato principal':['Main contact','Contacto principal'],
    'Nenhum vendedor disponível no momento.':['No salesperson is currently available.','No hay vendedores disponibles en este momento.'],
    'Este vendedor não está mais disponível.':['This salesperson is no longer available.','Este vendedor ya no está disponible.'],
    'Escolha outro atendimento ao consultar ou gerar um panfleto.':['Choose another contact when making an inquiry or creating a flyer.','Elija otro contacto al consultar o generar un folleto.'],
    'Consultas e panfletos usarão este contato.':['Inquiries and flyers will use this contact.','Las consultas y los folletos utilizarán este contacto.'],
    'Catálogo geral':['General catalog','Catálogo general'],'Seu atendimento':['Your contact','Su contacto'],'Principal':['Main','Principal'],
    'Copiar link do catálogo':['Copy catalog link','Copiar enlace del catálogo'],'Link copiado':['Link copied','Enlace copiado'],'Copie o link abaixo':['Copy the link below','Copie el enlace de abajo'],
    'Escolher vendedor ↗':['Choose salesperson ↗','Elegir vendedor ↗'],'ATENDIMENTO TÉCNICO':['TECHNICAL SUPPORT','ATENCIÓN TÉCNICA'],
    'VAMOS ENCONTRAR A SOLUÇÃO':['LET’S FIND THE SOLUTION','ENCONTREMOS LA SOLUCIÓN'],'Precisão começa':['Precision starts','La precisión empieza'],
    'com uma boa':['with a good','con una buena'],'conversa.':['conversation.','conversación.'],'SOLICITE UMA ANÁLISE OU ORÇAMENTO':['REQUEST AN ASSESSMENT OR QUOTE','SOLICITE UN ANÁLISIS O PRESUPUESTO'],
    'TELEFONE':['PHONE','TELÉFONO'],'SOLUÇÕES INDUSTRIAIS':['INDUSTRIAL SOLUTIONS','SOLUCIONES INDUSTRIALES'],
    'Disponibilidade e condições sob confirmação com nossa equipe.':['Availability and terms are subject to confirmation with our team.','La disponibilidad y las condiciones se confirman con nuestro equipo.'],
    'Dados de estoque representam a última consulta à base.':['Stock figures reflect the latest database query.','Las existencias reflejan la última consulta a la base de datos.'],
    'Ative o JavaScript para consultar os produtos e navegar pelo catálogo.':['Enable JavaScript to browse the products and catalog.','Active JavaScript para consultar los productos y navegar por el catálogo.'],
    'Item indisponível na base atual':['Item unavailable in the current database','Artículo no disponible en la base actual'],
    'Este item foi removido ou desativado. Escolha outro produto no catálogo.':['This item was removed or deactivated. Choose another product in the catalog.','Este artículo fue eliminado o desactivado. Elija otro producto del catálogo.'],
    'Não foi possível carregar os produtos.':['Unable to load products.','No se pudieron cargar los productos.'],'Recarregar':['Retry','Reintentar'],
    'Não foi possível acessar a API. Verifique a conexão e o acesso público/CORS da implantação do Google Apps Script.':['Unable to access the API. Check your connection and the Google Apps Script public access/CORS settings.','No se pudo acceder a la API. Compruebe la conexión y el acceso público/CORS de Google Apps Script.'],
    'A consulta demorou mais que o esperado. Tente novamente.':['The request took too long. Please try again.','La consulta tardó demasiado. Inténtelo de nuevo.'],
    'A API informou um erro ao consultar a base.':['The API reported an error while reading the database.','La API informó de un error al consultar la base.'],
    'A resposta da API não é um JSON válido.':['The API response is not valid JSON.','La respuesta de la API no es un JSON válido.'],
    'A API retornou uma página de login ou HTML em vez dos dados públicos.':['The API returned a login or HTML page instead of public data.','La API devolvió una página de acceso o HTML en lugar de datos públicos.'],
    '← Catálogo':['← Catalog','← Catálogo'],'Panfleto A5 CF Industrial':['A5 Flyer CF Industrial','Folleto A5 CF Industrial'],'Baixar imagem PNG':['Download PNG','Descargar PNG'],'Imprimir / Salvar PDF':['Print / Save PDF','Imprimir / Guardar PDF'],
    'Preparando o panfleto…':['Preparing the flyer…','Preparando el folleto…'],'Contato do panfleto':['Flyer contact','Contacto del folleto'],
    'Selecione um vendedor disponível':['Select an available salesperson','Seleccione un vendedor disponible'],
    'Nenhum vendedor está disponível no momento.':['No salesperson is currently available.','No hay vendedores disponibles en este momento.'],
    'Este vendedor não está mais disponível. Selecione outro contato para gerar o panfleto.':['This salesperson is no longer available. Select another contact to create the flyer.','Este vendedor ya no está disponible. Seleccione otro contacto para generar el folleto.'],
    'PRECISÃO PARA TRANSMISSÕES AUTOMÁTICAS':['PRECISION FOR AUTOMATIC TRANSMISSIONS','PRECISIÓN PARA TRANSMISIONES AUTOMÁTICAS'],
    'CÓDIGO':['CODE','CÓDIGO'],'APLICAÇÃO':['APPLICATION','APLICACIÓN'],'DESCRIÇÃO TÉCNICA':['TECHNICAL DESCRIPTION','DESCRIPCIÓN TÉCNICA'],'CATEGORIA':['CATEGORY','CATEGORÍA'],
    'FOTO INDISPONÍVEL':['PHOTO UNAVAILABLE','FOTO NO DISPONIBLE'],'distributorLine1':['OFFICIAL','DISTRIBUIDOR'],'distributorLine2':['DISTRIBUTOR','OFICIAL'],
    'A foto não pôde ser carregada ou não foi informada na base. O panfleto A5 indica foto indisponível. Confira o acesso público da imagem.':['The photo could not be loaded or was not provided. Check that the image is publicly accessible.','La foto no se pudo cargar o no fue proporcionada. Compruebe el acceso público de la imagen.'],
    'Panfleto A5 pronto (148 × 210 mm). PNG: 1748 × 2480 px. Na impressão, escolha A5; se usar A4, mantenha escala 100% para imprimir no tamanho A5.':['A5 flyer ready (148 × 210 mm). PNG: 1748 × 2480 px. Choose A5 when printing; on A4, use 100% scale to keep the A5 size.','Folleto A5 listo (148 × 210 mm). PNG: 1748 × 2480 px. Elija A5 al imprimir; en A4, utilice escala 100% para conservar el tamaño A5.']
  };
  let language=({en:'en',es:'es',pt:'pt-BR','pt-br':'pt-BR'})[(new URLSearchParams(location.search).get('lang')||'pt-BR').toLowerCase()]||'pt-BR';
  const textSources=new WeakMap(),attributeSources=new WeakMap();let observer;
  function t(value){const raw=String(value??'');if(language==='pt-BR'){if(raw==='distributorLine1')return 'DISTRIBUIDOR';if(raw==='distributorLine2')return 'OFICIAL';return raw;}return dictionary[raw]?.[language==='en'?0:1]??raw;}
  function translate(value){
    const raw=value.trim();let result=t(raw);
    if(result===raw&&language!=='pt-BR'){
      const en=language==='en';
      const patterns=[
        [/^Base consultada em (.+)\. Atualização automática a cada 5 minutos\. Disponibilidade sujeita a confirmação\.$/,m=>en?`Last checked: ${m[1]}. Automatically refreshed every 5 minutes. Availability subject to confirmation.`:`Última consulta: ${m[1]}. Actualización automática cada 5 minutos. Disponibilidad sujeta a confirmación.`],
        [/^(\d+) (item|itens)( · demonstração)?$/,m=>`${m[1]} ${en?(m[1]==='1'?'item':'items'):(m[1]==='1'?'artículo':'artículos')}${m[3]?' · demo':''}`],
        [/^(\d+) ITENS$/,m=>`${m[1]} ${en?(m[1]==='1'?'ITEM':'ITEMS'):(m[1]==='1'?'ARTÍCULO':'ARTÍCULOS')}`],
        [/^(\d+) (item|itens) nesta coleção$/,m=>en?`${m[1]} ${m[1]==='1'?'item':'items'} in this collection`:`${m[1]} ${m[1]==='1'?'artículo':'artículos'} en esta colección`],
        [/^(\d+) itens para consulta técnica\.$/,m=>en?`${m[1]} items for technical reference.`:`${m[1]} artículos para consulta técnica.`],
        [/^Estoque (.+) · (.+)$/,m=>`${en?'Stock':'Existencias'} ${m[1]} · ${t(m[2])}`],
        [/^Estoque (.+)$/,m=>`${en?'Stock':'Existencias'} ${m[1]}`],
        [/^Prioridade: (.+)$/,m=>`${en?'Priority':'Prioridad'}: ${t(m[1])}`],
        [/^Atendimento: (.+)$/,m=>`${en?'Contact':'Atención'}: ${m[1]}`],
        [/^Falar com (.+) ↗$/,m=>`${en?'Contact':'Hablar con'} ${m[1]} ↗`],
        [/^(.+) pelo WhatsApp ↗$/,m=>`${t(m[1])} ${en?'on':'por'} WhatsApp ↗`],
        [/^\+ (\d+) (foto|fotos)$/,m=>`+ ${m[1]} ${en?'photos':'fotos'}`],
        [/^CATÁLOGO \/ (.+)$/,m=>`${en?'CATALOG':'CATÁLOGO'} / ${m[1]}`],
        [/^CF INDUSTRIAL \/ (.+)$/,m=>`CF INDUSTRIAL / ${t(m[1])}`],
        [/^Panfleto A5 pronto com o contato de (.+)\.$/,m=>en?`A5 flyer ready with ${m[1]}'s contact details.`:`Folleto A5 listo con el contacto de ${m[1]}.`],
        [/^Não foi possível atualizar agora\. Mantidos os dados da última consulta\. (.+)$/,m=>(en?'Unable to refresh. Keeping the last successful data. ':'No se pudo actualizar. Se conservan los últimos datos. ')+t(m[1])]
      ];
      for(const [pattern,replace] of patterns){const match=raw.match(pattern);if(match){result=replace(match);break;}}
    }
    return value.slice(0,value.indexOf(raw))+result+value.slice(value.indexOf(raw)+raw.length);
  }
  function withLanguage(value){const url=new URL(value,location.href);if(language==='pt-BR')url.searchParams.delete('lang');else url.searchParams.set('lang',language);return url;}
  function shouldSkip(node){const p=node.parentElement;if(!p||p.closest('script,style,textarea,.product-name,.technical p,#detail-title'))return true;
    if(p.tagName==='DD'){const dt=p.previousElementSibling,source=dt&&[...dt.childNodes].map(n=>textSources.get(n)?.source||n.textContent).join('').trim();if(source==='Aplicação'||source==='Descrição técnica')return true;}return false;}
  function walk(root){
    if(root.nodeType===3){if(shouldSkip(root)||!root.nodeValue.trim())return;const previous=textSources.get(root),source=previous&&previous.last===root.nodeValue?previous.source:root.nodeValue,next=translate(source);textSources.set(root,{source,last:next});if(root.nodeValue!==next)root.nodeValue=next;return;}
    if(root.nodeType!==1&&root.nodeType!==9&&root.nodeType!==11)return;
    if(root.nodeType===1){
      if(root.matches('script,style,textarea'))return;
      if(root.tagName==='OPTION'&&!root.hasAttribute('value'))root.setAttribute('value',root.value);
      for(const attr of ['aria-label','placeholder','title']){if(!root.hasAttribute(attr))continue;let source=attributeSources.get(root);if(!source){source={};attributeSources.set(root,source);}if(!source[attr])source[attr]=root.getAttribute(attr);const next=translate(source[attr]);if(root.getAttribute(attr)!==next)root.setAttribute(attr,next);}
    }
    for(const child of [...root.childNodes])walk(child);
  }
  function links(){
    for(const a of document.querySelectorAll('a[data-flyer],a.print-qr,.seller-context a,.toolbar>a')){const url=withLanguage(a.href);if(a.href!==url.href)a.href=url.href;if(a.hasAttribute('data-qr-url'))a.dataset.qrUrl=url.href;}
    for(const input of document.querySelectorAll('input.seller-url'))input.value=withLanguage(input.value).href;
  }
  function apply(root=document.body){observer?.disconnect();walk(root);links();document.documentElement.lang=language;document.title=document.querySelector('#renderer')?(new URLSearchParams(location.search).get('produto')||'CF Industrial')+' — '+t('Panfleto A5 CF Industrial'):t('Catálogo técnico | CF Industrial');for(const a of document.querySelectorAll('[data-cf-language]')){const selected=a.dataset.cfLanguage===language;a.setAttribute('aria-current',selected?'true':'false');const url=new URL(location.href);url.searchParams.set('lang',a.dataset.cfLanguage);a.href=url.href;}observer?.observe(document.body,{childList:true,characterData:true,subtree:true});}
  function setLanguage(next){if(!['pt-BR','en','es'].includes(next))return;language=next;const url=new URL(location.href);url.searchParams.set('lang',next);history.replaceState(null,'',url);document.dispatchEvent(new CustomEvent('cf:languagechange'));apply();}
  function whatsappMessage(p){if(language==='pt-BR')return p?`Olá, gostaria de informações sobre ${p.familia==='Serviços'?'o serviço':p.familia==='Máquinas'?'a máquina':p.familia==='Componentes'?'o componente':'a ferramenta'} ${p.codigo} – ${p.nome}.`:'Olá, gostaria de solicitar uma análise ou orçamento.';
    if(!p)return language==='en'?'Hello, I would like to request an assessment or quote.':'Hola, quisiera solicitar un análisis o presupuesto.';
    return language==='en'?`Hello, I would like information about ${p.codigo} – ${p.nome}.`:`Hola, quisiera información sobre ${p.codigo} – ${p.nome}.`;
  }
  window.CF_I18N={t,apply,setLanguage,withLanguage,whatsappMessage,get language(){return language;},get locale(){return language==='en'?'en-US':language==='es'?'es-ES':'pt-BR';}};
  const host=document.querySelector('.navigation')||document.querySelector('.toolbar');
  if(host){const bar=document.createElement('div');bar.className='cf-language-switch';bar.setAttribute('aria-label','Idioma');for(const [id,label,name,flag] of [['pt-BR','PT','Português do Brasil','br'],['en','EN','English','us'],['es','ES','Español','es']]){const a=document.createElement('a');a.dataset.cfLanguage=id;a.lang=id;a.hreflang=id;a.setAttribute('aria-label',name);a.innerHTML=`<img src="assets/img/flags/${flag}.svg" width="22" height="15" alt="" aria-hidden="true"><span>${label}</span>`;a.onclick=e=>{if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();setLanguage(id);};bar.append(a);}host.insertBefore(bar,host.querySelector('button.print-button')||host.querySelector(':scope>div'));}
  apply();
  observer=new MutationObserver(records=>{observer.disconnect();for(const r of records){if(r.type==='characterData')walk(r.target);else for(const n of r.addedNodes)walk(n);}links();observer.observe(document.body,{childList:true,characterData:true,subtree:true});});
  observer.observe(document.body,{childList:true,characterData:true,subtree:true});
})();
