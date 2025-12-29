import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, addDoc, getDocs, orderBy, query, limit } from 'firebase/firestore';
import { Loader, CheckCircle, XCircle, Database } from 'lucide-react';

export default function FirebaseTestPanel() {
    const [status, setStatus] = useState('idle'); // 'idle' | 'testing' | 'success' | 'error'
    const [logs, setLogs] = useState([]);
    const [errorMsg, setErrorMsg] = useState('');

    const runTest = async () => {
        setStatus('testing');
        setLogs([]);
        setErrorMsg('');

        try {
            // 1. ADD Document
            const docRef = await addDoc(collection(db, "test_connection"), {
                timestamp: new Date(),
                userAgent: navigator.userAgent,
                testId: Math.random().toString(36).substring(7)
            });
            console.log("Document added with ID: ", docRef.id);
            setLogs(prev => [...prev, `Write Success: Doc ID ${docRef.id}`]);

            // 2. READ Document
            const q = query(collection(db, "test_connection"), orderBy("timestamp", "desc"), limit(5));
            const querySnapshot = await getDocs(q);

            const results = [];
            querySnapshot.forEach((doc) => {
                results.push(doc.data());
            });
            console.log("Read results: ", results);
            setLogs(prev => [...prev, `Read Success: Fetched ${results.length} docs`]);

            setStatus('success');

        } catch (e) {
            console.error("Error adding document: ", e);
            setErrorMsg(e.message);
            setStatus('error');
            setLogs(prev => [...prev, `Error: ${e.message}`]);
        }
    };

    if (process.env.NODE_ENV === 'production' && !window.location.search.includes('debug')) {
        return null; // Hide in prod unless ?debug=true
    }

    return (
        <div className="fixed bottom-4 right-4 z-[9999] max-w-sm w-full bg-white border border-stone-200 shadow-2xl rounded-xl p-4 font-sans text-xs">
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2 font-bold text-stone-700">
                    <Database size={14} />
                    <span>Firebase Connectivity</span>
                </div>
                <button
                    onClick={runTest}
                    disabled={status === 'testing'}
                    className="px-3 py-1 bg-stone-800 text-white rounded hover:bg-stone-700 disabled:opacity-50 transition-colors"
                >
                    {status === 'testing' ? 'Testing...' : 'Run Test'}
                </button>
            </div>

            {status === 'testing' && (
                <div className="flex items-center gap-2 text-blue-600 bg-blue-50 p-2 rounded mb-2">
                    <Loader size={12} className="animate-spin" />
                    <span>Connecting to Firestore...</span>
                </div>
            )}

            {status === 'success' && (
                <div className="flex items-center gap-2 text-green-700 bg-green-50 p-2 rounded mb-2">
                    <CheckCircle size={12} />
                    <span>Connection Verified!</span>
                </div>
            )}

            {status === 'error' && (
                <div className="flex flex-col gap-1 text-red-700 bg-red-50 p-2 rounded mb-2">
                    <div className="flex items-center gap-2 font-bold">
                        <XCircle size={12} />
                        <span>Connection Failed</span>
                    </div>
                    <span className="font-mono text-[10px] break-all">{errorMsg}</span>
                </div>
            )}

            {logs.length > 0 && (
                <div className="mt-2 bg-stone-50 p-2 rounded border border-stone-100 max-h-32 overflow-y-auto font-mono text-[10px] text-stone-500">
                    {logs.map((log, i) => (
                        <div key={i} className="mb-1 border-b border-stone-100 last:border-0 pb-1">{log}</div>
                    ))}
                </div>
            )}
        </div>
    );
}
