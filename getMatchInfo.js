/* this works */
/* 
    FPLTeams array has 'team' on idx 0 
    1: to be in sync with FPL teamIds (start with Arsenal = 1) 
    2: to be in sync with table rows.
*/

const FPLTeams = [  
/* 0 */ "Team", 
/* 1 */ "ARS",  
/* 2 */ "AVL", 
/* 3 */ "BHA", 
/* 4 */ "BUR", 
/* 5 */ "CHE", 
/* 6 */ "CRY", 
/* 7 */ "EVE", 
/* 8 */ "FUL", 
/* 10 seems odd LEE comes before LEI */ "LEI", 
/* 9  seems odd LEE comes before LEI */ "LEE", 
/* 11 */ "LIV", 
/* 12 */ "MNC", 
/* 13 */ "MUN", 
/* 14 */ "NEW", 
/* 15 */ "SHU", 
/* 16 */ "SOU",  
/* 17 */ "TOT", 
/* 18 */ "WBA", 
/* 19 */ "WHU", 
/* 20 */ "WOL"
];

/* url from FPL with data */
const json_string = 'https://fantasy.premierleague.com/api/fixtures/?event>0';

/* CORS workaround to avoid cross origin header blockage */
const cors_api_url = 'https://cors-anywhere.herokuapp.com/';

/* 
    heroku app has tightened rest request amounts, 
    so when devloping first get the latest event file and save as json 
*/
const localJsonFile = "events_2020-2021.json";

/* 
    rndsPlayed  will be changed once FPL data is loaded 
    Due to changes in the calendar the eventround is now set manually
*/
let rndsPlayed  = 30;

let ppEevents   =   [ 
						{"id": 379, "oldRnd": 1, "newRnd": 39 }, // 1  
						{"id": 380, "oldRnd": 1, "newRnd": 39 }  // 2  
						/* 
						{"id": 379, "oldRnd": 1, "newRnd": 38 }, // 1
						*/  
					];


/*  Array to store the event data from FPL */
let FPL_TD = [ 
                {   
                    "tmId": 0,
                    "tmNm": "Team",
                    "tmHm": 0, /* This is how difficult ia this team at Home */
                    "tmAw": 0 /* This is how difficult ia this team Away */
                },
                {   
                    "tmId": 1,
                    "tmNm": "ARS",
                    "tmHm": 4,
                    "tmAw": 3
                },
                {   
                    "tmId": 2,
                    "tmNm": "AVL",
                    "tmHm": 3,
                    "tmAw": 2
                },
                {   
                    "tmId": 3,
                    "tmNm": "BHA",
                    "tmHm": 3,
                    "tmAw": 2
                },
                {   
                    "tmId": 4,
                    "tmNm": "BUR",
                    "tmHm": 3,
                    "tmAw": 2
                },
                {   
                    "tmId": 5,
                    "tmNm": "CHE",
                    "tmHm": 4,
                    "tmAw": 3
                },
                {   
                    "tmId": 6,
                    "tmNm": "CRY",
                    "tmHm": 3,
                    "tmAw": 2
                },
                {   
                    "tmId": 7,
                    "tmNm": "EVE",
                    "tmHm": 3,
                    "tmAw": 2
                },
                {   
                    "tmId": 8,
                    "tmNm": "FUL",
                    "tmHm": 2,
                    "tmAw": 2
                },
                {   
                    "tmId": 9,
                    "tmNm": "LEI",
                    "tmHm": 4,
                    "tmAw": 3
                },
                {   
                    "tmId": 10,
                    "tmNm": "LEE",
                    "tmHm": 3,
                    "tmAw": 2
                },
                {   
                    "tmId": 11,
                    "tmNm": "LIV",
                    "tmHm": 5,
                    "tmAw": 4
                },
                {   
                    "tmId": 12,
                    "tmNm": "MNC",
                    "tmHm": 5,
                    "tmAw": 4
                },
                {   
                    "tmId": 13,
                    "tmNm": "MUN",
                    "tmHm": 4,
                    "tmAw": 4
                },
                {   
                    "tmId": 14,
                    "tmNm": "NEW",
                    "tmHm": 3,
                    "tmAw": 2
                },
                {   
                    "tmId": 15,
                    "tmNm": "SHU",
                    "tmHm": 3,
                    "tmAw": 3
                },
                {   
                    "tmId": 16,
                    "tmNm": "SOU",
                    "tmHm": 3,
                    "tmAw": 3
                },
                {   
                    "tmId": 17,
                    "tmNm": "TOT",
                    "tmHm": 4,
                    "tmAw": 3
                },
                {   
                    "tmId": 18,
                    "tmNm": "WBA",
                    "tmHm": 2,
                    "tmAw": 2
                },
                {   
                    "tmId": 19,
                    "tmNm": "WHU",
                    "tmHm": 4,
                    "tmAw": 2
                },
                {   
                    "tmId": 20,
                    "tmNm": "WOL",
                    "tmHm": 3,
                    "tmAw": 3
                }
 ];

