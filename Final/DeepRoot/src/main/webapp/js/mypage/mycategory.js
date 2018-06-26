var urlpid = null;	//왼쪽 클릭된 폴더의 id
var firstclick = 0;	//왼쪽 폴더 클릭 되었는지 확인용
var child_data = null;	//오른쪽 url jstree data 담을 변수
var edit_htag_node_id = null;
var first_data = null;	//완료 그룹 모달 왼쪽 jstree
var right_data = null;	//완료 그룹 모달 오른쪽 jstree

$(document).ready(function(){
			
	/* mybookmark 가져오기 왼쪽 (폴더만 있는거) */
	$.ajax({
		url : "getCategoryList.do",
		type:"POST",
		dataType:"json",
		success : function(data){	

			/*왼쪽 jstree 시작하기 jstree 생성하고 싶은 div의 id를 적어준다.*/					
			$("#jstree_container")
				.jstree({	
					"core": {
						"data" : data, //ajax로 가져온 json data jstree에 넣어주기
						'themes':{
							'name' : 'proton', //테마 이름
							'responsive' : true,
							"dots": false, // 연결선 없애기
						},
						"check_callback" : function(op, node, par, pos, more){ // 특정 이벤트 실행 전에 잡아 낼 수 있음
							if(op === "move_node"){ // dnd 이벤트 일때 
								var dragnode = node.id;
								var dropnode = par.id;
								
								form = {dragnode : dragnode , dropnode : dropnode};
								
								$.ajax({	
									
									url : 'dropNode.do',
									type : 'POST',
									data : form,
									beforeSend : function(){
										$('#loading').html(" SAVING<span><img src='../images/throbber.gif' /></span>");
									},
									success : function(data){
										$('#loading').html("");
									}
								})
								return true;
							}else if(op === "create_node"){   //폴더 생성시 실행 되는 callback 함수
								$("#jstree_container_child").jstree(true).redraw_node(par, true); 
								return true;
							}else if(op == "copy_node"){	// 오른쪽 url 왼쪽 폴더로 옮기면 실행되는데 이때도 drag drop으로 처리함
								
								$.ajax({										
									url : 'dropNode.do',
									type : 'POST',
									data : {dragnode : node.id, dropnode : par.id},
									beforeSend : function(){
										$('#loading').html(" SAVING<span><img src='../images/throbber.gif' /></span>");
									},
									success : function(){
										$('#loading').html("");
										$('#jstree_container').jstree().deselect_all(true);											
										$('#jstree_container').jstree(true).select_node(par.id);											
									}
								});
								return false;	
							}
							return true;	
						}
					},
					"plugins" : [ "dnd","contextmenu" ], //drag n drop , 과 우클릭시 플러그인 가져옴

					"contextmenu" : { //우클릭시 생성되는 것들 설정
						"select_node" : false, // 우클릭 했을 경우 왼클릭되는거 막음
						
						/*왼쪽 jstree  우클릭시 생성되는 메뉴 구성하기 START*/
						"items" : function($node){ //우클릭된 node(폴더)의 정보를 가져온다.
							var href = $node.a_attr.href;
							var tree = $("#jstree_container").jstree(true);
							var tree_child = $("#jstree_container_child").jstree(true);
					    	  
							// 링크 만들기, 폴더 만들기, 이름 바꾸기, 삭제
							return {
								"link_create" : {
									"icon" : "fa fa-plus",
									"separator_before": false,
									"separator_after": false,
									"label": "URL 추가",
									"action": function (obj) { 
										$('#form_btn')[0].reset();// modal input text 창 초기화
										var inst = $.jstree.reference(obj.reference); // 내가 우 클릭한 node의 정보
										$('#linkAdd_btn').modal(); // url 추가하는 modal 창이 나온다.
										addUrlLevel1();
									}
								},
								"folder_create": {
									"icon" : "fa fa-plus-circle",
									"separator_before": false,
									"separator_after": false,
									"_disabled" : false, 
									"label": "그룹 추가",
									"action": function (obj) {
										var inst = $.jstree.reference(obj.reference);
										var par_node = inst.get_node(obj.reference);
										var par = inst.get_node(obj.reference).id;
										var form = {urlname : "새 폴더", pid : par };// 해당 유저의 아이디 가져오기
										
										$.ajax({
											url: "addFolderOrUrl.do",
											type :"POST",
											data : form,
											beforeSend : function(){
												$('#loading').html(" SAVING<span><img src='../images/throbber.gif' /></span>");
							     				},
							     				success : function(data){
							     					$('#loading').html("");
							     					var node_id = $.trim(data.ubid);
							     					/*왼쪽 jstree 새폴더 생성과 동시에 이름 수정하게 하기*/
							     					tree.create_node(par_node , {text : "새 폴더" , id : node_id  ,icon : "fa fa-folder"} ,"last",function(new_node){
							     						new_node.id = node_id;
							     						tree.edit(new_node);
						            				 	});
					              			 	 	}
						               		  	})
									}
								},
								"rename" : {
									"icon" : "fa fa-edit",
									"separator_before": false,
									"separator_after": false,
									"label": "이름 수정",
									"action" : function (obj) {
										/*왼쪽 jstree 이름 수정하기 아래에 함수 있음*/
										tree.edit($node);			
									}
								},
								"remove" : {
									"icon" : "fa fa-trash",
									"separator_before": false,
									"separator_after": false,
									"label": "삭제",
									"action": function (obj) { 
										tree.delete_node($node);
									}
								}
						        };						
						}
					}			    
				})	
				.bind("loaded.jstree", function (event, data) {
					$('#jstree_container').jstree("open_all");
					var test = data.instance._model.data
					var head = 0;
				})
				.bind("select_node.jstree", function (e, data) {
					/*왼쪽 jstree 노드(폴더)가 선택시 실행되는 함수*/					
 					var id = data.node.id;
 					urlpid = id;
 					
 					//선택된 노드(폴더)아래에 있는 url 가져오기
 					$.ajax({
 											
 						url : "getUrl.do",
 						type : "POST",
 						dataType:"json",
 						data : {ubid : id},
 						success : function(data){
	 						child_data = data;
	 						//오른쪽에 있는 jstree 값 새로 넣어주고 refresh해주기
 							$("#jstree_container_child").jstree(true).settings.core.data = data;
 							$("#jstree_container_child").jstree(true).refresh();
						}
	 				})
				}) 
			    .bind('rename_node.jstree', function(event, data){
		    		var node_id = data.node.id;
		    		var node_text = data.text;
		    		/*왼쪽 jstree 폴더 이름 수정하기*/			    		
		    		$.ajax({
	        			url : 'updateNodeText.do',
	        			type: 'POST',
	        			data: {'id' : node_id, 'text' : node_text},
	        			beforeSend : function(){
	        				$('#loading').html(" SAVING<span><img src='../images/throbber.gif' /></span>");
     					},
	        			success : function(result){
	        				$('#loading').html("");
	        			}
	        		});   
		    	})
		    	.bind('delete_node.jstree',function(event,data){
			    		/*왼쪽 jstree 폴더 삭제하기*/
		    		var node_id = data.node.id;
		    		var form = {node : node_id}

		    		$.ajax({
		    			url:'deleteNode.do',
		    			type:'POST',
		    			dataType : "json",
		    			data: form,
		    			beforeSend : function(){
		    				$('#loading').html(" SAVING<span><img src='../images/throbber.gif' /></span>");
     					},
     					success : function(result){
		    				$('#loading').html("");
						}
					})  
		    	});
		}
	})
			
	/*왼쪽 위에 new category 버튼 클릭시 실행*/			
	$('#addroot')
		.on("click",function(){
		
			var tree = $("#jstree_container").jstree(true);
				  
			$.ajax({
			
				url : "addRoot.do",
				type : "POST",
				beforeSend : function(){
					$('#loading').html(" SAVING<span><img src='../images/throbber.gif' /></span>");
				},
				success : function(data){
					$('#loading').html("");
					var ubid = $.trim(data.ubid);
					//root 카테로기 생성
					tree.create_node( null , {text : "새 카테고리" , id : ubid , icon : "fa fa-folder"} ,"last",function(new_node){
						new_node = ubid;
						tree.edit(new_node); //생성과 동시에 이름 수정할 수 있게 함
					});
				}
			})
		})

	/*오른쪽 위에 url 추가하기 버튼 클릭시 실행 됨*/			
	
	$("#addurl")
		.on("click",function(){
			var tree_child = $("#jstree_container_child").jstree(true);
		
			//왼쪽 폴더 선택 안하고 클릭한 것을 방지한다.
			if(urlpid == null){
				$.alert("URL을 추가할 카테고리를 선택해주세요");
				return false;
			}
			// 모달창 띄우기 전에 reset하기
			$('#form_btn')[0].reset();// modal input text 창 초기화
			$('#linkAdd_btn').modal(); // url 추가하는 modal 창이 나온다.
			addUrlLevel1();
		
		});

	/*오른쪽 jstree 생성*/
	$("#jstree_container_child")
		.jstree({
			"core" : {
				'data' : child_data,
				'themes' : { 
					'name' : 'proton',
					'responsive' : true,
					"dots": false
				},
				"check_callback" : function(op, node, par, pos, more){
					if(op === "move_node"){ // dnd 이벤트 일때 
						return false;
					}							
					return true;	
				}
			},
			"plugins" : [ "dnd","contextmenu" , "wholerow"],
		
			"contextmenu" : {
				
				"select_node" : false,
				"items" : function($node){
					
					var tree_child = $("#jstree_container_child").jstree(true);
					var htag = $node.original.htag;
					
					if(htag == '#'){
						
						return{
							"edit" : {
								"icon" : "fa fa-edit",
								"separator_before": false,
								"separator_after": false,
								"label" : "수정",
								"action" : false,
								"submenu" :{
									/*오른쪽 jstree 이름 수정*/							            	  
									"rename" : {
										"separator_before"	: false,
										"separator_after"	: false,
										"label" : "이름 수정",
										"action" : function(obj){
											tree_child.edit($node);
										}
									},
									/*오른쪽 jstree url 수정*/						            	  
									"editurl" : {
										"separator_before"	: false,
										"separator_after"	: false,
										"label" : "URL 수정",
										"action" : function(obj){
											
											$('#form3')[0].reset();	// url 모달창 reset
											$('#editurl').modal();	//url 수정 모달창 띄우기
											
											var inst = $.jstree.reference(obj.reference);
											var url = inst.get_node(obj.reference).a_attr.href;
											var id = inst.get_node(obj.reference).id;
											
											$('#editurlval').val(url);
											
											$('#editurlsubmit').on("click",function(){
												
												var newurl = $('#editurlval').val();
												var form = {ubid : id, url : newurl }
												
												$.ajax({
													
													url: "editUrl.do",
													type: "POST",
													data: form ,
													beforeSend : function(){
														$('#loading').html(" SAVING<span><img src='../images/throbber.gif' /></span>");
													},
													success: function(data){
														$('#loading').html("");
														$('#editurl').modal("toggle");
													}
												}) 
											})
										}
									}
								}
							},
							/*오른쪽 jstree 삭제*/								
							"remove": {
								"icon" : "fa fa-trash",
								"separator_before": false,
								"separator_after": false,
								"label": "삭제",
								"action": function (obj) { 
									tree_child.delete_node($node);
								}
							},
							/*오른쪽 jstree 공유하기*/	
							"sharing"	:{
								"separator_before": false,
								"separator_after": false,
								"label": "공유하기",
								"icon" : "fa fa-share",
								"action": function (obj) { 
							                	
									var inst = $.jstree.reference(obj.reference);
									var id = inst.get_node(obj.reference).id;
									var sname =  inst.get_node(obj.reference).text;
									var htagStartPoint = 1;
									edithashtagList = [];	//htag list reset
									edit_htag_node_id = id;
					                			
									$('#edit_htag_append').empty();	//기존 모달에 있던 htag button 없애기
									$('#edit_htag_btn').empty();
									$('#edit_htag').modal();	//htag 수정하기 모달
									$('#edit_sname_btn').val(sname);	//sname 넣어주기
							                	
								}
							},
							/*오른쪽 jstree url 관리자 추천 email*/						            
							"recommend" :{
								"separator_before": false,
								"separator_after": false,
								"label": "관리자 추천",
								"action": function (obj) { 
							                	
									var inst = $.jstree.reference(obj.reference);
									var url = inst.get_node(obj.reference).a_attr.href;
									var text = inst.get_node(obj.reference).text;
									
									form = {url : url , text : text }
									
									$.ajax({
										
										url : "recommend.do",
										type : "POST",
										data : form,
										beforeSend : function(){
											$('#loading').html("<p>   SAVING  </p><img src='../images/throbber.gif' />");
										},
										success : function(data){
											$('#loading').html("");
										}
									})
								}
							}
						}		
					}else{
						/*오른쪽 jstree 공유된 url*/									
						return{
							/*오른쪽 jstree 수정*/									
							"edit" : {
								"icon" : "fa fa-edit",
								"separator_before": false,
								"separator_after": false,
								"label" : "수정",
								"action" : false,
								"submenu" :{
									"rename" : {
										"separator_before"	: false,
										"separator_after"	: false,
										"label" : "이름 수정",
										"action" : function(obj){
											tree_child.edit($node);
										}
									},
									/*오른쪽 공유된 jstree url 수정*/							            	  
									"editurl" : {
										"separator_before"	: false,
										"separator_after"	: false,
										"label" : "URL 수정",
										"action" : function(obj){
											
											$('#form3')[0].reset();	// url 모달창 reset
											$('#editurl').modal();	//url 수정 모달창 띄우기
											
											var inst = $.jstree.reference(obj.reference);
											var url = inst.get_node(obj.reference).a_attr.href;
											var id = inst.get_node(obj.reference).id;
											                
											$('#editurlval').val(url);
											$('#editurlsubmit').on("click",function(){
												
												var newurl = $('#editurlval').val();
												var form = {ubid : id, url : newurl }
												
												$.ajax({
													
													url: "editUrl.do",
													type: "POST",
													data: form ,
													beforeSend : function(){
														$('#loading').html("<p>   SAVING  </p><img src='../images/throbber.gif' />");
													},
													success: function(data){
														$('#loading').html("");
														$('#editurl').modal("toggle");
													}
												}) 
											})
										}
									}
								}
							},
							/*오른쪽 공유된 jstree 삭제*/									
							"remove": {
								"icon" : "fa fa-trash",
								"separator_before": false,
								"separator_after": false,
								"label": "삭제",
								"action": function (obj) { 
									tree_child.delete_node($node);
								}
							},
							
							"recommend" :{
								"separator_before": false,
								"separator_after": false,
								"label": "관리자 추천",
								"action": function (obj) { 
							                	
									var inst = $.jstree.reference(obj.reference);
									var url = inst.get_node(obj.reference).a_attr.href;
									var text = inst.get_node(obj.reference).text;
									
									form = {url : url , text : text }
									
									$.ajax({
										
										url : "recommend.do",
										type : "POST",
										data : form,
										beforeSend : function(){
											$('#loading').html("<p>   SAVING  </p><img src='../images/throbber.gif' />");
										},
										success : function(data){
											$('#loading').html("");
										}
									})	
								}
							},
							/*오른쪽 공유된 jstree 공유 */
							"share":{
								"icon" : "fa fa-share",
								"separator_before" : true,
								"separator_after" : false,
								"label": "공유",
								"action" : false,
								"submenu" : {
									/*오른쪽 공유된 jstree 공유 수정하기*/							                	
									"editing" :{
										"separator_before"	: false,
										"separator_after"	: false,
										"label": "수정하기",
										"action" : function(obj){
								                			
											var inst = $.jstree.reference(obj.reference);
											var id = inst.get_node(obj.reference).id;
											var sname =  inst.get_node(obj.reference).original.sname;
											var htags =  inst.get_node(obj.reference).original.htag
											var htag_split = htags.split('#');
											var htagStartPoint = 1;
											edithashtagList = [];	//htag list reset
											edit_htag_node_id = id;
								                			
											$('#edit_htag_append').empty();	//기존 모달에 있던 htag button 없애기
											$('#edit_htag_btn').empty();
											$('#edit_htag').modal();	//htag 수정하기 모달
											$('#edit_sname_btn').val(sname);	//sname 넣어주기
								                			
											for(var i = 1; i<htag_split.length ; i++){
												edithashtagList.push("#"+htag_split[i]); //배열에 기존 htag 저장
												$('#edit_htag_append').append("<input class='btn btn-default btn-hash' id='btnEditHash" + htagStartPoint + "' type='button' value='#" + htag_split[i] + "' onclick='edit_deleteHashtag(this)'>");
												htagStartPoint +=1;
											}
										}
									},
									/*오른쪽 공유된 jstree 공유 취소하기*/
									"dimiss" :{
										"separator_before"	: false,
										"separator_after"	: false,
										"label" : "취소하기",
										"action" : function(obj){
											var inst = $.jstree.reference(obj.reference);
											var id = inst.get_node(obj.reference).id;
											
											$.ajax({
												url: 'shareUrlEdit.do',
												type: 'POST',
												data: {ubid: id },
												beforeSend : function(){
													$('#loading').html("<p>   SAVING  </p><img src='../images/throbber.gif' />");
												},
												success:function(data){
													$('#loading').html("");
													var selected_node_left = $('#jstree_container').jstree("get_selected",true)[0].id;
													$('#jstree_container').jstree().deselect_all(true);											
													$('#jstree_container').jstree(true).select_node(selected_node_left);											
												}
											})
										}
									}
								}
							}
						}
					}
				}
			}
		})
		.bind("select_node.jstree",function(e,data){
			var href = data.node.a_attr.href;
			
			window.open(href); 
			$('#jstree_container_child').jstree().deselect_all(true);			
			
		}) 
		.bind("delete_node.jstree",function(event,data){
			
			var node_id = data.node.id;
			var form = {node : node_id}
			
			$.ajax({
				url:'deleteNode.do',
				type:'POST',
				dataType : "json",
				data: form,
				beforeSend : function(){
					$('#loading').html("<p>   SAVING  </p><img src='../images/throbber.gif' />");
				},
				success:function(result){
					$('#loading').html("");
				}
			})  
		})
		.bind('rename_node.jstree', function(event, data){
			var node_id = data.node.id;
			var node_text = data.text;
			
			$.ajax({
				url : 'updateNodeText.do',
				type: 'POST',
				data: {'id' : node_id, 'text' : node_text},
				beforeSend : function(){
					$('#loading').html("<p>   SAVING  </p><img src='../images/throbber.gif' />");
				},
				success : function(result){
					$('#loading').html("");
					if(result.result != 1)
						alert('수정 실패');
				}
			});   
		})
		.bind("load_node.jstree",function(event,data){
			var node_ids = [];
			var create_icon = document.createElement("i");
			create_icon.setAttribute("class","fas fa-share-alt");
			node_ids = data.node.children;
			for(var i in node_ids){
				var sname = $('#jstree_container_child').jstree(true).get_node(node_ids[i]).original.sname;
				if(sname != "#"){
					$('#'+ node_ids[i]).append("<i class='shared fas fa-share-alt'></i>");
					
				}
			}
		})
		
		//완료 그룹 모달 왼쪽 jstree
	$("#jstree-from-left")
		.jstree({
			"core" : {
					'data' : first_data,
					'themes':{
						'name' : 'proton',
						'responsive' : true,
						'dots' : false,
					}
			},
			"checkbox" : { // 체크 박스 클릭시에만 checked 되기
				"whole_node" : false,
				"tie_selection" : false
			},
			"plugins" : ["checkbox" ]
			
		})
		.bind("select_node.jstree",function(event,data){  });
	
			//완료 그룹 모달 오른쪽 jstree
	$('#jstree-to-right')
		.jstree({
			"core" : {
				'data' : right_data,
				'themes':{
					'name' : 'proton',
					'responsive' : true,
					'dots' : false,
				}
			}
		})
	.bind("select_node.jstree",function(e,data){
		selected_node_id= data.node.id;
	});	
		
	
	/*왼쪽 jstree 폴더 열렸을 경우 아이콘 변경해 주기*/	
	$("#jstree_container").on('open_node.jstree', function(e,data){
		$.jstree.reference('#jstree_container').set_icon(data.node, "fa fa-folder-open")
	})
	/*왼쪽 jstree 폴더 닫혔을 경우 아이콘 변경해 주기*/
	$("#jstree_container").on('close_node.jstree', function(e,data){
		$.jstree.reference('#jstree_container').set_icon(data.node, "fa fa-folder")
	})
	/*완료 그룹 모달창 왼쪽 jstree 폴더 열렸을 경우 아이콘 변경해 주기*/	
	$("#jstree-from-left").on('open_node.jstree', function(e,data){
		$.jstree.reference('#jstree-from-left').set_icon(data.node, "fa fa-folder-open")
	})
	/*완료 그룹 모달창 왼쪽 jstree 폴더 닫혔을 경우 아이콘 변경해 주기*/
	$("#jstree-from-left").on('close_node.jstree', function(e,data){
		$.jstree.reference('#jstree-from-left').set_icon(data.node, "fa fa-folder")
	})
	/*완료 그룹 모달창 오른쪽 jstree 폴더 열렸을 경우 아이콘 변경해 주기*/		
	$("#jstree-to-right").on('open_node.jstree', function(e,data){
		$.jstree.reference('#jstree-to-right').set_icon(data.node, "fa fa-folder-open")
	})
	/*완료 그룹 모달창 오른쪽 jstree 폴더 닫혔을 경우 아이콘 변경해 주기*/	
	$("#jstree-to-right").on('close_node.jstree', function(e,data){
		$.jstree.reference('#jstree-to-right').set_icon(data.node, "fa fa-folder")
	})

});
var edithashtagList = [];
var hashtagList = [];
var hashtagStartPoint = 0;
var check_htag = '';

