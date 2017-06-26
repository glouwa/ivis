var formidable = require('formidable');
var fs = require('fs');
var connect = require('connect')
var serveStatic = require('serve-static')
connect()
    .use(serveStatic('./'))
    .use(function(req, res) {
        if (!req.url == '/fileupload')
            res.write(400)

        var form = new formidable.IncomingForm()
        form.parse(req, function(err, fields, files) {
            console.log(files)
            if(!files || !files.userfile)
                return

            var oldpath = files.userfile.path
            var newpath = 'data/user-uploaded.xml'
            fs.rename(oldpath, newpath, function (err) {
                res.writeHead(200, { 'Content-Type':'text/json' })
                res.write(JSON.stringify({
                    error: err,
                    path: newpath
                }))
                res.end()
            })
            })
    })
    .listen(8080)
 
