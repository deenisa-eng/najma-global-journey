import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const env = Object.fromEntries(
  fs.readFileSync('.env', 'utf8')
    .split(/\n/)
    .filter(Boolean)
    .map((line) => line.split('='))
    .map(([k, ...v]) => [k, v.join('=')])
);
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);
const payload = { id: `u-test-${Date.now()}`, label: 'Test 2026', depart: '2026-08-01', ret: '2026-08-15', seatsleft: 20 };
console.log('payload', payload);
const res = await supabase.from('umrah_departures').upsert(payload, { onConflict: 'id' }).select().maybeSingle();
console.log(JSON.stringify(res, null, 2));
