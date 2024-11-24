// import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLinkingURL } from 'expo-linking';
import { useEffect } from 'react';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  const linkUrl = useLinkingURL();
  console.log("TabLayout-linkUrl", linkUrl);

  useEffect(() => {
    if (linkUrl) {
      // @ts-ignore
      router.navigate(linkUrl, {});
    }
  }, [linkUrl, router])

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'ChatScreen',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="chat.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="chatconnect"
        options={{
          title: 'ChatConnect',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="chat.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="qrcode"
        options={{
          title: 'QrCode',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="qrcode.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
