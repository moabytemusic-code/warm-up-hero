import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function generateEmailContent(topic: string = 'business') {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a professional business assistant. Generate a short, realistic business email. Return JSON with 'subject' and 'body' (plain text but formatted)." },
                { role: "user", content: `Generate a professional email regarding ${topic}. Keep it under 100 words.` }
            ],
            response_format: { type: "json_object" }
        });

        const content = JSON.parse(completion.choices[0].message.content || '{"subject": "Hello", "body": "Hi there."}');
        return content;
    } catch (e) {
        console.error("OpenAI Error:", e);
        // Fallback if OpenAI fails or no key
        return {
            subject: "Quick question regarding our meeting",
            body: "Hi,\n\nI wanted to follow up on our previous conversation. Are you available for a quick call tomorrow?\n\nBest,\nAlex"
        };
    }
}

export async function generateReplyContent(originalBody: string) {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a professional. Generate a short, positive, 1-2 sentence email reply acknowledging receipt. JSON with 'body'." },
                { role: "user", content: `Reply to this email: "${originalBody.substring(0, 500)}..."` }
            ],
            response_format: { type: "json_object" }
        });

        const content = JSON.parse(completion.choices[0].message.content || '{"body": "Thanks for the update."}');
        return content.body;
    } catch (e) {
        console.error("OpenAI Reply Error:", e);
        return "Thanks for reaching out! retrieved this.";
    }
}
