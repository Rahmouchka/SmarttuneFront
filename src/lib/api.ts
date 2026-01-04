import { AlbumResponse, ChansonResponse } from "@/types/music";

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
  // UPLOAD D'UNE CHANSON
  // ========================
  uploadSong: async (artisteId: number, formData: FormData) => {
    const response = await fetch(`${API_BASE_URL}/artiste/${artisteId}/chansons`, {
      method: 'POST',
      body: formData, // Pas de headers Content-Type → fetch le gère automatiquement pour multipart
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Échec de l’upload de la chanson');
    }

    return response.json(); // Retourne l'objet Chanson complet
  },

  // ========================
  // RÉCUPÉRER LES CHANSONS DE L'ARTISTE
  // ========================
  getArtistSongs: async (artisteId: number): Promise<ChansonResponse[]> => {
    const response = await fetch(`${API_BASE_URL}/artiste/${artisteId}/chansons`);
    if (!response.ok) throw new Error('Impossible de charger les chansons');
    return response.json();
  },

  // ========================
  // SUPPRIMER UNE CHANSON
  // ========================
  deleteSong: async (artisteId: number, chansonId: number) => {
    const response = await fetch(
      `${API_BASE_URL}/artiste/${artisteId}/chansons/${chansonId}`,
      { method: 'DELETE' }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Impossible de supprimer la chanson');
    }
    // Le backend retourne un message texte → pas besoin de json()
  },

  // ========================
  // CRÉER UN ALBUM (avec ou sans couverture)
  // ========================
  createAlbum: async (artisteId: number, titre: string, couverture?: File) => {
    const formData = new FormData();
    formData.append('titre', titre);
    if (couverture) {
      formData.append('couverture', couverture);
    }

    const response = await fetch(`${API_BASE_URL}/artiste/${artisteId}/albums`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Échec de la création de l’album');
    }

    return response.json(); // Retourne l'objet Album
  },

  // ========================
  // RÉCUPÉRER LES ALBUMS DE L'ARTISTE
  // ========================
  getArtistAlbums: async (artisteId: number): Promise<AlbumResponse[]> => {
    const response = await fetch(`${API_BASE_URL}/artiste/${artisteId}/albums`);
    if (!response.ok) throw new Error('Impossible de charger les albums');
    return response.json();
  },

  // ========================
  // AJOUTER DES CHANSONS À UN ALBUM
  // ========================
  addSongsToAlbum: async (artisteId: number, albumId: number, chansonIds: number[]) => {
    const response = await fetch(
      `${API_BASE_URL}/artiste/${artisteId}/albums/${albumId}/chansons`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chansonIds),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Impossible d’ajouter les chansons à l’album');
    }

    // Le backend retourne un message texte simple
    const text = await response.text();
    return text || 'Chansons ajoutées avec succès';
  },

  // ========================
  // RETIRER UNE CHANSON D'UN ALBUM
  // ========================
  removeSongFromAlbum: async (artisteId: number, albumId: number, chansonId: number) => {
    const response = await fetch(
      `${API_BASE_URL}/artiste/${artisteId}/albums/${albumId}/chansons/${chansonId}`,
      { method: 'DELETE' }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Impossible de retirer la chanson de l’album');
    }

    return response.json(); // Retourne l'album mis à jour
  },

  // ========================
  // SUPPRIMER UN ALBUM
  // ========================
  deleteAlbum: async (artisteId: number, albumId: number) => {
    const response = await fetch(
      `${API_BASE_URL}/artiste/${artisteId}/albums/${albumId}`,
      { method: 'DELETE' }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Impossible de supprimer l’album');
    }
    // Message texte simple → pas de json()
  },
};