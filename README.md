# Site CF Industrial

Site institucional estático da **CF Industrial**, desenvolvido em HTML5, CSS3 e JavaScript puro para publicação no GitHub Pages.

## Estrutura

- Home
- Empresa
- Hub de Serviços
- Corte a laser de metais
- Corte e gravação laser CO₂
- Usinagem CNC
- Tornearia
- Fresagem
- Soldagem
- Impressão 3D
- Ferramentais e dispositivos
- Hub de Transmissão Automática
- Ferramentas especiais
- Recuperação de conversor de torque
- Recuperação de corpo de válvulas
- Máquinas e dispositivos
- Projetos
- Contato/orçamento via WhatsApp
- 404
- sitemap.xml
- robots.txt
- CNAME
- JSON-LD por página

## Publicação no GitHub Pages

1. Enviar todo o conteúdo desta pasta para o repositório `groupbrazilian/Site_CF`.
2. Em **Settings > Pages**, selecionar a branch de publicação (normalmente `main`) e a raiz `/`.
3. O projeto usa caminhos relativos e funciona no GitHub Pages mesmo antes do domínio próprio.
4. O arquivo `CNAME` já contém:
   `www.cfindustrial.com.br`
5. Configurar o DNS somente quando for o momento da virada do domínio.

## Antes de publicar em produção

### Obrigatório
- Substituir `assets/icons/logo-cf-industrial.svg` pela logo oficial, mantendo o mesmo nome ou atualizando os caminhos.
- Substituir todas as imagens temporárias `.webp` por fotografias reais da CF Industrial.
- Confirmar materiais, dimensões, espessuras, tolerâncias e capacidades das máquinas antes de adicionar números técnicos.
- Confirmar o e-mail definitivo. O projeto usa provisoriamente `contato@cfindustria.com.br`, encontrado em cadastro público/site antigo.
- Confirmar telefone `(41) 3798-5782` e WhatsApp `(41) 98751-7276` — estes vieram do briefing do projeto.
- Testar links, WhatsApp e navegação mobile.
- Validar Schema no Rich Results Test/Schema.org Validator.
- Enviar o sitemap no Google Search Console e Bing Webmaster Tools.

## Imagens

As imagens incluídas são **placeholders próprios**, não fotos de terceiros. Elas existem para o site funcionar sem links quebrados durante o desenvolvimento.

Ao substituir:
- usar `.webp`, `.jpg`, `.jpeg` ou `.png`;
- comprimir;
- usar dimensões adequadas;
- evitar imagens enormes;
- atualizar `alt` para descrever a foto real;
- manter `width` e `height`.

O site tenta primeiro a versão `.webp`. Se ela não existir, tenta automaticamente
o mesmo nome com `.jpg`, `.jpeg` e `.png`, nessa ordem. Por exemplo,
`hero-cf-industrial.webp` pode ser substituída por `hero-cf-industrial.jpg`
sem alterar o HTML.

## SEO

Cada página possui:
- title exclusivo;
- meta description;
- canonical;
- H1 único;
- Open Graph;
- Twitter Card;
- JSON-LD;
- breadcrumbs quando aplicável;
- links internos.

## Formulário de orçamento

Não há backend. O formulário da página de contato:
1. coleta os dados somente no navegador;
2. gera uma mensagem;
3. abre o WhatsApp da CF Industrial.

Nenhum dado é armazenado pelo site.

## Migração do domínio antigo

Não desligar o domínio antigo sem plano de redirecionamento. Preparar redirecionamentos 301 das URLs antigas para as novas equivalentes e manter o domínio antigo ativo durante a migração.

Consulte também `SEO-MIGRACAO.md` e `CHECKLIST-PUBLICACAO.md`.


## Padrão definitivo de imagens

O HTML deve manter nomes-base fixos. Para trocar uma foto futuramente, substitua
o arquivo dentro da pasta mantendo o mesmo nome-base e uma das extensões
`.webp`, `.jpg`, `.jpeg` ou `.png`.

Principais arquivos:

- `assets/img/hero-cf-industrial.webp` — capa principal da Home
- `assets/img/corte-laser-metais-cf-industrial.webp` — máquina/processo de corte a laser de metais
- `assets/img/corte-gravacao-laser-co2-cf-industrial.webp` — máquina/processo laser CO₂
- `assets/icons/logo-cf-industrial.png` — símbolo/logo principal

A mesma regra deve ser utilizada para os demais serviços. Não é necessário editar o HTML para trocar a imagem se o nome do arquivo permanecer igual.
# Revisão do site principal — 28/10/2026

O site principal agora tem versões estáticas completas em português do Brasil (raiz), espanhol (`es/`) e inglês (`en/`). O seletor PT/ES/EN leva à mesma página em outro idioma. São 57 páginas, incluindo compatibilidade de Projetos e páginas 404. Títulos, descrições, textos, perguntas frequentes, atributos acessíveis, formulário e mensagens de WhatsApp foram traduzidos. Não há tradutor externo, fonte remota ou biblioteca de interface.

Projetos sob medida integra `servicos/index.html#projetos` e o menu de Serviços. A antiga rota `projetos/` encaminha à seção equivalente. Contatos tem um botão para o catálogo geral, sem parâmetro de vendedor. O catálogo existente não foi alterado nesta revisão e continua em português.

Toda a tipografia usa a fonte local Bebas Neue. A licença está em `assets/fonts/OFL-BebasNeue.txt`. Favicon PNG/ICO e ícones de dispositivo usam o símbolo CF real. WhatsApp flutuante é verde, com o símbolo oficial; rodapés têm os quatro links sociais confirmados pelo usuário e a assinatura fornecida da PDA Soluções. Mantidos os telefones do site principal, diferentes dos contatos comerciais do catálogo.

As nove imagens grandes usadas pelo site foram convertidas para WebP, de aproximadamente 13,9 MB para 1,1 MB no conjunto. Originais foram preservados; o navegador recebe os arquivos menores. Imagens abaixo da primeira tela carregam sob demanda.

Publicação manual: atualize os HTMLs das pastas do site principal, `index.html`, `404.html`, as novas pastas `en/` e `es/`, `assets/`, `favicon.ico`, `sitemap.xml` e `site.webmanifest`. Veja a relação em `ARQUIVOS-PARA-PUBLICAR-SITE.txt`. Não é necessário reenviar `catalogo/`, `site-tools/` ou as capturas dos testes. Nada foi publicado pelo assistente; CNAME, DNS e Apps Script não foram alterados.

Verificação: 57 páginas com três idiomas e sem links locais quebrados; 21 combinações de páginas/idiomas no navegador, menu de celular, ausência de rolagem lateral, formulário sem envio real de mensagem, botão do catálogo geral, fonte, imagens, assinatura e redes. Resultados em `site-tools/resultado-estatico.json` e `site-tools/resultado-browser.json`. Prévia: `node site-tools/preview.cjs`, depois `http://127.0.0.1:4174/`.

Manutenção das traduções: português nos HTMLs originais; pares inglês/espanhol em `site-tools/traducoes.tsv`, referenciados pelo inventário `site-tools/textos.json`; gerar novamente com `site-tools/gerar_idiomas.py`. Novos textos precisam de tradução nesse dicionário. O script `preparar_site.py` é a preparação inicial desta revisão e não precisa ser repetido para mudar textos.

