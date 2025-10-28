# 🚀 Configuration GitHub

## Étapes pour pousser le code sur GitHub

### 1. Créer le repository sur GitHub

1. Allez sur https://github.com/new
2. Nom du repository : `ai-writing-assistant`
3. Description : `AI Writing Assistant powered by Claude Sonnet 4.5 - Train AI to write in your style`
4. Choisissez **Public** ou **Private**
5. **NE PAS** initialiser avec README, .gitignore ou license (on les a déjà)
6. Cliquez sur **Create repository**

### 2. Lier et pousser le code

Une fois le repo créé, GitHub vous donnera des commandes. Utilisez celles-ci :

```bash
cd /Users/alexandreerrasti/CascadeProjects/ai-writing-assistant

# Ajouter le remote (remplacez YOUR_USERNAME par votre nom d'utilisateur GitHub)
git remote add origin https://github.com/YOUR_USERNAME/ai-writing-assistant.git

# Pousser le code
git branch -M main
git push -u origin main
```

### 3. Commandes alternatives si vous avez déjà un repo

Si vous avez déjà créé le repo, voici les commandes complètes :

```bash
cd /Users/alexandreerrasti/CascadeProjects/ai-writing-assistant
git remote add origin https://github.com/YOUR_USERNAME/ai-writing-assistant.git
git branch -M main
git push -u origin main
```

## ⚠️ Sécurité importante

Avant de pousser, vérifiez que vos clés API ne sont PAS dans le code :
- ✅ Les clés sont dans `.gitignore` (fichier `backend/data/`)
- ✅ Le fichier `.env.example` ne contient PAS de vraies clés
- ✅ Les fichiers de test avec clés sont dans `.gitignore`

## 📝 Après le push

Ajoutez ces badges dans votre README.md :

```markdown
![Python](https://img.shields.io/badge/python-3.9+-blue.svg)
![React](https://img.shields.io/badge/react-18.2-blue.svg)
![Claude](https://img.shields.io/badge/Claude-Sonnet%204.5-purple.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
```

## 🔗 Liens utiles

- Documentation Claude : https://docs.anthropic.com/
- Documentation OpenAI : https://platform.openai.com/docs
