const jwt = require('jsonwebtoken');

exports.handler = async function(event, context) {
    // Empêcher l'exécution si ce n'est pas une requête POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Méthode non autorisée' })
        };
    }
    
    try {
        const { username, password } = JSON.parse(event.body);
        
        // Vérifier les identifiants
        const validCredentials = (
            username === 'david123' && 
            (password === 'stellar123' || password === 'mechant123')
        );
        
        if (validCredentials) {
            // Générer un token JWT
            const token = jwt.sign(
                { 
                    username: username,
                    role: 'admin',
                    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // Expire dans 24h
                },
                process.env.JWT_SECRET || 'votre_secret_jwt_ici'
            );
            
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    success: true, 
                    token: token,
                    message: 'Connexion réussie' 
                })
            };
        } else {
            return {
                statusCode: 401,
                body: JSON.stringify({ 
                    success: false, 
                    message: 'Identifiants incorrects' 
                })
            };
        }
    } catch (error) {
        console.error('Erreur d\'authentification:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                success: false, 
                message: 'Erreur serveur' 
            })
        };
    }
};