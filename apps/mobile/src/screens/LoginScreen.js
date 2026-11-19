import { useState } from 'react';

import { AppText, Button, ErrorView, Screen, SimulationLabel, TextField } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { validateLogin } from '../utils/format';
import { spacing } from '../theme';

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
      if (navigation.canGoBack()) navigation.goBack();
    } catch (e) {
      setFailure(e.message); // typed values stay in the form
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <AppText variant="headline" accessibilityRole="header">
        Masuk ke Avela
      </AppText>
      <AppText color="textMuted" style={{ marginTop: spacing.sm }}>
        Masuk untuk mengirim laporan keluhan dan membaca tanggapan petugas.
      </AppText>
      <SimulationLabel text="Akun dan petugas adalah simulasi tugas kuliah." />
      <TextField
        label="Nama pengguna"
        value={form.username}
        onChangeText={(username) => setForm({ ...form, username })}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="username"
        error={errors.username}
        style={{ marginTop: spacing.xl }}
      />
      <TextField
        label="Kata sandi"
        value={form.password}
        onChangeText={(password) => setForm({ ...form, password })}
        secureTextEntry
        autoComplete="password"
        error={errors.password}
        onSubmitEditing={submit}
        style={{ marginTop: spacing.lg }}
      />
      {failure ? <ErrorView message={failure} /> : null}
      <Button label="Masuk" onPress={submit} loading={busy} style={{ marginTop: spacing.xl }} />
    </Screen>
  );
}
