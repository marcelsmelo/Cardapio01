const request = require('request');
const xml2js= require('xml2js');
const pagSeguroConfig = require('../config/pagSeguroConfig.js');

module.exports = {
  assinatura : (req, res, next) =>{
    const email = 'marcel.msmelo@gmail.com';
    const token = '766BE0E9A0734761BC19D09201355EF2';

    const data = {
        'reference': 'Referencia001',
         preApproval: {
          'charge': 'auto',
          'name': 'Teste',
          'amountPerPayment': '100.00',
          'period': 'Monthly',
          'finalDate': '2017-05-31T00:00:000-03:00',
          'maxTotalAmount':'1200.00'
        }
    };


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

    var req = request(options, function(err, res, body) {
      let parse2json = xml2js.parseString;
      parse2json(body, {'explicitArray': false}, (err, result)=>{
        let code = result.preApprovalRequest.code;
        let baseURL = 'https://sandbox.pagseguro.uol.com.br/v2/pre-approvals/request.html?code=';
        console.log('RESPONSE', result);
        console.log('URL', baseURL+code);
      });
    });

    res.status(200);
  },
//https://sandbox.pagseguro.uol.com.br/v2/pre-approvals/request.html?code=658EC868171728C33474EFAB64FC1D7C
  notificacao: (req, res, next) =>{
      console.log(req.body);
      const email = pagSeguroConfig.emailSandbox;
      const token = pagSeguroConfig.tokenSandbox;
      const notificationType = req.body.notificationType;

      let baseURL = '';
      if(notificationType == 'transaction'){
          baseURL = 'https://ws.sandbox.pagseguro.uol.com.br/v3/transactions/notifications/';
      }else if(notificationType == 'preApproval'){
          baseURL = 'https://ws.sandbox.pagseguro.uol.com.br/v2/pre-approvals/notifications/'
      }else{
        //TODO Tratar errors da notificação
        console.log(req.body.errors);
        res.status(200);
      }

      let options = {
        uri: baseURL+req.body.notificationCode+'?email='+email+'&token='+token,
        method: 'GET'
      }

      var req = request(options, function(err, res, body) {
          let parse2json = new xml2js.Parser();
          parse2json.parseString(body, {explicitArray: false}, (err, result)=>{
          console.log(result);
        });
      });

    res.status(200);

  },

};
