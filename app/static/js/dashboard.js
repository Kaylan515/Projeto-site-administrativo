(() => {
    const rows = document.querySelectorAll('.dashboard-page tbody tr');
    rows.forEach(row => {
        const link = row.querySelector('.td-name');
        if (!link) return;
        row.classList.add('is-clickable');
        row.addEventListener('click', event => {
            if (event.defaultPrevented || event.target.closest('a') || window.getSelection()?.toString()) return;
            window.location.assign(link.href);
        });
    });

    const filter = document.querySelector('#movement-type');
    if (filter) {
        const empty = document.querySelector('#movement-filter-empty');
        filter.closest('label').hidden = false;
        const updateRows = () => {
            let visible = 0;
            rows.forEach(row => {
                row.hidden = Boolean(filter.value && row.dataset.movementType !== filter.value);
                if (!row.hidden) visible++;
            });
            empty.textContent = visible ? '' : 'Nenhuma movimentação deste tipo entre as recentes.';
        };
        filter.addEventListener('change', updateRows);
        updateRows();
    }

    const legend = document.querySelector('.stock-pie-legend');
    if (!legend) return;
    const share = document.querySelector('.stock-pie-share');
    const formatShare = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });
    let selected = null;

    legend.querySelectorAll('.stock-pie-item').forEach(item => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = item.className;
        button.dataset.percentual = item.dataset.percentual;
        button.style.setProperty('--stock-color', item.style.getPropertyValue('--stock-color'));
        button.setAttribute('aria-pressed', 'false');
        const percentage = document.createElement('span');
        percentage.className = 'stock-pie-percentage';
        percentage.textContent = formatShare.format(Number(button.dataset.percentual)) + '%';
        button.append(...item.childNodes, percentage);
        item.replaceWith(button);
        button.addEventListener('click', () => {
            selected?.setAttribute('aria-pressed', 'false');
            selected = selected === button ? null : button;
            selected?.setAttribute('aria-pressed', 'true');
            share.textContent = selected ? percentage.textContent : '';
            share.style.setProperty('--stock-color', selected ? button.style.getPropertyValue('--stock-color') : '');
        });
    });
})();
