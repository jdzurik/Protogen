import http from 'http';
import fs from 'fs';
import { Template } from './src/Template.mjs';
import mysql from 'mysql';
import Enumerable from 'linq';
import { log } from 'console';
import pkg from 'dot';


pkg.templateSettings = {
    evaluate:    /\{\{([\s\S]+?)\}\}/g,
    interpolate: /\{\{=([\s\S]+?)\}\}/g,
    encode:      /\{\{!([\s\S]+?)\}\}/g,
    use:         /\{\{#([\s\S]+?)\}\}/g,
    define:      /\{\{##\s*([\w\.$]+)\s*(\:|=)([\s\S]+?)#\}\}/g,
    conditional: /\{\{\?(\?)?\s*([\s\S]*?)\s*\}\}/g,
    iterate:     /\{\{~\s*(?:\}\}|([\s\S]+?)\s*\:\s*([\w$]+)\s*(?:\:\s*([\w$]+))?\s*\}\})/g,
    varname: 'it',
    strip: false,
    append: true,
    selfcontained: false
  };
//console.log("test1");
var con = mysql.createConnection({
    host: "localhost",
    user: "testAcc",
    password: "TestPass1",
    database: "Prism"
  });

con.connect(function(err) {
    if (err) throw err;
    con.query('SELECT * FROM Prism.vi_getdbschema;', function (err, result, fields) {
        if (err) throw err;
        //console.log(result[1].RowDataPacket);
        // Enumerable.from(result).where("$.table_name =='actions'").forEach(element => {
        //     console.log(element.table_name)
        // });
        //    let qr =  Enumerable.from(result).where("$.table_name =='actions'").select((val, i) => ({ value: val.database, index: i }));
      let qr =  Enumerable.from(result)
        .groupBy("$.table_name", "$",
            function (key, group) { return { tableName: key, cols: group} },
            function (key) { return key.toString() });

            qr.forEach(tbl => {
                console.log(tbl.tableName);
                ///todo: loop throgh template directories 
                let templateData = fs.readFileSync("views/MJSClass.jst", {encoding:'utf8', flag:'r'});
                let tempFn = pkg.template(templateData);
                OutputTemplate(tempFn, tbl,'.genOutput/js/'+tbl.tableName+'.mjs');


                let templateData2 = fs.readFileSync("views/CSharpClass.jst", {encoding:'utf8', flag:'r'});
                let tempFn2 = pkg.template(templateData2);
                OutputTemplate(tempFn2, tbl,'.genOutput/cSharp/'+tbl.tableName+'.cs');
                // tbl.cols.forEach(col => {
                //     console.log(col.column_name);
                // });
            });

       //console.log(qr.select(function(value, index) { return index + ':' + value }).log().toJoinedString());
      });
    });

    function OutputTemplate(tempFn, data, OutPath){
        let resultText = tempFn(data);
        let OutPathResult = OutPath.replace("[[TableName]]", data.tableName);
        fs.writeFileSync(OutPathResult, resultText);

    }