#!/usr/bin/env ts-node
import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";

// HTML content for the form
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NGO Compliance Form</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
      line-height: 1.6;
      color: #333;
    }
    form {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      border: 1px solid #ccc;
      border-radius: 10px;
      background-color: #f9f9f9;
    }
    label {
      font-weight: bold;
      display: block;
      margin-top: 20px;
    }
    select, textarea {
      width: 100%;
      padding: 10px;
      margin-top: 5px;
      border: 1px solid #ccc;
      border-radius: 5px;
    }
    textarea {
      resize: vertical;
    }
    button {
      display: block;
      margin: 20px auto;
      padding: 10px 20px;
      background-color: #007BFF;
      color: white;
      border: none;
      border-radius: 5px;
      font-size: 16px;
      cursor: pointer;
    }
    button:hover {
      background-color: #0056b3;
    }
  </style>
</head>
<body>
  <form>
    <!-- Financial Reporting -->
    <label for="financial-reporting">Have the quarterly financial reports been submitted?</label>
    <select id="financial-reporting" name="financial-reporting">
      <option value="yes">Yes</option>
      <option value="no">No</option>
    </select>

    <label for="annual-financial-statement">Has the annual audited financial statement been provided?</label>
    <select id="annual-financial-statement" name="annual-financial-statement">
      <option value="yes">Yes</option>
      <option value="no">No</option>
    </select>

    <!-- Project Timelines -->
    <label for="project-timeline">Is the project on track according to the agreed timeline?</label>
    <select id="project-timeline" name="project-timeline">
      <option value="yes">Yes</option>
      <option value="no">No</option>
    </select>

    <label for="milestones">Please describe any milestones achieved:</label>
    <textarea id="milestones" name="milestones" rows="4" cols="50"></textarea>

    <!-- Outcome Measurements -->
    <label for="outcome-measurements">Have the outcome measurements been met?</label>
    <select id="outcome-measurements" name="outcome-measurements">
      <option value="yes">Yes</option>
      <option value="no">No</option>
    </select>

    <label for="outcome-details">Details on outcome results:</label>
    <textarea id="outcome-details" name="outcome-details" rows="4" cols="50"></textarea>

    <!-- Compliance with Donor Policy -->
    <label for="compliance-policy">Is the NGO compliant with the donor's policy?</label>
    <select id="compliance-policy" name="compliance-policy">
      <option value="yes">Yes</option>
      <option value="no">No</option>
    </select>

    <!-- Ethical Conduct -->
    <label for="ethical-conduct">Any issues related to ethical conduct (conflicts of interest, bribery, etc.)?</label>
    <select id="ethical-conduct" name="ethical-conduct">
      <option value="yes">Yes</option>
      <option value="no">No</option>
    </select>

    <label for="ethical-details">If yes, please provide details:</label>
    <textarea id="ethical-details" name="ethical-details" rows="4" cols="50"></textarea>

    <!-- Audit Rights -->
    <label for="audit-cooperation">Is the NGO prepared for an audit if requested?</label>
    <select id="audit-cooperation" name="audit-cooperation">
      <option value="yes">Yes</option>
      <option value="no">No</option>
    </select>

    <!-- Submit Button -->
    <button type="submit">Submit</button>
  </form>
</body>
</html>
`;

// Function to render the form as a PDF
const renderFormToPDF = async (outputFile: string): Promise<void> => {
  try {
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
  } catch (error) {
    console.error("Error generating PDF:", error);
  }
};

renderFormToPDF("./app/dash/[accountId]/documents/ngo_compliance_form.pdf")
export { renderFormToPDF };
