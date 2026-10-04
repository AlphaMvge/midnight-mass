import os
import sys
import json
import base64
import urllib.request
import urllib.parse
import urllib.error

TOKEN = sys.argv[1] if len(sys.argv) > 1 else os.environ.get("GH_TOKEN")
REPO_NAME = sys.argv[2] if len(sys.argv) > 2 else "midnightmass-hub"

if not TOKEN:
    print("ERROR: GitHub Token is required.", flush=True)
    sys.exit(1)

HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "MidnightMass-Deployer"
}

def api_request(url, data=None, method=None):
    data_bytes = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=data_bytes, headers=HEADERS, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            res_data = response.read().decode("utf-8")
            return json.loads(res_data) if res_data else {}
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        try:
            return {"error": e.code, "details": json.loads(error_body)}
        except Exception:
            return {"error": e.code, "details": error_body}

# 1. Get authenticated user
print("1. Authenticating with GitHub...", flush=True)
user_info = api_request("https://api.github.com/user")
if "login" not in user_info:
    print("Authentication failed:", user_info, flush=True)
    sys.exit(1)

username = user_info["login"]
print(f"   Authenticated as: @{username}", flush=True)

# 2. Check or Create repository
print(f"2. Checking repository '{REPO_NAME}'...", flush=True)
repo_url = f"https://api.github.com/repos/{username}/{REPO_NAME}"
repo_check = api_request(repo_url)

if "error" in repo_check and repo_check["error"] == 404:
    print(f"   Creating public repository '{REPO_NAME}'...", flush=True)
    create_payload = {
        "name": REPO_NAME,
        "description": "Midnight Mass — Sacred Growth Hub & QR Generator Web Portal",
        "private": False,
        "auto_init": True
    }
    create_res = api_request("https://api.github.com/user/repos", create_payload, method="POST")
    print(f"   Repository created: {create_res.get('html_url')}", flush=True)
else:
    print(f"   Repository exists: https://github.com/{username}/{REPO_NAME}", flush=True)

# 3. Upload all files from current directory
base_dir = os.path.dirname(os.path.abspath(__file__))
print("3. Uploading website files and assets...", flush=True)

files_to_upload = []
for root, dirs, files in os.walk(base_dir):
    for f in files:
        if f.endswith((".py", ".ps1", ".bat", ".vsix")):
            continue
        full_path = os.path.join(root, f)
        rel_path = os.path.relpath(full_path, base_dir).replace("\\", "/")
        files_to_upload.append((rel_path, full_path))

for rel_path, full_path in files_to_upload:
    with open(full_path, "rb") as fp:
        content_b64 = base64.b64encode(fp.read()).decode("utf-8")
    
    encoded_path = "/".join(urllib.parse.quote(part) for part in rel_path.split("/"))
    file_url = f"https://api.github.com/repos/{username}/{REPO_NAME}/contents/{encoded_path}"
    
    file_info = api_request(file_url)
    sha = file_info.get("sha") if isinstance(file_info, dict) and "sha" in file_info else None
    
    payload = {
        "message": f"Deploy {rel_path}",
        "content": content_b64,
        "branch": "main"
    }
    if sha:
        payload["sha"] = sha
        
    put_res = api_request(file_url, payload, method="PUT")
    if "content" in put_res or "commit" in put_res:
        print(f"   [OK] Uploaded: {rel_path}", flush=True)
    else:
        # If branch main not found, try without specifying branch (default branch)
        payload.pop("branch", None)
        put_res2 = api_request(file_url, payload, method="PUT")
        if "content" in put_res2 or "commit" in put_res2:
            print(f"   [OK] Uploaded: {rel_path}", flush=True)
        else:
            print(f"   ! Error uploading {rel_path}: {put_res2}", flush=True)

# 4. Enable GitHub Pages
print("4. Enabling GitHub Pages...", flush=True)
pages_url = f"https://api.github.com/repos/{username}/{REPO_NAME}/pages"
pages_payload = {
    "source": {
        "branch": "main",
        "path": "/"
    }
}
pages_res = api_request(pages_url, pages_payload, method="POST")
print(f"   Pages status: {pages_res.get('status', pages_res)}", flush=True)

live_url = f"https://{username}.github.io/{REPO_NAME}/"
print("\n=======================================================", flush=True)
print("SUCCESS! YOUR WEBSITE IS DEPLOYED!", flush=True)
print(f"Live GitHub Pages URL: {live_url}", flush=True)
print(f"GitHub Repository:     https://github.com/{username}/{REPO_NAME}", flush=True)
print("=======================================================", flush=True)
