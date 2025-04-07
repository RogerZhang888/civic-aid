# civic-aid
huawei yay

Architecture CAA 070425

CIVIC-AID/
├── client/            # Frontend (placeholder)
│   └── index.html     - Basic chat interface (static HTML/CSS)
├── server/            # Backend core
│   ├── config/
│   │   └── db.js     - PostgreSQL connection pool setup
│   ├── controllers/
│   │   └── queryController.js - Handles query submission/LLM mock logic
│   ├── middleware/
│   │   └── auth.js   - JWT verification for protected routes
│   └── index.js       - Main server (routes, middleware, DB init)
├── .env               - Environment variables (DB/JWT config)
├── package.json       - Backend dependencies/scripts
└── .gitignore         - Excludes node_modules/.env
