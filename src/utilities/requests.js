var Zombie = require('zombie');


/**
 * Gets HTML markup doing get request
 */
module.exports.get = (uri, cookies) => {
  var browser = new Zombie();
  
  browser.cookies = cookies;

  return browser.fetch(uri)
  .then(function(response){
    if (response.status === 200)
      return response.text();
    else
      throw new Error("VTOP not working")
  })
  // .then(function(text) {
  //   console.log('Document:', text);
  // }); // To check if it working
}


/**
 * Gets HTML markup doing post request
 * Untested
 */
module.exports.post = (uri, cookies, form) => {
  var browser = new Zombie();

  browser.cookie = cookies;
  var formBody = [];

  for(let k in form){
    formBody.append(`${k}=${form[k]}`)
  }

  content.fetch("https://vtop.vit.ac.in/student/attn_report_details.asp", {  
    method: 'post',  
    headers: {  
      "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"  
    },  
    body: formBody.join('&')  
  }).then(function(response) {
    console.log('Status code:', response.status);
    if (response.status === 200)
      return response.text();
    else
      throw new Error("VTOP not working")
  })
  // .then(function(text) {
  //   console.log('Document:', text);
  // }); // For checking if its running
}