import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

export async function chatWithGemini(systemPrompt: string, history: any[], message: string) {
  // Convert history into Gemini format
  const formattedHistory = history.map((msg) => ({
    role: msg.role === "ai" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  const chat = model.startChat({
    history: [
      { role: "user", parts: [{ text: "SYSTEM INSTRUCTION: " + systemPrompt }] },
      { role: "model", parts: [{ text: "Understood. I will follow these instructions." }]},
      ...formattedHistory
    ],
  });

  const result = await chat.sendMessageStream(message);

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of result.stream) {
        controller.enqueue(encoder.encode(chunk.text()));
      }
      controller.close();
    }
  });

  return readable;
}

export async function embedText(text: string): Promise<number[]> {
  const result = await embeddingModel.embedContent(text);
  return result.embedding.values;
}
