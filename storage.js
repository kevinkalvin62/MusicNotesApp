import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid'; // 👈 reemplaza uuidv4 por uuid

const SONGS_KEY = 'songs';

export async function getSongs() {
  try {
    const raw = await AsyncStorage.getItem(SONGS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    console.log('[storage:getSongs] Leídas', parsed.length, 'canciones:', parsed);
    return parsed;
  } catch (e) {
    console.error('[storage:getSongs] Error leyendo canciones:', e);
    return [];
  }
}

export async function saveSong(song) {
  try {
    console.log('[storage:saveSong] Recibiendo cancion:', song);
    const songs = await getSongs();
    const idx = songs.findIndex(s => s.id === song.id);
    if (idx !== -1) {
      songs[idx] = song;
      console.log('[storage:saveSong] Editando canción');
    } else {
      songs.push(song);
      console.log('[storage:saveSong] Agregando nueva canción');
    }
    await AsyncStorage.setItem(SONGS_KEY, JSON.stringify(songs));
    console.log('[storage:saveSong] Lista guardada, total:', songs.length);
  } catch (e) {
    console.error('[storage:saveSong] Falló al guardar:', e);
    throw e;
  }
}

export async function deleteSong(id) {
  try {
    const songs = await getSongs();
    const filtered = songs.filter(s => s.id !== id);
    await AsyncStorage.setItem(SONGS_KEY, JSON.stringify(filtered));
    console.log('[storage:deleteSong] Eliminada, total ahora:', filtered.length);
  } catch (e) {
    console.error('[storage:deleteSong] Error eliminando canción:', e);
  }
}
