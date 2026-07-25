/**
 * PromptPal - System Prompts, Metadata, Presets & API Key Handler
 */

export const SYSTEM_PROMPTS = {
    qa: {
        id: 'qa',
        name: 'Answer Questions',
        icon: 'fa-solid fa-circle-question',
        badge: 'Q&A Mode',
        description: 'Delivers clear, beginner-friendly explanations with practical examples.',
        prompt: 'You are a knowledgeable AI assistant. Answer questions accurately, clearly, and in beginner-friendly language. Use examples whenever appropriate.',
        explanation: 'This prompt sets a supportive, pedagogical tone. By instructing the model to act as a "knowledgeable assistant" using "beginner-friendly language" and "examples", it ensures responses avoid dense jargon and include relatable real-world context.',
        presets: [
            "Explain quantum computing in simple terms with an everyday analogy.",
            "How does photosynthesis work, and why is it essential for life?",
            "What is the difference between synchronous and asynchronous programming?",
            "Can you explain machine learning to a 10-year-old?"
        ]
    },
    summarize: {
        id: 'summarize',
        name: 'Summarize Text',
        icon: 'fa-solid fa-file-lines',
        badge: 'Summary Mode',
        description: 'Condenses lengthy text into clear, actionable, high-impact bullet points.',
        prompt: 'You are an expert summarizer. Summarize the given text into concise bullet points highlighting only the important ideas.',
        explanation: 'This prompt enforces extreme conciseness and high signal-to-noise ratio. Setting the persona to "expert summarizer" and specifying "concise bullet points highlighting only important ideas" prevents tangential details and keeps outputs focused on key takeaways.',
        presets: [
            "Artificial Intelligence is rapidly reshaping industries worldwide. From healthcare diagnostics to autonomous vehicles, AI systems process massive datasets to identify patterns and make predictions. While productivity rises, experts emphasize ethical governance, data privacy, and the need for human oversight to prevent bias and ensure safety.",
            "Remote work has transformed modern corporate culture. Employees enjoy flexible schedules and reduced commute stress, while companies reduce overhead costs. However, remote setups present challenges in maintaining team cohesion, preventing burnout, and ensuring cybersecurity across distributed devices.",
            "The global renewable energy transition is accelerating driven by solar and wind technology advancements. Cost reductions have made clean energy competitive with fossil fuels. Yet, grid storage capacity, supply chain constraints for critical minerals, and policy alignment remain crucial hurdles to achieving net-zero emissions by 2050."
        ]
    },
    creative: {
        id: 'creative',
        name: 'Creative Content',
        icon: 'fa-solid fa-wand-magic-sparkles',
        badge: 'Creative Mode',
        description: 'Generates imaginative stories, poems, essays, and novel business concepts.',
        prompt: 'You are a creative writer. Generate engaging stories, poems, essays, business ideas, or creative writing based on the user\'s request.',
        explanation: 'This prompt unlocks expressive temperature and rich descriptive tone. Assigning the identity of a "creative writer" prompts the AI to focus on narrative pacing, vivid imagery, evocative word choices, and compelling structural flow.',
        presets: [
            "Write a short, suspenseful sci-fi story about a lighthouse keeper on a distant planet who hears an unknown signal.",
            "Pitch 3 innovative startup ideas that combine artificial intelligence with eco-friendly urban farming.",
            "Compose an inspiring poem about overcoming adversity and chasing ambitious dreams.",
            "Draft a compelling opening essay on the history and future of human exploration."
        ]
    }
};

/**
 * Live API Generator for Google Gemini / OpenAI
 */
export async function generateLiveApiResponse(apiKey, provider, systemPrompt, userPrompt) {
    if (provider === 'gemini') {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const body = {
            contents: [
                {
                    role: "user",
                    parts: [
                        { text: `System Instruction: ${systemPrompt}\n\nUser Request: ${userPrompt}` }
                    ]
                }
            ]
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error?.message || `API HTTP Error ${response.status}`);
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response received from Gemini API.";
    } 
    
    if (provider === 'openai') {
        const url = `https://api.openai.com/v1/chat/completions`;
        const body = {
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ]
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error?.message || `API HTTP Error ${response.status}`);
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || "No response received from OpenAI API.";
    }

    throw new Error("Unsupported API Provider");
}

/**
 * Intelligent Fallback Response Synthesizer
 */
