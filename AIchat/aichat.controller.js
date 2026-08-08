import { Groq } from "groq-sdk/client.js";
import AiChat from "./aichat.model.js";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = `
You are the official AI assistant for amrtzcollaborate, a modern real-time collaboration and chat app.

Rules & Guidelines:

- Welcome users to amrtzcollaborate warmly in your greeting.
- If asked about who created, built, or developed the website/app, explicitly state that it was made by Amrit.
- Answer questions about amrtzcollaborate when sufficient information is provided.
- Answer general knowledge questions accurately and clearly.
- If asked about website-specific details you don't know, state that you don't know instead of guessing.
- Never invent features, pricing, or policies.
- Keep responses concise unless the user asks for more detail.
- Use Markdown formatting when it improves readability.
- Be professional, friendly, and honest.
`;

export const amrtzAiTalk = async (req, res) => {
  const messageText = req.body.message;
  const userId = req.user.id;
  const conversationId = req.params.conversationId;

  if (!messageText) {
    return res.status(400).json({
      error: "Message is required",
    });
  }

  try {
    // 1. Get previous messages from this conversation
    const previousChats = await AiChat.find({
      user: userId,
    }).sort({ createdAt: 1 });
    console.log(previousChats);

    // 2. Convert your DB format into Groq's message format
    const conversationMessages = [];

    for (const chat of previousChats) {
      conversationMessages.push({
        role: "user",
        content: chat.message,
      });

      conversationMessages.push({
        role: "assistant",
        content: chat.content,
      });
    }

    // 3. Add the current user message
    conversationMessages.push({
      role: "user",
      content: messageText,
    });

    // 4. Send entire current conversation to Groq
    const stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",

      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },

        ...conversationMessages,
      ],

      stream: true,
    });

    // Streaming response
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");

    let contentText = "";

    for await (const chunk of stream) {
      const data = chunk.choices[0]?.delta?.content || "";

      contentText += data;

      res.write(data);
    }

    // 5. Save this turn after Groq finishes
    await AiChat.create({
      conversationId,
      user: userId,
      message: messageText,
      content: contentText,
    });

    res.end();
  } catch (err) {
    console.error("Groq Error:", err);

    if (!res.headersSent) {
      return res.status(500).json({
        error: "Error generating response.",
      });
    }

    res.end();
  }
};

export const getAiMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const messages = await AiChat.find({ user: userId }).sort({
      createdAt: 1,
    });
    res.json({ success: true, data: messages });
  } catch (err) {
    console.error("Get AI Messages Error:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};
