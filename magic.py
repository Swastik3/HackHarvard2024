from openai import OpenAI
from dotenv import load_dotenv
load_dotenv()
import os



os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")


client = OpenAI()

Prescription = """Prescription

Patient Name: Jane Doe
Date: October 12, 2024
Date of Birth: January 1, 1985
Diagnosis:
Generalized Anxiety Disorder (GAD)
Post-Traumatic Stress Disorder (PTSD)

Medications
Calmvera 10 mg
Dosage: Take one tablet orally twice daily after meals.
Quantity: 60 tablets
Refills: 1
Restwell XR 50 mg
Dosage: Take one capsule orally at bedtime.
Quantity: 30 capsules
Refills: 1

Therapeutic Activities
Psychotherapy:
Attend weekly Cognitive Behavioral Therapy (CBT) sessions with a licensed therapist.
Mindfulness Practices:
Engage in daily mindfulness meditation for at least 15 minutes.
Physical Exercise:
Participate in moderate physical activity (e.g., walking, yoga) for 30 minutes, at least 5 days a week.
Sleep Hygiene:
Establish a regular sleep schedule aiming for 7-9 hours of quality sleep per night.
Journaling:
Write in a journal daily to reflect on thoughts and emotions.


Prescribing Physician:
Dr. John Smith, MD
License No.: 123456
Signature: _____________________
Clinic Information:
Wellness Mental Health Center
123 Healing Way
Anytown, State ZIP
Phone: (123) 456-7890
Email: info@wellnessmhc.com
"""
messages=[{
                'role': 'system',
                'content': f""""You are a mental health professional and your job is to perform a daily check up by
                talking to the user and taking a record of things that the user has done on that particular day.
                You need to talk to the user and ask them questions based on their prescription. For ecample, 
                ask them if they have taken their required medicine or not, if they have doe some kind of physical activity or no etc.
                Do not ask all the questions at once as this is going to be more like a real life conversation.

                This is the prescription that you need to follow:
                {Prescription}

                If needed console the user and listen to their problems.
                Talk to them like a friend and provide them with the best possible advice while being a supportive listener.
                You need to sound as Human as possible as your text will be converted to speech.

                **Ways to Sound Human:**
                Emphasis syllables and  energy words by adding excalamtion marks
                Add pauses and hmms and other human like sounds in your text.
                Be as energetic and supportive as possible.
                

                Talk more casually and sound like this: use a bunch of expressions, maybe throw in a few pauses, you know, just to feel more real. 
                It would also show more emotion, like getting excited when something is cool or
                being super empathetic when something is tough. Oh, and instead of being all formal and structured, it’d just be more chill. 
                Like, instead of saying “I understand your question. The answer is yes, I can assist with that,” 
                it’d be more like “Yeah, I get it! Totally, I can help you with that.”
                """
            }]

def nike():
    audio_file= open("input.mp3", "rb")
    transcription = client.audio.transcriptions.create(
    model="whisper-1", 
    file=audio_file
    )
    print(transcription.text)



    formatted_user_query = f"""
        This is the Query:\n
        {transcription.text}
    """
    messages.append(
            {
                'role': 'user',
                'content': transcription.text
            })
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
    )
    out = response.choices[0].message.content
    print(out)
    messages.append(
            {
                'role': 'assistant',
                'content': out
            })
    

    with client.audio.speech.with_streaming_response.create(
    model="tts-1-hd",
    voice="shimmer",
    input=out
    ) as  response:
        response.stream_to_file("speech.mp3")
  
def get_messages():
    return messages

def reset():
    global messages
    messages = []


if __name__ == '__main__':
    nike()