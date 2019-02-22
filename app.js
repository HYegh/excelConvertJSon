	var express = require('express'); 
    var app = express(); 
    var bodyParser = require('body-parser');
    var multer = require('multer');
    var xlstojson = require("xls-to-json-lc");
    var xlsxtojson = require("xlsx-to-json-lc");
    var XLSX = require('xlsx');

    app.use(bodyParser.json());  

    var storage = multer.diskStorage({ 
        destination: function (req, file, cb) {
            cb(null, './uploads/')
        },
        filename: function (req, file, cb) {
            var datetimestamp = Date.now();
            cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
        }
    });

    var upload = multer({ 
        storage: storage,
        fileFilter : function(req, file, callback) { 
            if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length-1]) === -1) {
                return callback(new Error('Wrong extension type'));
            }
            callback(null, true);
        }
    }).single('file');

    
    app.post('/upload', function(req, res) {
        var exceltojson;
        upload(req,res,function(err){
            if(err){
                 res.json({error_code:1,err_desc:err});
                 return;
            }
            
            if(!req.file){
                res.json({error_code:1,err_desc:"No file passed"});
                return;
            }
            
            if(req.file.originalname.split('.')[req.file.originalname.split('.').length-1] === 'xlsx'){
                exceltojson = xlsxtojson;
            } else {
                exceltojson = xlstojson;
            }
            console.log(req.file.path);
            try {
                var workbook = XLSX.readFile(req.file.path);
                var sheet_name_list = workbook.SheetNames;
            
                var array = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]], { header:1 })

                var reducer = array.reduce((acm, item) => {
                    acm[item[0]] = item[1]
                    return acm
                }, {})
                
                console.log(reducer)
                res.json([reducer])
            } catch (e){
                res.json({error_code:1,err_desc:"Corupted excel file"});
            }
        })
    });
	
	app.get('/',function(req,res){
		res.sendFile(__dirname + "/index.html");
	});

    app.listen('3000', function(){
        console.log('running on 3000...');
    });