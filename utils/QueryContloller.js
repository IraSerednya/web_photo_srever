class QueryController{
    static idQuery = new Set()
    constructor({controller, id, progress, total, processingStatus, processedImages, serverPorts, linkWorkServers, isServersTrue}){
        this.controller = controller;
        this.id = id;
        this.progress = progress;
        this.total = total;
        this.processingStatus = processingStatus;
        this.processedImages = processedImages;
        this.serverPorts = serverPorts;
        this.linkWorkServers = linkWorkServers;
        this.isServersTrue = isServersTrue;
        QueryController.idQuery.add(id)
    }

    static checkIsId(newId){
        return QueryController.idQuery.has(newId)
    }
}



module.exports = {QueryController}