from flask import Flask, request, jsonify, redirect
from psycopg2.extras import RealDictCursor

from flask_cors import CORS
import requests
import psycopg2
import bcrypt
import uuid
import re
import json
import time
from datetime import datetime, timezone 

app = Flask(__name__)
CORS(app)
TARGET_API_URL = "https://codesenseai.mannit.co/api/graphql"
API_URL = "https://codesenseai.mannit.co/api/graphql"
STREAM_URL="https://codesenseai.mannit.co/api/ask_task/streaming_answer?responseId="
POLLING_INTERVAL = 2  # Seconds between polling requests
# -----------------------------------
# Database Connection Settings
# -----------------------------------
DB_NAME = "tina"
DB_USER = "tina_owner"
DB_PASS = "npg_n74tzBTaCjEM"  # Change as needed
DB_HOST = "ep-small-fog-a5ybyq56-pooler.us-east-2.aws.neon.tech"
DB_PORT = "5432"

# -----------------------------------
# External API Settings (Trynia)
# -----------------------------------
base_url = "https://api.trynia.ai/v2/"
endpoint_index = "repositories"
endpoint_status = "repositories"
endpoint_query = "query"
nia_api_key = "Bearer QZEJczlDqXD8cH3QeIjldj84UXt6LoCQ"
# (api_key variable is optional; here we use nia_api_key for external API auth)
headers = {
    "Authorization": f"Bearer YOUR_API_KEY",  # Replace with your actual key if needed
    "Content-Type": "application/json"
}

# -----------------------------------
# Helper: Get Database Connection
# -----------------------------------
def get_db_connection():
    conn = psycopg2.connect(
        host=DB_HOST,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASS,
        port=DB_PORT
    )
    return conn

# -----------------------------------
# Local Authentication Endpoints
# -----------------------------------

@app.route('/register', methods=['POST'])
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

@app.route('/login', methods=['POST'])
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
            return jsonify({
                "message": "Login successful!",
                "username": username,
                "api_key": new_api_key,
                "user_id": user[0]
            })
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

