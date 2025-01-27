import path from "path";
import puppeteer from "puppeteer";
import os from "os";



// Function to render the form as a PDF
export const renderFormToPDF = async (htmlContent: string): Promise<string> => {
  try {

    const baseDir = os.tmpdir();
    const outputFile = path.join(baseDir, "compliance_form.pdf");
    console.log("Launching Puppeteer...");
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    console.log("Setting content...");
    await page.setContent(htmlContent, { waitUntil: "load" });

    console.log("Generating PDF...");
    await page.pdf({
      path: outputFile,
      format: "A4",
      printBackground: true, // Ensures background colors and images are included
    });

    console.log(`PDF generated successfully: ${outputFile}`);
    await browser.close();

    return outputFile;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};

