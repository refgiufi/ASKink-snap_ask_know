// ASKink Extension - API Handler

// Google AI Studio API configuration
const GOOGLE_AI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

// Available Gemini models for free tier (based on actual Google AI Studio availability)
const GEMINI_MODELS = {
    'gemini-2.5-flash': 'Gemini 2.5 Flash - Advanced Performance 🚀',
    'gemini-2.0-flash': 'Gemini 2.0 Flash - Best for Image Analysis 🎯',
    'gemini-2.0-flash-exp': 'Gemini 2.0 Flash (Experimental) - Latest Features ⚡',
    'gemini-2.0-flash-lite': 'Gemini 2.0 Flash Lite - Lightweight 💨',
    'gemini-2.5-flash-lite': 'Gemini 2.5 Flash Lite - Efficient 📱',
    'gemini-2.5-pro': 'Gemini 2.5 Pro - Highest Quality 💎'
};

// Default recommended model (advanced performance)
const DEFAULT_MODEL = 'gemini-2.5-flash';

// Function to get API key from localStorage
function getApiKey() {
    try {
        const apiKey = localStorage.getItem('askink_api_key');
        return apiKey && apiKey.trim() !== '' ? apiKey.trim() : null;
    } catch (error) {
        // Silent error handling
        return null;
    }
}

// Function to validate API key format (basic validation)
function isValidApiKeyFormat(apiKey) {
    if (!apiKey || typeof apiKey !== 'string') return false;
    // Basic validation - just check if it's not empty
    return apiKey.trim().length > 0;
}

/**
 * Sends a prompt and base64 image to Google AI Studio API (Gemini model)
 * @param {string} prompt - The text prompt from the user
 * @param {string} base64Image - The base64 encoded screenshot
 * @param {string} model - The Gemini model to use (optional, defaults to recommended)
 * @returns {Promise<string>} - The AI response text
 */
async function sendToGoogleAI(prompt, base64Image, model = DEFAULT_MODEL) {
    // Get API key from localStorage
    const API_KEY = getApiKey();
    
    // Validate API key
    if (!API_KEY) {
        throw new Error('Please set your Google AI Studio API key first. Get your key from: https://aistudio.google.com/api-keys');
    }

    if (!isValidApiKeyFormat(API_KEY)) {
        throw new Error('Invalid API key format. Please check your API key from: https://aistudio.google.com/api-keys');
    }

    // Validate inputs
    if (!prompt?.trim()) {
        throw new Error('Prompt is required');
    }

    if (!base64Image) {
        throw new Error('Screenshot data is required');
    }

    // Validate model
    if (!GEMINI_MODELS[model]) {
        throw new Error(`Invalid model: ${model}. Available models: ${Object.keys(GEMINI_MODELS).join(', ')}`);
    }

    const apiUrl = `${GOOGLE_AI_API_BASE}/${model}:generateContent?key=${API_KEY}`;
    
    const requestBody = {
        contents: [
            {
                role: 'user',
                parts: [
                    {
                        text: prompt
                    },
                    {
                        inline_data: {
                            mime_type: 'image/png',
                            data: base64Image
                        }
                    }
                ]
            }
        ],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
            topP: 0.95,
            topK: 40
        },
        safetySettings: [
            {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
                category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            }
        ]
    };

    try {
        let response;
        try {
            response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
        } catch (fetchError) {
            // Silent error handling
            if (fetchError.name === 'TypeError' || fetchError.message.includes('Failed to fetch')) {
                throw new Error('Network error: Please check your internet connection and try again.');
            }
            throw new Error(`Request failed: ${fetchError.message}`);
        }

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (jsonError) {
                // Silent error handling
                errorData = null;
            }
            
            const errorMessage = errorData?.error?.message || `HTTP ${response.status}: ${response.statusText}`;
            
            if (response.status === 400) {
                throw new Error(`API Error: ${errorMessage}. Please check your API key and request format.`);
            } else if (response.status === 403) {
                throw new Error(`Access denied: ${errorMessage}. Please verify your API key has the necessary permissions.`);
            } else if (response.status === 429) {
                throw new Error('Rate limit exceeded. Please try again later.');
            } else {
                throw new Error(`API request failed: ${errorMessage}`);
            }
        }

        let data;
        try {
            data = await response.json();
        } catch (jsonError) {
            // Silent error handling
            throw new Error('Invalid response format from Google AI Studio API');
        }
        
        // Extract the generated text from the response
        if (data.candidates && data.candidates.length > 0) {
            const candidate = data.candidates[0];
            
            if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
                const responseText = candidate.content.parts[0].text;
                return responseText || 'No response text available.';
            }
        }

        // Handle edge cases
        if (data.candidates && data.candidates.length > 0 && data.candidates[0].finishReason) {
            const finishReason = data.candidates[0].finishReason;
            if (finishReason === 'SAFETY') {
                throw new Error('The request was blocked due to safety concerns. Please try a different prompt or image.');
            } else if (finishReason === 'MAX_TOKENS') {
                throw new Error('The response was truncated due to length limits. The AI response may be incomplete.');
            } else {
                throw new Error(`Request completed with reason: ${finishReason}`);
            }
        }

        throw new Error(`Unexpected response format from Google AI Studio API. Response: ${JSON.stringify(data, null, 2)}`);

    } catch (error) {
        // Silent error handling to prevent showing in Extensions page
        // Re-throw known errors as-is (but don't log them)
        if (error.message.includes('Network error') || 
            error.message.includes('API Error') || 
            error.message.includes('Access denied') || 
            error.message.includes('Rate limit') || 
            error.message.includes('safety concerns') || 
            error.message.includes('truncated') || 
            error.message.includes('API key') ||
            error.message.includes('Invalid response format')) {
            throw error;
        }
        
        // Handle fetch errors
        if (error.name === 'TypeError' || error.message.includes('Failed to fetch')) {
            throw new Error('Network error: Please check your internet connection and try again.');
        }
        
        // Handle any other unexpected errors
        throw new Error(`Unexpected error: ${error.message || 'Something went wrong with the AI request'}`);
    }
}

