var oStorage = {
	storage : window.localStorage,
	appName : oCfg.appName,

	store : function(name, obj){
		this.storage.setItem(this.appName + name, JSON.stringify(obj));
	},

	load : function(name){
		var obj = null;
		
		obj = JSON.parse(this.storage.getItem(this.appName + name));

		return obj;
	},

	remove: function(name){
		this.storage.removeItem(this.appName + name);
	}	
};