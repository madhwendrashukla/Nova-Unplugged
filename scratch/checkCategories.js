const { createClient } = require('@supabase/supabase-js');

const url = 'https://xshradgvtsovbdtsmcbr.supabase.co';
const anonKey = 'sb_publishable_YuC7xsU6CZ9ZaAxFytRn3g_4xdB059u';

async function run() {
  const client = createClient(url, anonKey);
  const { data: categories } = await client.from('categories').select('*');
  const { data: events } = await client.from('events').select('*, categories(title)');

  console.log('Categories map:');
  categories.forEach(c => console.log(`- ${c.title}: ${c.id}`));

  console.log('\nEvents in DB:');
  events.forEach(e => {
    console.log(`- Event: "${e.title}", category_id: ${e.category_id}, category title: ${e.categories ? e.categories.title : 'None'}`);
  });
}

run().catch(console.error);