function loadDoc() {
    /* Get the data from FPL thru CORS evasion site and save data */

    let xhttp = new XMLHttpRequest();
    let arrB4Sort = [];

    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            arrB4Sort = JSON.parse(this.responseText);
            console.log("arrB4Sort ", arrB4Sort )

            /* Adding team names to events */
            for (let ev = 0; ev < arrB4Sort.length; ev++) {

                arrB4Sort[ev].team_h_nm = FPLTeams[arrB4Sort[ev].team_h];
                arrB4Sort[ev].team_a_nm = FPLTeams[arrB4Sort[ev].team_a];
                arrB4Sort[ev].ev_df_df = cmp_OppDF(  arrB4Sort[ev] )

                printMatch(arrB4Sort[ev])
                
                let evId = arrB4Sort[ev].id; 
                    
                        if( evId == 379 ) {
                            // 379: BUR V MNU summer break uefa
                            arrB4Sort[ev].event = 38; 
                        }else if( evId == 380 ){
                            //  380: MNC v AVL summer break uefa
                            arrB4Sort[ev].event = 38;
                        }
                    
            }

            /* localhost://JAVA/FPL/FPL/index.html */

            FPLData = arrB4Sort.sort(
                function (a, b) {
                    let A = a.event;
                    let B = b.event;
                    // console.log( "comparing events:", a.id, "and ", b.id );
                    if (parseInt(A) < parseInt(B)) { return -1; }
                    if (parseInt(A) > parseInt(B)) { return 1; }
                    return 0;
                }
            );

            /* Now the data is available activate buttons for selection of rounds */
            $("button").attr("disabled", false);

            /* Determine which rounds have finished, which are still to play */
            
            // rndsPlayed = getNextRound();
        }
    };

    let pageLoc = location.href;
    let serverUrl = pageLoc.split("/")[2];

    if( serverUrl !== "jaydevdo.github.io" ){
      // served local
        console.log("served local. data from ", localJsonFile)
        xhttp.open("GET", localJsonFile, true);
    }else{
      // served github
      //  xhttp.open("GET", cors_api_url + json_string, true);
	console.log("served github. data from ", localJsonFile)
        xhttp.open("GET", localJsonFile, true);    
    }

    xhttp.send();
}


function printMatch(fplGame){
    let slctdTm = 9
    if( fplGame.team_h == slctdTm ){
        console.log(fplGame.id, FPLTeams[slctdTm], " (", fplGame.team_h_difficulty, ") v", FPLTeams[fplGame.team_a], " (", fplGame.team_a_difficulty, ")" )
    }
}



loadDoc();

/* 
tab controls
*/
let ActiveTabNumber = 0;

function showEvent(id){
    for(let e=0; e< FPLData.length; e++){ if( FPLData[e].id == id ){ return FPLData[e]; }}
}

function markCurrentRound(curRound){
    let tblHdr = $('#tbl thead tr th').toArray();
    for (let c = 1; c < 40; c++) {
        if ( c == curRound ) { tblHdr[c].classList += "curRound"; }
    }
}

function hideRoundsPlayed(curRound) {
    /* to hide table header rounds that have finished */
    let tblHdr = $('#tbl thead tr th').toArray();
    console.log("hideRoundsPlayed > tblHdr len", tblHdr.length )
    for (let c = 0; c < 40; c++) {
        tblHdr[c].classList = "";
        if ((c > 1) && (c <= (curRound + 1))) { tblHdr[c].classList += "clmnHide"; }
    }
}

function getNextRound() {
    return rndsPlayed;
    /* determins which rounds have been played (or at least selection is closed) */
    // console.log( " FPLData.length", FPLData.length, "FPLData[r].finished", FPLData[0].finished );

    /* 
        let nrpRetVal = 1;
        for(let r=38; r>0; r--){
            let evtArr=[];
            evtArr = fltrEventsByRound(r);
            function fnIsFin(ev){ return !ev.finished ; }
            
            // console.log("getnxtround check r", r, evtArr.filter(fnIsFin).length)
            
            if( evtArr.filter(fnIsFin).length < 10 ){
                nrpRetVal = r;
                rndsPlayed = nrpRetVal;
                // console.log("nrpRetVal:", nrpRetVal)
                return nrpRetVal; 
            }
        }
    */    
}

