import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "./prisma";

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ---- BASIC ROOT + HEALTH ----
app.get("/", (_req: Request, res: Response) => {
  res.send("RFP backend is running. Try GET /api/health");
});

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// ---- DB TEST ----
app.get("/api/test-db", async (_req: Request, res: Response) => {
  try {
    const rfps = await prisma.rfp.findMany();
    res.json(rfps);
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ error: "DB_ERROR" });
  }
});

// ---- GEMINI SETUP ----
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-pro";

if (!GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY is missing. Set it in .env");
}

const genAI = GEMINI_API_KEY
  ? new GoogleGenerativeAI(GEMINI_API_KEY)
  : null;

function getGeminiModel() {
  if (!genAI) {
    throw new Error("GEMINI_API_KEY not configured");
  }
  return genAI.getGenerativeModel({ model: GEMINI_MODEL });
}

// ---- SIMPLE GEMINI TEST ----
app.get("/api/gemini-test", async (_req: Request, res: Response) => {
  try {
    const model = getGeminiModel();
    const result = await model.generateContent("Say hi in one short sentence.");
    const text = result.response.text();
    res.json({ text });
  } catch (error: any) {
    const details = error?.response?.data || error?.message || error;
    console.error("Error in /api/gemini-test:", details);
    res.status(500).json({ error: "GEMINI_ERROR", details });
  }
});

// ---- Helper: fallback mock when Gemini fails ----
function buildMockRfp(description: string) {
  // You can customize this structure if you like
  return {
    title: "Procurement RFP (Mocked)",
    budget: 50000,
    deliveryDeadline: null,
    paymentTerms: "Net 30",
    warrantyMinMonths: 12,
    items: [
      {
        name: "Laptop",
        quantity: 20,
        specs: { ramGB: 16, storage: "512GB SSD" },
      },
      {
        name: "Monitor",
        quantity: 15,
        specs: { sizeInch: 27, resolution: "1440p" },
      },
    ],
  };
}

// ---- AI RFP GENERATION (Gemini + fallback) ----
app.post("/api/rfps/generate", async (req: Request, res: Response) => {
  try {
    const body = req.body as any;
    const description = body?.description;

    if (!description || typeof description !== "string") {
      return res
        .status(400)
        .json({ error: "Description is required in JSON body" });
    }

    let parsed: {
      title?: string;
      budget?: number | null;
      deliveryDeadline?: string | null;
      paymentTerms?: string | null;
      warrantyMinMonths?: number | null;
      items?: any[];
    };

    // 1) Try Gemini first
    try {
      const model = getGeminiModel();

      const prompt = `
You are an assistant that converts procurement descriptions into VALID JSON only.

Required JSON format:

{
  "title": string,
  "budget": number | null,
  "deliveryDeadline": string | null,
  "paymentTerms": string | null,
  "warrantyMinMonths": number | null,
  "items": [
    {
      "name": string,
      "quantity": number,
      "specs": object
    }
  ]
}

Do NOT add explanations, markdown, or extra text. Only return JSON.

Description:
"""${description}"""
`;

      const result = await model.generateContent(prompt);
      const rawText = result.response.text() || "{}";

      const cleaned = rawText
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      parsed = JSON.parse(cleaned);
    } catch (aiError: any) {
      // 2) If Gemini fails (404, quota, etc) → fallback to mock
      console.error(
        "Gemini failed, using mock RFP:",
        aiError?.response?.data || aiError?.message || aiError
      );
      parsed = buildMockRfp(description);
    }

    // Basic normalization
    const title = parsed.title ?? "Untitled RFP";

    const budget =
      typeof parsed.budget === "number" && !isNaN(parsed.budget)
        ? Math.round(parsed.budget)
        : null;

    const warrantyMinMonths =
      typeof parsed.warrantyMinMonths === "number" &&
      !isNaN(parsed.warrantyMinMonths)
        ? Math.round(parsed.warrantyMinMonths)
        : null;

    const deliveryDeadline =
      parsed.deliveryDeadline && typeof parsed.deliveryDeadline === "string"
        ? new Date(parsed.deliveryDeadline)
        : null;

    const paymentTerms =
      parsed.paymentTerms && typeof parsed.paymentTerms === "string"
        ? parsed.paymentTerms
        : null;

    const items = Array.isArray(parsed.items) ? parsed.items : [];

    const rfp = await prisma.rfp.create({
      data: {
        title,
        descriptionRaw: description,
        budget,
        deliveryDeadline,
        paymentTerms,
        warrantyMinMonths,
        items,
        status: "draft",
      },
    });

    return res.status(201).json({ rfp });
  } catch (error: any) {
    const details = error?.response?.data || error?.message || error;
    console.error("Error in /api/rfps/generate:", details);

    return res.status(500).json({
      error: "SERVER_ERROR",
      details,
      message: "Something went wrong while generating the RFP.",
    });
  }
});

// ---- RFP LIST & DETAIL ----
app.get("/api/rfps", async (_req: Request, res: Response) => {
  try {
    const rfps = await prisma.rfp.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json({ rfps });
  } catch (err) {
    console.error("Error fetching RFPs:", err);
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

app.get("/api/rfps/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid RFP id" });
    }

    const rfp = await prisma.rfp.findUnique({
      where: { id },
    });

    if (!rfp) {
      return res.status(404).json({ error: "RFP not found" });
    }

    res.json({ rfp });
  } catch (err) {
    console.error("Error fetching RFP:", err);
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

// ---- VENDOR CRUD ----
app.post("/api/vendors", async (req: Request, res: Response) => {
  try {
    const { name, email, category, notes } = req.body as {
      name?: string;
      email?: string;
      category?: string;
      notes?: string;
    };

    if (!name || !email) {
      return res
        .status(400)
        .json({ error: "Name and email are required for vendor" });
    }

    const vendor = await prisma.vendor.create({
      data: {
        name,
        email,
        category: category ?? null,
        notes: notes ?? null,
      },
    });

    res.status(201).json({ vendor });
  } catch (err) {
    console.error("Error creating vendor:", err);
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

app.get("/api/vendors", async (_req: Request, res: Response) => {
  try {
    const vendors = await prisma.vendor.findMany({
      orderBy: { id: "asc" },
    });
    res.json({ vendors });
  } catch (err) {
    console.error("Error fetching vendors:", err);
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

app.get("/api/vendors/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid vendor id" });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { id },
    });

    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }

    res.json({ vendor });
  } catch (err) {
    console.error("Error fetching vendor:", err);
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

// ---- START SERVER ----
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
