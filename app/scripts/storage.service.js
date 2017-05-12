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

    function removeRecentProto(protoFileName) {
        recentProtosDB.get(protoFileName).then(function(doc) {
            return recentProtosDB.remove(doc);
        }).then(function (result) {
            console.log("removed recent protofile");
        }).catch(function (err) {
            console.log(err);
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
        removeRecentProto: removeRecentProto,
        loadRecentProtos: loadRecentProtos
    }
}