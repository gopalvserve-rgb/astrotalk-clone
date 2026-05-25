import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: false }),
});

export async function registerForPush(): Promise<string | null> {
  if (!Constants.isDevice) return null;
  const { status: existing } = await Notifications.getPermissionsAsync();
  let final = existing;
  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync(); final = status;
  }
  if (final !== "granted") return null;
  const token = (await Notifications.getExpoPushTokenAsync()).data;
  await SecureStore.setItemAsync("expo_push_token", token);
  return token;
}
