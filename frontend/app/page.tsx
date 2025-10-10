'use client';

import React, { useState, useRef, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const BacterialClassificationApp = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [predictionResult, setPredictionResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confidenceData, setConfidenceData] = useState<any[]>([]);
  const [classificationHistory, setClassificationHistory] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedImage(event.target.result as string);
          setPredictionResult(null);
          setError(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClassify = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Convert data URL to blob
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      const file = new File([blob], 'bacteria-image.jpg', { type: 'image/jpeg' });

      // Create form data
      const formData = new FormData();
      formData.append('file', file);

      // Make API call to backend
      const apiResponse = await fetch('/api/classify', {
        method: 'POST',
        body: formData,
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        throw new Error(errorData.error || 'Failed to classify image');
      }

      const result = await apiResponse.json();
      
      // Check if there was an error in the classification
      if (result.error) {
        throw new Error(result.error);
      }

      setPredictionResult(result);
      
      // Prepare data for charts
      const chartData = result.all_predictions.map((pred: any) => ({
        name: pred.class.replace(/_/g, ' '),
        confidence: pred.confidence * 100
      }));
      setConfidenceData(chartData);
      
      // Add to history
      const newHistoryItem = {
        id: Date.now(),
        image: selectedImage,
        result: result,
        timestamp: new Date().toLocaleString()
      };
      
      setClassificationHistory(prev => [newHistoryItem, ...prev.slice(0, 4)]); // Keep last 5 items
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to classify image. Please try again.');
      console.error('Classification error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setSelectedImage(event.target.result as string);
            setPredictionResult(null);
            setError(null);
          }
        };
        reader.readAsDataURL(file);
      } else {
        setError('Please drop an image file');
      }
    }
  };

  const getBacterialInfo = (className: string) => {
    const infoMap: Record<string, string> = {
      'G001': 'Class G001 - A bacterial species from your EMDS7 dataset',
      'G002': 'Class G002 - A bacterial species from your EMDS7 dataset',
      'G003': 'Class G003 - A bacterial species from your EMDS7 dataset',
      'G004': 'Class G004 - A bacterial species from your EMDS7 dataset',
      'G005': 'Class G005 - A bacterial species from your EMDS7 dataset',
      'G006': 'Class G006 - A bacterial species from your EMDS7 dataset',
      'G007': 'Class G007 - A bacterial species from your EMDS7 dataset',
      'G008': 'Class G008 - A bacterial species from your EMDS7 dataset',
      'G009': 'Class G009 - A bacterial species from your EMDS7 dataset',
      'G010': 'Class G010 - A bacterial species from your EMDS7 dataset',
      'G011': 'Class G011 - A bacterial species from your EMDS7 dataset',
      'G012': 'Class G012 - A bacterial species from your EMDS7 dataset',
      'G013': 'Class G013 - A bacterial species from your EMDS7 dataset',
      'G014': 'Class G014 - A bacterial species from your EMDS7 dataset',
      'G015': 'Class G015 - A bacterial species from your EMDS7 dataset',
      'G016': 'Class G016 - A bacterial species from your EMDS7 dataset',
      'G017': 'Class G017 - A bacterial species from your EMDS7 dataset',
      'G018': 'Class G018 - A bacterial species from your EMDS7 dataset',
      'G019': 'Class G019 - A bacterial species from your EMDS7 dataset',
      'G020': 'Class G020 - A bacterial species from your EMDS7 dataset',
      'G021': 'Class G021 - A bacterial species from your EMDS7 dataset',
      'G022': 'Class G022 - A bacterial species from your EMDS7 dataset',
      'G023': 'Class G023 - A bacterial species from your EMDS7 dataset',
      'G024': 'Class G024 - A bacterial species from your EMDS7 dataset',
      'G025': 'Class G025 - A bacterial species from your EMDS7 dataset',
      'G026': 'Class G026 - A bacterial species from your EMDS7 dataset',
      'G027': 'Class G027 - A bacterial species from your EMDS7 dataset',
      'G028': 'Class G028 - A bacterial species from your EMDS7 dataset',
      'G029': 'Class G029 - A bacterial species from your EMDS7 dataset',
      'G030': 'Class G030 - A bacterial species from your EMDS7 dataset',
      'G031': 'Class G031 - A bacterial species from your EMDS7 dataset',
      'G032': 'Class G032 - A bacterial species from your EMDS7 dataset',
      'G033': 'Class G033 - A bacterial species from your EMDS7 dataset',
      'G034': 'Class G034 - A bacterial species from your EMDS7 dataset',
      'G035': 'Class G035 - A bacterial species from your EMDS7 dataset',
      'G036': 'Class G036 - A bacterial species from your EMDS7 dataset',
    };
    
    return infoMap[className] || `Class ${className} - Information about this bacterial class from your EMDS7 dataset`;
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Bacterial Image Classification
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Upload an image of bacterial samples and our AI model will classify the bacterial species with confidence scores and detailed analysis.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Image Upload and Results */}
          <div className="space-y-8">
            {/* Image Upload Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Upload Image</h2>
              
              <div 
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  selectedImage ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-blue-500'
                }`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center justify-center">
                  <svg 
                    className="w-16 h-16 text-gray-400 mb-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    ></path>
                  </svg>
                  <p className="text-gray-600 mb-2">
                    {selectedImage 
                      ? 'Image selected! Click or drag to replace' 
                      : 'Click to upload or drag and drop an image'}
                  </p>
                  <p className="text-sm text-gray-500">Supports JPG, PNG, BMP formats</p>
                </div>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
              
              {selectedImage && (
                <div className="mt-6">
                  <div className="relative">
                    <img 
                      src={selectedImage} 
                      alt="Selected for classification" 
                      className="w-full h-64 object-contain rounded-lg border"
                    />
                    <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                      Preview
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={handleClassify}
                      disabled={isLoading}
                      className={`px-6 py-3 rounded-lg font-medium text-white transition-colors ${
                        isLoading 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {isLoading ? 'Analyzing...' : 'Classify Bacteria'}
                    </button>
                  </div>
                </div>
              )}
              
              {error && (
                <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
                  {error}
                </div>
              )}
            </div>
            
            {/* Prediction Results Card */}
            {predictionResult && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Classification Results</h2>
                
                <div className="space-y-6">
                  {/* Main Prediction */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-800">Predicted Bacterial Species</h3>
                        <p className="text-2xl font-bold text-blue-700 mt-1">
                          {predictionResult.predicted_class.replace(/_/g, ' ')}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-blue-700">
                          {(predictionResult.confidence * 100).toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600">Confidence</div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-gray-700">
                        {getBacterialInfo(predictionResult.predicted_class)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Confidence Bar Chart */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Classification Confidence</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={confidenceData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="name" 
                            angle={-45} 
                            textAnchor="end" 
                            height={60}
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis 
                            domain={[0, 100]} 
                            tickCount={6}
                            tickFormatter={(value) => `${value}%`}
                          />
                          <Tooltip 
                            formatter={(value) => [`${value}%`, 'Confidence']}
                            labelFormatter={(label) => `Bacterial Species: ${label}`}
                          />
                          <Legend />
                          <Bar dataKey="confidence" name="Confidence">
                            {confidenceData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  {/* Processing Info */}
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="text-2xl font-bold text-gray-800">{predictionResult.processing_time}s</div>
                      <div className="text-sm text-gray-600">Processing Time</div>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="text-2xl font-bold text-gray-800">{confidenceData.length}</div>
                      <div className="text-sm text-gray-600">Classes Analyzed</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Right Panel - Visualizations and History */}
          <div className="space-y-8">
            {/* Confidence Distribution Pie Chart */}
            {predictionResult && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Confidence Distribution</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={confidenceData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="confidence"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {confidenceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value}%`, 'Confidence']}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
            
            {/* Classification History */}
            {classificationHistory.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Recent Classifications</h2>
                <div className="space-y-4">
                  {classificationHistory.map((item) => (
                    <div 
                      key={item.id} 
                      className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-16 h-16 flex-shrink-0">
                        <img 
                          src={item.image} 
                          alt="Classification history" 
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="font-medium text-gray-800">
                          {item.result.predicted_class.replace(/_/g, ' ')}
                        </div>
                        <div className="text-sm text-gray-600">
                          {item.timestamp}
                        </div>
                        <div className="text-sm font-medium text-blue-600">
                          {(item.result.confidence * 100).toFixed(1)}% confidence
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Information Panel */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-xl p-6 text-white">
              <h2 className="text-2xl font-semibold mb-4">About Bacterial Classification</h2>
              <p className="mb-3">
                This tool uses a deep learning model based on MobileNetV2 architecture to classify bacterial species from microscopic images.
              </p>
              <p className="mb-3">
                The model has been trained on various bacterial species including E. coli, S. aureus, and others.
              </p>
              <p>
                Accurate bacterial classification is crucial for medical diagnosis and treatment planning.
              </p>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="mt-12 text-center text-gray-600">
          <p>Bacterial Image Classification System • Powered by Deep Learning</p>
        </footer>
      </div>
    </div>
  );
};

export default BacterialClassificationApp;