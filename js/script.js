/*=================================================
MashFreshGreens Agriculture - JavaScript File
Part 3: Functionality - interactive elements, dynamic content, form validation and  AJAX submission.
  ===================================================*/

document.addEventListener("DOMContentLoaded", function () {
    /*------------------------------------------------
        1. Accordion functionality
    ------------------------------------------------*/
    const accordionHeaders = document.querySelectorAll(".accordion-header");
    
    accordionHeaders.forEach(function (header) {
        header.addEventListener("click", function () {
            const item = this.parentElement;
            const isOpen = item.classList.contains("open");

            // Close all accordion items
            document.querySelectorAll(".accordion-item").forEach(function (el) {
                el.classList.remove("open");
                el.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
            });

            // ...then reopen the one the user clicked, unless it was already open
            if (!isOpen) {
                item.classList.add("open");
                header.setAttribute('aria-expanded', 'true');
            }
        });
    });

    /*------------------------------------------------
        2. SEARCH FORM VALIDATION (Services Page)
        Filters the services list live as the user types, so they don't have to scroll through every service to find what they want.
    ------------------------------------------------*/
    const serviceSearch = document.getElementById("service-search");
    const serviceItems = document.querySelectorAll(".service-item");
    const noResultsMessage = document.getElementById("no-results");

    if (serviceSearch && serviceItems.length) {
        serviceSearch.addEventListener('input', function () {
            const query = serviceSearch.value.trim().toLowerCase();
            let visibleCount = 0;

            serviceItems.forEach(function (item) {
                const text = item.textContent.toLowerCase();
                const matches = text.includes(query);
                item.style.display = matches ? '' : 'none';
                if (matches) visibleCount++;
            });

            if (noResultsMessage) {
                noResultsMessage.style.display = visibleCount === 0 ? 'block' : 'none';
            }
        });
    }

    /*------------------------------------------------
        3. Gallery Lightbox Functionality (Products Page)
        Clicking on a product image opens it in a lightbox overlay, allowing users to view larger images without leaving the page.
    ------------------------------------------------*/
    const galleryImages = document.querySelectorAll(".gallery-item img");
    const lightbox = document.getElementById('lightbox');

    if (galleryImages.length && lightbox) {
        const lightboxImg = document.getElementById('lightbox-img');
        const lightboxCaption = document.getElementById('lightbox-caption');
        const lightboxClose = document.getElementById('lightbox-close');

        galleryImages.forEach(function (img) {
            img.style.cursor = 'pointer';
            img.addEventListener('click', function () {
                lightbox.classList.add('open');
                lightboxImg.src = img.src;
                lightboxImg.alt = img.alt;
                lightboxCaption.textContent = img.alt;
                document.body.style.overflow = 'hidden'; // Prevent background scrolling
            });
        });

        function closeLightbox() {
            lightbox.classList.remove('open');
            document.body.style.overflow = ''; // Restore background scrolling
        }
        
        lightboxClose.addEventListener('click', closeLightbox);

        // Clicking the dark overlay closes the lightbox
        lightbox.addEventListener('click', function (e) {
            if (e.target === lightbox) closeLightbox();
        });

        // Close lightbox on pressing the Escape key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && lightbox.classList.contains('open')) {
                closeLightbox();
            }
        });
    }

    /*------------------------------------------------
        4. Interactive Map Functionality (Contact Page)
        Leaflet.js + OpenStreetMap replaces Google Maps for an interactive map showing the farm's location, with a custom marker and popup.
    ------------------------------------------------*/
    const mapElement = document.getElementById('map');

    if (mapElement && typeof L !== 'undefined') {
        // Department of Agriculture and Rural Development Polokwane - used as the reference location for this placeholder address.
        const lat = -23.9073;
        const lng = 29.4198;

        const map = L.map('map').setView([lat, lng], 14);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(map);


        L.marker([lat, lng]).addTo(map)
            .bindPopup('<b>MashFreshGreens Agriculture</b><br>Limpopo , Polokwane 0700, South Africa')
            .openPopup();
    }

    /*------------------------------------------------
        5. Form Validation and AJAX Submission (Contact Page)
        Validates the contact form fields and submits the form data via AJAX to avoid page reloads, providing a smoother user experience.
    ------------------------------------------------*/
    function setupFormValidation(formId) {
        const form = document.getElementById(formId);
        if (!form) return;

        const statusBox = form.querySelector('.form-status');

        function showError(field, message) {
            const errorEl = form.querySelector(`[data-error-for="' +field.name + '"]`);
            if (errorEl) errorEl.textContent = message;
            field.classList.add('invalid');
        }


         function clearError(field) {
            const errorEl = form.querySelector('[data-error-for="' + field.name + '"]');
            if (errorEl) errorEl.textContent = '';
            field.classList.remove('invalid');
        }

        function validateField(field) {
            if (field.hasAttribute('required') && !field.value.trim()) {
                showError(field, 'This field is required.');
                return false;
            }
            if (field.type === 'email' && field.value.trim()) {
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(field.value.trim())) {
                    showError(field, 'Please enter a valid email address.');
                    return false;
                }
            }
            if (field.tagName === 'TEXTAREA' && field.hasAttribute('required') && field.value.trim().length < 10) {
                showError(field, 'Please enter at least 10 characters.');
                return false;
            }
            clearError(field);
            return true;
        }

        // Validate a field as soon as the user leaves it
        form.querySelectorAll('input, textarea, select').forEach(function (field) {
            field.addEventListener('blur', function () { validateField(field); });
        });

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            let isValid = true;
            form.querySelectorAll('input, textarea, select').forEach(function (field) {
                if (!validateField(field)) isValid = false;
            });

            if (!isValid) {
                if (statusBox) {
                    statusBox.textContent = 'Please fix the highlighted fields and try again.';
                    statusBox.className = 'form-status error';
                }
                return;
            }

            const submitBtn = form.querySelector('[type="submit"]');
            const originalBtnText = submitBtn.value;
            submitBtn.value = 'Sending...';
            submitBtn.disabled = true;

            if (statusBox) {
                statusBox.textContent = '';
                statusBox.className = 'form-status';
            }

            // AJAX submission (no page reload) to the service set in the
            // form's action attribute (Formspree). See README for setup.
            fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: { 'Accept': 'application/json' }
            })
                .then(function (response) {
                    if (response.ok) {
                        if (statusBox) {
                            statusBox.textContent = 'Thank you! Your message has been sent — we will get back to you promptly.';
                            statusBox.className = 'form-status success';
                        }
                        form.reset();
                    } else {
                        return response.json().then(function (data) {
                            throw new Error((data && data.error) || 'Something went wrong. Please try again.');
                        });
                    }
                })
                .catch(function (err) {
                    if (statusBox) {
                        statusBox.textContent = 'Sorry, there was a problem sending your message: ' + err.message;
                        statusBox.className = 'form-status error';
                    }
                })
                .finally(function () {
                    submitBtn.value = originalBtnText;
                    submitBtn.disabled = false;
                });
        });
    }

    setupFormValidation('contact-form');
    setupFormValidation('enquiry-form');

});
