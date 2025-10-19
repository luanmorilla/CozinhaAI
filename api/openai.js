import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

  try {
    const { ingredientes } = req.body;

    if (!ingredientes || typeof ingredientes !== "string") {
      return res.status(400).json({ error: "Ingredientes inválidos." });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `
    Gere DUAS receitas culinárias detalhadas usando SOMENTE os ingredientes: ${ingredientes}.
    Cada receita deve conter:
    1. Nome da receita
    2. Lista de ingredientes (somente os informados)
    3. Modo de preparo passo a passo
    Seja criativo, mas realista.
    `;

    const completion = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
      temperature: 0.9
    });

    const message = completion?.choices?.[0]?.message?.content || "Não foi possível gerar a receita.";
    res.status(200).json({ result: message });

  } catch (error) {
    console.error("❌ Erro:", error);
    res.status(500).json({ error: error.message });
  }
}
