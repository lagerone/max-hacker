class Cursor {
  intervalId = null;
  element = null;

  /**
   * @param {HTMLElement} cursorElement
   */
  constructor(cursorElement) {
    this.cursorElement = cursorElement;
  }

  stop() {
    this.cursorElement.classList.add('hidden');
    clearInterval(this.intervalId);
  }

  start() {
    this.cursorElement.classList.remove('hidden');
    this.intervalId = setInterval(() => {
      this.cursorElement.classList.toggle('hidden');
    }, 500);
  }
}

class TerminalText {
  typeSpeed = 2;
  typeCount = 0;
  typeTimeoutMS = 500;

  /**
   * @param {HTMLElement} textElement
   * @param {string} text
   * @param {Cursor} cursor
   */
  constructor(textElement, text, cursor) {
    this.textElement = textElement;
    this.text = text.replace(/\t/g, '  ');
    this.cursor = cursor;
  }

  start() {
    console.log('starting terminal');
    window.addEventListener('keypress', this.keypressEventListener);
    this.cursor.start();
  }

  stop() {
    console.log('stopping terminal');
    this.cursor.stop();
    window.removeEventListener('keypress', this.keypressEventListener);
  }

  typeText() {
    this.typeCount += this.typeSpeed;
    const typedText = this.text.substring(0, this.typeCount);
    this.textElement.innerHTML = typedText
      .replaceAll(' ', '&nbsp;')
      .replaceAll('\n', '<br />');
  }

  eraseText() {
    if (this.typeCount <= 0) {
      this.typeCount = 0;
      return;
    }
    this.typeCount -= this.typeSpeed;
    const typedText = this.text.substring(0, this.typeCount);
    this.textElement.innerHTML = typedText
      .replaceAll(' ', '&nbsp;')
      .replaceAll('\n', '<br />');
  }

  clear() {
    this.typeCount = 0;
    this.textElement.innerHTML = '';
  }

  keypressEventListener = (event) => {
    this.cursor.stop();
    clearTimeout(this.cursorTimeoutId);
    if (event.charCode === 127) {
      this.eraseText();
    } else {
      this.typeText();
    }
    this.cursorTimeoutId = setTimeout(() => {
      this.cursor.start();
    }, this.typeTimeoutMS);
  };
}

class HackerSettings {
  /**
   * @param {HTMLElement} settingsElement
   * @param {TerminalText} terminal
   */
  constructor(settingsElement, terminal) {
    this.settingsToggleElement = settingsElement.querySelector(
      '.settings-toggle'
    );
    this.settingsListElement = settingsElement.querySelector(
      '.hacker-settings-list'
    );
    this.speedInputElement = settingsElement.querySelector(
      'input.input-type-speed'
    );
    this.terminal = terminal;

    this.speedInputElement.value = terminal.typeSpeed;
  }

  start() {
    this.addToggle();
    this.trackSpeedInput();
  }

  addToggle() {
    this.settingsToggleElement.addEventListener('click', () => {
      this.settingsListElement.classList.toggle('hidden');
      if (this.settingsListElement.classList.contains('hidden')) {
        this.terminal.start();
      } else {
        this.terminal.stop();
      }
    });
  }

  trackSpeedInput() {
    this.speedInputElement.addEventListener('change', (event) => {
      this.terminal.typeSpeed = parseInt(event.target.value, 10);
    });
  }
}

class Overlay {
  /**
   *
   * @param {HTMLElement} element
   * @param {string} soundOpen
   * @param {number} autoCloseTimeout
   * @param {function} onCloseCallback
   * @param {string} soundClose
   * @param {number} closeTimeout
   */
  constructor(
    element,
    soundOpen,
    autoCloseTimeout,
    onCloseCallback,
    soundClose,
    closeTimeout
  ) {
    this.element = element;
    this.autoCloseTimeout = autoCloseTimeout;
    this.onCloseCallback = onCloseCallback;
    this.audioOpen = soundOpen && new Audio(soundOpen);
    this.audioClose = soundClose && new Audio(soundClose);
    this.closeTimeout = closeTimeout;

    const closeElement = this.element.querySelector('.overlay-close');
    if (closeElement)
      closeElement.addEventListener('click', () => {
        this.close();
      });
  }

  open() {
    if (this.audioOpen) {
      this.audioOpen.play();
    }
    this.showOverlayBackground();
    this.element.classList.remove('hidden');

    if (this.autoCloseTimeout) {
      setTimeout(() => {
        this.close();
        if (typeof this.onCloseCallback === 'function') {
          this.onCloseCallback();
        }
      }, this.autoCloseTimeout);
    }
  }

  close() {
    const doTheClosing = () => {
      this.element.classList.add('hidden');
      this.hideOverlayBackground();
      if (typeof this.onCloseCallback === 'function') {
        this.onCloseCallback();
      }
    };
    if (this.audioOpen) {
      this.audioOpen.pause();
      this.audioOpen.currentTime = 0;
    }
    if (this.audioClose) {
      this.audioClose.play();
      setTimeout(() => {
        doTheClosing();
      }, this.closeTimeout);
    } else {
      doTheClosing();
    }
  }

  showOverlayBackground() {
    document.querySelector('.overlay-background').classList.remove('hidden');
  }

  hideOverlayBackground() {
    document.querySelector('.overlay-background').classList.add('hidden');
  }
}

