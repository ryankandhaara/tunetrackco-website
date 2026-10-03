        (() => {
            const initTabs = () => {
                const tabs = [...document.querySelectorAll('.tab-content')];
                const nav = [...document.querySelectorAll('.nav-pill[data-target], .inline-nav[data-target]')];
                if (!tabs.length || !nav.length) return;
                const show = (id, updateHash = true) => {
                    const target = document.getElementById(id);
                    if (!target) return;
                    tabs.forEach(s => s.classList.toggle('active', s === target));
                    document.querySelectorAll('.nav-pill[data-target]').forEach(a => a.classList.toggle('active', a.dataset.target === id));
                    if (updateHash && history.replaceState) history.replaceState(null, '', '#' + id);
                    if (id !== 'catalogue') { const idx = document.getElementById('catalogue-index'), exp = document.getElementById('catalogue-explore'); if (idx && exp) { idx.hidden = true; exp.hidden = false; exp.setAttribute('aria-expanded', 'false'); } }
                };
                nav.forEach(a => a.addEventListener('click', e => {
                    if (a.classList.contains('disabled')) return;
                    const id = a.dataset.target;
                    if (!id) return;
                    e.preventDefault();
                    show(id);
                }));
                const hash = location.hash.slice(1);
                show(document.getElementById(hash) ? hash : 'my-products', false);
            };
            if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initTabs, { once: true }); else initTabs();
        })();
