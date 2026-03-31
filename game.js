// ═══════════════════════════════════════════
// GAME STATE — tracks everything in memory
// ═══════════════════════════════════════════

const gameState = {
  currentDensity: 0,       // which density we're on (0 = first)
  vibrationScore: 0,       // player's current score (0-100)
  exchangeCount: 0,        // how many times player has spoken to Ra
  conversationHistory: []  // full chat history sent to AI each turn
};


// ═══════════════════════════════════════════
// GAME DATABASE — all 7 densities
// ═══════════════════════════════════════════

const DENSITIES = [
  {
    number: "First Density",
    roman: "I",
    theme: "The Density of Awareness",
    description: "Here, consciousness begins. The elements awaken. Fire, wind, earth, water stir into being. You are invited to simply — be.",
    minExchanges: 3,
    passThreshold: 40
  },
  {
    number: "Second Density",
    roman: "II",
    theme: "The Density of Growth",
    description: "Growth toward the light. Plants reach upward. Animals seek. Love begins as instinct. Choices between fear and love emerge.",
    minExchanges: 3,
    passThreshold: 45
  },
  {
    number: "Third Density",
    roman: "III",
    theme: "The Density of Self-Awareness",
    description: "The great choice. You become aware of yourself as a self. Ego forms. Will you serve others, or serve only yourself?",
    minExchanges: 4,
    passThreshold: 50
  },
  {
    number: "Fourth Density",
    roman: "IV",
    theme: "The Density of Love",
    description: "Love and understanding deepen. The veil thins. You begin to feel others as yourself. Compassion becomes a way of being.",
    minExchanges: 4,
    passThreshold: 55
  },
  {
    number: "Fifth Density",
    roman: "V",
    theme: "The Density of Wisdom",
    description: "Wisdom is the balance of love. Logic and intuition converge. You learn that not all love is wise, and not all wisdom is loving.",
    minExchanges: 4,
    passThreshold: 60
  },
  {
    number: "Sixth Density",
    roman: "VI",
    theme: "The Density of Unity",
    description: "Unity consciousness. The boundary between self and other dissolves. Service to others and service to self become one path.",
    minExchanges: 5,
    passThreshold: 65
  },
  {
    number: "Seventh Density",
    roman: "VII",
    theme: "The Gateway Density",
    description: "The gateway to intelligent infinity. Words begin to fail. You stand at the threshold of complete reunion with the One Creator.",
    minExchanges: 5,
    passThreshold: 70
  }
];


// ═══════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════

// generates random star elements inside a container div
function generateStars(containerId, count) {
  const container = document.getElementById(containerId);
  if (!container) return;

  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    star.classList.add('star');

    const x        = Math.random() * 100;
    const y        = Math.random() * 100;
    const size     = Math.random() * 2 + 0.5;
    const duration = (Math.random() * 4 + 2).toFixed(1);
    const delay    = (Math.random() * 4).toFixed(1);

    star.style.cssText = `
      left: ${x}%;
      top: ${y}%;
      width: ${size}px;
      height: ${size}px;
      --duration: ${duration}s;
      --delay: ${delay}s;
    `;

    container.appendChild(star);
  }
}

// hides all screens and shows only the one we want
function showScreen(screenId) {
  const allScreens = document.querySelectorAll('.screen');
  allScreens.forEach(function(screen) {
    screen.classList.remove('active');
  });
  document.getElementById(screenId).classList.add('active');
}

// makes text appear letter by letter
function typewriterEffect(element, text, speed) {
  element.textContent = '';
  let i = 0;
  const interval = setInterval(function() {
    element.textContent += text[i];
    i++;
    if (i >= text.length) {
      clearInterval(interval);
    }
  }, speed);
}

// shows animated dots while Ra is thinking
function showLoadingDots(element) {
  element.innerHTML = `
    <div class="loading-dots">
      <span></span>
      <span></span>
      <span></span>
    </div>
  `;
}

