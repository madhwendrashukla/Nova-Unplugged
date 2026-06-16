const urls = [
  'https://github.com/madhwendrashukla.png',
  'https://github.com/ishaanjha.png',
  'https://github.com/ishaan-jha.png',
  'https://github.com/ashutosh-agrawal.png',
  'https://github.com/ashutoshagarwal.png'
];
async function check() {
  for (const url of urls) {
    const r = await fetch(url);
    console.log(url, r.status === 200 ? 'EXISTS' : 'NOT FOUND');
  }
}
check();
