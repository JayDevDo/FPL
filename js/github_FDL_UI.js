
clspuDF =()=>{ $("#popUpDF").hide(); }
tmNmClick = (tmId)=>{  gamesOverview.selectedTeamId = tmId;  window.open("teamPopUp.html?tmId=" +tmId.toString() ,{'tmId':12 } ); }
showEvent = (id)=>{ for(let e=0; e < fixtures.length; e++){ if( fixtures[e].id == id ){ return fixtures[e]; }}}

locked = ()=>{ return gamesOverview.locks.includes(true); }
isLocked = (l)=>{ return gamesOverview.locks[l] == true || false; }
let evchanges = [ "start", "round", "end" ];


/* Event window toggles */

toggleLocks = (l)=>{

	switch(l){
		case 0:
			gamesOverview.locks[0] = !gamesOverview.locks[0];
			if( gamesOverview.locks[0] ){
				gamesOverview.locks[1] = false;
				gamesOverview.locks[2] = false;
				gamesOverview.evWndw['direction'] = 1 ;
			}
			break;

		case 1:
			gamesOverview.locks[1] = !gamesOverview.locks[1];
			if( gamesOverview.locks[1] ){
				gamesOverview.locks[0] = false;
				gamesOverview.locks[2] = false;
			}
			break;

		case 2:
			gamesOverview.locks[2] = !gamesOverview.locks[2];
			if( gamesOverview.locks[2] ){
				gamesOverview.locks[0] = false;
				gamesOverview.locks[1] = false;
				gamesOverview.evWndw['direction'] = -1 ;
			}
			break;

		default: 
			console.log("toggleLocks l = ", l );
	}

	let lckBttns = $("button.evwndwTgl").get() ;

	$.each(
		lckBttns,
		function(i,b){
			$(b).attr('enabled', gamesOverview.locks[i] )
		}
	);
}


setEventWndwStart = (ews)=>{
	gamesOverview.evWndw['start'] = parseInt(ews);
	showEventWindow(0);
	return gamesOverview.evWndw['start'];
} ;


setRndsToShow = (rts)=>{
	gamesOverview.evWndw['rounds'] = parseInt(rts);
	showEventWindow(1);
	return gamesOverview.evWndw['rounds'];
};


setEventWndwEnd = (ewe)=>{
	gamesOverview.evWndw['end'] = parseInt(ewe);
	showEventWindow(2);
	return gamesOverview.evWndw['end'];
}


