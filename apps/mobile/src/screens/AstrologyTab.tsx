import { View, Text, ScrollView, TouchableOpacity } from "react-native";

const ITEMS = [
  { label: "Free Kundli", emoji: "🔮", route: "Kundali" },
  { label: "Kundli Matching", emoji: "💞", route: "Match" },
  { label: "Today Panchang", emoji: "☀️", route: "Panchang" },
  { label: "AI Astrology Chat", emoji: "🤖", route: "Chat" },
  { label: "Face Reading", emoji: "👤", route: "FaceReading" },
  { label: "Palm Reading", emoji: "🖐", route: "PalmReading" },
  { label: "Tarot", emoji: "🃏", route: "Tarot" },
  { label: "Horoscopes", emoji: "🌟", route: "Horoscope" },
];

export default function AstrologyTab({ navigation }: any) {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#1A1230" }} contentContainerStyle={{ padding: 16 }}>
      <Text style={{ color: "#fff", fontSize: 28, fontWeight: "700" }}>Astrology</Text>
      <Text style={{ color: "#aaa", marginTop: 4 }}>Vedic, KP, Lal Kitab.</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 16 }}>
        {ITEMS.map(item => (
          <TouchableOpacity key={item.label} onPress={() => navigation.navigate(item.route)}
            style={{ width: "47%", margin: "1.5%", backgroundColor: "#ffffff10", borderColor: "#ffffff14", borderWidth: 1, padding: 16, borderRadius: 16 }}>
            <Text style={{ fontSize: 28 }}>{item.emoji}</Text>
            <Text style={{ color: "#fff", marginTop: 8, fontWeight: "600" }}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
