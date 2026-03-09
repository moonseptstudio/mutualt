const response = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: "200100900364", password: "password" })
});

const data = await response.json();
console.log("Login Response Data:", data);

const token = data.token;

const prefsRes = await fetch('http://localhost:8080/api/preferences', {
    headers: { 'Authorization': `Bearer ${token}` }
});
const prefs = await prefsRes.json();
console.log("Preferences length:", prefs.length);

if (prefs.length > 0) {
    const id = prefs[0].id;
    console.log("Deleting pref:", id);
    const delRes = await fetch(`http://localhost:8080/api/preferences/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log("Delete status:", delRes.status);
    const delData = await delRes.text();
    console.log("Delete response:", delData);
}
