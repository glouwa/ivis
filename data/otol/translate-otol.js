var XMLHttpRequest = require('xhr2')
var fs = require('fs')

var rawPath = 'data/raw/'
var dstPath = 'data/translated/'

//                 prima        carni       whale        paar        nagetiere
var otolids    = ['ott913935', 'ott44565', 'ott698424', 'ott622916', 'ott864593',]
var langs      = ['de', 'en', 'ru', 'ro', 'zh']
var langErrors = ['Diese Seite existiert nicht']
var inject     = {id:otolids[4], lang:'de'}

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

var queryOtol = searched=> new Promise((resolve, reject) => {
    console.log("fetching arguson...")
    var xhr = new XMLHttpRequest()
    xhr.open('POST', "https://api.opentreeoflife.org/v3/tree_of_life/subtree", true)
    xhr.onload = ()=> resolve(xhr.responseText)
    xhr.onerror = e=> reject(e)
    xhr.send('{"node_id":"'+searched+'", "format":"arguson", "height_limit":10}')
})

var parseJson = text=> new Promise((resolve, reject) => {
    console.log("parsing json...")
    resolve({ parsed:JSON.parse(text).arguson, text:text })
})

var saveRawJson = parsedAndText=> new Promise((resolve, reject) => {
    var taxon = parsedAndText.parsed.taxon.name
    var fileName = rawPath +taxon+ '.json'
    console.log("saving " +parsedAndText.text.length+ " raw json bytes to '" +fileName+ "'...")
    fs.writeFileSync(fileName.toLowerCase(), parsedAndText.text)
    resolve(parsedAndText.parsed)
})

var collectNodeNames = parsed=> new Promise((resolve, reject) => {
    var nodeNames = []
    function collectNodeNamesSync(node) {
        if (node.taxon && node.taxon.name)
            nodeNames.push(node.taxon.name)
        if (node.children)
            for (var i=0; i < node.children.length; ++i)
                collectNodeNamesSync(node.children[i])
    }
    collectNodeNamesSync(parsed)
    console.log("collected " +nodeNames.length+ " node names...")    
    resolve({ parsed:parsed, nodeNames:nodeNames})
})

var convertTree = (parsed, inputNames, wikiResult)=> new Promise((resolve, reject) => {
    console.log(wikiResult.length + " names translated...", inputNames.length)
    var translatedNodeNamesMap = {}

    for (var i=0; i<inputNames.length; ++i)
        translatedNodeNamesMap[inputNames[i]] = wikiResult[i]

    function filter(n, c) {
        return (!n.taxon || !translatedNodeNamesMap[n.taxon.name].pageExits)
            && !c.children
    }

    function convertNode(node) {        
        var name = node.taxon?(translatedNodeNamesMap[node.taxon.name].translation || ""):""
        var out = {
            name:name ,
            numTips:node.num_tips,
            ottId:node.node_id
        }
        if (node.children)
            for (var i=0; i < node.children.length; ++i) {
                var c = convertNode(node.children[i])
                if (!filter(node.children[i], c)) {
                    out.children = out.children || []
                    out.children.push(c)
                }
            }                
        return out
    }

    function mergeSinnlos(node) {      
        while (node.children && node.children.length == 1) {
            node.name = node.children[0].name            
            node.numTips = node.children[0].numTips
            node.ottId = node.children[0].ottId
            node.children = node.children[0].children
        }

        if (node.children)
            for (var i=0; i < node.children.length; ++i) {
                mergeSinnlos(node.children[i])
            }
        return node
    }

    resolve({
        converted:mergeSinnlos(convertNode(parsed)),
        rootTaxonName:parsed.taxon.name
    })
})

var saveTranslated = result=> new Promise((resolve, reject) => {
    var fileName = (destPath +result.rootTaxonName+ '-' +inject.lang+ '.d3.json').toLowerCase()
    var fileData = JSON.stringify(result.converted, null, 4)
    console.log("writing " +fileData.length+ "bytes to '" + fileName) +"'"
    fs.writeFileSync(fileName, fileData)
    resolve('ok')
})

var parsed = null
var inputNames = null
queryOtol(inject.id)
    .then(d=> parseJson(d))
    .then(d=> saveRawJson(d))
    .then(d=> collectNodeNames(d))
    .then(d=> {
        parsed = d.parsed
        inputNames = d.nodeNames
        return Promise.all(d.nodeNames.map(queryWiki))
    })
    .then(d=> convertTree(parsed, inputNames, d))
    .then(d=> saveTranslated(d))
    .then(d=> process.exit(1))
    .catch(e=> console.log(e))
