So far the chain goes as follows:

app.js -> routes/index.js -> public/starter.js -> public/app.js -> public/globalRouter.js -> public/globalcontroller -> public/modules/Signup/SignupApp.js -> public/modules/Signup/SignupController.js

and the way routes are set up now is to show how modules have to be loaded for subroutes to exist.
This means our app will be able to load module by module rather than all at once.

localhost:3000          -> Starts the global router and controller, but the subroute of signup is not yet available.

can be seen through localhost:3000/#signup/SubRoute               no response.

Now load the signup module by visiting

localhost:3000/#signup              -> The browser console will tell you that the signup module has been started.

This means our subroute finally works, and you can visit

localhost:3000/#signup/SubRoute


......... We should allow /#signup/Subroute to work right away