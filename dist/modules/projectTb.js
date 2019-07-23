/*
 * author:cai880210
 * license:eginsoft
 */
;layui.define(["table", "form", "element"], function(ep) {
	  var e = (layui.$,
    layui.admin), vw = layui.view
    ,t = layui.$
    , i = layui.table
    ,fm=layui.form
    , r = (layui.form,
    layui.element);
  i.render({
    elem: '#project-table'
    ,height: 400
    ,title: '用户数据表'
    ,url: 'data/test/demo1.json'
    //,size: 'lg'
    ,page: !0
    //,autoSort: false
    //,loading: false
    ,totalRow: true
    ,limit: 30
    ,limits: [10, 15, 20, 25, 30]
    ,toolbar: '#toolbarProject'
    //,defaultToolbar: ['filter']
    ,cols: [[
      {type: 'checkbox', fixed: 'left'}
      ,{field:'id', title:'ID', width:80, fixed: 'left', unresize: true, sort: true, totalRowText: '合计：'}
      ,{field:'username', title:'用户名', hide: true, width:120, edit: 'text', templet: '#usernameTpl'}
      ,{field:'email', title:'邮箱', hide: true, width:150, edit: 'text', templet: function(x){
        return '<em>'+ x.email +'</em>'
      }}
      ,{field:'sex', title:'性别', width:80, edit: 'text', sort: true}
      ,{field:'city', title:'城市', width:100}
      ,{field:'sign', title:'签名'}
      ,{field:'experience', title:'积分', width:80, sort: true, totalRow: true}
      ,{field:'ip', title:'IP', width:120}
      ,{field:'logins', title:'登入次数', width:100, sort: true, totalRow: true}
      ,{field:'joinTime', title:'加入时间', width:120}
      ,{fixed: 'right', title:'操作', toolbar: '#barDemo', width:150}
    ]]
    ,text: "对不起，加载出现异常！"
    ,done: function() {
        r.render("progress")
    }    
    ,response: {
      statusName: 'code'
      ,statusCode: 0
    }
    ,parseData: function(res){
    	console.log(res);
      return {
        "code": res.code
        ,"msg": res.msg
        ,"count": res.count
        ,"data": res.data
      };
    }
    
  }),
  
  //工具栏事件
  i.on('toolbar(project-table)', function(obj){
    var checkStatus = i.checkStatus(obj.config.id);
    switch(obj.event){
      case 'add':
        layer.msg('添加');
      break;
      case 'update':
        layer.msg('编辑');
      break;
      case 'delete':
        layer.msg('删除');
      break;
      case 'getCheckData':
        var data = checkStatus.data;
        layer.alert(JSON.stringify(data));
      break;
      case 'getCheckLength':
        var data = checkStatus.data;
        layer.msg('选中了：'+ data.length + ' 个');
      break;
      case 'isAll':
        layer.msg(checkStatus.isAll ? '全选': '未全选')
      break;
    };
  });
  //监听表格复选框选择
  i.on('checkbox(project-table)', function(obj){
    console.log(obj)
  }),

  //监听表格单选框选择
  i.on('radio(test)', function(obj){
    console.log(obj)
  }),
  
  //监听表格单选框选择
  i.on('rowDouble(project-table)', function(obj){
    console.log(obj);
  }),
  
  //监听单元格编辑
  i.on('edit(project-table)', function(obj){
    var value = obj.value //得到修改后的值
    ,data = obj.data //得到所在行所有键值
    ,field = obj.field; //得到字段
    
    console.log(obj)
  }),
  
  //监听行工具事件
  i.on('tool(project-table)', function(obj){
    var data = obj.data;
    console.log(obj)
    if(obj.event === 'del'){
      layer.confirm('真的删除行么', function(index){
        obj.del();
        layer.close(index);
      });
    } else if(obj.event === 'edit'){
    	//这里是操作列表
    	//编辑功能
    	e.popup({
            title: "编辑会员",
            area: ["550px", "550px"],
            id: "LAY-popup-content-edit",
            success: function(t, e) {
                vw(this.id).render("project-edit-demo", data).done(function() {
                    fm.render(null, "layuiadmin-app-form-list"),
                    fm.on("submit(layuiadmin-app-form-submit)", function(t) {
                        t.field;
                        layui.table.reload("project-table"),
                        layer.close(e)
                    })
                })
            }
     });

    }
  }),
  
  //监听排序
  i.on('sort(project-table)', function(obj){
    console.log(this)
    
    //return;
    layer.msg('服务端排序。order by '+ obj.field + ' ' + obj.type);
    //服务端排序
    i.reload('project-table', {
      initSort: obj
      //,page: {curr: 1} //重新从第一页开始
      ,where: { //重新请求服务端
        key: obj.field //排序字段
        ,order: obj.type //排序方式
      }
    });
  }),
    ep("projectTb", {})
});

