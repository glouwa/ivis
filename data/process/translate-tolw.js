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
        Sauria                          14913
        Squamata                        14933
        Lepidosauria                    14932
    pfalnzen
    vögel                               15721
    lizards
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
var tolids     = [15976, 15977, 15980, 15971, 15968, 15963, 14913]
var langs      = ['de', 'en', 'ru', 'ro', 'zh']
var langErrors = ['Diese Seite existiert nicht']
var inject     = {tolIds:15997, lang:'de'}

var queryWiki = searched=> new Promise((resolve, reject) => {
    if (!searched) resolve("")
    var url = "https://" +inject.lang+ ".wikipedia.org/wiki/" +searched
    var xhr = new XMLHttpRequest()
    xhr.open('GET', url, true)
    xhr.onload = () => {
        var start = xhr.responseText.search('<title>')
        var end = xhr.responseText.search('</title>')
        resolve({
            translation:xhr.responseText
                .substr(start+7, end-start-19)
                .replace(' - ', '')
                .replace('Wikipedia – Die freie ', ''),
            pageExits:xhr.responseText
                .indexOf('Diese Seite existiert nicht') == -1
        })
    }
    xhr.onerror = e=> reject(e)
    xhr.send()
})

var queryWikiJson = searched=> new Promise((resolve, reject) => {
    if (!searched) resolve("")
    var url = "https://de.wikipedia.org/w/api.php?"
    var args = "action=query&format=json"
    var args2 = "&titles=" +searched+ "&redirects&prop=info"
    var xhr = new XMLHttpRequest()
    xhr.open('GET', url+args+args2, true)
    xhr.onload = ()=> resolve(xhr.responseText)
    xhr.onerror = e=> reject(e)
    xhr.send()
})

var queryTol = searched=> new Promise((resolve, reject) => {
    console.log("fetching xml...")
    var args = "service=external&page=xml/TreeStructureService&optype=1&"
    var url = "http://tolweb.org/onlinecontributors/app?" +args+ "node_id=" +searched
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

var convertTree = (parsed, inputNames, wikiResult)=> new Promise((resolve, reject) => {
    console.log(wikiResult.length + " names translated...", inputNames.length)
    var translatedNodeNamesMap = {}

    for (var i=0; i<inputNames.length; ++i)
        translatedNodeNamesMap[inputNames[i]] = wikiResult[i]

    function filter(n, c) {
        var isFossil = c.attribute[0].$.value && c.attribute[0].$.value.toUpperCase().indexOf('FOSSIL') != -1
        var noPageAndNoChildren = !translatedNodeNamesMap[n.attribute[0].$.value].pageExits && !c.branch
        return isFossil || noPageAndNoChildren
    }

    function convertNode(node) {        
        var name = translatedNodeNamesMap[node.attribute[0].$.value].translation || ""
        var out = { attribute:[{ $:{ name:"name", value:name }}]}
        if (node.branch)
            for (var i=0; i < node.branch.length; ++i) {
                var c = convertNode(node.branch[i])
                if (!filter(node.branch[i], c)) {
                    out.branch = out.branch || []
                    out.branch.push(c)
                }
            }                
        return out
    }

    var converted = {
        tree:{
            declarations: { attributeDecl:[ { $:{ name:"name", type:"String" }}]},
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
var inputNames = null
queryTol(inject.tolIds)
    .then(d=> parseXml(d))
    .then(d=> saveRawXml(d))
    .then(d=> collectNodeNames(d))
    .then(d=> {
        parsed = d.parsed
        inputNames = d.nodeNames
        return Promise.all(d.nodeNames.map(queryWiki))
    })
    .then(d=> convertTree(parsed, inputNames, d))
    .then(d=> saveTranslated(d))
    //.then(d=> console.log(process._getActiveHandles()))
    .then(d=> process.exit(1))
    .catch(e=> console.log(e.stack))

/*
queryWikiJson('Felidae')
    .then(d=> console.log(JSON.stringify(JSON.parse(d), null, 4)))
*/
