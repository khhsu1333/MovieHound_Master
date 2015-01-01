module.exports = {
	hamdist : function (s1, s2)
	{ 
	   if(s1 == undefined || s2 == undefined) return -1;
	   if (s1.length != s2.length) return -1;
	   
	   var distance = 0;
	   
	   for(var i = 0; i < s1.length; i++)
	      if (s1.charAt(i) != s2.charAt(i))
	         distance++;
	   return distance;
	},
	
	sortResults : function (list, prop, asc) {
	    return list.sort(function(a, b) {
	        if (asc) return (a[prop] > b[prop]) ? 1 : ((a[prop] < b[prop]) ? -1 : 0);
	        else return (b[prop] > a[prop]) ? 1 : ((b[prop] < a[prop]) ? -1 : 0);
	    });
	}
};