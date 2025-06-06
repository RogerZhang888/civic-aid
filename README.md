# CivicAId

> Last updated: 30/04/2025

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

**Note:** The development server connects directly to the live PostgreSQL database once `.env` is correctly configured.

### 3. Flask AI / LLM Server

Please contact the developers to run the LLM server locally because the custom model.safetensors file used in RAG is too large to upload to this repo.
Additionally, files containing API keys to call SEA-LION are not provided in this repo. Please contact the developers for the format of the file and how to obtain the API keys.

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
│   │   ├── commentsController.js # Handles comments
│   │   ├── govController.js      # Handles admin functionality
│   │   ├── notificationsController.js # Handles notifications
│   │   ├── queryController.js    # Handles query submissions
│   │   ├── reportController.js   # Handles fetching, modifying, and
│   │   │                           summarizing reports
│   │   └── translatorController.js    # Handles translation functionality            
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT authentication 
│   ├── routes/                   # API route definitions
│   ├── services/
│   │   ├── cron.js               # Monthly rewards system updates
│   │   ├── geocoder.js           # Address geocoding
│   │   ├── gov.js                # Admin auxiliary functions
│   │   ├── llmservice.js         # LLM interactions
│   │   ├── notifications.js      # Notifications handler
│   │   ├── parsers.js            # Parses LLM responses
│   │   └── promptbook.js         # LLM system prompts
│   │   └── translator.js         # Translation prompting functionality
│   └── index.js                  # Main server entry point
└── chatbot/                      # Chatbot module
    ├── llmserver.py              # AI server entry point
    ├── safety.py                 # LLM input safety filters
    ├── chatbotmodels/
    │   ├── MainChatbotWithSealion.py # SEA-LION caller with RAG and image
    │   │                           capabilities
    │   ├── BasicSealionKoller.py # Basic SEA-LION caller for 
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
  Built with `npm run build` and served via Nginx.

- **Backend**  
  Hosted with `pm2` and reverse proxied by Nginx (`/server/*` routes).

- **LLM Server**  
  Flask server hosted on the cloud server. Optional Docker support available.

- **Database**  
  PostgreSQL database hosted on NeonDB.

- **Domain and Security**  
  Managed through Cloudflare for DNS and DDoS protection.

_Nginx configuration files available upon request._

_model.safetensors file available upon request._
 
</details>

## Server Routes

<details>
<summary>Click to expand routes details</summary>

### Authentication routes
`POST /register`
```ts
Request {
    username: string,
    email: string,
    password: string
}

Response {
    success: boolean,
    error: undefined | string
}
```
`POST /login`
```ts
Request {
    username: string,
    password: string
}

Response {
    id: number,
    username: string,
    email: string,
    permissions: Array<string>
} | {
    error: string
}
```
`POST /logout`
```ts
Request {
    null
}

Response {
    success: boolean,
    error: undefined | string
}
```
`GET /protected`
```ts
Response {
    id: number,
    username: string,
    email: string,
    permissions: Array<string>,
    iat: string,
    exp: string
} | {
    error: string
}
```

### Chat routes
`POST /chats`
```ts
Request {
    chatId: string,
    title: string,
    type: string,
    createdAt: string
}

Response {
    success: boolean,
    error: undefined | string
}
```
`PATCH /chats/:chatId`
```ts
Request {
    title: string
}

Response {
    success: boolean,
    error: undefined | string
}
```
`GET /chats`
```ts
Response Array<{
    id: string,
    user_id: number,
    type: string,
    created_at: string,
    title: string
}> | {
    error: string
}
```
`GET /chats/:chatId`
```ts
Response Array<{
    id: string,
    user_id: number,
    chat_id: string,
    created_at: string,
    user_prompt: string,
    media_url: Array<string>,
    query_address: string,
    system_prompt: string,
    response: string,
    sources: Array<string>,
    is_valid: boolean,
    to_reply: boolean,
    query_confidence: number | null
}> | {
    error: string
}
```
`DELETE /chats/:chatId`
```ts
Response {
    success: boolean
} | {
    error: string
}
```

### Query routes
`POST /query`
```ts
Request {
    media: File | undefined,
    prompt: string,
    latitude: string,
    longitude: string,
    chatId: string
}

Response {
    title: string,
    media: string | undefined,
    summary: string,
    urgency: number,
    recommendedSteps: string,
    agency: string,
    sources: Array<string> | undefined,
    valid: true
} | {
    answer: string,
    sources: Array<string> | undefined,
    valid: true
    media: string | undefined
} | {
    valid: false
} | {
    error: string
}
```