showEventWindow = (l)=>{
	//	@param(l) = last changed selection item. identifies which evWndw item was changed( 0 = start, 1 = rounds, 2 = end ) 
	
	let evWndw 		= gamesOverview.evWndw;
	let lockId 		= gamesOverview.locks.indexOf(true)	;
	let direction 	= parseInt(evWndw['direction'])		;

	if ( locked() ){

		if( direction == 1 ){

			switch( l ){
			
				case 0: 
					// start round has changed while direction = 1 
					evWndw['end']	=	parseInt( evWndw['start'] ) + parseInt( evWndw['rounds'] - 1 ) ;
					break;

				case 1: 
					// # of rounds has changed while direction = 1 
					evWndw['end']	=	parseInt( evWndw['start'] ) + parseInt( evWndw['rounds'] - 1 ) ;
					break;

				case 2:
					// end round has changed while direction = 1 
					if( lockId == 1 ){
						// Rounds are locked so change start 
						evWndw['start']= parseInt( evWndw['end'] - ( evWndw['rounds'] - 1 ) ) ;
					}else{
						// End is locked so change rounds (direction should not be 1 ! )
						evWndw['rounds']= parseInt( evWndw['end'] - evWndw['start'] ) + 1 ;
					}
					break;

				default:
					console.log("showEventWindow: dir= 1. switch changed item > 2 = \t", l ) ;	
			}

		}else if( direction == -1  ){

			switch( l ){
				case 0: 
					// start round has changed while direction = -
					evWndw['rounds']= parseInt( evWndw['end'] - evWndw['start'] ) - 0 ;
					break;

				case 1: 
					// # of rounds has changed while direction = -1  
					evWndw['start']= parseInt( evWndw['end'] - ( evWndw['rounds'] - 1 ) ) ;
					break;

				case 2:
					// end round has changed while direction = -1 
					evWndw['start']= parseInt( evWndw['end'] - ( evWndw['rounds'] - 1 ) ) ;
					break;

				default:
					console.log("showEventWindow: dir= -1. switch changed item > 2 =\t", l ) ;
			}

		}else{

			console.log("showEventWindow --> direction should be 1 or -1. not:\t", direction );	

		}


	}else{ 

		switch( l ){
			case 0: 
				// No lock start round has changed 
				evWndw['end']	= ( parseInt( evWndw['start'] ) + parseInt( evWndw['rounds'] - 1 ) );
				break;

			case 1: 
				// No lock # of rounds has changed 
				evWndw['end']	= ( parseInt( evWndw['start'] ) + parseInt( evWndw['rounds'] - 1 ) );
				break;

			case 2:
				// No lock end round has changed 
				evWndw['rounds']= parseInt( evWndw['end'] - evWndw['start'] ) + 0 ;
				break;

			default:
				console.log("showEventWindow: dir= -1. switch changed item > 2 =\t", l );	
		}

	}

	$("#strtRnd > option.active").removeClass("active") ;
	$("#slctdRounds > option.active").removeClass("active") ;
	$("#endRnd > option.active").removeClass("active") ;

	$("#strtRnd > option:selected").removeClass("selected") ;
	$("#slctdRounds > option:selected").removeClass("selected") ;
	$("#endRnd > option:selected").removeClass("selected") ;

	$("#strtRnd").val( evWndw['start'] );
	$("#slctdRounds").val( evWndw['rounds'] );
	$("#endRnd").val( evWndw['end'] );

	$("#strtRnd > option[value='"+ evWndw['start'] + "']").addClass("active");
	$("#slctdRounds > option[value='"+ evWndw['rounds'] + "']").addClass("active");
	$("#endRnd > option[value='"+ evWndw['end'] + "']").addClass("active");

	$("#strtRnd > option[value='"+ evWndw['start'] + "']").addClass("selected");
	$("#slctdRounds > option[value='"+ evWndw['start'] + "']").addClass("selected");
	$("#endRnd > option[value='"+ evWndw['end'] + "']").addClass("selected");

	showIbreaks() ;

	let st 			= parseInt(evWndw['start'])	;
	let en 			= parseInt(evWndw['end']) 	;
	let rnds 		= parseInt(evWndw['rounds']);

	for(let p = 1; p < st ; p++){hideEventClmn(p);}
	for(let s = st; s <= en ; s++){showEventClmn(s);}
	for(let f = (en+1) ; f <= 39 ; f++){hideEventClmn(f); }

	if( gamesOverview.hasPP ){ $("#ppOview").show(); }else{ $("#ppOview").hide(); $("tr.pp_count").hide();}

	if(gamesOverview.postponedGames.length>0){ showEventClmn(39); }else{ hideEventClmn(39);}
	updateTotalDF(changDFviewIdx) ;
	showHiddenTable() ;
	// console.log( "showEventWindow:", evWndw ," changed", evchanges[l], "to: ", [st,rnds,en][l].toString() ) ;

}


hideEventClmn = (rnd)=>{
	let crit = "td[evrnd=" + rnd + "]" ;
	let gms  = $(crit).get() ;
	let hdr  = $("th[evrnd=" + rnd + "]" ) ;
	$.each( hdr, function(index,gm){ $(gm).addClass("clmnHide"); } );
	$.each( gms, function(index,gm){ $(gm).addClass("clmnHide"); } );
	hideIbreaks(rnd)
}


showEventClmn = (rnd)=>{
	let crit 	= "td[evrnd=" + rnd + "]" ;
	let gms  	= $(crit).get() ;
	let hdr  	= $("th[evrnd=" + rnd + "]" ) ;
	$.each( hdr, function(index,gmh){ $(gmh).removeClass("clmnHide"); } );
	$.each( gms, function(index,gm){ $(gm).removeClass("clmnHide"); } );
	showIbreaks(rnd)
}


