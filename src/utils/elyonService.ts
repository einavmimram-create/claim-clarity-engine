import { MedicalEvent, Contradiction, MissingFlag, BillItem, Claim } from '@/types/claim';

interface ElyonContext {
  query: string;
  claim: Claim;
  timeline: MedicalEvent[];
  contradictions: Contradiction[];
  missingFlags: MissingFlag[];
  bills: BillItem[];
  reportTitle: string;
}

interface ElyonResponse {
  answer: string;
  insertSection?: {
    title: string;
    content: string;
  };
}

/**
 * Builds a comprehensive context string from the report data
 */
function buildReportContext(context: ElyonContext): string {
  const { claim, timeline, contradictions, missingFlags, bills, reportTitle } = context;

  let contextStr = `# CLAIM REPORT: ${reportTitle}\n\n`;

  // Claim Information
  contextStr += `## Claim Information\n`;
  contextStr += `- Claim ID: ${claim.id}\n`;
  contextStr += `- Claimant: ${claim.name}\n`;
  if (claim.accidentDate) {
    contextStr += `- Accident Date: ${claim.accidentDate}\n`;
  }
  contextStr += `- Documents Analyzed: ${claim.fileCount}\n\n`;

  // Timeline Events
  contextStr += `## Medical Timeline\n`;
  timeline.forEach((event) => {
    contextStr += `- **${event.date}** - ${event.provider} (${event.specialty}): ${event.description}\n`;
    if (event.sourceDocument) {
      contextStr += `  - Source: ${event.sourceDocument} (${event.sourcePageRef})\n`;
    }
  });
  contextStr += `\n`;

  // Contradictions
  if (contradictions.length > 0) {
    contextStr += `## Contradictions & Inconsistencies\n`;
    contradictions.forEach((contradiction) => {
      contextStr += `- **${contradiction.type}** (${contradiction.severity}): ${contradiction.description}\n`;
      if (contradiction.sources.length > 0) {
        contextStr += `  - Sources: ${contradiction.sources.join(', ')}\n`;
      }
    });
    contextStr += `\n`;
  }

  // Missing Flags
  if (missingFlags.length > 0) {
    contextStr += `## Missing Documentation\n`;
    missingFlags.forEach((flag) => {
      contextStr += `- **${flag.type}**: ${flag.description}\n`;
      contextStr += `  - Significance: ${flag.significance}\n`;
    });
    contextStr += `\n`;
  }

  // Billing Summary
  const accidentRelatedBilled = bills
    .filter((b) => b.isAccidentRelated)
    .reduce((sum, b) => sum + b.amount, 0);
  const unrelatedBilled = bills
    .filter((b) => !b.isAccidentRelated)
    .reduce((sum, b) => sum + b.amount, 0);
  const totalBilled = accidentRelatedBilled + unrelatedBilled;

  contextStr += `## Medical Billing Summary\n`;
  contextStr += `- Total Billed: $${totalBilled.toFixed(2)}\n`;
  contextStr += `- Accident Related: $${accidentRelatedBilled.toFixed(2)}\n`;
  contextStr += `- Unrelated: $${unrelatedBilled.toFixed(2)}\n\n`;

  // High-Value Bills
  const highValueBills = bills
    .filter((b) => b.amount > 1000)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);

  if (highValueBills.length > 0) {
    contextStr += `### High-Value Bills\n`;
    highValueBills.forEach((bill) => {
      contextStr += `- **${bill.date}** - ${bill.provider}: ${bill.description} - $${bill.amount.toFixed(2)}\n`;
      contextStr += `  - Accident Related: ${bill.isAccidentRelated ? 'Yes' : 'No'}\n`;
      contextStr += `  - Risk Score: ${bill.riskScore}\n`;
    });
    contextStr += `\n`;
  }

  // Risk Items
  const highRiskBills = bills.filter((b) => b.riskScore === 'high');
  if (highRiskBills.length > 0) {
    contextStr += `### High-Risk Bills\n`;
    highRiskBills.forEach((bill) => {
      contextStr += `- ${bill.provider}: ${bill.description} - $${bill.amount.toFixed(2)}\n`;
      if (bill.isDuplicate) {
        contextStr += `  - Duplicate detected\n`;
      }
    });
    contextStr += `\n`;
  }

  return contextStr;
}

/**
 * Determines if a response should include an insertable section
 */
function shouldInsertSection(query: string, answer: string): boolean {
  const structuredKeywords = [
    'analyze',
    'summary',
    'overview',
    'assessment',
    'evaluation',
    'findings',
    'conclusion',
    'recommendation',
    'breakdown',
    'comparison',
  ];

  const lowerQuery = query.toLowerCase();
  const lowerAnswer = answer.toLowerCase();

  // Check if query asks for structured analysis
  const asksForStructure = structuredKeywords.some((keyword) =>
    lowerQuery.includes(keyword)
  );

  // Check if answer is substantial enough (more than 200 chars)
  const isSubstantial = answer.length > 200;

  return asksForStructure && isSubstantial;
}

/**
 * Generates a title for an insertable section based on the query
 */
function generateSectionTitle(query: string): string {
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes('timeline') || lowerQuery.includes('chronology')) {
    return 'Elyon Analysis – Timeline Review';
  }
  if (lowerQuery.includes('billing') || lowerQuery.includes('cost')) {
    return 'Elyon Analysis – Billing Assessment';
  }
  if (lowerQuery.includes('causation') || lowerQuery.includes('cause')) {
    return 'Elyon Analysis – Causation Review';
  }
  if (lowerQuery.includes('contradiction') || lowerQuery.includes('inconsistenc')) {
    return 'Elyon Analysis – Data Consistency Review';
  }
  if (lowerQuery.includes('gap') || lowerQuery.includes('missing')) {
    return 'Elyon Analysis – Documentation Gaps';
  }
  if (lowerQuery.includes('risk') || lowerQuery.includes('exposure')) {
    return 'Elyon Analysis – Risk Assessment';
  }

  return 'Elyon Analysis – Claim Review';
}

