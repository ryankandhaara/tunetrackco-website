        (() => {
            const initNotifications = () => {
                const root = document.getElementById('ttNotification');
                const trigger = document.getElementById('ttNotificationTrigger');
                const menu = document.getElementById('ttNotificationMenu');
                const list = document.getElementById('ttNotificationList');
                const count = document.getElementById('ttNotificationCount');

                if (!root || !trigger || !menu || !list || !count) return;

                let notifications = [];

                const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
                    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
                }[char]));

                const render = () => {
                    const unread = notifications.filter((item) => !item.read).length;
                    count.textContent = unread > 99 ? '99+' : String(unread);
                    count.hidden = unread === 0;

                    if (!notifications.length) {
                        list.innerHTML = '<div class="tt-notification-empty">You’ve got no messages yet!</div>';
                        return;
                    }

                    list.innerHTML = notifications.map((item, index) => `
                        <button class="tt-notification-item" type="button" data-index="${index}">
                            <div class="tt-notification-item-title">${escapeHtml(item.title)}</div>
                            <div class="tt-notification-item-message">${escapeHtml(item.message)}</div>
                        </button>
                    `).join('');
                };

                const setOpen = (open) => {
                    menu.hidden = !open;
                    trigger.setAttribute('aria-expanded', String(open));
                };

                trigger.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setOpen(menu.hidden);
                });

                menu.addEventListener('click', (event) => {
                    const item = event.target.closest('[data-index]');
                    if (!item) return;
                    const index = Number(item.dataset.index);
                    if (notifications[index]) {
                        notifications[index].read = true;
                        window.TuneTrackNotifications?.onRead?.(notifications[index].id);
                    }
                    render();
                });

                document.addEventListener('click', (event) => {
                    if (!root.contains(event.target)) setOpen(false);
                });

                const banner = document.createElement('div');
                banner.className = 'tt-notification-banner';
                banner.innerHTML = `
                    <span class="tt-notification-banner-dot"></span>
                    <div>
                        <div class="tt-notification-banner-title"></div>
                        <div class="tt-notification-banner-message"></div>
                    </div>
                `;
                document.body.appendChild(banner);

                window.TuneTrackNotifications = {
                    setItems(items) {
                        notifications = Array.isArray(items) ? items : [];
                        render();
                    },
                    show(title, message, options = {}) {
                        if (options.addToList !== false) {
                            notifications.unshift({ title, message, read: false, id: options.id || null });
                            render();
                        }

                        banner.querySelector('.tt-notification-banner-title').textContent = title;
                        banner.querySelector('.tt-notification-banner-message').textContent = message;
                        banner.classList.remove('is-visible');
                        void banner.offsetWidth;
                        banner.classList.add('is-visible');
                    },
                    add(title, message, id = null) {
                        notifications.unshift({ title, message, read: false, id });
                        render();
                    },
                    clear() {
                        notifications = [];
                        render();
                    },
                    onRead: null
                };

                render();
            };

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initNotifications, { once: true });
            } else {
                initNotifications();
            }
        })();
