/* * @Author: linfeng  
 * @createDate: 2019-01-05 10:07:04  
 * @Last Modified by: lingfeng
 * @Last Modified time: 2019-01-16 18:01:08
 * @description:  图片相关工具类*/

// 获取App.js配置
var app = getApp();
export default function imageUtil(page){
    let root = page;
    console.log(root);
    Object.assign(root,{
          imageUrlTransform : function(imgUrl){
            imgUrl= imgUrl.toString();
            var arr = imgUrl.split(";",1);
            if (imgUrl.indexOf("http") == -1 && imgUrl.indexOf("HTTP") == -1) {
                return "https://oss.meibbc.com/"+arr[0];
            } else {
              if (imgUrl.indexOf("https") == -1) {
                console.log("999999",arr[0].toString().replace("http","https"));

                return arr[0].toString().replace("http","https");
              } else {
                return arr[0];
              }
            
            }
          }

    })
}
