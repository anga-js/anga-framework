# Move admin out

## Requirements

* Schema object
* Generic get/getall/update/create/delete including sorting, paging, and filter(?)
* Authentication system with some idea of roles
* Allow templates the use of a template, probably not v1
* Run as a plugin
* Audit system maybe

```javascript
const angaAdminConfig = {
  db: ['pg', 'mongodb'],
  models: 'list or dir?',
  dirPrefix: 'anga', // so paths are /anga-admin so not the obvious admin path
  auth: '???', // specify auth so routes are locked down
}

```

