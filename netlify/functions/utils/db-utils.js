const fs = require('fs').promises;
const path = require('path');

// Chemin vers le dossier des données
const DATA_PATH = path.join(process.cwd(), 'data');

async function readJSON(filename) {
    try {
        const filePath = path.join(DATA_PATH, filename);
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // Si le fichier n'existe pas, retourner un tableau/objet vide
        if (filename.includes('.json')) {
            if (filename.includes('stats')) {
                return {
                    totalOrders: 0,
                    totalRevenue: 0,
                    monthlyStats: {},
                    yearlyStats: {}
                };
            }
            return filename.includes('gallery') ? [] : {};
        }
        throw error;
    }
}

async function writeJSON(filename, data) {
    try {
        const filePath = path.join(DATA_PATH, filename);
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error(`Erreur d'écriture dans ${filename}:`, error);
        throw error;
    }
}

async function updateStats(order) {
    try {
        const stats = await readJSON('stats.json');
        const date = new Date(order.date);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const yearMonth = `${year}-${month.toString().padStart(2, '0')}`;
        
        // Mettre à jour les statistiques
        stats.totalOrders = (stats.totalOrders || 0) + 1;
        stats.totalRevenue = (stats.totalRevenue || 0) + (order.price || 0);
        
        // Statistiques mensuelles
        if (!stats.monthlyStats) stats.monthlyStats = {};
        if (!stats.monthlyStats[yearMonth]) {
            stats.monthlyStats[yearMonth] = {
                orders: 0,
                revenue: 0,
                delivered: 0,
                deliveredRevenue: 0
            };
        }
        stats.monthlyStats[yearMonth].orders += 1;
        stats.monthlyStats[yearMonth].revenue += (order.price || 0);
        
        // Si la commande est livrée
        if (order.status === 'Livrée') {
            stats.monthlyStats[yearMonth].delivered += 1;
            stats.monthlyStats[yearMonth].deliveredRevenue += (order.price || 0);
        }
        
        // Statistiques annuelles
        if (!stats.yearlyStats) stats.yearlyStats = {};
        if (!stats.yearlyStats[year]) {
            stats.yearlyStats[year] = {
                orders: 0,
                revenue: 0,
                delivered: 0,
                deliveredRevenue: 0
            };
        }
        stats.yearlyStats[year].orders += 1;
        stats.yearlyStats[year].revenue += (order.price || 0);
        
        if (order.status === 'Livrée') {
            stats.yearlyStats[year].delivered += 1;
            stats.yearlyStats[year].deliveredRevenue += (order.price || 0);
        }
        
        await writeJSON('stats.json', stats);
        return stats;
    } catch (error) {
        console.error('Erreur lors de la mise à jour des statistiques:', error);
        throw error;
    }
}

module.exports = {
    readJSON,
    writeJSON,
    updateStats,
    DATA_PATH
};