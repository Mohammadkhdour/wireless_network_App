# AI-Powered Wireless Network Design Application

A comprehensive web application for wireless and mobile network design calculations with AI-powered explanations using Google AI Studio.

## 🚀 Features

- **Four Complete Calculation Scenarios:**
  - Wireless Communication System (Sampler, Quantizer, Source Encoder, Channel Encoder, Interleaver, Burst Formatter)
  - OFDM Systems (Resource Elements, OFDM Symbols, Resource Blocks, Spectral Efficiency)
  - Link Budget Calculation (Path Loss Models, Transmitted/Received Power)
  - Cellular System Design (Coverage vs Capacity Analysis)

- **AI-Powered Explanations:** Real-time detailed explanations generated using Google AI Studio
- **Modern React Frontend:** Built with React, Tailwind CSS, and shadcn/ui components
- **Python Flask Backend:** RESTful API for AI explanation generation
- **Responsive Design:** Works seamlessly on desktop and mobile devices
- **Professional UI/UX:** Clean, intuitive interface with real-time calculations

## 🏗️ Project Structure

```
wireless-network-full-app/
├── frontend/                 # React application
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   │   └── images/       # System diagrams and images
│   │   ├── components/
│   │   │   ├── CellularPage.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── LinkBudgetPage.jsx
│   │   │   ├── Navigation.jsx
│   │   │   ├── OFDMPage.jsx
│   │   │   └── WirelessCommPage.jsx
│   │   ├── utils/
│   │   │   └── api.js        # API utility functions
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── backend/                  # Python Flask backend
│   ├── src/
│   │   ├── models/
│   │   │   └── user.py       # Database models
│   │   ├── routes/
│   │   │   ├── ai.py         # AI explanation endpoints
│   │   │   └── user.py       # User routes
│   │   └── main.py           # Flask application entry point
│   ├── venv/                 # Python virtual environment
│   ├── requirements.txt      # Python dependencies
│   └── .env.example          # Environment variables template
├── Dockerfile                # Docker configuration
├── README.md                 # This file
└── .gitignore                # Git ignore rules
```

## 🛠️ Installation & Setup

### Prerequisites

- Node.js (v18 or higher)
- Python (v3.8 or higher)
- Google AI Studio API Key (free from https://makersuite.google.com/app/apikey)

### Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd wireless-network-full-app
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   
   # Configure environment variables
   cp .env.example .env
   # Edit .env and add your Google AI Studio API key
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Start Development Servers:**
   
   **Backend (Terminal 1):**
   ```bash
   cd backend
   source venv/bin/activate
   python src/main.py
   ```
   Backend will run on http://localhost:5000

   **Frontend (Terminal 2):**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will run on http://localhost:5173

## 🐳 Docker Deployment

### Build and Run with Docker

1. **Build the Docker image:**
   ```bash
   docker build -t wireless-network-app .
   ```

2. **Run the container:**
   ```bash
   docker run -p 5000:5000 -e GOOGLE_AI_API_KEY=your-api-key-here wireless-network-app
   ```

3. **Access the application:**
   Open http://localhost:5000 in your browser

### Environment Variables

- `GOOGLE_AI_API_KEY`: Your Google AI Studio API key (required for AI explanations)
- `FLASK_ENV`: Set to `production` for production deployment
- `FLASK_DEBUG`: Set to `False` for production

## 📚 API Documentation

### POST /api/explain

Generate AI explanation for wireless network calculations.

**Request Body:**
```json
{
  "scenario": "wireless_comm" | "ofdm" | "link_budget" | "cellular_design",
  "inputs": {
    // Input parameters specific to the scenario
  },
  "results": {
    // Calculated results specific to the scenario
  }
}
```

**Response:**
```json
{
  "explanation": "Detailed AI-generated explanation..."
}
```

## 🧮 Calculation Scenarios

### 1. Wireless Communication System
Calculate data rates through processing blocks:
- Sampler → Quantizer → Source Encoder → Channel Encoder → Interleaver → Burst Formatter

### 2. OFDM Systems
Calculate OFDM system parameters:
- Resource Element Rate, OFDM Symbol Rate, Resource Block Rate, Spectral Efficiency

### 3. Link Budget Analysis
Calculate link performance:
- Path Loss (Free Space, Two-Ray Ground, Hata Urban models)
- Transmitted/Received Power, Link Margin

### 4. Cellular System Design
Design cellular networks:
- Coverage vs Capacity Analysis, Frequency Reuse, Sectorization Effects

## 🔧 Development

### Adding New Calculation Scenarios

1. **Backend:** Add new prompt generation function in `backend/src/routes/ai.py`
2. **Frontend:** Create new component in `frontend/src/components/`
3. **Navigation:** Update `frontend/src/components/Navigation.jsx`
4. **Routing:** Update `frontend/src/App.jsx`

### Customizing AI Prompts

Edit the prompt generation functions in `backend/src/routes/ai.py` to customize the AI explanations for each scenario.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation in the `/docs` folder

## 🎓 Educational Use

This application is designed for educational purposes in wireless and mobile network engineering courses. It provides:
- Real-world calculation scenarios
- Step-by-step explanations
- Interactive learning experience
- Professional-grade tools for students

---

**Built with ❤️ for wireless network engineering education**

# wireless_network_App