/*URL 해시태그 추가*/ 
function addHashtag() {
	if (event.keyCode == 13 || event.keyCode == 32 ) {
		hashtagList.push("#"+$.trim($('#htag_btn').val()));
		var hashtag = $.trim($('#htag_btn').val());
		$('#htag_btn').val('');
		$('#htag_btn').focus();
		$('#htag_append').append("<input class='btn btn-default btn-hash' id='btnHash" + hashtagStartPoint + "' type='button' value='#" + hashtag + "' onclick='deleteHashtag(this)'>");
		hashtagStartPoint++;
	}
}

/*해시태그 수정*/
function edit_addHashtag() {
	if (event.keyCode == 13 || event.keyCode == 32 ) {
		edithashtagList.push("#"+$.trim($('#edit_htag_btn').val()));
		var hashtag = $.trim($('#edit_htag_btn').val());
		$('#edit_htag_btn').val('');
		$('#edit_htag_btn').focus();
		$('#edit_htag_append').append("<input class='btn btn-default btn-hash' id='btnHash" + hashtagStartPoint + "' type='button' value='#" + hashtag + "' onclick='edit_deleteHashtag(this)'>");
		hashtagStartPoint++;
	}
}

/*해시태그 삭제*/
function deleteHashtag(data) {
	var str = $(data).attr('id');
	$('#' + str).remove();
	var val = $(data).val();
	hashtagList.splice($.inArray(val, hashtagList), 1);
}

