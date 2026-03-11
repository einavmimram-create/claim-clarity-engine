/**
 * Hebrew copy for the full report (full_he).
 * This file is the single source for Hebrew report strings.
 * Updates here affect only the Hebrew report; English full report copy is elsewhere.
 */

export const reportCopyHe = {
  reportTitle: 'דוח מלא',
  reportTitleWithPatient: (patientName: string) => `דוח מלא: ${patientName}`,

  sidebar: {
    executiveSummary: 'סיכום מנהלים',
    medicalNarrative: 'נרטיב רפואי',
    claimantMedicalSummary: 'סיכום רפואי של התובע',
    medicalTimeline: 'ציר זמן רפואי',
    contradictionsInconsistencies: 'סתירות וחוסר עקביות',
    missingDocumentation: 'תיעוד חסר',
    causationAnalysis: 'ניתוח סיבתיות',
    mechanismOfInjury: 'מנגנון הפציעה',
    medicalConditionClassification: 'סיווג מצב רפואי',
    treatmentToDiagnosisMapping: 'מיפוי טיפול-אבחנה',
    medicalBillingReview: 'בדיקת חיוב רפואי',
    billingOverview: 'סקירת חיוב',
    lineItemBillingReview: 'בדיקת חיוב לפי שורות',
    billingIssuesExceptions: 'בעיות חיוב וחריגים',
    highImpactBills: 'חשבונות בעלי השפעה גבוהה',
  },

  /** Section titles as shown in the report body (can diverge from sidebar; update here only affects Hebrew report) */
  reportSections: {
    executiveSummary: 'סיכום מנהלים',
    medicalNarrative: 'נרטיב רפואי',
    medicalTimeline: 'ציר זמן רפואי (אבני דרך קליניות)',
    contradictionsInconsistencies: 'סתירות וחוסר עקביות',
    missingDocumentation: 'תיעוד חסר',
    causationAnalysis: 'ניתוח סיבתיות',
    medicalConditionClassification: 'סיווג מצב רפואי',
    treatmentToDiagnosisMapping: 'מיפוי טיפול-אבחנה',
    medicalBillingReview: 'בדיקת חיוב רפואי',
    nextSteps: 'השלבים הבאים',
  },
};
