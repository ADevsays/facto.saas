async function run() {
  try {
    const res = await fetch('http://localhost:3000/api/saas/codecollab')
    const json = await res.json()
    console.log('Status:', res.status)
    console.log('Body:', json)
  } catch(e) {
    console.error(e)
  }
}
run()
