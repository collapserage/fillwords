import {Page, NavController, NavParams} from 'ionic/ionic';
import {Game} from '../game/game';

@Page({
  templateUrl: 'app/lobby/lobby.html'
})

export class Lobby {
    constructor(nav: NavController, params: NavParams) {
        this.nav = nav;
        this.timeout = window.setTimeout(() => {
            this.nav.push(Game, {
                isMultiplayer: true,
                serverData: params.get('serverData')
            })
        }, 5000);
    }

    onPageDidLeave() {
        window.clearTimeout(this.timeout)
    }
}