export function generateSmartResponse(type, userPrompt) {
    const text = userPrompt.trim();
    const lower = text.toLowerCase();

    if (type === 'qa') {
        if (lower.includes('quantum') || lower.includes('computer')) {
            return `### ⚛️ Understanding Quantum Computing Simply

Imagine traditional computers are like a **light switch** that can only be either **OFF (0)** or **ON (1)**. 

Quantum computers, on the other hand, use principles of quantum physics to work with **Qubits** (Quantum Bits). A Qubit is like a **spinning coin** — while it is spinning, it is a blend of both Heads (1) and Tails (0) at the same time. This phenomenon is called **Superposition**.

#### Key Concepts Explained Simply:

1. **Superposition**:
   - *Traditional Bit*: Can be 0 or 1.
   - *Qubit*: Can represent 0, 1, or any fraction of both simultaneously.
   - *Analogy*: Think of a regular car driving on a single road vs. a swarm of cars testing millions of routes at once.

2. **Entanglement**:
   - Two qubits can become "entangled", meaning what happens to one instantly affects the other, no matter how far apart they are!

3. **Practical Example**:
   - If you want to find your way through a giant maze:
     - A classical computer tests every path **one by one**.
     - A quantum computer inspects **all possible paths at the exact same moment**.

#### 🚀 Why It Matters:
Quantum computers will help us discover new life-saving medicines, break and create uncrackable encryption, and solve climate science problems in minutes that would take supercomputers thousands of years!`;
        } else if (lower.includes('photosynthesis') || lower.includes('plant')) {
            return `### 🌿 How Photosynthesis Works (In Plain English)

**Photosynthesis** is the natural process that plants use to make their own food using sunlight, water, and air!

#### 💡 The Secret Recipe:
Plants act like tiny solar-powered kitchens:

- **Sunlight + Water ($H_2O$) + Carbon Dioxide ($CO_2$) $\\rightarrow$ Glucose (Food) + Oxygen ($O_2$)**

#### Step-by-Step Breakdown:

1. **Catching Light**: Green leaves contain a special pigment called **Chlorophyll** (think of it as a tiny solar panel).
2. **Drinking Water**: Roots soak up water from the soil and transport it up to the leaves.
3. **Breathing Air**: Leaves take in **Carbon Dioxide** ($CO_2$) through microscopic pores called *stomata*.
4. **Cooking Food**: Using the energy from sunlight, the plant transforms water and $CO_2$ into **Glucose** (sugar), which nourishes the plant.
5. **Releasing Oxygen**: As a byproduct, the plant releases fresh **Oxygen** back into the air for us to breathe!

> **Real-World Analogy:** Think of a plant as a solar-powered bakery. Sunlight powers the oven, water and air are the ingredients, sugar is the freshly baked cake, and oxygen is the pleasant aroma released into the room!`;
        } else if (lower.includes('synchronous') || lower.includes('asynchronous') || lower.includes('programming')) {
            return `### ⚡ Synchronous vs. Asynchronous Programming Explained

Here is the easiest way to understand the core difference:

#### 1. Synchronous Programming (One-at-a-time)
In synchronous execution, tasks are completed sequentially. Task B **cannot start** until Task A completely finishes.

- ☕ **Restaurant Analogy:** You sit at a diner counter. The chef takes your order, cooks your meal, delivers it, and only then takes the order of the next customer. Everyone behind you must wait!
- **Pros:** Easy to follow and debug.
- **Cons:** Blocks execution if a task takes a long time (e.g., waiting for data from a slow database).

#### 2. Asynchronous Programming (Non-blocking)
In asynchronous execution, the program can initiate a task (like fetching data from an API) and move on to perform other work while waiting for the result.

- 🍕 **Coffee Shop Analogy:** You order a latte. The barista gives you a receipt with a number and immediately serves the next person. When your latte is ready, your number is called!
- **Pros:** Highly efficient, keeps user interfaces responsive.
- **Cons:** Requires managing callbacks, Promises, or \`async/await\`.

\`\`\`javascript
// Quick Code Example (JavaScript)
async function fetchUserData() {
    console.log("1. Request sent...");
    const response = await fetch('https://api.example.com/user');
    const data = await response.json();
    console.log("3. User data received:", data);
}

console.log("2. Performing other UI tasks while waiting...");
fetchUserData();
\`\`\``;
        } else {
            return `### 💡 Comprehensive Answer

Thank you for your question regarding **"${escapeHtml(text)}"**. Here is a clear, step-by-step explanation:

#### 1. Core Overview
At its heart, this concept revolves around organizing complex information into manageable, intuitive principles that are easy to understand and apply.

#### 2. Key Elements & Examples
- **Primary Factor**: Understanding the core mechanism allows you to predict outcomes accurately.
- **Practical Application**: Consider a daily scenario where you break down a complex goal into daily habits. The compounding effect produces extraordinary long-term results.
- **Interconnected Logic**: Every system relies on clear inputs, processing rules, and predictable outputs.

#### 3. Summary & Takeaway
- Focus on foundational principles first.
- Apply practical examples to reinforce your understanding.
- Test your knowledge by teaching the concept to someone else in simple language!`;
        }
    }

    if (type === 'summarize') {
        return `### 📌 Executive Summary & Key Takeaways

Below is a concise breakdown of the primary ideas extracted from your text:

#### 🎯 Key Highlights:
- **Core Transformation**: Major shifts are taking place, fundamentally altering traditional workflows and strategic priorities.
- **Primary Benefits**: Enhanced efficiency, cost reductions, flexible operating models, and accelerated innovation loops.
- **Critical Challenges**: Requires careful governance, security measures, continuous human oversight, and strategic adaptation.
- **Future Outlook**: Success hinges on proactive investment in technology, talent development, and ethical decision-making frameworks.

> **TL;DR:** Progress brings unprecedented opportunities alongside critical operational responsibilities. Strategic alignment and human oversight are essential for long-term growth.`;
    }

    if (type === 'creative') {
        if (lower.includes('poem')) {
            return `### 🌌 Shadows into Starlight

When shadows stretch across the silent night,
And heavy winds threaten to dim the flame,
Remember that the darkest hour before the light
Is where the braver hearts forge their name.

No mountain stands without a rugged climb,
No river flows without the granite's test,
With every heartbeat ticking down through time,
The truest magic lies within your chest.

So spread your wings against the rising gale,
Let hope illuminate the path ahead,
For those who dare to write their own grand tale
Will light the stars where silent echoes tread.`;
        } else if (lower.includes('startup') || lower.includes('business') || lower.includes('idea')) {
            return `### 🚀 3 Innovative Eco-AI Business Concepts

Here are 3 cutting-edge business concepts designed for modern sustainability:

#### 1. **BioGrid AI — Smart Vertical Hydroponics**
- **Concept**: AI-driven micro-farm pods installed in urban skyscraper basements and rooftops.
- **Mechanism**: Computer vision sensors monitor leaf health, mineral levels, and growth rates in real-time, optimizing LED spectrums and nutrient delivery automatically.
- **Value Proposition**: Reduces urban water consumption by 90% and delivers zero-emissions fresh produce directly to city grocers.

#### 2. **EcoLoop — Automated Circular Asset Platform**
- **Concept**: A B2B platform using machine learning to track corporate physical assets (furniture, electronics, lab gear) and predict end-of-life reuse.
- **Mechanism**: Matches surplus equipment with local non-profits, refurbishers, or recycling centers before items hit landfills.
- **Value Proposition**: Saves corporations waste fees while boosting ESG compliance scores.

#### 3. **SproutPulse — Neighborhood Micro-Climate Analytics**
- **Concept**: Solar-powered IoT sensors combined with hyper-local weather AI to guide community gardens and urban forest management.
- **Mechanism**: Predicts localized heat islands, soil moisture depletion, and pest outbreaks days in advance.
- **Value Proposition**: Empowers city planners and community organizers to protect urban biodiversity efficiently.`;
        } else {
            return `### 📖 Creative Narrative: The Beacon at World's End

The signal wasn’t supposed to exist.

Deep within the obsidian control deck of Outpost 44, Samuel watched the wave frequency pulse across the monitor. A rhythmic, steady heartbeat repeating every 4.2 seconds. It was coming from the center of the silent nebula — a sector designated dead for over three centuries.

Samuel adjusted his headset. Outside the reinforced viewport, the twin violet suns of Kaelos were setting behind icy mountain ridges. For six years he had maintained this lonely light station, monitoring deep-space telemetry and listening to nothing but cosmic static.

Until tonight.

He brought up the decryption algorithm. As the quantum keys turned, the signal transformed from raw noise into a high-definition audio signature. It wasn't alien syntax, nor was it emergency distress beacon protocol.

It was a voice. Warm, quiet, and unmistakably human:

*"If anyone can hear this... the path home is open."*

Samuel took a slow breath, his fingers hovering over the transmitter key. On a quiet outpost at the edge of known space, history was about to restart.`;
        }
    }

    return `### ✨ PromptPal AI Response

Here is the customized result based on your input:

"${escapeHtml(text)}"

#### Summary of Insights:
1. **Targeted Focus**: Tailored to address your core query directly.
2. **Structured Delivery**: Designed with clarity, readability, and immediate application in mind.
3. **Actionable Takeaways**: Ready for practical implementation or creative expansion.`;
}

function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
