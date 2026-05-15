export interface ParsedExpense {
  amount: number;
  merchant: string;
  category: string;
  date: Date;
  note: string;
}

export function parseIndianBankSMS(body: string, address: string, date: number): ParsedExpense | null {
  const cleanBody = body.replace(/,/g, ''); // Remove commas from numbers
  
  // Pattern 1: Rs. 500.00 debited from A/c ...
  // Pattern 2: INR 1200.00 spent on ...
  // Pattern 3: Transaction of Rs 250.00 at ...
  // Pattern 4: VPA: ... Amt: 100.00
  const amountRegex = /(?:Rs\.?|INR|Amt:?|Amount:?|Debited:?)\s?([\d.]+)/i;
  const match = cleanBody.match(amountRegex);
  
  if (!match) return null;
  
  const amount = parseFloat(match[1]);
  if (isNaN(amount) || amount <= 0) return null;

  // Identify Merchant
  let merchant = address;
  const merchantRegex = /(?:at|on|to|vpa|info)\s+([A-Za-z0-9\s*&]+?)(?:\s+on|\s+at|\s+using|\.|$)/i;
  const merchantMatch = cleanBody.match(merchantRegex);
  if (merchantMatch) {
    merchant = merchantMatch[1].trim();
  }

  // Basic Category mapping based on merchant name
  let category = "Other";
  const catKeywords: Record<string, string[]> = {
    Food: ["swiggy", "zomato", "restaurant", "cafe", "eats", "starbucks", "mcdonalds"],
    Shopping: ["amazon", "flipkart", "myntra", "blinkit", "zepto", "reliance", "market"],
    Travel: ["uber", "ola", "irctc", "indigo", "airtel", "makemytrip", "petrol", "fuel"],
    Bills: ["jio", "electricity", "water", "insurance", "lic", "broadband"],
  };

  for (const [cat, keywords] of Object.entries(catKeywords)) {
    if (keywords.some(k => merchant.toLowerCase().includes(k) || cleanBody.toLowerCase().includes(k))) {
      category = cat;
      break;
    }
  }

  return {
    amount,
    merchant: merchant || address,
    category,
    date: new Date(date),
    note: body.length > 100 ? body.substring(0, 100) + "..." : body
  };
}
