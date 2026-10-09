# SyncSphere — Cloud Architecture & Implementation Proof of Work

> **Live Azure Endpoint:** [https://app-syncsphere-api-2026.azurewebsites.net/](https://app-syncsphere-api-2026.azurewebsites.net/)  
> **GitHub Repository:** [https://github.com/Tirupathi-Reddy-Pucha/SyncSphere](https://github.com/Tirupathi-Reddy-Pucha/SyncSphere)

---

## 1. Frontend Architecture (React.js SPA & UI Framework)
* **Tech Stack:** React 18, Vite, TailwindCSS, Lucide Icons
* **Azure Host:** Azure App Service (`app-syncsphere-api-2026`)
* **Feature Summary:** Production Single Page Application providing a Kanban task board, passwordless email login gateway, live Azure Blob Storage asset manager, and real-time AI security scanner.
* **Direct Proof Links:**
  * 🌐 **Live Application URL:** [https://app-syncsphere-api-2026.azurewebsites.net/](https://app-syncsphere-api-2026.azurewebsites.net/)
  * 🐙 **Source Code (`App.jsx` on GitHub):** [App.jsx](https://github.com/Tirupathi-Reddy-Pucha/SyncSphere/blob/main/frontend/src/App.jsx)
  * ☁️ **Azure App Service Portal Location:** [Open in Azure Portal](https://portal.azure.com/#@cb.students.amrita.edu/resource/subscriptions/a76241a6-5571-4c87-9829-a08e0ef360b9/resourceGroups/rg-syncsphere-eastus2/providers/Microsoft.Web/sites/app-syncsphere-api-2026/overview)

---

## 2. Backend REST API Microservices (Node.js & Express)
* **Tech Stack:** Node.js, Express.js, RESTful APIs
* **Azure Host:** Azure App Service (`app-syncsphere-api-2026`)
* **Feature Summary:** High-performance Node.js Express backend serving REST API routes for workspace management, task state updates, file buffer streaming, and automated security diagnostics.
* **Direct Proof Links:**
  * ⚡ **Live Health API Endpoint:** [https://app-syncsphere-api-2026.azurewebsites.net/api/telemetry/health](https://app-syncsphere-api-2026.azurewebsites.net/api/telemetry/health)
  * 🐙 **Source Code (`server.js` on GitHub):** [server.js](https://github.com/Tirupathi-Reddy-Pucha/SyncSphere/blob/main/backend/src/server.js)
  * ☁️ **Azure App Service Configuration Portal:** [Open App Settings in Azure Portal](https://portal.azure.com/#@cb.students.amrita.edu/resource/subscriptions/a76241a6-5571-4c87-9829-a08e0ef360b9/resourceGroups/rg-syncsphere-eastus2/providers/Microsoft.Web/sites/app-syncsphere-api-2026/configuration)

---

## 3. Async Cloud Storage & Azure Blob Asset Manager
* **Tech Stack:** `@azure/storage-blob` SDK, Buffer Streaming, Auto MIME Detection
* **Azure Host:** Azure Blob Storage (`stsyncsphere2026` / Container: `workspace-assets`)
* **Feature Summary:** Direct memory buffer streaming to Azure Blob Storage container `workspace-assets`. Features automatic MIME-type preservation, direct SAS download links, and instant deletion capabilities.
* **Direct Proof Links:**
  * 🗄️ **Live Asset Manager UI:** [https://app-syncsphere-api-2026.azurewebsites.net/](https://app-syncsphere-api-2026.azurewebsites.net/)
  * 🐙 **Source Code (`azureBlobService.js` on GitHub):** [azureBlobService.js](https://github.com/Tirupathi-Reddy-Pucha/SyncSphere/blob/main/backend/src/services/azureBlobService.js)
  * ☁️ **Azure Storage Container Portal Location:** [Open Storage Account in Azure Portal](https://portal.azure.com/#@cb.students.amrita.edu/resource/subscriptions/a76241a6-5571-4c87-9829-a08e0ef360b9/resourceGroups/rg-syncsphere-eastus2/providers/Microsoft.Storage/storageAccounts/stsyncsphere2026/overview)

---

## 4. Security & Access Control (Passwordless Identity Lock)
* **Tech Stack:** Passwordless Email Gateway, Client Session Lock (`clientSessionId`), JWT Signatures
* **Azure Host:** Server-Side Session Security & Middleware
* **Feature Summary:** Enforces mandatory passwordless email login gateway. Permanently locks session identity (`clientSessionId`) to prevent spoofing or identity tampering across devices.
* **Direct Proof Links:**
  * 🔑 **Live Login Gateway UI:** [https://app-syncsphere-api-2026.azurewebsites.net/](https://app-syncsphere-api-2026.azurewebsites.net/)
  * 🐙 **Source Code (`LoginScreen.jsx` on GitHub):** [LoginScreen.jsx](https://github.com/Tirupathi-Reddy-Pucha/SyncSphere/blob/main/frontend/src/components/LoginScreen.jsx)
  * 🐙 **Source Code (`Header.jsx` Locked Identity Badge):** [Header.jsx](https://github.com/Tirupathi-Reddy-Pucha/SyncSphere/blob/main/frontend/src/components/Header.jsx)

---

## 5. Automated Azure AI Security Code Scanner
* **Tech Stack:** Static Heuristic Analyzer, Real-time Vulnerability Engine (0–100 Compliance Score)
* **Azure Host:** In-Memory Upload Audit Engine & Interactive AI Code Auditor
* **Feature Summary:** Audits uploaded files and code snippets for hardcoded keys, HTTP connection strings, wildcard CORS, and public container access. Outputs real-time diagnostic cards and scores.
* **Direct Proof Links:**
  * 🛡️ **Live AI Security Scanner UI:** [https://app-syncsphere-api-2026.azurewebsites.net/](https://app-syncsphere-api-2026.azurewebsites.net/)
  * 🐙 **Source Code (`aiController.js` on GitHub):** [aiController.js](https://github.com/Tirupathi-Reddy-Pucha/SyncSphere/blob/main/backend/src/controllers/aiController.js)
  * 📁 **Test Sample Security Files on GitHub:** [sample_security_test_files](https://github.com/Tirupathi-Reddy-Pucha/SyncSphere/tree/main/sample_security_test_files)

---

## 6. Observability & Device-Aware System Audit Stream
* **Tech Stack:** Device Attribution (`💻 Desktop` vs `📱 Mobile`), System Telemetry Stream
* **Azure Host:** System Health & Audit Component
* **Feature Summary:** Real-time telemetry monitoring for Azure App Service & Storage alongside a tamper-evident audit stream attributing all user actions to authenticated email & device hardware.
* **Direct Proof Links:**
  * 📊 **Live Telemetry & Audit Stream UI:** [https://app-syncsphere-api-2026.azurewebsites.net/](https://app-syncsphere-api-2026.azurewebsites.net/)
  * 🐙 **Source Code (`TelemetryDashboard.jsx` on GitHub):** [TelemetryDashboard.jsx](https://github.com/Tirupathi-Reddy-Pucha/SyncSphere/blob/main/frontend/src/components/TelemetryDashboard.jsx)
  * ☁️ **Azure Resource Group Portal Location:** [Open Resource Group in Azure Portal](https://portal.azure.com/#@cb.students.amrita.edu/resource/subscriptions/a76241a6-5571-4c87-9829-a08e0ef360b9/resourceGroup/rg-syncsphere-eastus2/overview)

---

## 7. Infrastructure as Code & DevOps Pipeline
* **Tech Stack:** Azure Kudu Zip Deployment, Python CLI Automation, Git Version Control
* **Azure Host:** GitHub Repository & Azure App Service Deployment API
* **Feature Summary:** Automated deployment pipeline zipping React build dist & Node.js backend, deploying cleanly to Azure App Service via Kudu API.
* **Direct Proof Links:**
  * 🐙 **GitHub Repository (SyncSphere):** [https://github.com/Tirupathi-Reddy-Pucha/SyncSphere](https://github.com/Tirupathi-Reddy-Pucha/SyncSphere)
  * 🐍 **Deployment Automation Script (`create_webapp.py`):** [create_webapp.py](https://github.com/Tirupathi-Reddy-Pucha/SyncSphere/blob/main/create_webapp.py)
  * 📄 **Implementation Plan PDF Report:** [Project_Collaboration_Workspace_Implementation_Plan.pdf](https://github.com/Tirupathi-Reddy-Pucha/SyncSphere/blob/main/Project_Collaboration_Workspace_Implementation_Plan.pdf)
