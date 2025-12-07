import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import nodemailer from "nodemailer";
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

// ---- EMAIL (SMTP) SETUP ----
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER;

const mailerEnabled =
  SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS && SMTP_FROM;

const transporter = mailerEnabled
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: false,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    })
  : null;

async function sendRfpEmail(options: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) {
  if (!transporter || !mailerEnabled) {
    throw new Error("SMTP not configured");
  }

  await transporter.sendMail({
    from: SMTP_FROM,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });
}

// ---- SEND RFP TO VENDORS ----
app.post("/api/rfps/:id/send", async (req: Request, res: Response) => {
  try {
    const rfpId = Number(req.params.id);
    const { vendorIds, message } = req.body as {
      vendorIds?: number[];
      message?: string;
    };

    if (isNaN(rfpId)) {
      return res.status(400).json({ error: "Invalid RFP id" });
    }
    if (!vendorIds || !Array.isArray(vendorIds) || vendorIds.length === 0) {
      return res.status(400).json({ error: "vendorIds array is required" });
    }

    const rfp = await prisma.rfp.findUnique({ where: { id: rfpId } });
    if (!rfp) return res.status(404).json({ error: "RFP not found" });

    const vendors = await prisma.vendor.findMany({
      where: { id: { in: vendorIds } },
    });

    if (!mailerEnabled) {
      console.warn("SMTP not configured, skipping actual email send.");
      return res.json({
        status: "skipped",
        reason: "SMTP not configured",
        wouldSendTo: vendors.map((v) => v.email),
      });
    }

    const items = (rfp.items as any[] | null) ?? [];

    const baseText = `
Hello,

We are issuing the following Request for Proposal (RFP):

Title: ${rfp.title}
Budget: ${rfp.budget ?? "N/A"}
Payment Terms: ${rfp.paymentTerms ?? "N/A"}
Warranty (months): ${rfp.warrantyMinMonths ?? "N/A"}

Items:
${items
  .map(
    (item: any, idx: number) =>
      `  ${idx + 1}. ${item.name} x ${item.quantity}`
  )
  .join("\n")}

Additional message from buyer:
${message ?? "(none)"}

Please reply to this email with your detailed proposal: pricing, delivery time, warranty, and payment terms.

Thank you.
`;

    for (const vendor of vendors) {
      await sendRfpEmail({
        to: vendor.email,
        subject: `RFP: ${rfp.title}`,
        text: baseText,
      });
    }

    return res.json({
      status: "sent",
      sentTo: vendors.map((v) => v.email),
    });
  } catch (err: any) {
    console.error("Error sending RFP emails:", err);
    return res.status(500).json({
      error: "EMAIL_SEND_ERROR",
      details: err.message || err,
    });
  }
});

