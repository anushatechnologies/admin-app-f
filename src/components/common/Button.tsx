import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '@/src/constants/theme';

type Props = {
  label: string;
  theme?: 'primary';
  onPress?: () => void;
};

export default function Button({ label, theme, onPress }: Props) {
  if (theme === 'primary') {
    return (
      <View
        style={[
          styles.buttonContainer,
          { borderWidth: 4, borderColor: COLORS.primary, borderRadius: BORDER_RADIUS.xl },
        ]}>
        <Pressable
          style={[styles.button, { backgroundColor: COLORS.white }]}
          onPress={onPress || (() => alert('You pressed a button.'))}>
          <FontAwesome name="picture-o" size={18} color={COLORS.background} style={styles.buttonIcon} />
          <Text style={[styles.buttonLabel, { color: COLORS.background }]}>{label}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.buttonContainer}>
      <Pressable 
        style={styles.button} 
        onPress={onPress || (() => alert('You pressed a button.'))}
      >
        <Text style={styles.buttonLabel}>{label}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    width: 320,
    height: 68,
    marginHorizontal: SPACING.lg - 4,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
  },
  button: {
    borderRadius: BORDER_RADIUS.md,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonIcon: {
    paddingRight: SPACING.sm,
  },
  buttonLabel: {
    color: COLORS.white,
    fontSize: 16,
  },
});
