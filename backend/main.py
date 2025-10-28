from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
import os
from datetime import datetime
from openai import OpenAI
from anthropic import Anthropic
from pathlib import Path

app = FastAPI(title="AI Writing Assistant")

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
DATA_DIR = Path("data")
ARTICLES_FILE = DATA_DIR / "articles.json"
STYLE_PROFILE_FILE = DATA_DIR / "style_profile.json"

# Créer le répertoire data s'il n'existe pas
DATA_DIR.mkdir(exist_ok=True)

# Models
class Article(BaseModel):
    id: Optional[str] = None
    title: str
    content: str
    date: Optional[str] = None

class GenerateRequest(BaseModel):
    topic: str
    length: str = "medium"  # short, medium, long
    tone: Optional[str] = None

class StyleAnalysis(BaseModel):
    vocabulary_richness: float
    avg_sentence_length: float
    common_phrases: List[str]
    tone: str
    structure_patterns: List[str]

# Utilitaires
def load_articles() -> List[dict]:
    """Charge les articles depuis le fichier JSON"""
    if ARTICLES_FILE.exists():
        with open(ARTICLES_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def save_articles(articles: List[dict]):
    """Sauvegarde les articles dans le fichier JSON"""
    with open(ARTICLES_FILE, 'w', encoding='utf-8') as f:
        json.dump(articles, f, ensure_ascii=False, indent=2)

def load_style_profile() -> Optional[dict]:
    """Charge le profil de style"""
    if STYLE_PROFILE_FILE.exists():
        with open(STYLE_PROFILE_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return None

def save_style_profile(profile: dict):
    """Sauvegarde le profil de style"""
    with open(STYLE_PROFILE_FILE, 'w', encoding='utf-8') as f:
        json.dump(profile, f, ensure_ascii=False, indent=2)

def analyze_writing_style(articles: List[dict]) -> dict:
    """Analyse le style d'écriture à partir des articles avec Claude"""
    if not articles:
        return {}
    
    total_words = 0
    total_sentences = 0
    all_text = ""
    
    for article in articles:
        content = article.get('content', '')
        all_text += content + " "
        
        # Analyse basique
        words = content.split()
        sentences = content.split('.')
        
        total_words += len(words)
        total_sentences += len([s for s in sentences if s.strip()])
    
    avg_sentence_length = total_words / max(total_sentences, 1)
    
    # Analyse avancée avec Claude
    try:
        claude_api_key = os.getenv('ANTHROPIC_API_KEY')
        if claude_api_key:
            client = Anthropic(api_key=claude_api_key)
            
            style_prompt = f"""Analyse en profondeur le style d'écriture suivant et retourne un JSON structuré avec ces analyses:

Texte à analyser:
{all_text[:3000]}

Retourne un JSON exactement avec cette structure:
{{
  "tone": "formel/informel/professionnel/décontracté/poétique",
  "vocabulary_level": "simple/moyen/avancé/littéraire",
  "sentence_structure": "courtes/moyennes/longues/variées",
  "writing_patterns": [
    "pattern 1 spécifique",
    "pattern 2 spécifique"
  ],
  "voice": "personnalité détectée (ex: didactique, narratif, introspectif)",
  "rhythm": "cadence perçue (ex: rapide, méditatif, dynamique)",
  "register": "niveau de langue (familier/courant/soutenu)",
  "special_features": [
    "élément stylistique 1",
    "élément stylistique 2"
  ]
}}

Sois précis et analytique dans ton évaluation."""

            response = client.messages.create(
                model="claude-sonnet-4-5",
                max_tokens=2000,
                messages=[
                    {"role": "user", "content": style_prompt}
                ]
            )
            
            # Extraire le JSON de la réponse
            import re
            json_match = re.search(r'\{.*\}', response.content[0].text, re.DOTALL)
            if json_match:
                claude_analysis = json.loads(json_match.group())
            else:
                claude_analysis = {"error": "Could not parse Claude response"}
        else:
            claude_analysis = {"error": "ANTHROPIC_API_KEY not configured"}
    except Exception as e:
        claude_analysis = {"error": f"Claude analysis failed: {str(e)}"}
    
    # Combiner l'analyse basique et l'analyse Claude
    return {
        "avg_sentence_length": round(avg_sentence_length, 1),
        "total_articles": len(articles),
        "total_words": total_words,
        "analyzed_at": datetime.now().isoformat(),
        "sample_text": all_text[:500],
        "advanced_analysis": claude_analysis
    }

def generate_article_with_style(topic: str, length: str, style_profile: dict) -> str:
    """Génère un article en utilisant Claude 3.5 Sonnet"""
    
    # Obtenir la clé API depuis les variables d'environnement
    api_key = os.getenv('ANTHROPIC_API_KEY')
    if not api_key:
        raise HTTPException(
            status_code=500, 
            detail="ANTHROPIC_API_KEY non configurée. Ajoutez votre clé API Claude dans les variables d'environnement."
        )
    
    client = Anthropic(api_key=api_key)
    
    # Déterminer la longueur cible
    length_guide = {
        "short": "300-500 mots",
        "medium": "700-1000 mots", 
        "long": "1500-2000 mots"
    }
    
    # Construire le prompt basé sur le style avec l'analyse Claude si disponible
    advanced_analysis = style_profile.get('advanced_analysis', {})
    
    style_description = f"""
Style d'écriture à imiter:
- Longueur moyenne des phrases: {style_profile.get('avg_sentence_length', 15)} mots
- Nombre d'articles de référence: {style_profile.get('total_articles', 0)}
- Ton: {advanced_analysis.get('tone', 'non spécifié')}
- Niveau de vocabulaire: {advanced_analysis.get('vocabulary_level', 'non spécifié')}
- Structure des phrases: {advanced_analysis.get('sentence_structure', 'non spécifié')}
- Voix/personnalité: {advanced_analysis.get('voice', 'non spécifiée')}
- Rythme: {advanced_analysis.get('rhythm', 'non spécifié')}
- Registre de langue: {advanced_analysis.get('register', 'non spécifié')}
- Patterns d'écriture: {', '.join(advanced_analysis.get('writing_patterns', ['non spécifiés']))}
- Caractéristiques spéciales: {', '.join(advanced_analysis.get('special_features', ['non spécifiées']))}

Exemple de style:
{style_profile.get('sample_text', '')}
"""

    prompt = f"""Tu es un expert en écriture capable d'imiter parfaitement n'importe quel style d'écriture.

{style_description}

Ta mission:
- Sujet: {topic}
- Longueur: {length_guide.get(length, '700-1000 mots')}
- Génère un article qui reproduit EXACTEMENT le style d'écriture analysé ci-dessus
- Respecte toutes les caractéristiques stylistiques: ton, vocabulaire, structure, voix, rythme, registre
- Utilise les mêmes patterns d'écriture et caractéristiques spéciales
- Sois créatif mais parfaitement cohérent avec le style fourni

IMPORTANT: Ne fais pas de résumé générique. Imite authentiquement le style. Rédige l'article complet directement."""

    try:
        response = client.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=2500,
            temperature=0.8,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        return response.content[0].text
    except Exception as e:
        # Fallback si Claude n'est pas disponible
        return f"""# {topic}

[Article généré - Configuration Claude requise]

Pour utiliser la génération d'articles avec Claude:
1. Obtenez une clé API sur https://console.anthropic.com/
2. Ajoutez ANTHROPIC_API_KEY dans vos variables d'environnement
3. Redémarrez le serveur

Erreur: {str(e)}"""

# Routes
@app.get("/")
def read_root():
    return {"message": "AI Writing Assistant API", "version": "1.0.0"}

@app.get("/api/articles")
def get_articles():
    """Récupère tous les articles d'entraînement"""
    articles = load_articles()
    return {"articles": articles, "count": len(articles)}

@app.post("/api/articles")
def add_article(article: Article):
    """Ajoute un nouvel article d'entraînement"""
    articles = load_articles()
    
    # Générer un ID unique
    article_dict = article.model_dump()
    article_dict['id'] = datetime.now().strftime("%Y%m%d%H%M%S")
    article_dict['date'] = datetime.now().isoformat()
    
    articles.append(article_dict)
    save_articles(articles)
    
    return {"message": "Article ajouté avec succès", "article": article_dict}

@app.delete("/api/articles/{article_id}")
def delete_article(article_id: str):
    """Supprime un article"""
    articles = load_articles()
    articles = [a for a in articles if a.get('id') != article_id]
    save_articles(articles)
    
    return {"message": "Article supprimé avec succès"}

@app.post("/api/analyze-style")
def analyze_style():
    """Analyse le style d'écriture basé sur les articles fournis"""
    articles = load_articles()
    
    if not articles:
        raise HTTPException(status_code=400, detail="Aucun article disponible pour l'analyse")
    
    style_profile = analyze_writing_style(articles)
    save_style_profile(style_profile)
    
    return {
        "message": "Analyse du style terminée",
        "profile": style_profile
    }

@app.get("/api/style-profile")
def get_style_profile():
    """Récupère le profil de style actuel"""
    profile = load_style_profile()
    
    if not profile:
        return {"message": "Aucun profil de style disponible. Analysez d'abord vos articles."}
    
    return {"profile": profile}

@app.post("/api/generate")
def generate_article(request: GenerateRequest):
    """Génère un nouvel article dans le style appris"""
    style_profile = load_style_profile()
    
    if not style_profile:
        raise HTTPException(
            status_code=400, 
            detail="Aucun profil de style disponible. Ajoutez des articles et analysez votre style d'abord."
        )
    
    try:
        article_content = generate_article_with_style(
            request.topic, 
            request.length, 
            style_profile
        )
        
        return {
            "article": article_content,
            "topic": request.topic,
            "length": request.length,
            "generated_at": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload-article")
async def upload_article(file: UploadFile = File(...)):
    """Upload un fichier texte comme article d'entraînement"""
    try:
        content = await file.read()
        text = content.decode('utf-8')
        
        # Extraire le titre du nom de fichier ou de la première ligne
        title = file.filename.replace('.txt', '').replace('.md', '')
        
        article = {
            'id': datetime.now().strftime("%Y%m%d%H%M%S"),
            'title': title,
            'content': text,
            'date': datetime.now().isoformat()
        }
        
        articles = load_articles()
        articles.append(article)
        save_articles(articles)
        
        return {"message": "Fichier uploadé avec succès", "article": article}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erreur lors de l'upload: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
