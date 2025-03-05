from flask import Flask, request, jsonify, redirect
from flask_cors import CORS
import requests
import psycopg2
import bcrypt
import uuid
import json

app = Flask(__name__)
CORS(app)

# Database Connection Settings
DB_NAME = "tina"
DB_USER = "tina_owner"
DB_PASS = "npg_n74tzBTaCjEM"  # Change as needed
DB_HOST = "ep-small-fog-a5ybyq56-pooler.us-east-2.aws.neon.tech"

# ------------------------------
# Dummy Response Data (from tina.txt)
# ------------------------------
dummy_repository_response = {
    "success": True,
    "data": {
        "repository_id": "5f7a0521-e07c-42c8-a000-2a0aebfe22b0",
        "status": "success",
        "status_url": "microsoft/vscode"
    }
}

dummy_index_repository_response = {
    "repository": "microsoft/vscode",
    "branch": "master",
    "status": "indexing",
    "progress": {
        "stage": "completed",
        "message": "indexed",
        "progress": 123
    },
    "error": ""
}

dummy_query_response = {
    "source": "Proejct Source code details ",
    "content": "Details description of the project"
}

# -----------------------------------
# Helper: Get Database Connection
# (Use the provided SQL file to restore your database)
# SQL File:
# -----------------
# -- Drop table if needed:
# -- DROP TABLE public.users;
#
# CREATE TABLE public.users (
#     id serial4 NOT NULL,
#     username varchar(50) NOT NULL,
#     "password" varchar(255) NOT NULL,
#     api_key uuid NULL,
#     CONSTRAINT users_pkey PRIMARY KEY (id),
#     CONSTRAINT users_unique UNIQUE (api_key),
#     CONSTRAINT users_username_key UNIQUE (username)
# );
#
# INSERT INTO public.users
# (id, username, "password", api_key)
# VALUES(5, 'tester', '$2b$12$0ha1609sPxbx.PhpBbIIO./ARVw7wXGkiqiz5bQzHhS7JnegGpeAe', '7f048240-0b84-4291-b77e-f329b5779c12'::uuid);
# -----------------
def get_db_connection():
    conn = psycopg2.connect(
        host=DB_HOST,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASS,
    )
    return conn

# -----------------------------------
# Local Authentication Endpoints
# -----------------------------------

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    username = data.get("username")
    password = data.get("password")
    if not username or not password:
        return jsonify({"message": "Username and password are required"}), 400
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    password_hash = hashed_password.decode('utf8')
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO users (username, password) VALUES (%s, %s)", (username, password_hash))
        conn.commit()
        return jsonify({"message": "User registered successfully!"}), 201
    except psycopg2.Error as e:
        return jsonify({"message": "Registration failed", "error": str(e)}), 400
    finally:
        cursor.close()
        conn.close()

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")
    if not username or not password:
        return jsonify({"message": "Username and password are required"}), 400
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id, password FROM users WHERE username = %s", (username,))
        user = cursor.fetchone()
        if user and bcrypt.checkpw(password.encode('utf-8'), user[1].encode('utf-8')):
            new_api_key = str(uuid.uuid4())
            cursor.execute("UPDATE users SET api_key = %s WHERE id = %s", (new_api_key, user[0]))
            conn.commit()
            return jsonify({"message": "Login successful!", "username": username, "api_key": new_api_key})
        else:
            return jsonify({"message": "Invalid credentials"}), 401
    except psycopg2.Error as e:
        return jsonify({"message": "Login failed", "error": str(e)}), 400
    finally:
        cursor.close()
        conn.close()

def validate_api_key(api_key):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id FROM users WHERE api_key = %s", (api_key,))
        user = cursor.fetchone()
        return user is not None
    except psycopg2.Error:
        return False
    finally:
        cursor.close()
        conn.close()

# -----------------------------------
# Dummy External API Endpoints (Using tina.txt dummy responses)
# -----------------------------------

@app.route('/api/repositories', methods=['POST'])
def repositories():
    """
    Simulates indexing a repository.
    Request Example:
    {
      "repository": "microsoft/vscode",
      "branch": "main"
    }
    Dummy Response:
    {
      "success": true,
      "data": {
        "repository_id": "5f7a0521-e07c-42c8-a000-2a0aebfe22b0",
        "status": "success",
        "status_url": "microsoft/vscode"
      }
    }
    """
    return jsonify(dummy_repository_response)

@app.route('/api/index_repository/<repository_id>', methods=['POST'])
def index_repository(repository_id):
    """
    Simulates repository indexing status update.
    Request Example:
    {
      "repository": "microsoft/vscode",
      "branch": "master",
      "status": "indexing",
      "progress": {
          "stage": "completed",
          "message": "indexed",
          "progress": 123
      },
      "error": ""
    }
    Dummy Response: (Echoes back the dummy indexing data)
    """
    return jsonify(dummy_index_repository_response)

@app.route('/api/query', methods=['POST'])
def query():
    """
    Simulates a query to the repository.
    Request Example:
    {
      "messages": [
        {
          "role": "user",
          "content": "How does the error handling work in this codebase?"
        }
      ],
      "repositories": [
        {
          "repository": "microsoft/vscode"
        }
      ],
      "stream": false
    }
    Dummy Response:
    {
      "source": "Proejct Source code details ",
      "content": "Details description of the project"
    }
    """
    return jsonify(dummy_query_response)