/*해시태그 수정에서 삭제*/
function edit_deleteHashtag(data) {
	var str = $(data).attr('id');
	$('#' + str).remove();	//버튼 삭제
	var val = $(data).val();
	edithashtagList.splice($.inArray(val, edithashtagList), 1);
}

/*해시태그 수정에서 submit*/
function edit_htag_submit(){
	var sname = $('#edit_sname_btn').val();
	var htag = '';
	$.each(edithashtagList , function(index,data){
		htag += data;	
	})
	    
	if(sname == ""){
		$.alert("공유제목을 입력해주세요")
	}else if(htag == ""){
		$.alert("해시태그를 하나 이상 입력해주세요")
	}else if(edithashtagList.length >10){
		$.alert("해시태그를 10개 까지만 입력 가능합니다");
	}else{
	
		
		var form = {ubid : edit_htag_node_id , sname : sname , htag : htag}
		
		$.ajax({
			url : 'shareUrlEdit.do',
			type : 'POST',
			data : form,
			success : function(data){
				$('#edit_htag').modal("toggle");
			}
		})
	}
}


// 희준
// URL 추가 함수

function addUrlLevel1() {
	$(".addUrlLevel1").show();
	$(".addUrlLevel2").hide();
	$(".addUrlLevel2-1").hide();
	$(".addUrlLevel2-2").hide();
	$(".addUrlLevel3").hide();
}

