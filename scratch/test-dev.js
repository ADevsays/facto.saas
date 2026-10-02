async function test() {
  const res = await fetch('http://localhost:3000/en');
  const html = await res.text();
  const scripts = html.match(/<script[^>]*src=["'][^"']*["'][^>]*>/g) || [];
  console.log('Scripts count:', scripts.length);
  for (const s of scripts) {
    const src = s.match(/src=["']([^"']+)["']/)?.[1];
    if (src) {
      const scriptRes = await fetch('http://localhost:3000' + src);
      console.log(src, '->', scriptRes.status);
    }
  }
}
test().catch(console.error);
