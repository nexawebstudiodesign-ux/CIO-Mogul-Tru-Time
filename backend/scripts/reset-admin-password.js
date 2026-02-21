const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
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
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    throw new Error('Usage: node reset-admin-password.js <email> <newPassword>');
  }

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

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id,email,role')
    .eq('email', email)
    .maybeSingle();

  if (userError || !user) {
    throw new Error('Admin user not found with that email');
  }

  if (user.role !== 'ADMIN') {
    throw new Error('User exists but is not ADMIN');
  }

  const { error: authUpdateError } = await supabase.auth.admin.updateUserById(user.id, {
    password,
  });

  if (authUpdateError) {
    throw new Error(`Unable to update auth password: ${authUpdateError.message}`);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const { error: updateError } = await supabase
    .from('users')
    .update({ password_hash: passwordHash })
    .eq('id', user.id);

  if (updateError) {
    throw new Error(`Unable to update password hash: ${updateError.message}`);
  }

  console.log('Admin password reset successfully.');
}

run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
