// let allStatsData = [];

let changDFviewArr = [ "sum", "count", "avg", "fpl" ];

let changDFviewIdx = 0;

let myFPLTeamIds = [];

let FPLballers = [];

let fixtureArray = [];

let allStatsData = [];

let linearScale = d3.scaleLinear()
  .domain([1000, 1400])
  .range([ '#FFFF33', '#FF0033' ]);

// let splashCont = $("progress").get() ;

// 	console.log("constants Init: updateTheSplash? ", updateTheSplash("opened constants....") )

getCI = ()=>{ callIndexer++; return callIndexer.toString() ; }


let gamesOverview = {
		fixedColumns: 3,
		finishedRounds: 17,
		currentRnd: 18,
		evWndw: { 'direction': 1 , 'start': 18, 'rounds': 7, 'end': 24 },
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
		showSttng: true ,
		showDdln: true ,
		hasPP: true ,
		showPP: false ,
		showRP: false ,
		postponedGameIds: 	[] ,
		postponedGames: 	[] ,
		replannedGamesIds: 	[] ,
		replannedGames: 	[] ,
		iBreaks:[] ,
		iBreaksShow: 	false ,
		evTypes: 	[	"evtp-EPL", "evtp-FAC",	"evtp-EFL",	"evtp-ECL",	"evtp-EUL",	"evtp-CLE",	"evtp-UIB" ],
		selectedTeamId: 11 ,
		teamFilter: [ true , true , true , true , true , true , true , true , true , true , true , true , true , true , true , true , true , true , true , true , true ],
		sort: 1 ,
		fontSize: 10
}

getEventWndwStart 	= ()=>{ return parseInt( gamesOverview.evWndw['start'] ) ; 	} 
getRndsToShow 		= ()=>{ return parseInt( gamesOverview.evWndw['rounds'] ) ;	} 
getEventWndwEnd  	= ()=>{ return parseInt( gamesOverview.evWndw['end'] ) ; 	} 
hasUserStore = ()=>{ return ( localStorage.length > 0 ) ; }

