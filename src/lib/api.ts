// src/lib/api.ts

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8082/api';

// --------------------------------------
// Helper pour récupérer l'utilisateur courant depuis localStorage
// --------------------------------------
const getCurrentUserId = (): number | null => {
  const userJson = localStorage.getItem('user');
  if (!userJson) return null;

  try {
    const user = JSON.parse(userJson);
    return typeof user.id === 'number' && user.id > 0 ? user.id : null;
  } catch {
    return null;
  }
};

// --------------------------------------
// Helper pour ajouter automatiquement le token JWT
// --------------------------------------
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

// --------------------------------------
// Fonction générique ultra-robuste
// --------------------------------------
const apiRequest = async (url: string, options: RequestInit = {}) => {
  const headers: HeadersInit = {
    ...options.headers,
    ...getAuthHeaders(),
  };

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

// --------------------------------------
// API Object
// --------------------------------------
export const api = {
  // ========================
  // Méthodes génériques
  // ========================
  get: <T = unknown>(url: string): Promise<T> => apiRequest(url) as Promise<T>,

  post: <T = unknown>(url: string, data?: BodyInit | Record<string, unknown>): Promise<T> =>
    apiRequest(url, {
      method: 'POST',
      body: data instanceof FormData ? data : data ? JSON.stringify(data) : undefined,
    }) as Promise<T>,

  put: <T = unknown>(url: string, data?: BodyInit | Record<string, unknown>): Promise<T> =>
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
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Échec de l’upload de la chanson');
    }
    return response.json();
  },

  getArtistSongs: async (artisteId: number) => {
    const response = await fetch(`${API_BASE_URL}/artiste/${artisteId}/chansons`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Impossible de charger les chansons');
    return response.json();
  },

  deleteSong: async (artisteId: number, chansonId: number) => {
    const response = await fetch(`${API_BASE_URL}/artiste/${artisteId}/chansons/${chansonId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Impossible de supprimer la chanson');
    }
  },

  // ========================
  // ALBUMS ENDPOINTS
  // ========================
createAlbum: async (artisteId: number, titre: string, cover?: File) => {
  const formData = new FormData();
  formData.append('titre', titre);
  if (cover) {
    formData.append('couverture', cover);  // ← CHANGÉ : 'cover' → 'couverture'
  }

  const response = await fetch(`${API_BASE_URL}/artiste/${artisteId}/albums`, {
    method: 'POST',
    body: formData,
    headers: getAuthHeaders(),
    // Pas de Content-Type ! fetch le met automatiquement pour FormData
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Échec de la création de l’album');
  }

  return response.json();
},

  getArtistAlbums: async (artisteId: number) => {
    const response = await fetch(`${API_BASE_URL}/artiste/${artisteId}/albums`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Impossible de charger les albums');
    return response.json();
  },

  addSongsToAlbum: async (artisteId: number, albumId: number, chansonIds: number[]) => {
    const response = await fetch(
      `${API_BASE_URL}/artiste/${artisteId}/albums/${albumId}/chansons`,
      {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chansonIds),
      }
    );

    const text = await response.text();
    if (!response.ok) {
      console.error('Erreur serveur lors de l’ajout des chansons :', text);
      throw new Error(text || 'Impossible d’ajouter les chansons à l’album');
    }

    if (!text.trim()) return { success: true };
    try {
      return JSON.parse(text);
    } catch {
      return { success: true };
    }
  },

  removeSongFromAlbum: async (artisteId: number, albumId: number, chansonId: number) => {
    const response = await fetch(
      `${API_BASE_URL}/artiste/${artisteId}/albums/${albumId}/chansons/${chansonId}`,
      { method: 'DELETE', headers: getAuthHeaders() }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Impossible de retirer la chanson de l’album');
    }

    return response.json();
  },

  deleteAlbum: async (artisteId: number, albumId: number) => {
    const response = await fetch(`${API_BASE_URL}/artiste/${artisteId}/albums/${albumId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Impossible de supprimer l’album');
    }
  },

  // ========================
  // SEARCH ENDPOINTS
  // ========================
getAllChansons: async () => {
  return apiRequest('/search/chansons?query=');
},

searchArtistes: async (query: string) => {
  return apiRequest(`/search/artistes?query=${encodeURIComponent(query)}`);
},

searchChansons: async (query: string) => {
  return apiRequest(`/search/chansons?query=${encodeURIComponent(query)}`);
},

// Nouvelle méthode pour rechercher des albums
searchAlbums: async (query: string) => {
  return apiRequest(`/search/albums?query=${encodeURIComponent(query)}`);
},
  // ========================
  // CHANSON ENDPOINTS (ÉCOUTE)
  // ========================

  getChanson: async (id: number) => {
    return apiRequest(`/chansons/${id}`);
  },
  getRandomSongsByMood: async (humeur: string): Promise<[]> => {
    if (!humeur || humeur.trim() === '') {
      throw new Error('L\'humeur est requise');
    }
    return apiRequest(`/chansons/random?humeur=${encodeURIComponent(humeur.trim())}`);
  },

  // ========================
  // PLAYLISTS ENDPOINTS
  // ========================

  createPlaylist: async (userId: number, titre: string, visible: boolean) => {
    const formData = new FormData();
    formData.append('titre', titre);
    formData.append('visible', visible.toString());
    return apiRequest(`/user/${userId}/playlists`, { method: 'POST', body: formData });
  },

  getUserPlaylists: async (userId: number) => {
    return apiRequest(`/user/${userId}/playlists`);
  },

  addSongsToPlaylist: async (userId: number, playlistId: number, chansonIds: number[]) => {
    return apiRequest(`/user/${userId}/playlists/${playlistId}/chansons`, {
      method: 'POST',
      body: JSON.stringify(chansonIds),
    });
  },

  removeSongFromPlaylist: async (userId: number, playlistId: number, chansonId: number) => {
    return apiRequest(`/user/${userId}/playlists/${playlistId}/chansons/${chansonId}`, { method: 'DELETE' });
  },

  deletePlaylist: async (userId: number, playlistId: number) => {
    return apiRequest(`/user/${userId}/playlists/${playlistId}`, { method: 'DELETE' });
  },

  // ========================
  // FAVORIS ENDPOINTS
  // ========================

  getUserFavoris: async (userId: number) => {
    return apiRequest(`/user/${userId}/favoris`);
  },

  addToFavoris: async (userId: number, chansonId: number) => {
    const formData = new FormData();
    formData.append('chansonId', chansonId.toString());
    return apiRequest(`/user/${userId}/favoris`, { method: 'POST', body: formData });
  },

  removeFromFavoris: async (userId: number, chansonId: number) => {
    return apiRequest(`/user/${userId}/favoris/${chansonId}`, { method: 'DELETE' });
  },
  removeFavori: async (userId: number, chansonId: number): Promise<void> => {
    const response = await fetch(`/api/users/${userId}/favoris/${chansonId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la suppression du favori');
    }
  },
  // src/lib/api.ts (ajoute ces lignes à la fin du fichier existant, sans toucher le reste)
  updatePlaylist: async (userId: number, playlistId: number, titre: string, visible: boolean) => {
    const formData = new FormData();
    formData.append('titre', titre);
    formData.append('visible', visible.toString());
    return apiRequest(`/user/${userId}/playlists/${playlistId}`, { method: 'PUT', body: formData });
  },
  // Ajouter dans la section FAVORIS ENDPOINTS de votre api.ts :

getUserFavorisArtistes: async (userId: number) => {
  return apiRequest(`/user/${userId}/favoris/artistes`);
},

addArtisteToFavoris: async (userId: number, artisteId: number) => {
  const formData = new FormData();
  formData.append('artisteId', artisteId.toString());
  return apiRequest(`/user/${userId}/favoris/artistes`, { method: 'POST', body: formData });
},

removeArtisteFromFavoris: async (userId: number, artisteId: number) => {
  return apiRequest(`/user/${userId}/favoris/artistes/${artisteId}`, { method: 'DELETE' });
},
  // ========================
  // RATING ENDPOINTS
  // ========================

  // Noter ou modifier une note
  rateChanson: async (userId: number, chansonId: number, note: number, comment?: string) => {
    const body = { 
      note,                    
      comment: comment?.trim() || null 
    };
    return apiRequest(`/user/${userId}/ratings/chansons/${chansonId}`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  // Supprimer une note
  deleteRating: async (userId: number, chansonId: number) => {
    return apiRequest(`/user/${userId}/ratings/chansons/${chansonId}`, {
      method: 'DELETE',
    });
  },

  // Récupérer la note de l'utilisateur pour une chanson spécifique
  getMyRatingForChanson: async (userId: number, chansonId: number) => {
    return apiRequest(`/user/${userId}/ratings/chansons/${chansonId}`);
  },

  // Stats d'une chanson
  getChansonStats: async (chansonId: number) => {
    return apiRequest(`/user/chansons/${chansonId}/stats`);
  },
  // RATING ENDPOINTS
// ========================

// Récupérer les stats de toutes les chansons d'un artiste (pour dashboard artiste)
getArtisteChansonsStats: async (artisteId: number): Promise<{ success: boolean; count?: number; data?:[]; message?: string }> => {
  return apiRequest(`/user/${artisteId}/chansons/stats`);
},
reportChanson: async (
  userId: number,
  chansonId: number,
  reason: string
) => {
  const body = { reason };

  return apiRequest(
    `/user/${userId}/chansons/${chansonId}/signaler`,
    {
      method: 'POST',
      body: JSON.stringify(body),
    }
  );
},
// ========================
  // PROFIL UTILISATEUR
  // ========================
  getMyProfile: async (userId: number) => {
    return apiRequest(`/user/${userId}/me`);
  },

  updateMyProfile: async (userId: number, data: Partial<{
    username?: string;
    nom?: string;
    prenom?: string;
    email?: string;
    numTel?: string;
    bio?: string;
    nomArtiste?: string;
    genre?: string;
    dateNaissance?: string;
  }>) => {
    return apiRequest(`/user/${userId}/me/profile`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  getReportedSongs: async () => {
    return apiRequest('/admin/chansons/signalees');
  },
};
