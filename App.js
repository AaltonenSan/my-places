import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PlaceList from './components/PlaceList';
import Map from './components/Map';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name='My Places' component={PlaceList}
          options={{ headerTitleStyle: { fontWeight: 'bold' } }}
        />
        <Stack.Screen name='Map' component={Map}
          options={{ headerTitleStyle: { fontWeight: 'bold' } }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}