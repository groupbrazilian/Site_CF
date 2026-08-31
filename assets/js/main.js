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
    budgetForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(budgetForm);
      const value = key => String(data.get(key) || '').trim();
      const lines = [
        'Olá, encontrei a CF Industrial pelo site e gostaria de solicitar um orçamento.',
        '',
        `Nome: ${value('nome')}`,
        `Empresa: ${value('empresa') || 'Não informado'}`,
        `Serviço: ${value('servico')}`,
        `Material: ${value('material') || 'A definir'}`,
        `Medidas: ${value('medidas') || 'A definir'}`,
        `Quantidade: ${value('quantidade') || 'A definir'}`,
        `Prazo desejado: ${value('prazo') || 'A combinar'}`,
        `Detalhes: ${value('detalhes') || 'Sem detalhes adicionais'}`,
        '',
        'Se necessário, enviarei desenho, arquivo ou foto na sequência.'
      ];
      const url = `https://wa.me/5541987517276?text=${encodeURIComponent(lines.join('\n'))}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    });
  }
})();
