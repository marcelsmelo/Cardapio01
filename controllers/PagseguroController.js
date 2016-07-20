const request = require('request');
const xml2js= require('xml2js');
const pagSeguroConfig = require('../config/pagSeguroConfig.js');
const Company = require('../models/CompanyModel.js');

module.exports = {
  assinatura : (req, res, next) =>{
    const email = pagSeguroConfig.emailSandbox;
    const token = pagSeguroConfig.tokenSandbox;

    let endDate = new Date();
    endDate.setFullYear(endDate.getFullYear()+2);

    const params = {
        'reference': '573b8cf7da7504af0ae33501', //TODO ID da empresa
         preApproval: {
          'charge': 'auto',
          'name': 'Assinatura mensal Cardapio01',
          'amountPerPayment': '50.00',
          'period': 'Monthly',
          'finalDate': endDate.toISOString(),
          'maxTotalAmount':'1200.00'
        }
    };

    console.log('PARAMS ASSINATURA', params);


    // const testeXML = parser2xml('preApprovalRequest', data);
    // console.log('2XML', testeXML);

    let builder = new xml2js.Builder({rootName: 'preApprovalRequest'});
    let paramsXml = builder.buildObject(params);
    console.log('XML2JS', paramsXml);


    let options = {
      uri: 'https://ws.sandbox.pagseguro.uol.com.br/v2/pre-approvals/request?email='+email+'&token='+token,
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml; charset=UTF-8'
      },
      body: paramsXml
    }

    request(options, function(errPS, responsePS, bodyPS) {
        if(errPS){
            console.log('ERROR PAGSEGURO', errPS);
            res.status(500).json({success: false, msg: 'Erro ao gerar link do Pagseguro. Tente novamente!'})
        }
        let parse2json = xml2js.parseString;
        parse2json(bodyPS, {'explicitArray': false}, (errParse, resultParse)=>{
            if(errParse){
                console.log('ERROR PARSER', errPS);
                res.status(500).json({success: false, msg: 'Erro ao gerar link do Pagseguro. Tente novamente!'})
            }
            let code = resultParse.preApprovalRequest.code;
            let baseURL = 'https://sandbox.pagseguro.uol.com.br/v2/pre-approvals/request.html?code=';
            console.log('RESPONSE ASSINATURA', resultParse);
            console.log('URL PAGAMENTO', baseURL+code);
	        res.status(200).json({success: true, url: baseURL+code});
        });
    });
  },

//https://sandbox.pagseguro.uol.com.br/v2/pre-approvals/request.html?code=658EC868171728C33474EFAB64FC1D7C
  notificacao: (req, res, next) =>{
      if(req.body.errors){
        //TODO Tratar errors da notificação
        console.log(req.body.errors);
        res.status(200);
      }

      console.log('NOTIFICAÇÃO', req.body);

      const email = pagSeguroConfig.emailSandbox;
      const token = pagSeguroConfig.tokenSandbox;
      const notificationType = req.body.notificationType;

      let baseURL = '';
      if(notificationType == 'transaction'){
          baseURL = 'https://ws.sandbox.pagseguro.uol.com.br/v3/transactions/notifications/';
      }else if(notificationType == 'preApproval'){
          baseURL = 'https://ws.sandbox.pagseguro.uol.com.br/v2/pre-approvals/notifications/';
      }

      let options = {
        uri: baseURL+req.body.notificationCode+'?email='+email+'&token='+token,
        method: 'GET'
      }

      console.log('PARAMS NOTIFICAO', options);

      request(options, (errPS, responsePS, bodyPS) => {
          let parse2json = xml2js.parseString;
          parse2json(bodyPS, {'explicitArray': false}, (errParse, resultParse)=>{
            console.log('RESULTADO NOTIFICACAO', resultParse);
            let data = {
                code : resultParse[notificationType].code,
                date: resultParse[notificationType].date,
                status: resultParse[notificationType].status,
                lastEventDate : resultParse[notificationType].lastEventDate,
                tracker : resultParse[notificationType].tracker ? resultParse[notificationType].tracker : undefined
            };

          let updatePromise;
          if(notificationType == 'transaction'){
              let transactionStatus = resultParse[notificationType].status;
              let companyStatus = false;
              if(transactionStatus == 2 || transactionStatus == 3) companyStatus = true;
              updatePromise = Company.update({_id: '573b8cf7da7504af0ae33501'}, {$set: {'transaction': data, 'status': companyStatus}}).exec();

          }else if(notificationType == 'preApproval'){
              let companyStatus = resultParse[notificationType].status == 'ACTIVE' ? true : false;
              updatePromise = Company.update({_id: '573b8cf7da7504af0ae33501'}, {$set: {'subscription': data, 'status': companyStatus}}).exec();
          }

          updatePromise.then((companyMod)=>{
            console.log(companyMod);
            res.status(200).json({success: true});
          })
          .catch((err)=>{//Caso algum erro ocorra
            console.log(err);
            res.status(200).json({success: true});
            //TODO Gerar logs internos do ERRO
          });

        });
    });
 },

 cancelar: (req, res, next)=>{
     const email = pagSeguroConfig.emailSandbox;
     const token = pagSeguroConfig.tokenSandbox;
     console.log('here');
     Company.findOne({_id: '573b8cf7da7504af0ae33501'},{subscription:1, status:1})
     .then((company)=>{
console.log('COMPANY', company);
         if(company.subscription.status == 'ACTIVE'){
             let baseURL = 'https://ws.sandbox.pagseguro.uol.com.br/v2/pre-approvals/cancel/';
             let options = {
               uri: baseURL+company.subscription.code+'?email='+email+'&token='+token,
               method: 'GET'
             }
	     console.log('OPTIONS', options);
             request(options, (errPS, responsePS, bodyPS) => {
                 let parse2json = xml2js.parseString;
                 parse2json(bodyPS, {'explicitArray': false}, (errParse, resultParse)=>{
                     console.log('RESULTADO NOTIFICACAO', resultParse);
                     res.status(200).json({success: true});
                 });
             });
         }
     })
     .catch((err)=>{
         console.log(err);
         res.status(200).json({success: true});
     });
 }

};
