// let allStatsData = []; has moved to FPLConstants
// initial value, will be overwritten 
let curGW = 22;

/*
################################################################################################################
	ASYNCS: 
################################################################################################################
*/

getStaticData = async ()=> {

	let staticPrms = new Promise( ( myStaticResolve )=> {

		let staticXhttp = new XMLHttpRequest();

		updateSplash("getting static data") ;
		staticXhttp.open("GET", "json/current/FPL_Static_current.json", true ) ; 
		staticXhttp.send() ; 

		staticXhttp.onreadystatechange = ()=>{

			if ( (staticXhttp.readyState == 4) && (staticXhttp.status == 200) ){

				let staticResponse = JSON.parse( staticXhttp.responseText ) ; 
				allStatsData = staticResponse ;
				myStaticResolve( staticResponse ) ; 
			}

		} 

	});
		
	updateSplash("finished getting static data") ;
	return await staticPrms ;

};



getPostponedData = async ()=> {
	/*
		gamesOverview.evTypes: [	
			"evtp-EPL", Premier league
			"evtp-FAC",	FA Cup
			"evtp-EFL",	EFL (Carabao) Cup
			"evtp-EOL",	Uefa Conference League
			"evtp-EUL",	Uefa Europa League
			"evtp-EHL",	Uefa Champions League
			"evtp-UIB"	Uefa International breaks
		]
	*/

	let postpndPrms = new Promise( ( myPPResolve )=> {

		let postpXhttp = new XMLHttpRequest();

		updateSplash("getting postponed data") ;
		postpXhttp.open("GET", "json/current/ppFxtrs.json" , true ) ; 
		postpXhttp.send() ; 

		postpXhttp.onreadystatechange = ()=>{

			if ( (postpXhttp.readyState == 4) && (postpXhttp.status == 200) ){

				// updateSplash(2, 2 ) ;
				let tmpArr = JSON.parse( postpXhttp.responseText ) ; 

				let ppFxtrs = tmpArr[0]['unplanned'] ; 
				let rpFxtrs = tmpArr[1]['re-planned'] ; 
				/* 
				let iBreaks = tmpArr[4]['evtp-UIB'] ; 
				let evTpEFL = tmpArr[6]['evtp-EFL'] ;
				let evTpFAC = tmpArr[5]['evtp-FAC'] ;
				let evTpECL = tmpArr[7]["evtp-ECL"]
				console.log(getCI(), "getPostponedData evTpFAC:", evTpFAC.length );
				*/

				gamesOverview.postponedGames 	= [] ; 
				gamesOverview.postponedGameIds 	= [] ; 
				gamesOverview.replannedGames 	= [] ; 
				gamesOverview.replannedGamesIds = [] ; 
				gamesOverview.iBreaks 			= [] ; 
				
				// for(let br = 0; br < iBreaks.length; br++){ gamesOverview.iBreaks.push( iBreaks[br] ); }

				for(let bl = 0; bl < ppFxtrs.length ; bl++ ){

					gamesOverview.postponedGames.push( ppFxtrs[bl] ) ;
					gamesOverview.postponedGameIds.push( ppFxtrs[bl].ppid ) ;

					FPLTeamsFull[ ppFxtrs[bl].team_h_id ].ppgames.push( ppFxtrs[bl].ppid ) ;
					FPLTeamsFull[ ppFxtrs[bl].team_a_id ].ppgames.push( ppFxtrs[bl].ppid ) ;

				}

				for(let rp = 0; rp < rpFxtrs.length ; rp++ ){
					gamesOverview.replannedGames.push( rpFxtrs[rp] ) ;
					gamesOverview.replannedGamesIds.push( rpFxtrs[rp].ppid ) ;
				}

				setIndicator("ppsLdd-idc", "green") ; 
				myPPResolve( [ 	
					gamesOverview.postponedGames, 
					gamesOverview.replannedGames 
					/* , 
						iBreaks, 
						evTpEFL, 
						evTpFAC,
						evTpECL 
					*/
				]) ; 

			}else{

				setIndicator("ppsLdd-idc", "red") ; 

			}

		} 

	});

	updateSplash("finished getting postponed data") ;
	return await postpndPrms ;

}


getFixtureData = async ()=> {

	let fxtrPrms = new Promise( ( myFxtrResolve )=> {
		// Only 1 subscriber awaiting this promise

		let fxtrXhttp = new XMLHttpRequest();
		/* "json/current/FPL_Events_current.json" */
		updateSplash("getting fixtures data") ;	
		fxtrXhttp.open("GET", "json/current/FPL_Events_current.json", true ) ; 
		fxtrXhttp.send();

		fxtrXhttp.onreadystatechange = ()=>{

			if ( (fxtrXhttp.readyState == 4) && (fxtrXhttp.status == 200) ){
				let fxtrTableRaw = JSON.parse( fxtrXhttp.responseText ) ; 
				fixtureArray = sortByGmID( fxtrTableRaw ) ; 
				setIndicator("fxtrsLdd-idc", "green") ; 
				myFxtrResolve( fixtureArray ) ;
			}else{
				setIndicator("fxtrsLdd-idc", "red") ; 
			} 

			/* 	else {console.log( getCI(), "getFixtureData fxtrXhttp resolve ELSE ", fxtrXhttp.readyState ) ; }	*/
		
		} 

	});

	updateSplash("finished getting fixtures data") ;	
	return await fxtrPrms ;

}

getCupData = async (cupId)=> {
	/* 
	Cup order = 
		0: 	FA Cup 				( evtp-FAC )
		1: 	EFL Cup 			( evtp-EFL )
		2: 	Euro cHampions Lg 	( evtp-EHL )
		3: 	Euro eUropa Lg 		( evtp-EUL )
		4: 	Euro cOnference Lg 	( evtp-EOL )
	*/
	// console.log("getCupData start ", cupId );

	let cupPrms = new Promise( ( myCupResolve )=> {

		let cupEvType = "evtp-" + cupId;
		let jsonFilename = "json/current/CUPS/cup-" + cupId + ".json" ;
		let cupXhttp = new XMLHttpRequest();

		cupXhttp.open("GET", jsonFilename, true ) ; 
		cupXhttp.send() ; 

		cupXhttp.onreadystatechange = ()=>{

			if ( (cupXhttp.readyState == 4) && (cupXhttp.status == 200) ){

				let cupResponse = JSON.parse( cupXhttp.responseText ) ; 
				// console.log("cupResponse", cupResponse ) ;
				cupDataAll[cupEvType] = cupResponse ;
				// console.log("cupDataAll", cupDataAll[cupEvType] ) ;
				myCupResolve( cupResponse ) ; 
			}
		} 
	});

	return await cupPrms ;
};


