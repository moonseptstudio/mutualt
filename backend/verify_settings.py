import requests
import json

base_url = "http://localhost:8080/api"

def test_settings():
    print("--- Testing Settings and Password Change ---")
    
    # 1. Login
    login_data = {
        "username": "990011223V",
        "password": "password123"
    }
    r = requests.post(f"{base_url}/auth/signin", json=login_data)
    if r.status_code != 200:
        print(f"Login failed: {r.status_code} {r.text}")
        return
    
    token = r.json()["token"]
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    print("Login successful")

    # 2. Get Settings
    r = requests.get(f"{base_url}/settings", headers=headers)
    print(f"Current Settings: {r.json()}")
    
    # 3. Toggle 2FA
    settings = r.json()
    settings["twoFactorEnabled"] = not settings.get("twoFactorEnabled", False)
    r = requests.put(f"{base_url}/settings", headers=headers, json=settings)
    print(f"Updated Settings (2FA toggled): {r.json()['twoFactorEnabled']}")

    # 4. Change Password
    change_data = {
        "oldPassword": "password123",
        "newPassword": "newpassword123"
    }
    r = requests.post(f"{base_url}/auth/change-password", headers=headers, json=change_data)
    print(f"Change Password Result: {r.status_code} {r.text}")

    # 5. Verify New Password
    login_data["password"] = "newpassword123"
    r = requests.post(f"{base_url}/auth/signin", json=login_data)
    if r.status_code == 200:
        print("Login with new password successful")
    else:
        print(f"Login with new password failed: {r.status_code}")

    # 6. Revert Password for future tests
    token = r.json()["token"]
    headers["Authorization"] = f"Bearer {token}"
    change_data = {
        "oldPassword": "newpassword123",
        "newPassword": "password123"
    }
    r = requests.post(f"{base_url}/auth/change-password", headers=headers, json=change_data)
    print(f"Revert Password Result: {r.status_code} {r.text}")

if __name__ == "__main__":
    test_settings()
