# Health Application API Guide

This guide provides detailed information about the available API endpoints for the Health Application backend. It includes information on how to make requests, what data to send, and what responses to expect.

## Base URL

All API requests should be made to:

```
http://localhost:8000/api
```

## Authentication

Currently, the API does not implement authentication. It's recommended to add authentication in the future for security purposes.

## API Endpoints

### 1. Create User

Create a new user in the system.

- **URL:** `/create_user`
- **Method:** POST
- **Content-Type:** application/json

**Request Body:**

```json
{
  "username": "johndoe",
  "email": "johndoe@example.com"
}
```

**Success Response:**

- **Code:** 201
- **Content:**

```json
{
  "message": "User created successfully",
  "user_id": "60a3e5b9c2f3a1234567890a"
}
```

### 2. Get User

Retrieve user information by user ID.

- **URL:** `/user/<user_id>`
- **Method:** GET

**Success Response:**

- **Code:** 200
- **Content:**

```json
{
  "_id": "60a3e5b9c2f3a1234567890a",
  "username": "johndoe",
  "email": "johndoe@example.com",
  "created_at": "2023-05-15T10:30:00Z"
}
```

**Error Response:**

- **Code:** 404
- **Content:**

```json
{
  "message": "User not found"
}
```

### 3. Get Username

Retrieve username by user ID.

- **URL:** `/user/username/<user_id>`
- **Method:** GET

**Success Response:**

- **Code:** 200
- **Content:**

```json
{
  "username": "johndoe"
}
```

**Error Response:**

- **Code:** 404
- **Content:**

```json
{
  "message": "User not found"
}
```

### 4. Get User ID

Retrieve user ID by username.

- **URL:** `/user/userid/<username>`
- **Method:** GET

**Success Response:**

- **Code:** 200
- **Content:**

```json
{
  "user_id": "60a3e5b9c2f3a1234567890a"
}
```

**Error Response:**

- **Code:** 404
- **Content:**

```json
{
  "message": "User not found"
}
```

### 5. Add Conversation

Add a new conversation to the user's timeline.

- **URL:** `/conversation`
- **Method:** POST
- **Content-Type:** application/json

**Request Body:**

```json
{
  "user_id": "60a3e5b9c2f3a1234567890a",
  "conversation": "This is the full conversation text...",
  "conversation_with": "bot",
  "conversation_type": "bot_conversation"
}
```

**Notes:**

- `conversation_type` can be `"bot_conversation"` or `"connection_conversation"`.
- For `connection_conversation`, `conversation_with` should be the username of the connected user.
- The backend will automatically generate `summary`, `sentiment`, and `takeaways` based on the conversation.

**Success Response:**

- **Code:** 201
- **Content:**

```json
{
  "message": "Conversation added successfully"
}
```

### 6. Add Notes

Add a new journal entry or notes to the user's timeline.

- **URL:** `/notes`
- **Method:** POST
- **Content-Type:** application/json

**Request Body:**

```json
{
  "user_id": "60a3e5b9c2f3a1234567890a",
  "notes": "This is the full text of the journal entry or notes..."
}
```

**Success Response:**

- **Code:** 201
- **Content:**

```json
{
  "message": "Notes added successfully"
}
```

### 7. Add Connection

Add a new connection for the user.

- **URL:** `/connection`
- **Method:** POST
- **Content-Type:** application/json

**Request Body:**

```json
{
  "user_id": "60a3e5b9c2f3a1234567890a",
  "connection_name": "Jane Doe",
  "connection_user_id": "60a3e5b9c2f3a1234567890b"
}
```

**Success Response:**

- **Code:** 201
- **Content:**

```json
{
  "message": "Connection added successfully"
}
```

### 8. Add Emergency

Record an emergency call.

- **URL:** `/emergency`
- **Method:** POST
- **Content-Type:** application/json

**Request Body:**

```json
{
  "user_id": "60a3e5b9c2f3a1234567890a",
  "hotline_called": "National Suicide Prevention Lifeline"
}
```

**Success Response:**

- **Code:** 201
- **Content:**

```json
{
  "message": "Emergency call recorded successfully"
}
```

### 9. Get Timeline

Retrieve the user's timeline.

- **URL:** `/timeline/<user_id>`
- **Method:** GET

**Success Response:**

- **Code:** 200
- **Content:**

