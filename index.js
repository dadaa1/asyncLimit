// 并发处理

function asyncLimit(array,limit,cb,cbb){
    let obj=[];
    let length=Array.isArray(array)?array.length:Object.keys(array).length;
    let index=0;
    let b=0;
    limit=length<limit?array.length:limit;
    function iterator(array){ // 会对外部数组造成影响
        if(Array.isArray(array)){
            return{
                get:function(){
                    index++;
                    return {
                        index:index,
                        data:array.shift(),
                    };
                },
                next:function(){
                    return array.length>0;
                },
                setNext:function(){
                    array.length=0;
                    return false;
                }
            }
        }else if(array.toString()==='[Object Object]'){
            let keys=Object.keys(array);
            return {
                get:function(){
                    index++;
                    return {
                        index:index,
                        data:array[keys.shift()],
                    };
                },
                next:function(){
                    return keys.length>0;
                },
                setNext:function(){
                    keys.length=0;
                    return false;
                }
            }
        }
    }
    function run(){
        let item=iterator(array).get();
        cb(item.data,function(err,jj){
            if(err){
                console.log('错误信息：',err);
                iterator(array).setNext();
                add();
                return;
            }else{
                console.log(item.index,jj);
                obj.push({
                    index:item.index,
                    data:jj,
                });
                add();
            }
        });

    }
    function add(){
        if(!iterator(array).next()){
            b++;
            if(b==limit){ // 如果数组执行完了，把正在执行的函数执行完，最后一次执行总的回调函数
                obj.sort(function(a,b){
                    return a.index-b.index;
                });
                obj=obj.map(function(item){
                    return item.data;
                })
                cbb(obj);
                return;
            }else{
                return;
            }
        }
        run();
    }
    for(let i=0;i<limit;i++){
        run();
    }
}

let fs=require('fs');
let arr=['./txt/1.txt','./txt/2.txt','./txt/3.txt'];
asyncLimit(arr,4,function(item,cb){
    fs.readFile(item,function(err,data){
        if(item==='./txt/2.txt'){
            setTimeout(()=>{
                if(err) cb(err);
                cb(null,data);
            },3000)
        }else{
            if(err) cb(err);
            cb(null,data);
        }
    });
},function(o){
    console.log(o)
})

