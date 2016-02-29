var express = require('express');
var app = express();
var XlsxTemplate = require('xlsx-template');
var ObjectId = require('mongodb').ObjectID;
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var fs = require('fs');
var path = require('path');
var url = 'mongodb://localhost:27017/msrm';
var async = require('async');
var Stream = require('stream')

app.use(function (req, res, next) {
  var nodeSSPI = require('node-sspi');
  var nodeSSPIObj = new nodeSSPI({
    retrieveGroups: true
  });
  nodeSSPIObj.authenticate(req, res, function(err){
    res.finished || next();
  });
});



var findEmployees = function(db, callback) {
   var cursor =db.collection('employees').find( );
   cursor.each(function(err, doc) {
      assert.equal(err, null);
      if (doc != null) {
         console.dir(doc);
      } else {
         callback();
      }
   });
};


app.get('/logout',function(req,res){
	req.logout()
	res.sendFile('logout.html');
})

var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static(__dirname + '/public'));

app.get('/userDetails',function(req, res){
	var userGroups = [];
	for (var i in req.connection.userGroups) {
      userGroups.push(req.connection.userGroups[i]);
    }
	res.json({"username": req.connection.user, "userGroups":userGroups});
})


app.get('/', function (req, res) {
});

app.get('/employees', function (req, res) {
	res.sendFile(__dirname + '/public/employees.html');
});
app.get('/projects', function (req, res) {
	console.log("get roles request initiated");
	  MongoClient.connect(url, function(err, db) {
		  assert.equal(null, err);
		  
		  var cursor =db.collection('projects').find( );
		  console.log("printing cursor");
		  var result = []
		  cursor.each(function(err, doc) {
		  assert.equal(err, null);
			  if (doc != null) {
				console.log("doc not empty")
				console.log(doc)
				
				doc.EndDate = doc.EndDate.replace(/T/, ' ').replace(/\..+/, '').split(' ')[0]
				doc.StartDate = doc.StartDate.replace(/T/, ' ').replace(/\..+/, '').split(' ')[0]

				
				result.push(doc)
			  }
			  else
			  {
				console.log("result is "+ result)
				res.json(result)
			  }
		  });
		});
});

app.get('/export', function (req, res) {
	const spawn = require('child_process').spawn;
	const ls = spawn('ls', ['-lh', '/usr']);

})

app.post('/generateEmployeeReports',function(req, res){
	fs.readFile(path.join(__dirname, req.body.RelativeTemplatePath, req.body.TemplateFileName), function(err, data) {

		// Create a template
		var template = new XlsxTemplate(data);

		// Replacements take place on first sheet
		var employeeSheetNumber = req.body.EmployeeData.EmployeeSheetNumber;
		var projectSheetNumber = req.body.ProjectData.ProjectSheetNumber;
		var file = __dirname + req.body.UploadPath;
		
		MongoClient.connect(url, function(err, db) {
			assert.equal(null, err);

			async.parallel({
			
				employees: function(callback) {
				  
					var cursor =db.collection('employees').find(req.body.EmployeeData.EmployeeQuery);
					  console.log("printing cursor");
					  var result = []
					  cursor.each(function(err, doc) {
					  assert.equal(err, null);
						  if (doc != null) {
							console.log("doc not empty")
							console.log(doc)
							result.push(doc)
						  }
						  else
						  {
							callback(null, result);
						  }
					  });
				  },
				  
				  
				  projects: function(callback) {
					var cursor =db.collection('projects').find(req.body.ProjectData.ProjectQuery);
					  console.log("printing cursor");
					  var result = []
					  cursor.each(function(err, doc) {
						  assert.equal(err, null);
						  if (doc != null) {
							console.log("doc not empty")
							console.log(doc)
							
							doc.EndDate = doc.EndDate.replace(/T/, ' ').replace(/\..+/, '').split(' ')[0]
							doc.StartDate = doc.StartDate.replace(/T/, ' ').replace(/\..+/, '').split(' ')[0]
							
							result.push(doc)
						  }
						  else
						  {
							callback(null, result);
						  }
					  });
				  }
				
				},
				function(err, results) {
				  console.log('both done!');
				  console.log(results)
				  console.log(results.employees);
				  console.log(results.projects);
				  
				  var employeevalues = { employees: results.employees };
				  var projectvalues = { projects: results.projects };
				  
				  // Perform substitution
				  template.substitute(employeeSheetNumber, employeevalues);
				  template.substitute(projectSheetNumber, projectvalues);
				  
				  var dat = template.generate();
				  console.log("successfully generated template")
				  buffer = new Buffer(dat, 'binary');
				  var rs = new Stream.Readable({ objectMode: true })
				  var outFileStream
				  rs.push(buffer);
				  rs.push(null);
				  outFileStream = fs.createWriteStream(file); 
				  rs.pipe(outFileStream);
				  //fs.writeFile(tempfile, dat, 'binary'); //backup
				  console.log("download called successfully")
				  res.json({"success": "true"})
				  
				});
		});
	})
});