```json
[
  {
    "_id": "60a3e5b9c2f3a1234567890c",
    "user_id": "60a3e5b9c2f3a1234567890a",
    "type": "bot_conversation",
    "conversation_with": "bot",
    "content": "Full conversation text...",
    "summary": "Summary of the conversation",
    "sentiment": "positive",
    "takeaways": [
      "Takeaway 1",
      "Takeaway 2",
      "Takeaway 3"
    ],
    "timestamp": 1623760000
  },
  {
    "_id": "60a3e5b9c2f3a1234567890d",
    "user_id": "60a3e5b9c2f3a1234567890a",
    "type": "notes",
    "content": "Full text of journal entry...",
    "summary": "Summary of the journal entry",
    "sentiment": "neutral",
    "timestamp": 1623773600
  },
  {
    "_id": "60a3e5b9c2f3a1234567890e",
    "user_id": "60a3e5b9c2f3a1234567890a",
    "type": "connection_added",
    "connection_name": "Jane Doe",
    "connection_user_id": "60a3e5b9c2f3a1234567890b",
    "timestamp": 1623787200
  },
  {
    "_id": "60a3e5b9c2f3a1234567890f",
    "user_id": "60a3e5b9c2f3a1234567890a",
    "type": "connection_conversation",
    "conversation_with": "Jane Doe",
    "content": "Full conversation text with Jane...",
    "summary": "Summary of the conversation with Jane",
    "sentiment": "negative",
    "takeaways": [
      "Takeaway A",
      "Takeaway B",
      "Takeaway C"
    ],
    "timestamp": 1623790800
  }
]
```

### 10. Add Prescription

Add a new prescription for the user.

- **URL:** `/prescription`
- **Method:** POST
- **Content-Type:** application/json

**Request Body:**

```json
{
  "user_id": "60a3e5b9c2f3a1234567890a",
  "tasks": [
    {
      "description": "Take medication A",
      "frequency": "daily",
      "checked": false,
      "expiry": "2024-12-31"
    },
    {
      "description": "Attend therapy session",
      "frequency": "weekly",
      "checked": true,
      "expiry": "2024-11-30"
    }
  ],
  "expiry": "2025-01-01"
}
```

**Notes:**

- `tasks` is a list of tasks, each with:
  - `description`: Description of the task.
  - `frequency`: `"daily"` or `"weekly"`.
  - `checked`: `true` or `false`.
  - `expiry`: Expiry date in `YYYY-MM-DD` format.
- `expiry` (optional): Expiry date for the entire prescription.

**Success Response:**

- **Code:** 201
- **Content:**

```json
{
  "message": "Prescription added successfully"
}
```

### 11. Get Prescriptions

Retrieve all prescriptions for the user.

- **URL:** `/prescription/<user_id>`
- **Method:** GET

**Success Response:**

- **Code:** 200
- **Content:**

```json
[
  {
    "_id": "60a3e5b9c2f3a12345678910",
    "user_id": "60a3e5b9c2f3a1234567890a",
    "tasks": [
      {
        "description": "Take medication A",
        "frequency": "daily",
        "checked": false,
        "expiry": "2024-12-31",
        "last_updated": "2024-05-15T08:00:00Z"
      },
      {
        "description": "Attend therapy session",
        "frequency": "weekly",
        "checked": true,
        "expiry": "2024-11-30",
        "last_updated": "2024-05-15T08:00:00Z"
      }
    ],
    "created_at": "2024-04-27T12:34:56Z",
    "expiry": "2025-01-01T00:00:00Z"
  },
  {
    "_id": "60a3e5b9c2f3a12345678911",
    "user_id": "60a3e5b9c2f3a1234567890a",
    "tasks": [
      {
        "description": "Meditate for 10 minutes",
        "frequency": "daily",
        "checked": false,
        "expiry": "2024-10-31",
        "last_updated": "2024-05-15T08:00:00Z"
      }
    ],
    "created_at": "2024-05-01T08:20:00Z",
    "expiry": "2024-12-31T00:00:00Z"
  }
]
```

## Error Handling

All endpoints will return appropriate HTTP status codes:

- **200:** OK - The request was successful
- **201:** Created - A new resource was successfully created
- **400:** Bad Request - The request was invalid or cannot be served
- **404:** Not Found - The requested resource could not be found
- **500:** Internal Server Error - The server encountered an unexpected condition

## Notes for Frontend Development

1. **Timestamps:**
   - All timestamps are in Unix time (seconds since epoch). You may need to convert these to readable dates on the frontend.

2. **Timeline Entries:**
   - The `get_timeline` endpoint returns all types of entries (`bot_conversation`, `connection_conversation`, `notes`, `connection_added`, `emergency_call`) in a single array.
   - Handle each type appropriately in your frontend display based on the `type` field.

3. **Sentiment Values:**
   - Sentiment values are strings (`"positive"`, `"negative"`, or `"neutral"`).
   - Use these for color-coding or icons in your UI to represent the sentiment of conversations and notes.

4. **Summaries and Takeaways:**
   - The backend automatically generates `summary`, `sentiment`, and `takeaways` for conversations and notes.
   - You do not need to send this information from the frontend; it is handled server-side.

5. **Conversations:**
   - When adding a conversation, specify the `conversation_type` as either `"bot_conversation"` or `"connection_conversation"`.
   - For `"connection_conversation"`, ensure `conversation_with` is the username of the connected user.

6. **Prescriptions:**
   - Display prescriptions based on their `frequency` (`daily`/`weekly`) and `expiry`.
   - Allow users to check/uncheck tasks.
   - Show prescriptions that are active (i.e., not expired) and highlight tasks that are pending based on their `checked` status.