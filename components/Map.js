import { useRef, useState } from 'react';
import { View } from 'react-native';
import { Button } from '@rneui/themed'
import MapView, { Marker } from 'react-native-maps';

export default function Map({ route }) {
  const [region, setRegion] = useState(route.params.region)
  const mapRef = useRef(null)

  // Pressing SHOW button moves the map back to original address
  const showAddress = () => {
    mapRef.current.animateToRegion(route.params.region, 2 * 1000)
  }

  return (
    <View style={{ flex: 1, marginBottom: 60 }}>
      <MapView ref={mapRef} style={{ flex: 1 }} region={region}>
        <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} />
      </MapView>
      <Button title='SHOW' onPress={() => showAddress()} />
    </View>
  )
}