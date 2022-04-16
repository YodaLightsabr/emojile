import { words } from './guess.js';
import { dictionary } from 'https://file.heyrajan.com/dictionary.js'

function getNumber () {
  function daysIntoYear(date){
    return (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(date.getFullYear(), 0, 0)) / 24 / 60 / 60 / 1000;
	}
	const date = new Date();
	return (
		(date.getFullYear() - 2022) * 365
		+ daysIntoYear(date)
	) - 104;
}

let completed = false;
const puzzleNumber = getNumber();
let correctWord = words[puzzleNumber - 1];
let currentGuess = [];
let guessesList = [];
let next = 0;

const guesses = (
    Math.ceil(38 / correctWord.length) // enough times to cover every possible character
    + 4 // an arbitrary number that seems right?
);
let remaining = guesses;

const saveData = localStorage.getItem('save');
if (saveData) {
    try {
        const { theCurrentGuess, puzzle } = JSON.parse(saveData);
        if (puzzle == puzzleNumber) {
            guessesList = theCurrentGuess.filter(a => a);
        }
    } catch (e) {}
}








function save () {
    localStorage.setItem('save', JSON.stringify({
        puzzle: puzzleNumber,
        theCurrentGuess: guessesList
    }));
}
setInterval(save, 5000);

function wordle () {
    let board = document.getElementById('game-board');

    for (let i = 0; i < guesses; i++) {
        let row = document.createElement('div');
        row.className = 'letter-row';
        
        for (let j = 0; j < correctWord.length; j++) {
            let box = document.createElement('div');
            box.className = 'letter-box';
            
            row.appendChild(box);
        }
        
        board.appendChild(row);
    }

    if (guessesList.length > 0) {
        
        for (let i = 0; i < guessesList.length; i++) {
            let row = document.getElementsByClassName('letter-row')[i];
            
    
    let guessString = guessesList[i];
    let rightGuess = Array.from(correctWord);
            for (let j = 0; j < guessesList[i].length; j++) {

                let box = row.children[j];
                box.textContent = guessesList[i][j];


        let coloring = '';
        let letter = guessString[j];

        let letterPosition = rightGuess.indexOf(guessString[j]);
        if (letterPosition === -1) {
            coloring = '#1a1a1a';
        }
        else if (guessString[j] === rightGuess[j]) coloring = '#628b55';
        else coloring = '#fcba03';

        rightGuess[letterPosition] = '#';

        setTimeout(() => {
            box.classList.remove('typed-in-active');
            box.classList.add('complete');
            box.style.backgroundColor = coloring;
        }, 150 * j + i * 150);
        
            keyboard(letter, coloring);


                
            }
            remaining--;
        }
        if (guessesList.includes(correctWord)) {
            completed = true;
            document.getElementById('button-container').classList.add('show');
            document.getElementById('emoji').innerText = ':' + correctWord + ':';
            document.getElementById('emoji-image').src = 'https://e.benjaminsmith.dev/' + correctWord;
        }
    }
}

function keyboard (letter, color) {
    for (const element of document.getElementsByClassName('key')) {
        if (element.textContent === letter) {
            let scheme = element.style.backgroundColor;
            if (scheme === 'green') return;

            if (scheme === 'yellow' && color !== 'green') return;

            element.style.backgroundColor = color;
            break;
        }
    }
}

function deleting () {
    let row = document.getElementsByClassName('letter-row')[guesses - remaining];
    let box = row.children[next - 1];
    box.textContent = '';
    box.classList.remove('filled-box');
    box.classList.remove('typed-in-active');
    currentGuess.pop();
    next--;
}

function insertLetter (clicked) {
    if (completed) return;
    if (next === correctWord.length) return;
    clicked = clicked.toLowerCase();

    let row = document.getElementsByClassName('letter-row')[guesses - remaining];
    let box = row.children[next];
    box.textContent = clicked;
    box.classList.add('filled-box');
    box.classList.add('typed-in-active');

    currentGuess.push(clicked);
    next++;
}

