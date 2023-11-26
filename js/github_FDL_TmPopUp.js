
gamesOverview.selectedTeamId = parseInt(location.href.split("=")[1]);
let typeCount = [0,0,0,0,0];

console.log( "loading teamPopUp.js " );

console.log( 	
	"FPLTeamsFull:\t", FPLTeamsFull.length ,  
	"FPLballers:\t", FPLballers.length , 
	"selectedTeamId:\t", gamesOverview.selectedTeamId ,
	"totalMins",  parseInt( gamesOverview.currentRnd * 90 )
);

let bgClsNm = "bg" + FPLTeamsFull[gamesOverview.selectedTeamId].shortNm;

if(FPLballers.length < 500 ){
	console.log("before loading elements", Date.now() )
	loadElements();
}else{
	console.log( "elements 2:\t", FPLballers.length )
}

console.log("selectedTeamId:\t", gamesOverview.selectedTeamId )
console.log("go ! .....")
console.log(
	"shortNm:\t", 	FPLTeamsFull[gamesOverview.selectedTeamId].shortNm ,
	"\nlongNm:\t", 	FPLTeamsFull[gamesOverview.selectedTeamId].longNm ,
	"\naltNm:\t", 	FPLTeamsFull[gamesOverview.selectedTeamId].altNm ,
	"\nplayers:\t", FPLTeamsFull[gamesOverview.selectedTeamId].players.length ,
	"\nlocDF:\t", 	FPLTeamsFull[gamesOverview.selectedTeamId].fplDF.toString() ,
	"\ncls:\t",		bgClsNm
)


function minuteDisplay(m,r){
	console.log("minuteDisplay -m: ", m, "\t-r:",r );
	let mdRetVal = (( m / parseInt(r * 90) ) * 100).toFixed(2) ;
	console.log("minuteDisplay returns:\t", mdRetVal ) ;
	return m.toString() + " (" +  mdRetVal.toString()  + "%)" ;
}