function openAddUrlLevel2() {
	
	$("#share_btn").change(function(){
		if($("#share_btn").is(":checked")){
			$(".addUrlLevel2-1").hide();
			$(".addUrlLevel2-2").show();
		}else {
			$(".addUrlLevel2-2").hide();
			$(".addUrlLevel2-1").show();
		}
	});
	
	var url = $("#url_btn").val().trim();
	if(url == ""){
		$.alert("URL을 입력해주세요");
	}else {
		$.ajax({
    		url: "/bit/admin/preview.do",
			type: "post",
			data : {
				url : url // URL 주소
			},
			beforeSend: function() {
				
				$("#title_btn").css("cursor", "wait ");
         		$("#title_btn").val("");
         		//console.log("부모 ID : " + urlpid);
         		
         		var text = $('#jstree_container').jstree(true).get_node(urlpid).text;
         		//console.log("카테고리 : " + text + "/////")
         		$("#category_btn").val(text);
         		addUrlLevel2();
            },
            complete: function() {
            	$("#title_btn").css("cursor", "default");
            },
			success : function(data){
				$("#title_btn").val(data.title);
				
			},
    	});
	}
	
	
}

// 2단계 폼 보여주기
function addUrlLevel2() {
	$(".addUrlLevel2").show();
	$(".addUrlLevel2-1").show();
	$(".addUrlLevel1").hide();
	$(".addUrlLevel2-2").hide();
	$(".addUrlLevel3").hide();
}

