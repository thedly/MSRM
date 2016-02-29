var app = angular.module('myApp', []);


app.controller('myCtrl', function($scope, $http, $filter) {
	
	$http.get('/userDetails').then(function(response){
				console.log(response.data)
				$scope.username = response.data.username;
		});
	
	$scope.ProjectTypes = ProjectDetails.ProjectTypes
	$scope.MsBusinessGroups = ProjectDetails.MsBusinessGroups
	$scope.MSBGFTEContact = ProjectDetails.MSBGFTEContact
	$scope.machineTypes = machineDetails.machineTypes;
	$scope.groups = groups;
	
	$scope.tabID=1;
	$scope.showDetailsPane=false;
	
	$scope.activate=function(i)
    {
        $scope.tabID=i;
    }
	
	$scope.activateDetailsPane=function(i, project)
    {
	console.log("show details")
        $scope.showDetailsPane=true;
    }
	$scope.employeeSortingOrder = true;
	$scope.orderByEmployees = function(order){
		$scope.employeeSortingOrder = (order === "-")
		$scope.groups.Employees = [];
		angular.forEach($filter('orderBy')($scope.Managers, order+$scope.employingSortingParameter), function(value, key){
			$scope.groups.Employees.push({"highlight":"defaultSelection","name":value})
		})
	}
	
	
	$scope.generateReport = function(req,res){
		var reportData = ExportData
		if($scope.filterModel != null)
		{
			var filterObject = {};
			for (var key in $scope.filterModel) {
			  console.log("key is "+key+" and value is "+$scope.filterModel[key])
			  if($scope.filterModel[key] != "-1")
			  {
				filterObject[key] = $scope.filterModel[key]
			  } 
			}
			reportData.EmployeeData.EmployeeQuery = filterObject
			console.log("reports filters have been set for employee")
		}
		
		if($scope.projectFilterModel != null)
		{
			var projectFilterObject = {};
			for (var key in $scope.projectFilterModel) {
			  console.log("key is "+key+" and value is "+$scope.projectFilterModel[key])
			  if($scope.projectFilterModel[key] != "-1" && $scope.projectFilterModel[key].length > 0)
			  {
				projectFilterObject[key] = $scope.projectFilterModel[key]
			  } 
			}
			reportData.ProjectData.ProjectQuery = projectFilterObject
			console.log("reports filters have been set for project")
			
		}
		console.log("about to generate report");
		console.log(reportData)
		$http.post('/generateEmployeeReports', reportData).then(function(response){
				console.log(response.data)
		});
		
	}
	
	$scope.colorClass = "defaultColor";
	
	$scope.projectColorClass = "defaultColor";
	
	$scope.removeFilter = function(){
		console.log("remove filter button was clicked")
		refresh($http, $scope,$filter);
	}
	
	$scope.removeProjectFilter = function(){
		console.log("remove filter button for project was clicked")
		getProjects($http, $scope);
	}
	
	$scope.removeMachineFilter = function(){
		console.log("remove filter button for project was clicked")
		refreshMachines($http, $scope);
	}
	
	
	$scope.filterEmployees = function(){
		$scope.colorClass = "green";
		console.log("filter buttonn was cicked");
		if($scope.filterModel != null)
		{
			var filterObject = {};
			for (var key in $scope.filterModel) {
			  
			  console.log("key is "+key+" and value is "+$scope.filterModel[key])
				if($scope.filterModel[key] != "-1")
				{
					filterObject[key] = $scope.filterModel[key]
				}
			  
			}
			
		}
		if(filterObject != null && filterObject.hasOwnProperty(key))
		{
			url = Object.keys(filterObject).map(function(k) {
				return encodeURIComponent(k) + '=' + encodeURIComponent(filterObject[k])
			}).join('&')
			console.log(filterObject)
			console.log("url is "+url)
		}

		if(filterObject != null && filterObject.hasOwnProperty(key))
		{
			$http.get('/contactListByParameters/?'+url).then(function(response){
					console.log(response.data);
					$scope.contactlist = response.data;
			});
		}
		
	}
	
	$scope.filterMachines = function(){
		$scope.machineColorClass = "green";
		console.log("filter buttonn was cicked");
		if($scope.machineFilterModel != null)
		{
			var machineFilterObject = {};
			for (var key in $scope.machineFilterModel) {
			  
			  console.log("key is "+key+" and value is "+$scope.machineFilterModel[key])
				if($scope.machineFilterModel[key] != null && $scope.machineFilterModel[key] != "-1" && String($scope.machineFilterModel[key]).length > 0 )
				{
					machineFilterObject[key] = $scope.machineFilterModel[key]
				}
			  
			}
			
		}
		
			url = Object.keys(machineFilterObject).map(function(k) {
				return encodeURIComponent(k) + '=' + encodeURIComponent(machineFilterObject[k])
			}).join('&')
			console.log(machineFilterObject)
			console.log("url is "+url)
		

		
			$http.get('/machinesByParameters/?'+url).then(function(response){
					console.log(response.data);
					$scope.machines = response.data;
			});
		
		
	}
	
	
	$scope.filterProjects = function(){
		$scope.projectColorClass = "green";
		console.log("filter button for projects was cicked");
		if($scope.projectFilterModel != null)
		{
			var projectFilterObject = {};
			for (var key in $scope.projectFilterModel) {
			  
			  console.log("key is "+key+" and value is "+$scope.projectFilterModel[key])
				if($scope.projectFilterModel[key] != "-1" && $scope.projectFilterModel[key].length > 0)
				{
					projectFilterObject[key] = $scope.projectFilterModel[key]
				}
			  
			}
			
		}
		if(projectFilterObject != null && projectFilterObject.hasOwnProperty(key))
		{
			url = Object.keys(projectFilterObject).map(function(k) {
				return encodeURIComponent(k) + '=' + encodeURIComponent(projectFilterObject[k])
			}).join('&')
			console.log(projectFilterObject)
			console.log("url is "+url)
		}

		if(projectFilterObject != null && projectFilterObject.hasOwnProperty(key))
		{
			$http.get('/projectsByParameters/?'+url).then(function(response){
					console.log(response.data);
					$scope.projects = response.data;
			});
		}
		
	}
	refreshMachines($http, $scope)
	getProjects($http, $scope)	
	getRoles($http, $scope)	
	refresh($http, $scope,$filter)
	$scope.addEmployee = function(){
		console.log( $scope.contact)
		$http.post('/contactList' , $scope.contact).success(function(response, status) {
				console.log(response.data);
				$scope.contact = "";
				refresh($http, $scope,$filter);
		});
	}
	
	$scope.addProject = function(){
		console.log( $scope.project)
		$http.post('/projects' , $scope.project).success(function(response, status) {
				console.log(response.data);
				$scope.project = "";
				getProjects($http, $scope)
		});
	}
	
	$scope.addMachine = function(){
		console.log( $scope.machine)
		$scope.machine.isAllocated = true;
		if($scope.machine.type == 'Tablets'|| $scope.machine.type == 'Phones')
		{
			$scope.machine.bitLockerStatus = false;
		}
		
		$http.post('/machines' , $scope.machine).success(function(response, status) {
				console.log(response.data);
				$scope.machine = "";
				refreshMachines($http, $scope);
		});
	}
	
	$scope.editEmployee = function(id){
		console.log("id selected is "+id)
		getEmpById($http, $scope, id,function(response){
			$scope.contact = response.data;
		})
		
	}
	
	$scope.editProject = function(id){
		console.log("id selected is "+id)
		getProById($http, $scope, id,function(response){
			$scope.project = response.data;
		})
		
	}
	
	$scope.editMachine = function(id){
		console.log("id selected is "+id)
		getMachineById($http, $scope, id,function(response){
			$scope.machine = response.data;
		})
		
	}
	
	$scope.logout= function(){
		console.log($scope.searchParameter)
		getLogoutpage($http)
		};
	
	$scope.SeachKeyword = function(){
		console.log($scope.searchParameter)
		
		
		$http.get('/search/?q='+ $scope.searchParameter).then(function(response){
				console.log(response.data);
				$scope.contact = response.data;
		});
		
		
		
	}
	
	$scope.updateEmployee = function(id){
	console.log("update employee called")
		console.log( $scope.contact)
		console.log("id selected is "+id)
		
		updateEmp($http, $scope, id)
	}
	
	$scope.updateProject = function(id){
	console.log("update project called")
		console.log( $scope.project)
		console.log("id selected is "+id)
		
		updatePro($http, $scope, id)
	}
	
	$scope.updateMachine = function(id){
	console.log("update machine called")
		console.log( $scope.machine)
		console.log("id selected is "+id)
		updateMac($http, $scope, id)
	}
	
	$scope.employeeSelectionMade = function(user, project, manager){
		console.log("project element clicked")
		$scope.tabID=1;
		entityDetails.Employee.reportingEmployees = [];
		entityDetails.Employee.devicesOwned = []
		angular.forEach($scope.groups.Employees, function(value, key){
			if(value.name.Name == user) 
			{
				value.highlight = "highlightSelected";
				
				entityDetails.Employee.name = value.name.Name;
				entityDetails.Employee.reportingTo = value.name.ReportingManager;
				entityDetails.Employee.security101 = value.name.Security101 ? "100%" : "0%";
				entityDetails.Employee.alias = value.name.Alias;
				
				entityDetails.Employee.isActive = value.name.isActive;
				entityDetails.Employee.projects = value.name.ProjectName;
				
				getRoleById($http, $scope, value.name.Role, function(response){
					entityDetails.Employee.designation = response.data.Name;
				})
				
			}
			else if(value.name.Name == manager && manager != user)
			{
				value.highlight = "redSelection"
			}
			else if(value.name.ReportingManager == user)
			{
				value.highlight = "yellowSelection"
				entityDetails.Employee.reportingEmployees.push(value.name)
			}
			else
			{
				value.highlight = "defaultSelection";
			}
		})
		
		angular.forEach($scope.groups.Projects, function(value, key){
			(value.name.Name == project) ? value.highlight = "blueSelection" : value.highlight = "defaultSelection"
		})
		
		angular.forEach($scope.groups.Machines, function(value, key){
			if(value.name.owner == user) { value.highlight = "blueSelection"; entityDetails.Employee.devicesOwned.push(value.name) }else { value.highlight = "defaultSelection";}
		})
		
		$scope.EmployeeDetails = entityDetails.Employee;
	};
	
	
	$scope.projectSelectionMade = function(project){
		console.log("project element clicked")
		$scope.tabID=2;
		angular.forEach($scope.groups.Employees, function(value, key){
			(value.name.ProjectName == project) ? value.highlight = "blueSelection" : value.highlight = "defaultSelection"
		})
		
		angular.forEach($scope.groups.Projects, function(value, key){
			(value.name.Name == project) ? value.highlight = "highlightSelected" : value.highlight = "defaultSelection"
		})
		
		angular.forEach($scope.groups.Machines, function(value, key){
			(value.name.project == project) ? value.highlight = "blueSelection" : value.highlight = "defaultSelection"
		})
		
	};
	
	
	$scope.machineSelectionMade = function(serialNumber, user, project){
		console.log("machine element clicked")
		$scope.tabID=3;
		console.log("Parameters are "+serialNumber+", "+project+", "+user)
		angular.forEach($scope.groups.Employees, function(value, key){
			(value.name.Name == user) ? value.highlight = "blueSelection" : value.highlight = "defaultSelection"
		})
		
		angular.forEach($scope.groups.Projects, function(value, key){
			(value.name.Name == project) ? value.highlight = "blueSelection" : value.highlight = "defaultSelection"
		})
		
		angular.forEach($scope.groups.Machines, function(value, key){
			(value.name.serialNumber == serialNumber) ? value.highlight = "highlightSelected" : value.highlight = "defaultSelection"
		})
	}
	
	$scope.deleteEmployee = function(id){
		console.log( $scope.contact)
		console.log("id selected is "+id)
		getEmpById($http, $scope, id,function(response){
			$scope.contact = response.data;
			$scope.contact.isActive = false;
			updateEmp($http, $scope, id)
		})
		
		
	}
    
});

