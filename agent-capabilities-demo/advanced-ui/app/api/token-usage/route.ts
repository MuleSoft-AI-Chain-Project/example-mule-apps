import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'token-usage.json');

interface TokenUsageEntry {
  timestamp: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  model: string;
}

interface TokenUsageData {
  history: TokenUsageEntry[];
}

// Helper function to ensure data file exists
async function ensureDataFile() {
  try {
    await fs.mkdir(path.join(process.cwd(), 'data'), { recursive: true });
    try {
      await fs.access(DATA_FILE_PATH);
    } catch {
      // File doesn't exist, create it with empty history
      await fs.writeFile(DATA_FILE_PATH, JSON.stringify({ history: [] }));
    }
  } catch (error) {
    console.error('Error ensuring data file exists:', error);
    throw error;
  }
}

// GET endpoint to retrieve token usage history
export async function GET() {
  try {
    await ensureDataFile();
    const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const data: TokenUsageData = JSON.parse(fileContent);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading token usage data:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve token usage data' },
      { status: 500 }
    );
  }
}

// POST endpoint to add new token usage entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { inputTokens, outputTokens, model } = body;

    if (!inputTokens || !outputTokens || !model) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await ensureDataFile();
    
    // Read existing data
    const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const data: TokenUsageData = JSON.parse(fileContent);

    // Add new entry
    const newEntry: TokenUsageEntry = {
      timestamp: new Date().toISOString(),
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      model,
    };

    // Keep only last 100 entries
    data.history = [...data.history, newEntry].slice(-100);

    // Write updated data
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2));

    return NextResponse.json(newEntry);
  } catch (error) {
    console.error('Error saving token usage data:', error);
    return NextResponse.json(
      { error: 'Failed to save token usage data' },
      { status: 500 }
    );
  }
}