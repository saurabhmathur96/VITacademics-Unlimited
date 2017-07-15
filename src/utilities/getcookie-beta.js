const Zombie = require('zombie');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
module.exports = (username, password) => {
  const browser = new Zombie();

  browser.on('response', function (request, response) {
    browser.response = response;
  });

  return new Promise((resolve, reject) => {
    browser.visit('https://vtopbeta.vit.ac.in/vtop/', () => {
      const captcha = browser.querySelector('label').textContent;
      browser.fill('uname', username)
        .fill('passwd', password)
        .fill('captchaCheck', captcha)
        .pressButton('.btn.btn-primary.pull-right', () => {
          const message = browser.querySelector('p.box-title.text-danger');
          if (!message) {
            resolve(browser.cookies);
          } else {
            reject(new Error(message.textContent));
          }
      });
    });

  });
};
