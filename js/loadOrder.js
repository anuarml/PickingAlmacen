"use strict"
var keyboardIsShowed = false;
var wifiEnabled = true;
var order = null;
var showedProductNum = -1;
var backCalled = false;
var orderQuantity = null;
var	inventoryQuantity = null;
var	scanQuantity = null;
var	totalQuantity = null;
var dvOffice = null;
var dvArticleNumber = null;
asl.events.subscribe(asl.events.types.loaded, initFields);
asl.events.subscribe(asl.events.types.loaded, insertOrder);
asl.events.subscribe(asl.events.types.loaded, onLoad);
asl.events.subscribe(asl.events.types.focus, showKBonFocus);
asl.events.subscribe(asl.events.types.exit, function(){	if(!wifiEnabled) wlan.enableAdapter();});

asl.options([
	/*{
		title: 'Buscar producto',
		callback: function(){
			var pos = arraySearch(order.products, txt_search.value);
			showProductInfo(pos);
		}
	},*/
	{
		title: 'Terminar Orden',
		callback: function(){
			terminateOrder();
		}
	},
	{
		title: 'Salir',
		callback: function(){
			/*asl.notify(asl.notifications.application,asl.priority.normal,'¡Atención!', '¿Deseas guardar la orden?',['Si','No'],[exitAndSaveOrder,exitAndDeleteOrder]);*/
			confirm('¿Deseas guardar la orden?',function(confirmed){
                if(confirmed){
                    exitAndSaveOrder();
                }else{
                	exitAndDeleteOrder();
                }
            });
		}
	}
]);

asl.back(function(){

	// La función back se llama dos veces, una con el evento mousedown y otra con mouseup.
	// Condición para evitar llamar dos veces a la función showPreviousProduct.
	if(backCalled){
		backCalled = false;
	}
	else{
		backCalled = true;
		showPreviousProduct();
	}
});


function initFields(){
	
	orderQuantity = document.getElementById('dv_orderQuantity');
	inventoryQuantity = document.getElementById('dv_inventoryQuantity');
	scanQuantity = document.getElementById('txt_scanQuantity');
	totalQuantity = document.getElementById('dv_totalQuantity');
	dvOffice = document.getElementById('dv_office');
	dvArticleNumber = document.getElementById('articleNumber');
	var dvUser = document.getElementById('dv_user');
	dvUser.innerHTML = user.user; 
	
	scanQuantity.onchange = function(){
		verifyScanQuantity(scanQuantity.value);	
	};
}

function verifyScanQuantity(changedQuantity){
	var aProducts = order.products;
	var currentProduct = aProducts[showedProductNum];
	var currentProductRequestQuantity = currentProduct.requestQuantity;
	if(changedQuantity<0){
		scanQuantity.value = 0;
	}else{
		if(changedQuantity>currentProductRequestQuantity){
			scanQuantity.value = currentProductRequestQuantity;
			//asl.notify(asl.notifications.application,asl.priority.normal,'Mensaje:','Excede lo solicitado.',['OK'],[null]);
			//confirm('Excede lo solicitado',function(confirmed){ });
			alert('Excede lo solicitado');
		}
	}
}

function showKBonFocus(){
	if(keyboardIsShowed){
		keyboardIsShowed = false;
		insertOrder();
	}
}

function insertOrder() {
	loadOrderFromStorage();
	if(order){
		showProductInfo(showedProductNum);
		showLoadingScreen(false);
	}else if(!keyboardIsShowed) {
		keyboardIsShowed = true;
		asl.showKeyboard({
			inputId: 'userOrder',
			title : "Código de Orden",
			type : 'text',
			scanner: true,
			back: false
		}, loadOrder);
	}
}

function loadOrder(inputID, orderID){
	keyboardIsShowed = false;
	if (!orderID) {
		insertOrder();
		return;
	}
	requestOrder(orderID);
}

