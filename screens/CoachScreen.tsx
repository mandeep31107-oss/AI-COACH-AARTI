import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useApp } from '../lib/AppContext';
import { radius } from '../lib/theme';
import { coachReply, CoachReply, QUICK_PROMPTS } from '../lib/coach';
import { emergencyPlan } from '../lib/engine';
import { voice } from '../lib/voice';
import { tap } from '../lib/haptics';

interface Msg {
  id: string;
  from: 'coach' | 'user';
  text: string;
  action?: CoachReply['action'];
  chips?: string[];
}

export default function CoachScreen({ navigation }: any) {
  const { theme, profile, logs, streak, addBlock, settings, updateSettings } = useApp();
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const listRef = useRef<FlatList<Msg>>(null);

  const firstName = profile?.name.split(' ')[0] ?? 'friend';

  const [messages, setMessages] = useState<Msg[]>([
    {
      id: 'm0',
      from: 'coach',
      text: `Namaste ${firstName}. I am Aarti. Tell me honestly how today feels — tired, rushed, guilty, or actually decent — and I will bend the plan around it. There is no wrong answer here.`,
      chips: QUICK_PROMPTS.slice(0, 4),
    },
  ]);

  useEffect(() => {
    const t = setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 250);
    return () => clearTimeout(t);
  }, [messages]);

  const send = (text: string) => {
    if (!text.trim() || !profile) return;
    tap();
    const userMsg: Msg = { id: `u${Date.now()}`, from: 'user', text: text.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      const reply = coachReply(text, profile, logs, streak);
      setTyping(false);
      setMessages((m) => [
        ...m,
        { id: `c${Date.now()}`, from: 'coach', text: reply.text, action: reply.action, chips: reply.chips },
      ]);
      voice.speak(reply.text);
    }, 750 + Math.random() * 500);
  };

  const runAction = (action: NonNullable<CoachReply['action']>) => {
    tap('medium');
    if (!profile) return;
    if (action.kind === 'rescue') {
      const b = emergencyPlan(profile, action.minutes || 5);
      addBlock(b);
      navigation.navigate('Player', { block: b });
    } else if (action.kind === 'house') {
      navigation.navigate('HouseTab');
    } else if (action.kind === 'progress') {
      navigation.navigate('ProgressTab');
    } else {
      navigation.navigate('TodayTab');
    }
  };

  if (!profile) return null;

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <LinearGradient colors={theme.gradHero} style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 220 }} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 20, paddingBottom: 14 }}>
          <LinearGradient
            colors={theme.gradWarm}
            style={{ width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="sparkles" size={21} color="#fff" />
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.text, fontSize: 18, fontWeight: '900', letterSpacing: -0.3 }}>Coach Aarti</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: theme.accent }} />
              <Text style={{ color: theme.textFaint, fontSize: 12 }}>
                {typing ? 'typing...' : 'Always here, never judging'}
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => {
              tap();
              updateSettings({ voice: !settings.voice });
              voice.stop();
            }}
            hitSlop={12}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: settings.voice ? theme.primarySoft : theme.cardAlt,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons
              name={settings.voice ? 'volume-high' : 'volume-mute'}
              size={19}
              color={settings.voice ? theme.primary : theme.textFaint}
            />
          </Pressable>
        </View>

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.id}
            contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 16 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <Bubble theme={theme} msg={item} onAction={runAction} onChip={send} />
            )}
            ListFooterComponent={typing ? <TypingBubble theme={theme} /> : null}
          />

          {/* Quick prompts */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 18, gap: 8, paddingBottom: 10 }}
            style={{ maxHeight: 48 }}
          >
            {QUICK_PROMPTS.map((p) => (
              <Pressable
                key={p}
                onPress={() => send(p)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 9,
                  borderRadius: radius.pill,
                  backgroundColor: theme.card,
                  borderWidth: 1,
                  borderColor: theme.border,
                  marginRight: 8,
                }}
              >
                <Text style={{ color: theme.textDim, fontSize: 12.5, fontWeight: '700' }}>{p}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Input */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              paddingHorizontal: 18,
              paddingTop: 8,
              paddingBottom: Platform.OS === 'ios' ? 6 : 14,
              borderTopWidth: 1,
              borderTopColor: theme.border,
              backgroundColor: theme.bg,
            }}
          >
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Tell Aarti anything..."
              placeholderTextColor={theme.textFaint}
              returnKeyType="send"
              onSubmitEditing={() => send(input)}
              style={{
                flex: 1,
                backgroundColor: theme.card,
                borderWidth: 1,
                borderColor: theme.border,
                borderRadius: radius.pill,
                paddingHorizontal: 18,
                paddingVertical: Platform.OS === 'ios' ? 13 : 10,
                color: theme.text,
                fontSize: 14.5,
              }}
            />
            <Pressable onPress={() => send(input)}>
              <LinearGradient
                colors={theme.gradWarm}
                style={{ width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' }}
              >
                <Ionicons name="arrow-up" size={21} color="#fff" />
              </LinearGradient>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function Bubble({ theme, msg, onAction, onChip }: any) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(a, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [a]);

  const isCoach = msg.from === 'coach';
  return (
    <Animated.View
      style={{
        opacity: a,
        transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
        alignItems: isCoach ? 'flex-start' : 'flex-end',
        marginBottom: 14,
      }}
    >
      <View
        style={{
          maxWidth: '88%',
          backgroundColor: isCoach ? theme.card : theme.primary,
          borderWidth: isCoach ? 1 : 0,
          borderColor: theme.border,
          borderRadius: 20,
          borderBottomLeftRadius: isCoach ? 6 : 20,
          borderBottomRightRadius: isCoach ? 20 : 6,
          paddingHorizontal: 16,
          paddingVertical: 13,
        }}
      >
        <Text style={{ color: isCoach ? theme.text : '#fff', fontSize: 14.5, lineHeight: 21.5 }}>{msg.text}</Text>
      </View>

      {isCoach && msg.action ? (
        <Pressable
          onPress={() => onAction(msg.action)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            marginTop: 9,
            paddingHorizontal: 15,
            paddingVertical: 11,
            borderRadius: radius.pill,
            backgroundColor: theme.accentSoft,
            borderWidth: 1,
            borderColor: theme.accent + '55',
          }}
        >
          <Ionicons name="flash" size={15} color={theme.accent} />
          <Text style={{ color: theme.accent, fontWeight: '800', fontSize: 13 }}>{msg.action.label}</Text>
        </Pressable>
      ) : null}

      {isCoach && msg.chips ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 9 }}>
          {msg.chips.map((c: string) => (
            <Pressable
              key={c}
              onPress={() => onChip(c)}
              style={{
                paddingHorizontal: 13,
                paddingVertical: 8,
                borderRadius: radius.pill,
                borderWidth: 1,
                borderColor: theme.border,
                backgroundColor: theme.cardAlt,
              }}
            >
              <Text style={{ color: theme.textDim, fontSize: 12, fontWeight: '700' }}>{c}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </Animated.View>
  );
}

function TypingBubble({ theme }: any) {
  const dots = [useRef(new Animated.Value(0.3)).current, useRef(new Animated.Value(0.3)).current, useRef(new Animated.Value(0.3)).current];
  useEffect(() => {
    const anims = dots.map((d, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 160),
          Animated.timing(d, { toValue: 1, duration: 340, useNativeDriver: true }),
          Animated.timing(d, { toValue: 0.3, duration: 340, useNativeDriver: true }),
        ])
      )
    );
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
  }, []);
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        flexDirection: 'row',
        gap: 5,
        backgroundColor: theme.card,
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 20,
        borderBottomLeftRadius: 6,
        paddingHorizontal: 18,
        paddingVertical: 15,
        marginBottom: 14,
      }}
    >
      {dots.map((d, i) => (
        <Animated.View key={i} style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: theme.textDim, opacity: d }} />
      ))}
    </View>
  );
}
