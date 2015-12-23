import {Page} from 'ionic/ionic';

@Page({
  templateUrl: 'app/stats/stats.html'
})

export class Stats {
  constructor() {
	this.data = [
	  {
		name: "Kate",
		score: 9000
	  },
	  {
		name: "Random guy",
		score: 666
	  },
	  {
		name: "Loser",
		score: 50
	  }
	]
  }
}
