async function run() {
  const res = await fetch('http://localhost:3000/api/saas/hellio')
  const json = await res.json()
  console.log('Status for hellio:', res.status)
  if (res.status === 404) console.log(json)
}
run()
