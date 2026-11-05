# Atualização do estoque e das imagens — CF Industrial

## O que já foi alterado localmente no catálogo

- Ao abrir/recarregar: consulta nova à API, sem reaproveitar uma resposta antiga do navegador.
- Com a aba visível: consulta silenciosa a cada 5 minutos, controlada por `AUTO_REFRESH_MS` no `config.js`.
- Ao voltar de uma aba oculta: consulta imediatamente se o intervalo já venceu. Não se acumulam consultas enquanto a aba fica oculta.
- Atualiza estoque PR/SC, prioridade, status, nome, aplicação, descrição, classificação e os outros campos normalizados da API.
- Mantém filtros, posição, produto aberto, imagem selecionada e zoom. Se o item for desativado/removido, mantém a janela aberta com aviso de indisponibilidade e retira os CTAs desse item.
- Imagens e galeria são mantidas enquanto as referências às imagens não mudarem. Uma foto nova no JSON atualiza somente a parte necessária.
- Falha de rede não apaga os dados já carregados. A data da última consulta continua disponível.
- Não altera o conteúdo durante a impressão. Não há consultas sobrepostas.

Isso é uma consulta por aba visível a cada 5 minutos. Não é uma automação que precisa ficar lendo a planilha quando ninguém está usando o catálogo. A próxima abertura sempre consulta a base novamente.

## Arquivos do site para enviar manualmente ao GitHub

1. `catalogo/index.html`
2. `catalogo/panfleto.html`
3. `catalogo/assets/js/config.js`
4. `catalogo/assets/js/api.js`
5. `catalogo/assets/js/catalogo.js`
6. `catalogo/assets/js/sync-dom.js` — novo

Não é necessário publicar `apps-script/` ou `tests/` no site. Apps Script é atualizado separadamente.

## Substituir o código apenas em “API Catálogo CF Industrial”

1. Abra o projeto **API Catálogo CF Industrial**, não o projeto **CF Industrial — Movimentação de Estoque**.
2. Copie o código completo de `API-Catalogo-CF-Industrial.gs`.
3. Substitua o código anterior da API por ele e salve. Não mantenha os dois códigos juntos, pois ambos declaram `CONFIG` e as mesmas funções.
4. No Apps Script, entre em **Implantar → Gerenciar implantações**, edite a implantação existente e selecione **Nova versão → Implantar**. Mantenha o acesso público que já está funcionando e a mesma URL `/exec`.
5. Só então execute uma vez **`configurarAutomacao`** no editor. Essa função atualiza as fotos imediatamente e mantém um único gatilho de imagens a cada 2 horas.
6. Não crie gatilho de estoque: cada chamada da API já lê a aba ESTOQUE em tempo real. O catálogo faz as consultas a cada 5 minutos.

As funções de implantação em produção seguem o mecanismo de [implantações versionadas do Apps Script](https://developers.google.com/apps-script/concepts/deployments).

## Atualizar imagens quando precisar

No mesmo projeto da API, selecione a função **`atualizarImagensAgora`** no menu ao lado de Executar e clique em **Executar**. Use após adicionar, remover, renomear ou mover fotos/pastas.

Quando ela terminar, clique em **Atualizar dados** no catálogo ou aguarde a próxima consulta automática. Nenhuma mudança de código do catálogo é necessária. Se o panfleto já estiver aberto, gere-o novamente para usar as novas fotos. O script não modifica permissões de compartilhamento; as imagens precisam continuar públicas.

Essa operação não é exposta por um parâmetro público da API, para que visitantes não disparem varreduras pesadas do Drive.

## E se quiser imagens a cada 10 minutos?

Primeiro execute `atualizarImagensAgora` e veja `verificarStatus`. O campo **`duracao_ms`** informa o tempo real da última varredura, junto das quantidades de códigos e fotos. Esse tempo não foi medido no seu Google nesta entrega.

O padrão entregue continua sendo **2 horas** para evitar aumentar uma operação pesada sem medição. Se decidir usar 10 minutos após avaliar a execução real, execute **`configurarAutomacao10Minutos`** uma vez. Para voltar, execute **`configurarAutomacao`**. Ambas substituem somente o gatilho `atualizarCacheDrive` deste projeto; não removem gatilhos de outras funções.

Alterar apenas `CACHE_SECONDS` não agenda nova varredura: o índice persistente continua existindo. A frequência é definida pelo gatilho. O Apps Script oferece gatilhos de [minutos ou horas](https://developers.google.com/apps-script/reference/script/clock-trigger-builder).

## O que o novo código preserva e melhora

A resposta pública e os campos dos produtos são mantidos. A planilha é somente lida; não são feitas escritas em ESTOQUE, ENTRADA, SAÍDA ou TELA ENT. E SAÍDA.

O índice de imagens usa cache rápido comprimido e uma cópia persistente. O formato V3 anterior é reconhecido na primeira leitura. Uma trava do projeto evita varreduras simultâneas. Uma nova geração persistente só é publicada após os blocos serem salvos. Falhas na varredura preservam o índice anterior.

Testes locais: fluxo real do navegador com relógio simulado e respostas controladas, mais testes do Apps Script com serviços Google simulados. Foram verificados saldos zero, prioridade, INATIVO, fotos estáveis, filtros, galeria/zoom, falha de rede, aba oculta, impressão, atualização manual de imagens, cache antigo, compressão e gatilhos. Resultados em `tests/atualizacao-resultados.json` e `tests/apps-script-resultados.json`.

O código está pronto para substituir na API; não foi instalado no Google nem publicado pelo assistente.