setUserDF = ()=>{
	// Stores the current values in the DF container to localstorage and FPLTeamsFull
	// Then updates view by calling 'loadUserDF()'

	if( hasUserStore() ){ localStorage.clear(); }

	let lclStrgArr = [] ;
	let h_df = $("#df_home > td[df]").get() ;
	let a_df = $("#df_away > td[df]").get() ;
	
	if( h_df.length == a_df.length ){

		$.each(
			h_df,
			(i,t)=>{
				FPLTeamsFull[ parseInt( $( t ).attr( 'tmId' ) )].usrDF = [ parseInt($( h_df[i] ).attr( 'df' )), parseInt($( a_df[i] ).attr( 'df' )) ] ; 
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

	localStorage.usrHdf = JSON.stringify( lclStrgArr ) ;
	// Apply the new values to the view
	loadUserDF() ;
}


delUserDF = ()=>{
	console.log("delUserDF") ;
	localStorage.clear();
}


loadUserDF = ()=>{
	// Load values from the localstorage arrays into FPLTeamsFull, DFcontainer and fixtures 
	let storedH = [] ; 
	let storedA = [] ; 

	if( hasUserStore() ){ 
		storedH = JSON.parse( localStorage.usrHdf ) ;
		// console.log("loadUserDF: localStorage exists. =", storedH.length ) ;		
		
		if( storedH.length !=20 ){ setUserDF() ;}

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
			teamHval = parseInt( storedH[t]['h'] ) ;  
			teamAval = parseInt( storedH[t]['a'] ) ;  

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


loadFPLDF = ()=>{
	/* 
		Load values from the CONSTANTS FPLTeamsFull[x]['fplDF'][ h, a ] situated below into the DFcontainer and fixtures. 
		These are/were the values set by the developer of this at the start of the season.
		To load the most recent values, run update_FPLDF(Gameweek).

	*/

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


update_FPLDF = (gw)=>{
	/*
		This function changes the FPLDF values in FPLTeamsFull, based on the values in static.events.
		The function loops through the gw events in reverse, starting from variable 'gw' (gameweek).
		It stops as soon as all teams have been attributed a home and away DF.
		The it loops through all teams applying the new values.
	*/
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

}


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
	{   shortNm: "ARS",
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
	{   shortNm: "AVL",
		id: 2,
		fplDF: [ 3, 3 ] , 	/* [HOME,AWAY] */
		usrDF: [ 3, 2 ] , 	/* [HOME,AWAY] */
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
	{   shortNm: "BOU",
		id: 3,
		fplDF: [ 2, 2 ] , 	/* [HOME,AWAY] */
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
	{   shortNm: "BRE",
		id: 4,
		fplDF: [ 3, 3 ] , 	/* [HOME,AWAY] */
		usrDF: [ 3, 3 ] , 	/* [HOME,AWAY] */
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
	{   shortNm: "BHA",
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
	{   shortNm: "BUR",
		id: 6,
		fplDF: [ 2, 2 ] , 	/* [HOME,AWAY] */
		usrDF: [ 3, 2 ] , 	/* [HOME,AWAY] */
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,// from events
		longNm: "Burnley",
		altNm: "Clarets",
		players: [],
		strength: [
			{ 'loc': "H", 'overall': 0, 'attack': 0, 'defence': 0 },
			{ 'loc': "A", 'overall': 0, 'attack': 0, 'defence': 0 }
		],
		ppgames: []
	},

	{   shortNm: "CHE",
		id: 7,
		fplDF: [ 3, 3 ] , 	/* [HOME,AWAY] */
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
	{   shortNm: "CRY",
		id: 8,
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
	{   shortNm: "EVE",
		id: 9,
		fplDF: [ 2, 2 ] , 	/* [HOME,AWAY] */
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
	{   shortNm: "FUL",
		id: 10,
		fplDF: [ 2, 2 ] , 	/* [HOME,AWAY] */
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
	{   shortNm: "LIV",
		id: 11,
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
	{   shortNm: "LUT",
		id: 12,
		fplDF: [ 2, 2 ] , 	/* [HOME,AWAY] */
		usrDF: [ 2, 1 ] , 	/* [HOME,AWAY] */
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,// from events
		longNm: "Luton",
		altNm: "Hatters",
		players: [],
		strength: [
			{ 'loc': "H", 'overall': 0, 'attack': 0, 'defence': 0 },
			{ 'loc': "A", 'overall': 0, 'attack': 0, 'defence': 0 }
		],
		ppgames: []
	},
	{   shortNm: "MNC",
		id: 13,
		fplDF: [ 5, 5 ] , 	/* [HOME,AWAY] */
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
	{   shortNm: "MNU",
		id: 14,
		fplDF: [ 4, 3 ] , 	/* [HOME,AWAY] */
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
	{   shortNm: "NEW",
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
	{   shortNm: "NFO",
		id: 16,
		fplDF: [ 2, 2 ] , 	/* [HOME,AWAY] */
		usrDF: [ 3, 2 ] , 	/* [HOME,AWAY] */
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
	{   shortNm: "SHU",
		id: 17,
		fplDF: [ 2, 2 ] , 	/* [HOME,AWAY] */
		usrDF: [ 3, 2 ] , 	/* [HOME,AWAY] */
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,// from events
		longNm: "Sheffield Utd",
		altNm: "Blades",
		players: [],
		strength: [
			{ 'loc': "H", 'overall': 0, 'attack': 0, 'defence': 0 },
			{ 'loc': "A", 'overall': 0, 'attack': 0, 'defence': 0 }
		],
		ppgames: []
	},
	{   shortNm: "TOT",
		id: 18,
		fplDF: [ 3, 3 ] , 	/* [HOME,AWAY] */
		usrDF: [ 4, 3 ] , 	/* [HOME,AWAY] */
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
	{   shortNm: "WHU",
		id: 19,
		fplDF: [ 3, 2 ] , 	/* [HOME,AWAY] */
		usrDF: [ 3, 2 ] , 	/* [HOME,AWAY] */
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
	{   shortNm: "WOL",
		id: 20,
		fplDF: [ 2, 2 ] , 	/* [HOME,AWAY] */
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
	"\n--- FDL constants ---\n",
	"changDFviewArr", changDFviewArr.length,
	"myFPLTeamIds", myFPLTeamIds.length,
	"FPLTeamsFull", FPLTeamsFull.length,
	"celebTeams", celebTeams.length,
	"celebLeagues", celebLeagues.length,
	"\n--- FDL constants END ---\n"
);


/*	
	"allStatsData", allStatsData.length, 
*/
