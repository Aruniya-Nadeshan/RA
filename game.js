// gameState tracks everything about the current session
// think of it like a Java object holding all game variables
const gameState = {
  currentDensity: 0,       // which density we're on (0 = first)
  vibrationScore: 0,       // player's current score (0-100)
  exchangeCount: 0,        // how many times player has spoken to Ra
  conversationHistory: []  // full chat history sent to AI each turn
};
// the game database
// all 7 densities with their content
// JavaScript will use this to populate the density screen
// and tell the AI which density the player is in
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
function generateStars(containerId, count) {

  const container = document.getElementById(containerId);

  if (!container) return;

  for (let i = 0; i < count; i++) {

    const star = document.createElement('div');
    star.classList.add('star');

    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const size = Math.random() * 2 + 0.5;
    const duration = (Math.random() * 4 + 2).toFixed(1);
    const delay = (Math.random() * 4).toFixed(1);

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
// showScreen hides all screens and shows only the one we want
// screenId = the id of the screen we want to show
function showScreen(screenId) {

  // get ALL elements with class "screen"
  // querySelectorAll returns a list — like an ArrayList in Java
  const allScreens = document.querySelectorAll('.screen');

  // loop through every screen and remove "active" class
  // this hides all of them
  allScreens.forEach(function(screen) {
    screen.classList.remove('active');
  });

  // now find the specific screen we want
  // and add "active" back to only that one
  document.getElementById(screenId).classList.add('active');
}

// grab the start button by its id
const btnStart = document.getElementById('btn-start');

// addEventListener waits for a "click" event
// when clicked, it runs the function inside
btnStart.addEventListener('click', function() {
  showScreen('screen-density');
});

// when player clicks Enter on density screen
// it moves to the game screen
const btnEnterDensity = document.getElementById('btn-enter-density');

btnEnterDensity.addEventListener('click', function() {
  showScreen('screen-game');
});

// when player clicks Ascend on result screen
// it goes back to density screen for now
// later this will check if they passed or failed
const btnAscend = document.getElementById('btn-ascend');

btnAscend.addEventListener('click', function() {
  showScreen('screen-density');
});

// when player clicks Begin Again on final screen
// it goes back to the intro screen
const btnRestart = document.getElementById('btn-restart');

btnRestart.addEventListener('click', function() {
  showScreen('screen-intro');
});

// typewriterEffect makes text appear letter by letter
// gives Ra's dialogue a mystical gradual reveal
function typewriterEffect(element, text, speed) {
  element.textContent = '';
  let i = 0;

  // setInterval calls a function repeatedly every X milliseconds
  const interval = setInterval(function() {
    element.textContent += text[i];
    i++;
    // when we reach the end of the text, stop the interval
    if (i >= text.length) {
      clearInterval(interval);
    }
  }, speed);
}

// showLoadingDots shows animated dots while Ra is thinking
function showLoadingDots(element) {
  element.innerHTML = `
    <div class="loading-dots">
      <span></span>
      <span></span>
      <span></span>
    </div>
  `;
}

// updateHUD refreshes the top bar with current game stats
function updateHUD() {
  const density = DENSITIES[gameState.currentDensity];
  document.getElementById('hud-density-num').textContent = density.roman;
  document.getElementById('vibration-score').textContent = Math.round(gameState.vibrationScore);
  document.getElementById('hud-exchanges').textContent   = gameState.exchangeCount;
}

//AI agent function
// consultRa sends the player's message to Claude API
// and returns Ra's response + vibration score
// async means this function can wait for the API response
async function consultRa(playerMessage) {
  const density = DENSITIES[gameState.currentDensity];

  // the system prompt is Ra's job description
  // it tells the AI who it is, how to score, and what to return
  // this is called "prompt engineering" — a real AI skill
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

VERY IMPORTANT — YOUR RESPONSE FORMAT:
You MUST respond ONLY with a valid JSON object. No other text. Example:
{
  "raDialogue": "I am Ra. Your words carry the light of understanding...",
  "vibrationDelta": 8,
  "decision": "continue",
  "judgement": ""
}
The judgement field is only filled when decision is ascend or descend.
decision must be exactly one of: continue, ascend, descend`;

  // add player message to conversation history
  gameState.conversationHistory.push({
    role: "user",
    content: playerMessage
  });

  // call the Claude API
  try {
    // TEMPORARY MOCK — remove this when API is connected
    const mockResponse = {
      raDialogue: "I am Ra. I greet you in the love and light of the One Infinite Creator. Your seeking is noted, and your vibration rises with each sincere transmission.",
      vibrationDelta: 8,
      decision: "continue",
      judgement: ""
    };

    // simulate API delay
    await new Promise(function(resolve) {
      setTimeout(resolve, 1500);
    });

    // update game state
    gameState.vibrationScore = Math.max(0, Math.min(100,
      gameState.vibrationScore + mockResponse.vibrationDelta
    ));
    gameState.exchangeCount += 1;

    gameState.conversationHistory.push({
      role: "assistant",
      content: mockResponse.raDialogue
    });

    updateHUD();
    return mockResponse;

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

// The main game loop
// handlePlayerInput is called when player clicks Transmit
// it reads their message, calls Ra, and displays the response
async function handlePlayerInput() {
  const inputEl  = document.getElementById('player-input');
  const raTextEl = document.getElementById('ra-text');
  const sendBtn  = document.getElementById('btn-send');
  const playerMsg = inputEl.value.trim();

  // don't do anything if player sent empty message
  if (!playerMsg) return;

  // disable input while waiting for Ra
  sendBtn.disabled  = true;
  inputEl.disabled  = true;
  inputEl.value     = '';

  // show loading animation while API processes
  showLoadingDots(raTextEl);

  // call the AI agent and wait for response
  const result = await consultRa(playerMsg);

  // display Ra's response with typewriter effect
  typewriterEffect(raTextEl, result.raDialogue, 25);

  // re-enable input
  sendBtn.disabled  = false;
  inputEl.disabled  = false;
  inputEl.focus();

  // handle AI decision
  if (result.decision === 'ascend') {
    const delay = result.raDialogue.length * 25 + 1500;
    setTimeout(function() {
      showResult(true);
    }, delay);
  } else if (result.decision === 'descend') {
    const delay = result.raDialogue.length * 25 + 1500;
    setTimeout(function() {
      showResult(false);
    }, delay);
  }
  // if "continue" — keep talking!
}

// transmit button sends player message to Ra
document.getElementById('btn-send').addEventListener('click', function() {
  handlePlayerInput();
});

// also allow Enter key to send (Shift+Enter adds a new line)
document.getElementById('player-input').addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handlePlayerInput();
  }
});

function init() {
  generateStars('stars',  150);
  generateStars('stars2', 120);
  generateStars('stars3', 100);
  generateStars('stars4', 130);
  generateStars('stars5', 160);
  console.log("Ra Contact initialised!");
}

init();