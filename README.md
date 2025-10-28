# 🤖 Assistant d'Écriture IA

Une application web qui vous permet d'entraîner une IA à écrire dans votre style personnel en analysant vos anciens articles.

## ✨ Fonctionnalités

- **📚 Entraînement personnalisé** : Ajoutez vos articles existants pour que l'IA apprenne votre style
- **🔍 Analyse de style** : L'IA analyse vos articles pour comprendre votre ton, vocabulaire et structure
- **✍️ Génération d'articles** : Créez de nouveaux articles sur n'importe quel sujet dans votre style
- **📁 Import de fichiers** : Uploadez vos articles au format .txt ou .md
- **💾 Sauvegarde locale** : Tous vos articles sont sauvegardés localement
- **🎨 Interface moderne** : Interface utilisateur élégante et intuitive

## 🚀 Installation

### Prérequis

- Python 3.8+
- Node.js 16+
- Une clé API OpenAI (optionnel pour la génération)

### 1. Backend (FastAPI)

```bash
cd backend

# Créer un environnement virtuel
python -m venv venv

# Activer l'environnement virtuel
# Sur macOS/Linux:
source venv/bin/activate
# Sur Windows:
# venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt

# (Optionnel) Configurer la clé API OpenAI
export OPENAI_API_KEY='votre-clé-api'

# Lancer le serveur
python main.py
```

Le backend sera accessible sur `http://localhost:8000`

### 2. Frontend (React)

```bash
cd frontend

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

Le frontend sera accessible sur `http://localhost:3000`

## 📖 Utilisation

### 1. Entraîner l'IA

1. Ouvrez l'application dans votre navigateur
2. Allez dans l'onglet **Entraîner**
3. Ajoutez vos articles de deux façons :
   - **Manuellement** : Copiez-collez le titre et le contenu
   - **Upload de fichier** : Uploadez des fichiers .txt ou .md
4. Une fois plusieurs articles ajoutés, cliquez sur **Analyser le style**
5. L'IA créera un profil de votre style d'écriture

### 2. Générer un article

1. Allez dans l'onglet **Générer**
2. Entrez le sujet souhaité
3. Choisissez la longueur (court, moyen, long)
4. Cliquez sur **Générer l'article**
5. L'IA créera un article dans votre style
6. Téléchargez l'article si vous le souhaitez

## 🔑 Configuration OpenAI (Optionnel)

Pour utiliser la génération d'articles avec GPT-4 :

1. Créez un compte sur [OpenAI](https://platform.openai.com/)
2. Générez une clé API
3. Ajoutez-la dans vos variables d'environnement :

```bash
export OPENAI_API_KEY='sk-...'
```

Ou créez un fichier `.env` dans le dossier `backend` :

```
OPENAI_API_KEY=sk-...
```

**Note** : Sans clé API OpenAI, l'application fonctionnera toujours pour l'entraînement et l'analyse, mais la génération d'articles retournera un message d'information.

## 🏗️ Architecture

```
ai-writing-assistant/
├── backend/
│   ├── main.py              # API FastAPI
│   ├── requirements.txt     # Dépendances Python
│   └── data/                # Données (créé automatiquement)
│       ├── articles.json    # Articles d'entraînement
│       └── style_profile.json # Profil de style
│
└── frontend/
    ├── src/
    │   ├── App.jsx          # Composant principal
    │   ├── main.jsx         # Point d'entrée
    │   └── index.css        # Styles globaux
    ├── package.json         # Dépendances npm
    └── vite.config.js       # Configuration Vite
```

## 🛠️ Technologies utilisées

### Backend
- **FastAPI** : Framework web Python moderne et rapide
- **OpenAI API** : Pour la génération de texte (optionnel)
- **Pydantic** : Validation des données

### Frontend
- **React** : Bibliothèque UI
- **Vite** : Build tool rapide
- **TailwindCSS** : Framework CSS utilitaire
- **Lucide React** : Icônes modernes
- **Axios** : Client HTTP

## 📝 API Endpoints

- `GET /api/articles` - Récupérer tous les articles
- `POST /api/articles` - Ajouter un article
- `DELETE /api/articles/{id}` - Supprimer un article
- `POST /api/upload-article` - Uploader un fichier
- `POST /api/analyze-style` - Analyser le style d'écriture
- `GET /api/style-profile` - Récupérer le profil de style
- `POST /api/generate` - Générer un nouvel article

## 🎨 Captures d'écran

L'interface comprend :
- Une vue d'entraînement avec formulaire d'ajout et liste des articles
- Un profil de style avec statistiques
- Une vue de génération avec options de personnalisation
- Une interface moderne avec des dégradés violet/bleu

## 🤝 Contribution

Ce projet est un exemple d'application. N'hésitez pas à le personnaliser selon vos besoins !

## 📄 Licence

MIT

## 🔮 Améliorations futures possibles

- Support de plus de formats de fichiers (PDF, DOCX)
- Analyse plus approfondie du style (figures de style, vocabulaire spécifique)
- Fine-tuning d'un modèle personnalisé
- Système de versions pour les articles générés
- Export en différents formats (Markdown, HTML, PDF)
- Suggestions de titres
- Détection de plagiat
- Multi-utilisateurs avec authentification

## 💡 Conseils d'utilisation

1. **Qualité avant quantité** : 5-10 articles bien écrits suffisent pour commencer
2. **Cohérence** : Utilisez des articles du même type/domaine pour de meilleurs résultats
3. **Révision** : Les articles générés sont des brouillons, relisez et ajustez toujours
4. **Itération** : Ajoutez plus d'articles au fil du temps pour améliorer la précision

---

Créé avec ❤️ pour améliorer votre processus d'écriture
