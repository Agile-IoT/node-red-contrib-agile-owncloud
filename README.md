<!--
# Copyright (C) 2017 Orange Belgium.
# All rights reserved. This program and the accompanying materials
# are made available under the terms of the Eclipse Public License v1.0
# which accompanies this distribution, and is available at
# http://www.eclipse.org/legal/epl-v10.html
# 
# Contributors:
#     Orange Belgium - initial API and implementation
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