app.get('/roles', function (req, res) {
  
  console.log("get roles request initiated");
  MongoClient.connect(url, function(err, db) {
	  assert.equal(null, err);
	  
	  var cursor =db.collection('roles').find( );
	  console.log("printing cursor");
	  var result = []
	  cursor.each(function(err, doc) {
      assert.equal(err, null);
		  if (doc != null) {
			console.log("doc not empty")
			console.log(doc)
			result.push(doc)
		  }
		  else
		  {
			console.log("result is "+ result)
			res.json(result)
		  }
	  });
	});
  })


app.get('/contactList', function (req, res) {
  
  console.log("get request initiated");
  
	MongoClient.connect(url, function(err, db) {
	  assert.equal(null, err);
	  
	  var cursor =db.collection('employees').find( {"isActive": true});
	  console.log("printing cursor");
	  var result = []
	  cursor.each(function(err, doc) {
      assert.equal(err, null);
		  if (doc != null) {
			console.log("doc not empty")
			console.log(doc)
			result.push(doc)
		  }
		  else
		  {
			console.log("result is "+ result)
			res.json(result)
		  }
	  });
	});
  })
  
  
  app.get('/machines', function (req, res) {
  
  console.log("get request initiated");
  
	MongoClient.connect(url, function(err, db) {
	  assert.equal(null, err);
	  
	  var cursor =db.collection('machines').find( {"isAllocated": true});
	  console.log("printing cursor");
	  var result = []
	  cursor.each(function(err, doc) {
      assert.equal(err, null);
		  if (doc != null) {
			console.log("doc not empty")
			console.log(doc)
			result.push(doc)
		  }
		  else
		  {
			console.log("result is "+ result)
			res.json(result)
		  }
	  });
	});
  })
  
 app.get('/contactList/:id', function (req, res) {
  
  console.log("get one request initiated");
  console.log(req.params.id)
	MongoClient.connect(url, function(err, db) {
	  assert.equal(null, err);
	  var o_id = new ObjectId(req.params.id);
	  
	  db.collection('employees').findOne({"_id": new ObjectId(req.params.id)}, function(err, doc) {
		console.log(doc);
		console.log(err);
		res.json(doc)
	  })
	  
	 //console.log("printing cursor");
	  //console.log(cursor);
	  //res.json(cursor)
	});
  })

 app.get('/roles/:id', function (req, res) {
  
  console.log("get one request initiated");
  console.log(req.params.id)
	MongoClient.connect(url, function(err, db) {
	  assert.equal(null, err);

	  db.collection('roles').findOne({"_id": Number(req.params.id)}, function(err, doc) {
		console.log(doc);
		console.log(err);
		res.json(doc)
	  })
	  
	 //console.log("printing cursor");
	  //console.log(cursor);
	  //res.json(cursor)
	});
  })

  
app.get('/projects/:id', function (req, res) {
  
  console.log("get one request for project initiated");
  console.log(req.params.id)
	MongoClient.connect(url, function(err, db) {
	  assert.equal(null, err);
	  var o_id = new ObjectId(req.params.id);
	  
	  db.collection('projects').findOne({"_id": new ObjectId(req.params.id)}, function(err, doc) {
		console.log(doc);
		
		 
		
		//doc.EndDate = doc.EndDate.replace(/T/, ' ').replace(/\..+/, '').split(' ')[0]
		//		doc.StartDate = doc.StartDate.replace(/T/, ' ').replace(/\..+/, '').split(' ')[0]
		console.log(err);
		res.json(doc)
	  })
	});
  })

 app.get('/machines/:id', function (req, res) {
  
  console.log("get one request initiated");
  console.log(req.params.id)
	MongoClient.connect(url, function(err, db) {
	  assert.equal(null, err);
	  var o_id = new ObjectId(req.params.id);
	  
	  db.collection('machines').findOne({"_id": new ObjectId(req.params.id)}, function(err, doc) {
		console.log(doc);
		console.log(err);
		res.json(doc)
	  })
	  
	 //console.log("printing cursor");
	  //console.log(cursor);
	  //res.json(cursor)
	});
  })

  
