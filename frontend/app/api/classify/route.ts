import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    if (!file.type || !file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type. Please upload an image.' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // In a real implementation, you would send the image to your Python API
    // For now, we'll simulate the API call to the Python backend
    // The Python backend should be running at http://localhost:8000/classify
    
    // Create form data for the Python backend
    const backendFormData = new FormData();
    const imageFile = new File([buffer], file.name, { type: file.type });
    backendFormData.append('file', imageFile);

    // Call the Python backend API
    const response = await fetch('http://localhost:8000/classify', {
      method: 'POST',
      body: backendFormData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Backend API error: ${response.status}`);
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Classification error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}