const productOverlay = new Overlay(
  document.getElementById('product-overlay'),
  './sounds/robot-transmission.mp3',
  null,
  null,
  './sounds/spaceship-interface.mp3',
  1000
);

const hackingAlert = new Overlay(
  document.getElementById('alert'),
  './sounds/alarm.mp3',
  2000,
  () => {
    productOverlay.open();
  }
);

const productHackerOverlay = new Overlay(
  document.getElementById('product-console-overlay'),
  './sounds/powerup.mp3',
  null,
  null,
  './sounds/lushlife-levelup.mp3',
  1000
);

function preLoadAudioFiles(doneCallback) {
  const audioFiles = [
    './sounds/robot-transmission.mp3',
    './sounds/spaceship-interface.mp3',
    './sounds/alarm.mp3',
    './sounds/ambient-bg.mp3',
    './sounds/lushlife-levelup.mp3',
    './sounds/powerup.mp3',
    './sounds/police.mp3',
  ];

  function preloadAudio(url) {
    const audio = new Audio();
    audio.addEventListener('canplaythrough', loadedAudio, false);
    audio.src = url;
  }

  let loaded = 0;
  function loadedAudio() {
    loaded++;
    if (loaded == audioFiles.length) {
      doneCallback();
    }
  }

  for (const file of audioFiles) {
    preloadAudio(file);
  }
}

preLoadAudioFiles(() => {
  document.getElementById('loading-program').classList.add('hidden');
  document.getElementById('hacker-program-loaded').classList.remove('hidden');
  document.querySelector('.start-button').addEventListener('click', () => {
    document.getElementById('hacker-program-loaded').classList.add('hidden');
    startProgram();
  });
});

const cursor = new Cursor(document.querySelector('.main-cursor'));
const terminalText = new TerminalText(
  document.querySelector('.main-console'),
  window.kernel,
  cursor
);

terminalText.start();

function startProgram() {
  document.getElementById('hacker-program').classList.remove('hidden');
  const bgAudio = new Audio('./sounds/ambient-bg.mp3');
  bgAudio.loop = true;
  bgAudio.play();
  new HackerSettings(
    document.getElementById('hacker-settings'),
    terminalText
  ).start();
}

const productCursor = new Cursor(document.querySelector('.product-cursor'));
const productTerminalText = new TerminalText(
  document.querySelector('.product-console'),
  window.kernel,
  productCursor
);

let gameOverCount = 0;
document.querySelector('.buy-button').addEventListener('click', () => {
  if (document.querySelector('.buy-button').classList.contains('hacked')) {
    gameOverCount++;
    if (gameOverCount < 10) {
      createGameOverOverlay(
        'Du har lyckats hacka sidan! Lamborghini är köpt för 0 kr.'
      ).open();
    } else {
      createGameReallyOverOverlay(
        'Du har hackat för mycket! Polisen kommer.'
      ).open();
    }
    return;
  }
  productHackerOverlay.open();
  window.removeEventListener('keypress', terminalText.keypressEventListener);
  window.addEventListener('keypress', overlayTyperKeypressEvent);
  productHackerOverlay.onCloseCallback = () => {
    window.removeEventListener('keypress', overlayTyperKeypressEvent);
    window.addEventListener('keypress', terminalText.keypressEventListener);
  };

  function overlayTyperKeypressEvent(event) {
    event.preventDefault();
    if (event.charCode === 13) {
      // Enter key
      productHackerOverlay.close();
      productIsHacked();
    } else {
      productTerminalText.typeText();
    }
  }
});

secretButtonIntervalId = setInterval(() => {
  if (terminalText.typeCount > 300) {
    new Audio('./sounds/lushlife-levelup.mp3').play();
    document.getElementById('secret-button').classList.remove('hidden');
    clearInterval(secretButtonIntervalId);
  }
}, 100);

document.getElementById('secret-button').addEventListener('click', () => {
  hackingAlert.open();
});

function createGameOverOverlay(overlayText) {
  const element = document.createElement('div');
  element.classList.add('alert', 'overlay', 'game-over-overlay', 'hidden');
  element.style.top = randomIntFromInterval(10, 300) + 'px';
  element.style.left =
    randomIntFromInterval(10, Math.round(window.innerWidth) - 500) + 'px';
  element.innerHTML = `<div class="overlay-close">x</div>
    <div class="overlay-container">
      ${overlayText}
    </div>`;
  document.getElementById('hacker-program').appendChild(element);
  return new Overlay(
    element,
    './sounds/powerup.mp3',
    null,
    null,
    './sounds/spaceship-interface.mp3',
    1000
  );
}

function createGameReallyOverOverlay(overlayText) {
  const element = document.createElement('div');
  element.classList.add(
    'alert',
    'overlay',
    'game-really-over-overlay',
    'hidden'
  );
  element.style.top = randomIntFromInterval(10, 500) + 'px';
  element.style.left =
    randomIntFromInterval(10, Math.round(window.innerWidth) - 700) + 'px';
  element.innerHTML = `<div class="overlay-container">
      ${overlayText}
    </div>`;
  document.getElementById('hacker-program').appendChild(element);
  return new Overlay(element, './sounds/police.mp3', null, null, null, 1000);
}

function productIsHacked() {
  document.querySelector('.buy-button').classList.add('hacked', 'blink');
}

function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
