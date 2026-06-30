async function run() {
  const res = await fetch('http://localhost:3000/api/ranking/list')
  const saasList = await res.json()
  
  for (const s of saasList) {
    if (s.founderName) {
      console.log('ID:', s.id, 'founder:', s.founderName)
    }
  }
}
run()
