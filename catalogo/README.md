# Catálogo digital CF Industrial

Versão independente em `catalogo/`. O site institucional não foi alterado. Nenhuma publicação, deploy, operação no GitHub ou alteração de DNS foi realizada.

## Abrir localmente

Na pasta `C:\Users\admin\Documents\Site CF`, execute:

```powershell
node catalogo/servidor.cjs
```

Abra http://127.0.0.1:4173/catalogo/ . Mantenha o terminal aberto; Ctrl+C encerra o servidor. Requer Node.js. O servidor entrega somente este catálogo e escuta somente em 127.0.0.1. Não é um backend de produtos.

Alternativa com Python:

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Nesse caso, abra o mesmo endereço `/catalogo/`. Não abra por duplo clique/file://: navegadores podem bloquear a consulta ao JSON local e à API.

## Situação verificada da integração

Revalidação em 06/10/2026: a URL `/exec` original retornou HTTP 200, `application/json` e 70 produtos, sem autenticação. O Apps Script foi mantido intacto. A configuração continua `USE_MOCK_DATA: false`. A opção de demonstração foi retirada da tela de erro: a navegação padrão consulta somente dados reais, sem fallback para mock. O mock opcional do briefing permanece apenas para desenvolvimento mediante alteração explícita da configuração.

Teste direto no Chrome, sem interceptar a API: 70 produtos carregados; 60 ferramentas, 10 sem tipo e 60 registros com imagens. Todas as categorias retornadas estão vazias. A imagem do TK7464 carregou e sua galeria de duas imagens foi validada, assim como desktop e celular. Uma primeira consulta expirou; a repetição funcionou. O timeout foi ampliado para 60 segundos. Resultado detalhado: `tests/api-real-resultado.json`.

A base contém campos ainda não preenchidos. Tipos vazios ficam em Não classificados, categorias vazias em Sem categoria e estoques vazios em Sob consulta. O front-end não inventa classificação, estoque, descrição ou aplicação. Imagens vêm das URLs retornadas pela API; arquivos indisponíveis usam placeholder.

O conector Google Drive não encontrou os materiais de referência na etapa inicial. Logo e fotografia editorial foram copiadas do site institucional local. Essa limitação não impede o consumo dos produtos e imagens retornados pela API.

## Estrutura

- `index.html`: capa, índice, controles, contato e janela de detalhes.
- `assets/css/catalogo.css`: identidade clara, responsividade e impressão A4.
- `assets/js/config.js`: URL única da API, modo mock, timeout, WhatsApp e itens por página.
- `assets/js/api.js`: consulta, cache em memória, validação e normalização.
- `assets/js/catalogo.js`: índice, dois layouts editoriais, paginação adaptativa, busca, filtros, galeria, deep link e QR Codes.
- `assets/js/qrcodegen.js`: biblioteca QR Code do Project Nayuki, licença MIT preservada no arquivo; executada localmente, sem CDN ou serviço de QR.
- `assets/img/`: logo, imagem editorial e placeholder.
- `data/catalogo-mock.json`: exemplos de códigos e nomes recebidos no briefing; sem estoque, aplicação ou categorias inventados.
- `servidor.cjs`: servidor local sem dependências adicionais.
- `tests/verificar.cjs`: verificação em navegador com respostas controladas; fixtures de teste não são produtos do catálogo.
- `catalogo-cf-industrial.pdf`: exportação atual com Família → Categoria → Item, 63 páginas A4 e 78 itens da consulta pública. Algumas imagens retornadas pelo Drive exigem login e aparecem com a imagem de reserva.
- `catalogo-demonstracao.pdf`: amostra histórica da primeira entrega; não representa o layout atual. Não usar como PDF final.

## Dados e atualização

Textos, famílias, categorias, prioridade, status e estoque vêm exclusivamente da API em produção. Formatos aceitos: array ou lista em `produtos`, `items`, `data`, `dados`; aceita também `data.produtos`. Campos principais: `codigo`, `nome`, `familia`, `tipo` (compatibilidade), `categoria`, `prioridade`, `descricao`, `aplicacao`, `estoque_pr`, `estoque_sc`, `status`, `imagem`, `imagem_grande`, `imagens`, `quantidade_imagens`. Cada imagem pode fornecer `url` e `thumbnail`.

