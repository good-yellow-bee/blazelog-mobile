import React, { forwardRef } from 'react';
import { StyleSheet, StyleProp, ViewStyle, TextInput as RNTextInput } from 'react-native';
import { TextInput, useTheme, HelperText } from 'react-native-paper';

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  placeholder?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: 'username' | 'password' | 'email' | 'name' | 'off';
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  onSubmitEditing?: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
}

export const Input = forwardRef<RNTextInput, InputProps>(
  (
    {
      label,
      value,
      onChangeText,
      error,
      secureTextEntry = false,
      placeholder,
      autoCapitalize = 'none',
      autoComplete = 'off',
      keyboardType = 'default',
      returnKeyType,
      onSubmitEditing,
      style,
      disabled = false,
      multiline = false,
      numberOfLines = 1,
    },
    ref
  ) => {
    const theme = useTheme();
    const [showPassword, setShowPassword] = React.useState(false);

    return (
      <>
        <TextInput
          ref={ref}
          label={label}
          value={value}
          onChangeText={onChangeText}
          mode="outlined"
          error={!!error}
          secureTextEntry={secureTextEntry && !showPassword}
          placeholder={placeholder}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          keyboardType={keyboardType}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          style={[styles.input, style]}
          disabled={disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          outlineStyle={styles.outline}
          right={
            secureTextEntry ? (
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
                forceTextInputFocus={false}
              />
            ) : undefined
          }
        />
        {error ? (
          <HelperText type="error" visible={!!error} style={styles.helper}>
            {error}
          </HelperText>
        ) : null}
      </>
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  input: {
    marginBottom: 4,
  },
  outline: {
    borderRadius: 8,
  },
  helper: {
    marginTop: -4,
    marginBottom: 8,
  },
});
