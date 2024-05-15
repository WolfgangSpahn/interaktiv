// fetch data from the server
// method = 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'
export async function doFetch(url, method, data = null, /* leagcy */ callback = null ) {

    const fetchOptions = {
        method: method,
        headers: {}
    };

    // Only attach the body for methods that typically use a body payload
    if (data !== null && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
        fetchOptions.headers['Content-Type'] = 'application/json';
        fetchOptions.body = JSON.stringify(data);
    }

    // Return the Promise to allow for both callback and promise-based handling
    try {
        const response = await fetch(url, fetchOptions);
        // if (!response.ok) {
        //     console.warn('Error:', response);
        //     return response;
        // }
        const response_1 = await response.json();
        if (callback) {
            callback(response_1);
        }
        return response_1;
    } catch (error) {
        console.warn('Error:', error);
    }
}


// get the IP and socket name from the server
// test with: curl -X GET http://localhost:3000/ipsocket
export async function getIPSocket() {
    try {
        let response = await doFetch('ipsocket',"GET");
        return response;
    }
    catch (error) {
        console.error('Error:', error);
        return null;
    }
}


// get percentage of likert scale
export async function likertPercentage(id){
    console.log(`get likert/${id}`);
    try {
        let response = await doFetch(`likert/${id}`,"GET");
        console.log(response);
        return response['likert'];
    }
    catch (error) {
        console.error('Error:', error);
        return null;
    }
}