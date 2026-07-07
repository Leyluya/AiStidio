import React, { useState } from 'react'

export default function App(){
  const [mode, setMode] = useState('text')
  const [prompt, setPrompt] = useState('')
  const [job, setJob] = useState(null)
  const [result, setResult] = useState(null)

  async function handleGenerate(e){
    e.preventDefault()
    setResult(null)
    const resp = await fetch('/api/generate', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({mode, prompt, params:{}, user_id: 'dev'})
    })
    const data = await resp.json()
    setJob(data.job_id)
    // Poll for result
    const poll = setInterval(async ()=>{
      const r = await fetch(`/api/generate/${data.job_id}`)
      const j = await r.json()
      if(j.status === 'succeeded'){
        setResult(j.result)
        clearInterval(poll)
      }
    }, 500)
  }

  return (
    <div style={{maxWidth:800, margin:'2rem auto', fontFamily:'Arial'}}>
      <h1>AiStidio — Generate AI (PoC)</h1>
      <form onSubmit={handleGenerate}>
        <label>Mode: </label>
        <select value={mode} onChange={e=>setMode(e.target.value)}>
          <option value="text">Text</option>
          <option value="image">Image</option>
          <option value="audio">Audio</option>
        </select>
        <div style={{marginTop:10}}>
          <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} rows={6} style={{width:'100%'}} placeholder="ใส่ prompt ของคุณ (ภาษาไทยได้)"></textarea>
        </div>
        <div style={{marginTop:10}}>
          <button type="submit">Generate</button>
        </div>
      </form>

      {job && <div style={{marginTop:20}}>Job ID: {job}</div>}

      {result && (
        <div style={{marginTop:20}}>
          <h3>Result</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
