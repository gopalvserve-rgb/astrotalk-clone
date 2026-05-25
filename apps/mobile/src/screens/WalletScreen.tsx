import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { wallet } from "../api";

export default function WalletScreen() {
  const [balance, setBalance] = useState<number>(0);
  useEffect(() => { wallet.balance().then((b: any) => setBalance(b.balance)).catch(() => {}); }, []);

  async function recharge(amt: number) {
    try {
      const r = await wallet.recharge(amt) as any;
      // Phase 7.x: use cashfree-react-native SDK with paymentSessionId
      Alert.alert("Recharge", `Session: ${r.paymentSessionId}`);
    } catch (e: any) { Alert.alert("Error", e.message); }
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#1A1230", padding: 16 }}>
      <Text style={{ color: "#fff", fontSize: 28, fontWeight: "700" }}>Wallet</Text>
      <View style={{ backgroundColor: "#F26B1D", padding: 24, borderRadius: 24, marginTop: 16 }}>
        <Text style={{ color: "#1A1230" }}>Available balance</Text>
        <Text style={{ color: "#1A1230", fontSize: 36, fontWeight: "700", marginTop: 4 }}>₹ {balance.toFixed(2)}</Text>
      </View>
      <Text style={{ color: "#fff", marginTop: 16, fontWeight: "600" }}>Quick recharge</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 8 }}>
        {[100, 200, 500, 1000, 2000].map(a => (
          <TouchableOpacity key={a} onPress={() => recharge(a)} style={{ backgroundColor: "#ffffff10", padding: 12, borderRadius: 999, margin: 4 }}>
            <Text style={{ color: "#fff" }}>₹ {a}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
