import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import { YouTubeProject, ScriptOnlyProject } from '../types/youtubeStudio';

/**
 * Downloads Script-Only YouTube Script as a clean TXT file
 */
export function downloadScriptTxt(project: ScriptOnlyProject): void {
  let content = `TITLE: ${project.videoTitle}\n`;
  content += `NICHE: ${project.niche} | TYPE: ${project.videoType} | DURATION: ${project.duration} | TONE: ${project.tone} | SPEAKER: ${project.speaker}\n`;
  content += `\n=======================================================\n\n`;
  content += `${project.fullScriptText}\n\n`;
  content += `=======================================================\n`;
  content += `SEO METADATA\n`;
  content += `=======================================================\n`;
  content += `YouTube Title: ${project.seo.youtubeTitle}\n\n`;
  content += `Alternative Titles:\n${project.seo.alternativeTitles.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n\n`;
  content += `Description:\n${project.seo.description}\n\n`;
  content += `Keywords: ${project.seo.keywords.join(', ')}\n`;
  content += `Tags: ${project.seo.tags.join(', ')}\n`;
  content += `Hashtags: ${project.seo.hashtags.join(' ')}\n\n`;
  content += `Chapters:\n${project.seo.chapters.map(c => `${c.timestamp} - ${c.title}`).join('\n')}\n\n`;
  content += `Pinned Comment:\n"${project.seo.pinnedComment}"\n`;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${slugify(project.videoTitle)}-youtube-script.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads Script-Only YouTube Script as a formatted Word (.docx) document
 */
export async function downloadScriptDocx(project: ScriptOnlyProject): Promise<void> {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: project.videoTitle,
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 150 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Niche: ${project.niche} | Type: ${project.videoType} | Duration: ${project.duration} | Tone: ${project.tone} | Speaker: ${project.speaker}`,
                size: 18,
                color: '64748B',
                italics: true,
              }),
            ],
            spacing: { after: 300 },
          }),

          // Full Script
          new Paragraph({ text: 'COMPLETE YOUTUBE SCRIPT', heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 120 } }),
          ...project.fullScriptText.split('\n').map(
            (line) =>
              new Paragraph({
                children: [
                  new TextRun({
                    text: line,
                    size: 22,
                    bold: line.startsWith('ALEX:') || line.startsWith('SARAH:') || line.startsWith('NARRATOR:') || line.startsWith('TITLE:') || line.startsWith('[') || line.startsWith('---'),
                  }),
                ],
                spacing: { after: 100 },
              })
          ),

          // SEO Section
          new Paragraph({ text: 'OPTIONAL SEO METADATA', heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 120 } }),
          new Paragraph({ children: [new TextRun({ text: 'Primary Title: ', bold: true }), new TextRun({ text: project.seo.youtubeTitle })], spacing: { after: 100 } }),
          new Paragraph({ children: [new TextRun({ text: 'Alternative Titles:', bold: true })], spacing: { after: 60 } }),
          ...project.seo.alternativeTitles.map(
            (alt) => new Paragraph({ children: [new TextRun({ text: `• ${alt}` })], spacing: { after: 40 } })
          ),
          new Paragraph({ children: [new TextRun({ text: 'Description:', bold: true })], spacing: { before: 120, after: 60 } }),
          ...project.seo.description.split('\n').map(
            (line) => new Paragraph({ children: [new TextRun({ text: line, size: 20 })], spacing: { after: 60 } })
          ),
          new Paragraph({ children: [new TextRun({ text: 'Keywords: ', bold: true }), new TextRun({ text: project.seo.keywords.join(', ') })], spacing: { before: 100, after: 60 } }),
          new Paragraph({ children: [new TextRun({ text: 'Tags: ', bold: true }), new TextRun({ text: project.seo.tags.join(', ') })], spacing: { after: 60 } }),
          new Paragraph({ children: [new TextRun({ text: 'Hashtags: ', bold: true }), new TextRun({ text: project.seo.hashtags.join(' ') })], spacing: { after: 60 } }),
          new Paragraph({ children: [new TextRun({ text: 'Pinned Comment: ', bold: true }), new TextRun({ text: `"${project.seo.pinnedComment}"`, italics: true })], spacing: { before: 100, after: 60 } }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${slugify(project.videoTitle)}-youtube-script.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Opens print preview / save to PDF for Script-Only project
 */
export function printScriptPdf(project: ScriptOnlyProject): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${project.videoTitle} - YouTube Script</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #0f172a; padding: 40px; max-width: 850px; margin: 0 auto; background: #fff; }
          h1 { color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; font-size: 24px; margin-bottom: 12px; }
          h2 { color: #2563eb; margin-top: 28px; font-size: 18px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }
          .meta { font-size: 13px; color: #475569; background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; margin-bottom: 24px; }
          .script-box { white-space: pre-wrap; font-size: 15px; line-height: 1.7; background: #fafafa; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; font-family: inherit; }
          .seo-box { background: #f1f5f9; padding: 16px; border-radius: 6px; font-size: 13px; margin-top: 12px; white-space: pre-wrap; }
          .label { font-weight: 600; color: #1e293b; }
          @media print {
            body { padding: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <button onclick="window.print()" style="background:#2563eb;color:white;padding:10px 18px;border:none;border-radius:6px;cursor:pointer;font-weight:600;margin-bottom:20px;">Print / Save as PDF</button>
        <h1>${project.videoTitle}</h1>
        <div class="meta">
          <strong>Niche:</strong> ${project.niche} | <strong>Type:</strong> ${project.videoType} | <strong>Duration:</strong> ${project.duration} | <strong>Tone:</strong> ${project.tone} | <strong>Speaker:</strong> ${project.speaker} | <strong>Language:</strong> ${project.outputLanguage}
        </div>

        <h2>Complete Ready-to-Record YouTube Script</h2>
        <div class="script-box">${escapeHtml(project.fullScriptText)}</div>

        <h2>Optional SEO & Video Metadata</h2>
        <p><span class="label">Main Title:</span> ${project.seo.youtubeTitle}</p>
        <p><span class="label">Alternative Titles:</span></p>
        <ul>
          ${project.seo.alternativeTitles.map(t => `<li>${t}</li>`).join('')}
        </ul>
        <p><span class="label">Description:</span></p>
        <div class="seo-box">${escapeHtml(project.seo.description)}</div>
        <p><span class="label">Keywords:</span> ${project.seo.keywords.join(', ')}</p>
        <p><span class="label">Tags:</span> ${project.seo.tags.join(', ')}</p>
        <p><span class="label">Hashtags:</span> ${project.seo.hashtags.join(' ')}</p>
        <p><span class="label">Pinned Comment:</span> "${project.seo.pinnedComment}"</p>

        <script>
          setTimeout(() => { window.print(); }, 400);
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}


/**
 * Downloads full YouTube production package as a Markdown (.md) file
 */
export function downloadMarkdown(project: YouTubeProject): void {
  const content = generateMarkdownContent(project);
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${slugify(project.title)}-production-package.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads full YouTube production package as a TXT file
 */
export function downloadTxt(project: YouTubeProject): void {
  const content = generatePlainTxtContent(project);
  const blob = new Blob([textToCleanString(content)], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${slugify(project.title)}-production-package.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads voiceover narration only as a clean TXT file for ElevenLabs / Voice Actors
 */
export function downloadVoiceoverScriptTxt(project: YouTubeProject): void {
  const text = project.completeScript.fullFormattedText || project.completeScript.hook + '\n\n' + project.completeScript.intro;
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${slugify(project.title)}-voiceover-narration.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads native Microsoft Word (.docx) production plan document
 */
export async function downloadDocx(project: YouTubeProject): Promise<void> {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: project.title,
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Niche: ${project.niche} | Video Type: ${project.videoType} | Duration: ${project.durationLabel} | Tone: ${project.styleTone}`,
                size: 18,
                color: '64748B',
                italics: true,
              }),
            ],
            spacing: { after: 300 },
          }),

          // Hook Section
          new Paragraph({ text: '1. Retention Hook', heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 120 } }),
          new Paragraph({
            children: [new TextRun({ text: project.hook.text, size: 22, bold: true })],
            spacing: { after: 200 },
          }),

          // Full Script
          new Paragraph({ text: '2. Complete Voiceover Script', heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 120 } }),
          ...project.completeScript.fullFormattedText.split('\n').map(
            (line) =>
              new Paragraph({
                children: [new TextRun({ text: line, size: 22 })],
                spacing: { after: 100 },
              })
          ),

          // Scene-by-Scene Plan
          new Paragraph({ text: '3. Scene-by-Scene Video Production Plan', heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 120 } }),
          ...project.scenes.flatMap((scene) => [
            new Paragraph({
              children: [
                new TextRun({ text: `${scene.sceneNumber} (${scene.timestamp})`, bold: true, size: 22 }),
              ],
              spacing: { before: 180, after: 60 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Narration: ', bold: true }),
                new TextRun({ text: scene.narration }),
              ],
              spacing: { after: 40 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Visual: ', bold: true }),
                new TextRun({ text: scene.visualDescription }),
              ],
              spacing: { after: 40 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Camera: ', bold: true }),
                new TextRun({ text: `${scene.cameraShot} - ${scene.cameraMovement}` }),
              ],
              spacing: { after: 40 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Image Prompt: ', bold: true }),
                new TextRun({ text: scene.imagePrompt, italics: true }),
              ],
              spacing: { after: 40 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Video Prompt: ', bold: true }),
                new TextRun({ text: scene.videoPromptImageToVideo, italics: true }),
              ],
              spacing: { after: 120 },
            }),
          ]),

          // SEO Section
          new Paragraph({ text: '4. YouTube SEO Metadata', heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 120 } }),
          new Paragraph({ children: [new TextRun({ text: 'Main Title: ', bold: true }), new TextRun({ text: project.seo.mainTitle })] }),
          new Paragraph({ children: [new TextRun({ text: 'Description:', bold: true })], spacing: { before: 100 } }),
          ...project.seo.description.split('\n').map(
            (line) => new Paragraph({ children: [new TextRun({ text: line, size: 20 })], spacing: { after: 60 } })
          ),
          new Paragraph({ children: [new TextRun({ text: 'Keywords: ', bold: true }), new TextRun({ text: project.seo.keywords.join(', ') })], spacing: { before: 100 } }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${slugify(project.title)}-production-plan.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Triggers clean printable PDF export via browser window print stylesheet
 */
export function printPdf(project: YouTubeProject): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${project.title} - Production Package</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #1e293b; padding: 40px; max-width: 900px; margin: 0 auto; }
          h1 { color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; font-size: 24px; }
          h2 { color: #2563eb; margin-top: 28px; font-size: 18px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }
          .meta { font-size: 13px; color: #64748b; background: #f8fafc; padding: 12px; border-radius: 6px; margin-bottom: 24px; }
          .scene-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 16px; page-break-inside: avoid; }
          .scene-title { font-weight: bold; color: #1e293b; font-size: 15px; margin-bottom: 6px; }
          .label { font-weight: 600; color: #475569; }
          .prompt-box { background: #0f172a; color: #38bdf8; padding: 8px 12px; border-radius: 4px; font-family: monospace; font-size: 11px; margin-top: 6px; white-space: pre-wrap; }
          @media print {
            body { padding: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <button onclick="window.print()" style="background:#2563eb;color:white;padding:10px 18px;border:none;border-radius:6px;cursor:pointer;font-weight:600;margin-bottom:20px;">Print / Save as PDF</button>
        <h1>${project.title}</h1>
        <div class="meta">
          <strong>Niche:</strong> ${project.niche} | <strong>Type:</strong> ${project.videoType} | <strong>Duration:</strong> ${project.durationLabel} | <strong>Tone:</strong> ${project.styleTone} | <strong>Mode:</strong> ${project.isFacelessMode ? 'Faceless' : 'Presenter'}
        </div>

        <h2>1. Retention Hook</h2>
        <p style="font-size:16px;font-weight:bold;color:#1e293b;background:#eff6ff;padding:12px;border-left:4px solid #2563eb;">"${project.hook.text}"</p>

        <h2>2. Complete Voiceover Script</h2>
        <div style="white-space: pre-wrap; font-size:14px; background:#fafafa; padding:16px; border-radius:6px;">${project.completeScript.fullFormattedText}</div>

        <h2>3. Scene-by-Scene Video Production Plan</h2>
        ${project.scenes
          .map(
            (scene) => `
          <div class="scene-card">
            <div class="scene-title">${scene.sceneNumber} (${scene.timestamp})</div>
            <p><span class="label">Narration:</span> "${scene.narration}"</p>
            <p><span class="label">Visual:</span> ${scene.visualDescription}</p>
            <p><span class="label">Camera:</span> ${scene.cameraShot} | ${scene.cameraMovement}</p>
            <p><span class="label">Environment:</span> ${scene.environment}</p>
            <div><span class="label">Image Prompt:</span><div class="prompt-box">${scene.imagePrompt}</div></div>
            <div><span class="label">Video Prompt:</span><div class="prompt-box">${scene.videoPromptImageToVideo}</div></div>
          </div>
        `
          )
          .join('')}

        <h2>4. YouTube SEO & Description</h2>
        <p><span class="label">Main Title:</span> ${project.seo.mainTitle}</p>
        <p><span class="label">Description:</span></p>
        <pre style="background:#f1f5f9;padding:12px;border-radius:6px;font-family:inherit;font-size:12px;white-space:pre-wrap;">${project.seo.description}</pre>
        <p><span class="label">Tags:</span> ${project.seo.tags.join(', ')}</p>

        <script>
          setTimeout(() => { window.print(); }, 500);
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

/**
 * Helper to generate Markdown string
 */
export function generateMarkdownContent(project: YouTubeProject): string {
  return `# ${project.title}

> **Niche:** ${project.niche} | **Video Type:** ${project.videoType} | **Duration:** ${project.durationLabel} | **Tone:** ${project.styleTone}

---

## 1. Retention Hook
> "${project.hook.text}"
*Hook Strategy:* ${project.hook.retentionHookReason}

---

## 2. Complete Voiceover Script
\`\`\`
${project.completeScript.fullFormattedText}
\`\`\`

---

## 3. Characters
${project.characters
  .map(
    (c) => `### ${c.name} (${c.role})
- **Age/Gender:** ${c.age}, ${c.gender}
- **Appearance:** ${c.appearance}
- **Clothing:** ${c.clothing}
- **Personality:** ${c.personality}
- **Voice:** ${c.voice}`
  )
  .join('\n\n')}

---

## 4. Scene-by-Scene Video Production Plan

${project.scenes
  .map(
    (s) => `### ${s.sceneNumber} (${s.timestamp})
- **Narration:** "${s.narration}"
- **Visual Description:** ${s.visualDescription}
- **Camera Shot & Motion:** ${s.cameraShot} - ${s.cameraMovement}
- **Environment:** ${s.environment}
${s.onScreenText ? `- **On-Screen Text:** ${s.onScreenText}\n` : ''}${s.soundEffects ? `- **Sound Effects:** ${s.soundEffects}\n` : ''}${s.musicDirection ? `- **Music Direction:** ${s.musicDirection}\n` : ''}

**IMAGE PROMPT:**
\`\`\`
${s.imagePrompt}
\`\`\`

**IMAGE-TO-VIDEO PROMPT:**
\`\`\`
${s.videoPromptImageToVideo}
\`\`\`

**TEXT-TO-VIDEO PROMPT:**
\`\`\`
${s.videoPromptTextToVideo}
\`\`\`
`
  )
  .join('\n---\n\n')}

---

## 5. B-Roll Recommendations
${project.bRollSections
  .map(
    (b) => `### B-Roll for ${b.sceneNumber}
- **Description:** ${b.description}
- **Search Keywords:** ${b.searchKeywords.join(', ')}
- **AI Prompt:** ${b.aiImagePrompt}`
  )
  .join('\n\n')}

---

## 6. YouTube SEO Metadata
- **Main Title:** ${project.seo.mainTitle}
- **Alternative Titles:**
${project.seo.alternativeTitles.map((t) => `  - ${t}`).join('\n')}
- **SEO Score:** ${project.seo.seoScore}/100

### Video Description
\`\`\`
${project.seo.description}
\`\`\`

- **Keywords:** ${project.seo.keywords.join(', ')}
- **Tags:** ${project.seo.tags.join(', ')}
- **Hashtags:** ${project.seo.hashtags.join(' ')}
- **Pinned Comment Draft:** "${project.seo.pinnedComment}"

---

## 7. Thumbnail Concepts
${project.thumbnails
  .map(
    (t) => `### Concept #${t.conceptNumber}: ${t.title}
- **Text Overlay:** "${t.textOverlay}"
- **Composition:** ${t.visualComposition}
- **Colors:** ${t.colorDirection}
- **AI Thumbnail Prompt:**
\`\`\`
${t.aiPrompt}
\`\`\`
`
  )
  .join('\n')}
`;
}

/**
 * Helper to generate Plain Text string
 */
function generatePlainTxtContent(project: YouTubeProject): string {
  return generateMarkdownContent(project).replace(/#/g, '').replace(/```/g, '');
}

function textToCleanString(str: string): string {
  return str.replace(/\r\n/g, '\n');
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
}
