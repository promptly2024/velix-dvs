"use client";
import React from 'react'

const Test = () => {
    const APIURL = "http://localhost:3001/api/v1/document/upload";
    const [response, setResponse] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [error, setError] = React.useState<string | null>(null);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setLoading(true);
        setError(null);
        const file = event.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('document', file);
        try {
            const res = await fetch(APIURL, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI5ZWJkMmRjZi1jMGFjLTRkMjAtODFjMS04M2RkNzA1NGY3YTYiLCJpYXQiOjE3NjMwMjEzMzcsImV4cCI6MTc2MzYyNjEzN30.Fd2xXbNnmTW5uYc-uWM4JSQLi2_AKUrkw4naqOrCP5g'
                },
                body: formData,
            });
            const data = await res.json();
            setResponse(data);
        }
        catch (error) {
            const errorData = error as Error;
            setError(errorData.message);
            console.error("Error uploading file:", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <h1>Document Upload Test</h1>
            {loading && <p>Uploading...</p>}
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
            <input type="file" onChange={handleFileUpload} />
            {response && (<div>
                <h2>Response:</h2>
                <pre>{JSON.stringify(response, null, 2)}</pre>
            </div>)}


        </div>
    )
}

export default Test
