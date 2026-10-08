        /* =========================================================
           FREEBIES — KEEP VIEWPORT POSITION
           NO FORCED SCROLL LOOP
           ========================================================= */

        (function () {
            let savedScrollY = 0;
            let restoring = false;

            function savePosition() {
                savedScrollY = window.scrollY;
            }

            function restorePosition() {
                if (!restoring) return;

                if (Math.abs(window.scrollY - savedScrollY) > 0) {
                    window.scrollTo(0, savedScrollY);
                }
            }

            /* Hanya lock ketika user membuka category card */
            document.addEventListener("click", function (event) {

                const card = event.target.closest(
                    ".tt-freebie-category-card, .freebie-category-card, [data-freebie-card]"
                );

                if (!card) return;

                savePosition();
                restoring = true;

                /*
                 * Satu kali restore setelah browser menyelesaikan
                 * perubahan layout. Tidak ada interval / RAF loop.
                 */
                requestAnimationFrame(() => {
                    restorePosition();

                    requestAnimationFrame(() => {
                        restorePosition();

                        setTimeout(() => {
                            restorePosition();
                            restoring = false;
                        }, 80);
                    });
                });

            }, true);

            /* Kalau user menutup detail, jangan paksa viewport berubah */
            document.addEventListener("click", function (event) {

                const back =
                    event.target.closest(
                        ".tt-freebies-detail .back, " +
                        ".tt-freebies-detail [data-back], " +
                        ".tt-freebies-detail button"
                    );

                if (!back) return;

                savePosition();
                restoring = true;

                requestAnimationFrame(() => {
                    restorePosition();

                    requestAnimationFrame(() => {
                        restorePosition();
                        restoring = false;
                    });
                });

            }, true);

        })();
