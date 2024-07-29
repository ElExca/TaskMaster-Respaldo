import { Stack } from 'expo-router';
import AppProviders from '@/presentation/providers/AppProviders';


const Layout: React.FC = () => {
  return (
    <AppProviders>
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="alltasks" options={{ headerShown: false }} />
      <Stack.Screen name="createtask" options={{ headerShown: false }} />
      <Stack.Screen name="completedTasks" options={{ headerShown: false }} />
      <Stack.Screen name="notStartedTasks" options={{ headerShown: false }} />
      <Stack.Screen name="inProgressTasks" options={{ headerShown: false }} />
      <Stack.Screen name="categoryTasks" options={{ headerShown: false }} />
      <Stack.Screen name="taskDetail" options={{ headerShown: false }} />
      <Stack.Screen name="editTask" options={{ headerShown: false }} />
    </Stack>
    </AppProviders>
  );
};

export default Layout;