/*
#####################
#		Helpers		#	
#####################	
*/

getCurGW = ( allRounds )=>{
	if(allRounds.length>0){ 
		for(let r=0; r<allRounds.length;r++){ 
			if( allRounds[r].is_current ){  
				curGW =  parseInt(allRounds[r].id ) ;
				console.log("getCurGW finds: ", curGW, "\tin ", allRounds[r] ) ;
				gamesOverview.currentRnd = curGW ; 
				return gamesOverview.currentRnd ; 
			}
		}
	}else{ return curGW ; } 
}


getStaticTeam = ()=>{

}


updateCellByTmIdRnd = ( fxtr, loc )=>{

	if(fxtr.postponed){
		lclRound = fxtr.ogGW;
	}else{
		lclRound = fxtr.event;
	}

	let target_td, target_txt, target_fplDF, target_fcell
	/* 
		let mnBonus
	*/
	/* target_arr is a html element 'span' */
	let target_arr = [	"<span", 
						" teamId_h=" + fxtr.team_h,
						" teamId_a=" + fxtr.team_a,
						" fxtrid=" + fxtr.id,
						" evrnd=" + lclRound,
						" class='fxtrspan'", 
						" loc=", loc,
						" str_h_o=", fxtr.str_h_o,
						" str_h_a=", fxtr.str_h_a,
						" str_h_d=", fxtr.str_h_d,
						" str_a_o=", fxtr.str_a_o,
						" str_a_a=", fxtr.str_a_a,
						" str_a_d=", fxtr.str_a_d,
						" ev_df_df=", fxtr.ev_df_df ,
						" str_a_saldo=", fxtr.str_a_saldo,
						" str_h_saldo=", fxtr.str_h_saldo,
						" fpl_df_scr=", parseInt( ( fxtr.str_h_d - fxtr.str_a_a ) + ( fxtr.str_h_a - fxtr.str_a_d) ) ,
						" onclick=highlightEvent(",fxtr.id,")",
						" onmouseenter=highLightTmStrengths(",fxtr.team_h.toString(),",",fxtr.team_a.toString(),")",
						" onmouseleave=normalTmStrengthsHL()",
						" plyd=", fxtr.finished,
						" ppgame=", fxtr.postponed, 
						" ></span>"
						].join("") ; 

	let fxtrSpan = $( target_arr ) ;

	if( loc == "H" ){

		/* Here we isolate the Home team row and gameweek column for this fixture */
		target_fcell = $("#eventTable tr[tmId=" + fxtr.team_h +"] td[evrnd=" + lclRound + " ].evtp-EPL ") ;
		
		if( target_fcell.length>1 ){
			/* Because sometimes (fxtr.event is set to null when fxtr is postponed) above selector includes the fixed columns */
			$.each( target_fcell, function(i,fcell){ if( parseInt($(fcell).attr("fxtrid") ) != 999 ){ target_td = $(fcell); } } ); 
		}else{ 
			target_td = target_fcell; 
		}

		target_txt = [ fxtr.team_a_nm, loc, ["(", FPLTeamsFull[ fxtr.team_a ].ownDFhis[ lclRound ], ")"].join("") ].join(" ") ;
		$(fxtrSpan).attr( "df", FPLTeamsFull[ fxtr.team_a ].ownDFhis[ lclRound ]   ) ;
		$(fxtrSpan).text( target_txt ) ;
		
   }else{
		
		/* Here we isolate the Home team row and gameweek column for this fixture */
		target_fcell = $("#eventTable tr[tmId=" + fxtr.team_a +"] td[evrnd=" + lclRound + " ].evtp-EPL " ) ;

		if( target_fcell.length>1 ){
			/* Because sometimes (fxtr.event is set to null when fxtr is postponed) above selector includes the fixed columns */
			$.each( target_fcell, function(i,fcell){ if( parseInt($(fcell).attr("fxtrid") ) != 999 ){ target_td = $(fcell); }} ); 
		}else{ 
			target_td = target_fcell; 
		}
		
		target_txt = [ fxtr.team_h_nm, loc, ["(", FPLTeamsFull[ fxtr.team_h ].ownDFhis[ lclRound ] , ")"].join("") ].join(" ") ;
		$(fxtrSpan).attr( "df", FPLTeamsFull[ fxtr.team_h ].ownDFhis[ lclRound ]  ) ;
		$(fxtrSpan).text( target_txt ) ; 
	}

	let ttlText = 	[
		"fxtr.id:", fxtr.id, 
		"homeDF[gw]:", FPLTeamsFull[ fxtr.team_h ].ownDFhis[ lclRound ],
		"awayDF[gw]:", FPLTeamsFull[ fxtr.team_a ].ownDFhis[ lclRound ],
		"\nHome attack v Away defence:", ( FPLTeamsFull[fxtr.team_h].strength[0]['attack']-FPLTeamsFull[fxtr.team_a].strength[1]['defence']).toString(), 
		"\nHome defence v Away attack:", ( FPLTeamsFull[fxtr.team_h].strength[0]['defence']-FPLTeamsFull[fxtr.team_a].strength[1]['attack']).toString(), 
		"\nHvA diff:",(( FPLTeamsFull[fxtr.team_h].strength[0]['attack']-FPLTeamsFull[fxtr.team_a].strength[1]['defence'])+(FPLTeamsFull[fxtr.team_h].strength[0]['defence']-FPLTeamsFull[fxtr.team_a].strength[1]['attack'])).toString(),
	].join("\t") ;

	$( fxtrSpan ).attr( "title", ttlText ) ;
	$( fxtrSpan ).attr( "tooltip", ttlText ) ;
	/* 
		if(mnBonus.tableBonusActive){
			$( fxtrSpan ).addClass( "tblBnsActive") ;		
		}
	*/

	if( $(target_td).children(".fxtrspan").length > 0 ){
		$(target_td).attr("dblgw", true  ).addClass('highlight') ;
		$(target_td).css("border:", "2px solid orange;")
		/* 	$("<br>").appendTo( $(target_td) ) ; 	*/
	}

	$(fxtrSpan).appendTo( $(target_td) ) ;
	$(target_td).attr("fxtrCount",   $(target_td).children(".fxtrspan").length ) ;

}