/**
 * Sends a text-only prompt to Google AI Studio API (Gemini model) without image
 * @param {string} prompt - The text prompt from the user
 * @param {string} model - The Gemini model to use (optional, defaults to recommended)
 * @returns {Promise<string>} - The AI response text
 */
async function sendTextOnlyToGoogleAI(prompt, model = DEFAULT_MODEL) {
    // Get API key from localStorage
    const API_KEY = getApiKey();
    
    // Validate API key
    if (!API_KEY) {
        throw new Error('Please set your Google AI Studio API key first. Get your key from: https://aistudio.google.com/api-keys');
    }

    if (!isValidApiKeyFormat(API_KEY)) {
        throw new Error('Invalid API key format. Please check your API key from: https://aistudio.google.com/api-keys');
    }

    // Validate inputs
    if (!prompt?.trim()) {
        throw new Error('Prompt is required');
    }

    // Validate model
    if (!GEMINI_MODELS[model]) {
        throw new Error(`Invalid model: ${model}. Available models: ${Object.keys(GEMINI_MODELS).join(', ')}`);
    }

    const apiUrl = `${GOOGLE_AI_API_BASE}/${model}:generateContent?key=${API_KEY}`;
    
    const requestBody = {
        contents: [
            {
                role: 'user',
                parts: [
                    {
                        text: prompt
                    }
                ]
            }
        ],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
            topP: 0.95,
            topK: 40
        },
        safetySettings: [
            {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
                category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            }
        ]
    };

    try {
        let response;
        try {
            response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
        } catch (fetchError) {
            // Silent error handling
            if (fetchError.name === 'TypeError' || fetchError.message.includes('Failed to fetch')) {
                throw new Error('Network error: Please check your internet connection and try again.');
            }
            throw new Error(`Request failed: ${fetchError.message}`);
        }

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (jsonError) {
                // Silent error handling
                errorData = null;
            }
            
            const errorMessage = errorData?.error?.message || `HTTP ${response.status}: ${response.statusText}`;
            
            if (response.status === 400) {
                throw new Error(`API Error: ${errorMessage}. Please check your API key and request format.`);
            } else if (response.status === 403) {
                throw new Error(`Access denied: ${errorMessage}. Please verify your API key has the necessary permissions.`);
            } else if (response.status === 429) {
                throw new Error('Rate limit exceeded. Please try again later.');
            } else {
                throw new Error(`API request failed: ${errorMessage}`);
            }
        }

        let data;
        try {
            data = await response.json();
        } catch (jsonError) {
            // Silent error handling
            throw new Error('Invalid response format from Google AI Studio API');
        }
        
        // Extract the generated text from the response
        if (data.candidates && data.candidates.length > 0) {
            const candidate = data.candidates[0];
            
            if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
                const responseText = candidate.content.parts[0].text;
                return responseText || 'No response text available.';
            }
        }

        // Handle edge cases
        if (data.candidates && data.candidates.length > 0 && data.candidates[0].finishReason) {
            const finishReason = data.candidates[0].finishReason;
            if (finishReason === 'SAFETY') {
                throw new Error('The request was blocked due to safety concerns. Please try a different prompt.');
            } else if (finishReason === 'MAX_TOKENS') {
                throw new Error('The response was truncated due to length limits. The AI response may be incomplete.');
            } else {
                throw new Error(`Request completed with reason: ${finishReason}`);
            }
        }

        throw new Error(`Unexpected response format from Google AI Studio API. Response: ${JSON.stringify(data, null, 2)}`);

    } catch (error) {
        // Silent error handling to prevent showing in Extensions page
        // Re-throw known errors as-is (but don't log them)
        if (error.message.includes('Network error') || 
            error.message.includes('API Error') || 
            error.message.includes('Access denied') || 
            error.message.includes('Rate limit') || 
            error.message.includes('safety concerns') || 
            error.message.includes('truncated') || 
            error.message.includes('API key') ||
            error.message.includes('Invalid response format')) {
            throw error;
        }
        
        // Handle fetch errors
        if (error.name === 'TypeError' || error.message.includes('Failed to fetch')) {
            throw new Error('Network error: Please check your internet connection and try again.');
        }
        
        // Handle any other unexpected errors
        throw new Error(`Unexpected error: ${error.message || 'Something went wrong with the AI request'}`);
    }
}

