import urllib.request
import json

url = "http://localhost:8080/api/auth/signup"
data = {
    "username": "950000003V",
    "password": "password123",
    "fullName": "Test User",
    "email": "test@example.com",
    "nic": "950000003V",
    "jobCategoryId": 1,
    "gradeId": 1,
    "currentStationId": 1,
    "phoneNumber": "94711234567"
}

req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), 
                             headers={'Content-Type': 'application/json'}, method='POST')

try:
    with urllib.request.urlopen(req) as response:
        print(f"Status Code: {response.getcode()}")
        print(f"Response: {response.read().decode('utf-8')}")
except Exception as e:
    print(f"Error: {e}")
