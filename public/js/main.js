// =================================================================
// GESTIONNAIRE DE PAGES
// =================================================================
let currentPage = 'home';
let adminLoggedIn = false;

function changePage(page) {
    // Mettre à jour la navigation
    document.querySelectorAll('.nav-item-glass').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === page) {
            item.classList.add('active');
        }
    });
    
    // Changer la page
    document.querySelectorAll('.page-container').forEach(container => {
        container.classList.remove('active');
    });
    
    const pageElement = document.getElementById(`${page}-page`);
    if (pageElement) {
        pageElement.classList.add('active');
    }
    currentPage = page;
    
    // Gestion spécifique pour la galerie
    if (page === 'gallery') {
        loadGallery();
        updateGalleryUI(); // Mettre à jour l'interface selon les droits
    }
    
    // Gestion du scroll
    window.scrollTo(0, 0);
}

// Navigation par hash
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.substring(1);
    if (hash) changePage(hash);
});

// Gestion du scroll sur la navbar
window.addEventListener('scroll', function() {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(10, 14, 39, 0.8)';
    } else {
        navbar.style.background = 'var(--navbar-glass-bg)';
    }
});

// Charger les services
async function loadServices() {
    try {
        const response = await fetch('/api/services');
        const services = await response.json();
        
        const homeGrid = document.getElementById('servicesGrid');
        const solutionsGrid = document.getElementById('solutionsGrid');
        const serviceSelect = document.getElementById('service');
        const footerServices = document.querySelector('.footer-section:nth-child(2) .footer-links');
        
        if (homeGrid) {
            homeGrid.innerHTML = services.map(service => `
                <div class="service-card">
                    <div class="service-icon">
                        <i class="fas ${service.icon}"></i>
                    </div>
                    <h3>${service.title}</h3>
                    <p>${service.description}</p>
                    <a href="#commande" onclick="changePage('commande')" class="glass-btn" style="margin-top: 20px;">
                        Commander
                    </a>
                </div>
            `).join('');
        }
        
        if (solutionsGrid) {
            solutionsGrid.innerHTML = services.map(service => `
                <div class="service-card">
                    <div class="service-icon">
                        <i class="fas ${service.icon}"></i>
                    </div>
                    <h3>${service.title}</h3>
                    <p>${service.description}</p>
                    <div class="mt-4">
                        <li>Analyse personnalisée</li>
                        <li>Livraison rapide</li>
                        <li>Support 24/7</li>
                    </div>
                    <a href="#commande" onclick="changePage('commande')" class="glass-btn primary" style="margin-top: 20px;">
                        Commander maintenant
                    </a>
                </div>
            `).join('');
        }
        
        if (serviceSelect) {
            serviceSelect.innerHTML = '<option value="">Choisir un service</option>' +
                services.map(service => `
                    <option value="${service.key}">${service.title}</option>
                `).join('');
        }
        
        if (footerServices) {
            footerServices.innerHTML = services.map(service => `
                <li><a href="#solutions" onclick="changePage('solutions')">
                    <i class="fas ${service.icon}"></i> ${service.title}
                </a></li>
            `).join('');
        }
    } catch (error) {
        console.error('Erreur lors du chargement des services:', error);
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    // Charger les services
    loadServices();
    
    // Navigation initiale
    const hash = window.location.hash.substring(1);
    if (hash && document.getElementById(`${hash}-page`)) {
        changePage(hash);
    }
});

// Fonctions globales
window.changePage = changePage;