// let allStatsData = [];

let changDFviewArr = [ "sum", "count", "avg", "fpl" ];

let changDFviewIdx = 0;

let myFPLTeamIds = [];

let FPLballers = [];

let fixtureArray = [];

let linearScale = d3.scaleLinear()
  .domain([1000, 1400])
  .range([ '#FFFF33', '#FF0033' ]);


let gamesOverview = {
		fixedColumns: 3,
		finishedRounds: 28,
		currentRnd: 29,
		evWndw: { 'direction': 1 , 'start': 30, 'rounds': 9, 'end': 38 },
		locks: [ false, false, false ],
		locked: false,
		dfDisplay: {
			containerViz: 	false,
			strengthsViz: 	true,
			strengthsVizA: 	true,
			strengthsVizH: 	true
		},
		dfSource: {
			user: false,
			loaded:[ false, false ] 	/* 	DF data available (from FPL constants FPLTeamsFull /fixtures/teams or user) */
		},
		showSttng: true ,
		showDdln: false ,
		hasPP: true ,		
		showPP: false ,
		showRP: false,
		postponedGameIds: [] ,
		postponedGames: [] ,
		replannedGamesIds: [] ,
		replannedGames: [] ,
		iBreaks:[] ,
		iBreaksShow: false ,
		selectedTeamId: 12 ,
		sort: 1 ,
		fontSize: 12
}


getEventWndwStart 	= ()=>{ return parseInt( gamesOverview.evWndw['start'] ) ; 	} 
getRndsToShow 		= ()=>{ return parseInt( gamesOverview.evWndw['rounds'] ) ;	} 
getEventWndwEnd  	= ()=>{ return parseInt( gamesOverview.evWndw['end'] ) ; 	} 
hasUserStore = ()=>{ return ( localStorage.length > 0 ) ; }


setUserDF = ()=>{
	// console.log("saving user df. current user store exists?", hasUserStore() );
	if( hasUserStore() ){ localStorage.clear(); }

	let hdfArr = [] ;
	let adfArr = [] ;
	let h_df = $("#df_home > td[df]").get() ;
	let a_df = $("#df_away > td[df]").get() ;
	
	if( h_df.length == a_df.length ){

		$.each(
			h_df,
			function (i,t) {
				// console.log("h_df", i, "\tt\t", t );
				hdfArr.push({ 
						'tmid': parseInt( $(t).attr('tmId')) ,
						'h': parseInt( $(t).attr('df') ) 			
				});
			}
		);

		$.each(
			a_df,
			function (i,t) {
				// console.log("a_df", i, "\tt\t", t );
				adfArr.push({ 
						'tmid': parseInt( $(t).attr('tmId')) ,
						'a': parseInt( $(t).attr('df') ) 			
				});
			}
		);

	}else{
		console.log("something went wrong !") ;
	}

	localStorage.usrHdf = JSON.stringify( hdfArr ) ;
	localStorage.usrAdf = JSON.stringify( adfArr ) ;
	/* Now add the changed values to the FPLTeamsFull[team]['usrDF'] */
	loadUserDF() ;
}


delUserDF = ()=>{
	console.log("delUserDF") ;
	localStorage.clear();
}


loadUserDF = ()=>{
	/* Load values of the localstorage arrays into the FPLTeamsFull[team]['usrDF'] */
	let storedH = [] ; 
	let storedA = [] ; 

	if( hasUserStore() ){ 
		storedH = JSON.parse( localStorage.usrHdf ) ;
		storedA = JSON.parse( localStorage.usrAdf ) ;
		// console.log("loadUserDF: localStorage exists. 'H' =", storedH.length , "'A' =", storedA.length ) ;		
		
		// if( storedH.length !=20 ){ setUserDF() ;}

	}else{
		console.log("loadUserDF: localStorage doesnt exist.") ;
		setUserDF() ;
	}


	if( storedH.length == 20 ){

		for(let t=0; t < storedH.length; t++){
			FPLTeamsFull[t+1]['usrDF'][t] = [ storedH[t]['h'], storedA[t]['a'] ] ;
			/* console.log( "loadUserDF [t(+1)] =", FPLTeamsFull[t+1].shortNm , " gets df[", FPLTeamsFull[t+1]['usrDF'][t] ); */
		}

		gamesOverview.dfSource['loaded'][1] = true ;
		setIndicator("usr-df-Ldd-idc", "green") ;
		setIndicator("epl-df-Ldd-idc", "red") ;		
	}

}


clearIndicator = (indctr)=>{
	$.each(
		[ "greenLight", "orangeLight", "redLight" ],
		function(i,c){ $( "#"+ indctr ).removeClass(c); }
	);
}


