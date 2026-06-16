const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xshradgvtsovbdtsmcbr.supabase.co';
const supabaseKey = 'sb_publishable_YuC7xsU6CZ9ZaAxFytRn3g_4xdB059u';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('status', 'active');
  
  if (error) {
    console.error('Error fetching categories:', error);
  } else {
    console.log('Active categories:', data);
  }
}

main();
