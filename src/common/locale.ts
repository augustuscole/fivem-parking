import { locale, type FlattenObjectKeys } from '@overextended/ox_lib';

type Raw = FlattenObjectKeys<typeof import('../../locales/en.json')>;

function Locale<T extends Raw>(str: T, ...args: any[]): string;
function Locale<T extends string>(str: T, ...args: any[]) {
  return locale(str, ...args);
}

export default Locale;
