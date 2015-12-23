import {Page, NavController, NavParams, Popup} from 'ionic/ionic';
import {NextRound} from '../nextRound/nextRound';
import {app} from '../app';

const ALPHABET = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя';
const ALPHABETLARGE = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ';

@Page({
    templateUrl: 'app/game/game.html'
})

export class Game {
    constructor(nav: NavController, params: NavParams, popup: Popup) {
        this.nav = nav;
        this.isMultiplayer = params.get('isMultiplayer') || false;
        this.round = params.get('round') || 1;
        this.score = params.get('score') || {me: 0, opponent: 0};
        this.serverData = params.get('serverData');
        this.currentField = this.serverData.fields[this.round-1];
        this.wordsRemaining = this.currentField.answers.length;
        this.reward = 3;
        this.finishLock = false;

        if (this.isMultiplayer)
            this.attachSockets();

        this.processField();
        this.startRound();
    }

    onPageWillLeave() {
        app.socket.removeListener('wordGuessed');
        app.socket.removeListener('disconnect');
        window.clearTimeout(this.timeoutCapitalize);
        window.clearTimeout(this.timeoutHide);
        window.clearInterval(this.interval);
    }

    processField() {
        for (x in this.currentField.field) {
            for (y in this.currentField.field[x]) {
                let letter = this.currentField.field[x][y];

                if (letter.toString() == '0') {
                    do
                        var genLetter = ALPHABET[Math.round(Math.random() * 32)];
                    while (this.diagonalCheck(x, y, genLetter));

                    this.currentField.field[x][y] = {
                        letter: genLetter,
                        isHidden: true
                    };
                } else if (ALPHABETLARGE.indexOf(letter) >= 1) {
                    this.currentField.field[x][y] = {
                        letter: letter,
                        isFirst: true
                    };
                } else {
                    this.currentField.field[x][y] = {
                        letter: letter
                    };
                }
            }
        }
    }

    diagonalCheck(x, y, letter) {
        let field = this.currentField.field;

        if ((!field[x - 1] || !field[x - 1][y - 1] || field[x - 1][y - 1] != letter) &&
            (!field[x + 1] || !field[x + 1][y + 1] || field[x + 1][y + 1] != letter) &&
            (!field[x - 1] || !field[x - 1][y + 1] || field[x - 1][y + 1] != letter) &&
            (!field[x + 1] || !field[x + 1][y - 1] || field[x + 1][y - 1] != letter))
            return false;

        return true;
    }

    attachSockets() {
        app.socket.on('wordGuessed', data => {
            if (data.userID != app.userID) {
                let tempColor = this.canSelect ? this.color : this.genColor(); // don't gen new color when user is selecting a word

                this.wordsRemaining--;
                this.currentField.answers[data.foundIndex] = '';
                this.score.opponent = data.score;
                if (data.finishRound)
                    this.finishRound();

                data.wordCoordinates.forEach(cell => {
                    let row = document.querySelector('ion-nav').lastChild.querySelectorAll('.field-row')[cell[0]-1],
                        el = row.querySelectorAll('.field-cell')[cell[1]-1]; // ugly hacks time, sorry

                    this.selectCell(el, tempColor);
                })
            }
        });

        app.socket.on('disconnect', data => {
            if (data.userID != app.userID) {
                this.nav.push(NextRound, {
                    round: ++this.round,
                    score: this.score,
                    serverData: this.serverData,
                    isMultiplayer: this.isMultiplayer,
                    win: true
                });
            }
        });
    }

    genColor() {
        let r = (Math.round(Math.random() * 256)),
            g = (Math.round(Math.random() * 256)),
            b = (Math.round(Math.random() * 256));

        return `rgba(${r}, ${g}, ${b}, .5)`;
    }

    selectCell(el, color = this.color) {
        if (el.style.background)
            el.insertAdjacentHTML('afterbegin', '<div class="color-mix" style="background: ' + color + '"></div>');
        else
            el.style.background = color;
    }

