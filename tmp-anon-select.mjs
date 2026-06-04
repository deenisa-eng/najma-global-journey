import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const env = Object.fromEntries(
  fs.readFileSync('.env', 'utf8')
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const [k, ...v] = line.split('=');
      return [k, v.join('=')];
    })
);
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) throw new Error('missing env');
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const { data, error } = await supabase.from('umrah_departures').select('*').limit(5);
console.log('error', error);
console.log('data', data);
