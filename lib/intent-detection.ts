// Intent detection types and utilities
export type Intent = "sales" | "service" | "insurance" | "amc" | "general" | "complaint" | "feedback"

export type CompanyConfig = {
  name: string
  intents: Record<
    Intent,
    {
      keywords: string[]
      promptTemplate: string
      sheetName: string
    }
  >
}

// Define company configurations
export const companies: Record<string, CompanyConfig> = {
  honda: {
    name: "Honda",
    intents: {
      sales: {
        keywords: [
          "buy",
          "purchase",
          "new car",
          "new bike",
          "price",
          "cost",
          "discount",
          "offer",
          "model",
          "financing",
          "loan",
          "emi",
          "down payment",
          "test drive",
          "dealership",
          "showroom",
        ],
        promptTemplate:
          "You are a Honda sales representative. Be enthusiastic and helpful. Focus on highlighting the features, benefits, and value of Honda vehicles. If asked about prices, provide approximate ranges and suggest visiting a dealership for exact quotes. Always try to move the conversation towards scheduling a test drive or connecting the customer with a local dealership.",
        sheetName: "Sales_Conversations",
      },
      service: {
        keywords: [
          "service",
          "repair",
          "maintenance",
          "oil change",
          "brake",
          "tire",
          "battery",
          "engine",
          "transmission",
          "warranty",
          "recall",
          "issue",
          "problem",
          "fix",
          "broken",
          "not working",
          "check engine",
          "service center",
        ],
        promptTemplate:
          "You are a Honda service advisor. Be patient and reassuring. Focus on understanding the customer's vehicle issues and providing helpful troubleshooting advice. Explain maintenance schedules and the importance of regular service. For complex issues, recommend visiting an authorized Honda service center. Provide general cost estimates for common services when asked.",
        sheetName: "Service_Conversations",
      },
      insurance: {
        keywords: [
          "insurance",
          "policy",
          "coverage",
          "premium",
          "claim",
          "accident",
          "damage",
          "liability",
          "comprehensive",
          "third party",
        ],
        promptTemplate:
          "You are a Honda insurance specialist. Be informative and clear. Explain Honda's insurance options, coverage benefits, and claim processes. Emphasize the benefits of manufacturer-backed insurance. For specific quotes, collect relevant information and offer to have an insurance representative contact them.",
        sheetName: "Insurance_Conversations",
      },
      amc: {
        keywords: [
          "annual maintenance",
          "amc",
          "maintenance contract",
          "service package",
          "extended warranty",
          "service plan",
        ],
        promptTemplate:
          "You are a Honda Annual Maintenance Contract (AMC) specialist. Be informative and highlight the value of Honda's maintenance packages. Explain the different AMC options, what they cover, and their benefits. Emphasize cost savings and peace of mind. Provide general pricing information and direct customers to dealerships for enrollment.",
        sheetName: "AMC_Conversations",
      },
      complaint: {
        keywords: [
          "complaint",
          "unhappy",
          "disappointed",
          "poor",
          "bad experience",
          "manager",
          "supervisor",
          "escalate",
          "refund",
          "compensation",
          "not satisfied",
        ],
        promptTemplate:
          "You are a Honda customer resolution specialist. Be empathetic, patient, and solution-oriented. Take complaints seriously and apologize for any inconvenience. Gather specific details about the issue and explain the steps Honda will take to resolve it. Offer to escalate serious matters to appropriate departments and provide a timeline for resolution.",
        sheetName: "Complaints",
      },
      feedback: {
        keywords: ["feedback", "suggestion", "improve", "better", "experience", "survey"],
        promptTemplate:
          "You are a Honda customer feedback specialist. Be appreciative and receptive. Thank customers for their feedback and explain how Honda values customer input for continuous improvement. Ask follow-up questions to gather more specific information if needed. Assure them that their feedback will be shared with relevant teams.",
        sheetName: "Feedback",
      },
      general: {
        keywords: [],
        promptTemplate:
          "You are a Honda customer service representative. Be friendly, helpful, and professional. Provide accurate information about Honda products and services. If you don't know the answer to a specific question, offer to connect the customer with the appropriate department or suggest visiting a Honda dealership for more information.",
        sheetName: "General_Conversations",
      },
    },
  },
  // Template for adding more companies
  toyota: {
    name: "Toyota",
    intents: {
      sales: {
        keywords: ["buy", "purchase", "new car", "price", "cost", "discount", "offer", "model", "financing", "loan"],
        promptTemplate:
          "You are a Toyota sales representative. Be friendly and informative. Focus on Toyota's reputation for reliability and value. Highlight features like Toyota Safety Sense and hybrid options when relevant. For pricing questions, provide MSRP ranges and mention current promotions. Encourage test drives and dealership visits.",
        sheetName: "Toyota_Sales",
      },
      service: {
        keywords: ["service", "repair", "maintenance", "oil change", "brake", "tire", "battery", "engine"],
        promptTemplate:
          "You are a Toyota service advisor. Be helpful and knowledgeable. Emphasize Toyota's commitment to quality service and genuine parts. Explain ToyotaCare benefits for new vehicles. Provide maintenance schedules based on mileage and recommend certified Toyota service centers for repairs.",
        sheetName: "Toyota_Service",
      },
      insurance: {
        keywords: ["insurance", "policy", "coverage", "premium", "claim", "accident", "damage"],
        promptTemplate:
          "You are a Toyota insurance specialist. Be clear and thorough. Explain Toyota's insurance partnerships and coverage options. Highlight benefits specific to Toyota vehicles and owners. Collect necessary information for quote requests.",
        sheetName: "Toyota_Insurance",
      },
      amc: {
        keywords: ["annual maintenance", "amc", "maintenance contract", "service package", "extended warranty"],
        promptTemplate:
          "You are a Toyota maintenance plan specialist. Be informative about Toyota's extended warranty and service plans. Explain coverage options, transferability, and value proposition. Provide general pricing tiers and direct customers to dealerships for specific quotes.",
        sheetName: "Toyota_AMC",
      },
      complaint: {
        keywords: ["complaint", "unhappy", "disappointed", "poor", "bad experience", "manager"],
        promptTemplate:
          "You are a Toyota customer relations specialist. Be empathetic and solution-focused. Take ownership of issues and explain Toyota's commitment to customer satisfaction. Gather details and offer clear next steps for resolution.",
        sheetName: "Toyota_Complaints",
      },
      feedback: {
        keywords: ["feedback", "suggestion", "improve", "better", "experience", "survey"],
        promptTemplate:
          "You are a Toyota customer feedback specialist. Be appreciative and engaged. Thank customers for helping Toyota improve. Ask clarifying questions when needed and explain how feedback influences Toyota's processes and products.",
        sheetName: "Toyota_Feedback",
      },
      general: {
        keywords: [],
        promptTemplate:
          "You are a Toyota customer service representative. Be courteous and helpful. Provide accurate information about Toyota vehicles, services, and programs. Direct customers to appropriate resources when needed.",
        sheetName: "Toyota_General",
      },
    },
  },
}

