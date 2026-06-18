import { NextRequest } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const { category, vibe, round, players } = await req.json();

  const OPENAI_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_KEY) {
    return Response.json({ error: "No API key configured" }, { status: 500 });
  }

  const vibeDesc =
    vibe === "mild"
      ? "playful and cheeky, fun but not too personal"
      : vibe === "spicy"
      ? "bold and daring, gets personal and uncomfortable in a fun way"
      : "absolutely savage, no mercy, maximum chaos";

  const playerList = Array.isArray(players) ? players.join(", ") : "the players";

  const prompt = `You are the host of an adults-only party game called "NeverEnding Party".

Generate ONE ${category} question/prompt.

Vibe: ${vibeDesc}
Round number: ${round} (questions get bolder as round number increases — round 1 is warm-up, round 10+ is intense)
Players: ${playerList}

Category rules:
- Truth: A personal question they MUST answer honestly. Should make them squirm a little.
- Dare: Something physical/social they must do RIGHT NOW in the room. Must be doable and fun.
- Would You Rather: Two equally awkward/funny options. Format: "Would you rather... or...?"
- Hot Take: A controversial opinion they must argue for 30 seconds. Format: "Hot take: defend the opinion that..."
- Never Have I Ever: A statement. Format: "Never have I ever..."
- Confess: Something embarrassing/secret they must reveal to the group.

Make it fun, bold, and appropriate for consenting adults. Personalize using player names when it adds spice.
Return ONLY the question/prompt text. Nothing else. No quotes around it.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.95,
      max_tokens: 150,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("OpenAI error:", data);
    return Response.json({ error: "Failed to generate question" }, { status: 500 });
  }

  const question = data.choices?.[0]?.message?.content?.trim();
  return Response.json({ question });
}
