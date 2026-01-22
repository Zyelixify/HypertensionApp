import { useAppTheme } from '@/hooks/useAppTheme';
import { useUnifiedData } from '@/hooks/useUnifiedData';
import { NotificationService } from '@/services/NotificationService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { isSameDay } from 'date-fns';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import Animated, {
    SlideInDown,
    useAnimatedKeyboard,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

export default function ModalScreen() {
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [newStreak, setNewStreak] = useState(0);

  const router = useRouter();
  const theme = useAppTheme();

  const { bp } = useUnifiedData();
  const addMutation = bp.add;
  const { data: readings } = bp.readings;
  const currentStreak = bp.streak;

  // Animation values
  const screenHeight = Dimensions.get('window').height;
  const slideAnim = useSharedValue(0);
  const opacityAnim = useSharedValue(0);
  const keyboard = useAnimatedKeyboard(); 
  const insets = useSafeAreaInsets();

  const handleDismiss = () => {
    slideAnim.value = withTiming(screenHeight, { duration: 150 }, (finished) => {
        if (finished) scheduleOnRN(router.back);
    });
  };
  
  const animatedSheetStyle = useAnimatedStyle(() => ({
      transform: [
          { translateY: slideAnim.value },
      ],
      paddingBottom: keyboard.height.value + insets.bottom + 20
  }));

  const animatedOpacityStyle = useAnimatedStyle(() => ({
      opacity: opacityAnim.value
  }));

  const handleSave = async () => {
      if (!systolic || !diastolic) return;

      const today = new Date();
      const hasToday = readings?.some(r => isSameDay(new Date(r.timestamp), today));
      const calculatedStreak = hasToday ? currentStreak : (currentStreak === 0 ? 1 : currentStreak + 1);
      setNewStreak(calculatedStreak);
      
      // Trigger Notifications
      NotificationService.sendImmediateStreakNotification(calculatedStreak);
      
      // Update future notification plan
      // We optimistically include the new reading to plan correctly for tomorrow
      const newReadingObj = {
          systolic: parseInt(systolic),
          diastolic: parseInt(diastolic),
          timestamp: Date.now(),
          id: 'temp-optimistic',
          source: 'manual' as const
      };
      
      const updatedList = readings ? [...readings, newReadingObj] : [newReadingObj];
      NotificationService.planNotifications(updatedList, calculatedStreak);

      addMutation.mutate({
          systolic: parseInt(systolic),
          diastolic: parseInt(diastolic),
          timestamp: Date.now()
      });
      
      setShowSuccess(true);
      opacityAnim.value = withTiming(1, { duration: 200 });

      setTimeout(() => {
        handleDismiss();
      }, 1500);
  };

  return (
    <View style={[styles.overlay, { backgroundColor: theme.colors.backdrop }]}>
        {/* Transparent Backdrop */}
        <Pressable style={styles.backdrop} onPress={handleDismiss} />

        <View 
            style={{ flex: 1, justifyContent: 'flex-end' }}
            pointerEvents="box-none"
        >
            {/* Animated Bottom Sheet */}
            <Animated.View 
                entering={SlideInDown.springify().damping(18).mass(0.6).stiffness(250)}
                style={[
                    styles.sheet, 
                    { 
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.outlineVariant,
                        borderWidth: 1,
                        borderBottomWidth: 0,
                    },
                    animatedSheetStyle
                ]}
            >
                {showSuccess ? (
                    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                        <Animated.View style={[animatedOpacityStyle, { alignItems: 'center', width: '100%' }]}>
                            <MaterialCommunityIcons name="check-circle-outline" size={56} color={theme.custom.success} />
                            <Text variant="titleLarge" style={{ marginTop: 12, fontWeight: 'bold', color: theme.custom.success }}>Added</Text>
                            
                            <View style={{ flexDirection: 'row', marginTop: 20, width: '100%', justifyContent: 'space-around', paddingHorizontal: 40 }}>
                                 <View style={{ alignItems: 'center' }}>
                                    <Text variant="bodySmall" style={{color: theme.colors.secondary}}>Streak</Text>
                                    <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 4}}>
                                        <MaterialCommunityIcons name="fire" size={20} color={theme.custom.chart.systolic} />
                                        <Text variant="titleMedium" style={{ fontWeight: 'bold', marginLeft: 4 }}>{newStreak}</Text>
                                    </View>
                                 </View>
                                 <View style={{width: 1, backgroundColor: theme.colors.outlineVariant}} />
                                 <View style={{ alignItems: 'center' }}>
                                     <Text variant="bodySmall" style={{color: theme.colors.secondary}}>XP</Text>
                                     <Text variant="titleMedium" style={{ fontWeight: 'bold', marginTop: 4 }}>+50</Text>
                                 </View>
                            </View>
                        </Animated.View>
                    </View>
                ) : (
                    <>
                    
                <View style={[styles.handle, { backgroundColor: theme.colors.outline }]} />
                
                <View style={{ marginBottom: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>New Entry</Text>
                    <Button onPress={handleDismiss} textColor={theme.colors.secondary}>Cancel</Button>
                </View>

                <View style={{ flexDirection: 'row', gap: 16 }}>
                    <View style={{ flex: 1 }}>
                        <TextInput 
                            mode="flat"
                            label="Systolic"
                            placeholder="120" 
                            keyboardType="numeric" 
                            value={systolic} 
                            onChangeText={setSystolic}
                        style={{ 
                            backgroundColor: 'transparent', 
                            fontSize: 24, 
                            height: 60,
                            width: '100%',
                        }}
                        contentStyle={{ fontSize: 24, fontWeight: 'bold' }}
                        underlineColor={theme.colors.outline}
                        activeUnderlineColor={theme.custom.chart.systolic}
                        right={<TextInput.Affix text="mmHg" />}
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <TextInput 
                        mode="flat"
                        label="Diastolic"
                        placeholder="80" 
                        keyboardType="numeric" 
                        value={diastolic} 
                        onChangeText={setDiastolic}
                        style={{ 
                            backgroundColor: 'transparent', 
                            fontSize: 24, 
                            height: 60,
                            width: '100%',
                        }}
                        contentStyle={{ fontSize: 24, fontWeight: 'bold' }}
                        underlineColor={theme.colors.outline}
                        activeUnderlineColor={theme.custom.chart.diastolic}
                        right={<TextInput.Affix text="mmHg" />}
                    />
                </View>
            </View>

            <Button 
                mode="contained" 
                onPress={handleSave} 
                style={{ marginTop: 32, borderRadius: 12, paddingVertical: 6, backgroundColor: theme.colors.primary }}
                labelStyle={{ fontSize: 18, fontWeight: 'bold' }}
            >
                Saved Reading
            </Button>
                
                    </>
                )}
            </Animated.View>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    sheet: {
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        padding: 24,
        paddingTop: 12,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#CCC',
        alignSelf: 'center',
        marginBottom: 20,
        opacity: 0.5
    }
});
