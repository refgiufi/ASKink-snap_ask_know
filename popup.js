// ASKink Extension - Popup Script

// Global error handlers to prevent errors from showing in Extensions page
window.addEventListener('error', function(event) {
    // Silent error handling - prevent errors from showing in Extensions page
    event.preventDefault();
    return true;
});

window.addEventListener('unhandledrejection', function(event) {
    // Silent error handling - prevent unhandled rejections from showing in Extensions page
    event.preventDefault();
});

document.addEventListener('DOMContentLoaded', async function() {
    const promptInput = document.getElementById('promptInput');
    const resetPromptButton = document.getElementById('resetPromptButton');
    const textOnlyMode = document.getElementById('textOnlyMode');
    const apiKeyInput = document.getElementById('apiKeyInput');
    const toggleApiKeyButton = document.getElementById('toggleApiKeyButton');
    const saveApiKeyButton = document.getElementById('saveApiKeyButton');
    const toggleApiSectionButton = document.getElementById('toggleApiSectionButton');
    const apiKeySection = document.getElementById('apiKeySection');
    const modelSelect = document.getElementById('modelSelect');
    const captureButton = document.getElementById('captureButton');
    // const getModelsButton = document.getElementById('getModelsButton'); // Hidden
    const clearCacheButton = document.getElementById('clearCacheButton');
    const resetAllButton = document.getElementById('resetAllButton');
    const copyResponseButton = document.getElementById('copyResponseButton');
    const clearResponseButton = document.getElementById('clearResponseButton');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const responseContainer = document.getElementById('responseContainer');
    const responseText = document.getElementById('responseText');
    const errorContainer = document.getElementById('errorContainer');
    const errorText = document.getElementById('errorText');

    // Set default prompt
    const defaultPrompt = 'Describe this screenshot in detail.';
    promptInput.value = defaultPrompt;

    // Load saved prompt from localStorage
    loadSavedPrompt();

    // Load saved text-only mode preference
    loadTextOnlyMode();

    // Load and setup API key immediately
    try {
        loadApiKey();
    } catch (error) {
        // Silent error handling
    }

    // Load and populate models, then restore saved selections
    try {
        await loadModelsToDropdown();
    } catch (error) {
        // Silent error handling
    }
    
    // Give a small delay to ensure DOM is ready, then load saved preferences
    setTimeout(() => {
        try {
            loadSavedModel();
            loadSavedResponse();
            
            // Final check for API key status
            checkApiKeyStatus();
        } catch (error) {
            // Silent error handling
        }
    }, 150);

    // Set default model as fallback if no saved model
    setTimeout(() => {
        if (modelSelect.options.length > 0 && !modelSelect.value) {
            modelSelect.value = 'gemini-2.5-flash';
        }
    }, 200);

    // Variable to store raw response for copying
    let currentResponse = '';

    captureButton.addEventListener('click', async function() {
        try {
            const prompt = promptInput.value.trim();
            const selectedModel = modelSelect.value;
            const isTextOnly = textOnlyMode.checked;
            
            if (!prompt) {
                showError('Please enter a prompt before submitting.');
                return;
            }

            // Validate selected model
            let availableModels;
            try {
                availableModels = getModelsForDropdown();
            } catch (modelError) {
                showError('Error validating model selection. Please try again.');
                return;
            }
            
            if (!availableModels[selectedModel]) {
                showError(`Invalid model selected: ${selectedModel}. Available models: ${Object.keys(availableModels).join(', ')}`);
                return;
            }

            try {
                // Show loading state
                showLoading();
                
                let screenshot = null;
                
                // Only capture screenshot if not in text-only mode
                if (!isTextOnly) {
                    try {
                        screenshot = await captureCurrentTab();
                    } catch (captureError) {
                        showError(`Screenshot capture failed: ${captureError.message || 'Unable to capture screen'}`);
                        return;
                    }
                }
                
                // Send to Google AI with selected model
                let response;
                try {
                    if (isTextOnly) {
                        // Send text-only request
                        response = await sendTextOnlyToGoogleAI(prompt, selectedModel);
                    } else {
                        // Send with screenshot
                        response = await sendToGoogleAI(prompt, screenshot, selectedModel);
                    }
                } catch (apiError) {
                    // Handle specific API errors without throwing to Extensions page
                    if (apiError.message.includes('API key not valid')) {
                        showError('API key is invalid. Please check your Google AI Studio API key and try again.');
                    } else if (apiError.message.includes('Network error') || apiError.message.includes('Failed to fetch')) {
                        showError('Network connection failed. Please check your internet connection and try again.');
                    } else if (apiError.message.includes('Rate limit')) {
                        showError('Rate limit exceeded. Please wait a moment and try again.');
                    } else {
                        showError(`AI processing failed: ${apiError.message || 'Unknown error occurred'}`);
                    }
                    return;
                }
                
                // Display response
                if (response) {
                    showResponse(response);
                    // Save response to localStorage
                    try {
                        saveResponseToStorage(response);
                    } catch (saveError) {
                        // Silent error handling
                    }
                } else {
                    showError('No response received from AI service');
                }
                
            } catch (error) {
                // Final fallback error handler to prevent uncaught exceptions
                showError(`Unexpected error: ${error.message || 'Something went wrong. Please try again.'}`);
            }
        } catch (outerError) {
            // Absolute final catch to prevent any errors from reaching Extensions page
            showError('A critical error occurred. Please reload the extension and try again.');
        }
    });

    // Enter key support for textarea
    promptInput.addEventListener('keydown', function(event) {
        if (event.ctrlKey && event.key === 'Enter') {
            captureButton.click();
        }
    });

    // Auto-save prompt to localStorage when user types
    promptInput.addEventListener('input', function() {
        savePromptToStorage();
    });

    // Also save on blur (when user clicks outside)
    promptInput.addEventListener('blur', function() {
        savePromptToStorage();
    });

    // Save selected model when changed
    modelSelect.addEventListener('change', function() {
        saveSelectedModel();
    });

    // Save text-only mode preference when changed
    textOnlyMode.addEventListener('change', function() {
        saveTextOnlyMode();
        // Update button text based on mode
        updateCaptureButtonText();
    });

    // Toggle API section visibility
    if (toggleApiSectionButton) {
        toggleApiSectionButton.addEventListener('click', function() {
            if (apiKeySection.classList.contains('hidden')) {
                apiKeySection.classList.remove('hidden');
                toggleApiSectionButton.textContent = '❌';
            } else {
                apiKeySection.classList.add('hidden');
                toggleApiSectionButton.textContent = '⚙️';
            }
        });
    }

    // API Key toggle visibility
    if (toggleApiKeyButton) {
        toggleApiKeyButton.addEventListener('click', function() {
            if (apiKeyInput.type === 'password') {
                apiKeyInput.type = 'text';
                toggleApiKeyButton.textContent = '🙈';
                toggleApiKeyButton.title = 'Hide API Key';
            } else {
                apiKeyInput.type = 'password';
                toggleApiKeyButton.textContent = '👁️';
                toggleApiKeyButton.title = 'Show API Key';
            }
        });
    }

    // Save API key
    if (saveApiKeyButton) {
        saveApiKeyButton.addEventListener('click', function() {
            saveApiKey();
        });
    }

    // Auto-validate API key on input
    if (apiKeyInput) {
        // No format validation - just trim spaces on input
        apiKeyInput.addEventListener('input', function() {
            if (apiKeyInput.className.includes('invalid') || apiKeyInput.className.includes('valid')) {
                apiKeyInput.className = 'api-key-input'; // Reset styling
            }
        });

        // Enter key support for API key
        apiKeyInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                saveApiKey();
            }
        });
    }

    // Reset prompt button event listener
    resetPromptButton.addEventListener('click', function() {
        clearSavedPrompt();
        
        // Show visual feedback
        resetPromptButton.textContent = '✅';
        setTimeout(() => {
            resetPromptButton.textContent = '🔄';
        }, 1000);
    });

    /* 
    // Get models button event listener (Hidden - using predefined models)
    getModelsButton.addEventListener('click', async function() {
        try {
            // Show loading state
            getModelsButton.disabled = true;
            getModelsButton.innerHTML = '<span class="btn-text">🔄 Fetching Models...</span>';
            
            // Fetch available models
            const modelsData = await getAvailableModels();
            
            // Update dropdown with new models
            loadModelsToDropdown();
            
            // Show success message
            showSuccess(`✅ Found ${Object.keys(modelsData.generateContent).length} models that support generateContent!`);
            
        } catch (error) {
            console.error('Error fetching models:', error);
            showError(`Failed to fetch models: ${error.message}`);
        } finally {
            // Reset button state
            getModelsButton.disabled = false;
            getModelsButton.innerHTML = '<span class="btn-text">🔄 Get Available Models</span>';
        }
    });
    */

    // Clear cache button event listener
    clearCacheButton.addEventListener('click', function() {
        try {
            // Clear cache but keep current session data (prompt, model, response)
            localStorage.removeItem('askink_available_models');
            
            // Reload models to dropdown (will use default models)
            loadModelsToDropdown();
            
            // Restore saved model selection (don't reset to default)
            setTimeout(() => {
                loadSavedModel();
            }, 100);
            
            showSuccess('✅ Model cache cleared! User data preserved.');
        } catch (error) {
            showError('Failed to clear cache.');
        }
    });

    // Reset all button event listener
    resetAllButton.addEventListener('click', function() {
        if (confirm('This will clear all saved data (API key, prompts, models, responses) and reset to defaults. Continue?')) {
            try {
                // Clear all localStorage data including API key
                localStorage.removeItem('askink_available_models');
                localStorage.removeItem('askink_saved_prompt');
                localStorage.removeItem('askink_selected_model');
                localStorage.removeItem('askink_current_response');
                localStorage.removeItem('askink_api_key');
                
                // Reset UI to defaults
                const defaultPrompt = 'Describe this screenshot in detail.';
                promptInput.value = defaultPrompt;
                apiKeyInput.value = '';
                apiKeyInput.className = 'api-key-input';
                
                // Show API key section
                if (apiKeySection) {
                    apiKeySection.classList.remove('hidden');
                    toggleApiSectionButton.textContent = '❌';
                }
                
                // Reload models and set default
                loadModelsToDropdown();
                setTimeout(() => {
                    if (modelSelect.options.length > 0) {
                        modelSelect.value = 'gemini-2.5-flash';
                    }
                }, 100);
                
                // Clear response container
                if (responseContainer) {
                    responseContainer.classList.add('hidden');
                }
                currentResponse = '';
                
                showSuccess('✅ All data cleared! Please set your API key to continue.');
            } catch (error) {
                showError('Failed to reset data.');
            }
        }
    });

    // Copy response button event listener
    copyResponseButton.addEventListener('click', async function() {
        try {
            const textToCopy = currentResponse || 'No response available';
            
            if (textToCopy) {
                try {
                    await navigator.clipboard.writeText(textToCopy);
                    
                    // Show feedback
                    copyResponseButton.textContent = '✅';
                    
                    setTimeout(() => {
                        copyResponseButton.textContent = '📋';
                    }, 1500);
                } catch (clipboardError) {
                    // Fallback for older browsers
                    try {
                        const textArea = document.createElement('textarea');
                        textArea.value = textToCopy;
                        document.body.appendChild(textArea);
                        textArea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textArea);
                        
                        copyResponseButton.textContent = '✅';
                        setTimeout(() => {
                            copyResponseButton.textContent = '📋';
                        }, 1500);
                    } catch (fallbackError) {
                        showError('Failed to copy response to clipboard');
                    }
                }
            }
        } catch (outerError) {
            console.error('Critical error in copy button handler:', outerError);
            showError('Failed to copy response');
        }
    });

    // Clear response button event listener
    clearResponseButton.addEventListener('click', function() {
        try {
            // Clear localStorage for current response
            localStorage.removeItem('askink_current_response');
            
            // Clear UI
            if (responseContainer) {
                responseContainer.classList.add('hidden');
            }
            currentResponse = '';
            
            // Show feedback
            clearResponseButton.textContent = '✅';
            setTimeout(() => {
                clearResponseButton.textContent = '🗑️';
            }, 1500);
        } catch (error) {
            // Silent error handling
        }
    });

    function showLoading() {
        captureButton.disabled = true;
        captureButton.innerHTML = '<span class="btn-text">Processing...</span>';
        if (loadingIndicator) {
            loadingIndicator.classList.remove('hidden');
        }
        if (responseContainer) {
            responseContainer.classList.add('hidden');
        }
        if (errorContainer) {
            errorContainer.classList.add('hidden');
        }
    }

    function showResponse(response) {
        captureButton.disabled = false;
        captureButton.innerHTML = '<span class="btn-text">Capture and Send</span>';
        loadingIndicator.classList.add('hidden');
        
        // Store raw response for copying
        currentResponse = response || 'No response available';
        
        // Format the response text for better readability
        const formattedResponse = formatResponseText(response);
        
        if (responseText) {
            responseText.innerHTML = formattedResponse;
        }
        
        if (responseContainer) {
            responseContainer.classList.remove('hidden');
        }
        
        if (errorContainer) {
            errorContainer.classList.add('hidden');
        }
    }

    function showError(message) {
        captureButton.disabled = false;
        captureButton.innerHTML = '<span class="btn-text">Capture and Send</span>';
        loadingIndicator.classList.add('hidden');
        if (errorText) {
            errorText.textContent = message;
        }
        if (errorContainer) {
            errorContainer.classList.remove('hidden');
        }
        if (responseContainer) {
            responseContainer.classList.add('hidden');
        }
    }

    function showSuccess(message) {
        captureButton.disabled = false;
        captureButton.innerHTML = '<span class="btn-text">Capture and Send</span>';
        loadingIndicator.classList.add('hidden');
        if (responseText) {
            responseText.textContent = message;
        }
        if (responseContainer) {
            responseContainer.classList.remove('hidden');
        }
        if (errorContainer) {
            errorContainer.classList.add('hidden');
        }
    }

    // Fallback function in case getModelsForDropdown is not available
    function getFallbackModels() {
        return {
            'gemini-2.5-flash': 'Gemini 2.5 Flash - Advanced Performance 🚀',
            'gemini-2.0-flash': 'Gemini 2.0 Flash - Best for Image Analysis 🎯',
            'gemini-2.0-flash-exp': 'Gemini 2.0 Flash (Experimental) - Latest Features ⚡',
            'gemini-2.0-flash-lite': 'Gemini 2.0 Flash Lite - Lightweight 💨',
            'gemini-2.5-flash-lite': 'Gemini 2.5 Flash Lite - Efficient 📱',
            'gemini-2.5-pro': 'Gemini 2.5 Pro - Highest Quality 💎'
        };
    }

    function loadModelsToDropdown() {
        // Get available models (from localStorage or default)
        let availableModels;
        try {
            if (typeof getModelsForDropdown === 'function') {
                availableModels = getModelsForDropdown();
            } else {
                availableModels = getFallbackModels();
            }
        } catch (error) {
            availableModels = getFallbackModels();
        }
        
        // Clear existing options
        modelSelect.innerHTML = '';
        
        // Add models to dropdown
        Object.keys(availableModels).forEach(modelKey => {
            const option = document.createElement('option');
            option.value = modelKey;
            option.textContent = availableModels[modelKey];
            modelSelect.appendChild(option);
        });
        
        // Set default if available (use gemini-2.5-flash as first priority)
        if (availableModels['gemini-2.5-flash']) {
            modelSelect.value = 'gemini-2.5-flash';
        } else if (availableModels['gemini-2.0-flash']) {
            modelSelect.value = 'gemini-2.0-flash';
        } else if (availableModels['gemini-2.0-flash-exp']) {
            modelSelect.value = 'gemini-2.0-flash-exp';
        } else {
            // Use first available model
            const firstModel = Object.keys(availableModels)[0];
            if (firstModel) {
                modelSelect.value = firstModel;
            }
        }
    }

    function formatResponseText(text) {
        if (!text) return 'No response available.';
        
        // Escape HTML first to prevent XSS
        const escapeHtml = (unsafe) => {
            return unsafe
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        };
        
        let formatted = escapeHtml(text);
        
        // Format markdown-style bold text
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Format headers (lines starting with **)
        formatted = formatted.replace(/^\*\*(.*?)\*\*$/gm, '<h3>$1</h3>');
        
        // Format bullet points (lines starting with *)
        formatted = formatted.replace(/^\* (.*?)$/gm, '• $1');
        
        // Format numbered lists
        formatted = formatted.replace(/^\d+\.\s(.*?)$/gm, function(match, p1, offset, string) {
            const lineNumber = match.match(/^(\d+)\./)[1];
            return `${lineNumber}. ${p1}`;
        });
        
        // Add proper line breaks
        formatted = formatted.replace(/\n\n/g, '<br><br>');
        formatted = formatted.replace(/\n/g, '<br>');
        
        // Format code or technical terms in backticks
        formatted = formatted.replace(/`(.*?)`/g, '<code>$1</code>');
        
        return formatted;
    }

    // Function to save prompt to localStorage
    function savePromptToStorage() {
        try {
            const promptText = promptInput.value;
            localStorage.setItem('askink_saved_prompt', promptText);
        } catch (error) {
            // Silent error handling
        }
    }

    // Function to load saved prompt from localStorage
    function loadSavedPrompt() {
        try {
            const savedPrompt = localStorage.getItem('askink_saved_prompt');
            if (savedPrompt && savedPrompt.trim() !== '') {
                promptInput.value = savedPrompt;
            }
        } catch (error) {
            // Silent error handling
        }
    }

    // Function to clear saved prompt (optional - for reset functionality)
    function clearSavedPrompt() {
        try {
            localStorage.removeItem('askink_saved_prompt');
            const defaultPrompt = 'Describe this screenshot in detail.';
            promptInput.value = defaultPrompt;
        } catch (error) {
            // Silent error handling
        }
    }

    // Function to save selected model to localStorage
    function saveSelectedModel() {
        try {
            const selectedModel = modelSelect.value;
            if (selectedModel) {
                localStorage.setItem('askink_selected_model', selectedModel);
            }
        } catch (error) {
            // Silent error handling
        }
    }

    // Function to load saved model selection
    function loadSavedModel() {
        try {
            const savedModel = localStorage.getItem('askink_selected_model');
            
            if (savedModel) {
                // Wait a bit for dropdown to be populated
                setTimeout(() => {
                    // Check if saved model exists in current options
                    const options = Array.from(modelSelect.options).map(opt => opt.value);
                    
                    if (options.includes(savedModel)) {
                        modelSelect.value = savedModel;
                    }
                }, 10);
            }
        } catch (error) {
            // Silent error handling
        }
    }

    // Function to save response to localStorage (persistent across popup sessions)
    function saveResponseToStorage(response) {
        try {
            const responseData = {
                text: response,
                timestamp: new Date().toISOString(),
                model: modelSelect.value,
                prompt: promptInput.value
            };
            // Use localStorage so response persists across popup sessions
            localStorage.setItem('askink_current_response', JSON.stringify(responseData));
        } catch (error) {
            // Silent error handling
        }
    }

    // Function to load saved response from localStorage
    function loadSavedResponse() {
        try {
            const savedResponse = localStorage.getItem('askink_current_response');
            
            if (savedResponse) {
                const responseData = JSON.parse(savedResponse);
                if (responseData.text && responseData.text.trim() !== '') {
                    // Store raw response for copying
                    currentResponse = responseData.text;
                    
                    // Format and display the response
                    const formattedResponse = formatResponseText(responseData.text);
                    if (responseText) {
                        responseText.innerHTML = formattedResponse;
                    }
                    
                    if (responseContainer) {
                        responseContainer.classList.remove('hidden');
                    }
                }
            }
        } catch (error) {
            // Silent error handling
        }
    }

    // API Key Management Functions
    function loadApiKey() {
        try {
            const savedApiKey = localStorage.getItem('askink_api_key');
            
            if (savedApiKey && savedApiKey.trim() !== '') {
                if (apiKeyInput) {
                    apiKeyInput.value = savedApiKey;
                    // No format validation needed
                }
            }
            
        } catch (error) {
            // Silent error handling
        }
        
        // Always check status after attempting to load
        setTimeout(() => {
            checkApiKeyStatus();
        }, 10);
    }

    function saveApiKey() {
        try {
            const apiKey = apiKeyInput.value.trim();
            
            if (!apiKey) {
                showError('Please enter an API key');
                return;
            }

            // Save to localStorage - let Google API validate the key
            localStorage.setItem('askink_api_key', apiKey);
            
            // Remove validation styling since we don't validate format anymore
            if (apiKeyInput) {
                apiKeyInput.className = 'api-key-input';
            }
            
            // Show success feedback on button
            if (saveApiKeyButton) {
                saveApiKeyButton.textContent = '✅';
                setTimeout(() => {
                    saveApiKeyButton.textContent = '💾';
                }, 2000);
            }
            
            // Show success message
            showSuccess('✅ API key saved successfully!');
            
            // Auto-hide API key section after a short delay
            setTimeout(() => {
                if (apiKeySection) {
                    apiKeySection.classList.add('hidden');
                }
                if (toggleApiSectionButton) {
                    toggleApiSectionButton.textContent = '⚙️';
                }
            }, 1500);
            
        } catch (error) {
            showError('Failed to save API key: ' + error.message);
        }
    }

    function checkApiKeyStatus() {
        try {
            const apiKey = localStorage.getItem('askink_api_key');
            const hasApiKey = apiKey && apiKey.trim() !== '';
            
            if (hasApiKey) {
                // Hide API key section if API key exists
                if (apiKeySection) {
                    apiKeySection.classList.add('hidden');
                }
                if (toggleApiSectionButton) {
                    toggleApiSectionButton.textContent = '⚙️';
                }
                return true;
            } else {
                // Show API key section if no API key
                if (apiKeySection) {
                    apiKeySection.classList.remove('hidden');
                }
                if (toggleApiSectionButton) {
                    toggleApiSectionButton.textContent = '❌';
                }
                return false;
            }
        } catch (error) {
            return false;
        }
    }

    async function captureCurrentTab() {
        return new Promise((resolve, reject) => {
            try {
                // Get the current active tab
                chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                    try {
                        if (chrome.runtime.lastError) {
                            reject(new Error(`Failed to access tab: ${chrome.runtime.lastError.message}`));
                            return;
                        }
                        
                        if (tabs.length === 0) {
                            reject(new Error('No active tab found.'));
                            return;
                        }

                        const activeTab = tabs[0];
                        
                        // Capture the visible area of the tab
                        chrome.tabs.captureVisibleTab(activeTab.windowId, { 
                            format: 'png',
                            quality: 90 
                        }, function(dataUrl) {
                            try {
                                if (chrome.runtime.lastError) {
                                    reject(new Error(`Failed to capture screenshot: ${chrome.runtime.lastError.message}`));
                                    return;
                                }
                                
                                if (!dataUrl) {
                                    reject(new Error('Failed to capture screenshot: No data received.'));
                                    return;
                                }

                                // Extract base64 data from data URL
                                try {
                                    const base64Data = dataUrl.split(',')[1];
                                    if (!base64Data) {
                                        reject(new Error('Failed to extract image data from screenshot'));
                                        return;
                                    }
                                    resolve(base64Data);
                                } catch (extractError) {
                                    reject(new Error('Failed to process screenshot data'));
                                }
                            } catch (captureError) {
                                reject(new Error(`Screenshot capture failed: ${captureError.message}`));
                            }
                        });
                    } catch (queryError) {
                        reject(new Error(`Failed to query tabs: ${queryError.message}`));
                    }
                });
            } catch (outerError) {
                reject(new Error(`Screenshot function failed: ${outerError.message}`));
            }
        });
    }

    // Function to save text-only mode preference
    function saveTextOnlyMode() {
        try {
            const isTextOnly = textOnlyMode.checked;
            localStorage.setItem('askink_text_only_mode', isTextOnly.toString());
        } catch (error) {
            // Silent error handling
        }
    }

    // Function to load text-only mode preference
    function loadTextOnlyMode() {
        try {
            const savedMode = localStorage.getItem('askink_text_only_mode');
            if (savedMode !== null) {
                textOnlyMode.checked = savedMode === 'true';
                updateCaptureButtonText();
            }
        } catch (error) {
            // Silent error handling
        }
    }

    // Function to update capture button text based on mode
    function updateCaptureButtonText() {
        if (textOnlyMode.checked) {
            captureButton.innerHTML = '<span class="btn-text">Send Text</span>';
        } else {
            captureButton.innerHTML = '<span class="btn-text">Capture and Send</span>';
        }
    }

    // Function to adjust container height based on visible content
    function adjustContainerHeight() {
        const container = document.querySelector('.container');
        const respContainer = document.getElementById('responseContainer');
        const errContainer = document.getElementById('errorContainer');
        
        // Remove existing responsive classes
        container.classList.remove('compact', 'expanded');
        
        // Check if response or error containers are visible
        const hasVisibleContent = (!respContainer.classList.contains('hidden')) || 
                                 (!errContainer.classList.contains('hidden'));
        
        if (hasVisibleContent) {
            container.classList.add('expanded');
        } else {
            container.classList.add('compact');
        }
    }

    // Call adjustContainerHeight when containers show/hide
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                adjustContainerHeight();
            }
        });
    });

    // Observe response and error containers for class changes
    const respContainerObs = document.getElementById('responseContainer');
    const errContainerObs = document.getElementById('errorContainer');
    if (respContainerObs) observer.observe(respContainerObs, { attributes: true });
    if (errContainerObs) observer.observe(errContainerObs, { attributes: true });

    // Initial adjustment
    adjustContainerHeight();
});