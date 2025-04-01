import { GoogleGenerativeAI } from "@google/generative-ai";

export const initGemini = (apiKey: string) => {
  return new GoogleGenerativeAI(apiKey);
};

export const analyzeDiagram = async (
  genAI: GoogleGenerativeAI,
  imageBase64: string
) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: "image/png",
      },
    };

    const prompt = `
      Analyze this physics diagram and provide detailed information for creating a 3D model:
      1. Identify all objects and their physical properties (size, shape, mass if indicated)
      2. Identify physical concepts shown (levers, forces, etc.)
      3. Provide exact measurements and positions for all objects
      4. Describe how objects interact with each other
      5. Format the response as a JSON object with the following structure:
      {
        "objects": [
          {
            "id": "unique_id",
            "type": "cube|sphere|cylinder|etc",
            "position": [x, y, z],
            "rotation": [x, y, z],
            "scale": [x, y, z],
            "color": "hexcolor",
            "properties": {
              "mass": number,
              "other_relevant_properties": values
            }
          }
        ],
        "physics": {
          "type": "lever|pendulum|etc",
          "properties": {
            "relevant_properties": values
          },
          "forces": [
            {
              "type": "gravity|applied|etc",
              "magnitude": number,
              "direction": [x, y, z],
              "application_point": [x, y, z]
            }
          ]
        },
        "interactions": [
          {
            "type": "collision|joint|etc",
            "objects": ["object_id1", "object_id2"],
            "properties": {
              "relevant_properties": values
            }
          }
        ]
      }
    `;

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error("No valid JSON found in response");
    } catch (error) {
      console.error("Error parsing JSON from Gemini response:", error);
      throw new Error("Failed to parse 3D model data from Gemini response");
    }
  } catch (error) {
    console.error("Error analyzing diagram with Gemini:", error);
    throw error;
  }
};