/**
 * Formats the answer as markdown for insertion
 */
function formatAsMarkdownSection(answer: string): string {
  // Ensure proper markdown formatting
  // Add bullet points if the answer contains list-like content
  const lines = answer.split('\n');
  const formatted = lines.map((line) => {
    const trimmed = line.trim();
    if (trimmed.length === 0) return '';
    // If line doesn't start with markdown syntax, format as paragraph or bullet
    if (!trimmed.match(/^[#\-\*\+\[\d]/)) {
      // Check if it looks like a list item
      if (trimmed.match(/^[A-Z][^\.]+:/)) {
        return `- **${trimmed}**`;
      }
      return trimmed;
    }
    return trimmed;
  });

  return formatted.join('\n\n');
}

/**
 * Main service function to get Elyon's response
 * 
 * NOTE: This is a mock implementation. In production, this would call
 * an actual AI service (OpenAI, Anthropic, etc.) with the report context.
 */
export async function getElyonResponse(context: ElyonContext): Promise<ElyonResponse> {
  const reportContext = buildReportContext(context);
  const { query } = context;

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

  // Mock response generation
  // In production, this would be an actual AI API call
  const mockAnswer = generateMockAnswer(query, reportContext);
  
  const response: ElyonResponse = {
    answer: mockAnswer,
  };

  // Determine if we should insert a section
  if (shouldInsertSection(query, mockAnswer)) {
    response.insertSection = {
      title: generateSectionTitle(query),
      content: formatAsMarkdownSection(mockAnswer),
    };
  }

  return response;
}

/**
 * Generates a mock answer based on the query and context
 * In production, this would be replaced with an actual AI API call
 */
function generateMockAnswer(query: string, context: string): string {
  const lowerQuery = query.toLowerCase();

  // Simple pattern matching for demo purposes
  // In production, this would be handled by the AI model

  if (lowerQuery.includes('timeline') || lowerQuery.includes('chronology')) {
    return `Based on the medical timeline, the claim spans from 2000 to 2006, with the index accident occurring on January 23, 2005. The key clinical milestones include:\n\n- Pre-accident: Prior lumbosacral strain in 2003, unrelated sinus surgery in 2004\n- Index accident: Slip-and-fall on January 23, 2005\n- Post-accident: Initial evaluation February 2005, MRI confirmation April 2005, first discectomy April 2005, revision fusion June 2006\n\nThe timeline demonstrates a clear progression from the accident to surgical intervention, with appropriate diagnostic steps in between.`;
  }

  if (lowerQuery.includes('billing') || lowerQuery.includes('cost') || lowerQuery.includes('total')) {
    return `The total reviewed billing is $41,501.77, with $33,323.72 (80.3%) deemed accident-related and $8,178.05 (19.7%) identified as unrelated. The unrelated charges primarily stem from the sinus surgery in 2004, which occurred before the accident date. High-value bills include Washington Hospital Center ($19,028) and Virginia Hospital Center ($15,863.84) for the surgical procedures.`;
  }

  if (lowerQuery.includes('causation') || lowerQuery.includes('cause')) {
    return `The clinical evidence strongly supports causation. The MRI-confirmed L3-L4 disc extrusion with neurological findings (L4 radiculopathy, quadriceps weakness) directly correlates with the mechanism of injury (axial loading on sacrum from slip-and-fall). The temporal relationship is clear: symptoms developed immediately post-accident, and the structural injury was confirmed within 3 months. The prior 2003 strain was documented as resolved, and the 2004 sinus surgery is anatomically unrelated.`;
  }

  if (lowerQuery.includes('contradiction') || lowerQuery.includes('inconsistenc')) {
    return `The report identifies several contradictions:\n\n- Diagnosis inconsistencies between provider notes\n- Narrative discrepancies between patient statements and medical records\n- Treatment-to-diagnosis mapping issues\n\nThese inconsistencies require further investigation and may impact the claim's validity.`;
  }

  if (lowerQuery.includes('risk') || lowerQuery.includes('exposure')) {
    return `Key risk factors identified:\n\n- High-value surgical procedures ($34,891.84 total)\n- Failed initial surgery requiring revision\n- Extended treatment timeline (14+ months)\n- Multiple high-risk billing items flagged\n- Documentation gaps in conservative care\n\nThe combination of structural injury, surgical complications, and billing concerns elevates the overall claim risk.`;
  }

  if (lowerQuery.includes('gap') || lowerQuery.includes('missing')) {
    return `Documentation gaps identified:\n\n- Missing conservative care records between initial evaluation and surgery\n- Lack of objective findings documentation for some treatment dates\n- Incomplete treatment-to-diagnosis mapping for certain procedures\n- Absence of pre-authorization documentation for high-cost procedures\n\nThese gaps may impact the ability to fully validate the necessity and appropriateness of all billed services.`;
  }

  // Default response
  return `Based on the report data, I can see this claim involves a slip-and-fall accident on January 23, 2005, resulting in an L3-L4 disc herniation. The claimant underwent two spinal surgeries over 14 months, with total billing of $41,501.77. The clinical timeline shows a clear progression from injury to surgical intervention, with appropriate diagnostic steps. What specific aspect would you like me to analyze further?`;
}

