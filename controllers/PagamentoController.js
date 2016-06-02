const request = require('request');
const parser2xml = require("js2xmlparser");
var parse2json= require('xml2js').parseString;

module.exports = {
  assinatura : (req, res, next) =>{
    const email = 'marcel.msmelo@gmail.com';
    const token = '766BE0E9A0734761BC19D09201355EF2';

    const data = {
        preApproval: {
          'charge': 'auto',
          'name': 'Teste',
          'amountPerPayment': '100.00',
          'period': 'Monthly',
          'finalDate': '2017-05-31T00:00:000-03:00',
          'maxTotalAmount':'1200.00'
        }
    };

    const testeXML = parser2xml('preApprovalRequest', data);
    console.log(testeXML);


    let options = {
      uri: 'https://ws.sandbox.pagseguro.uol.com.br/v2/pre-approvals/request?email='+email+'&token='+token,
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml; charset=UTF-8'
      },
      body: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + testeXML
    }

    var req = request(options, function(err, res, body) {
      console.log('ERR: ' + err);
      parse2json(body, (err, result)=>{
        console.log(result);
      });
    });
  },
//https://sandbox.pagseguro.uol.com.br/v2/pre-approvals/request.html?code=658EC868171728C33474EFAB64FC1D7C
  notificacao: (req, res, next) =>{
      console.log(req.body);
      const email = 'marcel.msmelo@gmail.com';
      const token = '766BE0E9A0734761BC19D09201355EF2';
      //{ notificationCode: '9CB776-3E99EF99EF00-2EE4426F8BF2-560663',
      //notificationType: 'transaction' }

      let options = {
        uri: 'https://ws.sandbox.pagseguro.uol.com.br/v3/transactions/notifications/'+req.body.notificationCode+'?email='+email+'&token='+token,
        method: 'GET'
      }

      var req = request(options, function(err, res, body) {
        console.log('ERR: ' + err);
        parse2json(body, (err, result)=>{
          console.log(result);
        });
      });

    //   { transaction:
    //  { date: [ '2016-06-01T11:15:11.000-03:00' ],
    //    code: [ '2694E92B-36B9-47A3-822A-C663CF2CB43F' ],
    //    reference: [ '991BE3' ],
    //    type: [ '11' ],
    //    status: [ '2' ],
    //    lastEventDate: [ '2016-06-01T11:16:28.000-03:00' ],
    //    paymentMethod: [ [Object] ],
    //    grossAmount: [ '100.00' ],
    //    discountAmount: [ '0.00' ],
    //    creditorFees: [ [Object] ],
    //    netAmount: [ '95.61' ],
    //    installmentCount: [ '1' ],
    //    itemCount: [ '1' ],
    //    items: [ [Object] ],
    //    sender: [ [Object] ],
    //    shipping: [ [Object] ],
    //    gatewaySystem: [ [Object] ] } }


  }

};