function loadElements(){
	let ballersXhttp = new XMLHttpRequest();

	ballersXhttp.open("GET", "json/current/FPL_Static_current.json", true);

	ballersXhttp.send();

	ballersXhttp.onreadystatechange = function(){

		if( this.readyState == 4 && this.status == 200 ){

			ballersRaw = JSON.parse( this.responseText );
			FPLballers = ballersRaw['elements'] ;
			console.log("loadElements:\t", Date.now() ,"\tFPLballers.length", FPLballers.length )

			for(let b=0; b < FPLballers.length ; b++){

				if( FPLballers[b].status == 'u' || FPLballers[b].status == 'n' ){
					// console.log( FPLballers[b].web_name ,"\t",FPLballers[b].team ,"\t" ,FPLballers[b].status ) ;
				}else{
					typeCount[parseInt(FPLballers[b].element_type)-1] += 1 ;
				}

				if( parseInt(FPLballers[b].team) == parseInt(gamesOverview.selectedTeamId) ){

					FPLTeamsFull[gamesOverview.selectedTeamId].players.push(FPLballers[b]);
					// console.log("added:\t", baller.web_name, "team size:\t", FPLTeamsFull[gamesOverview.selectedTeamId].players.length )
				}

			}

			console.log("typeCount", typeCount );


			$("#tpu_tbl_fpl_df_H_o").text( FPLTeamsFull[gamesOverview.selectedTeamId].strength[0]['overall'] ) ;
			$("#tpu_tbl_fpl_df_H_a").text( FPLTeamsFull[gamesOverview.selectedTeamId].strength[0]['attack']  ) ;
			$("#tpu_tbl_fpl_df_H_d").text( FPLTeamsFull[gamesOverview.selectedTeamId].strength[0]['defence'] ) ;

			$("#tpu_tbl_fpl_df_A_o").text( FPLTeamsFull[gamesOverview.selectedTeamId].strength[1]['overall'] ) ;
			$("#tpu_tbl_fpl_df_A_a").text( FPLTeamsFull[gamesOverview.selectedTeamId].strength[1]['attack']  ) ;
			$("#tpu_tbl_fpl_df_A_d").text( FPLTeamsFull[gamesOverview.selectedTeamId].strength[1]['defence'] ) ;

			let gk_stats = [0,0,0,0];
			let def_stats = [0,0,0,0];
			let mid_stats = [0,0,0,0];
			let fwd_stats = [0,0,0,0];

			for(let p=0; p < FPLTeamsFull[gamesOverview.selectedTeamId].players.length; p++ ){

				let tmPlayer = FPLTeamsFull[gamesOverview.selectedTeamId].players[p];

				if( (parseInt(tmPlayer.minutes) < 1) && (gamesOverview.currentRnd > 1) ){
					console.log( tmPlayer.web_name, "\thas notplayed (yet).")
				}else{

					switch (tmPlayer.element_type){

						case 1:
								// console.log("GKP")
								let gk_row = [
									"<tr class='tpu_gkp_rw' id=' ", tmPlayer.id, "' >", 
									"<th>",	tmPlayer.web_name, "</th>",
									"<td>", minuteDisplay(tmPlayer.minutes,gamesOverview.currentRnd) ,"</td>",
									"<td>", tmPlayer.influence, " ( ",tmPlayer.influence_rank_type ,")</td>",
									"<td>", tmPlayer.creativity, " ( ",tmPlayer.creativity_rank_type ,")</td>",
									"<td>", tmPlayer.threat, " ( ",tmPlayer.threat_rank_type ,")</td>",
									"</tr>" ].join("")
									$("#tpu_tbl_GK tbody").append(gk_row);

									gk_stats[0] += parseFloat(tmPlayer.minutes)
									gk_stats[1] += parseFloat(tmPlayer.influence)
									gk_stats[2] += parseFloat(tmPlayer.creativity)
									gk_stats[3] += parseFloat(tmPlayer.threat)
								break; 

						case 2:
								// console.log("DEF")
								let def_row = [
									"<tr class='tpu_def_rw' id=' ", tmPlayer.id, "' >", 
									"<th>",	tmPlayer.web_name, "</th>",
									"<td>", minuteDisplay(tmPlayer.minutes,gamesOverview.currentRnd) ,"</td>",
									"<td>", tmPlayer.influence, " ( ",tmPlayer.influence_rank_type ,")</td>",
									"<td>", tmPlayer.creativity, " ( ",tmPlayer.creativity_rank_type ,")</td>",
									"<td>", tmPlayer.threat, " ( ",tmPlayer.threat_rank_type ,")</td>",
									"</tr>" ].join("")
									$("#tpu_tbl_DEF tbody").append(def_row);
									def_stats[0] += parseFloat(tmPlayer.minutes)
									def_stats[1] += parseFloat(tmPlayer.influence)
									def_stats[2] += parseFloat(tmPlayer.creativity)
									def_stats[3] += parseFloat(tmPlayer.threat)
								break; 

						case 3:  
								// console.log("MID")
								let mid_row = [
									"<tr class='tpu_mid_rw' id=' ", tmPlayer.id, "' >", 
									"<th>",	tmPlayer.web_name, "</th>",
									"<td>", minuteDisplay(tmPlayer.minutes,gamesOverview.currentRnd) ,"</td>",
									"<td>", tmPlayer.influence, " ( ",tmPlayer.influence_rank_type ,")</td>",
									"<td>", tmPlayer.creativity, " ( ",tmPlayer.creativity_rank_type ,")</td>",
									"<td>", tmPlayer.threat, " ( ",tmPlayer.threat_rank_type ,")</td>",
									"</tr>" ].join("")
									$("#tpu_tbl_MID tbody").append(mid_row);
									mid_stats[0] += parseFloat(tmPlayer.minutes)
									mid_stats[1] += parseFloat(tmPlayer.influence)
									mid_stats[2] += parseFloat(tmPlayer.creativity)
									mid_stats[3] += parseFloat(tmPlayer.threat)
								break; 

						case 4:
								// console.log("FWD")
								let fwd_row = [
									"<tr class='tpu_fwd_rw' id=' ", tmPlayer.id, "' >", 
									"<th>",	tmPlayer.web_name, "</th>",
									"<td>", minuteDisplay(tmPlayer.minutes,gamesOverview.currentRnd) ,"</td>",
									"<td>", tmPlayer.influence, " ( ",tmPlayer.influence_rank_type ,")</td>",
									"<td>", tmPlayer.creativity, " ( ",tmPlayer.creativity_rank_type ,")</td>",
									"<td>", tmPlayer.threat, " ( ",tmPlayer.threat_rank_type ,")</td>",
									"</tr>" ].join("")
									$("#tpu_tbl_FWD tbody").append(fwd_row);
									fwd_stats[0] += parseFloat(tmPlayer.minutes)
									fwd_stats[1] += parseFloat(tmPlayer.influence)
									fwd_stats[2] += parseFloat(tmPlayer.creativity)
									fwd_stats[3] += parseFloat(tmPlayer.threat)
								break;

						default:
								console.log("default??")
					}
				}
	
			}

			$("body").addClass( bgClsNm )
			$("#tpu_TmNmLong").text(  FPLTeamsFull[gamesOverview.selectedTeamId].longNm );
			$("#tpu_TmNmShort").text( FPLTeamsFull[gamesOverview.selectedTeamId].shortNm );
			$("#tpu_TmNmAlt").text(   FPLTeamsFull[gamesOverview.selectedTeamId].altNm );

			$("#tpu_gkp_ttl_min").text( minuteDisplay( gk_stats[0], gamesOverview.currentRnd) );
			$("#tpu_gkp_ttl_inf").text( gk_stats[1].toFixed(2).toString() );
			$("#tpu_gkp_ttl_cre").text( gk_stats[2].toFixed(2).toString() );
			$("#tpu_gkp_ttl_thr").text( gk_stats[3].toFixed(2).toString() );

			$("#tpu_def_ttl_min").text( minuteDisplay( def_stats[0], gamesOverview.currentRnd) );
			$("#tpu_def_ttl_inf").text( def_stats[1].toFixed(2).toString() );
			$("#tpu_def_ttl_cre").text( def_stats[2].toFixed(2).toString() );
			$("#tpu_def_ttl_thr").text( def_stats[3].toFixed(2).toString() );

			$("#tpu_mid_ttl_min").text( minuteDisplay( mid_stats[0], gamesOverview.currentRnd) );
			$("#tpu_mid_ttl_inf").text( mid_stats[1].toFixed(2).toString() );
			$("#tpu_mid_ttl_cre").text( mid_stats[2].toFixed(2).toString() );
			$("#tpu_mid_ttl_thr").text( mid_stats[3].toFixed(2).toString() );

			$("#tpu_fwd_ttl_min").text( minuteDisplay( fwd_stats[0], gamesOverview.currentRnd) );
			$("#tpu_fwd_ttl_inf").text( fwd_stats[1].toFixed(2).toString() );
			$("#tpu_fwd_ttl_cre").text( fwd_stats[2].toFixed(2).toString() );
			$("#tpu_fwd_ttl_thr").text( fwd_stats[3].toFixed(2).toString() );

		}
	}
}





