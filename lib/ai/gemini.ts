import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

export async function chatWithGemini(
  systemPrompt: string,
  history: { role: string; content: string }[],
  message: string
): Promise<ReadableStream<Uint8Array>> {
  const formattedHistory = history.map((msg) => ({
    role: msg.role === "ai" || msg.role === "model" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  const chat = model.startChat({
    history: [
      { role: "user",  parts: [{ text: "SYSTEM INSTRUCTION:\n" + systemPrompt }] },
      { role: "model", parts: [{ text: "Understood. I will follow these instructions carefully." }] },
      ...formattedHistory,
    ],
  });

  const result = await chat.sendMessageStream(message);
  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) {
            // SSE format so the client can parse token by token
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (err) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: "Stream error occurred" })}\n\n`)
        );
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      }
    },
  });
}

export async function embedText(text: string): Promise<number[]> {
  const result = await embeddingModel.embedContent(text);
  return result.embedding.values;
}