// 3단계에서 이전 버튼을 눌렀을 때
function addUrlLevel2_1() {
	$(".addUrlLevel2").show();
	$(".addUrlLevel2-1").hide();
	$(".addUrlLevel1").hide();
	$(".addUrlLevel2-2").show();
	$(".addUrlLevel3").hide();
}

// 2단계에서 다음 버튼 눌렀을 때
function openAddUrlLevel3() {
	var url = $("#title_btn").val().trim();
	
	if(url == ""){
		$.alert("제목을 입력해주세요");
	}else {
		$("#sname_btn").val($("#title_btn").val());
		addUrlLevel3();
	}
	
}

// 3단계 화면 보여주기
function addUrlLevel3() {
	$('#htag_append').empty();
	hashtagList = [];
	$(".addUrlLevel1").hide();
	$(".addUrlLevel2").hide();
	$(".addUrlLevel2-1").hide();
	$(".addUrlLevel2-2").hide();
	$(".addUrlLevel3").show();
}

// 공유버튼 누르지 않고 URL 추가하기
function addUrlNotShare() {
	var url = $('#url_btn').val(); //추가 url 값
	var title = $('#title_btn').val(); // 추가 url 명값
	var tree_child = $("#jstree_container_child").jstree(true);
	// var parent = par;
	
	 if(title == ""){
		 $.alert("제목을 입력해주세요")
	 }else {
		 var form = {url : url , urlname : title , pid : urlpid};
		 $.ajax({
			 url: "addUrlNotShare.do",
			 type :"POST",
			 data : form,
			 success : function(data){//나중에 sequence 나 autoincrement 사용해서 하나 올린 값을 받아서 insert 해주고 data 보내주어 view단 node 생성해주기	
				 $('#linkAdd_btn').modal("toggle"); // 모달 창 닫아주기
				 //console.log(data);	//id 확인
				 var node_id = $.trim(data);
				 tree_child.create_node( null , {text : title , id : node_id , a_attr : {href : url} , icon : "https://www.google.com/s2/favicons?domain="+ url} ,"last",function(new_node){
					 //console.log(new_node.id);
				 });
			 }
		 });
	}

}

