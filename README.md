# DATAIKÔS - Intelligence Artificielle & Solutions Digitales

Site web professionnel avec interface d'administration pour l'entreprise DATAIKÔS.

## 🚀 Déploiement sur Netlify

### 1. Prérequis
- Compte [Netlify](https://netlify.com)
- Compte [GitHub](https://github.com) (optionnel)
- [Node.js](https://nodejs.org) 18+ (pour le développement local)

### 2. Déploiement rapide

#### Option A: Via GitHub
1. Forkez ce dépôt sur GitHub
2. Connectez votre compte Netlify à GitHub
3. Choisissez ce dépôt dans Netlify
4. Configurez les variables d'environnement
5. Cliquez sur "Deploy"

#### Option B: Via Netlify CLI
```bash
# Installation
npm install -g netlify-cli

# Connexion
netlify login

# Initialisation
netlify init

# Déploiement
netlify deploy --prod