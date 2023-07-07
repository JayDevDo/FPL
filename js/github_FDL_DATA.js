
let callIndexer = 0 ;
// let allStatsData = []; has moved to FPLConstants

let curGW = 0 ;

getCI = ()=>{ callIndexer++; return callIndexer.toString() ; }


/*
##########################################################################################################################
  
	ASYNCS:

##########################################################################################################################
*/

getStaticData = async ()=> {

	let staticPrms = new Promise( ( myStaticResolve )=> {

		let staticXhttp = new XMLHttpRequest();

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

	return await staticPrms ;

};



getPostponedData = async ()=> {

	let postpndPrms = new Promise( ( myPPResolve )=> {

		let postpXhttp = new XMLHttpRequest();

		postpXhttp.open("GET", "json/current/ppFxtrs.json" , true ) ; 
		postpXhttp.send() ; 

		postpXhttp.onreadystatechange = ()=>{

			if ( (postpXhttp.readyState == 4) && (postpXhttp.status == 200) ){

				let tmpArr = JSON.parse( postpXhttp.responseText ) ; 
				let ppFxtrs = tmpArr[0]['unplanned'] ; 
				let rpFxtrs = tmpArr[1]['re-planned'] ; 
				let iBreaks = tmpArr[4]['intlBreaks'] ; 
				gamesOverview.postponedGames 	= [] ; 
				gamesOverview.postponedGameIds 	= [] ; 
				gamesOverview.replannedGames 	= [] ; 
				gamesOverview.replannedGamesIds = [] ; 
				gamesOverview.iBreaks 			= [] ; 
				
				for(let br = 0; br < iBreaks.length; br++){ gamesOverview.iBreaks.push(iBreaks[br]); }

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
				myPPResolve( [ gamesOverview.postponedGames, gamesOverview.replannedGames ] ) ; 

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
		/* "json/current/FPL_Events_current.json" */
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

	return await fxtrPrms ;

}



/*
#####################
#		Helpers		#	
#####################	
*/

getCurGW = ( allRounds )=>{
	if(allRounds.length>0){ for(let r=0; r<allRounds.length;r++){ if( allRounds[r].is_next ){ gamesOverview.currentRnd =  parseInt(allRounds[r].id ) ; return gamesOverview.currentRnd ; }}}else{ return 0 ; } 
}


updateCellByTmIdRnd = ( fxtr, loc )=>{

	if(fxtr.postponed){
		lclRound = fxtr.ogGW;
	}else{
		lclRound = fxtr.event;
	}

	let target_td, target_txt, target_fplDF, target_fcell

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
		target_fcell = $("#eventTable tr[tmId=" + fxtr.team_h +"] td[evrnd=" + lclRound + " ] ") ;
		
		if( target_fcell.length>1 ){
			/* Because sometimes (fxtr.event is set to null when fxtr is postponed) above selector includes the fixed columns */
			$.each( target_fcell, function(i,fcell){ if( parseInt($(fcell).attr("fxtrid") ) != 999 ){ target_td = $(fcell); } } ); 
		}else{ 
			target_td = target_fcell; 
		}

		target_txt = [ fxtr.team_a_nm, loc, ["(", FPLTeamsFull[fxtr.team_a].fplDF[1], ")"].join("") ].join(" ") ;
		$(fxtrSpan).attr( "df", FPLTeamsFull[fxtr.team_a].fplDF[1] ) ;
		$(fxtrSpan).text( target_txt ) ;
		
   }else{
		
		/* Here we isolate the Home team row and gameweek column for this fixture */
		target_fcell = $("#eventTable tr[tmId=" + fxtr.team_a +"] td[evrnd=" + lclRound + " ] ") ;

		if( target_fcell.length>1 ){
			/* Because sometimes (fxtr.event is set to null when fxtr is postponed) above selector includes the fixed columns */
			$.each( target_fcell, function(i,fcell){ if( parseInt($(fcell).attr("fxtrid") ) != 999 ){ target_td = $(fcell); }} ); 
		}else{ 
			target_td = target_fcell; 
		}
		
		target_txt = [ fxtr.team_h_nm, loc, ["(",  FPLTeamsFull[fxtr.team_h].fplDF[0], ")"].join("") ].join(" ") ;
		$(fxtrSpan).attr( "df", FPLTeamsFull[fxtr.team_h].fplDF[0]) ;
		$(fxtrSpan).text( target_txt ) ; 

	}

	let ttlText = 	[ 	"Home attack v Away defence:", ( FPLTeamsFull[fxtr.team_h].strength[0]['attack']-FPLTeamsFull[fxtr.team_a].strength[1]['defence']).toString(), 
						"\nHome defence v Away attack:", ( FPLTeamsFull[fxtr.team_h].strength[0]['defence']-FPLTeamsFull[fxtr.team_a].strength[1]['attack']).toString(), 
						"\nHvA diff:",(( FPLTeamsFull[fxtr.team_h].strength[0]['attack']-FPLTeamsFull[fxtr.team_a].strength[1]['defence'])+(FPLTeamsFull[fxtr.team_h].strength[0]['defence']-FPLTeamsFull[fxtr.team_a].strength[1]['attack'])).toString(),
					].join("\t") ;

	$( fxtrSpan ).attr( "title", ttlText ) ;

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

	// adds li elements to the ul in the ppGamesAcc container (Unplanned) 
	let ptrgt 	= $( "#ppGamesAcc" ).get() ; 
	let dsplc 	= $( "#ppGamesAcc" ).children("li").remove() ;
	let ppArr 	= [] ; 

	for( let f = 0; f < treatedPPData[0].length; f++ ){

		fxtr = treatedPPData[0][f] ; 

		ppArr = [ 	"<li title='", fxtr.ppid ,
					"'><span>R ", fxtr.ogGW,
					"\t", fxtr.team_h_nm, "\tVs\t", fxtr.team_a_nm,"\t\t\t", fxtr.reason, 
					"</span></li>"
				].join("") ; 

		let ppFxtrLi = $( ppArr ) ; 
		$( ppFxtrLi ).appendTo( $( ptrgt ) ) ; 
	
	}


	// adds li elements to the ul in the ppGamesAcc container (Replanned) 
	let rtrgt 	= $( "#rpGamesAcc" ).get() ; 
	$( "#rpGamesAcc" ).children("li").remove() ;
	let rpArr 	= [] ; 

	for( let f = 0; f < treatedPPData[1].length; f++ ){

		fxtr = treatedPPData[1][f] ; 

		rpArr = [	"<li title='", fxtr.ppid ,
					"'><span>GW: ", fxtr.nwRound,
					" og(", fxtr.ogGW,")", "\t", fxtr.team_h_nm, "\tVs\t", fxtr.team_a_nm, 
					"</span></li>"
				].join("") ; 

		let rpFxtrLi = $( rpArr ) ; 
		$( rpFxtrLi ).appendTo( $( rtrgt ) ) ; 

	}
	
	// FPLTeamsFull[t].ppgames has been updated before getPostponedData was resolved
	for(let t=1; t<21; t++){ $("#teamDFCnt tr.pp_count td[tmId=" + t +"]").text( FPLTeamsFull[t].ppgames.length ); }

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


getOrigPPRnd = ( fxtrId )=>{
	if(gamesOverview.postponedGames.length>0){for( f=0; f<gamesOverview.postponedGames.length; f++){if( parseInt( gamesOverview.postponedGames[f].ppid ) == parseInt(fxtrId) ){ return gamesOverview.postponedGames[f].ogGW;}}}
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


const allPromise = 	Promise.all( 
						[ 	
							getStaticData(), 
							getPostponedData(), 
							getFixtureData() 
						] 
					) ; 

allPromise.then(

	(values) => {

		let events 	= values[0]['events'] ; 
		let teams 	= values[0]['teams'] ; 
		let ppGames = values[1] ; 
		let fxtrs 	= values[2] ;

		console.log( getCI(), "values: events: ", events.length, "teams:", teams.length, "ppGames[0]:", ppGames[0].length, "fxtrs:", fxtrs.length ) ; 
		// Step 2 : Add data from ppGames to fxtrs. 		( 	FXTR LOOP 	)	-origGw, -reason, -newGW(39), -postponed(true/false) 
		// Step 4 : Add data from fxtrs to FPLTeamsFull.	( 	FXTR LOOP 	)	-hisDF
		// Step 5 : Add data from FPLTeamsFull to fxtrs.	( 	FXTR LOOP 	)	-FPL-DF -strengths 

		// Set the curGW at the earliest possibility

		// EVENT LOOP START
		curGW = getCurGW( events ) ;
		console.log( getCI(), "allPromise.then(values) curGw(events)", curGW ) ; 
		$("#curRound").text("GW: " + curGW.toString() ) ;
		// EVENT LOOP END

		// TEAM LOOP START 
		for (let t=0; t<teams.length; t++){
			// 2 sources for 1 array:
			// FPL data
			let fpl_tm 		= teams[t] 		;
			let fpl_tmId 	= fpl_tm.id 	;

			// Our data from CONSTANTS.FPLTeamsFull
			let jtf_tm 		= FPLTeamsFull[fpl_tmId] ; 
			let jtf_tmId 	= jtf_tm.id ; 

			// STEP 0
			// I don't agree with the short names of the Machester teams. 13 = City, 14 = Utd.
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

		} 

		gamesOverview.dfSource.loaded[0] = true ; 
		setIndicator("epl-df-Ldd-idc", "green") ;
		setIndicator("epl-ha-Ldd-idc", "green") ; 
		console.log(getCI(), "allPromise.then(values) after TEAM LOOP -> hasUserStore", hasUserStore() ) ; 

		// TEAM LOOP END 

		if( hasUserStore() ){
			setIndicator("usr-df-Ldd-idc", "orange") ; 
		}

		// PPgames START 
		buidPPContainer( ppGames ) ; 
		// PPgames END 

		// FXTRS LOOP START
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
				fxtr.kickoff_time = "2024-06-30T15:00:00Z" ; 
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

		// FXTRS LOOP END
		setIndicator("df-Ldd-idc", "green") ; 

	}

)
.catch( 
	(error) => {
		console.log(error); // rejectReason of any first rejected promise
	}
);