function requestOrder(movID){
	//var url = 'php/db/getOrder.php?movID=' + movID;
	var url = oCfg.phpPath + 'getOrder2.php?movID=' + movID;

	var handle = function(obj){
		if(obj){
			if(obj.ajaxAnswer == AjaxAnswer.type.success){
				if(obj.data){
					if (obj.data.status == 'PENDIENTE') {
						order = new Order(obj.data);

						dvOffice.innerHTML = order.office;

						//asl.notify(asl.notifications.application,asl.priority.normal,'Mensaje:','Orden de traspaso cargada.',['OK'],[null]);
						//confirm('Orden de traspaso cargada.',function(confirmed){ });
						alert('Orden de traspaso cargada.');
						wlan.disableAdapter();
						wifiEnabled = false;
						showProductInfo(0);
						showLoadingScreen(false);
					} else {
						showLoadingScreen(true);
						//asl.notify(asl.notifications.application,asl.priority.normal,'No se pudo cargar la orden:','La orden de traspaso debe tener el estatus \'PENDIENTE\'.',['OK'],[insertOrder]);
						confirm('No se pudo cargar la orden: La orden de traspaso debe tener el estatus \'PENDIENTE\'.',function(confirmed){
			                if(confirmed){
			                    insertOrder();
			                }
			            });
					}
				}
				else{
					showLoadingScreen(true);
					//asl.notify(asl.notifications.application,asl.priority.normal,'Mensaje:','No existe una orden de traspaso con ese código.',['OK'],[insertOrder]);
					confirm('No existe una orden de traspaso con ese código.',function(confirmed){
		                if(confirmed){
		                    insertOrder();
		                }
		            });

				}
			} else if (obj.ajaxAnswer == AjaxAnswer.type.connectionError) {
				//asl.notify(asl.notifications.application,asl.priority.normal,'Error:','No se pudo conectar con el servidor.',['OK'],[insertOrder]);
				confirm('Error: No se pudo conectar con el servidor.',function(confirmed){
	                if(confirmed){
	                    insertOrder();
	                }
	            });
				//insertOrder();
			} else {
				if (obj.data) {
					//asl.notify(asl.notifications.application,asl.priority.normal,'Error en el servidor:','('+obj.data.status+') '+obj.data.statusText,['OK'],[insertOrder]);
					confirm('Error en el servidor: ('+obj.data.status+') '+obj.data.statusText,function(confirmed){
		                if(confirmed){
		                    insertOrder();
		                }
		            });

				} else {
					insertOrder();
				}
			}
		}
	};

	ajaxRequest('GET', url, handle);
}

function showLoadingScreen(enabled){
	var divLoading = document.getElementById('loading');
	
	if(enabled === true){
		divLoading.style.visibility = 'visible';
	}
	else{
		divLoading.style.visibility = 'hidden';
	}
}

function showProductInfo(num){
	var product = order.products[num];
	var productLength = order.products.length;
	if(product){
		showedProductNum = num;
		asl.title(product.code);
		
		document.getElementById('dv_orderQuantity').innerHTML = product.requestQuantity;
		document.getElementById('dv_inventoryQuantity').innerHTML = product.inventoryQuantity;
		document.getElementById('txt_scanQuantity').value = product.scanQuantity;

		document.getElementById('dv_totalQuantity').innerHTML = order.totalScanQuantity + "/" + order.totalProducts;
		updateArticleNumber(productLength);
	}
}

function onLoad()
{
	try{
		scanner.enable();
	}
	catch(e){}
	scanner.decodeEvent = 'decodeEvent(%json)';
}

function decodeEvent(jsonObject)
{
	var code = jsonObject.data;
	var aProducts = order.products;
	var currentProduct = aProducts[showedProductNum];
	//var productCode = currentProduct.code;
	var productBarcodes = currentProduct.barcodes;

	//if(code == productCode){
	if(productBarcodes.indexOf(code) >= 0){
		scanQuantity.value++;
		scanQuantity.onchange();
		//asl.notify(asl.notifications.application,asl.priority.normal,'Mensaje:','Codigo ' + code,['OK'],[null]);
	}else{
		//asl.notify(asl.notifications.application,asl.priority.normal,'Mensaje:','El producto escaneado no coincide con el producto solicitado.',['OK'],[null]);
		//confirm('El producto escaneado no coincide con el producto solicitado.',function(confirmed){ });
		alert('El producto escaneado no coincide con el producto solicitado.');

	}
}

function arraySearch(array, obj){
	var pos = -1;
	for(var i=0; i<array.length; i++){
		if(array[i].code == obj){
			pos = i;
			break;
		}
	}
	return pos;
}

function verifyProductsQuantity(){
	var requestQuantity = order.products[showedProductNum].requestQuantity;
	if(scanQuantity.value < requestQuantity){
		//asl.notify(asl.notifications.application,asl.priority.normal,'Mensaje:','Faltaron productos.',['OK'],[showNextProduct]);
		confirm('Faltaron productos.',function(confirmed){
            if(confirmed){
                showNextProduct();
            }
        });
	}else{
		showNextProduct();
	}
}

