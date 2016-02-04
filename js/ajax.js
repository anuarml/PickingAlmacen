var AjaxAnswer = {};

AjaxAnswer.type = {
	success:0,
	connectionError:1,
	serverError:2
};

function ajaxRequest(method, url, handle, data){
	var xmlhttp;

	if (window.XMLHttpRequest) {
		// code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp = new XMLHttpRequest();
	} else { // code for IE6, IE5
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	
	xmlhttp.onreadystatechange = function (){
		if (xmlhttp.readyState==4){
			if(xmlhttp.status==200){
				var response = xmlhttp.responseText.trim()
				try{
					var obj = {};
					obj.data = JSON.parse(response);
	                obj.ajaxAnswer = AjaxAnswer.type.success;
	            	handle(obj);
	            }
		        catch(e){
		            alert('Error en el servidor: ' + response);
					console.log(response +' '+e.message);
		        }
		    }
		    else if(xmlhttp.status==0){
		    	handle({
					data:null,
					ajaxAnswer:AjaxAnswer.type.connectionError
				});
		    	//asl.notify(asl.notifications.application,asl.priority.normal,'Mensaje:','No se pudo conectar con el servidor.',['OK'],[ajaxErrorConnection]);
		    }
		    else{
		    	handle({
					data:{status:xmlhttp.status, statusText:xmlhttp.statusText},
					ajaxAnswer:AjaxAnswer.type.serverError
				});
		    	//asl.notify(asl.notifications.application,asl.priority.normal,'Mensaje:','('+xmlhttp.status+') '+xmlhttp.statusText,['OK'],[ajaxServerError]);
		    }
		}
	};
	// Llamar al web service del lado del servidor.

	xmlhttp.open( method, url, true);

	if(method == 'POST'){
		xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	}

	xmlhttp.send(data);
}