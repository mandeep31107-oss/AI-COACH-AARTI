import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useApp } from '../lib/AppContext';
import { CheckInCard } from './TodayScreen';
import { voice } from '../lib/voice';
import { tap } from '../lib/haptics';

export default function CheckInScreen({ navigation }: any) {
  const { theme, plan, checkIn, profile } = useApp();
  const [energy, setEnergy] = useState(plan?.energy ?? 3);
  const [budget, setBudget] = useState(plan?.timeBudget ?? 20);

  const firstName = profile?.name.split(' ')[0] ?? 'friend';

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <LinearGradient colors={theme.gradHero} style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 300 }} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 20 }}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Ionicons name="close" size={26} color={theme.text} />
          </Pressable>
          <Text style={{ color: theme.text, fontSize: 16, fontWeight: '800', marginLeft: 14 }}>Re-tune today</Text>
        </View>
        <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 0 }} showsVerticalScrollIndicator={false}>
          <Text style={{ color: theme.textDim, fontSize: 14, lineHeight: 21, marginBottom: 20 }}>
            Energy changes through the day, and your plan should change with it. Nothing you have already completed
            will be lost.
          </Text>
          <CheckInCard
            theme={theme}
            energy={energy}
            setEnergy={setEnergy}
            budget={budget}
            setBudget={setBudget}
            onSubmit={() => {
              tap('success');
              checkIn(energy, budget);
              voice.speak(
                energy <= 2
                  ? `Noted ${firstName}. I have made everything shorter and gentler.`
                  : `Done. Your day is rebuilt around ${budget} minutes.`
              );
              navigation.goBack();
            }}
          />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
