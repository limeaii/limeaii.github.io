import { GoogleGenAI, Modality, Content } from "@google/genai";

const API_KEY = "AIzaSyBAnKFv0b874M5ofplpPMDLWWPSGdt4Kjg";

const getGenAIClient = () => {
  return new GoogleGenAI({ apiKey: API_KEY });
};

export const generateAnswer = async (prompt: string, history: Content[]) => {
  try {
    const ai = getGenAIClient();
    
    // Combine the previous chat history with the new user prompt
    const contents: Content[] = [...history, { role: 'user', parts: [{ text: prompt }] }];

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error generating answer:", error);
    return "Sorry, I couldn't process that request. Please try again.";
  }
};

export const generateImage = async (prompt: string): Promise<string | null> => {
  try {
    const ai = getGenAIClient();
    // Use the modern generateContent API for image generation with the gemini-2.5-flash-image model.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: prompt,
          },
        ],
      },
      config: {
          responseModalities: [Modality.IMAGE],
      },
    });

    // Extract the base64 image data from the response.
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64ImageBytes: string = part.inlineData.data;
          return `data:image/png;base64,${base64ImageBytes}`;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
};