/*
gkp =  50
def = 190
mid = 220
fwd	=  58 	+
---------------
      518

{
	"chance_of_playing_next_round":null,
	"chance_of_playing_this_round":null,
	"code":58822,
	"cost_change_event":0,
	"cost_change_event_fall":0,
	"cost_change_start":0,
	"cost_change_start_fall":0,
	"dreamteam_count":0,
	"element_type":2,
	"ep_next":"2.3",
	"ep_this":null,
	"event_points":0,
	"first_name":"Cédric",
	"form":"0.0",
	"id":1,
	"in_dreamteam":false,
	"news":"",
	"news_added":null,
	"now_cost":45,
	"photo":"58822.jpg",
	"points_per_game":"2.3",
	"second_name":"Alves Soares",
	"selected_by_percent":"0.3",
	"special":false,
	"squad_number":null,
	"status":"a",
	"team":1,
	"team_code":3,
	"total_points":48,
	"transfers_in":0,
	"transfers_in_event":0,
	"transfers_out":0,
	"transfers_out_event":0,
	"value_form":"0.0",
	"value_season":"10.7",
	"web_name":"Cédric",
	"minutes":1481,
	"goals_scored":1,
	"assists":1,
	"clean_sheets":3,
	"goals_conceded":27,
	"own_goals":0,
	"penalties_saved":0,
	"penalties_missed":0,
	"yellow_cards":3,
	"red_cards":0,
	"saves":0,
	"bonus":3,
	"bps":292,
	"influence":"318.4",
	"creativity":"327.1",
	"threat":"111.0",
	"ict_index":"75.8",
	"influence_rank":202,
	"influence_rank_type":79,
	"creativity_rank":111,
	"creativity_rank_type":24,
	"threat_rank":232,
>>>>"threat_rank_type":78,
	"ict_index_rank":192,
>>>>"ict_index_rank_type":61,
	"corners_and_indirect_freekicks_order":2,
	"corners_and_indirect_freekicks_text":"",
	"direct_freekicks_order":3,
	"direct_freekicks_text":"",
	"penalties_order":null,
	"penalties_text":""

}
*/
