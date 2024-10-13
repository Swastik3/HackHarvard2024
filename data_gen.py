# populate_mock_data.py

from pymongo import MongoClient, ASCENDING
from datetime import datetime, timedelta
from bson import ObjectId

def populate_mock_data():
    # Connect to MongoDB
    client = MongoClient("mongodb://localhost:27017/")
    db = client["main_db"]

    user_info = db["user_info"]
    user_data = db["user_data"]
    prescriptions = db["prescriptions"]

    # Clear existing data for a clean demo (Optional)
    # WARNING: This will delete all existing data in the collections
    user_info.delete_many({})
    user_data.delete_many({})
    prescriptions.delete_many({})

    user_info.create_index([("user_id", ASCENDING)], unique=True)
    prescriptions.create_index([("user_id", ASCENDING)])
    user_data.create_index([("user_id", ASCENDING), ("type", ASCENDING)])
    user_data.create_index([("goal_id", ASCENDING)])

    # 1. Create users: Jane Doe and John Doe
    users = [
        {
            "_id": 1,  # Explicit _id
            "user_id": 1,  # Explicit user_id
            "patient_name": "Jane Doe",
            "username": "jane_d",
            "email": "janedoe@example.com",
            "date_of_birth": "1985-01-01",
            "created_at": int(datetime.utcnow().timestamp() * 1000),  # UNIX timestamp in milliseconds
            "diagnosis": [
                "Generalized Anxiety Disorder (GAD)",
                "Post-Traumatic Stress Disorder (PTSD)",
            ],
            "prescription_date": "2024-10-12",
        },
        {
            "_id": 2,  # Explicit _id
            "user_id": 2,  # Explicit user_id
            "patient_name": "John Doe",
            "username": "john_d",
            "email": "johndoe@example.com",
            "date_of_birth": "1998-05-20",
            "created_at": int(datetime.utcnow().timestamp() * 1000),  # UNIX timestamp in milliseconds
            "diagnosis": ["Anorexia Nervosa"],
            "prescription_date": "2024-10-12",
        },
    ]

    user_info.insert_many(users)
    user_ids = [1, 2]  # As per explicit _id and user_id
    print(f"Created users with IDs: {', '.join(map(str, user_ids))}")

    # 2. Add prescriptions (goals) for Jane Doe
    jane_prescriptions = [
        {
            "user_id": 1,
            "prescription_date": "2024-10-12",
            "raw_text": """
Prescription
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
Attend weekly Cognitive Behavioral Therapy (CBT) sessions with a licensed
therapist.
Mindfulness Practices:
Engage in daily mindfulness meditation for at least 15 minutes.
Physical Exercise:
Participate in moderate physical activity (e.g., walking, yoga) for 30 minutes, at
least 5 days a week.
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
""",
            "tasks": [
                # Medications as tasks
                {
                    "type": "medication",
                    "task": "Take Calmvera 10 mg",
                    "details": {
                        "dosage": "Take one tablet orally twice daily after meals.",
                        "quantity": "60 tablets",
                        "refills": 1,
                    },
                    "completed": False,
                },
                {
                    "type": "medication",
                    "task": "Take Restwell XR 50 mg",
                    "details": {
                        "dosage": "Take one capsule orally at bedtime.",
                        "quantity": "30 capsules",
                        "refills": 1,
                    },
                    "completed": False,
                },
                # Therapeutic Activities as tasks
                {
                    "type": "therapeutic_activity",
                    "task": "Attend Cognitive Behavioral Therapy (CBT) Sessions",
                    "details": {
                        "description": "Attend weekly Cognitive Behavioral Therapy (CBT) sessions with a licensed therapist."
                    },
                    "completed": False,
                },
                {
                    "type": "therapeutic_activity",
                    "task": "Daily Mindfulness Meditation",
                    "details": {
                        "description": "Engage in daily mindfulness meditation for at least 15 minutes."
                    },
                    "completed": False,
                },
                {
                    "type": "therapeutic_activity",
                    "task": "Physical Exercise",
                    "details": {
                        "description": "Participate in moderate physical activity (e.g., walking, yoga) for 30 minutes, at least 5 days a week."
                    },
                    "completed": False,
                },
                {
                    "type": "therapeutic_activity",
                    "task": "Establish Sleep Hygiene",
                    "details": {
                        "description": "Establish a regular sleep schedule aiming for 7-9 hours of quality sleep per night."
                    },
                    "completed": False,
                },
                {
                    "type": "therapeutic_activity",
                    "task": "Daily Journaling",
                    "details": {
                        "description": "Write in a journal daily to reflect on thoughts and emotions."
                    },
                    "completed": False,
                },
            ],
            "created_at": int((datetime.utcnow() - timedelta(days=10)).timestamp() * 1000),  # 10 days ago in ms
            "expiry": int((datetime.utcnow() + timedelta(days=60)).timestamp() * 1000),      # 60 days from now in ms
            "last_updated": int(datetime.utcnow().timestamp() * 1000),
        }
    ]

    # 2. Add prescriptions (goals) for John Doe
    john_prescriptions = [
        {
            "user_id": 2,
            "prescription_date": "2024-10-12",
            "raw_text": """
Prescription
Patient Name: John Doe
Date: October 12, 2024
Date of Birth: May 20, 1998
Diagnosis:
Anorexia Nervosa
Medications
AppetiGrow 5 mg
Dosage: Take one tablet orally once daily in the morning with food.
Quantity: 30 tablets
Refills: 2
MoodLift XR 75 mg
Dosage: Take one capsule orally at bedtime.
Quantity: 30 capsules
Refills: 2
Therapeutic Activities
Psychotherapy:
Attend twice-weekly Cognitive Behavioral Therapy (CBT) sessions focusing on
eating behaviors and body image.
Nutritional Counseling:
Meet with a registered dietitian weekly to develop a personalized meal plan and
address nutritional deficiencies.
Physical Activity:
Engage in gentle yoga or stretching exercises 3 times a week, as recommended
by your healthcare provider.
Prescribing Physician:
Dr. Emily Roberts, MD
License No.: 789012
Signature: _____________________
Clinic Information:
Healthy Minds Clinic
789 Wellness Avenue
Anytown, State ZIP
Phone: (321) 654-0987
Email: contact@healthymindsclinic.com
""",
            "tasks": [
                # Medications as tasks
                {
                    "type": "medication",
                    "task": "Take AppetiGrow 5 mg",
                    "details": {
                        "dosage": "Take one tablet orally once daily in the morning with food.",
                        "quantity": "30 tablets",
                        "refills": 2,
                    },
                    "completed": False,
                },
                {
                    "type": "medication",
                    "task": "Take MoodLift XR 75 mg",
                    "details": {
                        "dosage": "Take one capsule orally at bedtime.",
                        "quantity": "30 capsules",
                        "refills": 2,
                    },
                    "completed": False,
                },
                # Therapeutic Activities as tasks
                {
                    "type": "therapeutic_activity",
                    "task": "Attend Cognitive Behavioral Therapy (CBT) Sessions",
                    "details": {
                        "description": "Attend twice-weekly Cognitive Behavioral Therapy (CBT) sessions focusing on eating behaviors and body image."
                    },
                    "completed": False,
                },
                {
                    "type": "therapeutic_activity",
                    "task": "Nutritional Counseling",
                    "details": {
                        "description": "Meet with a registered dietitian weekly to develop a personalized meal plan and address nutritional deficiencies."
                    },
                    "completed": False,
                },
                {
                    "type": "therapeutic_activity",
                    "task": "Physical Activity",
                    "details": {
                        "description": "Engage in gentle yoga or stretching exercises 3 times a week, as recommended by your healthcare provider."
                    },
                    "completed": False,
                },
            ],
            "created_at": int((datetime.utcnow() - timedelta(days=8)).timestamp() * 1000),  # 8 days ago in ms
            "expiry": int((datetime.utcnow() + timedelta(days=90)).timestamp() * 1000),      # 90 days from now in ms
            "last_updated": int(datetime.utcnow().timestamp() * 1000),
        }
    ]

    # Insert prescriptions
    prescriptions.insert_many(jane_prescriptions + john_prescriptions)
    print(f"Inserted {len(jane_prescriptions) + len(john_prescriptions)} prescriptions (goals) for Jane Doe and John Doe.")

    # 3. Add goals based on prescriptions
    # For each task in prescriptions, create a goal
    # Map: prescription_id -> task -> goal_id
    prescription_goals_map = {}  # prescription_id: [goal_ids]

    all_prescriptions = prescriptions.find()
    for pres in all_prescriptions:
        prescription_id = pres["_id"]
        prescription_goals_map[prescription_id] = []
        for task in pres["tasks"]:
            goal = {
                "user_id": pres["user_id"],
                "type": "goal",
                "text": task["task"],
                "details": task["details"],
                "completed": task["completed"],
                "frequency": "daily" if task["type"] == "medication" else "weekly",
                "created_at": pres["created_at"],
                "last_updated": pres["last_updated"],
                "expiry": pres["expiry"],
                "prescription_id": prescription_id,  # Link to prescription
            }
            inserted_goal = user_data.insert_one(goal)
            prescription_goals_map[prescription_id].append(inserted_goal.inserted_id)

    print(f"Inserted goals for each prescription.")

    # 4. Add timeline items (conversations, notes, goal completions, etc.)
    # Jane Doe's Timeline
    jane_timeline_items = [
        {
            "user_id": 1,
            "type": "emergency_call",
            "hotline_called": "Mental Health Hotline",
            "timestamp": int((datetime.utcnow() - timedelta(days=4)).timestamp() * 1000),
        },
        {
            "user_id": 1,
            "type": "bot_conversation",
            "conversation_with": None,
            "conversation_type": "text",
            "content": [
                {"sender": "bot", "message": "Hi Jane, how are you feeling today?"},
                {"sender": "user", "message": "I've been feeling quite anxious lately."},
                {"sender": "bot", "message": "I'm sorry to hear that. Would you like some techniques to manage your anxiety?"},
                {"sender": "user", "message": "Yes, please."},
                {"sender": "bot", "message": "Consider practicing deep breathing exercises or taking a short walk to help calm your mind."},
            ],
            "summary": "Bot initiated conversation about user's anxiety and provided management techniques.",
            "sentiment": "NEGATIVE",
            "mood": "ANXIOUS",
            "takeaways": "User is experiencing anxiety and is open to management techniques.",
            "timestamp": int((datetime.utcnow() - timedelta(days=3)).timestamp() * 1000),
        },
        {
            "user_id": 1,
            "type": "notes",
            "content": "Completed my daily mindfulness meditation session. Feeling more centered.",
            "summary": "Positive experience with mindfulness meditation.",
            "sentiment": "POSITIVE",
            "mood": "CENTERED",
            "timestamp": int((datetime.utcnow() - timedelta(days=2)).timestamp() * 1000),
        },
        {
            "user_id": 1,
            "type": "connection_conversation",
            "conversation_with": "Alice Smith",
            "conversation_type": "text",
            "content": [
                {"sender": "alice", "message": "Hey Jane! Let's catch up over coffee tomorrow."},
                {"sender": "user", "message": "Sure, Alice! Looking forward to it."},
                {"sender": "alice", "message": "Great! See you at 10 AM at our usual spot."},
            ],
            "summary": "Connection invited user for coffee.",
            "sentiment": "POSITIVE",
            "mood": "VERY HAPPY",
            "takeaways": "User has a social interaction scheduled.",
            "timestamp": int((datetime.utcnow() - timedelta(days=1)).timestamp() * 1000),
        },
        # Goal Completion for Jane Doe
        {
            "user_id": 1,
            "type": "goal_completion",
            "goal_id": None,  # To be updated
            "task": "Take Calmvera 10 mg",
            "completed": True,
            "timestamp": int((datetime.utcnow() - timedelta(days=1)).timestamp() * 1000),
        },
    ]

    # John Doe's Timeline
    john_timeline_items = [
        {
            "user_id": 2,
            "type": "notes",
            "content": "Struggled with appetite today, but had a nutritious meal plan.",
            "summary": "Managing anorexia symptoms with meal planning.",
            "sentiment": "NEUTRAL",
            "mood": "NERVOUS",
            "timestamp": int((datetime.utcnow() - timedelta(days=6)).timestamp() * 1000),
        },
        {
            "user_id": 2,
            "type": "bot_conversation",
            "conversation_with": None,
            "conversation_type": "text",
            "content": [
                {"sender": "bot", "message": "Good morning, John! How are you feeling today?"},
                {"sender": "user", "message": "I've been having some challenges with my appetite."},
                {"sender": "bot", "message": "I'm sorry to hear that. Would you like some strategies to help improve your appetite?"},
                {"sender": "user", "message": "Yes, that would be helpful."},
                {"sender": "bot", "message": "Try eating small, frequent meals and incorporating favorite foods to make meals more enjoyable."},
            ],
            "summary": "Bot initiated conversation about user's appetite challenges and provided strategies.",
            "sentiment": "NEGATIVE",
            "mood": "DISCOURAGED",
            "takeaways": "User is struggling with appetite and open to strategies for improvement.",
            "timestamp": int((datetime.utcnow() - timedelta(days=5)).timestamp() * 1000),
        },
        {
            "user_id": 2,
            "type": "notes",
            "content": "Had a meeting with my dietitian today. Updated my meal plan to include more proteins.",
            "summary": "Nutritional counseling session to improve meal plan.",
            "sentiment": "POSITIVE",
            "mood": "HOPEFUL",
            "timestamp": int((datetime.utcnow() - timedelta(days=3)).timestamp() * 1000),
        },
        {
            "user_id": 2,
            "type": "notes",
            "content": "Completed my gentle yoga session. Feeling more flexible and relaxed.",
            "summary": "Positive experience with yoga session.",
            "sentiment": "POSITIVE",
            "mood": "RELAXED",
            "timestamp": int((datetime.utcnow() - timedelta(days=2)).timestamp() * 1000),
        },
        # Goal Completion for John Doe
        {
            "user_id": 2,
            "type": "goal_completion",
            "goal_id": None,  # To be updated
            "task": "Take AppetiGrow 5 mg",
            "completed": True,
            "timestamp": int((datetime.utcnow() - timedelta(days=1)).timestamp() * 1000),
        },
    ]

    # Combine all timeline items
    all_timeline_items = jane_timeline_items + john_timeline_items

    # Insert timeline items
    inserted_timeline = user_data.insert_many(all_timeline_items)
    print(f"Inserted {len(all_timeline_items)} timeline items for Jane Doe and John Doe.")

    # 4. Add additional notes
    jane_additional_notes = [
        {
            "user_id": 1,
            "type": "notes",
            "content": "Started a new yoga routine today, feeling more flexible and relaxed.",
            "summary": "Positive experience with new yoga routine.",
            "sentiment": "POSITIVE",
            "mood": "RELAXED",
            "timestamp": int((datetime.utcnow() - timedelta(days=1)).timestamp() * 1000),
        }
    ]

    john_additional_notes = [
        {
            "user_id": 2,
            "type": "notes",
            "content": "Felt more energized after today's gentle stretching exercises.",
            "summary": "Positive outcome from stretching exercises.",
            "sentiment": "POSITIVE",
            "mood": "ENERGIZED",
            "timestamp": int((datetime.utcnow() - timedelta(days=1)).timestamp() * 1000),
        }
    ]

    all_additional_notes = jane_additional_notes + john_additional_notes
    user_data.insert_many(all_additional_notes)
    print(f"Inserted {len(all_additional_notes)} additional notes for Jane Doe and John Doe.")

    # 5. Add conversations (multi-turn and longer)
    jane_conversations = [
        # Conversation 3 days ago
        {
            "user_id": 1,
            "type": "bot_conversation",
            "conversation_with": None,
            "conversation_type": "text",
            "content": [
                {"sender": "bot", "message": "Hi Jane, how are you feeling today?"},
                {"sender": "user", "message": "I've been feeling quite anxious lately."},
                {"sender": "bot", "message": "I'm sorry to hear that. Would you like some techniques to manage your anxiety?"},
                {"sender": "user", "message": "Yes, please."},
                {"sender": "bot", "message": "Consider practicing deep breathing exercises or taking a short walk to help calm your mind."},
            ],
            "summary": "Bot initiated conversation about user's anxiety and provided management techniques.",
            "sentiment": "NEGATIVE",
            "mood": "ANXIOUS",
            "takeaways": "User is experiencing anxiety and is open to management techniques.",
            "timestamp": int((datetime.utcnow() - timedelta(days=3)).timestamp() * 1000),
        },
        # Conversation 2 days ago
        {
            "user_id": 1,
            "type": "bot_conversation",
            "conversation_with": None,
            "conversation_type": "text",
            "content": [
                {"sender": "bot", "message": "Remember to take your Calmvera 10 mg."},
                {"sender": "user", "message": "Thanks for the reminder! I've taken it this morning."},
                {"sender": "bot", "message": "Great! Keep it up to maintain your well-being."},
            ],
            "summary": "Bot reminded user to take medication.",
            "sentiment": "NEUTRAL",
            "mood": "NEUTRAL",
            "takeaways": "User acknowledged medication reminder.",
            "timestamp": int((datetime.utcnow() - timedelta(days=2)).timestamp() * 1000),
        },
        # Conversation 1 day ago
        {
            "user_id": 1,
            "type": "connection_conversation",
            "conversation_with": "Alice Smith",
            "conversation_type": "text",
            "content": [
                {"sender": "alice", "message": "Hey Jane! Let's catch up over coffee tomorrow."},
                {"sender": "user", "message": "Sure, Alice! Looking forward to it."},
                {"sender": "alice", "message": "Great! See you at 10 AM at our usual spot."},
            ],
            "summary": "Connection invited user for coffee.",
            "sentiment": "POSITIVE",
            "mood": "VERY HAPPY",
            "takeaways": "User has a social interaction scheduled.",
            "timestamp": int((datetime.utcnow() - timedelta(days=1)).timestamp() * 1000),
        },
    ]

    john_conversations = [
        # Conversation 5 days ago
        {
            "user_id": 2,
            "type": "bot_conversation",
            "conversation_with": None,
            "conversation_type": "text",
            "content": [
                {"sender": "bot", "message": "Good morning, John! How are you feeling today?"},
                {"sender": "user", "message": "I've been having some challenges with my appetite."},
                {"sender": "bot", "message": "I'm sorry to hear that. Would you like some strategies to help improve your appetite?"},
                {"sender": "user", "message": "Yes, that would be helpful."},
                {"sender": "bot", "message": "Try eating small, frequent meals and incorporating favorite foods to make meals more enjoyable."},
            ],
            "summary": "Bot initiated conversation about user's appetite challenges and provided strategies.",
            "sentiment": "NEGATIVE",
            "mood": "DISCOURAGED",
            "takeaways": "User is struggling with appetite and open to strategies for improvement.",
            "timestamp": int((datetime.utcnow() - timedelta(days=5)).timestamp() * 1000),
        },
        # Conversation 2 days ago
        {
            "user_id": 2,
            "type": "bot_conversation",
            "conversation_with": None,
            "conversation_type": "text",
            "content": [
                {"sender": "bot", "message": "Remember to take your AppetiGrow 5 mg."},
                {"sender": "user", "message": "Thanks for the reminder! I've taken it this morning."},
                {"sender": "bot", "message": "Great! Keep it up to maintain your appetite."},
            ],
            "summary": "Bot reminded user to take medication.",
            "sentiment": "NEUTRAL",
            "mood": "NEUTRAL",
            "takeaways": "User acknowledged medication reminder.",
            "timestamp": int((datetime.utcnow() - timedelta(days=2)).timestamp() * 1000),
        },
        # Conversation 1 day ago
        {
            "user_id": 2,
            "type": "connection_conversation",
            "conversation_with": "Bob Johnson",
            "conversation_type": "text",
            "content": [
                {"sender": "bob", "message": "Hey John! Are you free for a walk this evening?"},
                {"sender": "user", "message": "Sure, Bob! That sounds nice."},
                {"sender": "bob", "message": "Awesome! Let's meet at the park at 6 PM."},
            ],
            "summary": "Connection invited user for a walk.",
            "sentiment": "POSITIVE",
            "mood": "HAPPY",
            "takeaways": "User has a physical activity planned with a connection.",
            "timestamp": int((datetime.utcnow() - timedelta(days=1)).timestamp() * 1000),
        },
    ]

    # Combine all conversations
    all_conversations = jane_conversations + john_conversations

    # Insert conversations
    user_data.insert_many(all_conversations)
    print(f"Inserted {len(all_conversations)} conversations for Jane Doe and John Doe.")

    # 6. Add connections
    jane_connections = [
        {
            "user_id": 1,
            "type": "connection_added",
            "connection_name": "Alice Smith",
            "connection_user_id": "alice_id_456",
            "timestamp": int((datetime.utcnow() - timedelta(days=5)).timestamp() * 1000),
        }
    ]

    john_connections = [
        {
            "user_id": 2,
            "type": "connection_added",
            "connection_name": "Bob Johnson",
            "connection_user_id": "bob_id_789",
            "timestamp": int((datetime.utcnow() - timedelta(days=4)).timestamp() * 1000),
        }
    ]

    all_connections = jane_connections + john_connections
    user_data.insert_many(all_connections)
    print(f"Inserted {len(all_connections)} connections for Jane Doe and John Doe.")

    # 7. Update goal_completion items with goal IDs
    # Retrieve prescriptions to get their IDs
    jane_prescription_records = list(prescriptions.find({"user_id": 1}))
    john_prescription_records = list(prescriptions.find({"user_id": 2}))

    if jane_prescription_records:
        # Assuming each prescription corresponds to multiple goals (tasks)
        # We'll associate goal_completion with the first goal in the prescription
        jane_prescription_id = jane_prescription_records[0]["_id"]
        jane_goals = prescription_goals_map.get(jane_prescription_id, [])
    else:
        jane_goals = []

    if john_prescription_records:
        john_prescription_id = john_prescription_records[0]["_id"]
        john_goals = prescription_goals_map.get(john_prescription_id, [])
    else:
        john_goals = []

    # Update Jane's 'goal_completion' timeline item
    for item in jane_timeline_items:
        if item["type"] == "goal_completion":
            if jane_goals:
                # Assign the first goal_id (you can modify this logic as needed)
                item["goal_id"] = jane_goals[0]
                user_data.update_one(
                    {"user_id": item["user_id"], "type": "goal_completion", "task": item["task"]},
                    {"$set": {"goal_id": ObjectId(jane_goals[0])}},
                )

    # Update John's 'goal_completion' timeline item
    for item in john_timeline_items:
        if item["type"] == "goal_completion":
            if john_goals:
                # Assign the first goal_id (you can modify this logic as needed)
                item["goal_id"] = john_goals[0]
                user_data.update_one(
                    {"user_id": item["user_id"], "type": "goal_completion", "task": item["task"]},
                    {"$set": {"goal_id": ObjectId(john_goals[0])}},
                )

    print("Updated goal_completion items with goal IDs.")

    print("Mock data population complete.")

if __name__ == "__main__":
    populate_mock_data()
