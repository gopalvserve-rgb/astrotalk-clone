import { View, Text, ScrollView, TouchableOpacity } from "react-native";

const ITEMS = [
  { label: "Numerology Report", emoji: "🔢" },
  { label: "Name Generator", emoji: "✨" },
  { label: "Life Path", emoji: "1️⃣" },
  { label: "Lucky Number", emoji: "🍀" },
];

export default function NumerologyTab() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#1A1230" }} contentContainerStyle={{ padding: 16 }}>
      <Text style={{ color: "#fff", fontSize: 28, fontWeight: "700" }}>Numerology</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 16 }}>
        {ITEMS.map(it => (
          <TouchableOpacity key={it.label} style={{ width: "47%", margin: "1.5%", backgroundColor: "#ffffff10", borderColor: "#ffffff14", borderWidth: 1, padding: 16, borderRadius: 16 }}>
            <Text style={{ fontSize: 28 }}>{it.emoji}</Text>
            <Text style={{ color: "#fff", marginTop: 8, fontWeight: "600" }}>{it.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
