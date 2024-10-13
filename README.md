# SafeSpace

SafeSpace is an AI-powered healthcare platform designed to support patients in their health journey, from medication management to emotional well-being.

## Inspiration

Our project was inspired by the everyday challenges patients face, including:
- Difficulty in remembering to take medication
- Feeling isolated in their health journey
- The need for emotional support
- Preventing medication mistakes

We aimed to create a solution that not only manages symptoms but also supports patients emotionally, prevents medication errors, and fosters a sense of community.

## What it does

SafeSpace offers a comprehensive suite of features:

- AI assistant for medication reminders and mood tracking
- Journaling of mood, sentiment, and actions, shareable with healthcare providers
- Community connection with others facing similar health challenges
- Prescription and medication error prevention
- Answering medication-related questions
- Encouraging active patient participation in their care

These features lead to more accurate diagnoses and reduced financial burden for patients.

## How we built it

We developed a multi-component system including:

1. Voice assistant with OCR for transcript reading and storage
2. Sophisticated pipeline with STT, text processing, and TTS layers
3. LLM agents for conversation summarization
4. Artemis: RAG pipeline using LangChain for connecting users with similar experiences
5. Athena: Voice-powered problem understanding and solution provision
6. Sentiment analysis using RoBERTa Large Model
7. React web application for desktop access
8. React Native mobile app for Athena

## Challenges we ran into

Our main challenge was ensuring system usability, especially for users in mental distress. We focused on creating an intuitive UI that balances powerful features with simplicity.

## Accomplishments that we're proud of

- Created an accessible and user-friendly AI-powered health management platform
- Integrated features like medication reminders, mood tracking, and community support
- Bridged the gap for those struggling with traditional healthcare systems
- Empowered users to take control of their health journey

## What we learned

- Gained experience with new APIs
- Improved project management skills
- Enhanced team collaboration and communication
- Adapted to challenges within a tight timeframe

## What's next for SafeSpace

Future enhancements include:
- Drug interaction checking feature
- Anti-hallucination measures to prevent false diagnoses
- Robust encryption for secure data management and storage

## Built With

- Gemini
- Hugging Face
- MongoDB
- Multi-agent systems
- OpenAI
- PineconeDB
- Python
- PyTorch
- RAG (Retrieval-Augmented Generation)
- React
- STT (Speech-to-Text)
- Transformers
- TTS (Text-to-Speech)

---

For more information or to contribute to the project, please contact the SafeSpace team.