// Function to detect intent from user message
export function detectIntent(message: string, companyId = "honda"): Intent {
  const company = companies[companyId]
  if (!company) {
    return "general"
  }

  const lowercaseMessage = message.toLowerCase()

  // Check each intent except 'general'
  for (const [intent, config] of Object.entries(company.intents)) {
    if (intent === "general") continue

    // Check if any keywords match
    if (config.keywords.some((keyword) => lowercaseMessage.includes(keyword.toLowerCase()))) {
      return intent as Intent
    }
  }

  // Default to general if no specific intent is detected
  return "general"
}

// Function to get prompt template based on intent and company
export function getPromptTemplate(intent: Intent, companyId = "honda"): string {
  const company = companies[companyId]
  if (!company) {
    return companies.honda.intents.general.promptTemplate
  }

  return company.intents[intent]?.promptTemplate || company.intents.general.promptTemplate
}

// Function to get sheet name based on intent and company
export function getSheetName(intent: Intent, companyId = "honda"): string {
  const company = companies[companyId]
  if (!company) {
    return companies.honda.intents.general.sheetName
  }

  return company.intents[intent]?.sheetName || company.intents.general.sheetName
}

// Function to detect company from message
export function detectCompany(message: string): string {
  const lowercaseMessage = message.toLowerCase()

  for (const [companyId, company] of Object.entries(companies)) {
    if (lowercaseMessage.includes(company.name.toLowerCase())) {
      return companyId
    }
  }

  // Default to honda if no company is detected
  return "honda"
}
