<!--
# Copyright (C) 2017 Orange.
# All rights reserved. This program and the accompanying materials
# are made available under the terms of the Eclipse Public License v1.0
# which accompanies this distribution, and is available at
# http://www.eclipse.org/legal/epl-v10.html
# 
# Contributors:
#     Rombit - initial API and implementation
-->

# node-red-contrib-agile-owncloud

<p>A node to upload files to the Owncloud webdav API.</p>
<h1>Instructions</h1>
<h2>Configuration</h2>
<ul>
    <li>1. Edit the node and add a client ID, secret and server url.</li>
    <li>2. Optionally fill in the remote path with the location and filename of the uploaded file on the server.</li>
</ul>
<h2>Upload a file</h2>
<p>Connect a node with the following output</p>
<p>msg.payload: The text content of the file upload</p>
<p>msg.localpath: The local file path of the file to upload</p>
<p>msg.remotepath: The remote file path of the file to upload</p>
<p>The config.remotepath has a higher priority as the msg.remotepath</p>
<p>Either the payload or the localpath are required. The payload has a higher priority as the localpath</p>


<h2>Demo Flow</h2>
```
[{"id":"f688abc5.a75d38","type":"tab","label":"Flow 1"},{"id":"fd399ee4.73862","type":"inject","z":"f688abc5.a75d38","name":"","topic":"","payload":"false","payloadType":"bool","repeat":"","crontab":"","once":false,"onceDelay":"","x":188.01041412353516,"y":256.9809341430664,"wires":[["6b4fad3a.ec2ee4"]]},{"id":"6b4fad3a.ec2ee4","type":"function","z":"f688abc5.a75d38","name":"create input message","func":"msg.payload = \"Test message content\";\n// msg.remotepath = \"myFolder/myFile.txt\";\n\nnode.error(msg);\nreturn msg;","outputs":1,"noerr":0,"x":424.00525665283203,"y":257.7621703147888,"wires":[["d1279dbf.e73d2"]]},{"id":"d1279dbf.e73d2","type":"agile-ownCloud-upload","z":"f688abc5.a75d38","name":"Owncloud Uploader","clientId":"id","clientSecret":"secret","owncloudServer":"http://my-server/owncloud","remotepath":"myFolder/myFile.txt","x":712.0070114135742,"y":256.96006965637207,"wires":[["d5c0f102.f4d97"]]},{"id":"d5c0f102.f4d97","type":"debug","z":"f688abc5.a75d38","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","x":910,"y":260,"wires":[]}]
```

changelog:

v1.0.1: Added an output to the node with status messages.

v1.0.0: init