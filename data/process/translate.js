var XMLHttpRequest = require('xhr2')
var fs = require('fs')
var xml2js = require('xml2js')
var parser = new xml2js.Parser()
var builder = new xml2js.Builder()

var inject = {
    tolIds:15971,
    lang:'de',
}

var queryWiki = searched=> new Promise((resolve, reject) => {
    var url = "https://"+inject.lang+".wikipedia.org/wiki/" + searched
    var xhr = new XMLHttpRequest()
    xhr.open('GET', url, true)
    xhr.onload = () => {
        var start = xhr.responseText.search('<title>')
        var end = xhr.responseText.search('</title>')
        resolve(xhr.responseText.substr(start+7, end-start-19))
    }
    xhr.onerror = e=> reject(e)
    xhr.send()
})

var queryTol = searched=> new Promise((resolve, reject) => {
    var args = "service=external&page=xml/TreeStructureService&optype=1&"
    var url = "http://tolweb.org/onlinecontributors/app?"+args+"node_id=" + searched
    var xhr = new XMLHttpRequest()
    xhr.open('GET', url, true)
    xhr.onload = ()=> resolve(xhr.responseText)
    xhr.onerror = e=> reject(e)
    xhr.send()
})

var parseXml = text=> new Promise((resolve, reject) => {
    parser.parseString(text, function (err, parsed) {
        if (err) reject(err)
        else resolve({ parsed:parsed, text:text })
    })
})

var safeXml = parsedAndText=> new Promise((resolve, reject) => {
    var taxon = 'test'
    var fileName = 'data/raw/' +taxon+ '-' +lang+ '.xml'
    fs.writeFileSync(fileName, parsedAndText.text)
    return parsedAndText.parsed
})




queryTol(15971)
.then(d=> parseXml(d))
.then(d=> console.log(d.text.substr(0, 100)))
.catch(e=> console.log(e))


/*
queryWiki("Feliformia")
    .then(d=> console.log(d))
    .catch(e=> console.log(e))
*/