app.get('/search/*', function (req, res) {
  
  console.log("search request initiated");
  console.log(req.query)
  
	MongoClient.connect(url, function(err, db) {
	  assert.equal(null, err);
	  
	  
	  var cursor =db.collection('roles').find({$text: {$search: req.query['q']}} );
	  console.log("printing cursor for searched query");
	  var result = []
	  cursor.each(function(err, doc) {
      assert.equal(err, null);
		  if (doc != null) {
			console.log("doc not empty")
			console.log(doc)
			result.push(doc)
		  }
		  else
		  {
			console.log("result is "+ result)
			res.json(result)
		  }
	  });
	  
	  
	
	  
	 //console.log("printing cursor");
	  //console.log(cursor);
	  //res.json(cursor)
	});
  }) 

  app.get('/projectsByParameters/*', function (req, res) {
  
  console.log("get request by parameters for projects initiated");

  console.log(req.query)
  
  
  
	MongoClient.connect(url, function(err, db) {
	  assert.equal(null, err);
	  
	  for (var key in req.query) {
		  if (req.query.hasOwnProperty(key)) {
			if(req.query[key] == "true")
			{
				req.query[key] = true
			}
			else
			if(req.query[key] == "false")
			{
				req.query[key] = false
			}
		  }
		  
		  if(/\s/g.test(key))
			{
				key = '"'+key+'"';
			}
		}
	  
	  
	  var cursor =db.collection('projects').find(req.query);
	  console.log("printing cursor");
	  var result = []
	  cursor.each(function(err, doc) {
      assert.equal(err, null);
		  if (doc != null) {
			console.log("doc not empty")
			console.log(doc)
			result.push(doc)
		  }
		  else
		  {
			console.log("result is "+ result)
			res.json(result)
		  }
	  });
	});
  })
  
  
  
  
  app.get('/contactListByParameters/*', function (req, res) {
  
  console.log("get request by parameters initiated");

  console.log(req.query)
  
  
  
	MongoClient.connect(url, function(err, db) {
	  assert.equal(null, err);
	  
	  for (var key in req.query) {
		  if (req.query.hasOwnProperty(key)) {
			if(req.query[key] == "true")
			{
				req.query[key] = true
			}
			else
			if(req.query[key] == "false")
			{
				req.query[key] = false
			}
		  }
		  
		  if(/\s/g.test(key))
			{
				key = '"'+key+'"';
			}
		}
	  
	  
	  var cursor =db.collection('employees').find(req.query);
	  console.log("printing cursor");
	  var result = []
	  cursor.each(function(err, doc) {
      assert.equal(err, null);
		  if (doc != null) {
			console.log("doc not empty")
			console.log(doc)
			result.push(doc)
		  }
		  else
		  {
			console.log("result is "+ result)
			res.json(result)
		  }
	  });
	});
  })

  
  app.get('/machinesByParameters/*', function (req, res) {
  
  console.log("get request by parameters initiated");

  console.log(req.query)
  
  
  
	MongoClient.connect(url, function(err, db) {
	  assert.equal(null, err);
	  
	  for (var key in req.query) {
		  if (req.query.hasOwnProperty(key)) {
			if(req.query[key] == "true")
			{
				req.query[key] = true
			}
			else
			if(req.query[key] == "false")
			{
				req.query[key] = false
			}
		  }
		  
		  if(/\s/g.test(key))
			{
				key = '"'+key+'"';
			}
		}
	  
	  
	  var cursor =db.collection('machines').find(req.query);
	  console.log("printing cursor");
	  var result = []
	  cursor.each(function(err, doc) {
      assert.equal(err, null);
		  if (doc != null) {
			console.log("doc not empty")
			console.log(doc)
			result.push(doc)
		  }
		  else
		  {
			console.log("result is "+ result)
			res.json(result)
		  }
	  });
	});
  })

  
  
  
 app.put('/contactList/:id', function (req, res) {
  
  console.log("get one request initiated");
  console.log(req.params.id)
  console.log(req.body.name)
	MongoClient.connect(url, function(err, db) {
	  assert.equal(null, err);
	  var o_id = new ObjectId(req.params.id);
	  
	  db.collection('employees').update({"_id": new ObjectId(req.params.id)},
	  {
			"Name": req.body.Name,
			"Alias": req.body.Alias,
			"ReportingManager": req.body['ReportingManager'],
			"Role": req.body.Role,
			"ProjectName": req.body['ProjectName'],
			"Security101": req.body.Security101,
			"isActive": req.body.isActive
		},
		
	  function(err, doc) {
		console.log(doc);
		console.log(err);
		res.json(doc)
	  })
	  
	  db.collection('employees').ensureIndex({"name": "text", "email":"text"})
	  
	 //console.log("printing cursor");
	  //console.log(cursor);
	  //res.json(cursor)
	});
  })
  
 app.put('/machines/:id', function (req, res) {
  
  console.log("get one request initiated");
  console.log(req.params.id)
  console.log(req.body.name)
	MongoClient.connect(url, function(err, db) {
	  assert.equal(null, err);
	  var o_id = new ObjectId(req.params.id);
	  
	  db.collection('machines').update({"_id": new ObjectId(req.params.id)},
	  {
			"owner": req.body.owner,
			"type": req.body.type,
			"bitLockerStatus": req.body.bitLockerStatus,
			"serialNumber": req.body.serialNumber,
			"project": req.body.project,
			"approvalDate": req.body.approvalDate,
			"approvalEndDate": req.body.approvalEndDate,
			"isAllocated": req.body.isAllocated 
		},
		
	  function(err, doc) {
		console.log(doc);
		console.log(err);
		res.json(doc)
	  })
	  
	  db.collection('employees').ensureIndex({"name": "text", "email":"text"})
	  
	 //console.log("printing cursor");
	  //console.log(cursor);
	  //res.json(cursor)
	});
  })

  
 app.put('/projects/:id', function (req, res) {
  
  console.log("get one request for projects initiated");
  console.log(req.params.id)
  console.log(req.body)
	MongoClient.connect(url, function(err, db) {
	  assert.equal(null, err);
	  var o_id = new ObjectId(req.params.id);
	  
	  db.collection('projects').update({"_id": new ObjectId(req.params.id)},
	  {
			"Name": req.body.Name,
			"Type": req.body.Type,
			"MSBusinessGroup": req.body.MSBusinessGroup,
			"StartDate": req.body.StartDate,
			"EndDate": req.body.EndDate,
			"OnboardingInCurrentMonth": req.body.OnboardingInCurrentMonth,
			"VendorPMContact": req.body.VendorPMContact,
			"MSBGFTEContact": req.body.MSBGFTEContact,
			"Headcount": req.body.Headcount,
			"Forecast": req.body.Forecast
		},
		
	  function(err, doc) {
		console.log(doc);
		console.log(err);
		res.json(doc)
	  })
	  
	  db.collection('employees').ensureIndex({"name": "text", "email":"text"})
	  
	 //console.log("printing cursor");
	  //console.log(cursor);
	  //res.json(cursor)
	});
  })
  
 app.post('/contactList', function (req, res) {
  console.log("post request initiated");
  console.log(req.body)

  
 MongoClient.connect(url, function(err, db) {
	  assert.equal(null, err);
	  db.collection('employees').insert(req.body, function(err, result) {
	
		console.log("Inserted a document into the restaurants collection.")
		res.json(result)

	});
  });
  
  })
  
  
app.post('/machines', function (req, res) {
	console.log("post request initiated for machines");
	console.log(req.body)
	 MongoClient.connect(url, function(err, db) {
		  assert.equal(null, err);
		  db.collection('machines').insert(req.body, function(err, result) {
			console.log("Inserted a document into the machines collection.")
			res.json(result)
		});
	  });
})

 app.post('/projects', function (req, res) {
  console.log("post request for projects initiated");
  console.log(req.body)

  
 MongoClient.connect(url, function(err, db) {
	  assert.equal(null, err);
	  db.collection('projects').insert(req.body, function(err, result) {
	
		console.log("Inserted a document into the restaurants collection.")
		res.json(result)

	});
  });
  
  })
  
app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});


