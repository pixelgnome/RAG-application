import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// Helper to convert File to a base64 string and format it for the Gemini API
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    // The result includes the Base64 prefix `data:;base64,`, which we need to remove.
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};


export const generateAnswer = async (query: string, context: string): Promise<string> => {
  try {
    const prompt = `
      You are a helpful Q&A assistant. Your task is to answer the user's question based ONLY on the provided context.
      - The context contains several documents, which could be FAQs or content from PDFs.
      - FAQs are formatted with "Ques:" for the question and "Ans:" for the answer.
      - Read the context carefully to find the relevant information.
      - If the answer is available in the context, provide a clear and concise answer based on that information.
      - If the context does not contain information relevant to the question, you MUST respond with: "I cannot find an answer in the provided documents."
      - Do not use any external knowledge or information you have outside of the provided context.

      CONTEXT:
      ---
      ${context}
      ---

      QUESTION: ${query}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error generating answer:", error);
    return "An error occurred while communicating with the AI. Please check the console for details.";
  }
};

export const extractPdfContent = async (file: File): Promise<string> => {
  try {
    if (file.type !== 'application/pdf') {
        return `Error: Unsupported file type. Please upload a PDF file.`;
    }

    const pdfPart = await fileToGenerativePart(file);
    const textPart = { text: "Extract all text content from this PDF document. Present it clearly. If the document is an image-based PDF, perform OCR to extract the text." };
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [pdfPart, textPart] },
    });
    
    return response.text;
  } catch (error) {
    console.error("Error extracting PDF content:", error);
    return `An error occurred while extracting content from ${file.name}. The file might be corrupted, too complex, or an unsupported format.`;
  }
};