function getAllTeams(rndCnt) {
    /* loops through all teams and gets their opponents relevant data */
    console.log("getAllTeams r+", rndCnt);
    for (let t = 1; t < 21; t++) { getTeams(t, rndCnt); }
    console.log("marking postponed..", markPostponed() )
    console.log("hiding played games..", hidePastEvents() )
    console.log("fillTmDFTable..", fillTmDFTable() )
}

function hidePastEvents(){
    let tdevents = $( "td[plyd='true']" ); 
    let tdRounds = $( "td[insel='false']" ); 
    console.log("td_inselection=false", tdRounds.length )
    if( tdRounds.length >= 0 ) { tdRounds.addClass( "tchide" ); } 
    return tdRounds.length + " hidden";
}

function markPostponed(){
    // ppEevents is an array with postponed games declared earlier
    jQuery.each( 
        ppEevents, 
        function(i,val){
            let tdevents = $( "td[evid='" + val.id + "']"  ); 
            console.log(
                "jQuery.each....", val.id , "check:",
                tdevents.length ,
                tdevents.addClass("postponed") 
            );
        }
    )
    return ppEevents.length + " postponed";
}


/*
<td class="evtTeamBlock" loc="A" df="3" plyd="false" insel="true" evid="303" onclick="fn_teamStats(4,9)" title="303: LEI (A)">31: LEI (A)</td>
*/

function fltrFPLData(dataArr, tmId){
    let retResArr = [];
    console.log("fltrFPLData", dataArr.length , "tmId", tmId );

    for (let d=0; d < dataArr.length; d++) {
        let A = dataArr[d].team_h == tmId ;
        let B = dataArr[d].team_a == tmId ;
            // console.log( "comparing events:", a.id, "and ", b.id );
            if ( A || B ){ retResArr.push(dataArr[d]); }
    }
 
    // console.log("dataArr after filter: ", retResArr.length )
    return retResArr;
}


function getTeams(tmId, rnds) {
    /* 
        Gets the data of the coming opponents for 1 team. 
        Adds these games to table body row of the team it's called on.
        Calculates (sum) difficulty factor of each opponent still to play. 
    */
    let OppList = [];
    let ttlDF = 0;

    if (FPLData) {
        //  console.log("FPLData len:", FPLData.length );
        console.log("filtered FPLData:", fltrFPLData(FPLData, tmId) )

        for (let i = 0; i < FPLData.length; i++ ) {
            let event = FPLData[i];
            let gtres;
            
            /* Only count games not played and selected number of rounds by user */
            let rndSelected = ((event.event > rndsPlayed) && (event.event <= (rndsPlayed + rnds)));
            // console.log("event.event",event.event ,"rndsPlayed",rndsPlayed , "rnds", rnds, ' rndSelected', rndSelected)
            // console.log("rndSelected = ", rndSelected )
            let eventAdded = false;

            if (event.team_h == tmId) { /* selected team is playing at Home */
                
                eventAdded = true
                
                /*
                console.log(
                    "getTeams_FPLData: event.team_h:", 
                    tmId, "nm:", FPLTeams[tmId],"rnd:", event.event
                );
                */

                if (rndSelected) { ttlDF += FPL_TD[event.team_a].tmAw; }

                FPL_TD[tmId].tmId = tmId;
                FPL_TD[tmId].tmNm = FPLTeams[tmId],
                // FPL_TD[tmId].tmHm = event.team_h_difficulty;

                OppList.push({ 
                    "eventId": event.id ,
                    "evround": event.event,
                    "loc": "H", 
                    "curTmId": event.team_h,
                    "opp": event.team_a, 
                    "dfc": FPL_TD[event.team_a].tmAw, 
                    "OpNm": FPLTeams[event.team_a], 
                    "plyd": event.finished, 
                    "inSel": rndSelected
                });
            } else if (event.team_a == tmId) {
                /* selected team is playing Away */
                eventAdded = true;

                if (rndSelected) { ttlDF += FPL_TD[event.team_h].tmHm; }

                FPL_TD[tmId].tmId = tmId;
                FPL_TD[tmId].tmNm = FPLTeams[tmId],
                // FPL_TD[tmId].tmAw = event.team_a_difficulty;

                OppList.push({ 
                    "eventId": event.id ,
                    "evround": event.event,
                    "loc": "A", 
                    "curTmId": event.team_a,
                    "opp": event.team_h, 
                    "dfc": FPL_TD[event.team_h].tmHm, 
                    "OpNm": FPLTeams[event.team_h], 
                    "plyd": event.finished, 
                    "inSel": rndSelected
                });
            }

            // if ( eventAdded == true ){ console.log(i, "OppList", OppList) }
        }

    }

    /* clear earlier selections */
    $(".DF_overview #" + FPLTeams[tmId] + " > td").remove();

    /* Add td with sum of selected games difficulty factor/coefficient */
    $("<td class='dfc'>" + ttlDF + "</td>").appendTo("#" + FPLTeams[tmId]);

    /* Add all selected games to the team row after diff. factor */
    jQuery.each(OppList, function (i, val) {
        let evntClassList = ["evtTeamBlock"];
        /* hide cell if round has been played */
        
        if( val.plyd ) { evntClassList.push( "played" ); } 
        
        $(
            "<td class='"   + evntClassList.join(" ") + 
            "' loc="        + val.loc + 
            " plyd="        + val.plyd + 
            " inSel="       + val.inSel + 
            " evId="        + val.eventId +   
            " evRnd="       + val.evround +
            " evOtmID="     + val.opp +
            " title='"      + val.eventId + 
            ": "            + val.OpNm + 
            " df="          + val.dfc +
            " ("            + val.loc + 
            ")' >"    /*      + val.evround + 
            ": "       */     + val.OpNm + 
            " ("            + val.loc + " - " + val.dfc + ")</td>"
        ).appendTo("#" + FPLTeams[tmId]);
    });

    /* Hide table header column if round has been played */
    hideRoundsPlayed(rndsPlayed);
//    markCurrentRound(rndsPlayed);

    /* Sort table based on difficulty of selected next games */
    sortTable();
}

