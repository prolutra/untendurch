#!/bin/sh
set -e

if [ -z "${MONGO_INITDB_USERNAME:-}" ] || [ -z "${MONGO_INITDB_PASSWORD:-}" ] || [ -z "${MONGO_INITDB_DATABASE:-}" ]; then
  echo "ERROR: MONGO_INITDB_USERNAME, MONGO_INITDB_PASSWORD and MONGO_INITDB_DATABASE are required"
  exit 1
fi

echo "Creating user: ${MONGO_INITDB_USERNAME:-untendurch}"

mongosh <<EOF
use ${MONGO_INITDB_DATABASE:-untendurch}
db.createUser({
  user: '${MONGO_INITDB_USERNAME:-untendurch}',
  pwd: '${MONGO_INITDB_PASSWORD:-untendurch}',
  roles: [{
    role: 'dbOwner',
    db: '${MONGO_INITDB_DATABASE:-untendurch}'
  }]
})
EOF
