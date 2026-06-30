async function run() {
  try {
    const res = await fetch('http://localhost:3000/api/saas')
    const json = await res.json()
    console.log('SaaS list length:', json.saas.length)
    if (json.saas.length > 0) {
      console.log('First SaaS slug:', json.saas[0].slug)
      
      const res2 = await fetch('http://localhost:3000/api/saas/' + json.saas[0].slug)
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
