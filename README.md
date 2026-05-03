# Contract Intelligence Platform (CIP)

An enterprise-grade full-stack platform for AI-powered legal contract analysis, built with Spring Boot 3 and React.

## Key Features
- **AI Clause Extraction**: Automatically identify and classify clauses (Liability, Termination, etc.).
- **Risk Scoring**: Quantitative risk assessment for every contract.
- **Missing Clause Detection**: Flags missing critical legal protections.
- **Anomaly Detection**: Identifies one-sided terms and unusual legal language.
- **Template Comparison**: Measures deviation from organization-standard language.
- **Local AI Inference**: Optimized for local GGUF models via Ollama.

## Tech Stack
- **Backend**: Spring Boot 3.4, Spring Security (JWT), Spring Data JPA, PostgreSQL, Apache Tika.
- **Frontend**: Vite, React 18, TypeScript, Tailwind CSS, Recharts, Lucide.
- **AI**: Ollama (supports `Ambuj-Tripathi-Indian-Legal-Llama-GGUF`).

---

## Setup & Running

### 1. Database
The app requires PostgreSQL. You can start it via Docker:
```bash
docker-compose up -d
```
Or create a database named `cip_db` on your local instance.

### 2. Backend (Spring Boot)
Ensure you have Java 17+ and Maven installed.
```bash
cd backend
mvn spring-boot:run
```
- **API URL**: `http://localhost:8080/api/v1`
- **Swagger Docs**: `http://localhost:8080/api/v1/swagger-ui.html`

### 3. Frontend (Vite + React)
```bash
cd frontend
npm install
npm run dev
```
- **App URL**: `http://localhost:5173`

---

## AI Configuration

By default, the app uses a **Mock LLM Service** for development without requiring local hardware.

To enable real AI inference:
1. Install [Ollama](https://ollama.ai/).
2. Pull the legal model: `ollama pull invincibleambuj/Ambuj-Tripathi-Indian-Legal-Llama-GGUF`
3. Update `backend/src/main/resources/application.yml`:
   ```yaml
   llm:
     mock: false
     ollama:
       model: ambuj-indian-legal-llama
   ```

---

## Default Login
You can register a new account on the login page or use the register API.
The first user registered for an organization name will automatically create that organization.
