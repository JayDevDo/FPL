// let allStatsData = [];

let changDFviewArr = [ "sum", "count", "avg", "fpl" ];

let changDFviewIdx = 0;

let myFPLTeamIds = [];

let FPLballers = [];

let fixtureArray = [];

let allStatsData = [];

let currentTeamTable = [] ;

let cupDataAll = {};
/* {
	'evtp-FAC': [],
	'evtp-EFL': [],
	'evtp-EHL': [],
	'evtp-EUL': [],
	'evtp-EOL': [],
	'evtp-UIB': []	
};

let linearScale = d3.scaleLinear()
  .domain( [1000, 1400] )
  .range( [ "#FFCCFF", "#CC00CC" ] );

*/
let linearScale = ( value )=>{
	let minValue = 1 ;
	let maxValue = 5 ;

	let startRGB = [ 255, 204, 255 ] ;
	let endRGB = [ 204, 0, 204 ] ;

	let clampedValue = Math.max( minValue, Math.min( maxValue, Number(value) ) ) ;
	let ratio = ( clampedValue - minValue ) / ( maxValue - minValue ) ;

	let red = Math.round( startRGB[0] + (( endRGB[0] - startRGB[0] ) * ratio) ) ;
	let green = Math.round( startRGB[1] + (( endRGB[1] - startRGB[1] ) * ratio) ) ;
	let blue = Math.round( startRGB[2] + (( endRGB[2] - startRGB[2] ) * ratio) ) ;

	return "rgb(" + red + ", " + green + ", " + blue + ")" ;
}
/*
[yellow-purple]
Dark: #861D46
Light: #FFFF33

[purple]
Dark: 	#CC00CC
Light: 	#FFCCFF
*/

let callIndexer = 0 ;
getCI = ()=>{ callIndexer++; return callIndexer.toString() ; }


let gamesOverview = {
		fixedColumns: 3,
		finishedRounds: 0,
		currentRnd: 1,
		evWndw: { 'direction': 1 , 'start': 1, 'rounds': 8, 'end': 8 },
		locks: [ false, false, false ],
		locked: false,
		dfDisplay: {
			containerViz: 	false,
			strengthsViz: 	false,
			strengthsVizA: 	false,
			strengthsVizH: 	false
		},
		dfSource: {
			user: false,
			loaded:[ false, false ] 	/* 	DF data available (from FPL constants FPLTeamsFull /fixtures/teams or user) */
		},
		showSttng: true,
		showDdln: true,
		hasPP: false,
		showPP: false,
		showRP: false,
		postponedGameIds: [],
		postponedGames: [],
		replannedGamesIds: [],
		replannedGames: [],
		iBreaks: [],
		iBreaksShow: true,
		evTypes: [ "evtp-EPL", "evtp-UIB"  ], 
		/*  
			"evtp-FAC",
			"evtp-EHL", 
			"evtp-EUL", 
			"evtp-EOL", 
			"evtp-EFL",
			"evtp-UIB"
		*/
		selectedTeamId: 14,
		teamFilter: [ true , true , true , true , true , true , true , true , true , true , true , true , true , true , true , true , true , true , true , true , true ],
		sort: 1 ,
		fontSize: 10
}

getEventWndwStart 	= ()=>{ return parseInt( gamesOverview.evWndw['start'] ) ; 	}
getRndsToShow 		= ()=>{ return parseInt( gamesOverview.evWndw['rounds'] ) ;	}
getEventWndwEnd  	= ()=>{ return parseInt( gamesOverview.evWndw['end'] ) ; 	}

getFxtrData = (fxtrId)=>{
	let retObj = { 'msg': "fxtrId not found !" } ;

	for( let fixture of fixtureArray ){
		if( fixture.id == fxtrId ){
			retObj = fixture ;
			break ;
		}
	}

	return retObj ;
}

midWeekHasCup = (gw)=>{
	let hasCup = ( gamesOverview.midWeeksUsed[gw].length > 0 );
	console.log(
		"CONSTANTS | start midWeekHasCup ", gw, 
		"length:",gamesOverview.midWeeksUsed[gw].length,
		"hasCup:", hasCup 
	);
}

