import {App, IonicApp, Platform, Popup} from 'ionic/ionic';
import {Menu} from './menu/menu';
import {Game} from './game/game';
import {NextRound} from './nextRound/nextRound';

/*

    TODO
    1. Use multiple dictionaries for different themes
    2. Login & leaderboards & achievments
    3. BUG: time not updating constantly in multiplayer
    4. BUG: quitting in NextRound screen should end round too
    5. BUG: can't leave on Loader screen

 */

export var app = {
    userID: Math.round(Math.random() * 1000),
    socket: io('http://collapsed.space:1337')
};

@App({
    templateUrl: 'app/app.html'
})

export class MyApp {
    constructor(app: IonicApp, platform: Platform, popup: Popup) {
        this.app = app;
        this.popup = popup;
        this.rootPage = Menu;
        this.platform = platform;

        this.platform.ready().then(() => {
            setTimeout(() => document.body.classList.add('loaded'), 300);
            document.addEventListener("keyup", e => this.backButtonHandler(e)); // debug
            document.addEventListener("backbutton", e => this.backButtonHandler(e));
        });
    }

    backButtonHandler(e) {
        this.nav = this.app.getComponent('nav');

        if (!this.nav.isTransitioning()) {
            if (!this.nav.canGoBack()) {
                this.popup.confirm({
                    title: "Вы действительно хотите выйти?",
                    cancelText: "Нет",
                    okText: "Да"
                }).then(() => {
                    navigator.app.exitApp()
                });
            } else if (this.nav.last().componentType.name == 'Game' || this.nav.last().componentType.name == 'NextRound') { // bad check, replace later
                this.popup.confirm({
                    title: "Вы действительно хотите сдаться?",
                    template: "Вам будет засчитано поражение!",
                    cancelText: "Нет",
                    okText: "Да"
                }).then(() => {
                    this.nav.popToRoot()
                });
            } else if (this.nav.last().componentType.name != 'Loader' && this.nav.last().componentType.name != 'Lobby') {
                this.nav.pop();
            }
        }

        e.preventDefault();
    }
}