/* 
    This will return the events array (= FPLData) filtered by the rounds from parameters
    The paramater will be a logical string condition ie "= 1" or ""> 4"
*/

let eventRndFltrVal = 1;

function rndFltrFnc(arrVal) { return ( parseInt(arrVal.event) === eventRndFltrVal ); }
function pstpndRndFltrFnc(arrVal) { return ( arrVal.event === 0 ); }

function fillTmDFTable(){
    console.log("fillTmDFTable GMI.js")
    for (let t = 1; t < 21; t++) {  
        let dfTeam      = FPL_TD[t]

        // $( "#tm_df_tbl tr[tmid='1']" ).length

        /* clear earlier selections */

        // console.log("fillTmDFTable-dfTeam", dfTeam, "targetRow", targetRow.length)

        $(
            "<td class='"   + "df_hm"       + 
            "' df="         + dfTeam.tmHm   + 
            ">"             + dfTeam.tmHm   + 
            "</td><td> - </td>" +
            "<td class='"   + "df_aw"       + 
            "' df="         + dfTeam.tmAw   + 
            ">"             + dfTeam.tmAw   + 
            "</td>"
        ).appendTo(targetRow);

    }
}


function fltrEventsByRound(EvtRnd){ 
    eventRndFltrVal = EvtRnd;
    let retEvtsArr = [];
    retEvtsArr = FPLData.filter(rndFltrFnc) ;
    return retEvtsArr ;
}

function showRoundCount(startRound){ 
    if( !startRound ){ startRound = getNextRound(); }

    for(let i=startRound; i<39; i++){ 
        let a= fltrEventsByRound(i); 
        console.log("round", i, a.length )
    }

    let b = FPLData.filter(pstpndRndFltrFnc) ;
    console.log("not planned", b.length )

}

/* 
    This will return the events array filtered by the team id from parameters
    The paramater will be an integer
*/
function fltrEventsByTeam(){ 
    
    if (FPLData) {}

}


/* 
    This will return the events array filtered by the state (finished) from parameters
    The paramater will be a boolean
*/
function fltrEventsByState(){ 

    if (FPLData) {}

}

/* 
    This will check for event (round) status.
    all events finihed means round finished,
    no events finished means round to play,
    any other combination means rouns active.
*/
function determineActiveRound(){
let darRetVal = 1; 
    if (FPLData) {
        for(let r=1;r<49;r++){ 
            if( fltrEventsByRound(r).length === 0 ){ 
                darRetVal = (r-1) ;
                rndsPlayed = darRetVal ; 
                console.log("determineActiveRound.rndsPlayed:", darRetVal )
                return darRetVal;
            } 
        }    
    }

}

function sortTable() {
    /* Sort table based on difficulty of selected next games */
    let rows = $('#tbl tbody tr').get();
    rows.sort(
        function (a, b) {
            let A = $(a).children('td.dfc').text();
            let B = $(b).children('td.dfc').text();
            if (parseInt(A) < parseInt(B)) { return -1; }
            if (parseInt(A) > parseInt(B)) { return 1; }
            return 0;
        }
    );
    $.each(rows, function (index, row) {
        $('#tbl').children('tbody').append(row);
    });
}