handlePostponed = (fxtr, loc)=>{
	/* remove fxtr if already added to team row r39 */
	/* adds div elements to the td in the fxtrTbl table column round 39 */
	let fxtrppExists, pptarget_td, pptarget_div, pptarget_txt, pptarget_count

	fxtrppExists = $("#fxtrTbl span.fxtrspan[evrnd='39'][loc=' "+ loc +"'][fxtrid=" + fxtr.id + "]").remove();

	let pptarget_arr = ["<span", 
						" teamId_h=", fxtr.team_h,
						" teamId_a=", fxtr.team_a,
						" fxtrid=", fxtr.id,
						" evrnd=", fxtr.event /* should always be 39 */,
						" ogevrnd=", fxtr.ogGW, 
						" nwevrnd=", fxtr.event,
						" class='fxtrspan evtTeamBlock ppgame'", 
						" loc=", loc,
						" onclick=highlightEvent(",fxtr.id,")",
						" plyd=", fxtr.finished,
						" ppgame=", fxtr.postponed, "></span>"].join("");

	let ppfxtrSpan = $( pptarget_arr );

	$( ppfxtrSpan ).attr("df", 0) ; // 0 because postponed

	if( loc == "H" ){

		pptarget_td		= $("#fxtrTbl tr[tmId=" + fxtr.team_h +"] td[evrnd=" + fxtr.event + "]") ;
		pptarget_count 	= FPLTeamsFull[fxtr.team_h].ppgames.length;
		pptarget_txt	= [ "R", fxtr.ogGW, ":", fxtr.team_a_nm," ", loc ].join("") ;  /* fxtr.fplDF[0]  ||  */

		$(ppfxtrSpan).attr("title", pptarget_txt + " " + fxtr.reason ) ;
		$(ppfxtrSpan).text(pptarget_txt) ;

	}else{

		pptarget_td 	= $("#fxtrTbl tr[tmId=" + fxtr.team_a +"] td[evrnd=" + fxtr.event + "]") ;
		pptarget_count 	= FPLTeamsFull[fxtr.team_a].ppgames.length;
		pptarget_txt 	= [ "R", fxtr.ogGW, ":", fxtr.team_h_nm," ", loc ].join("") ; /* fxtr.fplDF[1]  ||  */
	
		$(ppfxtrSpan).attr("title", pptarget_txt + " " + fxtr.reason ) ;
		$(ppfxtrSpan).text(pptarget_txt) ;

	}

	target_td_divC = $( pptarget_td ).children("div.fxtrPPcount") ;
	target_td_divP = $( pptarget_td ).children("div.fxtrPPlist") ;

	$( ppfxtrSpan ).appendTo( $( target_td_divP ) );
	// Update fixture table team row pp count.
	$( target_td_divC ).text( pptarget_count );
}


buidPPContainer = ( treatedPPData )=>{ 
	/* adds li elements to the ul in the ppGamesAcc container (Unplanned) */ 
	let ptrgt 	= $( "#ppGamesAcc" ).get() ; 
	let dsplc 	= $( "#ppGamesAcc" ).children("li").remove() ;
	let ppArr 	= [] ; 

	for( let f = 0; f < treatedPPData[0].length; f++ ){

		fxtr = treatedPPData[0][f] ; 
		/* 
			"<span>Link:  ", fxtr.link ,"</span>",
		*/

		ppArr =[	"<li title='", fxtr.ppid , "><button fxtrId='",fxtr.ppid,"' onclick=openPPInfo(",fxtr.ppid,") style='color:#FF3300 !important; background-color:#000000 !important;' >", 
						"R ", fxtr.ogGW, "\t", fxtr.team_h_nm, "\tvs\t", fxtr.team_a_nm,"\t\t", fxtr.reason, 
						"</button>",
					"</li>"
				].join("") ; 

		let ppFxtrLi = $( ppArr ) ; 
		$( ppFxtrLi ).appendTo( $( ptrgt ) ) ; 	
	}


	/* adds li elements to the ul in the ppGamesAcc container (Replanned) */
	let rtrgt 	= $( "#rpGamesAcc" ).get() ; 
	$( "#rpGamesAcc" ).children("li").remove() ;
	let rpArr 	= [] ; 

	for( let r = 0; r < treatedPPData[1].length; r++ ){

		fxtr = treatedPPData[1][r] ; 

		rpArr = [	"<li title='", fxtr.ppid ,
					"'><span>GW: ", fxtr.nwRound,
					" og(", fxtr.ogGW,")", "\t", fxtr.team_h_nm, "\tVs\t", fxtr.team_a_nm, 
					"</span></li>"
				].join("") ; 

		let rpFxtrLi = $( rpArr ) ; 
		$( rpFxtrLi ).appendTo( $( rtrgt ) ) ; 

	}
	
	/* FPLTeamsFull[t].ppgames has been updated before getPostponedData was resolved */
	for(let t=1; t<21; t++){ 
		$("#teamDF-cnt tr.pp_count td[tmId=" + t +"]").text( FPLTeamsFull[t].ppgames.length ); 
	}

}

