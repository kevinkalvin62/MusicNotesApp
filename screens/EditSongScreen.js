import { v4 as uuidv4 } from 'uuid';
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet,
  TouchableWithoutFeedback, Keyboard, ScrollView,
  Button, Alert
} from 'react-native';


import { saveSong, getSongs } from '../storage';

export default function EditSongScreen({ route, navigation }) {
  const songId = route.params?.songId || null;
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);

  useEffect(() => {
    async function loadSong() {
      if (songId) {
        try {
          const all = await getSongs();
          const song = all.find(s => s.id === songId);
          if (song) {
            setTitle(song.title);
            setNotes(song.originalNotes.join(' '));
          }
        } catch (e) {
          console.error('[EditSong] Error cargando:', e);
        }
      }
    }
    loadSong();
  }, [songId]);

  const dismissEditing = () => {
    Keyboard.dismiss();
    setEditingTitle(false);
    setEditingNotes(false);
  };

  const handleSave = async () => {
    console.log('[EditSong] handleSave comenzando...');
    if (!title.trim()) {
      Alert.alert('Error', 'El título no puede estar vacío');
      return;
    }
    const songObj = {
      id: songId || uuidv4(),
      title: title.trim(),
      originalNotes: notes.split(' ').filter(n => n.trim() !== ''),
      transposition: 0,
      instrument: 'C',
      createdAt: Date.now(),
    };
    console.log('[EditSong] Objeto a guardar:', songObj);

    try {
      await saveSong(songObj);
      console.log('[EditSong] saveSong completado con éxito');
      Alert.alert('Éxito', 'Canción guardada!', [
        {
          text: 'OK', onPress: () => {
            console.log('[EditSong] Navegando hacia atrás');
            navigation.goBack();
          }
        }
      ]);
    } catch (err) {
      console.error('[EditSong] Error al guardar:', err);
      Alert.alert('Error', 'No se pudo guardar');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={dismissEditing}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {!editingTitle ? (
          <Text style={styles.title} onPress={() => setEditingTitle(true)}>
            {title || 'Toca para agregar título'}
          </Text>
        ) : (
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            autoFocus
            onBlur={() => setEditingTitle(false)}
            returnKeyType="done"
          />
        )}

        {!editingNotes ? (
          <Text style={styles.notes} onPress={() => setEditingNotes(true)}>
            {notes || 'Toca para agregar notas'}
          </Text>
        ) : (
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            multiline
            autoFocus
            onBlur={() => setEditingNotes(false)}
            placeholder="Notas"
          />
        )}

        <View style={{ marginTop: 20 }}>
          <Button title="Guardar canción" onPress={handleSave} />
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flexGrow: 1, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 20, color: '#222' },
  titleInput: { fontSize: 28, fontWeight: '700', marginBottom: 20, borderBottomWidth: 1, borderColor: '#aaa', paddingVertical: 4 },
  notes: { fontSize: 18, lineHeight: 26, color: '#444', minHeight: 120 },
  notesInput: {
    fontSize: 18, lineHeight: 26, minHeight: 120,
    borderBottomWidth: 1, borderColor: '#aaa', paddingVertical: 4, textAlignVertical: 'top'
  },
});