/* User DF functions */

setCustomDF = (loc, tmId)=>{
	
	$("#popUpDF").attr( 'tmId', tmId )
	$("#puDF_tmSNm").first("span").text(FPLTeamsFull[ tmId].shortNm )

	let offset = $("#df_away td[tmId="+tmId + "]").offset();

	$("#popUpDF").show()
	// $("#popUpDF").offset({ top: ( offset.top - 75 ), left: ( offset.left + ( parseInt(tmId) * 45 ) +50 ) });
	$("#popUpDF").offset({ top: ( offset.top - 75 ), left: offset.left });
}


updateCustomDF = (loc,val)=>{
	let tmId = $("#popUpDF").attr("tmId") ; 
	// console.log("shortNm: ", FPLTeamsFull[ tmId ].shortNm, "updateCustomDF: loc: ", loc, "val: ", val ) ; 

	let text = FPLTeamsFull[tmId].shortNm + " " + ((loc=="H")? "A":"H" ) + " (" + val + ")" ; 

	if(loc=="H"){

		crit 	= $(".fxtrspan[teamid_h="+tmId+"][loc='A']") ; 
		$("#df_home td[tmId=" + tmId + "]").text(val) ;
		$("#df_home td[tmId=" + tmId + "]").attr("df", val) ;
	
	}else{
	
		crit 	= $(".fxtrspan[teamid_a="+tmId+"][loc='H']") ; 
		$("#df_away td[tmId=" + tmId + "]").text(val) ;
		$("#df_away td[tmId=" + tmId + "]").attr("df", val) ;
	
	}

	setUserDF() ; 

	let tmgames = $(crit).get() ;
	
	// console.log("updateCustomDF tmgames.len ", tmgames.length ) ; 

	$.each(
		tmgames,
		(index, gm)=>{
			$(gm).attr("df", val) ; 
			$(gm).addClass("customDF") ; 
			$(gm).text(text) ; 
		}
	);

	// changDFviewIdx from CONSTANTS 
	updateTotalDF(changDFviewIdx) ; 
}


hideIbreaks = (rnd)=>{
	let critTD = "td [ibreak=" + rnd + "]" ;
	let critTH = "th [ibreak=" + rnd + "]" ;
	let ibrkCells  = $(critTD).get() ;
	let ibrkHeads  = $(critTH).get() ;
	// console.log("hideIbreaks: ibrkCells:\t", ibrkCells.length , "ibrkHeads:\t", ibrkHeads.length )
	$.each( ibrkHeads, function(index, hds){ $(hds).addClass("clmnHide"); } );
	$.each( ibrkCells, function(index, cll){ $(cll).addClass("clmnHide"); } );
}


showIbreaks = (rnd)=>{
	let critTD = "td [ibreak=" + rnd + "]" ;
	let critTH = "th [ibreak=" + rnd + "]" ;
	let ibrkCells  = $(critTD).get() ;
	let ibrkHeads  = $(critTH).get() ;
	// console.log("showIbreaks: ibrkCells:\t", ibrkCells.length , "ibrkHeads:\t", ibrkHeads.length )
	$.each( ibrkHeads, function(index, hdr){ $(hdr).removeClass("clmnHide"); } );
	$.each( ibrkCells, function(index, cll){ $(cll).removeClass("clmnHide"); } );
}


/* Change sorting option changDFviewIdx from CONSTANTS */
changDFview = ()=>{
	if( (changDFviewIdx+1) > 3 ){
		changDFviewIdx = 0;
	}else{
		changDFviewIdx += 1;
	}
	updateTotalDF(changDFviewIdx) ; 
}


