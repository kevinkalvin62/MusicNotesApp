// screens/EditSongScreen.js

import React, { useState, useEffect, useMemo } from 'react';
import {
  View, TextInput, StyleSheet,
  TouchableWithoutFeedback, Keyboard, Alert,
  TouchableOpacity, Text
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveSong, getSongs } from '../storage';

// Generador simple de IDs
function generateId() {
  return 'id-' + Math.random().toString(36).substr(2, 16);
}

// Mapa de notas para notación americana y latina
const NOTES_MAP = {
  american: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
  latin: ['do', 'do#', 're', 're#', 'mi', 'fa', 'fa#', 'sol', 'sol#', 'la', 'la#', 'si'],
};

// Transponer nota individual con mapeo y case insensitive
function transposeNote(note, semitones, notation) {
  const notes = NOTES_MAP[notation];
  const index = notes.findIndex(n => n.toLowerCase() === note.toLowerCase());
  if (index === -1) return note; // Nota inválida
  const newIndex = (index + semitones + 12) % 12;
  return notes[newIndex];
}

// Parsea string de notas tanto juntas (e.g. "do,re,re") o separadas por espacio, coma o guion
function parseNotes(noteStr) {
  if (!noteStr) return [];
  // Divide por espacios, comas o guiones
  return noteStr
    .split(/[\s,;-]+/)
    .filter(n => n.trim() !== '');
}

// Transponer secuencia completa respetando la notación
function transposeSequence(noteStr, semitones, notation) {
  const notes = parseNotes(noteStr);
  const transposed = notes.map(n => transposeNote(n, semitones, notation));
  return transposed.join(' ');
}

