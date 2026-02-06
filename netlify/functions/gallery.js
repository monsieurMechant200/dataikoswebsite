const { requireAuth } = require('./utils/auth-utils');
const { readJSON, writeJSON } = require('./utils/db-utils');

exports.handler = async function(event, context) {
    switch (event.httpMethod) {
        case 'GET':
            return await getGallery(event);
        case 'POST':
            return await uploadImage(event);
        case 'DELETE':
            return await deleteImage(event);
        default:
            return {
                statusCode: 405,
                body: JSON.stringify({ error: 'Méthode non autorisée' })
            };
    }
};

async function getGallery(event) {
    try {
        const gallery = await readJSON('gallery.json');
        return {
            statusCode: 200,
            body: JSON.stringify(gallery)
        };
    } catch (error) {
        console.error('Erreur:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Erreur serveur' })
        };
    }
}

async function uploadImage(event) {
    try {
        const auth = requireAuth(event);
        if (!auth.authorized) {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: 'Non autorisé' })
            };
        }
        
        // Note: Pour gérer les uploads de fichiers, vous aurez besoin d'un service de stockage
        // comme Cloudinary ou AWS S3. Pour l'instant, nous allons simuler.
        
        const { title, category, imageUrl } = JSON.parse(event.body);
        
        const gallery = await readJSON('gallery.json');
        const newImage = {
            id: Date.now(),
            title: title || 'Nouvelle image',
            category: category || 'documents',
            src: imageUrl || '/assets/images/default/design.jpg',
            date: new Date().toISOString()
        };
        
        gallery.push(newImage);
        await writeJSON('gallery.json', gallery);
        
        return {
            statusCode: 201,
            body: JSON.stringify({ 
                success: true, 
                message: 'Image ajoutée avec succès',
                image: newImage 
            })
        };
    } catch (error) {
        console.error('Erreur:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Erreur lors de l\'upload' })
        };
    }
}

async function deleteImage(event) {
    try {
        const auth = requireAuth(event);
        if (!auth.authorized) {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: 'Non autorisé' })
            };
        }
        
        const { id } = event.queryStringParameters;
        let gallery = await readJSON('gallery.json');
        const initialLength = gallery.length;
        
        gallery = gallery.filter(item => item.id !== parseInt(id));
        
        if (gallery.length === initialLength) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'Image non trouvée' })
            };
        }
        
        await writeJSON('gallery.json', gallery);
        
        return {
            statusCode: 200,
            body: JSON.stringify({ 
                success: true, 
                message: 'Image supprimée' 
            })
        };
    } catch (error) {
        console.error('Erreur:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Erreur lors de la suppression' })
        };
    }
}