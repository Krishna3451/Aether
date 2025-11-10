# Aether Low-Level Design

## 1. Overview
- **Purpose**: Financial-advisor style chat assistant with document & voice ingestion. Users converse, upload files, and receive AI responses grounded in conversation and extracted attachment context.
- **Platform**: Next.js 14 App Router (Node runtime) deployed as a single web app.
- **State & Auth**: Supabase for authentication (magic-link/OAuth), relational data, and object storage. Session is propagated via Supabase SSR client helpers.
- **AI Providers**: Google Gemini (`generateText`) for titles and chat answers; Deepgram Whisper for audio transcription; pdf-parse & Gemini Vision for attachment text extraction.

## 2. High-Level Runtime Flow
1. **User interacts** with React client (chat UI) → `ChatContainer` orchestrates optimistic updates and submits messages via `fetch("/api/messages/send")`.
2. **API Route** `POST /api/messages/send` receives multipart form data, authenticates via Supabase cookies, and ensures a chat exists.
3. **Attachment pipeline**:
   - Files uploaded to Supabase Storage under `ATTACHMENT_BUCKET`.
   - PDFs parsed with pdf-parse, images summarized with Gemini multimodal API; normalized text stored both truncated (for immediate chat context) and full (for persistence).
   - Attachment metadata persisted on `messages.attachments` JSON array; complete extracted text inserted into `attachment_texts` table.
4. **Message persistence**: Supabase `messages` table stores user entry, then AI answer generated via `generateAIResponse` and inserted.
5. **Chat context regeneration**: Full ordered history fetched from Supabase on every send; appended with latest user input + attachment summaries before invoking Gemini.
6. **UI refresh**: Response revalidated (`revalidatePath`) so concurrent clients receive updates; optimistic state reconciled in `ChatContainer`.
7. **Optional transcription**: Separate endpoint `POST /api/transcribe` proxies Deepgram for microphone input.

## 3. Frontend Composition
- **Routing**: `/` renders chat list; `/c/[id]` renders active conversation using SSR data fetched via `getChatWithMessages`.
- **Layout**: `MainWrapper`, `Desktop/Mobile` headers & sidebars manage responsive shell; `global/providers` injects theme & Supabase session context.
- **Chat UI**:
  - `ChatWrapper` splits history (`ChatList`) and composer (`ChatInput`).
  - `ChatMessage` formats markdown (via `Markdown` component) and renders attachments with size, summary preview, and download links.
  - Modals allow instructions, settings, search, message sharing.
- **Optimistic Behaviour**: `ChatContainer` stores temporary message list `oMessages`, revokes blob URLs after server ack.

## 4. Server Actions & Utilities
- `src/actions/chat.ts`:
  - Exports typed `Message`, `Attachment`, and chat helpers (`generateAIResponse`, `getChatWithMessages`, CRUD).
  - Hydrates attachments with fresh signed URLs per render.
  - Builds Gemini prompt via `buildFinancialAdvisorSystemPrompt`.
- `src/lib/supabase/*` creates server & client Supabase instances with cookie synchronization.
- `src/constants/*` centralise prompts, storage bucket names, system behaviours.

## 5. Message Send Pipeline (Detailed)
1. **Validate Input**: Reject empty message when no files provided.
2. **Ensure Chat**: Create `chats` row (title generated via Gemini) when first message in a thread.
3. **Attachment Handling** (`uploadAttachments`):
   - Buffer file, detect type.
   - PDF → `parsePdf` → `normalizeExtractedText` for full text & truncated summary.
   - Image → `describeImage` using Gemini multimodal; summary reused as both truncated and full text.
   - Upload to Supabase Storage; create signed URL fallback to public URL if signing fails.
4. **Persist**:
   - Insert user `messages` row with attachments array (id, name, mimeType, size, storagePath, url, summary, extractedText).
   - Insert rows in `attachment_texts` with full extracted text for downstream search/analytics.
   - Update `chats.updated_at`.
5. **Context Aggregation**:
   - Fetch entire chat history ordered by `created_at`.
   - Build user message content including `attachmentsContext` (file headings + truncated text).
6. **AI Response**:
   - `generateAIResponse` calls Google Gemini `gemini-2.0-flash` with system prompt, conversation, optional web-search tools flag.
   - On failure, returns user-friendly fallback string.
   - Persist assistant message (`role: "assistant"`).
7. **Invalidate Cache**: Trigger `revalidatePath` for dashboard and chat route to sync static segments.

## 6. Audio Transcription Endpoint
- `POST /api/transcribe` accepts audio file, forwards to Deepgram `whisper` model, returns transcript + confidence.
- Development mode optionally exposes API key (guarded by `DEEPGRAM_ENV` flag).
- Errors surfaced with descriptive logging, 500 fallback.

## 7. Data Model (Supabase)
- `auth.users`: Supabase-managed, referenced for ownership.
- `chats`: `{ id, user_id, title, created_at, updated_at }`.
- `messages`: `{ id, chat_id, role, content, attachments JSONB, created_at }`.
- `attachment_texts`: `{ attachment_id PK, chat_id FK, message_id FK, user_id FK, storage_path, extracted_text TEXT, created_at }`.
- Storage bucket `ATTACHMENT_BUCKET`: hierarchical path `<userId>/<chatId>/<timestamp-random>.<ext>`.

## 8. External Dependencies
- **Supabase**: Auth, Postgres, Storage, edge functions for SSR cookies.
- **Google Gemini**: Text completions for titles & responses; multimodal for image description.
- **pdf-parse**: Server-side PDF text extraction (direct import of `lib/pdf-parse.js` to avoid fixture load bug).
- **Deepgram**: Audio transcription (`@deepgram/sdk`).
- **UI**: shadcn/ui component factory, Tailwind CSS, Sonner for toasts.

## 9. Error Handling & Logging
- Console logs for extraction success (full text) and parser/model failures.
- Guard rails: authentication check returns 401; validation ensures message or attachment; upstream API failures bubble 500 with message.
- Attachment processing individually wrapped to avoid crashing entire request on a single file parse failure.

## 10. Environment Configuration
- Required env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `GOOGLE_API_KEY/NEXT_PUBLIC_GOOGLE_API_KEY`, `DEEPGRAM_API_KEY`, `ATTACHMENT_BUCKET`, optional `DEEPGRAM_ENV`.
- Runtime: Node.js for API routes (declared via `export const runtime = "nodejs"` in message route).

## 11. Extensibility Notes
- `attachment_texts` enables future semantic search/vectorization without inflating real-time prompt context.
- `generateAIResponse` signature includes `enableWebSearch` flag for future tool invocation.
- Attachment pipeline isolates parsing/description per file, making it easy to add new handlers (e.g., OCR for office docs).


