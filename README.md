# CivicAId

> Last updated: 29/04/2025

**CivicAId** is an AI-powered civic chatbot designed to streamline interactions between citizens and government services in Singapore. It integrates an LLM backend for intelligent conversations, local agentic workflows for performance optimisation, supports real-time issue reporting, and delivers customized, localized answers for the Singaporean context.

🌐 [Visit the live demo](https://civic-aid.ziwyy.com)

## Table of Contents

- [Production Stack Overview](#production-stack-overview)
- [Local Development Setup](#local-development-setup)
- [Architecture Overview](#architecture-overview)
- [Production Deployment](#production-deployment)
- [Acknowledgments](#acknowledgments)

## Production Stack Overview

| Component       | Technology Stack                              |
| --------------- | --------------------------------------------- |
| **Frontend**    | React.js (Vite) served statically via Nginx |
| **Backend**     | Express.js (Node.js) managed with PM2, reverse proxied by Nginx |
| **LLM Server**  | Flask (Python) serving local AI/NLP models and Deepseek API calls via Openrouter |
| **Database**    | PostgreSQL hosted on NeonDB |
| **Hosting**     | Huawei Cloud Elastic Cloud Server (ECS) |
| **Domain & Security** | Cloudflare (Domain management and DDoS protection) |

## Local Development Setup

You will need:
- Recent versions of **Node.js** and **Python**
- Access to required `.env` files (contact the project contributors)

### 1. React.js (Vite) Client

```bash
cd client
npm install
npm run dev
```

Frontend available at [http://localhost:5173](http://localhost:5173).

### 2. Express.js Backend Server

```bash
cd server
npm install
npm start
```

Backend available at [http://localhost:3000](http://localhost:3000).

**Note:** The development server connects directly to the live PostgreSQL database if `.env` is correctly configured.

### 3. Flask AI / LLM Server

Please contact the developers to run the LLM server locally because the custom model.safetensors file used in RAG is too large to upload to this repo.
Additionally, files containing API keys to call Deepseek via openrouter.ai are not provided in this repo. Please contact the developers for the format of the file and how to obtain the API keys.

## Architecture Overview

```
civic-aid/
├── LICENSE                       # MIT License
├── client/                       # Frontend: Vite / React.js app
│   ├── public/                   # Public assets (eg. images)
│   └── src/
│       ├── App.tsx               # Main entry point and client-side
│       │                           routing
│       └── components/           # React components and custom hooks
├── server/                       # Backend: Express.js app
│   ├── config/
│   │   └── db.js                 # NeonDB PostgreSQL setup
│   ├── controllers/
│   │   ├── chatController.js     # Handles chat creation, fetching
│   │   │                           modifying, deleting
│   │   ├── queryController.js    # Handles query submissions
│   │   └── reportController.js   # Handles fetching, modifying, and
│   │                               summarizing reports
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT authentication 
│   ├── routes/                   # API route definitions
│   ├── services/
│   │   ├── cron.js               # Monthly rewards system updates
│   │   ├── geocoder.js           # Address geocoding
│   │   ├── llmservice.js         # LLM interactions
│   │   ├── parsers.js            # Parses LLM responses
│   │   └── promptbook.js         # LLM system prompts
│   └── index.js                  # Main server entry point
└── chatbot/                      # Chatbot module
    ├── llmserver.py              # LLM server entry point
    ├── chatbotmodels/
    │   ├── MainChatbotWithSSL.py # Deepseek with RAG and image
    │   │                           capabilities
    │   ├── BasicDSKoller.py      # Basic deepseek instance for 
    │   │                           performance optimisation
    │   ├── AuxModelCaptioner.py  # Auxiliary image recognition and 
    │   │                           captioning model
    │   └── ReportCompiler.py     # For grouping similar reports
    ├── Dockerfile                # For optional Docker support
    └── govsg_crawler_2           # Webcrawler and knowledge base for RAG
```

## Production Deployment

<details>
<summary>Click to expand deployment details</summary>

- **Frontend**  
  Built using `npm run build` and served via Nginx.

- **Backend**  
  Hosted with `pm2` and reverse proxied by Nginx (`/server/*` routes).

- **LLM Server**  
  Flask server hosted locally. Optional Docker support available.

- **Database**  
  PostgreSQL database hosted on NeonDB.

- **Domain and Security**  
  Managed through Cloudflare for DNS and DDoS protection.

_Nginx configuration files available upon request._

_model.safetensors file available upon request._
 
</details>

## Acknowledgments

- [React.js](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [DaisyUI](https://daisyui.com/)
- [Express.js](https://expressjs.com/)
- [Flask](https://flask.palletsprojects.com/)
- [OpenRouter.ai](https://openrouter.ai/)
- [NeonDB](https://neon.tech/)
- [Huawei Cloud](https://www.huaweicloud.com/)
- [Transformers (HuggingFace)](https://huggingface.co/docs/transformers) 
- [Optimum (HuggingFace)](https://huggingface.co/docs/optimum)
- [PyTorch](https://pytorch.org/docs/stable/)
- [HDBSCAN](https://hdbscan.readthedocs.io/) 
- [scikit-learn](https://scikit-learn.org/stable/)
- [ONNX Runtime](https://onnxruntime.ai/) 
