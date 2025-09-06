import React from 'react';
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function HomeScreen({ navigation }) {
  return (
    <ImageBackground
      source={require('../assets/images/prayer-bg.jpg')}
      style={styles.bg}
      imageStyle={{ opacity: 0.22 }}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.85)', 'rgba(230,240,250,0.7)']}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.avatarBox}>
            <Icon name="user-circle" size={64} color="#3b4c5c" />
          </View>
          <Text style={styles.greeting}>Assalamu Alaikum!</Text>
          <Text style={styles.motivation}>
            Welcome back! Stay inspired and consistent in your prayers.
          </Text>

          <View style={styles.quickLinks}>
            <TouchableOpacity
              style={styles.link}
              onPress={() => navigation.navigate('DailyPrayer')}
            >
              <Icon name="edit" style={styles.linkIcon} color="#4a90e2" />
              <Text style={styles.linkText}>Log Daily Prayer</Text>
              <Icon name="chevron-right" size={18} color="#b0b0b0" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.link}
              onPress={() => navigation.navigate('Streaks')}
            >
              <Icon name="star" style={styles.linkIcon} color="#f5a623" />
              <Text style={styles.linkText}>View Streaks</Text>
              <Icon name="chevron-right" size={18} color="#b0b0b0" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.link}
              onPress={() => navigation.navigate('Reminders')}
            >
              <Icon name="bell" style={styles.linkIcon} color="#f8e71c" />
              <Text style={styles.linkText}>Prayer Reminders</Text>
              <Icon name="chevron-right" size={18} color="#b0b0b0" />
            </TouchableOpacity>
          </View>

          <View style={styles.quoteBox}>
            <Text style={styles.quoteTitle}>Motivational Quote</Text>
            <Text style={styles.quote}>
              "The best among you are those who have the best manners and
              character."
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    resizeMode: 'cover',
  },
  gradient: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  avatarBox: {
    marginTop: 40,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2d3a4b',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 1,
  },
  motivation: {
    fontSize: 18,
    color: '#3b4c5c',
    marginBottom: 32,
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '500',
  },
  quickLinks: {
    width: '100%',
    marginBottom: 32,
  },
  link: {
    flexDirection: 'row',
    backgroundColor: '#f7faff',
    borderRadius: 14,
    padding: 18,
    marginVertical: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
    gap: 16,
  },
  linkIcon: {
    fontSize: 28,
    marginRight: 16,
    textAlign: 'center',
  },
  linkText: {
    fontSize: 21,
    fontWeight: '600',
    color: '#1a2a3a',
    flex: 1,
    textAlign: 'left',
  },
  quoteBox: {
    backgroundColor: '#fffbe6',
    borderRadius: 12,
    padding: 22,
    marginTop: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  quoteTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#b48a00',
  },
  quote: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#7a6c3e',
    textAlign: 'center',
  },
});
