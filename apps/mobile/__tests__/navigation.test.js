import { tabsForRole } from '../src/navigation/RootNavigator';

test('residents and staff get separate tab sets', () => {
  expect(tabsForRole('staff')).toEqual(['Antrean', 'Akun']); // no resident form or report tabs (T-33)
  expect(tabsForRole('resident')).toEqual(['Beranda', 'Laporan', 'Fasilitas', 'Akun']);
  expect(tabsForRole(undefined)).toEqual(tabsForRole('resident'));
});