setIndicator = (indctr,color)=>{
	clearIndicator(indctr);
	$( "#"+ indctr ).addClass( color+"Light" ) ;
}


resetIndics = ()=>{
	$.each(
		[ "fxtrsLdd-idc", "ppsLdd-idc", "epl-df-Ldd-idc", "usr-df-Ldd-idc", "epl-ha-Ldd-idc", "df-Ldd-idc" ],
		function(idc){ 		
			setIndicator(idc, "orange") ;
		}
	);
}


let FPLTeamsFull = [
	{       shortNm: "NPL",
		id: 0,
		fplDF: [ 1, 1 ] , 	/* [HOME,AWAY] */
		usrDF: [ 1, 1 ] , 	/* [HOME,AWAY] */
		ownDFhis: [] ,		/* from fixtures */
		oppDFhis: [] , 		/* from fixtures */
		longNm: "Not-a-PL-team",
		altNm: "placeholder",
		players: [],
		strength: [
			{ 'loc':"H", 'overall': 0, 'attack': 0, 'defence': 0 },
			{ 'loc':"A", 'overall': 0, 'attack': 0, 'defence': 0 }
		],
		ppgames: []
	},
	{       shortNm: "ARS",
		id: 1,
		fplDF: [ 4, 4 ] , 	/* [HOME,AWAY] */
		usrDF: [ 4, 4 ] , 	/* [HOME,AWAY] */
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0 ] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0 ] ,// from events
		longNm: "Arsenal",
		altNm: "Gunners",
		players: [],
		strength: [
			{ 'loc':"H", 'overall': 0, 'attack': 0, 'defence': 0 },
			{ 'loc':"A", 'overall': 0, 'attack': 0, 'defence': 0 }
		],
		ppgames: []
	},
	{       shortNm: "AVL",
		id: 2,
		fplDF: [ 2, 2 ] , 	/* [HOME,AWAY] */
		usrDF: [ 2, 2 ] , 	/* [HOME,AWAY] */
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,// from events
		longNm: "Aston Villa",
		altNm: "Villains",
		players: [],
		strength: [
			{ 'loc': "H", 'overall': 0, 'attack': 0, 'defence': 0 },
			{ 'loc': "A", 'overall': 0, 'attack': 0, 'defence': 0 }
		],
		ppgames: []
	},
	{       shortNm: "BOU",
		id: 3,
		fplDF: [ 3, 2 ] , 	/* [HOME,AWAY] */
		usrDF: [ 3, 2 ] , 	/* [HOME,AWAY] */
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,// from events
		longNm: "Bournemouth",
		altNm: "Cherries",
		players: [],
		strength: [
			{ 'loc': "H", 'overall': 0, 'attack': 0, 'defence': 0 },
			{ 'loc': "A", 'overall': 0, 'attack': 0, 'defence': 0 }
		],
		ppgames: []
	},
	{       shortNm: "BRE",
		id: 4,
		fplDF: [ 3, 2 ] , 	/* [HOME,AWAY] */
		usrDF: [ 3, 2 ] , 	/* [HOME,AWAY] */
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,// from events
		longNm: "Brentford",
		altNm: "Bees",
		players: [],
		strength: [
			{ 'loc': "H", 'overall': 0, 'attack': 0, 'defence': 0 },
			{ 'loc': "A", 'overall': 0, 'attack': 0, 'defence': 0 }
		],
		ppgames: []
	},
	{       shortNm: "BHA",
		id: 5,
		fplDF: [ 3, 3 ] , 	/* [HOME,AWAY] */
		usrDF: [ 3, 3 ] , 	/* [HOME,AWAY] */
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,// from events
		longNm: "Brighton",
		altNm: "Seagulls",
		players: [],
		strength: [
			{ 'loc': "H", 'overall': 0, 'attack': 0, 'defence': 0 },
			{ 'loc': "A", 'overall': 0, 'attack': 0, 'defence': 0 }
		],
		ppgames: []
	},
	{       shortNm: "CHE",
		id: 6,
		fplDF: [ 4, 4 ] , 	/* [HOME,AWAY] */
		usrDF: [ 4, 3 ] , 	/* [HOME,AWAY] */
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,// from events
		longNm: "Chelsea",
		altNm: "Blues",
		players: [],
		strength: [
			{ 'loc': "H", 'overall': 0, 'attack': 0, 'defence': 0 },
			{ 'loc': "A", 'overall': 0, 'attack': 0, 'defence': 0 }
		],
		ppgames: []
	},
	{       shortNm: "CRY",
		id: 7,
		fplDF: [ 2, 2 ] , 	/* [HOME,AWAY] */
		usrDF: [ 2, 2 ] , 	/* [HOME,AWAY] */
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,// from events
		longNm: "Crystal Palace",
		altNm: "Eagles",
		players: [],
		strength: [
			{ 'loc': "H", 'overall': 0, 'attack': 0, 'defence': 0 },
			{ 'loc': "A", 'overall': 0, 'attack': 0, 'defence': 0 }
		],
		ppgames: []
	},
	{       shortNm: "EVE",
		id: 8,
		fplDF: [ 3, 2 ] , 	/* [HOME,AWAY] */
		usrDF: [ 2, 2 ] , 	/* [HOME,AWAY] */
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,// from events
		longNm: "Everton",
		altNm: "Toffees",
		players: [],
		strength: [
			{ 'loc': "H", 'overall': 0, 'attack': 0, 'defence': 0 },
			{ 'loc': "A", 'overall': 0, 'attack': 0, 'defence': 0 }
		],
		ppgames: []
	},
	{       shortNm: "FUL",
		id: 9,
		fplDF: [ 3, 2 ] , 	/* [HOME,AWAY] */
		usrDF: [ 3, 2 ] , 	/* [HOME,AWAY] */
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,// from events
		longNm: "Fulham",
		altNm: "Cottagers",
		players: [],
		strength: [
			{ 'loc': "H", 'overall': 0, 'attack': 0, 'defence': 0 },
			{ 'loc': "A", 'overall': 0, 'attack': 0, 'defence': 0 }
		],
		ppgames: []
	},
	{       shortNm: "LEI",
		id: 10,
		fplDF: [ 3, 2 ] , 	/* [HOME,AWAY] */
		usrDF: [ 3, 2 ] , 	/* [HOME,AWAY] */
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,// from events
		longNm: "Leicester",
		altNm: "Foxes",
		players: [],
		strength: [
			{ 'loc': "H", 'overall': 0, 'attack': 0, 'defence': 0 },
			{ 'loc': "A", 'overall': 0, 'attack': 0, 'defence': 0 }
		],
		ppgames: []
	},
	{       shortNm: "LEE",
		id: 11,
		fplDF: [ 3, 2 ] , 	/* [HOME,AWAY] */
		usrDF: [ 3, 2 ] , 	/* [HOME,AWAY] */
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,// from events
		longNm: "Leeds",
		altNm: "Peacocks",
		players: [],
		strength: [
			{ 'loc': "H", 'overall': 0, 'attack': 0, 'defence': 0 },
			{ 'loc': "A", 'overall': 0, 'attack': 0, 'defence': 0 }
		],
		ppgames: []
	},
	{       shortNm: "LIV",
		id: 12,
		fplDF: [ 4, 4 ] , 	/* [HOME,AWAY] */
		usrDF: [ 5, 4 ] , 	/* [HOME,AWAY] */
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,// from events
		longNm: "Liverpool",
		altNm: "Reds",
		players: [],
		strength: [
			{ 'loc': "H", 'overall': 0, 'attack': 0, 'defence': 0 },
			{ 'loc': "A", 'overall': 0, 'attack': 0, 'defence': 0 }
		],
		ppgames: []
	},
	{       shortNm: "MCI",
		id: 13,
		fplDF: [ 5, 4 ] , 	/* [HOME,AWAY] */
		usrDF: [ 5, 4 ] , 	/* [HOME,AWAY] */
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,// from events
		longNm: "Man city",
		altNm: "Citizens",
		players: [],
		strength: [
			{ 'loc': "H", 'overall': 0, 'attack': 0, 'defence': 0 },
			{ 'loc': "A", 'overall': 0, 'attack': 0, 'defence': 0 }
		],
		ppgames: []
	},
	{       shortNm: "MUN",
		id: 14,
		fplDF: [ 4, 4 ] , 	/* [HOME,AWAY] */
		usrDF: [ 4, 4 ] , 	/* [HOME,AWAY] */
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,// from events
		longNm: "Man utd",
		altNm: "Red Devils",
		players: [],
		strength: [
			{ 'loc': "H", 'overall': 0, 'attack': 0, 'defence': 0 },
			{ 'loc': "A", 'overall': 0, 'attack': 0, 'defence': 0 }
		],
		ppgames: []
	},
	{       shortNm: "NEW",
		id: 15,
		fplDF: [ 4, 4 ] , 	/* [HOME,AWAY] */
		usrDF: [ 4, 4 ] , 	/* [HOME,AWAY] */
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,// from events
		longNm: "Newcastle",
		altNm: "Magpies",
		players: [],
		strength: [
			{ 'loc': "H", 'overall': 0, 'attack': 0, 'defence': 0 },
			{ 'loc': "A", 'overall': 0, 'attack': 0, 'defence': 0 }
		],
		ppgames: []
	},
	{       shortNm: "NFO",
		id: 16,
		fplDF: [ 2, 2 ] , 	/* [HOME,AWAY] */
		usrDF: [ 2, 2 ] , 	/* [HOME,AWAY] */
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,// from events
		longNm: "Nott-m Forest",
		altNm: "Forest",
		players: [],
		strength: [
			{ 'loc': "H", 'overall': 0, 'attack': 0, 'defence': 0 },
			{ 'loc': "A", 'overall': 0, 'attack': 0, 'defence': 0 }
		],
		ppgames: []
	},
	{       shortNm: "SOU",
		id: 17,
		fplDF: [ 2, 2 ] , 	/* [HOME,AWAY] */
		usrDF: [ 2, 2 ] , 	/* [HOME,AWAY] */
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,// from events
		longNm: "Southampton",
		altNm: "Saints",
		players: [],
		strength: [
			{ 'loc': "H", 'overall': 0, 'attack': 0, 'defence': 0 },
			{ 'loc': "A", 'overall': 0, 'attack': 0, 'defence': 0 }
		],
		ppgames: []
	},
	{       shortNm: "TOT",
		id: 18,
		fplDF: [ 4, 4 ] , 	/* [HOME,AWAY] */
		usrDF: [ 4, 4 ] , 	/* [HOME,AWAY] */
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,// from events
		longNm: "Tottenham",
		altNm: "Spurs",
		players: [],
		strength: [
			{ 'loc': "H", 'overall': 0, 'attack': 0, 'defence': 0 },
			{ 'loc': "A", 'overall': 0, 'attack': 0, 'defence': 0 }
		],
		ppgames: []
	},
	{       shortNm: "WHU",
		id: 19,
		fplDF: [ 3, 3 ] , 	/* [HOME,AWAY] */
		usrDF: [ 3, 3 ] , 	/* [HOME,AWAY] */
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,// from events
		longNm: "West Ham",
		altNm: "Hammers",
		players: [],
		strength: [
			{ 'loc': "H", 'overall': 0, 'attack': 0, 'defence': 0 },
			{ 'loc': "A", 'overall': 0, 'attack': 0, 'defence': 0 }
		],
		ppgames: []
	},
	{       shortNm: "WOL",
		id: 20,
		fplDF: [ 3, 2 ] , 	/* [HOME,AWAY] */
		usrDF: [ 3, 2 ] , 	/* [HOME,AWAY] */
		usrDF:[0,0],
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,// from events
		longNm: "Wanderers",
		altNm: "Wolves",
		players: [],
		strength: [
			{ 'loc': "H", 'overall': 0, 'attack': 0, 'defence': 0 },
			{ 'loc': "A", 'overall': 0, 'attack': 0, 'defence': 0 }
		],
		ppgames: []
	}
];


