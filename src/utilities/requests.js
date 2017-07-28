const Zombie = require('zombie');


/**
 * Gets HTML markup doing get request
 */
module.exports.get = (uri, cookies) => {
  const browser = new Zombie();

  browser.cookies = cookies;

  return browser.fetch(uri)
    .then(function (response) {

      let status = response.status;
      let text = response.text();

      browser.cookies = new browser.cookies.constructor();
      delete browser.cookies;
      if(browser.window)
        browser.window.close();

      browser.tabs.closeAll();
      delete browser.tabs;
      delete browser.window;
      delete browser;

      if (status === 200){
        return text;
      }
      else
        throw new Error("VTOP not working");

    })
}


/**
 * Gets HTML markup doing post request
 * Untested
 */
module.exports.post = (uri, cookies, form) => {
  const browser = new Zombie();

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
  }




  return browser.fetch(uri, options).then(function (response) {

    let status = response.status;
    let text = response.text();

    browser.cookies = new browser.cookies.constructor();
    delete browser.cookies;
    if(browser.window)
      browser.window.close();

    browser.tabs.closeAll();
    delete browser.tabs;
    delete browser.window;
    delete browser;

    if (status === 200) {
      return text;
    }
    else {
      throw new Error(`Error making post request to vtop (status=${response.status})`);
    }

  });
}
