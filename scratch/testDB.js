const { createClient } = require('@supabase/supabase-js');

const url = 'https://xshradgvtsovbdtsmcbr.supabase.co';
const anonKey = 'sb_publishable_YuC7xsU6CZ9ZaAxFytRn3g_4xdB059u';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzaHJhZGd2dHNvdmJkdHNtY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzYzNDk4MiwiZXhwIjoyMDkzMjEwOTgyfQ.PzkSM1MGn4vHhMy5J_8_ePdc6rF9S9dr910gFj4u7jA';

async function run() {
  console.log('--- Testing with Anon Key ---');
  const anonClient = createClient(url, anonKey);
  const { data: catAnon, error: errAnon } = await anonClient.from('categories').select('*');
  console.log('Categories (Anon):', catAnon, 'Error:', errAnon);

  const { data: evAnon, error: evErrAnon } = await anonClient.from('events').select('*');
  console.log('Events count (Anon):', evAnon ? evAnon.length : 0, 'Error:', evErrAnon);

  console.log('--- Testing with Service Key ---');
  const adminClient = createClient(url, serviceKey);
  const { data: catAdmin, error: errAdmin } = await adminClient.from('categories').select('*');
  console.log('Categories (Admin):', catAdmin, 'Error:', errAdmin);

  const { data: evAdmin, error: evErrAdmin } = await adminClient.from('events').select('*');
  console.log('Events count (Admin):', evAdmin ? evAdmin.length : 0, 'Error:', evErrAdmin);
}

run().catch(console.error);
