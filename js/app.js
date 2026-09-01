/**
 * KATA.IN - Indonesian Wordle Core Game Engine
 * Manages game state, multiple modes, staggered animations, audio & particle integrations.
 */

class WordleGame {
  constructor() {
    this.mode = 'classic'; // 'classic', 'duo', 'blitz', 'adventure', 'definition'
    this.wordLength = 5;
    this.maxAttempts = 6;
    
    // Board state
    // Array of boards: [{ target: {word, def}, currentRow: 0, guesses: [], solved: false, grid: [[]] }]
    this.boards = [];
    this.currentInput = '';
    this.isGameOver = false;
    this.isAnimating = false;

    // Blitz (Time Attack) State
    this.blitzTimer = null;
    this.blitzTimeLeft = 90;
    this.blitzScore = 0;
    this.blitzCombo = 0;

    // Adventure State
    this.adventureLevel = 1; // Level 1 (4H) -> 2 (5H) -> 3 (6H) -> 4 (7H) -> 5 (Boss 5H / 4 tries)

    // Keyboard state tracker: { 'A': 'correct', 'B': 'absent', ... }
    this.keyboardState = {};

    // Definition hint state
    this.hintRevealed = false;

    // Statistics
    this.stats = this.loadStats();

    // DOM Elements
    this.boardsWrapper = document.getElementById('boards-wrapper');
    this.keyboardEl = document.getElementById('keyboard');
    this.modePills = document.getElementById('mode-pills');
    this.modeBannerName = document.getElementById('banner-mode-name');
    this.modeBannerSub = document.getElementById('banner-sub-text');
    this.bannerDynamic = document.getElementById('banner-dynamic-content');

    this.init();
  }

  init() {
    this.setupTheme();
    this.setupAudioButton();
    this.setupEventListeners();
    this.setupModals();
    this.startNewGame(this.mode);
  }

  // =========================================================================
  // Game Setup & Mode Management
  // =========================================================================

  setMode(newMode) {
    if (this.blitzTimer) {
      clearInterval(this.blitzTimer);
      this.blitzTimer = null;
    }
    this.mode = newMode;

    // Update Pill Buttons
    document.querySelectorAll('.mode-pill').forEach(pill => {
      pill.classList.toggle('active', pill.dataset.mode === newMode);
    });

    // Adjust container style for Duo mode
    const container = document.getElementById('app-container');
    container.classList.toggle('mode-duo', newMode === 'duo');

    this.startNewGame(newMode);
  }

  startNewGame(mode = this.mode) {
    this.mode = mode;
    this.isGameOver = false;
    this.isAnimating = false;
    this.currentInput = '';
    this.keyboardState = {};
    this.hintRevealed = false;

    // Reset visual keyboard
    document.querySelectorAll('.key-btn').forEach(btn => {
      btn.className = btn.classList.contains('wide-key') ? 'key-btn wide-key' : 'key-btn';
    });

    // Configure mode parameters
    if (mode === 'classic') {
      this.wordLength = 5;
      this.maxAttempts = 6;
      this.boards = [this.createBoardObject(this.getRandomWord(5))];
      this.updateBanner('Mode Klasik', 'Tebak kata 5 huruf dalam 6 kesempatan');
    } 
    else if (mode === 'duo') {
      this.wordLength = 5;
      this.maxAttempts = 7;
      const w1 = this.getRandomWord(5);
      let w2 = this.getRandomWord(5);
      while (w2.word === w1.word) {
        w2 = this.getRandomWord(5);
      }
      this.boards = [
        this.createBoardObject(w1, 'Papan 1'),
        this.createBoardObject(w2, 'Papan 2')
      ];
      this.updateBanner('Mode Duo', 'Tebak 2 kata sekaligus dalam 7 kesempatan');
    }
    else if (mode === 'blitz') {
      this.wordLength = 5;
      this.maxAttempts = 6;
      if (!this.blitzTimer) {
        this.blitzTimeLeft = 90;
        this.blitzScore = 0;
        this.blitzCombo = 0;
        this.startBlitzTimer();
      }
      this.boards = [this.createBoardObject(this.getRandomWord(5))];
      this.updateBlitzBanner();
    }
    else if (mode === 'adventure') {
      this.setupAdventureLevel(this.adventureLevel);
    }
    else if (mode === 'definition') {
      this.wordLength = 5;
      this.maxAttempts = 6;
      this.boards = [this.createBoardObject(this.getRandomWord(5))];
      this.updateDefinitionBanner();
    }

    this.renderBoards();
  }

