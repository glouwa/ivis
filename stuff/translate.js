var fs = require('fs')
var xml2js = require('xml2js')
var XMLHttpRequest = require('xhr2')
var parser = new xml2js.Parser()
var builder = new xml2js.Builder()

var file = fs.readFileSync('data/carnivora.xml', 'utf8')
var nameMap = {}
var loadedMap = JSON.parse(fs.readFileSync('data/namemap-de.json', 'utf8'))


function getName(node)
{
    var name = node.attribute[0].$.value
    query(name, r=> {
        console.log(name, ' --> ', r)
        nameMap[name]=r
    })

    return loadedMap[name] || name
}

function getExtinct(node)
{
    return '-'
}

function convertNode(node)
{
    var out = {}
    out.attribute = [
        { $:{ name:"name", value:getName(node) }},
        { $:{ name:"extinct", value:getExtinct(node) }},
    ]

    if (node.branch)
        for (var i=0; i<node.branch.length; ++i)
        {
            out.branch = out.branch || []
            out.branch.push(convertNode(node.branch[i]))
        }
    return out
}

parser.parseString(file, function (err, parsed)
{
    var converted = {
        tree:{
            declarations: {
                attributeDecl:[
                    { $:{ name:"name", type:"String" }},
                    { $:{ name:"extinct", type:"String" }}
                ]
            },
            branch:convertNode(parsed.tree.branch[0])
        }
    }
    fs.writeFileSync('data/carnivora-de.xml', builder.buildObject(converted).toString())
})

function query(searched, ok)
{
    if (!loadedMap[searched])
    {
        var xhr = new XMLHttpRequest()
        xhr.open('GET', "https://de.wikipedia.org/wiki/"+searched, true)
        xhr.onreadystatechange = () =>
        {
            if (xhr.readyState == 4 && xhr.status == 200)
            {
                try
                {
                    var start = xhr.responseText.search('<title>')
                    var end = xhr.responseText.search('</title>')

                    ok(xhr.responseText.substr(start+7, end-start-19))
                }
                catch(e)
                {
                    console.log("failed ", searched)
                }
            }
        }
        xhr.send()
    }
}

process.on('exit', ()=>
{
    console.log(JSON.stringify(nameMap))
    fs.writeFileSync('data/namemap-de.json', JSON.stringify(nameMap))
})


