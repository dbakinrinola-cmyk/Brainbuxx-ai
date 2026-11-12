import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Serve public static assets (manifest, PWA icons, etc.)
app.use(express.static(path.resolve(__dirname, 'public')));

// Increase payload limit for file attachments (images, PDFs, documents)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize shared server-side GoogleGenAI client
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const BRAINBUXX_SYSTEM_INSTRUCTION = `You are Brainbuxx AI, an intelligent, deeply context-aware conversational assistant and creative digital workspace developed by VHS Science and Innovation.
Your brand tagline is "Think Clearly. Create Freely."

Origin & Engineering:
- You were developed by VHS Science and Innovation (VHS Science & Innovation).
- When asked who developed, built, or created you, answer clearly and proudly that you were developed by VHS Science and Innovation.

Context Awareness & Conversational Principles:
1. Deep Context Awareness: You actively maintain conversation continuity across all turns. When the user says "it", "the previous table", "rewrite that in Python", or asks follow-up queries, accurately interpret and link back to prior context, code, uploaded files, or topics.
2. Provide thoughtful, well-reasoned, concise yet thorough explanations.
3. Structure answers beautifully using clean Markdown: use headers, bullet lists, bold highlights, tables, and blockquotes where appropriate.
4. When providing code, specify the language, provide clean syntax, write helpful comments, and explain non-obvious architecture.
5. For mathematical or scientific queries, show step-by-step reasoning.
6. When analyzing attached documents, spreadsheets, or images, extract key insights, summarize figures accurately, and directly answer questions about the file.
7. Maintain an encouraging, warm, and sophisticated tone. Avoid robotic clichés and unnecessary filler.`;

// POST /api/chat - Streaming SSE response with multi-turn history & attachments
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages, attachments, model = 'gemini-3.8-flash', customInstruction } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    if (!apiKey) {
      return res.status(500).json({
        error: 'Gemini API key is not configured in environment. Please check the Secrets panel in AI Studio.',
      });
    }

    // Build contents array for Gemini
    // Format: [{ role: 'user' | 'model', parts: [...] }]
    const contents: any[] = [];

    // Add prior message history
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      const role = msg.role === 'user' ? 'user' : 'model';
      const parts: any[] = [];

      // If this is the last user message and has attachments, include them
      if (i === messages.length - 1 && role === 'user' && attachments && Array.isArray(attachments)) {
        for (const att of attachments) {
          if (att.data && att.mimeType) {
            // Multimodal inlineData part
            parts.push({
              inlineData: {
                mimeType: att.mimeType,
                data: att.data, // base64 string
              },
            });
          } else if (att.textContent) {
            parts.push({
              text: `[Attached File: ${att.name || 'document'}]\n${att.textContent}`,
            });
          }
        }
      }

      if (msg.content) {
        parts.push({ text: msg.content });
      }

      if (parts.length > 0) {
        contents.push({ role, parts });
      }
    }

    const systemInstruction = customInstruction
      ? `${BRAINBUXX_SYSTEM_INSTRUCTION}\n\nUser Custom Preference: ${customInstruction}`
      : BRAINBUXX_SYSTEM_INSTRUCTION;

    // Set headers for Server-Sent Events (SSE)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    // Call Gemini Streaming API
    const responseStream = await ai.models.generateContentStream({
      model: model,
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    const errorMessage = error?.message || 'An error occurred while generating the response.';
    
    // If headers already sent, write error event
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
      res.end();
    } else {
      res.status(500).json({ error: errorMessage });
    }
  }
});

// POST /api/generate-image - Dedicated Image Generation Endpoint
app.post('/api/generate-image', async (req: Request, res: Response) => {
  try {
    const { prompt, aspectRatio = '1:1', style = 'Photorealistic' } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    if (!apiKey) {
      return res.status(500).json({
        error: 'Gemini API key is not configured in environment. Please check the Secrets panel in AI Studio.',
      });
    }

    // Enhance prompt with style instructions
    let enhancedPrompt = prompt.trim();
    if (style && style !== 'None' && !enhancedPrompt.toLowerCase().includes(style.toLowerCase())) {
      enhancedPrompt = `${style} style: ${enhancedPrompt}, high quality, crisp details, beautiful lighting`;
    }

    // Valid aspect ratios for gemini-3.1-flash-lite-image: "1:1", "3:4", "4:3", "9:16", "16:9"
    const validAspectRatios = ['1:1', '3:4', '4:3', '9:16', '16:9'];
    const selectedAspectRatio = validAspectRatios.includes(aspectRatio) ? aspectRatio : '1:1';

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: [
          {
            text: enhancedPrompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: selectedAspectRatio,
        },
      },
    });

    let imageUrl = '';
    let responseText = '';

    const parts = response.candidates?.[0]?.content?.parts ?? [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        const base64Data = part.inlineData.data;
        const mime = part.inlineData.mimeType || 'image/png';
        imageUrl = `data:${mime};base64,${base64Data}`;
        break;
      } else if (part.text) {
        responseText += part.text;
      }
    }

    if (!imageUrl) {
      return res.status(500).json({
        error: responseText || 'Unable to generate image. Please try adjusting your prompt.',
      });
    }

    return res.json({
      success: true,
      imageUrl,
      prompt: enhancedPrompt,
      style,
      aspectRatio: selectedAspectRatio,
    });
  } catch (error: any) {
    console.error('Error in /api/generate-image:', error);
    const errorMessage = error?.message || 'Failed to generate image.';
    return res.status(500).json({ error: errorMessage });
  }
});

// POST /api/title - Generate concise title for a new conversation
app.post('/api/title', async (req: Request, res: Response) => {
  try {
    const { userMessage, aiResponse } = req.body;
    if (!userMessage) {
      return res.json({ title: 'New Conversation' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Create a brief, clean, 3 to 5 word title (no quotes, no punctuation, title case) summarizing this conversation topic:\nUser: "${userMessage}"\nAssistant: "${(aiResponse || '').slice(0, 200)}"`,
    });

    const title = (response.text || 'New Conversation').trim().replace(/["\n\r.]/g, '');
    return res.json({ title: title.slice(0, 50) });
  } catch (err) {
    return res.json({ title: 'New Conversation' });
  }
});

// Setup Vite middlewares in development or static serving in production
async function startServer() {
  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Brainbuxx AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
