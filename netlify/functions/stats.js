const { requireAuth } = require('./utils/auth-utils');
const { readJSON } = require('./utils/db-utils');

exports.handler = async function(event, context) {
    try {
        const auth = requireAuth(event);
        
        // Les stats de base sont publiques
        const stats = await readJSON('stats.json');
        const orders = await readJSON('orders.json');
        const messages = await readJSON('messages.json');
        
        const basicStats = {
            totalOrders: stats.totalOrders || 0,
            totalRevenue: stats.totalRevenue || 0,
            pendingOrders: orders.filter(order => order.status === 'En attente').length,
            totalMessages: messages.length
        };
        
        // Si admin, retourner les stats détaillées
        if (auth.authorized) {
            const detailedStats = {
                ...basicStats,
                monthlyStats: stats.monthlyStats || {},
                yearlyStats: stats.yearlyStats || {},
                recentOrders: orders.slice(-10).reverse(),
                recentMessages: messages.slice(-10).reverse()
            };
            
            return {
                statusCode: 200,
                body: JSON.stringify(detailedStats)
            };
        }
        
        // Sinon, retourner les stats basiques
        return {
            statusCode: 200,
            body: JSON.stringify(basicStats)
        };
        
    } catch (error) {
        console.error('Erreur:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Erreur serveur' })
        };
    }
};