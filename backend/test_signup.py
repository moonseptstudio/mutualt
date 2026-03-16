import requests
import json

url = "http://localhost:8080/api/auth/signup"
data = {
    "username": "950000001V",
    "password": "password123",
    "fullName": "Test User",
    "email": "test@example.com",
    "nic": "950000001V",
    "jobCategoryId": 1,
    "gradeId": 1,
    "currentStationId": 1,
    "phoneNumber": "94711234567"
}

headers = {'Content-Type': 'application/json'}

try:
    response = requests.post(url, data=json.dumps(data), headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
