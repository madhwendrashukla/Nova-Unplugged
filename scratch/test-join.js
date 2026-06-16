const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xshradgvtsovbdtsmcbr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzaHJhZGd2dHNvdmJkdHNtY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzYzNDk4MiwiZXhwIjoyMDkzMjEwOTgyfQ.PzkSM1MGn4vHhMy5J_8_ePdc6rF9S9dr910gFj4u7jA';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  // Fetch one user to inspect relations using service role key
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .limit(1)
    .single();

  if (userError) {
    console.error('Error fetching user:', userError);
    return;
  }

  console.log('Fetched user:', user);

  // Test join using role_id
  const { data: joinedData, error: joinError } = await supabase
    .from('users')
    .select('payment_status, role_id, user_roles(permissions_level, name)')
    .eq('id', user.id)
    .single();

  if (joinError) {
    console.error('Error with join query:', joinError);
  } else {
    console.log('Join query successful:', joinedData);
  }
}

main();