app.directive('ngEnter', function() {
        return function(scope, element, attrs) {
            element.bind("keydown keypress", function(event) {
                if(event.which === 13) {
                    scope.$apply(function(){
                        scope.$eval(attrs.ngEnter, {'event': event});
                    });

                    event.preventDefault();
                }
            });
        };
    });

var resetFilter = function($scope){
	if($scope.filterModel != null)
	{
		$scope.filterModel.ProjectName = "-1";
		$scope.filterModel.ReportingManager = "-1";
		$scope.filterModel.Role = "-1";
		$scope.filterModel.Security101 = true;
		$scope.filterModel.isActive = true;
	}
	
}

var resetProjectFilter = function($scope){
	if($scope.projectFilterModel != null)
	{
		$scope.projectFilterModel.Type = "-1";
		$scope.projectFilterModel.MSBusinessGroup = "-1";
		$scope.projectFilterModel.VendorPMContact = "-1";
		$scope.projectFilterModel.MSBGFTEContact = "-1";
		$scope.projectFilterModel.StartDate = "";
		$scope.projectFilterModel.EndDate = "";
		$scope.projectFilterModel.OnboardingInCurrentMonth = true;
		
	}
	
}	

var resetMachineFilter = function($scope){
	if($scope.machineFilterModel != null)
	{
		$scope.machineFilterModel.owner = "-1";
		$scope.machineFilterModel.type = "-1";
		$scope.machineFilterModel.project = "-1";
		$scope.machineFilterModel.serialNumber = "";
		$scope.machineFilterModel.approvalDate = "";
		$scope.machineFilterModel.approvalEndDate = "";
		$scope.machineFilterModel.bitLockerStatus=true;
		$scope.machineFilterModel.isAllocated=true
	}
	
}	


