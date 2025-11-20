import z from "zod";
import { requiredMiddleware } from "../middlewares/auth";
import { base } from "../middlewares/base";
import { requiredWorkspaceMiddleware } from "../middlewares/workspace";
import prisma from "@/lib/db";
import { tipTapJsontoMarkdown } from "@/lib/json-to-markdown";
import { streamText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamToEventIterator } from "@orpc/server";
import { aiSecurityMiddleware } from "../middlewares/arcjet/ai";

const openrouter = createOpenRouter({
  apiKey: process.env.LLM_KEY,
});

const MODEL_ID = "z-ai/glm-4.5-air:free";

const model = openrouter.chat(MODEL_ID);

const system = [
  "You are an expert assistant specializing in summarizing product and engineering discussions into clear, structured, and actionable insights for decision-makers.",
  "Your task is to analyze Slack-style discussion threads and produce accurate summaries without inventing information or making assumptions.",
  "Use only the content provided in the thread. Do not fabricate details, add names, or infer context beyond what is clearly stated.",
  "",
  "Output requirements (Markdown format):",
  "Start with a concise summary paragraph (2–4 sentences) capturing:",
  "- the purpose of the discussion",
  "- key context or background",
  "- major decisions, agreements, or unresolved issues",
  "- any next steps or blockers",
  "No headings, introductions, or list formatting in this paragraph.",
  "",
  "After a blank line, include exactly 2–3 bullet points summarizing the most critical decisions, action items, or follow-ups.",
  "- Use '-' for each bullet",
  "- Each bullet must be one sentence, specific, and actionable",
  "- Include assignees and timelines only if clearly stated in the content",
  "",
  "Style guidelines:",
  "- Professional, neutral, and concise tonality",
  "- Preserve product terminology, roles, and names exactly as written",
  "- No filler, speculation, rhetorical questions, or meta commentary",
  "- Do not include a closing statement or general observations",
  "",
  "If the content is insufficient to derive key takeaways, provide only the single summary paragraph and omit the bullet list.",
].join("\n");

export const generatedThreadSummary = base
  .use(requiredMiddleware)
  .use(requiredWorkspaceMiddleware)
  .use(aiSecurityMiddleware)
  .route({
    method: "GET",
    path: "/ai/thread/summary",
    summary: "Generate Thread Summary",
    tags: ["Ai"],
  })
  .input(
    z.object({
      messageId: z.string(),
    }),
  )
  .handler(async ({ input, context, errors }) => {
    const baseMessage = await prisma.message.findFirst({
      where: {
        id: input.messageId,
        Channel: {
          workspaceId: context.workspace.orgCode,
        },
      },
      select: {
        id: true,
        threadId: true,
        channelId: true,
      },
    });
    if (!baseMessage) {
      throw errors.NOT_FOUND();
    }

    const parentId = baseMessage.threadId ?? baseMessage.id;

    const parent = await prisma.message.findFirst({
      where: {
        id: parentId,
        Channel: {
          workspaceId: context.workspace.orgCode,
        },
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        authorName: true,
        replies: {
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            content: true,
            createdAt: true,
            authorName: true,
          },
        },
      },
    });

    if (!parent) {
      throw errors.NOT_FOUND();
    }

    const replies = parent.replies.slice().reverse();

    const parentTxt = await tipTapJsontoMarkdown(parent.content);

    const lines = [];

    lines.push(
      `Thread Root - ${parent.authorName} - ${parent.createdAt.toISOString()}`,
    );

    lines.push(parentTxt);

    if (replies.length > 0) {
      lines.push("\nReplies");
      for (const r of replies) {
        const t = await tipTapJsontoMarkdown(r.content);
        lines.push(`- ${r.authorName} - ${r.createdAt.toISOString()}: ${t}`);
      }
    }

    const compiled = lines.join("\n");

    const result = streamText({
      model,
      system,
      messages: [{ role: "user", content: compiled }],
      temperature: 0.2,
    });

    return streamToEventIterator(result.toUIMessageStream());
  });

export const generateCompose = base

  .use(requiredMiddleware)
  .use(requiredWorkspaceMiddleware)
  .use(aiSecurityMiddleware)
  .route({
    method: "POST",
    path: "/ai/compose/generate",
    summary: "Compose message",
    tags: ["Ai"],
  })
  .input(
    z.object({
      content: z.string(),
    }),
  )
  .handler(async ({ input, context, errors }) => {
    const markdown = await tipTapJsontoMarkdown(input.content);
    const system = [
      "You are a rewriting assistant specializing in transforming text into clearer, more professional, and well-structured versions without changing its original meaning.",
      "Your goal is to improve clarity, tone, grammar, flow, and formatting while preserving all factual content, intent, and terminology from the user's input.",

      "Rewrite Rules:",
      "- Maintain all original facts, numbers, names, URLs, and context.",
      "- Do not add new information, assumptions, or fictional details.",
      "- Fix grammar, structure, and readability using natural human tone.",
      "- Adapt tone based on the input: keep it formal, casual, or neutral as appropriate, unless the user requests otherwise.",
      "- If the input is technical, preserve precision, variables, code syntax, and domain-specific terms.",

      "Output Format:",
      "- Return only the rewritten version unless the user requests an explanation.",
      "- Use appropriate formatting (paragraphs, bullet lists, headings) to improve readability when useful.",
      "- Do not include explanations, notes, or meta commentary in the final output unless explicitly asked.",

      "If the input text is unclear or incomplete, improve readability without assuming missing details.",
    ].join("\n");
    const result = streamText({
      model,
      system,
      messages: [
        { role: "user", content: "Please rewrite and improve this message: " },
        { role: "user", content: markdown },
      ],
    });

    return streamToEventIterator(result.toUIMessageStream());
  });
