'use strict';

angular
  .module('app')
  .service('StorageSvc', StorageSvc);

StorageSvc.$inject = [];

function StorageSvc() {
    
    var recentProtosDB = new PouchDB('recentprotofiles_v1');
    
    recentProtosDB.info(function(err, info) {
        if (err) {
            return console.log(err);
        } else {
            console.log(info);
        }      
    });

    function saveRecentProto(protoFile) {
        if (!protoFile) {
            return
        }

        recentProtosDB.put({
            _id: protoFile.name,
            recentFile: protoFile,
        });
    }

    function loadRecentProtos(cb) {
        recentProtosDB.allDocs({
            include_docs: true,
            attachments: true
        }).then(function(result){
            cb(result.rows.map(function(row){
                return row.doc.recentFile;
            }));
        }).catch (function(err) {
            console.log(err);
        });
    }

    return {
        saveRecentProto: saveRecentProto,
        loadRecentProtos: loadRecentProtos
    }
}