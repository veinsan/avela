import { useState } from 'react';
import { Image, View } from 'react-native';

import { AppText, Banner, Button, FadeIn, Screen, SimulationLabel, TextField } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { validateLogin } from '../utils/format';
import { haptic } from '../utils/haptics';
import { rounded, spacing } from '../theme';

const MARK = require('../../assets/icon.png');

export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [failure, setFailure] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    const found = validateLogin(form);
    setErrors(found);
    setFailure(null);
    if (Object.keys(found).length) return;
    setBusy(true);
    try {
      await signIn(form.username.trim(), form.password);
      haptic.success();
      if (navigation.canGoBack()) navigation.goBack();
    } catch (e) {
      haptic.error();
      setFailure(e.message); // typed values stay in the form
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen footer={<Button label="Masuk" icon="log-in-outline" onPress={submit} loading={busy} />}>
      <FadeIn>
        <View style={{ alignItems: 'flex-start', gap: spacing.lg, marginTop: spacing.lg }}>
          <Image source={MARK} style={{ width: 64, height: 64, borderRadius: rounded.control }}
            accessibilityIgnoresInvertColors accessible={false} />
          <View style={{ gap: spacing.sm }}>
            <AppText variant="headline" accessibilityRole="header">Masuk ke Avela</AppText>
            <AppText color="textMuted">Masuk untuk mengirim laporan keluhan dan membaca tanggapan petugas.</AppText>
          </View>
        </View>
      </FadeIn>
      <View style={{ gap: spacing.lg, marginTop: spacing.xl }}>
        <TextField
          label="Nama pengguna"
          value={form.username}
          onChangeText={(username) => setForm({ ...form, username })}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="username"
          returnKeyType="next"
          error={errors.username}
        />
        <TextField
          label="Kata sandi"
          value={form.password}
          onChangeText={(password) => setForm({ ...form, password })}
          secureTextEntry
          autoComplete="password"
          returnKeyType="go"
          error={errors.password}
          onSubmitEditing={submit}
        />
        {failure ? <Banner tone="warning" title="Belum bisa masuk" animate>{failure}</Banner> : null}
        <SimulationLabel text="Akun dan petugas adalah simulasi tugas kuliah." />
      </View>
    </Screen>
  );
}
