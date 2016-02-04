var Order = function(obj){
	if(!obj) obj = {};

	this.id = parseInt(obj.id) || 0;
	this.movID = obj.movID || '';
	this.office = obj.office || '';
	this.status = obj.status || '';
	this.totalScanQuantity = parseFloat(obj.totalScanQuantity) || 0;
	this.totalProducts = parseFloat(obj.totalProducts) || 0;

	this.products = [];
	
	this.setProducts = function(aObjects){
		var aObjectsLen = 0;

		if(aObjects && (aObjectsLen = aObjects.length) ){
			for(var i = 0; i < aObjectsLen; i++){
				
				var oObject = aObjects[i];

				if(oObject){
					if(oObject.constructor === Product){
						this.products.push(oObject);
					}
					else{
						this.products.push(new Product(oObject));
					}
				}
			}
		}
	};

	this.setProducts(obj.products);
};

var Product = function(obj){
	if(!obj) obj = {};

	this.code = obj.code || '';
	this.inventoryQuantity = parseFloat(obj.inventoryQuantity) || 0;
	this.requestQuantity = parseFloat(obj.requestQuantity) || 0;
	this.scanQuantity = parseFloat(obj.scanQuantity) || 0;
	this.barcodes = obj.barcodes || [];
	this.row = parseFloat(obj.row) || 0;
	
	this.inventoryQuantity = Math.round(this.inventoryQuantity * 10) /10;
};

var User = function(obj) {
	if(!obj) obj = {};

    this.user = obj.user || '';
    this.name = obj.name || '';
};

var user = new User(oStorage.load('oUser'));
