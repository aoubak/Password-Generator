const el = (id) => document.getElementById(id);

const passwordOutput = el('passwordOutput');
const copyBtn = el('copyBtn');
const generateBtn = el('generateBtn');
const lengthRange = el('lengthRange');
const lengthNumber = el('lengthNumber');
const lengthLabel = el('lengthLabel');
const optLower = el('optLower');
const optUpper = el('optUpper');
const optNumbers = el('optNumbers');
const optSymbols = el('optSymbols');
const strengthLabel = el('strength');
const copyLabel = el('copyLabel');
const generateLabel = el('generateLabel');

const sets = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.<>/?'
};

function syncLengthInputs(value) {
  lengthRange.value = value;
  lengthNumber.value = value;
  lengthLabel.textContent = value;
}

lengthRange.addEventListener('input', (e) => syncLengthInputs(e.target.value));
lengthNumber.addEventListener('input', (e) => {
  let v = parseInt(e.target.value, 10) || 4;
  if (v < 4) v = 4;
  if (v > 64) v = 64;
  syncLengthInputs(v);
});

function randomFromString(s) {
  return s.charAt(Math.floor(Math.random() * s.length));
}

function shuffleString(str) {
  const arr = str.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
}

function generatePassword(len, options) {
  let available = '';
  const requiredChars = [];

  if (options.lower) { available += sets.lower; requiredChars.push(randomFromString(sets.lower)); }
  if (options.upper) { available += sets.upper; requiredChars.push(randomFromString(sets.upper)); }
  if (options.numbers) { available += sets.numbers; requiredChars.push(randomFromString(sets.numbers)); }
  if (options.symbols) { available += sets.symbols; requiredChars.push(randomFromString(sets.symbols)); }

  if (!available) {
    // default to lowercase if nothing selected
    available = sets.lower;
    requiredChars.push(randomFromString(sets.lower));
  }

  const remaining = len - requiredChars.length;
  let result = requiredChars.join('');

  for (let i = 0; i < remaining; i++) {
    result += randomFromString(available);
  }

  // shuffle to avoid predictable placement
  return shuffleString(result);
}

function evaluateStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return {label: 'Very Weak', color: 'text-red-400'};
  if (score === 2) return {label: 'Weak', color: 'text-orange-400'};
  if (score === 3) return {label: 'Medium', color: 'text-amber-400'};
  if (score === 4) return {label: 'Strong', color: 'text-green-400'};
  return {label: 'Very Strong', color: 'text-green-400'};
}

function updateStrength(pw) {
  const res = evaluateStrength(pw);
  strengthLabel.textContent = res.label;
  strengthLabel.className = res.color + ' font-semibold';
}

generateBtn.addEventListener('click', () => {
  const len = parseInt(lengthRange.value, 10);
  const options = {
    lower: optLower.checked,
    upper: optUpper.checked,
    numbers: optNumbers.checked,
    symbols: optSymbols.checked
  };
  const pw = generatePassword(len, options);
  passwordOutput.value = pw;
  updateStrength(pw);
});

copyBtn.addEventListener('click', async () => {
  const text = passwordOutput.value;
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    if (copyLabel) copyLabel.textContent = 'Copied';
    setTimeout(() => { if (copyLabel) copyLabel.textContent = 'Copy'; }, 1500);
  } catch (err) {
    // fallback
    passwordOutput.select();
    document.execCommand('copy');
    if (copyLabel) copyLabel.textContent = 'Copied';
    setTimeout(() => { if (copyLabel) copyLabel.textContent = 'Copy'; }, 1500);
  }
});

// Generate initial password on load
window.addEventListener('DOMContentLoaded', () => {
  // initialize visual states for option buttons
  const optIds = ['optUpper','optNumbers','optSymbols','optLower'];
  optIds.forEach(id => {
    const checkbox = document.getElementById(id);
    const lbl = document.getElementById('lbl-' + id);
    if (!checkbox || !lbl) return;
    // set initial active state
    if (checkbox.checked) lbl.classList.add('active'); else lbl.classList.remove('active');
    // when label clicked, toggle class based on checked state (checkbox toggles automatically)
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) lbl.classList.add('active'); else lbl.classList.remove('active');
    });
    // also allow clicking label to toggle (label will toggle checkbox implicitly)
    lbl.addEventListener('click', (e) => {
      // small timeout to allow checkbox to update
      setTimeout(() => {
        if (checkbox.checked) lbl.classList.add('active'); else lbl.classList.remove('active');
      }, 10);
    });
  });

  // set initial slider max/values for consistency (index.html set max 256)
  if (lengthRange.max === '256'){
    if (parseInt(lengthRange.value,10) > 256) syncLengthInputs(256);
  }

  generateBtn.click();
});
