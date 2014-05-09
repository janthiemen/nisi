/*

	Copyright 2014 Jan Thiemen Postema

	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at

		http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.

*/

enyo.kind({
	name: "nisi.articles.list",
	//classes: "enyo-fit",
	//kind: "FittableRows",
	components: [
		//{kind: "mochi.Subheader", fit: true, content: "Articles"}, 
		{name: "loading", style: "text-align: center; margin-top:50px;", components: [
			{kind: "onyx.Spinner", classes: "onyx-light"}
		]},
		{name: "list", kind: "mochi.List", count: 20000, fit: true, multiSelect: false, classes: "enyo-fit list-sample-list", onSetupItem: "setupItem", components: [
			{name: "item", kind:"mochi.ListItem", url:"", ontap: "itemSelected", components: [
				{name: "name"},
				//{name: "url", showing: false},
				//{name: "id", showing: false}
			]}
		]}
	],
	names: [],
	create: function() {
		this.inherited(arguments);
		services[localStorage.service].getArticles(this, this.handleArticles);
		//this.$.list.setCount(this.articles.length);
		//this.$.list.reset();
	},
	handleArticles: function(self, list) {
		console.log(self);
		self.articles = list;
		//We default to sorting on newest first
		self.articles.sort(sortFunctions["newest"]);
		console.log(self.articles);
		self.$.list.setCount(self.articles.length);
		self.$.list.reset();
		self.$.loading.hide();
	},
	setupItem: function(inSender, inEvent) {
		// this is the row we're setting up
		var i = inEvent.index;
		var n = this.articles[i];
		this.$.name.setContent(n.title);
	},
	itemSelected: function(inSender, inEvent) {
		//Should be done using an event, I know ...
		window.main.getArticle(this.articles[inEvent.index].url, this.articles[inEvent.index].title, this.articles[inEvent.index].id, this.articles[inEvent.index].favorite);
	},
	sortChanged: function(method) {
		this.$.loading.show();
		this.articles.sort(sortFunctions[method]);
		this.$.list.setCount(this.articles.length);
		this.$.list.reset();
		this.$.loading.hide();
	},
	deleteItem: function(articleId) {
		var deleteArticle = articles.filter(function (element) { 
			return element.id === articleId;
		});
		var index = this.articles.indexOf(deleteArticle[0]);
		if (index > -1) {
			console.log("Delete article:");
			console.log(this.articles[index]);
			this.articles.splice(index, 1);
		} else {
			console.log("Couldn't find article");
		}
		this.$.list.setCount(this.articles.length);
		this.$.list.reset();
		this.$.loading.hide();
	}
});

enyo.kind({
	name: "nisi.login.oauth",
	//classes: "mochi mochi-sample enyo-fit",
	//kind: "FittableRows",
	components: [
		//{kind: "mochi.Subheader", content: "Login"},
		{kind: "mochi.Button", content: "Authenticate", ontap:"openAuthPage"},
		{kind: "mochi.InputDecorator", components: [
			{kind: "mochi.Input", name: "tokenInput", placeholder: "Enter text here", onchange:"inputChanged"}
		]},
		{kind: "mochi.Button", content: "Continue", ontap:"setToken"},
		{name:"result", classes:"mochi-sample-content", content:"Please press the authenticate button, authenticate the app and copy paste the code here."}
		
		//{name: "auth", kind: "nisi.iframe", url: "http://kappline.nl/firefoxos/pocket/auth.php", style: "border: none; width:99%; height:99%;"}
	],
	names: [],
	create: function() {
		this.inherited(arguments);
	},
	openAuthPage: function() {
		window.open("http://kappline.nl/firefoxos/pocket/auth.php");
	},
	setToken: function() {
		services[localStorage.service].createAccount(this.$.tokenInput.getValue());
		window.location.href="index.html";
		//TODO: go to article view!
	}
});

enyo.kind({
	name: "nisi.login.xauth",
	//classes: "mochi mochi-sample enyo-fit",
	//kind: "FittableRows",
	components: [
		//{kind: "mochi.Subheader", content: "Login"},
		{kind: "mochi.InputDecorator", components: [
			{kind: "mochi.Input", name: "username", placeholder: "Username"}
		]},
		{kind: "mochi.InputDecorator", components: [
			{kind: "mochi.Input", name: "password", placeholder: "Password", type:"password"}
		]},
		{kind: "mochi.Button", content: "Continue", ontap:"setToken"},
		{name:"result", classes:"mochi-sample-content", content:"Please input your username and password."}
		
		//{name: "auth", kind: "nisi.iframe", url: "http://kappline.nl/firefoxos/pocket/auth.php", style: "border: none; width:99%; height:99%;"}
	],
	names: [],
	create: function() {
		this.inherited(arguments);
	},
	setToken: function() {
		services[localStorage.service].createAccount(this.$.username.getValue(), this.$.password.getValue(), this.owner);
		//this.owner.goToList();
		//window.location.href="index.html";
		//TODO: go to article view!
	}
});

