Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

function StylishDataSource() {}
StylishDataSource.prototype = {

	/*
		nsISupports
	*/
	QueryInterface: XPCOMUtils.generateQI([Components.interfaces.stylishDataSource, Components.interfaces.nsIClassInfo, Components.interfaces.nsISupports]),


	/*
		nsIClassInfo
	*/
	getInterfaces: function getInterfaces(aCount) {
		var interfaces = [Components.interfaces.stylishDataSource, Components.interfaces.nsIClassInfo, Components.interfaces.nsISupports];
		aCount.value = interfaces.length;
		return interfaces;
	},
	getHelperForLanguage: function getHelperForLanguage(aLanguage) {
		return null;
	},
	classDescription: "Stylish Data Source",
	classID: Components.ID("{d6fe57ea-1126-4dc6-8636-d25d5b901929}"),
	contractID: "@userstyles.org/stylish-data-source;1",
	implementationLanguage: Components.interfaces.nsIProgrammingLanguage.JAVASCRIPT,
	flags: 0,


	/*
		stylishDataSource
	*/
	getConnection: function() {
		var storageService = Components.classes["@mozilla.org/storage/service;1"].getService(Components.interfaces.mozIStorageService);
		//xxx what about uris?
		var connection = storageService.openDatabase(this.getFile());
		this.migrate(connection);
		return connection;
	},

	getFile: function() {
		if (!this._file) {
			var path = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch).getCharPref("extensions.stylish.dbFile");
			if (path) {
				this._file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
				this._file.initWithPath(path);
			} else {
				this._file = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile);
				this._file.append("stylish.sqlite");
			}
		}
		return this._file;
	},

	/*
		private
	*/
	_file: null,

	migrate: function(connection) {
		var expectedDataVersion = 2;
		var currentDataVersion = connection.schemaVersion;
		if (currentDataVersion >= expectedDataVersion)
			return;
		connection.beginTransaction();
		switch (currentDataVersion) {
			case 0:
				connection.executeSimpleSQL("DROP TABLE IF EXISTS styles; CREATE TABLE styles (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, url TEXT, updateUrl TEXT, md5Url TEXT, name TEXT NOT NULL, code TEXT NOT NULL, enabled INTEGER NOT NULL);");
				connection.executeSimpleSQL("DROP TABLE IF EXISTS style_meta; CREATE TABLE style_meta (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, style_id INTEGER NOT NULL, name TEXT NOT NULL, value TEXT NOT NULL);");
				connection.executeSimpleSQL("DROP INDEX IF EXISTS style_meta_style_id; CREATE INDEX style_meta_style_id ON style_meta (style_id);");
			case 1:
				try {
					connection.executeSimpleSQL("ALTER TABLE styles ADD COLUMN originalCode TEXT NULL;");
				} catch (ex) {
					// this can happen if the user downgrades to a version with schema 1 then upgrades. they will then already have the column.
				}
		}
		connection.schemaVersion = expectedDataVersion;
		connection.commitTransaction();
	}

};

var components = [StylishDataSource];
function NSGetModule(compMgr, fileSpec) {
	return XPCOMUtils.generateModule(components);
}

