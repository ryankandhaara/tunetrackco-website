(() => {
    document.addEventListener("click", function (e) {
        const backBtn = e.target.closest(
            '.tt-freebies-detail button, .tt-freebies-detail a, button, a'
        );

        if (!backBtn) return;

        const text = (backBtn.textContent || "").trim().toUpperCase();

        if (text !== "BACK") return;

        // KUNCI posisi scroll sebelum Back diproses
        const lockedY = window.scrollY;
        let frames = 0;

        const restoreScroll = () => {
            window.scrollTo(0, lockedY);
            document.documentElement.scrollTop = lockedY;
            document.body.scrollTop = lockedY;

            frames++;

            // tahan selama perpindahan section berlangsung
            if (frames < 90) {
                requestAnimationFrame(restoreScroll);
            }
        };

        requestAnimationFrame(restoreScroll);

    }, true);
})();
