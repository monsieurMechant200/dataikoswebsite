const { readJSON } = require('./utils/db-utils');

exports.handler = async function(event, context) {
    const path = event.path.replace('/api/', '');
    
    try {
        switch(path) {
            case 'services':
                const services = await readJSON('services.json');
                return {
                    statusCode: 200,
                    body: JSON.stringify(services)
                };
                
            case 'pricing':
                const pricing = await readJSON('pricing.json');
                return {
                    statusCode: 200,
                    body: JSON.stringify(pricing)
                };
                
            case 'gallery':
                const gallery = await readJSON('gallery.json');
                return {
                    statusCode: 200,
                    body: JSON.stringify(gallery)
                };
                
            default:
                return {
                    statusCode: 404,
                    body: JSON.stringify({ error: 'Ressource non trouvée' })
                };
        }
    } catch (error) {
        console.error('Erreur:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Erreur serveur' })
        };
    }
};