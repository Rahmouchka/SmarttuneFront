// src/lib/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8082/api';

// Fonction helper pour ajouter automatiquement le token JWT
const getAuthHeaders = (): HeadersInit => {
  const userJson = localStorage.getItem('user');
  if (!userJson) return {};

  try {
    const token = JSON.parse(userJson).token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
};

// Fonction générique ultra-robuste (gère JSON, texte vide, erreurs, etc.)
const apiRequest = async (url: string, options: RequestInit = {}) => {
  const headers: HeadersInit = {
    ...options.headers,
    ...getAuthHeaders(),
  };

  // Pour FormData, on ne met pas Content-Type (le navigateur le fait tout seul)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(text || `Erreur HTTP ${response.status}`);
  }

  if (!text.trim()) return { success: true };

  try {
    return JSON.parse(text);
  } catch {
    return { success: true, raw: text };
  }
};

export const api = {
  // Fonctions génériques (indispensables pour l'admin)
  get: <T = unknown>(url: string): Promise<T> =>
      apiRequest(url) as Promise<T>,

  post: <T = unknown>(url: string, data?: BodyInit | Record<string, any>): Promise<T> =>
      apiRequest(url, {
        method: 'POST',
        body: data instanceof FormData ? data : data ? JSON.stringify(data) : undefined,
      }) as Promise<T>,

  put: <T = unknown>(url: string, data?: BodyInit | Record<string, any>): Promise<T> =>
      apiRequest(url, {
        method: 'PUT',
        body: data instanceof FormData ? data : data ? JSON.stringify(data) : undefined,
      }) as Promise<T>,

  delete: <T = unknown>(url: string): Promise<T> =>
      apiRequest(url, { method: 'DELETE' }) as Promise<T>,

  // ========================
  // SONGS ENDPOINTS
  // ========================

  uploadSong: async (artisteId: number, formData: FormData) => {
    const response = await fetch(`${API_BASE_URL}/artiste/${artisteId}/chansons`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Échec de l’upload de la chanson');
    }
    return response.json();
  },

  getArtistSongs: async (artisteId: number) => {
    const response = await fetch(`${API_BASE_URL}/artiste/${artisteId}/chansons`);
    if (!response.ok) throw new Error('Impossible de charger les chansons');
    return response.json();
  },

  deleteSong: async (artisteId: number, chansonId: number) => {
    const response = await fetch(
      `${API_BASE_URL}/artiste/${artisteId}/chansons/${chansonId}`,
      { method: 'DELETE' }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Impossible de supprimer la chanson');
    }
    // Pas de JSON attendu sur DELETE → on ne fait rien
  },

  // ========================
  // ALBUMS ENDPOINTS
  // ========================

  createAlbum: async (artisteId: number, titre: string) => {
    const formData = new FormData();
    formData.append('titre', titre);

    const response = await fetch(`${API_BASE_URL}/artiste/${artisteId}/albums`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Échec de la création de l’album');
    }
    return response.json();
  },

  getArtistAlbums: async (artisteId: number) => {
    const response = await fetch(`${API_BASE_URL}/artiste/${artisteId}/albums`);
    if (!response.ok) throw new Error('Impossible de charger les albums');
    return response.json();
  },

  // LA FONCTION QUI POSAIT PROBLÈME → MAINTENANT 100% ROBUSTE
  addSongsToAlbum: async (artisteId: number, albumId: number, chansonIds: number[]) => {
    const response = await fetch(
      `${API_BASE_URL}/artiste/${artisteId}/albums/${albumId}/chansons`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chansonIds), // ex: [1, 3, 5]
      }
    );

    const text = await response.text();

    if (!response.ok) {
      console.error('Erreur serveur lors de l’ajout des chansons :', text);
      throw new Error(text || 'Impossible d’ajouter les chansons à l’album');
    }

    // Si le backend ne retourne rien → c’est OK
    if (!text.trim()) {
      return { success: true };
    }

    // Sinon on essaie de parser le JSON
    try {
      return JSON.parse(text);
    } catch (e) {
      console.warn('Réponse non-JSON reçue mais requête réussie :', text);
      return { success: true };
    }
  },

  deleteAlbum: async (artisteId: number, albumId: number) => {
    const response = await fetch(
      `${API_BASE_URL}/artiste/${artisteId}/albums/${albumId}`,
      { method: 'DELETE' }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Impossible de supprimer l’album');
    }
    // Pas de JSON attendu
  },
};