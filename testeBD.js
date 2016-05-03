db.teste.aggregate([ { $group: {_id: "$sobrenome", nomes: {$push: item}}}])

db.teste.group( { key: {sobrenome: true}, initial: {sobrenomes: []}, reduce: function(itens, prev){ prev.sobrenomes.push({'nome': itens.name, 'sobrenome': itens.sobrenome}); } } )