Família é o primeiro agrupamento, com Ferramentas, Componentes, Máquinas e Serviços, nessa ordem. `familia` prevalece sobre `tipo`, que é usado somente se Família estiver ausente. A categoria é agrupada dentro de sua família; depois os itens são ordenados por descrição, nome e código em português. Não se presume família pelo nome ou código. Dados de família desconhecida mantêm seu valor; apenas registros sem família e sem tipo usam Outros. Categorias vazias não geram uma contra-capa vazia. Prioridade INATIVO é removida defensivamente, embora a API já omita esses itens. Estoques vazios em Serviços são ocultados por região, inclusive nos detalhes; zero é preservado.

- **Adicionar produtos**: incluir uma linha na planilha e garantir que a API retorne o item com Família e Categoria corretas. Não editar HTML.
- **Adicionar categorias**: preencher Categoria na planilha; a nova seção será criada ao atualizar a base.
- **Adicionar imagens**: colocar as imagens na pasta do código sob Ferramentas, Maquinas ou Serviços. O cruzamento entre essas pastas e os códigos é responsabilidade da API existente. O catálogo aceita as imagens retornadas para qualquer tipo, sem restringir a pasta de origem. O card usa `imagem` e, no padrão múltiplo, `imagens[1].thumbnail` (com fallback para `url`). Fotos adicionais só entram no detalhe, que usa `imagem_grande` e a galeria completa. O vínculo não depende dos nomes dos arquivos. Acessibilidade pública das imagens é necessária.
- **Atualizar estoque**: editar Estoque PR/SC na planilha e atualizar os dados no catálogo. Não há escrita do catálogo na planilha.
- **Trocar API**: editar `API_URL` somente em config.js.
- **Ativar mock**: mudar `USE_MOCK_DATA` para `true`. O modo padrão não oferece demonstração em caso de falha. Voltar à API real restaura a consulta à URL configurada.
- **Alterar cores**: editar as variáveis `--orange`, `--ink`, `--support`, `--line` no início do CSS.

## Navegação e impressão

O índice limpa filtros antes de navegar para a seção. Pesquisa ignora diferenças de acentos e caixa. Busca por código, nome, aplicação, categoria, tipo e status. Filtros de tipo, categoria e status podem ser combinados. Imagens indisponíveis usam placeholder; dados são escapados antes de renderização; URLs de imagens são restritas a HTTP/HTTPS.

Os produtos têm apenas dois padrões automáticos: uma imagem vertical à esquerda do texto para `quantidade_imagens <= 1`; duas imagens empilhadas e largura inteira para `quantidade_imagens >= 2`. Mais fotos aparecem como `+ X fotos` no digital e ficam disponíveis no detalhe. Sem quantidade válida, usa-se a extensão de `imagens`. Máquinas e serviços podem usar largura inteira mesmo com uma foto. Aplicação, descrição e categoria aparecem apenas quando preenchidas; Ativo é omitido no card para reduzir ruído, mas permanece no detalhe.

O WhatsApp do catálogo é **(41) 98469-0680**, formato internacional `5541984690680`. Mensagens de produto incluem código e nome recebidos da API.

Imprimir / Gerar PDF abre a caixa nativa do navegador: selecione Salvar como PDF, papel A4, retrato, escala 100%. Desative os cabeçalhos e rodapés automáticos do navegador. Margens do catálogo: 10 mm. O mesmo conteúdo é usado no digital e na impressão. Controles, botões, orçamento e navegação ficam ocultos; o rodapé impresso mostra somente a página.

