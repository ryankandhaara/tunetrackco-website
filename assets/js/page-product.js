// assets/js/product.js

document.addEventListener('DOMContentLoaded', () => {
    if (typeof products === 'undefined') {
        console.error("Database not loaded.");
        return;
    }

    // 1. Get Dynamic Data from URL Parameter
    const urlParams = new URLSearchParams(window.location.search);
    const itemName = urlParams.get('item');

    if (itemName) {
        const product = products.find(p => p.title === itemName);
        
        if (product) {
            // Update Text Data (Left Column)
            document.getElementById('pTitle').textContent = product.title;
            document.getElementById('pArtist').textContent = product.artist;
            
            const priceLabel = document.getElementById('pPrice');
            if(priceLabel) priceLabel.textContent = product.price === 'Free' ? 'Free Download' : product.price;

            // Update Usage Text
            const copyBox = document.getElementById('pCopyText');
            if(copyBox) {
                copyBox.innerHTML = `Song: ${product.title} - ${product.artist}<br>Music provided by Tunetrack<br>Store Link: tunetrack.co/catalog`;
            }

            // Update Platform Data (Right Column)
            document.getElementById('pRightTitle').textContent = product.title;
            document.getElementById('pRightArtist').textContent = product.artist;
            document.getElementById('pCover').src = product.image;

            // Page Title
            document.title = `${product.title} by ${product.artist} — Tunetrack`;

            // Optional: Set Background Image blur (NCS Style logic)
            const body = document.querySelector('body');
            body.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.95)), url('${product.image}')`;
            body.style.backgroundSize = 'cover';
            body.style.backgroundPosition = 'center';
            body.style.backgroundAttachment = 'fixed';
        } else {
            // Error handling if item is manually typed wrong
            document.getElementById('pTitle').textContent = "Item Not Found";
            document.getElementById('pArtist').textContent = "Unknown Artist";
        }
    } else {
        document.getElementById('pTitle').textContent = "No Item Selected";
    }

    // Copy Button functionality
    const copyBtn = document.querySelector('.copy-btn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const textToCopy = document.getElementById('pCopyText').innerText;
            navigator.clipboard.writeText(textToCopy).then(() => {
                const originalHTML = copyBtn.innerHTML;
                copyBtn.innerHTML = '<span style="font-size:12px; font-weight:bold;">COPIED!</span>';
                setTimeout(() => {
                    copyBtn.innerHTML = originalHTML;
                }, 2000);
            });
        });
    }
});