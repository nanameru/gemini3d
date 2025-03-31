"use client";

import { useState, useEffect } from "react";
// import Image from "next/image";
import FileUpload from "./components/ui/file-upload";
import ApiKeyInput from "./components/ui/api-key-input";
import Loading from "./components/ui/loading";
import ErrorMessage from "./components/ui/error-message";
import PhysicsScene from "./components/3d/physics-scene";
import type { PhysicsModelData } from "./components/3d/physics-scene";
import { initGemini, analyzeDiagram } from "./lib/gemini";
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function Home() {
  const [apiKey, setApiKey] = useState<string>("");
  const [genAI, setGenAI] = useState<GoogleGenerativeAI | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  // const [imageFile, setImageFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [modelData, setModelData] = useState<PhysicsModelData | null>(null);

  useEffect(() => {
    if (apiKey) {
      try {
        const genAIInstance = initGemini(apiKey);
        setGenAI(genAIInstance);
        setError(null);
      } catch (err) {
        setError("Failed to initialize Gemini API. Please check your API key.");
        console.error("Error initializing Gemini API:", err);
      }
    } else {
      setGenAI(null);
    }
  }, [apiKey]);

  const handleFileSelected = (file: File, base64: string) => {
    setSelectedImage(base64);
    setModelData(null);
    setError(null);
  };

  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
  };

  const handleAnalyze = async () => {
    if (!genAI || !selectedImage) {
      setError("Please provide both an API key and an image to analyze.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const data = await analyzeDiagram(genAI, selectedImage);
      setModelData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(`Error analyzing image: ${errorMessage}`);
      console.error("Error analyzing image:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUseSampleData = () => {
    const sampleData: PhysicsModelData = {
      "objects": [
        {
          "id": "lever",
          "type": "box",
          "position": [0, 0, 0],
          "rotation": [0, 0, 0],
          "scale": [4, 0.2, 0.5],
          "color": "#4287f5",
          "properties": {
            "mass": 1
          }
        },
        {
          "id": "fulcrum",
          "type": "cone",
          "position": [0, -0.5, 0],
          "rotation": [180, 0, 0],
          "scale": [0.5, 0.5, 0.5],
          "color": "#3a3a3a",
          "properties": {
            "mass": 5
          }
        },
        {
          "id": "weight",
          "type": "box",
          "position": [1.5, 0.5, 0],
          "rotation": [0, 0, 0],
          "scale": [0.8, 0.8, 0.8],
          "color": "#e84393",
          "properties": {
            "mass": 2
          }
        }
      ],
      "physics": {
        "type": "lever",
        "properties": {
          "fulcrum_position": [0, 0, 0]
        },
        "forces": [
          {
            "type": "gravity",
            "magnitude": 9.8,
            "direction": [0, -1, 0],
            "application_point": [0, 0, 0]
          },
          {
            "type": "applied",
            "magnitude": 5,
            "direction": [0, 1, 0],
            "application_point": [-1.5, 0, 0]
          }
        ]
      },
      "interactions": [
        {
          "type": "joint",
          "objects": ["lever", "fulcrum"],
          "properties": {
            "type": "pivot"
          }
        }
      ]
    };
    
    setModelData(sampleData);
    setError(null);
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <header className="max-w-6xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">3D Anything - Physics Visualizer</h1>
        <p className="text-center text-gray-600 dark:text-gray-400">
          Upload a physics diagram and see it come to life in 3D using Gemini 2.5 Pro
        </p>
      </header>

      <main className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column - Input */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">1. Enter API Key</h2>
              <ApiKeyInput onApiKeyChange={handleApiKeyChange} />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">2. Upload Physics Diagram</h2>
              <FileUpload onFileSelected={handleFileSelected} />
              
              {selectedImage && (
                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2">Selected Image:</h3>
                  <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <img
                      src={`data:image/png;base64,${selectedImage}`}
                      alt="Selected physics diagram"
                      className="object-contain w-full h-full"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">3. Generate 3D Model</h2>
              <div className="flex gap-4">
                <button
                  onClick={handleAnalyze}
                  disabled={!selectedImage || !apiKey || isAnalyzing}
                  className={`px-4 py-2 rounded-lg flex-1 ${
                    !selectedImage || !apiKey || isAnalyzing
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {isAnalyzing ? "Analyzing..." : "Analyze with Gemini"}
                </button>
                
                <button
                  onClick={handleUseSampleData}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex-1"
                >
                  Use Sample Data
                </button>
              </div>
              
              {error && (
                <div className="mt-4">
                  <ErrorMessage message={error} onRetry={handleAnalyze} />
                </div>
              )}
            </div>
          </div>

          {/* Right column - Output */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 min-h-[500px]">
            <h2 className="text-xl font-semibold mb-4">3D Physics Model</h2>
            
            {isAnalyzing ? (
              <Loading />
            ) : modelData ? (
              <div>
                <PhysicsScene modelData={modelData} />
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Physics Properties</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Type: {modelData.physics.type}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Objects: {modelData.objects.length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    <strong>Tip:</strong> Use mouse to rotate, scroll to zoom, and right-click to pan.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-center">
                <svg
                  className="w-16 h-16 mb-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"
                  ></path>
                </svg>
                <h3 className="text-lg font-medium">No 3D Model Yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md">
                  Upload a physics diagram and click &quot;Analyze with Gemini&quot; to generate a 3D model, or click &quot;Use Sample Data&quot; to see an example.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="max-w-6xl mx-auto mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>
          Built with Next.js, Three.js, and Gemini 2.5 Pro
        </p>
      </footer>
    </div>
  );
}