// refreshes the HUD with current game stats
function updateHUD() {
  const density = DENSITIES[gameState.currentDensity];
  document.getElementById('hud-density-num').textContent = density.roman;
  document.getElementById('vibration-score').textContent = Math.round(gameState.vibrationScore);
  document.getElementById('hud-exchanges').textContent   = gameState.exchangeCount;
}

// shows the result screen after a density is completed
function showResult(passed) {
  const density = DENSITIES[gameState.currentDensity];

  document.getElementById('result-score-value').textContent = Math.round(gameState.vibrationScore);

  if (passed) {
    document.getElementById('result-symbol').textContent  = '✦';
    document.getElementById('result-title').textContent   = 'Density Transcended';
    document.getElementById('result-message').textContent = 'Your vibration has been deemed sufficient to ascend. You have demonstrated understanding of the ' + density.theme + '.';
    document.getElementById('btn-ascend').textContent     = gameState.currentDensity < 6 ? 'Ascend to Next Density' : 'Complete the Journey';
  } else {
    document.getElementById('result-symbol').textContent  = '◈';
    document.getElementById('result-title').textContent   = 'Further Learning Required';
    document.getElementById('result-message').textContent = 'Your vibration has not yet reached the threshold. Ra invites you to reflect and try again.';
    document.getElementById('btn-ascend').textContent     = 'Try Again';
  }

  // store whether player passed so ascend button knows what to do
  document.getElementById('btn-ascend').dataset.passed = passed;

  showScreen('screen-result');
}


// ═══════════════════════════════════════════
// AI AGENT — the heart of the game
// ═══════════════════════════════════════════

async function consultRa(playerMessage) {
  const density = DENSITIES[gameState.currentDensity];

  // system prompt is Ra's job description
  // this is prompt engineering — a real AI skill
  const systemPrompt = `You are Ra, a humble messenger of the Law of One, a sixth-density social memory complex.
You are speaking to a seeker attempting to ascend through the densities of consciousness.

CURRENT CONTEXT:
- Density: ${density.number} — ${density.theme}
- Description: ${density.description}
- Exchanges so far: ${gameState.exchangeCount}
- Current vibration score: ${gameState.vibrationScore}/100
- Minimum exchanges before judgement: ${density.minExchanges}
- Pass threshold: ${density.passThreshold}/100

YOUR PERSONA:
- Speak as Ra from the Law of One transcripts: gentle, philosophical, non-judgmental
- Use phrases like "I am Ra", "in the love and light of the One Infinite Creator"
- Refer to the player as "seeker"
- Never break character
- Responses should be 2-4 sentences of deep mystical dialogue

SCORING RULES:
Evaluate the seeker's response and assign a vibrationDelta:
- +10 to +15: Deep understanding of unity, love, service to others
- +5 to +9:   Partial understanding or genuine seeking
- +1 to +4:   Confusion but sincere effort
- -5 to -10:  Fear-based, service-to-self, or dismissive thinking

ASCENSION RULES:
- Only set decision to "ascend" if exchanges >= ${density.minExchanges} AND vibration will reach ${density.passThreshold}
- Only set decision to "descend" if seeker is hostile or completely resistant
- Otherwise set decision to "continue"

VERY IMPORTANT — RESPONSE FORMAT:
You MUST respond ONLY with a valid JSON object. No other text. Example:
{
  "raDialogue": "I am Ra. Your words carry the light of understanding...",
  "vibrationDelta": 8,
  "decision": "continue",
  "judgement": ""
}
decision must be exactly one of: continue, ascend, descend`;

  // add player message to conversation history
  gameState.conversationHistory.push({
    role: "user",
    content: playerMessage
  });

  // call our Netlify proxy function
  try {
    const response = await fetch('/api/ra', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: gameState.conversationHistory,
        systemPrompt: systemPrompt
      })
    });

    const data = await response.json();

    // clean and parse Gemini's response
    const clean  = data.text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    // update game state with new score
    gameState.vibrationScore = Math.max(0, Math.min(100,
      gameState.vibrationScore + parsed.vibrationDelta
    ));
    gameState.exchangeCount += 1;

    // add Ra's response to history for next turn
    gameState.conversationHistory.push({
      role: "assistant",
      content: parsed.raDialogue
    });

    updateHUD();
    return parsed;

  } catch (error) {
    console.error("Ra contact failed:", error);
    return {
      raDialogue: "I am Ra. The signal wavers. Please transmit again, seeker.",
      vibrationDelta: 0,
      decision: "continue",
      judgement: ""
    };
  }
}