setDFTeam = (tmId, df )=>{
	/*
		Updates the DF table in #teamDF-cnt at initial load. Once all fixtures are loaded df's are updatedfrom current gameweek backwards.
	*/
	let tmDFCritH = "#df_home td[tmId="+tmId+"]" ;
	let tmDFCritA = "#df_away td[tmId="+tmId+"]" ;
	let cellJQH = $( tmDFCritH ).get() ;
	let cellJQA = $( tmDFCritA ).get() ;

	/*
		console.log(
			"setDFTeam tmId: ", tmId, 
			"df H: ", df[0],
			"df A: ", df[1],
			"cellJQH.length", cellJQH.length,
			"cellJQA.length", cellJQA.length
		) ;
	*/

	if( cellJQH.length == 1 ){
		$(cellJQH).attr( "df", df[0] ) ;
		$(cellJQH).text( df[0] ) ;
	}

	if( cellJQA.length == 1 ){
		$(cellJQA).attr( "df", df[1] ) ;
		$(cellJQA).text( df[1] ) ;
	}
}


setDFTableStrength = ( eId, tmId, intStrength )=>{

	// 	updates the value and attribute of table rows
	// 	eId = elementId of the table row 
	// 	away-team: #tr_str_a_o ( strength-away-overall ), #tr_str_a_a ( strength-away-attack ), #tr_str_a_d ( strength-away-defence )
	// 	home-team: #tr_str_h_o ( strength-home-overall ), #tr_str_h_a ( strength-home-attack ), #tr_str_h_d ( strength-home-defence ) 

	let crit = [ "#"+eId , "td[tmId="+tmId+"]" ].join(" ") ; 
	let tr_sel = $( crit ) ;

	// the 'td' element's attributes are named as their tr-parent's ID minus the prefix 'tr_'
	// So the attribute-name of the td element 'tr_str_a_o' will be 'str_a_o' 
	let attrNm = eId.replace("tr_", "" ) ;

	// Only 1 element should meet the criteria
	if( tr_sel.length == 1 ){

		$( tr_sel ).attr( attrNm , intStrength.toString() ) ; 
		$( tr_sel ).text( intStrength.toString() ) ; 
		$( tr_sel ).css( "backgroundColor", linearScale(intStrength) ) ; 

	}else{

		console.log( getCI(), "setDFTableStrength -> tr_sel.length != 1 | Eid=", eId, "tmId=", tmId, "intStrength=", intStrength ) ; 

	}
}

isFPL = ( tmNr )=>{ 
	return 	( ( tmNr > 0 ) && ( tmNr < 21 ) ) ; 
}

updateCupCell = (tmId, gw, evtClass, cellText )=>{

	let cupCellCrit = "#eventTable tr[tmId=" + tmId + "] td[evrnd='" + gw + "']." + evtClass ;
	let cupCelltd = $( cupCellCrit ).get() ;

	if( evtClass == "nocheck" ){
		console.log( 
			getCI(),
			"updateCupCell", evtClass,
			"gw", gw,
			"tmId", tmId,
			"text", cellText,
			"cupCelltd len", cupCelltd.length,
			"cupCelltd", $(cupCelltd)
		) ;
	}

	if( cupCelltd.length == 1 ){ 
		// All cupties have difficulty factor 4 !
		let cupTieArr = [	"<span", 
							" tmId=", 	tmId,
							" df=4",
							" evrnd=", 	gw,
							" class='fxtrspan'", 
							" >", cellText ,"</span>"
							].join("") ; 

		let cupTie_jq = $( cupTieArr ) ;

		// $(cupCelltd).text( cellText ); 
		$( cupCelltd ).removeClass("cupElim") ; 
		$( cupCelltd ).removeClass("cupCntndr") ; 

		$( cupTie_jq ).addClass( evtClass ) ; 

		if ( cellText in [ "bye", "BYE"] ){
			$( cupTie_jq ).addClass( 'drawBye' ) ; 
		}

		if( cellText == "Elim" || cellText == "DNQ" ){ 
			$( cupCelltd ).addClass( "cupElim" ) ; 
			$( cupTie_jq ).addClass( "cupElim" ) ;
		}else{
			$( cupCelltd ).addClass( "cupCntndr" ) ;
			$( cupTie_jq ).addClass( "cupCntndr" ) ;
		}

		$(cupCelltd).append( cupTie_jq ) ;

	}

	/* 
		else{
			console.log( 
				getCI(),
				"updateCupCell", evtClass,
				"gw", gw,
				"tmId", tmId,
				"text", cellText,
				"cupCelltd len", cupCelltd.length,
				"cupCelltd SHOULD BE 1 CELL", $(cupCelltd)
			) ;
		}
	*/
}

