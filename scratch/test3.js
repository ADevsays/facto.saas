async function run() {
  try {
    const res = await fetch('http://localhost:3000/api/ranking/list')
    const saasList = await res.json()
    console.log('SaaS list length:', saasList.length)
    if (saasList.length > 0) {
      console.log('First SaaS slug:', saasList[0].slug)
      
      const res2 = await fetch('http://localhost:3000/api/saas/' + saasList[0].slug)
      const json2 = await res2.json()
      console.log('Detail Status:', res2.status)
      if (res2.status === 404) {
        console.log('Detail Error:', json2)
      } else {
        console.log('Success, keys:', Object.keys(json2))
      }
    }
  } catch(e) {
    console.error(e)
  }
}
run()
