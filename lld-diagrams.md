# Aether LLD Diagrams

```mermaid
sequenceDiagram
    autonumber
    participant U as User Browser
    participant UI as ChatContainer (Client)
    participant API as POST /api/messages/send
    participant SB as Supabase (Auth + DB + Storage)
    participant AI as Google Gemini

    U->>UI: Type message / attach files
    UI->>UI: Optimistic temp message
    UI->>API: multipart/form-data (message, files, chatId?)
    API->>SB: validate session via cookies
    alt chatId missing
        API->>AI: generateTitle(message)
        AI-->>API: chat title
        API->>SB: insert chats row
    end
    API->>SB: uploadAttachments(files)
    API->>SB: insert user message (attachments metadata)
    API->>SB: insert attachment_texts (full extracted text)
    API->>SB: update chats.updated_at
    API->>SB: select all messages ordered
    API->>AI: generateAIResponse(history + attachmentsContext)
    AI-->>API: assistant reply
    API->>SB: insert assistant message
    API-->>UI: {chatId, userMessage, aiMessage}
    UI->>UI: replace temp message, render response
    UI->>U: Updated chat
```

```mermaid
flowchart TD
    A[Start UploadAttachments] --> B{File type}
    B -->|PDF| C[parsePdf(buffer)]
    C --> D{Text extracted?}
    D -->|No| E[Log parse error] --> N[Return metadata only]
    D -->|Yes| F[normalizeExtractedText]
    F --> G[cleanAndTruncateText to MAX_ATTACHMENT_CONTEXT_CHARS]
    G --> H[Set attachment.summary + extractedText]
    H --> I[fullExtractedText = normalized text]
    B -->|Image| J[describeImage via Gemini Vision]
    J --> K{Summary?}
    K -->|Yes| L[Set summary & extractedText]
    L --> M[fullExtractedText = summary]
    K -->|No| N
    B -->|Other| N
    N --> O[Upload to Supabase Storage]
    O --> P[Create signed URL]
    P --> Q[Return attachment metadata, truncated + full text]
```

```mermaid
erDiagram
    USERS ||--o{ CHATS : owns
    CHATS ||--o{ MESSAGES : contains
    MESSAGES ||--o{ ATTACHMENT_TEXTS : has

    USERS {
        uuid id PK
        text email
        json metadata
    }

    CHATS {
        uuid id PK
        uuid user_id FK
        text title
        timestamptz created_at
        timestamptz updated_at
    }

    MESSAGES {
        uuid id PK
        uuid chat_id FK
        text role
        text content
        jsonb attachments
        timestamptz created_at
    }

    ATTACHMENT_TEXTS {
        uuid attachment_id PK
        uuid chat_id FK
        uuid message_id FK
        uuid user_id FK
        text storage_path
        text extracted_text
        timestamptz created_at
    }
```