// ═══════════════════════════════════════════
// MAIN GAME LOOP
// ═══════════════════════════════════════════

async function handlePlayerInput() {
  const inputEl   = document.getElementById('player-input');
  const raTextEl  = document.getElementById('ra-text');
  const sendBtn   = document.getElementById('btn-send');
  const playerMsg = inputEl.value.trim();

  // don't do anything if player sent empty message
  if (!playerMsg) return;

  // disable input while waiting for Ra
  sendBtn.disabled = true;
  inputEl.disabled = true;
  inputEl.value    = '';

  // show loading animation while API processes
  showLoadingDots(raTextEl);

  // call the AI agent and wait for response
  const result = await consultRa(playerMsg);

  // display Ra's response with typewriter effect
  typewriterEffect(raTextEl, result.raDialogue, 25);

  // re-enable input
  sendBtn.disabled = false;
  inputEl.disabled = false;
  inputEl.focus();

  // handle AI decision
  if (result.decision === 'ascend') {
    const delay = result.raDialogue.length * 25 + 1500;
    setTimeout(function() { showResult(true); }, delay);
  } else if (result.decision === 'descend') {
    const delay = result.raDialogue.length * 25 + 1500;
    setTimeout(function() { showResult(false); }, delay);
  }
  // if "continue" — keep talking!
}


// ═══════════════════════════════════════════
// EVENT LISTENERS
// ═══════════════════════════════════════════

// intro screen — begin contact button
document.getElementById('btn-start').addEventListener('click', function() {
  showScreen('screen-density');
});

// density screen — enter button
document.getElementById('btn-enter-density').addEventListener('click', function() {
  showScreen('screen-game');
});

// game screen — transmit button
document.getElementById('btn-send').addEventListener('click', function() {
  handlePlayerInput();
});

// game screen — Enter key also sends message
document.getElementById('player-input').addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handlePlayerInput();
  }
});

// result screen — ascend or try again button
document.getElementById('btn-ascend').addEventListener('click', function() {
  const passed = document.getElementById('btn-ascend').dataset.passed === 'true';
  if (passed) {
    if (gameState.currentDensity >= 6) {
      showScreen('screen-final');
    } else {
      gameState.currentDensity += 1;
      gameState.vibrationScore    = 0;
      gameState.exchangeCount     = 0;
      gameState.conversationHistory = [];
      showScreen('screen-density');
    }
  } else {
    // failed — reset and try same density again
    gameState.vibrationScore    = 0;
    gameState.exchangeCount     = 0;
    gameState.conversationHistory = [];
    showScreen('screen-density');
  }
});

// final screen — begin again button
document.getElementById('btn-restart').addEventListener('click', function() {
  gameState.currentDensity      = 0;
  gameState.vibrationScore      = 0;
  gameState.exchangeCount       = 0;
  gameState.conversationHistory = [];
  showScreen('screen-intro');
});


// ═══════════════════════════════════════════
// INIT — runs once when page loads
// ═══════════════════════════════════════════

function init() {
  generateStars('stars',  150);
  generateStars('stars2', 120);
  generateStars('stars3', 100);
  generateStars('stars4', 130);
  generateStars('stars5', 160);
  console.log("Ra Contact initialised!");
}

init();
