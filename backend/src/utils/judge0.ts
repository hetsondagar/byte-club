import fetch from 'node-fetch';
import { config } from '../config';

interface Judge0Submission {
  source_code: string;
  language_id: number;
  stdin?: string;
  expected_output?: string;
  cpu_time_limit?: number;
  memory_limit?: number;
}

const LANGUAGE_IDS: Record<string, number> = {
  javascript: 63, // Node.js 16.x
  python: 71,     // Python 3.8.1
  java: 62,       // Java (OpenJDK 13)
  cpp: 54,        // C++ (GCC 9.2.0)
  c: 50           // C (GCC 9.2.0)
};

export async function runOnJudge0(
  code: string,
  language: string = 'javascript',
  stdin?: string
): Promise<{ stdout?: string; stderr?: string; compile_output?: string; status?: { id: number; description: string } }> {
  const apiKey = config.judge0.rapidApiKey;
  const host = config.judge0.host;
  if (!apiKey) {
    throw new Error('RAPIDAPI_JUDGE0_KEY is not set');
  }

  const language_id = LANGUAGE_IDS[language.toLowerCase()] || LANGUAGE_IDS.javascript;

  const submission: Judge0Submission = {
    source_code: code,
    language_id,
    ...(stdin ? { stdin } : {}),
  };

  const submitRes = await fetch(`https://${host}/submissions`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-rapidapi-host': host,
      'x-rapidapi-key': apiKey as string,
    },
    body: JSON.stringify(submission),
  });

  if (!submitRes.ok) {
    throw new Error(`Judge0 submit failed: ${submitRes.status} ${await submitRes.text()}`);
  }
  const submitData = await submitRes.json();
  const token = submitData.token;

  // Poll for result
  for (let i = 0; i < 20; i++) {
    const res = await fetch(`https://${host}/submissions/${token}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': host,
        'x-rapidapi-key': apiKey as string,
      },
    });
    const data = await res.json();
    if (data.status && data.status.id >= 3) {
      return data;
    }
    await new Promise(r => setTimeout(r, 500));
  }
  throw new Error('Judge0 result polling timed out');
}


