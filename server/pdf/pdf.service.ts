import puppeteer from 'puppeteer';
import { Test, Question } from '@shared/schema';

interface PDFGenerationOptions {
  includeHeader: boolean;
  includeInstructions: boolean;
  showMarks: boolean;
  includeAnswers: boolean;
  teacherName: string;
  institutionName: string;
}

export async function generatePdf(test: Test, options: PDFGenerationOptions): Promise<Buffer> {
  // Launch a headless browser
  const browser = await puppeteer.launch({
    headless: true, // Use boolean true instead of "new" string
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Generate HTML content for the PDF
  const htmlContent = generateHtmlContent(test, options);
  
  // Set content to the page
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  
  // Generate PDF
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: {
      top: '1cm',
      right: '1cm',
      bottom: '1cm',
      left: '1cm'
    }
  }) as unknown as Buffer; // Type assertion to Buffer
  
  // Close the browser
  await browser.close();
  
  return pdfBuffer;
}

function generateHtmlContent(test: Test, options: PDFGenerationOptions): string {
  // Base styles
  const styles = `
    <style>
      body {
        font-family: 'Arial', sans-serif;
        font-size: 12px;
        line-height: 1.5;
        color: #333;
        padding: 0;
        margin: 0;
      }
      
      .container {
        padding: 10px;
      }
      
      .header {
        text-align: center;
        margin-bottom: 20px;
        border-bottom: 1px solid #ddd;
        padding-bottom: 10px;
      }
      
      .header h1 {
        font-size: 18px;
        margin: 5px 0;
      }
      
      .header h2 {
        font-size: 16px;
        margin: 5px 0;
      }
      
      .meta {
        font-size: 12px;
        margin-top: 10px;
      }
      
      .instructions {
        margin-bottom: 20px;
        padding: 10px;
        background-color: #f9f9f9;
        border: 1px solid #eee;
      }
      
      .instructions ul {
        margin: 5px 0;
        padding-left: 20px;
      }
      
      .question {
        margin-bottom: 15px;
      }
      
      .question-header {
        display: flex;
        justify-content: space-between;
      }
      
      .question-number {
        font-weight: bold;
      }
      
      .question-marks {
        font-style: italic;
      }
      
      .answer-key {
        margin-top: 20px;
        padding-top: 10px;
        border-top: 1px solid #ddd;
      }
      
      .answer-key h3 {
        font-size: 14px;
        margin-bottom: 10px;
      }
    </style>
  `;
  
  // Start building HTML
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${test.title}</title>
      ${styles}
    </head>
    <body>
      <div class="container">
  `;
  
  // Header section
  if (options.includeHeader) {
    html += `
      <div class="header">
        <h1>${options.institutionName || 'School Name'}</h1>
        <h2>${test.title}</h2>
        <div class="meta">
          <div>Subject: ${test.subject}</div>
          ${test.chapter ? `<div>Chapter: ${test.chapter}</div>` : ''}
          ${test.duration ? `<div>Duration: ${test.duration} minutes</div>` : ''}
          ${test.totalMarks ? `<div>Total Marks: ${test.totalMarks}</div>` : ''}
          <div>Teacher: ${options.teacherName}</div>
        </div>
      </div>
    `;
  }
  
  // Instructions section
  if (options.includeInstructions) {
    html += `
      <div class="instructions">
        <h3>Instructions:</h3>
        <ul>
          <li>All questions are compulsory.</li>
          <li>Write your answers clearly and legibly.</li>
          ${options.showMarks ? '<li>Marks are indicated against each question.</li>' : ''}
          <li>Do not use calculators or mobile phones during the test.</li>
        </ul>
      </div>
    `;
  }
  
  // Questions section
  const questions = test.questionsList || [];
  if (questions && Array.isArray(questions) && questions.length > 0) {
    html += `<div class="questions">`;
    
    questions.forEach((question: Question, index: number) => {
      html += `
        <div class="question">
          <div class="question-header">
            <span class="question-number">Q${index + 1}.</span>
            ${options.showMarks ? `<span class="question-marks">(${question.marks} marks)</span>` : ''}
          </div>
          <div class="question-text">${question.questionText}</div>
          
          ${generateQuestionContent(question)}
        </div>
      `;
    });
    
    html += `</div>`;
  }
  
  // Answer key section
  if (options.includeAnswers && questions && Array.isArray(questions)) {
    html += `
      <div class="answer-key">
        <h3>Answer Key:</h3>
        <ol>
    `;
    
    questions.forEach((question: Question) => {
      let answerText = '';
      
      if (question.type === 'mcq' && question.options && question.answer) {
        const optionIndex = question.options.indexOf(question.answer);
        const optionLetter = String.fromCharCode(65 + optionIndex);
        answerText = `Option ${optionLetter}: ${question.answer}`;
      } else {
        answerText = question.answer || 'N/A';
      }
      
      html += `<li>${answerText}</li>`;
      
      if (question.explanation) {
        html += `<p><em>Explanation: ${question.explanation}</em></p>`;
      }
    });
    
    html += `
        </ol>
      </div>
    `;
  }
  
  // Close tags
  html += `
      </div>
    </body>
    </html>
  `;
  
  return html;
}

function generateQuestionContent(question: Question): string {
  let content = '';
  
  // For multiple choice questions
  if (question.type === 'mcq' && question.options && Array.isArray(question.options)) {
    content += '<div class="options">';
    
    question.options.forEach((option: string, i: number) => {
      const optionLetter = String.fromCharCode(65 + i);
      content += `
        <div class="option">
          ${optionLetter}) ${option}
        </div>
      `;
    });
    
    content += '</div>';
  } 
  // For short/long answer questions
  else {
    const lines = question.type === 'short_answer' ? 3 : 8;
    content += `<div class="answer-space" style="margin-top: 10px;">`;
    
    for (let i = 0; i < lines; i++) {
      content += `<div style="margin: 10px 0; border-bottom: 1px solid #ccc; height: 1.2em;"></div>`;
    }
    
    content += `</div>`;
  }
  
  return content;
}