A página admite até seis itens simples (duas colunas e três linhas), quando os textos permitem. Produtos múltiplos usam largura inteira e mais espaço, com até dois produtos largos por folha quando os textos permitem. Os dois padrões podem compartilhar uma página. Antes da impressão, o catálogo mede as páginas em largura A4 e redistribui produtos se o texto causar excesso, preservando o conteúdo. Texto excepcionalmente maior que uma folha inteira ainda precisa de revisão editorial; não existe truncamento silencioso. `PRODUCTS_PER_PAGE` configura o orçamento inicial de espaço, com padrão 6; um item largo usa três unidades. A paginação é recalculada no contexto de impressão e a disposição digital é restaurada ao fechar a caixa de impressão.

Use Estoque na impressão para mostrar ou ocultar estoque. **Os filtros ativos definem os itens impressos**; clique em Limpar para imprimir o catálogo completo. No padrão simples, imprime-se uma foto; no múltiplo, somente as duas primeiras. O botão aguarda as imagens necessárias por até dez segundos; uma rede muito lenta pode exigir aguardar mais antes de imprimir. Fotos extras da galeria nunca são carregadas para a impressão.

O QR Code aparece somente na impressão/PDF, com geração local em SVG e margem branca de quatro módulos. Ele aponta para `https://www.cfindustrial.com.br/catalogo/?produto=CODIGO`. Esse endereço é o destino futuro solicitado; sua disponibilização pública depende da publicação manual futura. O equivalente local já funciona: `http://127.0.0.1:4173/catalogo/?produto=CF166`. Após a consulta à API, o produto é localizado pelo código e os detalhes abrem automaticamente. Código inexistente gera uma mensagem amigável, sem quebrar a página.

Algumas fotos originais retornadas pela API ainda contêm marcas da identidade anterior. O catálogo mantém as imagens originais; nenhuma foto do Drive foi retocada ou alterada. A identidade da interface é CF Industrial.

## Revisão atual: Família → Categoria → Item

Índice e filtro com as quatro famílias. Componentes usam imagens, galeria e QR da mesma forma que as demais famílias, com CTA próprio. Máquinas e Serviços mantêm nomes e CTAs próprios. O contexto da seção ganhou hierarquia tipográfica e barra laranja; na impressão fica compacto, em 10 pt nos cabeçalhos de produtos. Os números grandes das aberturas de família e categoria foram removidos; a numeração discreta de rodapé foi mantida.

Testes da consulta pública real: 78 itens, sendo 66 Ferramentas, 10 Componentes, 1 Máquina e 1 Serviço. TK200A confirmado como Componente; TK1717 como Ferramenta; MCVT como Máquina; SERV01 como Serviço. Índice, filtros combinados, busca, navegação do índice limpando filtros, detalhes, CTA por família, ausência de estoque vazio no serviço e largura de celular passaram. Também foi verificada a precedência de Família sobre tipo, compatibilidade com tipo, zero no estoque de Serviço e exclusão de prioridade INATIVO.

Imagens reais e de maior resolução foram solicitadas nos quatro casos. TK1717, MCVT e SERV01 carregaram; as imagens TK200A retornaram login do Google, confirmado fora do navegador. O catálogo preserva os links recebidos e aplica a imagem de reserva quando não são públicos. A exportação teve 15 posições de fotos com reserva ou indisponibilidade. Não houve alteração de compartilhamento do Drive nem de Apps Script.

PDF atual: 63 páginas A4, sem páginas vazias e sem excesso de altura nas páginas de produtos/aberturas. Conferidos visualmente índice, abertura e páginas dos casos principais. Evidências: `tests/verificar-familias.cjs`, `tests/familias-resultado.json`, `tests/conferir-pdf-familias.py`, `tests/familias-pdf-resultado.json` e capturas `tests/familias-pdf-*.png`.

## Histórico: fechamento anterior de 07/10/2026

Ordem fixa: Ferramentas, Máquinas, Serviços, Não classificados quando houver, e Contato. Produtos ordenados por categoria e descrição em português, com nome e código como desempate. O índice acompanha essa ordem; campos vazios ficam por último.

