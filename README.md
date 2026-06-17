# 🔬 Microscopic Bacterial Species Classifier (PyTorch & FastAPI)

[![Framework: PyTorch](https://img.shields.io/badge/Framework-PyTorch-orange.svg)](https://pytorch.org/)
[![Backend: FastAPI](https://img.shields.io/badge/Backend-FastAPI-green.svg)](https://fastapi.tiangolo.com/)
[![Frontend: Next.js 15](https://img.shields.io/badge/Frontend-Next.js_15-black.svg)](https://nextjs.org/)
[![Dataset: EMDS-7](https://img.shields.io/badge/Dataset-EMDS--7-blue.svg)]()

A medical computer vision and deep learning application that processes microscopic images, detects bacterial shapes, and classifies them into species. Built with a PyTorch CNN backend, a FastAPI server, and a Next.js 15 frontend.

---

## 📖 Architecture & Data Pipeline

This application provides an end-to-end pipeline:
1. **Dataset**: Trained on the **EMDS-7 (Environmental Microorganism Dataset)** which contains microscopic bacterial images and XML annotations (bounding boxes, class labels).
2. **Deep Learning Model (PyTorch)**: Fine-tunes a pre-trained ResNet/EfficientNet model (`torchvision.models`) using custom data loaders that parse XML annotations, resize images, apply augmentations (random rotate, crop, brightness, contrast), and compile into `best_model.pth`.
3. **API Server (FastAPI)**: Serves model inference via POST endpoints, automatically runs image preprocessing, runs the PyTorch forward pass, and formats classifications with confidence levels.
4. **Interactive UI (Next.js 15)**: A clean landing page for medical researchers to upload microscopic images, visualize prediction confidences (using Recharts), and read detailed description metadata.

---

## 🔬 Setup & Model Initialization

### 1. Install Backend Dependencies
```bash
pip install fastapi uvicorn torch torchvision pillow scikit-learn matplotlib tqdm
```

### 2. Auto-Extract Class Names & Verify Model
Run the setup script to parse XML files from the EMDS7 dataset, verify class dimensions, and dump metadata:
```bash
python setup_model.py
```
This automatically writes `class_names.json` and `model_info.json` for the API server.

### 3. Launching the Application
Use the provided batch file to start the FastAPI server and the Next.js dev server:
```bash
# Starts both services concurrently
start_application.bat
```
The Next.js UI will be available at `http://localhost:3000` and the API documentation at `http://localhost:8000/docs`.
