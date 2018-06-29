/*team.jsp 에서 gid, uid 를 가져오기 위한 함수*/
var gid;
var uid;

function get_info(gid, uid){
	gid = gid;
	uid = uid;
}


/* 멤버 초대 */
function member_insert(){
    $.confirm({
        title: '멤버 초대',
        content: '' +
        '<form id="insertMember" action="" class="formGroup" method="post">' +
        '<div class="form-group">' +
        '<label>추가 할 멤버의 이메일을 입력하세요</label>' +
        '<input type="text" name="uid" class="insertUid form-control"/>' +
        '<input type="hidden" name="gid" value="'+gid+'" class="banName form-control"/>' +
        '</div>' +
        '</form>',
        closeIcon: true,
        closeIconClass: 'fa fa-close',
        buttons: {
            formSubmit: {
                text: '초대',
                btnClass: 'btn-success',
                keys: ['enter'],
                action: function () {
                    var name = this.$content.find('.insertUid').val();
                    
                    if(!name){
	                    $.alert('닉네임을 적어주세요');
	                    return false;
	                }

                    $("#insertMember").submit();

                }
            },
            '취소': {
                btnClass: 'btn-red',
                action: function () {
                //close
                }
            },
        }
    });
}

/* 그룹 탈퇴 */
function group_leave(){
    $.confirm({
        title: '그룹 탈퇴',
        content: '' +
        '<form id="leaveGroup" action="" class="formGroup" method="post">' +
        '<div class="form-group">' +
        '<label>그룹을 탈퇴하시겠습니까</label>' +
        '<input type="hidden" name="uid" value="'+uid+'" class="leaveUid form-control"/>' +
        '<input type="hidden" name="gid" value="'+gid+'" class="banName form-control"/>' +
        '</div>' +
        '</form>',
        closeIcon: true,
        closeIconClass: 'fa fa-close',
        buttons: {
            formSubmit: {
                text: '탈퇴',
                btnClass: 'btn-success',
                action: function () {
                    var name = this.$content.find('.leaveUid').val();

                    $("#leaveGroup").submit();

                }
            },
            '취소': {
                btnClass: 'btn-red',
                action: function () {
                //close
                }
            },
        }
    });
}



/* 그룹 완료 */
function group_complete(){
    $.confirm({
        title: '그룹 완료',
        content: '' +
        '<form id="completeGroup" action="" class="formGroup" method="post">' +
        '<div class="form-group">' +
        '<label>해시태그를 입력하세요</label>' +
        '<input type="text" name="htag" class="htagName form-control" required/>' +
        '<input type="hidden" name="gid" value="'+gid+'" class="banName form-control"/>' +
        '</div>' +
        '</form>',
        closeIcon: true,
        closeIconClass: 'fa fa-close',
        buttons: {
            formSubmit: {
                text: '완료',
                btnClass: 'btn-success',
                action: function () {
                    var name = this.$content.find('.htagName').val();
                    if(!name){
	                    $.alert('해시태그를 적어주세요');
	                    return false;
	                }

                    $("#completeGroup").submit();

                }
            },
            '취소': {
                btnClass: 'btn-red',
                action: function () {
                //close
                }
            },
        }
    });
}


/* 멤버 강퇴 */
function member_ban(targetNname){
    $.confirm({
        title: '멤버 강퇴',
        content: '' +
        '<form id="banMember" action="" class="formGroup" method="post">' +
        '<div class="form-group">' +
        '<label>['+targetNname+'] 회원을 강퇴하시겠습니까</label>' +
        '<input type="hidden" name="nname" value="'+targetNname+'" class="banName form-control"/>' +
        '<input type="hidden" name="gid" value="'+gid+'" class="banName form-control"/>' +
        '</div>' +
        '</form>',
        closeIcon: true,
        closeIconClass: 'fa fa-close',
        buttons: {
            formSubmit: {
                text: '강퇴',
                btnClass: 'btn-success',
                action: function () {
                    var name = this.$content.find('.banName').val();

                    $("#banMember").submit();

                }
            },
            '취소': {
                btnClass: 'btn-red',
                action: function () {
                //close
                }
            },
        }
    });
}

/*마우스 오른쪽 이벤트 (회원강퇴) 추가*/


$(function() {
    $.contextMenu({
        selector: '.member', 
        callback: function(key, opt) {
            console.log(key);
            console.log(opt.$trigger.text().trim());
            var targetNname = opt.$trigger.text().trim();
            
            if(key=="ban"){
            	member_ban(targetNname);
            }
        },
        items: {
            "ban": {name: "강퇴"}
        }
    });   
});
	