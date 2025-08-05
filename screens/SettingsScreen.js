import React, { useState, useEffect } from 'react';
import { View, Text, Switch, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen({ navigation }) {
  const [notation, setNotation] = useState('american');
  const [themeDark, setThemeDark] = useState(false);
  const [tagColor, setTagColor] = useState('#ff6600');

  useEffect(() => {
    async function loadSettings() {
      const n = await AsyncStorage.getItem('notation');
      const t = await AsyncStorage.getItem('themeDark');
      const c = await AsyncStorage.getItem('tagColor');
      if (n) setNotation(n);
      if (t !== null) setThemeDark(t === 'true');
      if (c) setTagColor(c);
    }
    loadSettings();
  }, []);

  const save = async () => {
    await AsyncStorage.setItem('notation', notation);
    await AsyncStorage.setItem('themeDark', themeDark.toString());
    await AsyncStorage.setItem('tagColor', tagColor);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Notación preferida:</Text>
      <Picker selectedValue={notation} onValueChange={setNotation}>
        <Picker.Item label="Americana (C D E)" value="american" />
        <Picker.Item label="Latina (do re mi)" value="latin" />
      </Picker>

      <View style={styles.row}>
        <Text style={styles.label}>Tema oscuro</Text>
        <Switch value={themeDark} onValueChange={setThemeDark} />
      </View>

      <Text style={styles.label}>Color de etiquetas:</Text>
      <View style={styles.colorRow}>
        {['#ff6600', '#0099ff', '#33cc33', '#cc33cc'].map(c => (
          <TouchableOpacity
            key={c}
            style={[styles.colorCircle, { backgroundColor: c, borderWidth: tagColor === c ? 3 : 0 }]}
            onPress={() => setTagColor(c)}
          />
        ))}
      </View>

      <Button title="Guardar configuración" onPress={save} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:16 },
  label: { fontSize:16, marginVertical:8 },
  row: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginVertical:12 },
  colorRow: { flexDirection:'row', marginVertical:8 },
  colorCircle: { width:32, height:32, borderRadius:16, marginHorizontal:8 },
});
