const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

function parseEnvFile(envPath) {
  const env = {};
  const content = fs.readFileSync(envPath, 'utf8');

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const index = line.indexOf('=');
    if (index === -1) continue;

    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

async function run() {
  const envPath = path.resolve(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    throw new Error(`.env not found at ${envPath}`);
  }

  const env = parseEnvFile(envPath);
  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing in backend/.env');
  }

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, created_at, employee_id')
    .order('created_at', { ascending: true })
    .order('id', { ascending: true });

  if (usersError) throw usersError;
  if (!users || users.length === 0) {
    console.log('No users found. Nothing to update.');
    return;
  }

  for (const user of users) {
    const tempEmployeeId = `TMP-${user.id.slice(0, 8).toUpperCase()}`;
    const { error } = await supabase
      .from('users')
      .update({ employee_id: tempEmployeeId })
      .eq('id', user.id);

    if (error) {
      throw new Error(`Failed temporary update for user ${user.id}: ${error.message}`);
    }
  }

  for (let index = 0; index < users.length; index += 1) {
    const user = users[index];
    const nextEmployeeId = `CIO-${String(index + 1).padStart(3, '0')}`;

    const { error } = await supabase
      .from('users')
      .update({ employee_id: nextEmployeeId })
      .eq('id', user.id);

    if (error) {
      throw new Error(`Failed final update for user ${user.id} -> ${nextEmployeeId}: ${error.message}`);
    }

    console.log(`${user.employee_id || '(empty)'} -> ${nextEmployeeId}`);
  }

  console.log(`Done. Updated ${users.length} users.`);
}

run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
