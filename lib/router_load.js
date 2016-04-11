module.exports=function(app){
	const routes=require('../config/routes.js');
	const fs=require('fs');

	const controllers_folder=__dirname+'/../controllers';
	var policies_folder=__dirname+'/../config/policies';

	for(var k in routes){
		var route=routes[k];

		//separando a chave por espaços, para pegar o método
		var url="";
		var method="";

		var k_array=k.split(/\s+/);
		if(k_array.length==1){
			url=k_array[0];
			method="get";
		}else if(k_array.length==2){
			method=k_array[0].toLowerCase();
			url=k_array[1];
		}else{
			throw new Error("Rota "+k+" -> "+route+" não está seguindo o padrão");
		}

		var controller_filename=route.controller;
		var action_name=route.action;
		var policy_name=route.policy;

		// caso a policy não tenha
		var policy=undefined;
		if(!policy_name){
			console.log('Controller: '+controller_filename+' Action: '+action_name );
			console.log("[WARNING] Policy não declarada para esta rota. Utilizando a policy padrão (sem restrições).");
			policy=function(req,res,next){ return next() };
		}else{
			try{
				policy=require(policies_folder+'/'+policy_name+'.js');
			}catch(err){
				throw new Error("Arquivo não encontrado: "+policy_name);
			}
		}

		// carregando a rota
		var controller=require(controllers_folder+"/"+controller_filename+".js");
		app[method](url, policy, controller[action_name]);
	}
};
