const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const value = parts.slice(1).join('=').trim().replace(/^"|"$/g, '').replace(/\r/g, '');
    process.env[key] = value;
  }
});

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkDb() {
  const { data, error } = await supabase.from('company_contacts').select('company_name, status');
  if (error) {
    console.error("Error:", error);
    return;
  }
  const accepted = data.filter(r => r.status === 'Accepted');
  console.log(`Total companies: ${data.length}`);
  console.log(`Accepted companies: ${accepted.length}`);
  if (accepted.length > 0) {
    console.log("Accepted ones:", accepted.map(a => a.company_name));
  } else {
    console.log("No accepted companies found in DB!");
    console.log("Sample of 3 companies:", data.slice(0, 3));
  }
}

checkDb();