var refresh = function($http, $scope, $filter){
	$http.get('/contactList').then(function(response){
				console.log(response.data);
				
				$scope.Managers = response.data
				$scope.EmployeesData = response.data
				resetFilter($scope);
				$scope.colorClass = "defaultColor";
				$scope.contactlist = response.data;
				$scope.groups.Employees = []
				
				angular.forEach($scope.Managers, function(value, key){
					$scope.groups.Employees.push({"highlight": "defaultSelection", "name": value})
				});
				
		});
}



var updateEmp = function($http, $scope, id){
	$http.put('/contactList/'+id, $scope.contact).then(function(response){
				console.log(response.data);
				$scope.contact = "";
				refresh($http, $scope,$filter);
		});
}

var updatePro = function($http, $scope, id){
	$http.put('/projects/'+id, $scope.project).then(function(response){
				console.log(response.data);
				$scope.project = "";
				getProjects($http, $scope);
		});
}

var updateMac = function($http, $scope, id){
	$http.put('/machines/'+id, $scope.machine).then(function(response){
				console.log(response.data);
				$scope.machine = "";
				refreshMachines($http, $scope);
		});
}


var getEmpById = function($http, $scope, id, callback){
	$http.get('/contactList/'+id).then(function(response){
				console.log(response.data);
				callback(response)
				
				
		});
}

