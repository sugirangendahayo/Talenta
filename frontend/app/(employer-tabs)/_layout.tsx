// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { useEffect, useRef } from "react";
import {
  TabBarVisibilityProvider,
  useTabBarVisibility,
} from "@/contexts/TabBarVisibilityContext";

// Custom Tab Bar Component
function CustomTabBar({ state, descriptors, navigation }: any) {
   const { isVisible } = useTabBarVisibility();
    const translateY = useRef(new Animated.Value(0)).current;
     useEffect(() => {
        Animated.timing(translateY, {
          toValue: isVisible ? 0 : 150, // Slide down 150px to hide
          duration: 300,
          useNativeDriver: true,
        }).start();
      }, [isVisible]);
  return (
    <Animated.View
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
        transform: [{ translateY }],
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
    </Animated.View>
  );
}

 function TabsContent(){
  return (
  
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="employers/Dashboard"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="employers/Jobs"
        options={{
          title: "My jobs",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="briefcase-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="employers/Applicants"
        options={{
          title: "Applicants", // You can use the full title now
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="file-tray-full-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="employers/Profile"
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
export default function TabLayout() {
  return (
    <TabBarVisibilityProvider>
      <TabsContent />
    </TabBarVisibilityProvider>
  );
}


