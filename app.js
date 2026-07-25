/**
 * PromptPal - Application Controller & Logic
 */

import { SYSTEM_PROMPTS, generateSmartResponse, generateLiveApiResponse } from './prompts.js';

class PromptPalApp {
    constructor() {
        this.currentFunction = 'qa';
        this.theme = localStorage.getItem('promptpal_theme') || 'dark';
        this.apiKey = localStorage.getItem('promptpal_api_key') || '';
        this.apiProvider = localStorage.getItem('promptpal_api_provider') || 'none';
        this.feedbackState = JSON.parse(localStorage.getItem('promptpal_feedback') || '{}');
        this.history = JSON.parse(localStorage.getItem('promptpal_history') || '[]');
        this.lastGeneratedResponse = '';

        this.initDOM();
        this.bindEvents();
        this.applyTheme(this.theme);
        this.updateFunctionUI(this.currentFunction);
        this.renderPromptGuideCards();
        this.initSettingsModal();
    }

    initDOM() {
        // Navigation Elements
        this.navItems = document.querySelectorAll('.nav-item');
        this.viewContainers = document.querySelectorAll('.view-container');
        this.mobileToggle = document.getElementById('mobileToggle');
        this.sidebar = document.getElementById('sidebar');
        this.themeToggleBtn = document.getElementById('themeToggleBtn');
        this.themeIcon = document.getElementById('themeIcon');
        this.themeText = document.getElementById('themeText');
        this.breadcrumbTitle = document.getElementById('breadcrumbTitle');

        // Home View Controls
        this.functionSelect = document.getElementById('functionSelect');
        this.functionPills = document.querySelectorAll('.pill-btn');
        this.systemPromptText = document.getElementById('systemPromptText');
        this.promptInput = document.getElementById('promptInput');
        this.charCount = document.getElementById('charCount');
        this.wordCount = document.getElementById('wordCount');
        this.clearBtn = document.getElementById('clearBtn');
        this.presetChipsContainer = document.getElementById('presetChips');
        this.generateBtn = document.getElementById('generateBtn');

        // Response Card & Feedback Elements
        this.responseCard = document.getElementById('responseCard');
        this.loadingBox = document.getElementById('loadingBox');
        this.responseContent = document.getElementById('responseContent');
        this.responseBadgeText = document.getElementById('responseBadgeText');
        this.copyBtn = document.getElementById('copyBtn');
        this.regenerateBtn = document.getElementById('regenerateBtn');
        this.feedbackHelpfulBtn = document.getElementById('feedbackHelpful');
        this.feedbackUnhelpfulBtn = document.getElementById('feedbackUnhelpful');
        this.feedbackThankYou = document.getElementById('feedbackThankYou');
        this.feedbackBtnsGroup = document.getElementById('feedbackBtnsGroup');

        // Container for Prompt Guide & Toast
        this.promptGuideList = document.getElementById('promptGuideList');
        this.toastContainer = document.getElementById('toastContainer');
    }

