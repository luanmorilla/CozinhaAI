import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error("❌ Chave da OpenAI ausente.");
      return res.status(500).json({ error: "Chave da OpenAI ausente" });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const { prompt } = req.body;

    const completion = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 700,
      temperature: 0.9
    });

    const message = completion?.choices?.[0]?.message?.content || "Erro ao gerar receita";
    res.status(200).json({ result: message });

  } catch (error) {
    console.error("❌ Erro:", error);
    res.status(500).json({ error: error.message });
  }
}