updateTotalDF = (dfType)=>{
	// dfType = ["sum", "count", "avg", "fpl"] 

	let tblRows = $(".teamCntnr tr").get();

	// Loop thru the 20 teams
	$.each(
		tblRows,
		(index, rw)=>{

			// Set up the totals for this team.
			let rwDFSum 		= 0 ;  // Holds the DF sum for the team row
			let rwMtchCount 	= 0 ;  // Holds the MatchCount for the team row
			let rwStrngthSum 	= 0 ;  // Holds the StrengthHome/Away total.

			// Define which GW's will be counted
			let strtRnd 	= gamesOverview.evWndw['start'] ; 
			let endRnd 		= gamesOverview.evWndw['end'] ; 
			let rowFixtures = $(rw).children(".evtTeamBlock") ; 
			let tmId 		= parseInt( $(rw).attr("tmid") ); 

			// Loop thru the fixtures of this team.
			$.each(
				rowFixtures,
				function(i,gm){

					// Only count fixtures in the selected event window
					if( ( $(gm).attr("evrnd") >= strtRnd ) && ( $(gm).attr("evrnd") <= endRnd ) ){

						// Set up the totals for this GW.
						let tdHAstrngth = 0 ; 
						let tdMatchCount = 0 ; 
						let tdDFsum  = 0 ; 

						$.each(
							$(gm).children("span").get(),
							(s, spdf)=>{

								// Only count games that aren't postponed.
								if( $(spdf).attr("ppgame") == "false" ){

									if( tmId==0 ){

										console.log( 
											getCI(), "\t", FPLTeamsFull[tmId].shortNm , 
											"\nfxtrId:", $(spdf).attr("fxtrid") , "at home:", (tmId==parseInt( $(spdf).attr("teamid_h"))), 
											"each rowfixture --> \tstr_h_saldo: ", $(spdf).attr("str_h_saldo") ,
											"\tstr_a_saldo: ", $(spdf).attr("str_a_saldo") 
										) ; 

									}

									// The DF sum
									tdDFsum += parseInt( $(spdf).attr("df") ) ; 
									// The match count
									tdMatchCount++ ; 

									// The home vs away strengths
									let loc = $(spdf).attr("loc") ;
									let lcl_evDF = parseInt( $(spdf).attr("fpl_df_scr") ) ; 

									tdHAstrngth += ( tmId == parseInt( $(spdf).attr("teamid_h") ) )? parseInt( $(spdf).attr("str_h_saldo") ):parseInt( $(spdf).attr("str_a_saldo") ) ; 

									/*
									if( lcl_evDF < 0 ){
										// A negative value for lcl_evDF indicates the away team is stronger
										if( ( loc == "A" ) && ( parseInt( $(spdf).attr("teamid_a") ) == tmId ) ){
											//  i.e. 10 -= -1 = 11 
											tdHAstrngth -= lcl_evDF ;
										}else{
											//  i.e. 10 += -1 = 9
											tdHAstrngth += lcl_evDF ;
										}
									}else{
										//  lcl_evDF is zero or bigger. indicates the home team is stronger
										if( ( loc == "H" ) && ( parseInt( $(spdf).attr("teamid_h") ) == tmId ) ){
											//  i.e. 10 += 1 = 11 
											tdHAstrngth += lcl_evDF ;
										}else{
											//  i.e. 10 -= 1 = 9
											tdHAstrngth -= lcl_evDF ;
										}
									}
									*/
								}

							}

						);

						// Update teamTotal with GW total  
						rwDFSum 		+= tdDFsum  ;
						rwMtchCount 	+= tdMatchCount ;
						// console.log( getCI(), "rwStrngthSum before adding gameweek td: ", rwStrngthSum, "adding (+=) tdHAstrngth", tdHAstrngth ) ; 
						rwStrngthSum 	+= tdHAstrngth ;
						// console.log( getCI(), "rwStrngthSum after adding gameweek td: ", rwStrngthSum ) ; 

					}

				}
			);

			// All fixtures have been couted. Now Update column "DF"
			let dfAvg = ( parseInt(rwDFSum) / parseInt(rwMtchCount) ).toString().slice(0,4);
			let dfStr = ""

			if( dfType == 0 ){
				dfStr = rwDFSum.toString() ; 
			}else if( dfType == 1 ){
				dfStr = rwMtchCount.toString() ; 
			}else if( dfType == 2 ){
				dfStr = dfAvg.toString() ; 
			}else if( dfType == 3 ){
				dfStr = rwStrngthSum.toString() ; 
				if( gamesOverview.sort == 1 ){ reverseSort(); }
			}else{
				dfStr = rwDFSum.toString() ; 
			}

			$(rw).children("th.dfc").text( dfStr ) ; 
			$("#tmDFhdr").text( changDFviewArr[dfType] ) ; 
		}
	);
	
	sortTable() ; 

}


