import {Page, NavController} from 'ionic/ionic';
import {Singleplayer} from '../singleplayer/singleplayer';
import {Multiplayer} from '../multiplayer/multiplayer';
import {app} from '../app';

@Page({
    templateUrl: 'app/menu/menu.html'
})

export class Menu {
    constructor(nav: NavController) {
        this.nav = nav
    }

    playSingleplayer() {
        this.nav.push(Singleplayer)
    }

    playMultiplayer() {
        this.nav.push(Multiplayer)
    }

    showAchievments() {
        //this.nav.push(Stats)
    }

    onPageWillUnload() {
        app.socket.emit('disconnect', {
            userID: app.userID
        });
    }
}