handleCups = ( cupData )=>{
	/* handleCups: 	Adds cup fixtures to team rows at the column of the cup 
					From json data it loops through a given cup(event type) in REVERSE
					Each cup data entry holds cup related variables in keys 0,1,2
					--	Event type EPL is handled in handleFixtures earlier in the script as it's obligatory
					--	Event type UIB (International Breaks) is hard coded because the program doesn't keep track of those fixtures.
					--	For the moment all European cups are aggregated under evtp-ECL.
	*/

	/*
		cupData contains teams still involved 	('IN','contenders') at index 0
		cupData contains teams eliminated 		('OUT')		at index 1
		cupData contains eventType data 		('evntTp') 	at index 2
	*/

	/*
		cupData contains cup final data 		(L 2 h+a)	at index 3
		cupData contains cup semi-final data 	(L 4 h+a) 	at index 4
		cupData contains cup Q-final data		(L 8 h+a) 	at index 5
		cupData contains etc								at index +1
	*/

	let cdl 	 = cupData.length ; 
	let cntndrs  = cupData[0]["data"] ;
	let elims 	 = cupData[1]["data"] ;
	let whichCup = cupData[2]["data"] ;
	// let cupWeeks = cupData['GAMEWEEKS']["data"] ;
	let cupWeeks = cupData[3]["data"] ;

	/*
	console.log(
			getCI(), 
			"handleCups -> cupData len:", cupData.length,
			"whichCup:\t", whichCup,
			"teamCountCheck", ( ( cntndrs.length + elims.length ) == 20 ) 
	) ;
	*/

	// First loop thru teams that didn't qualify for this cup
	for ( let tmDNQ in elims ){

		for (gw in cupWeeks){
			// console.log("handleCups DNQ | cup: ", whichCup, "tm: ", elims[tmDNQ], "gameweek:", cupWeeks[gw] );
			updateCupCell( elims[tmDNQ], cupWeeks[gw], whichCup, "DNQ" ) ;
		}
	}

	// Looping backwards, excluding first 3 entries teams IN, OUT and eventTp
	for( let ck = (cdl-1);  ck > 2 ; ck--){
		
		let pastGW = ( cupData[ck]["gw"] < curGW ) ;
		let cupDrawn = cupData[ck]["drawn"] ;

		/* 		 		
		console.log( "\n",
			getCI(), 
			"handleCups looping: ", ck , 
			"whichCup", 	whichCup,
			"cupData: ", 	cupData[ck]["title"] , 
			"GW: ", 		cupData[ck]["gw"] , 
			"data: ", 		cupData[ck]["data"].length,
			"elim: ", 		cupData[ck]["elim"].length,
			"drawn: ", 		cupDrawn,
			"pastGW: ", 	pastGW
		) ;
		*/

		for( tmOut in cupData[ck]["elim"] ){
			cupTmId = cupData[ck]["elim"][ tmOut ];
			/* 
				console.log("team OUT: ", cupTmId , whichCup, FPLTeamsFull[cupTmId].shortNm );
			*/
			updateCupCell( cupTmId, cupData[ck]["gw"], whichCup, "Elim" ) ;
		}

		/* 
			for ( let elmntd = 0; elmntd < cupData[ck]["elim"].length; elmntd++ ){
				updateCupCell( cupData[ck]["elim"][elmntd], cupData[ck]["gw"], whichCup, "Elim" ) ;
			}
		*/

		if( cupDrawn ){

			/* A draw has been made for ths round */

			for( let evf = 0; evf<cupData[ck]["data"].length; evf++ ){

				let evFxtr 		= cupData[ck]["data"][evf] ;
				let oppName 	= "unset" ;
				let tmHisFPL 	= isFPL( parseInt(evFxtr["team_h"] )) ;
				let tmAisFPL 	= isFPL( parseInt(evFxtr["team_a"] )) ;
				let replay 		= evFxtr["replay"] || false ;

				if( tmHisFPL ){
					tmHName = FPLTeamsFull[ evFxtr["team_h"] ]["shortNm"];
					oppName = (evFxtr["oppNmA"])? evFxtr["oppNmA"]:"oppNameA" 
				}else{
					tmHName = evFxtr["oppNmH"] ;
				}

				if( tmAisFPL ){
					tmAName = FPLTeamsFull[ evFxtr["team_a"] ]["shortNm"];
					oppName = (evFxtr["oppNmH"])? evFxtr["oppNmH"]:"oppNameH" 
				}else{
					tmAName = evFxtr["oppNmA"] ;
				}

				let rpl = (evFxtr["replay"])? " (replay)":"" ;
				/* 
					To debug, change 'evtp-FACorsomething' below, to an existing cup-class [] 
					let iBreaks = tmpArr[4]['evtp-UIB'] ; 
					let evTpEFL = tmpArr[6]['evtp-EFL'] ;
					let evTpFAC = tmpArr[5]['evtp-FAC'] ;
					let evTpECL = tmpArr[7]["evtp-ECL"] ;

					if( whichCup == "evtp-FACdebuggingabove" ){
				*/

				if( whichCup == "REMOVE_FOR_DEBUG evtp-EFL" ){
					console.log( 
						getCI(), 
						"handleCups ", cupData[ck]["title"],
						" -- fxtr: ", 		evf,
						"\nreplay: ",		replay, 
						"\nrpltxt", 		rpl,
						"\ntm H: ", 		evFxtr["team_h"], 
						"\ttm H nm: ", 		tmHName + rpl ,
						"\tindexOf H: ",	cntndrs.indexOf( evFxtr["team_h"]),
						"\tBoolean indexOf H: ", Boolean( cntndrs.indexOf( evFxtr["team_h"]) > -1 ),
						"\ntm A: ", 		evFxtr["team_a"], 
						"\ttm A nm: ", 		tmAName + rpl ,
						"\tindexOf A: ",	cntndrs.indexOf( evFxtr["team_a"]),
						"\tBoolean indexOf A: ", Boolean( cntndrs.indexOf( evFxtr["team_a"]) > -1 ),
						"\toppName: ", 		oppName
					) ;
				}
				// Fixtures in the past will be added with info available from cupsData
				// Fixtures in the future will only be added as cupRound Nr if team is still a contender
				// Future rounds for non-contenders will display as "FREE"
				
				if( pastGW ){

					/* This fixture has been played */

					updateCupCell( evFxtr["team_h"], cupData[ck]["gw"], whichCup, tmAName + rpl ) ;
					updateCupCell( evFxtr["team_a"], cupData[ck]["gw"], whichCup, tmHName + rpl ) ;

				}else{

					/* This fixture is in the future 
						console.log("updateCupCell(team_h=", evFxtr["team_h"], ", gw=", cupData[ck]["gw"], ", whichCup=", whichCup, ", tmAName=", tmAName ) ;
						console.log("updateCupCell(team_a=", evFxtr["team_a"], ", gw=", cupData[ck]["gw"], ", whichCup=", whichCup, ", tmHName=", tmHName ) ;
					*/
					if( tmHisFPL ){ updateCupCell( evFxtr["team_h"], cupData[ck]["gw"], whichCup, tmAName + rpl ) ; }
					if( tmAisFPL ){ updateCupCell( evFxtr["team_a"], cupData[ck]["gw"], whichCup, tmHName + rpl ) ; }
				}		
			}

		}else{
			
			/* No draw has been made for ths round */
			
			for( let cntndr = 0; cntndr<cntndrs.length; cntndr++ ){
				updateCupCell( cntndrs[cntndr], cupData[ck]["gw"], whichCup, cupData[ck]["title"] ) ;
			}	
		}

	}

}

