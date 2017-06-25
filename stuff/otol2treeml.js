var fs = require('fs')
var xml2js = require('xml2js')
var XMLHttpRequest = require('xhr2')
var parser = new xml2js.Parser()
var builder = new xml2js.Builder()

var file = fs.readFileSync('otol.json', 'utf8')
var parsed = JSON.parse(file)

var nameMap = {}
var loadedMap = JSON.parse(fs.readFileSync('data/namemap-de.json', 'utf8'))

console.log(loadedMap['Otocolobus'])

function getName(node)
{
    var taxonName = null
    if (node.taxon)
            taxonName = node.taxon.name //unique_name

    if (taxonName)
    {
        query(taxonName, r=> {
            console.log(taxonName, ' --> ', r)
            nameMap[taxonName]=r
        })
    }

    if (loadedMap[taxonName])
        taxonName = loadedMap[taxonName]

    return taxonName || ""
}

function getExtinct(node)
{
    return "-"
}

function convertNode(node)
{
    var out = {}
    out.attribute = [
        { $:{ name:"name", value:getName(node) }},
        { $:{ name:"extinct", value:getExtinct(node) }},
    ]

    if (node.children)
        for (var i=0; i<node.children.length; ++i)
        {
            out.branch = out.branch || []
            out.branch.push(convertNode(node.children[i]))
        }
    return out
}

var converted = {
    tree:{
        declarations: {
            attributeDecl:[
                { $:{ name:"name", type:"String" }},
                { $:{ name:"extinct", type:"String" }}
            ]
        },
        branch:convertNode(parsed.arguson)
    }
}
fs.writeFileSync('data/carnivora2.xml', builder.buildObject(converted).toString())

function query(searched, ok)
{
    var xhr = new XMLHttpRequest()
    xhr.open('GET', "https://de.wikipedia.org/wiki/"+escape(encodeURI(searched)), true)
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

process.on('SIGINT', function () {
   console.log('Ctrl-C...');
   process.exit(2);
 })

process.on('exit', ()=>
{
    console.log(JSON.stringify(nameMap))
    fs.writeFileSync('data/namemap.json', JSON.stringify(nameMap))
})
