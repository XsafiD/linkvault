import { Tabs, useRouter } from "expo-router";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import colors from "../../constants/colors";
import typography from "../../constants/typography";

const TabLayout = () => {
  const router = useRouter();

  return (
    <View style={styles.wrapper}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.gold,
          tabBarInactiveTintColor: colors.textTertiary,
          tabBarStyle: {
            backgroundColor: colors.tabBarBg,
            borderTopColor: colors.gold,
            borderTopWidth: StyleSheet.hairlineWidth,
            height: 64,
            paddingBottom: 8,
            paddingTop: 4,
            position: "absolute",
          },
          tabBarLabelStyle: {
            fontFamily: `${typography.font}-Medium`,
            fontSize: typography.sizes.xs,
            letterSpacing: typography.letterSpacings.wide,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="categories/index"
          options={{
            title: "Kategori",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="folder-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>

      {/* FAB - Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/add-url")}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={[colors.gold, colors.goldDark]}
          style={styles.fabGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="add" size={28} color={colors.bg} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

export default TabLayout;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  fab: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 36 : 28,
    alignSelf: "center",
    zIndex: 10,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});
