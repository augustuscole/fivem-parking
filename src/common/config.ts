import type Raw from '../../static/config.json';
import { loadJson } from './utils';

export type Config = typeof Raw;
export default loadJson<Config>('static/config.json');
