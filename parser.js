var Parser = function(db) {	

	var db = db;
	var statsHandler = StatsHandler(db);
	

	return {
	
		initialize: function(dbVersion) {
			// making two tables for LIWC because it's faster
			//console.log("building");


			// check last version, drop and recreate tables if nec
			if (!db.tableExists('stats')) {
				this.dropTables();
			}
		  else {
		  	var res = db.query("stats", {version: dbVersion});
		  	if (!res || res.length == 0) {
		  		this.dropTables();
		  	}
		  }

		  // remake tables
		  if (!db.tableExists("stats")) {
		  	db.createTable("stats", ["version"]);
				db.insert("stats", {version: dbVersion});
				//console.log('updated version to '+dbVersion);
		  }

			// load non-wild table if needed
		  if (!db.tableExists("LIWC_words")) {
		  	db.createTable("LIWC_words", ["word", "cats", "wildcard"]);
		  	//db.truncate("LIWC_words");
		  	for (var i=0; i<LIWC.length; i++) {
		  		if (LIWC[i]['word'])
				  	db.insertOrUpdate("LIWC_words", {word: LIWC[i]['word']}, {word: LIWC[i]['word'], wildcard: false, cats: LIWC[i]['cat']});
		  	}

		  	//console.log("loaded nonwild "+LIWC.length);
		  	db.commit();
	 		}
	  	// then load wild table
		  if (!db.tableExists("LIWC_words_wild")) {
		  	db.createTable("LIWC_words_wild", ["word", "cats", "wildcard"]);
		  	//db.truncate("LIWC_words_wild");
			  
			  for (var i=0; i<LIWC_wild.length; i++) {
		  		if (LIWC_wild[i]['word'])
				  	db.insertOrUpdate("LIWC_words_wild", {word: LIWC_wild[i]['word']}, {word: LIWC_wild[i]['word'], wildcard: true, cats: LIWC_wild[i]['cat']});
		  	}
		  	//console.log("loaded wild "+LIWC_wild.length);
		  	db.commit();	
			} 
		}, 
	
		parseLine: function(line) {
		
			////console.log(line);
			var spaceRegEx = new RegExp(/\S{1,}/g);
			//var wordRegEx = new RegExp(/[\w|@|#]{1,}/);
			
			
			// add words to sentence
			//split input string with RegExo
			var tokens = line.match(spaceRegEx);

			for (i in tokens) {
				//If the element isn't the last in an array, it is a new word
				if (tokens[i] !== "") {
					var word = tokens[i].toString();
		
					if (word.indexOf('*') != -1) {
						word = this.reDirty(word);
						//console.log("dirty "+word);
					} 

					var cats = this.getCats(word);
					statsHandler.logWordInstance(word, cats);
				}
			}
			
			// calculate stats for the line
			statsHandler.doStats();
		},
		
		getCats: function(w) {
			
			var cats = [];

			// check for regular match
			var res = db.query("LIWC_words", {word: w.toLowerCase()}); 
			if (res.length > 0) {
				cats = res[0].cats;
			}
			
			// check for wildcards
			else {
				res = db.query("LIWC_words_wild", function(row) {
			    if(w.toLowerCase().indexOf(row.word) == 0)
			    	return true;
			    else return false;
			  });
			  if (res.length > 0) {
				  cats = res[0].cats;
			  }
			}
						 
			return cats;
		},

		reDirty: function(w) {
			var swears = {
				"f***": "fuck",
				"f*****": "fucker",
				"f******": "fucking",
				"b***": "butt",
				"c***": "cunt",
				"t***": "tits",
				"b****": "bitch",
				"b******": "bitches",
				"b*******": "bitching",
				"a******": "asshole",
				"p***": "piss",
				"p****": "pussy",
				"n*****": "nigger",
				"s***": "slut",
				"w****": "whore"
			};

			var s = swears[w];
			if (s) return swears[w];
			else return w;
		},

		dropTables: function() {		
			if (db.tableExists('stats')) db.dropTable('stats');
			if (db.tableExists('LIWC_words')) db.dropTable('LIWC_words');
			if (db.tableExists('LIWC_words_wild')) db.dropTable('LIWC_words_wild');
		}
	}
};



