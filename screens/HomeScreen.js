import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { getSongs, deleteSong } from '../storage';
import { format } from 'date-fns';

export default function HomeScreen({ navigation }) {
  const [songs, setSongs] = useState([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    async function loadSongs() {
      const data = await getSongs();
      console.log('[HomeScreen] Canciones cargadas:', data);
      setSongs(data);
    }

    if (isFocused) {
      loadSongs();
    }
  }, [isFocused]);

  const handleDelete = (id) => {
    Alert.alert(
      'Eliminar canción',
      '¿Estás seguro de que quieres eliminar esta canción?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await deleteSong(id);
            const updated = await getSongs();
            setSongs(updated);
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('EditSong', { songId: item.id })}
      onLongPress={() => handleDelete(item.id)}
    >
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.date}>
        {format(new Date(item.createdAt), 'dd MMM yyyy HH:mm')}
      </Text>
      <Text style={styles.noteCount}>{item.originalNotes.length} notas</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={songs}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.empty}>No hay canciones guardadas</Text>
        }
        contentContainerStyle={{ padding: 10 }}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('EditSong')}
      >
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fefefe' },
  card: {
    backgroundColor: '#fffce6',
    padding: 16,
    marginVertical: 6,
    borderRadius: 8,
    elevation: 2,
  },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 4, color: '#333' },
  date: { fontSize: 12, color: '#666' },
  noteCount: { fontSize: 14, color: '#888', marginTop: 6 },
  empty: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#999',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#ffce00',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  fabText: { fontSize: 30, color: '#333' },
});
