import { tabsForRole } from '../src/navigation/RootNavigator';

test('residents and staff get separate tab sets', () => {
  expect(tabsForRole('staff')).not.toContain('Laporan');
  expect(tabsForRole('staff')).toContain('Akun');
  expect(tabsForRole('resident')).toEqual(expect.arrayContaining(['Beranda', 'Fasilitas', 'Akun']));
  expect(tabsForRole(undefined)).toEqual(tabsForRole('resident'));
});
