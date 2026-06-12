// lib/ai/gemini.ts
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";

export async function embedText(text: string): Promise<number[]> {
  const res = await fetch(
    `${GEMINI_BASE}/models/${process.env.GEMINI_EMBEDDING_MODEL}:embedContent?key=${process.env.GOOGLE_AI_STUDIO_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: `models/${process.env.GEMINI_EMBEDDING_MODEL}`,
        content: { parts: [{ text }] }
      })
    }
  );
  const data = await res.json();
  return data.embedding.values; // 768-dimension vector
}

export async function chatWithGemini(
  systemPrompt: string,
  history: { role: "user" | "model"; parts: { text: string }[] }[],
  userMessage: string
): Promise<ReadableStream> {
  const res = await fetch(
    `${GEMINI_BASE}/models/${process.env.GEMINI_MODEL}:streamGenerateContent?key=${process.env.GOOGLE_AI_STUDIO_API_KEY}&alt=sse`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [
          ...history,
          { role: "user", parts: [{ text: userMessage }] }
        ],
        generationConfig: {
          temperature: 0.85,
          maxOutputTokens: 1024,
          topP: 0.95
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
        ]
      })
    }
  );
  return res.body!;
}