reverseSort = ()=>{ 
	gamesOverview.sort = gamesOverview.sort * -1 ; 
	sortTable() ; 
	$("#rvSortBttn").text( (gamesOverview.sort==1)? "DESC":"ASC"   ) ; 
}


sortTable = ()=>{
	/* Sort table based on difficulty of selected next games */
	let rows = $('#fxtrTbl tbody tr').get();
	rows.sort(
		function (a, b) {
			let A = $(a).children('th.dfc').text();
			let B = $(b).children('th.dfc').text();
			
			if( gamesOverview.sort == 1 ){

				if (parseFloat(A) < parseFloat(B)) { return ( -1 ); }
				if (parseFloat(A) > parseFloat(B)) { return (  1 ); }
				return 0;

			}else if( gamesOverview.sort == -1 ){

				if (parseFloat(A) < parseFloat(B)) { return ( 1 ); }
				if (parseFloat(A) > parseFloat(B)) { return ( -1 ); }
				return 0;

			}else{

				// if (parseFloat(A) < parseFloat(B)) { return (-1 * gamesOverview.sort ); }
				// if (parseFloat(A) > parseFloat(B)) { return (1 * gamesOverview.sort); }
				if (parseInt(A) < parseInt(B)) { return -1; }
				if (parseInt(A) > parseInt(B)) { return 1; }
				return 0;

			}


		}
	);
	$.each(rows, function (index, row) {
		// console.log("index", row)
		$('#fxtrTbl').children('tbody').append(row);
	});
}


/* selected teams functionality */
showHiddenTable = ()=>{
	let hasHidden = $('#hiddenTbl tbody tr').length;
	if( hasHidden > 0 ){
		$("#hiddenTblCnt tbody").show()
		$("#hiddenTbl tbody").show()
		$("#hiddenTbl thead").show()
	}else{
		$("#hiddenTblCnt tbody").hide()
		$("#hiddenTbl tbody").hide()
		$("#hiddenTbl thead").hide()
	}
	sortTable()
}


hideTeamRow = (tmNm)=>{
	let row = $('#eventTable tr[id='+tmNm+ ']').get();
	if( $('#eventTable tr[id='+tmNm+ ']').length == 0 ){
		$('#hiddenTbl tr[id='+tmNm+ ']')
			.detach()
			.appendTo("#eventTable");
			$('#eventTable tr[id='+tmNm+ '] > input').prop("unchecked")
	}else{
		$('#eventTable tr[id='+tmNm+ ']')
			.detach()
			.appendTo("#hiddenTbl tbody");
			$('#hiddenTbl tr[id='+tmNm+ '] > input').prop("checked")
	}
	showHiddenTable()
}


showAllTeams = ()=>{
	let mvRow = $("#hiddenTbl tbody tr" ).get() ;
	$.each( mvRow, (i, row)=>{ hideTeamRow( $(row).attr("id") ) }) ;
	showHiddenTable() ;
}


