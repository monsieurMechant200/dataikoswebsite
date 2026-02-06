// =================================================================
// GESTION DES COMMANDES
// =================================================================
let currentStep = 1;

function updateSteps() {
    // Mettre à jour les étapes visuelles
    document.querySelectorAll('.order-step').forEach((step, index) => {
        step.classList.remove('active');
        if (index < currentStep) {
            step.classList.add('active');
        }
    });
    
    // Afficher/masquer les étapes du formulaire
    document.querySelectorAll('.form-step').forEach(step => {
        step.classList.remove('active');
    });
    
    const currentStepEl = document.getElementById(`step${currentStep}`);
    if (currentStepEl) {
        currentStepEl.classList.add('active');
    }
}

function nextStep() {
    if (currentStep < 4) {
        currentStep++;
        updateSteps();
    }
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        updateSteps();
    }
}

// Charger les prix dynamiquement
async function loadPricing() {
    try {
        const response = await fetch('/api/pricing');
        const pricing = await response.json();
        
        // Stocker les prix pour utilisation locale
        window.pricingData = pricing;
        
        // Configurer l'événement de changement de service
        const serviceSelect = document.getElementById('service');
        if (serviceSelect) {
            serviceSelect.addEventListener('change', function() {
                const service = this.value;
                const formulaSelect = document.getElementById('formula');
                
                if (service && pricing[service]) {
                    formulaSelect.innerHTML = '<option value="">Choisir une formule</option>';
                    
                    Object.entries(pricing[service]).forEach(([key, formula]) => {
                        const option = document.createElement('option');
                        option.value = key;
                        option.textContent = `${formula.name} - ${formula.price.toLocaleString()} FCFA`;
                        formulaSelect.appendChild(option);
                    });
                } else {
                    formulaSelect.innerHTML = '<option value="">Choisir une formule</option>';
                }
            });
        }
        
        // Gestion du calcul des prix
        const formulaSelect = document.getElementById('formula');
        if (formulaSelect) {
            formulaSelect.addEventListener('change', function() {
                const service = document.getElementById('service').value;
                const formula = this.value;
                const people = parseInt(document.getElementById('people').value) || 1;
                
                if (service && formula && pricing[service] && pricing[service][formula]) {
                    const formulaData = pricing[service][formula];
                    const totalPrice = formulaData.price * people;
                    
                    document.getElementById('priceDisplay').style.display = 'block';
                    document.getElementById('priceAmount').textContent = `${totalPrice.toLocaleString()} FCFA`;
                    document.getElementById('priceDetails').textContent = 
                        `${formulaData.name} - ${people} personne(s) - ${formulaData.desc}`;
                } else {
                    document.getElementById('priceDisplay').style.display = 'none';
                }
            });
        }
        
        // Mise à jour du prix quand le nombre de personnes change
        const peopleInput = document.getElementById('people');
        if (peopleInput) {
            peopleInput.addEventListener('change', function() {
                document.getElementById('formula').dispatchEvent(new Event('change'));
            });
        }
        
    } catch (error) {
        console.error('Erreur lors du chargement des prix:', error);
    }
}

// Soumission de la commande
document.getElementById('orderForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Récupérer les données
    const formData = new FormData(this);
    const data = Object.fromEntries(formData);
    
    // Calculer le prix final
    const service = data.service;
    const formula = data.formula;
    const people = parseInt(data.people) || 1;
    const urgency = data.urgency || 'normal';
    
    let price = 0;
    if (service && formula && window.pricingData && 
        window.pricingData[service] && window.pricingData[service][formula]) {
        price = window.pricingData[service][formula].price * people;
        
        // Multiplicateur d'urgence
        const urgencyMultiplier = {
            'normal': 1.0,
            'urgent': 1.3,
            'very-urgent': 1.8
        }[urgency] || 1.0;
        
        price = Math.round(price * urgencyMultiplier);
    }
    
    try {
        const response = await fetch('/.netlify/functions/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...data,
                price: price,
                status: 'En attente',
                date: new Date().toISOString()
            })
        });
        
        if (response.ok) {
            // Afficher confirmation
            alert(`Commande envoyée avec succès !\n\nRécapitulatif:\nService: ${data.service}\nFormule: ${data.formula}\nPrix: ${price.toLocaleString()} FCFA\n\nNous vous contacterons dans les plus brefs délais.`);
            
            // Réinitialiser le formulaire
            this.reset();
            currentStep = 1;
            updateSteps();
            document.getElementById('priceDisplay').style.display = 'none';
        } else {
            throw new Error('Erreur lors de l\'envoi de la commande');
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Une erreur est survenue lors de l\'envoi de votre commande. Veuillez réessayer.');
    }
});

// Initialisation des commandes
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser les étapes
    updateSteps();
    
    // Charger les prix
    loadPricing();
});

// Fonctions globales
window.nextStep = nextStep;
window.prevStep = prevStep;