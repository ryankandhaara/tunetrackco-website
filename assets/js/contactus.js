
document.addEventListener('DOMContentLoaded',function(){
    const b=document.getElementById('tncoHeaderMenuButton'),m=document.getElementById('tncoMobileMenu'),c=document.getElementById('tncoMobileMenuClose');
    if(!b||!m)return;
    const toggle=open=>{
        m.classList.toggle('is-open',open);
        m.setAttribute('aria-hidden',String(!open));
        b.setAttribute('aria-expanded',String(open));
        document.body.style.overflow=open?'hidden':'';
    };
    b.addEventListener('click',()=>toggle(!m.classList.contains('is-open')));
    c&&c.addEventListener('click',()=>toggle(false));
    m.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>toggle(false)));
    document.addEventListener('keydown',e=>{if(e.key==='Escape')toggle(false)});
});



(function(){

    function initContactTypewriter(){

        const el = document.getElementById('contactTypewriter');

        if(!el) return;

        const messages = [
            ["OH HAI, WANT TO", "REACH US?"],
            ["ADA YANG", "BISA KAMI BANTU?"],
            ["EYO BRO?", "WHATS WRONG?"]
        ];

        const TYPE_SPEED = 55;
        const DELETE_SPEED = 28;
        const HOLD_TIME = 4000;

        let messageIndex = 0;
        let timer = null;

        function clearTimer(){
            if(timer){
                clearTimeout(timer);
                timer = null;
            }
        }

        function renderText(message, count){

            el.innerHTML = '';

            let remaining = count;

            message.forEach(function(line){

                const lineElement = document.createElement('span');
                lineElement.className = 'type-line';

                if(remaining <= 0){
                    lineElement.textContent = '';
                }else{
                    const visibleChars = Math.min(
                        remaining,
                        line.length
                    );

                    lineElement.textContent =
                        line.slice(0, visibleChars);

                    remaining -= visibleChars;
                }

                el.appendChild(lineElement);
            });
        }

        function getFullLength(message){
            return message.reduce(
                (total, line) => total + line.length,
                0
            );
        }

        function typeText(message, index){

            clearTimer();

            const fullLength = getFullLength(message);

            if(index <= fullLength){

                renderText(message, index);

                timer = setTimeout(function(){
                    typeText(message, index + 1);
                }, TYPE_SPEED);

                return;
            }

            timer = setTimeout(function(){
                deleteText(message, fullLength);
            }, HOLD_TIME);
        }

        function deleteText(message, index){

            clearTimer();

            if(index > 0){

                renderText(message, index - 1);

                timer = setTimeout(function(){
                    deleteText(message, index - 1);
                }, DELETE_SPEED);

                return;
            }

            messageIndex =
                (messageIndex + 1) % messages.length;

            timer = setTimeout(function(){
                typeText(messages[messageIndex], 0);
            }, 300);
        }

        typeText(messages[0], 0);
    }

    if(document.readyState === 'loading'){
        document.addEventListener(
            'DOMContentLoaded',
            initContactTypewriter,
            {once:true}
        );
    }else{
        initContactTypewriter();
    }

})();



            (function(){

                const emailInput =
                    document.getElementById('senderEmail');

                const matterStep =
                    document.getElementById('contactStepMatter');

                const descriptionStep =
                    document.getElementById('contactStepDescription');

                const description =
                    document.getElementById('description');

                const sendStep =
                    document.getElementById('contactStepSend');

                const matterPills =
                    document.getElementById('matterPills');


                function unlock(element){

                    if(!element) return;

                    element.classList.remove('is-locked');

                    /*
                    * Small delay makes the blur → clear transition
                    * feel more natural instead of snapping.
                    */
                    requestAnimationFrame(function(){
                        element.classList.add('is-unlocked');
                    });
                }


                function lock(element){

                    if(!element) return;

                    element.classList.remove('is-unlocked');
                    element.classList.add('is-locked');
                }


                function checkEmail(){

                    const value =
                        emailInput.value.trim();

                    const valid =
                        value !== '' &&
                        emailInput.checkValidity();

                    if(valid){

                        unlock(matterStep);

                    }else{

                        lock(matterStep);
                        lock(descriptionStep);

                        sendStep.classList.remove('is-unlocked');

                    }

                }


                function checkMatter(){

                    /*
                    * Description must stay locked until EMAIL is valid.
                    * This prevents the initial matter-render event from
                    * unlocking STEP 03 on page load.
                    */

                    const emailValue =
                        emailInput.value.trim();

                    const emailValid =
                        emailValue !== '' &&
                        emailInput.checkValidity();

                    if(!emailValid){
                        lock(descriptionStep);
                        sendStep.classList.remove('is-unlocked');
                        return;
                    }

                    const selected =
                        matterPills.querySelector('.contact-pill.is-active');

                    const requiresProduct =
                        selected &&
                        (
                            selected.textContent.trim() === 'FILE NOT RECEIVED' ||
                            selected.textContent.trim() === 'BROKEN DOWNLOAD LINK'
                        );

                    const hasProduct =
                        !requiresProduct ||
                        window.contactSelectedProduct === true;

                    if(selected && hasProduct){

                        unlock(descriptionStep);

                    }else{

                        lock(descriptionStep);
                        sendStep.classList.remove('is-unlocked');

                    }
                }


                function checkDescription(){

                    const value =
                        description.value.trim();

                    if(value.length > 0){

                        unlock(sendStep);

                    }else{

                        sendStep.classList.remove('is-unlocked');

                    }

                }


                /* EMAIL → STEP 02 */

                emailInput.addEventListener(
                    'input',
                    checkEmail
                );

                emailInput.addEventListener(
                    'blur',
                    checkEmail
                );


                /* STEP 02 → STEP 03 */

                /*
                * Delegation is intentional because the matter pills
                * are created dynamically by the existing script.
                */

                matterPills.addEventListener(
                    'click',
                    function(event){

                        if(
                            event.target.classList.contains('contact-pill')
                        ){

                            /*
                            * Wait one frame so the existing matter-pill
                            * script can apply .is-active first.
                            */

                            requestAnimationFrame(function(){
                                checkMatter();
                            });

                        }

                    }
                );


                /* STEP 03 → STEP 04 */

                description.addEventListener(
                    'input',
                    checkDescription
                );

                description.addEventListener(
                    'blur',
                    checkDescription
                );


                document.addEventListener(
                    'contact:matter-rendered',
                    function(){
                        window.requestAnimationFrame(checkMatter);
                    }
                );

                document.addEventListener(
                    'contact:product-selected',
                    function(){
                        window.requestAnimationFrame(checkMatter);
                    }
                );

                /*
                * Initial state:
                * only EMAIL is available.
                */

                lock(matterStep);
                lock(descriptionStep);

                sendStep.classList.remove('is-unlocked');

            })();
            


