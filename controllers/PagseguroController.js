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

    const data = {
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

    console.log('PARAMS ASSINATURA', data);


    // const testeXML = parser2xml('preApprovalRequest', data);
    // console.log('2XML', testeXML);

    let builder = new xml2js.Builder({rootName: 'preApprovalRequest'});
    let xml2request = builder.buildObject(data);
    console.log('XML2JS', xml2request);


    let options = {
      uri: 'https://ws.sandbox.pagseguro.uol.com.br/v2/pre-approvals/request?email='+email+'&token='+token,
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml; charset=UTF-8'
      },
      body: xml2request
    }

    let reqPS = request(options, function(errPS, resPS, bodyPS) {
      let parse2json = xml2js.parseString;
      parse2json(bodyPS, {'explicitArray': false}, (errParse, resultParse)=>{
        let code = resultParse.preApprovalRequest.code;
        let baseURL = 'https://sandbox.pagseguro.uol.com.br/v2/pre-approvals/request.html?code=';
        console.log('RESPONSE ASSINATURA', result);
        console.log('URL PAGAMENTO', baseURL+code);
	res.status(200).json({success: true, url: baseURL+code});
      });
    });
    res.status(200);
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

      var req = request(options, (err, response, body) => {
          let parse2json = xml2js.parseString;
          parse2json(body, {'explicitArray': false}, (err, result)=>{
            console.log('RESULTADO NOTIFICACAO', result);
            let data = {
                code : result[notificationType].code,
                date: result[notificationType].date,
                status: result[notificationType].status,
                lastEventDate : result[notificationType].lastEventDate,
                tracker : result[notificationType].tracker ? result[notificationType].tracker : undefined
            };

          let updatePromise;
          if(notificationType == 'transaction'){
              let transactionStatus = result[notificationType].status;
              let companyStatus = false;
              if(transactionStatus == 2 || transactionStatus == 3) companyStatus = true;
              //updatePromise = Company.update({_id: '573b8cf7da7504af0ae33501'}, {$set: {'transaction': data, 'status': companyStatus}}).exec();

          }else if(notificationType == 'preApproval'){
              let companyStatus = result[notificationType].status == 'ACTIVE' ? true : false;
              //updatePromise = Company.update({_id: '573b8cf7da7504af0ae33501'}, {$set: {'subscription': data, 'status': companyStatus}}).exec();
          }

          updatePromise.then((companyMod)=>{
            console.log(companyMod);
            res.status(200);
          })
          .catch((err)=>{//Caso algum erro ocorra
            console.log(err);
            res.status(200);
            //TODO Gerar logs internos do ERRO
          });

        });
    });
    res.status(200);
  },

};