// Team highlighting 
highLightTmStrengths = ( hTmId, aTmId )=>{

	let tmHtds = $("td[str_h_a], td[str_h_d], td[str_h_o]" ).get() ; 
	let tmAtds = $("td[str_a_a], td[str_a_d], td[str_a_o]" ).get() ; 

	$.each(
		tmHtds,
		(i, strtdH )=>{
			
			if(parseInt( $(strtdH).attr("tmId") ) == hTmId ){ 
				$(strtdH).removeClass("shaded") ; 
				$(strtdH).addClass("unShade") ; 
			}else{
				$(strtdH).addClass("shaded") ; 				
				$(strtdH).removeClass("unShade") ; 
			}

	});

	$.each(
		tmAtds,
		( i, strtdA )=>{

			if(parseInt( $(strtdA).attr("tmId") ) == aTmId ){ 
				$(strtdA).removeClass("shaded") ; 
				$(strtdA).addClass("unShade") ; 
			}else{
				$(strtdA).addClass("shaded") ; 				
				$(strtdA).removeClass("unShade") ; 
			}

	});

}


normalTmStrengthsHL = ()=>{
	let tmHtds = $("td[str_h_a], td[str_h_d], td[str_h_o], td[str_a_a], td[str_a_d], td[str_a_o]" ).get() ; 
	$(tmHtds).removeClass("shaded") ; 
	$(tmHtds).removeClass("unShade") ; 
}


// Fixture highligting 
highlightEvent = (fxtrid)=>{
	//	console.log("('highlightEvent", fxtrid ,"$('td[fxtrid=' + fxtrid + ']').length",$('td[fxtrid=' + fxtrid + ']').length) ; 
	$('td[fxtrid=' + fxtrid + ']').addClass("evHighLite") ;
	// add teamid highligh for DFcontainer (H/A) 
}


shadeNotHL = ()=>{
	unShade() ; 
	let shadeArr = $("td.evtTeamBlock").get() ; 

	$.each(
		shadeArr,
		function(i, gm){
			if( $(gm).hasClass("evHighLite") ){
				console.log("shadeNotHL-- fxtr #", gm.fxtrid, " is highlighted.") ; 
			}else{
				$(gm).addClass("shaded") ; 
			}
		}
	) ; 
	setTimeout( unShade, 10000 ) ; 
}


unShade = ()=>{ $(".shaded").removeClass("shaded") ; }


highlightTeamEvents = (tmNm)=>{
	// console.log("highlightTeamEvents:\t", tmNm );

	let tmGmArr = $("tr[id='" + tmNm + "'] td.evtTeamBlock").get() ; 
	$(".evHighLite").removeClass("evHighLite") ; 
	remBGClasses() ; 
	$("tr[id] th:first-of-type").css("backgroundColor","#000000") ; 
	$("tr[id] th:first-of-type").css("color","#ffffff") ; 
	$("tr[id='" + tmNm + "'] th:first-of-type").addClass("bg"+tmNm) ; 

	$.each(
		tmGmArr,
		(index, gm)=>{
			let gmRnd = gm.getAttribute("evrnd") ; 
			let gmId = gm.getAttribute("fxtrid") ; 
			if( (gmRnd > gamesOverview.finishedRounds ) && (parseInt(gmId)!=999) ){
				$('td[fxtrid=' + gmId + ']').addClass("bg"+tmNm) ; 
				$('td[fxtrid=' + gmId + ']').addClass("evHighLite") ; 
			}
		}
	);

	shadeNotHL() ; 
}


remBGClasses = ()=>{ for( let c=1; c<FPLTeamsFull.length;c++){clsNm="bg"+FPLTeamsFull[c].shortNm;$("." + clsNm ).removeClass(clsNm);}}


/* 

###### section togglers  ######

*/

toggleDFdisplay = ()=>{
	// Toggle first 
	gamesOverview.dfDisplay['containerViz'] = !gamesOverview.dfDisplay['containerViz'] ;
	let dfViz = gamesOverview.dfDisplay['containerViz'] ; 
	gamesOverview.dfDisplay['strengthsViz'] 	= dfViz ;
	gamesOverview.dfDisplay['strengthsVizH'] 	= dfViz ;
	gamesOverview.dfDisplay['strengthsVizA'] 	= dfViz ;

	$("#toggleHAstatsDet").css("backgroundColor", ( gamesOverview.dfDisplay['strengthsViz'] )? "#53ac00":"#d91a00" ) ; 

	toggleDFContainer( gamesOverview.dfDisplay['containerViz'] ) ;
}