// 공유버튼 누르고 URL 추가하기
function addUrlShare() {
	var url = $('#url_btn').val(); //추가 url 값
	var title = $('#title_btn').val(); // 추가 url 명값
	var htag='';
	var sname = $.trim($('#sname_btn').val());
	var tree_child = $("#jstree_container_child").jstree(true);
	
	 $.each(hashtagList , function(index,data){
	    	htag += data;
	    })
	
	// var parent = par;
	//console.log(url,title,par,sname,htag); //확인
	if(sname == ""){
		$.alert("공유제목을 입력해주세요")
	}else if(htag == ""){
		$.alert("해시태그를 하나 이상 입력해주세요")
	}else if(hashtagList.length >10){
		$.alert("해시태그는 10개까지만 입력 가능합니다.");
	}else{
		var form = {url : url , urlname : title , pid : urlpid , htag : htag , sname : sname};
		$.ajax({
			url: "addFolderOrUrl.do",
			type :"POST",
			data : form,
			success : function(data){//나중에 sequence 나 autoincrement 사용해서 하나 올린 값을 받아서 insert 해주고 data 보내주어 view단 node 생성해주기	
				$('#linkAdd_btn').modal("toggle"); // 모달 창 닫아주기
				//console.log(data);	//id 확인
				var node_id = $.trim(data.ubid);
				tree_child.create_node( null , {text : title , id : node_id , a_attr : {href : url} , icon : "https://www.google.com/s2/favicons?domain="+ url} ,"last",function(new_node){
					//console.log(new_node.id);
				});
			}
		});
	}
}

