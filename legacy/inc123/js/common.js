// JavaScript Document
/*
	* @added By : Keshav Mishra
	* @date     : 25 May 2009 
	* @purpose  : funciton show the loader image while loading ajax box
	* @params   :  
	*                        
*/

function pageLoading(divId)
{
	//$(divId).style.display='block';
	//$(divId).style.visibility = 'visible';
	$(divId).innerHTML = '<div id="loading"><img alt="Carregando..." src="images123/layout/ajax-loader.gif"/></div>';
}

/*
	* @added By : Keshav Mishra
	* @date     : 25 May 2009 
	* @purpose  : funciton stio the loader image while loading ajax box
	* @params   :  
	*                        
*/

function pageComplete(divId)
{
	$(divId).innerHTML = '';
	//$(divId).style.display='none';
	//$(divId).style.visibility = 'hidden';
}


function getResult(formId, divId, URL){
	new Ajax.Updater(divId, URL, {asynchronous:true, evalScripts:true, parameters:Form.serialize(formId), onLoading:function(request) {pageLoading(divId);},onComplete:function(request, json) {pageComplete(divId);}, requestHeaders:['X-Update', divId]});
}