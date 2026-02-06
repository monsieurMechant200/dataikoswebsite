// =================================================================
// GESTION DES CONTACTS
// =================================================================
document.getElementById('contactForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const data = Object.fromEntries(formData);
    
    try {
        const response = await fetch('/.netlify/functions/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...data,
                date: new Date().toISOString(),
                status: 'Non lu'
            })
        });
        
        if (response.ok) {
            // Afficher confirmation
            alert('Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.');
            
            // Réinitialiser le formulaire
            this.reset();
        } else {
            throw new Error('Erreur lors de l\'envoi du message');
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Une erreur est survenue lors de l\'envoi de votre message. Veuillez réessayer.');
    }
});