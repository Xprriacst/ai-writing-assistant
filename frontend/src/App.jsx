import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FileText, 
  Upload, 
  Sparkles, 
  BookOpen, 
  Trash2, 
  Plus,
  Brain,
  Download
} from 'lucide-react';

const API_URL = 'https://ai-writing-assistant-7lkf.onrender.com';

function App() {
  const [activeTab, setActiveTab] = useState('train');
  const [articles, setArticles] = useState([]);
  const [styleProfile, setStyleProfile] = useState(null);
  const [newArticle, setNewArticle] = useState({ title: '', content: '' });
  const [generateTopic, setGenerateTopic] = useState('');
  const [generateLength, setGenerateLength] = useState('medium');
  const [generatedArticle, setGeneratedArticle] = useState('');
  const [isEditingArticle, setIsEditingArticle] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadArticles();
    loadStyleProfile();
  }, []);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const loadArticles = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/articles`);
      setArticles(response.data.articles);
    } catch (error) {
      console.error('Erreur lors du chargement des articles:', error);
    }
  };

  const loadStyleProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/style-profile`);
      setStyleProfile(response.data.profile);
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    }
  };

  const handleAddArticle = async (e) => {
    e.preventDefault();
    if (!newArticle.title || !newArticle.content) {
      showMessage('error', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/articles`, newArticle);
      setNewArticle({ title: '', content: '' });
      loadArticles();
      showMessage('success', 'Article ajouté avec succès !');
    } catch (error) {
      showMessage('error', 'Erreur lors de l\'ajout de l\'article');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteArticle = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return;

    try {
      await axios.delete(`${API_URL}/api/articles/${id}`);
      loadArticles();
      showMessage('success', 'Article supprimé');
    } catch (error) {
      showMessage('error', 'Erreur lors de la suppression');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/upload-article`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      loadArticles();
      showMessage('success', 'Fichier uploadé avec succès !');
    } catch (error) {
      showMessage('error', 'Erreur lors de l\'upload du fichier');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeStyle = async () => {
    if (articles.length === 0) {
      showMessage('error', 'Ajoutez au moins un article avant d\'analyser');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/analyze-style`);
      setStyleProfile(response.data.profile);
      showMessage('success', 'Analyse du style terminée !');
    } catch (error) {
      showMessage('error', 'Erreur lors de l\'analyse');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!generateTopic) {
      showMessage('error', 'Veuillez entrer un sujet');
      return;
    }

    if (!styleProfile) {
      showMessage('error', 'Analysez d\'abord votre style d\'écriture');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/generate`, {
        topic: generateTopic,
        length: generateLength
      });
      setGeneratedArticle(response.data.article);
      setIsEditingArticle(true);
      showMessage('success', 'Article généré avec succès !');
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Erreur lors de la génération';
      showMessage('error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const downloadArticle = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedArticle], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `article_${generateTopic.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-12 h-12 text-purple-600 mr-3" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Assistant d'Écriture IA
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Entraînez l'IA avec vos articles et générez du contenu dans votre style unique
          </p>
        </div>

        {/* Message de notification */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Navigation par onglets */}
        <div className="flex justify-center mb-8 space-x-4">
          <button
            onClick={() => setActiveTab('train')}
            className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'train'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <BookOpen className="w-5 h-5 mr-2" />
            Entraîner
          </button>
          <button
            onClick={() => setActiveTab('generate')}
            className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'generate'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Générer
          </button>
        </div>

        {/* Contenu de l'onglet Entraîner */}
        {activeTab === 'train' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Formulaire d'ajout */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Plus className="w-6 h-6 mr-2 text-purple-600" />
                Ajouter un article
              </h2>
              
              <form onSubmit={handleAddArticle} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre
                  </label>
                  <input
                    type="text"
                    value={newArticle.title}
                    onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Titre de l'article..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contenu
                  </label>
                  <textarea
                    value={newArticle.content}
                    onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
                    rows="10"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Contenu de l'article..."
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Ajout...' : 'Ajouter l\'article'}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <label className="flex items-center justify-center px-4 py-3 bg-blue-50 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                  <Upload className="w-5 h-5 mr-2" />
                  <span className="font-medium">Uploader un fichier</span>
                  <input
                    type="file"
                    accept=".txt,.md"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Formats acceptés: .txt, .md
                </p>
              </div>
            </div>

            {/* Liste des articles et analyse */}
            <div className="space-y-6">
              {/* Profil de style */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <Brain className="w-6 h-6 mr-2" />
                  Profil de style
                </h3>
                
                {styleProfile ? (
                  <div className="space-y-2">
                    <p><strong>Articles analysés:</strong> {styleProfile.total_articles}</p>
                    <p><strong>Mots totaux:</strong> {styleProfile.total_words}</p>
                    <p><strong>Longueur moyenne des phrases:</strong> {styleProfile.avg_sentence_length} mots</p>
                    <p className="text-sm opacity-90 mt-4">
                      Dernière analyse: {new Date(styleProfile.analyzed_at).toLocaleString('fr-FR')}
                    </p>
                  </div>
                ) : (
                  <p className="opacity-90">Aucun profil disponible. Analysez vos articles pour commencer.</p>
                )}
                
                <button
                  onClick={handleAnalyzeStyle}
                  disabled={loading || articles.length === 0}
                  className="mt-4 w-full bg-white text-purple-600 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Analyse...' : 'Analyser le style'}
                </button>
              </div>

              {/* Liste des articles */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <FileText className="w-6 h-6 mr-2 text-purple-600" />
                  Mes articles ({articles.length})
                </h3>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {articles.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      Aucun article. Ajoutez-en un pour commencer !
                    </p>
                  ) : (
                    articles.map((article) => (
                      <div
                        key={article.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{article.title}</h4>
                            <p className="text-sm text-gray-500 mt-1">
                              {article.content.substring(0, 100)}...
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {new Date(article.date).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteArticle(article.id)}
                            className="ml-4 text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contenu de l'onglet Générer */}
        {activeTab === 'generate' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Sparkles className="w-6 h-6 mr-2 text-purple-600" />
                Générer un article
              </h2>

              <form onSubmit={handleGenerate} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sujet de l'article
                  </label>
                  <input
                    type="text"
                    value={generateTopic}
                    onChange={(e) => setGenerateTopic(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Ex: Les bienfaits de la méditation..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longueur souhaitée
                  </label>
                  <select
                    value={generateLength}
                    onChange={(e) => setGenerateLength(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="short">Court (300-500 mots)</option>
                    <option value="medium">Moyen (700-1000 mots)</option>
                    <option value="long">Long (1500-2000 mots)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading || !styleProfile}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Génération en cours...' : 'Générer l\'article'}
                </button>
              </form>

              {!styleProfile && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-sm">
                    ⚠️ Vous devez d'abord ajouter des articles et analyser votre style dans l'onglet "Entraîner"
                  </p>
                </div>
              )}

              {/* Article généré */}
              {generatedArticle && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-xl font-bold">Article généré</h3>
                      <p className="text-sm text-gray-500">
                        {isEditingArticle
                          ? 'Modifiez librement le texte ci-dessous. Vos changements sont automatiquement sauvegardés.'
                          : 'Vous pouvez éditer l’article pour l’adapter avant de le télécharger.'}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setIsEditingArticle((prev) => !prev)}
                        className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                          isEditingArticle
                            ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                            : 'bg-white border border-purple-200 text-purple-600 hover:bg-purple-50'
                        }`}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        {isEditingArticle ? 'Terminer l’édition' : 'Modifier le texte'}
                      </button>
                      <button
                        onClick={() => navigator.clipboard.writeText(generatedArticle)}
                        className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Copier
                      </button>
                      <button
                        onClick={downloadArticle}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Télécharger
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {isEditingArticle ? (
                      <textarea
                        value={generatedArticle}
                        onChange={(e) => setGeneratedArticle(e.target.value)}
                        className="w-full min-h-[24rem] bg-white border border-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
                      />
                    ) : (
                      <div className="max-h-96 overflow-y-auto">
                        <pre className="whitespace-pre-wrap font-sans text-gray-800">
                          {generatedArticle}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
