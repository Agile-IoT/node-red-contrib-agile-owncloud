/*******************************************************************************
 * Copyright (C) 2018 Orange.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Contributors:
 *    Rombit - initial API and implementation
 ******************************************************************************/
const path = require('path');
var fs = require('fs');
var dateFormat = require('dateformat');
var request = require('request');
var xml2js = require('xml2js');

module.exports = function (RED) {
    "use strict";
    function ownCloudFileUploadNode(config) {
        var node = this;
        RED.nodes.createNode(this, config);
        node.clientId = config.clientId;
        node.clientSecret = config.clientSecret;
        node.owncloudServer = config.owncloudServer;
        node.remotepath = config.remotepath;
        // console.log('----');
        // console.log(node.owncloudServer);
        // console.log('----');
        node.send({status:"started", data:config});
        if ((typeof node.clientId === "undefined" || node.clientId === '')|| (typeof node.clientSecret === "undefined" || node.clientSecret === ''))  {
            node.status({fill: "red", shape: "dot", text: "ownCloudFileUpload.warn.no-credentials"});
            node.send({status:"error", data:RED._('ownCloudFileUpload.warn.no-credentials')});
            return;
        } else if(typeof node.owncloudServer === "undefined" || node.owncloudServer === "") {
            node.status({fill: "red", shape: "dot", text: "ownCloudFileUpload.warn.no-serverpath"});
            node.send({status:"error", data:RED._('ownCloudFileUpload.status.no-serverpath')});
            return;
        }else{
            node.status({fill: "blue", shape: "dot", text: "ownCloudFileUpload.status.waiting-for-file"});
            node.send({status:"ready", data:RED._('ownCloudFileUpload.status.waiting-for-file')});

        }
        node.status({
            fill: 'yellow',
            shape: 'dot',
            text: 'starting'
        });

        this.on('input', function (msg) {
            var localpath = msg.localpath;
            var payload = msg.payload;
            node.send({status:"inputReceived", data:msg});

            var remotepath = (typeof node.remotepath !== "undefined" && node.remotepath !== '') ? node.remotepath : msg.remotepath;
            if (typeof remotepath === "undefined" || remotepath === null){
                node.status({fill: "red", shape: "ring", text: "ownCloudFileUpload.warn.no-file-remotepath"});
                node.send({status:"error", data:RED._('ownCloudFileUpload.warn.no-file-remotepath-long')});
                return;
            }
            if (typeof localpath !== 'undefined' || typeof payload !== "undefined") {
                node.status({fill: 'yellow', shape: 'dot', text: 'uploading file'});
                var uploadFileBool = (typeof localpath !== 'undefined' && (typeof payload === 'undefined' || !payload));
                var uploadConfig = {
                    uploadFileBool: uploadFileBool,
                    uploadContent: payload,
                    uploadFileName: (typeof remotepath !== 'undefined') ? remotepath : dateFormat(new Date(), "yyyy.mm.dd") + "-Agile.txt",
                    uploadDirectory: (typeof remotepath !== 'undefined') ? path.dirname(remotepath) : '',
                    uploadDirectories: (typeof remotepath !== 'undefined') ? path.dirname(remotepath).split('/'): [],
                    loopCount: 0
                };
                if (uploadFileBool) {
                    fs.readFile(localpath, 'utf8', function (err, file) {
                        if (typeof file === "undefined" || err) {
                            node.status({
                                fill: "red",
                                shape: "ring",
                                text: "ownCloudFileUpload.error.failed-read-file"
                            });
                            node.send({status:"error", data:RED._('ownCloudFileUpload.error.failed-read-file')});
                            return;
                        }
                        uploadConfig.uploadContent = file.toString();
                        uploadConfig.uploadFileName = (typeof remotepath !== 'undefined') ? remotepath : path.basename(localpath);
                        uploadToOwnCloud(uploadConfig, node, function (err) {
                            if (err) {
                                node.status({
                                    fill: "red",
                                    shape: "ring",
                                    text: "ownCloudFileUpload.status.error-uploading"
                                });
                                node.send({status:"error", data:RED._('ownCloudFileUpload.status.error-uploading')});
                                return;
                            }
                            node.status({
                                fill: "blue",
                                shape: "dot",
                                text: "ownCloudFileUpload.status.waiting-for-file"
                            });
                            node.send({status:"ready", data:RED._('ownCloudFileUpload.status.waiting-for-file')});

                        });
                    });
                } else {
                    uploadToOwnCloud(uploadConfig, node, function (err) {
                        if (err) {
                            node.status({
                                fill: "red",
                                shape: "ring",
                                text: "ownCloudFileUpload.status.error-uploading"
                            });
                            node.send({status:"error", data:RED._('ownCloudFileUpload.status.error-uploading')});

                            return;
                        }
                        node.status({
                            fill: "blue",
                            shape: "dot",
                            text: "ownCloudFileUpload.status.waiting-for-file"
                        });
                        node.send({status:"ready", data:RED._('ownCloudFileUpload.status.waiting-for-file')});

                    });
                }
            } else {
                node.status({fill: "red", shape: "ring", text: "ownCloudFileUpload.warn.no-file-content"});
                node.send({status:"error", data:RED._('ownCloudFileUpload.warn.no-file-content')});

            }
        });
        node.status({fill: "blue", shape: "dot", text: "ownCloudFileUpload.status.waiting-for-file"});
        node.send({status:"ready", data:RED._('ownCloudFileUpload.status.waiting-for-file')});

        function uploadToOwnCloud(uploadConfig, node, cb) {
            // console.log('uploadToOwnCloud');

            var req = {
                method: 'PUT',
                uri: node.owncloudServer + '/remote.php/webdav/'+ uploadConfig.uploadFileName,
                auth: {
                    username: node.clientId,
                    password: node.clientSecret
                },
                timeout: 10000,
                body: uploadConfig.uploadContent
            };

            request(req, function (error, response, body) {
                // console.log(req);
                // console.log(body);
                // console.log(error);
                if (error && (typeof response === "undefined" || typeof response.statusCode === "undefined")) {
                    cb(RED._("ownCloudFileUpload.status.error-uploading-message", {message: error.toString()}));
                    return;
                }
                if (response.statusCode === 401) {
                    cb(RED._("ownCloudFileUpload.error.fetch-unauthorized"));
                    return;
                }else if (response.statusCode === 404 || response.statusCode === 409) {
                    createFoldersOwnCloud(uploadConfig, node, function () {
                        uploadToOwnCloud(uploadConfig, node, cb)
                    }, function (err) {
                        cb(RED._("ownCloudFileUpload.status.error-uploading-message", {message: err}));
                    });

                }else if(response.statusCode.toString().indexOf("2") !== 0) {
                    var stripPrefix = function(str) {
                        var prefixMatch = new RegExp(/(?!xmlns)^.*:/);
                        return str.replace(prefixMatch, '');
                    };
                    var parser = new xml2js.Parser({ignoreAttrs: true,tagNameProcessors: [stripPrefix]});
                    parser.parseString(body, function (err, result) {
                        if (result && typeof result["error"]!== 'undefined' && typeof result["error"]["message"] !== 'undefined') {
                            cb(RED._("ownCloudFileUpload.status.error-uploading-message", {message: result["error"]["message"]}));
                        }
                        cb(RED._("ownCloudFileUpload.status.error-uploading-message", {message: body}));
                    });
                }else{
                    node.send({status:"fileUploadComplete", data:''});
                    cb(null);
                }
            });
        }
        function createFoldersOwnCloud(uploadConfig, node, cb,errorcb) {
            // console.log('createFoldersOwnCloud');

            var mkdirReq = {
                method: 'MKCOL',
                uri: node.owncloudServer + '/remote.php/webdav/'+ uploadConfig.uploadDirectories.slice(0, uploadConfig.uploadDirectories.length - uploadConfig.loopCount).join('/'),
                timeout: 10000,
                auth: {
                    username: node.clientId,
                    password: node.clientSecret
                }
            };

            request(mkdirReq, function (error, response, body) {
                // console.log(mkdirReq);
                // console.log(body);
                // console.log(error);
                 if ((response.statusCode === 404 || response.statusCode === 409) && ( uploadConfig.loopCount < uploadConfig.uploadDirectories.length)) {
                     uploadConfig.loopCount += 1;
                     createFoldersOwnCloud(uploadConfig, node, cb,errorcb);
                 }else if(response.statusCode.toString().indexOf("2") === 0) {
                     if (uploadConfig.loopCount === 0) {
                         cb(null);
                     } else {
                         uploadConfig.loopCount -= 1;
                         createFoldersOwnCloud(uploadConfig, node, cb, errorcb);
                     }
                }else if ( uploadConfig.loopCount > uploadConfig.uploadDirectories.length){
                     errorcb(RED._("ownCloudFileUpload.status.error-uploading-message", {message: body}));
                }
            });
        }
    }
    RED.nodes.registerType("agile-ownCloud-upload", ownCloudFileUploadNode,{
        clientId: {type:"text"},
        clientSecret: {type:"password"}
    });
};
