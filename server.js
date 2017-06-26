var formidable = require('formidable');
var fs = require('fs');
 var connect = require('connect')
 var serveStatic = require('serve-static')
    connect()
    .use(serveStatic('./'))
    .use( function(req, res) {
        
    if (! req.url == '/fileupload') 
        res.write(400);

    
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        console.log(files);
        if(!files || !files.userfile )
            return;

      var oldpath = files.userfile.path;
      var newpath = 'data/user-uploaded';
      fs.rename(oldpath, newpath, function (err) {
          res.writeHead(200, {'Content-Type': 'text/json'});
        res.write(JSON.stringify({
            error: err,
            path: newpath
        }));
        res.end();
      });
 });
    })
 .listen(8080);

 

/*




{
   "Abkhazia": {
     "1961": {
        "gdp": "9.171601205",
        "exports": "9.171601205",
     },
     "1962": {
        "gdp": "9.171601205",
        "exports": "9.171601205",
     },
   },
   "Afghanistan": {
     "1961": {
        "gdp": "9.171601205",
        "exports": "9.171601205",
      },
      "1961": {
        "gdp": "9.171601205",
        "exports": "9.171601205",
      },
   }
}



*/
