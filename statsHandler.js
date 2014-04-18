/*
 * statsHandler.js
 *
 * Copyright 2013 (c) Sosolimited http://sosolimited.com
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 *
 */

var StatsHandler = function(db) {
	
 
	// initialize word_instances table
  if (!db.tableExists("word_instances")) 
  	db.createTable("word_instances", ["word", "cats", "wildcard"]);
  db.truncate("word_instances");
 
	
	return {
	
		logWordInstance: function(word, cats) {
			// insert word
			var ind = db.insert("word_instances", {word: word, cats: cats});
			//console.log("w:"+word+" c:"+cats);
			// delete all but last 100 words
			var d = db.deleteRows("word_instances", function(row) { return (row.ID < ind-100); });
			////console.log('deleted '+d+' at '+ind);
			////console.log(ind);
		},

		doStats: function(callback) {
	
			var total = db.rowCount("word_instances");
			
			var message = {
				calcs: [
								["funct", "+funct"], //function words. for testing.
								["posemo", "+posemo"], //use cat names if they correspond!
								["negemo", "+negemo"], 
								["anger", "+anger"], 
								["i", "+i"], 
								["we", "+we"], 
								["complexity", "+excl+tentat+negate-incl+discrep"],
								["status", "+we-i"],
								["depression", "+i+bio+negemo-posemo"],
								["formality", "-i+article+sixltr-present-discrep"],
								["honesty", "+i+excl-negemo"],
								["femininity", "+other+posemo+sixltr-negate-article-preps-swear-money-number"],
								["aggression", "+anger+swear"]
							],

				tempVal: 0,
				total: db.rowCount("word_instances")
			};

			this.calcCats(message, callback);
	
		},
		
		calcCats: function(msg, callback) {
		
			// if fully calculated, add message to queue
			if (msg['calcs'].length === 0) {
				delete(msg.calcs);
				delete(msg.tempVal);
				callback(msg);
			}
			
			else {
			
				var traitModifier = msg['calcs'][0][1].substring(0,1);
				var traitName = msg['calcs'][0][0];
				
				var catEndIndex = msg['calcs'][0][1].substring(1).search(/[+,-]+/)+1;
				if (catEndIndex === 0) catEndIndex = msg['calcs'][0][1].length;
				
				var catName = msg['calcs'][0][1].substring(1,catEndIndex);
				var remainder = msg['calcs'][0][1].substring(catEndIndex);
				
				////console.log(traitModifier+" "+traitName+" "+catEndIndex+" "+catName+" "+remainder);
			
				var val;
				if (msg[traitName]) {
					val = msg[traitName]*msg['total'];
					
				} else {
			
					// pend: it may be faster to have one entry per word instead of one per instance
					// and keep track of instanceno, this would change in logWordInstance method and here
					var res = db.query("word_instances", function(row) {
						////console.log("traitname:"+traitName+" cats:"+row.cats+" val"+$.inArray(traitName, row.cats));
						return ($.inArray(catName, row.cats) != -1);
					});
					
					val = res.length;
				}
				
				this.addVal(msg, traitModifier, traitName, val, remainder, callback);
			}
		},
		
		addVal: function(msg, modifier, name, val, remainder, callback) {
			////console.log("addVal "+modifier+" "+name+" "+val+" "+remainder);
		
			if (modifier === '-') val *= -1;
		
			msg['tempVal'] = msg['tempVal']+val;
			
			if (remainder.length === 0) {
				msg[name] = (msg['total'] == 0) ? 0 : msg['tempVal']/msg['total'];
				msg['tempVal'] = 0;
				msg['calcs'].shift();
				
				////console.log(val+" "+name+"="+msg[name]+" total:"+msg['total']+" "+msg['tempVal']);
			}
			else {
				msg['calcs'][0][1] = remainder;
			}				
			this.calcCats(msg, callback);
			
		}
	};
};