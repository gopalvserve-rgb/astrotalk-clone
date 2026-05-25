import { useState } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity } from "react-native";
import { ai } from "../api";

export default function KundaliScreen() {
  const [form, setForm] = useState({ name: "", date: "", time: "", place: "" });
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function go() {
    setBusy(true);
    try {
      const r = await ai.call("kundali_reading", form) as any;
      setText(r.text);
    } catch (e: any) { setText("Error: " + e.message); }
    setBusy(false);
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#1A1230" }} contentContainerStyle={{ padding: 16 }}>
      <Text style={{ color: "#fff", fontSize: 24, fontWeight: "700" }}>AI Kundali Reading</Text>
      {(["name","date","time","place"] as const).map(k => (
        <TextInput key={k} placeholder={k} placeholderTextColor="#888" value={(form as any)[k]}
          onChangeText={t => setForm({ ...form, [k]: t })}
          style={{ borderColor: "#fff3", borderWidth: 1, color: "#fff", padding: 12, borderRadius: 12, marginTop: 12 }} />
      ))}
      <TouchableOpacity onPress={go} disabled={busy} style={{ backgroundColor: "#F26B1D", padding: 14, borderRadius: 999, marginTop: 16, alignItems: "center" }}>
        <Text style={{ color: "#fff", fontWeight: "600" }}>{busy ? "Reading…" : "Get Reading"}</Text>
      </TouchableOpacity>
      {text ? <Text style={{ color: "#fff", marginTop: 16, lineHeight: 22 }}>{text}</Text> : null}
    </ScrollView>
  );
}
