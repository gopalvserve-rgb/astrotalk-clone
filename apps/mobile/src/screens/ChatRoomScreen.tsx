import { useState } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity } from "react-native";
import { ai } from "../api";

export default function ChatRoomScreen() {
  const [msgs, setMsgs] = useState<{ role: string; body: string }[]>([
    { role: "ai", body: "Namaste! I'm your AI astrologer. Tell me your birth details and what you'd like to know." },
  ]);
  const [input, setInput] = useState("");

  async function send() {
    if (!input.trim()) return;
    const next = [...msgs, { role: "user", body: input }];
    setMsgs(next); setInput("");
    try {
      const r = await ai.call("chat_fallback", { message: input }) as any;
      setMsgs(m => [...m, { role: "ai", body: r.text }]);
    } catch (e) { /* show toast */ }
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#1A1230" }}>
      <FlatList data={msgs} keyExtractor={(_, i) => String(i)}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={{ alignSelf: item.role === "user" ? "flex-end" : "flex-start", backgroundColor: item.role === "user" ? "#F26B1D" : "#ffffff14", padding: 12, borderRadius: 16, marginBottom: 6, maxWidth: "80%" }}>
            <Text style={{ color: "#fff" }}>{item.body}</Text>
          </View>
        )} />
      <View style={{ flexDirection: "row", padding: 12, backgroundColor: "#0c0721" }}>
        <TextInput value={input} onChangeText={setInput} placeholder="Type…" placeholderTextColor="#999"
          style={{ flex: 1, borderColor: "#fff3", borderWidth: 1, padding: 10, color: "#fff", borderRadius: 24 }} />
        <TouchableOpacity onPress={send} style={{ backgroundColor: "#F26B1D", padding: 12, borderRadius: 999, marginLeft: 8 }}>
          <Text style={{ color: "#fff", fontWeight: "600" }}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
