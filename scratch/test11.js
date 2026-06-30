async function run() {
  const res = await fetch('http://localhost:3000/api/saas/codecollab-10')
  const json = await res.json()
  console.log('codecollab-10:', json.founderName, json.founderSocials, json.countryFlag)
}
run()