let celebTeams = [ 
	{	
		"tmId": 3510574,
		"tmNn": "DeporStevoLaCrosmuña", 
		"clbNm": "Steve Crossman",
		"url": "https://fantasy.premierleague.com/api/entry/3510574/"
	}, 
	{
		"tmId": 30954,
		"tmNn": "The little fellas**", 
		"clbNm": "Alistair Bruce-Ball",
		"url": "https://fantasy.premierleague.com/api/entry/30954/"
	},

	{
		"tmId": 0 ,
		"tmNn": "" ,
		"clbNm": "" ,
		"url": ""
	},
	{
		"tmId": 0 ,
		"tmNn": "" ,
		"clbNm": "" ,
		"url": ""
	},
	{
		"tmId": 0 ,
		"tmNn": "" ,
		"clbNm": "" ,
		"url": ""
	},
	{
		"tmId": 0 ,
		"tmNn": "" ,
		"clbNm": "" ,
		"url": ""
	}
];


let celebLeagues = [
	{
		'lgId': 7719,
		'lgNm': "Fantasy 606 select",
		'lgURL': "https://fantasy.premierleague.com/leagues/7719/standings/c"
	},
	{
		'lgId': 535227,
		'lgNm': "Fantasy 606 h2h Div 1",
		'lgURL': "https://fantasy.premierleague.com/leagues/535227/new-entries/h"
	}

];


console.log(
	"FDL constants\n",
	"changDFviewArr", changDFviewArr.length,
	"myFPLTeamIds", myFPLTeamIds.length,
	"FPLTeamsFull", FPLTeamsFull.length,
	"celebTeams", celebTeams.length,
	"celebLeagues", celebLeagues.length
);


/*	
	"allStatsData", allStatsData.length, 
*/
