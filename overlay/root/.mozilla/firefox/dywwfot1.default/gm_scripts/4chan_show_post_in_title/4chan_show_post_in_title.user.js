// ==UserScript==
// @name			4chan show post in title
// @author			pecet
// @version			v1a
// @description		        shows title of thread or part of post in title of page
// @include			http://*.4chan.org/*/res/*
// ==/UserScript==

(function() 
{
	var post = (document.getElementsByTagName('blockquote')[0].textContent);
	var titleitself = (document.getElementsByClassName('filetitle')[0].textContent);
	var titl = document.title;
	document.title = '/' + titl.charAt(1) + ((titl.charAt(2)=='/')?'':titl.charAt(2) + ((titl.charAt(3)=='/')?'':titl.charAt(3))) + '/ ' + ((titleitself.length>0)?titleitself:post.substr(0,100));
})();
