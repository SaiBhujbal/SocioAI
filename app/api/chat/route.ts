import { NextRequest, NextResponse } from 'next/server'
import dotenv from 'dotenv'
dotenv.config()


const API_URL = "https://api.langflow.astra.datastax.com"
const LANGFLOW_ID = "7e084384-03af-44c8-926d-b906e0c278f9"
const APPLICATION_TOKEN = process.env.APPLICATION_TOKEN
const ENDPOINT = "socioai"

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json()

    console.log('Sending request to Langflow API:', { message })

    const payload = {
      input_value: message,
      output_type: "chat",
      input_type: "chat",
      tweaks: {
        "Prompt-wXuZu": {},
        "Agent-lgaEv": {},
        "AstraDBToolComponent-E8wqU": {},
        "ChatInput-UBrdS": {},
        "ChatOutput-ctttH": {}
      }
    }

    console.log('Request payload to Langflow:', JSON.stringify(payload, null, 2))

    const response = await fetch(`${API_URL}/lf/${LANGFLOW_ID}/api/v1/run/${ENDPOINT}?stream=false`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${APPLICATION_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    // Get the response as text to handle both JSON and non-JSON responses
    const responseText = await response.text()

    if (!response.ok) {
      console.error('Langflow API Error:', response.status, responseText)
      throw new Error(`Langflow API responded with status ${response.status}: ${responseText}`)
    }

    let data
    try {
      // Safely parse JSON response
      data = JSON.parse(responseText)
    } catch (e) {
      console.error('Failed to parse JSON response:', responseText)
      throw new Error('Invalid JSON response from Langflow API')
    }

    console.log('Langflow API Response:', JSON.stringify(data, null, 2))

    if (
      !data.outputs || 
      !data.outputs[0]?.outputs?.[0]?.outputs?.message?.message?.text
    ) {
      console.error('Invalid Langflow API response structure:', data)
      throw new Error('Invalid Langflow API response structure')
    }

    const aiMessage = data.outputs[0].outputs[0].outputs.message.message.text

    // Extract table data if present
    const tableData = extractTableData(aiMessage)

    return NextResponse.json({ 
      message: aiMessage,
      data: tableData ? { table: tableData } : null
    })
  } catch (error) {
    console.error('Error in chat route:', error)
    return NextResponse.json(
      { error: 'An error occurred while contacting the Langflow API. Please try again later.' },
      { status: 500 }
    )
  }
}

function extractTableData(message: string) {
  const tableRegex = /\|(.+)\|/g
  const matches = [...message.matchAll(tableRegex)]

  if (matches.length > 1) {
    const headers = matches[0][1].split('|').map(h => h.trim())
    const data = matches.slice(2).map(match =>
      match[1].split('|').map(cell => {
        const num = Number(cell.trim())
        return isNaN(num) ? cell.trim() : num
      })
    )
    console.log('=== Analytics Data Debug ===')
    console.log('Headers:', headers)
    console.log('Data:', JSON.stringify(data, null, 2))
    return { headers, data }
  }

  return null
}
