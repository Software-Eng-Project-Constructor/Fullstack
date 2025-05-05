import React, { useState } from 'react';

const ApiTester = () => {
  const [method, setMethod] = useState<'GET' | 'POST'>('GET');
  const [url, setUrl] = useState('http://localhost:5001/api/teams');
  const [jsonBody, setJsonBody] = useState('{\n  "projectId": 5,\n  "email": "vardiashvilirati@gmail.com",\n  "role": "Admin"\n}');
  const [response, setResponse] = useState('');

  const sendRequest = async () => {
    try {
      const options: RequestInit = {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (method === 'POST') {
        options.body = jsonBody;
      }

      const res = await fetch(url, options);
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (err) {
      setResponse('Error: ' + err);
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>API Tester</h2>
      <div>
        <label>Method: </label>
        <select value={method} onChange={(e) => setMethod(e.target.value as 'GET' | 'POST')}>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
        </select>
      </div>
      <div>
        <label>URL: </label>
        <input style={{ width: '100%' }} type="text" value={url} onChange={(e) => setUrl(e.target.value)} />
      </div>
      {method === 'POST' && (
        <div>
          <label>JSON Body:</label><br />
          <textarea rows={10} style={{ width: '100%' }} value={jsonBody} onChange={(e) => setJsonBody(e.target.value)} />
        </div>
      )}
      <button onClick={sendRequest}>Send Request</button>
      <pre style={{ marginTop: '1rem', background: '#f0f0f0', padding: '1rem' }}>{response}</pre>
    </div>
  );
};

export default ApiTester;
