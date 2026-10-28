(() => {
  const toggle = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-nav]');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  document.querySelectorAll('.dropdown > a').forEach(link => {
    link.addEventListener('click', (event) => {
      if (window.innerWidth <= 1020) {
        const parent = link.closest('.dropdown');
        if (!parent.classList.contains('is-open')) {
          event.preventDefault();
          parent.classList.add('is-open');
        }
      }
    });
  });

  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  document.querySelectorAll('img[src*="assets/img/"]').forEach(image => {
    const source = image.getAttribute('src');
    if (!source) return;

    const extension = source.match(/\.[^.]+$/)?.[0].toLowerCase();
    if (!extension) return;

    const alternatives = ['.webp', '.jpg', '.jpeg', '.png']
      .filter(candidate => candidate !== extension)
      .map(candidate => source.slice(0, -extension.length) + candidate);
    let nextAlternative = 0;
    const tryNextAlternative = () => {
      if (nextAlternative < alternatives.length) {
        image.src = alternatives[nextAlternative++];
      }
    };

    image.addEventListener('error', tryNextAlternative);
    if (image.complete && image.naturalWidth === 0) tryNextAlternative();
  });

  const budgetForm = document.querySelector('[data-whatsapp-form]');
  if (budgetForm) {
    const language = document.documentElement.lang.split('-')[0];
    const copy = ({
      en: {intro:'Hello, I found CF Industrial through your website and would like to request a quote.',name:'Name',company:'Company',service:'Service',material:'Material',dimensions:'Dimensions',quantity:'Quantity',deadline:'Required deadline',details:'Details',missing:'Not provided',define:'To be defined',arrange:'To be agreed',none:'No additional details',attachment:'If needed, I will send a drawing, file or photo in the conversation.'},
      es: {intro:'Hola, encontré CF Industrial en su sitio web y quisiera solicitar un presupuesto.',name:'Nombre',company:'Empresa',service:'Servicio',material:'Material',dimensions:'Medidas',quantity:'Cantidad',deadline:'Plazo deseado',details:'Detalles',missing:'No informado',define:'Por definir',arrange:'A convenir',none:'Sin detalles adicionales',attachment:'Si es necesario, enviaré un plano, archivo o foto en la conversación.'},
      pt: {intro:'Olá, encontrei a CF Industrial pelo site e gostaria de solicitar um orçamento.',name:'Nome',company:'Empresa',service:'Serviço',material:'Material',dimensions:'Medidas',quantity:'Quantidade',deadline:'Prazo desejado',details:'Detalhes',missing:'Não informado',define:'A definir',arrange:'A combinar',none:'Sem detalhes adicionais',attachment:'Se necessário, enviarei desenho, arquivo ou foto na sequência.'}
    })[language] || {};
    budgetForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(budgetForm);
      const value = key => String(data.get(key) || '').trim();
      const lines = [
        copy.intro,
        '',
        `${copy.name}: ${value('nome')}`,
        `${copy.company}: ${value('empresa') || copy.missing}`,
        `${copy.service}: ${value('servico')}`,
        `${copy.material}: ${value('material') || copy.define}`,
        `${copy.dimensions}: ${value('medidas') || copy.define}`,
        `${copy.quantity}: ${value('quantidade') || copy.define}`,
        `${copy.deadline}: ${value('prazo') || copy.arrange}`,
        `${copy.details}: ${value('detalhes') || copy.none}`,
        '',
        copy.attachment
      ];
      const url = `https://wa.me/5541987517276?text=${encodeURIComponent(lines.join('\n'))}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    });
  }
})();
