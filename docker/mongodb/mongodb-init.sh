set -e
mongo <<EOF
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
