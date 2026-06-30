async function run() {
  const res = await fetch('http://localhost:3000/api/saas/codecollab')
  const json = await res.json()
  console.log('codecollab:', json.founderName, json.founderSocials)
  
  const res2 = await fetch('http://localhost:3000/api/saas/codecollab-1-0')
  const json2 = await res2.json()
  console.log('codecollab-1-0:', json2.founderName, json2.founderSocials)
}
run()