function deleteGroup(gid) {
	$.confirm({
		title : '그룹 삭제',
		content : '삭제하시겠습니까?',
		theme: 'light',
		backgroundDismiss: true,
		closeIcon: true,
	    closeIconClass: 'fa fa-close',
		buttons: {
	        '삭제': {
	        	btnClass : 'btn-danger',
	        	keys: ['enter'],
	        	action : function () {
	        		$("#"+gid).remove(); // 그룹리스트에서 지우기
	    			$.ajax({
	    				url: "leaveGroup.do",
	    				type: "post",
	    				data : {
	    					gid : gid // 그룹 ID
	    				},
	    				success : function(data){
	    					console.log(data);
	    				}
	    			});
	        	}
	        },
	     
	        '취소': {
	        	btnClass : 'btn-success',
	        	action : function() {
	        		
	        	}
	        }
	    }
	});
}

function deleteCompletedGroup(gid) {
	$.confirm({
		title : '완료된 그룹 삭제',
		content : '삭제하시겠습니까?',
		theme: 'light',
		backgroundDismiss: true,
		closeIcon: true,
	    closeIconClass: 'fa fa-close',
		buttons: {
	        '삭제': {
	        	btnClass : 'btn-danger',
	        	keys: ['enter'],
	        	action : function () {
	        		$("#completed"+gid).remove(); // 완료된 그룹리스트에서 지우기
	    			$.ajax({
	    				url: "leaveGroup.do",
	    				type: "post",
	    				data : {
	    					gid : gid // 그룹 ID
	    				},
	    				success : function(data){
	    					console.log(data);
	    				}
	    			});
	        	}
	        },
	     
	        '취소': {
	        	btnClass : 'btn-success',
	        	action : function() {
	        		
	        	}
	        }
	    }
	});
}

function addGroup() {
	$.confirm({
	    title: '그룹 추가',
	    content: '' +
	    '<form id="addGroupForm" action="${pageContext.request.contextPath}/addGroup.do" class="formName" method="post">' +
	    '<div class="form-group">' +
	    '<label>그룹명</label>' +
	    '<input type="text" name="gname" placeholder="그룹명" class="name form-control" required />' +
	    '</div>' +
	    '</form>',
	    closeIcon: true,
	    closeIconClass: 'fa fa-close',
	    
	    buttons: {
	        formSubmit: {
	            text: '추가',
	            btnClass: 'btn-success',
	            keys: ['enter'],
	            action: function () {
	                var name = this.$content.find('.name').val();
	                if(!name){
	                    $.alert('그룹명을 적어주세요');
	                    return false;
	                }
	                $("#addGroupForm").ajaxForm({
	                	success: function(data, statusText, xhr, $form){
	                		var group = '<li id="${team.gid}" class="list-group-item">';
	                		group += '<label class="my-group-list">' + data.newTeam.gname + '</label>';
	                		group += '<div class="pull-right action-buttons">';
	                		group += '<a class="completed">';
	                		group += '<span class="glyphicon glyphicon-check" onclick="completedGroup(' + data.newTeam.gid + ')"></span>';
							group += '</a>';
							group += '</div>';
							group += '</li>';
							
                			$("#participatingGroupList").children().last().before(group);
	                	}
	                });
	                
	                $("#addGroupForm").submit();
	                
	            }
	        },
	        '취소': {
	        	btnClass : 'btn-danger',
        		action : function() {
        		
        		}
	        },
	    }

	});
}