  setupAdventureLevel(lvl) {
    this.adventureLevel = lvl;
    if (lvl === 1) {
      this.wordLength = 4;
      this.maxAttempts = 6;
      this.boards = [this.createBoardObject(this.getRandomWord(4))];
      this.updateBanner(`Level 1/5 (Pemanasan)`, `Tebak kata 4 huruf`);
    } else if (lvl === 2) {
      this.wordLength = 5;
      this.maxAttempts = 6;
      this.boards = [this.createBoardObject(this.getRandomWord(5))];
      this.updateBanner(`Level 2/5 (Menengah)`, `Tebak kata 5 huruf`);
    } else if (lvl === 3) {
      this.wordLength = 6;
      this.maxAttempts = 6;
      this.boards = [this.createBoardObject(this.getRandomWord(6))];
      this.updateBanner(`Level 3/5 (Tantangan)`, `Tebak kata 6 huruf`);
    } else if (lvl === 4) {
      this.wordLength = 7;
      this.maxAttempts = 6;
      this.boards = [this.createBoardObject(this.getRandomWord(7))];
      this.updateBanner(`Level 4/5 (Pakar Kata)`, `Tebak kata 7 huruf`);
    } else if (lvl === 5) {
      this.wordLength = 5;
      this.maxAttempts = 4; // Boss mode has only 4 tries!
      this.boards = [this.createBoardObject(this.getRandomWord(5))];
      this.updateBanner(`Level 5/5 👑 BOSS MODE`, `Tebak kata 5 huruf hanya dalam 4 KESEMPATAN!`);
    }
  }

  createBoardObject(targetWordObj, name = '') {
    return {
      name: name,
      target: targetWordObj,
      currentRow: 0,
      guesses: [],
      solved: false
    };
  }

  getRandomWord(len) {
    const list = DICTIONARY[`words${len}`] || DICTIONARY.words5;
    return list[Math.floor(Math.random() * list.length)];
  }

  updateBanner(title, subtitle) {
    this.modeBannerName.textContent = title;
    this.modeBannerSub.textContent = subtitle;
    this.bannerDynamic.innerHTML = '';
  }

