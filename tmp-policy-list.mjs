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
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const { data, error } = await supabase.from('pg_policies').select('policyname, tablename, permissive, roles, qual, with_check').eq('tablename','umrah_departures');
console.log('error', error);
console.log('data', data);
