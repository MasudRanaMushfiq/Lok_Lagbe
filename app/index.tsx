import { Text, View, Image, StyleSheet, TouchableOpacity, StatusBar, Platform } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

export default function Index() {
  const router = useRouter();

  const handleStart = () => {
    router.replace("/auth/login"); // Navigate to login page
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#4A8FF0"
      />

      {/* Logo/Icon */}
      <Image
        source={require("../assets/images/icon.png")} // Make sure the icon.png exists
        style={styles.icon}
        resizeMode="contain"
      />

      {/* Welcome Text */}
      <Text style={styles.title}>Welcome to LokLagbe</Text>
      <Text style={styles.subtitle}>Get your tasks done quickly and safely</Text>

      {/* Gradient Button */}
      <LinearGradient
        colors={['#3B7CF5', '#5AD9D5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.buttonGradient}
      >
        <TouchableOpacity style={styles.button} onPress={handleStart}>
          <Text style={styles.buttonText}>Let&apos;s Start</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F2FF', // Light theme background
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  icon: {
    width: 250,
    height: 250,
    marginBottom: 30,
    borderRadius: 18,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#3B7CF5',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#4b4f56',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  buttonGradient: {
    width: '80%',
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
});
