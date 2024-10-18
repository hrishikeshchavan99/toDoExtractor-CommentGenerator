import React, { useState } from 'react';
import './App.css';

function App() {
    const [codeSnippet, setCodeSnippet] = useState('');
    const [filePath, setFilePath] = useState('');
    const [todos, setTodos] = useState([]);
    const [activeTab, setActiveTab] = useState('code');
    const [folderPath, setFolderPath] = useState('');
    const [completePath, setCompletePath] = useState('');
    const [updatedCode, setUpdatedCode] = useState([]);

    const extractTodos = async () => {
        try {
            const requestBody = codeSnippet || filePath || folderPath || completePath;
            setTodos([]);
            setUpdatedCode([]);
            const isFilePath = !codeSnippet;

            const params = new URLSearchParams();
            params.append('requestBody', requestBody);
            params.append('isFilePath', isFilePath);

            const response = await fetch('http://localhost:8080/api/todos/extract', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params.toString(),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error: ${response.status} ${response.statusText}. Details: ${errorText}`);
            }

            const data = await response.json();
            setTodos(data);
        } catch (error) {
            console.error('Error fetching TODOs:', error);
            alert(error.message);
        }
    };

    const generateComments = async () => {
        const formattedCode = codeSnippet.trim();
        setTodos([]);
        setUpdatedCode([]);
        try {
            const response = await fetch('http://localhost:8080/api/todos/generate-comment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: formattedCode,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error: ${response.status} ${response.statusText}. Details: ${errorText}`);
            }

            const data = await response.json();
            setUpdatedCode(data.comment);
        } catch (error) {
            console.error('Error generating comments:', error);
            alert(error.message);
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setFilePath(file.name);
            setFolderPath('');
            setCodeSnippet('');
            setCompletePath('');
        }
    };

    const handleFolderChange = (event) => {
        const files = event.target.files;
        if (files) {
            const path = files[0].webkitRelativePath.split('/')[0];
            setFolderPath(path);
            setFilePath('');
            setCodeSnippet('');
            setCompletePath('');
        }
    };

    const handleCodeSnippetChange = (e) => {
        setCodeSnippet(e.target.value);
        setFilePath('');
        setCompletePath('');
        setFolderPath('');
    }

    const handlePathChange = (e) => {
        setCompletePath(e.target.value)
        setCodeSnippet('');
        setFilePath('');
        setFolderPath('');
    }

    return (
        <div className="App">
            <h1>TODO Extractor / Comment Generator</h1>
            <div className="tabs">
                <button className={`tab ${activeTab === 'code' ? 'active' : ''}`} onClick={() => setActiveTab('code')}>
                    Enter Code
                </button>
                <button className={`tab ${activeTab === 'fileFolder' ? 'active' : ''}`}
                        onClick={() => setActiveTab('fileFolder')}>
                    File/Folder Input
                </button>
            </div>
            {activeTab === 'code' && (
                <div className="code-input">
            <textarea
                rows="10"
                cols="50"
                value={codeSnippet}
                onChange={(e) => handleCodeSnippetChange(e)}
                placeholder="Enter your code here..."
            />
                </div>
            )}
            {activeTab === 'fileFolder' && (
                <div className="file-folder-input">
                    <h2>File/Folder Inputs</h2>
                    <input
                        className={"path-input"}
                        type="text"
                        value={completePath}
                        onChange={(e) => handlePathChange(e)}
                        placeholder="Enter file/folder path..."
                    />
                    <label htmlFor="file-upload" className="file-upload-label">
                        Choose file
                        <input
                            id="file-upload"
                            type="file"
                            onChange={handleFileChange}
                            style={{display: 'none'}}
                        />
                    </label>
                    <label htmlFor="folder-upload" className="file-upload-label">
                        Choose folder
                        <input
                            id="folder-upload"
                            type="file"
                            onChange={handleFolderChange}
                            webkitdirectory=""
                            style={{display: 'none'}}
                            multiple
                        />
                    </label>

                    <div style={{marginTop: 15}}>Selected path/ file/
                        folder: {filePath || folderPath || completePath}</div>

                </div>
            )}
            <br/>

            <button className="extract-btn" onClick={extractTodos}>
                Extract TODO
            </button>
            <button className="extract-btn" onClick={generateComments}>
                Generate Comments
            </button>
            <h2>Extracted TODOs:</h2>
            <div className={'comment-box'}>
            <ol className={'comment-box-data'}>
                {todos.map((todo, index) => (
                    <li key={index}>{todo}</li>
                ))}
            </ol>
            </div>

            {updatedCode && (
                <div>
                    <h2>Updated Code with Comments:</h2>
                    <p className={'comment-box'}>{updatedCode}</p>
                </div>
            )}
        </div>
    );
}

export default App;
