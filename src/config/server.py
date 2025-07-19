from flask import Flask, request, jsonify
import imaplib
import email
from email.header import decode_header
from flask_cors import CORS
import openai
import os
import time
import logging
from dotenv import load_dotenv
from openai import OpenAI
from supabase import create_client, Client

# Load environment variables
load_dotenv()

# Flask setup
app = Flask(__name__)
CORS(app)

# Constants
EMAIL = "alihamzasultanacc3@gmail.com"
APP_PASSWORD = "ijwd wmln bcbd vsql"
VALID_CATEGORIES = ['urgent', 'support', 'sales', 'complaint', 'newsletter', 'other']
BATCH_SIZE = 10  # Number of emails to fetch per request

# Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# OpenAI setup
openai.api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=openai.api_key)

# Logger
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# Global variable to track fetched email IDs
fetched_email_ids = set()
@app.route("/api/reply", methods=["POST"])
def generate_reply():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        email_body = data.get("body", "")  # Changed from "email" to "body"
        
        if not email_body.strip():
            return jsonify({"error": "Email body content is required"}), 400
        
        prompt = f"""You're an email assistant. Read the following email and generate a concise, professional reply:
        
Email Content:
{email_body}

Reply:"""
        
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a helpful email assistant. Reply professionally and concisely."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=300,  # Reduced for more concise replies
            temperature=0.5  # Lower for more deterministic replies
        )

        reply = response.choices[0].message.content.strip()
        return jsonify({"reply": reply})
    
    except Exception as e:
        logger.error(f"Error in /api/reply: {str(e)}", exc_info=True)
        return jsonify({
            "error": "Failed to generate reply",
            "details": str(e)
        }), 500
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

@app.route("/api/send", methods=["POST"])
def send_email():
    data = request.get_json()
    recipient = data.get("to")
    reply_content = data.get("reply")
    subject = data.get("subject", "Re: Your email")

    if not recipient or not reply_content:
        return jsonify({"error": "Recipient and reply are required"}), 400

    try:
        # Create message
        msg = MIMEMultipart()
        msg['From'] = EMAIL
        msg['To'] = recipient
        msg['Subject'] = subject
        msg.attach(MIMEText(reply_content, 'plain'))

        # Send via SMTP
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(EMAIL, APP_PASSWORD)
            server.send_message(msg)
            logger.info(f"Email successfully sent to {recipient}")
        
        return jsonify({"status": "sent"})

    except smtplib.SMTPAuthenticationError:
        logger.error("SMTP Authentication Error - Check your credentials")
        return jsonify({"error": "SMTP authentication failed"}), 401
    except Exception as e:
        logger.error(f"SMTP Error: {str(e)}")
        return jsonify({"error": f"Failed to send email: {str(e)}"}), 500
def connect_to_gmail():
    imap = imaplib.IMAP4_SSL("imap.gmail.com")
    imap.login(EMAIL, APP_PASSWORD)
    return imap

def mark_as_seen(email_uid):
    try:
        imap = connect_to_gmail()
        imap.select("inbox")
        imap.store(str(email_uid), '+FLAGS', '\\Seen')
        imap.logout()
        logger.info(f"Email ID {email_uid} marked as seen.")
    except Exception as e:
        logger.warning(f"Failed to mark email ID {email_uid} as seen: {e}")

def classify_email(email_id: int, email_content: str):
    try:
        # First check if the columns exist
        try:
            existing = supabase.table("emails").select("categorized, category").eq("id", email_id).execute()
            if existing.data and existing.data[0].get("categorized"):
                return existing.data[0].get("category", "other")
        except Exception as e:
            logger.warning(f"Column check failed, assuming new schema: {e}")

        # Insert or update with default values
        supabase.table("emails").upsert({
            "id": email_id,
            "category": None,
            "categorized": False,
            "replied": False
        }).execute()

        # Generate classification
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Categorize this email with one word: urgent, support, sales, complaint, newsletter, or other"},
                {"role": "user", "content": email_content[:8000]}
            ],
            temperature=0.3,
            max_tokens=10
        )

        category = response.choices[0].message.content.lower().strip()
        final_category = category if category in VALID_CATEGORIES[:-1] else 'other'

        supabase.table("emails").update({
            "category": final_category,
            "categorized": True
        }).eq("id", email_id).execute()

        return final_category
    except Exception as e:
        logger.error(f"Error processing email ID {email_id}: {e}")
        return 'other'
@app.route("/api/emails", methods=["GET"])
def fetch_emails():
    try:
        global fetched_email_ids
        
        imap = connect_to_gmail()
        imap.select("inbox")
        
        # Fetch all emails (both seen and unseen), sorted by date in descending order
        status, messages = imap.search(None, "ALL")
        if status != "OK":
            return jsonify({"error": "Unable to fetch emails"}), 500

        all_email_ids = messages[0].split()
        all_email_ids = [eid for eid in all_email_ids if eid]  # Clean empty strings
        
        # Sort by newest first (higher numbers are newer in IMAP)
        sorted_email_ids = sorted(all_email_ids, key=lambda x: int(x), reverse=True)
        
        # Get only the 10 most recent emails
        recent_email_ids = sorted_email_ids[:10]
        
        emails = []

        for num in recent_email_ids:
            try:
                email_uid = int(num.decode())
                
                res, msg = imap.fetch(num, "(RFC822 FLAGS)")
                if res != "OK":
                    continue

                for response in msg:
                    if isinstance(response, tuple):
                        flags = msg[0][0] if msg and msg[0] else b""
                        is_read = b"\\Seen" in flags

                        msg_data = email.message_from_bytes(response[1])

                        subject, encoding = decode_header(msg_data["Subject"])[0]
                        if isinstance(subject, bytes):
                            subject = subject.decode(encoding or "utf-8", errors="ignore")

                        date = msg_data["Date"]
                        from_ = msg_data.get("From", "")
                        sender_email = email.utils.parseaddr(from_)[1]

                        body = ""
                        if msg_data.is_multipart():
                            for part in msg_data.walk():
                                content_type = part.get_content_type()
                                content_disposition = str(part.get("Content-Disposition"))
                                if content_type == "text/plain" and "attachment" not in content_disposition:
                                    try:
                                        body = part.get_payload(decode=True).decode()
                                        break
                                    except Exception:
                                        continue
                        else:
                            try:
                                body = msg_data.get_payload(decode=True).decode()
                            except Exception:
                                body = ""

                        category = classify_email(email_uid, body)

                        has_reply = False
                        try:
                            reply_check = supabase.table("emails").select("replied").eq("id", email_uid).execute()
                            if reply_check.data and len(reply_check.data) > 0:
                                has_reply = reply_check.data[0].get("replied", False)
                        except Exception as e:
                            logger.warning(f"Could not fetch 'replied' status for email ID {email_uid}: {e}")

                        emails.append({
                            "id": email_uid,
                            "from": sender_email,
                            "title": subject,
                            "date": date,
                            "read": "read" if is_read else "unread",
                            "replied": "replied" if has_reply else "not replied",
                            "classification": category,
                            "body": body.strip() if body else "No content",
                            "email": sender_email
                        })
            except Exception as e:
                logger.error(f"Error processing email ID {num}: {e}")
                continue

        imap.logout()
        return jsonify(emails)
    except Exception as e:
        logging.exception("Failed to fetch emails")
        return jsonify({"error": str(e)}), 500
# ... [rest of your existing code remains the same] ...

if __name__ == "__main__":
    app.run(debug=True)