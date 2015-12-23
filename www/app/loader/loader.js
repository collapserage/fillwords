import {Page, NavController, NavParams} from 'ionic/ionic';
import {Game} from '../game/game';
import {Lobby} from '../lobby/lobby';
import {app} from '../app';
import {singleplayerData} from '../singleplayerData';

@Page({
    templateUrl: 'app/loader/loader.html'
})

export class Loader {
    constructor(nav: NavController, params: NavParams) {
        this.nav = nav;
        this.isMultiplayer = params.get('isMultiplayer') || false;
        this.message = this.isMultiplayer ? 'Поиск противника..' : 'Загрузка..';

        if (params.get('isMultiplayer')) {
            app.socket.emit('findEnemy', app.userID);
            app.socket.on('enemyFound', object => {
                this.timeout = window.setTimeout(() => {
                    this.nav.push(Lobby, {
                        serverData: object
                    })
                }, 1000)
            })
        } else {
            this.timeout = window.setTimeout(() => {
                this.nav.push(Game, {
                    serverData: singleplayerData.array[Math.floor(Math.random() * 100)]
                })
            }, 1000)
        }
    }

    onPageDidLeave() {
        window.clearTimeout(this.timeout)
    }
}