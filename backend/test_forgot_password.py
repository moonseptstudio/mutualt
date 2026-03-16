import urllib.request
import json

url = "http://localhost:8080/api/auth/forgot-password"
data = {
    "phoneNumber": "94711234567"
}

req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), 
                             headers={'Content-Type': 'application/json'}, method='POST')

try:
    with urllib.request.urlopen(req) as response:
        print(f"Status Code: {response.getcode()}")
        print(f"Response: {response.read().decode('utf-8')}")
except Exception as e:
    if hasattr(e, 'read'):
        print(f"Error Response: {e.read().decode('utf-8')}")
    else:
        print(f"Error: {e}")
