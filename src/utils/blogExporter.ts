import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType } from 'docx';
import { BlogArticle } from '../types/blog';

/**
 * Downloads article as a styled native Microsoft Word (.docx) document
 */
export async function downloadBlogDocx(blog: BlogArticle): Promise<void> {
  // Simple HTML parser to Word docx paragraphs
  const tempContainer = document.createElement('div');
  tempContainer.innerHTML = blog.contentHtml;

  const docChildren: any[] = [
    // Title
    new Paragraph({
      text: blog.title,
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 200 },
    }),

    // Meta Info
    new Paragraph({
      children: [
        new TextRun({ text: `Author: ${blog.author.name} | Read Time: ${blog.readTimeMinutes} min | Words: ${blog.wordCount}`, size: 18, color: '64748B', italics: true }),
      ],
      spacing: { after: 300 },
    }),
  ];

  // Process child elements
  Array.from(tempContainer.children).forEach((el) => {
    const tagName = el.tagName.toLowerCase();
    const textContent = el.textContent?.trim() || '';

    if (!textContent && tagName !== 'hr') return;

    if (tagName === 'h2') {
      docChildren.push(
        new Paragraph({
          text: textContent,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 120 },
        })
      );
    } else if (tagName === 'h3') {
      docChildren.push(
        new Paragraph({
          text: textContent,
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 180, after: 80 },
        })
      );
    } else if (tagName === 'p') {
      docChildren.push(
        new Paragraph({
          children: [new TextRun({ text: textContent, size: 22 })],
          spacing: { after: 160, line: 276 },
        })
      );
    } else if (tagName === 'ul' || tagName === 'ol') {
      Array.from(el.children).forEach((liItem) => {
        docChildren.push(
          new Paragraph({
            children: [new TextRun({ text: `•  ${liItem.textContent}`, size: 22 })],
            spacing: { after: 80 },
          })
        );
      });
    } else if (tagName === 'hr') {
      docChildren.push(
        new Paragraph({
          children: [new TextRun({ text: '____________________________________________________', color: 'CBD5E1' })],
          spacing: { before: 200, after: 200 },
        })
      );
    }
  });

  // FAQs
  if (blog.faqs && blog.faqs.length > 0) {
    docChildren.push(
      new Paragraph({
        text: 'Frequently Asked Questions (FAQ)',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 160 },
      })
    );

    blog.faqs.forEach((faq) => {
      docChildren.push(
        new Paragraph({
          children: [new TextRun({ text: `Q: ${faq.question}`, bold: true, size: 22, color: '1E293B' })],
          spacing: { before: 120, after: 60 },
        })
      );
      docChildren.push(
        new Paragraph({
          children: [new TextRun({ text: faq.answer, size: 20, color: '334155' })],
          spacing: { after: 160 },
        })
      );
    });
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
          },
        },
        children: docChildren,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `${blog.slug || 'blog_article'}.docx`;

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
 * Downloads Markdown file (.md)
 */
export function downloadBlogMarkdown(blog: BlogArticle): void {
  const mdContent = `# ${blog.title}

> **Meta Description:** ${blog.seo.metaDescription}  
> **Primary Keyword:** ${blog.seo.primaryKeyword}  
> **Target Audience:** ${blog.settings.audience} | **Tone:** ${blog.settings.tone}

---

${htmlToMarkdown(blog.contentHtml)}

---

## Frequently Asked Questions

${blog.faqs.map((f) => `### Q: ${f.question}\n${f.answer}`).join('\n\n')}
`;

  const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${blog.slug || 'blog'}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Downloads standalone HTML file (.html)
 */
export function downloadBlogHtml(blog: BlogArticle): void {
  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(blog.seo.seoTitle || blog.title)}</title>
  <meta name="description" content="${escapeHtml(blog.seo.metaDescription)}">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.7; color: #1e293b; max-width: 800px; margin: 0 auto; padding: 2rem 1rem; }
    h1 { font-size: 2.25rem; font-weight: 800; color: #0f172a; margin-bottom: 0.5rem; }
    h2 { font-size: 1.5rem; font-weight: 700; color: #1e293b; margin-top: 2rem; margin-bottom: 1rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; }
    h3 { font-size: 1.25rem; font-weight: 600; color: #334155; margin-top: 1.5rem; }
    p { margin-bottom: 1.2rem; font-size: 1.05rem; }
    img { max-width: 100%; height: auto; border-radius: 0.75rem; margin: 1.5rem 0; }
    ul, ol { margin-bottom: 1.5rem; padding-left: 1.5rem; }
    li { margin-bottom: 0.5rem; }
    table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; }
    th, td { border: 1px solid #cbd5e1; padding: 0.75rem; text-align: left; }
    th { background-color: #f8fafc; font-weight: 600; }
    .featured-image { width: 100%; height: 380px; object-fit: cover; border-radius: 1rem; margin-bottom: 2rem; }
    .meta-bar { display: flex; gap: 1rem; color: #64748b; font-size: 0.875rem; margin-bottom: 2rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 1rem; }
    .faq-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1.25rem; margin-bottom: 1rem; }
    .faq-q { font-weight: 700; color: #0f172a; margin-bottom: 0.5rem; }
  </style>
</head>
<body>
  ${blog.featuredImage.url ? `<img src="${blog.featuredImage.url}" alt="${escapeHtml(blog.featuredImage.altText)}" class="featured-image" />` : ''}
  <h1>${escapeHtml(blog.title)}</h1>
  <div class="meta-bar">
    <span>By ${escapeHtml(blog.author.name)}</span>
    <span>•</span>
    <span>${blog.readTimeMinutes} min read</span>
    <span>•</span>
    <span>${blog.wordCount} words</span>
  </div>
  <article>
    ${blog.contentHtml}
  </article>

  ${
    blog.faqs && blog.faqs.length > 0
      ? `
  <h2>Frequently Asked Questions</h2>
  ${blog.faqs
    .map(
      (f) => `
    <div class="faq-box">
      <div class="faq-q">Q: ${escapeHtml(f.question)}</div>
      <div class="faq-a">${escapeHtml(f.answer)}</div>
    </div>
  `
    )
    .join('')}
  `
      : ''
  }
</body>
</html>`;

  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${blog.slug || 'blog'}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Copies article plain text / markdown
 */
export function copyBlogToClipboard(blog: BlogArticle): Promise<void> {
  const text = `${blog.title}\n\nMeta Description: ${blog.seo.metaDescription}\n\n${htmlToMarkdown(
    blog.contentHtml
  )}\n\nFAQ:\n${blog.faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n')}`;
  return navigator.clipboard.writeText(text);
}

/**
 * Prints blog article
 */
export function printBlogArticle(): void {
  window.print();
}

/**
 * Simple HTML to Markdown converter helper
 */
function htmlToMarkdown(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;

  let text = '';
  Array.from(div.children).forEach((child) => {
    const tag = child.tagName.toLowerCase();
    const content = child.textContent?.trim() || '';

    if (tag === 'h2') {
      text += `\n\n## ${content}\n\n`;
    } else if (tag === 'h3') {
      text += `\n\n### ${content}\n\n`;
    } else if (tag === 'p') {
      text += `${content}\n\n`;
    } else if (tag === 'ul' || tag === 'ol') {
      Array.from(child.children).forEach((li) => {
        text += `- ${li.textContent}\n`;
      });
      text += '\n';
    } else if (tag === 'hr') {
      text += `---\n\n`;
    } else {
      text += `${content}\n\n`;
    }
  });

  return text.trim();
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
