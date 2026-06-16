const { createClient } = require('@supabase/supabase-js');

const url = 'https://xshradgvtsovbdtsmcbr.supabase.co';
const anonKey = 'sb_publishable_YuC7xsU6CZ9ZaAxFytRn3g_4xdB059u';

async function run() {
  const client = createClient(url, anonKey);
  const { data: events, error } = await client.from('events').select('title, deadline');
  if (error) {
    console.error('Error fetching events:', error);
    return;
  }
  console.log('Event Deadlines:');
  events.forEach(e => {
    console.log(`- "${e.title}": deadline = ${JSON.stringify(e.deadline)}`);
    if (e.deadline) {
      try {
        const d = new Date(e.deadline);
        console.log(`  Parsed: ${d.toString()} (isNaN: ${isNaN(d.getTime())})`);
      } catch (err) {
        console.log(`  Error parsing: ${err.message}`);
      }
    }
  });
}

run().catch(console.error);
