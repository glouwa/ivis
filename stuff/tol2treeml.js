var fs = require('fs')
var xml2js = require('xml2js')
var parser = new xml2js.Parser()
var builder = new xml2js.Builder()

function getName(node)
{
    var otherName = null
    if (node.OTHERNAMES &&
        node.OTHERNAMES[0] &&
        node.OTHERNAMES[0].OTHERNAME &&
        node.OTHERNAMES[0].OTHERNAME[0] &&
        node.OTHERNAMES[0].OTHERNAME[0].NAME &&
        node.OTHERNAMES[0].OTHERNAME[0].NAME !== "")
        otherName = node.OTHERNAMES[0].OTHERNAME[0].NAME[0]

    var desc = null
    if (node.DESCRIPTION &&
        node.DESCRIPTION[0] !== "" &&
        node.DESCRIPTION[0].length < 15)
        desc = node.DESCRIPTION[0]

    return otherName || desc || node.NAME[0]
}

function getExtinct(node)
{
    if (node.$) return node.$.EXTINCT
    return "-"
}

function convertNode(node)
{
    var out = {}
    out.attribute = [
        { $:{ name:"name", value:getName(node) }},
        { $:{ name:"extinct", value:getExtinct(node) }},
    ]

    if (node.$.LEAF=='0' && !node.NODES)
    {
        console.log("aaaa!", getName(node), node.$.ID)
    }

    if (node.NODES &&
        node.NODES[0] &&
        node.NODES[0].NODE)
        for (var i=0; i<node.NODES[0].NODE.length; ++i)
        {
            out.branch = out.branch || []
            out.branch.push(convertNode(node.NODES[0].NODE[i]))
        }
    return out
}

fs.readFile('data/carnivora', function(err, data)
{
    parser.parseString(data, function (err, parsed)
    {
        var converted = {
            tree:{
                declarations: {
                    attributeDecl:[
                        { $:{ name:"name", type:"String" }},
                        { $:{ name:"extinct", type:"String" }}
                    ]
                },
                branch:convertNode(parsed.TREE.NODE[0])
            }
        }
        fs.writeFileSync('data/carnivora2.xml', builder.buildObject(converted).toString())
    })
})
