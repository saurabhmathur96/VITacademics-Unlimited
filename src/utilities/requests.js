const Zombie = require('zombie');


/**
 * Gets HTML markup doing get request
 */
module.exports.get = (uri, cookies) => {
  let browser = new Zombie();

  browser.cookies = cookies;

  return browser.fetch(uri)
    .then(function (response) {
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
  let browser = new Zombie();

  browser.cookies = cookies;

  let options = {
    method: 'post',
    headers: {
      "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
    }
  };
  if (form !== null || form !== undefined) {
    let formBody = [];
    for (var k in form) {
      formBody.push(`${k}=${form[k]}`);
    }
    options.body = formBody.join('&');
    console.log(options.body);
  }




  return browser.fetch(uri, options).then(function (response) {
    if (response.status === 200) {
      return response.text();
    }
    else {
      throw new Error(`Error making post request to vtop (status=${response.status})`);
    }

  });
  // .then(function(text) {
  //   console.log('Document:', text);
  // }); // For checking if its running
}
