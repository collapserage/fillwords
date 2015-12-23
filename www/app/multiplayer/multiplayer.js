import {Page, NavController} from 'ionic/ionic';
import {Loader} from '../loader/loader';
import {Stats} from '../stats/stats';

@Page({
    templateUrl: 'app/multiplayer/multiplayer.html'
})

export class Multiplayer {
    constructor(nav: NavController) {
        this.nav = nav;
    }

    play() {
        this.nav.push(Loader, {
            isMultiplayer: true
        })
    }

    showStats() {
        this.nav.push(Stats)
    }
}