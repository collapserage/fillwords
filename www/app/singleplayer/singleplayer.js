import {Page, NavController} from 'ionic/ionic';
import {Loader} from '../loader/loader';

@Page({
    templateUrl: 'app/singleplayer/singleplayer.html'
})

export class Singleplayer {
    constructor(nav: NavController) {
        this.nav = nav
    }

    loader() {
        this.nav.push(Loader)
    }
}