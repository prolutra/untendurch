import fs from 'fs';

fs.readFile('./package.json', (err, data) => {
  if (err) throw err;

  var packageJsonObj = JSON.parse(data);
  var version = packageJsonObj.version;
  var name = packageJsonObj.name;
  var newVersion = `${version}-${process.argv[2]}`;

  console.log(`Building ${name}@${newVersion} ...`);

  packageJsonObj.version = newVersion;
  packageJsonObj = JSON.stringify(packageJsonObj);

  fs.writeFile('./package.json', packageJsonObj, (err) => {
    if (err) throw err;
  });
});