function showNextProduct(){
	
	if(order && order.products && order.products.length && showedProductNum < (order.products.length-1) ){
		showProductInfo(showedProductNum + 1);
		saveOrderToStorage();
	} else {
		//asl.notify(asl.notifications.application,asl.priority.normal,'Fin de la lista:','¿Desea Terminar la orden?',['Si','No'],[terminateOrder,null]);
		confirm('¿Desea Terminar la orden?',function(confirmed){
            if(confirmed){
                terminateOrder();
            }
        });
	}
}

function showPreviousProduct(){
	if(showedProductNum > 0){	
		showProductInfo(showedProductNum - 1);	
	}
}

function saveScannedQuantity(){
	var scannedQuantity = parseFloat(document.getElementById('txt_scanQuantity').value);

	if(order && order.products && order.products.length){
		var actualScanQuantity = order.products[showedProductNum].scanQuantity;

		order.products[showedProductNum].scanQuantity = scannedQuantity;
		order.totalScanQuantity += scannedQuantity - actualScanQuantity;
	}
}

function confirmRow(){
	saveScannedQuantity();
	verifyProductsQuantity();
	
}

function requestSaveScanQuantity(){
	var aScanQuantity = createScanQuantityArray();
	var jScanQuantity = JSON.stringify(aScanQuantity);
	
	var url = oCfg.phpPath + 'saveOrder.php';
	var data = 'id=' + order.id + '&aScan=' + jScanQuantity;


	var handle = function(obj){
		if(obj){
			if(obj.ajaxAnswer == AjaxAnswer.type.success){
				if(obj.data){
					clearOrder();
					//asl.notify(asl.notifications.application,asl.priority.normal,'Mensaje:','Orden guardada.',['OK'],[insertOrder]);
					confirm('Orden guardada.',function(confirmed){
			            if(confirmed){
			                insertOrder();
			            }
			        });
				}
				else{
					//asl.notify(asl.notifications.application,asl.priority.normal,'Mensaje:','El ID de la orden no es correcto',['OK'],[null]);
					//confirm('El ID de la orden no es correcto',function(confirmed){ });
					alert('El ID de la orden no es correcto');
				}
			} else if (obj.ajaxAnswer == AjaxAnswer.type.connectionError) {
				//asl.notify(asl.notifications.application,asl.priority.normal,'Error:','No se pudo conectar con el servidor.',['OK'],[null]);
				//confirm('Error: No se pudo conectar con el servidor.',function(confirmed){ });
				alert('Error: No se pudo conectar con el servidor.');
			} else {
				if (obj.data) {
					//asl.notify(asl.notifications.application,asl.priority.normal,'Error en el servidor:','('+obj.data.status+') '+obj.data.statusText,['OK'],[null]);
					alert('Error en el servidor: ('+obj.data.status+') '+obj.data.statusText);
				}
			}
		}
	};

	ajaxRequest('POST', url, handle, data);
}

function createScanQuantityArray(){
	var aScanQuantity = [];

	if(order == null) return aScanQuantity;

	var aProducts = order.products;
	var aProductsLen = aProducts.length;

	for(var i = 0; i < aProductsLen; i++){

		aScanQuantity.push({
			scanQuantity: aProducts[i].scanQuantity,
			row: aProducts[i].row
		});

	}

	return aScanQuantity;
}

function terminateOrder(){
	wlan.enableAdapter();
	wifiEnabled = true;
	setTimeout(requestSaveScanQuantity, 5000);
	//requestSaveScanQuantity();
}

function clearOrder(){
	order = null;
	showedProductNum = -1;
	removeOrderFromStorage();
}

function updateArticleNumber(maxProducts){
	dvArticleNumber.innerHTML = (showedProductNum + 1) + '/' + maxProducts; 
}

document.getElementById('btn_ok').onclick=confirmRow;

function loadOrderFromStorage(){
	showedProductNum = oStorage.load('showedProductNum');
	order = oStorage.load('order');
}

function saveOrderToStorage(){
	oStorage.store('showedProductNum', showedProductNum);
	oStorage.store('order', order);
}

function removeOrderFromStorage(){
	oStorage.remove('showedProductNum');
	oStorage.remove('order');
}

function exitAndSaveOrder(){
	saveOrderToStorage();
	asl.exit();
}

function exitAndDeleteOrder(){
	removeOrderFromStorage();
	asl.exit();
}
//document.getElementById('btn_ok').onclick=function(){ terminateOrder(); };
//window.onload = inpOrder;
//function inpOrder(){
//	loadOrder('', 'OM12830');
//}