/**
 * Fetches the list of available models from Google AI Studio API
 * @returns {Promise<Object>} - Object containing available models
 */
async function getAvailableModels() {
    // Get API key from localStorage
    const API_KEY = getApiKey();
    
    // Validate API key
    if (!API_KEY) {
        throw new Error('Please set your Google AI Studio API key first. Get your key from: https://aistudio.google.com/api-keys');
    }

    if (!isValidApiKeyFormat(API_KEY)) {
        throw new Error('Invalid API key format. Please check your API key from: https://aistudio.google.com/api-keys');
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
    
    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            const errorMessage = errorData?.error?.message || `HTTP ${response.status}: ${response.statusText}`;
            throw new Error(`Failed to fetch models: ${errorMessage}`);
        }

        const data = await response.json();

        // Filter models that support generateContent
        const generateContentModels = {};
        const embedContentModels = {};

        if (data.models && Array.isArray(data.models)) {
            data.models.forEach(model => {
                if (model.supportedGenerationMethods && Array.isArray(model.supportedGenerationMethods)) {
                    const modelName = model.name.replace('models/', '');
                    const displayName = model.displayName || modelName;
                    
                    if (model.supportedGenerationMethods.includes('generateContent')) {
                        generateContentModels[modelName] = displayName;
                    }
                    
                    if (model.supportedGenerationMethods.includes('embedContent')) {
                        embedContentModels[modelName] = displayName;
                    }
                }
            });
        }

        const result = {
            generateContent: generateContentModels,
            embedContent: embedContentModels,
            lastUpdated: new Date().toISOString(),
            totalModels: data.models ? data.models.length : 0
        };

        // Save to localStorage for future use
        localStorage.setItem('askink_available_models', JSON.stringify(result));
        
        return result;

    } catch (error) {
        // Silent error handling
        if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
            throw new Error('Network error: Please check your internet connection and try again.');
        }
        
        throw error;
    }
}

/**
 * Load models from localStorage or use default models
 * @returns {Object} - Available models for generateContent
 */
function getModelsForDropdown() {
    // Always use our curated GEMINI_MODELS instead of localStorage cache
    // This ensures we only show the 6 valid models that actually work
    return GEMINI_MODELS;
    
    /* 
    // Previous implementation that used localStorage cache:
    try {
        const savedModels = localStorage.getItem('askink_available_models');
        console.log('Saved models from localStorage:', savedModels);
        
        if (savedModels) {
            const modelsData = JSON.parse(savedModels);
            console.log('Parsed models data:', modelsData);
            
            if (modelsData.generateContent && Object.keys(modelsData.generateContent).length > 0) {
                console.log('Using saved models:', modelsData.generateContent);
                return modelsData.generateContent;
            }
        }
    } catch (error) {
        console.warn('Failed to load saved models:', error);
    }
    
    // Fallback to default models if no saved models
    console.log('Using default models:', GEMINI_MODELS);
    return GEMINI_MODELS;
    */
}

// Export for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { sendToGoogleAI, sendTextOnlyToGoogleAI, GEMINI_MODELS, DEFAULT_MODEL, getAvailableModels, getModelsForDropdown };
}