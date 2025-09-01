export async function POST(request) {
  try {
    const { title, collection, cards, currentCardIndex } = await request.json();

    if (!cards || cards.length === 0 || currentCardIndex === undefined) {
      return Response.json(
        { error: "Cards and current card index are required" },
        { status: 400 }
      );
    }

    const currentCard = cards[currentCardIndex];
    if (!currentCard || !currentCard.front || !currentCard.front.trim()) {
      return Response.json(
        { error: "Front text for the current card is required" },
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

    const existingCardsContext = cards
      .map((card, index) => {
        const backContent = index === currentCardIndex ? "" : card.back;
        return `  Card ${index + 1}: { \"front\": \"${card.front}\", \"back\": \"${backContent}\" }`;
      })
      .join("\n");

    const userPrompt = `You are helping a user create a flashcard set.
    The title of the set is: "${title || 'Untitled'}"
    The collection is: "${collection || 'Uncategorized'}"

    Here are the flashcards created so far:
    ${existingCardsContext}

    Based on all this context, please generate a concise and accurate answer for the back of the current flashcard (Card ${currentCardIndex + 1}). The answer should be plain text, without any formatting or labels.

    The front of the current flashcard is: "${currentCard.front}"`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that creates simple, concise answers for flashcards. Provide clear, direct answers that would appear on the back of a flashcard. Keep responses brief and educational. Do not include periods at the end. Do not wrap the entire answer with quotations.",
          },
          {
            role: "user",
            content: userPrompt,
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
