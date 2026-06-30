async function run() {
  const res = await fetch('http://localhost:3000/api/ranking/list')
  const saasList = await res.json()
  console.log(saasList[0])
}
run()