hasUserStore = ()=>{
	let hasLS = false ;
	try{
		if( JSON.parse( localStorage.usrdf ) ){ hasLS = true; }else{ hasLS = false; }
		// console.log("hasUserStore: hasLS=", hasLS, JSON.parse( localStorage.usrdf ) ) ;
	}finally{
		return hasLS;
	}
}


setUserDF = ()=>{
	// Stores the current values in the DF container to localstorage and FPLTeamsFull
	// Then updates view by calling 'loadUserDF()'

	if( localStorage.usrdf ){ delUserDF() }

	let lclStrgArr = [] ;
	let h_df = $("#df_home > td[df]").get() ;
	let a_df = $("#df_away > td[df]").get() ;

	if( h_df.length == a_df.length ){

		$.each(
			h_df,
			(i,t)=>{
				FPLTeamsFull[
					parseInt( $( t ).attr( 'tmId' ) )].usrDF = [
						parseInt($( h_df[i] ).attr( 'df' )),
						parseInt($( a_df[i] ).attr( 'df' ))
					] ;
				lclStrgArr.push(
					{
						'tmid': parseInt( $( t ).attr( 'tmId' ) ),
						'h': parseInt( $( h_df[i] ).attr( 'df' ) ),
						'a': parseInt( $( a_df[i] ).attr( 'df' ) )
					}
				) ;
		}) ;

		gamesOverview.dfSource.user = true ;
		gamesOverview.dfSource.loaded[1] = true ;
		setIndicator( "usr-df-Ldd-idc", "green") ;
	}else{
		console.log("something went wrong !") ;
	}

	localStorage.usrdf = JSON.stringify( lclStrgArr ) ;
	// Apply the new values to the view
	loadUserDF() ;
}


delUserDF = ()=>{
	// console.log("delUserDF") ;
	localStorage.usrdf = JSON.stringify( [] );
}


loadUserDF = ()=>{
	// Load values from the localstorage arrays into FPLTeamsFull, DFcontainer and fixtures
	// localStorage.usrdf = JSON.stringify( lclStrgArr ) ;
	let storedH = [] ;
	let storedA = [] ;

	if( localStorage.usrdf ){

		// console.log( "loadUserDF: localStorage exists. =", JSON.parse( localStorage.usrdf ) ) ;
		// console.log( "loadUserDF: localStorage exists. =", JSON.parse( localStorage.usrdf ) ) ;
		storedH = JSON.parse( localStorage.usrdf ) ;

		if( storedH.length != 20 ){ setUserDF() ; }

	}else{
		console.log("loadUserDF: localStorage doesnt exist.") ;
		setUserDF() ;
	}

	if( storedH.length == 20 ){

		for( let t = 0; t < storedH.length; t++){

			// Get the values from the localstore
			// Update DF container attribs + text
			// Update fixture DF's
			// Update FPLTeamsFull[x]['usrDF'] = [homevalue, awayvalue ]
			let teamHval = parseInt( storedH[t]['h'] ) ;
			let teamAval = parseInt( storedH[t]['a'] ) ;

			// console.log("loadUserDF: ", FPLTeamsFull[t+1].shortNm, "newDF H: : ",  teamHval, "newDF A: : ",  teamAval ) ;

			FPLTeamsFull[t+1]['usrDF'] = [ teamHval, teamAval ] ;

			$("#df_home td[tmid="+ (t+1) + "]").attr( "df", teamHval) ;
			$("#df_home td[tmid="+ (t+1) + "]").text( teamHval.toString() ) ;

			let hteamOpps = $(".fxtrspan[teamid_h="+ (t+1) + "][loc='A']").get() ;
			// console.log("hteamOpps=", hteamOpps.length , teamHval.toString() ) ;
			$.each(
				hteamOpps,
				(index, oppFxtr)=>{
					let hText = [ FPLTeamsFull[t+1].shortNm, " A (", teamHval.toString(), ")" ].join("") ;
					$(oppFxtr).addClass("customDF") ;
					$(oppFxtr).text( hText ) ;
					$(oppFxtr).attr( "df", teamHval) ;
			}) ;


			$("#df_away td[tmid="+ (t+1) + "]").attr( "df", teamAval) ;
			$("#df_away td[tmid="+ (t+1) + "]").text( teamAval.toString() ) ;

			let ateamOpps = $(".fxtrspan[teamid_a="+ (t+1) + "][loc='H']").get() ;
			// console.log("ateamOpps=", ateamOpps.length ) ;
			$.each(
				ateamOpps,
				(index, oppFxtr)=>{
					let aText = [ FPLTeamsFull[t+1].shortNm, " H (", teamAval.toString(), ")" ].join("") ;
					$(oppFxtr).addClass("customDF") ;
					$(oppFxtr).text( aText ) ;
					$(oppFxtr).attr( "df", teamAval) ;
			}) ;

		}

		gamesOverview.dfSource['loaded'][1] = true ;
		setIndicator("usr-df-Ldd-idc", "green") ;
		setIndicator("epl-df-Ldd-idc", "red") ;

	}

}

