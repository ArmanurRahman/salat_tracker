import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/FontAwesome';
import HomeScreen from '../screens/HomeScreen';
import DailyPrayerLogScreen from '../screens/DailyPrayerLogScreen';
import StreaksScreen from '../screens/StreaksScreen';
import ProgressCalendarScreen from '../screens/ProgressCalendarScreen';
import RemindersScreen from '../screens/RemindersScreen';
import {
  View,
  Text,
  Platform,
  StyleSheet,
  StyleProp,
  TextStyle,
} from 'react-native';

const Tab = createBottomTabNavigator();

function TabBarIcon({
  name,
  color,
  focused,
}: {
  name: string;
  color: string;
  focused: boolean;
}) {
  return (
    <View style={styles.tabBarIconContainer}>
      <Icon
        name={name}
        size={focused ? 30 : 24}
        color={focused ? '#1976d2' : color}
        style={{}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const getTabBarLabelStyle = (focused: boolean): StyleProp<TextStyle> => ({
  fontSize: focused ? 15 : 13,
  fontWeight: focused ? 700 : 500,
  color: focused ? '#1976d2' : '#6b7a8f',
  marginBottom: Platform.OS === 'ios' ? 0 : 4,
});

function tabBarLabel({
  focused,
  routeName,
}: {
  focused: boolean;
  routeName: string;
}) {
  let label = routeName;
  if (routeName === 'Home') label = 'Home';
  else if (routeName === 'DailyPrayer') label = 'Today';
  else if (routeName === 'Streaks') label = 'Streaks';
  else if (routeName === 'Progress') label = 'Progress';
  else if (routeName === 'Reminders') label = 'Reminders';

  return <Text style={getTabBarLabelStyle(focused)}>{label}</Text>;
}

function tabBarIcon({
  color,
  focused,
  routeName,
}: {
  color: string;
  focused: boolean;
  routeName: string;
}) {
  let iconName = 'home';
  if (routeName === 'Home') iconName = 'home';
  else if (routeName === 'DailyPrayer') iconName = 'edit';
  else if (routeName === 'Streaks') iconName = 'star';
  else if (routeName === 'Progress') iconName = 'bar-chart';
  else if (routeName === 'Reminders') iconName = 'bell';
  return <TabBarIcon name={iconName} color={color} focused={focused} />;
}

export default function Navigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          height: 70,
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          backgroundColor: '#f7faff',
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 12,
          borderTopWidth: 0,
        },
        tabBarLabel: ({ focused }) =>
          tabBarLabel({ focused, routeName: route.name }),
        tabBarIcon: ({ color, focused }) =>
          tabBarIcon({ color, focused, routeName: route.name }),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="DailyPrayer" component={DailyPrayerLogScreen} />
      <Tab.Screen name="Streaks" component={StreaksScreen} />
      <Tab.Screen name="Progress" component={ProgressCalendarScreen} />
      <Tab.Screen name="Reminders" component={RemindersScreen} />
    </Tab.Navigator>
  );
}
