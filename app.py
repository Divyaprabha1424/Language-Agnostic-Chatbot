from flask import Flask, render_template, request, jsonify
from langdetect import detect
import pymysql
import google.generativeai as genai
import os



app = Flask(__name__)

# ==========================
# Gemini API
# ==========================
# ==========================

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-2.5-flash")



# ==========================
# MySQL Connection
# ==========================


db = pymysql.connect(
    host=os.getenv("DB_HOST"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    database=os.getenv("DB_NAME"),
    port=int(os.getenv("DB_PORT")),
    cursorclass=pymysql.cursors.DictCursor
)

cursor = db.cursor()

# ==========================
# Home
# ==========================
@app.route("/")
def home():
    return render_template("index.html")

# ==========================
# Chat
# ==========================

@app.route("/chat", methods=["POST"])
def chat():

    data = request.get_json()
    message = data["message"]

    try:
        language = detect(message)

        response = model.generate_content(message)
        reply = response.text

    except Exception as e:
        print(e)
        language = "Unknown"
        reply = "Sorry! Something went wrong."

    cursor.execute("""
        INSERT INTO chats(user_message,bot_reply,language)
        VALUES(%s,%s,%s)
    """,(message,reply,language))

    db.commit()

    return jsonify({
        "reply":reply
    })

# ==========================
# History
# ==========================
@app.route("/history")
def history():

    cursor.execute("""
        SELECT id,user_message,bot_reply,language
        FROM chats
        ORDER BY id DESC
    """)

    chats = cursor.fetchall()

    return render_template(
        "history.html",
        chats=chats
    )

# ==========================
# Delete One Chat
# ==========================
@app.route("/delete_chat/<int:id>",methods=["POST"])
def delete_chat(id):

    cursor.execute(
        "DELETE FROM chats WHERE id=%s",
        (id,)
    )

    db.commit()

    return jsonify({
        "status":"success"
    })

# ==========================
# Clear All History
# ==========================
@app.route("/clear",methods=["POST"])
def clear():

    cursor.execute("DELETE FROM chats")

    db.commit()

    return jsonify({
        "message":"Chat history cleared successfully."
    })

# ==========================
# Run
# ==========================
if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.getenv("PORT", 5000)),
        debug=True
    )