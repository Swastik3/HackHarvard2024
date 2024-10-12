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

Note: `conversation_type` can be "bot_conversation" or "human_conversation".

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
    "type": "connection",
    "connection_name": "Jane Doe",
    "connection_user_id": "60a3e5b9c2f3a1234567890b",
    "timestamp": 1623787200
  }
]
```

## Error Handling

All endpoints will return appropriate HTTP status codes:

- 200: OK - The request was successful
- 201: Created - A new resource was successfully created
- 400: Bad Request - The request was invalid or cannot be served
- 404: Not Found - The requested resource could not be found
- 500: Internal Server Error - The server encountered an unexpected condition

## Notes for Frontend Development

1. All timestamps are in Unix time (seconds since epoch). You may need to convert these to readable dates on the frontend.

2. The `get_timeline` endpoint returns all types of entries (conversations, notes, connections, emergencies) in a single array. You'll need to handle each type appropriately in your frontend display.

3. Sentiment values are strings ("positive", "negative", or "neutral"). You might want to use these for color-coding or icons in your UI.

4. The backend automatically generates summaries and sentiment analysis for conversations and notes. You don't need to send this information from the frontend.

5. For conversations, make sure to specify the `conversation_type` as either "bot_conversation" or "human_conversation" when adding a new conversation.

6. There's currently no pagination for the timeline endpoint. If you're dealing with large amounts of data, you might want to implement pagination on both frontend and backend.

7. Consider implementing real-time updates using WebSockets if you want to show new timeline entries immediately without refreshing.

Remember to handle errors gracefully in your frontend application and provide appropriate feedback to the user.
