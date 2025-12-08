// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, TouchableOpacity } from "react-native";

// Custom Tab Bar Component
function CustomTabBar({ state, descriptors, navigation }: any) {
  return (
    <View
      style={{
        flexDirection: "row",
        position: "absolute",
        bottom: 50,
        backgroundColor: "white",
        marginHorizontal: 40, // Reduced margin to give more width
        borderRadius: 50,
        paddingHorizontal: 5, // Reduced padding
        paddingVertical: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        minHeight: 60,
      }}
    >
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={{
              flex: isFocused ? 3 : 1, // Give active tab even more space
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: 8,
              paddingHorizontal: 4, // Reduced padding
              borderRadius: 25,
              backgroundColor: isFocused ? "#0E7490" : "transparent",
              minWidth: 40,
            }}
          >
            {options.tabBarIcon?.({
              color: isFocused ? "#fff" : "#666",
              size: 20,
            })}

            {isFocused && (
              <Text
                numberOfLines={1}
                style={{
                  marginLeft: 4, // Reduced margin
                  fontSize: 11, // Slightly smaller font
                  
                  color: "#fff",
                  includeFontPadding: false, // Remove extra font padding
                  textAlignVertical: "center", // Better vertical alignment
                  fontFamily: "Quicksand_700Bold", // Add your font family here
                }}
              >
                {options.title}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="jobseekers/Home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="jobseekers/Jobs"
        options={{
          title: "Jobs",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="briefcase-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="jobseekers/Applications"
        options={{
          title: "Applications", // You can use the full title now
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="file-tray-full-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="jobseekers/Profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
