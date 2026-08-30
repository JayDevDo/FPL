// github_FPL_DATA2.js
// let allStatsData = []; has moved to FPLConstants
// initial value, will be overwritten 
let curGW = 2;

/*
################################################################################################################
	ASYNCS: 
################################################################################################################
*/

getStaticData = async ()=> {

	let staticPrms = new Promise( ( myStaticResolve )=> {

		let staticXhttp = new XMLHttpRequest();

		staticXhttp.open("GET", "json/FPL_Static_current.json", true ) ; 
		staticXhttp.send() ; 

		staticXhttp.onreadystatechange = ()=>{

			if ( (staticXhttp.readyState == 4) && (staticXhttp.status == 200) ){

				let staticResponse = JSON.parse( staticXhttp.responseText ) ; 
				allStatsData = staticResponse ;
				myStaticResolve( staticResponse ) ; 
			}

		} 

	});
	
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

		postpXhttp.open("GET", "json/ppFxtrs.json" , true ) ; 
		postpXhttp.send() ; 

		postpXhttp.onreadystatechange = ()=>{

			if ( (postpXhttp.readyState == 4) && (postpXhttp.status == 200) ){

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

	return await postpndPrms ;

}


getFixtureData = async ()=> {

	let fxtrPrms = new Promise( ( myFxtrResolve )=> {
		// Only 1 subscriber awaiting this promise

		let fxtrXhttp = new XMLHttpRequest();
		/* "json/FPL_Events_current.json" */
		fxtrXhttp.open("GET", "json/FPL_Events_current.json", true ) ; 
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
		let jsonFilename = "json/CUPS/cup-" + cupId + ".json" ;
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
	if( allRounds.length > 0 ){
		for( let r = 0; r < allRounds.length; r++ ){
			if( allRounds[r].is_current ){
				curGW = parseInt( allRounds[r].id ) ;
				console.log( "getCurGW finds current: ", curGW, "\tin ", allRounds[r] ) ;
				gamesOverview.currentRnd = curGW ;
				return gamesOverview.currentRnd ;
			}
		}
	}

	curGW = 1 ;
	gamesOverview.currentRnd = curGW ;
	return gamesOverview.currentRnd ;
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

updateCupCell = ( tmId, gw, evtClass, roundTitle, cellText )=>{

	let cupCelltd = $( "#eventTable tr[tmId=" + tmId + "] td[evrnd='" + gw + "']." + evtClass )
		.filter(
			function(){ return $(this).attr("round") == roundTitle ; }
		)
		.get() ;

	if( evtClass == "nocheck" ){
		console.log(
			getCI(),
			"updateCupCell", evtClass,
			"gw", gw,
			"round", roundTitle,
			"tmId", tmId,
			"text", cellText,
			"cupCelltd len", cupCelltd.length,
			"cupCelltd", $(cupCelltd)
		) ;
	}

	if( cupCelltd.length == 1 ){
		// All cup ties have difficulty factor 4.
		let cupTieArr = [	"<span",
							" tmId=", tmId,
							" df=4",
							" evrnd=", gw,
							" class='fxtrspan'",
							" >", cellText ,"</span>"
							].join("") ;

		let cupTie_jq = $( cupTieArr ) ;

		$( cupCelltd ).removeClass("cupElim") ;
		$( cupCelltd ).removeClass("cupCntndr") ;
		$( cupTie_jq ).addClass( evtClass ) ;

		if( [ "bye", "BYE" ].includes(cellText) ){ $( cupTie_jq ).addClass("drawBye") ; }

		if( cellText == "Elim" || cellText == "DNQ" ){
			$( cupCelltd ).addClass("cupElim") ;
			$( cupTie_jq ).addClass("cupElim") ;
		}else{
			$( cupCelltd ).addClass("cupCntndr") ;
			$( cupTie_jq ).addClass("cupCntndr") ;
		}

		$( cupCelltd ).append( cupTie_jq ) ;
	}
}

handleCups = ( cupData )=>{
	/*
		IN: qualified and not eliminated.
		OUT: did not qualify for the competition.
		cupRound.elim: qualified, but already eliminated before this round.

		DNQ is now supplied by CSS for empty cup cells.
		Only contenders, eliminated teams, drawn opponents and byes create spans.
	*/

	let cupIn = cupData[0]["data"] ;
	let whichCup = cupData[2]["data"] ;

	// Cup rounds start after IN, OUT, evntTp and GAMEWEEKS.
	for( let ck = 4; ck < cupData.length; ck++ ){
		let cupRound = cupData[ck] ;
		let cupGW = parseInt( cupRound["gw"] ) ;

		// Round 39 means the cup round has not been assigned to an FPL gameweek yet.
		if( cupGW == 39 ){ continue ; }

		let roundTitle = cupRound["title"] ;
		let cupDrawn = cupRound["drawn"] ;

		// Eliminated teams replace the CSS DNQ default with Elim.
		for( let cupTmId of cupRound["elim"] ){
			updateCupCell( cupTmId, cupGW, whichCup, roundTitle, "Elim" ) ;
		}

		if( cupDrawn ){
			// A draw has been made for this round.
			for( let evf = 0; evf < cupRound["data"].length; evf++ ){
				let evFxtr = cupRound["data"][evf] ;
				let tmHisFPL = isFPL( parseInt(evFxtr["team_h"]) ) ;
				let tmAisFPL = isFPL( parseInt(evFxtr["team_a"]) ) ;
				let tmHName = tmHisFPL ? FPLTeamsFull[ evFxtr["team_h"] ]["shortNm"] : evFxtr["oppNmH"] ;
				let tmAName = tmAisFPL ? FPLTeamsFull[ evFxtr["team_a"] ]["shortNm"] : evFxtr["oppNmA"] ;
				let rpl = evFxtr["replay"] ? " (replay)" : "" ;

				if( tmHisFPL ){ updateCupCell( evFxtr["team_h"], cupGW, whichCup, roundTitle, tmAName + rpl ) ; }
				if( tmAisFPL ){ updateCupCell( evFxtr["team_a"], cupGW, whichCup, roundTitle, tmHName + rpl ) ; }
			}
		}else{
			// No draw yet: qualified contenders replace the CSS DNQ default.
			for( let cupTmId of cupIn ){
				updateCupCell( cupTmId, cupGW, whichCup, roundTitle, roundTitle ) ;
			}
		}
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
	let ogw 		= 0; 

	console.log("getTmDfGwLoc| --tempArr:", tempArr.length ) ;

	if (fixtureArray.length >0){

		for ( fi = 0; fi < 380; fi++){

			let fxtr = fixtureArray[fi] ;
			// console.log("getTmDfGwLoc | fxtr: ", fxtr ) ;
			// console.log("getTmDfGwLoc | fi: ", fi, "of: ", fixtureArray.length, "fixtureArray[fi]: ", fixtureArray[fi] );

			try {
				ogw = fxtr.event ; 

				if ( fxtr.ogGW ) { ogw = fxtr.ogGW ; } else { fxtr.ogGW = ogw; }			
			}
			catch (Exception) { 	
				console.log("Caught exception: " + Exception ); 
				return [0,0]
				// console.log("fxtr.id", fxtr.id, "fxtr.event: ", fxtr.event );
			} 
			// finally { console.log( "fxtr.id", fxtr.id, "ogw:", ogw, "fxtr.ogGW:", fxtr.ogGW , "fxtr.event:", fxtr.event ); }

			// let ogw = fxtr.event ;
			if ( ( ogw == 39 ) || ( ogw == null ) ){ ogw = fxtr.ogGW; }

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

buildHeaders = ( events )=>{
	let headerRow = $("#fxtrTblHdr > tr") ;
	let postponedHeader = headerRow.children("th.ppgame") ;

	// Keep the three fixed control headers and the final postponed header.
	headerRow.children("th.evtTeamBlock").remove() ;

	for( let event of events ){
		let gw = parseInt( event["id"] ) ;
		let gwHeaders = [{
				"eventType": "evtp-EPL",
				"evrnd": gw,
				"date": event["deadline_time"].substring(0, 16).replace("T", " "),
				"round": "GW " + gw.toString().padStart(2, "0")
		}] ;

		for( let cupEventType in cupDataAll ){
			let cupData = cupDataAll[cupEventType] ;
			// Cup and UIB rounds start after IN, OUT, evntTp and GAMEWEEKS.
			for( let ci = 4; ci < cupData.length; ci++ ){
				let cupRound = cupData[ci] ;
				let cupGW = parseInt( cupRound["gw"] ) ;

				if( cupGW == 39 || cupGW != gw ){ continue ; }

				gwHeaders.push({
					"eventType": cupEventType,
					"evrnd": cupGW,
					"date": cupRound["date"],
					"round": cupRound["title"]
				}) ;
			}
		}

		// EPL, cups and UIB items assigned to this GW are ordered together by date.
		gwHeaders.sort(( a, b )=>{ return new Date(a["date"]) - new Date(b["date"]) ; }) ;

		for( let headerData of gwHeaders ){
			$("<th>")
				.attr({
						"evrnd": headerData["evrnd"],
						"date": headerData["date"],
						"round": headerData["round"]
				})
				.addClass("evtTeamBlock " + headerData["eventType"])
				.text(headerData["round"])
				.insertBefore(postponedHeader) ;
		}
	}
}

buildSkeleton = ( tmId )=>{
	let tm = FPLTeamsFull[tmId] ;
	let tmShort = tm["shortNm"] ;
	let tmName = tm["longNm"] ;

	let tmRow = $("<tr>")
		.attr({
				"id": tmShort,
				"tmId": tmId
		})
		.addClass("tmSelected rowShow") ;

	$("<span>")
		.text(tmName)
		.on("click", ()=>{ highlightTeamEvents(tmShort) ; })
		.appendTo(
			$("<th>")
				.addClass("evntTblTmNmHdr")
				.appendTo(tmRow)
		) ;

	$("<div>")
		.addClass("tm-idc greenLight")
		.appendTo(
			$("<th>")
				.on("click", ()=>{ tmSelectToggle(tmId) ; })
				.appendTo(tmRow)
		) ;

	$("<th>")
		.addClass("dfc")
		.text("100")
		.appendTo(tmRow) ;

	$("#fxtrTblHdr > tr > th.evtTeamBlock").each(
		function(){
			let eventHdrCell = $(this) ;
			let eventType = eventHdrCell
				.attr("class")
				.split(" ")
				.find(( className )=>{ return className.startsWith("evtp-") ; }) ;

			$("<td>")
				.attr({
						"evrnd": eventHdrCell.attr("evrnd"),
						"round": eventHdrCell.attr("round")
				})
				.addClass("evtTeamBlock " + eventType)
				.appendTo(tmRow) ;
		}
	) ;

	let postponedCell = $("<td>")
		.attr("evrnd", 39)
		.addClass("ppgame")
		.appendTo(tmRow) ;

	$("<div>").addClass("fxtrPPcount").appendTo(postponedCell) ;
	$("<div>").addClass("fxtrPPlist").appendTo(postponedCell) ;

	tmRow.appendTo("#eventTable") ;
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

		console.log( getCI(), "allPromise.then(values) events --> buildHeaders" ) ; 
		buildHeaders(events) ;
		$("#eventTable").empty() ;

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
			// I don't agree with the short names of the Manchester teams. 15 = City, 16 = Utd.
			if( fpl_tmId == 15 ){
				teams[t].short_name = "MNC"
			}else if( fpl_tmId == 16 ){
				teams[t].short_name = "MNU"
			}

			buildSkeleton(fpl_tmId) ;

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
				fxtr.kickoff_time = "2026-06-30T15:00:00Z" ; 
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

		// setFPLdfToGW( curGW ) ;

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
		console.log("\nHTML init -> Promise all END") ;
		setFPLdfToGW( curGW ) ;
		showEventWindow(2, "HTML init") ;
		eventTypeMidweekChanged();
	}

)
.catch( 
	(error) => {
		console.log(error); // rejectReason of any first rejected promise
	}
);