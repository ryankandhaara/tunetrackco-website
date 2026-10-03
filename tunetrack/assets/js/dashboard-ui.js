/* 
  TuneTrack Workspace - UI Logic
  Handles Navigation, Custom Cursor, and Unlock Gate 
  Firebase logic remains in dashboard.js
*/

document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. Tab Navigation Logic ---
    const navPills = document.querySelectorAll('.nav-pill:not(.disabled)');
    const tabContents = document.querySelectorAll('.tab-content');
    const inlineNavs = document.querySelectorAll('.inline-nav');

    function switchTab(targetId) {
        // Reset actives
        navPills.forEach(pill => pill.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // Set new actives
        const activePill = document.querySelector(`.nav-pill[data-target="${targetId}"]`);
        const activeContent = document.getElementById(targetId);

        if (activePill) activePill.classList.add('active');
        if (activeContent) activeContent.classList.add('active');
    }

    // Attach to Main Nav
    navPills.forEach(pill => {
        pill.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = pill.getAttribute('data-target');
            switchTab(targetId);
        });
    });

    // Attach to Inline Navs (e.g. from empty state)
    inlineNavs.forEach(nav => {
        nav.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = nav.getAttribute('data-target');
            switchTab(targetId);
        });
    });


    // --- 2. Custom Cursor Logic (Catalogue Bridge) ---
    const bridgeSection = document.getElementById('catalogue');
    const customCursor = document.getElementById('catalogue-cursor');
    
    if (bridgeSection && customCursor && window.innerWidth > 768 && window.gsap) {
        // Placeholder images for the cursor reveal
        const cursorImages = [
            'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=500&q=80',
            'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&q=80',
            'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500&q=80',
            'https://images.unsplash.com/photo-1525362081669-2b476bb628c3?w=500&q=80',
            'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80'
        ];
        
        let currentImageIndex = 0;
        let lastX = 0;
        let lastY = 0;
        let isIdle = false;
        let idleTimer = null;

        // Mouse move listener on the bridge section
        bridgeSection.addEventListener('mousemove', (e) => {
            const currentX = e.clientX;
            const currentY = e.clientY;
            
            // Calculate distance moved
            const deltaX = currentX - lastX;
            const deltaY = currentY - lastY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            // Change image if moved enough distance (e.g., 100px)
            if (distance > 100) {
                currentImageIndex = (currentImageIndex + 1) % cursorImages.length;
                customCursor.style.backgroundImage = `url(${cursorImages[currentImageIndex]})`;
                lastX = currentX;
                lastY = currentY;
            }

            // Move the cursor element using GSAP for smoothness
            gsap.to(customCursor, {
                x: currentX,
                y: currentY,
                duration: 0.5,
                ease: "power2.out",
                opacity: 1,
                scale: 1
            });

            // Reset idle timer
            clearTimeout(idleTimer);
            isIdle = false;
            
            // Set idle timeout (1 second)
            idleTimer = setTimeout(() => {
                isIdle = true;
                gsap.to(customCursor, {
                    opacity: 0,
                    scale: 0.8,
                    duration: 0.4,
                    ease: "power2.in"
                });
            }, 1000);
        });

        // Hide cursor when leaving section
        bridgeSection.addEventListener('mouseleave', () => {
            clearTimeout(idleTimer);
            gsap.to(customCursor, {
                opacity: 0,
                scale: 0.8,
                duration: 0.4,
                ease: "power2.in"
            });
        });
    }

    // --- 3. The Gate Unlock Logic ---
    const gateOverlay = document.getElementById('gate-overlay');
    const closeGateBtn = document.getElementById('close-gate');
    const unlockTriggers = document.querySelectorAll('.unlock-trigger');
    const statusText = document.getElementById('unlock-status');
    const actionBtns = document.querySelectorAll('.action-btn');

    function openGate() {
        gateOverlay.classList.add('active');
        statusText.textContent = "AWAITING VERIFICATION...";
        statusText.style.color = "var(--text-muted)";
    }

    function closeGate() {
        gateOverlay.classList.remove('active');
    }

    unlockTriggers.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            // In a real scenario, you'd fetch the product details here based on data-product attribute
            openGate();
        });
    });

    closeGateBtn?.addEventListener('click', closeGate);

    // Mock Unlock Process
    actionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            statusText.textContent = "VERIFYING REQUIREMENT...";
            statusText.style.color = "#fff";
            
            // Simulate API verification delay
            setTimeout(() => {
                statusText.textContent = "ACCESS GRANTED. ADDING TO VAULT.";
                statusText.style.color = "#00ffcc"; // Mint green success
                
                // Automatically close after success and switch to My Products
                setTimeout(() => {
                    closeGate();
                    switchTab('my-products');
                    
                    // Here you would trigger the UI update to show the new product in My Products
                    document.getElementById('empty-vault-state').style.display = 'none';
                    document.getElementById('user-products-grid').style.display = 'grid';
                    
                }, 1500);
            }, 2000);
        });
    });
});
