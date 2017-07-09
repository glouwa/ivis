var XMLHttpRequest = require('xhr2')
var fs = require('fs')
var xml2js = require('xml2js')
var parser = new xml2js.Parser()
var builder = new xml2js.Builder()
/*
var coolStuff = {

    Osteichthyes                        14921     fische
    amphibiel
    reptilien
    pfalnzen
    vögel                               15721
    Mammalia
        Laurasiatheria
            Artiodactyla/Paraxonia      15976          paarhufer
            whale                       15977
            Perissodactyla              15980         unpaarhufer
            carnivora                   15971
            Eulipotyphla                15968          Insektenfresser
        Euarchontoglires
            Primates                    15963
        Afrotheria
        Xenarthra
}*/
var langs = ['de', 'en', 'ru', 'ro', 'zh', ]


var inject = {
    tolIds:15976,
    lang:'de',
}

var queryWiki = searched=> new Promise((resolve, reject) => {
    if (!searched) resolve("")
    var url = "https://" +inject.lang+ ".wikipedia.org/wiki/" +searched
    var xhr = new XMLHttpRequest()
    xhr.open('GET', url, true)
    xhr.onload = () => {
        var start = xhr.responseText.search('<title>')
        var end = xhr.responseText.search('</title>')
        resolve(xhr.responseText.substr(start+7, end-start-19).replace(' - ',''))
    }
    xhr.onerror = e=> reject(e)
    xhr.send()
})

var queryTol = searched=> new Promise((resolve, reject) => {
    console.log("fetching xml...")
    var args = "service=external&page=xml/TreeStructureService&optype=1&"
    var url = "http://tolweb.org/onlinecontributors/app?"+args+"node_id=" + searched
    var xhr = new XMLHttpRequest()
    xhr.open('GET', url, true)
    xhr.onload = ()=> resolve(xhr.responseText)
    xhr.onerror = e=> reject(e)
    xhr.send()
})

var parseXml = text=> new Promise((resolve, reject) => {
    console.log("parsing xml...")
    parser.parseString(text, (err, parsed)=> {
        if (err) reject(err)
        else resolve({ parsed:parsed, text:text })
    })
})

var saveRawXml = parsedAndText=> new Promise((resolve, reject) => {
    console.log("saving " +parsedAndText.text.length+ " raw xml bytes...")
    var taxon = parsedAndText.parsed.tree.branch[0].attribute[0].$.value
    var fileName = 'data/raw/' +taxon+ '.xml'
    fs.writeFileSync(fileName.toLowerCase(), parsedAndText.text)
    resolve(parsedAndText.parsed)
})

var collectNodeNames = parsed=> new Promise((resolve, reject) => {
    var nodeNames = []
    function collectNodeNamesSync(node) {
        nodeNames.push(node.attribute[0].$.value)
        if (node.branch)
            for (var i=0; i < node.branch.length; ++i)
                collectNodeNamesSync(node.branch[i])
    }
    collectNodeNamesSync(parsed.tree.branch[0])
    console.log("collected " +nodeNames.length+ " node names...")
    resolve({ parsed:parsed, nodeNames:nodeNames})
})

var convertTree = (parsed, untranslatedNodeNames, translatedNodeNames)=> new Promise((resolve, reject) => {
    console.log(translatedNodeNames.length + " names translated...")
    var translatedNodeNamesMap = {}
    for (var i=0; i<untranslatedNodeNames.length; ++i)
        translatedNodeNamesMap[untranslatedNodeNames[i]] = translatedNodeNames[i]

    function convertNode(node) {
        var out = {}
        out.attribute = [
            { $:{ name:"name", value:translatedNodeNamesMap[node.attribute[0].$.value] }},
            //{ $:{ name:"extinct", value:"-" }},
        ]
        if (node.branch)
            for (var i=0; i<node.branch.length; ++i) {
                out.branch = out.branch || []
                out.branch.push(convertNode(node.branch[i]))
            }
        return out
    }

    var converted = {
        tree:{
            declarations: {
                attributeDecl:[
                    { $:{ name:"name", type:"String" }},
                    //{ $:{ name:"extinct", type:"String" }}
                ]
            },
            branch:convertNode(parsed.tree.branch[0])
        }
    }
    resolve({ converted:converted, rootTaxonName:parsed.tree.branch[0].attribute[0].$.value })
})

var saveTranslated = result=> new Promise((resolve, reject) => {
    var fileName = ('data/translated/' +result.rootTaxonName+ '-' +inject.lang+ '.xml').toLowerCase()
    var fileData = builder.buildObject(result.converted).toString()
    console.log("writing " +fileData.length+ "bytes to '" + fileName) +"'"
    fs.writeFileSync(fileName, fileData)
    resolve('ok')
})

var parsed = null
var untranslatedNodeNames = null
queryTol(inject.tolIds)
    .then(d=> parseXml(d))
    .then(d=> saveRawXml(d))
    .then(d=> collectNodeNames(d))
    .then(d=> {
        parsed = d.parsed
        untranslatedNodeNames = d.nodeNames
        return Promise.all(d.nodeNames.map(queryWiki))
    })
    .then(d=> convertTree(parsed, untranslatedNodeNames, d))
    .then(d=> saveTranslated(d))
    //.then(d=> console.log(process._getActiveHandles()))
    .then(d=> process.exit(1))
    .catch(e=> console.log(e))