enyo.kind({
	name: "nisi.main",
	kind: "FittableRows",
	classes: "mochi mochi-sample enyo-unselectable enyo-fit",
	components: [
		{kind: "mochi.Header", content: "NISI", components: [
			{kind: "mochi.IconButton", name: "favorite", src: "assets/favorite_hover.png", ontap: "favoriteItem"},
			{kind: "mochi.IconButton", name: "archive", src: "assets/done_hover.png", ontap: "archiveItem"},
			{kind: "mochi.IconButton", name: "delete", src: "assets/delete_hover.png", ontap: "deleteItem"},
			{kind: "mochi.Button", content: "Open", ontap:"openInBrowser"},
			{kind: "mochi.PickerDecorator", components: [
				{kind: "mochi.Picker", name: "sortPicker", ontap: "sortChanged", items:[
					{content: "Newest", active: true},
					{content: "Oldest"},
					{content: "Title"},
					{content: "Url"}
				]}
			]},
			{kind: "mochi.PickerDecorator", name: "servicePicker"}
		]},
		{kind: "mochi.Panels", name:"mainPanels", fit: true, components: [
			{kind: "FittableRows", classes:"enyo-fit", components: [
				{name:"title", kind: "mochi.Subheader", content: "Article Title"},
				{ kind: "enyo.Scroller", touch: true, fit: true, components: [
					{name: "articleLoading", style: "text-align: center; margin-top:50px;", components: [
						{kind: "onyx.Spinner", classes: "onyx-light"}
					]},
					{name:"story", fit:true, allowHtml: true, classes:"mochi-sample-content", content:"First select an article! -->."}
				]}
			]},
			{name: "listPanel", components: [
				{kind: "mochi.Subheader", content: "Articles"},
				{tag: "br"}
			]},
		]}
	],
	create: function() {
		this.inherited(arguments);
		window.main = this;
		if(localStorage.setupDone != "true") {
			var lib = new localStorageDB("storage", localStorage);
			lib.createTable("articles", ["url", "title", "content"]);
			lib.commit();
			localStorage.setupDone = true;
		}
		this.getMainService();
		var serviceItems = [];
		for (var key in services) {
			var active = localStorage.service == key? true:false;
			serviceItems.push({content: key, active: active});
		}
		this.$.servicePicker.createComponent({kind: "mochi.Picker", ontap: "serviceSelected", items: serviceItems}, {owner: this});
		if(localStorage.getItem(localStorage.service) === null) {
			if(services[localStorage.service].type == "oauth") {
				this.$.listPanel.createComponent({name: "serviceWindow", kind: "nisi.login.oauth"}, {owner: this});
			} else {
				this.$.listPanel.createComponent({name: "serviceWindow", kind: "nisi.login.xauth"}, {owner: this});
			}
		} else {
			this.$.listPanel.createComponent({name: "serviceWindow", kind: "nisi.articles.list", onSelect: "getUrl"}, {owner: this});
		}
		this.render();
		this.$.articleLoading.hide();
		//Open the article view
		this.$.mainPanels.setIndex(1);
	},
	//Check if the user has added a favorite service, if not, load Pocket
	getMainService: function() {
		if (localStorage.getItem("service") === null) {
			this.setCurrentService("pocket");
		}
	},
	serviceSelected: function(inSender, inEvent) {
		this.setCurrentService(inEvent.content);
		this.$.serviceWindow.destroy();
		if(localStorage.getItem(localStorage.service) === null) {
			if(services[localStorage.service].type == "oauth") {
				this.$.listPanel.createComponent({name: "serviceWindow", kind: "nisi.login.oauth"}, {owner: this});
			} else {
				this.$.listPanel.createComponent({name: "serviceWindow", kind: "nisi.login.xauth"}, {owner: this});
			}
		} else {
			this.$.listPanel.createComponent({name: "serviceWindow", kind: "nisi.articles.list"}, {owner: this});
		}
		this.render();
	},
	//Set the service we're currently using
	setCurrentService: function(service) {
		localStorage.service = service;
	},
	goToList: function(parent) {
		this.$.serviceWindow.destroy();
		this.$.listPanel.createComponent({name: "serviceWindow", kind: "nisi.articles.list"}, {owner: this});
	},
	//Download the article's text and show it in the reading screen. Also, set the current url to the selected article.
	//This function is called from the nisi.list.articles kind when a user clicks an item.
	getArticle: function(url, title, id, favorite) {
		this.setFavorite(favorite);
		this.currentId = id;
		this.showArticle(title, "");
		this.$.articleLoading.show();
		console.log(url);
		this.currentTitle = title;
		this.currentUrl = url;
		var lib = new localStorageDB("storage", localStorage);
		//dbResult = lib.query("articles", {url: url});
		console.log(url);
		found = false;
		content = "";
		lib.query("articles", function(row) {
			if(row.url == url) {
				console.log("Found!");
				console.log(row);
				console.log("==========");
				found = true;
				content = row.content;
			} else {
				console.log("Not found!");
				console.log(row);
				console.log("==========");
			}
		});
		//console.log(dbResult);
		if(found) {
			console.log("from DB");
			//We have the article in the db, so just load it from there
			this.showArticle(this.currentTitle, content);
		} else {
			//We need to download the article first, so lets do that!
			//requestUrl = 'http://nisi-scoutline.rhcloud.com/?url='+encodeURIComponent(url);
			//Download the article using the readability api (which might easily be the best around)
			requestUrl = 'https://www.readability.com/api/content/v1/parser?url='+encodeURIComponent(url)+'&token=e27bc0a889275abc0eb8bf69813fc97b9eac018b';
			console.log(requestUrl);
			var ajax = new enyo.Ajax({
				url: requestUrl,
				method: 'GET',
			});
			ajax.response(this, "processArticleSucces");
			ajax.error(this, "processArticleError");
			ajax.go();
		}
	},
	//We did it, we've got the article, but check if there is any content, just to be on the sure side.
	processArticleSucces: function(inSender, inResponse) {
		console.log(inResponse);
		article = inResponse;
		if(article.content != "") {
			console.log("succes");
			//Add the article to the db, 
			var lib = new localStorageDB("storage", localStorage);
			lib.insert("articles", {url: this.currentUrl, title: this.currentTitle, content: article.title+article.content});
			lib.commit();
			this.showArticle(this.currentTitle, article.title+article.content);
		} else {
			console.log("failure");
			this.showArticle("Error",	"We couldn't extract the article content. Please open the article in webview.");
		}
	},
	//We have an error, so be honest and tell the user we couldn't do it ...
	processArticleError: function(inSender, inResponse) {
		this.showArticle("Error",	"We couldn't extract the article content. Please open the article in webview.");
	},
	//Hide the load icon and show the article!
	showArticle: function(title, content) {
		console.log("show the article");
		this.$.articleLoading.hide();
		this.$.title.setContent(title);
		this.$.story.setContent("<br />"+content);
	},
	//We changed the sorting, so lets fire a command to the article list component
	sortChanged: function(inSender, inEvent) {
		console.log(inEvent.content);
		this.$.serviceWindow.sortChanged(inEvent.content.toLowerCase());
	},
	openInBrowser: function() {
		window.open(this.currentUrl);
	},
	setFavorite: function(favorite) {
		console.log("favorite");
		this.favorite = favorite;
		if(favorite||favorite == "true") {
			console.log("favorited");
			this.$.favorite.setSrc("assets/favorite_active.png");
		}
		else this.$.favorite.setSrc("assets/favorite_hover.png");
	},
	favoriteItem: function(inSender, inEvent) {
		console.log(this.currentId);
		if(!this.favorite) services[localStorage.service].favorite(this.currentId, this, this.favoriteDone);
		else services[localStorage.service].unfavorite(this.currentId, this, this.unfavoriteDone);
	},
	archiveItem: function(inSender, inEvent) {
		console.log(this.$.serviceWindow.deleteItem);
		services[localStorage.service].archive(this.currentId, this, this.archiveDone);
	},
	archiveDone: function(parent, succes, articleId) {
		parent.$.serviceWindow.deleteItem(articleId);
		parent.showArticle("Article Title","First select an article! -->.");
	},
	deleteItem: function(inSender, inEvent) {
		console.log(this.$.serviceWindow.deleteItem);
		services[localStorage.service].delete(this.currentId, this, this.archiveDone);
	},
	deleteDone: function(parent, succes, articleId) {
		parent.$.serviceWindow.deleteItem(articleId);
		parent.showArticle("Article Title","First select an article! -->.");
	},
	favoriteDone: function(parent, succes) {
		if(succes) {
			parent.setFavorite(true);
		}
	},
	unfavoriteDone: function(parent, succes) {
		if(succes) {
			parent.setFavorite(false);
		}
	}
});