var getProById = function($http, $scope, id, callback){
	$http.get('/projects/'+id).then(function(response){
				
				
				
				
				
				response.data.EndDate = new Date(Date.parse(response.data.EndDate))
				response.data.StartDate = new Date(Date.parse(response.data.StartDate))
	
				console.log(response.data);
				callback(response)
				
				
		});
}

var getRoleById = function($http, $scope, id, callback){
	$http.get('/roles/'+id).then(function(response){
				console.log(response.data);
				callback(response)
		});
}

var getMachineById = function($http, $scope, id, callback){
	$http.get('/machines/'+id).then(function(response){
				
				response.data.approvalEndDate = new Date(Date.parse(response.data.approvalEndDate))
				response.data.approvalDate = new Date(Date.parse(response.data.approvalDate))
	
				console.log(response.data);
				callback(response)
				
				
		});
}

var getRoles = function($http, $scope){
	$http.get('/roles').then(function(response){
				console.log(response.data);
				$scope.roles = response.data;
		});
}

var getProjects = function($http, $scope){
	$http.get('/projects').then(function(response){
				console.log(response.data);
				$scope.projectColorClass = "defaultColor";
				$scope.projectList = response.data;
				resetProjectFilter($scope);
				
				angular.forEach(response.data, function(value, key){
					key.EndDate = new Date(Date.parse(key.EndDate))
					key.StartDate = new Date(Date.parse(key.StartDate))
				});
				
				
				$scope.projects = response.data;
				$scope.groups.Projects = []
				angular.forEach($scope.projects, function(value, key){
					$scope.groups.Projects.push({"highlight": "defaultSelection", "name": value})
				});
				
		});
}

