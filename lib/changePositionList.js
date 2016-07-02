module.exports = (params)=>{

  let conditionUpdateList = {};
  let conditionUpdateItem = {};
  let valueInc = 0;
  let Model = params.model;

  conditionUpdateList[params.fieldID] = params._id;
  if(params.newIndex > params.oldIndex){
    conditionUpdateList.position = {$gt: params.oldIndex, $lte: params.newIndex};
    valueInc = -1;
  }else{
    conditionUpdateList.position =  {$gte: params.oldIndex, $lt: params.newIndex};
    valueInc = 1;
  }
  return new Promise((success, reject)=>{
      Model.update(conditionUpdateList,{$inc: {position: valueInc}}, {multi: true})
      .then((result)=>{
          conditionUpdateItem[params.fieldID] = params._id;
          conditionUpdateItem.name = params.name;

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