loadFPLDF = (gw=gamesOverview.currentRnd)=>{
	/*
		Load values from the CONSTANTS FPLTeamsFull[x]['fplDF'][ h, a ] situated below into the DFcontainer and fixtures.
		These are/were the values set by the developer of this at the start of the season.
		To load the most recent values, run update_FPLDF(Gameweek).

	*/
	console.log("loadFPLDF| gw:",gw )

	if( FPLTeamsFull.length == 21 ){

		for( let t = 1; t < FPLTeamsFull.length; t++){

			// Update DF container attribs + text
			// Update fixture DF's
			// Update FPLTeamsFull[x]['usrDF'] = [homevalue, awayvalue ]
			teamHval = parseInt( FPLTeamsFull[t]['fplDF'][0] ) ;
			teamAval = parseInt( FPLTeamsFull[t]['fplDF'][1] ) ;

			$("#df_home td[tmid="+ (t) + "]").attr( "df", teamHval) ;
			$("#df_home td[tmid="+ (t) + "]").text( teamHval.toString() ) ;

			let hteamOpps = $(".fxtrspan[teamid_h="+ t + "][loc='A']").get() ;
			$.each(
				hteamOpps,
				(index, oppFxtr)=>{
					let hText = [ FPLTeamsFull[t].shortNm, " A (", teamHval.toString(), ")" ].join("") ;
					$(oppFxtr).removeClass("customDF") ;
					$(oppFxtr).text( hText ) ;
					$(oppFxtr).attr( "df", teamHval) ;
			}) ;


			$("#df_away td[tmid="+ t + "]").attr( "df", teamAval ) ;
			$("#df_away td[tmid="+ t + "]").text( teamAval.toString() ) ;

			let ateamOpps = $(".fxtrspan[teamid_a="+ t + "][loc='H']").get() ;
			// console.log("ateamOpps=", ateamOpps.length ) ;
			$.each(
				ateamOpps,
				(index, oppFxtr)=>{
					let aText = [ FPLTeamsFull[t].shortNm, " H (", teamAval.toString(), ")" ].join("") ;
					$(oppFxtr).removeClass("customDF") ;
					$(oppFxtr).text( aText ) ;
					$(oppFxtr).attr( "df", teamAval) ;
			}) ;

		}

		gamesOverview.dfSource['user'] = false ;
		setIndicator("usr-df-Ldd-idc", "red" ) ;
		setIndicator("epl-df-Ldd-idc", "green" ) ;
	}
}

