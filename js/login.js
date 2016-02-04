"use strict"
asl.options(null);
asl.title(null);
asl.back(null);

var username = null;
function login(){
	//asl.notify(asl.notifications.application,asl.priority.normal,'Mensaje:', wlan.getConnectionState()+' , '+wlan.connectionStateEvent.get(),['OK'],[null]);
	requestUser();
}

function requestUser(){ 
	var oTxtUsername = document.getElementById('txt_username');
	username = oTxtUsername.value; 
	var handle = function (obj){
		if(obj){
			if(obj.ajaxAnswer == AjaxAnswer.type.success){
				if(obj.data){
					decryptPassword(obj.data);
				}else{
					//asl.notify(asl.notifications.application,asl.priority.normal,'Mensaje:','Usuario no registrado.',['OK'],[null]);
					alert('El producto escaneado no coincide con el producto solicitado.');
				}
			} else if (obj.ajaxAnswer == AjaxAnswer.type.connectionError) {
				//asl.notify(asl.notifications.application,asl.priority.normal,'Error:','No se pudo conectar con el servidor.',['OK'],[null]);
				alert('Error: No se pudo conectar con el servidor.');
			} else {
				if (obj.data) {
					//asl.notify(asl.notifications.application,asl.priority.normal,'Error en el servidor:','('+obj.data.status+') '+obj.data.statusText,['OK'],[null]);
					alert('Error en el servidor: ('+obj.data.status+') '+obj.data.statusText);
				}
			}
		}
		
	};
	var url = oCfg.phpPath + 'getUser.php?user='+username;
	ajaxRequest('GET', url, handle);
	
}

function decryptPassword(user){
	var oTxtPassword = document.getElementById('txt_password');
	var password = oTxtPassword.value;
	var handle = function (obj){
		if(obj){
			if(obj.ajaxAnswer == AjaxAnswer.type.success){
				if(obj.data){
					oStorage.store('oUser',user);
					window.location = 'productInfo.html';
				}else{
					//asl.notify(asl.notifications.application,asl.priority.normal,'Mensaje:','Password Incorrecto.',['OK'],[null]);
					alert('Password Incorrecto.');
				}
			} else if (obj.ajaxAnswer == AjaxAnswer.type.connectionError) {
				//asl.notify(asl.notifications.application,asl.priority.normal,'Error:','No se pudo conectar con el servidor.',['OK'],[null]);
				alert('Error: No se pudo conectar con el servidor.');
			} else {
				if (obj.data) {
					//asl.notify(asl.notifications.application,asl.priority.normal,'Error en el servidor:','('+obj.data.status+') '+obj.data.statusText,['OK'],[null]);
					alert('Error en el servidor: ('+obj.data.status+') '+obj.data.statusText);
				}
			}
		}
	};
	
	var url = oCfg.phpPath + 'validatePassword.php?username='+ username +'&password='+ password;

	ajaxRequest('GET', url, handle);
}