    bindEvents() {
        // Navigation View Switching
        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const view = item.getAttribute('data-view');
                this.switchView(view);
                if (window.innerWidth <= 900) {
                    this.sidebar.classList.remove('open');
                }
            });
        });

        // Mobile Sidebar Toggle
        if (this.mobileToggle) {
            this.mobileToggle.addEventListener('click', () => {
                this.sidebar.classList.toggle('open');
            });
        }

        // Theme Toggle
        if (this.themeToggleBtn) {
            this.themeToggleBtn.addEventListener('click', () => {
                this.theme = this.theme === 'dark' ? 'light' : 'dark';
                this.applyTheme(this.theme);
                this.showToast(`Switched to ${this.theme} mode`, 'info');
            });
        }

        // Function Selection Dropdown
        if (this.functionSelect) {
            this.functionSelect.addEventListener('change', (e) => {
                this.currentFunction = e.target.value;
                this.updateFunctionUI(this.currentFunction);
            });
        }

        // Function Selection Pills
        this.functionPills.forEach(pill => {
            pill.addEventListener('click', () => {
                this.currentFunction = pill.getAttribute('data-func');
                this.updateFunctionUI(this.currentFunction);
            });
        });

        // Textarea input counters
        if (this.promptInput) {
            this.promptInput.addEventListener('input', () => {
                this.updateCounters();
            });

            // Keyboard shortcut (Ctrl+Enter / Cmd+Enter)
            this.promptInput.addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    this.handleGenerate();
                }
            });
        }

        // Clear Prompt Button
        if (this.clearBtn) {
            this.clearBtn.addEventListener('click', () => {
                if (this.promptInput.value.trim() !== '') {
                    this.promptInput.value = '';
                    this.updateCounters();
                    this.showToast('Prompt cleared', 'info');
                }
            });
        }

        // Generate Button
        if (this.generateBtn) {
            this.generateBtn.addEventListener('click', () => {
                this.handleGenerate();
            });
        }

        // Copy Button
        if (this.copyBtn) {
            this.copyBtn.addEventListener('click', () => {
                this.copyResponseToClipboard();
            });
        }

        // Regenerate Button
        if (this.regenerateBtn) {
            this.regenerateBtn.addEventListener('click', () => {
                this.handleGenerate();
            });
        }

        // Feedback Buttons
        if (this.feedbackHelpfulBtn) {
            this.feedbackHelpfulBtn.addEventListener('click', () => {
                this.handleFeedback(true);
            });
        }

        if (this.feedbackUnhelpfulBtn) {
            this.feedbackUnhelpfulBtn.addEventListener('click', () => {
                this.handleFeedback(false);
            });
        }
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('promptpal_theme', theme);
        if (theme === 'light') {
            this.themeIcon.className = 'fa-solid fa-sun';
            this.themeText.textContent = 'Light Mode';
        } else {
            this.themeIcon.className = 'fa-solid fa-moon';
            this.themeText.textContent = 'Dark Mode';
        }
    }

    switchView(viewId) {
        this.navItems.forEach(item => {
            if (item.getAttribute('data-view') === viewId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        this.viewContainers.forEach(container => {
            if (container.id === `${viewId}View`) {
                container.classList.add('active');
            } else {
                container.classList.remove('active');
            }
        });

        // Update Breadcrumb
        const activeNav = document.querySelector(`.nav-item[data-view="${viewId}"]`);
        if (activeNav) {
            this.breadcrumbTitle.textContent = activeNav.textContent.trim();
        }
    }

    updateFunctionUI(funcId) {
        const funcData = SYSTEM_PROMPTS[funcId];
        if (!funcData) return;

        // Update Dropdown
        if (this.functionSelect) {
            this.functionSelect.value = funcId;
        }

        // Update Pills
        this.functionPills.forEach(pill => {
            if (pill.getAttribute('data-func') === funcId) {
                pill.classList.add('active');
            } else {
                pill.classList.remove('active');
            }
        });

        // Update System Prompt Banner
        if (this.systemPromptText) {
            this.systemPromptText.innerHTML = `<strong>Active Persona Prompt:</strong> "${funcData.prompt}"`;
        }

        // Update Placeholder
        if (this.promptInput) {
            if (funcId === 'qa') {
                this.promptInput.placeholder = 'Ask any question... e.g. "How does gravity work?" or "Explain REST APIs in simple terms."';
            } else if (funcId === 'summarize') {
                this.promptInput.placeholder = 'Paste or type the text you want summarized into key bullet points...';
            } else if (funcId === 'creative') {
                this.promptInput.placeholder = 'Enter your creative request... e.g. "Write a poem about space exploration" or "Pitch 3 startup ideas".';
            }
        }

        // Update Preset Chips
        if (this.presetChipsContainer) {
            this.presetChipsContainer.innerHTML = '';
            funcData.presets.forEach(preset => {
                const chip = document.createElement('div');
                chip.className = 'chip';
                chip.textContent = preset.length > 50 ? preset.substring(0, 47) + '...' : preset;
                chip.title = preset;
                chip.addEventListener('click', () => {
                    this.promptInput.value = preset;
                    this.updateCounters();
                    this.showToast('Preset prompt loaded', 'info');
                });
                this.presetChipsContainer.appendChild(chip);
            });
        }
    }

    updateCounters() {
        const text = this.promptInput.value;
        const charLen = text.length;
        const wordLen = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;

        if (this.charCount) this.charCount.textContent = `${charLen} chars`;
        if (this.wordCount) this.wordCount.textContent = `${wordLen} words`;
    }

    async handleGenerate() {
        const promptText = this.promptInput.value.trim();
        if (!promptText) {
            this.showToast('Please enter a prompt before generating!', 'warning');
            this.promptInput.focus();
            return;
        }

        // Show Loading UI
        this.generateBtn.disabled = true;
        this.generateBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Generating...`;
        this.responseCard.classList.remove('active');
        this.loadingBox.classList.add('active');

        // Scroll to loader
        this.loadingBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        const funcData = SYSTEM_PROMPTS[this.currentFunction];
        let responseText = '';
        let isLive = false;

        try {
            if (this.apiProvider !== 'none' && this.apiKey.trim() !== '') {
                responseText = await generateLiveApiResponse(this.apiKey, this.apiProvider, funcData.prompt, promptText);
                isLive = true;
            } else {
                // Simulate network latency for fallback engine
                await new Promise(res => setTimeout(res, 900));
                responseText = generateSmartResponse(this.currentFunction, promptText);
            }
        } catch (err) {
            console.warn("Live API call failed, falling back to smart simulation:", err);
            this.showToast(`API error: ${err.message}. Using Smart Simulation fallback.`, 'warning');
            responseText = generateSmartResponse(this.currentFunction, promptText);
        }

        this.lastGeneratedResponse = responseText;

        // Render Markdown Output
        const parsedHTML = typeof marked !== 'undefined' ? marked.parse(responseText) : this.fallbackMarkdown(responseText);
        this.responseContent.innerHTML = parsedHTML;

        // Set AI Badge
        const badgeSuffix = isLive ? `Live ${this.apiProvider.toUpperCase()} API` : `PromptPal AI`;
        this.responseBadgeText.textContent = `${funcData.badge} • ${badgeSuffix}`;

        // Reset Feedback Section
        this.feedbackThankYou.style.display = 'none';
        this.feedbackBtnsGroup.style.display = 'flex';
        this.feedbackHelpfulBtn.classList.remove('selected');
        this.feedbackUnhelpfulBtn.classList.remove('selected');

        // Hide Loader & Show Response Card
        this.loadingBox.classList.remove('active');
        this.responseCard.classList.add('active');
        this.generateBtn.disabled = false;
        this.generateBtn.innerHTML = `<i class="fa-solid fa-sparkles"></i> Generate Response`;

        // Save to history
        this.saveToHistory(promptText, responseText, this.currentFunction);

        // Trigger Toast Notification
        this.showToast('Response Generated Successfully', 'success');

        // Scroll to response
        this.responseCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    copyResponseToClipboard() {
        if (!this.lastGeneratedResponse) return;

        // Strip HTML tags for clean text copying
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = this.responseContent.innerHTML;
        const plainText = tempDiv.textContent || tempDiv.innerText || '';

        navigator.clipboard.writeText(plainText).then(() => {
            this.showToast('Response copied to clipboard!', 'success');
        }).catch(err => {
            this.showToast('Failed to copy text', 'error');
        });
    }

    handleFeedback(isHelpful) {
        this.feedbackHelpfulBtn.classList.toggle('selected', isHelpful);
        this.feedbackUnhelpfulBtn.classList.toggle('selected', !isHelpful);

        this.feedbackBtnsGroup.style.display = 'none';
        this.feedbackThankYou.style.display = 'flex';

        // Store feedback in localStorage
        const logEntry = {
            timestamp: new Date().toISOString(),
            function: this.currentFunction,
            prompt: this.promptInput.value.substring(0, 100),
            helpful: isHelpful
        };

        const logs = JSON.parse(localStorage.getItem('promptpal_feedback_logs') || '[]');
        logs.push(logEntry);
        localStorage.setItem('promptpal_feedback_logs', JSON.stringify(logs));

        this.showToast(isHelpful ? 'Feedback saved! Glad it helped.' : 'Feedback saved! We will improve.', 'info');
    }

    saveToHistory(prompt, response, funcId) {
        const item = {
            id: Date.now(),
            timestamp: new Date().toLocaleString(),
            functionId: funcId,
            prompt: prompt,
            response: response
        };
        this.history.unshift(item);
        if (this.history.length > 20) this.history.pop();
        localStorage.setItem('promptpal_history', JSON.stringify(this.history));
    }

    renderPromptGuideCards() {
        if (!this.promptGuideList) return;

        this.promptGuideList.innerHTML = '';
        Object.keys(SYSTEM_PROMPTS).forEach(key => {
            const item = SYSTEM_PROMPTS[key];
            const card = document.createElement('div');
            card.className = 'guide-card';
            card.innerHTML = `
                <div class="guide-card-header">
                    <div class="guide-card-title">
                        <i class="${item.icon}"></i> ${item.name}
                    </div>
                    <button class="icon-btn try-template-btn" data-func="${item.id}">
                        <i class="fa-solid fa-play"></i> Try Template
                    </button>
                </div>
                <div class="prompt-box">
                    <strong>System Prompt:</strong><br>
                    "${item.prompt}"
                </div>
                <p class="page-desc" style="font-size: 0.88rem; line-height: 1.5;">
                    <strong>Prompt Engineering Analysis:</strong> ${item.explanation}
                </p>
            `;

            // Bind Try Template button
            card.querySelector('.try-template-btn').addEventListener('click', () => {
                this.currentFunction = item.id;
                this.updateFunctionUI(item.id);
                this.switchView('home');
                this.showToast(`Loaded ${item.name} prompt template`, 'info');
            });

            this.promptGuideList.appendChild(card);
        });
    }

    showToast(message, type = 'success') {
        if (!this.toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        let icon = 'fa-circle-check';
        if (type === 'info') icon = 'fa-circle-info';
        if (type === 'warning') icon = 'fa-triangle-exclamation';
        if (type === 'error') icon = 'fa-circle-xmark';

        toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;

        this.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            setTimeout(() => toast.remove(), 300);
        }, 3200);
    }

    initSettingsModal() {
        const modal = document.getElementById('settingsModal');
        const openBtn = document.getElementById('openSettingsBtn');
        const closeBtn = document.getElementById('closeSettingsBtn');
        const providerSelect = document.getElementById('apiProvider');
        const apiKeyGroup = document.getElementById('apiKeyGroup');
        const apiKeyInput = document.getElementById('apiKeyInput');
        const saveBtn = document.getElementById('saveSettingsBtn');
        const clearKeyBtn = document.getElementById('clearKeyBtn');

        if (!modal || !openBtn) return;

        // Populate saved values
        providerSelect.value = this.apiProvider;
        apiKeyInput.value = this.apiKey;
        apiKeyGroup.style.display = this.apiProvider === 'none' ? 'none' : 'block';

        providerSelect.addEventListener('change', (e) => {
            apiKeyGroup.style.display = e.target.value === 'none' ? 'none' : 'block';
        });

        openBtn.addEventListener('click', () => {
            modal.classList.add('active');
        });

        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });

        saveBtn.addEventListener('click', () => {
            this.apiProvider = providerSelect.value;
            this.apiKey = apiKeyInput.value.trim();

            localStorage.setItem('promptpal_api_provider', this.apiProvider);
            localStorage.setItem('promptpal_api_key', this.apiKey);

            modal.classList.remove('active');
            this.showToast(
                this.apiProvider === 'none' 
                    ? 'Using Smart Simulation Engine' 
                    : `Saved ${this.apiProvider.toUpperCase()} API settings!`, 
                'success'
            );
        });

        clearKeyBtn.addEventListener('click', () => {
            this.apiKey = '';
            this.apiProvider = 'none';
            providerSelect.value = 'none';
            apiKeyInput.value = '';
            apiKeyGroup.style.display = 'none';

            localStorage.removeItem('promptpal_api_key');
            localStorage.setItem('promptpal_api_provider', 'none');

            modal.classList.remove('active');
            this.showToast('API Key removed. Reverted to Smart Simulation Engine.', 'info');
        });
    }

    fallbackMarkdown(text) {
        return text
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*)\*/gim, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }
}

// Initialize application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PromptPalApp();
});
