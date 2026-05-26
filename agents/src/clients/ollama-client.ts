const OLLAMA_BASE_URL = process.env.OLLAMA_HOST || "http://localhost:11434";

/**
 * Checks if the local Ollama instance is running by pinging the tags endpoint.
 */
export async function isOllamaRunning(): Promise<boolean> {
    try {
        const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
        return response.ok;
    } catch (e) {
        return false;
    }
}

/**
 * Lists all models currently available in the local Ollama instance.
 */
export async function listModels(): Promise<string[]> {
    try {
        const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
        if (!response.ok) {
            throw new Error(`Failed to fetch models: ${response.statusText}`);
        }
        const data = await response.json() as any;
        return data.models.map((m: any) => m.name);
    } catch (e) {
        console.error("Error listing Ollama models:", e);
        return [];
    }
}

/**
 * Generates text using a specified local Ollama model.
 * 
 * @param model The name of the model (e.g., "llama3.2:3b")
 * @param systemPrompt The system instruction setting the behavior
 * @param userPrompt The user input prompt
 * @returns The generated response text
 */
export async function generate(model: string, systemPrompt: string, userPrompt: string): Promise<string> {
    const promptContext = `${systemPrompt}\n\n${userPrompt}`;
    
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: model,
            prompt: promptContext,
            stream: false,
        }),
    });

    if (!response.ok) {
        throw new Error(`Ollama generation failed: ${response.statusText}`);
    }

    const data = await response.json() as any;
    return data.response;
}