/*
	update_FPLDF = (gw)=>{
		//This function changes the FPLDF values in FPLTeamsFull, based on the values in static.events.
		//The function loops through the gw events in reverse, starting from variable 'gw' (gameweek).
		//It stops as soon as all teams have been attributed a home- and away DF.
		//Then it loops through all teams applying the new values.
		let newFPL_DF_H = [ 0,
												0, 0, 0, 0, 0,
												0, 0, 0, 0, 0,
												0, 0, 0, 0, 0,
												0, 0, 0, 0, 5
											] ;
		let newFPL_DF_A = [ 0,
												0, 0, 0, 0, 0,
												0, 0, 0, 0, 0,
												0, 0, 0, 0, 0,
												0, 0, 0, 0, 5
											] ;

		let staticEventsExists = false ;

		const teamDone 	= ( tmId )=>{ return ( (newFPL_DF_H[tmId] != 0) && (newFPL_DF_A[tmId] != 0) ) } ;
		const allDone 	= ()=>{  return (( newFPL_DF_H.lastIndexOf(0) == 0 ) && ( newFPL_DF_A.lastIndexOf(0) == 0 )) } ;

		const updateTm 	= ( tmId, loc, df )=>{
			if( loc == "H" ){
				newFPL_DF_H[tmId] = df ;
			}else{
				newFPL_DF_A[tmId] = df ;
			}
		}

		const setAll = (df)=>{
			for( let t=1; t<21; t++ ){
				newFPL_DF_H[t] = df;
				newFPL_DF_A[t] = df;
			}
		}

		console.log(
			getCI(),
			"update_FPLDF gw: ", gw ,
			"\nlen(newFPL_DF_H): ", newFPL_DF_H.length ,
			"\tlen(newFPL_DF_A): ", newFPL_DF_A.length ,
			"\ntest allDone (should be false): ", allDone() ,
		//	"\nH lastIdx: ", newFPL_DF_H.lastIndexOf(0), "\tA lastIdx: ",  newFPL_DF_A.lastIndexOf(0),
			"\ttest teamDone(1)(should be false): ", teamDone(1) ,
			"\ttest teamDone(0)(should be false): ", teamDone(0) ,
			"\ttest teamDone(20)(should be true): ", teamDone(20) ,
			"\ntest settingAll(3)", setAll(3) ,
		//	"\nH lastIdx: ", newFPL_DF_H.lastIndexOf(0), "\tA lastIdx: ",  newFPL_DF_A.lastIndexOf(0),
			"\ntest allDone(should be true): ", allDone() ,
			"\ntest teamDone(0)(should be false): ", teamDone(0)
		) ;
		let tst_allDone = false;
		let tst_tmDone 	= false;

		while( !tst_allDone ){
			console.log("While-Loop for tst_allDone; still false -> ", tst_allDone ) ;

			while( !tst_tmDone ){
				console.log("While-Loop for tst_tmDone; still false -> ", tst_tmDone ) ;

				for(let tmId=1; tmId<21; tmId++){
					console.log("For-Loop for tmId<21; still true -> ", tmId ) ;

					for(let gwr = gw; gwr>0; gwr--){
						console.log("For-Loop (reverse) for gw>0; still true -> ", gwr ) ;

					}

				}

			}

		}

	}
*/

clearIndicator = (indctr)=>{
	$.each(
		[ "greenLight", "orangeLight", "redLight", "yellowLight" ],
		function(i,c){ $( "#"+ indctr ).removeClass(c); }
	);
}


setIndicator = (indctr,color)=>{
	clearIndicator(indctr);
	$( "#"+ indctr ).addClass( color+"Light" ) ;
}


resetIndics = ()=>{
	$.each(
		[
			"fxtrsLdd-idc", 	// 	Indicator for getFixtureData()
			"ppsLdd-idc", 		// 	Indicator for getPostponedData() / buidPPContainer()
			"epl-df-Ldd-idc", 	// 	epl-df-Ldd-idc 	Indicator for allPromise --> TEAM LOOP
			"usr-df-Ldd-idc", 	// 	usr-df-Ldd-idc 	Indicator for loadUserDF()
			"epl-ha-Ldd-idc", 	// 	epl-ha-Ldd-idc 	Indicator for allPromise --> TEAM LOOP
			"df-Ldd-idc" 		// 	df-Ldd-idc 		Indicator for allPromise --> FXTRS LOOP
		],
		function(idc){
			setIndicator(idc, "orange") ;
		}
	);
}