(function(){
    'use strict';

    const intents = {
        "ORDER": [
            "MULTITRACK & SEQUENCER",
            "CHURCH VISUALS",
            "OTHER / CUSTOM"
        ],
        "CUSTOM WORK": [
            "COLLABORATION",
            "DESIGN / VISUALS",
            "MUSIC / PRODUCTION",
            "OTHER"
        ],
        "ISSUES AT BUYING": [
            "FILE NOT RECEIVED",
            "BROKEN DOWNLOAD LINK",
            "CANNOT PAY / PAYMENT ISSUES",
            "OTHER"
        ]
    };

    const products = [{"name":"Yesus Kumenyembahmu Medley (SW)","href":"pg-sw-lebihdaripemenang.html","tag":"RESOURCE"},{"name":"Lebih dari Pemenang (SW)","href":"pg-sw-lebihdaripemenang.html","tag":"RESOURCE"},{"name":"Allah Sanggup (SW)","href":"https://lynk.id/gudangsequencer/w08zo73m7y7z","tag":"RESOURCE"},{"name":"Sperti Bapa Sayang Anaknya","href":"https://lynk.id/gudangsequencer/olm3qd20r82y","tag":"WORSHIP"},{"name":"Mari Menari 2.0","href":"https://lynk.id/gudangsequencer/gw6onoo5meng","tag":"RESOURCE"},{"name":"Api Pantekosta Medley","href":"https://lynk.id/gudangsequencer/m07l2dmr83n6","tag":"RESOURCE"},{"name":"Kecaplah dan Lihatlah","href":"https://lynk.id/gudangsequencer/e5ke29g86jxd","tag":"RESOURCE"},{"name":"Bukti Kasih ft. UNDVD","href":"https://lynk.id/gudangsequencer/49zn00oe0207","tag":"WORSHIP"},{"name":"Trima kasih Tuhan","href":"https://lynk.id/gudangsequencer/okx7yo67kwjo","tag":"WORSHIP"},{"name":"Tiap Langkahku (Gospel Project)","href":"https://lynk.id/gudangsequencer/210x2gjnokle","tag":"RESOURCE"},{"name":"Allah sumber Kuatku (Gospel Project)","href":"https://lynk.id/gudangsequencer/3v9kv95403qo","tag":"RESOURCE"},{"name":"Allah kita heran dan Besar (Gospel Project)","href":"https://lynk.id/gudangsequencer/jn0p6yd769rm","tag":"RESOURCE"},{"name":"Friend of God TMRC","href":"https://lynk.id/gudangsequencer/oykp3mvv9mwd","tag":"RESOURCE"},{"name":"O Come All ye Faithful","href":"https://lynk.id/gudangsequencer/17lew0wdoer0","tag":"WORSHIP"},{"name":"NOEL","href":"https://lynk.id/gudangsequencer/mryvlqgjw772","tag":"WORSHIP"},{"name":"Joy to the World 2017","href":"https://lynk.id/gudangsequencer/wmpg0404o2jv","tag":"WORSHIP"},{"name":"O Holy Night","href":"https://lynk.id/gudangsequencer/lwzd17o9ew0q","tag":"WORSHIP"},{"name":"Silent Night","href":"https://lynk.id/gudangsequencer/1rzjn7n8edx2","tag":"WORSHIP"},{"name":"Angels We Have Heard On High","href":"https://lynk.id/gudangsequencer/n3r1k444dr3n","tag":"RESOURCE"},{"name":"Hark","href":"https://lynk.id/gudangsequencer/okn2roo0ojg1","tag":"RESOURCE"},{"name":"Its Christmas","href":"https://lynk.id/gudangsequencer/vdngnrgkjkk1","tag":"RESOURCE"},{"name":"New Things Coming","href":"https://lynk.id/gudangsequencer/6z1lyz9j4k12","tag":"RESOURCE"},{"name":"We Raise","href":"https://lynk.id/gudangsequencer/woqlqdkedrzp","tag":"RESOURCE"},{"name":"Praise Opening (GW)","href":"https://lynk.id/gudangsequencer/21lklwv7yg6l","tag":"RESOURCE"},{"name":"In Jesus Name Asia","href":"https://lynk.id/gudangsequencer/523vkzqj9m9y","tag":"RESOURCE"},{"name":"This is the Day - Reimagined","href":"https://lynk.id/gudangsequencer/nyxyzxqkpop4","tag":"RESOURCE"},{"name":"I Know You Can","href":"https://lynk.id/gudangsequencer/9kqon61317me","tag":"RESOURCE"},{"name":"Real Love - HxL 25","href":"https://lynk.id/gudangsequencer/x9rv4o160kp0","tag":"RESOURCE"},{"name":"Holy Forever","href":"https://lynk.id/gudangsequencer/l9w339mkkzy3","tag":"WORSHIP"},{"name":"Fill the Room","href":"https://lynk.id/gudangsequencer/wxv3d8lmk9y1","tag":"RESOURCE"},{"name":"Now Aint that Something","href":"https://lynk.id/gudangsequencer/j6p02601zn32","tag":"RESOURCE"},{"name":"Goodbye Yesterday","href":"https://lynk.id/gudangsequencer/qe85oo2xz88l","tag":"RESOURCE"},{"name":"Real Love","href":"https://lynk.id/gudangsequencer/x02go3dy0dwg","tag":"RESOURCE"},{"name":"O Come Medley Carol of The Bells","href":"https://lynk.id/gudangsequencer/k67pqnk1xd1j","tag":"RESOURCE"},{"name":"In Jesus Name","href":"https://lynk.id/gudangsequencer/592pl7k9qm8r","tag":"RESOURCE"},{"name":"I Speak Jesus","href":"https://lynk.id/gudangsequencer/o4xzq3zdg36w","tag":"WORSHIP"},{"name":"This is the Day","href":"https://lynk.id/gudangsequencer/3417ervkxq64","tag":"RESOURCE"},{"name":"You Are Good (in LA)","href":"https://lynk.id/gudangsequencer/glq0d71pdrq5","tag":"RESOURCE"},{"name":"You Are Good","href":"https://lynk.id/gudangsequencer/9248oz68oz1z","tag":"RESOURCE"},{"name":"Impossible Possible","href":"https://lynk.id/gudangsequencer/q20wwz5p6kpv","tag":"RESOURCE"},{"name":"Echo","href":"https://lynk.id/gudangsequencer/r054qee22vrz","tag":"RESOURCE"},{"name":"In Jesus Name (Ft. DOE)","href":"https://lynk.id/gudangsequencer/36v97ozy1n7x","tag":"RESOURCE"},{"name":"KAMSAHAMNIDA","href":"https://lynk.id/gudangsequencer/0nv6vwezvy75","tag":"RESOURCE"},{"name":"This is our Time","href":"https://lynk.id/gudangsequencer/0v3m7n37r606","tag":"RESOURCE"},{"name":"Trust in God","href":"https://lynk.id/gudangsequencer/32jn4zewe1n3","tag":"WORSHIP"},{"name":"Terangmu (Lifeline)","href":"https://lynk.id/gudangsequencer/d3rgvnx61v3m","tag":"RESOURCE"},{"name":"Selidiki Aku (Tetap Setia)","href":"https://lynk.id/gudangsequencer/3o3z826jojwr","tag":"WORSHIP"},{"name":"Nyata Sempurna","href":"https://lynk.id/gudangsequencer/ovro6541or6g","tag":"WORSHIP"},{"name":"Hari Terbaik","href":"https://lynk.id/gudangsequencer/p5xjj25e22g1","tag":"RESOURCE"},{"name":"Bangkit dan Puji Dia","href":"https://lynk.id/gudangsequencer/zkddzxk1xwk9","tag":"RESOURCE"},{"name":"Berserah Penuh","href":"https://lynk.id/gudangsequencer/rp2x7v3v652p","tag":"WORSHIP"},{"name":"Raja atas Sgalanya","href":"https://lynk.id/gudangsequencer/mwjr892o57lk","tag":"WORSHIP"},{"name":"Sejarah Hidupku","href":"https://lynk.id/gudangsequencer/v5wwqmno7n72","tag":"WORSHIP"},{"name":"Bukti Kasihmu","href":"https://lynk.id/gudangsequencer/pq0l8or7m184","tag":"WORSHIP"},{"name":"Tempat Pertama","href":"https://lynk.id/gudangsequencer/nywv21v0k6x8","tag":"RESOURCE"},{"name":"Serukan Namanya","href":"https://lynk.id/gudangsequencer/g4yl32on4kod","tag":"RESOURCE"},{"name":"Satu Persembahan","href":"https://lynk.id/gudangsequencer/vrdn2qwpr515","tag":"RESOURCE"},{"name":"Kuteringat (SW)","href":"https://lynk.id/gudangsequencer/6qk6ldgroy1g","tag":"RESOURCE"},{"name":"Dia Raja (Worshipnite)","href":"https://lynk.id/gudangsequencer/pr4211y82ye2","tag":"RESOURCE"},{"name":"Praise","href":"https://lynk.id/gudangsequencer/1o35kj6v9jm3","tag":"RESOURCE"},{"name":"Aku Diberkati 2025 Remix","href":"https://lynk.id/gudangsequencer/lj309y3vnpvd","tag":"RESOURCE"},{"name":"Nyalakan Apimu (New Life Church)","href":"https://lynk.id/gudangsequencer/vp0xlye26vjk","tag":"RESOURCE"},{"name":"Kunaikkan Syukurku 2025","href":"https://lynk.id/gudangsequencer/lwelm3rlddgk","tag":"RESOURCE"},{"name":"NDC - Christmas 2024 Medley","href":"https://lynk.id/gudangsequencer/vkvoex2704zq","tag":"RESOURCE"},{"name":"Ajaib kau Tuhan (NDCY)","href":"https://lynk.id/gudangsequencer/0vdrz2krz9rn","tag":"RESOURCE"},{"name":"Endless Praise (Recording Collective)","href":"https://lynk.id/gudangsequencer/p1d6okxxd054","tag":"RESOURCE"},{"name":"Oleh Darah Anak Domba (NDCY)","href":"https://lynk.id/gudangsequencer/l20mv78q6y56","tag":"RESOURCE"}];

    const form = document.getElementById('contactForm');
    const senderEmail = document.getElementById('senderEmail');
    const description = document.getElementById('description');
    const intentPills = document.querySelectorAll('[data-intent]');
    const matterPills = document.getElementById('matterPills');

    const emailEcho = document.getElementById('emailEcho');
    const receiptEmail = document.getElementById('receiptEmail');
    const receiptIntent = document.getElementById('receiptIntent');
    const receiptMatter = document.getElementById('receiptMatter');
    const receiptDescription = document.getElementById('receiptDescription');
    const receiptDate = document.getElementById('receiptDate');

    const successState = document.getElementById('successState');
    const successClose = document.getElementById('successClose');
    const editButton = document.getElementById('editButton');

    const issueProductPicker = document.getElementById('issueProductPicker');
    const issueProductTrigger = document.getElementById('issueProductTrigger');
    const issueProductValue = document.getElementById('issueProductValue');
    const issueProductSearch = document.getElementById('issueProductSearch');
    const issueProductList = document.getElementById('issueProductList');
    const issueProductSearchCount = document.getElementById('issueProductSearchCount');
    const issueProductEmpty = document.getElementById('issueProductEmpty');
    const receiptProduct = document.getElementById('receiptProduct');
    const receiptProductRow = document.getElementById('receiptProductRow');

    let activeIntent = 'ORDER';
    let activeMatter = intents.ORDER[0];
    let activeProduct = null;
    window.contactSelectedProduct = false;
    window.contactReceiptProduct = receiptProduct;

    function matterNeedsProduct(){
        return activeIntent === 'ISSUES AT BUYING' &&
               (
                   activeMatter === 'FILE NOT RECEIVED' ||
                   activeMatter === 'BROKEN DOWNLOAD LINK'
               );
    }

    function closeProductPicker(){
        if(!issueProductPicker) return;

        issueProductPicker.classList.remove('is-open');
        issueProductTrigger.setAttribute('aria-expanded','false');
    }

    function resetProductPicker(){
        activeProduct = null;
        window.contactSelectedProduct = false;

        if(!issueProductPicker) return;

        issueProductPicker.hidden = true;
        closeProductPicker();
        issueProductValue.textContent = 'SELECT A PRODUCT';

        if(issueProductSearch){
            issueProductSearch.value = '';
        }
    }

    function openProductPicker(){
        if(!matterNeedsProduct() || !issueProductPicker) return;

        issueProductPicker.hidden = false;

        requestAnimationFrame(function(){
            issueProductPicker.classList.add('is-open');
            issueProductTrigger.setAttribute('aria-expanded','true');

            if(issueProductSearch){
                issueProductSearch.focus();
            }
        });
    }

    function escapeHTML(value){
        return String(value).replace(/[&<>"']/g, function(char){
            return {
                '&':'&amp;',
                '<':'&lt;',
                '>':'&gt;',
                '"':'&quot;',
                "'":'&#039;'
            }[char];
        });
    }

    function renderProductList(query){
        if(!issueProductList) return;

        const needle = (query || '').trim().toLowerCase();

        const filtered = products.filter(function(product){
            return product.name.toLowerCase().includes(needle);
        });

        issueProductList.innerHTML = '';
        issueProductSearchCount.textContent = filtered.length;

        if(issueProductEmpty){
            issueProductEmpty.hidden = filtered.length !== 0;
        }

        filtered.forEach(function(product){
            const button = document.createElement('button');

            button.type = 'button';
            button.className =
                'issue-product-option' +
                (
                    activeProduct &&
                    activeProduct.name === product.name
                        ? ' is-selected'
                        : ''
                );

            button.setAttribute('role','option');
            button.setAttribute(
                'aria-selected',
                activeProduct &&
                activeProduct.name === product.name
                    ? 'true'
                    : 'false'
            );

            const number = String(
                products.indexOf(product) + 1
            ).padStart(2,'0');

            button.innerHTML =
                '<span class="issue-product-index">' + number + '</span>' +
                '<span class="issue-product-name">' +
                    escapeHTML(product.name) +
                '</span>' +
                '<span class="issue-product-tag">' +
                    escapeHTML(product.tag) +
                '</span>';

            button.addEventListener('click', function(){
                activeProduct = product;
                window.contactSelectedProduct = true;

                issueProductValue.textContent = product.name;
                closeProductPicker();
                renderProductList(
                    issueProductSearch ? issueProductSearch.value : ''
                );
                updateReceipt();

                document.dispatchEvent(
                    new CustomEvent('contact:product-selected')
                );
            });

            issueProductList.appendChild(button);
        });
    }

    function syncProductPicker(){
        if(!issueProductPicker) return;

        if(matterNeedsProduct()){
            issueProductPicker.hidden = false;

            renderProductList(
                issueProductSearch ? issueProductSearch.value : ''
            );
        }else{
            resetProductPicker();
        }
    }

    function renderMatters(){
        matterPills.innerHTML = '';

        intents[activeIntent].forEach(function(label, index){
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'contact-pill' + (index === 0 ? ' is-active' : '');
            button.textContent = label;
            button.dataset.matter = label;

            button.addEventListener('click', function(){
                activeMatter = label;
                activeProduct = null;
                window.contactSelectedProduct = false;

                matterPills.querySelectorAll('.contact-pill').forEach(function(item){
                    item.classList.toggle('is-active', item === button);
                });

                syncProductPicker();
                updateReceipt();

                document.dispatchEvent(
                    new CustomEvent('contact:matter-rendered')
                );
            });

            matterPills.appendChild(button);
        });

        activeMatter = intents[activeIntent][0];
        syncProductPicker();
        updateReceipt();

        document.dispatchEvent(
            new CustomEvent('contact:matter-rendered')
        );
    }

    function updateReceipt(){
        const email = senderEmail.value.trim();
        const message = description.value.trim();

        emailEcho.textContent = email || '—';
        receiptEmail.textContent = email || '—';
        receiptIntent.textContent = activeIntent;
        receiptMatter.textContent = activeMatter;
        receiptDescription.textContent = message || '—';

        if(receiptProduct){
            receiptProduct.textContent =
                activeProduct ? activeProduct.name : '—';
        }

        if(receiptProductRow){
            receiptProductRow.hidden = !matterNeedsProduct();
        }

        receiptDate.textContent = new Date().toLocaleDateString('en-GB', {
            day:'2-digit',
            month:'2-digit',
            year:'numeric'
        }).replace(/\//g,'.');
    }

    if(issueProductTrigger){
        issueProductTrigger.addEventListener('click', function(){
            if(issueProductPicker.classList.contains('is-open')){
                closeProductPicker();
            }else{
                openProductPicker();
            }
        });
    }

    if(issueProductSearch){
        issueProductSearch.addEventListener('input', function(){
            renderProductList(issueProductSearch.value);
        });

        issueProductSearch.addEventListener('keydown', function(event){
            if(event.key === 'Escape'){
                closeProductPicker();
                issueProductTrigger.focus();
            }
        });
    }

    document.addEventListener('click', function(event){
        if(
            issueProductPicker &&
            !issueProductPicker.contains(event.target)
        ){
            closeProductPicker();
        }
    });

    renderProductList('');

    intentPills.forEach(function(button){
        button.addEventListener('click', function(){
            activeIntent = button.dataset.intent;

            intentPills.forEach(function(item){
                item.classList.toggle('is-active', item === button);
            });

            renderMatters();
        });
    });

senderEmail.addEventListener('input', updateReceipt);
description.addEventListener('input', updateReceipt);

form.addEventListener('submit', async function(event){

    event.preventDefault();

    const email = senderEmail.value.trim();
    const message = description.value.trim();

    if(!email || !senderEmail.checkValidity()){
        senderEmail.focus();
        return;
    }

    if(!message){
        description.focus();
        return;
    }

    function titleCase(value){
        return String(value || '')
            .toLowerCase()
            .replace(/\b\w/g, function(char){
                return char.toUpperCase();
            });
    }

    const intentLabel = titleCase(activeIntent);
    const matterLabel = titleCase(activeMatter);
    const productLabel = activeProduct ? activeProduct.name : '';

    const today = new Date().toLocaleDateString('en-GB', {
        day:'2-digit',
        month:'2-digit',
        year:'numeric'
    }).replace(/\//g,'.');

    const subjectParts = [
        'Tunetrack Contact',
        intentLabel,
        matterLabel
    ];

    if(matterNeedsProduct() && productLabel){
        subjectParts.push(productLabel);
    }

    const subject = subjectParts.join(' — ');

    const receiptLines = [
        'TUNETRACK / MAIL',
        'LIVE CONTACT RECEIPT',
        '────────────────────────────────────────',
        '',
        'FROM',
        email,
        '',
        'INTENT',
        intentLabel,
        '',
        'MATTER',
        matterLabel
    ];

    if(matterNeedsProduct() && productLabel){
        receiptLines.push(
            '',
            'PRODUCT',
            productLabel
        );
    }

    receiptLines.push(
        '',
        'MESSAGE',
        message,
        '',
        '────────────────────────────────────────',
        'TNCO / CONTACT REQUEST',
        today,
        '',
        'Sent through the Tunetrack contact page.'
    );

    const body = receiptLines.join('\n');

    try{

        const sendButton = document.getElementById('sendButton');

        if(sendButton){
            sendButton.disabled = true;
            sendButton.textContent = 'SENDING...';
        }

        const recipient = 'tmmheadmaiL@gmail.com';
        const mailto = 'mailto:' + recipient
            + '?subject=' + encodeURIComponent(subject)
            + '&body=' + encodeURIComponent(body);

        window.location.href = mailto;

        successState.classList.add('is-visible');
        successState.setAttribute('aria-hidden','false');

        if(sendButton){
            sendButton.textContent = 'OPENED ↗';
        }

    }catch(error){

        console.error(error);

        const sendButton = document.getElementById('sendButton');

        if(sendButton){
            sendButton.disabled = false;
            sendButton.textContent = 'CHECK & SEND ↗';
        }

        alert('Something went wrong. Please try again.');

    }

});

    function closeSuccess(){
        successState.classList.remove('is-visible');
        successState.setAttribute('aria-hidden','true');
        senderEmail.focus();
    }

    successClose.addEventListener('click', closeSuccess);
    editButton.addEventListener('click', function(){
        senderEmail.focus();
        window.scrollTo({
            top: document.querySelector('.contact-form-side').getBoundingClientRect().top + window.scrollY - 100,
            behavior:'smooth'
        });
    });

    renderMatters();
    updateReceipt();

})();



(function(){

    const header = document.getElementById('tnco-header');

    if(!header) return;

    let lastY = window.scrollY || document.documentElement.scrollTop || 0;
    let ticking = false;

    function setHeader(y){

        y = Math.max(0, y || 0);

        if(y < 12){
            header.classList.remove('is-hero-passed');
            lastY = y;
            return;
        }

        if(ticking) return;
        ticking = true;

        requestAnimationFrame(function(){
            if(y > lastY + 3){
                header.classList.add('is-hero-passed');
            }else if(y < lastY - 3){
                header.classList.remove('is-hero-passed');
            }

            lastY = y;
            ticking = false;
        });
    }

    window.addEventListener('scroll', function(){
        setHeader(window.scrollY || document.documentElement.scrollTop || 0);
    }, {passive:true});

})();


/* Chrome fallback: preserve the original document/footer structure, but route
   wheel scrolling directly to the page when Chrome fails to advance native
   document scrolling on this page. Safari keeps its native wheel behavior. */
(function(){
    const isChrome = /Chrome\//.test(navigator.userAgent) &&
        !/Edg\//.test(navigator.userAgent) &&
        !/OPR\//.test(navigator.userAgent);

    if(!isChrome) return;

    window.addEventListener('wheel', function(event){
        if(event.defaultPrevented || !event.deltaY) return;

        event.preventDefault();
        window.scrollBy(0, event.deltaY);
    }, {passive:false});
})();




(function () {

    const menu = document.querySelector('.tnco-mobile-menu-overlay');

    if (!menu) return;

    let locked = false;

    function preventScroll(e) {

        if (menu.classList.contains('is-open')) {
            e.preventDefault();
            e.stopPropagation();
        }

    }

    function lockMenuScroll() {

        if (locked) return;

        locked = true;

        document.addEventListener(
            'wheel',
            preventScroll,
            {
                passive: false,
                capture: true
            }
        );

        document.addEventListener(
            'touchmove',
            preventScroll,
            {
                passive: false,
                capture: true
            }
        );

    }

    function unlockMenuScroll() {

        if (!locked) return;

        locked = false;

        document.removeEventListener(
            'wheel',
            preventScroll,
            true
        );

        document.removeEventListener(
            'touchmove',
            preventScroll,
            true
        );

    }

    new MutationObserver(function () {

        if (menu.classList.contains('is-open')) {

            lockMenuScroll();

        } else {

            unlockMenuScroll();

        }

    }).observe(menu, {
        attributes: true,
        attributeFilter: ['class']
    });

})();



document.addEventListener('DOMContentLoaded', function () {
  const searchBtn = document.getElementById('swissSearchBtn');
  const searchOverlay = document.getElementById('catalogSearchOverlay');
  const searchClose = document.getElementById('catalogSearchClose');
  const searchInput = document.getElementById('globalSearch');
  const clearSearch = document.getElementById('clearSearch');
  const accountBtn = document.getElementById('swissAccountBtn');

  function openSearch() {
    if (!searchOverlay) return;
    searchOverlay.classList.add('is-open');
    searchOverlay.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('catalog-search-open');
    if (searchInput) setTimeout(() => searchInput.focus(), 40);
  }

  function closeSearch() {
    if (!searchOverlay) return;
    searchOverlay.classList.remove('is-open');
    searchOverlay.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('catalog-search-open');
  }

  searchBtn && searchBtn.addEventListener('click', openSearch);
  searchClose && searchClose.addEventListener('click', closeSearch);
  clearSearch && clearSearch.addEventListener('click', function () {
    if (searchInput) {
      searchInput.value = '';
      searchInput.focus();
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });

  searchOverlay && searchOverlay.addEventListener('click', function (e) {
    if (e.target === searchOverlay) closeSearch();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeSearch();
  });

  /* Keep the Catalog account control usable without changing the Contact content. */
  accountBtn && accountBtn.addEventListener('click', function () {
    window.location.href = 'gateuser.html';
  });
});



/* Blog List footer newsletter interaction */
(function(){
  const form = document.getElementById('standalone-newsletter-form');
  const emailInput = document.getElementById('newsletter-email');
  const success = document.getElementById('newsletter-success');
  const status = document.getElementById('newsletter-status-msg');
  if (!form || !emailInput || !success) return;

  form.addEventListener('submit', function(event){
    event.preventDefault();
    const email = emailInput.value.trim();
    if (!email || !emailInput.checkValidity()) {
      emailInput.reportValidity();
      return;
    }

    const recipient = 'tmmheadmaiL@gmail.com';
    const subject = 'New Tunetrack Newsletter Subscriber';
    const body =
      'Hi Tunetrack,\n\n' +
      'A new subscriber has joined the Tunetrack newsletter.\n\n' +
      'Subscriber email:\n' + email + '\n\n' +
      'Please add this address to the Tunetrack newsletter mailing list.\n\n' +
      '— Tunetrack\n';

    const button = form.querySelector('button');
    if (button) button.disabled = true;

    form.style.opacity = '0';
    form.style.transform = 'translateY(-8px)';
    form.style.pointerEvents = 'none';

    setTimeout(function(){
      success.style.opacity = '1';
      success.style.transform = 'translateY(0)';
      success.style.pointerEvents = 'auto';
    }, 180);

    setTimeout(function(){
      window.location.href =
        'mailto:' + recipient +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);
    }, 650);

    if (status) status.textContent = '';
  });
})();