toggleDeadline = ()=>{
	gamesOverview.showDdln = !gamesOverview.showDdln ;
	showDeadline( gamesOverview.showDdln ) ; 
	setIndicator("showDdln-idc", ( gamesOverview.showDdln )? "green":"red" ) ; 
	$("#toggleDdln").text( (gamesOverview.showDdln)? "Hide":"Show" ) ; 
}


togglePPdisplay = ()=>{
	gamesOverview.showPP = !gamesOverview.showPP ;
	let isviz = gamesOverview.showPP ;
	$("#ppOview-cnt").removeClass( "show-item" ) ;
	$("#ppOview-cnt").removeClass( "hide-item" ) ;
	$("#togglePostponed").text( ( isviz )? "Show":"Hide" ) ;
	$("#hdr-tggl-ppnd").css("backgroundColor",  ( isviz )? "#D91A00":"#53AC00" ) ;
	$("#ppOview-cnt").addClass( ( isviz )? "hide-item":"show-item" ) ;
	setIndicator("ppsLdd-viz-idc", ( isviz )? "green":"red" ) ;
}


toggleSettings = ()=>{
	
	gamesOverview.showSttng = !gamesOverview.showSttng ;
	if( gamesOverview.showSttng ){
		$("#indicators").removeClass("hide-item");
		$("#indicators").addClass("show-item");
	}else{
		$("#indicators").removeClass("show-item")
		$("#indicators").addClass("hide-item")
	}

	$("#hdr-tggl-settings").css("backgroundColor",  (gamesOverview.showSttng)? "#53ac00":"#d91a00" );
}


/* 

###### SUB section togglers  ######

*/

toggleDFContainer = (viz)=>{
	/* set container visibilty to 'viz' */
	
	if( viz ){
		$("#fpl-df-viz").text( "Hide FPL-DF" );
		$("#usr-df-viz").text( "Hide USR-DF" );
		$("#df-tggl").text( "HIDE" );
		$("#teamDFCnt").removeClass( "hide-item" );
		$("#teamDFCnt").addClass( "show-item" );
		$("#hdr-tggl-df-fpl").css("backgroundColor", "#53ac00" );
		setIndicator("df-Ldd-idc","green")
	}else{
		$("#fpl-df-viz").text( "Show FPL-DF" );
		$("#usr-df-viz").text( "Show USR-DF" );
		$("#df-tggl").text( "SHOW" );
		$("#teamDFCnt").removeClass( "show-item" );
		$("#teamDFCnt").addClass( "hide-item" );
		$("#hdr-tggl-df-fpl").css("backgroundColor", "#d91a00");
		setIndicator("df-Ldd-idc","red")
	}
	toggleStrengthContainer();
}


toggleStrengthContainer = ()=>{
	/* set container visibilty to 'viz' */
	gamesOverview.dfDisplay['strengthsViz'] = !gamesOverview.dfDisplay['strengthsViz'] ;
	let vizC = gamesOverview.dfDisplay['strengthsViz'] ; 
	// console.log("toggleStrengthContainer vizC :" , vizC )
	gamesOverview.dfDisplay['strengthsVizH'] = !vizC ;
	toggleStrengthHome() ; 
	gamesOverview.dfDisplay['strengthsVizA'] = !vizC ;
	toggleStrengthAway() ; 
}


toggleStrengthHome = ()=>{
	// set table rows visibilty to 'viz' 
	// toggle because this can be called by buttons seperately 
	gamesOverview.dfDisplay['strengthsVizH'] =  !gamesOverview.dfDisplay['strengthsVizH'] ;

	if( gamesOverview.dfDisplay['strengthsVizH'] ){
		// console.log("toggleStrengthHome viz=true. " ) ;
		$("#tr_str_h_o").removeClass("df_h_hidden") ;
		$("#tr_str_h_a").removeClass("df_h_hidden") ;
		$("#tr_str_h_d").removeClass("df_h_hidden") ;
	}else{
		// console.log("toggleStrengthHome viz=false. " ) ;
		$("#tr_str_h_o").addClass("df_h_hidden") ;
		$("#tr_str_h_a").addClass("df_h_hidden") ;
		$("#tr_str_h_d").addClass("df_h_hidden") ;
	}

	$("#df_home button").text( ( gamesOverview.dfDisplay['strengthsVizH'] )? "Fold":"Expand" );
}


