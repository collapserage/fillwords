import {Page, NavController, NavParams} from 'ionic/ionic';
import {Game} from '../game/game';
import {Loader} from '../loader/loader';
import {app} from '../app';

@Page({
    templateUrl: 'app/nextRound/nextRound.html'
})

export class NextRound {
    constructor(nav: NavController, params: NavParams) {
        this.nav = nav;
        this.round = params.get('round');
        this.score = params.get('score');
        this.serverData = params.get('serverData');
        this.isMultiplayer = params.get('isMultiplayer');

        if (this.round < 4 && !params.get('win')) {
            this.timeout = window.setTimeout(() => {
                this.nav.push(Game, {
                    round: this.round,
                    score: this.score,
                    serverData: this.serverData,
                    isMultiplayer: this.isMultiplayer
                })
            }, 5000);
        } else {
            this.processWin();

            app.socket.emit('disconnect', {
                userID: app.userID
            });
        }

        if (this.isMultiplayer)
            this.attachSockets()
    }

    attachSockets() {
        app.socket.on('disconnect', data => {
            if (data.userID != app.userID) {
                this.processWin();
                window.clearTimeout(this.timeout)
            }
        });
    }

    processWin() {
        this.win = true;
        switch (true) {
            case (this.score.me < this.score.opponent):
                this.message = 'Вы проиграли!';
                break;
            case (this.score.me > this.score.opponent):
                this.message = 'Вы победили!';
                break;
            case (this.score.me == this.score.opponent):
                this.message = 'Ничья!';
        }
    }

    loader() {
        this.nav.push(Loader, {
            isMultiplayer: this.isMultiplayer
        })
    }

    menu() {
        this.nav.popToRoot()
    }

    onPageWillLeave() { // BUG: if win is true, do not show surrender message
        window.clearTimeout(this.timeout)
    }
}