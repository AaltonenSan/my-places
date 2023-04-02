import { Button, Input, ListItem } from "@rneui/themed";
import { useEffect, useState } from "react";
import { Alert, FlatList, Keyboard, StyleSheet, View } from "react-native";
import { GOOGLE_KEY } from '@env';
import * as SQLite from 'expo-sqlite'

const db = SQLite.openDatabase('place.db')

export default function PlaceList({ navigation }) {
  const [address, setAddress] = useState('')
  const [places, setPlaces] = useState([])

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS place (id integer primary key not null, address text);'
      )
    }, null, updateList)
  }, [])

  const updateList = () => {
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM place;', [], (_, { rows }) =>
        setPlaces(rows._array)
      )
    }, null, null)
  }

  // Check that address is found before saving it
  const saveItem = async () => {
    try {
      const response = await fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${address}&key=${GOOGLE_KEY}`)
      const coordinates = await response.json()
      if (coordinates.status === 'ZERO_RESULTS') {
        throw new Error()
      }

      db.transaction(tx => {
        tx.executeSql('INSERT INTO place (address) values (?);', [address])
      }, null, updateList)

      setAddress('')
      Keyboard.dismiss()
    } catch (error) {
      Alert.alert('Address not found')
    }
  }

  const deleteItem = (id) => {
    db.transaction(tx => {
      tx.executeSql('DELETE FROM place WHERE id = ?;', [id])
    }, null, updateList)
  }

  // Verify the deletion
  const handleDelete = (item) => {
    Alert.alert('Delete', item.address, [
      {
        text: 'Delete',
        onPress: () => deleteItem(item.id)
      },
      { text: 'Cancel' }
    ])
  }

  /*
   Fetching the coordinates here so that if address is not found
   for some reason, the view won't change to Map
  */
  const showOnMap = async (address) => {
    try {
      const response = await fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${address}&key=${GOOGLE_KEY}`)
      const coordinates = await response.json()
      const region = {
        latitude: coordinates.results[0].geometry.location.lat,
        longitude: coordinates.results[0].geometry.location.lng,
        latitudeDelta: 0.0300,
        longitudeDelta: 0.0120
      }
      navigation.navigate('Map', { region: region })
    } catch (error) {
      Alert.alert('Address not found')
      console.log(error)
    }
  }

  // Limit the displayed address length
  const titleLengthLimiter = (address) => {
    const maxLength = 20
    return address.length > maxLength
      ? address.substring(0, maxLength) + '...'
      : address
  }

  return (
    <View style={{ marginTop: 10 }}>
      <Input
        value={address}
        onChangeText={text => setAddress(text)}
        placeholder="Type in address"
        label='PLACEFINDER'
      />
      <Button
        title={'SAVE'}
        icon={{ name: 'save', color: '#fff' }}
        buttonStyle={styles.button}
        onPress={() => saveItem()}
      />
      <FlatList
        data={places}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ListItem
            topDivider
            onPress={() => showOnMap(item.address)}
            onLongPress={() => handleDelete(item)}
          >
            <ListItem.Content>
              <ListItem.Title>{titleLengthLimiter(item.address)}</ListItem.Title>
            </ListItem.Content>
            <ListItem.Subtitle style={styles.listSubtitle}>show on map</ListItem.Subtitle>
            <ListItem.Chevron size={30} />
          </ListItem>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  listSubtitle: {
    color: 'gray'
  },
  button: {
    backgroundColor: 'gray',
    marginBottom: 10,
    marginHorizontal: 10
  }
})