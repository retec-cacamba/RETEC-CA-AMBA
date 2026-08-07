const express = require('express');
const path = require('path');
const app = express();
const root = __dirname;
app.disable('x-powered-by');
app.use((req,res,next)=>{
  if (/\.(html|css|js)$/.test(req.path) || req.path === '/') {
    res.set('Cache-Control','no-store, no-cache, must-revalidate, proxy-revalidate');
  } else {
    res.set('Cache-Control','public, max-age=86400');
  }
  next();
});
app.use(express.static(root,{extensions:['html']}));
app.get('*',(req,res)=>res.sendFile(path.join(root,'index.html')));
const port=process.env.PORT||3000;
app.listen(port,()=>console.log(`Disk Caçamba online na porta ${port}`));
