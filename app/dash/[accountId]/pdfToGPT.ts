#!/usr/bin/env bun
// Optional shebang for running directly with Bun

import fs from 'node:fs';
import path from 'node:path';
import pdfPoppler from 'pdf-poppler';
import OpenAI from 'openai';

async function convertPdfToImages(pdfPath: string, outputDir: string): Promise<string[]> {
  const options = {
    format: 'png',
    out_dir: outputDir,
    out_prefix: 'page',
    page: null, // Convert all pages
  };

  console.log(`Converting PDF to images...`);
  await pdfPoppler.convert(pdfPath, options);

  // Read generated PNG files from the output directory
  const files = fs
    .readdirSync(outputDir)
    .filter((file) => file.endsWith('.png'))
    .sort(); // Ensure the files are in page order

  if (!files.length) {
    throw new Error('No images were generated from the PDF.');
  }

  console.log(`Converted PDF into ${files.length} page(s).`);
  return files.map((file) => path.join(outputDir, file));
}

async function analyzePdfForCompliance() {
  try {
    // 1) Ensure we have an OpenAI API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('Missing OPENAI_API_KEY in environment variables.');
    }

    // 2) Locate the PDF "sample_contract.pdf"
    const pdfPath = path.join(process.cwd(), 'app', 'dash', '[accountId]', 'documents', 'sample_contract.pdf');
    if (!fs.existsSync(pdfPath)) {
      throw new Error(`Could not find PDF at path: ${pdfPath}`);
    }

    // 3) Convert PDF to images
    const outputDir = path.join(process.cwd(), 'temp_images');
    fs.mkdirSync(outputDir, { recursive: true });
    const imagePaths = await convertPdfToImages(pdfPath, outputDir);

    // 4) Encode images as Base64
    const base64Images = imagePaths.map((imagePath) => {
      const imageData = fs.readFileSync(imagePath);
      return `data:image/png;base64,${imageData.toString('base64')}`;
    });

    // 5) Build the messages array for the Vision-like request
    const imagePrompts = base64Images.map((base64Image) => ({
      type: 'image_url',
      image_url: {
        url: base64Image,
        detail: 'high',
      },
    }));

    const textPrompt = {
      type: 'text',
      text: `
Given a contract signed between an NGO and a donor, we have compliance clauses mentioned in the PDF.
I want to create a form asking the NGO Compliance Officer for updates on those clauses.
You must come up with the form fields, specifying the HTML input types (like <select>, <input type="checkbox">, <textarea>, etc.) that I can render in a front-end.
Focus on typical compliance questions (financial reporting, project timelines, outcome measurements, etc.) that might appear in a contract.
`,
    };

    // 6) Initialize OpenAI with your API key
    const openai = new OpenAI({
      apiKey,
    });

    // 7) Send the request to OpenAI
    console.log('Sending request to ChatGPT...');
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // Adjust model name if necessary
      messages: [
        {
          role: 'user',
          content: [
            textPrompt,
            ...imagePrompts,
          ],
        },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    });

    // 8) Output the AI's response
    const msg = response.choices[0]?.message?.content;
    console.log('--- ChatGPT Response ---');
    if (!msg) {
      console.error('No content in response!', response);
      return;
    }
    console.log(msg);
  } catch (err) {
    console.error('Error analyzing PDF with ChatGPT:', err);
  }
}

analyzePdfForCompliance();
// Export for potential import in other scripts
export { analyzePdfForCompliance };
