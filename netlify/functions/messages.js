const { requireAuth } = require('./utils/auth-utils');
const { readJSON, writeJSON } = require('./utils/db-utils');

exports.handler = async function(event, context) {
    switch (event.httpMethod) {
        case 'GET':
            return await getMessages(event);
        case 'POST':
            return await createMessage(event);
        case 'PUT':
            return await updateMessage(event);
        case 'DELETE':
            return await deleteMessage(event);
        default:
            return {
                statusCode: 405,
                body: JSON.stringify({ error: 'Méthode non autorisée' })
            };
    }
};

async function getMessages(event) {
    try {
        const auth = requireAuth(event);
        if (!auth.authorized) {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: 'Non autorisé' })
            };
        }
        
        const messages = await readJSON('messages.json');
        return {
            statusCode: 200,
            body: JSON.stringify(messages)
        };
    } catch (error) {
        console.error('Erreur:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Erreur serveur' })
        };
    }
}

async function createMessage(event) {
    try {
        const messageData = JSON.parse(event.body);
        
        // Générer un ID unique
        messageData.id = Date.now();
        messageData.date = new Date().toISOString();
        messageData.status = messageData.status || 'Non lu';
        
        const messages = await readJSON('messages.json');
        messages.push(messageData);
        
        await writeJSON('messages.json', messages);
        
        return {
            statusCode: 201,
            body: JSON.stringify({ 
                success: true, 
                message: 'Message envoyé avec succès',
                messageId: messageData.id 
            })
        };
    } catch (error) {
        console.error('Erreur:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Erreur lors de l\'envoi du message' })
        };
    }
}

async function updateMessage(event) {
    try {
        const auth = requireAuth(event);
        if (!auth.authorized) {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: 'Non autorisé' })
            };
        }
        
        const { id, ...updateData } = JSON.parse(event.body);
        const messages = await readJSON('messages.json');
        const messageIndex = messages.findIndex(msg => msg.id === id);
        
        if (messageIndex === -1) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'Message non trouvé' })
            };
        }
        
        messages[messageIndex] = { ...messages[messageIndex], ...updateData };
        await writeJSON('messages.json', messages);
        
        return {
            statusCode: 200,
            body: JSON.stringify({ 
                success: true, 
                message: 'Message mis à jour' 
            })
        };
    } catch (error) {
        console.error('Erreur:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Erreur lors de la mise à jour' })
        };
    }
}

async function deleteMessage(event) {
    try {
        const auth = requireAuth(event);
        if (!auth.authorized) {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: 'Non autorisé' })
            };
        }
        
        const { id } = event.queryStringParameters;
        let messages = await readJSON('messages.json');
        const initialLength = messages.length;
        
        messages = messages.filter(msg => msg.id !== parseInt(id));
        
        if (messages.length === initialLength) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'Message non trouvé' })
            };
        }
        
        await writeJSON('messages.json', messages);
        
        return {
            statusCode: 200,
            body: JSON.stringify({ 
                success: true, 
                message: 'Message supprimé' 
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