### Reporting routes
`GET /reports/:id`
```ts
Response {
    id: string,
    user_id: number,
    chat_id: string,
    title: string,
    description: string,
    media_url: Array<string>,
    incident_address: string,
    agency: string,
    recommended_steps: string,
    urgency: number,
    report_confidence: number,
    status: 'pending' | 'in progress' | 'resolved' | 'rejected',
    created_at: string,
    resolved_at: string | null,
    is_public: boolean,
    upvote_count: number,
    remarks: string
} | {
    error: string
}
```
`GET /reports`
```ts
Response Array<{
    id: string,
    user_id: number,
    chat_id: string,
    title: string,
    description: string,
    media_url: Array<string>,
    longitude: string,
    latitude: string,
    agency: string,
    recommended_steps: string,
    urgency: number,
    report_confidence: number,
    status: 'pending' | 'in progress' | 'resolved' | 'rejected',
    created_at: string,
    resolved_at: string | null,
    is_public: boolean,
    upvote_count: number,
    remarks: string
}> | {
    error: string
}
```
`GET /reports/public`
```ts
Response Array<{
    id: string,
    user_id: number,
    chat_id: string,
    title: string,
    description: string,
    media_url: Array<string>,
    longitude: string,
    latitude: string,
    agency: string,
    recommended_steps: string,
    urgency: number,
    report_confidence: number,
    status: 'pending' | 'in progress' | 'resolved' | 'rejected',
    created_at: string,
    resolved_at: string | null,
    is_public: boolean,
    upvote_count: number,
    remarks: string
}> | {
    error: string
}
```
`PATCH /reports/:id`,
```ts
Request {
    newStatus: 'pending' | 'in progress' | 'resolved' | 'rejected',
    remarks: string
}

Response {
    id: string,
    user_id: number,
    chat_id: string,
    title: string,
    description: string,
    media_url: Array<string>,
    incident_address: string,
    agency: string,
    recommended_steps: string,
    urgency: number,
    report_confidence: number,
    status: 'pending' | 'in progress' | 'resolved' | 'rejected',
    created_at: string,
    resolved_at: string | null,
    is_public: boolean,
    upvote_count: number,
    remarks: string
} | {
    error: string
}
```
`POST /reports/set_is_public/:id`
```ts
Request {
    is_public: boolean
}

Response {
    success: boolean,
    error: undefined | string
}
```
`GET /reports/upvote_status`
```ts
Response Array<string> | {
    error: string
}
```
`POST /reports/upvote/:id`
```ts
Request {
}

Response {
    upvote_count: number
} | {
    error: string
}
```
`POST /reports/undo_upvote/:id`
```ts
Request {
}

Response {
    upvote_count: number
} | {
    error: string
}
```

### Commenting routes
`POST /comments`
```ts
Request {
    text: string,
    report_id: string,
    parent_id: undefined | number
}

Response {
    success: boolean,
    error: undefined | string
}
```
`GET /comments/:id`
```ts
Response Array<Comment>

Comment: {
    id: number,
    report_id: string,
    text: null | string,
    upvote_count: number,
    parent_id: null | number,
    created_at: string,
    deleted: boolean,
    children: Array<Comment>
}
```
`PATCH /comment/:id`
```ts
Request {
    text: string
}

Response {
    success: boolean,
    error: undefined | string
}
```
`DELETE /comment/:id`
```ts
Response {
    success: boolean,
    error: undefined | string
}
```

### Government routes
`GET /gov/reports`
```ts
Request {
    include_resolved: undefined | 1
}

Response Array<
    {
        id: string,
        user_id: number,
        chat_id: string,
        title: string,
        description: string,
        media_url: Array<string>,
        incident_address: string,
        agency: string,
        recommended_steps: string,
        urgency: number,
        report_confidence: number,
        status: 'pending' | 'in progress' | 'resolved' | 'rejected',
        created_at: string,
        resolved_at: string | null,
        is_public: boolean,
        upvote_count: number,
        remarks: string
    } | {
        valid: false
    }
> | {
    error: string
}
```

`PATCH /gov/reports/:id`
```ts
Request {
    newStatus: "pending" | "in progress" | "resolved" | "rejected",
    remarks: string
}

Response {
    id: string,
    user_id: number,
    chat_id: string,
    title: string,
    description: string,
    media_url: Array<string>,
    incident_address: string,
    agency: string,
    recommended_steps: string,
    urgency: number,
    report_confidence: number,
    status: 'pending' | 'in progress' | 'resolved' | 'rejected',
    created_at: string,
    resolved_at: string | null,
    is_public: boolean,
    upvote_count: number,
    remarks: string
} | {
    error: string
}
```

`GET /gov/reports_summary`
```ts
Response Array<
    {
        title: string,
        summary: string,
        description: string,
        agency: string,
        recommendedSteps: string,
        urgency: number,
        confidence: number,
        sources: Array<string>
        valid: true
    } | {
        valid: false
    }
> | {
    error: string
}
```

### Notification routes
`GET /notifications`
```ts
Response Array<{
    id: number,
    created_at: string,
    user_id: number | null,
    target: 'USER' | 'ADMIN' | 'ALL',
    text: {
        en: string,
        cn: string,
        ms: string,
        ta: string
    },
    link: string,
    read: boolean
}>
```

`POST /notifications/:id`
```ts
Response {
    success: boolean,
    error: undefined | string
}
```

### Miscellaneous routes
`POST /translate`
```ts
Request {
    text: string,
    target:"ENGLISH" | "CHINESE" | "MALAY" | "TAMIL" | undefined
}

Response {
    text: string
}
```

</details>

## Acknowledgments

- [SEA-LION](https://sea-lion.ai/)
- [React.js](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [MUI](https://mui.com/)
- [DaisyUI](https://daisyui.com/)
- [Express.js](https://expressjs.com/)
- [Flask](https://flask.palletsprojects.com/)
- [NeonDB](https://neon.tech/)
- [Huawei Cloud](https://www.huaweicloud.com/)
- [Transformers (HuggingFace)](https://huggingface.co/docs/transformers) 
- [Optimum (HuggingFace)](https://huggingface.co/docs/optimum)
- [PyTorch](https://pytorch.org/docs/stable/)
- [HDBSCAN](https://hdbscan.readthedocs.io/) 
- [scikit-learn](https://scikit-learn.org/stable/)
- [ONNX Runtime](https://onnxruntime.ai/) 
