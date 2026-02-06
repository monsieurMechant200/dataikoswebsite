const { requireAuth } = require('./utils/auth-utils');
const { readJSON, writeJSON, updateStats } = require('./utils/db-utils');

exports.handler = async function(event, context) {
    // Gérer les différentes méthodes HTTP
    switch (event.httpMethod) {
        case 'GET':
            return await getOrders(event);
        case 'POST':
            return await createOrder(event);
        case 'PUT':
            return await updateOrder(event);
        case 'DELETE':
            return await deleteOrder(event);
        default:
            return {
                statusCode: 405,
                body: JSON.stringify({ error: 'Méthode non autorisée' })
            };
    }
};

async function getOrders(event) {
    try {
        const auth = requireAuth(event);
        if (!auth.authorized) {
            // Pour les requêtes publiques, ne retourner que les données basiques
            const orders = await readJSON('orders.json');
            const publicOrders = orders.map(order => ({
                id: order.id,
                service: order.service,
                formula: order.formula,
                status: order.status,
                date: order.date
            }));
            
            return {
                statusCode: 200,
                body: JSON.stringify(publicOrders)
            };
        }
        
        // Pour les admins, retourner toutes les données
        const orders = await readJSON('orders.json');
        return {
            statusCode: 200,
            body: JSON.stringify(orders)
        };
    } catch (error) {
        console.error('Erreur:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Erreur serveur' })
        };
    }
}

async function createOrder(event) {
    try {
        const orderData = JSON.parse(event.body);
        
        // Générer un ID unique
        orderData.id = Date.now();
        orderData.date = new Date().toISOString();
        orderData.status = orderData.status || 'En attente';
        
        // Lire les commandes existantes
        const orders = await readJSON('orders.json');
        orders.push(orderData);
        
        // Sauvegarder
        await writeJSON('orders.json', orders);
        
        // Mettre à jour les statistiques
        await updateStats(orderData);
        
        return {
            statusCode: 201,
            body: JSON.stringify({ 
                success: true, 
                message: 'Commande créée avec succès',
                orderId: orderData.id 
            })
        };
    } catch (error) {
        console.error('Erreur:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Erreur lors de la création de la commande' })
        };
    }
}

async function updateOrder(event) {
    try {
        const auth = requireAuth(event);
        if (!auth.authorized) {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: 'Non autorisé' })
            };
        }
        
        const { id, ...updateData } = JSON.parse(event.body);
        const orders = await readJSON('orders.json');
        const orderIndex = orders.findIndex(order => order.id === id);
        
        if (orderIndex === -1) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'Commande non trouvée' })
            };
        }
        
        // Mettre à jour la commande
        const oldOrder = orders[orderIndex];
        orders[orderIndex] = { ...oldOrder, ...updateData };
        
        await writeJSON('orders.json', orders);
        
        // Mettre à jour les statistiques si le statut a changé
        if (updateData.status && updateData.status !== oldOrder.status) {
            await updateStats(orders[orderIndex]);
        }
        
        return {
            statusCode: 200,
            body: JSON.stringify({ 
                success: true, 
                message: 'Commande mise à jour' 
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

async function deleteOrder(event) {
    try {
        const auth = requireAuth(event);
        if (!auth.authorized) {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: 'Non autorisé' })
            };
        }
        
        const { id } = event.queryStringParameters;
        let orders = await readJSON('orders.json');
        const initialLength = orders.length;
        
        orders = orders.filter(order => order.id !== parseInt(id));
        
        if (orders.length === initialLength) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'Commande non trouvée' })
            };
        }
        
        await writeJSON('orders.json', orders);
        
        return {
            statusCode: 200,
            body: JSON.stringify({ 
                success: true, 
                message: 'Commande supprimée' 
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