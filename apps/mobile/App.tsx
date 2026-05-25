import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import SignInScreen from "./src/screens/SignInScreen";
import AstrologyTab from "./src/screens/AstrologyTab";
import NumerologyTab from "./src/screens/NumerologyTab";
import VastuTab from "./src/screens/VastuTab";
import WalletScreen from "./src/screens/WalletScreen";
import ChatRoomScreen from "./src/screens/ChatRoomScreen";
import KundaliScreen from "./src/screens/KundaliScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function Tabs() {
  return (
    <Tab.Navigator screenOptions={{ headerStyle: { backgroundColor: "#1A1230" }, headerTintColor: "#fff", tabBarStyle: { backgroundColor: "#0c0721" }, tabBarActiveTintColor: "#F26B1D", tabBarInactiveTintColor: "#aaa" }}>
      <Tab.Screen name="Astrology" component={AstrologyTab} />
      <Tab.Screen name="Numerology" component={NumerologyTab} />
      <Tab.Screen name="Vastu" component={VastuTab} />
      <Tab.Screen name="Wallet" component={WalletScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: "#1A1230" }, headerTintColor: "#fff" }}>
        <Stack.Screen name="SignIn" component={SignInScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={Tabs} options={{ headerShown: false }} />
        <Stack.Screen name="Chat" component={ChatRoomScreen} />
        <Stack.Screen name="Kundali" component={KundaliScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
