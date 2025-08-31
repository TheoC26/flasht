export async function POST(request) {
  try {
    const { frontText } = await request.json();

    if (!frontText || !frontText.trim()) {
      return Response.json(
        { error: "Front text is required" },
        { status: 400 }
      );
    }

    const openaiApiKey = process.env.NEXT_PUBLIC_OPENAI_KEY;
    if (!openaiApiKey) {
      return Response.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o", // Using GPT-4o as GPT-5 is not yet available
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that creates simple, concise answers for flashcards. Provide clear, direct answers that would appear on the back of a flashcard. Keep responses brief and educational.",
          },
          {
            role: "user",
            content: `Create a simple back answer for this flashcard front: "${frontText}"`,
          },
        ],
        max_tokens: 100,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const suggestion = data.choices[0]?.message?.content?.trim() || "";

    return Response.json({ suggestion });
  } catch (error) {
    console.error("Error generating suggestion:", error);
    return Response.json(
      { error: "Failed to generate suggestion" },
      { status: 500 }
    );
  }
}
