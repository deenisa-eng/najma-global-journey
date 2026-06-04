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
const { data: rlsInfo, error: rlsError } = await supabase.rpc('sql', {
  q: "select relrowsecurity, relforcerowsecurity from pg_class where oid = 'public.umrah_departures'::regclass;"
});
console.log('rlsInfo', rlsInfo, 'rlsError', rlsError);
