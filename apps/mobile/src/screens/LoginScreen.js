import { useRef, useState } from 'react';
import { Image, View } from 'react-native';
import { LogIn } from 'lucide-react-native';

import { Button, ErrorView, PageHeader, Screen, SimulationLabel, SunMark, TextField } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { validateLogin } from '../utils/format';
import { colors, gutter, spacing } from '../theme';

export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [failure, setFailure] = useState(null);
  const [busy, setBusy] = useState(false);
  const passwordRef = useRef(null);

  async function submit() {
    const found = validateLogin(form);
    setErrors(found);
    setFailure(null);
    if (Object.keys(found).length) return;
    setBusy(true);
    try {
      await signIn(form.username.trim(), form.password);
      if (navigation.canGoBack()) navigation.goBack();
    } catch (e) {
      setFailure(e.message); // typed values stay in the form
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <View style={{ marginHorizontal: -gutter, marginTop: -spacing.lg, marginBottom: spacing.xl, paddingTop: spacing.lg,
        alignItems: 'center', backgroundColor: colors.accentWash, borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
        overflow: 'hidden' }}>
        <SunMark size={110} style={{ position: 'absolute', left: -30, top: -24 }} />
        <Image source={require('../../assets/illustrations/window.png')} accessibilityIgnoresInvertColors
          resizeMode="contain" style={{ width: 220, height: 168 }} />
      </View>
      <PageHeader title="Masuk ke Avela"
        body="Kirim keluhan dari rumah dan baca tanggapan petugas, tanpa harus keluar menembus asap." />
      <TextField
        label="Nama pengguna"
        value={form.username}
        onChangeText={(username) => setForm({ ...form, username })}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="username"
        textContentType="username"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => passwordRef.current && passwordRef.current.focus()}
        error={errors.username}
        style={{ marginTop: spacing.sm }}
      />
      <TextField
        label="Kata sandi"
        value={form.password}
        onChangeText={(password) => setForm({ ...form, password })}
        inputRef={passwordRef}
        secureTextEntry
        autoComplete="password"
        textContentType="password"
        returnKeyType="go"
        error={errors.password}
        onSubmitEditing={submit}
        style={{ marginTop: spacing.lg }}
      />
      {failure ? <ErrorView message={failure} /> : null}
      <Button label="Masuk" icon={LogIn} onPress={submit} loading={busy} style={{ marginTop: spacing.xl }} />
      <SimulationLabel text="Akun dan petugas adalah simulasi tugas kuliah." style={{ marginTop: spacing.lg }} />
    </Screen>
  );
}