Capa substituída pela imagem original fornecida pelo usuário, sem recortes nem texto sobreposto. Páginas internas com faixa preta à direita, inclusive na impressão. Aberturas de categoria com faixa larga preta e laranja, título destacado e mosaico de até quatro produtos reais da categoria. Na impressão, a capa ocupa A4 inteiro; páginas internas mantêm margens de 10 mm.

O leitor aceita o cabeçalho `Ferramenta / Máquina / Serviços` quando presente no JSON. A consulta pública registrada em `tests/api-atual.json` trouxe 30 registros, todos com `nome` vazio. Nesse caso, o catálogo usa a descrição recebida como título, sem duplicá-la no corpo. Uma designação explícita começando com Máquina ou Serviço permite reconhecer o tipo mesmo quando a API informa Ferramenta ou omite o tipo; não se presume o tipo pelo código.

A MCVT veio com descrição “Máquina para testar polias CVT”, tipo Ferramenta e nenhuma imagem. Agora aparece em Máquinas. A API precisa retornar os nomes da coluna renomeada e as imagens dos códigos nas pastas Maquinas/Serviços para que esses dados apareçam automaticamente. O navegador não recebe os identificadores dessas pastas nem um índice de seus arquivos; a consulta ao Drive conectado também não os localizou. Nenhum Apps Script foi alterado.

Conferência desta revisão limitada à sintaxe dos arquivos alterados e à visualização da capa e de uma abertura de categoria, usando a resposta real já capturada. A MCVT foi confirmada em Máquinas e as aberturas não excederam a altura A4 no navegador. A bateria anterior não foi repetida e o PDF salvo anteriormente não foi reexportado.

## Verificação anterior ao fechamento

Refinamento validado em Chrome: desktop 1440×1000, tablet 768×1024 e celular 390×844. Testes cobrem 1, 2, 3 e 5 imagens, textos preenchidos e vazios, aplicação, categoria vazia, estoque nulo/zero/preenchido, galeria completa sob demanda, WhatsApp novo e deep link CF166. O PDF de teste confirmou seis itens simples numa folha, página mista e redistribuição de descrições extensas (quatro itens numa folha e dois na seguinte). O QR foi decodificado tanto a partir do SVG quanto diretamente de uma página de PDF renderizada a 300 dpi.

Teste com a API real: 70 registros; 60 ferramentas e 10 sem tipo; 17 itens no padrão simples e 53 no múltiplo; 29 com três ou mais imagens. CF166 abriu automaticamente pelo parâmetro `produto`. Todas as 123 imagens necessárias ao PDF finalizaram o carregamento; dez placeholders correspondem a registros sem fotos. O PDF real tem 39 páginas A4, sem controles de orçamento/detalhes. Estoques e categorias ainda vazios na base continuam tratados sem dados inventados.

- `tests/verificar-refinamento.cjs`: cenários controlados de layout, interação, impressão e QR. Fixtures não entram na produção.
- `tests/verificar-refinamento-real.cjs`: API e imagens reais, deep link CF166, capturas e exportação do PDF atual.
- `tests/verificar-qr-pdf.cjs`: decodificação do QR em página renderizada do PDF de teste.
- `tests/refinamento-resultados.json` e `tests/refinamento-real-resultado.json`: resultados.
- `tests/jsQR.js`: leitor usado somente pela verificação; não é carregado pelo catálogo.

Os testes usam Playwright do ambiente Codex e Chrome instalado. Em outro computador, ajustar os caminhos de dependências nos scripts. Nenhuma dependência de testes é necessária para navegar no catálogo. Biblioteca QR: [Project Nayuki](https://www.nayuki.io/page/qr-code-generator-library), licença MIT; leitor de teste: [jsQR](https://github.com/cozmo/jsQR), licença Apache-2.0.

## Publicação futura manual

Para publicação futura manual, copiar `index.html`, `assets/` e `data/` para `/catalogo/` na hospedagem do site. Caminhos são relativos e funcionam nesse subdiretório. Não enviar `tests/`, servidor local, README ou PDF de demonstração como arquivos de produção. Não precisa modificar DNS, CNAME ou instalar framework. Esta entrega **não foi publicada**.




