import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import * as SecureStore from "expo-secure-store";
import { auth } from "../api";

export default function SignInScreen({ navigation }: any) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");

  async function send() {
    try { await auth.sendOtp(phone); setStep("otp"); }
    catch (e: any) { Alert.alert("Error", e.message); }
  }
  async function verify() {
    try {
      const r = await auth.verifyOtp(phone, otp);
      await SecureStore.setItemAsync("astrotalk_session", (r as any).token || "ok");
      navigation.replace("Home");
    } catch (e: any) { Alert.alert("Error", e.message); }
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#1A1230", padding: 24, justifyContent: "center" }}>
      <Text style={{ color: "#F26B1D", fontSize: 36, fontWeight: "700" }}>Astrotalk</Text>
      <Text style={{ color: "#fff", marginTop: 8 }}>Sign in with your phone</Text>
      {step === "phone" ? (
        <>
          <TextInput value={phone} onChangeText={setPhone} placeholder="+91 phone" keyboardType="phone-pad"
            placeholderTextColor="#999"
            style={{ borderColor: "#fff3", borderWidth: 1, color: "#fff", padding: 12, borderRadius: 12, marginTop: 16 }} />
          <TouchableOpacity onPress={send} style={{ backgroundColor: "#F26B1D", padding: 14, borderRadius: 999, marginTop: 12, alignItems: "center" }}>
            <Text style={{ color: "#fff", fontWeight: "600" }}>Send OTP</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TextInput value={otp} onChangeText={setOtp} placeholder="OTP" keyboardType="number-pad"
            placeholderTextColor="#999"
            style={{ borderColor: "#fff3", borderWidth: 1, color: "#fff", padding: 12, borderRadius: 12, marginTop: 16 }} />
          <TouchableOpacity onPress={verify} style={{ backgroundColor: "#F26B1D", padding: 14, borderRadius: 999, marginTop: 12, alignItems: "center" }}>
            <Text style={{ color: "#fff", fontWeight: "600" }}>Verify & Sign in</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
