interface TokenUsageData {
  inputCount: number;
  outputCount: number;
}

export async function logTokenUsage(
  tokenUsage: TokenUsageData,
  model: string
) {
  try {
    const payload = {
      inputTokens: tokenUsage.inputCount,
      outputTokens: tokenUsage.outputCount,
      model,
    };

    const response = await fetch('/api/token-usage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to log token usage: ${response.statusText}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Failed to log token usage:', error);
    throw error;
  }
}