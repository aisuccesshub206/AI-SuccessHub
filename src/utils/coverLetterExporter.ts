import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx';
import { CoverLetterData } from '../types/coverLetter';

/**
 * Downloads the cover letter as a formatted native Microsoft Word (.docx) document
 */
export async function downloadCoverLetterDocx(data: CoverLetterData): Promise<void> {
  const { personalInfo, recipientInfo, letterContent } = data;

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
        },
        children: [
          // Header: Name
          new Paragraph({
            text: personalInfo.fullName.toUpperCase(),
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 60 },
          }),

          // Job Title
          ...(personalInfo.jobTitle
            ? [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: personalInfo.jobTitle,
                      bold: true,
                      color: '2563EB',
                      size: 24,
                    }),
                  ],
                  spacing: { after: 120 },
                }),
              ]
            : []),

          // Contact Details Line
          new Paragraph({
            children: [
              new TextRun({
                text: [personalInfo.email, personalInfo.phone, personalInfo.location, personalInfo.linkedin]
                  .filter(Boolean)
                  .join(' | '),
                size: 18,
                color: '64748B',
              }),
            ],
            spacing: { after: 300 },
          }),

          // Date
          ...(recipientInfo.date
            ? [
                new Paragraph({
                  children: [new TextRun({ text: recipientInfo.date, bold: true, size: 20 })],
                  spacing: { after: 200 },
                }),
              ]
            : []),

          // Recipient Info
          ...(recipientInfo.hiringManager
            ? [
                new Paragraph({
                  children: [new TextRun({ text: recipientInfo.hiringManager, bold: true, size: 22 })],
                }),
              ]
            : []),
          ...(recipientInfo.hiringManagerTitle
            ? [
                new Paragraph({
                  children: [new TextRun({ text: recipientInfo.hiringManagerTitle, size: 20, color: '475569' })],
                }),
              ]
            : []),
          ...(recipientInfo.companyName
            ? [
                new Paragraph({
                  children: [new TextRun({ text: recipientInfo.companyName, bold: true, size: 20 })],
                }),
              ]
            : []),
          ...(recipientInfo.companyAddress
            ? [
                new Paragraph({
                  children: [new TextRun({ text: recipientInfo.companyAddress, size: 18, color: '64748B' })],
                  spacing: { after: 300 },
                }),
              ]
            : []),

          // Subject Line
          ...(letterContent.subject
            ? [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: letterContent.subject,
                      bold: true,
                      size: 24,
                      color: '1E293B',
                    }),
                  ],
                  spacing: { after: 240 },
                }),
              ]
            : []),

          // Salutation
          ...(letterContent.salutation
            ? [
                new Paragraph({
                  children: [new TextRun({ text: letterContent.salutation, bold: true, size: 22 })],
                  spacing: { after: 200 },
                }),
              ]
            : []),

          // Body Paragraphs
          ...letterContent.body
            .split('\n\n')
            .filter((p) => p.trim().length > 0)
            .map(
              (paraText) =>
                new Paragraph({
                  children: [new TextRun({ text: paraText, size: 22 })],
                  spacing: { after: 200, line: 276 },
                })
            ),

          // Sign Off & Signature
          new Paragraph({
            children: [new TextRun({ text: letterContent.signOff || 'Sincerely,', size: 22 })],
            spacing: { before: 240, after: 120 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: letterContent.signatureName || personalInfo.fullName,
                bold: true,
                size: 24,
                color: '1E293B',
              }),
            ],
          }),

          ...(personalInfo.jobTitle
            ? [
                new Paragraph({
                  children: [new TextRun({ text: personalInfo.jobTitle, size: 18, color: '64748B' })],
                }),
              ]
            : []),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `${personalInfo.fullName.replace(/\s+/g, '_')}_Cover_Letter.docx`;

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

/**
 * Triggers native print / save to PDF for the cover letter document
 */
export function printCoverLetter(): void {
  window.print();
}

/**
 * Copies the raw text of the cover letter to the user's clipboard
 */
export function copyCoverLetterText(data: CoverLetterData): Promise<void> {
  const { personalInfo, recipientInfo, letterContent } = data;

  const text = `${personalInfo.fullName}
${personalInfo.jobTitle}
${personalInfo.email} | ${personalInfo.phone} | ${personalInfo.location}

${recipientInfo.date}

${recipientInfo.hiringManager || ''}
${recipientInfo.hiringManagerTitle || ''}
${recipientInfo.companyName || ''}
${recipientInfo.companyAddress || ''}

${letterContent.subject || ''}

${letterContent.salutation || 'Dear Hiring Manager,'}

${letterContent.body}

${letterContent.signOff || 'Sincerely,'}
${letterContent.signatureName || personalInfo.fullName}`;

  return navigator.clipboard.writeText(text);
}