# Insert a new message
@app.route('/add_question', methods=['POST'])
def add_message():
    data = request.get_json()
    user_id = data['user_id']
    chat_type = data['chat_type']
    question = data['question']
    projectname=data['projectname']
    repositoryname=data['repositoryname']
    branch=data['branch']
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO question_history ( user_id, chat_type, "timestamp", question, repositoryname, branchname, projectname)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """, (user_id, chat_type, datetime.now(timezone.utc), question,repositoryname,branch,projectname))
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({'status': 'Message added successfully'})

# Fetch messages by user ID
@app.route('/get_questions', methods=['GET'])
def get_messages():
    data = request.get_json()
    user_id = data['user_id']
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("""
        SELECT * FROM question_history
        WHERE user_id = %s
    """, (user_id))
    messages = cur.fetchall()
    cur.close()
    conn.close()

    return jsonify(messages)
# -----------------------------------
# Trynia Functionality Endpoints
# -----------------------------------

@app.route('/api/repositories', methods=['POST'])
def index_repository():
    api_key_header = request.headers.get("API-Key")
    if not validate_api_key(api_key_header):
        return jsonify({"message": "Invalid API key"}), 401
    data = request.json
    repository = data.get("repository")
    branch = data.get("branch")
    response = get_repository(repository, branch)
    if response.status_code == 200:
        return jsonify({"message": "Repository indexed successfully!", "data": response.json()})
    else:
        return jsonify({"message": "Failed to index repository", "error": response.json()}), response.status_code
    
@app.route('/api/query', methods=['POST'])
def query_indexed_repositories():
    data = request.json
    repository = data.get("repository")
    query = data.get("query")
    role = data.get("role")
    api_key = request.headers.get("API-Key")

    if not validate_api_key(api_key):
        return jsonify({"message": "Invalid API key"}), 401

    response = query_repositories(role, query, repository)
    if response.status_code == 200:
        final_text = response.text

        # Extract sources (expecting a JSON array inside the text)
        source_regex = r'"sources":\s*(\[[^\]]*\])'
        source_match = re.search(source_regex, final_text)
        if source_match:
            try:
                source_array = json.loads(source_match.group(1))
            except Exception as e:
                print("Error parsing sources:", e)
                source_array = []
        else:
            source_array = []

        # Extract content pieces using regex
        #print(final_text)
        content_regex = r'data:\s*{\s*"content":\s*"([^"]+)"\s*}'
        content_pieces = re.findall(content_regex, final_text)
        clean_content = "\n\n".join(content_pieces).strip()
        # Step 1: Remove extra spaces
        cleaned_paragraph = re.sub(r'\s+', ' ', clean_content)
        # Step 2: Fix newline and space issues
        formatted_paragraph = cleaned_paragraph.replace("\\n", "\n")

        print(formatted_paragraph)
        #print(clean_content)
        return jsonify({
            "message": "Repository fetched successfully!",
            "source": source_array,
            "content": formatted_paragraph
        })

    else:
        return jsonify({"message": "Failed to query repository", "error": response.json()}), response.status_code


@app.route('/api/index_repository', methods=['GET'])
def get_indexing_status():

    data = request.json
  
    api_key = request.headers.get("API-Key")
    if not validate_api_key(api_key):
        return jsonify({"message": "Invalid API key"}), 401
    repository_id = data.get("repository_id")
    response = get_repository_details(repository_id);

    if response.status_code == 200:
        return jsonify({"message": "Repository fetched successfully!", "data": response.json()})
    else:
        return jsonify({"message": "Failed to fetch repository", "error": response.json()}), response.status_code
    

@app.route('/api/repositoryanalysis', methods=['POST'])
def repository_analysis():
    data = request.json
    repository_input = data.get("repository")
    branch_input = data.get("branch")
    role_input = data.get("role")
    query_input = data.get("query")

    # Step 1: Get repository data via trynia API
    repo_response_obj = get_repository(repository_input, branch_input)
    if repo_response_obj.status_code != 200:
        return jsonify({"error": "Failed to get repository", "details": repo_response_obj.text}), repo_response_obj.status_code

    repository_response = repo_response_obj.json()
    repository_id = repository_response.get("data", {}).get("repository_id")
    if not repository_id:
        return jsonify({"error": "Repository ID not found", "details": repository_response}), 400

    print("Repository ID:", repository_id)

    # Step 2: (Optional) Fetch repository details for logging
    repository_details = get_repository_details(repository_id)
    print("Repository details status:", repository_details.status_code)
    print("Repository details:", repository_details.json())

    # Step 3: Query repository via trynia API
    final_response = query_repositories(role_input, query_input, repository_input)
    print("Query response status:", final_response.status_code)
    print("Query response text:", final_response.text)
    if final_response.status_code != 200:
        return jsonify({"message": "Failed to query repository", "error": final_response.json()}), final_response.status_code

    final_text = final_response.text

    # Extract sources (expecting a JSON array inside the text)
    source_regex = r'"sources":\s*(\[[^\]]*\])'
    source_match = re.search(source_regex, final_text)
    if source_match:
        try:
            source_array = json.loads(source_match.group(1))
        except Exception as e:
            print("Error parsing sources:", e)
            source_array = []
    else:
        source_array = []

    # Extract content pieces using regex
    #print(final_text)
    content_regex = r'data:\s*{\s*"content":\s*"([^"]+)"\s*}'
    content_pieces = re.findall(content_regex, final_text)
    clean_content = "\n\n".join(content_pieces).strip()
    # Step 1: Remove extra spaces
    cleaned_paragraph = re.sub(r'\s+', ' ', clean_content)
    # Step 2: Fix newline and space issues
    formatted_paragraph = cleaned_paragraph.replace("\\n", "\n")

    print(formatted_paragraph)
    #print(clean_content)
    return jsonify({
        "message": "Repository fetched successfully!",
        "source": source_array,
        "content": formatted_paragraph
    })

def get_repository(repository, branch):
    headers_external = {
        "Authorization": nia_api_key,
        "Content-Type": "application/json"
    }
    payload = {"repository": repository, "branch": branch}
    response = requests.post(f"{base_url}{endpoint_index}", headers=headers_external, json=payload)
    return response

def get_repository_details(repository_id):
    headers_external = {
        "Authorization": nia_api_key,
        "Content-Type": "application/json"
    }
    response = requests.get(f"{base_url}{endpoint_status}/{repository_id}", headers=headers_external)
    return response

def query_repositories(role, query, repository):
    headers_external = {
        "Authorization": nia_api_key,
        "Content-Type": "application/json"
    }
    payload = {
        "messages": [{"role": role, "content": query}],
        "repositories": [{"repository": repository}],
        "stream": False
    }
    response = requests.post(f"{base_url}{endpoint_query}", headers=headers_external, json=payload)
    return response


# -----------------------------------
# GitHub OAuth Settings
# -----------------------------------
GITHUB_CLIENT_ID = "Ov23ctjCH3T4v3DegFes"  # Replace with your GitHub client ID
GITHUB_CLIENT_SECRET = "51317e6f9049fbc835d2058f8023687867b52110"  # Final value (make sure it’s correct)
GITHUB_REDIRECT_URI = "http://localhost:5000/github/callback"

# -----------------------------------
# GitHub OAuth Endpoints
# -----------------------------------

@app.route('/github/login')
def github_login():
    github_auth_url = "https://github.com/login/oauth/authorize"
    scope = "repo"  # Adjust scopes as needed
    state = "random_state_string"  # In production, generate a secure random state and verify it
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

    # Expect header in format "Bearer <token>"
    parts = auth_header.split()
    token = parts[1] if (len(parts) == 2 and parts[0].lower() == "bearer") else auth_header

    headers_github = {"Authorization": f"token {token}"}
    response = requests.get("https://api.github.com/user/repos", headers=headers_github)
    if response.status_code == 200:
        return jsonify(response.json())
    else:
        return jsonify({"message": "Failed to fetch repositories", "error": response.text}), response.status_code


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
# Wren AI calls
# -----------------------------------
# Target API URL


@app.route('/api/codesmell', methods=['POST'])
def graphql_proxy():
    """
    Wrapper API endpoint to handle all GraphQL requests.
    """
    try:
        # Get the JSON payload from the request
        payload = request.get_json()

        # Forward the request to the target API
        response = requests.post(
            TARGET_API_URL,
            headers={"Content-Type": "application/json"},
            json=payload
        )

        # Return the response from the target API
        return jsonify(response.json()), response.status_code

    except Exception as e:
        # Handle any errors
        return jsonify({"error": str(e)}), 500


##############################################
# Wren AI common 
##############################################
@app.route('/api/get_full_response', methods=['POST'])
def get_full_response():
    try:
        data = request.get_json()
        question = data.get('question')

        if not question:
            return jsonify({'error': 'Question is missing'}), 400

        # First API call to create the task
        payload1 = {
            "operationName": "CreateAskingTask",
            "variables": {
                "data": {
                    "question": question
                }
            },
            "query": "mutation CreateAskingTask($data: AskingTaskInput!) {\n  createAskingTask(data: $data) {\n    id\n    __typename\n  }\n}"
        }

        headers = {'Content-Type': 'application/json'}
        response1 = requests.post(API_URL, headers=headers, json=payload1)
        response1.raise_for_status()
        response_json1 = response1.json()
        task_id = response_json1.get('data', {}).get('createAskingTask', {}).get('id')
        print("taskid:",task_id)
        if not task_id:
            return jsonify({'error': 'Task ID not found in response'}), 500

        # Polling loop to check task status
        while True:
            # Second API call to get the task result
            payload2 = {
                "operationName": "AskingTask",
                "variables": {
                    "taskId": task_id
                },
                "query": "query AskingTask($taskId: String!) {\n  askingTask(taskId: $taskId) {\n    status\n    type\n    candidates {\n      sql\n      type\n      view {\n        id\n        name\n        statement\n        displayName\n        __typename\n      }\n      __typename\n    }\n    error {\n      ...CommonError\n      __typename\n    }\n    intentReasoning\n    __typename\n  }\n}\n\nfragment CommonError on Error {\n  code\n  shortMessage\n  message\n  stacktrace\n  __typename\n}"
            }

            response2 = requests.post(API_URL, headers=headers, json=payload2)
            response2.raise_for_status()
            response_json2 = response2.json()
            task_status = response_json2.get('data', {}).get('askingTask', {}).get('status')
            print(task_status)
            
            if task_status == "FINISHED":                
                if(len(response_json2.get('data', {}).get('askingTask', {}).get('candidates', [{}]))!=0):
                    print("IF Task response :",response_json2)
                    sql = response_json2.get('data', {}).get('askingTask', {}).get('candidates', [{}])[0].get('sql')
                    print(sql)
                else:
                    print("Else Task response :",response_json2)
                    return jsonify(response_json2.json()), 500  
                # Third API call to get threads
                payload3 = {
                  "operationName": "CreateThread",
                  "variables": {
                    "data": {
                      "sql": sql,
                      "question": question
                    }
                  },
                  "query": "mutation CreateThread($data: CreateThreadInput!) {\n  createThread(data: $data) {\n    id\n    __typename\n  }\n}"
                }

                response3 = requests.post(API_URL, headers=headers, json=payload3)
                response3.raise_for_status()               
                response_json3 = response3.json()
                
                if(len(response_json3.get('data', {}).get('createThread', {}))!=0):
                   thread_id = response_json3.get('data', {}).get('createThread', {}).get('id')
                else:
                    thread_id=1
                    
                print(thread_id)
                # Fourth API call to create thread response
                payload_add = {
                  "operationName": "CreateThreadResponse",
                  "variables": {
                    "threadId": thread_id,
                    "data": {
                      "sql": sql,
                      "question": question
                    }
                  },
                  "query": "mutation CreateThreadResponse($threadId: Int!, $data: CreateThreadResponseInput!) {\n  createThreadResponse(threadId: $threadId, data: $data) {\n    ...CommonResponse\n    __typename\n  }\n}\n\nfragment CommonResponse on ThreadResponse {\n  id\n  threadId\n  question\n  sql\n  view {\n    id\n    name\n    statement\n    displayName\n    __typename\n  }\n  breakdownDetail {\n    ...CommonBreakdownDetail\n    __typename\n  }\n  answerDetail {\n    ...CommonAnswerDetail\n    __typename\n  }\n  chartDetail {\n    ...CommonChartDetail\n    __typename\n  }\n  __typename\n}\n\nfragment CommonBreakdownDetail on ThreadResponseBreakdownDetail {\n  queryId\n  status\n  description\n  steps {\n    summary\n    sql\n    cteName\n    __typename\n  }\n  error {\n    ...CommonError\n    __typename\n  }\n  __typename\n}\n\nfragment CommonError on Error {\n  code\n  shortMessage\n  message\n  stacktrace\n  __typename\n}\n\nfragment CommonAnswerDetail on ThreadResponseAnswerDetail {\n  queryId\n  status\n  content\n  numRowsUsedInLLM\n  error {\n    ...CommonError\n    __typename\n  }\n  __typename\n}\n\nfragment CommonChartDetail on ThreadResponseChartDetail {\n  queryId\n  status\n  description\n  chartType\n  chartSchema\n  error {\n    ...CommonError\n    __typename\n  }\n  adjustment\n  __typename\n}"
                }
                response_add = requests.post(API_URL, headers=headers, json=payload_add)
                response_add.raise_for_status()
                response_json_add = response_add.json()
                response_id = response_json_add.get('data', {}).get('createThreadResponse', {}).get('id')
                #response_id_store[request.remote_addr] = response_id_add
                print(response_id)  
                # ThreadRespnse API call to create thread response
                payload_gtr = {
                      "operationName": "GenerateThreadResponseAnswer",
                      "variables": {
                        "responseId": response_id
                      },
                      "query": "mutation GenerateThreadResponseAnswer($responseId: Int!) {\n  generateThreadResponseAnswer(responseId: $responseId) {\n    ...CommonResponse\n    __typename\n  }\n}\n\nfragment CommonResponse on ThreadResponse {\n  id\n  threadId\n  question\n  sql\n  view {\n    id\n    name\n    statement\n    displayName\n    __typename\n  }\n  breakdownDetail {\n    ...CommonBreakdownDetail\n    __typename\n  }\n  answerDetail {\n    ...CommonAnswerDetail\n    __typename\n  }\n  chartDetail {\n    ...CommonChartDetail\n    __typename\n  }\n  __typename\n}\n\nfragment CommonBreakdownDetail on ThreadResponseBreakdownDetail {\n  queryId\n  status\n  description\n  steps {\n    summary\n    sql\n    cteName\n    __typename\n  }\n  error {\n    ...CommonError\n    __typename\n  }\n  __typename\n}\n\nfragment CommonError on Error {\n  code\n  shortMessage\n  message\n  stacktrace\n  __typename\n}\n\nfragment CommonAnswerDetail on ThreadResponseAnswerDetail {\n  queryId\n  status\n  content\n  numRowsUsedInLLM\n  error {\n    ...CommonError\n    __typename\n  }\n  __typename\n}\n\nfragment CommonChartDetail on ThreadResponseChartDetail {\n  queryId\n  status\n  description\n  chartType\n  chartSchema\n  error {\n    ...CommonError\n    __typename\n  }\n  adjustment\n  __typename\n}"
                    }

                response_gtr = requests.post(API_URL, headers=headers, json=payload_gtr)
                response_gtr.raise_for_status()
                response_json_gtr = response_gtr.json()
                response_g_status = response_json_gtr.get('data', {}).get('generateThreadResponseAnswer', {}).get('answerDetail', {}).get('status')
                #response_id_store[request.remote_addr] = response_id_add
                print(response_g_status)  
                # Fifth API call to create thread response
                payload_tr = {
                  "operationName": "ThreadResponse",
                  "variables": {
                    "responseId": response_id
                  },
                  "query": "query ThreadResponse($responseId: Int!) {\n  threadResponse(responseId: $responseId) {\n    ...CommonResponse\n    __typename\n  }\n}\n\nfragment CommonResponse on ThreadResponse {\n  id\n  threadId\n  question\n  sql\n  view {\n    id\n    name\n    statement\n    displayName\n    __typename\n  }\n  breakdownDetail {\n    ...CommonBreakdownDetail\n    __typename\n  }\n  answerDetail {\n    ...CommonAnswerDetail\n    __typename\n  }\n  chartDetail {\n    ...CommonChartDetail\n    __typename\n  }\n  __typename\n}\n\nfragment CommonBreakdownDetail on ThreadResponseBreakdownDetail {\n  queryId\n  status\n  description\n  steps {\n    summary\n    sql\n    cteName\n    __typename\n  }\n  error {\n    ...CommonError\n    __typename\n  }\n  __typename\n}\n\nfragment CommonError on Error {\n  code\n  shortMessage\n  message\n  stacktrace\n  __typename\n}\n\nfragment CommonAnswerDetail on ThreadResponseAnswerDetail {\n  queryId\n  status\n  content\n  numRowsUsedInLLM\n  error {\n    ...CommonError\n    __typename\n  }\n  __typename\n}\n\nfragment CommonChartDetail on ThreadResponseChartDetail {\n  queryId\n  status\n  description\n  chartType\n  chartSchema\n  error {\n    ...CommonError\n    __typename\n  }\n  adjustment\n  __typename\n}"
                }
                response_5 = requests.post(API_URL, headers=headers, json=payload_tr)
                response_5.raise_for_status()
                response_json_add = response_5.json()
                response_status = response_json_add.get('data', {}).get('threadResponse', {}).get('answerDetail', {}).get('status')
                #response_id_store[request.remote_addr] = response_id_add
                print("ThreadResponse",response_status)  
                streamurl_response_id=STREAM_URL+""+str(response_id)
                response_stream=requests.get(streamurl_response_id, headers=headers)
                
                # Sixth API call to generate thread response chart
                payload_6 = {
                    "operationName": "GenerateThreadResponseChart",
                    "variables": {
                        "responseId": response_id
                    },
                    "query": "mutation GenerateThreadResponseChart($responseId: Int!) {\n  generateThreadResponseChart(responseId: $responseId) {\n    ...CommonResponse\n    __typename\n  }\n}\n\nfragment CommonResponse on ThreadResponse {\n  id\n  threadId\n  question\n  sql\n  view {\n    id\n    name\n    statement\n    displayName\n    __typename\n  }\n  breakdownDetail {\n    ...CommonBreakdownDetail\n    __typename\n  }\n  answerDetail {\n    ...CommonAnswerDetail\n    __typename\n  }\n  chartDetail {\n    ...CommonChartDetail\n    __typename\n  }\n  __typename\n}\n\nfragment CommonBreakdownDetail on ThreadResponseBreakdownDetail {\n  queryId\n  status\n  description\n  steps {\n    summary\n    sql\n    cteName\n    __typename\n  }\n  error {\n    ...CommonError\n    __typename\n  }\n  __typename\n}\n\nfragment CommonError on Error {\n  code\n  shortMessage\n  message\n  stacktrace\n  __typename\n}\n\nfragment CommonAnswerDetail on ThreadResponseAnswerDetail {\n  queryId\n  status\n  content\n  numRowsUsedInLLM\n  error {\n    ...CommonError\n    __typename\n  }\n  __typename\n}\n\nfragment CommonChartDetail on ThreadResponseChartDetail {\n  queryId\n  status\n  description\n  chartType\n  chartSchema\n  error {\n    ...CommonError\n    __typename\n  }\n  adjustment\n  __typename\n}"
                }
                response_6 = requests.post(API_URL, headers=headers, json=payload_6)
                response_6.raise_for_status()
                response_json_6 = response_6.json()  
                response_chart_status = response_json_6.get('data', {}).get('generateThreadResponseChart', {}).get('chartDetail', {}).get('status')
                print("GenerateThreadResponseChart",response_chart_status) 
                        # Polling loop to check task status
                while True:
                    # Seventh API call to get full thread response
                    payload_7 = {
                        "operationName": "ThreadResponse",
                        "variables": {
                            "responseId": response_id
                        },
                        "query": "query ThreadResponse($responseId: Int!) {\n  threadResponse(responseId: $responseId) {\n    ...CommonResponse\n    __typename\n  }\n}\n\nfragment CommonResponse on ThreadResponse {\n  id\n  threadId\n  question\n  sql\n  view {\n    id\n    name\n    statement\n    displayName\n    __typename\n  }\n  breakdownDetail {\n    ...CommonBreakdownDetail\n    __typename\n  }\n  answerDetail {\n    ...CommonAnswerDetail\n    __typename\n  }\n  chartDetail {\n    ...CommonChartDetail\n    __typename\n  }\n  __typename\n}\n\nfragment CommonBreakdownDetail on ThreadResponseBreakdownDetail {\n  queryId\n  status\n  description\n  steps {\n    summary\n    sql\n    cteName\n    __typename\n  }\n  error {\n    ...CommonError\n    __typename\n  }\n  __typename\n}\n\nfragment CommonError on Error {\n  code\n  shortMessage\n  message\n  stacktrace\n  __typename\n}\n\nfragment CommonAnswerDetail on ThreadResponseAnswerDetail {\n  queryId\n  status\n  content\n  numRowsUsedInLLM\n  error {\n    ...CommonError\n    __typename\n  }\n  __typename\n}\n\nfragment CommonChartDetail on ThreadResponseChartDetail {\n  queryId\n  status\n  description\n  chartType\n  chartSchema\n  error {\n    ...CommonError\n    __typename\n  }\n  adjustment\n  __typename\n}"
                    }
                    print("Final payload",payload_7) 
                    response_final = requests.post(API_URL, headers=headers, json=payload_7)
                    response_final.raise_for_status()
                    response_final_json = response_final.json()  
                    response_final_status = response_final_json.get('data', {}).get('threadResponse', {}).get('answerDetail', {}).get('status')
                    response_chart_status = response_final_json.get('data', {}).get('threadResponse', {}).get('chartDetail', {}).get('status')
                    print("Final Response Status ::",response_final_status," Final Chart Status ::",response_chart_status)
                    if response_final_status == "FINISHED" and response_chart_status == "FINISHED":
                        print(response_final.json())
                        return jsonify(response_final.json()), 200                        
                    elif response_final_status == 'STREAMING':
                        streamurl_response_id=STREAM_URL+""+str(response_id)
                        response_stream=requests.get(streamurl_response_id, headers=headers)                        
                    elif response_final_status == 'FAILED' or response_final_status == 'CANCELLED':
                        print(response_final.json())
                        return jsonify(response_final.json()), 500
                    else:
                        time.sleep(POLLING_INTERVAL)  # Wait before polling again
            elif task_status == 'FAILED' or task_status == 'CANCELLED':      
                print(response_json2)                
                return jsonify(response_json2), 200
            else:
                time.sleep(POLLING_INTERVAL)  # Wait before polling again

    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Request error: {str(e)}'}), 500
    except json.JSONDecodeError as e:
        return jsonify({'error': f'Invalid JSON response: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500
        
# -----------------------------------
# Main
# -----------------------------------
if __name__ == '__main__':
    app.run(debug=True)