function completedGroup(gid) {
	$.confirm({
	    title: '그룹 완료',
	    content: '' +
	    '<form id="completedGroupForm" action="${pageContext.request.contextPath}/user/completedGroup.do" class="formName" method="post">' +
	    '<div class="form-group">' +
	    '<label>해시태그</label>' +
	    '<input type="text" name="htag" placeholder="#해쉬태그" class="name form-control" required />' +
	    '<input type="hidden" class="gid" name="gid" />' + 
	    '</div>' +
	    '</form>',
	    closeIcon: true,
	    closeIconClass: 'fa fa-close',
	    
	    buttons: {
	        formSubmit: {
	            text: '완료',
	            btnClass: 'btn-success',
	            action: function () {
	                var name = this.$content.find('.name').val();
	                this.$content.find('.gid').val(gid);
	                if(!name){
	                    $.alert('해시태그를 적어주세요');
	                    return false;
	                }
	                
	                $("#completedGroupForm").ajaxForm({
	                	success: function(data, statusText, xhr, $form){
	                		$("#"+ data.completedGroup.gid).remove();
	                		
	                		var addCompletedGroup = "";
	                		addCompletedGroup += '<li id="' + data.completedGroup.gid + '" class="list-group-item">';
	                		addCompletedGroup += '<label class="my-group-list" onclick="open_completed_group_modal('+ data.completedGroup.gid + ')">' + data.completedGroup.gname + '</label>';
	                		addCompletedGroup += '<div class="pull-right action-buttons">';
	                		addCompletedGroup += '<a class="trash"><span class="glyphicon glyphicon-trash" onclick="deleteCompletedGroup(' + data.completedGroup.gid + ')"></span></a>';
	                		addCompletedGroup += '</div>';
	                		addCompletedGroup += '</li>';
	                		
	                		$("#completedGroupList").append(addCompletedGroup);
	                	}
	                });
	                
	                $("#completedGroupForm").submit();
	                
	            }
	        },
	        '취소': {
	        	btnClass : 'btn-danger',
        		action : function() {
        		}
	        },
	    }
	    
	});
}

var selected_node_id = 0;

//완료된 그룹 리스트 클릭시 해당 그룹의 북마크 가져온다.
function open_completed_group_modal(gid){
	$('#completedGroupModal').css({"z-index":"9999"});
	//완료된 그룹 북마크 가져오기
	$.ajax({
		url : "getCompletedTeamBookmark.do",
		type : "POST",
		data : {gid : gid},	/* group id 를 넣어야 한다. */
		dataType :"json",
		success : function(obj){
			//모달 왼쪽 jstree에 data 넣어주기
			first_data = obj;
			$('#jstree-from-left').jstree().deselect_all(true);
			$('#jstree-from-left').jstree(true).settings.core.data = obj;
			$('#jstree-from-left').jstree(true).refresh();
		}
	})
	//모달 오른쪽 selected 된거 없애기
	$('#jstree-to-right').jstree().deselect_all(true);
	//완료 그룹 모달 띄우기
	$('#completedGroupModal').modal();
};

//완료된 그룹 url 선택후 save 버튼 클릭시
function submitgroupurl() {
	var checked_ids = [];
	var submit_obj = [];
	
	checked_ids = $('#jstree-from-left').jstree("get_checked",null,true);
	
	if(checked_ids == null){
		alert("선택한 URL이 없습니다.")
		return false
	};
	if(selected_node_id == 0) {
		alert("가져가기 할 폴더를 선택하지 않았습니다.")
		return false
	};
	
	$.each(checked_ids,function(key,value) {
		//폴더가 아닌 url만 골라 가져가기
		var checked_url = $('#jstree-from-left').jstree(true).get_node(value).a_attr.href;
		var urlname = $('#jstree-from-left').jstree(true).get_node(value).text;
		if(checked_url !='#'){
			submit_obj.push({url : checked_url , urlname : urlname, pid : selected_node_id}) 
		}
	});
	
	var submit_obj_json = JSON.stringify(submit_obj);
	$.ajax({
		
		url : "insertGroupUrl.do",
		type : "POST",
		data : {obj : submit_obj_json},
		success : function(){
			
		    $('#completedGroupModal').modal("toggle"); 
			$('#jstree_container').jstree().deselect_all(true);
			$('#jstree_container').jstree(true).select_node(selected_node_id);			
			selected_node_id = 0;
		}
	});
	
	$('#completedGroupModal').css({"z-index":"-10"});
}