updateDeadlines = ( eventArray )=>{

	for (let gwk=0; gwk<eventArray.length; gwk++){
		
		let gwkNr 		= eventArray[gwk]['id'] ;
		let gwkDdl 		= eventArray[gwk]['deadline_time'].toString() ;
		let gwkDdlnCut 	= gwkDdl.substring( 0,10 ) ;
		let gwkDdlnTmCut= gwkDdl.substring(11,16 ) ;
		let hdr = $( "#fxtrTblHdr>tr>th[evrnd="+gwkNr.toString()+"].evtp-EPL" ).get() ;
		if( $(hdr).length==1 ){ $(hdr).attr("date", gwkDdlnCut + " " + gwkDdlnTmCut ) };
	}
}


getOrigPPRnd = ( fxtrId )=>{
	if( gamesOverview.postponedGames.length > 0 ){
		for( f=0; f<gamesOverview.postponedGames.length; f++){
			if( parseInt( gamesOverview.postponedGames[f].ppid ) == parseInt(fxtrId) ){ 
				return gamesOverview.postponedGames[f].ogGW;
			}
		}
	}
}


getOrigPPRsn = ( fxtrId )=>{
	if(gamesOverview.postponedGames.length>0){for( f=0; f<gamesOverview.postponedGames.length; f++){if( parseInt( gamesOverview.postponedGames[f].ppid ) == parseInt(fxtrId) ){ return gamesOverview.postponedGames[f].reason; }}}
}


sortByGmID = ( evArr )=>{
	let retArr = evArr.sort(
					(a, b)=>{
						let A = a.id;
						let B = b.id;
						if (parseInt(A) < parseInt(B)) { return -1; }
						if (parseInt(A) > parseInt(B)) { return 1; }
						return 0;
					}) ; 
	return retArr;
}


getTmDfGwLoc = (tmId, gw=gamesOverview.currentRnd)=>{
	// console.log("getTmDfGwLoc| --tmId: ", tmId, "--gw:", gw, "len(fixtureArray):", fixtureArray.length ) ;
	let tempArr = [] ;
	
	for( i=0; i<=39; i++){
		tempArr.push( {'gw':i, 'loc': "N", 'df':0, 'opp': "NA" } )
	}

	let curGWDF 	= [] ;
	let otherGWDF 	= [] ;
	let retArr 		= [ 0, 0 ] ;

	// console.log("getTmDfGwLoc| --tempArr:", tempArr.length ) ;

	if (fixtureArray.length >0){

		for ( fi = 0; fi < 380; fi++){

			let fxtr = fixtureArray[fi] ;
			let ogw = fxtr.event ;
			if (ogw == 39){ ogw = fxtr.ogGW; }

			if( parseInt(fxtr.team_h) == tmId ){
				// console.log("fxtr.id", fxtr.id, "gw", ogw, "team H", fxtr.team_h_nm, "tmH_df", fxtr.team_a_difficulty ,"team A", fxtr.team_a_nm, "tmA_df", fxtr.team_h_difficulty ) ;
				tempArr[ ogw ]['gw'] = ogw ;
				tempArr[ ogw ]['loc']= "H" ;
				tempArr[ ogw ]['df'] = fxtr.team_a_difficulty ;
				tempArr[ ogw ]['opp'] = FPLTeamsFull[fxtr.team_a].shortNm 
			}else if( parseInt(fxtr.team_a) == tmId ){
				// console.log("fxtr.id", fxtr.id, "gw", ogw, "team A", fxtr.team_a_nm, "tmA_df", fxtr.team_h_difficulty ,"team H", fxtr.team_h_nm, "tmH_df", fxtr.team_a_difficulty  ) ;
				tempArr[ ogw ]['gw'] = ogw ;
				tempArr[ ogw ]['loc']= "A" ;
				tempArr[ ogw ]['df'] = fxtr.team_h_difficulty ;
				tempArr[ ogw ]['opp'] = FPLTeamsFull[fxtr.team_h].shortNm 
			}
		}
	}
	// Now we have the team's DF list per gameweek with loc
	// Set the DF of the current GW (H or A) then look back for the first DF not H/A 
	// console.log("getTmDfGwLoc| --tempArr:", tempArr ) ;
	curGWDF = tempArr[gw] ;
	// console.log("getTmDfGwLoc| --curGWDF:", curGWDF ) ;

	for( g = (gw-1); g > 0; g--){
		// console.log("tempArr[",g,"]", tempArr[g] )
		if ( tempArr[g]['loc'] != curGWDF['loc'] ){
			otherGWDF = tempArr[g];
			// console.log("found other GW:", tempArr[g])
			break ;
		}
	}

	// console.log("getTmDfGwLoc| --otherGWDF:", otherGWDF );

	if( curGWDF['loc'] == "H" ){
		retArr[0] = curGWDF['df'];
		retArr[1] = otherGWDF['df'];
	}else{
		retArr[0] = otherGWDF['df'];
		retArr[1] = curGWDF['df'];
	}
	// console.log("retArr: ", retArr ) ;
	if( retArr[0]==0 ){ retArr[0]=FPLTeamsFull[tmId].fplDF[0]  }
	if( retArr[1]==0 ){ retArr[1]=FPLTeamsFull[tmId].fplDF[1]  }
	// return retArr ;
	return [  FPLTeamsFull[tmId].fplDF[0], FPLTeamsFull[tmId].fplDF[1] ]	
}


setFPLdfToGW = (gw=gamesOverview.currentRnd)=>{
	for( t=1; t<21; t++ ){
		FPLTeamsFull[t]['fplDF'] = getTmDfGwLoc(t,gw)
	}
}

updateSplash = (newtext="initial")=>{
	// #splashInfo
	// .splashInfoItem
	let maxInfos = 8 ;
	let siiCrit = "#splashInfo.splashInfoItem" ;
	let siiArr 	= $( siiCrit ).get() ;
	console.log("updateSplash | siiArr.length:", siiArr.length ) ;
	while ( siiArr.length >= maxInfos ){
		console.log("updateSplash | popping -1", siiArr[-1] );
		siiArr.pop(-1);
		siiArr 	= $( siiCrit ).get() ;
	}
	$("#splashInfo").append( "<span class='splashInfoItem' >" + newtext + "</span>" );
}

