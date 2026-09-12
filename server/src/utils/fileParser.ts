import fs from 'fs';
import path from 'path';

export interface ExtractedDocData {
  documentType: string;
  documentNumber?: string;
  companyName?: string;
  applicantName?: string;
  pan?: string;
  gstin?: string;
  udyam?: string;
  cin?: string;
  address?: string;
  district?: string;
  state?: string;
  issueDate?: string;
  expiryDate?: string;
  authority?: string;
  investmentAmount?: number; // In Crores or INR
  isSigned?: boolean;
  isReadable: boolean;
  rawText?: string;
}

/**
 * OCR Abstraction layer.
 * For prototype: extracts text from text/markdown/json files or performs heuristic simulation
 * based on filename and contents, easily replaceable by Tesseract.js / AWS Textract / Cloud Vision.
 */
export async function extractDocumentData(
  filePath: string,
  category: string,
  docName: string
): Promise<ExtractedDocData> {
  let fileContent = '';
  let isReadable = true;

  try {
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath).toLowerCase();
      if (['.txt', '.json', '.csv', '.md'].includes(ext)) {
        fileContent = fs.readFileSync(filePath, 'utf8');
      } else {
        // Simulated OCR extraction from PDF/images using document title & heuristics
        fileContent = `Document: ${docName}. Category: ${category}.`;
      }
    }
  } catch (e) {
    isReadable = false;
  }

  const nameUpper = docName.toUpperCase();
  const catUpper = category.toUpperCase();

  // Smart heuristic extraction simulating OCR detection on typical Indian industrial records
  let result: ExtractedDocData = {
    documentType: category,
    isReadable: true,
    isSigned: true
  };

  if (catUpper.includes('TAX') || nameUpper.includes('GST')) {
    result.documentType = 'GST Registration Certificate (REG-06)';
    result.gstin = '27AABCA1234F1Z5';
    result.pan = 'AABCA1234F';
    result.companyName = 'ABC Industries Pvt Ltd';
    result.address = 'Plot No. C-14, Additional MIDC, Baramati, Pune, Maharashtra 413133';
    result.authority = 'Goods and Services Tax Network (GSTN), Govt of Maharashtra';
    result.issueDate = '2022-04-10';
  } else if (nameUpper.includes('PAN') || catUpper.includes('IDENTITY')) {
    result.documentType = 'Company Permanent Account Number (PAN) Card';
    result.pan = 'AABCA1234F';
    result.companyName = 'ABC Industries Pvt Ltd';
    result.authority = 'Income Tax Department, Govt of India';
    result.issueDate = '2021-08-15';
  } else if (nameUpper.includes('INCORPORATION') || nameUpper.includes('CIN') || catUpper.includes('COMPANY')) {
    result.documentType = 'Certificate of Incorporation (ROC)';
    result.cin = 'U17120MH2021PTC365412';
    result.pan = 'AABCA1234F';
    result.companyName = 'ABC Industries Pvt Ltd';
    result.address = 'Plot No. C-14, Additional MIDC, Baramati, Pune, Maharashtra 413133';
    result.authority = 'Ministry of Corporate Affairs, Registrar of Companies, Mumbai';
    result.issueDate = '2021-08-20';
  } else if (nameUpper.includes('UDYAM') || nameUpper.includes('MSME')) {
    result.documentType = 'Udyam Registration Certificate';
    result.udyam = 'UDYAM-MH-26-0034182';
    result.companyName = 'ABC Industries Pvt Ltd';
    result.documentNumber = 'UDYAM-MH-26-0034182';
    result.authority = 'Ministry of Micro, Small and Medium Enterprises';
    result.issueDate = '2022-01-15';
  } else if (nameUpper.includes('LAND') || nameUpper.includes('MIDC') || catUpper.includes('LAND')) {
    result.documentType = 'MIDC Land Possession Letter & Lease Deed';
    result.documentNumber = 'MIDC/RO/PUNE/2023/PL-14';
    result.companyName = 'ABC Industries Pvt Ltd';
    result.address = 'Plot No. C-14, Additional Baramati MIDC, District Pune';
    result.authority = 'Maharashtra Industrial Development Corporation (MIDC)';
    result.issueDate = '2023-03-01';
  } else if (nameUpper.includes('FINANCIAL') || nameUpper.includes('CA') || catUpper.includes('FINANCIAL')) {
    result.documentType = 'Chartered Accountant Net Worth & Project Cost Certificate';
    result.companyName = 'ABC Industries Pvt Ltd';
    result.investmentAmount = 20.0; // In Cr - designed to trigger cross-consistency check if project declared 25 Cr
    result.authority = 'Institute of Chartered Accountants of India (ICAI)';
    result.issueDate = '2024-02-15';
  } else if (nameUpper.includes('ENVIRONMENT') || nameUpper.includes('EIA') || catUpper.includes('ENVIRONMENTAL')) {
    result.documentType = 'Environmental Management Plan & Baseline Report';
    result.companyName = 'ABC Industries Pvt Ltd';
    result.authority = 'Accredited EIA Consultant / MPCB Empanelled';
    result.issueDate = '2023-11-20';
    result.expiryDate = '2024-10-31'; // Approaching expiry for alert demo
  } else if (nameUpper.includes('FACTORY') || nameUpper.includes('PLAN') || catUpper.includes('FACTORY')) {
    result.documentType = 'Approved Factory Building & Machinery Layout Plan';
    result.companyName = 'ABC Industries Pvt Ltd';
    result.isSigned = false; // Missing signature test case for demo
    result.authority = 'Directorate of Industrial Safety and Health (DISH)';
  } else {
    result.documentType = category;
    result.companyName = 'ABC Industries Pvt Ltd';
  }

  return result;
}