var getLogoutpage = function($http){
	$http.get('/logout');
}



var refreshMachines = function($http, $scope){
	$http.get('/machines').then(function(response){
				console.log(response.data);
				$scope.machineColorClass = "defaultColor";
				$scope.machineList = response.data;
				resetMachineFilter($scope);
				
				angular.forEach(response.data, function(value, key){
					key.approvalEndDate = new Date(Date.parse(key.approvalEndDate))
					key.approvalDate = new Date(Date.parse(key.approvalDate))
				});
				
				$scope.machines = response.data;
				$scope.groups.Machines.VM = [];
				$scope.groups.Machines.Laptops = [];
				$scope.groups.Machines.Desktops = [];
				$scope.groups.Machines.Tablets = [];
				$scope.groups.Machines.Phones = [];
				angular.forEach($scope.machineList, function(value, key){
					$scope.groups.Machines.push({"name":value, "highlight":"defaultSelection"});
				
					console.log($scope.groups)
				})
				
		});
}

//Models

var ProjectDetails = {
	"ProjectTypes": ["Support", "Develop", "Datawarehouse & BI"],
	"MsBusinessGroups": ["CSS", "Finance", "ASG", "SMS&P", "MSIT", "C&E", "WWLP Business Desk EPG", "FPC Strategic Supp", "Technology & Research", "WDG"],
	"MSBGFTEContact": ["Monte Windsor", "Sneha Modi", "Deepali Ananth", "Leena Joshi", "Salana Adhikari", "Paul Kwoka", "Burke Fewel", "Joe Munko", "Bruno Nowak", "Ryan Hellevang", "Patrick Graff", "Gijo Varghese", "Jennifer McCready", "Rishabh Ghia", "Ricardo Bianchini", "Ranveer Chandra", "Michael Zyskowski", "Barry Walker"]
}

var machineDetails = {
	"machineTypes": ["Virtual Machine", "Laptops", "Desktops", "Tablets", "Phones"]	
}


var ExportData = {
	"RelativeTemplatePath": "Templates",
	"TemplateFileName": "OF_Monthly_Report.xlsx",
	"UploadPath": "/upload-folder/EmpReports.xlsx",
	"EmployeeData" : {
		"EmployeeSheetNumber": 3,
		"EmployeeQuery": {}
	},
	"ProjectData" : {
		"ProjectSheetNumber": 2,
		"ProjectQuery": {}
	}
	
}

var entityDetails = {
	"Employee" : {
		"name":"",
		"reportingTo": "",
		"security101":"",
		"alias":"",
		"designation": "",
		"isActive":"",
		"projects": [],
		"devicesOwned":[],
		"reportingEmployees": [],
	}
}

var groups = {
	"Employees": [],
	"Projects": [],
	"Machines": []
}
