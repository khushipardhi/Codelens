import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Sparkles, User, Bot, Paperclip, Image as ImageIcon, Trash2 } from 'lucide-react';
import { chatAboutCode } from '../../services/aiService';
import { classifyUserQuery, getLocalAssistantFallback } from '../../services/assistantIntent';
import { validateFileAttachment, validateImageAttachment, processTextFile, processImageFile } from '../../services/attachmentUtils';
import { buildAssistantContext } from '../../services/assistantContext';
import './ChatAssistant.css';

const QUICK_PROMPTS = [
  "Explain this error",
  "Fix this line",
  "Explain like beginner",
  "Show corrected code",
  "Why this happened?",
  "How to avoid this?"
];

export default function ChatAssistant({ code, language, apiKey, aiConfig, analysisMode, currentErrors }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your CodeLens assistant. Ask me anything about your code — like \"Why is this loop not working?\" or \"Explain this error.\" I'm here to help! 😊",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Attachments State
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [attachmentError, setAttachmentError] = useState(null);
  const [isProcessingAttachment, setIsProcessingAttachment] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSend = async (forcedQuestion = null) => {
    const questionText = typeof forcedQuestion === 'string' ? forcedQuestion : input;
    const question = questionText.trim();
    
    // Allow sending if there's text OR if there's an attachment
    const hasAttachments = uploadedFiles.length > 0 || uploadedImages.length > 0;
    if ((!question && !hasAttachments) || isLoading) return;

    const displayQuestion = question || "Please help me understand this attachment.";
    
    setInput('');
    setAttachmentError(null);
    setMessages((prev) => [...prev, { role: 'user', content: displayQuestion }]);
    setIsLoading(true);

    try {
      // Intent mapping
      const classification = classifyUserQuery(displayQuestion, { language, code });
      
      // Context merging
      const { fullPrompt, imageWarning } = buildAssistantContext({
        userMessage: displayQuestion,
        currentCode: code,
        detectedLanguage: language,
        currentErrors,
        uploadedFiles,
        uploadedImages
      });

      const fallbackFn = () => getLocalAssistantFallback({ question: displayQuestion, classification, style: 'friendly' });
      
      const hadImages = uploadedImages.length > 0;
      setUploadedFiles([]);
      setUploadedImages([]);

      // Pass empty string for code so aiService doesn't duplicate the editor code. 
      // The context builder has already formatted it nicely in `fullPrompt`.
      const result = await chatAboutCode('', language, fullPrompt, apiKey, aiConfig, analysisMode, classification, fallbackFn);
      
      let finalResponse = result.response;
      if (hadImages && imageWarning && !finalResponse.includes("Vision analysis")) {
        finalResponse += `\n\n*Note: ${imageWarning}*`;
      }

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: finalResponse },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "I encountered a small issue processing your question. Please try again — I'm here to help!",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // --- Attachment Handlers ---

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setAttachmentError(null);
    const { valid, error } = validateFileAttachment(file);
    if (!valid) {
      setAttachmentError(error);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsProcessingAttachment(true);
    try {
      const processed = await processTextFile(file);
      setUploadedFiles(prev => [...prev, processed]);
    } catch (err) {
      setAttachmentError(err.message);
    } finally {
      setIsProcessingAttachment(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAttachmentError(null);
    const { valid, error } = validateImageAttachment(file);
    if (!valid) {
      setAttachmentError(error);
      if (imageInputRef.current) imageInputRef.current.value = '';
      return;
    }

    setIsProcessingAttachment(true);
    try {
      const processed = await processImageFile(file);
      setUploadedImages(prev => [...prev, processed]);
    } catch (err) {
      setAttachmentError(err.message);
    } finally {
      setIsProcessingAttachment(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setAttachmentError(null);
    
    if (file.type.startsWith('image/')) {
      const { valid, error } = validateImageAttachment(file);
      if (!valid) return setAttachmentError(error);
      setIsProcessingAttachment(true);
      try {
        const processed = await processImageFile(file);
        setUploadedImages(prev => [...prev, processed]);
      } catch (err) {
        setAttachmentError(err.message);
      }
      setIsProcessingAttachment(false);
    } else {
      const { valid, error } = validateFileAttachment(file);
      if (!valid) return setAttachmentError(error);
      setIsProcessingAttachment(true);
      try {
        const processed = await processTextFile(file);
        setUploadedFiles(prev => [...prev, processed]);
      } catch (err) {
        setAttachmentError(err.message);
      }
      setIsProcessingAttachment(false);
    }
  }, []);

  const handlePaste = useCallback(async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          setAttachmentError(null);
          const { valid, error } = validateImageAttachment(file);
          if (!valid) {
             setAttachmentError(error);
             return;
          }
          setIsProcessingAttachment(true);
          try {
            const processed = await processImageFile(file);
            setUploadedImages(prev => [...prev, processed]);
          } catch (err) {
            setAttachmentError(err.message);
          }
          setIsProcessingAttachment(false);
        }
      }
    }
  }, []);

  const isLastMessageAssistant = messages.length > 0 && messages[messages.length - 1].role === 'assistant';
  
  const currentQuickPrompts = (messages.length <= 3) 
    ? QUICK_PROMPTS 
    : isLastMessageAssistant ? ["Explain deeply", "Show corrected code"] : [];

  const showPrompts = currentQuickPrompts.length > 0 && !isLoading;

  return (
    <>
      {/* Floating toggle button */}
      {!isOpen && (
        <button
          className="chat-fab"
          onClick={() => setIsOpen(true)}
          title="Ask CodeLens a question"
          id="chat-fab"
        >
          <MessageCircle size={22} />
          <span className="fab-pulse" />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div 
          className={`chat-panel ${isDragging ? 'dragging' : ''}`} 
          id="chat-panel"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Chat Header */}
          <div className="chat-header">
            <div className="chat-header-left">
              <Sparkles size={16} className="chat-header-icon" />
              <div>
                <h3 className="chat-title">CodeLens Assistant</h3>
                <p className="chat-subtitle">Ask about your code</p>
              </div>
            </div>
            <button
              className="chat-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              id="close-chat-btn"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-message ${msg.role}`}>
                <div className="message-avatar">
                  {msg.role === 'assistant' ? (
                    <Bot size={14} />
                  ) : (
                    <User size={14} />
                  )}
                </div>
                <div className="message-content">
                  <p>{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="chat-message assistant">
                <div className="message-avatar">
                  <Bot size={14} />
                </div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {showPrompts && (
            <div className="quick-prompts-container">
              {currentQuickPrompts.map((prompt, i) => (
                <button 
                  key={i} 
                  className="quick-prompt-chip"
                  onClick={() => handleSend(prompt)}
                >
                  {prompt === 'Explain deeply' ? '✨ Explain More' : prompt}
                </button>
              ))}
            </div>
          )}

          {/* Attachment Previews */}
          {(uploadedFiles.length > 0 || uploadedImages.length > 0 || attachmentError || isProcessingAttachment) && (
            <div className="chat-attachment-previews">
              {attachmentError && (
                <div className="attachment-error">
                  {attachmentError}
                </div>
              )}
              {isProcessingAttachment && (
                <div className="attachment-loading">Processing...</div>
              )}
              {uploadedFiles.map((f, i) => (
                <div key={i} className="attachment-chip file">
                  <span className="attachment-name">{f.name}</span>
                  <button className="remove-btn" onClick={() => removeFile(i)}><X size={12}/></button>
                </div>
              ))}
              {uploadedImages.map((img, i) => (
                <div key={i} className="attachment-chip image">
                  <img src={img.dataUrl} alt={img.name} className="attachment-thumb" />
                  <span className="attachment-name">{img.name}</span>
                  <button className="remove-btn" onClick={() => removeImage(i)}><X size={12}/></button>
                </div>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="chat-input-container">
            <div className="chat-input-wrapper">
              <textarea
                ref={inputRef}
                className="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                placeholder="Ask or drag files here..."
                rows={1}
                disabled={isLoading}
                id="chat-input"
              />
              <div className="chat-input-toolbar">
                <button 
                  className="toolbar-btn" 
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload code file"
                  disabled={isLoading}
                >
                  <Paperclip size={14} />
                </button>
                <button 
                  className="toolbar-btn" 
                  onClick={() => imageInputRef.current?.click()}
                  title="Upload screenshot"
                  disabled={isLoading}
                >
                  <ImageIcon size={14} />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  accept=".py,.js,.ts,.html,.css,.java,.c,.cpp,.json,.txt,.md"
                  onChange={handleFileUpload}
                />
                <input 
                  type="file" 
                  ref={imageInputRef} 
                  style={{ display: 'none' }} 
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleImageUpload}
                />
              </div>
            </div>
            <button
              className="chat-send"
              onClick={() => handleSend()}
              disabled={(!input.trim() && uploadedFiles.length === 0 && uploadedImages.length === 0) || isLoading}
              title="Send message"
              id="chat-send-btn"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