// ---- PROPOSAL CREATION (simulate inbound vendor response) ----
app.post("/api/proposals", async (req: Request, res: Response) => {
  try {
    const { rfpId, vendorId, rawText } = req.body as {
      rfpId?: number;
      vendorId?: number;
      rawText?: string;
    };

    if (!rfpId || !vendorId || !rawText) {
      return res.status(400).json({
        error: "rfpId, vendorId and rawText are required",
      });
    }

    const [rfp, vendor] = await Promise.all([
      prisma.rfp.findUnique({ where: { id: rfpId } }),
      prisma.vendor.findUnique({ where: { id: vendorId } }),
    ]);

    if (!rfp) return res.status(404).json({ error: "RFP not found" });
    if (!vendor) return res.status(404).json({ error: "Vendor not found" });

    let parsed: any = null;
    let totalPrice: number | null = null;
    let currency: string | null = null;
    let deliveryDays: number | null = null;
    let warrantyYears: number | null = null;
    let paymentTerms: string | null = null;
    let aiSummary: string | null = null;

    try {
      const model = getGeminiModel();
      const prompt = `
You are parsing a vendor proposal email for an RFP.

Extract the following as JSON:

{
  "totalPrice": number | null,
  "currency": string | null,
  "deliveryDays": number | null,
  "warrantyYears": number | null,
  "paymentTerms": string | null,
  "summary": string
}

Proposal text:
"""${rawText}"""
`;

      const result = await model.generateContent(prompt);
      const raw = result.response.text() || "{}";
      const cleaned = raw
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      parsed = JSON.parse(cleaned);

      totalPrice =
        typeof parsed.totalPrice === "number" ? parsed.totalPrice : null;
      currency = typeof parsed.currency === "string" ? parsed.currency : null;
      deliveryDays =
        typeof parsed.deliveryDays === "number" ? parsed.deliveryDays : null;
      warrantyYears =
        typeof parsed.warrantyYears === "number" ? parsed.warrantyYears : null;
      paymentTerms =
        typeof parsed.paymentTerms === "string" ? parsed.paymentTerms : null;
      aiSummary =
        typeof parsed.summary === "string" ? parsed.summary : null;
    } catch (aiError: any) {
      console.error("Proposal AI parse failed, storing raw only:", aiError);
      // leave parsed null; fields mostly null
    }

    const proposal = await prisma.proposal.create({
      data: {
        rfpId,
        vendorId,
        rawText,
        parsed,
        totalPrice,
        currency,
        deliveryDays,
        warrantyYears,
        paymentTerms,
        score: null,
        aiSummary,
      },
    });

    return res.status(201).json({ proposal });
  } catch (err: any) {
    console.error("Error creating proposal:", err);
    return res.status(500).json({
      error: "SERVER_ERROR",
      details: err.message || err,
    });
  }
});

// ---- COMPARE PROPOSALS FOR AN RFP ----
app.get(
  "/api/rfps/:id/proposals/compare",
  async (req: Request, res: Response) => {
    try {
      const rfpId = Number(req.params.id);
      if (isNaN(rfpId)) {
        return res.status(400).json({ error: "Invalid RFP id" });
      }

      const rfp = await prisma.rfp.findUnique({ where: { id: rfpId } });
      if (!rfp) return res.status(404).json({ error: "RFP not found" });

      const proposals = await prisma.proposal.findMany({
        where: { rfpId },
        include: { vendor: true },
        orderBy: { id: "asc" },
      });

      const scored = proposals.map((p) => {
        let score = 0;
        if (p.totalPrice != null) score += 1000000 / (1 + p.totalPrice);
        if (p.deliveryDays != null) score += 1000 / (1 + p.deliveryDays);
        if (p.warrantyYears != null) score += 100 * p.warrantyYears;
        return { ...p, computedScore: score };
      });

      const best = scored.reduce(
        (acc: any, p: any) =>
          acc == null || p.computedScore > acc.computedScore ? p : acc,
        null as any
      );

      let aiRecommendation: string | null = null;

      try {
        const model = getGeminiModel();
        const prompt = `
You are helping a procurement manager choose a vendor for an RFP.

RFP:
${JSON.stringify(rfp, null, 2)}

Proposals:
${JSON.stringify(
  scored.map((p) => ({
    vendorName: p.vendor.name,
    totalPrice: p.totalPrice,
    currency: p.currency,
    deliveryDays: p.deliveryDays,
    warrantyYears: p.warrantyYears,
    paymentTerms: p.paymentTerms,
  })),
  null,
  2
)}

Based on price, delivery time, and warranty, recommend the best vendor.
Return a short explanation, including trade-offs.
`;

        const result = await model.generateContent(prompt);
        aiRecommendation = result.response.text();
      } catch (aiError: any) {
        console.error("Comparison AI failed:", aiError);
      }

      return res.json({
        rfp,
        proposals: scored,
        bestVendorId: best?.vendorId ?? null,
        aiRecommendation,
      });
    } catch (err: any) {
      console.error("Error comparing proposals:", err);
      return res.status(500).json({
        error: "SERVER_ERROR",
        details: err.message || err,
      });
    }
  }
);

// ---- START SERVER ----
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
