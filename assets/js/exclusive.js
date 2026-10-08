/* =========================================================
   TUNETRACK PLAY — EXCLUSIVE
   PRODUCT DATA / GOOGLE APPS SCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {


    /* =====================================================
       READ PRODUCT FROM URL
    ===================================================== */

    const params =
        new URLSearchParams(
            window.location.search
        );


    const productId =
        params.get("product") ||


    /* =====================================================
       FIND PRODUCT FROM data-catalog.js
    ===================================================== */

    const product =
        products.find(item => {

            const slug =
                item.title
                    .toLowerCase()
                    .trim()
                    .replace(
                        /[^a-z0-9]+/g,
                        "-"
                    )
                    .replace(
                        /^-+|-+$/g,
                        ""
                    );

            return slug === productId;

        });


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const titleElement =
        document.getElementById(
            "exclusiveTitle"
        );


    const descriptionElement =
        document.getElementById(
            "exclusiveDescription"
        );


    const originElement =
        document.getElementById(
            "infoOrigin"
        );


    const resourceElement =
        document.getElementById(
            "infoResource"
        );


    /* =====================================================
       REQUEST FORM
    ===================================================== */

    const form =
        document.getElementById(
            "requestForm"
        );


    const emailInput =
        document.getElementById(
            "emailInput"
        );


    const requestControl =
        document.querySelector(
            ".request-control"
        );


    const submitButton =
        form
            ? form.querySelector(
                ".request-submit"
            )
            : null;


    /* =====================================================
       INVALID PRODUCT
    ===================================================== */

    if (!product) {

        if (titleElement) {

            titleElement.textContent =
                "Exclusive resource.";

        }


        if (descriptionElement) {

            descriptionElement.textContent =
                "This resource is currently unavailable or could not be found.";

        }


        if (originElement) {

            originElement.textContent =
                "Unavailable";

        }


        if (resourceElement) {

            resourceElement.textContent =
                "—";

        }


        if (submitButton) {

            submitButton.disabled =
                true;

        }


        return;

    }


    /* =====================================================
       RENDER PRODUCT
    ===================================================== */

    if (titleElement) {

        titleElement.textContent =
            `${product.title}.`;

    }


    if (descriptionElement) {

        descriptionElement.textContent =
            product.description || "";

    }


    if (originElement) {

        originElement.textContent =
            product.origin ||
            "By request";

    }


    if (resourceElement) {

        resourceElement.textContent =
            product.resource ||
            "Sequencer";

    }


    /* =====================================================
       PAGE TITLE
    ===================================================== */

    document.title =
        `${product.title} — Tunetrack Play Exclusive`;


    /* =====================================================
       GOOGLE APPS SCRIPT
    ===================================================== */

    const GOOGLE_SCRIPT_URL =
        "https://script.google.com/macros/s/AKfycbw1GP_zMppy6yRjYj6sXIHemXOeTMcgvx9Q6tY1VNKSI-Rv7dFBYdmFwqwBb2Id4Fwc/exec";


    /* =====================================================
       FORM SUBMIT
    ===================================================== */

    if (form) {

        form.addEventListener(
            "submit",
            async function (e) {

                e.preventDefault();


                /* =============================================
                   ALREADY SUBMITTED
                ============================================= */

                if (
                    requestControl &&
                    requestControl.classList.contains(
                        "is-sent"
                    )
                ) {

                    return;

                }


                /* =============================================
                   EMAIL
                ============================================= */

                const email =
                    emailInput.value.trim();


                if (!email) {

                    emailInput.focus();

                    return;

                }


                /* =============================================
                   PRODUCT
                ============================================= */

                const requestedProduct =
                    product.exclusiveProduct ||
                    product.title;


                /* =============================================
                   EXCLUSIVE KEY
                ============================================= */

                const exclusiveKey =
                    product.exclusiveKey ||
                    "";


                /* =============================================
                   CATEGORY
                ============================================= */

                const productCategory =
                    Array.isArray(
                        product.category
                    )
                        ? product.category.join(", ")
                        : (
                            product.category ||
                            ""
                        );


                /* =============================================
                   PAYLOAD
                ============================================= */

                const payload =
                    new URLSearchParams({

                        email:
                            email,

                        exclusiveKey:
                            exclusiveKey,

                        product:
                            requestedProduct,

                        artist:
                            product.artist ||
                            "",

                        description:
                            product.description ||
                            "",

                        origin:
                            product.origin ||
                            "",

                        resource:
                            product.resource ||
                            "Sequencer",

                        price:
                            product.price ||
                            "",

                        category:
                            productCategory,

                        image:
                            product.image ||
                            "",

                        youtube:
                            product.youtube ||
                            "",

                        link:
                            product.link ||
                            "",

                        imageCredit:
                            product.imageCredit ||
                            ""

                    });


                /* =============================================
                   SENDING STATE
                ============================================= */

                if (requestControl) {

                    requestControl.classList.add(
                        "is-sending"
                    );

                }


                if (submitButton) {

                    submitButton.disabled =
                        true;

                }


                emailInput.disabled =
                    true;


                /* =============================================
                   SEND TO GOOGLE APPS SCRIPT
                ============================================= */

                try {

                    await fetch(
                        GOOGLE_SCRIPT_URL,
                        {

                            method:
                                "POST",

                            mode:
                                "no-cors",

                            headers: {

                                "Content-Type":
                                    "application/x-www-form-urlencoded;charset=UTF-8"

                            },

                            body:
                                payload

                        }
                    );


                    /* =========================================
                       KEEP LOADING STATE
                    ========================================= */

                    await new Promise(
                        function (resolve) {

                            setTimeout(
                                resolve,
                                3000
                            );

                        }
                    );


                    /* =========================================
                       FINISHED
                    ========================================= */

                    if (requestControl) {

                        requestControl.classList.remove(
                            "is-sending"
                        );

                        requestControl.classList.add(
                            "is-sent"
                        );

                    }


                    emailInput.disabled =
                        true;


                    if (submitButton) {

                        submitButton.disabled =
                            true;

                    }


                }

                catch (error) {

                    console.error(
                        "Tunetrack Play request error:",
                        error
                    );


                    /* =========================================
                       RESTORE UI
                    ========================================= */

                    if (requestControl) {

                        requestControl.classList.remove(
                            "is-sending"
                        );

                    }


                    emailInput.disabled =
                        false;


                    if (submitButton) {

                        submitButton.disabled =
                            false;

                    }

                }

            }

        );

    }

});