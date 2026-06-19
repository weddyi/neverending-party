import { NextRequest } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const { category, vibe, round, players } = await req.json();

  const OPENAI_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_KEY) {
    return Response.json({ error: "No API key configured" }, { status: 500 });
  }

  const playerList = Array.isArray(players) ? players.join(", ") : "the players";

  const prompt = `You are the charismatic host of "NeverEnding Party" — the most entertaining adult party game ever made.

Generate ONE ${category} for ${vibe} players in round ${round}.

Players: ${playerList}

RULES FOR GREAT QUESTIONS:
- Be specific and personal — use player names when possible
- Questions should make people laugh OR make them squirm uncomfortably
- Avoid generic questions — be creative and unexpected
- For Truth: dig deep, make it personal, make them think
- For Dare: physical, social, slightly embarrassing but safe
- For Would You Rather: both options should be equally painful/funny
- For Hot Take: controversial enough to spark debate
- For Never Have I Ever: specific enough that someone definitely HAS done it
- For Confess: something that reveals character

Vibe escalation:
- mild (round 1-5): playful, light, getting-to-know-you energy
- spicy (round 6-15): personal, uncomfortable, real talk
- savage (round 16+): no holds barred, maximum chaos

NEVER repeat generic questions like "what's your biggest fear" — be creative!
Return ONLY the question text.`;

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
