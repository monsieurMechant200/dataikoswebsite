const jwt = require('jsonwebtoken');

function verifyToken(token) {
    try {
        const decoded = jwt.verify(
            token, 
            process.env.JWT_SECRET || 'votre_secret_jwt_ici'
        );
        return { valid: true, decoded };
    } catch (error) {
        return { valid: false, error: error.message };
    }
}

function requireAuth(event) {
    const authHeader = event.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { authorized: false, error: 'Token manquant' };
    }
    
    const token = authHeader.split(' ')[1];
    const verification = verifyToken(token);
    
    if (!verification.valid) {
        return { authorized: false, error: 'Token invalide' };
    }
    
    return { 
        authorized: true, 
        user: verification.decoded 
    };
}

module.exports = {
    verifyToken,
    requireAuth
};