import { View, Text, ScrollView, TouchableOpacity } from "react-native";

export default function VastuTab() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#1A1230" }} contentContainerStyle={{ padding: 16 }}>
      <Text style={{ color: "#fff", fontSize: 28, fontWeight: "700" }}>Vastu</Text>
      <TouchableOpacity style={{ marginTop: 16, backgroundColor: "#ffffff10", padding: 16, borderRadius: 16 }}>
        <Text style={{ fontSize: 28 }}>🏠</Text>
        <Text style={{ color: "#fff", marginTop: 8, fontWeight: "600" }}>AI Vastu Consultation</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
