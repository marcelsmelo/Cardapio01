module.exports = (params)=>{

  let conditionUpdateList = {};
  let conditionUpdateItem = {};
  let valueInc = 0;
  let Model = params.model;

  conditionUpdateList[params.fieldName] = params.fieldID;
  if(params.newIndex > params.oldIndex){
    conditionUpdateList.position = {$gt: params.oldIndex, $lte: params.newIndex};
    valueInc = -1;
  }else{
    conditionUpdateList.position =  {$gte: params.newIndex, $lt: params.oldIndex};
    valueInc = 1;
  }
  return new Promise((success, reject)=>{
      Model.update(conditionUpdateList,{$inc: {position: valueInc}}, {multi: true})
      .then((result)=>{
          conditionUpdateItem[params.fieldName] = params.fieldID;
          conditionUpdateItem._id = params.elementID;

          Model.update(conditionUpdateItem, {$set: {position: params.newIndex}}, {multi: false})
          .then((result)=>{
            success({success: true, msg: 'Posição do item alterado com sucesso!'});
          })
          .catch((err) => {
            reject({success: false, msg: 'Erro ao atualizar posição do item desejado!'});
          })
      })
      .catch((err) => {
          reject({success: false, msg: 'Erro ao atualizar as posições dos itens da lista!'});
      })
    });
}
