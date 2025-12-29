
async function testDelete() {
    try {
        console.log('Sending delete request...');
        const response = await fetch('http://localhost:5001/api/delete-course', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: 'curso-teste-fs' })
        });

        const data = await response.json();
        console.log('Response:', data);
    } catch (e) {
        console.error('Error:', e);
    }
}

testDelete();
