// import React, { useState, ChangeEvent } from "react";
// import OpenAI from "openai";
// import * as pdfjsLib from 'pdfjs-dist';
// import 'pdfjs-dist/build/pdf.worker.entry';

// pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// interface FormField {
//   label: string;
//   name: string;
//   type: string;
//   placeholder?: string;
//   options?: string[];
// }

// const App: React.FC = () => {
//   const [formData, setFormData] = useState<Record<string, any>>({});
//   const [formFields, setFormFields] = useState<FormField[]>([]);
//   const [error, setError] = useState<string | null>(null);
//   const [contractText, setContractText] = useState<string>("");

//   const parsePDF = async (file: File): Promise<string> => {
//     try {
//       const fileReader = new FileReader();
//       return new Promise((resolve, reject) => {
//         fileReader.onload = async (e) => {
//           try {
//             const typedArray = new Uint8Array(e.target?.result as ArrayBuffer);
//             const pdf = await pdfjsLib.getDocument(typedArray).promise;
//             let fullText = '';

//             for (let i = 1; i <= pdf.numPages; i++) {
//               const page = await pdf.getPage(i);
//               const textContent = await page.getTextContent();
//               const pageText = textContent.items
//                 .map((item: any) => item.str)
//                 .join(' ');
//               fullText += pageText + '\n';
//             }

//             resolve(fullText);
//           } catch (error) {
//             reject(error);
//           }
//         };
//         fileReader.readAsArrayBuffer(file);
//       });
//     } catch (error) {
//       console.error("PDF parsing error:", error);
//       throw error;
//     }
//   };

//   const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       try {
//         const extractedText = await parsePDF(file);
//         setContractText(extractedText);
//       } catch (error) {
//         setError("Failed to parse PDF. Please try again.");
//       }
//     }
//   };

//   const fetchFormFields = async () => {
//     const openai = new OpenAI({
//       apiKey: process.env.REACT_APP_OPENAI_API_KEY,
//       dangerouslyAllowBrowser: true,
//     });

//     const prompt = `Imagine you are a meticulous Compliance Officer tasked with creating a standardized reporting template for a new organizational partnership. Analyze the provided contract text with the following objectives:

//     1. Identify key compliance requirements and reporting obligations
//     2. Extract stakeholder information without relying on specific company names
//     3. Determine critical verification points that ensure partnership integrity
//     4. Generate form fields that capture essential compliance data

//     Your form fields should:
//     - Be generic enough to work across different organizational contexts
//     - Focus on universal compliance principles
//     - Use clear, professional language
//     - Provide guidance through placeholders
//     - Offer flexibility for various partnership types

//     Create form fields as a JSON response, ensuring each field includes:
//     - A clear, descriptive label
//     - A unique field name
//     - Appropriate input type
//     - Helpful placeholder text
//     - Optional predefined options where relevant

//     Contract Text to Analyze:
//     ${contractText}`;

//     try {
//       setError(null);
//       const response = await openai.chat.completions.create({
//         model: "gpt-4o-mini",
//         messages: [{ role: "user", content: prompt }],
//         response_format: { type: "json_object" },
//       });

//       const fieldsText = response.choices[0].message.content;
//       const fields = JSON.parse(fieldsText || "[]");

//       if (Array.isArray(fields) && fields.every(field => field.label && field.name && field.type)) {
//         setFormFields(fields);
//       } else {
//         throw new Error("Invalid form fields format received from API.");
//       }
//     } catch (error) {
//       setError("Failed to generate form fields. Please try again.");
//       console.error("Error fetching form fields:", error);
//     }
//   };

//   const handleInputChange = (fieldName: string, value: any) => {
//     setFormData({
//       ...formData,
//       [fieldName]: value,
//     });
//   };

//   const handleSubmit = () => {
//     console.log("Submitted Compliance Data:", JSON.stringify(formData, null, 2));
//   };

//   return (
//     <div className="p-4 max-w-2xl mx-auto">
//       <h1 className="text-2xl font-bold mb-4 text-center">Universal Compliance Form Generator</h1>
      
//       <input 
//         type="file" 
//         accept=".pdf" 
//         onChange={handleFileUpload} 
//         className="w-full mb-4"
//       />
      
//       <textarea 
//         value={contractText}
//         onChange={(e) => setContractText(e.target.value)}
//         placeholder="PDF content will appear here or paste contract text..."
//         className="w-full h-40 border p-2 mb-4 rounded"
//       />

//       <button
//         onClick={fetchFormFields}
//         disabled={!contractText.trim()}
//         className="w-full mb-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition disabled:opacity-50"
//       >
//         Generate Compliance Fields
//       </button>

//       {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

//       <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
//         {formFields.map((field, index) => (
//           <div key={index} className="flex flex-col">
//             <label htmlFor={field.name} className="mb-2 font-semibold">
//               {field.label}
//             </label>
//             {field.type === "textarea" ? (
//               <textarea
//                 id={field.name}
//                 placeholder={field.placeholder}
//                 onChange={(e) => handleInputChange(field.name, e.target.value)}
//                 className="border p-2 rounded min-h-[100px]"
//               />
//             ) : field.type === "select" ? (
//               <select
//                 id={field.name}
//                 onChange={(e) => handleInputChange(field.name, e.target.value)}
//                 className="border p-2 rounded"
//               >
//                 {field.options?.map((option: string, optIndex: number) => (
//                   <option key={optIndex} value={option}>
//                     {option}
//                   </option>
//                 ))}
//               </select>
//             ) : (
//               <input
//                 type={field.type}
//                 id={field.name}
//                 placeholder={field.placeholder}
//                 onChange={(e) => handleInputChange(field.name, e.target.value)}
//                 className="border p-2 rounded"
//               />
//             )}
//           </div>
//         ))}

//         {formFields.length > 0 && (
//           <button
//             onClick={handleSubmit}
//             className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition"
//           >
//             Submit Compliance Report
//           </button>
//         )}
//       </form>
//     </div>
//   );
// };

// export default App;