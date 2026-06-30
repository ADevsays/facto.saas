async function run() {
  const res = await fetch('http://localhost:3000/api/ranking/list')
  const saasList = await res.json()
  
  for (const s of saasList) {
    if (s.founderName) {
      console.log('Found startup with founder:', s.name, 'slug:', s.slug)
    }
  }
}
run()