toggleStrengthAway = ()=>{
	// set table rows visibilty to 'viz' 
	// toggle because this can be called by buttons seperately 
	gamesOverview.dfDisplay['strengthsVizA'] =  !gamesOverview.dfDisplay['strengthsVizA'] ;

	if( gamesOverview.dfDisplay['strengthsVizA'] ){
		// console.log("toggleStrengthAway viz=true. " ) ;
		$("#tr_str_a_o").removeClass("df_a_hidden") ;
		$("#tr_str_a_a").removeClass("df_a_hidden") ;
		$("#tr_str_a_d").removeClass("df_a_hidden") ;
	}else{
		// console.log("toggleStrengthAway viz=false. " ) ;
		$("#tr_str_a_o").addClass("df_a_hidden") ;
		$("#tr_str_a_a").addClass("df_a_hidden") ;
		$("#tr_str_a_d").addClass("df_a_hidden") ;
	}

	$("#df_away button").text( ( gamesOverview.dfDisplay['strengthsVizA'] )? "Fold":"Expand" );
}


toggleDFuser = ()=>{
	console.log("toggleDFuser gamesOverview.dfSource User: ", gamesOverview.dfSource['user'] );
	if( gamesOverview.dfSource['user'] ){
		// now using FPL DF's, switch to user DF (if stored)
		console.log("toggleDFuser - now using USER DF " ) ; 
		loadUserDF() ; 
		
	}else{
		console.log("toggleDFuser - now using FPL DF " ) ; 
		loadFPLDF() ; 
	}
}


showDeadline = (blnSD)=>{	

	console.log("allStatsData?", allStatsData.length ) ; 

	if( allStatsData['events'].length > 0 ){

		for(let gw=0; gw < allStatsData['events'].length ; gw++){
		
				gmwk = allStatsData['events'][gw];
				let gwDdln = new Date( gmwk.deadline_time );
				let gwDdlnDate = gwDdln.toDateString() ;
				let gwDdlnHr = gwDdln.toLocaleTimeString().split(".")[0] + ":" + gwDdln.toLocaleTimeString().split(".")[1] ;
				let hdr = $("th[evrnd=" + gmwk["id"] + "]" ) ;
				$(hdr).text("");
					if(blnSD){
						$(hdr).append("<span>" + "Round: " + gmwk["id"] + "</br><time>" + gwDdlnDate + " " + gwDdlnHr + "</time></span>" );
					}else{
						$(hdr).append("<span>" + "Round: " + gmwk["id"] + "</span>" );
					}
		}

	}else{
		console.log("showDeadline no allStatsData['events'] available (yet?)");
	}
}


toggleReplanned = ()=>{
	// toggle first. og state is true
	gamesOverview.showRP  = !gamesOverview.showRP ;
	

	if( gamesOverview.showRP ){
		console.log("toggleReplanned rpIsViz now is" , gamesOverview.showRP ) ;

		$("#ppGamesRePlanned").removeClass( "hide-item" ) ;
		$("#ppGamesUnPlanned").removeClass( "show-item" ) ;

		$("#ppGamesRePlanned").addClass( "show-item" ) ;
		$("#ppGamesUnPlanned").addClass( "hide-item" ) ;	
	
	}else{
		console.log("toggleReplanned rpIsViz now is" , gamesOverview.showRP ) ;

		$("#ppGamesUnPlanned").removeClass( "hide-item" ) ;
		$("#ppGamesRePlanned").removeClass( "show-item" ) ;

		$("#ppGamesUnPlanned").addClass( "show-item" ) ;	
		$("#ppGamesRePlanned").addClass( "hide-item" ) ;
		
	}

}

showEventWindow(2);
