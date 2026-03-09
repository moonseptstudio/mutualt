const fetch = require('node-fetch'); // Assume node 18+ has fetch natively, but we'll use standard http

const http = require('http');

const options = {
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
};

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log("Login Response:");
        console.log(data);
        const token = JSON.parse(data).token;

        // Now get preferences
        const getOptions = {
            hostname: 'localhost',
            port: 8080,
            path: '/api/preferences',
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        };
        http.request(getOptions, (res2) => {
            let prefsData = '';
            res2.on('data', (d) => prefsData += d);
            res2.on('end', () => {
                console.log("Prefs:", prefsData);
                const prefs = JSON.parse(prefsData);
                if (prefs.length > 0) {
                    const pId = prefs[0].id;
                    console.log("Deleting pref id:", pId);
                    const rmOptions = {
                        hostname: 'localhost',
                        port: 8080,
                        path: `/api/preferences/${pId}`,
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    };
                    http.request(rmOptions, (res3) => {
                        let rmData = '';
                        res3.on('data', d => rmData += d);
                        res3.on('end', () => {
                            console.log("Delete status:", res3.statusCode);
                            console.log("Delete response:", rmData);
                        });
                    }).end();
                }
            });
        }).end();
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});
req.write(JSON.stringify({ username: "user", password: "password" }));
req.end();
