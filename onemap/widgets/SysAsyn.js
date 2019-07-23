define(["jquery"], function($) {
	var baseUrl="http://127.0.0.1:8080/forestry";
	function getSysDictionaries(id,key){
		  console.log("****调用数据字典*****");
		  $.ajax({             
			  url : baseUrl+"/sysDictionaries/queryList?key="+key,
			  type : "POST",
			  async : false,
			  success:function(r){
				  	console.log(r);
				    var jsonData = JSON.parse(r);
				  	var list = jsonData.data;
				  	var selectHtml='';
				  	for(i in list){
				  		var item=list[i];
				  		selectHtml+='<option value="'+item.code+'">'+item.name+'</option>';
				  	}
				  	$('#'+id+'').html(selectHtml);
			  },
			  error:function(err){
				  console.log(err);
			  }	 
		  });
	}
});

