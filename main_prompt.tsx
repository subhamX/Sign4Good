import React, { useState } from "react";
import OpenAI from "openai";

const App: React.FC = () => {
  const [formData, setFormData] = useState<any>({});
  const [formFields, setFormFields] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchFormFields = async () => {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });

    const prompt = `Analyze the following compliance clauses from a legal agreement and suggest form fields to gather updates from the NGO Compliance Officer.

        Compliance Clauses:
        1. Ongoing Compliance with Donor Policy: The Recipient will adhere to SWEET DREAMERS' Philanthropic Compliance Policies.
        2. Legal and Regulatory Adherence: The Recipient shall comply with all relevant laws concerning charitable donations.
        3. Ethical Conduct: Avoid conflicts of interest, bribery, or corruption. Promptly report misuse of funds.
        4. Audit Rights: The Donor reserves the right to audit the Recipient's use of funds.

        Your task:
        1. Extract key aspects of compliance from the clauses that require periodic updates or verification.
        2. Translate these aspects into form fields with appropriate HTML input types (e.g., \"text\", \"textarea\", \"select\", \"date\", etc.).
        3. Provide a JSON response with the following format:
        \`\`\`json
        [
            {
                "label": "Field Label",
                "name": "field_name",
                "type": "input_type",
                "placeholder": "Sample placeholder or guidance text",
                "options": ["Option1", "Option2"] // Only for dropdowns or radio buttons
            }
        ]
        \`\`\`

        Additional Requirements:
        1. Explain the reasoning for each form field and its input type.
        2. Ensure the fields are specific, clear, and practical for capturing compliance updates.
        3. Include examples or sample values in the placeholders for clarity.
        4. Think step-by-step, and output your reasoning along with the JSON.
        5. Keep the response concise and accurate.`;

    try {
      setError(null);
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });

      const fieldsText = response.choices[0].message.content;
      const fields = JSON.parse(fieldsText || "[]");

      if (Array.isArray(fields) && fields.every(field => field.label && field.name && field.type)) {
        setFormFields(fields);
      } else {
        throw new Error("Invalid form fields format received from API.");
      }
    } catch (error) {
      setError("Failed to generate form fields. Please try again.");
      console.error("Error fetching form fields:", error);
    }
  };

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData({
      ...formData,
      [fieldName]: value,
    });
  };

  const handleSubmit = () => {
    console.log("Submitted Data:", JSON.stringify(formData, null, 2));
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">NGO Compliance Form</h1>
      <button
        onClick={fetchFormFields}
        className="mb-4 bg-blue-500 text-white py-2 px-4 rounded"
      >
        Generate Form Fields
      </button>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        {formFields.map((field, index) => (
          <div key={index} className="flex flex-col">
            <label htmlFor={field.name} className="mb-2 font-semibold">
              {field.label}
            </label>
            {field.type === "textarea" ? (
              <textarea
                id={field.name}
                placeholder={field.placeholder}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                className="border p-2 rounded"
              />
            ) : field.type === "select" ? (
              <select
                id={field.name}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                className="border p-2 rounded"
              >
                {field.options?.map((option: string, optIndex: number) => (
                  <option key={optIndex} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                id={field.name}
                placeholder={field.placeholder}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                className="border p-2 rounded"
              />
            )}
          </div>
        ))}
        <button
          onClick={handleSubmit}
          className="bg-green-500 text-white py-2 px-4 rounded"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default App;