  updateBlitzBanner() {
    this.modeBannerName.textContent = '⚡ Mode Kilat';
    this.modeBannerSub.textContent = `Skor: ${this.blitzScore} kata`;
    const hurryClass = this.blitzTimeLeft <= 15 ? ' hurry' : '';
    this.bannerDynamic.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px;">
        ${this.blitzCombo > 1 ? `<span class="combo-badge">COMBO x${this.blitzCombo} 🔥</span>` : ''}
        <div class="timer-box${hurryClass}">⏱️ ${this.blitzTimeLeft}s</div>
      </div>
    `;
  }

  updateDefinitionBanner() {
    this.modeBannerName.textContent = '💡 Mode Makna';
    this.modeBannerSub.textContent = 'Tebak kata dengan petunjuk KBBI';
    this.bannerDynamic.innerHTML = `
      <button class="hint-btn" id="btn-show-hint">
        💡 ${this.hintRevealed ? 'Petunjuk Terbuka' : 'Buka Petunjuk'}
      </button>
    `;
    const btn = document.getElementById('btn-show-hint');
    if (btn) {
      btn.onclick = () => this.toggleHint();
    }
  }

  toggleHint() {
    this.hintRevealed = true;
    const target = this.boards[0].target;
    this.showToast(`💡 Petunjuk KBBI: "${target.def}"`, 4500);
    this.updateDefinitionBanner();
  }

  startBlitzTimer() {
    if (this.blitzTimer) clearInterval(this.blitzTimer);
    this.blitzTimer = setInterval(() => {
      if (this.isGameOver) {
        clearInterval(this.blitzTimer);
        return;
      }
      this.blitzTimeLeft--;
      this.updateBlitzBanner();

      if (this.blitzTimeLeft <= 0) {
        clearInterval(this.blitzTimer);
        this.blitzTimeLeft = 0;
        this.endBlitzGame();
      }
    }, 1000);
  }

  endBlitzGame() {
    this.isGameOver = true;
    sounds.playDefeat();
    if (this.blitzScore > this.stats.blitzHighScore) {
      this.stats.blitzHighScore = this.blitzScore;
      this.saveStats();
    }
    this.showResultModal(false, true);
  }

  // =========================================================================
  // DOM Rendering
  // =========================================================================

  renderBoards() {
    this.boardsWrapper.innerHTML = '';

    this.boards.forEach((board, bIdx) => {
      const boardContainer = document.createElement('div');
      boardContainer.className = 'board-container' + (board.solved ? ' solved' : '');
      boardContainer.id = `board-${bIdx}`;

      if (this.boards.length > 1) {
        const header = document.createElement('div');
        header.className = 'board-header';
        header.textContent = board.name || `Papan ${bIdx + 1}`;
        boardContainer.appendChild(header);
      }

      const grid = document.createElement('div');
      grid.className = 'board-grid';
      grid.style.gridTemplateRows = `repeat(${this.maxAttempts}, 1fr)`;

      for (let r = 0; r < this.maxAttempts; r++) {
        const row = document.createElement('div');
        row.className = `grid-row len-${this.wordLength}`;
        row.id = `board-${bIdx}-row-${r}`;

        for (let c = 0; c < this.wordLength; c++) {
          const tile = document.createElement('div');
          tile.className = 'tile';
          tile.id = `board-${bIdx}-tile-${r}-${c}`;
          row.appendChild(tile);
        }
        grid.appendChild(row);
      }

      boardContainer.appendChild(grid);
      this.boardsWrapper.appendChild(boardContainer);
    });
  }

  updateCurrentRowTiles() {
    this.boards.forEach((board, bIdx) => {
      if (board.solved) return;
      const r = board.currentRow;
      for (let c = 0; c < this.wordLength; c++) {
        const tile = document.getElementById(`board-${bIdx}-tile-${r}-${c}`);
        if (tile) {
          const letter = this.currentInput[c] || '';
          tile.textContent = letter;
          if (letter) {
            tile.classList.add('filled');
          } else {
            tile.classList.remove('filled');
          }
        }
      }
    });
  }

  // =========================================================================
  // Input Handling
  // =========================================================================

  handleInput(key) {
    if (this.isGameOver || this.isAnimating) return;

    if (key === 'ENTER') {
      this.submitGuess();
    } else if (key === 'BACKSPACE' || key === 'DELETE') {
      if (this.currentInput.length > 0) {
        this.currentInput = this.currentInput.slice(0, -1);
        sounds.playDelete();
        this.updateCurrentRowTiles();
      }
    } else if (/^[A-Z]$/.test(key)) {
      if (this.currentInput.length < this.wordLength) {
        this.currentInput += key;
        sounds.playPop();
        this.updateCurrentRowTiles();
      }
    }
  }

  // =========================================================================
  // Guess Submission & Staged Animations
  // =========================================================================

  submitGuess() {
    const guess = this.currentInput.toUpperCase();

    // Check letter length
    if (guess.length < this.wordLength) {
      this.shakeActiveRows();
      sounds.playInvalid();
      this.showToast('Huruf kurang lengkap!', 1500);
      return;
    }

    // Check valid word in dictionary
    if (!DICTIONARY.validGuesses.has(guess)) {
      this.shakeActiveRows();
      sounds.playInvalid();
      this.showToast('Kata tidak terdaftar di KBBI!', 1800);
      return;
    }

    this.isAnimating = true;
    const evaluations = this.boards.map(b => this.evaluateGuess(guess, b.target.word));

    // Staged sequential tile animation for each column
    this.animateStagedReveal(guess, evaluations, 0);
  }

  evaluateGuess(guess, target) {
    const len = target.length;
    const result = new Array(len).fill('absent');
    const targetLetterCount = {};

    for (let char of target) {
      targetLetterCount[char] = (targetLetterCount[char] || 0) + 1;
    }

    // First pass: Correct positions (Green)
    for (let i = 0; i < len; i++) {
      if (guess[i] === target[i]) {
        result[i] = 'correct';
        targetLetterCount[guess[i]]--;
      }
    }

    // Second pass: Present in word (Yellow)
    for (let i = 0; i < len; i++) {
      if (result[i] !== 'correct' && targetLetterCount[guess[i]] > 0) {
        result[i] = 'present';
        targetLetterCount[guess[i]]--;
      }
    }

    return result;
  }

  animateStagedReveal(guess, evaluations, colIndex) {
    if (colIndex >= this.wordLength) {
      // Finished all columns in this row
      setTimeout(() => {
        this.onRowRevealComplete(guess, evaluations);
      }, 250);
      return;
    }

    // Flip tiles for column across all active boards
    this.boards.forEach((board, bIdx) => {
      if (board.solved) return;
      const tile = document.getElementById(`board-${bIdx}-tile-${board.currentRow}-${colIndex}`);
      if (tile) {
        tile.classList.add('flip-in');
        setTimeout(() => {
          tile.classList.remove('flip-in');
          const evalStatus = evaluations[bIdx][colIndex];
          tile.classList.add(evalStatus);
          tile.classList.add('flip-out');

          // Play Sound with pitch chime based on index
          sounds.playFlip(evalStatus, colIndex);

          // Update Keyboard Key state
          this.updateKeyboardKeyState(guess[colIndex], evalStatus);

          setTimeout(() => {
            tile.classList.remove('flip-out');
          }, 250);
        }, 180);
      }
    });

    // Stagger to next column
    setTimeout(() => {
      this.animateStagedReveal(guess, evaluations, colIndex + 1);
    }, 250);
  }

  updateKeyboardKeyState(letter, status) {
    const current = this.keyboardState[letter];
    // Hierarchy: correct > present > absent
    if (current === 'correct') return;
    if (current === 'present' && status === 'absent') return;

    this.keyboardState[letter] = status;

    const btn = document.querySelector(`.key-btn[data-key="${letter}"]`);
    if (btn) {
      btn.className = `key-btn ${status}`;
    }
  }

  onRowRevealComplete(guess, evaluations) {
    let anyNewlySolved = false;

    this.boards.forEach((board, bIdx) => {
      if (board.solved) return;
      board.guesses.push(guess);

      const isWin = evaluations[bIdx].every(s => s === 'correct');
      if (isWin) {
        board.solved = true;
        anyNewlySolved = true;
        this.celebrateRow(bIdx, board.currentRow);
      }
      board.currentRow++;
    });

    this.currentInput = '';
    this.isAnimating = false;

    // Check Win/Loss conditions
    const allSolved = this.boards.every(b => b.solved);
    const outOfAttempts = this.boards.some(b => !b.solved && b.currentRow >= this.maxAttempts);

    if (allSolved) {
      this.handleGameWin();
    } else if (outOfAttempts) {
      this.handleGameLoss();
    } else {
      // Still playing - if in definition mode and row >= 3, show hint reminder
      if (this.mode === 'definition' && !this.hintRevealed && this.boards[0].currentRow === 3) {
        this.showToast('💡 Petunjuk KBBI kini tersedia di pojok atas!', 3000);
      }
    }
  }

  celebrateRow(bIdx, rowIdx) {
    const rowEl = document.getElementById(`board-${bIdx}-row-${rowIdx}`);
    if (rowEl) {
      Array.from(rowEl.children).forEach((tile, idx) => {
        setTimeout(() => {
          tile.classList.add('dance');
        }, idx * 80);
      });
    }
    const container = document.getElementById(`board-${bIdx}`);
    if (container && this.boards.length > 1) {
      container.classList.add('solved');
    }
  }

  shakeActiveRows() {
    this.boards.forEach((board, bIdx) => {
      if (board.solved) return;
      const row = document.getElementById(`board-${bIdx}-row-${board.currentRow}`);
      if (row) {
        row.classList.add('shake');
        setTimeout(() => row.classList.remove('shake'), 500);
      }
    });
  }

  // =========================================================================
  // Win / Loss & Mode Transitions
  // =========================================================================

  handleGameWin() {
    sounds.playVictory();
    confetti.fire(150);

    if (this.mode === 'blitz') {
      this.blitzScore++;
      this.blitzCombo++;
      this.blitzTimeLeft += 15; // Bonus 15 seconds!
      sounds.playCombo(this.blitzCombo);
      this.showToast(`🔥 KATA TEPAT! +15s (Skor: ${this.blitzScore})`, 1800);

      // Instantly start next word with glowing reset
      setTimeout(() => {
        this.boards = [this.createBoardObject(this.getRandomWord(5))];
        this.currentInput = '';
        this.renderBoards();
        this.updateBlitzBanner();
      }, 700);
      return;
    }

    if (this.mode === 'adventure') {
      if (this.adventureLevel < 5) {
        this.stats.adventureMaxLevel = Math.max(this.stats.adventureMaxLevel, this.adventureLevel + 1);
        this.saveStats();
        this.showResultModal(true, false, true); // Next level prompt
      } else {
        // Beat Boss Mode!
        this.stats.adventureMaxLevel = 5;
        this.saveStats();
        confetti.rain(3500);
        this.showResultModal(true, false, false, true); // Beat gauntlet!
      }
      return;
    }

    // Classic & Duo & Definition Win
    this.isGameOver = true;
    this.recordWin(this.boards[0].currentRow);
    setTimeout(() => {
      this.showResultModal(true, false);
    }, 1000);
  }

  handleGameLoss() {
    this.isGameOver = true;
    sounds.playDefeat();
    this.recordLoss();
    setTimeout(() => {
      this.showResultModal(false, false);
    }, 1000);
  }

  showResultModal(isWin, isBlitzEnd = false, canNextLevel = false, beatGauntlet = false) {
    const modal = document.getElementById('modal-result');
    const title = document.getElementById('result-title');
    const msg = document.getElementById('result-message');
    const kbbiList = document.getElementById('result-kbbi-list');
    const extraInfo = document.getElementById('result-extra-info');
    const playAgainBtnText = document.getElementById('btn-play-again-text');

    kbbiList.innerHTML = '';
    extraInfo.innerHTML = '';

    if (isBlitzEnd) {
      title.textContent = '⏱️ Waktu Habis!';
      msg.textContent = `Kamu berhasil menebak ${this.blitzScore} kata! Rekor tertinggi: ${this.stats.blitzHighScore} kata.`;
      playAgainBtnText.textContent = 'Main Kilat Lagi';
    } else if (beatGauntlet) {
      title.textContent = '👑 JUARA PETUALANGAN KATA!';
      msg.textContent = 'Selamat! Kamu berhasil menaklukkan seluruh 5 Level termasuk BOSS MODE!';
      playAgainBtnText.textContent = 'Ulangi Petualangan';
    } else if (canNextLevel) {
      title.textContent = '🎉 Level Berhasil Dilewati!';
      msg.textContent = `Luar biasa! Siap melangkah ke Level ${this.adventureLevel + 1}?`;
      playAgainBtnText.textContent = `Mulai Level ${this.adventureLevel + 1} ➔`;
    } else if (isWin) {
      const titles = ['🎉 Luar Biasa!', '🏆 Hebat Sekali!', '✨ Pintar Banget!', '🌟 Mengagumkan!'];
      title.textContent = titles[Math.floor(Math.random() * titles.length)];
      msg.textContent = `Kamu berhasil menebak dalam ${this.boards[0].currentRow} kesempatan!`;
      playAgainBtnText.textContent = 'Main Lagi (Kata Baru)';
    } else {
      title.textContent = '💔 Belum Beruntung!';
      msg.textContent = 'Jangan patah semangat, coba tebak lagi kata berikutnya!';
      playAgainBtnText.textContent = 'Coba Lagi';
    }

    // Populate KBBI Definitions
    this.boards.forEach(board => {
      const card = document.createElement('div');
      card.className = 'kbbi-card';
      card.innerHTML = `
        <div class="kbbi-word">
          <span>${board.target.word}</span>
          <span class="kbbi-tag">KBBI</span>
        </div>
        <div class="kbbi-definition">${board.target.def}</div>
      `;
      kbbiList.appendChild(card);
    });

    modal.classList.add('active');
  }

  // =========================================================================
  // Share Result (Emoji Grid)
  // =========================================================================

  shareResult() {
    let text = `KATA.IN (${this.getModeTitle()})\n`;
    
    if (this.mode === 'blitz') {
      text += `⚡ Skor Kilat: ${this.blitzScore} kata!\n`;
    } else {
      const attempts = this.boards.map(b => b.solved ? `${b.currentRow}/${this.maxAttempts}` : `X/${this.maxAttempts}`).join(', ');
      text += `Tebakan: ${attempts} ${this.boards.every(b => b.solved) ? '🎉' : '❌'}\n\n`;

      this.boards.forEach((board, bIdx) => {
        if (this.boards.length > 1) {
          text += `Papan ${bIdx + 1}:\n`;
        }
        board.guesses.forEach(g => {
          const ev = this.evaluateGuess(g, board.target.word);
          const rowStr = ev.map(st => st === 'correct' ? '🟩' : (st === 'present' ? '🟨' : '⬛')).join('');
          text += rowStr + '\n';
        });
        text += '\n';
      });
    }

    text += 'Mainkan di KATA.IN Bahasa Indonesia 🇮🇩';

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        this.showToast('✅ Hasil berhasil disalin ke clipboard!', 2500);
      }).catch(() => {
        this.fallbackCopy(text);
      });
    } else {
      this.fallbackCopy(text);
    }
  }

  fallbackCopy(text) {
    const area = document.createElement('textarea');
    area.value = text;
    document.body.appendChild(area);
    area.select();
    document.execCommand('copy');
    document.body.removeChild(area);
    this.showToast('✅ Hasil berhasil disalin ke clipboard!', 2500);
  }

  getModeTitle() {
    switch (this.mode) {
      case 'duo': return 'Mode Duo';
      case 'blitz': return 'Mode Kilat';
      case 'adventure': return `Petualangan Level ${this.adventureLevel}`;
      case 'definition': return 'Mode Makna';
      default: return 'Mode Klasik';
    }
  }

  // =========================================================================
  // Statistics Persistence
  // =========================================================================

  loadStats() {
    const saved = localStorage.getItem('katain_stats');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      played: 0,
      wins: 0,
      currentStreak: 0,
      maxStreak: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 },
      blitzHighScore: 0,
      adventureMaxLevel: 1
    };
  }

  saveStats() {
    localStorage.setItem('katain_stats', JSON.stringify(this.stats));
  }

  recordWin(attempts) {
    this.stats.played++;
    this.stats.wins++;
    this.stats.currentStreak++;
    this.stats.maxStreak = Math.max(this.stats.maxStreak, this.stats.currentStreak);
    this.stats.distribution[attempts] = (this.stats.distribution[attempts] || 0) + 1;
    this.saveStats();
  }

  recordLoss() {
    this.stats.played++;
    this.stats.currentStreak = 0;
    this.saveStats();
  }

  renderStatsModal() {
    document.getElementById('stat-played').textContent = this.stats.played;
    const winRate = this.stats.played > 0 ? Math.round((this.stats.wins / this.stats.played) * 100) : 0;
    document.getElementById('stat-winrate').textContent = `${winRate}%`;
    document.getElementById('stat-streak').textContent = this.stats.currentStreak;
    document.getElementById('stat-maxstreak').textContent = this.stats.maxStreak;
    document.getElementById('stat-blitz-high').textContent = `${this.stats.blitzHighScore} Kata`;
    document.getElementById('stat-adventure-level').textContent = `Level ${this.stats.adventureMaxLevel}`;

    const distContainer = document.getElementById('guess-distribution');
    distContainer.innerHTML = '';

    const maxCount = Math.max(1, ...Object.values(this.stats.distribution));

    for (let i = 1; i <= 6; i++) {
      const count = this.stats.distribution[i] || 0;
      const pct = Math.max(8, Math.round((count / maxCount) * 100));

      const row = document.createElement('div');
      row.className = 'dist-row';
      row.innerHTML = `
        <span style="width: 14px;">${i}</span>
        <div class="dist-bar" style="width: ${pct}%;">${count}</div>
      `;
      distContainer.appendChild(row);
    }
  }

  resetStats() {
    if (confirm('Apakah kamu yakin ingin mereset seluruh statistik permainan?')) {
      this.stats = {
        played: 0,
        wins: 0,
        currentStreak: 0,
        maxStreak: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 },
        blitzHighScore: 0,
        adventureMaxLevel: 1
      };
      this.saveStats();
      this.renderStatsModal();
      this.showToast('Statistik berhasil direset.', 2000);
    }
  }

  // =========================================================================
  // Theme & Audio Controls
  // =========================================================================

  setupTheme() {
    const savedTheme = localStorage.getItem('katain_theme') || 'cyber';
    this.applyTheme(savedTheme);

    document.querySelectorAll('.theme-opt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.dataset.setTheme;
        this.applyTheme(theme);
      });
    });
  }

  applyTheme(themeName) {
    document.body.setAttribute('data-theme', themeName);
    localStorage.setItem('katain_theme', themeName);

    document.querySelectorAll('.theme-opt-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.setTheme === themeName);
    });
  }

  setupAudioButton() {
    const btn = document.getElementById('btn-sound');
    const onIcon = document.getElementById('icon-sound-on');
    const offIcon = document.getElementById('icon-sound-off');

    const updateIcons = () => {
      if (sounds.isMuted) {
        onIcon.style.display = 'none';
        offIcon.style.display = 'block';
      } else {
        onIcon.style.display = 'block';
        offIcon.style.display = 'none';
      }
    };

    updateIcons();

    btn.addEventListener('click', () => {
      sounds.toggleMute();
      updateIcons();
      this.showToast(sounds.isMuted ? '🔇 Suara dimatikan' : '🔊 Suara diaktifkan', 1500);
    });
  }

  // =========================================================================
  // Event Listeners & Modals
  // =========================================================================

  setupEventListeners() {
    // Physical Keyboard Listener
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'Enter') {
        this.handleInput('ENTER');
      } else if (e.key === 'Backspace') {
        this.handleInput('BACKSPACE');
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        this.handleInput(e.key.toUpperCase());
      }
    });

    // Virtual Keyboard Buttons
    this.keyboardEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.key-btn');
      if (btn) {
        const key = btn.dataset.key;
        this.handleInput(key);
        btn.blur();
      }
    });

    // Mode Pills Listener
    this.modePills.addEventListener('click', (e) => {
      const pill = e.target.closest('.mode-pill');
      if (pill) {
        this.setMode(pill.dataset.mode);
      }
    });

    // Logo click refreshes current game
    document.getElementById('logo-refresh').addEventListener('click', () => {
      this.startNewGame(this.mode);
      this.showToast('Game direset dengan kata baru!', 1500);
    });

    // Play Again Button in Result Modal
    document.getElementById('btn-play-again').addEventListener('click', () => {
      document.getElementById('modal-result').classList.remove('active');
      if (this.mode === 'adventure') {
        if (this.adventureLevel < 5 && this.boards.every(b => b.solved)) {
          this.setupAdventureLevel(this.adventureLevel + 1);
        } else {
          this.setupAdventureLevel(1);
        }
        this.startNewGame(this.mode);
      } else {
        this.startNewGame(this.mode);
      }
    });

    // Share Button
    document.getElementById('btn-share-result').addEventListener('click', () => {
      this.shareResult();
    });

    // Reset Stats Button
    document.getElementById('btn-reset-stats').addEventListener('click', () => {
      this.resetStats();
    });
  }

  setupModals() {
    // Open Dialogs
    document.getElementById('btn-modes').addEventListener('click', () => {
      document.getElementById('modal-modes-dialog').classList.add('active');
    });

    document.getElementById('btn-theme').addEventListener('click', () => {
      document.getElementById('modal-theme-dialog').classList.add('active');
    });

    document.getElementById('btn-stats').addEventListener('click', () => {
      this.renderStatsModal();
      document.getElementById('modal-stats-dialog').classList.add('active');
    });

    document.getElementById('btn-help').addEventListener('click', () => {
      document.getElementById('modal-help-dialog').classList.add('active');
    });

    // Mode selection cards in Modal
    document.querySelectorAll('.mode-card').forEach(card => {
      card.addEventListener('click', () => {
        const mode = card.dataset.modeSelect;
        this.setMode(mode);
        document.getElementById('modal-modes-dialog').classList.remove('active');
      });
    });

    // Close Modal buttons
    document.querySelectorAll('.modal-close, [data-close]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetId = btn.dataset.close || btn.closest('.modal-backdrop').id;
        const modal = document.getElementById(targetId);
        if (modal) modal.classList.remove('active');
      });
    });

    // Close on backdrop click
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          backdrop.classList.remove('active');
        }
      });
    });
  }

  showToast(message, duration = 2000) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-20px)';
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, duration);
  }
}

// Instantiate game on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.game = new WordleGame();
});
