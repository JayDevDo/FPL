// let allStatsData = [];

let changDFviewArr = [ "sum", "count", "avg", "fpl" ];

let changDFviewIdx = 0;

let myFPLTeamIds = [];

let FPLballers = [];

let fixtureArray = [];

let allStatsData = [];

let currentTeamTable = [] ;

let linearScale = d3.scaleLinear()
  .domain( [1000, 1400] )
  .range( [ "#FFCCFF", "#CC00CC" ] );

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
		finishedRounds: 27,
		currentRnd: 27,
		evWndw: { 'direction': 1 , 'start': 28, 'rounds': 11, 'end': 38 },
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
		teamTableWk: 0,
		teamTableDt: "2025-01-01 20h00",
		evTypes: [ "evtp-EFL", "evtp-FAC", "evtp-ECL" ], /* "evtp-EPL","evtp-EUL",	"evtp-CLE",	"evtp-UIB" */
		selectedTeamId: 12,
		teamFilter: [ true , true , true , true , true , true , true , true , true , true , true , true , true , true , true , true , true , true , true , true , true ],
		sort: 1 ,
		fontSize: 10,
		manId: 856045
}

getEventWndwStart 	= ()=>{ return parseInt( gamesOverview.evWndw['start'] ) ; 	} 
getRndsToShow 		= ()=>{ return parseInt( gamesOverview.evWndw['rounds'] ) ;	} 
getEventWndwEnd  	= ()=>{ return parseInt( gamesOverview.evWndw['end'] ) ; 	} 


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
		fplDF: [ 5, 5 ] , 	/* [HOME,AWAY] */
		usrDF: [ 5, 5 ] , 	/* [HOME,AWAY] */
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0 ] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0 ] ,// from fixtures
		longNm: "Arsenal",	
		altNm: "Gunners",
		manName: "Mikel Arteta",
		players: [],
		strength: [
			{ 'loc':"H", 'overall': 0, 'attack': 0, 'defence': 0 },
			{ 'loc':"A", 'overall': 0, 'attack': 0, 'defence': 0 }
		],
		ppgames: []
	},
	{   shortNm: "AVL",
		id: 2,
		fplDF: [ 4, 3 ] , 	/* [HOME,AWAY] */
		usrDF: [ 3, 3 ] , 	/* [HOME,AWAY] */
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,// from fixtures
		longNm: "Aston Villa",
		altNm: "Villains",
		manName: "Unai Emery",
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
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,// from fixtures
		longNm: "Bournemouth",
		altNm: "Cherries",
		manName: "Andoni Iraola",
		players: [],
		strength: [
			{ 'loc': "H", 'overall': 0, 'attack': 0, 'defence': 0 },
			{ 'loc': "A", 'overall': 0, 'attack': 0, 'defence': 0 }
		],
		ppgames: []
	},
	{   shortNm: "BRE",
		id: 4,
		fplDF: [ 2, 2 ] , 	/* [HOME,AWAY] */
		usrDF: [ 3, 2 ] , 	/* [HOME,AWAY] */
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,// from fixtures
		longNm: "Brentford",
		altNm: "Bees",
		manName: "Thomas Frank",
		players: [],
		strength: [
			{ 'loc': "H", 'overall': 0, 'attack': 0, 'defence': 0 },
			{ 'loc': "A", 'overall': 0, 'attack': 0, 'defence': 0 }
		],
		ppgames: []
	},
	{   shortNm: "BHA",
		id: 5,
		fplDF: [ 2, 2 ] , 	/* [HOME,AWAY] */
		usrDF: [ 3, 3 ] , 	/* [HOME,AWAY] */
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,// from fixtures
		longNm: "Brighton",
		altNm: "Seagulls",
		manName: "Fabian Hürzeler",
		players: [],
		strength: [
			{ 'loc': "H", 'overall': 0, 'attack': 0, 'defence': 0 },
			{ 'loc': "A", 'overall': 0, 'attack': 0, 'defence': 0 }
		],
		ppgames: []
	},
	{   shortNm: "CHE",
		id: 6,
		fplDF: [ 4, 3 ] , 	/* [HOME,AWAY] */
		usrDF: [ 4, 3 ] , 	/* [HOME,AWAY] */
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,// from fixtures
		longNm: "Chelsea",
		altNm: "Blues",
		manName: "Enzo Maresca",
		players: [],
		strength: [
			{ 'loc': "H", 'overall': 0, 'attack': 0, 'defence': 0 },
			{ 'loc': "A", 'overall': 0, 'attack': 0, 'defence': 0 }
		],
		ppgames: []
	},
	{   shortNm: "CRY",
		id: 7,
		fplDF: [ 2, 2 ] , 	/* [HOME,AWAY] */
		usrDF: [ 2, 2 ] , 	/* [HOME,AWAY] */
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,// from fixtures
		longNm: "Crystal Palace",
		altNm: "Eagles",
		manName: "Oliver Glasner",
		players: [],
		strength: [
			{ 'loc': "H", 'overall': 0, 'attack': 0, 'defence': 0 },
			{ 'loc': "A", 'overall': 0, 'attack': 0, 'defence': 0 }
		],
		ppgames: []
	},
	{   shortNm: "EVE",
		id: 8,
		fplDF: [ 2, 2 ] , 	/* [HOME,AWAY] */
		usrDF: [ 2, 2 ] , 	/* [HOME,AWAY] */
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,// from fixtures
		longNm: "Everton",
		altNm: "Toffees",
		manName: "David Moyes",
		players: [],
		strength: [
			{ 'loc': "H", 'overall': 0, 'attack': 0, 'defence': 0 },
			{ 'loc': "A", 'overall': 0, 'attack': 0, 'defence': 0 }
		],
		ppgames: []
	},
	{   shortNm: "FUL",
		id: 9,
		fplDF: [ 3, 2 ] , 	/* [HOME,AWAY] */
		usrDF: [ 2, 2 ] , 	/* [HOME,AWAY] */
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,// from fixtures
		longNm: "Fulham",
		altNm: "Cottagers",
		manName: "Marco Silva",
		players: [],
		strength: [
			{ 'loc': "H", 'overall': 0, 'attack': 0, 'defence': 0 },
			{ 'loc': "A", 'overall': 0, 'attack': 0, 'defence': 0 }
		],
		ppgames: []
	},
	{   shortNm: "IPS",
		id: 10,
		fplDF: [ 2, 2 ] , 	/* [HOME,AWAY] */
		usrDF: [ 2, 1 ] , 	/* [HOME,AWAY] */
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,// from fixtures
		longNm: "Ipswich",
		altNm: "blues",
		manName: "Kieran McKenna",
		players: [],
		strength: [
			{ 'loc': "H", 'overall': 0, 'attack': 0, 'defence': 0 },
			{ 'loc': "A", 'overall': 0, 'attack': 0, 'defence': 0 }
		],
		ppgames: []
	},
	{   shortNm: "LEI",
		id: 11,
		fplDF: [ 2, 2 ] , 	/* [HOME,AWAY] */
		usrDF: [ 2, 1 ] , 	/* [HOME,AWAY] */
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,// from fixtures
		longNm: "Leicester",
		altNm: "Tractor Boys",
		manName: "Ruud v Nistelrooij",
		players: [],
		strength: [
			{ 'loc': "H", 'overall': 0, 'attack': 0, 'defence': 0 },
			{ 'loc': "A", 'overall': 0, 'attack': 0, 'defence': 0 }
		],
		ppgames: []
	},
	{   shortNm: "LIV",
		id: 12,
		fplDF: [ 5, 5 ] , 	/* [HOME,AWAY] */
		usrDF: [ 5, 5 ] , 	/* [HOME,AWAY] */
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,// from fixtures
		longNm: "Liverpool",
		altNm: "Reds",
		manName: "Arne Slot",
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
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,// from fixtures
		longNm: "Man city",
		altNm: "Citizens",
		manName: "Pep Guardiola",
		players: [],
		strength: [
			{ 'loc': "H", 'overall': 0, 'attack': 0, 'defence': 0 },
			{ 'loc': "A", 'overall': 0, 'attack': 0, 'defence': 0 }
		],
		ppgames: []
	},
	{   shortNm: "MNU",
		id: 14,
		fplDF: [ 3, 3 ] , 	/* [HOME,AWAY] */
		usrDF: [ 3, 3 ] , 	/* [HOME,AWAY] */
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,// from fixtures
		longNm: "Man utd",
		altNm: "Red Devils",
		manName: "Rúben Amorim",
		players: [],
		strength: [
			{ 'loc': "H", 'overall': 0, 'attack': 0, 'defence': 0 },
			{ 'loc': "A", 'overall': 0, 'attack': 0, 'defence': 0 }
		],
		ppgames: []
	},
	{   shortNm: "NEW",
		id: 15,
		fplDF: [ 3, 3 ] , 	/* [HOME,AWAY] */
		usrDF: [ 3, 3 ] , 	/* [HOME,AWAY] */
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,// from fixtures
		longNm: "Newcastle",
		altNm: "Magpies",
		manName: "Eddy Howe",
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
		usrDF: [ 2, 1 ] , 	/* [HOME,AWAY] */
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,// from fixtures
		longNm: "Nott-m Forest",
		altNm: "Forest",
		manName: "Nuno Espírito Santo",
		players: [],
		strength: [
			{ 'loc': "H", 'overall': 0, 'attack': 0, 'defence': 0 },
			{ 'loc': "A", 'overall': 0, 'attack': 0, 'defence': 0 }
		],
		ppgames: []
	},
	{   shortNm: "SOU",
		id: 17,
		fplDF: [ 2, 2 ] , 	/* [HOME,AWAY] */
		usrDF: [ 2, 1 ] , 	/* [HOME,AWAY] */
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,// from fixtures
		longNm: "Southampton",
		altNm: "Saints",
		manName: "Ivan Jurić",
		players: [],
		strength: [
			{ 'loc': "H", 'overall': 0, 'attack': 0, 'defence': 0 },
			{ 'loc': "A", 'overall': 0, 'attack': 0, 'defence': 0 }
		],
		ppgames: []
	},
	{   shortNm: "TOT",
		id: 18,
		fplDF: [ 4, 3 ] , 	/* [HOME,AWAY] */
		usrDF: [ 4, 3 ] , 	/* [HOME,AWAY] */
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,// from fixtures
		longNm: "Tottenham",
		altNm: "Spurs",
		manName: "Big Ange",
		players: [],
		strength: [
			{ 'loc': "H", 'overall': 0, 'attack': 0, 'defence': 0 },
			{ 'loc': "A", 'overall': 0, 'attack': 0, 'defence': 0 }
		],
		ppgames: []
	},
	{   shortNm: "WHU",
		id: 19,
		fplDF: [ 2, 2 ] , 	/* [HOME,AWAY] */
		usrDF: [ 2, 2 ] , 	/* [HOME,AWAY] */
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,// from fixtures
		longNm: "West Ham",
		altNm: "Hammers",
		manName: "Graham Potter",
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
		usrDF: [ 2, 2 ] , 	/* [HOME,AWAY] */
		usrDF:[0,0],
		ownDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,
		oppDFhis: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ,// from fixtures
		longNm: "Wanderers",
		altNm: "Wolves",
		manName: "Vitor Pereira",
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