/*
#####################
#	 DATA READY		#
#####################
values order:
 0: getStaticData()
 1: getPostponedData
 2: getFixtureData
 3: getCupData("FAC")
 4: getCupData("EFL")
 5: getCupData("EHL")
 6: getCupData("EUL")
 7: getCupData("EOL")
 8: getCupData("UIB")
 9: NOT USED-> Managerdata
*/

const allPromise = 	Promise.all( 
						[ 	
							getStaticData(), 
							getPostponedData(), 
							getFixtureData(),
							getCupData("FAC"), 
							getCupData("EFL"), 
							getCupData("EHL"),
							getCupData("EUL"),
							getCupData("EOL"),
							getCupData("UIB")
						] 
					) ; 

allPromise.then(

	(values) => {

		console.log( getCI(),"allPromise.then -->" ) ;

		let events 	= values[0]['events'] ; 
		let teams 	= values[0]['teams'] ; 
		let ppGames = values[1] ; 
		let fxtrs 	= values[2] ;
		console.log( 
			getCI(), 
			"values: events: ", events.length, 
			"teams:", teams.length, 
			"UNplanned:", ppGames[0].length, 
			"REplanned:", ppGames[1].length, 
			"fxtrs:", fxtrs.length 
		) ; 

		let cup_FAC 	= values[3] ; 
		let cup_EFL 	= values[4] ; 
		let cup_EHL 	= values[5] ;
		let cup_EUL 	= values[6] ;
		let cup_EOL 	= values[7] ;
		let cup_UIB 	= values[8] ;

		// Step 2 : Add data from ppGames to fxtrs. 		( 	FXTR LOOP 	)	-origGw, -reason, -newGW(39), -postponed(true/false) 
		// Step 4 : Add data from fxtrs to FPLTeamsFull.	( 	FXTR LOOP 	)	-hisDF
		// Step 5 : Add data from FPLTeamsFull to fxtrs.	( 	FXTR LOOP 	)	-FPL-DF -strengths 
		
		/* 
			console.log( "tmTbl['tables'][0][1]:", tmTbl['tables'][0]['gameWeek'] )
			gamesOverview.teamTableArr = tmTbl['tables'][0]['entries'] ;
			console.log( "teamTableArr:", gamesOverview.teamTableArr.length ) ;
		*/

		// Set the curGW at the earliest possibility
		curGW = getCurGW( events ) ;
		console.log( getCI(), "allPromise.then(values) curGw(events)", curGW ) ; 
		$("#curRound").text("GW: " + curGW.toString() ) ;

		console.log( getCI(), "allPromise.then(values) events --> updateDeadlines" ) ; 
		updateDeadlines(events) ;

		// TEAM LOOP START 
		// old: for (let t=0; t<teams.length; t++){
		// new: for( t in teams ){ 
		for( t in teams ){ 			
			// 2 sources for 1 array:
			// FPL data
			let fpl_tm 		= teams[t] 		;
			let fpl_tmId 	= fpl_tm.id 	;

			// Our data from CONSTANTS.FPLTeamsFull
			let jtf_tm 		= FPLTeamsFull[fpl_tmId] ; 
			let jtf_tmId 	= jtf_tm.id ; 

			// console.log("static team = ", teams[t]['pulse_id'] ) ;
			// Maybe we'll need pulseId at a later stage
			jtf_tm['pulse_id'] = teams[t]['pulse_id'] ;

			// STEP 0
			// I don't agree with the short names of the Manchester teams. 13 = City, 14 = Utd.
			if( fpl_tmId == 13 ){
				teams[t].short_name = "MNC"
			}else if( fpl_tmId == 14 ){
				teams[t].short_name = "MNU"
			}

			// STEP 1
			// The strength_overall values from FPL don't compute. 
			// Therefore  we do int((attack+defence)/2) for both home- and away overall values )
			jtf_tm.strength[0]['overall'] 	= parseInt( ( fpl_tm.strength_attack_home + fpl_tm.strength_defence_home ) / 2 ) ;   
			jtf_tm.strength[0]['attack'] 	= parseInt( fpl_tm.strength_attack_home ) ;  
			jtf_tm.strength[0]['defence'] 	= parseInt( fpl_tm.strength_defence_home ) ;  
			jtf_tm.strength[1]['overall'] 	= parseInt( ( fpl_tm.strength_attack_away + fpl_tm.strength_defence_away ) / 2 ) ;  
			jtf_tm.strength[1]['attack'] 	= parseInt( fpl_tm.strength_attack_away ) ;  
			jtf_tm.strength[1]['defence'] 	= parseInt( fpl_tm.strength_defence_away ) ;  
			// FPL provides tm_strength but isn't really used. Adding it anyway
			jtf_tm.staticTmStrength 		= fpl_tm.strength ;

			// STEP 2
			// Change/Add strength values to html DF container home team
			setDFTableStrength( "tr_str_h_o", fpl_tmId, jtf_tm.strength[0]['overall'] ) ; 
			setDFTableStrength( "tr_str_h_a", fpl_tmId, jtf_tm.strength[0]['attack']  ) ; 
			setDFTableStrength( "tr_str_h_d", fpl_tmId, jtf_tm.strength[0]['defence']  ) ; 
			// Change/Add strength values to html DF container away team
			setDFTableStrength( "tr_str_a_o", fpl_tmId, jtf_tm.strength[1]['overall'] ) ; 
			setDFTableStrength( "tr_str_a_a", fpl_tmId, jtf_tm.strength[1]['attack']  ) ; 
			setDFTableStrength( "tr_str_a_d", fpl_tmId, jtf_tm.strength[1]['defence']  ) ; 
	
			setDFTeam( fpl_tmId, FPLTeamsFull[fpl_tmId]["fplDF"] ) ;
		} 

		gamesOverview.dfSource.loaded[0] = true ; 
		setIndicator("epl-df-Ldd-idc", "green") ;
		setIndicator("epl-ha-Ldd-idc", "green") ; 
		// updateSplash(0, 100 ) ;

		// TEAM LOOP END 

		console.log(getCI(), "allPromise.then(values) after TEAM LOOP -> hasUserStore", hasUserStore() ) ; 
		if( hasUserStore() ){ setIndicator("usr-df-Ldd-idc", "orange") ; }

		// PPgames START 
		buidPPContainer( ppGames ) ; 
		// PPgames END 

		// FXTRS (EPL) LOOP START
		for(let f=0; f<fxtrs.length; f++){

			let fxtr = fxtrs[f] ; 
			let tmHomeId = fxtr.team_h ;
			let tmAwayId = fxtr.team_a ;
			let agw = fxtr.event ; 

			if( gamesOverview.postponedGameIds.includes( fxtr.id ) ){

				fxtr.event 		= 39 ;
				fxtr.postponed 	= true ;
				fxtr.ogGW 		= getOrigPPRnd( fxtr.id ) ; 
				fxtr.reason 	= getOrigPPRsn( fxtr.id ) ; 
				fxtr.finished 	= false ; 
				fxtr.finished_provisional = false ; 
				fxtr.kickoff_time = "2025-06-30T15:00:00Z" ; 
				fxtr.minutes 	= 0 ; 
				fxtr.provisional_start_time = false ; 
				fxtr.started 	= false ; 
				agw 			= fxtr.ogGW ; 

			}else{

				fxtr.postponed = false ;

			}

			//	Addding the teams DF factors per round + opponent's DF to FPLTeamsFull array.
			//	Fixtures contain the keys 'team_h_difficulty' and 'team_a_difficulty'.
			//	'team_h_difficulty' is how difficult the away team is (for the home team).
			//	'team_a_difficulty' is how difficult the home team is (for the away team).
			// 	FPLTeamsFull DF s for Home team
			FPLTeamsFull[ tmHomeId ].oppDFhis[ agw ] = fxtr.team_h_difficulty ;
			FPLTeamsFull[ tmHomeId ].ownDFhis[ agw ] = fxtr.team_a_difficulty ;

			// FPLTeamsFull DF s for Away team 
			FPLTeamsFull[ tmAwayId ].oppDFhis[ agw ] = fxtr.team_a_difficulty ;
			FPLTeamsFull[ tmAwayId ].ownDFhis[ agw ] = fxtr.team_h_difficulty ;

			// Adding team info to fixtures 
			fxtr.team_h_nm = FPLTeamsFull[ tmHomeId ].shortNm ;
			fxtr.team_a_nm = FPLTeamsFull[ tmAwayId ].shortNm ;
					
			// using FPL defaults for usr DF. Will be overwritten by setUerDF 
			// When building the table, the setting gamesOverview.dfSource['user'] decides which value is used.
			fxtr.fplDF = [ fxtr.team_a_difficulty, fxtr.team_h_difficulty ] ; 
			fxtr.usrDF = [ FPLTeamsFull[ tmHomeId ].usrDF[0] , FPLTeamsFull[ tmAwayId ].usrDF[1] ] ; 

			// console.log(" fxtr.fpl_df_h_o", allStatsData['teams'][ 1].strength_overall_home ) ;
			// Home team
			fxtr.str_h_o 	 = FPLTeamsFull[ tmHomeId ].strength[0]['overall'] ; 
			fxtr.str_h_a 	 = FPLTeamsFull[ tmHomeId ].strength[0]['attack'] ; 
			fxtr.str_h_d 	 = FPLTeamsFull[ tmHomeId ].strength[0]['defence'] ; 
			// Away team
			fxtr.str_a_o 	= FPLTeamsFull[ tmAwayId ].strength[1]['overall'] ; 
			fxtr.str_a_a 	= FPLTeamsFull[ tmAwayId ].strength[1]['attack'] ; 
			fxtr.str_a_d 	= FPLTeamsFull[ tmAwayId ].strength[1]['defence'] ; 

			fxtr.str_h_saldo = (( fxtr.str_h_a - fxtr.str_a_d ) + ( fxtr.str_h_d - fxtr.str_a_a )) ;  
			fxtr.str_a_saldo = (( fxtr.str_a_a - fxtr.str_h_d ) + ( fxtr.str_a_d - fxtr.str_h_a )) ;  

			// console.log( getCI(), "allPromise.then(values) f: ", fxtr.id, " fxtr.str_h_saldo: ", fxtr.str_h_saldo ) ; 
			// console.log( getCI(), "allPromise.then(values) f: ", fxtr.id, " fxtr.str_a_saldo: ", fxtr.str_a_saldo ) ; 

			// See which fixtures have the biggest DF difference 
			fxtr.ev_df_df  = ( fxtr.team_h_difficulty == fxtr.team_a_difficulty )? 0:( fxtr.team_h_difficulty > fxtr.team_a_difficulty )? ( fxtr.team_h_difficulty - fxtr.team_a_difficulty ):( fxtr.team_a_difficulty - fxtr.team_h_difficulty ) ;

			// Build the fixture table

			updateCellByTmIdRnd( fxtr, "H") ; 
			updateCellByTmIdRnd( fxtr, "A") ; 
			
			if( fxtr.postponed ){ 
				handlePostponed( fxtr, "H" ) ; 
				handlePostponed( fxtr, "A" ) ; 
			}

		}

		// FXTRS (EPL) LOOP END
		setIndicator("df-Ldd-idc", "green") ; 

		setFPLdfToGW( curGW ) ;

		// CUP FIXTURES LOOP START
		console.log( 
			getCI(), 
			"---CUPS---\N",
			"cup_FAC", cup_FAC.length, 
			"cup_EFL", cup_EFL.length, 
			"cup_EHL", cup_EHL.length, 
			"cup_EUL", cup_EUL.length, 
			"cup_EOL", cup_EOL.length, 
			"cup_UIB", cup_UIB.length
		) ; 

		for ( cupAllDataItem in cupDataAll ){ 
			console.log("allCupsPrms.then | cupAllDataItem: ", cupAllDataItem, " starting handleCups length: ", cupDataAll[cupAllDataItem].length  ) ;
			handleCups( cupDataAll[cupAllDataItem], cupAllDataItem ) ; 
		}

		loadFPLDF() ;

		// CUP FIXTURES LOOP END
		$("#pulser").remove() ;
	}

)
.catch( 
	(error) => {
		console.log(error); // rejectReason of any first rejected promise
	}
);

