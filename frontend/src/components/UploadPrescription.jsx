import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Chat.css';
import { Upload } from 'lucide-react';
import { UserCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const UploadPrescription = () => {
  const [fileName, setFileName] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [apiResponse, setApiResponse] = useState(null);
  const navigate = useNavigate();
  const [conversations] = useState(['Conversation 1', 'Conversation 2', 'Conversation 3']);
  const [currentUser] = useState('John Doe');

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    console.log('Uploading file:', file.name);
    setFileName(file.name);
    setIsUploading(true);
    setUploadStatus('idle');
    setApiResponse(null); // Clear previous response

    const formData = new FormData();
    formData.append('pdf', file);
    try {
      const response = await fetch('http://127.0.0.1:8000/process_pdf', {
        method: 'POST',
        body: formData,
      });
      console.log(response);
      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      console.log(result);
      setUploadStatus('success');
      setApiResponse(result.result); // Store the API response
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="ai-assistant-layout" id="root">
      <div className="upload-assistant-container">
        <header className="ai-assistant-header">
          <h1>Document Upload</h1>
        </header>
        <div className="upload-alignment">
          <div className="upload-assistant-input">
            <h2>Upload Your Documents</h2>
            <div className="upload-icon">
              <Upload size={64} color="var(--ai-assistant-text)" />
            </div>
            <input
              type="file"
              id="pdf-upload"
              className="file-upload-input"
              accept=".pdf"
              onChange={handleUpload}
              disabled={isUploading}
            />
            <label htmlFor="pdf-upload" className="file-upload-label">
              {isUploading ? 'Uploading...' : 'Choose a PDF file'}
            </label>
            {fileName && <p>Selected File: {fileName}</p>}
            {uploadStatus === 'success' && <p className="upload-success">Upload successful!</p>}
            {uploadStatus === 'error' && <p className="upload-error">Upload failed. Please try again.</p>}
          </div>
        </div>
        {apiResponse && (
          <div className="api-response-container">
            <h2>Extracted Text</h2>
            <div className="extracted-text">
              <ReactMarkdown>{apiResponse}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPrescription;