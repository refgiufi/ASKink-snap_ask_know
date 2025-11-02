# ASKink – Snap. Ask. Know.

![ASKink Extension](logos/Demo%20App.png)

ASKink is a powerful Chrome Extension that revolutionizes how you interact with AI. Capture screenshots, ask questions with text-only mode, and get instant AI-powered insights from Google's Gemini models – all in a beautiful, modern interface.

## ✨ Key Features

### 🎯 **Dual Operation Modes**
- **📸 Screenshot Mode**: Capture your current tab and analyze it with AI
- **💬 Text-Only Mode**: Ask questions without screenshots for general inquiries

### � **Advanced AI Integration**
- **Multiple Gemini Models**: Choose from various Gemini models (Flash, Pro, etc.)
- **Optimized Performance**: Smart model selection for different use cases
- **Real-time Processing**: Fast response times with loading indicators

### 🎨 **Modern User Experience**
- **Professional Design**: Clean glassmorphism UI with gradient backgrounds
- **Responsive Layout**: Dynamic container sizing based on content
- **Logo Branding**: Custom ASKink logo with enhanced visibility
- **Intuitive Controls**: Clear buttons, checkboxes, and visual feedback

### ⚙️ **Smart Configuration**
- **Built-in API Key Management**: Set and save your API key within the extension
- **Persistent Settings**: Remember your preferences (text-only mode, selected model)
- **Easy Setup**: No need to manually edit files

### 🛡️ **Enhanced Security & Privacy**
- **Manifest V3**: Latest Chrome extension standard for maximum security
- **Silent Error Handling**: No annoying notifications in Chrome's extensions page
- **Local Storage**: Secure API key storage within the extension

## 🚀 Quick Start Guide

### 1. **Get Your Google AI Studio API Key**
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy your API key

### 2. **Install the Extension**
1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right)
3. Click **"Load unpacked"**
4. Select the ASKink folder
5. Pin the extension to your toolbar

### 3. **Configure API Key**
1. Click the ASKink extension icon
2. Click the ⚙️ settings button in the header
3. Paste your API key and click save 💾
4. Your key is now securely stored!

### 4. **Start Using ASKink**
- **For Screenshot Analysis**: Enter your prompt and click "Capture and Send"
- **For Text Questions**: Check "Text-only mode" and click "Send Text"
- **Choose AI Model**: Select from available Gemini models in the dropdown

## 🎯 Use Cases & Examples

### 📸 **Screenshot Analysis**
- **Web Content**: "Summarize the main points of this article"
- **UI/UX Review**: "What improvements could be made to this interface?"
- **Data Visualization**: "Explain the trends shown in this chart"
- **Error Debugging**: "What might be causing this error message?"

### 💬 **Text-Only Queries**
- **General Questions**: "Explain quantum computing in simple terms"
- **Coding Help**: "How do I optimize this JavaScript function?"
- **Writing Assistance**: "Help me improve this email draft"
- **Learning Support**: "What are the key concepts of machine learning?"

## 📁 Project Structure

```
ASKink/
├── 📄 manifest.json         # Extension configuration (Manifest v3)
├── 🌐 popup.html            # Main interface
├── ⚙️ popup.js             # Core functionality & UI logic
├── 🔌 api.js               # Google AI Studio API integration
├── 🎨 styles.css           # Modern UI styling with glassmorphism
├── 🖼️ background.js        # Background service worker
├── 🏷️ logo.png             # ASKink branding logo
├── 📁 icons/               # Extension icons (16px, 48px, 128px)
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── 📚 README.md            # This documentation
```

## � Technical Specifications

### **API Integration**
- **Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`
- **Supported Models**: Gemini 1.5 Flash, Gemini 2.0 Flash, Gemini Pro, etc.
- **Image Format**: PNG with optimized quality
- **Text Processing**: Advanced prompt handling with context awareness

### **Chrome Extension Details**
- **Manifest Version**: 3 (Latest standard)
- **Permissions**:
  - `activeTab`: Screenshot capture
  - `scripting`: Tab interaction
  - `tabs`: Browser tab management
- **Host Permissions**: `https://generativelanguage.googleapis.com/*`
- **Content Security**: Strict CSP for enhanced security

### **UI Technology**
- **Design System**: Modern glassmorphism with CSS3
- **Responsive**: Dynamic height adjustment
- **Animations**: Smooth transitions and loading states
- **Typography**: Inter font family for optimal readability

## 🎨 Design Features

### **Visual Elements**
- **Header**: Custom ASKink logo with gradient background
- **Glassmorphism**: Semi-transparent containers with backdrop blur
- **Color Scheme**: Professional blue gradient (`#4c63d2` to `#5b2c87`)
- **Typography**: Clean, readable Inter font family

### **User Interface**
- **Responsive Layout**: Adapts to content (compact/expanded modes)
- **Loading States**: Spinner with processing messages
- **Error Handling**: User-friendly error displays
- **Button States**: Clear visual feedback for all interactions

### **Accessibility**
- **High Contrast**: Optimized text and background contrast
- **Clear Labels**: Descriptive tooltips and button text
- **Keyboard Support**: Full keyboard navigation support
- **Screen Reader**: Semantic HTML for accessibility

## 🔒 Privacy & Security

- **Local Storage**: API keys stored securely within extension
- **Direct API Calls**: No third-party data intermediaries
- **HTTPS Only**: All communications encrypted
- **Minimal Permissions**: Only necessary browser permissions requested
- **No Tracking**: Zero telemetry or user behavior tracking

## 🚨 Troubleshooting

### **Common Issues**

**"Please set your API key" Error**
- Click ⚙️ in header → Enter API key → Click save 💾

**"Screenshot capture failed"**
- Ensure you're on a regular webpage (not chrome:// pages)
- Refresh the page and try again
- Check extension permissions

**"Network error"**
- Verify internet connection
- Check if Google AI Studio API is accessible
- Validate your API key hasn't expired

**Extension not loading**
- Enable Developer mode in `chrome://extensions/`
- Ensure all files are in the ASKink folder
- Check Console for error messages

### **Performance Tips**
- Use **Text-only mode** for faster responses on general questions
- Choose **Gemini Flash** models for speed
- Clear cache occasionally using the "Clear Cache" button

## 🆙 Future Roadmap

### **Planned Features**
- **🗂️ History**: Save and revisit previous conversations
- **📤 Export**: Download responses as markdown/text files
- **🎛️ Advanced Settings**: Custom temperature, token limits
- **📋 Templates**: Pre-built prompt templates for common tasks
- **🔗 Integration**: Connect with other productivity tools
- **🌐 Multi-language**: International language support

### **Performance Improvements**
- **⚡ Faster Processing**: Optimized API calls and caching
- **📱 Mobile Support**: Chrome mobile extension compatibility
- **🎨 Themes**: Dark mode and custom color schemes
- **⌨️ Shortcuts**: Global keyboard shortcuts for quick access

## 📊 Model Comparison

| Model | Speed | Quality | Best For |
|-------|--------|---------|----------|
| **Gemini 1.5 Flash** | ⚡⚡⚡ | ⭐⭐⭐ | Quick screenshots, general Q&A |
| **Gemini 2.0 Flash** | ⚡⚡ | ⭐⭐⭐⭐ | Advanced analysis, detailed responses |
| **Gemini Pro** | ⚡ | ⭐⭐⭐⭐⭐ | Complex reasoning, professional tasks |

## 🤝 Contributing

We welcome contributions! Whether it's:
- 🐛 **Bug Reports**: Help us identify and fix issues
- 💡 **Feature Requests**: Suggest new functionality
- 🔧 **Code Contributions**: Submit pull requests
- 📖 **Documentation**: Improve guides and examples

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Google AI Studio**: For providing powerful Gemini models
- **Chrome Extensions Team**: For the robust Manifest V3 platform
- **Open Source Community**: For inspiration and best practices

---

**Ready to revolutionize your browsing experience?** 
Install ASKink today and start having intelligent conversations with your web content! 🚀

*Created by [Refgiufi](https://www.linkedin.com/in/refgiufi/) with AI assistance*