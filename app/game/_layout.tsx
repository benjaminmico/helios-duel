import { Stack } from 'expo-router';

export default function TabLayout() {
  return (
    <Stack>
      <Stack.Screen name='heliosDuelTest' options={{ headerShown: false }} />
    </Stack>
  );
}
