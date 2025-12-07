
import OpenAI from "openai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

const openai = OPENAI_API_KEY
  ? new OpenAI({ apiKey: OPENAI_API_KEY })
  : null;

// Real call if key exists, else return a mocked response
export async function generateRfpFromDescription(description: string) {
  if (!openai) {
    // MOCKED response when no key/quota
    return {
      title: "Mocked RFP from description",
      budget: 50000,
      deliveryDeadline: null,
      paymentTerms: "Net 30",
      warrantyMinMonths: 12,
      items: [
        {
          name: "Laptop",
          quantity: 20,
          specs: { ramGB: 16 },
        },
        {
          name: "Monitor",
          quantity: 15,
          specs: { sizeInch: 27 },
        },
      ],
    };
  }

  const completion = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    messages: [
      {
        role: "system",
        content:
          "You are an assistant that converts procurement descriptions into structured RFP JSON. " +
          "Always respond with ONLY valid JSON and no extra explanation.",
      },
      {
        role: "user",
        content: `...${description}...`,
      },
    ],
    temperature: 0.1,
  });

  return JSON.parse(completion.choices[0]?.message?.content || "{}");
}