@app.route('/api/repositoryanalysis', methods=['POST'])
def repository_analysis():
    """
    Simulates repository analysis.
    Request Example:
    {
      "repository": "microsoft/vscode",
      "branch": "main",
      "query": "what is the purpose this project"
    }
    Dummy Response:
    {
      "source": "Proejct Source code details ",
      "content": "Details description of the project"
    }
    """
    return jsonify(dummy_query_response)

# -----------------------------------
# GitHub OAuth Endpoints (Unchanged)
# -----------------------------------
GITHUB_CLIENT_ID = "Ov23ctjCH3T4v3DegFes"  # Replace with your GitHub client ID
GITHUB_CLIENT_SECRET = "46a00d8425806436570e24722c6cb51612267143"  # Final value
GITHUB_REDIRECT_URI = "http://localhost:5000/github/callback"

@app.route('/github/login')
def github_login():
    github_auth_url = "https://github.com/login/oauth/authorize"
    scope = "repo"  # Adjust scopes as needed
    state = "random_state_string"  # In production, generate and verify a secure random state
    auth_url = (
        f"{github_auth_url}?client_id={GITHUB_CLIENT_ID}"
        f"&redirect_uri={GITHUB_REDIRECT_URI}"
        f"&scope={scope}&state={state}"
    )
    return redirect(auth_url)

@app.route('/github/callback')
def github_callback():
    code = request.args.get("code")
    state = request.args.get("state")
    token_url = "https://github.com/login/oauth/access_token"
    payload = {
        "client_id": GITHUB_CLIENT_ID,
        "client_secret": GITHUB_CLIENT_SECRET,
        "code": code,
        "redirect_uri": GITHUB_REDIRECT_URI,
        "state": state
    }
    headers_token = {"Accept": "application/json"}
    
    try:
        token_response = requests.post(token_url, data=payload, headers=headers_token, timeout=10)
        token_response.raise_for_status()
    except requests.exceptions.RequestException as e:
        return jsonify({"message": "Error connecting to GitHub", "error": str(e)}), 500

    token_json = token_response.json()
    access_token = token_json.get("access_token")
    if not access_token:
        return jsonify({"message": "Failed to obtain access token", "error": token_json}), 400

    user_response = requests.get(
        "https://api.github.com/user",
        headers={"Authorization": f"token {access_token}"}
    )
    user_json = user_response.json()

    # Redirect to frontend with GitHub credentials as query parameters
    frontend_redirect = (
        f"http://localhost:5173/auth/github/callback?access_token={access_token}"
        f"&username={user_json.get('login')}&authType=github"
    )
    return redirect(frontend_redirect)

@app.route('/github/repos', methods=['GET'])
def github_repos():
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return jsonify({"message": "Access token is missing"}), 401

    parts = auth_header.split()
    token = parts[1] if (len(parts) == 2 and parts[0].lower() == "bearer") else auth_header

    headers_github = {"Authorization": f"token {token}"}
    response = requests.get("https://api.github.com/user/repos", headers=headers_github)
    if response.status_code == 200:
        return jsonify(response.json())
    else:
        return jsonify({"message": "Failed to fetch repositories", "error": response.text}), response.status_code

# -----------------------------------
# Wren AI (GraphQL Proxy) Endpoint (Unchanged)
# -----------------------------------
TARGET_API_URL = "https://wren.ai/graphql"  # Placeholder URL

@app.route('/api/codesmell', methods=['POST'])
def graphql_proxy():
    try:
        payload = request.get_json()
        response = requests.post(
            TARGET_API_URL,
            headers={"Content-Type": "application/json"},
            json=payload
        )
        return jsonify(response.json()), response.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ... (other imports and code remain unchanged)

@app.route('/api/filetree', methods=['POST'])
def filetree():
    """
    Returns a dummy file tree structure for a repository.
    Request Example:
    {
      "repository": "MyRepo",
      "branch": "main"
    }
    Dummy Response:
    {
      "tree": [
         {
           "type": "folder",
           "name": "src",
           "children": [
             { "type": "file", "name": "index.js" },
             { "type": "file", "name": "App.js" },
             {
               "type": "folder",
               "name": "components",
               "children": [
                 { "type": "file", "name": "Dashboard.js" },
                 { "type": "file", "name": "Header.js" }
               ]
             }
           ]
         },
         { "type": "file", "name": "package.json" },
         { "type": "file", "name": "README.md" }
      ]
    }
    """
    file_tree = {
        "tree": [
            {
                "type": "folder",
                "name": "src",
                "children": [
                    {"type": "file", "name": "index.js"},
                    {"type": "file", "name": "App.js"},
                    {
                        "type": "folder",
                        "name": "components",
                        "children": [
                            {"type": "file", "name": "Dashboard.js"},
                            {"type": "file", "name": "Header.js"}
                        ]
                    }
                ]
            },
            {"type": "file", "name": "package.json"},
            {"type": "file", "name": "README.md"}
        ]
    }
    return jsonify(file_tree)



# -----------------------------------
# Main
# -----------------------------------
if __name__ == '__main__':
    app.run(debug=True)