export default function EditSongScreen({ route, navigation }) {
  const songId = route.params?.songId || null;

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [instrument, setInstrument] = useState('C');
  const [transposition, setTransposition] = useState(0);

  // Cargar configuración (notación y tema oscuro)
  const [notation, setNotation] = useState('american');
  const [themeDark, setThemeDark] = useState(false);

  // Carga configuración desde AsyncStorage
  useEffect(() => {
    async function loadSettings() {
      const n = await AsyncStorage.getItem('notation');
      const t = await AsyncStorage.getItem('themeDark');
      if (n) setNotation(n);
      if (t !== null) setThemeDark(t === 'true');
    }
    loadSettings();
  }, []);

  // Cargar canción si viene ID
  useEffect(() => {
    async function loadSong() {
      if (songId) {
        try {
          const all = await getSongs();
          const song = all.find(s => s.id === songId);
          if (song) {
            setTitle(song.title);
            setNotes(song.originalNotes.join(' '));
            setInstrument(song.instrument || 'C');
            setTransposition(song.transposition || 0);
          }
        } catch (e) {
          console.error('[EditSong] Error cargando:', e);
        }
      }
    }
    loadSong();
  }, [songId]);

  // Cuando cambia el instrumento, reseteamos la transposición para evitar acumulación
  useEffect(() => {
    setTransposition(0);
  }, [instrument]);

  // Ajustar transposición según instrumento (Bb = +2 semitonos, Eb = +9 semitonos)
  const instrumentOffset = {
    C: 0,
    Bb: 2,
    Eb: 9,
  }[instrument] || 0;

  // Notas transpuestas (considerando instrumentOffset + transposition)
  const transposedNotes = useMemo(() => {
    // Total semitonos es sumatoria
    const totalSemitones = transposition + instrumentOffset;
    return transposeSequence(notes, totalSemitones, notation);
  }, [notes, transposition, instrumentOffset, notation]);

  // Guardar canción
  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'El título no puede estar vacío');
      return;
    }

    const noteArray = parseNotes(notes);

    const songObj = {
      id: songId || generateId(),
      title: title.trim(),
      originalNotes: noteArray,
      transposition,
      instrument,
      createdAt: Date.now(),
    };

    try {
      await saveSong(songObj);
      Alert.alert('Éxito', 'Canción guardada!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      console.error('[EditSong] Error al guardar:', err);
      Alert.alert('Error', 'No se pudo guardar');
    }
  };

  const handleTranspose = (direction) => {
    setTransposition(prev => prev + direction);
  };

  // Cambiar instrumento y resetear transposición
  const toggleInstrument = () => {
    const order = ['C', 'Bb', 'Eb'];
    const next = order[(order.indexOf(instrument) + 1) % order.length];
    setInstrument(next);
    setTransposition(0);
  };

  const handleCopyToClipboard = async () => {
    await Clipboard.setStringAsync(transposedNotes);
    Alert.alert('Copiado', 'Notas transpuestas copiadas al portapapeles.');
  };

  // Estilos dinámicos para tema oscuro
  const styles = createStyles(themeDark);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>

        {/* Topbar */}
        <View style={styles.topbar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={themeDark ? '#eee' : '#333'} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleTranspose(-1)}>
            <Ionicons name="arrow-down" size={24} color={themeDark ? '#eee' : '#333'} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleTranspose(1)}>
            <Ionicons name="arrow-up" size={24} color={themeDark ? '#eee' : '#333'} />
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleInstrument} style={styles.instrumentBtn}>
            <Text style={styles.instrumentText}>{instrument}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSave}>
            <Ionicons name="save" size={24} color={themeDark ? '#eee' : '#333'} />
          </TouchableOpacity>
        </View>

        {/* Título */}
        <TextInput
          style={styles.titleInput}
          value={title}
          onChangeText={setTitle}
          placeholder="Título de la canción"
          placeholderTextColor={themeDark ? '#666' : '#aaa'}
        />

        {/* Campo de notas */}
        <TextInput
          style={styles.notesInput}
          value={notes}
          onChangeText={setNotes}
          multiline
          placeholder="Escribe tus notas aquí... (ej: do re mi, C D E)"
          placeholderTextColor={themeDark ? '#555' : '#ccc'}
          textAlignVertical="top"
          autoCapitalize="none"
        />

        {/* Vista previa transpuesta */}
        <View style={styles.previewBox}>
          <View style={styles.previewHeader}>
            <Text style={styles.previewLabel}>
              Notas transpuestas ({transposition >= 0 ? '+' + transposition : transposition}):
            </Text>
            <TouchableOpacity onPress={handleCopyToClipboard}>
              <MaterialIcons name="content-copy" size={20} color="#444" />
            </TouchableOpacity>
          </View>
          <Text style={styles.previewText}>{transposedNotes}</Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

function createStyles(dark) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: dark ? '#222' : '#fff' },
    topbar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 50,
      paddingBottom: 12,
      backgroundColor: dark ? '#333' : '#f6f6f6',
      elevation: 3,
    },
    instrumentBtn: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      backgroundColor: dark ? '#555' : '#ddd',
      borderRadius: 4,
    },
    instrumentText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: dark ? '#eee' : '#333',
    },
    titleInput: {
      fontSize: 24,
      fontWeight: '700',
      borderBottomWidth: 1,
      borderColor: dark ? '#555' : '#ccc',
      padding: 12,
      marginHorizontal: 16,
      marginBottom: 12,
      color: dark ? '#eee' : '#333',
    },
    notesInput: {
      flex: 1,
      fontSize: 18,
      padding: 16,
      color: dark ? '#eee' : '#333',
    },
    previewBox: {
      padding: 16,
      borderTopWidth: 1,
      borderColor: dark ? '#444' : '#eee',
      backgroundColor: dark ? '#111' : '#fafafa',
    },
    previewHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    previewLabel: {
      fontSize: 14,
      fontWeight: 'bold',
      color: dark ? '#bbb' : '#888',
    },
    previewText: {
      fontSize: 16,
      color: dark ? '#eee' : '#333',
    },
  });
}
