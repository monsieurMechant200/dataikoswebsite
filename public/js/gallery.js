// =================================================================
// GESTION DE LA GALERIE
// =================================================================
async function loadGallery() {
    try {
        const response = await fetch('/api/gallery');
        const gallery = await response.json();
        
        const galleryGrid = document.getElementById('galleryGrid');
        if (galleryGrid) {
            galleryGrid.innerHTML = gallery.map(item => createGalleryItem(item)).join('');
        }
        
        // Gestion des filtres
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const filter = this.dataset.filter;
                
                // Mettre à jour les boutons actifs
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Filtrer les éléments
                document.querySelectorAll('.gallery-item').forEach(item => {
                    if (filter === 'all' || item.dataset.category === filter) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
        
    } catch (error) {
        console.error('Erreur lors du chargement de la galerie:', error);
    }
}

function createGalleryItem(item) {
    return `
        <div class="gallery-item" data-category="${item.category}">
            <img src="${item.src}" alt="${item.title}" class="gallery-img">
            <div class="gallery-overlay">
                <h4>${item.title}</h4>
                <small>${new Date(item.date).toLocaleDateString('fr-FR')}</small>
                ${adminLoggedIn ? `
                    <div class="admin-list-item-actions">
                        <button class="admin-action-btn delete-btn" onclick="deleteGalleryItem('${item.id}')">
                            <i class="fas fa-trash"></i> Supprimer
                        </button>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

function updateGalleryUI() {
    const uploadArea = document.getElementById('uploadArea');
    const restrictedMessage = document.getElementById('restrictedMessage');
    
    if (adminLoggedIn) {
        // Mode admin : upload activé
        uploadArea.classList.add('visible');
        uploadArea.innerHTML = `
            <i class="fas fa-cloud-upload-alt"></i>
            <h3>Ajouter des photos à la galerie</h3>
            <p>Cliquez ici pour sélectionner des images (JPG, PNG, GIF - max. 5MB)</p>
            <div id="uploadMessage"></div>
        `;
        restrictedMessage.style.display = 'none';
        
        // Réattacher l'événement click
        uploadArea.onclick = () => document.getElementById('imageUpload').click();
    } else {
        // Mode visiteur : upload désactivé
        uploadArea.classList.remove('visible');
        restrictedMessage.style.display = 'block';
    }
}

function handleUploadClick() {
    if (!adminLoggedIn) {
        document.getElementById('uploadMessage').innerHTML = `
            <div class="restricted-message" style="margin-top: 15px; padding: 10px;">
                <i class="fas fa-lock"></i>
                <p><strong>Accès restreint</strong></p>
                <p>Seul l'administrateur peut ajouter des photos.</p>
                <button class="glass-btn mt-3" onclick="showAdminLogin()">
                    <i class="fas fa-sign-in-alt"></i> Se connecter
                </button>
            </div>
        `;
        return false;
    }
}

async function handleImageUpload(event) {
    if (!adminLoggedIn) {
        alert('Accès refusé. Seul l\'administrateur peut uploader des images.');
        return;
    }
    
    const files = event.target.files;
    if (files.length === 0) return;
    
    // Vérifier la taille des fichiers
    for (let file of files) {
        if (file.size > 5 * 1024 * 1024) { // 5MB
            alert(`Le fichier "${file.name}" dépasse la taille maximale de 5MB`);
            return;
        }
    }
    
    await uploadImagesToGallery(files);
}

async function uploadImagesToGallery(files) {
    const formData = new FormData();
    Array.from(files).forEach(file => {
        formData.append('images', file);
    });
    
    try {
        const response = await fetch('/.netlify/functions/gallery', {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
            }
        });
        
        if (response.ok) {
            // Recharger la galerie
            loadGallery();
            
            // Afficher message de confirmation
            document.getElementById('uploadMessage').innerHTML = `
                <div style="color: var(--success); margin-top: 15px;">
                    <i class="fas fa-check-circle"></i>
                    ${files.length} image(s) ajoutée(s) avec succès !
                </div>
            `;
            
            // Réinitialiser l'input
            document.getElementById('imageUpload').value = '';
            
            // Cacher le message après 3 secondes
            setTimeout(() => {
                document.getElementById('uploadMessage').innerHTML = '';
            }, 3000);
        } else {
            throw new Error('Erreur lors de l\'upload');
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de l\'upload des images');
    }
}

async function deleteGalleryItem(id) {
    if (!adminLoggedIn) {
        alert('Accès refusé. Seul l\'administrateur peut supprimer des images.');
        return;
    }
    
    if (confirm('Voulez-vous vraiment supprimer cette image de la galerie ?')) {
        try {
            const response = await fetch(`/.netlify/functions/gallery?id=${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
                }
            });
            
            if (response.ok) {
                // Recharger la galerie
                loadGallery();
            } else {
                throw new Error('Erreur lors de la suppression');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la suppression de l\'image');
        }
    }
}

// Fonctions globales
window.handleUploadClick = handleUploadClick;
window.handleImageUpload = handleImageUpload;
window.deleteGalleryItem = deleteGalleryItem;