#!/bin/sh
set -e

echo "Creating user: untendurch"

mongosh <<EOF
use untendurch
db.createUser({
  user: 'untendurch',
  pwd: 'untendurch',
  roles: [{
    role: 'dbOwner',
    db: 'untendurch'
  }]
})
EOF