document.addEventListener('keyup', e => {
    if (remaining === 0) return;

    let clicked = String(e.key);
    if (clicked === '~') {
        window.localStorage.setItem('save', '{}');
        window.location.reload();
    }
    if (clicked === 'Backspace' && next !== 0) return deleting();
    if (clicked === 'Enter') return check();

    let found = clicked.match(/[a-z0-9\-\_]/gi);
    if (!found || found.length > 1) return;

    insertLetter(clicked);

});

document.getElementById('keyboard').addEventListener('click', e => {
    const target = e.target;

    if (!target.classList.contains('key')) return;

    let key = target.textContent;

    if (key === 'Del') key = 'Backspace';

    document.dispatchEvent(new KeyboardEvent('keyup', { key }));
    
});

function check () {
    if (completed) return;
    let row = document.getElementsByClassName('letter-row')[guesses - remaining];
    let guessString = '';
    let rightGuess = Array.from(correctWord);

    for (const value of currentGuess) {
        guessString += value;
    }
    guessesList.push(guessString);
    if (guessString.length !== correctWord.length) return toastr.error('Not enough letters');

 //   if (!dictionary.includes(guessString) && !words.includes(guessString)) return console.log('word is not in list');
    // it seems like there should be some room here

    for (let i = 0; i < correctWord.length; i++) {
        let coloring = '';
        let box = row.children [i];
        let letter = currentGuess[i];

        let letterPosition = rightGuess.indexOf(currentGuess[i]);
        if (letterPosition === -1) {
            coloring = '#1a1a1a';
        }
        else if (currentGuess[i] === rightGuess[i]) coloring = '#628b55';
        else coloring = '#fcba03';

        rightGuess[letterPosition] = '#';

        setTimeout(() => {
            box.classList.remove('typed-in-active');
            box.classList.add('complete');
            box.style.backgroundColor = coloring;
        }, 150 * i);
        
        setTimeout(() => {
            keyboard(letter, coloring);
        }, correctWord.length * 150);
    }
        
    setTimeout(() => {
        if (guessString === correctWord) {
            toastr.success('Splendid!');
            completed = true;
            document.getElementById('button-container').classList.add('show');
            document.getElementById('emoji').innerText = ':' + correctWord + ':';
            document.getElementById('emoji-image').src = 'https://e.benjaminsmith.dev/' + correctWord;
        } else {
            remaining--;
            currentGuess = [];
            next = 0;
            if (remaining === 0) {
                toastr.error('You lost. The word was ' + correctWord);
            completed = true;
                document.getElementById('button-container').classList.add('show');
                document.getElementById('emoji').innerText = ':' + correctWord + ':';
                document.getElementById('emoji-image').src = 'https://e.benjaminsmith.dev/' + correctWord;
            }
        }
        save();
    }, correctWord.length * 150);

}

wordle();

function generateScore () {
    let output = `Slack Emojile ${puzzleNumber} ${guessesList.length > guesses ? 'X' : guessesList.length}/${guesses}\n`
    output += guessesList.map(g => {
        return `:${g.split('').map((char, i) => {
            if (correctWord[i] == char) return '🟩';
            if (correctWord.split('').includes(char)) return '🟨';
            return '⬛';
        }).join('')}:`
    }).join('\n');
    output += `\nhttps://emojile.dino.icu`;
    return output;
}

function copy () {
    copyTextToClipboard(generateScore());
    
}

function copyTextToClipboard(text) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text).then(function() {
      toastr.success('Copied to clipboard!');
    console.log('Async: Copying to clipboard was successful!');
  }, function(err) {
    console.error('Async: Could not copy text: ', err);
      toastr.error('Unable to copy text.');
  });
}

function fallbackCopyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
  
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
  
    try {
      var successful = document.execCommand('copy');
      var msg = successful ? 'successful' : 'unsuccessful';
      console.log('Fallback: Copying text command was ' + msg);
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
    }
  
    document.body.removeChild(textArea);
  }

window.copy = copy;