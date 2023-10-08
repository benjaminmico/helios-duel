import { Stack } from 'expo-router';

export default function TabLayout() {
  return (
    <Stack>
      <Stack.Screen name='start' options={{ headerShown: false }} />
      <Stack.Screen name='heliosDuel' options={{ headerShown: false }} />
    </Stack>
  );
}
