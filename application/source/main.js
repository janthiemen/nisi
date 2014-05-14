var services = {
	"pocket": {
		"type": "oauth",
		"createAccount": function(token) {
			// post a JSON payload:
			authObject = {
				"token": token,
				"since": ""
			};
			localStorage.pocket = JSON.stringify(authObject);
		},
		"getArticles": function(self, callback){
			authObject = JSON.parse(localStorage.pocket);
			console.log(authObject);
			token = authObject.token;
			jsonString = '{"consumer_key": "INSERT_CONSUMER_KEY", "access_token": "'+token+'", "sort": "newest", "since": "'+authObject.since+'", "detailType": "simple", "state": "all"}';
			$.ajax({
				type: 'POST',
				url: 'https://getpocket.com/v3/get',
				// post payload:
				data: jsonString,
				contentType: 'application/json',
				success: function(data){
					console.log(data);
					//Reorder the data so that we have a general article list.
					articles = [];
					archive = [];
					if(localStorage.getItem("pocketList") === null) {
						for (var key in data.list) {
							var date = new Date(data.list[key].time_added*1000);
							data.list[key].favorite == "0"? favorite=false : favorite=true;
							if(data.list[key].status == 0) {
								articles.push({url:data.list[key].resolved_url, title: data.list[key].resolved_title, date: date, id: data.list[key].item_id, favorite: favorite});
							} else if(data.list[key].status == 1) {
								archive.push({url:data.list[key].resolved_url, title: data.list[key].resolved_title, date: date, id: data.list[key].item_id, favorite: favorite});
							}
						}
					} else {
						articles = JSON.parse(localStorage.getItem("pocketList"));
						archive = JSON.parse(localStorage.getItem("pocketArchive"));
						for (var key in data.list) {
							//console.log(data.list[key]);
							var date = new Date(data.list[key].time_added*1000);
							//First, check if the article already exists and if so, delete it
							var deleteArticle = articles.filter(function (element) { 
								return element.id === data.list[key].item_id;
							});
							var index = articles.indexOf(deleteArticle[0]);
							if (index > -1) {
								console.log("Delete article:");
								console.log(articles[index]);
								articles.splice(index, 1);
							} else {
								console.log("Couldn't find article in list, checking archive");
								var index = archive.indexOf(deleteArticle[0]);
								if (index > -1) {
									console.log("Delete article:");
									console.log(archive[index]);
									archive.splice(index, 1);
								} else {
									console.log("Couldn't find article in archive");
								}
							}
							if(data.list[key].status == 0) {
								//The article should be added
								data.list[key].favorite == "0"? favorite=false : favorite=true;
								articles.push({url:data.list[key].resolved_url, title: data.list[key].resolved_title, date: date, id: data.list[key].item_id, favorite: favorite});
							} else if(data.list[key].status == 1) {
								//The article should be archived
								data.list[key].favorite == "0"? favorite=false : favorite=true;
								archive.push({url:data.list[key].resolved_url, title: data.list[key].resolved_title, date: date, id: data.list[key].item_id, favorite: favorite});
							}
						}
					}
					authObject.since = data.since;
					localStorage.pocket = JSON.stringify(authObject);
					localStorage.pocketList = JSON.stringify(articles);
					localStorage.pocketArchive = JSON.stringify(archive);
					callback(self, articles, archive);
				},
				error: function(xhr, type){
					alert('Ajax error!');
				}
			});
		},
		"delete": function(id, parent, callback) {
			this.action("delete", id, parent, callback);
		},
		"archive": function(id, parent, callback) {
			this.action("archive", id, parent, callback);
		},
		"favorite": function(id, parent, callback) {
			this.action("favorite", id, parent, callback);
		},
		"unfavorite": function(id, parent, callback) {
			this.action("unfavorite", id, parent, callback);
		},
		"action": function(type, id, parent, callback) {
			authObject = JSON.parse(localStorage.pocket);
			console.log(authObject);
			token = authObject.token;
			jsonString = '{"consumer_key": "INSERT_CONSUMER_KEY", "access_token": "'+token+'", "actions": [{"action":"'+type+'","item_id":"'+id+'"}]}';
			$.ajax({
				type: 'POST',
				url: 'https://getpocket.com/v3/send',
				// post payload:
				data: jsonString,
				contentType: 'application/json',
				success: function(data){
					console.log(data);
					callback(parent, true, id);
				},
				error: function(xhr, type){
					callback(parent, false, id);
				}
			});
		}
	},
	//"instapaper": {},
	"readability": {
		"type": "xauth",
		"createAccount": function(username,password, parent) {
			// post a JSON payload:
			//jsonString = '{"consumer_key": "INSERT_CONSUMER_KEY", "access_token": "'+token+'", "sort": "newest", "since": "'+authObject.since+'", "detailType": "simple"}';
			var apiKey = "INSERT_APPLICATION_KEY";
            var sharedSecret = "INSERT_CONSUMER_KEY";

            var path="https://www.readability.com/api/rest/v1/oauth/access_token/";
            var argumentsAsObject = {
                x_auth_mode:'client_auth',
                x_auth_username: username,
                x_auth_password: password 
            };

            OAuthSimple().reset();
            var oauth2 = OAuthSimple(apiKey,sharedSecret);
            var results = oauth2.sign({action:'GET',
                                             path:path,
                                             method:'PLAINTEXT',
                                             parameters:argumentsAsObject});
            try {                                             
				$.ajax({
					type: 'GET',
					url: 'https://www.readability.com/api/rest/v1/oauth/access_token/',
					// post payload:
					data: results.parameters,
					contentType: 'application/json',
					success: function(data){
						console.log(data.split("&")[0].split("=")[1]);
						console.log(data.split("&")[1].split("=")[1]);
						console.log(data);
						authObject = {
							"oauth_token_secret": data.split("&")[0].split("=")[1],
							"oauth_token": data.split("&")[1].split("=")[1],
							"since": ""
						};
						localStorage.readability = JSON.stringify(authObject);
						window.location.href="index.html";
					},
					error: function(xhr, type){
						alert('We couldn\'t verify your account, please try again!');
						console.log(xhr);
						console.log(type);
					}
				});
            } catch (e) {};
		},
		"getArticles": function (self, callback) {
			authObject = JSON.parse(localStorage.readability);
			console.log(authObject);
			
			var apiKey = "INSERT_APPLICATION_KEY";
            var sharedSecret = "INSERT_CONSUMER_KEY";
			var accessToken = authObject.oauth_token;
            var tokenSecret = authObject.oauth_token_secret;
			
            var path="https://www.readability.com/api/rest/v1/bookmarks/";
            var argumentsAsObject = {
				//'archive': '0',
				'consumer_key':apiKey, 
				'shared_secret': sharedSecret,
				'access_token':accessToken,
				'access_secret':tokenSecret
            };

			OAuthSimple().reset();
            var results = (new OAuthSimple()).sign({
				action:'GET',
				path:path,
				method:'PLAINTEXT',
				parameters:argumentsAsObject,
				signatures:{
					'consumer_key':apiKey, 'shared_secret': sharedSecret,
					'access_token':accessToken,'access_secret':tokenSecret}});
            try {
				$.ajax({
					type: 'GET',
					url: 'https://www.readability.com/api/rest/v1/bookmarks/',
					// post payload:
					data: results.parameters,
					contentType: 'application/json',
					success: function(data){
						console.log(data);
						//We don't sync here, as it would require two calls, making the app much slower than when we don't and just load all articles every time
						bookmarks = data.bookmarks
						articles = [];
						archive = [];
						for (var i = 0; i < bookmarks.length; i++) {
							bookmark = bookmarks[i];
							var date = new Date(bookmark.date_updated);
							bookmark.favorite == "0"? favorite=false : favorite=true;
							if(bookmark.archive == true) {
								archive.push({url: bookmark.article.url, title: bookmark.article.title, date: date, id: bookmark.id, favorite: favorite});
							} else {
								articles.push({url: bookmark.article.url, title: bookmark.article.title, date: date, id: bookmark.id, favorite: favorite});
							}
						}						
						callback(self, articles, archive);
					},
					error: function(xhr, type){
						alert('Ajax error!');
						console.log(xhr);
						console.log(type);
					}
				});
				//console.debug('Sample 3',sample3Results);
            } catch (e) {};
		},
		"action": function (type, id, parent, callback) {
			authObject = JSON.parse(localStorage.readability);
			console.log(authObject);
			
			var apiKey = "INSERT_APPLICATION_KEY";
            var sharedSecret = "INSERT_CONSUMER_KEY";
			var accessToken = authObject.oauth_token;
            var tokenSecret = authObject.oauth_token_secret;
			
            var path="https://www.readability.com/api/rest/v1/bookmarks/"+id+"/";
			if(type=="favorite") {
				var argumentsAsObject = {
					'favorite': '1',
					'consumer_key':apiKey, 
					'shared_secret': sharedSecret,
					'access_token':accessToken,
					'access_secret':tokenSecret
				};
			} else if(type=="unfavorite") {
				var argumentsAsObject = {
					'favorite': '0',
					'consumer_key':apiKey, 
					'shared_secret': sharedSecret,
					'access_token':accessToken,
					'access_secret':tokenSecret
				};
			} else if(type=="archive") {
				var argumentsAsObject = {
					'archive': '1',
					'consumer_key':apiKey, 
					'shared_secret': sharedSecret,
					'access_token':accessToken,
					'access_secret':tokenSecret
				};
			}
			OAuthSimple().reset();
            var results = (new OAuthSimple()).sign({
				action:'POST',
				path:path,
				method:'PLAINTEXT',
				parameters:argumentsAsObject,
				signatures:{
					'consumer_key':apiKey, 'shared_secret': sharedSecret,
					'access_token':accessToken,'access_secret':tokenSecret}});
            try {
				$.ajax({
					type: 'POST',
					url: path,
					// post payload:
					data: results.parameters,
					contentType: 'application/x-www-form-urlencoded',
					success: function(data){
						console.log(data);
						callback(parent, true, id);
					},
					error: function(xhr, type){
						callback(parent, false, id);
					}
				});
				//console.debug('Sample 3',sample3Results);
            } catch (e) {};
		},
		"delete": function(id, parent, callback) {
			//Deleting is discouraged by Readability, so we won't do that for now and just archive the article instead
			this.action("archive", id, parent, callback);
		},
		"archive": function(id, parent, callback) {
			this.action("archive", id, parent, callback);
		},
		"favorite": function(id, parent, callback) {
			this.action("favorite", id, parent, callback);
		},
		"unfavorite": function(id, parent, callback) {
			this.action("unfavorite", id, parent, callback);
		}
	}
};

var sortFunctions = {
	newest: function(a,b) {
		aDate = new Date(a.date);
		bDate = new Date(b.date);
		return bDate - aDate;
	},
	oldest: function(a,b) {
		aDate = new Date(a.date);
		bDate = new Date(b.date);
		return aDate - bDate;
	},
	title: function(a,b) {
		if (a.title < b.title)
			return -1;
		if (a.title > b.title)
			return 1;
		return 0;
	},
	url: function(a,b) {
		if (a.url < b.url)
			return -1;
		if (a.url > b.url)
			return 1;
		return 0;
	}
}