# VeinoSense

**VeinoSense** is a cutting-edge medical technology platform designed to revolutionize venipuncture procedures. By integrating **Augmented Reality (AR)**, **Artificial Intelligence (AI)**, and **Digital Twin** technology, VeinoSense provides healthcare professionals with real-time visual guidance and data-driven recommendations to improve success rates, reduce patient discomfort, and streamline clinical workflows.

---

## 🚀 Key Features

### 1. AR Vein Scanner (Augmented Reality Overlay)
The core of VeinoSense is its real-time AR visualization system that projects the patient's vascular structure directly onto their skin via a camera feed.
*   **Technology**: Built using **MediaPipe Hands** for robust hand tracking and landmark detection, combined with HTML5 Canvas for high-performance rendering.
*   **Functionality**:
    *   **Real-Time Tracking**: Anchors vein visualizations to the user's arm, adjusting in real-time as the patient moves.
    *   **Medical Mode**: Applies **CLAHE (Contrast Limited Adaptive Histogram Equalization)** algorithms to the video feed to enhance vein visibility and contrast.
    *   **Visual Guidance**: Highlights the best insertion sites and projects a "Needle Direction" arrow to guide the phlebotomist.

### 2. AI Needle Recommender Engine
An intelligent decision-support system that analyzes patient physiology to suggest the optimal needle parameters.
*   **Logic**: Uses a multi-factor scoring algorithm in `RecommendationEngine.js`.
*   **Inputs**: Analyzes **Vein Depth**, **Diameter**, **Patient Age** (Pediatric/Adult/Geriatric), **Vein Stability**, and **Medical History**.
*   **Outputs**:
    *   **Needle Gauge**: Recommendations from **16G to 24G**.
    *   **Insertion Angle**: Calculated precision angle (e.g., 15-25°) based on vein depth.
    *   **Risk Assessment**: Identifies potential complications (e.g., "High Rolling Risk", "Fragile Veins").
    *   **Success Probability**: Provides a confidence score for the procedure.

### 3. Digital Twin & 3D Visualization
A sophisticated 3D modeling interface that creates a "Digital Twin" of the patient's vascular system.
*   **Technology**: Powered by **Three.js** and **React Three Fiber**.
*   **Functionality**:
    *   Renders a 3D arm model with anatomically correct vein paths (Cephalic, Basilic, Median Cubital).
    *   **Interactive Markers**: Allows users to click on specific veins to view detailed metrics (Diameter, Stability).
    *   **Injection History**: Visualizes past injection sites on the 3D model, colour-coded by success/failure, helping clinicians avoid overused sites.

### 4. Smart Connectivity (VeinoWatch)
Simulates integration with wearable devices to fetch real-time physiological data.
*   **Service**: The `WatchDataService` simulates a Bluetooth Low Energy (BLE) connection.
*   **Data Stream**: streams real-time vein coordinates, depth, and diameter data to the AR Overlay.

---

## 🛠️ Technical Architecture

VeinoSense is built as a modern Single Page Application (SPA) focusing on performance and modularity.

### Frontend Stack
*   **Framework**: [React 19](https://react.dev/)
*   **Build Tool**: [Vite](https://vitejs.dev/)
*   **Styling**: [TailwindCSS](https://tailwindcss.com/) for a responsive, medical-grade UI.
*   **Icons**: [Lucide React](https://lucide.dev/)

### Core Libraries
*   **Computer Vision**: `@mediapipe/hands` and `@mediapipe/camera_utils` for gesture recognition and tracking.
*   **3D Rendering**: `@react-three/fiber` and `@react-three/drei` for the Digital Twin environment.
*   **Data Management**: React Context API for state management across features.

### Backend & Services
*   **Firebase**: Used for Authentication, Real-time Database (Patient Records), and Hosting.
*   **Services Layer**: Abstracted service classes (`WatchDataService`, `HandTracker`) handle external device communication and AI model initialization.

---

## 📦 Project Structure

```bash
src/
├── components/          # Shared UI components (DashboardLayout, StatusBadges)
├── features/            # Feature-Specific Logic
│   ├── ar-overlay/      # CameraFeed, VeinRenderer, VeinEnhancer (OpenCV logic)
│   ├── digital-twin/    # ThreeDVeinViewer, ArmScene (3D Models)
│   └── needle-recommender/ # RecommendationEngine, InputForm
├── pages/               # Application Routes (Dashboard, Patients, etc.)
├── services/            # Background Services (WatchData, HandTracking)
└── utils/               # Helper functions
```

---

## 💻 Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/your-org/veinosense.git
    cd veinosense
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Variables**
    Create a `.env` file in the root directory with your Firebase config:
    ```env
    VITE_FIREBASE_API_KEY=your_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
    # ... other firebase config
    ```

4.  **Run Locally**
    ```bash
    npm run dev
    ```
    Access the app at `http://localhost:5173`.

---

## 🩺 Usage Guide

1.  **Dashboard**: Start here for an overview of recent patients and system status.
2.  **AR Mode**: Navigate to the AR functionalities. Allow camera access. Point the camera at a hand/arm. The system will detect the hand and overlay vein data. Toggle "Medical Mode" for enhanced contrast.
3.  **Needle Recommender**: Input the patient's data (gathered from the scan or manual entry). Click "Analyze" to receive the AI-driven recommendation.
4.  **Digital Twin**: Select a patient from the database to view their 3D vascular history and plan the procedure.

---

## 🔒 License

This project is proprietary software developed for the VeinoSense initiative. All rights reserved.