tmFilterReset = ()=>{
	gamesOverview.teamFilter =[ true , true , true , true , true , true , true , true , true , true , true , true , true , true , true , true , true , true , true , true , true ] ;
	$( "#slctdTeams" ).val( "a" ) ;
	let tmIndics = $("#eventTable > tr > div.tm-idc").get() ;

	$.each(
		tmIndics ,
		( index, indic )=>{
			console.log("tmFilterReset i:", index, "indic: ", indic ) ;
			$( indic ).addClass( "yellowLight" ) ;
		}

	) ;

}


exportGmsOvrvw = ()=>{
	return gamesOverview ;
}


exportFTbl = ()=>{
	return FPLTeamsFull;
}

openPPInfo = ( fxtrId )=>{

	let ppArray = gamesOverview.postponedGames ;
	let ppLink = "" ;

	for( let p=0; p<ppArray.length; p++ ){

		ppLink = ppArray[p].link ;

		if( parseInt( ppArray[p].ppid ) == parseInt( fxtrId ) ){
			console.log( "opening postponement info for fxtrId", fxtrId, "link:", ppLink  ) ;
 		}
	}
	window.open( ppLink , target="_blank" ) ;
}



let FPLTeamsFull = [
	{   shortNm: "NPL",
		id: 0,
		fplDF: [ 1, 1 ] , 	/* [HOME,AWAY] */
		usrDF: [ 1, 1 ] , 	/* [HOME,AWAY] */
		ownDFhis: [] ,		/* from fixtures */
		oppDFhis: [] , 		/* from fixtures */
		longNm: "Not-a-PL-team",
		altNm: "placeholder",
		manName: "noManager",
		players: [],
		strength: [
			{ 'loc':"H", 'overall': 0, 'attack': 0, 'defence': 0 },
			{ 'loc':"A", 'overall': 0, 'attack': 0, 'defence': 0 }
		],
		ppgames: []
	},
	{   shortNm: "ARS",
		id: 1,
		fplDF: [ 5, 4 ] , 	/* [HOME,AWAY] */
		usrDF: [ 5, 5 ] ,
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0 ] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0 ] ,
		longNm: "Arsenal",
		altNm: "Gunners",
		manName: "",
		players: [],
		strength: [
			{ 'loc':"H", 'overall': 0, 'attack': 0, 'defence': 0 },
			{ 'loc':"A", 'overall': 0, 'attack': 0, 'defence': 0 }
		],	
		ppgames: []
	},
	{   shortNm: "AVL",
		id: 2,
		fplDF: [ 4, 3 ] ,
		usrDF: [ 3, 2 ] ,
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		longNm: "Aston Villa",
		altNm: "Villains",
		manName: "",
		players: [],
		strength: [
			{ 'loc': "H", 'overall': 0, 'attack': 0, 'defence': 0 },
			{ 'loc': "A", 'overall': 0, 'attack': 0, 'defence': 0 }
		],
		ppgames: []
	},
	{   shortNm: "BOU",
		id: 3,
		fplDF: [ 3, 3 ] ,
		usrDF: [ 2, 2 ] ,
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		longNm: "Bournemouth",
		altNm: "Cherries",
		manName: "",
		players: [],
		strength: [
			{ 'loc': "H", 'overall': 0, 'attack': 0, 'defence': 0 },
			{ 'loc': "A", 'overall': 0, 'attack': 0, 'defence': 0 }
		],
		ppgames: []
	},
	{   shortNm: "BRE",
		id: 4,
		fplDF: [ 3, 3 ] ,
		usrDF: [ 2, 2 ] ,
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		longNm: "Brentford",
		altNm: "Bees",
		manName: "",
		players: [],
		strength: [
			{ 'loc': "H", 'overall': 0, 'attack': 0, 'defence': 0 },
			{ 'loc': "A", 'overall': 0, 'attack': 0, 'defence': 0 }
		],
		ppgames: []
	},
	{   shortNm: "BHA",
		id: 5,
		fplDF: [ 3, 2 ] ,
		usrDF: [ 2, 2 ] ,
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		longNm: "Brighton",
		altNm: "Seagulls",
		manName: "",
		players: [],
		strength: [
			{ 'loc': "H", 'overall': 0, 'attack': 0, 'defence': 0 },
			{ 'loc': "A", 'overall': 0, 'attack': 0, 'defence': 0 }
		],
		ppgames: []
	},
	{   shortNm: "CHE",
		id: 6,
		fplDF: [ 4, 4 ] ,
		usrDF: [ 4, 4 ] ,
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		longNm: "Chelsea",
		altNm: "Blues",
		manName: "",
		players: [],
		strength: [
			{ 'loc': "H", 'overall': 0, 'attack': 0, 'defence': 0 },
			{ 'loc': "A", 'overall': 0, 'attack': 0, 'defence': 0 }
		],
		ppgames: []
	},
	{   shortNm: "COV",
		id: 7,
		fplDF: [ 2, 2 ] ,
		usrDF: [ 1, 1 ] ,
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		longNm: "Coventry",
		altNm: "Coventry",
		manName: "",
		players: [],
		strength: [
			{ 'loc': "H", 'overall': 0, 'attack': 0, 'defence': 0 },
			{ 'loc': "A", 'overall': 0, 'attack': 0, 'defence': 0 }
		],
		ppgames: []
	},
	{   shortNm: "CRY",
		id: 8,
		fplDF: [ 3, 3 ] ,
		usrDF: [ 2, 2 ] ,
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		longNm: "Crystal Palace",
		altNm: "Eagles",
		manName: "",
		players: [],
		strength: [
			{ 'loc': "H", 'overall': 0, 'attack': 0, 'defence': 0 },
			{ 'loc': "A", 'overall': 0, 'attack': 0, 'defence': 0 }
		],
		ppgames: []
	},
	{   shortNm: "EVE",
		id: 9,
		fplDF: [ 3, 3 ] ,
		usrDF: [ 2, 2 ] ,
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		longNm: "Everton",
		altNm: "Toffees",
		manName: "",
		players: [],
		strength: [
			{ 'loc': "H", 'overall': 0, 'attack': 0, 'defence': 0 },
			{ 'loc': "A", 'overall': 0, 'attack': 0, 'defence': 0 }
		],
		ppgames: []
	},
	{   shortNm: "FUL",
		id: 10,
		fplDF: [ 3, 2 ] ,
		usrDF: [ 2, 2 ] ,
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		longNm: "Fulham",
		altNm: "Cottagers",
		manName: "",
		players: [],
		strength: [
			{ 'loc': "H", 'overall': 0, 'attack': 0, 'defence': 0 },
			{ 'loc': "A", 'overall': 0, 'attack': 0, 'defence': 0 }
		],
		ppgames: []
	},
	{   shortNm: "HUL",
		id: 11,
		fplDF: [ 2, 2 ] ,
		usrDF: [ 2, 2 ] ,
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		longNm: "Hull",
		altNm: "Hull",
		manName: "",
		players: [],
		strength: [
			{ 'loc': "H", 'overall': 0, 'attack': 0, 'defence': 0 },
			{ 'loc': "A", 'overall': 0, 'attack': 0, 'defence': 0 }
		],
		ppgames: []
	},
	{   shortNm: "IPS",
		id: 12,
		fplDF: [ 2, 2 ] ,
		usrDF: [ 2, 2 ] ,
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		longNm: "Ipswich",
		altNm: "Ipswich",
		manName: "",
		players: [],
		strength: [
			{ 'loc': "H", 'overall': 0, 'attack': 0, 'defence': 0 },
			{ 'loc': "A", 'overall': 0, 'attack': 0, 'defence': 0 }
		],
		ppgames: []
	},
	{   shortNm: "LEE",
		id: 13,
		fplDF: [ 3, 2 ] ,
		usrDF: [ 2, 2 ] ,
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		longNm: "Leeds",
		altNm: "Lillywhites",
		manName: "",
		players: [],
		strength: [
			{ 'loc': "H", 'overall': 0, 'attack': 0, 'defence': 0 },
			{ 'loc': "A", 'overall': 0, 'attack': 0, 'defence': 0 }
		],
		ppgames: []
	},
	{   shortNm: "LIV",
		id: 14,
		fplDF: [ 4, 4 ] ,
		usrDF: [ 5, 5 ] ,
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		longNm: "Liverpool",
		altNm: "Reds",
		manName: "",
		players: [],
		strength: [
			{ 'loc': "H", 'overall': 0, 'attack': 0, 'defence': 0 },
			{ 'loc': "A", 'overall': 0, 'attack': 0, 'defence': 0 }
		],
		ppgames: []
	},
	{   shortNm: "MNC",
		id: 15,
		fplDF: [ 5, 4 ] ,
		usrDF: [ 5, 5 ] ,
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		longNm: "Man City",
		altNm: "Citizens",
		manName: "",
		players: [],
		strength: [
			{ 'loc': "H", 'overall': 0, 'attack': 0, 'defence': 0 },
			{ 'loc': "A", 'overall': 0, 'attack': 0, 'defence': 0 }
		],
		ppgames: []
	},
	{   shortNm: "MNU",
		id: 16,
		fplDF: [ 4, 4 ] ,
		usrDF: [ 3, 3 ] ,
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		longNm: "Man United",
		altNm: "Red Devils",
		manName: "",
		players: [],
		strength: [
			{ 'loc': "H", 'overall': 0, 'attack': 0, 'defence': 0 },
			{ 'loc': "A", 'overall': 0, 'attack': 0, 'defence': 0 }
		],
		ppgames: []
	},
	{   shortNm: "NEW",
		id: 17,
		fplDF: [ 3, 2 ] ,
		usrDF: [ 3, 3 ] ,
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		longNm: "Newcastle",
		altNm: "Magpies",
		manName: "",
		players: [],
		strength: [
			{ 'loc': "H", 'overall': 0, 'attack': 0, 'defence': 0 },
			{ 'loc': "A", 'overall': 0, 'attack': 0, 'defence': 0 }
		],
		ppgames: []
	},
	{   shortNm: "NFO",
		id: 18,
		fplDF: [ 3, 3 ] ,
		usrDF: [ 3, 2 ] ,
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		longNm: "N-ham Forest",
		altNm: "Forest",
		manName: "",
		players: [],
		strength: [
			{ 'loc': "H", 'overall': 0, 'attack': 0, 'defence': 0 },
			{ 'loc': "A", 'overall': 0, 'attack': 0, 'defence': 0 }
		],
		ppgames: []
	},
	{   shortNm: "TOT",
		id: 19,
		fplDF: [ 3, 3 ] ,
		usrDF: [ 3, 3 ] ,
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		longNm: "Tottenham",
		altNm: "Spurs",
		manName: "",
		players: [],
		strength: [
			{ 'loc': "H", 'overall': 0, 'attack': 0, 'defence': 0 },
			{ 'loc': "A", 'overall': 0, 'attack': 0, 'defence': 0 }
		],
		ppgames: []
	},
	{   shortNm: "SUN",
		id: 20,
		fplDF: [ 3, 2 ] ,
		usrDF: [ 1, 1 ] ,
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		longNm: "Sunderland",
		altNm: "Black Cats",
		manName: "",
		players: [],
		strength: [
			{ 'loc': "H", 'overall': 0, 'attack': 0, 'defence': 0 },
			{ 'loc': "A", 'overall': 0, 'attack': 0, 'defence': 0 }
		],
		ppgames: []
	}
];


console.log(
	"\n--- FDL constants ---\n",
	"changDFviewArr", changDFviewArr.length,
	"myFPLTeamIds", myFPLTeamIds.length,
	"FPLTeamsFull", FPLTeamsFull.length,
	"\n--- FDL constants END ---\n"
);


/*
	"allStatsData", allStatsData.length,
*/