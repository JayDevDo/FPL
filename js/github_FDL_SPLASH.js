/*
Deals with opening splash while loading data
*/

splashOpenCheck = (adialog)=>{
	if (adialog.dialog.open) {
		console.log("Dialog open: ", 	adialog.dialog.returnValue 	);
	} else {
		console.log("Dialog closed: ", 	adialog.dialog.returnValue	);
	}
}


let splashDialog = 	$('#splash')
						.dialog(
									{
										'autoOpen': 	true,
										'modal': 		true,
										'resizable': 	true,
										'returnValue': 	0,
										'closeText': 	"init",
										'closeOnEscape': true,
										'min-width': parseInt(window.innerWidth),
										'min-height': parseInt(window.innerHeight),
										close: 	function(event,ui){ console.log("closing splash") },
										open: 	function(event,ui){ console.log("opening splash") },
										'position': {
											my: "left top", 
											at: "left top", 
											of: "#body", 
											collision: "fit",
										},
									}
						);

					// close: function( event, ui ) { console.log("closing splash") }

updateTheSplash = (newRetVal)=>{
	$(splashDialog).dialog.returnValue = newRetVal ;
}

closeTheSplash = ()=>{
	$(splashDialog).dialog( "option", "autoOpen", false );
	$(splashDialog).dialog( "option", "modal", false ) ;
	//$(splashDialog).dialog.close 	= true ;
	$(splashDialog).dialog('destroy') ;
}

updateTheSplash("loading...") ;
$(splashDialog).dialog('open') ;


