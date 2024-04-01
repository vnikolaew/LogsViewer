// const Mark = require(`mark.js`);

const installEvent = () => {
   self.addEventListener("install", (event) => {
      console.log("service worker installed");
   });
};
installEvent();

const activateEvent = () => {
   self.addEventListener("activate", () => {
      console.log("service worker activated");
   });
};
activateEvent();

self.onmessage = function(event) {
   const { keyword, mark } = event.data;

   mark.mark(keyword.trim(), {
      caseSensitive: false,
      className: `bg-yellow-500 p-[.5px] rounded-sm text-white`,
   });
};