    deselectCell(el) {
        if (el.querySelector('.color-mix'))
            el.querySelector('.color-mix').remove();
        else
            el.style.background = '';

        el.classList.remove('guessing');
    }

    startRound() {
        this.color = this.genColor();
        this.word = '';
        this.wordCoordinates = [];
        this.time = 30;

        this.interval = window.setInterval(() => {
            this.time--;
            if (this.time == 2)
                this.finishRound()
        }, 1000);

        this.timeoutCapitalize = window.setTimeout(() => {
            this.reward = 2;
            Array.prototype.forEach.call(document.querySelectorAll('.uncapitalized'), el => {
                el.classList.remove('uncapitalized')
            })
        }, 10000);

        this.timeoutHide = window.setTimeout(() => {
            this.reward = 1;
            Array.prototype.forEach.call(document.querySelectorAll('.marked'), el => {
                el.classList.add('hidden')
            })
        }, 20000);
    }

    finishRound() {
        if (!this.finishLock) {
            this.finishLock = true;
            window.setTimeout(() => {
                window.clearTimeout(this.timeout);
                window.clearInterval(this.interval);

                this.nav.push(NextRound, {
                    round: ++this.round,
                    score: this.score,
                    serverData: this.serverData,
                    isMultiplayer: this.isMultiplayer
                }, {
                    shouldCache: false
                });
            }, 2000);
        }
    }

    start() {
        this.canSelect = true;
        this.color = this.genColor();
        this.word = '';
        this.wordCoordinates = [];
    }

    end() {
        let foundIndex = this.currentField.answers.indexOf(this.word);
        this.canSelect = false;

        if (foundIndex > -1 && this.word.length > 0) {
            this.score.me += this.reward;
            this.wordsRemaining--;
            this.currentField.answers[foundIndex] = ''; // don't guess the same word again

            if (this.isMultiplayer) {
                app.socket.emit('wordGuessed', {
                    userID: app.userID,
                    score: this.score.me,
                    wordCoordinates: this.wordCoordinates,
                    foundIndex: foundIndex,
                    finishRound: !this.wordsRemaining
                });
            }

            if (!this.wordsRemaining)
                this.finishRound();

            Array.prototype.forEach.call(document.querySelectorAll('.guessing'), el => el.classList.remove('guessing'))
        } else
            Array.prototype.forEach.call(document.querySelectorAll('.guessing'), el => this.deselectCell(el));
    }

    move($event) { // BUG: cells with mixed color are almost unselectable
        var el;

        if ($event.type != 'mousemove') // if mobile
            el = document.elementFromPoint($event.changedTouches[0].pageX, $event.changedTouches[0].pageY);
        else // if desktop
            el = $event.target;

        if (this.canSelect && el.classList && el.classList.contains('field-cell')) {
            var rows = Array.prototype.slice.call( el.parentNode.parentNode.children ),
                cells = Array.prototype.slice.call( el.parentNode.children ),
                last = [rows.indexOf( el.parentNode ), cells.indexOf( el )];

            if (this.wordCoordinates.length)
                var prev = this.wordCoordinates[this.wordCoordinates.length-1];

            if (this.wordCoordinates.length == 0 || Math.abs(last[0] - prev[0]) + Math.abs(last[1] - prev[1]) == 1) {
                if (!el.classList.contains('guessing') && !el.classList.contains('marked')) {
                    el.classList.add('guessing');
                    this.wordCoordinates.push(last);
                    this.word += el.textContent;
                    this.selectCell(el);
                } else if (this.wordCoordinates.length) {
                    var prevElement = this.wordCoordinates[this.wordCoordinates.length-2];
                    if (el == rows[prevElement[0]].children[prevElement[1]]) {
                        var lastElement = this.wordCoordinates[this.wordCoordinates.length-1],
                            node = rows[lastElement[0]].children[lastElement[1]];

                        this.deselectCell(node);
                        this.word = this.word.slice(0, -1); // remove last char
                        this.wordCoordinates[this.wordCoordinates.length-1] = undefined;
                        this.wordCoordinates.length-=1;
                    }
                }
            }
        }
    }
}